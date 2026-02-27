const prisma = require('../config/prisma');
const scoringService = require('./scoringService');

async function createReview({ bookingId, rating, comment }) {
    const review = await prisma.review.create({
        data: {
            bookingid: bookingId,
            rating: rating,
            comment: comment
        },
        include: {
            Booking: {
                include: { Asset: true }
            }
        }
    });

    // Note: Reviews can also impact the score if we add a "feedback quality" metric later.
    // For now, we update the score to trigger a recalculation which might include review counts.
    if (review.Booking?.farmerid) {
        await scoringService.updateUserScore(review.Booking.farmerid);
    }

    // Update operator score if booking has an asset with an owner
    if (review.Booking?.Asset?.ownerid) {
        await scoringService.updateUserScore(review.Booking.Asset.ownerid);
    }

    return review;
}

module.exports = {
    createReview
};
