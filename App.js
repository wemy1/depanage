const http = require('http');
const fs = require('fs');
const path = require('path');
const { signUp, verifyEmail } = require('./userController'); // تأكد من أن الدوال موجودة في userController

const PORT = 3000;

const server = http.createServer((req, res) => {
  // تحديد نوع المحتوى بناءً على المسار
  if (req.method === 'POST' && req.url === '/signup') {
    // استدعاء دالة signUp من userController
    signUp(req, res);
  } else if (req.method === 'POST' && req.url === '/verify-email') {
    // استدعاء دالة verifyEmail من userController
    verifyEmail(req, res);
  } else {
    // التعامل مع الملفات الثابتة مثل HTML و CSS
    let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
    let extname = path.extname(filePath);
    let contentType = 'text/html; charset=UTF-8';

    // تحديد نوع المحتوى بناءً على امتداد الملف
    if (extname === '.js') contentType = 'application/javascript';
    else if (extname === '.css') contentType = 'text/css';
    else if (extname === '.json') contentType = 'application/json';
    else if (extname === '.png') contentType = 'image/png';
    else if (extname === '.jpg' || extname === '.jpeg') contentType = 'image/jpeg';
    else if (extname === '.gif') contentType = 'image/gif';

    // قراءة الملف وإرساله في الاستجابة
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
        res.end('<h1>الصفحة غير موجودة.</h1>');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      }
    });
  }
});

server.listen(PORT, () => {
  console.log(server يعمل على http://localhost:${PORT});
});
