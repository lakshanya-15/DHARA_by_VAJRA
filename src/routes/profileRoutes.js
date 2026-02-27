const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { auth } = require('../middlewares/auth');

router.get('/', auth, profileController.getProfile);

module.exports = router;
