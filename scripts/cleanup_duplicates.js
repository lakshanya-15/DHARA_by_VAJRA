const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Cleaning up duplicate assets...');

    // Get all assets
    const assets = await prisma.asset.findMany();

    const seen = new Map(); // Use Map to store name-owner -> id
    const toDelete = [];

    // Sort by createdat descending to keep the newest ones
    assets.sort((a, b) => new Date(b.createdat || 0) - new Date(a.createdat || 0));

    for (const asset of assets) {
        const key = `${asset.name}-${asset.ownerid}`;
        if (seen.has(key)) {
            const keptId = seen.get(key);
            console.log(`Duplicate found: ${asset.name} (ID: ${asset.id}). Re-assigning dependencies to kept asset (ID: ${keptId})...`);

            // Re-assign bookings
            await prisma.booking.updateMany({
                where: { assetid: asset.id },
                data: { assetid: keptId }
            });

            // Re-assign maintenance logs
            await prisma.maintenanceLog.updateMany({
                where: { assetid: asset.id },
                data: { assetid: keptId }
            });

            toDelete.push(asset.id);
        } else {
            seen.set(key, asset.id);
        }
    }

    if (toDelete.length > 0) {
        console.log(`Deleting ${toDelete.length} duplicate assets...`);
        // Delete individually to avoid any other potential constraint issues if needed, but deleteMany should work if re-assigned correctly
        await prisma.asset.deleteMany({
            where: {
                id: { in: toDelete }
            }
        });
        console.log('Cleanup finished.');
    } else {
        console.log('No duplicates found.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
