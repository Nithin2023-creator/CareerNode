require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');
const mongoose = require('mongoose');
const GmailConnection = require('./models/GmailConnection');
const { decrypt } = require('./utils/tokenCrypto');
const nodemailer = require('nodemailer');

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const conn = await GmailConnection.findOne({ status: 'active' });
  if (conn) {
    const refreshToken = decrypt(conn.refreshTokenEnc);
    client.setCredentials({ refresh_token: refreshToken });
    
    let transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'windows',
      buffer: true
    });
    
    try {
      const mail = await transporter.sendMail({
        from: `"CareerNode" <${conn.email}>`,
        to: "nithinchowdary565@gmail.com",
        subject: "Test from API 2",
        text: "Hello world"
      });
      
      const rawMessage = mail.message.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      
      const res = await client.request({
        url: 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
        method: 'POST',
        data: {
          raw: rawMessage
        }
      });
      console.log('Sent!', res.data);
    } catch (err) {
      console.error('Failed:', err.response?.data || err.message);
    }
  }
  process.exit();
});
