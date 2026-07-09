const express = require('express');
const adminController = require('../controllers/admin.controller');
const { requireAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes in this file are prefixed with /api/admin and protected by requireAdmin middleware
router.use(requireAdmin);

// Stats
router.get('/stats', adminController.getStats);

// Companies
router.get('/companies', adminController.listCompanies);
router.post('/companies', adminController.createCompany);
router.patch('/companies/:id', adminController.updateCompany);
router.delete('/companies/:id', adminController.deleteCompany);
router.post('/companies/:id/scrape', adminController.scrapeCompany);
router.get('/companies/:id/scrape-runs/latest', adminController.getLatestScrapeRun);
router.get('/companies/:id/scrape-logs/stream', adminController.streamScrapeLogs);
router.get('/companies/:id/jobs', adminController.getCompanyJobs);
router.get('/companies/:id/scrape-link-audit', adminController.getCompanyLinkAudit);

// Bundles
router.get('/bundles', adminController.listBundles);
router.post('/bundles', adminController.createBundle);
router.patch('/bundles/:id', adminController.updateBundle);
router.delete('/bundles/:id', adminController.deleteBundle);
router.post('/bundles/:id/upload-contacts', adminController.uploadBundleContacts);

// Credit Packs
router.get('/credit-packs', adminController.listCreditPacks);
router.post('/credit-packs', adminController.createCreditPack);
router.patch('/credit-packs/:id', adminController.updateCreditPack);
router.delete('/credit-packs/:id', adminController.deleteCreditPack);

// Membership Plans
router.get('/membership-plans', adminController.listMembershipPlans);
router.post('/membership-plans', adminController.createMembershipPlan);
router.patch('/membership-plans/:id', adminController.updateMembershipPlan);
router.delete('/membership-plans/:id', adminController.deleteMembershipPlan);

// Users
router.get('/users', adminController.listUsers);
router.patch('/users/:id/toggle-admin', adminController.toggleAdmin);

// Waitlist
router.get('/waitlist', adminController.listWaitlist);

// Transactions
router.get('/transactions', adminController.listTransactions);

module.exports = router;
