const Subscription = require('../models/Subscription');
const Company = require('../models/Company');
const JobListing = require('../models/JobListing');
const walletService = require('./walletService');
const paymentService = require('./paymentService');
const membershipService = require('./membershipService');
const httpError = require('http-errors');

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

const mapSubscription = (sub, company, newMatchesCount) => ({
  id: sub._id.toString(),
  companyId: sub.companyId.toString(),
  status: sub.status,
  purchasedAt: sub.purchasedAt,
  expiresAt: sub.expiresAt,
  paymentMethod: sub.paymentMethod,
  pricePaid: sub.pricePaid,
  newMatchesCount: newMatchesCount ?? sub.newMatchesCount,
  lastScanAt: sub.lastScanAt,
  matchFilters: sub.matchFilters || null,
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

  // One batch query across all of the user's subscribed companies (instead of a
  // per-subscription count query in a loop) to compute "new since last scan" counts.
  const jobs = await JobListing.find({ companyId: { $in: companyIds } })
    .select('companyId scrapedAt')
    .lean();
  const jobsByCompany = new Map();
  for (const job of jobs) {
    const key = job.companyId.toString();
    if (!jobsByCompany.has(key)) jobsByCompany.set(key, []);
    jobsByCompany.get(key).push(job.scrapedAt);
  }

  return subs.map((sub) => {
    const since = sub.lastScanAt || sub.purchasedAt;
    const companyJobs = jobsByCompany.get(sub.companyId.toString()) || [];
    const newMatchesCount = companyJobs.filter((scrapedAt) => new Date(scrapedAt) > new Date(since)).length;
    return mapSubscription(sub, companyMap.get(sub.companyId.toString()), newMatchesCount);
  });
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

async function loadOwnedSubscription(userId, subscriptionId) {
  const sub = await Subscription.findOne({ _id: subscriptionId, userId });
  if (!sub) throw httpError(404, 'Subscription not found');
  return sub;
}

// Distinct values actually present in the DB for this company, so the frontend can offer
// select dropdowns where every option is guaranteed to match something - no free text, no
// AI, at query time.
exports.getJobFilterOptions = async (userId, subscriptionId) => {
  const sub = await loadOwnedSubscription(userId, subscriptionId);

  const [locations, experienceLevels] = await Promise.all([
    JobListing.distinct('location', { companyId: sub.companyId }),
    JobListing.distinct('experienceLevel', { companyId: sub.companyId }),
  ]);

  return {
    locations: locations.filter(Boolean).sort(),
    experienceLevels: experienceLevels.filter(Boolean).sort(),
  };
};

// Plain exact-match query against the stored, AI-cleaned parameters - no AI, no joins.
exports.getJobsForSubscription = async (userId, subscriptionId, { location, experienceLevel } = {}) => {
  const sub = await loadOwnedSubscription(userId, subscriptionId);

  const filter = { companyId: sub.companyId };
  if (location) filter.location = location;
  if (experienceLevel) filter.experienceLevel = experienceLevel;

  const jobs = await JobListing.find(filter).sort({ scrapedAt: -1 }).lean();

  const since = sub.lastScanAt || sub.purchasedAt;
  const bookmarkedIds = new Set((sub.bookmarkedJobs || []).map((id) => id.toString()));

  const mapped = jobs.map((job) => ({
    id: job._id.toString(),
    title: job.title,
    url: job.url,
    location: job.location,
    experienceLevel: job.experienceLevel,
    employmentType: job.employmentType,
    description: job.description,
    tags: job.tags,
    scrapedAt: job.scrapedAt,
    isNew: since ? new Date(job.scrapedAt) > new Date(since) : true,
    isBookmarked: bookmarkedIds.has(job._id.toString()),
  }));

  sub.lastScanAt = new Date();
  await sub.save();

  return mapped;
};

exports.updateMatchFilters = async (userId, subscriptionId, { location, experienceLevel } = {}) => {
  const sub = await Subscription.findOneAndUpdate(
    { _id: subscriptionId, userId },
    { $set: { matchFilters: { location: location || null, experienceLevel: experienceLevel || null } } },
    { new: true }
  );
  if (!sub) throw httpError(404, 'Subscription not found');
  return { matchFilters: sub.matchFilters };
};

exports.toggleBookmark = async (userId, subscriptionId, jobId) => {
  const sub = await loadOwnedSubscription(userId, subscriptionId);

  const alreadyBookmarked = sub.bookmarkedJobs.some((id) => id.toString() === jobId.toString());
  if (alreadyBookmarked) {
    sub.bookmarkedJobs = sub.bookmarkedJobs.filter((id) => id.toString() !== jobId.toString());
  } else {
    sub.bookmarkedJobs.push(jobId);
  }
  await sub.save();

  return { isBookmarked: !alreadyBookmarked };
};
