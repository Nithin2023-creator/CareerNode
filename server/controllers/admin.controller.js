const Company = require('../models/Company');
const Bundle = require('../models/Bundle');
const CreditPack = require('../models/CreditPack');
const MembershipPlan = require('../models/MembershipPlan');
const User = require('../models/User');
const WaitlistEntry = require('../models/WaitlistEntry');
const BundlePurchase = require('../models/BundlePurchase');
const Wallet = require('../models/Wallet');
const JobListing = require('../models/JobListing');
const scraperService = require('../services/scraper/scraperService');

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

exports.scrapeCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    // Trigger scraper
    const result = await scraperService.scrapeCompany({
      careersPageUrl: company.careersPageUrl,
      companyName: company.name
    });

    let jobsSaved = 0;
    if (result.jobs && Array.isArray(result.jobs)) {
      for (const job of result.jobs) {
        // Map 'entry' -> 'Entry-Level', 'mid' -> 'Mid-Level', 'senior' -> 'Senior', etc.
        let expLevel = 'Mid-Level';
        if (job.experienceLevel) {
          const lowerLevel = job.experienceLevel.toLowerCase();
          if (lowerLevel.includes('entry')) expLevel = 'Entry-Level';
          else if (lowerLevel.includes('senior')) expLevel = 'Senior';
          else if (lowerLevel.includes('staff') || lowerLevel.includes('principal')) expLevel = 'Staff/Principal';
          else if (lowerLevel.includes('manager') || lowerLevel.includes('director')) expLevel = 'Manager/Director';
        }

        try {
          await JobListing.findOneAndUpdate(
            { companyId: company._id, url: job.url },
            {
              title: job.title,
              location: job.location || 'Not specified',
              experienceLevel: expLevel,
              tags: job.tags || [],
              sourceType: job.sourceType || 'generic',
              atsProvider: job.atsProvider || null,
              scrapedAt: job.scrapedAt || new Date(),
            },
            { upsert: true, new: true }
          );
          jobsSaved++;
        } catch (err) {
          console.error(`Failed to upsert job ${job.url}:`, err.message);
        }
      }
    }

    const openRoles = await JobListing.countDocuments({ companyId: company._id });

    company.lastScrapedAt = new Date();
    company.openRoles = openRoles;
    await company.save();

    // Make sure we pass back `stats` inside `data` if we want `res.stats` to unpack cleanly.
    res.json({ data: { stats: { totalJobs: openRoles }, jobsSaved } });
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
