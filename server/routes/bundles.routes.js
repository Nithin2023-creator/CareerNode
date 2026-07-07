const express = require('express');
const bundlesController = require('../controllers/bundles.controller');
const { requireAuth, optionalAuth } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', optionalAuth, bundlesController.listBundles);
router.get('/purchased', requireAuth, bundlesController.listPurchasedBundles);
router.get('/orders/:orderId', requireAuth, bundlesController.getOrderStatus);
router.get('/:id', optionalAuth, bundlesController.getBundle);
router.get('/:id/recipients', requireAuth, bundlesController.getBundleRecipients);
router.post('/:id/purchase', requireAuth, bundlesController.purchaseBundle);

module.exports = router;
