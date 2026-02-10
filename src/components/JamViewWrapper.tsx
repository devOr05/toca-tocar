'use client';

import { useState, useEffect } from 'react';
import { Jam, Theme, Participation } from '@/types';
import JamView from '@/components/JamView';
import { Music2 } from 'lucide-react';

interface JamViewWrapperProps {
    initialJam: Jam;
    initialThemes: Theme[];
    initialParticipations: Participation[];
    currentUserId?: string;
}

export default function JamViewWrapper(props: JamViewWrapperProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="min-h-screen bg-black" suppressHydrationWarning />;
    }

    return (
        <div suppressHydrationWarning className="min-h-screen flex items-center justify-center text-white">
            <h1>DEBUG MODE: Si ves esto, el entorno funciona.</h1>
            {/* <JamView {...props} /> */}
        </div>
    );
}
