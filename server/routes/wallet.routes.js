const express = require('express');
const walletController = require('../controllers/wallet.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', requireAuth, walletController.getWallet);
router.get('/packs', walletController.getPacks);
router.post('/purchase', requireAuth, walletController.purchasePack);
router.get('/orders/:orderId', requireAuth, walletController.getOrderStatus);

module.exports = router;
