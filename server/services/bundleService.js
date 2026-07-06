const Bundle = require('../models/Bundle');
const BundlePurchase = require('../models/BundlePurchase');
const walletService = require('./walletService');
const paymentService = require('./paymentService');
const UserMembership = require('../models/UserMembership');
const httpError = require('http-errors');

exports.listBundles = async (userId) => {
  const bundles = await Bundle.find().select('-recipients').lean();
  const purchases = await BundlePurchase.find({ userId }).select('bundleId').lean();

  const purchasedIds = new Set(purchases.map((p) => p.bundleId.toString()));

  return bundles.map((b) => ({
    ...b,
    isOwned: purchasedIds.has(b._id.toString()),
  }));
};

exports.getBundle = async (userId, id) => {
  const bundle = await Bundle.findById(id).select('-recipients').lean();
  if (!bundle) {
    throw httpError(404, 'Bundle not found');
  }

  if (userId) {
    const purchase = await BundlePurchase.findOne({ bundleId: id, userId }).lean();
    bundle.isOwned = !!purchase;
  } else {
    bundle.isOwned = false;
  }
  return bundle;
};

exports.listPurchasedBundles = async (userId) => {
  const purchases = await BundlePurchase.find({ userId }).lean();
  const purchasedBundleIds = purchases.map((p) => p.bundleId);

  const bundles = await Bundle.find({ _id: { $in: purchasedBundleIds } }).select('-recipients').lean();

  return bundles.map((b) => {
    const purchaseInfo = purchases.find((p) => p.bundleId.toString() === b._id.toString());
    return {
      ...b,
      isOwned: true,
      purchasedAt: purchaseInfo.purchasedAt,
    };
  });
};

exports.getBundleRecipients = async (userId, id) => {
  const purchase = await BundlePurchase.findOne({ bundleId: id, userId });
  if (!purchase) {
    throw httpError(403, 'You must purchase this bundle to view its recipients');
  }

  const bundle = await Bundle.findById(id).select('recipients').lean();
  if (!bundle) {
    throw httpError(404, 'Bundle not found');
  }
  return bundle.recipients;
};

exports.purchaseBundle = async (user, id, paymentMethod) => {
  const bundle = await Bundle.findById(id).select('-recipients').lean();
  if (!bundle) {
    throw httpError(404, 'Bundle not found');
  }

  const existingPurchase = await BundlePurchase.findOne({ bundleId: id, userId: user._id });
  if (existingPurchase) {
    throw httpError(400, 'Bundle already purchased');
  }

  if (paymentMethod === 'credits') {
    await walletService.spendCredits(user._id, bundle.creditCost, `Purchased bundle: ${bundle.name}`, 'cold-mailer');
    const purchase = new BundlePurchase({
      userId: user._id,
      bundleId: id,
      paymentMethod,
      pricePaid: bundle.creditCost,
    });
    await purchase.save();
    return { success: true, message: 'Bundle purchased successfully' };
  } else {
    // Alacarte: Create cashfree order
    // Apply membership discount if any
    let price = bundle.alaCartePrice;
    const membership = await UserMembership.findOne({ userId: user._id, status: 'active' }).populate('planId');
    if (membership && membership.planId && membership.planId.alaCarteDiscountPercent > 0) {
      price = price * (1 - membership.planId.alaCarteDiscountPercent / 100);
      price = Math.round(price * 100) / 100; // round to 2 decimals
    }

    const { orderId, paymentSessionId } = await paymentService.createOrder({
      userId: user._id,
      amount: price,
      orderType: 'bundle',
      referenceId: id,
      customerDetails: {
        name: user.name,
        email: user.email
      }
    });
    return { orderId, paymentSessionId };
  }
};
