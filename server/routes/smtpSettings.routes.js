const express = require('express');
const router = express.Router();
const controller = require('../controllers/smtpSettings.controller');

router.get('/', controller.getSmtpSettings);
router.post('/test-connection', controller.testConnection);

module.exports = router;
