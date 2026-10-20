const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  const safePath = path.normalize(urlPath).replace(/^(\.\.[\/\\])+/, '');
  
  // Xử lý trang chủ cho cả Windows ('\\') và Linux/macOS ('/')
  const isRoot = safePath === '/' || safePath === '\\' || safePath === '' || safePath === '.';
  let filePath = path.join(__dirname, isRoot ? 'index.html' : safePath);

  fs.stat(filePath, (err, stats) => {
    // Nếu đường dẫn là một thư mục, tự động tìm index.html bên trong
    if (!err && stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      fs.stat(filePath, (subErr, subStats) => {
        if (subErr || !subStats.isFile()) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('404 Not Found');
          return;
        }
        serveFile(filePath, res);
      });
      return;
    }

    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    serveFile(filePath, res);
  });
});

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': 'no-cache'
  });
  fs.createReadStream(filePath).pipe(res);
}

const PORT = process.env.PORT || 4173;

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n⚠️  Cổng ${PORT} hiện đang được sử dụng bởi một tiến trình khác.`);
    console.error(`👉 Bạn hãy nhấn tổ hợp phím Ctrl + C ở cửa sổ terminal cũ để tắt tiến trình đó, rồi chạy lại 'node server.js'.\n`);
  } else {
    console.error('Lỗi khởi động server:', err);
  }
});

server.listen(PORT, () => {
  console.log(`\n🎉 Server đã khởi động thành công!`);
  console.log(`👉 Truy cập ngay: http://localhost:${PORT}\n`);
});

