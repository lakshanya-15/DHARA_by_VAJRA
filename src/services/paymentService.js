const prisma = require('../config/prisma');

async function createEscrow(bookingId, farmerId, amount) {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { Asset: true }
    });

    if (!booking) throw new Error('Booking not found');

    // Deduct from farmer wallet and create escrow record in one transaction
    return prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { id: farmerId } });
        const balance = Number(user?.walletBalance || 0);

        if (balance < amount) {
            throw new Error('Insufficient wallet balance to book this machinery. Please add funds to your wallet first.');
        }

        // 1. Deduct from farmer
        await tx.user.update({
            where: { id: farmerId },
            data: { walletBalance: { decrement: amount } }
        });

        // 2. Log transaction
        await tx.transaction.create({
            data: {
                userId: farmerId,
                amount: -amount,
                type: 'DEDUCTION',
                description: `Payment for booking: ${booking.Asset?.name || 'Machinery'}`
            }
        });

        // 3. Create escrow payment record
        return tx.payment.create({
            data: {
                bookingId,
                farmerId,
                amount,
                status: 'IN_ESCROW'
            }
        });
    });
}

async function releaseFunds(bookingId) {
    const payment = await prisma.payment.findFirst({
        where: { bookingId, status: 'IN_ESCROW' }
    });

    if (!payment) return null;

    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { Asset: true }
    });

    const operatorId = booking.Asset.ownerid;

    return prisma.$transaction(async (tx) => {
        // 1. Mark payment as released
        await tx.payment.update({
            where: { id: payment.id },
            data: { status: 'RELEASED' }
        });

        // 2. Credit operator wallet
        await tx.user.update({
            where: { id: operatorId },
            data: { walletBalance: { increment: payment.amount } }
        });

        // 3. Log earning transaction
        return tx.transaction.create({
            data: {
                userId: operatorId,
                amount: payment.amount,
                type: 'EARNING',
                description: `Earning from booking: ${booking.Asset?.name || 'Machinery'}`
            }
        });
    });
}

async function refundFarmer(bookingId) {
    const payment = await prisma.payment.findFirst({
        where: { bookingId, status: 'IN_ESCROW' }
    });

    if (!payment) return null;

    return prisma.$transaction(async (tx) => {
        // 1. Mark as refunded
        await tx.payment.update({
            where: { id: payment.id },
            data: { status: 'REFUNDED' }
        });

        // 2. Credit farmer wallet
        await tx.user.update({
            where: { id: payment.farmerId },
            data: { walletBalance: { increment: payment.amount } }
        });

        // 3. Log refund transaction
        return tx.transaction.create({
            data: {
                userId: payment.farmerId,
                amount: payment.amount,
                type: 'REFUND',
                description: `Refund for booking #${bookingId.slice(0, 8)}`
            }
        });
    });
}

async function getWalletBalance(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { walletBalance: true }
    });
    return Number(user?.walletBalance) || 0;
}

module.exports = {
    createEscrow,
    releaseFunds,
    refundFarmer,
    getWalletBalance
};
