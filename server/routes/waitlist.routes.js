const express = require('express');
const router = express.Router();
const waitlistController = require('../controllers/waitlist.controller');

router.post('/', waitlistController.joinWaitlist);
router.get('/count', waitlistController.getWaitlistCount);

module.exports = router;
