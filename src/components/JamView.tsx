'use client';

import { useEffect, useState } from 'react';
import { useJamStore } from '../store/jamStore';
import { leaveJam } from '@/app/actions';
import ThemeList from './ThemeList';
import { Share2, Users, Music2, LogOut, Trash2 } from 'lucide-react';
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
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        // Hydrate store with server data
        setJamState(initialJam, initialThemes, initialParticipations);

        setMounted(true);
        const storedName = localStorage.getItem('toca_tocar_user_name');
        if (storedName && !currentUser) {
            setUser(storedName);
        } else if (!storedName) {
            router.push(`/?code=${initialJam.code}`);
        }
    }, [initialJam, initialThemes, initialParticipations, setJamState, currentUser, setUser, router]);

    const handleLeave = async () => {
        if (!confirm('¿Seguro que quieres abandonar la Jam? Se borrarán tus participaciones.')) return;

        setIsLeaving(true);
        await leaveJam(initialJam.code);
        router.push('/dashboard');
    };

    if (!mounted) return null;

    const isHost = currentUserId === initialJam.hostId;

    return (
        <div className="min-h-screen bg-background pb-20">
            <header className="sticky top-0 z-50 bg-jazz-surface/90 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-jazz-gold/10 p-2 rounded-lg">
                        <Music2 className="w-5 h-5 text-jazz-gold" />
                    </div>
                    <div>
                        <h1 className="font-bold text-white text-sm leading-tight">{initialJam.name}</h1>
                        <p className="text-[10px] text-jazz-muted font-mono tracking-widest">CODE: <span className="text-jazz-accent">{initialJam.code}</span></p>
                    </div>
                    {isHost && (
                        <button
                            onClick={async () => {
                                if (confirm('¿ELIMINAR JAM? Esta acción no se puede deshacer.')) {
                                    const { deleteJam } = await import('@/app/actions');
                                    await deleteJam(initialJam.code);
                                    router.push('/dashboard');
                                }
                            }}
                            className="ml-2 text-red-500/50 hover:text-red-500 transition-colors"
                            title="Eliminar Evento"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Leave Button (Only for non-hosts) */}
                    {!isHost && currentUserId && (
                        <button
                            onClick={handleLeave}
                            disabled={isLeaving}
                            className="p-2 text-red-400/60 hover:text-red-400 transition-colors"
                            title="Salir de la Jam"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    )}

                    <button
                        onClick={async () => {
                            const shareData = {
                                title: `Jam: ${initialJam.name}`,
                                text: `¡Únete a la Jam "${initialJam.name}" en Toca Tocar!`,
                                url: window.location.href
                            };

                            if (navigator.share) {
                                try {
                                    await navigator.share(shareData);
                                } catch (err) {
                                    console.log('Error sharing:', err);
                                }
                            } else {
                                navigator.clipboard.writeText(window.location.href);
                                alert('Enlace copiado al portapapeles! 📋');
                            }
                        }}
                        className="p-2 text-white/40 hover:text-white transition-colors"
                    >
                        <Share2 className="w-5 h-5" />
                    </button>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-jazz-accent to-purple-600 flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-black">
                        {currentUser?.name.slice(0, 2).toUpperCase() || '?'}
                    </div>
                </div>
            </header>

            <main className="p-4 max-w-lg mx-auto">
                <ThemeList />
            </main>

            <button className="fixed bottom-6 right-6 w-14 h-14 bg-jazz-gold text-black rounded-full shadow-lg shadow-jazz-gold/20 flex items-center justify-center hover:scale-110 transition-transform active:scale-95">
                <span className="text-3xl font-light mb-1">+</span>
            </button>
        </div>
    );
}
