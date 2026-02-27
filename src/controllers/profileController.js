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
                completedBookings: true,
                cancelledBookings: true,
                Booking: {
                    select: {
                        id: true,
                        status: true,
                        assetid: true
                    }
                },
                Asset: {
                    include: {
                        Booking: true
                    }
                }
            }
        });

        if (!user) return error(res, 'User not found', 404);

        let metrics = {};

        if (user.role === 'FARMER') {
            metrics = {
                completedBookings: user.completedBookings || 0,
                cancelledBookings: user.cancelledBookings || 0,
                uniqueAssets: new Set(user.Booking.map(b => b.assetid)).size
            };
        } else if (user.role === 'OPERATOR') {
            const allAssetBookings = user.Asset.flatMap(a => a.Booking);
            metrics = {
                totalAssets: user.Asset.length,
                completedServices: allAssetBookings.filter(b => b.status === 'COMPLETED').length,
                cancelledServices: allAssetBookings.filter(b => b.status === 'CANCELLED').length,
                uniqueFarmersServed: new Set(allAssetBookings.map(b => b.farmerid)).size
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
