const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearData() {
    console.log('Clearing all data...');
    try {
        // Delete in order of constraints
        await prisma.booking.deleteMany({});
        await prisma.asset.deleteMany({});
        await prisma.user.deleteMany({});
        console.log('Database cleared successfully!');
    } catch (error) {
        console.error('Error clearing database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

clearData();
