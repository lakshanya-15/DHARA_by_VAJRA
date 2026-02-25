const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createRecord = async (data) => {
    return await prisma.damageRecord.create({
        data: {
            bookingid: data.bookingid,
            scanType: data.scanType,
            image: data.image,
            healthScore: data.healthScore,
            issues: data.issues
        }
    });
};

const getByBooking = async (bookingId) => {
    return await prisma.damageRecord.findMany({
        where: { bookingid: bookingId },
        orderBy: { createdat: 'desc' }
    });
};

module.exports = {
    createRecord,
    getByBooking
};
