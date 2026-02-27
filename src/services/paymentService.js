const prisma = require('../config/prisma');
const scoringService = require('./scoringService');

async function createPayment({ bookingId, amount, isLate }) {
    const payment = await prisma.payment.create({
        data: {
            bookingid: bookingId,
            amount: amount,
            late: isLate || false
        },
        include: {
            Booking: true
        }
    });

    if (payment.Booking?.farmerid) {
        await scoringService.updateUserScore(payment.Booking.farmerid);
    }

    return payment;
}

module.exports = {
    createPayment
};
