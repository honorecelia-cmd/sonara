const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 3000;
http.createServer(function(req, res) {
  var filePath = path.join(__dirname, 'sonara.html');
  fs.readFile(filePath, function(err, data) {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8', 'Access-Control-Allow-Origin': '*'});
    res.end(data);
  });
}).listen(PORT, function() { console.log('SONARA on port ' + PORT); });
