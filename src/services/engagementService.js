const prisma = require('../config/prisma');
const scoringService = require('./scoringService');

async function trackEngagement(userId, action) {
    const engagement = await prisma.engagement.create({
        data: {
            userid: userId,
            action: action
        }
    });

    await scoringService.updateUserScore(userId);

    return engagement;
}

module.exports = {
    trackEngagement
};
