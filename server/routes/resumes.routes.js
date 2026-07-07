const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { requireAuth } = require('../middleware/auth.middleware');
const resumesController = require('../controllers/resumes.controller');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.use(requireAuth);

router.get('/', resumesController.listResumes);
router.post('/', resumesController.createResume);
router.get('/:id', resumesController.getResume);
router.put('/:id', resumesController.updateResume);
router.delete('/:id', resumesController.deleteResume);

router.post('/tailor', upload.single('resumeFile'), resumesController.tailorResume);
router.post('/score', resumesController.scoreResume);
router.post('/exports', resumesController.exportResume);

module.exports = router;
