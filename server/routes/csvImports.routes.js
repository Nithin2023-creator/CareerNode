const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const controller = require('../controllers/csvImports.controller');

router.post('/', upload.single('csvFile'), controller.importCsv);
router.post('/clean-rows', controller.cleanRows);

module.exports = router;
