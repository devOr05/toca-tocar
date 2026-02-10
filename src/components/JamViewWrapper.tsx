'use client';

import dynamic from 'next/dynamic';
import { Jam, Theme, Participation } from '@/types';
import { Music2 } from 'lucide-react';

// Dynamic import of the real JamView with SSR disabled
const JamViewValues = dynamic(() => import('@/components/JamView'), {
    ssr: false,
    loading: () => (
        <div className="min-h-screen flex items-center justify-center bg-background" suppressHydrationWarning>
    loading: () => (
            <div className="min-h-screen flex items-center justify-center bg-background" suppressHydrationWarning>
                <div className="p-4 bg-jazz-surface border border-white/5 rounded-full shadow-2xl animate-spin-slow">
                    <Music2 className="w-8 h-8 text-jazz-gold" />
                </div>
            </div>
            ),
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
