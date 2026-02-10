const prisma = require('../config/prisma');

async function createNotification({ userId, message, type = 'INFO' }) {
    return await prisma.notification.create({
        data: {
            userid: userId,
            message,
            type,
        },
    });
}

async function listByUser(userId) {
    return await prisma.notification.findMany({
        where: { userid: userId },
        orderBy: { createdat: 'desc' },
    });
}

async function markAsRead(id) {
    return await prisma.notification.update({
        where: { id },
        data: { isread: true },
    });
}

module.exports = {
    createNotification,
    listByUser,
    markAsRead,
};
