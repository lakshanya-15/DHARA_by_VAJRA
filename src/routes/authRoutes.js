/**
 * Auth routes: register, login (no auth required).
 */
const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// POST /auth/request-otp
router.post('/request-otp', authController.requestOTP);

// POST /auth/verify-otp
router.post('/verify-otp', authController.verifyOTP);

// POST /auth/register
router.post('/register', authController.register);
// GET /auth/register → tell user to use POST
router.get('/register', (req, res) =>
  res.status(405).json({ success: false, error: 'Method not allowed', use: 'POST with JSON body: { phone, name, role }' })
);

// POST /auth/login
router.post('/login', authController.login);

// GET /auth/me - Refresh profile
const { auth } = require('../middlewares/auth');
router.get('/me', auth, authController.me);

module.exports = router;
