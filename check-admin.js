const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function checkUserRole() {
    try {
        const email = 'orostizagamario@gmail.com';
        console.log(`Checking role for ${email}...`);

        const user = await prisma.user.findFirst({ // Changed to findFirst to carry on even if unique constraint valid fails?
            where: { email: email }
        });

        if (user) {
            console.log('User found:', user.id);
            fs.writeFileSync('admin_id.txt', user.id);
        } else {
            console.log('User not found!');
            fs.writeFileSync('admin_id.txt', 'NOT_FOUND');
        }
    } catch (e) {
        console.error('ERROR:', e);
        fs.writeFileSync('admin_id.txt', 'ERROR: ' + e.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkUserRole();
