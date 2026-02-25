const express = require('express');
const maintenanceController = require('../controllers/maintenanceController');
const { auth } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/authorize');

const router = express.Router();

// OPERATOR only: create a new maintenance log
router.post('/', auth, requireRole(['OPERATOR']), maintenanceController.create);

// OPERATOR: list logs for their assets
router.get('/', auth, requireRole(['OPERATOR']), maintenanceController.list);

module.exports = router;
