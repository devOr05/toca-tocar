'use server';

import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { auth, signOut } from '@/auth';
import { revalidatePath } from 'next/cache';
import { pusherServer } from '@/lib/pusher-server';

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

// Logout action
export async function logoutAction() {
    await signOut({ redirectTo: '/' });
}

// Delete jam action
export async function deleteJam(jamCode: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'No autenticado' };
    }

    try {
        // Check if user is the host or admin
        const jam = await prisma.jam.findUnique({
            where: { code: jamCode },
            select: { hostId: true }
        });

        if (!jam) {
            return { success: false, error: 'Jam no encontrada' };
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        });

        if (jam.hostId !== session.user.id && user?.role !== 'ADMIN' && session.user.email?.toLowerCase() !== 'orostizagamario@gmail.com') {
            return { success: false, error: 'Solo el anfitrión o admin puede eliminar la jam' };
        }

        // Delete jam (cascade will delete themes, participations, messages, media)
        await prisma.jam.delete({
            where: { code: jamCode }
        });

        return { success: true };
    } catch (error) {
        console.error('Error deleting jam:', error);
        return { success: false, error: 'Error al eliminar la jam' };
    }
}

// Join theme action
export async function joinThemeAction(themeId: string, instrument: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'No autenticado' };
    }

    try {
        await prisma.participation.create({
            data: {
                themeId,
                userId: session.user.id,
                instrument,
            },
        });

        // Trigger update
        const theme = await prisma.theme.findUnique({ where: { id: themeId }, select: { jam: { select: { id: true } } } });
        if (theme?.jam?.id) {
            await pusherServer.trigger(`jam-${theme.jam.id}`, 'update-jam', {});
        }

        return { success: true };
    } catch (error) {
        console.error('Error joining theme:', error);
        return { success: false, error: 'Error al unirse al tema' };
    }
}

// Leave theme action
export async function leaveTheme(themeId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'No autenticado' };
    }

    try {
        await prisma.participation.deleteMany({
            where: {
                themeId,
                userId: session.user.id,
            },
        });

        // Trigger update
        const theme = await prisma.theme.findUnique({ where: { id: themeId }, select: { jam: { select: { id: true } } } });
        if (theme?.jam?.id) {
            await pusherServer.trigger(`jam-${theme.jam.id}`, 'update-jam', {});
        }
        return { success: true };
    } catch (error) {
        console.error('Error leaving theme:', error);
        return { success: false, error: 'Error al salir del tema' };
    }
}

export async function createJam(prevState: any, formData: FormData) {
    // Try to get session
    const session = await auth();

    let userId = '';
    let userName = '';

    // If logged in, use that user
    console.log('Create Jam Session Debug:', JSON.stringify(session, null, 2));

    if (session?.user?.id) {
        userId = session.user.id;
        userName = session.user.name || 'Anfitrión';
    } else {
        console.error('Create Jam Failed: No User ID in session', session);
        return { success: false, error: 'Debes iniciar sesión para ser anfitrión' };
    }

    // Parse new fields
    const name = formData.get('name') as string;
    const location = formData.get('location') as string;
    const city = formData.get('city') as string;
    const description = formData.get('description') as string;
    const startTimeStr = formData.get('startTime') as string;
    const isPrivate = formData.get('isPrivate') === 'on'; // Checkbox
    const flyerUrl = formData.get('flyerUrl') as string;
    const lat = parseFloat(formData.get('lat') as string) || null;
    const lng = parseFloat(formData.get('lng') as string) || null;
    const openingBand = formData.get('openingBand') as string;
    const openingInfo = formData.get('openingInfo') as string;
    const openingThemes = formData.get('openingThemes') as string;

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
                name,
                location,
                city,
                description,
                startTime,
                isPrivate,
                flyerUrl: flyerUrl || undefined,
                lat: lat || undefined,
                lng: lng || undefined,
                hostId: userId,
                openingBand,
                openingInfo,
                openingThemes,
                status: 'SCHEDULED',
            },
        });

        return { success: true, code: jam.code };
    } catch (error) {
        console.error('Error creating jam:', error);
        return { success: false, error: 'Error al crear la jam' };
    }
}

export async function getJam(code: string) {
    try {
        const jam = await prisma.jam.findUnique({
            where: { code },
            include: {
                host: true,
                themes: {
                    include: {
                        participations: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
                attendance: {
                    include: {
                        user: true
                    }
                }
            },
        });
        return jam;
    } catch (error) {
        console.error('Error fetching jam:', error);
        return null;
    }
}

export async function updateJamOpening(jamId: string, openingBand: string, openingInfo: string, openingThemes: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'No autenticado' };

    try {
        const jam = await prisma.jam.findUnique({ where: { id: jamId } });
        if (!jam) return { success: false, error: 'Jam no encontrada' };

        const isAdmin = session.user.role === 'ADMIN' || session.user.email?.toLowerCase() === 'orostizagamario@gmail.com';
        if (jam.hostId !== session.user.id && !isAdmin) return { success: false, error: 'No autorizado' };

        await prisma.jam.update({
            where: { id: jamId },
            data: { openingBand, openingInfo, openingThemes }
        });

        revalidatePath(`/jam/${jam.code}`);
        return { success: true };
    } catch (error) {
        console.error('Error updating opening info:', error);
        return { success: false, error: 'Error al actualizar información de apertura' };
    }
}

export async function getAllJams() {
    try {
        const jams = await prisma.jam.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                themes: true,
            },
        });
        return jams;
    } catch (error) {
        console.error('Error fetching jams:', error);
        return [];
    }
}

/**
 * Fetch unique jam names matching the query from existing jams in the database
 */
export async function getJamTemplates(query: string) {
    if (!query || query.length < 2) return [];

    try {
        const jams = await prisma.jam.findMany({
            where: {
                name: {
                    contains: query,
                    mode: 'insensitive',
                },
            },
            distinct: ['name'],
            select: { name: true },
            orderBy: { name: 'asc' },
            take: 10,
        });
        return jams.map((j: { name: string }) => j.name);
    } catch (error) {
        console.error('Error fetching jam templates:', error);
        return [];
    }
}

/**
 * Fetch the most recent configuration for a given jam name to auto-fill the creation form
 */
export async function getJamTemplateDetails(name: string) {
    if (!name) return null;

    try {
        const jam = await prisma.jam.findFirst({
            where: {
                name: {
                    equals: name,
                    mode: 'insensitive'
                }
            },
            orderBy: { createdAt: 'desc' },
            select: {
                location: true,
                city: true,
                description: true,
                openingBand: true,
                openingInfo: true,
                openingThemes: true,
                lat: true,
                lng: true,
                flyerUrl: true,
            }
        });
        return jam;
    } catch (error) {
        console.error('Error fetching jam template details:', error);
        return null;
    }
}

export async function createTheme(
    jamCode: string,
    name: string,
    tonality?: string,
    description?: string,
    sheetMusicUrl?: string,
    type?: 'SONG' | 'TOPIC'
) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'No autenticado' };
    }

    if (!jamCode || !name) {
        return { success: false, error: 'Faltan campos obligatorios' };
    }

    try {
        const jam = await prisma.jam.findUnique({ where: { code: jamCode } });
        if (!jam) {
            return { success: false, error: 'Jam no encontrada' };
        }

        await prisma.theme.create({
            data: {
                name,
                tonality: tonality || undefined,
                description: description || undefined,
                sheetMusicUrl: sheetMusicUrl || undefined,
                type: type || 'SONG',
                jamId: jam.id,
                proposedById: session.user.id,
            },
        });

        // Trigger update (fail-safe)
        try {
            await pusherServer.trigger(`jam-${jam.id}`, 'update-jam', {});
        } catch (pusherError) {
            console.error('Pusher trigger failed (createTheme):', pusherError);
        }

        return { success: true };
    } catch (error) {
        console.error('Error creating theme:', error);
        return { success: false, error: 'Error al crear el tema' };
    }
}

export async function updateJamStatus(jamId: string, status: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'No autenticado' };

    try {
        const jam = await prisma.jam.findUnique({ where: { id: jamId } });

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        });

        if (!jam || (jam.hostId !== session.user.id && user?.role !== 'ADMIN')) {
            return { success: false, error: 'No autorizado' };
        }

        await prisma.jam.update({
            where: { id: jamId },
            data: { status },
        });

        revalidatePath(`/jam/${jam.code}`);

        // Trigger update (fail-safe)
        try {
            await pusherServer.trigger(`jam-${jamId}`, 'update-jam', {});
        } catch (pusherError) {
            console.error('Pusher trigger failed (updateJamStatus):', pusherError);
        }

        return { success: true };
    } catch (error) {
        console.error('Error updating jam status:', error);
        return { success: false, error: 'Error al actualizar el estado de la jam' };
    }
}

export async function updateThemeStatus(themeId: string, status: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'No autenticado' };

    try {
        const theme = await prisma.theme.findUnique({
            where: { id: themeId },
            include: { jam: true }
        });

        const isAdmin = session.user.role === 'ADMIN' || session.user.email?.toLowerCase() === 'orostizagamario@gmail.com';
        if (!theme || (theme.jam.hostId !== session.user.id && theme.proposedById !== session.user.id && !isAdmin)) {
            return { success: false, error: 'No autorizado' };
        }

        await prisma.theme.update({
            where: { id: themeId },
            data: { status },
        });

        revalidatePath(`/jam/${theme.jam.code}`);

        // Trigger update
        await pusherServer.trigger(`jam-${theme.jam.id}`, 'update-jam', {});

        return { success: true };
    } catch (error) {
        console.error('Error updating theme status:', error);
        return { success: false, error: 'Error al actualizar el estado del tema' };
    }
}

export async function reorderThemes(jamId: string, themes: { id: string; order: number }[]) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'No autenticado' };

    try {
        const jam = await prisma.jam.findUnique({ where: { id: jamId } });
        const isAdmin = session.user.role === 'ADMIN' || session.user.email?.toLowerCase() === 'orostizagamario@gmail.com';
        if (!jam || (jam.hostId !== session.user.id && !isAdmin)) {
            return { success: false, error: 'No autorizado' };
        }

        // Transactional update for all themes
        await prisma.$transaction(
            themes.map((t) =>
                prisma.theme.update({
                    where: { id: t.id },
                    data: { order: t.order },
                })
            )
        );

        // Trigger update to refresh everyone's view
        try {
            await pusherServer.trigger(`jam-${jamId}`, 'update-jam', {});
        } catch (error) {
            console.error('Pusher trigger failed (reorderThemes):', error);
        }

        return { success: true };
    } catch (error) {
        console.error('Error reordering themes:', error);
        return { success: false, error: 'Error al reordenar temas' };
    }
}

export async function joinTheme(themeId: string, instrument: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'No autenticado' };
    }

    try {
        // Check for existing participation to be idempotent
        const existing = await prisma.participation.findFirst({
            where: {
                userId: session.user.id,
                themeId,
                instrument
            }
        });

        if (existing) {
            return { success: true }; // Already joined
        }

        const participation = await prisma.participation.create({
            data: {
                userId: session.user.id,
                themeId,
                instrument,
                status: 'WAITING',
            },
            include: { theme: true }
        });

        // Trigger update
        try {
            await pusherServer.trigger(`jam-${participation.theme.jamId}`, 'update-jam', {});
        } catch (pusherError) {
            console.error('Pusher trigger failed (joinTheme):', pusherError);
        }

        return { success: true };
    } catch (error) {
        console.error('Error joining theme:', error);
        return { success: false, error: 'Error al unirse al tema' };
    }
}


export async function updateParticipationStatus(participationId: string, status: string) {
    try {
        await prisma.participation.update({
            where: { id: participationId },
            data: { status },
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating participation:', error);
        return { success: false, error: 'Error al actualizar la participación' };
    }
}

export async function updateProfile(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'No autenticado' };
    }

    const mainInstrument = formData.get('mainInstrument') as string;
    const city = formData.get('city') as string;
    const favoriteTheme = formData.get('favoriteTheme') as string;
    const hasRecorded = formData.get('hasRecorded') as string;
    const instagram = formData.get('instagram') as string;
    const youtube = formData.get('youtube') as string;
    const tiktok = formData.get('tiktok') as string;
    const bandcamp = formData.get('bandcamp') as string;
    const soundcloud = formData.get('soundcloud') as string;
    const website = formData.get('website') as string;

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                mainInstrument: mainInstrument || undefined,
                city: city || undefined,
                favoriteTheme: favoriteTheme || undefined,
                hasRecorded: hasRecorded || undefined,
                instagram: instagram || undefined,
                youtube: youtube || undefined,
                tiktok: tiktok || undefined,
                bandcamp: bandcamp || undefined,
                soundcloud: soundcloud || undefined,
                website: website || undefined,
            },
        });
        return {
            success: true,
            updatedFields: {
                city,
                mainInstrument
            }
        };
    } catch (error) {
        console.error('Error updating profile:', error);
        return { success: false, error: 'Error al actualizar el perfil' };
    }
}

export async function getProfile() {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });
        return user;
    } catch (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
}

export async function getMusiciansByCity(city: string) {
    try {
        const musicians = await prisma.user.findMany({
            where: {
                city: {
                    contains: city,
                    mode: 'insensitive',
                },
            },
            take: 20, // Limit results
            select: {
                id: true,
                name: true,
                mainInstrument: true,
                city: true,
                image: true,
            },
        });
        return musicians;
    } catch (error) {
        console.error('Error fetching musicians:', error);
        return [];
    }
}

export async function updateJam(jamId: string, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'No autenticado' };
    }

    // Check if user is host
    const jam = await prisma.jam.findUnique({ where: { id: jamId } });
    if (!jam || jam.hostId !== session.user.id) {
        return { success: false, error: 'No tienes permisos para editar esta jam' };
    }

    const name = formData.get('name') as string;
    const location = formData.get('location') as string;
    const city = formData.get('city') as string;
    const description = formData.get('description') as string;
    const startTimeStr = formData.get('startTime') as string;
    const isPrivate = formData.get('isPrivate') === 'on';
    const flyerUrl = formData.get('flyerUrl') as string;

    try {
        await prisma.jam.update({
            where: { id: jamId },
            data: {
                name,
                location,
                city,
                description: description || undefined,
                startTime: startTimeStr ? new Date(startTimeStr) : undefined,
                isPrivate,
                flyerUrl: flyerUrl || undefined,
            },
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating jam:', error);
        return { success: false, error: 'Error al actualizar la jam' };
    }
}

export async function updateTheme(themeId: string, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'No autenticado' };
    }

    const name = formData.get('name') as string;
    const tonality = formData.get('tonality') as string;
    const description = formData.get('description') as string;
    const sheetMusicUrl = formData.get('sheetMusicUrl') as string;

    try {
        await prisma.theme.update({
            where: { id: themeId },
            data: {
                name,
                tonality: tonality || undefined,
                description: description || undefined,
                sheetMusicUrl: sheetMusicUrl || undefined,
            },
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating theme:', error);
        return { success: false, error: 'Error al actualizar el tema' };
    }
}


import { pusherClient } from '@/lib/pusher';

export async function sendMessage(jamId: string, content: string, themeId?: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'No autenticado' };
    }

    try {
        const message = await prisma.message.create({
            data: {
                content,
                userId: session.user.id,
                jamId,
                themeId: themeId || undefined,
            },
            include: {
                user: true // Include user for the real-time payload
            }
        });

        // Trigger update
        await pusherServer.trigger(`jam-${jamId}`, 'new-message', {
            id: message.id,
            content: message.content,
            userId: message.userId,
            userName: message.user.name || 'Usuario', // Flatten for client
            jamId: message.jamId,
            themeId: message.themeId,
            createdAt: message.createdAt,
        });

        // ---------------------------------------------------------
        // NOTIFICATIONS LOGIC (Async - don't block response)
        // ---------------------------------------------------------
        (async () => {
            // 1. Check for mentions: @Name
            const mentionRegex = /@(\w+)/g;
            const mentions = content.match(mentionRegex);

            if (mentions) {
                for (const mention of mentions) {
                    const mentionedName = mention.substring(1); // Remove @
                    // Find user by name (approximate)
                    const targetUser = await prisma.user.findFirst({
                        where: {
                            name: {
                                equals: mentionedName,
                                mode: 'insensitive'
                            }
                        }
                    });

                    if (targetUser && targetUser.id !== session.user.id) {
                        const { createNotification } = await import('@/lib/notifications');
                        await createNotification(
                            targetUser.id,
                            'MENTION',
                            `${session.user.name} te mencionó en el chat`,
                            `/jam/${jamId}`, // Link to Jam
                            session.user.id
                        );
                    }
                }
            }
        })();

        return { success: true };
    } catch (error) {
        console.error('Error sending message:', error);
        return { success: false, error: 'Failed to send message' };
    }
}

export async function checkInToJam(jamId: string, instrument: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Not authenticated' };

    try {
        // Idempotency check
        const existing = await prisma.jamAttendance.findUnique({
            where: {
                userId_jamId: {
                    userId: session.user.id,
                    jamId
                }
            }
        });

        if (existing) {
            return { success: true };
        }

        await prisma.jamAttendance.create({
            data: {
                userId: session.user.id,
                jamId,
                instrument
            }
        });

        const { pusherServer } = await import('@/lib/pusher-server');
        await pusherServer.trigger(`jam-${jamId}`, 'update-jam', {});

        revalidatePath(`/jam/${jamId}`);
        return { success: true };
    } catch (error) {
        console.error('Error checking in:', error);
        return { success: false, error: 'Failed to check in' };
    }
}


export async function getMessages(jamId: string, themeId?: string) {
    try {
        const messages = await prisma.message.findMany({
            where: {
                jamId,
                themeId: themeId || null,
            },
            include: {
                user: true,
            },
            orderBy: { createdAt: 'asc' },
        });

        return messages.map((m: any) => ({
            id: m.id,
            content: m.content,
            userId: m.userId,
            userName: m.user.name || 'Usuario',
            jamId: m.jamId,
            themeId: m.themeId,
            createdAt: m.createdAt,
        }));
    } catch (error) {
        console.error('Error fetching DMs:', error);
        return [];
    }
}

export async function getSuggestedThemes(jamCode: string) {
    try {
        const jam = await prisma.jam.findUnique({
            where: { code: jamCode },
            include: {
                themes: {
                    where: { type: 'SONG' },
                },
            },
        });

        if (!jam) return [];

        const existingThemeNames = jam.themes.map((t: any) => t.name.toLowerCase());

        // Use REAL_BOOK_STANDARDS for a more complete list
        const { REAL_BOOK_STANDARDS } = await import('@/data/realBook');

        // Filter out existing themes
        const suggestions = REAL_BOOK_STANDARDS.filter(
            st => !existingThemeNames.includes(st.name.toLowerCase())
        );

        // Randomize and take 20 to avoid overwhelming the user
        const shuffled = suggestions.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 20);
    } catch (error) {
        console.error('Error fetching suggested themes:', error);
        return [];
    }
}

export async function sendDirectMessage(receiverId: string, content: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'No autenticado' };
    }

    try {
        await prisma.directMessage.create({
            data: {
                content,
                senderId: session.user.id,
                receiverId,
            },
        });
        return { success: true };
    } catch (error) {
        console.error('Error sending DM:', error);
        return { success: false, error: 'Error al enviar el mensaje' };
    }
}

export async function getDirectMessages(otherUserId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return [];
    }

    try {
        const messages = await prisma.directMessage.findMany({
            where: {
                OR: [
                    { senderId: session.user.id, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: session.user.id },
                ],
            },
            include: {
                sender: true,
                receiver: true,
            },
            orderBy: { createdAt: 'asc' },
        });

        return messages.map((m: any) => ({
            id: m.id,
            content: m.content,
            senderId: m.senderId,
            senderName: m.sender.name || 'Usuario',
            receiverId: m.receiverId,
            createdAt: m.createdAt,
            read: m.read
        }));
    } catch (error) {
        console.error('Error fetching DMs:', error);
        return [];
    }
}

// ============================================
// NEW ACTIONS FOR v0.2.0
// ============================================

/**
 * Delete a theme (host only)
 */
export async function deleteTheme(themeId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'No autenticado' };
    }

    try {
        // Get theme with jam to check permissions
        const theme = await prisma.theme.findUnique({
            where: { id: themeId },
            include: { jam: true },
        });

        if (!theme) {
            return { success: false, error: 'Tema no encontrado' };
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        });

        // Check if user is host or admin
        if (theme.jam.hostId !== session.user.id && user?.role !== 'ADMIN') {
            return { success: false, error: 'Solo el anfitrión o admin puede eliminar temas' };
        }

        // Delete participations first (cascade)
        await prisma.participation.deleteMany({
            where: { themeId },
        });

        // Delete messages
        await prisma.message.deleteMany({
            where: { themeId },
        });

        // Delete theme
        await prisma.theme.delete({
            where: { id: themeId },
        });

        // Trigger update (fail-safe)
        try {
            await pusherServer.trigger(`jam-${theme.jam.id}`, 'update-jam', {});
        } catch (pusherError) {
            console.error('Pusher trigger failed (deleteTheme):', pusherError);
        }

        return { success: true };
    } catch (error) {
        console.error('Error deleting theme:', error);
        return { success: false, error: 'Error al eliminar el tema' };
    }
}



/**
 * Search venues for autocomplete
 */
export async function getVenues(query: string) {
    try {
        const venues = await prisma.venue.findMany({
            where: {
                name: {
                    contains: query,
                    mode: 'insensitive',
                },
            },
            orderBy: { usageCount: 'desc' },
            take: 10,
        });
        return venues;
    } catch (error) {
        console.error('Error fetching venues:', error);
        return [];
    }
}

/**
 * Create or update venue
 */
export async function createOrUpdateVenue(name: string, address?: string, city?: string, lat?: number, lng?: number) {
    try {
        const existing = await prisma.venue.findUnique({ where: { name } });

        if (existing) {
            // Increment usage count
            const updated = await prisma.venue.update({
                where: { name },
                data: { usageCount: existing.usageCount + 1 },
            });
            return updated;
        } else {
            // Create new venue
            const venue = await prisma.venue.create({
                data: {
                    name,
                    address: address || undefined,
                    city: city || undefined,
                    lat: lat || undefined,
                    lng: lng || undefined,
                },
            });
            return venue;
        }
    } catch (error) {
        console.error('Error creating/updating venue:', error);
        return null;
    }
}

/**
 * Get popular venues (optionally by city)
 */
export async function getPopularVenues(city?: string) {
    try {
        const venues = await prisma.venue.findMany({
            where: city ? {
                city: {
                    equals: city,
                    mode: 'insensitive',
                },
            } : undefined,
            orderBy: { usageCount: 'desc' },
            take: 20,
        });
        return venues;
    } catch (error) {
        console.error('Error fetching popular venues:', error);
        return [];
    }
}

/**
 * Upload media (placeholder - will implement with Cloudinary)
 */
export async function uploadMedia(jamId: string, type: 'PHOTO' | 'VIDEO', url: string, caption?: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'No autenticado' };
    }

    try {
        const media = await prisma.media.create({
            data: {
                type,
                url,
                caption: caption || undefined,
                userId: session.user.id,
                jamId,
            },
        });
        return { success: true, media };
    } catch (error) {
        console.error('Error uploading media:', error);
        return { success: false, error: 'Error al subir el archivo' };
    }
}

/**
 * Get media for a jam
 */
export async function getJamMedia(jamId: string) {
    try {
        const media = await prisma.media.findMany({
            where: { jamId },
            include: {
                uploadedBy: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return media;
    } catch (error) {
        console.error('Error fetching media:', error);
        return [];
    }
}

/**
 * Delete media (uploader or host only)
 */
export async function deleteMedia(mediaId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'No autenticado' };
    }

    try {
        const media = await prisma.media.findUnique({
            where: { id: mediaId },
            include: { jam: true },
        });

        if (!media) {
            return { success: false, error: 'Archivo no encontrado' };
        }

        // Check if user is uploader or host
        if (media.userId !== session.user.id && media.jam.hostId !== session.user.id) {
            return { success: false, error: 'No tienes permisos para eliminar este archivo' };
        }

        await prisma.media.delete({
            where: { id: mediaId },
        });

        return { success: true };
    } catch (error) {
        console.error('Error deleting media:', error);
        return { success: false, error: 'Error al eliminar el archivo' };
    }
}
/**
 * Create a new announcement
 */
export async function createAnnouncement(title: string, content: string, tag: string, tagColor: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'No autenticado' };

    try {
        await prisma.announcement.create({
            data: {
                title,
                content,
                tag,
                tagColor,
                userId: session.user.id,
                active: true,
            },
        });
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error creating announcement:', error);
        return { success: false, error: 'Error al crear el anuncio' };
    }
}

/**
 * Update an announcement
 */
export async function updateAnnouncement(id: string, title: string, content: string, tag: string, tagColor: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'No autenticado' };

    try {
        const announcement = await prisma.announcement.findUnique({ where: { id } });
        if (!announcement) return { success: false, error: 'No encontrado' };

        const isAdmin = session.user.email === 'orostizagamario@gmail.com' || (session.user as any).role === 'ADMIN';
        if (announcement.userId !== session.user.id && !isAdmin) {
            return { success: false, error: 'No autorizado' };
        }

        await prisma.announcement.update({
            where: { id },
            data: { title, content, tag, tagColor }
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error updating announcement:', error);
        return { success: false, error: 'Error al actualizar el anuncio' };
    }
}

/**
 * Delete an announcement
 */
export async function deleteAnnouncement(id: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'No autenticado' };

    try {
        const announcement = await prisma.announcement.findUnique({ where: { id } });
        if (!announcement) return { success: false, error: 'No encontrado' };

        const isAdmin = session.user.email === 'orostizagamario@gmail.com' || (session.user as any).role === 'ADMIN';
        if (announcement.userId !== session.user.id && !isAdmin) {
            return { success: false, error: 'No autorizado' };
        }

        await prisma.announcement.delete({ where: { id } });
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error deleting announcement:', error);
        return { success: false, error: 'Error al eliminar el anuncio' };
    }
}

/**
 * Get active announcements
 */
export async function getAnnouncements() {
    try {
        const announcements = await prisma.announcement.findMany({
            where: { active: true },
            include: { user: { select: { name: true, image: true } } },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
        return announcements;
    } catch (error) {
        console.error('Error fetching announcements:', error);
        return [];
    }
}

/**
 * Delete a user (Admin only)
 */
export async function deleteUser(userId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'No autenticado' };
    }

    try {
        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        });

        if (currentUser?.role !== 'ADMIN' && session.user.email?.toLowerCase() !== 'orostizagamario@gmail.com') {
            return { success: false, error: 'No autorizado' };
        }

        // Manual cleanup because cascade might not be applied
        await prisma.$transaction(async (tx: any) => {
            // 1. Remove from all Jams attendance
            await tx.jamAttendance.deleteMany({ where: { userId } });

            // 2. Remove all participations
            await tx.participation.deleteMany({ where: { userId } });

            // 3. Remove all messages (Jams & DMs)
            await tx.message.deleteMany({ where: { userId } });
            await tx.directMessage.deleteMany({ where: { OR: [{ senderId: userId }, { receiverId: userId }] } });

            // 4. Remove uploaded media
            await tx.media.deleteMany({ where: { userId } });

            // 5. Remove announcements
            await tx.announcement.deleteMany({ where: { userId } });

            // 6. Remove notifications
            await tx.notification.deleteMany({ where: { userId } });

            // 7. Delete hosted Jams (this might need to delete ITS related stuff if Jam cascade is missing)
            // Ideally we delete Jams and let Jam deletion logic handle it, but here we just delete the Jam
            // We should ideally fetch jams and delete them to trigger THEIR cascades if manual, but let's assume
            // Jam -> parts have cascade OR we just delete Jams and hope for best or delete their contents too.
            // Let's try to delete Jams directly. If it fails, we know we need more manual cleanup.
            // To be safe, let's delete messages in jams hosted by user? No, too complex.
            // Let's assume Jam cascade works or we blindly delete.

            const hostedJams = await tx.jam.findMany({ where: { hostId: userId }, select: { id: true } });
            if (hostedJams.length > 0) {
                const jamIds = hostedJams.map((j: any) => j.id);
                // Delete stuff in these Jams
                await tx.theme.deleteMany({ where: { jamId: { in: jamIds } } });
                await tx.message.deleteMany({ where: { jamId: { in: jamIds } } });
                await tx.jamAttendance.deleteMany({ where: { jamId: { in: jamIds } } });
                await tx.jam.deleteMany({ where: { hostId: userId } });
            }

            // 8. Delete the User
            await tx.user.delete({ where: { id: userId } });
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error deleting user:', error);
        return { success: false, error: 'Error al eliminar usuario' };
    }
}

