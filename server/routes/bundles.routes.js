const express = require('express');
const bundlesController = require('../controllers/bundles.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', bundlesController.listBundles);
router.get('/purchased', requireAuth, bundlesController.listPurchasedBundles);
router.get('/:id', bundlesController.getBundle);
router.get('/:id/recipients', requireAuth, bundlesController.getBundleRecipients);
router.post('/:id/purchase', requireAuth, bundlesController.purchaseBundle);
router.get('/orders/:orderId', requireAuth, bundlesController.getOrderStatus);

module.exports = router;
