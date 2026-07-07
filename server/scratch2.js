require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');
const mongoose = require('mongoose');
const GmailConnection = require('./models/GmailConnection');
const { decrypt } = require('./utils/tokenCrypto');

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const conn = await GmailConnection.findOne({ status: 'active' });
  if (conn) {
    const refreshToken = decrypt(conn.refreshTokenEnc);
    client.setCredentials({ refresh_token: refreshToken });
    try {
      const res = await client.getAccessToken();
      console.log('Access token generated successfully:', res.token.substring(0, 10) + '...');
    } catch (err) {
      console.error('Error generating access token:', err.message);
    }
  }
  process.exit();
});
