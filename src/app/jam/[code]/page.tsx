import { use } from 'react';
import JamClientLoader from '@/components/JamClientLoader';
import { getJam } from '@/app/actions';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';

interface PageProps {
    params: Promise<{ code: string }>;
}

export default async function JamPage({ params }: PageProps) {
    const { code } = await params;
    const jamData = await getJam(code);

    if (!jamData) {
        notFound();
    }

    // Transform Prisma data to Store types
    // Prisma Date objects need to be serializable if passed to client directly?
    // Next.js Server Components serialize automatically, but let's be safe if needed.
    // For now we pass as is, assuming basic serialization works for Dates.

    // We need to flatten the themes/participations structure for the store
    const themes = jamData.themes.map((t: any) => ({
        id: t.id,
        name: t.name,
        tonality: t.tonality || '',
        status: t.status as 'OPEN' | 'QUEUED' | 'PLAYING' | 'FINISHED',
        jamId: t.jamId
    }));

    const participations = jamData.themes.flatMap((t: any) =>
        t.participations.map((p: any) => ({
            id: p.id,
            userId: p.userId,
            userName: p.user.name || "Invitado",
            themeId: p.themeId,
            instrument: p.instrument,
            status: p.status as 'WAITING' | 'SELECTED',
            createdAt: p.createdAt,
            user: {
                id: p.user.id,
                name: p.user.name || 'Invitado',
                role: p.user.role as 'USER' | 'ADMIN',
                image: p.user.image,
                city: p.user.city,
                mainInstrument: p.user.mainInstrument
            }
        }))
    );

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
        createdAt: jamData.createdAt,
        isPrivate: jamData.isPrivate
    };

    const session = await auth();

    // Serialize for Client Component (fix for Date objects)
    const serializedJam = JSON.parse(JSON.stringify(jam));
    const serializedThemes = JSON.parse(JSON.stringify(themes));
    const serializedParticipations = JSON.parse(JSON.stringify(participations));

    const currentUser = session?.user ? {
        id: session.user.id,
        name: session.user.name || 'Usuario',
        role: (session.user.role as 'USER' | 'ADMIN') || 'USER',
    } : undefined;

    return <JamClientLoader
        initialJam={serializedJam}
        initialThemes={serializedThemes}
        initialParticipations={serializedParticipations}
        currentUser={currentUser}
    />;
}
