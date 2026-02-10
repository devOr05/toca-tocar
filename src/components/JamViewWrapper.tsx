'use client';

import dynamic from 'next/dynamic';
import { Jam, Theme, Participation } from '@/types';
import { Music2 } from 'lucide-react';

// Dynamic import of the real JamView with SSR disabled
const JamViewValues = dynamic(() => import('@/components/JamView'), {
    ssr: false,
    loading: () => (
        <div className="min-h-screen flex items-center justify-center bg-background" suppressHydrationWarning>
            <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-jazz-surface border border-white/5 rounded-full shadow-2xl animate-spin-slow">
                    <Music2 className="w-8 h-8 text-jazz-gold" />
                </div>
                <p className="text-jazz-muted text-xs font-mono animate-pulse" suppressHydrationWarning>Cargando Jam...</p>
            </div>
        </div>
    ),
});

interface JamViewWrapperProps {
    initialJam: Jam;
    initialThemes: Theme[];
    initialParticipations: Participation[];
    currentUserId?: string;
}

export default function JamViewWrapper(props: JamViewWrapperProps) {
    return <JamViewValues {...props} />;
}
