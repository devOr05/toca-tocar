const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
    console.log('🌱 Seeding database...');

    try {
        // Create test jam
        const jam = await prisma.jam.upsert({
            where: { code: 'R1JA' },
            update: {},
            create: {
                code: 'R1JA',
                name: 'Jam de Prueba Local',
                description: 'Jam para testing en desarrollo local',
                location: 'Local Development',
                status: 'ACTIVE',
                hostId: 'local-dev-host',
                isPrivate: false,
            },
        });

        console.log('✅ Jam creado:', jam.code);

        // Create test theme
        const theme = await prisma.theme.create({
            data: {
                name: 'Autumn Leaves',
                tonality: 'Gm',
                status: 'OPEN',
                type: 'SONG',
                jamId: jam.id,
            },
        });

        console.log('✅ Tema creado:', theme.name);
        console.log('\n🎉 Seed completado!');
        console.log(`\n📍 Accede al jam en: http://localhost:3000/jam/${jam.code}\n`);

    } catch (error) {
        console.error('❌ Error durante seed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seed();
