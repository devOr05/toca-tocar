'use client';

import { useState } from 'react';
import { Theme, Participation, User } from '../types';
import { Mic2, Music, Drum, Guitar, Keyboard, Info, Pencil, Trash2, MessageSquare, FileMusic } from 'lucide-react';
import { deleteTheme } from '@/app/actions';
import { useJamStore } from '@/store/jamStore';
import ThemeDetailsModal from './ThemeDetailsModal';
import EditThemeModal from './EditThemeModal';

interface ThemeCardProps {
    theme: Theme;
    participations: Participation[];
    currentUser: User | null;
    isHost: boolean;
    onJoin: (instrument: string) => void;
    onLeave: () => void;
}

const INSTRUMENTS = [
    { id: 'Sax', icon: Music, label: 'Saxo/Vientos' },
    { id: 'Trumpet', icon: Music, label: 'Trompeta' },
    { id: 'Piano', icon: Keyboard, label: 'Piano' },
    { id: 'Guitar', icon: Guitar, label: 'Guitarra' },
    { id: 'Bass', icon: Guitar, label: 'Bajo' },
    { id: 'Drums', icon: Drum, label: 'Batería' },
    { id: 'Voice', icon: Mic2, label: 'Voz' },
    { id: 'Other', icon: Music, label: 'Otro' },
];

export default function ThemeCard({ theme, participations, currentUser, isHost, onJoin, onLeave }: ThemeCardProps) {
    const [showInstruments, setShowInstruments] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const { removeTheme, addTheme } = useJamStore();

    const myParticipation = currentUser
        ? participations.find(p => p.userId === currentUser.id)
        : null;

    const isQueued = theme.status === 'QUEUED';
    const isPlaying = theme.status === 'PLAYING';

    // Check if theme has extra info to show
    const hasInfo = Boolean(theme.description || theme.sheetMusicUrl);

    return (
        <div className={`
      relative rounded-xl border p-4 transition-all
      ${isPlaying ? 'bg-jazz-accent/20 border-jazz-accent shadow-[0_0_20px_rgba(99,102,241,0.3)]' :
                isQueued ? 'bg-jazz-gold/10 border-jazz-gold/50' :
                    'bg-jazz-surface border-white/5'}
    `}>
            {/* Status Badge */}
            <div className="flex justify-between items-start mb-3">
                {/* ... existing header ... */}
                <div className="flex-1 min-w-0 mr-2">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-white leading-tight truncate">{theme.name}</h3>
                        {hasInfo && theme.type !== 'TOPIC' && (
                            <button
                                onClick={() => setShowDetails(true)}
                                className="text-jazz-gold hover:text-white transition-colors"
                                title="Ver información del tema"
                            >
                                <Info size={16} />
                            </button>
                        )}
                        {theme.type === 'TOPIC' && (
                            <button
                                onClick={() => setShowDetails(true)}
                                className="text-jazz-accent hover:text-white transition-colors flex items-center gap-1 bg-jazz-accent/10 px-2 py-0.5 rounded-md"
                                title="Ver discusión"
                            >
                                <MessageSquare size={14} />
                                <span className="text-[10px] font-bold uppercase">Chat</span>
                            </button>
                        )}
                    </div>
                    <span className="text-xs font-mono text-jazz-muted bg-white/5 px-2 py-0.5 rounded mt-1 inline-block">
                        {theme.tonality || 'Key?'}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {isPlaying && <span className="animate-pulse text-jazz-accent font-bold text-xs uppercase tracking-widest bg-jazz-accent/10 px-2 py-1 rounded">En Escenario</span>}
                    {isQueued && <span className="text-jazz-gold font-bold text-xs uppercase tracking-widest bg-jazz-gold/10 px-2 py-1 rounded">Siguiente</span>}

                    {isHost && (
                        <>
                            <button
                                onClick={() => setShowEdit(true)}
                                className="text-white/40 hover:text-white transition-colors p-1"
                                title="Editar Tema"
                            >
                                <Pencil size={16} />
                            </button>
                            <button
                                onClick={async () => {
                                    if (confirm('¿Estás seguro de que quieres eliminar este tema?')) {
                                        // Optimistic update - remove immediately
                                        removeTheme(theme.id);

                                        const result = await deleteTheme(theme.id);
                                        if (!result.success) {
                                            // Revert if failed
                                            addTheme(theme);
                                            alert(result.error || 'Error al eliminar el tema');
                                        }
                                    }
                                }}
                                className="text-white/40 hover:text-red-500 transition-colors p-1"
                                title="Eliminar Tema"
                            >
                                <Trash2 size={16} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Sheet Music Link */}
            {theme.sheetMusicUrl && (
                <div className="mb-3">
                    <a
                        href={theme.sheetMusicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-jazz-gold hover:text-white flex items-center gap-1.5 text-sm transition-colors bg-jazz-gold/10 px-3 py-1.5 rounded-lg border border-jazz-gold/30 hover:border-jazz-gold/60 w-fit"
                    >
                        <FileMusic size={14} />
                        <span className="font-medium">Ver Partitura</span>
                    </a>
                </div>
            )}

            {/* Participants */}
            <div className="space-y-2 mb-4">
                {participations.length === 0 && (
                    <p className="text-white/20 text-xs italic">Nadie se ha anotado aún.</p>
                )}
                <div className="flex flex-wrap gap-2">
                    {participations.map(p => (
                        <div key={p.id} className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-full px-2 py-1">
                            <span className="text-[10px] text-jazz-gold font-bold uppercase">{p.instrument.slice(0, 3)}</span>
                            <span className="text-xs text-white/80 truncate max-w-[80px]">{p.userName}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Area */}
            {theme.status === 'OPEN' && (
                <div className="mt-2">
                    {myParticipation ? (
                        <button
                            type="button"
                            onClick={onLeave}
                            className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors border border-red-500/20"
                        >
                            Salir del Tema
                        </button>
                    ) : showInstruments ? (
                        <div className="grid grid-cols-4 gap-1">
                            {INSTRUMENTS.map((inst) => {
                                const Icon = inst.icon;
                                return (
                                    <button
                                        key={inst.id}
                                        type="button"
                                        onClick={() => {
                                            console.log('Joining with:', inst.id);
                                            onJoin(inst.id);
                                            setShowInstruments(false);
                                        }}
                                        className="flex flex-col items-center justify-center bg-white/5 hover:bg-jazz-gold/20 hover:text-jazz-gold border border-white/5 rounded-lg p-2 transition-all"
                                    >
                                        <Icon className="w-4 h-4 mb-1" />
                                        <span className="text-[8px] uppercase">{inst.label}</span>
                                    </button>
                                );
                            })}
                            <button
                                type="button"
                                onClick={() => setShowInstruments(false)}
                                className="col-span-4 text-xs text-white/40 mt-1 hover:text-white"
                            >
                                Cancelar
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setShowInstruments(true)}
                            className="w-full py-3 bg-white/5 hover:bg-jazz-gold hover:text-black hover:font-bold text-jazz-muted text-sm transition-all rounded-xl border border-white/10 group"
                        >
                            <span className="group-hover:hidden">Quiero Tocar</span>
                            <span className="hidden group-hover:inline">¡Vamos!</span>
                        </button>
                    )}
                </div>
            )}

            <ThemeDetailsModal
                isOpen={showDetails}
                onClose={() => setShowDetails(false)}
                theme={theme}
                currentUser={currentUser}
            />

            <EditThemeModal
                isOpen={showEdit}
                onClose={() => setShowEdit(false)}
                theme={theme}
            />
        </div>
    );
}
