'use client';

import { useState, useEffect } from 'react';
import { Jam, Theme, Participation, User } from '@/types';
import dynamic from 'next/dynamic';
const JamView = dynamic(() => import('@/components/JamView'), { ssr: false });
import { Music2 } from 'lucide-react';

interface JamViewWrapperProps {
    initialJam: Jam;
    initialThemes: Theme[];
    initialParticipations: Participation[];
    currentUser?: User;
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
        <div suppressHydrationWarning>
            <JamView {...props} />
        </div>
    );
}
