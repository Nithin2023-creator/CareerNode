const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const controller = require('../controllers/campaigns.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.use(requireAuth);

router.get('/', controller.listCampaigns);

router.post(
  '/',
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'coverLetter', maxCount: 1 },
  ]),
  controller.createCampaign
);

router.get('/:id', controller.getCampaign);
router.patch('/:id', controller.updateCampaign);
router.delete('/:id', controller.deleteCampaign);

router.get('/:id/status', controller.getCampaignStatus);
router.patch('/:id/status', controller.updateCampaignStatus);

router.get('/:id/send-checkout', controller.getSendCheckout);
router.post('/:id/checkout/confirm', controller.confirmSendCheckout);

module.exports = router;
