const express = require('express');
const router = express.Router();
const { sendOtp, register, login, loginWithOtp } = require('../controllers/authController');

router.post('/send-otp', sendOtp);       // Send OTP to email
router.post('/register', register);       // Register user with OTP
router.post('/login', login);             // Password login
router.post('/login-otp', loginWithOtp);  // OTP login (passwordless)

module.exports = router;
