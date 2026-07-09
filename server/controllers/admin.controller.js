const Company = require('../models/Company');
const JobListing = require('../models/JobListing');
const ScrapeRun = require('../models/ScrapeRun');
const Bundle = require('../models/Bundle');
const CreditPack = require('../models/CreditPack');
const MembershipPlan = require('../models/MembershipPlan');
const User = require('../models/User');
const WaitlistEntry = require('../models/WaitlistEntry');
const BundlePurchase = require('../models/BundlePurchase');
const Wallet = require('../models/Wallet');
const scrapeRunner = require('../services/scraper/scrapeRunner');
const scrapeLogBus = require('../services/scraper/scrapeLogBus');

// Stats
exports.getStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalWaitlist,
      totalCompanies,
      totalBundles,
      totalPurchases
    ] = await Promise.all([
      User.countDocuments(),
      WaitlistEntry.countDocuments(),
      Company.countDocuments(),
      Bundle.countDocuments(),
      BundlePurchase.countDocuments()
    ]);

    res.json({
      data: {
        totalUsers,
        totalWaitlist,
        totalCompanies,
        totalBundles,
        totalPurchases
      }
    });
  } catch (error) {
    next(error);
  }
};

// Companies CRUD
exports.listCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    res.json({ data: companies });
  } catch (error) {
    next(error);
  }
};

exports.createCompany = async (req, res, next) => {
  try {
    const company = await Company.create(req.body);
    res.status(201).json({ data: company });
  } catch (error) {
    next(error);
  }
};

exports.updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.json({ data: company });
  } catch (error) {
    next(error);
  }
};

exports.deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Kicks off a background scrape run and returns immediately - the actual crawl runs
// detached (see scrapeRunner.js), so this no longer blocks/times out the HTTP request.
// Body: { force?: boolean } - bypasses the "already scanned today" skip rule.
exports.scrapeCompany = async (req, res, next) => {
  try {
    const result = await scrapeRunner.startScrapeRun({
      companyId: req.params.id,
      trigger: 'manual',
      force: !!req.body?.force,
    });
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};

exports.getLatestScrapeRun = async (req, res, next) => {
  try {
    const run = await scrapeRunner.getLatestRun(req.params.id);
    res.json({ data: run });
  } catch (error) {
    next(error);
  }
};

exports.getCompanyJobs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      JobListing.find({ companyId: req.params.id })
        .sort({ scrapedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      JobListing.countDocuments({ companyId: req.params.id })
    ]);

    res.json({
      data: {
        jobs,
        pagination: { page, limit, total }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getCompanyLinkAudit = async (req, res, next) => {
  try {
    const [company, run] = await Promise.all([
      Company.findById(req.params.id).select('name').lean(),
      ScrapeRun.findOne({
        companyId: req.params.id,
        status: 'success',
      })
        .sort({ finishedAt: -1 })
        .select('stats linkAudit finishedAt')
        .lean(),
    ]);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json({
      data: {
        companyName: company.name,
        runId: run?._id ?? null,
        finishedAt: run?.finishedAt ?? null,
        stats: run?.stats ?? null,
        linkAudit: run?.linkAudit ?? null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// SSE stream of a company's current/most recent scrape run - replays whatever's already
// buffered, then tails live lines, closing when the run finishes. Scraping-only logs, per
// your call, not the whole backend's stdout.
exports.streamScrapeLogs = async (req, res, next) => {
  try {
    const companyId = req.params.id;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const sendLine = (line) => res.write(`data: ${JSON.stringify({ line })}\n\n`);

    for (const line of scrapeLogBus.getBuffered(companyId)) {
      sendLine(line);
    }

    if (!scrapeRunner.isRunning(companyId)) {
      res.write(`event: end\ndata: {}\n\n`);
      return res.end();
    }

    const unsubscribeLine = scrapeLogBus.subscribe(companyId, sendLine);
    const unsubscribeEnd = scrapeLogBus.onEnd(companyId, () => {
      res.write(`event: end\ndata: {}\n\n`);
      res.end();
    });

    req.on('close', () => {
      unsubscribeLine();
      unsubscribeEnd();
    });
  } catch (error) {
    next(error);
  }
};

// Bundles CRUD
exports.listBundles = async (req, res, next) => {
  try {
    const bundles = await Bundle.find().sort({ createdAt: -1 });
    res.json({ data: bundles });
  } catch (error) {
    next(error);
  }
};

exports.createBundle = async (req, res, next) => {
  try {
    const bundle = await Bundle.create(req.body);
    res.status(201).json({ data: bundle });
  } catch (error) {
    next(error);
  }
};

exports.updateBundle = async (req, res, next) => {
  try {
    const bundle = await Bundle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!bundle) return res.status(404).json({ message: 'Bundle not found' });
    res.json({ data: bundle });
  } catch (error) {
    next(error);
  }
};

exports.deleteBundle = async (req, res, next) => {
  try {
    const bundle = await Bundle.findByIdAndDelete(req.params.id);
    if (!bundle) return res.status(404).json({ message: 'Bundle not found' });
    res.json({ message: 'Bundle deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.uploadBundleContacts = async (req, res, next) => {
  try {
    // Expected req.body.contacts to be an array of parsed CSV rows
    const { contacts } = req.body;
    if (!contacts || !Array.isArray(contacts)) {
      return res.status(400).json({ message: 'Invalid contacts payload' });
    }

    const bundle = await Bundle.findById(req.params.id);
    if (!bundle) return res.status(404).json({ message: 'Bundle not found' });

    bundle.recipients.push(...contacts);
    bundle.contactCount = bundle.recipients.length;
    await bundle.save();

    res.json({ data: bundle });
  } catch (error) {
    next(error);
  }
};

// Credit Packs CRUD
exports.listCreditPacks = async (req, res, next) => {
  try {
    const packs = await CreditPack.find().sort({ credits: 1 });
    res.json({ data: packs });
  } catch (error) {
    next(error);
  }
};

exports.createCreditPack = async (req, res, next) => {
  try {
    const pack = await CreditPack.create(req.body);
    res.status(201).json({ data: pack });
  } catch (error) {
    next(error);
  }
};

exports.updateCreditPack = async (req, res, next) => {
  try {
    const pack = await CreditPack.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!pack) return res.status(404).json({ message: 'Credit Pack not found' });
    res.json({ data: pack });
  } catch (error) {
    next(error);
  }
};

exports.deleteCreditPack = async (req, res, next) => {
  try {
    const pack = await CreditPack.findByIdAndDelete(req.params.id);
    if (!pack) return res.status(404).json({ message: 'Credit Pack not found' });
    res.json({ message: 'Credit Pack deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Membership Plans CRUD
exports.listMembershipPlans = async (req, res, next) => {
  try {
    const plans = await MembershipPlan.find().sort({ monthlyPrice: 1 });
    res.json({ data: plans });
  } catch (error) {
    next(error);
  }
};

exports.createMembershipPlan = async (req, res, next) => {
  try {
    const plan = await MembershipPlan.create(req.body);
    res.status(201).json({ data: plan });
  } catch (error) {
    next(error);
  }
};

exports.updateMembershipPlan = async (req, res, next) => {
  try {
    const plan = await MembershipPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!plan) return res.status(404).json({ message: 'Membership Plan not found' });
    res.json({ data: plan });
  } catch (error) {
    next(error);
  }
};

exports.deleteMembershipPlan = async (req, res, next) => {
  try {
    const plan = await MembershipPlan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Membership Plan not found' });
    res.json({ message: 'Membership Plan deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Users
exports.listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json({ data: users });
  } catch (error) {
    next(error);
  }
};

exports.toggleAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Prevent removing own admin status
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot revoke your own admin access' });
    }

    user.isAdmin = !user.isAdmin;
    await user.save();
    
    const { passwordHash, ...safeUser } = user.toObject();
    res.json({ data: safeUser });
  } catch (error) {
    next(error);
  }
};

// Waitlist
exports.listWaitlist = async (req, res, next) => {
  try {
    const entries = await WaitlistEntry.find().sort({ createdAt: -1 });
    res.json({ data: entries });
  } catch (error) {
    next(error);
  }
};

// Transactions
exports.listTransactions = async (req, res, next) => {
  try {
    // Get all wallet transactions across all wallets, plus bundle purchases
    const [wallets, bundlePurchases] = await Promise.all([
      Wallet.find().populate('userId', 'email name').lean(),
      BundlePurchase.find().populate('bundleId', 'name').populate('userId', 'email name').sort({ purchasedAt: -1 }).lean()
    ]);
    
    let walletTransactions = [];
    wallets.forEach(w => {
      if (w.transactions) {
        const userTxs = w.transactions.map(t => ({
          ...t,
          userId: w.userId, // Populated object with email/name
          walletId: w._id
        }));
        walletTransactions = walletTransactions.concat(userTxs);
      }
    });
    
    // Sort wallet transactions
    walletTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      data: {
        walletTransactions,
        bundlePurchases
      }
    });
  } catch (error) {
    next(error);
  }
};
