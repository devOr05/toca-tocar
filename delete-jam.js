
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Manually load .env
try {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim().replace(/^['"]|['"]$/g, ''); // Remove quotes if any
            }
        });
        console.log('.env loaded manually.');
    } else {
        console.log('.env file not found.');
    }
} catch (e) {
    console.error('Error loading .env:', e);
}

const prisma = new PrismaClient();

async function main() {
    const code = '5J1E';
    console.log(`Deleting Jam with code: ${code}...`);

    const jam = await prisma.jam.findUnique({
        where: { code },
        include: { themes: true }
    });

    if (!jam) {
        console.log('Jam not found (or already deleted).');
        return;
    }

    const themeIds = jam.themes.map(t => t.id);
    console.log(`Found ${themeIds.length} themes. Deleting participations...`);

    if (themeIds.length > 0) {
        await prisma.participation.deleteMany({
            where: { themeId: { in: themeIds } }
        });
        console.log('Participations deleted.');
    }

    await prisma.theme.deleteMany({ where: { jamId: jam.id } });
    console.log('Themes deleted.');

    await prisma.jam.delete({ where: { id: jam.id } });
    console.log('Jam deleted successfully.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
