import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAndCreateJam() {
    try {
        // Check if R1JA exists
        let jam = await prisma.jam.findUnique({
            where: { code: 'R1JA' }
        });

        if (jam) {
            console.log('✅ Jam R1JA ya existe');
            return;
        }

        // Create R1JA jam
        console.log('📝 Creando jam R1JA...');
        jam = await prisma.jam.create({
            data: {
                code: 'R1JA',
                name: 'Jam de Prueba Local',
                description: 'Jam para testing local',
                location: 'Local Dev',
                status: 'ACTIVE',
                hostId: 'local-host',
                isPrivate: false
            }
        });

        console.log('✅ Jam R1JA creado exitosamente');
        console.log(`   URL: http://localhost:3000/jam/${jam.code}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAndCreateJam();
