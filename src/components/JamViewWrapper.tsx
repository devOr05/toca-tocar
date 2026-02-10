'use client';

import dynamic from 'next/dynamic';
import { Jam, Theme, Participation } from '@/types';
import { Music2 } from 'lucide-react';

// Dynamic import of the real JamView with SSR disabled
const JamViewValues = dynamic(() => import('@/components/JamView'), {
    ssr: false,
    loading: () => (
        <div className="min-h-screen bg-black" suppressHydrationWarning />
    ),
});

interface JamViewWrapperProps {
    initialJam: Jam;
    initialThemes: Theme[];
    initialParticipations: Participation[];
    currentUserId?: string;
}

export default function JamViewWrapper(props: JamViewWrapperProps) {
    return (
        <div suppressHydrationWarning>
            <JamViewValues {...props} />
        </div>
    );
}
