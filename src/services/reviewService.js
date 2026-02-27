const prisma = require('../config/prisma');

async function createReview({ farmerId, operatorId, assetId, bookingId, rating, comment }) {
    return prisma.$transaction(async (tx) => {
        const review = await tx.review.create({
            data: {
                farmerId,
                operatorId,
                assetId,
                bookingId,
                rating: parseInt(rating),
                comment
            }
        });

        // Update Operator's behaviorScore based on average rating
        const reviews = await tx.review.findMany({
            where: { operatorId }
        });
        const avgRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;

        await tx.user.update({
            where: { id: operatorId },
            data: { behaviorScore: avgRating }
        });

        return review;
    });
}

async function getOperatorReviews(operatorId) {
    return prisma.review.findMany({
        where: { operatorId },
        include: {
            Farmer: { select: { name: true } },
            Asset: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
}

module.exports = {
    createReview,
    getOperatorReviews
};
