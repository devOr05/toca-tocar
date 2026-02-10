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
        <div className="min-h-screen bg-black pb-20">
            <header className="sticky top-0 z-50 bg-jazz-surface/90 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="p-1 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <div className="bg-jazz-gold/10 p-2 rounded-lg">
                            <Music2 className="w-5 h-5 text-jazz-gold" />
                        </div>
                    </button>

                    <div>
                        <h1 className="font-bold text-white text-sm leading-tight flex items-center gap-2">
                            {initialJam.name}
                            {initialJam.isPrivate && <span className="text-[10px] bg-red-500/20 text-red-200 px-1.5 py-0.5 rounded border border-red-500/30">Privada 🔒</span>}
                        </h1>
                        <p className="text-[10px] text-jazz-muted font-mono tracking-widest">CODE: <span className="text-jazz-accent">{initialJam.code}</span></p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-jazz-accent to-purple-600 flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-black">
                        {currentUser?.name.slice(0, 2).toUpperCase() || '?'}
                    </div>
                </div>
            </header>

            <main className="p-4 max-w-lg mx-auto space-y-6">

                {/* JAM INFO CARD */}
                <div className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-3 shadow-lg">
                    {/* Description */}
                    {initialJam.description && (
                        <p className="text-white/90 text-sm whitespace-pre-wrap leading-relaxed">
                            {initialJam.description}
                        </p>
                    )}

                    <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                        {/* Date */}
                        {/* Date */}
                        {formattedDate && (
                            <div className="flex items-center gap-2 text-jazz-muted text-xs">
                                <Calendar className="w-4 h-4 text-jazz-gold shrink-0" />
                                <span>{formattedDate}</span>
                            </div>
                        )}

                        {/* Location */}
                        {(initialJam.location || initialJam.city) && (
                            <div className="flex items-center gap-2 text-jazz-muted text-xs">
                                <MapPin className="w-4 h-4 text-jazz-gold shrink-0" />
                                <a
                                    href={initialJam.lat && initialJam.lng
                                        ? `https://www.google.com/maps/search/?api=1&query=${initialJam.lat},${initialJam.lng}`
                                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((initialJam.location || '') + ' ' + (initialJam.city || ''))}`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-white underline decoration-jazz-gold/50 transition-colors"
                                >
                                    {initialJam.location}{initialJam.city ? `, ${initialJam.city}` : ''}
                                </a>
                            </div>
                        )}

                        {/* Flyer Link or Image */}
                        {initialJam.flyerUrl && (
                            <div className="pt-2">
                                {/* Simple check for image extension */}
                                {['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].some(ext => initialJam.flyerUrl?.toLowerCase().endsWith(ext)) ? (
                                    <div className="rounded-xl overflow-hidden border border-white/10 relative">
                                        <img
                                            src={initialJam.flyerUrl}
                                            alt="Flyer del evento"
                                            className="w-full h-auto max-h-96 object-cover"
                                            onError={(e) => {
                                                // Fallback to link if load fails
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                            }}
                                        />
                                        {/* Fallback Link (hidden by default unless error) */}
                                        <a
                                            href={initialJam.flyerUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hidden absolute inset-0 flex items-center justify-center bg-black/50 text-white font-bold"
                                        >
                                            Ver Flyer Original
                                        </a>
                                    </div>
                                ) : (
                                    <a
                                        href={initialJam.flyerUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs text-jazz-gold hover:text-white transition-colors bg-jazz-gold/10 px-2 py-1.5 rounded-lg border border-jazz-gold/20"
                                    >
                                        <ImageIcon className="w-3 h-3" />
                                        Ver Flyer / Evento
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ThemeList */}
                <ThemeList />
            </main>
        </div>
    );
}
