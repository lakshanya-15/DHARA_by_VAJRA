const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function prepareDemo() {
    console.log('🚀 Preparing database for demo - Purging all dynamic data...');
    try {
        // Delete in order of constraints
        await prisma.booking.deleteMany({});
        console.log('✅ Deleted all bookings.');

        await prisma.maintenanceLog.deleteMany({});
        console.log('✅ Deleted all maintenance logs.');

        await prisma.asset.deleteMany({});
        console.log('✅ Deleted all assets.');

        await prisma.notification.deleteMany({});
        console.log('✅ Deleted all notifications.');

        await prisma.user.deleteMany({});
        console.log('✅ Deleted all users.');

        console.log('✨ Database is now fresh and ready for the demo!');
    } catch (error) {
        console.error('❌ Error purging database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

prepareDemo();
