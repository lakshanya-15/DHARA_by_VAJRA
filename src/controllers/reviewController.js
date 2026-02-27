const reviewService = require('../services/reviewService');
const bookingService = require('../services/bookingService');
const { success, error } = require('../utils/response');

async function createReview(req, res, next) {
    try {
        const { bookingId, rating, comment } = req.body;
        const booking = await bookingService.findById(bookingId);

        if (!booking) return error(res, 'Booking not found', 404);
        if (booking.farmerId !== req.user.id) return error(res, 'Unauthorized', 403);
        if (booking.status !== 'COMPLETED') return error(res, 'Can only review completed jobs', 400);

        // Get operatorId and assetId from booking
        const operatorId = booking.Asset.User?.id || booking.Asset.ownerid; // Need to ensure this is available

        const review = await reviewService.createReview({
            farmerId: req.user.id,
            operatorId: booking.Asset.operatorId || booking.Asset.ownerid, // Standardizing
            assetId: booking.assetId,
            bookingId,
            rating,
            comment
        });

        return success(res, review, 201);
    } catch (e) {
        next(e);
    }
}

async function getOperatorReviews(req, res, next) {
    try {
        const reviews = await reviewService.getOperatorReviews(req.params.operatorId);
        return success(res, reviews);
    } catch (e) {
        next(e);
    }
}

module.exports = { createReview, getOperatorReviews };
