const subscriptionService = require('../services/subscriptionService');

exports.listSubscriptions = async (req, res, next) => {
  try {
    const subs = await subscriptionService.listSubscriptions(req.user._id);
    res.json({ data: subs });
  } catch (error) {
    next(error);
  }
};

exports.getSubscription = async (req, res, next) => {
  try {
    const sub = await subscriptionService.getSubscription(req.user._id, req.params.id);
    res.json({ data: sub });
  } catch (error) {
    next(error);
  }
};

exports.checkout = async (req, res, next) => {
  try {
    const { cartItems, paymentMethod } = req.body;
    const result = await subscriptionService.checkout(req.user, cartItems, paymentMethod);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};

exports.getOrderStatus = async (req, res, next) => {
  try {
    const PaymentOrder = require('../models/PaymentOrder');
    const order = await PaymentOrder.findOne({ _id: req.params.orderId, userId: req.user._id });
    if (!order) throw require('http-errors')(404, 'Order not found');
    res.json({ data: { status: order.status } });
  } catch (error) {
    next(error);
  }
};
