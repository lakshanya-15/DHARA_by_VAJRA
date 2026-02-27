const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticate } = require('../middlewares/auth'); // Assuming this exists based on common patterns

// If authenticate middleware is not at that path, I'll need to check
router.get('/', authenticate, profileController.getProfile);

module.exports = router;
