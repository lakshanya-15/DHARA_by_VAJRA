const express = require('express');
const router = express.Router();
const damageScannerController = require('../controllers/damageScannerController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/', damageScannerController.create);
router.get('/:bookingId', damageScannerController.getByBooking);

module.exports = router;
