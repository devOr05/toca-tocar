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

    const openCreateModal = (type: 'SONG' | 'TOPIC') => {
        setCreateType(type);
        setIsCreateThemeOpen(true);
    };

    // ... (rest of code)

    // ... inside render ...
    {/* LEFT: MUSICIANS */ }
    <aside className="w-64 bg-jazz-surface border-r border-white/5 flex flex-col">
        <div className="p-4 border-b border-white/5 bg-black/20">
            <h2 className="text-xs font-bold text-jazz-gold uppercase tracking-widest flex items-center gap-2">
                <Users className="w-4 h-4" /> Músicos
            </h2>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
            <MusicianList
                jamId={initialJam.id}
                currentUser={currentUser}
                attendance={initialJam.attendance || []}
                cityMusicians={initialCityMusicians}
            />
        </div>
    </aside>


    // Real-time Jam Updates
    useEffect(() => {
        const channel = pusherClient.subscribe(`jam-${initialJam.id}`);

        channel.bind('update-jam', () => {
            console.log('Jam update received, refreshing...');
            router.refresh();
        });

        return () => {
            pusherClient.unsubscribe(`jam-${initialJam.id}`);
        };
    }, [initialJam.id, router]);

    useEffect(() => {
        setJamState(initialJam, initialThemes, initialParticipations);

        if (initialJam.startTime) {
            const date = new Date(initialJam.startTime);
            const dateStr = date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
            // FORCE 24H format to avoid "07:00 p.m. hs" weirdness
            const timeStr = date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
            setFormattedDate(`${dateStr} • ${timeStr} hs`);
        }

        setMounted(true);
        window.scrollTo(0, 0); // Force scroll to top on entry

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

    // Filter unique users for musician list
    // Include Host and Current User even if they haven't joined a theme yet
    const allMusicianIds = Array.from(new Set([
        initialJam.hostId,
        ...participations.map(p => p.userId),
        ...(currentUser?.id ? [currentUser.id] : [])
    ]));

    const uniqueMusicians = allMusicianIds.map(id => {
        // 1. Try from participations (has instrument info)
        const fromParticipations = participations.find(p => p.userId === id)?.user;
        if (fromParticipations) return fromParticipations;

        // 2. Try from initial jam host data
        if (id === initialJam.hostId && (initialJam as any).host) return (initialJam as any).host;

        // 3. Try current user
        if (currentUser && id === currentUser.id) return currentUser;

        return null;
    }).filter(Boolean) as User[];

    if (!mounted) return null;

    // Check if current user is the host or Super Admin
    const isSuperAdmin = currentUser?.role === 'ADMIN' || currentUser?.email === 'orostizagamario@gmail.com';
    const isHost = currentUser?.id === initialJam.hostId || isSuperAdmin;

    return (
        <div className="min-h-screen bg-black pb-20 lg:pb-0 font-sans flex flex-col relative">

            {/* HEADER */}
            <header className="sticky top-0 z-50 bg-jazz-surface/90 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between shrink-0">
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
                            jamId={initialJam.id}
                            currentUser={currentUser}
                            attendance={initialJam.attendance || []}
                            cityMusicians={initialCityMusicians}
                        />
                    </div>
                </aside>

                {/* CENTER: CONTENT */}
                <main className="flex-1 flex flex-col min-w-0 bg-black/50 relative">
                    {/* Tabs */}
                    <div className="flex items-center border-b border-white/10 bg-black/40 px-4 shrink-0 overflow-x-auto">
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
                            <Share2 size={16} /> Foro / Tópicos
                        </button>
                        <button
                            onClick={() => setActiveTab('GALLERY')}
                            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'GALLERY' ? 'border-jazz-gold text-white' : 'border-transparent text-white/40 hover:text-white'}`}
                        >
                            <ImageIcon size={16} /> Galería
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

                        {/* OPENING SHOW SECTION */}
                        {initialJam.openingBand && activeTab === 'THEMES' && (
                            <div className="bg-jazz-gold/5 border border-jazz-gold/20 rounded-xl p-6 shadow-lg shrink-0 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-10 rotate-12">
                                    <Music2 size={80} className="text-jazz-gold" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[10px] font-black bg-jazz-gold text-black px-2 py-0.5 rounded uppercase tracking-tighter">Apertura</span>
                                        <h2 className="text-xl font-bold text-white tracking-tight">{initialJam.openingBand}</h2>
                                    </div>

                                    {initialJam.openingInfo && (
                                        <p className="text-white/70 text-sm mb-4 leading-relaxed whitespace-pre-wrap max-w-2xl">
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

                        {/* GALLERY TAB */}
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
                    </div>

                    {/* FAB */}
                    {activeTab === 'THEMES' && (
                        <button
                            onClick={() => openCreateModal('SONG')}
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
                            <JamChat
                                jamId={initialJam.id}
                                currentUser={currentUser}
                                hostId={initialJam.hostId}
                                users={uniqueMusicians}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-white/20">Login to Chat</div>
                        )}
                    </div>
                </aside>
            </div >


            {/* MOBILE LAYOUT */}
            <div className="lg:hidden flex-1 flex flex-col min-h-0 bg-black/50">
                {/* Mobile Tabs - Sticky Top */}
                <div className="flex items-center border-b border-white/10 bg-black/40 px-4 shrink-0 overflow-x-auto no-scrollbar gap-2 sticky top-0 z-40 backdrop-blur-md">
                    <button
                        onClick={() => setActiveTab('THEMES')}
                        className={`px-3 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'THEMES' ? 'border-jazz-gold text-white' : 'border-transparent text-white/40'}`}
                    >
                        <Music2 size={14} /> Repertorio
                    </button>
                    <button
                        onClick={() => setActiveTab('MUSICIANS')}
                        className={`px-3 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'MUSICIANS' ? 'border-jazz-gold text-white' : 'border-transparent text-white/40'}`}
                    >
                        <Users size={14} /> Músicos
                    </button>
                    <button
                        onClick={() => setActiveTab('SUGGESTED')}
                        className={`px-3 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'SUGGESTED' ? 'border-jazz-gold text-white' : 'border-transparent text-white/40'}`}
                    >
                        <Plus size={14} /> Sugeridos
                    </button>
                    <button
                        onClick={() => setActiveTab('FORUM')}
                        className={`px-3 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'FORUM' ? 'border-jazz-accent text-white' : 'border-transparent text-white/40'}`}
                    >
                        <Share2 size={14} /> Foro
                    </button>
                    <button
                        onClick={() => setActiveTab('CHAT')}
                        className={`px-3 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'CHAT' ? 'border-jazz-gold text-white' : 'border-transparent text-white/40'}`}
                    >
                        <MessageSquare size={14} /> Chat
                    </button>
                    <button
                        onClick={() => setActiveTab('GALLERY')}
                        className={`px-3 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'GALLERY' ? 'border-jazz-gold text-white' : 'border-transparent text-white/40'}`}
                    >
                        <ImageIcon size={14} /> Galería
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
                    {/* THEMES TAB CONTENT */}
                    {activeTab === 'THEMES' && (
                        <>
                            {/* Info Card */}
                            <div className="bg-jazz-surface border border-white/5 rounded-xl p-4 shadow-lg">
                                {initialJam.description && <p className="text-white/90 text-xs mb-2 leading-relaxed">{initialJam.description}</p>}
                                {formattedDate && <p className="text-jazz-muted text-[10px] flex items-center gap-1.5"><Calendar size={12} /> {formattedDate}</p>}
                                {(initialJam.location || initialJam.city) && (
                                    <p className="text-jazz-muted text-[10px] flex items-center gap-1.5 mt-1">
                                        <MapPin size={12} />
                                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((initialJam.location || '') + ' ' + (initialJam.city || ''))}`} target="_blank" rel="noopener noreferrer" className="hover:text-white underline">
                                            {initialJam.location}{initialJam.city ? `, ${initialJam.city}` : ''}
                                        </a>
                                    </p>
                                )}
                            </div>

                            {/* Musicians Horizontal Scroll */}
                            <div className="bg-jazz-surface border border-white/10 rounded-xl overflow-hidden p-3 relative">
                                <h3 className="text-[10px] font-bold text-jazz-gold uppercase tracking-widest mb-2 flex items-center gap-1">
                                    <Users size={12} /> Músicos
                                </h3>
                                <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
                                    {uniqueMusicians.map(u => {
                                        if (!u) return null;
                                        const isHostUser = u.id === initialJam.hostId;
                                        const isCurrentUser = u.id === currentUser?.id;
                                        return (
                                            <div key={u.id} className="flex flex-col items-center min-w-[50px] relative group">
                                                <div className={`w-10 h-10 rounded-full overflow-hidden border-2 ${isHostUser ? 'border-jazz-gold' : isCurrentUser ? 'border-jazz-accent' : 'border-white/10'}`}>
                                                    {u.image ? <img src={u.image} alt={u.name || ''} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center w-full h-full bg-white/5 text-xs">🎷</div>}
                                                </div>
                                                <span className="text-[9px] text-white/80 truncate w-full text-center mt-1.5 font-medium">{u.name?.split(' ')[0]}</span>
                                                {isHostUser && <span className="absolute -top-1 -right-1 bg-jazz-gold text-black text-[8px] font-bold px-1 rounded-full border border-black shadow">H</span>}
                                                {isCurrentUser && <span className="absolute -top-1 -left-1 bg-jazz-accent text-black text-[8px] font-bold px-1 rounded-full border border-black shadow">Tú</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Opening Show */}
                            {initialJam.openingBand && (
                                <div className="bg-jazz-gold/5 border border-jazz-gold/20 rounded-xl p-4 relative overflow-hidden">
                                    <div className="flex items-center gap-2 mb-2 relative z-10">
                                        <span className="text-[9px] font-black bg-jazz-gold text-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Apertura</span>
                                        <h2 className="text-lg font-bold text-white tracking-tight">{initialJam.openingBand}</h2>
                                    </div>
                                    {initialJam.openingThemes && (
                                        <div className="flex flex-wrap gap-1.5 relative z-10">
                                            {initialJam.openingThemes.split('\n').filter(t => t.trim()).map((t, i) => (
                                                <div key={i} className="bg-black/40 border border-white/10 px-2 py-1 rounded text-[10px] text-white/70">
                                                    {t.trim()}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Host Control Panel */}
                            {isHost && <HostControlPanel jam={initialJam} themes={themes} />}

                            <ThemeList type="SONG" />
                        </>
                    )}

                    {/* SUGGESTED TAB */}
                    {activeTab === 'SUGGESTED' && <SuggestedThemes jamCode={initialJam.code} />}

                    {/* FORUM TAB */}
                    {activeTab === 'FORUM' && (
                        <>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-bold text-white">Foro</h3>
                                <button
                                    onClick={() => openCreateModal('TOPIC')}
                                    className="bg-jazz-accent/20 text-jazz-accent px-3 py-1.5 rounded-lg text-xs font-bold uppercase"
                                >
                                    Crear Tópico
                                </button>
                            </div>
                            <ThemeList type="TOPIC" />
                        </>
                    )}

                    {/* CHAT TAB */}
                    {activeTab === 'CHAT' && (
                        <div className="h-[calc(100vh-180px)]">
                            {currentUser ? (
                                <JamChat
                                    jamId={initialJam.id}
                                    currentUser={currentUser}
                                    hostId={initialJam.hostId}
                                    users={uniqueMusicians}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-white/20">Login to Chat</div>
                            )}
                        </div>
                    )}

                    {/* MUSICIANS TAB */}
                    {activeTab === 'MUSICIANS' && (
                        <MusicianList
                            jamId={initialJam.id}
                            currentUser={currentUser}
                            attendance={initialJam.attendance || []}
                            cityMusicians={initialCityMusicians}
                        />
                    )}

                    {/* GALLERY TAB */}
                    {activeTab === 'GALLERY' && (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-white">Galería</h3>
                                {currentUser && (
                                    <MediaUploadButton
                                        jamId={initialJam.id}
                                        onUploadComplete={() => setRefreshMedia(prev => prev + 1)}
                                    />
                                )}
                            </div>
                            <MediaGallery
                                jamId={initialJam.id}
                                currentUserId={currentUser?.id}
                                isHost={isHost}
                                refreshTrigger={refreshMedia}
                            />
                        </>
                    )}
                </div>

                {/* FAB */}
                {activeTab === 'THEMES' && (
                    <button
                        onClick={() => openCreateModal('SONG')}
                        className="fixed bottom-6 right-6 w-14 h-14 bg-jazz-gold text-black rounded-full shadow-[0_0_20px_rgba(251,191,36,0.4)] z-50 flex items-center justify-center active:scale-95 transition-transform"
                    >
                        <Plus className="w-7 h-7" />
                    </button>
                )}
            </div>

            <CreateThemeModal
                isOpen={isCreateThemeOpen}
                onClose={() => setIsCreateThemeOpen(false)}
                jamCode={jam.code}
                type={createType}
            />
        </div>
    );
}
