 
const express = require('express');
const router = express.Router();
const {
  getRequests,
  getRequestById,
  updateStatus,
  getStats
} = require('../controllers/adminController');

router.get('/requests', getRequests);
router.get('/requests/:id', getRequestById);
router.patch('/requests/:id/status', updateStatus);
router.get('/stats', getStats);

module.exports = router;