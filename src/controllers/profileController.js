const prisma = require('../config/prisma');
const { success, error } = require('../utils/response');

async function getProfile(req, res, next) {
    try {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                behaviorScore: true,
                segment: true,
                Booking: {
                    select: {
                        id: true,
                        status: true,
                        assetid: true,
                        Payment: true,
                        Review: true
                    }
                },
                Engagement: {
                    select: {
                        id: true,
                        action: true,
                        createdat: true
                    }
                },
                Asset: {
                    include: {
                        Booking: {
                            include: {
                                Review: true,
                                Payment: true
                            }
                        }
                    }
                }
            }
        });

        if (!user) return error(res, 'User not found', 404);

        let metrics = {};

        if (user.role === 'FARMER') {
            metrics = {
                completedBookings: user.Booking.filter(b => b.status === 'COMPLETED').length,
                cancelledBookings: user.Booking.filter(b => b.status === 'CANCELLED').length,
                uniqueAssets: new Set(user.Booking.map(b => b.assetid)).size,
                totalPayments: user.Booking.flatMap(b => b.Payment).length,
                onTimePayments: user.Booking.flatMap(b => b.Payment).filter(p => !p.late).length,
                engagementCount: user.Engagement.length
            };
        } else if (user.role === 'OPERATOR') {
            const allAssetBookings = user.Asset.flatMap(a => a.Booking);
            const allReviews = allAssetBookings.flatMap(b => b.Review);
            metrics = {
                totalAssets: user.Asset.length,
                completedServices: allAssetBookings.filter(b => b.status === 'COMPLETED').length,
                cancelledServices: allAssetBookings.filter(b => b.status === 'CANCELLED').length,
                uniqueFarmersServed: new Set(allAssetBookings.map(b => b.farmerid)).size,
                avgRating: allReviews.length > 0
                    ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
                    : 0,
                engagementCount: user.Engagement.length
            };
        }

        return success(res, {
            profile: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                behaviorScore: user.behaviorScore,
                segment: user.segment
            },
            metrics
        });
    } catch (e) {
        next(e);
    }
}

module.exports = {
    getProfile
};
