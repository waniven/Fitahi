const nodemailer = require('nodemailer');
const { issuePasswordResetOtp } = require('../helpers/otpStore');


const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465, //secure port
  secure: true, // true for secure port 465
  auth: {
    user: process.env.GMAIL_USER, //google email address
    pass: process.env.GMAIL_APP_PASS, //16 char google app password
  },
});

module.exports = async function sendPasswordResetEmail(email) {
  //generate reset code
  const resetCode = issuePasswordResetOtp(email);

  const info = await transporter.sendMail({
    from: `"Fitahi" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Password email reset',
    html: '<p>your reset code is: <b>'+resetCode+'</b></p>',
  });

  console.log('Email sent');
  return { messageId: info.messageId, accepted: info.accepted, rejected: info.rejected };
}