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

export async function createJam(formData: FormData) {
    // Try to get session
    const session = await auth();

    let userId = '';
    let userName = '';

    // If logged in, use that user
    if (session?.user?.id) {
        userId = session.user.id;
        userName = session.user.name || 'Anfitrión';
    } else {
        // If not logged in (fallback for guest flow without auth middleware?)
        const hostName = formData.get('name') as string;
        if (!hostName) return { error: 'Nombre requerido' };

        const user = await prisma.user.create({
            data: { name: hostName, role: 'ADMIN' },
        });
        userId = user.id;
        userName = user.name!;
    }

    try {
        const code = generateCode();
        const jam = await prisma.jam.create({
            data: {
                code,
                name: `${userName}'s Jam`,
                hostId: userId,
                status: 'ACTIVE',
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

        return { success: true, jamCode: code, userId, userName };

    } catch (error) {
        console.error('Error creating jam:', error);
        return { error: 'Error al crear la Jam' };
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

export async function updateProfile(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'No autorizado' };

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
        return { success: true };
    } catch (error) {
        console.error('Error updating profile:', error);
        return { error: 'Error al actualizar perfil' };
    }
}
