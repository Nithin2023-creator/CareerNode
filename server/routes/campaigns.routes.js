const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const controller = require('../controllers/campaigns.controller');

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

module.exports = router;
