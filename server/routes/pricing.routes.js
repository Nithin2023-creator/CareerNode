const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth.middleware');
const pricingController = require('../controllers/pricing.controller');

router.get('/', pricingController.getCatalog);
router.post('/:actionId/checkout', requireAuth, pricingController.checkoutAction);

module.exports = router;
