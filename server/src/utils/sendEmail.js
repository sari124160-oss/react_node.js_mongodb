 
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"מערכת מענקים" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log(`✅ מייל נשלח ל: ${to}`);
  } catch (err) {
    console.error('❌ שגיאה בשליחת מייל:', err.message);
  }
};

module.exports = sendEmail;