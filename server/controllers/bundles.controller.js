const bundleService = require('../services/bundleService');

exports.listBundles = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const bundles = await bundleService.listBundles(userId);
    res.json({ data: bundles });
  } catch (error) {
    next(error);
  }
};

exports.getBundle = async (req, res, next) => {
  try {
    const bundle = await bundleService.getBundle(req.user?._id, req.params.id);
    res.json({ data: bundle });
  } catch (error) {
    next(error);
  }
};

exports.listPurchasedBundles = async (req, res, next) => {
  try {
    const bundles = await bundleService.listPurchasedBundles(req.user._id);
    res.json({ data: bundles });
  } catch (error) {
    next(error);
  }
};

exports.getBundleRecipients = async (req, res, next) => {
  try {
    const recipients = await bundleService.getBundleRecipients(req.user._id, req.params.id);
    res.json({ data: recipients });
  } catch (error) {
    next(error);
  }
};

exports.purchaseBundle = async (req, res, next) => {
  try {
    const { paymentMethod } = req.body;
    const result = await bundleService.purchaseBundle(req.user, req.params.id, paymentMethod);
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
