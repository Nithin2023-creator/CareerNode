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
    const res = await client.getAccessToken();
    const token = res.token;
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: conn.email,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: refreshToken,
        accessToken: token,
      }
    });

    try {
      await transporter.verify();
      console.log('SMTP verification succeeded!');
    } catch (err) {
      console.error('SMTP verification failed:', err.message);
    }
  }
  process.exit();
});
