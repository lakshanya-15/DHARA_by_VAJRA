const prisma = require('../config/prisma');

async function createLog({ assetId, date, type, cost, notes }) {
    return await prisma.maintenanceLog.create({
        data: {
            assetid: assetId,
            date: new Date(date),
            type,
            cost: Number(cost),
            notes,
        },
        include: { Asset: true }
    });
}

async function getLogsByOperator(operatorId) {
    return await prisma.maintenanceLog.findMany({
        where: {
            Asset: {
                ownerid: operatorId
            }
        },
        orderBy: {
            date: 'desc'
        },
        include: { Asset: true }
    });
}

async function getLogsByAsset(assetId) {
    return await prisma.maintenanceLog.findMany({
        where: { assetid: assetId },
        orderBy: { date: 'desc' }
    });
}

async function findById(id) {
    return await prisma.maintenanceLog.findUnique({
        where: { id },
        include: { Asset: true }
    });
}

async function deleteLog(id) {
    return await prisma.maintenanceLog.delete({
        where: { id }
    });
}

module.exports = {
    createLog,
    getLogsByOperator,
    getLogsByAsset,
    findById,
    deleteLog
};
