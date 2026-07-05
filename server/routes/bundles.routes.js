const express = require('express');
const bundlesController = require('../controllers/bundles.controller');

const router = express.Router();

router.get('/', bundlesController.listBundles);
router.get('/purchased', bundlesController.listPurchasedBundles);
router.get('/:id', bundlesController.getBundle);
router.get('/:id/recipients', bundlesController.getBundleRecipients);
router.post('/:id/purchase', bundlesController.purchaseBundle);

module.exports = router;
