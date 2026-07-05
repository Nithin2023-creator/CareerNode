const Wallet = require('../models/Wallet');
const httpError = require('http-errors');

// Fixed ID since we don't have users, singleton pattern
const WALLET_ID = '60d5ecb54cb9a1001f5c5d00'; // Just a valid hex objectid

const getWalletDocument = async () => {
  let wallet = await Wallet.findById(WALLET_ID);
  if (!wallet) {
    wallet = new Wallet({ _id: WALLET_ID, balance: 0, transactions: [] });
    await wallet.save();
  }
  return wallet;
};

exports.getWallet = async () => {
  const wallet = await getWalletDocument();
  // Sort transactions by date descending
  wallet.transactions.sort((a, b) => b.date - a.date);
  return wallet;
};

exports.addCredits = async (amount, description, source) => {
  const wallet = await getWalletDocument();
  
  const updated = await Wallet.findOneAndUpdate(
    { _id: WALLET_ID },
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
    { new: true }
  );
  
  return updated;
};

exports.spendCredits = async (amount, description, source) => {
  const wallet = await getWalletDocument();
  
  const updated = await Wallet.findOneAndUpdate(
    { 
      _id: WALLET_ID,
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
