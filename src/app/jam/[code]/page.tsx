import JamClientLoader from '@/components/JamClientLoader';
import { getJam } from '@/app/actions';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';

interface PageProps {
    params: Promise<{ code: string }>;
}

export default async function JamPage({ params }: PageProps) {
    const { code } = await params;
    const session = await auth();

    let jamData;
    try {
        jamData = await getJam(code);
    } catch (error) {
        console.error('Error fetching jam:', error);
        notFound();
    }

    if (!jamData) {
        notFound();
    }

    // Transform Prisma data to Store types
    const themes = jamData.themes.map((t: any) => ({
        id: t.id,
        name: t.name,
        tonality: t.tonality || '',
        description: t.description || '',
        sheetMusicUrl: t.sheetMusicUrl || '',
        status: t.status as 'OPEN' | 'QUEUED' | 'PLAYING' | 'FINISHED',
        type: t.type || 'SONG',
        jamId: t.jamId
    }));

    const participations = jamData.themes.flatMap((t: any) =>
        t.participations
            .filter((p: any) => p.user) // Filter out participations without users
            .map((p: any) => ({
                id: p.id,
                userId: p.userId,
                userName: p.user?.name || "Invitado",
                themeId: p.themeId,
                instrument: p.instrument,
                status: p.status as 'WAITING' | 'SELECTED',
                createdAt: p.createdAt,
                user: {
                    id: p.user.id,
                    name: p.user.name || 'Invitado',
                    role: (p.user.role as 'USER' | 'ADMIN') || 'USER',
                    image: p.user.image || null,
                    city: p.user.city || null,
                    mainInstrument: p.user.mainInstrument || null
                }
            }))
    );

    // Assuming jamData now includes attendance due to the instruction
    const attendance = jamData.attendance?.map((a: any) => ({
        id: a.id,
        userId: a.userId,
        jamId: a.jamId,
        status: a.status,
        user: {
            id: a.user.id,
            name: a.user.name || 'Invitado',
            role: (a.user.role as 'USER' | 'ADMIN') || 'USER',
            image: a.user.image || null,
            city: a.user.city || null,
            mainInstrument: a.user.mainInstrument || null
        }
    })) || [];

    const jam = {
        id: jamData.id,
        code: jamData.code,
        name: jamData.name,
        description: jamData.description || undefined,
        location: jamData.location || undefined,
        city: jamData.city || undefined,
        flyerUrl: jamData.flyerUrl || undefined,
        lat: jamData.lat || undefined,
        lng: jamData.lng || undefined,
        startTime: jamData.startTime || undefined,
        status: jamData.status as 'SCHEDULED' | 'ACTIVE' | 'FINISHED',
        hostId: jamData.hostId,
        openingBand: jamData.openingBand,
        openingInfo: jamData.openingInfo,
        openingThemes: jamData.openingThemes,
        openingMusicians: jamData.openingMusicians,
        createdAt: jamData.createdAt,
        isPrivate: jamData.isPrivate,
        attendance: attendance
    };

    // Serialize for Client Component (fix for Date objects)
    const serializedJam = JSON.parse(JSON.stringify(jam));
    const serializedThemes = JSON.parse(JSON.stringify(themes));
    const serializedParticipations = JSON.parse(JSON.stringify(participations));

    // Fetch fresh user data for currentUser to ensure role is up to date
    let currentUser = undefined;
    if (session?.user?.id) {
        const { prisma } = await import('@/lib/prisma');
        const userDb = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (userDb) {
            currentUser = {
                id: userDb.id,
                name: userDb.name || 'Usuario',
                email: userDb.email,
                role: (userDb.role as 'USER' | 'ADMIN') || 'USER',
                city: userDb.city || null,
                mainInstrument: userDb.mainInstrument || null,
                image: userDb.image || null
            };
        }
    }

    // Fetch other musicians in the same city (if jam has city)
    let cityMusicians = [];
    if (jamData.city) {
        // Robust city search: split by commas/spaces and search for any significant term
        const cityTerms = jamData.city.split(/[\s,]+/).filter((t: string) => t.length > 2);

        const { prisma } = await import('@/lib/prisma');
        const usersInCity = await prisma.user.findMany({
            where: {
                OR: cityTerms.length > 0
                    ? cityTerms.map((term: string) => ({
                        city: {
                            contains: term,
                            mode: 'insensitive'
                        }
                    })) as any
                    : [{ city: { contains: jamData.city, mode: 'insensitive' } }] as any,
                NOT: { id: session?.user?.id } // Exclude current user
            },
            take: 20,
            select: { id: true, name: true, image: true, mainInstrument: true, city: true }
        });
        cityMusicians = JSON.parse(JSON.stringify(usersInCity));
    }

    return <JamClientLoader
        initialJam={serializedJam}
        initialThemes={serializedThemes}
        initialParticipations={serializedParticipations}
        currentUser={currentUser}
        initialCityMusicians={cityMusicians}
    />;
}
