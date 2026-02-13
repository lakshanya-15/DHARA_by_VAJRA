const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Purging all assets, bookings, and logs...');

    // Deleting in order of constraints
    await prisma.maintenanceLog.deleteMany({});
    console.log('Deleted all maintenance logs.');

    await prisma.booking.deleteMany({});
    console.log('Deleted all bookings.');

    await prisma.asset.deleteMany({});
    console.log('Deleted all assets.');

    console.log('Database purge complete.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
