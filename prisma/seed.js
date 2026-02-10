const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const ASSETS = [
    {
        name: 'John Deere 5050D',
        type: 'Tractor',
        price: 800,
        image: 'https://cdn-icons-png.flaticon.com/512/2675/2675869.png',
        location: 'Lucknow, UP',
        ownerName: 'Ramesh Singh',
        available: true,
    },
    {
        name: 'DJI Agras T40',
        type: 'Drone',
        price: 1500,
        image: 'https://cdn-icons-png.flaticon.com/512/3069/3069186.png',
        location: 'Pune, MH',
        ownerName: 'Tech Farming Sol.',
        available: true,
    },
    {
        name: 'JCB 3DX',
        type: 'JCB',
        price: 1200,
        image: 'https://cdn-icons-png.flaticon.com/512/2361/2361664.png',
        location: 'Patna, Bihar',
        ownerName: 'Suresh Yadav',
        available: false,
    },
    {
        name: 'Mahindra 275 DI',
        type: 'Tractor',
        price: 700,
        image: 'https://cdn-icons-png.flaticon.com/512/2675/2675869.png',
        location: 'Nasik, MH',
        ownerName: 'Vijay Patil',
        available: true,
    },
    {
        name: 'Harvest Master 9000',
        type: 'Harvester',
        price: 2500,
        image: 'https://cdn-icons-png.flaticon.com/512/5836/5836091.png',
        location: 'Punjab',
        ownerName: 'Golden Farms',
        available: true,
    },
];

async function main() {
    console.log('Seeding database...');

    // 1. Create Data Owners (Operators)
    // Group assets by owner to avoid duplicate users
    const ownersMap = new Map();
    for (const asset of ASSETS) {
        if (!ownersMap.has(asset.ownerName)) {
            const password = await bcrypt.hash('password', 10);
            const email = `${asset.ownerName.toLowerCase().replace(/\s+/g, '.')}@example.com`;

            // Upsert user
            const user = await prisma.user.upsert({
                where: { email },
                update: {},
                create: {
                    name: asset.ownerName,
                    email,
                    password,
                    role: 'OPERATOR',
                    village: asset.location.split(',')[0],
                }
            });
            ownersMap.set(asset.ownerName, user);
            console.log(`Created/Found owner: ${asset.ownerName}`);
        }
    }

    // 2. Create Farmer User
    const farmerPassword = await bcrypt.hash('password', 10);
    const farmer = await prisma.user.upsert({
        where: { email: 'farmer@example.com' },
        update: {},
        create: {
            name: 'Demo Farmer',
            email: 'farmer@example.com',
            password: farmerPassword,
            role: 'FARMER',
        }
    });
    console.log(`Created/Found farmer: ${farmer.email}`);

    // 3. Create Assets
    for (const assetData of ASSETS) {
        const owner = ownersMap.get(assetData.ownerName);
        if (!owner) continue;

        try {
            await prisma.asset.create({
                data: {
                    name: assetData.name,
                    type: assetData.type,
                    priceperday: assetData.price, // Map price to priceperday
                    availability: assetData.available,
                    ownerid: owner.id,
                    // createdat defaults to now()
                }
            });
            console.log(`Created asset: ${assetData.name}`);
        } catch (e) {
            console.log(`Skipping asset ${assetData.name} (might mostly likely duplicate if running multiple times) - Error: ${e.message}`);
        }
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
