 
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('../middleware/verifyToken');
const {
  submitRequest,
  saveDraft,
  getDraft,
  getStatus,
  uploadFiles
} = require('../controllers/requestController');

// הגדרת multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf/;
    const valid = allowed.test(path.extname(file.originalname).toLowerCase());
    valid ? cb(null, true) : cb(new Error('סוג קובץ לא מורשה'));
  }
});

router.post('/submit', submitRequest);
router.post('/draft', saveDraft);
router.get('/draft', getDraft);
router.get('/status', getStatus);
router.post('/upload', upload.fields([
  { name: 'studentId', maxCount: 1 },
  { name: 'fatherID', maxCount: 1 },
  { name: 'motherID', maxCount: 1 },
  { name: 'studyConfirmation', maxCount: 1 },
  { name: 'bankConfirmation', maxCount: 1 }
]), uploadFiles);

module.exports = router;