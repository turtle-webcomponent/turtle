import http from 'http';
import fs from 'fs';
import path from 'path';

http.createServer(function (request, response) {
  var filePath = '.' + request.url;
  if (filePath == './') {
    filePath = './index.html';
  }

  var extname = String(path.extname(filePath)).toLowerCase();
  var mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
  };

  var contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, function (error, content) {
    response.writeHead(200, { 'Content-Type': contentType });
    response.end(content, 'utf-8');
  });

}).listen(8001);
console.log('Server running at http://127.0.0.1:8001/');
