require('dotenv').config({ path: 'server/.env' });
const mongoose = require('mongoose');
const GmailConnection = require('./server/models/GmailConnection');
const { decrypt } = require('./server/utils/tokenCrypto');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const connections = await GmailConnection.find();
  for (const conn of connections) {
    console.log('Email:', conn.email);
    console.log('Status:', conn.status);
    try {
      const dec = decrypt(conn.refreshTokenEnc);
      console.log('Decrypted token length:', dec.length);
    } catch (e) {
      console.log('Decryption failed:', e.message);
    }
  }
  process.exit();
});
