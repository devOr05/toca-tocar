'use client';

import { useEffect, useState } from 'react';
import { useJamStore } from '../store/jamStore';
import { leaveJam } from '@/app/actions';
import ThemeList from './ThemeList';
import { Share2, Users, Music2, LogOut, Trash2, Calendar, MapPin, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Jam, Theme, Participation } from '../types';

interface JamViewProps {
    initialJam: Jam;
    initialThemes: Theme[];
    initialParticipations: Participation[];
    currentUserId?: string;
}

export default function JamView({ initialJam, initialThemes, initialParticipations, currentUserId }: JamViewProps) {
    const router = useRouter();
    const { jam, setUser, currentUser, setJamState } = useJamStore();
    const [mounted, setMounted] = useState(false);
    const [formattedDate, setFormattedDate] = useState<string>('');

    useEffect(() => {
        // Hydrate store with server data
        setJamState(initialJam, initialThemes, initialParticipations);

        if (initialJam.startTime) {
            const date = new Date(initialJam.startTime);
            const dateStr = date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
            const timeStr = date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
            setFormattedDate(`${dateStr} • ${timeStr} hs`);
        }

        setMounted(true);
        // ... rest of existing useEffect logic

        // Don't redirect based on localStorage.
        if (currentUserId && !currentUser) {
            // we know we are logged in.
            console.log('Session active, skipping redirect');
        } else {
            const storedName = localStorage.getItem('toca_tocar_user_name');
            if (storedName && !currentUser) {
                setUser(storedName);
            } else if (!storedName && !currentUserId) {
                // Only redirect if NO session AND NO local storage
                router.push(`/?code=${initialJam.code}`);
            }
        }
    }, [initialJam, initialThemes, initialParticipations, setJamState, currentUser, setUser, router]);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-black text-white p-10">
            <h1 className="text-2xl text-green-500">JAM VIEW MOUNTED (SAFE MODE)</h1>
            <p>Si ves esto, el problema está en la lógica de datos, no en el componente.</p>
        </div>
    );
}
