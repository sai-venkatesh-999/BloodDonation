const express = require('express');
const router = express.Router();
const { createRequest, getMyRequests } = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createRequest);   // ✅ POST /api/requests
router.get('/mine', protect, getMyRequests); // ✅ GET /api/requests/mine

module.exports = router;
