import { use } from 'react';
import JamView from '@/components/JamView';
import { getJam } from '@/app/actions';
import { notFound } from 'next/navigation';

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
    const themes = jamData.themes.map(t => ({
        id: t.id,
        name: t.name,
        tonality: t.tonality || '',
        status: t.status as 'OPEN' | 'QUEUED' | 'PLAYING' | 'FINISHED',
        jamId: t.jamId
    }));

    const participations = jamData.themes.flatMap(t =>
        t.participations.map(p => ({
            id: p.id,
            userId: p.userId,
            userName: p.user.name || "Invitado",
            themeId: p.themeId,
            instrument: p.instrument,
            status: p.status as 'WAITING' | 'SELECTED',
            createdAt: p.createdAt
        }))
    );

    const jam = {
        id: jamData.id,
        code: jamData.code,
        name: jamData.name,
        description: jamData.description || undefined,
        location: jamData.location || undefined,
        status: jamData.status as 'SCHEDULED' | 'ACTIVE' | 'FINISHED',
        hostId: jamData.hostId,
        createdAt: jamData.createdAt
    };

    return <JamView initialJam={jam} initialThemes={themes} initialParticipations={participations} />;
}
