
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const code = '5J1E';
    console.log(`Deleting Jam with code: ${code}...`);

    const jam = await prisma.jam.findUnique({
        where: { code },
        include: { themes: true }
    });

    if (!jam) {
        console.log('Jam not found.');
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

    // Delete themes
    await prisma.theme.deleteMany({ where: { jamId: jam.id } });
    console.log('Themes deleted.');

    // Delete Jam
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
