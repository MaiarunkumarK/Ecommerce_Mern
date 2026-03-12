// controllers/authController.js - User Authentication Logic

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// ─── Generate JWT Token ────────────────────────────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// ─── POST /api/auth/register ───────────────────────────────────────────────────
const register = async (req, res) => {
  // Validate incoming request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, email, password, phone } = req.body;

  try {
    // Check if email already registered
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    // Hash password with bcrypt (12 rounds = secure and reasonable speed)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert new user
    const user = await User.create({ name, email, password: hashedPassword, phone: phone || null });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

// ─── POST /api/auth/login ──────────────────────────────────────────────────────
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated.' });
    }

    // Compare password with bcrypt hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// ─── GET /api/auth/profile ─────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile.' });
  }
};

// ─── PUT /api/auth/profile ─────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const update = {};
    if (name) update.name = name;
    if (phone !== undefined) update.phone = phone;
    if (address !== undefined) update.address = address;
    if (req.file) update.avatar = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select('-password');
    res.json({ success: true, message: 'Profile updated.', user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

module.exports = { register, login, getProfile, updateProfile };
