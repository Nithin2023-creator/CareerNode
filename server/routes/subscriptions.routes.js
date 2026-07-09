const express = require('express');
const subscriptionsController = require('../controllers/subscriptions.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(requireAuth);

router.get('/', subscriptionsController.listSubscriptions);
router.post('/checkout', subscriptionsController.checkout);
router.get('/orders/:orderId', subscriptionsController.getOrderStatus);
router.get('/:id', subscriptionsController.getSubscription);
router.get('/:id/job-filters', subscriptionsController.getJobFilterOptions);
router.get('/:id/jobs', subscriptionsController.getSubscriptionJobs);
router.patch('/:id/match-filters', subscriptionsController.updateMatchFilters);
router.post('/:id/jobs/:jobId/bookmark', subscriptionsController.toggleJobBookmark);

module.exports = router;
