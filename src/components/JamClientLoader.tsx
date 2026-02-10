'use client';

import dynamic from 'next/dynamic';
import { Jam, Theme, Participation, User } from '@/types';
import { ErrorBoundary } from './ErrorBoundary';

const JamViewWrapper = dynamic(() => import('./JamViewWrapper'), {
    ssr: false,
    loading: () => (
        <div className="min-h-screen flex items-center justify-center bg-black text-jazz-gold animate-pulse">
            Cargando entorno...
        </div>
    )
});

interface JamClientLoaderProps {
    initialJam: Jam;
    initialThemes: Theme[];
    initialParticipations: Participation[];
    currentUser?: User;
}

export default function JamClientLoader(props: JamClientLoaderProps) {
    return (
        <ErrorBoundary>
            <JamViewWrapper {...props} />
        </ErrorBoundary>
    );
}
