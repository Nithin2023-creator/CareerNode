const express = require('express');
const subscriptionsController = require('../controllers/subscriptions.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(requireAuth);

router.get('/', subscriptionsController.listSubscriptions);
router.post('/checkout', subscriptionsController.checkout);
router.get('/orders/:orderId', subscriptionsController.getOrderStatus);
router.get('/:id', subscriptionsController.getSubscription);

module.exports = router;
