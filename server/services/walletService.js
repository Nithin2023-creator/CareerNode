const Wallet = require('../models/Wallet');
const httpError = require('http-errors');

const getWalletDocument = async (userId) => {
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    wallet = new Wallet({ userId, balance: 0, transactions: [] });
    await wallet.save();
  }
  return wallet;
};

exports.getWallet = async (userId) => {
  const wallet = await getWalletDocument(userId);
  // Sort transactions by date descending
  wallet.transactions.sort((a, b) => b.date - a.date);
  return wallet;
};

exports.addCredits = async (userId, amount, description, source) => {
  const wallet = await getWalletDocument(userId);
  
  const updated = await Wallet.findOneAndUpdate(
    { userId },
    {
      $inc: { balance: amount },
      $push: {
        transactions: {
          type: 'purchase',
          description,
          credits: amount,
          balanceAfter: wallet.balance + amount, // note: slight race condition on balanceAfter in array, but balance itself is atomic
          source,
          date: new Date()
        }
      }
    },
    { new: true, upsert: true }
  );
  
  return updated;
};

exports.grantCredits = async (userId, amount, description, source = 'signup') => {
  const wallet = await getWalletDocument(userId);
  
  const updated = await Wallet.findOneAndUpdate(
    { userId },
    {
      $inc: { balance: amount },
      $push: {
        transactions: {
          type: 'grant',
          description,
          credits: amount,
          balanceAfter: wallet.balance + amount,
          source,
          date: new Date()
        }
      }
    },
    { new: true, upsert: true }
  );
  
  return updated;
};

exports.spendCredits = async (userId, amount, description, source) => {
  const wallet = await getWalletDocument(userId);
  
  const updated = await Wallet.findOneAndUpdate(
    { 
      userId,
      balance: { $gte: amount } // ensure sufficient funds
    },
    {
      $inc: { balance: -amount },
      $push: {
        transactions: {
          type: 'spend',
          description,
          credits: amount,
          balanceAfter: wallet.balance - amount,
          source,
          date: new Date()
        }
      }
    },
    { new: true }
  );

  if (!updated) {
    throw httpError(400, 'Insufficient credits');
  }

  return updated;
};
