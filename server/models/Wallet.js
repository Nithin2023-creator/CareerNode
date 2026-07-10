const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['purchase', 'spend', 'grant'],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  credits: {
    type: Number,
    required: true,
  },
  balanceAfter: {
    type: Number,
    required: true,
  },
  source: {
    type: String,
    enum: ['job-finder', 'cold-mailer', 'membership', 'resume-maker', 'signup', 'cashfree', 'admin', 'system'],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  balance: {
    type: Number,
    default: 0,
    min: 0,
  },
  transactions: [transactionSchema],
});

module.exports = mongoose.model('Wallet', walletSchema);
