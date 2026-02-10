/**
 * Admin routes: list users, assets (ADMIN only).
 */
const express = require('express');
const adminController = require('../controllers/adminController');
const { auth } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/authorize');

const router = express.Router();

router.use(auth, requireRole(['ADMIN']));

// GET /admin/users
router.get('/users', adminController.getUsers);

// GET /admin/assets
router.get('/assets', adminController.getAssets);

// GET /admin/bookings
router.get('/bookings', adminController.getBookings);

module.exports = router;
