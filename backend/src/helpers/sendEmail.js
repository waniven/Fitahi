const nodemailer = require('nodemailer');
const otp = require("../helpers/otpStore");

async function sendEmail(email) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465, //secure port
    secure: true, // true for secure port 465
    auth: {
      user: process.env.GMAIL_USER, //google email address
      pass: process.env.GMAIL_APP_PASS, //16 char google app password
    },
  });

  //generate reset code
  const resetCode = otp.issuePasswordResetOtp();

  const info = await transporter.sendMail({
    from: `"Fitahi" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Password email reset',
    text: 'Reset code: ' + resetCode,
    html: '<p><b>Hello</b> from Node</p>',
  });

  console.log('Email sent');
}

