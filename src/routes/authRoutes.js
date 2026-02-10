/**
 * Auth routes: register, login (no auth required).
 */
const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// POST /auth/register
router.post('/register', authController.register);
// GET /auth/register → tell user to use POST (browser-friendly)
router.get('/register', (req, res) =>
  res.status(405).json({ success: false, error: 'Method not allowed', use: 'POST with JSON body: { email, password, name?, role? }' })
);

// POST /auth/login
router.post('/login', authController.login);
// GET /auth/login → tell user to use POST
router.get('/login', (req, res) =>
  res.status(405).json({ success: false, error: 'Method not allowed', use: 'POST with JSON body: { email, password }' })
);

module.exports = router;
