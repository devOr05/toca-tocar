const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
    const jams = await prisma.jam.findMany({ include: { themes: true } });
    const users = await prisma.user.findMany();

    console.log('--- JAMS ---');
    jams.forEach(j => {
        console.log(`Jam: ${j.name} | City: "${j.city}" | Host: ${j.hostId}`);
    });

    console.log('\n--- USERS ---');
    users.forEach(u => {
        console.log(`User: ${u.name} | City: "${u.city}" | ID: ${u.id}`);
    });
}

checkData()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
