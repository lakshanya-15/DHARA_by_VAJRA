const express = require('express');
const walletController = require('../controllers/walletController');
const { auth } = require('../middlewares/auth');

const router = express.Router();

router.get('/my', auth, walletController.getMyWallet);
router.post('/deposit', auth, walletController.deposit);

module.exports = router;
