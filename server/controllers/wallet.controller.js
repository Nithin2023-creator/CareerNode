const walletService = require('../services/walletService');
const creditPacks = require('../config/creditPacks');
const httpError = require('http-errors');

exports.getWallet = async (req, res, next) => {
  try {
    const wallet = await walletService.getWallet();
    res.json({ data: wallet });
  } catch (error) {
    next(error);
  }
};

exports.getPacks = async (req, res, next) => {
  try {
    res.json({ data: creditPacks });
  } catch (error) {
    next(error);
  }
};

exports.purchasePack = async (req, res, next) => {
  try {
    const { packId } = req.body;
    const pack = creditPacks.find(p => p.id === packId);
    
    if (!pack) {
      throw httpError(404, 'Credit pack not found');
    }

    // In a real app, charge the credit card here via Stripe/Razorpay
    // We assume payment was successful for this mock
    
    const wallet = await walletService.addCredits(
      pack.credits, 
      `Purchased ${pack.name}`, 
      'job-finder' // or cold-mailer, it's shared anyway
    );
    
    res.json({ data: wallet });
  } catch (error) {
    next(error);
  }
};
