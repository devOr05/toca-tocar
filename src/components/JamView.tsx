'use client';

import { useEffect, useState } from 'react';
import { useJamStore } from '../store/jamStore';
import ThemeList from './ThemeList';
import { Share2, Users, Music2, LogOut, Trash2, Calendar, MapPin, Image as ImageIcon, Plus, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { pusherClient } from '@/lib/pusher';
import { Jam, Theme, Participation, User } from '../types';
import CreateThemeModal from './CreateThemeModal';
import SuggestedThemes from './SuggestedThemes';
import JamChat from './JamChat';
import NotificationBell from './NotificationBell';
import MusicianList from './MusicianList';
import MediaGallery from './MediaGallery';
import MediaUploadButton from './MediaUploadButton';
import HostControlPanel from './HostControlPanel';
import MusicianProfileModal from './MusicianProfileModal';

interface JamViewProps {
    initialJam: Jam;
    initialThemes: Theme[];
    initialParticipations: Participation[];
    currentUser?: User | null;
    initialCityMusicians: Partial<User>[];
}

export default function JamView({ initialJam, initialThemes, initialParticipations, currentUser: initialUser, initialCityMusicians = [] }: JamViewProps) {
    const router = useRouter();
    const { jam, themes, participations, setUser, setAuthenticatedUser, currentUser, setJamState } = useJamStore();

    console.log('JamView Debug - CurrentUser:', currentUser);
    console.log('JamView Debug - InitialUser:', initialUser);

    const [mounted, setMounted] = useState(false);
    const [formattedDate, setFormattedDate] = useState<string>('');
    const [isCreateThemeOpen, setIsCreateThemeOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'THEMES' | 'FORUM' | 'SUGGESTED' | 'GALLERY' | 'CHAT' | 'MUSICIANS'>('THEMES');
    const [createType, setCreateType] = useState<'SONG' | 'TOPIC'>('SONG');
    const [refreshMedia, setRefreshMedia] = useState(0);
    const [isChatExpanded, setIsChatExpanded] = useState(false);

    // Musician Profile Modal State
    const [selectedMusicianId, setSelectedMusicianId] = useState<string | null>(null);

    const openCreateModal = (type: 'SONG' | 'TOPIC') => {
        setCreateType(type);
        setIsCreateThemeOpen(true);
    };

    // Initialize and Sync Store
    useEffect(() => {
        setJamState(initialJam, initialThemes, initialParticipations);

        if (initialJam.startTime && !formattedDate) {
            const date = new Date(initialJam.startTime);
            const dateStr = date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
            const timeStr = date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
            setFormattedDate(`${dateStr} • ${timeStr} hs`);
        }

        if (initialUser) {
            setAuthenticatedUser(initialUser);
        } else if (!currentUser) {
            const storedName = localStorage.getItem('toca_tocar_user_name');
            if (storedName) {
                const guestUser = {
                    id: `guest-${Date.now()}`,
                    name: storedName,
                    role: 'USER' as const,
                    image: null
                };
                setAuthenticatedUser(guestUser as any);
            }
        }

        setMounted(true);
    }, [initialJam, initialThemes, initialParticipations, setJamState, initialUser, currentUser, setAuthenticatedUser]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Listen for real-time updates to themes/participations
    useEffect(() => {
        const channel = pusherClient.subscribe(`jam-${initialJam.id}`);

        channel.bind('attendance-update', (data: { userId: string, action: 'join' | 'leave', user: User }) => {
            console.log('attendance update:', data);
            router.refresh();
        });

        channel.bind('update-jam', () => {
            console.log('Jam updated, refreshing...');
            router.refresh();
        });

        return () => {
            channel.unbind_all();
            pusherClient.unsubscribe(`jam-${initialJam.id}`);
        };
    }, [initialJam.id, router]);


    const attendanceMap = new Map<string, { userId: string, instruments: Set<string>, user?: User }>();

    // Process participations to build attendance list
    if (participations) {
        participations.forEach(p => {
            if (!attendanceMap.has(p.userId)) {
                attendanceMap.set(p.userId, { userId: p.userId, instruments: new Set(), user: p.user });
            }
            if (p.instrument) {
                attendanceMap.get(p.userId)?.instruments.add(p.instrument);
            }
        });
    }

    // Add direct attendance
    if (initialJam.attendance) {
        initialJam.attendance.forEach(a => {
            if (!attendanceMap.has(a.userId)) {
                // Ensure instrument is string (it should be required in JamAttendance but might be null in DB)
                attendanceMap.set(a.userId, { userId: a.userId, instruments: new Set([a.instrument || '']), user: a.user });
            } else {
                attendanceMap.get(a.userId)?.instruments.add(a.instrument || '');
            }
        });
    }

    // Convert Sets to comma-separated strings for display, fallback to profile instrument
    const mergedAttendance = Array.from(attendanceMap.values())
        .filter(att => att.user) // Filter out entries with undefined users
        .map(att => {
            const validInstruments = Array.from(att.instruments).filter(i => i && i.trim() !== '');

            // Merge with profile instrument
            if (att.user?.mainInstrument) {
                att.user.mainInstrument.split(',').forEach(i => {
                    const trimmed = i.trim();
                    if (trimmed) validInstruments.push(trimmed);
                });
            }

            // Deduplicate
            const uniqueInstruments = Array.from(new Set(validInstruments));

            const displayInstrument = uniqueInstruments.length > 0
                ? uniqueInstruments.join(', ')
                : 'Músico';

            return {
                userId: att.userId,
                instrument: displayInstrument,
                user: att.user
            };
        });

    // Filter unique users for musician list (carrusel/mentions)
    const uniqueMusicians = mergedAttendance.map(a => a.user).filter(Boolean) as User[];


    if (!mounted) return null;

    // Check if current user is the host or Super Admin
    const isSuperAdmin = currentUser?.role === 'ADMIN' || currentUser?.email?.toLowerCase() === 'orostizagamario@gmail.com';
    const isHost = currentUser?.id === initialJam.hostId || isSuperAdmin;

    return (
        <div className="h-[100dvh] bg-black font-sans flex flex-col overflow-hidden relative">

            {/* HEADER */}
            <header className="shrink-0 bg-jazz-surface/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center justify-between z-50 shadow-lg">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-white/10 transition-colors group"
                    >
                        <span className="flex items-center justify-center bg-jazz-gold/10 p-2 rounded-lg group-hover:bg-jazz-gold group-hover:text-black transition-colors">
                            <LogOut className="w-4 h-4 text-jazz-gold group-hover:text-black rotate-180" />
                        </span>
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
                    {currentUser && <NotificationBell userId={currentUser.id} />}
                    {isHost && (
                        <span className="text-[10px] bg-jazz-gold/20 text-jazz-gold px-2 py-1 rounded-full border border-jazz-gold/30 font-bold uppercase tracking-wider">
                            Anfitrión
                        </span>
                    )}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-jazz-accent to-purple-600 flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-black">
                        {currentUser?.name?.slice(0, 2).toUpperCase() || '?'}
                    </div>
                </div>
            </header>

            {/* MAIN CONTAINER */}
            <div className="flex flex-1 min-h-0 overflow-hidden relative">
                {/* LEFT SIDEBAR: MUSICIANS (DESKTOP) */}
                <aside className="hidden lg:flex w-[280px] bg-jazz-surface/40 border-r border-white/5 flex-col overflow-hidden">
                    <div className="p-4 border-b border-white/5 bg-black/20 shrink-0">
                        <h3 className="text-[10px] font-bold text-jazz-gold uppercase tracking-widest flex items-center gap-2">
                            <Users size={14} /> Músicos
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        <MusicianList
                            jamId={initialJam.id}
                            currentUser={currentUser}
                            attendance={mergedAttendance as any}
                            cityMusicians={initialCityMusicians}
                            isHost={isHost}
                            onMusicianClick={(id) => setSelectedMusicianId(id)}
                        />
                    </div>
                </aside>

                {/* CENTER: CONTENT */}
                <main className="flex-1 flex flex-col min-w-0 bg-black/50 relative">
                    {/* Tabs */}
                    <div className="flex items-center border-b border-white/10 bg-black/40 px-4 shrink-0 overflow-x-auto scrollbar-hide">
                        <button
                            onClick={() => setActiveTab('THEMES')}
                            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'THEMES' ? 'border-jazz-gold text-white' : 'border-transparent text-white/40 hover:text-white'}`}
                        >
                            <Music2 size={16} /> Repertorio
                        </button>
                        <button
                            onClick={() => setActiveTab('SUGGESTED')}
                            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'SUGGESTED' ? 'border-jazz-gold text-white' : 'border-transparent text-white/40 hover:text-white'}`}
                        >
                            <Plus size={16} /> Sugeridos
                        </button>
                        <button
                            onClick={() => setActiveTab('FORUM')}
                            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'FORUM' ? 'border-jazz-accent text-white' : 'border-transparent text-white/40 hover:text-white'}`}>
                            <Share2 size={16} /> Foro
                        </button>
                        <button
                            onClick={() => setActiveTab('GALLERY')}
                            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'GALLERY' ? 'border-jazz-gold text-white' : 'border-transparent text-white/40 hover:text-white'}`}
                        >
                            <ImageIcon size={16} /> Galería
                        </button>
                        <button
                            onClick={() => setActiveTab('CHAT')}
                            className={`lg:hidden px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'CHAT' ? 'border-jazz-gold text-white' : 'border-transparent text-white/40 hover:text-white'}`}
                        >
                            <MessageSquare size={16} /> Chat
                        </button>
                        <button
                            onClick={() => setActiveTab('MUSICIANS')}
                            className={`lg:hidden px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'MUSICIANS' ? 'border-jazz-gold text-white' : 'border-transparent text-white/40 hover:text-white'}`}
                        >
                            <Users size={16} /> Músicos
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
                        {/* THEMES TAB OR DEFAULT INFO */}
                        {activeTab !== 'CHAT' && activeTab !== 'MUSICIANS' && (
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
                        )}

                        {/* OPENING SHOW SECTION */}
                        {initialJam.openingBand && activeTab === 'THEMES' && (
                            <div className="bg-jazz-gold/5 border border-jazz-gold/20 rounded-xl p-6 shadow-lg shrink-0 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-10 rotate-12">
                                    <Music2 size={80} className="text-jazz-gold" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex flex-col gap-4 mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black bg-jazz-gold text-black px-2 py-0.5 rounded uppercase tracking-tighter">Apertura</span>
                                            <h2 className="text-xl font-bold text-white tracking-tight">{initialJam.openingBand}</h2>
                                        </div>

                                        {(() => {
                                            try {
                                                const musicians = typeof initialJam.openingMusicians === 'string'
                                                    ? JSON.parse(initialJam.openingMusicians)
                                                    : initialJam.openingMusicians;

                                                if (Array.isArray(musicians) && musicians.length > 0) {
                                                    return (
                                                        <div className="flex flex-wrap gap-3">
                                                            {musicians.map((m: any) => (
                                                                <button
                                                                    key={m.userId}
                                                                    onClick={() => setSelectedMusicianId(m.userId)}
                                                                    className="flex items-center gap-2 bg-black/40 hover:bg-jazz-gold/20 border border-white/10 hover:border-jazz-gold/50 rounded-full pl-1 pr-3 py-1 transition-all group"
                                                                >
                                                                    <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden ring-2 ring-black/50 group-hover:ring-jazz-gold/50 transition-all">
                                                                        {m.image ? (
                                                                            <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center text-xs">👤</div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex flex-col items-start leading-tight">
                                                                        <span className="text-sm text-white font-medium group-hover:text-jazz-gold transition-colors line-clamp-1">{m.name}</span>
                                                                        {m.mainInstrument && (
                                                                            <span className="text-[10px] text-jazz-gold font-bold uppercase tracking-tighter opacity-80">{m.mainInstrument}</span>
                                                                        )}
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    );
                                                }
                                            } catch (e) {
                                                console.error("Error parsing opening musicians", e);
                                            }
                                            return null;
                                        })()}
                                    </div>
                                    {initialJam.openingInfo && (
                                        <p className="text-white/70 text-sm mb-4 leading-relaxed whitespace-pre-wrap max-w-2xl bg-black/20 p-3 rounded-lg border border-white/5">
                                            {initialJam.openingInfo}
                                        </p>
                                    )}
                                    {initialJam.openingThemes && (
                                        <div className="space-y-2 border-l-2 border-jazz-gold/30 pl-4 py-1">
                                            <h4 className="text-[10px] uppercase font-bold text-jazz-gold tracking-widest mb-2">Repertorio de Apertura</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {initialJam.openingThemes.split('\n').filter(t => t.trim()).map((t, i) => (
                                                    <div key={i} className="bg-black/40 border border-white/10 px-3 py-1.5 rounded-lg text-xs text-white/80 flex items-center gap-2 transition-all hover:border-jazz-gold/40">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-jazz-gold/40" />
                                                        {t.trim()}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* HOST CONTROLS */}
                        {(isHost || currentUser?.role === 'ADMIN') && activeTab === 'THEMES' && (
                            <section className="shrink-0">
                                <HostControlPanel jam={initialJam} themes={themes} />
                            </section>
                        )}

                        {activeTab === 'THEMES' && (
                            <div className="pb-24">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Music2 size={20} className="text-jazz-gold" />
                                        Repertorio
                                    </h3>
                                    <button
                                        onClick={() => openCreateModal('SONG')}
                                        className="bg-jazz-gold text-black px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-jazz-gold/10"
                                    >
                                        <Plus size={16} /> Proponer Tema
                                    </button>
                                </div>
                                <ThemeList type="SONG" />
                            </div>
                        )}

                        {activeTab === 'SUGGESTED' && (
                            <div className="pb-24">
                                <SuggestedThemes jamCode={initialJam.code} />
                            </div>
                        )}

                        {activeTab === 'FORUM' && (
                            <div className="pb-24">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-white">Foro de Discusión</h3>
                                    <button
                                        onClick={() => openCreateModal('TOPIC')}
                                        className="bg-jazz-accent/20 hover:bg-jazz-accent/40 text-jazz-accent px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                                    >
                                        Crear Tópico
                                    </button>
                                </div>
                                <ThemeList type="TOPIC" />
                            </div>
                        )}

                        {activeTab === 'GALLERY' && (
                            <div className="pb-24">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-white">Galería de Fotos y Videos</h3>
                                    {currentUser && (
                                        <MediaUploadButton
                                            jamId={initialJam.id}
                                            onUploadComplete={() => {
                                                setRefreshMedia(prev => prev + 1);
                                            }}
                                        />
                                    )}
                                </div>
                                <MediaGallery
                                    jamId={initialJam.id}
                                    currentUserId={currentUser?.id}
                                    isHost={isHost}
                                    refreshTrigger={refreshMedia}
                                />
                            </div>
                        )}

                        {/* MOBILE CHAT TAB CONTENT */}
                        {activeTab === 'CHAT' && (
                            <div className="flex-1 h-full min-h-[400px] pb-20">
                                {currentUser && (
                                    <JamChat
                                        jamId={initialJam.id}
                                        currentUser={currentUser}
                                        hostId={initialJam.hostId}
                                        users={uniqueMusicians}
                                        title=""
                                    />
                                )}
                            </div>
                        )}

                        {/* MOBILE MUSICIANS TAB CONTENT */}
                        {activeTab === 'MUSICIANS' && (
                            <div className="pb-24">
                                <h3 className="text-xl font-bold text-white mb-4">Músicos en la Jam</h3>
                                <MusicianList
                                    jamId={initialJam.id}
                                    currentUser={currentUser}
                                    attendance={mergedAttendance as any}
                                    cityMusicians={initialCityMusicians}
                                    isHost={isHost}
                                    onMusicianClick={(id) => setSelectedMusicianId(id)}
                                />
                            </div>
                        )}
                    </div>
                </main>

                {/* RIGHT SIDEBAR: CHAT (DESKTOP) */}
                <aside className="hidden xl:flex w-[350px] bg-jazz-surface/40 border-l border-white/5 flex-col overflow-hidden">
                    <div className="p-4 border-b border-white/5 bg-black/20 shrink-0">
                        <h3 className="text-[10px] font-bold text-jazz-gold uppercase tracking-widest flex items-center gap-2">
                            <MessageSquare size={14} /> Chat de la Jam
                        </h3>
                    </div>
                    <div className="flex-1 min-h-0">
                        {currentUser && (
                            <JamChat
                                jamId={initialJam.id}
                                currentUser={currentUser}
                                hostId={initialJam.hostId}
                                users={uniqueMusicians}
                                title=""
                            />
                        )}
                    </div>
                </aside>
            </div>

            {/* FLOATING ACTION BUTTON (MOBILE) */}
            {activeTab === 'THEMES' && (
                <button
                    onClick={() => openCreateModal('SONG')}
                    className={`fixed bottom-[80px] right-6 w-14 h-14 bg-jazz-gold text-black rounded-full shadow-[0_0_20px_rgba(251,191,36,0.4)] z-50 flex items-center justify-center active:scale-95 transition-all lg:hidden`}
                >
                    <Plus className="w-7 h-7" />
                </button>
            )}

            <CreateThemeModal
                isOpen={isCreateThemeOpen}
                onClose={() => setIsCreateThemeOpen(false)}
                jamCode={initialJam.code}
                type={createType}
            />

            <MusicianProfileModal
                userId={selectedMusicianId!}
                isOpen={!!selectedMusicianId}
                onClose={() => setSelectedMusicianId(null)}
            />
        </div>
    );
}
