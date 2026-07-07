const mongoose = require('mongoose');

const gmailConnectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
  },
  refreshTokenEnc: {
    type: String,
    required: true,
  },
  scope: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'revoked'],
    default: 'active',
  },
  connectedAt: {
    type: Date,
    default: Date.now,
  },
  lastUsedAt: {
    type: Date,
  },
});

const GmailConnection = mongoose.model('GmailConnection', gmailConnectionSchema);

module.exports = GmailConnection;
