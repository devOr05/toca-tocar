const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserRole() {
    const email = 'orostizagamario@gmail.com';
    console.log(`Checking role for ${email}...`);

    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, name: true, email: true, role: true }
    });

    if (user) {
        console.log('User found:', user);
    } else {
        console.log('User not found!');
    }
}

checkUserRole()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
