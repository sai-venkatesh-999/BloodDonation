const express = require('express');
const router = express.Router();
const { searchDonors, registerAsDonor, getDonorProfile, updateDonorStatus } = require('../controllers/donorController');
const { protect } = require('../middleware/authMiddleware');

router.get('/search', protect, searchDonors);
router.post('/register', protect, registerAsDonor);
router.get('/profile', protect, getDonorProfile);
router.put('/status', protect, updateDonorStatus);

module.exports = router;
