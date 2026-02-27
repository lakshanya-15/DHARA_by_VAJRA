const express = require('express');
const disputeController = require('../controllers/disputeController');
const { auth } = require('../middlewares/auth');

const router = express.Router();

router.post('/', auth, disputeController.raiseDispute);

module.exports = router;
