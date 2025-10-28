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

  //contruct email
  const info = await transporter.sendMail({
    from: `"Fitahi" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Fitahi App: One-Time Code for Password Reset",
    html: `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 420px; margin: auto; border: 1px solid #eee; border-radius: 10px; padding: 24px; background-color: #fafafa;">
      <p style="font-size: 15px;">Hi there,</p>
      <p style="font-size: 15px;">We received a request to reset your password. Please enter the code below along with your new password in the app's <b>Recovery Code</b> and <b>New Password</b> fields.</p>
      <div style="text-align: center; margin: 24px 0;">
        <span style="display: inline-block; font-size: 20px; letter-spacing: 2px; background: #4F9AFF; color: #fff; padding: 12px 24px; border-radius: 8px; font-weight: bold;">
          ${resetCode}
        </span>
      </div>
      <p style="font-size: 14px;">If you didn't request this, you can safely ignore this email — your account will remain secure.</p>
      <p style="margin-top: 24px; font-size: 14px;">Best regards,<br><strong>Fitahi Group</strong></p>
    </div>
  `,
  });

  console.log('Email sent');
  return { messageId: info.messageId, accepted: info.accepted, rejected: info.rejected };
}