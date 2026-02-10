'use client';

import { useState, useEffect } from 'react';
import { Jam, Theme, Participation, User } from '@/types';
import dynamic from 'next/dynamic';
const JamView = dynamic(() => import('@/components/JamView'), { ssr: false });

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
        <div suppressHydrationWarning className="p-10 text-center text-white">
            <h1 className="text-4xl font-bold text-jazz-gold mb-4">MODO DEBUG</h1>
            <p className="mb-4">Si ves esto, el error #310 NO está en el layout ni en el servidor.</p>
            <p>El problema está dentro de JamView.</p>
            {/* <JamView {...props} /> */}
        </div>
    );
}
