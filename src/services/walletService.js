const prisma = require('../config/prisma');

async function getBalance(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { walletBalance: true }
    });
    return user?.walletBalance || 0;
}

async function addFunds(userId, amount, description = 'Added funds to wallet') {
    return prisma.$transaction(async (tx) => {
        const updatedUser = await tx.user.update({
            where: { id: userId },
            data: { walletBalance: { increment: amount } }
        });

        await tx.transaction.create({
            data: {
                userId,
                amount,
                type: 'DEPOSIT',
                description
            }
        });

        return updatedUser.walletBalance;
    });
}

async function subtractFunds(userId, amount, description = 'Payment for booking') {
    return prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { id: userId } });
        const balance = Number(user?.walletBalance || 0);

        if (balance < amount) {
            throw new Error('Insufficient wallet balance. Please add funds first.');
        }

        const updatedUser = await tx.user.update({
            where: { id: userId },
            data: { walletBalance: { decrement: amount } }
        });

        await tx.transaction.create({
            data: {
                userId,
                amount: -amount,
                type: 'DEDUCTION',
                description
            }
        });

        return updatedUser.walletBalance;
    });
}

async function getTransactions(userId) {
    return prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });
}

module.exports = {
    getBalance,
    addFunds,
    subtractFunds,
    getTransactions
};
