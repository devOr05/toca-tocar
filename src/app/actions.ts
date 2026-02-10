'use server';

import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

const STANDARD_THEMES = [
    { name: 'Autumn Leaves', tonality: 'Gm' },
    { name: 'Blue Bossa', tonality: 'Cm' },
    { name: 'All The Things You Are', tonality: 'Ab' },
    { name: 'So What', tonality: 'Dm' },
    { name: 'Take Five', tonality: 'Ebm' },
    { name: 'Stella By Starlight', tonality: 'Bb' },
    { name: 'Cantaloupe Island', tonality: 'Fm' },
];

function generateCode() {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
}

export async function createJam(prevState: any, formData: FormData) {
    // Try to get session
    const session = await auth();

    let userId = '';
    let userName = '';

    // If logged in, use that user
    if (session?.user?.id) {
        userId = session.user.id;
        userName = session.user.name || 'Anfitrión';
    } else {
        // Fallback or Error if auth required
        return { success: false, error: 'Debes iniciar sesión para ser anfitrión' };
    }

    // Parse new fields
    const name = formData.get('name') as string;
    const location = formData.get('location') as string;
    const city = formData.get('city') as string;
    const description = formData.get('description') as string;
    const startTimeStr = formData.get('startTime') as string;

    // Simple validation
    if (!name || !location || !city || !startTimeStr) {
        return { success: false, error: 'Faltan campos obligatorios' };
    }

    const startTime = new Date(startTimeStr);

    try {
        const code = generateCode();
        const jam = await prisma.jam.create({
            data: {
                code,
                name: name,
                description: description,
                location: location,
                city: city,
                startTime: startTime,
                hostId: userId,
                status: 'SCHEDULED',
            },
        });

        // Create Default Themes
        await prisma.theme.createMany({
            data: STANDARD_THEMES.map(t => ({
                name: t.name,
                tonality: t.tonality,
                jamId: jam.id,
                status: 'OPEN',
            })),
        });

        // Redirect to the new jam
        redirect(`/jam/${code}`);

    } catch (error) {
        console.error('Error creating jam:', error);
        // If it's a redirect error, rethrow it (Next.js internals)
        if ((error as any).digest?.startsWith('NEXT_REDIRECT')) {
            throw error;
        }
        return { success: false, error: 'Error al crear la Jam' };
    }
}

export async function joinJamAction(formData: FormData) {
    const userName = formData.get('name') as string;
    const code = (formData.get('code') as string).toUpperCase();

    if (!userName || !code) return { error: 'Datos incompletos' };

    const jam = await prisma.jam.findUnique({
        where: { code },
    });

    if (!jam) return { error: 'Jam no encontrada' };

    // Create User (Participant)
    const user = await prisma.user.create({
        data: {
            name: userName,
            role: 'USER',
        }
    });

    return { success: true, jamCode: code, userId: user.id, userName: user.name };
}

export async function getJam(code: string) {
    try {
        const jam = await prisma.jam.findUnique({
            where: { code: code.toUpperCase() },
            include: {
                themes: {
                    include: {
                        participations: {
                            include: { user: true }
                        }
                    }
                },
                host: true
            }
        });

        if (!jam) return null;

        // Transform to match our frontend types if needed, or just return as is
        // Our frontend types are slightly different (dates vs. strings in serializable)
        return jam;
    } catch (error) {
        console.error('Error fetching jam:', error);
        return null;
    }
}



export async function updateProfile(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'No autorizado' };

    const name = formData.get('name') as string;
    const mainInstrument = formData.get('mainInstrument') as string;
    const favoriteTheme = formData.get('favoriteTheme') as string;
    const externalLink = formData.get('externalLink') as string;
    // Checkbox returns 'on' if checked, null if not
    const hasRecorded = formData.get('hasRecorded') === 'on';

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name,
                mainInstrument,
                favoriteTheme,
                externalLink,
                hasRecorded
            }
        });
        return { success: true, error: undefined };
    } catch (error) {
        console.error('Error updating profile:', error);
        return { success: false, error: 'Error al actualizar perfil' };
    }
}

export async function leaveJam(jamCode: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'No autorizado' };

    try {
        const jam = await prisma.jam.findUnique({
            where: { code: jamCode },
            include: { themes: { include: { participations: true } } }
        });

        if (!jam) return { success: false, error: 'Jam no encontrada' };

        // Remove participations in all themes of this jam
        // Actually, participation is linked to THEME, not JAM directly in schema?
        // Let's check schema. Participation is strict to Theme? 
        // Or is there a generic "Joined Jam" state?
        // Schema: Participation model has themeId.
        // So "Leaving Jam" means removing ALL participations in that Jam's themes.

        // Find all participations of this user in themes of this jam
        const themeIds = jam.themes.map(t => t.id);

        await prisma.participation.deleteMany({
            where: {
                userId: session.user.id,
                themeId: { in: themeIds }
            }
        });

        return { success: true };
    } catch (error) {
        console.error('Error leaving jam:', error);
        return { success: false, error: 'Error al salir de la Jam' };
    }
}
