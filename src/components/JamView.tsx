'use client';

import { useEffect, useState } from 'react';
import { useJamStore } from '../store/jamStore';
import { leaveJam } from '@/app/actions';
import ThemeList from './ThemeList';
import { Share2, Users, Music2, LogOut, Trash2, Calendar, MapPin, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Jam, Theme, Participation, User } from '../types';
import CreateThemeModal from './CreateThemeModal';
import { Plus } from 'lucide-react';
import JamChat from './JamChat';
import MusicianList from './MusicianList';

interface JamViewProps {
    initialJam: Jam;
    initialThemes: Theme[];
    initialParticipations: Participation[];
    currentUser?: User; // Changed from currentUserId string
}

export default function JamView({ initialJam, initialThemes, initialParticipations, currentUser: initialUser }: JamViewProps) {
    const router = useRouter();
    const { jam, setUser, setAuthenticatedUser, currentUser, setJamState } = useJamStore();
    const [mounted, setMounted] = useState(false);
    const [formattedDate, setFormattedDate] = useState<string>('');
    const [isCreateThemeOpen, setIsCreateThemeOpen] = useState(false);

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

        // Initialize User
        if (initialUser) {
            // Authenticated User
            console.log('Syncing Authenticated User:', initialUser);
            setAuthenticatedUser(initialUser);
        } else if (!currentUser) {
            // Guest User Check
            const storedName = localStorage.getItem('toca_tocar_user_name');
            if (storedName) {
                setUser(storedName);
            } else {
                // Only redirect if NO session AND NO local storage
                router.push(`/?code=${initialJam.code}`);
            }
        }
    }, [initialJam, initialThemes, initialParticipations, setJamState, initialUser, currentUser, setUser, setAuthenticatedUser, router]);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-black pb-20">
            <header className="sticky top-0 z-50 bg-jazz-surface/90 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-white/10 transition-colors group"
                    >
                        <div className="bg-jazz-gold/10 p-2 rounded-lg group-hover:bg-jazz-gold group-hover:text-black transition-colors">
                            <LogOut className="w-4 h-4 text-jazz-gold group-hover:text-black rotate-180" />
                        </div>
                        <span className="text-xs font-bold text-jazz-gold uppercase tracking-wider">Salir</span>
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
                {/* Pass isHost to ThemeList (we need to update ThemeList to accept it) */}
                {/* For now, let's assume ThemeList handles its own logic or we update it next */}
                <div className="pb-24">
                    <ThemeList />
                </div>
            </main>

            {/* Sidebar / Drawer for Chat & Participants */}
            {/* Desktop: Fixed Right Sidebar. Mobile: Maybe a toggle? */}
            {/* User asked for "pantalla al costado". Let's try a slide-over or fixed column on large screens */}

            {currentUser && (
                <div className="hidden lg:flex fixed top-20 right-4 bottom-4 w-80 flex-col gap-4">
                    {/* Participants */}
                    <div className="flex-1 bg-jazz-surface border border-white/10 rounded-xl overflow-hidden shadow-xl">
                        <MusicianList
                            users={Array.from(new Set(initialParticipations.map(p => p.userId)))
                                .map(id => initialParticipations.find(p => p.userId === id)?.user)
                                .filter(u => u !== undefined) as User[]}
                            title="Músicos en la Jam"
                            emptyMessage="Nadie se ha unido aún."
                        />
                    </div>

                    {/* Chat */}
                    <div className="h-[400px] shadow-xl">
                        <JamChat
                            jamId={initialJam.id}
                            currentUser={currentUser}
                        />
                    </div>
                </div>
            )}

            {/* Mobile Chat / Participants Toggle could go here (e.g. Tabs) */}
            {/* For MVP let's keep it simple, maybe just below content on mobile? */}
            {currentUser && (
                <div className="lg:hidden px-4 mb-24 space-y-6">
                    <div className="bg-jazz-surface border border-white/10 rounded-xl overflow-hidden p-4">
                        <h3 className="font-bold text-white mb-2">Músicos en la Jam</h3>
                        <div className="flex overflow-x-auto gap-2 pb-2">
                            {Array.from(new Set(initialParticipations.map(p => p.userId)))
                                .map(id => initialParticipations.find(p => p.userId === id)?.user)
                                .filter(u => u !== undefined).map(u => (
                                    <div key={u!.id} className="flex flex-col items-center min-w-[60px]">
                                        <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden border border-white/10">
                                            {u!.image ? <img src={u!.image} className="w-full h-full object-cover" /> : <div className="p-2">🎷</div>}
                                        </div>
                                        <span className="text-[10px] text-white truncate w-full text-center mt-1">{u!.name}</span>
                                    </div>
                                ))}
                        </div>
                    </div>

                    <div className="h-[400px]">
                        <JamChat
                            jamId={initialJam.id}
                            currentUser={currentUser}
                        />
                    </div>
                </div>
            )}

            {/* Float Button for Create Theme */}
            <button
                onClick={() => setIsCreateThemeOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-jazz-gold text-black rounded-full shadow-[0_0_20px_rgba(251,191,36,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group"
            >
                <Plus className="w-7 h-7" />
                <span className="absolute right-full mr-3 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Proponer Tema
                </span>
            </button>

            <CreateThemeModal
                isOpen={isCreateThemeOpen}
                onClose={() => setIsCreateThemeOpen(false)}
                jamCode={jam.code}
            />
        </div>
    );
}
