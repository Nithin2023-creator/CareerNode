const Subscription = require('../models/Subscription');
const Company = require('../models/Company');
const walletService = require('./walletService');
const paymentService = require('./paymentService');
const membershipService = require('./membershipService');
const httpError = require('http-errors');

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

const mapSubscription = (sub, company) => ({
  id: sub._id.toString(),
  companyId: sub.companyId.toString(),
  status: sub.status,
  purchasedAt: sub.purchasedAt,
  expiresAt: sub.expiresAt,
  paymentMethod: sub.paymentMethod,
  pricePaid: sub.pricePaid,
  newMatchesCount: sub.newMatchesCount,
  lastScanAt: sub.lastScanAt,
  company: company
    ? {
        id: company._id.toString(),
        name: company.name,
        logoUrl: company.logoUrl,
        category: company.category,
      }
    : null,
});

exports.listSubscriptions = async (userId) => {
  const subs = await Subscription.find({ userId }).sort({ purchasedAt: -1 }).lean();
  const companyIds = subs.map((s) => s.companyId);
  const companies = await Company.find({ _id: { $in: companyIds } }).lean();
  const companyMap = new Map(companies.map((c) => [c._id.toString(), c]));

  return subs.map((sub) => mapSubscription(sub, companyMap.get(sub.companyId.toString())));
};

exports.getSubscription = async (userId, subscriptionId) => {
  const sub = await Subscription.findOne({ _id: subscriptionId, userId }).lean();
  if (!sub) throw httpError(404, 'Subscription not found');

  const company = await Company.findById(sub.companyId).lean();
  return mapSubscription(sub, company);
};

exports.checkout = async (user, cartItems, paymentMethod) => {
  const userId = user._id;
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw httpError(400, 'Cart is empty');
  }

  const plan = await membershipService.getUserPlan(userId);
  const activeCount = await Subscription.countDocuments({
    userId,
    status: { $in: ['active', 'expiring'] },
  });

  const maxAllowed = plan?.maxActiveSubscriptions;
  if (maxAllowed != null && activeCount + cartItems.length > maxAllowed) {
    throw httpError(
      400,
      `Your plan allows up to ${maxAllowed} active subscription(s). Upgrade your membership to add more.`
    );
  }

  const companyIds = cartItems.map((item) => item.id || item._id);
  const companies = await Company.find({ _id: { $in: companyIds }, isActive: true });
  if (companies.length !== cartItems.length) {
    throw httpError(400, 'One or more companies are invalid or inactive');
  }

  const companyMap = new Map(companies.map((c) => [c._id.toString(), c]));

  let totalCredits = 0;
  let rawTotalCash = 0;

  for (const item of cartItems) {
    const company = companyMap.get(String(item.id || item._id));
    if (!company) throw httpError(400, 'Invalid company in cart');
    totalCredits += company.creditCost;
    rawTotalCash += company.alaCartePrice;
  }

  const discountPercent = plan?.alaCarteDiscountPercent || 0;
  const totalCash = rawTotalCash * (1 - discountPercent / 100);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + ONE_MONTH_MS);
  const created = [];

  if (paymentMethod === 'credits') {
    await walletService.spendCredits(
      userId,
      totalCredits,
      `Marketplace checkout (${cartItems.length} companies)`,
      'job-finder'
    );

    for (const item of cartItems) {
      const companyId = item.id || item._id;
      const company = companyMap.get(String(companyId));

      const existing = await Subscription.findOne({
        userId,
        companyId,
        status: { $in: ['active', 'expiring'] },
      });
      if (existing) continue;

      const sub = await Subscription.create({
        userId,
        companyId,
        status: 'active',
        paymentMethod,
        pricePaid: company.creditCost,
        purchasedAt: now,
        expiresAt,
      });

      created.push(mapSubscription(sub.toObject(), company));
    }
    return { subscriptions: created };
  } else if (paymentMethod === 'alacarte') {
    const enrichedCart = cartItems.map((item) => {
      const company = companyMap.get(String(item.id || item._id));
      const pricePaid = company
        ? company.alaCartePrice * (1 - discountPercent / 100)
        : 0;
      return {
        companyId: item.id || item._id,
        pricePaid: Math.round(pricePaid * 100) / 100,
      };
    });

    const { orderId, paymentSessionId } = await paymentService.createOrder({
      userId,
      amount: totalCash,
      orderType: 'job_finder_checkout',
      referenceId: 'cart',
      cartItems: enrichedCart,
      customerDetails: {
        name: user.name,
        email: user.email,
      },
    });
    return { orderId, paymentSessionId };
  } else {
    throw httpError(400, 'Invalid payment method');
  }
};
