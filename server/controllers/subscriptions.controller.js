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

exports.getJobFilterOptions = async (req, res, next) => {
  try {
    const options = await subscriptionService.getJobFilterOptions(req.user._id, req.params.id);
    res.json({ data: options });
  } catch (error) {
    next(error);
  }
};

// Accepts ?location=&experienceLevel= query params for the exact-match filter.
exports.getSubscriptionJobs = async (req, res, next) => {
  try {
    const { location, experienceLevel } = req.query;
    const jobs = await subscriptionService.getJobsForSubscription(req.user._id, req.params.id, {
      location,
      experienceLevel,
    });
    res.json({ data: jobs });
  } catch (error) {
    next(error);
  }
};

exports.updateMatchFilters = async (req, res, next) => {
  try {
    const { location, experienceLevel } = req.body;
    const result = await subscriptionService.updateMatchFilters(req.user._id, req.params.id, {
      location,
      experienceLevel,
    });
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};

exports.toggleJobBookmark = async (req, res, next) => {
  try {
    const result = await subscriptionService.toggleBookmark(req.user._id, req.params.id, req.params.jobId);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};
