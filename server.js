const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');
const PORT = process.env.PORT || 3000;

const rooms = {};
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
        rooms[code] = { code, theme: data.theme, host: data.playerId, players: [], started: false, question: -1 };
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

  if (p.pathname === '/deezer') {
    res.setHeader('Content-Type', 'application/json');
    fetchDeezer(p.query.q || '', function(err, data) {
      if (err) { res.writeHead(500); res.end('{}'); return; }
      res.writeHead(200); res.end(JSON.stringify(data));
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
        broadcastAll(code, { type: 'game_start', theme: rooms[code].theme, order: msg.order });
      }
      if (msg.type === 'answer') {
        const pl = rooms[code].players.find(function(x){ return x.id === playerId; });
        if (pl) {
          pl.score = (pl.score||0) + (msg.points||0);
          broadcastAll(code, { type: 'score_update', players: rooms[code].players.map(function(x){ return { id: x.id, name: x.name, score: x.score }; }) });
        }
      }
      if (msg.type === 'next_question' && rooms[code].host === playerId) {
        rooms[code].question++;
        broadcastAll(code, { type: 'next_question', index: rooms[code].question });
      }
    } catch(e) {}
  });
  socket.on('error', function(){
    if (rooms[code]) rooms[code].players = rooms[code].players.filter(function(pl){ return pl.id !== playerId; });
  });
});

server.listen(PORT, function(){ console.log('SONARA on port ' + PORT); });
