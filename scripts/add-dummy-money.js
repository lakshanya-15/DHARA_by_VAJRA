const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Adding dummy money to all users...');

    const result = await prisma.user.updateMany({
        data: {
            walletBalance: 100000,
        },
    });

    console.log(`Successfully updated ${result.count} users.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
