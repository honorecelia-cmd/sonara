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

function parseWsFrame(buf) {
  const masked = (buf[1] & 0x80) !== 0;
  let len = buf[1] & 0x7f;
  let offset = 2;
  if (len === 126) { len = buf.readUInt16BE(2); offset = 4; }
  const mask = masked ? buf.slice(offset, offset + 4) : null;
  if (masked) offset += 4;
  const payload = buf.slice(offset, offset + len);
  if (masked) for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i % 4];
  return { opcode: buf[0] & 0x0f, payload: payload.toString() };
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

function startQuestionTimer(code) {
  if (!rooms[code]) return;
  if (rooms[code].questionTimer) clearTimeout(rooms[code].questionTimer);
  rooms[code].questionTimer = setTimeout(function() {
    if (!rooms[code]) return;
    rooms[code].players.forEach(function(x){ x.answered = true; });
    broadcastAll(code, { type: 'reveal_now' });
  }, 35000);
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
  if (p.pathname === '/sonara.css' || p.pathname === '/sonara.js') {
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
    var mimes = {'jpg':'image/jpeg','jpeg':'image/jpeg','png':'image/png','webp':'image/webp','gif':'image/gif'};
    var ct2 = mimes[ext2] || 'application/octet-stream';
    fs.readFile(path.join(__dirname, p.pathname), function(err, data) {
      if (err) { res.writeHead(404); res.end('Not found'); return; }
      res.writeHead(200, {'Content-Type': ct2});
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
  socket.on('data', function(buf) {
    try {
      const frame = parseWsFrame(buf);
      if (frame.opcode === 8) {
        rooms[code].players = rooms[code].players.filter(function(pl){ return pl.id !== playerId; });
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
        broadcastAll(code, { type: 'game_start', theme: rooms[code].theme, trackOrder: trackOrder });
        startQuestionTimer(code);
      }
      if (msg.type === 'answer') {
        var pl = rooms[code].players.find(function(x){ return x.id === playerId; });
        if (pl) {
          pl.score = (pl.score||0) + (msg.points||0);
          if (msg.done) pl.answered = true;
          broadcastAll(code, { type: 'score_update', players: rooms[code].players.map(function(x){ return { id: x.id, name: x.name, score: x.score, done: !!x.answered }; }) });
          if (msg.done) {
            var allDone = rooms[code].players.every(function(x){ return x.answered; });
            if (allDone) {
              if (rooms[code].questionTimer) clearTimeout(rooms[code].questionTimer);
              broadcastAll(code, { type: 'reveal_now' });
            }
            // Sinon on attend le timer
          }
        }
      }
      if (msg.type === 'reveal_done') {
        var nextIdx = msg.index + 1;
        if (nextIdx !== rooms[code].question) {
          rooms[code].question = nextIdx;
          rooms[code].players.forEach(function(x){ x.answered = false; });
          broadcastAll(code, { type: 'next_question', index: nextIdx });
          startQuestionTimer(code);
        }
      }
    } catch(e) {}
  });
  socket.on('error', function(){
    if (rooms[code]) rooms[code].players = rooms[code].players.filter(function(pl){ return pl.id !== playerId; });
  });
});

server.listen(PORT, function(){ console.log('SONARA on port ' + PORT); });
