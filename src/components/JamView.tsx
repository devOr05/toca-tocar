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
    const [isLeaving, setIsLeaving] = useState(false);

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
    }, [initialJam, initialThemes, initialParticipations, setJamState, currentUser, setUser, router]);

    // ...

    // Inside render
    {/* Date */ }
    {
        formattedDate && (
            <div className="flex items-center gap-2 text-jazz-muted text-xs">
                <Calendar className="w-4 h-4 text-jazz-gold shrink-0" />
                <span>{formattedDate}</span>
            </div>
        )
    }
    // Don't redirect based on localStorage.
    if (currentUserId && !currentUser) {
        // Can't easily set full user object here without name, but we know we are logged in.
        // Maybe fetch user details or just assume 'Guest' in store until updated?
        // Actually, JamViewProps *could* pass the user Name too.
        // For now, prevent redirect is the key.
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

const handleLeave = async () => {
    if (!confirm('¿Seguro que quieres abandonar la Jam? Se borrarán tus participaciones.')) return;

    setIsLeaving(true);
    await leaveJam(initialJam.code);
    router.push('/dashboard');
};

if (!mounted) return null;

const isHost = currentUserId === initialJam.hostId;
const [showAddThemeModal, setShowAddThemeModal] = useState(false);
const [newThemeName, setNewThemeName] = useState('');
const [newThemeTonality, setNewThemeTonality] = useState('');

const handleCreateTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThemeName) return;

    const { createTheme } = await import('@/app/actions');
    await createTheme(initialJam.code, newThemeName, newThemeTonality);
    setShowAddThemeModal(false);
    setNewThemeName('');
    setNewThemeTonality('');
    router.refresh();
};

return (
    <div className="min-h-screen bg-background pb-20">
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
                {/* Back/Exit Button */}
                <button
                    onClick={() => router.push('/dashboard')}
                    className="p-2 text-white/40 hover:text-white transition-colors"
                    title="Volver al Dashboard"
                >
                    <LogOut className="w-5 h-5 rotate-180" /> {/* Reusing LogOut icon as Exit/Back */}
                </button>

                {/* Leave Button (Only for non-hosts) - KEPT but maybe less prominent if they just want to exit view */}
                {!isHost && currentUserId && (
                    <button
                        onClick={handleLeave}
                        disabled={isLeaving}
                        className="p-2 text-red-400/60 hover:text-red-400 transition-colors"
                        title="Abandonar Jam (Borrar participaciones)"
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
                    className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-xs font-bold"
                >
                    <Share2 className="w-4 h-4" />
                    <span>Invitar</span>
                </button>
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
                    {initialJam.startTime && (
                        <div className="flex items-center gap-2 text-jazz-muted text-xs">
                            <Calendar className="w-4 h-4 text-jazz-gold shrink-0" />
                            <span>
                                {new Date(initialJam.startTime).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                {' • '}
                                {new Date(initialJam.startTime).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
                            </span>
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

            <ThemeList />
        </main>

        <button
            onClick={() => setShowAddThemeModal(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-jazz-gold text-black rounded-full shadow-lg shadow-jazz-gold/20 flex items-center justify-center hover:scale-110 transition-transform active:scale-95 z-40"
        >
            <span className="text-3xl font-light mb-1">+</span>
        </button>

        {/* Add Theme Modal */}
        {showAddThemeModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-jazz-surface border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative">
                    <h2 className="text-xl font-bold text-white mb-4">Proponer Nuevo Tema</h2>
                    <form onSubmit={handleCreateTheme} className="space-y-4">
                        <div>
                            <label className="block text-sm text-white/60 mb-1">Nombre del Tema</label>
                            <input
                                autoFocus
                                type="text"
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-jazz-gold outline-none"
                                placeholder="Ej: Giant Steps"
                                value={newThemeName}
                                onChange={e => setNewThemeName(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-white/60 mb-1">Tonalidad (Opcional)</label>
                            <input
                                type="text"
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-jazz-gold outline-none"
                                placeholder="Ej: Eb"
                                value={newThemeTonality}
                                onChange={e => setNewThemeTonality(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowAddThemeModal(false)}
                                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-3 rounded-xl bg-jazz-gold text-black font-bold hover:brightness-110 transition-all shadow-lg shadow-jazz-gold/10"
                            >
                                Agregar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
);
}
