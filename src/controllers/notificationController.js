const notificationService = require('../services/notificationService');
const { success } = require('../utils/response');

async function listMy(req, res, next) {
    try {
        const notifications = await notificationService.listByUser(req.user.id);
        return success(res, notifications);
    } catch (e) {
        next(e);
    }
}

async function markRead(req, res, next) {
    try {
        const notification = await notificationService.markAsRead(req.params.id);
        return success(res, notification);
    } catch (e) {
        next(e);
    }
}

module.exports = {
    listMy,
    markRead,
};
