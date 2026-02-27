const express = require('express');
const reviewController = require('../controllers/reviewController');
const { auth } = require('../middlewares/auth');

const router = express.Router();

router.post('/', auth, reviewController.createReview);
router.get('/operator/:operatorId', reviewController.getOperatorReviews);

module.exports = router;
