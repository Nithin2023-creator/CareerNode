const Bundle = require('../models/Bundle');
const BundlePurchase = require('../models/BundlePurchase');
const walletService = require('./walletService');
const httpError = require('http-errors');

exports.listBundles = async () => {
  const bundles = await Bundle.find().select('-recipients').lean();
  const purchases = await BundlePurchase.find().select('bundleId').lean();
  
  const purchasedIds = new Set(purchases.map(p => p.bundleId.toString()));
  
  return bundles.map(b => ({
    ...b,
    isOwned: purchasedIds.has(b._id.toString())
  }));
};

exports.getBundle = async (id) => {
  const bundle = await Bundle.findById(id).select('-recipients').lean();
  if (!bundle) {
    throw httpError(404, 'Bundle not found');
  }
  
  const purchase = await BundlePurchase.findOne({ bundleId: id }).lean();
  bundle.isOwned = !!purchase;
  return bundle;
};

exports.listPurchasedBundles = async () => {
  const purchases = await BundlePurchase.find().lean();
  const purchasedBundleIds = purchases.map(p => p.bundleId);
  
  const bundles = await Bundle.find({ _id: { $in: purchasedBundleIds } }).select('-recipients').lean();
  
  return bundles.map(b => {
    const purchaseInfo = purchases.find(p => p.bundleId.toString() === b._id.toString());
    return {
      ...b,
      isOwned: true,
      purchasedAt: purchaseInfo.purchasedAt
    };
  });
};

exports.getBundleRecipients = async (id) => {
  const purchase = await BundlePurchase.findOne({ bundleId: id });
  if (!purchase) {
    throw httpError(403, 'You must purchase this bundle to view its recipients');
  }

  const bundle = await Bundle.findById(id).select('recipients').lean();
  if (!bundle) {
    throw httpError(404, 'Bundle not found');
  }
  return bundle.recipients;
};

exports.purchaseBundle = async (id, paymentMethod) => {
  const bundle = await Bundle.findById(id).select('-recipients').lean();
  if (!bundle) {
    throw httpError(404, 'Bundle not found');
  }

  const existingPurchase = await BundlePurchase.findOne({ bundleId: id });
  if (existingPurchase) {
    throw httpError(400, 'Bundle already purchased');
  }

  if (paymentMethod === 'credits') {
    await walletService.spendCredits(bundle.creditCost, `Purchased bundle: ${bundle.name}`, 'cold-mailer');
  }
  // Else we assume paymentMethod === 'alacarte' was processed by a mock payment gateway

  const pricePaid = paymentMethod === 'credits' ? bundle.creditCost : bundle.alaCartePrice;

  const purchase = new BundlePurchase({
    bundleId: id,
    paymentMethod,
    pricePaid,
  });

  await purchase.save();
  return { success: true, message: 'Bundle purchased successfully' };
};
