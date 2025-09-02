const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Otp = require('../models/Otp');

require('dotenv').config();

// ✅ Nodemailer setup with Gmail App Password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ====================== GENERATE OTP ======================
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ====================== SEND OTP ======================
exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required.' });

  try {
    // Prevent spamming OTPs: check if recent OTP exists
    const recentOtp = await Otp.findOne({ email, expires_at: { $gt: new Date() } });
    if (recentOtp) return res.status(429).json({ message: 'OTP already sent. Wait a few minutes.' });

    // Generate new OTP
    const otp = generateOTP();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

    // Save OTP first
    await Otp.create({ email, otp, expires_at });

    try {
      // Send email
      await transporter.sendMail({
        from: `"DonorHub App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your Verification Code for DonorHub',
        html: `<b>Your OTP is: ${otp}</b><p>Valid for 10 minutes.</p>`,
      });

      res.status(200).json({ message: 'OTP sent to your email address.' });
    } catch (emailErr) {
      console.error('❌ Email sending failed:', emailErr);
      // Delete OTP if email fails
      await Otp.deleteOne({ email, otp });
      res.status(500).json({ message: 'Failed to send OTP email. Try again later.' });
    }
  } catch (err) {
    console.error('❌ Error generating OTP:', err);
    res.status(500).json({ message: 'Server error during OTP generation.' });
  }
};

// ====================== REGISTER ======================
exports.register = async (req, res) => {
  const { email, otp, password, fullName, phoneNumber, address, bloodGroup } = req.body;
  if (!otp) return res.status(400).json({ message: 'OTP is required.' });

  try {
    // Validate OTP
    const otpDoc = await Otp.findOne({ email, otp, expires_at: { $gt: new Date() } });
    if (!otpDoc) return res.status(400).json({ message: 'Invalid or expired OTP.' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User with this email already exists.' });

    // Hash password if provided
    let hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const role = email === 'admin@app.com' ? 'admin' : 'user';

    await User.create({
      email,
      password: hashedPassword,
      full_name: fullName,
      phone_number: phoneNumber,
      address,
      blood_group: bloodGroup,
      role,
    });

    await Otp.deleteMany({ email }); // cleanup used OTP
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    console.error('❌ Error during registration:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// ====================== PASSWORD LOGIN ======================
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials.' });

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id.toString(),
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phone_number,
        address: user.address,
        bloodGroup: user.blood_group,
      },
    });
  } catch (err) {
    console.error('❌ Error during login:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ====================== OTP LOGIN (PASSWORDLESS) ======================
exports.loginWithOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required.' });

  try {
    const otpDoc = await Otp.findOne({ email, otp, expires_at: { $gt: new Date() } });
    if (!otpDoc) return res.status(400).json({ message: 'Invalid or expired OTP.' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const token = jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    await Otp.deleteMany({ email }); // cleanup used OTP

    res.json({
      token,
      user: {
        id: user._id.toString(),
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phone_number,
        address: user.address,
        bloodGroup: user.blood_group,
      },
    });
  } catch (err) {
    console.error('❌ Error during OTP login:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};
