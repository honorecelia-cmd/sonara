const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');
const store = require('./store');
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
  do { c = Math.random().toString(36).slice(2, 8); } while (store.data.customLinks[c]);
  return c;
}
function readBody(req, cb) {
  let b = '';
  req.on('data', function (d) { b += d; if (b.length > 8192) req.destroy(); });
  req.on('end', function () { try { cb(null, b ? JSON.parse(b) : {}); } catch (e) { cb(e); } });
}
function sendJson(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}
function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
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
  const p = url.parse(req.url, true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (p.pathname === '/room/create' && req.method === 'POST') {
    let body = '';
    req.on('data', function(d){ body += d; });
    req.on('end', function(){
      try {
        const data = JSON.parse(body);
        const code = genCode();
        rooms[code] = { code, theme: data.theme, host: data.playerId, players: [], started: false, question: 0 };
        res.writeHead(200, {'Content-Type':'application/json'});
        res.end(JSON.stringify({ code }));
        setTimeout(function(){ delete rooms[code]; }, 7200000);
      } catch(e) { res.writeHead(400); res.end('{}'); }
    });
    return;
  }

  if (p.pathname === '/room/info') {
    const room = rooms[p.query.code];
    if (!room) { res.writeHead(404); res.end('{}'); return; }
    res.writeHead(200, {'Content-Type':'application/json'});
    res.end(JSON.stringify({
      code: room.code, theme: room.theme, started: room.started,
      players: room.players.map(function(pl){ return { id: pl.id, name: pl.name, score: pl.score||0 }; })
    }));
    return;
  }

  // ── Compteur en ligne ──
  if (p.pathname === '/ping') {
    touch(p.query.id);
    sendJson(res, 200, { online: onlineCount() });
    return;
  }

  // ── Lien "Entre proches" : creer / resoudre ──
  if (p.pathname === '/custom' && req.method === 'POST') {
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

  // ── Classement persistant ──
  if (p.pathname === '/score' && req.method === 'POST') {
    readBody(req, function (err, data) {
      if (err) { sendJson(res, 400, {}); return; }
      const entry = {
        name: String(data.name || 'Joueur').slice(0, 24),
        score: Math.max(0, Math.min(100000, parseInt(data.score, 10) || 0)),
        theme: slug(data.theme),
        at: Date.now()
      };
      store.data.leaderboard.push(entry);
      store.data.leaderboard.sort(function (a, b) { return b.score - a.score; });
      if (store.data.leaderboard.length > 200) store.data.leaderboard.length = 200;
      store.data.stats.gamesPlayed = (store.data.stats.gamesPlayed || 0) + 1;
      store.save();
      const list = store.data.leaderboard.filter(function (e) { return e.theme === entry.theme; });
      const rank = list.indexOf(entry) + 1;
      sendJson(res, 200, { rank: rank, gamesPlayed: store.data.stats.gamesPlayed, top: list.slice(0, 10) });
    });
    return;
  }
  if (p.pathname === '/leaderboard' && req.method === 'GET') {
    const th = p.query.theme ? slug(p.query.theme) : null;
    const list = store.data.leaderboard.filter(function (e) { return !th || e.theme === th; });
    sendJson(res, 200, { top: list.slice(0, 10), gamesPlayed: store.data.stats.gamesPlayed || 0 });
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
  if (p.pathname === '/sonara.css' || p.pathname === '/sonara.js' || p.pathname === '/landing.css' || p.pathname === '/landing.js' || p.pathname === '/univers.css' || p.pathname === '/univers.js' || p.pathname === '/footer.js' || p.pathname === '/sonara-kit.css' || p.pathname === '/sonara-kit.js' || p.pathname === '/ecrans.css' || p.pathname === '/ecran-univers.js' || p.pathname === '/ecran-sonnom.js' || p.pathname === '/ecran-resultats.js' || p.pathname === '/jeu.css' || p.pathname === '/ecran-jeu.js' || p.pathname === '/prep.css' || p.pathname === '/ecran-prep.js') {
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

  // Pages legales (+ demo du kit de design, non liee sur le site)
  var legal={'/mentions-legales':'mentions-legales.html','/politique-de-confidentialite':'politique-confidentialite.html','/kit.html':'kit.html'};
  if (legal[p.pathname] || p.pathname === '/legal.css') {
    var lf=legal[p.pathname]||'legal.css';
    fs.readFile(path.join(__dirname, lf), function(err, data) {
      if (err) { res.writeHead(404); res.end('Not found'); return; }
      res.writeHead(200, {'Content-Type': (lf.endsWith('.css')?'text/css':'text/html')+'; charset=utf-8'});
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

  if (p.pathname.startsWith('/audio/')) {
    fs.readFile(path.join(__dirname, p.pathname), function(err, data) {
      if (err) { res.writeHead(404); res.end('Not found'); return; }
      res.writeHead(200, {'Content-Type':'audio/mpeg'});
      res.end(data);
    });
    return;
  }

  fs.readFile(path.join(__dirname, 'sonara.html'), function(err, data) {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
    res.end(data);
  });
});

server.on('upgrade', function(req, socket) {
  const key = req.headers['sec-websocket-key'];
  const accept = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + accept + '\r\n\r\n');
  const p = url.parse(req.url, true);
  const code = p.query.code;
  const playerId = p.query.id;
  const playerName = decodeURIComponent(p.query.name || 'Joueur');
  if (!rooms[code]) { socket.destroy(); return; }
  const player = { id: playerId, name: playerName, socket, score: 0 };
  rooms[code].players.push(player);
  broadcastAll(code, { type: 'player_joined', players: rooms[code].players.map(function(pl){ return { id: pl.id, name: pl.name, score: pl.score }; }) });
  let pending = Buffer.alloc(0);
  socket.on('data', function(buf) {
    pending = Buffer.concat([pending, buf]);
    let frame;
    while ((frame = parseWsFrame(pending))) {
      pending = pending.slice(frame.size);
      handleFrame(frame);
    }
  });
  function handleFrame(frame) {
    try {
      if (frame.opcode === 8) {
        rooms[code].players = rooms[code].players.filter(function(pl){ return pl.id !== playerId; });
        checkAllDone(code);
        broadcastAll(code, { type: 'player_left', id: playerId, players: rooms[code].players.map(function(pl){ return { id: pl.id, name: pl.name, score: pl.score }; }) });
        return;
      }
      if (frame.opcode !== 1) return;
      const msg = JSON.parse(frame.payload);
      if (msg.type === 'start' && rooms[code].host === playerId) {
        rooms[code].started = true;
        var trackCount = msg.trackCount || 10;
        var totalTracks = msg.totalTracks || trackCount;
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
          pl.score = (pl.score||0) + (msg.points||0);
          if (msg.done) pl.answered = true;
          broadcastAll(code, { type: 'score_update', players: rooms[code].players.map(function(x){ return { id: x.id, name: x.name, score: x.score, done: !!x.answered }; }) });
          if (msg.done && rooms[code].phase === 'question') {
            var allDone = rooms[code].players.every(function(x){ return x.answered; });
            if (allDone) revealQuestion(code);   // sinon : fin du temps (filet du serveur)
          }
        }
      }
      // 'reveal_done' (ancien client) : ignore, le serveur enchaine seul les manches
    } catch(e) {}
  }
  socket.on('error', function(){
    if (rooms[code]) { rooms[code].players = rooms[code].players.filter(function(pl){ return pl.id !== playerId; }); checkAllDone(code); }
  });
});

// ── Conservation des scores : 12 mois apres la partie ──
// Au demarrage puis une fois par jour. Un score sans date (ancien format)
// recoit la date du jour : il est conserve 12 mois a partir d'aujourd'hui.
function purgeScores() {
  var now = Date.now(), changed = false;
  var limit = new Date(now); limit.setMonth(limit.getMonth() - 12);
  var cutoff = limit.getTime();
  var list = store.data.leaderboard || [];
  list.forEach(function (e) { if (!e.at) { e.at = now; changed = true; } });
  var kept = list.filter(function (e) { return e.at >= cutoff; });
  if (kept.length !== list.length) changed = true;
  store.data.leaderboard = kept;
  if (changed) store.save();
  return list.length - kept.length;
}
purgeScores();
setInterval(purgeScores, 24 * 60 * 60 * 1000);

server.listen(PORT, function(){ console.log('SONARA on port ' + PORT); });
