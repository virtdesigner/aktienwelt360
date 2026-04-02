import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

const server = http.createServer((req, res) => {
  // Pfad zur angeforderten Datei
  let filePath = path.join(__dirname, req.url);

  // Wenn nur der Root aufgerufen wird, serve index.html
  if (req.url === '/') {
    filePath = path.join(__dirname, 'index.html');
  }

  // Datei lesen
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 - Datei nicht gefunden</h1>');
      return;
    }

    // Content-Type basierend auf Dateiendung setzen
    const ext = path.extname(filePath);
    let contentType = 'text/plain';
    
    if (ext === '.html') contentType = 'text/html';
    if (ext === '.css') contentType = 'text/css';
    if (ext === '.js') contentType = 'application/javascript';
    if (ext === '.json') contentType = 'application/json';
    if (ext === '.png') contentType = 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    if (ext === '.gif') contentType = 'image/gif';
    if (ext === '.svg') contentType = 'image/svg+xml';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`✓ Server läuft auf http://localhost:${PORT}`);
  console.log(`✓ Drücke Ctrl + C zum Beenden`);
});
