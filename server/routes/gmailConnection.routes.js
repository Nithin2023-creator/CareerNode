const express = require('express');
const router = express.Router();
const controller = require('../controllers/gmailConnection.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.use(requireAuth);

router.get('/', controller.getStatus);
router.post('/', controller.connect);
router.delete('/', controller.disconnect);
router.post('/test', controller.testConnection);

module.exports = router;
