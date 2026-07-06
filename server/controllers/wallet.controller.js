const walletService = require('../services/walletService');
const CreditPack = require('../models/CreditPack');
const paymentService = require('../services/paymentService');
const PaymentOrder = require('../models/PaymentOrder');
const httpError = require('http-errors');

exports.getWallet = async (req, res, next) => {
  try {
    const wallet = await walletService.getWallet(req.user._id);
    res.json({ data: wallet });
  } catch (error) {
    next(error);
  }
};

exports.getPacks = async (req, res, next) => {
  try {
    const packs = await CreditPack.find({ isActive: true }).sort({ credits: 1 });
    res.json({ data: packs });
  } catch (error) {
    next(error);
  }
};

exports.purchasePack = async (req, res, next) => {
  try {
    const { packId } = req.body;
    const pack = await CreditPack.findById(packId);
    
    if (!pack) {
      throw httpError(404, 'Credit pack not found');
    }

    const { orderId, paymentSessionId } = await paymentService.createOrder({
      userId: req.user._id,
      amount: pack.price,
      orderType: 'wallet_topup',
      referenceId: pack._id,
      customerDetails: {
        name: req.user.name,
        email: req.user.email
      }
    });
    
    res.json({ data: { orderId, paymentSessionId } });
  } catch (error) {
    next(error);
  }
};

exports.getOrderStatus = async (req, res, next) => {
  try {
    const order = await PaymentOrder.findOne({ _id: req.params.orderId, userId: req.user._id });
    if (!order) {
      throw httpError(404, 'Order not found');
    }
    res.json({ data: { status: order.status } });
  } catch (error) {
    next(error);
  }
};
