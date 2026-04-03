const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.mp3':  'audio/mpeg',
  '.ogg':  'audio/ogg',
  '.wav':  'audio/wav',
};

function fetchDeezer(query, cb) {
  const q = encodeURIComponent(query);
  const options = {
    hostname: 'api.deezer.com',
    path: '/search?q=' + q + '&limit=5',
    method: 'GET',
    headers: { 'User-Agent': 'Mozilla/5.0' }
  };
  const req = https.request(options, function(res) {
    let data = '';
    res.on('data', function(chunk) { data += chunk; });
    res.on('end', function() {
      try { cb(null, JSON.parse(data)); }
      catch(e) { cb(e); }
    });
  });
  req.on('error', cb);
  req.setTimeout(8000, function() { req.destroy(); });
  req.end();
}

http.createServer(function(req, res) {
  const parsed = url.parse(req.url, true);
  
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Route proxy Deezer
  if (parsed.pathname === '/deezer') {
    const q = parsed.query.q || '';
    res.setHeader('Content-Type', 'application/json');
    fetchDeezer(q, function(err, data) {
      if (err) { res.writeHead(500); res.end('{}'); return; }
      res.writeHead(200);
      res.end(JSON.stringify(data));
    });
    return;
  }

  // Servir fichiers audio
  if (parsed.pathname.startsWith('/audio/')) {
    const filePath = path.join(__dirname, parsed.pathname);
    fs.readFile(filePath, function(err, data) {
      if (err) { res.writeHead(404); res.end('Not found'); return; }
      res.writeHead(200, { 'Content-Type': 'audio/mpeg' });
      res.end(data);
    });
    return;
  }

  // Servir sonara.html
  const filePath = path.join(__dirname, 'sonara.html');
  fs.readFile(filePath, function(err, data) {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  });
}).listen(PORT, function() {
  console.log('SONARA running on port ' + PORT);
});
