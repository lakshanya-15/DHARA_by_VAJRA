/**
 * Booking routes: create (FARMER), get my (role-based, FARMER/OPERATOR).
 */
const express = require('express');
const bookingController = require('../controllers/bookingController');
const { auth } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/authorize');

const router = express.Router();

// ALL booking routes require auth
router.use(auth);

// POST /bookings - FARMER only
router.post('/', requireRole(['FARMER']), bookingController.create);

// GET /bookings/my - FARMER sees their bookings, OPERATOR sees bookings for their assets
router.get('/my', requireRole(['FARMER', 'OPERATOR']), bookingController.getMy);

// PATCH /bookings/:id/cancel - FARMER only
router.patch('/:id/cancel', requireRole(['FARMER']), bookingController.cancel);

// PATCH /bookings/:id/status - Update job status (role-based)
router.patch('/:id/status', requireRole(['FARMER', 'OPERATOR']), bookingController.updateStatus);

module.exports = router;
