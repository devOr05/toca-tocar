'use client';

import { useEffect, useState } from 'react';
import { useJamStore } from '../store/jamStore';
import { leaveJam } from '@/app/actions';
import ThemeList from './ThemeList';
import { Share2, Users, Music2, LogOut, Trash2, Calendar, MapPin, Image as ImageIcon, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Jam, Theme, Participation, User } from '../types';
import CreateThemeModal from './CreateThemeModal';
import JamChat from './JamChat';
import MusicianList from './MusicianList';

interface JamViewProps {
    initialJam: Jam;
    initialThemes: Theme[];
    initialParticipations: Participation[];
    currentUser?: User;
}

export default function JamView({ initialJam, initialThemes, initialParticipations, currentUser: initialUser }: JamViewProps) {
    const router = useRouter();
    const { jam, setUser, setAuthenticatedUser, currentUser, setJamState } = useJamStore();
    const [mounted, setMounted] = useState(false);
    const [formattedDate, setFormattedDate] = useState<string>('');
    const [isCreateThemeOpen, setIsCreateThemeOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'THEMES' | 'FORUM'>('THEMES');

    useEffect(() => {
        setJamState(initialJam, initialThemes, initialParticipations);

        if (initialJam.startTime) {
            const date = new Date(initialJam.startTime);
            const dateStr = date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
            const timeStr = date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
            setFormattedDate(`${dateStr} • ${timeStr} hs`);
        }

        setMounted(true);

        if (initialUser) {
            setAuthenticatedUser(initialUser);
        } else if (!currentUser) {
            const storedName = localStorage.getItem('toca_tocar_user_name');
            if (storedName) {
                setUser(storedName);
            } else {
                router.push(`/?code=${initialJam.code}`);
            }
        }
    }, [initialJam, initialThemes, initialParticipations, setJamState, initialUser, currentUser, setUser, setAuthenticatedUser, router]);

    if (!mounted) return null;

    // Filter unique users for musician list
    const uniqueMusicians = Array.from(new Set(initialParticipations.map(p => p.userId)))
        .map(id => initialParticipations.find(p => p.userId === id)?.user)
        .filter(u => u !== undefined) as User[];

    return (
        <div className="min-h-screen bg-black pb-20 lg:pb-0 font-sans flex flex-col">
            {/* HEADER */}
            <header className="sticky top-0 z-50 bg-jazz-surface/90 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-white/10 transition-colors group"
                    >
                        <div className="bg-jazz-gold/10 p-2 rounded-lg group-hover:bg-jazz-gold group-hover:text-black transition-colors">
                            <LogOut className="w-4 h-4 text-jazz-gold group-hover:text-black rotate-180" />
                        </div>
                        <span className="hidden sm:inline text-xs font-bold text-jazz-gold uppercase tracking-wider">Salir</span>
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

            {/* DESKTOP LAYOUT (3 Cols) */}
            <div className="hidden lg:flex flex-1 overflow-hidden h-[calc(100vh-64px)]">

                {/* LEFT: MUSICIANS */}
                <aside className="w-64 bg-jazz-surface border-r border-white/5 flex flex-col">
                    <div className="p-4 border-b border-white/5 bg-black/20">
                        <h2 className="text-xs font-bold text-jazz-gold uppercase tracking-widest flex items-center gap-2">
                            <Users className="w-4 h-4" /> Músicos
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <MusicianList
                            users={uniqueMusicians}
                            title=""
                            emptyMessage="Nadie se ha unido aún."
                        />
                    </div>
                </aside>

                {/* CENTER: CONTENT */}
                <main className="flex-1 flex flex-col min-w-0 bg-black/50 relative">
                    {/* Tabs */}
                    <div className="flex items-center border-b border-white/10 bg-black/40 px-4 shrink-0">
                        <button
                            onClick={() => setActiveTab('THEMES')}
                            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'THEMES' ? 'border-jazz-gold text-white' : 'border-transparent text-white/40 hover:text-white'}`}
                        >
                            <Music2 size={16} /> Repertorio
                        </button>
                        <button
                            onClick={() => setActiveTab('FORUM')}
                            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'FORUM' ? 'border-jazz-accent text-white' : 'border-transparent text-white/40 hover:text-white'}`}
                        >
                            <Share2 size={16} /> Foro / Tópicos
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
                        {/* INFO CARD */}
                        <div className="bg-jazz-surface border border-white/5 rounded-xl p-4 shadow-lg shrink-0">
                            {initialJam.description && <p className="text-white/80 text-sm mb-2">{initialJam.description}</p>}
                            {formattedDate && <p className="text-jazz-muted text-xs flex items-center gap-2"><Calendar size={14} /> {formattedDate}</p>}
                            {(initialJam.location || initialJam.city) && (
                                <p className="text-jazz-muted text-xs flex items-center gap-2 mt-1">
                                    <MapPin size={14} />
                                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((initialJam.location || '') + ' ' + (initialJam.city || ''))}`} target="_blank" rel="noopener noreferrer" className="hover:text-white underline">
                                        {initialJam.location}{initialJam.city ? `, ${initialJam.city}` : ''}
                                    </a>
                                </p>
                            )}
                        </div>

                        {activeTab === 'THEMES' ? (
                            <div className="pb-24">
                                <ThemeList />
                            </div>
                        ) : (
                            <div className="pb-24 text-center py-10">
                                <h3 className="text-xl font-bold text-white mb-2">Foro de Discusión</h3>
                                <p className="text-white/40 text-sm">Próximamente: temas de discusión, organización de transporte, etc.</p>
                            </div>
                        )}
                    </div>

                    {/* FAB */}
                    {activeTab === 'THEMES' && (
                        <button
                            onClick={() => setIsCreateThemeOpen(true)}
                            className="absolute bottom-6 right-6 w-14 h-14 bg-jazz-gold text-black rounded-full shadow-[0_0_20px_rgba(251,191,36,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group"
                        >
                            <Plus className="w-7 h-7" />
                        </button>
                    )}
                </main>

                {/* RIGHT: CHAT */}
                <aside className="w-80 bg-jazz-surface border-l border-white/5 flex flex-col">
                    <div className="flex-1 flex flex-col min-h-0">
                        {currentUser ? (
                            <JamChat jamId={initialJam.id} currentUser={currentUser} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-white/20">Login to Chat</div>
                        )}
                    </div>
                </aside>
            </div>


            {/* MOBILE LAYOUT */}
            <div className="lg:hidden flex-1 overflow-y-auto">
                <main className="p-4 space-y-6">
                    {/* Tabs / Toggle for Mobile? For now keeping stacks but using MusicianList */}

                    {/* Info Card */}
                    <div className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-3">
                        {initialJam.description && <p className="text-white/90 text-sm">{initialJam.description}</p>}
                    </div>

                    {/* Musicians Horizontal Scroll */}
                    <div className="bg-jazz-surface border border-white/10 rounded-xl overflow-hidden p-4">
                        <h3 className="font-bold text-white mb-2">Músicos</h3>
                        <div className="flex overflow-x-auto gap-2 pb-2">
                            {uniqueMusicians.map(u => (
                                <div key={u.id} className="flex flex-col items-center min-w-[60px]">
                                    <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden border border-white/10">
                                        {u.image ? <img src={u.image} className="w-full h-full object-cover" /> : <div className="p-2 text-center text-xs">🎷</div>}
                                    </div>
                                    <span className="text-[10px] text-white truncate w-full text-center mt-1">{u.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <ThemeList />

                    {/* Chat Fixed at Bottom or inline? Inline for now to avoid complexity */}
                    <div className="h-[400px] mb-20">
                        {currentUser && <JamChat jamId={initialJam.id} currentUser={currentUser} />}
                    </div>
                </main>

                <button
                    onClick={() => setIsCreateThemeOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-jazz-gold text-black rounded-full shadow z-40 flex items-center justify-center"
                >
                    <Plus className="w-7 h-7" />
                </button>
            </div>

            <CreateThemeModal
                isOpen={isCreateThemeOpen}
                onClose={() => setIsCreateThemeOpen(false)}
                jamCode={jam.code}
            />
        </div>
    );
}
