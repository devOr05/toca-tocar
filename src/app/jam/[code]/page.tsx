'use client';

import { useEffect, useState } from 'react';
import JamClientLoader from '@/components/JamClientLoader';
import { getJam } from '@/app/actions';
import { notFound, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Jam, Theme, Participation } from '@/types';

export default function JamPage() {
    const params = useParams();
    const code = params?.code as string;
    const { data: session } = useSession();
    const [jamData, setJamData] = useState<{
        jam: Jam;
        themes: Theme[];
        participations: Participation[];
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadJam() {
            if (!code) {
                notFound();
                return;
            }

            const data = await getJam(code);

            if (!data) {
                notFound();
                return;
            }

            // Transform Prisma data to Store types
            const themes = data.themes.map((t: any) => ({
                id: t.id,
                name: t.name,
                tonality: t.tonality || '',
                status: t.status as 'OPEN' | 'QUEUED' | 'PLAYING' | 'FINISHED',
                jamId: t.jamId
            }));

            const participations = data.themes.flatMap((t: any) =>
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

            const jam = {
                id: data.id,
                code: data.code,
                name: data.name,
                description: data.description || undefined,
                location: data.location || undefined,
                city: data.city || undefined,
                flyerUrl: data.flyerUrl || undefined,
                lat: data.lat || undefined,
                lng: data.lng || undefined,
                startTime: data.startTime || undefined,
                status: data.status as 'SCHEDULED' | 'ACTIVE' | 'FINISHED',
                hostId: data.hostId,
                createdAt: data.createdAt,
                isPrivate: data.isPrivate
            };

            // Serialize for Client Component (fix for Date objects)
            const serializedJam = JSON.parse(JSON.stringify(jam));
            const serializedThemes = JSON.parse(JSON.stringify(themes));
            const serializedParticipations = JSON.parse(JSON.stringify(participations));

            setJamData({
                jam: serializedJam,
                themes: serializedThemes,
                participations: serializedParticipations
            });
            setLoading(false);
        }

        loadJam();
    }, [code]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-jazz-gold animate-pulse">
                Cargando jam...
            </div>
        );
    }

    if (!jamData) {
        notFound();
        return null;
    }

    const currentUser = session?.user ? {
        id: session.user.id,
        name: session.user.name || 'Usuario',
        role: (session.user.role as 'USER' | 'ADMIN') || 'USER',
    } : undefined;

    return <JamClientLoader
        initialJam={jamData.jam}
        initialThemes={jamData.themes}
        initialParticipations={jamData.participations}
        currentUser={currentUser}
    />;
}
