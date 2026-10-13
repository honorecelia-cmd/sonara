const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const store = require('./store');
const moderation = require('./moderation');
const PORT = process.env.PORT || 3000;

const rooms = {};

// ── Compteur "en ligne" reel : sessions vues dans les 70 dernieres secondes ──
const seen = new Map(); // clientId -> timestamp
function touch(id) { if (id) seen.set(id, Date.now()); }
function onlineCount() {
  const cut = Date.now() - 70000;
  for (const [k, t] of seen) if (t < cut) seen.delete(k);
  return seen.size;
}

function slug(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 12) || 'mix'; }
function genCustomCode() {
  let c;
  do { c = crypto.randomBytes(6).toString('base64').replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 6); } while (c.length < 6 || store.data.customLinks[c]);
  return c;
}
function readBody(req, cb) {
  let b = '', over = false;
  req.on('data', function (d) { if (over) return; b += d; if (b.length > 8192) { over = true; cb(new Error('trop long')); req.destroy(); } });
  req.on('end', function () { if (over) return; try { cb(null, b ? JSON.parse(b) : {}); } catch (e) { cb(e); } });
  req.on('error', function () {});
}
// Identifiant de joueur tire par le navigateur
function validId(id) { return typeof id === 'string' && /^[a-z0-9]{8,40}$/i.test(id); }
function sendJson(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

// ── Limitation des requetes, par adresse IP et par minute ──
// L'adresse n'est ni enregistree ni journalisee : en memoire seulement, sous
// forme d'empreinte (sel aleatoire tire au demarrage), oubliee apres 1 minute.
const LIMITS = { score: 20, effacement: 5, salle: 10, rejoindre: 30, nom: 40, defi: 10, ping: 20 };
const SEL_IP = crypto.randomBytes(16);
const hits = new Map();   // empreinte|famille -> { n, t }
function clientKey(req) {
  const fwd = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const ip = fwd || (req.socket && req.socket.remoteAddress) || '';
  return crypto.createHmac('sha256', SEL_IP).update(ip).digest('base64').slice(0, 16);
}
function limited(req, kind) {
  const k = clientKey(req) + '|' + kind, now = Date.now();
  let h = hits.get(k);
  if (!h || now - h.t > 60000) { h = { n: 0, t: now }; hits.set(k, h); }
  h.n++;
  return h.n > LIMITS[kind];
}
setInterval(function () {
  const cut = Date.now() - 60000;
  for (const [k, h] of hits) if (h.t < cut) hits.delete(k);
}, 60000).unref();
function tooMany(res) { sendJson(res, 429, { error: 'trop' }); }

// ── En-tetes de securite (toutes les reponses) ──
// CSP : tout vient du site lui-meme. Les scripts en ligne des pages HTML sont
// autorises par leur empreinte (calculee a l'envoi), pas par 'unsafe-inline'.
// Les styles en ligne (attributs style, variables CSS posees par le JS) restent permis.
function securityHeaders(req, res) {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()');
  res.setHeader('X-Frame-Options', 'DENY');
}
function csp(req, html) {
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
  const hashes = [];
  String(html).replace(/<script>([\s\S]*?)<\/script>/g, function (m, code) {
    hashes.push("'sha256-" + crypto.createHash('sha256').update(code).digest('base64') + "'");
  });
  return ["default-src 'self'", "script-src 'self' " + hashes.join(' '), "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:", "media-src 'self' data: blob:", "font-src 'self'",
    "connect-src 'self' wss://" + host + ' ws://' + host, "manifest-src 'self'", "object-src 'none'",
    "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'"].join('; ');
}
function sendHtml(req, res, file) {
  fs.readFile(path.join(__dirname, file), function (err, data) {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Content-Security-Policy': csp(req, data) });
    res.end(data);
  });
}

// ── Classement : 10 meilleurs scores par univers, 12 mois au plus ──
// Champs stockes : son-nom, score, univers, date, empreinte du code d'effacement.
const TOP = 10;
function hashKey(k) { return crypto.createHash('sha256').update(String(k)).digest('hex'); }
function validKey(k) { return typeof k === 'string' && /^[a-f0-9]{32,64}$/.test(k); }
function publicTop(list) { return list.slice(0, TOP).map(function (e) { return { name: e.name, score: e.score }; }); }
function themeList(theme) {
  return store.data.leaderboard.filter(function (e) { return e.theme === theme; }).sort(function (a, b) { return b.score - a.score || a.at - b.at; });
}
// Garde les 10 premiers de chaque univers ; le reste est supprime
function trimTop() {
  const byTheme = {};
  store.data.leaderboard.slice().sort(function (a, b) { return b.score - a.score || a.at - b.at; }).forEach(function (e) {
    (byTheme[e.theme] = byTheme[e.theme] || []).push(e);
  });
  const kept = [];
  Object.keys(byTheme).forEach(function (t) { kept.push.apply(kept, byTheme[t].slice(0, TOP)); });
  const removed = store.data.leaderboard.length - kept.length;
  store.data.leaderboard = kept;
  return removed;
}
function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[crypto.randomInt(chars.length)];
  return rooms[code] ? genCode() : code;
}

function fetchDeezer(q, cb) {
  const req = https.request({hostname:'api.deezer.com',path:'/search?q='+encodeURIComponent(q)+'&limit=5',method:'GET',headers:{'User-Agent':'Mozilla/5.0'}}, function(res) {
    let data = '';
    res.on('data', function(c){ data += c; });
    res.on('end', function(){ try{ cb(null, JSON.parse(data)); }catch(e){ cb(e); } });
  });
  req.on('error', cb);
  req.setTimeout(8000, function(){ req.destroy(); });
  req.end();
}

const MAX_FRAME = 16384;
// Lit UNE trame WebSocket au debut de buf. Renvoie null si elle est
// incomplete ; sinon { opcode, payload, size } (size = octets consommes).
// Plusieurs trames peuvent arriver collees dans un meme paquet TCP.
function parseWsFrame(buf) {
  if (buf.length < 2) return null;
  const masked = (buf[1] & 0x80) !== 0;
  let len = buf[1] & 0x7f;
  let offset = 2;
  if (len === 126) { if (buf.length < 4) return null; len = buf.readUInt16BE(2); offset = 4; }
  else if (len === 127) { if (buf.length < 10) return null; len = Number(buf.readBigUInt64BE(2)); offset = 10; }
  if (len > MAX_FRAME) return { opcode: -1, payload: '', size: buf.length };   // trame trop grande : connexion coupee
  if (buf.length < offset + (masked ? 4 : 0) + len) return null;
  const mask = masked ? buf.slice(offset, offset + 4) : null;
  if (masked) offset += 4;
  const payload = Buffer.from(buf.slice(offset, offset + len));
  if (masked) for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i % 4];
  return { opcode: buf[0] & 0x0f, payload: payload.toString(), size: offset + len };
}

function makeWsFrame(data) {
  const payload = Buffer.from(JSON.stringify(data));
  const len = payload.length;
  let header;
  if (len < 126) { header = Buffer.alloc(2); header[0] = 0x81; header[1] = len; }
  else { header = Buffer.alloc(4); header[0] = 0x81; header[1] = 126; header.writeUInt16BE(len, 2); }
  return Buffer.concat([header, payload]);
}

function wsSend(socket, data) { try { socket.write(makeWsFrame(data)); } catch(e) {} }

function broadcastAll(code, data) {
  if (!rooms[code]) return;
  rooms[code].players.forEach(function(p) { wsSend(p.socket, data); });
}

// ── Deroulement d'une partie multijoueur : decide uniquement par le serveur ──
// Les navigateurs appliquent : game_start, reveal_now {index}, next_question {index}.
// Durees alignees sur le navigateur (sonara.js) :
const COUNTDOWN_MS = 3300;   // decompte 3-2-1 avant la 1re manche (doCD)
const BREAK_MS     = 5000;   // pause entre deux manches (doBreak)
const QUESTION_MS  = 30000;  // temps de reponse (G.td = 30 s)
const AUDIO_GRACE  = 2000;   // marge de chargement de l'extrait
const REVEAL_MS    = 5000;   // revelation (4 s pour la derniere manche)
// Un joueur part : si tous les joueurs restants ont fini, on revele
function checkAllDone(code) {
  var room = rooms[code];
  if (room && room.phase === 'question' && room.players.length && room.players.every(function(x){ return x.answered; })) revealQuestion(code);
}
// Salles en memoire seulement. Supprimees : des que le dernier joueur part,
// 2 min apres la creation si personne n'y entre, apres 2 h sans activite.
const ROOM_TTL = 7200000, EMPTY_TTL = 120000;
function dropRoom(code) {
  var r = rooms[code]; if (!r) return;
  clearRoomTimer(r); clearTimeout(r.expire);
  r.players.forEach(function(pl){ try { pl.socket.end(); } catch(e) {} });
  delete rooms[code];
}
function keepRoom(code, ms) {
  var room = rooms[code]; if (!room) return;
  clearTimeout(room.expire);
  room.expire = setTimeout(function(){ dropRoom(code); }, ms || ROOM_TTL);
}
function playerList(room) { return room.players.map(function(pl){ return { id: pl.id, name: pl.name, score: pl.score }; }); }
// Un joueur part : s'il etait l'hote, le premier joueur restant le remplace
function removePlayer(code, playerId) {
  var room = rooms[code]; if (!room) return;
  var before = room.players.length;
  room.players = room.players.filter(function(pl){ return pl.id !== playerId; });
  if (room.players.length === before) return;
  if (!room.players.length) { dropRoom(code); return; }
  if (room.host === playerId && room.players.length) room.host = room.players[0].id;
  checkAllDone(code);
  broadcastAll(code, { type: 'player_left', id: playerId, host: room.host, players: playerList(room) });
}
function clearRoomTimer(room) { if (room.questionTimer) { clearTimeout(room.questionTimer); room.questionTimer = null; } }
// Ouvre la manche room.question ; filet de securite si un joueur ne repond jamais
function startQuestion(code, delayBefore) {
  var room = rooms[code]; if (!room) return;
  clearRoomTimer(room);
  room.phase = 'question';
  room.players.forEach(function(x){ x.answered = false; });
  room.questionTimer = setTimeout(function(){ revealQuestion(code); }, delayBefore + QUESTION_MS + AUDIO_GRACE);
}
// Revele la manche en cours (une seule fois), puis enchaine la suivante
function revealQuestion(code) {
  var room = rooms[code]; if (!room || room.phase !== 'question') return;
  clearRoomTimer(room);
  room.phase = 'reveal';
  var idx = room.question, isLast = idx >= room.trackCount - 1;
  broadcastAll(code, { type: 'reveal_now', index: idx });
  room.questionTimer = setTimeout(function(){
    var r = rooms[code]; if (!r) return;
    r.question = idx + 1;
    broadcastAll(code, { type: 'next_question', index: r.question });
    if (r.question >= r.trackCount) { r.phase = 'done'; r.questionTimer = null; }
    else startQuestion(code, BREAK_MS);
  }, isLast ? REVEAL_MS - 1000 : REVEAL_MS);
}

const server = http.createServer(function(req, res) {
  let p;
  try {
    const u = new URL(req.url, 'http://localhost');
    p = { pathname: u.pathname, query: Object.fromEntries(u.searchParams) };
  } catch (e) { res.writeHead(400); res.end(); return; }
  securityHeaders(req, res);
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  // ── Salles (en memoire) : creer, verifier avant d'entrer ──
  // Le code circule dans le corps de la requete, jamais dans l'URL (journaux).
  if (p.pathname === '/room/create' && req.method === 'POST') {
    if (limited(req, 'salle')) { tooMany(res); return; }
    readBody(req, function (err, data) {
      if (err || !data || !validId(data.playerId) || !/^[a-z]{2,16}$/.test(String(data.theme || ''))) { sendJson(res, 400, {}); return; }
      const code = genCode();
      rooms[code] = { code, theme: data.theme, host: data.playerId, players: [], started: false, phase: 'lobby', question: 0 };
      keepRoom(code, EMPTY_TTL);
      sendJson(res, 200, { code });
    });
    return;
  }
  if (p.pathname === '/room/info' && req.method === 'POST') {
    if (limited(req, 'rejoindre')) { tooMany(res); return; }
    readBody(req, function (err, data) {
      const room = !err && data && rooms[String(data.code || '').toUpperCase()];
      if (!room) { sendJson(res, 404, {}); return; }
      // Son-noms seulement : aucun identifiant de joueur
      const host = room.players.find(function(pl){ return pl.id === room.host; });
      sendJson(res, 200, {
        code: room.code, theme: room.theme, started: room.started, phase: room.phase || 'lobby',
        hostName: host ? host.name : '',
        players: room.players.map(function(pl){ return { name: pl.name, host: pl.id === room.host }; })
      });
    });
    return;
  }

  // ── Son-nom : forme et filtre, avant de jouer ──
  if (p.pathname === '/name/check' && req.method === 'POST') {
    if (limited(req, 'nom')) { tooMany(res); return; }
    readBody(req, function (err, data) {
      if (err || !data) { sendJson(res, 400, {}); return; }
      const v = moderation.verifie(data.name);
      sendJson(res, 200, v.ok ? { ok: true, name: v.nom } : { ok: false, reason: v.raison });
    });
    return;
  }

  // ── Compteur en ligne (identifiant de visite dans le corps, pas dans l'URL) ──
  if (p.pathname === '/ping' && req.method === 'POST') {
    if (limited(req, 'ping')) { tooMany(res); return; }
    readBody(req, function (err, data) {
      if (!err && data && typeof data.id === 'string' && /^[a-z0-9]{8,40}$/.test(data.id)) touch(data.id);
      sendJson(res, 200, { online: onlineCount() });
    });
    return;
  }

  // ── Lien de Defi : creer / resoudre ──
  if (p.pathname === '/custom' && req.method === 'POST') {
    if (limited(req, 'defi')) { tooMany(res); return; }
    readBody(req, function (err, data) {
      if (err) { sendJson(res, 400, {}); return; }
      const code = genCustomCode();
      store.data.customLinks[code] = { theme: slug(data.theme), themeName: String(data.themeName || '').slice(0, 40), at: Date.now() };
      store.save();
      sendJson(res, 200, { code: code });
    });
    return;
  }
  if (p.pathname.indexOf('/custom/') === 0 && req.method === 'GET') {
    const code = p.pathname.slice(8).replace(/[^a-z0-9]/gi, '').slice(0, 12);
    const rec = store.data.customLinks[code];
    if (!rec) { sendJson(res, 404, {}); return; }
    sendJson(res, 200, { theme: rec.theme, themeName: rec.themeName || '' });
    return;
  }

  // ── Classement : enregistre seulement si le score entre dans le top 10 ──
  // key : code d'effacement tire par le navigateur ; seule son empreinte est gardee.
  if (p.pathname === '/score' && req.method === 'POST') {
    if (limited(req, 'score')) { tooMany(res); return; }
    readBody(req, function (err, data) {
      if (err || !data) { sendJson(res, 400, {}); return; }
      const v = moderation.verifie(data.name);
      if (!v.ok) { sendJson(res, 400, { error: 'nom', reason: v.raison }); return; }
      const theme = slug(data.theme);
      const entry = { name: v.nom, score: Math.max(0, Math.min(100000, parseInt(data.score, 10) || 0)), theme: theme, at: Date.now() };
      if (validKey(data.key)) entry.eh = hashKey(data.key);
      store.data.stats.gamesPlayed = (store.data.stats.gamesPlayed || 0) + 1;
      let list = themeList(theme);
      const entre = entry.score > 0 && (list.length < TOP || entry.score > list[TOP - 1].score);
      if (entre) {
        store.data.leaderboard.push(entry);
        trimTop();
        list = themeList(theme);
      }
      store.save();
      const rank = entre ? list.indexOf(entry) + 1 : 0;
      sendJson(res, 200, { rank: rank, saved: entre, gamesPlayed: store.data.stats.gamesPlayed, top: publicTop(list) });
    });
    return;
  }
  // ── Droit a l'effacement : supprime les scores dont l'empreinte correspond ──
  if (p.pathname === '/score/delete' && req.method === 'POST') {
    if (limited(req, 'effacement')) { tooMany(res); return; }
    readBody(req, function (err, data) {
      const keys = !err && data && Array.isArray(data.keys) ? data.keys.filter(validKey).slice(0, 500) : [];
      if (!keys.length) { sendJson(res, 200, { deleted: 0 }); return; }
      const hs = new Set(keys.map(hashKey));
      const before = store.data.leaderboard.length;
      store.data.leaderboard = store.data.leaderboard.filter(function (e) { return !(e.eh && hs.has(e.eh)); });
      const deleted = before - store.data.leaderboard.length;
      if (deleted) store.save();
      sendJson(res, 200, { deleted: deleted });
    });
    return;
  }
  if (p.pathname === '/leaderboard' && req.method === 'GET') {
    const th = p.query.theme ? slug(p.query.theme) : null;
    const list = th ? themeList(th) : store.data.leaderboard.slice().sort(function (a, b) { return b.score - a.score; });
    sendJson(res, 200, { top: publicTop(list), gamesPlayed: store.data.stats.gamesPlayed || 0 });
    return;
  }
  if (p.pathname === '/deezer') {
    res.setHeader('Content-Type', 'application/json');
    fetchDeezer(p.query.q || '', function(err, data) {
      if (err) { res.writeHead(500); res.end('{}'); return; }
      res.writeHead(200); res.end(JSON.stringify(data));
    });
    return;
  }

  // Fichiers statiques CSS / JS
  if (p.pathname === '/sonara.css' || p.pathname === '/sonara.js' || p.pathname === '/landing.css' || p.pathname === '/landing.js' || p.pathname === '/univers.css' || p.pathname === '/univers.js' || p.pathname === '/footer.js' || p.pathname === '/sonara-kit.css' || p.pathname === '/sonara-kit.js' || p.pathname === '/ecrans.css' || p.pathname === '/ecran-univers.js' || p.pathname === '/ecran-sonnom.js' || p.pathname === '/ecran-resultats.js' || p.pathname === '/jeu.css' || p.pathname === '/ecran-jeu.js' || p.pathname === '/prep.css' || p.pathname === '/ecran-prep.js' || p.pathname === '/cadre.css' || p.pathname === '/cadre.js' || p.pathname === '/rgpd.js') {
    fs.readFile(path.join(__dirname, p.pathname), function(err, data) {
      if (err) { res.writeHead(404); res.end('Not found'); return; }
      var ct = p.pathname.endsWith('.css') ? 'text/css' : 'application/javascript';
      res.writeHead(200, {'Content-Type': ct + '; charset=utf-8'});
      res.end(data);
    });
    return;
  }

  if (p.pathname.startsWith('/img/')) {
    var ext2 = p.pathname.split('.').pop().toLowerCase();
    var mimes = {'jpg':'image/jpeg','jpeg':'image/jpeg','png':'image/png','webp':'image/webp','gif':'image/gif','svg':'image/svg+xml'};
    var ct2 = mimes[ext2] || 'application/octet-stream';
    fs.readFile(path.join(__dirname, p.pathname), function(err, data) {
      if (err) { res.writeHead(404); res.end('Not found'); return; }
      res.writeHead(200, {'Content-Type': ct2});
      res.end(data);
    });
    return;
  }

  // Icones (favicon, ecran d'accueil, manifeste) : fichiers du dossier icons/
  var icons={'/favicon.ico':'image/x-icon','/favicon.svg':'image/svg+xml','/apple-touch-icon.png':'image/png',
    '/icon-192.png':'image/png','/icon-512.png':'image/png','/site.webmanifest':'application/manifest+json'};
  if (icons[p.pathname]) {
    fs.readFile(path.join(__dirname, 'icons', p.pathname), function(err, data) {
      if (err) { res.writeHead(404); res.end('Not found'); return; }
      res.writeHead(200, {'Content-Type': icons[p.pathname]});
      res.end(data);
    });
    return;
  }

  // Pages legales (+ demo du kit de design, non liee sur le site)
  var legal={'/mentions-legales':'mentions-legales.html','/politique-de-confidentialite':'politique-confidentialite.html','/kit.html':'kit.html'};
  if (legal[p.pathname]) { sendHtml(req, res, legal[p.pathname]); return; }
  if (p.pathname === '/legal.css') {
    fs.readFile(path.join(__dirname, 'legal.css'), function(err, data) {
      if (err) { res.writeHead(404); res.end('Not found'); return; }
      res.writeHead(200, {'Content-Type': 'text/css; charset=utf-8'});
      res.end(data);
    });
    return;
  }

  // Polices hebergees localement (fonts.css + fichiers woff2)
  if (/^\/fonts\/[a-z0-9-]+\.(woff2|css)$/.test(p.pathname)) {
    fs.readFile(path.join(__dirname, p.pathname), function(err, data) {
      if (err) { res.writeHead(404); res.end('Not found'); return; }
      var css = p.pathname.endsWith('.css');
      res.writeHead(200, {'Content-Type': css ? 'text/css; charset=utf-8' : 'font/woff2', 'Cache-Control': 'public, max-age=31536000'});
      res.end(data);
    });
    return;
  }

  // Audio : Safari sur iPhone charge les extraits par morceaux (en-tete Range)
  // et refuse de les lire si le serveur ne repond pas 206 avec la taille.
  if (p.pathname.startsWith('/audio/')) {
    var audioName;
    try { audioName = path.basename(decodeURIComponent(p.pathname)); } catch (e) { res.writeHead(400); res.end(); return; }
    var audioFile = path.join(__dirname, 'audio', audioName);
    fs.stat(audioFile, function(err, st) {
      if (err || !st.isFile()) { res.writeHead(404); res.end('Not found'); return; }
      var size = st.size, range = req.headers.range, m = range && /^bytes=(\d*)-(\d*)$/.exec(range);
      var head = {'Content-Type':'audio/mpeg', 'Accept-Ranges':'bytes'};
      if (m && (m[1] || m[2])) {
        var start = m[1] ? parseInt(m[1], 10) : Math.max(0, size - parseInt(m[2], 10));
        var end = m[1] && m[2] ? Math.min(parseInt(m[2], 10), size - 1) : size - 1;
        if (start >= size || start > end) { head['Content-Range'] = 'bytes */' + size; res.writeHead(416, head); res.end(); return; }
        head['Content-Range'] = 'bytes ' + start + '-' + end + '/' + size;
        head['Content-Length'] = end - start + 1;
        res.writeHead(206, head);
        if (req.method === 'HEAD') { res.end(); return; }
        fs.createReadStream(audioFile, {start: start, end: end}).pipe(res);
        return;
      }
      head['Content-Length'] = size;
      res.writeHead(200, head);
      if (req.method === 'HEAD') { res.end(); return; }
      fs.createReadStream(audioFile).pipe(res);
    });
    return;
  }

  sendHtml(req, res, 'sonara.html');
});

// ── WebSocket : le premier message { type:'join', code, id, name } fait entrer
// dans la salle. Rien de personnel dans l'URL (journaux de l'hebergeur).
server.on('upgrade', function(req, socket) {
  socket.on('error', function(){});
  let pathname = '';
  try { pathname = new URL(req.url, 'http://localhost').pathname; } catch (e) {}
  const key = req.headers['sec-websocket-key'];
  // Meme site seulement (l'en-tete Origin est toujours envoye par les navigateurs)
  const origin = req.headers.origin, hosts = [req.headers.host, req.headers['x-forwarded-host']].filter(Boolean).map(function(h){ return String(h).split(',')[0].trim(); });
  let originOk = !origin;
  try { if (origin) originOk = hosts.indexOf(new URL(origin).host) >= 0; } catch (e) {}
  if (pathname !== '/ws' || !key || !originOk || limited(req, 'rejoindre')) { socket.destroy(); return; }
  const accept = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + accept + '\r\n\r\n');
  let code = null, playerId = null, joined = false;
  function refuse(reason, extra) {
    wsSend(socket, Object.assign({ type: 'join_refused', reason: reason }, extra || {}));
    setTimeout(function(){ try { socket.end(); } catch(e) {} }, 50);
  }
  const joinTimer = setTimeout(function(){ if (!joined) socket.destroy(); }, 10000);
  function join(msg) {
    const c = String(msg.code || '').toUpperCase(), room = rooms[c];
    if (!room) { refuse('missing'); return; }
    if (room.started) { refuse('started'); return; }
    if (!validId(msg.id) || room.players.some(function(x){ return x.id === msg.id; })) { refuse('id'); return; }
    const v = moderation.verifie(msg.name);
    if (!v.ok) { refuse('name', { detail: v.raison }); return; }
    clearTimeout(joinTimer);
    code = c; playerId = msg.id; joined = true;
    room.players.push({ id: playerId, name: v.nom, socket, score: 0 });
    keepRoom(code);
    broadcastAll(code, { type: 'player_joined', host: room.host, players: playerList(room) });
  }
  let pending = Buffer.alloc(0);
  socket.on('data', function(buf) {
    pending = Buffer.concat([pending, buf]);
    if (pending.length > 4 * MAX_FRAME) { socket.destroy(); return; }
    let frame;
    while ((frame = parseWsFrame(pending))) {
      pending = pending.slice(frame.size);
      if (frame.opcode === -1) { socket.destroy(); return; }
      if (!joined) {
        if (frame.opcode === 8) { socket.destroy(); return; }
        let msg = null;
        try { msg = frame.opcode === 1 ? JSON.parse(frame.payload) : null; } catch (e) {}
        if (msg && msg.type === 'join') join(msg); else if (frame.opcode === 1) { socket.destroy(); return; }
        continue;
      }
      if (rooms[code]) keepRoom(code);   // activite : la salle reste ouverte
      handleFrame(frame);
    }
  });
  // Onglet ferme, reseau coupe : le joueur quitte la salle
  socket.on('close', function(){ clearTimeout(joinTimer); if (joined) removePlayer(code, playerId); });
  function handleFrame(frame) {
    try {
      if (frame.opcode === 8) { removePlayer(code, playerId); return; }
      if (frame.opcode !== 1) return;
      const msg = JSON.parse(frame.payload);
      if (msg.type === 'start' && rooms[code].host === playerId && !rooms[code].started) {
        rooms[code].started = true;
        rooms[code].players.forEach(function(x){ x.score = 0; x.answered = false; });
        keepRoom(code);
        var trackCount = Math.max(1, Math.min(50, parseInt(msg.trackCount, 10) || 10));
        var totalTracks = Math.max(trackCount, Math.min(500, parseInt(msg.totalTracks, 10) || trackCount));
        var indices = [];
        for (var ti = 0; ti < totalTracks; ti++) indices.push(ti);
        for (var ti = indices.length - 1; ti > 0; ti--) {
          var tj = Math.floor(Math.random() * (ti + 1));
          var tmp = indices[ti]; indices[ti] = indices[tj]; indices[tj] = tmp;
        }
        var trackOrder = indices.slice(0, trackCount);
        rooms[code].trackCount = trackOrder.length;
        rooms[code].question = 0;
        broadcastAll(code, { type: 'game_start', theme: rooms[code].theme, trackOrder: trackOrder });
        startQuestion(code, COUNTDOWN_MS);
      }
      if (msg.type === 'answer') {
        var pl = rooms[code].players.find(function(x){ return x.id === playerId; });
        // reponse d'une autre manche (message en retard) : ignoree
        var staleAnswer = typeof msg.index === 'number' && msg.index !== rooms[code].question;
        if (pl && !staleAnswer) {
          pl.score = (pl.score||0) + Math.max(0, Math.min(1000, parseInt(msg.points, 10) || 0));
          if (msg.done) pl.answered = true;
          broadcastAll(code, { type: 'score_update', players: rooms[code].players.map(function(x){ return { id: x.id, name: x.name, score: x.score, done: !!x.answered }; }) });
          if (msg.done && rooms[code].phase === 'question') {
            var allDone = rooms[code].players.every(function(x){ return x.answered; });
            if (allDone) revealQuestion(code);   // sinon : fin du temps (filet du serveur)
          }
        }
      }
      // ── Meme groupe, nouvelle partie (fin de partie, hote seulement) ──
      var room = rooms[code], isHost = room && room.host === playerId, over = room && (!room.started || room.phase === 'done');
      // L'hote choisit le prochain univers : les invites l'attendent
      if ((msg.type === 'choosing' || msg.type === 'choosing_end') && isHost && over) {
        broadcastAll(code, { type: msg.type === 'choosing' ? 'host_choosing' : 'host_choosing_end' });
      }
      // Retour de tout le groupe dans la salle (meme code, memes joueurs), scores a zero
      if (msg.type === 'new_game' && isHost && over) {
        if (typeof msg.theme === 'string' && /^[a-z]{2,16}$/.test(msg.theme)) room.theme = msg.theme;
        clearRoomTimer(room);
        room.started = false; room.phase = 'lobby'; room.question = 0;
        room.players.forEach(function(x){ x.score = 0; x.answered = false; });
        keepRoom(code);
        broadcastAll(code, { type: 'back_to_lobby', theme: room.theme, host: room.host, players: playerList(room) });
      }
      // 'reveal_done' (ancien client) : ignore, le serveur enchaine seul les manches
    } catch(e) {}
  }
});

// ── Conservation des scores : 12 mois apres la partie, 10 par univers ──
// Au demarrage puis une fois par jour. Retire aussi tout ce qui ne respecte
// pas les regles : champs en trop, son-nom refuse, score hors du top 10.
// Un score sans date (ancien format) recoit la date du jour.
const CHAMPS = ['name', 'score', 'theme', 'at', 'eh'];
function purgeScores() {
  var now = Date.now();
  var limit = new Date(now); limit.setMonth(limit.getMonth() - 12);
  var cutoff = limit.getTime();
  var list = Array.isArray(store.data.leaderboard) ? store.data.leaderboard : [];
  var before = JSON.stringify(list);
  var kept = [];
  list.forEach(function (e) {
    if (!e || typeof e !== 'object') return;
    var v = moderation.verifie(e.name);
    if (!v.ok) return;
    var c = { name: v.nom, score: Math.max(0, Math.min(100000, parseInt(e.score, 10) || 0)), theme: slug(e.theme), at: Number(e.at) || now };
    if (typeof e.eh === 'string' && /^[a-f0-9]{64}$/.test(e.eh)) c.eh = e.eh;
    if (c.at >= cutoff && c.score > 0) kept.push(c);
  });
  store.data.leaderboard = kept;
  trimTop();
  var removed = list.length - store.data.leaderboard.length;
  if (JSON.stringify(store.data.leaderboard) !== before) store.save();
  return removed;
}

// ── Retrait d'un son-nom par l'administration (scripts/retirer-son-nom.js) ──
// La commande depose DATA_DIR/retraits.json ; le serveur l'applique en memoire,
// enregistre, puis supprime le fichier. Aucune route publique.
const RETRAITS = path.join(store.DATA_DIR, 'retraits.json');
function normName(n) { return moderation.nettoie(n).toLocaleLowerCase('fr'); }
function applyRetraits() {
  var names;
  try { names = JSON.parse(fs.readFileSync(RETRAITS, 'utf8')); } catch (e) { return; }
  try { fs.unlinkSync(RETRAITS); } catch (e) {}
  if (!Array.isArray(names) || !names.length) return;
  var set = new Set(names.map(normName));
  var before = store.data.leaderboard.length;
  store.data.leaderboard = store.data.leaderboard.filter(function (e) { return !set.has(normName(e.name)); });
  if (store.data.leaderboard.length !== before) store.save();
  console.log('[classement] retrait administratif : ' + (before - store.data.leaderboard.length) + ' score(s) supprime(s)');
}

purgeScores();
applyRetraits();
setInterval(purgeScores, 24 * 60 * 60 * 1000).unref();
setInterval(applyRetraits, 5000).unref();

module.exports = { purgeScores: purgeScores };

server.listen(PORT, function(){ console.log('SONARA on port ' + PORT); });
