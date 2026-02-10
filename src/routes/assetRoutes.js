/**
 * Asset routes: create (OPERATOR), list (public).
 */
const express = require('express');
const assetController = require('../controllers/assetController');
const { auth } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/authorize');

const router = express.Router();

// GET /assets - public (match both '' and '/' for mount path)
router.get('/', assetController.list);
router.get('', assetController.list);

// POST /assets - OPERATOR only
router.post('/', auth, requireRole(['OPERATOR']), assetController.create);

module.exports = router;
