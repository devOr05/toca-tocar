// Script de diagnóstico para verificar el estado de la base de datos
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnose() {
    console.log('🔍 Iniciando diagnóstico...\n');

    try {
        // 1. Verificar conexión a la base de datos
        console.log('1️⃣ Verificando conexión a la base de datos...');
        await prisma.$connect();
        console.log('✅ Conexión exitosa\n');

        // 2. Verificar si existe el jam R1JA
        console.log('2️⃣ Buscando jam con código R1JA...');
        const jam = await prisma.jam.findUnique({
            where: { code: 'R1JA' },
            include: {
                themes: {
                    include: {
                        participations: {
                            include: {
                                user: true
                            }
                        }
                    }
                }
            }
        });

        if (jam) {
            console.log('✅ Jam encontrado:');
            console.log(`   - Nombre: ${jam.name}`);
            console.log(`   - Temas: ${jam.themes.length}`);
            console.log(`   - Participaciones totales: ${jam.themes.reduce((acc, t) => acc + t.participations.length, 0)}\n`);
        } else {
            console.log('❌ No se encontró el jam R1JA\n');
        }

        // 3. Listar todos los jams disponibles
        console.log('3️⃣ Listando todos los jams disponibles...');
        const allJams = await prisma.jam.findMany({
            select: {
                code: true,
                name: true,
                status: true
            }
        });

        if (allJams.length === 0) {
            console.log('❌ No hay jams en la base de datos\n');
        } else {
            console.log(`✅ ${allJams.length} jam(s) encontrado(s):`);
            allJams.forEach(j => {
                console.log(`   - ${j.code}: ${j.name} (${j.status})`);
            });
            console.log('');
        }

    } catch (error) {
        console.error('❌ Error durante el diagnóstico:', error);
    } finally {
        await prisma.$disconnect();
    }
}

diagnose();
