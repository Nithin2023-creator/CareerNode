const express = require('express');
const walletController = require('../controllers/wallet.controller');

const router = express.Router();

router.get('/', walletController.getWallet);
router.get('/packs', walletController.getPacks);
router.post('/purchase', walletController.purchasePack);

module.exports = router;
