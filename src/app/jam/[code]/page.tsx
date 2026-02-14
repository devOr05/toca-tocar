import JamClientLoader from '@/components/JamClientLoader';
import { MOCK_JAM, MOCK_THEMES, MOCK_PARTICIPATIONS } from '@/lib/mock-data';
import { Jam, Theme, Participation } from '@/types';

interface PageProps {
    params: Promise<{ code: string }>;
}

export default async function JamPage({ params }: PageProps) {
    const { code } = await params;

    // For local development, use mock data
    // In production, this would fetch from database
    if (code !== 'JAZZ') {
        // Only JAZZ code works with mock data
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Jam no encontrado</h1>
                    <p className="text-white/60 mb-4">
                        En desarrollo local, usa el código <code className="bg-white/10 px-2 py-1 rounded">JAZZ</code>
                    </p>
                    <a
                        href="/jam/JAZZ"
                        className="inline-block bg-jazz-gold text-black px-6 py-3 rounded-lg font-bold hover:bg-jazz-gold/90 transition-colors"
                    >
                        Ir al Jam de Prueba
                    </a>
                </div>
            </div>
        );
    }

    // Use mock data
    const jam: Jam = {
        ...MOCK_JAM,
        code: 'JAZZ',
    };

    const themes: Theme[] = MOCK_THEMES;
    const participations: Participation[] = MOCK_PARTICIPATIONS;

    // Serialize for Client Component
    const serializedJam = JSON.parse(JSON.stringify(jam));
    const serializedThemes = JSON.parse(JSON.stringify(themes));
    const serializedParticipations = JSON.parse(JSON.stringify(participations));

    return <JamClientLoader
        initialJam={serializedJam}
        initialThemes={serializedThemes}
        initialParticipations={serializedParticipations}
        currentUser={undefined}
    />;
}
