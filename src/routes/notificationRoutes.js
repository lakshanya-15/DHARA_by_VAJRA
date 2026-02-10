const express = require('express');
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middlewares/auth');

const router = express.Router();

router.use(auth);

router.get('/', notificationController.listMy);
router.patch('/:id/read', notificationController.markRead);

module.exports = router;
