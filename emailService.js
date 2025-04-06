const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

// إعداد الاتصال بقاعدة البيانات
const pool = new Pool({
  user: 'postgres', // استبدلها باسم المستخدم الخاص بك في قاعدة البيانات
  host: 'localhost',
  database: 'depannage', // استبدلها باسم قاعدة البيانات الخاصة بك
  password: 'meriem2025!', // استبدلها بكلمة المرور الخاصة بك
  port: 5432, // تأكد من أن المنفذ 5432 مفتوح في قاعدة البيانات الخاصة بك
});

// دالة التسجيل
async function signUp(req, res) {
  let body = '';
  
  req.on('data', chunk => {
    body += chunk;
  });

  req.on('end', async () => {
    const { nom, prenom, email, telephone, adresse, mot_de_passe } = JSON.parse(body);

    // التحقق إذا كان البريد الإلكتروني موجود في قاعدة البيانات
    try {
      const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      
      if (userCheck.rows.length > 0) {
        // إذا كان البريد موجودًا، إرجاع رسالة خطأ
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'البريد الإلكتروني مسجل بالفعل' }));
        return;
      }

      // تشفير كلمة المرور
      const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

      // إدخال بيانات المستخدم في قاعدة البيانات
      const result = await pool.query(
        'INSERT INTO users(nom, prenom, email, telephone, adresse, mot_de_passe) VALUES($1, $2, $3, $4, $5, $6) RETURNING *',
        [nom, prenom, email, telephone, adresse, hashedPassword]
      );

      // إرسال استجابة نجاح
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'تم التسجيل بنجاح!' }));
    } catch (error) {
      console.error('Error during sign-up:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'حدث خطأ أثناء التسجيل' }));
    }
  });
}

// دالة التحقق من البريد الإلكتروني
async function verifyEmail(req, res) {
  let body = '';
  
  req.on('data', chunk => {
    body += chunk;
  });

  req.on('end', async () => {
    const { email, code } = JSON.parse(body);

    // إرسال رابط التحقق عبر البريد الإلكتروني
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'meriemhamza560@gmail.com', // استبدلها بالبريد الإلكتروني الذي تستخدمه لإرسال الرسائل
        pass: 'meriem08', // استبدلها بكلمة المرور الخاصة بالبريد الإلكتروني
      },
    });

    // إنشاء رابط التحقق أو الكود الذي سيتم إرساله
    const mailOptions = {
      from: 'meriemhamza560@gmail.com',
      to: email,
      subject: 'تأكيد بريدك الإلكتروني',
      text: استخدم هذا الكود لتأكيد بريدك الإلكتروني: ${code}, // هذا هو الكود الذي ستحتاج إلى توليده وإرساله
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'حدث خطأ في إرسال البريد الإلكتروني' }));
      } else {
        console.log('Email sent: ' + info.response);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'تم إرسال البريد الإلكتروني بنجاح!' }));
      }
    });
  });
}

module.exports = { signUp, verifyEmail };
