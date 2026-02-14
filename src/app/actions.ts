'use server';

import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { auth, signOut } from '@/auth';
import { revalidatePath } from 'next/cache';

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
        // Check if user is the host
        const jam = await prisma.jam.findUnique({
            where: { code: jamCode },
            select: { hostId: true }
        });

        if (!jam) {
            return { success: false, error: 'Jam no encontrada' };
        }

        if (jam.hostId !== session.user.id) {
            return { success: false, error: 'Solo el anfitrión puede eliminar la jam' };
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
    const isPrivate = formData.get('isPrivate') === 'on'; // Checkbox
    const flyerUrl = formData.get('flyerUrl') as string;
    const lat = parseFloat(formData.get('lat') as string) || null;
    const lng = parseFloat(formData.get('lng') as string) || null;

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
                themes: {
                    include: {
                        participations: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
            },
        });
        return jam;
    } catch (error) {
        console.error('Error fetching jam:', error);
        return null;
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
            },
        });

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
        if (!jam || jam.hostId !== session.user.id) {
            return { success: false, error: 'No autorizado' };
        }

        await prisma.jam.update({
            where: { id: jamId },
            data: { status },
        });

        revalidatePath(`/jam/${jam.code}`);
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

        if (!theme || theme.jam.hostId !== session.user.id) {
            return { success: false, error: 'No autorizado' };
        }

        await prisma.theme.update({
            where: { id: themeId },
            data: { status },
        });

        revalidatePath(`/jam/${theme.jam.code}`);
        return { success: true };
    } catch (error) {
        console.error('Error updating theme status:', error);
        return { success: false, error: 'Error al actualizar el estado del tema' };
    }
}

export async function joinTheme(themeId: string, instrument: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'No autenticado' };
    }

    try {
        await prisma.participation.create({
            data: {
                userId: session.user.id,
                themeId,
                instrument,
                status: 'WAITING',
            },
        });
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
        return { success: true };
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

export async function sendMessage(jamId: string, content: string, themeId?: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'No autenticado' };
    }

    try {
        await prisma.message.create({
            data: {
                content,
                userId: session.user.id,
                jamId,
                themeId: themeId || undefined,
            },
        });
        return { success: true };
    } catch (error) {
        console.error('Error sending message:', error);
        return { success: false, error: 'Error al enviar el mensaje' };
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
        console.error('Error fetching messages:', error);
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
        const suggestions = STANDARD_THEMES.filter(
            st => !existingThemeNames.includes(st.name.toLowerCase())
        );

        return suggestions;
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

        // Check if user is host
        if (theme.jam.hostId !== session.user.id) {
            return { success: false, error: 'Solo el anfitrión puede eliminar temas' };
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

        return { success: true };
    } catch (error) {
        console.error('Error deleting theme:', error);
        return { success: false, error: 'Error al eliminar el tema' };
    }
}

/**
 * Reorder themes (host only)
 */
export async function reorderThemes(jamId: string, themeIds: string[]) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'No autenticado' };
    }

    try {
        // Check if user is host
        const jam = await prisma.jam.findUnique({ where: { id: jamId } });
        if (!jam || jam.hostId !== session.user.id) {
            return { success: false, error: 'Solo el anfitrión puede reordenar temas' };
        }

        // Note: This requires adding an 'order' field to Theme model
        // For now, we'll just return success - implement order field later
        return { success: true };
    } catch (error) {
        console.error('Error reordering themes:', error);
        return { success: false, error: 'Error al reordenar temas' };
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
