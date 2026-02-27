const prisma = require('../config/prisma');

async function createDispute({ bookingId, farmerId, reason }) {
    return prisma.dispute.create({
        data: {
            bookingId,
            farmerId,
            reason,
            status: 'OPEN'
        }
    });
}

async function listDisputes(filters = {}) {
    return prisma.dispute.findMany({
        where: filters,
        include: {
            Booking: { include: { Asset: true } },
            Farmer: { select: { name: true, phone: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
}

module.exports = {
    createDispute,
    listDisputes
};
