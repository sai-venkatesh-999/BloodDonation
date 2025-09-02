const express = require('express');
const router = express.Router();
const { getPendingRequests, approveRequest, rejectRequest } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect, admin);
router.get('/requests', getPendingRequests);
router.put('/requests/:id/approve', approveRequest);
router.put('/requests/:id/reject', rejectRequest);

module.exports = router;
