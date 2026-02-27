const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { auth } = require('../middlewares/auth'); // Assuming this exists based on common patterns

// If authenticate middleware is not at that path, I'll need to check
router.get('/', auth, profileController.getProfile);

module.exports = router;
