const bundleService = require('../services/bundleService');

exports.listBundles = async (req, res, next) => {
  try {
    const bundles = await bundleService.listBundles();
    res.json({ data: bundles });
  } catch (error) {
    next(error);
  }
};

exports.getBundle = async (req, res, next) => {
  try {
    const bundle = await bundleService.getBundle(req.params.id);
    res.json({ data: bundle });
  } catch (error) {
    next(error);
  }
};

exports.listPurchasedBundles = async (req, res, next) => {
  try {
    const bundles = await bundleService.listPurchasedBundles();
    res.json({ data: bundles });
  } catch (error) {
    next(error);
  }
};

exports.getBundleRecipients = async (req, res, next) => {
  try {
    const recipients = await bundleService.getBundleRecipients(req.params.id);
    res.json({ data: recipients });
  } catch (error) {
    next(error);
  }
};

exports.purchaseBundle = async (req, res, next) => {
  try {
    const { paymentMethod } = req.body;
    const result = await bundleService.purchaseBundle(req.params.id, paymentMethod);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};
