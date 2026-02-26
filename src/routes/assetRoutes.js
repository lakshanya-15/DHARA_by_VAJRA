/**
 * Asset routes: create (OPERATOR), list (public).
 */
const express = require('express');
const assetController = require('../controllers/assetController');
const { auth } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/authorize');
const upload = require('../middlewares/upload'); // Import multer configuration

const router = express.Router();

// GET /assets - public (match both '' and '/' for mount path)
router.get('/', assetController.list);
router.get('', assetController.list);

// POST /assets/upload - Handle image uploads first
router.post('/upload', auth, requireRole(['OPERATOR']), upload.array('images', 5), assetController.uploadImages);

// POST /assets - OPERATOR only
router.post('/', auth, requireRole(['OPERATOR']), assetController.create);

// PATCH /assets/:id - OPERATOR only
router.patch('/:id', auth, requireRole(['OPERATOR']), assetController.update);

// DELETE /assets/:id - OPERATOR only
router.delete('/:id', auth, requireRole(['OPERATOR']), assetController.remove);

module.exports = router;
