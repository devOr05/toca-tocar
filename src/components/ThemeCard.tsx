'use client';

import { useState } from 'react';
import { Theme, Participation, User } from '../types';
import { Info, Pencil, Trash2, MessageSquare, FileMusic } from 'lucide-react';
import { deleteTheme } from '@/app/actions';
import { useJamStore } from '@/store/jamStore';
import ThemeDetailsModal from './ThemeDetailsModal';
import EditThemeModal from './EditThemeModal';
import InstrumentIcon, { INSTRUMENT_MAP } from './InstrumentIcon';

interface ThemeCardProps {
    theme: Theme;
    participations: Participation[];
    currentUser: User | null;
    isHost: boolean;
    onJoin: (instrument: string) => void;
    onLeave: () => void;
}

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

    // Group participants by instrument
    const instrumentCounts = participations.reduce((acc: Record<string, { count: number, names: string[] }>, p: Participation) => {
        const inst = p.instrument;
        if (!acc[inst]) acc[inst] = { count: 0, names: [] };
        acc[inst].count++;
        acc[inst].names.push(p.userName || 'Músico');
        return acc;
    }, {});

    // Check if theme has extra info to show
    const hasInfo = Boolean(theme.description || theme.sheetMusicUrl);

    const handleInstrumentClick = (instrumentId: string) => {
        if (!currentUser) {
            alert('Debes iniciar sesión para anotarte.');
            return;
        }

        if (myParticipation) {
            if (myParticipation.instrument === instrumentId) {
                onLeave();
            } else {
                // To change instrument, they must leave first or we just switch it
                // For simplicity, let's leave then join (or the action handles it)
                onLeave();
                onJoin(instrumentId);
            }
        } else {
            onJoin(instrumentId);
        }
    };

    return (
        <div className={`
      relative rounded-xl border p-4 transition-all
      ${isPlaying ? 'bg-jazz-accent/20 border-jazz-accent shadow-[0_0_20px_rgba(99,102,241,0.3)]' :
                isQueued ? 'bg-jazz-gold/10 border-jazz-gold/50' :
                    'bg-jazz-surface border-white/5'}
    `}>
            {/* ... existing status badge and header ... */}
            <div className="flex justify-between items-start mb-3">
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
                            <button onClick={() => setShowEdit(true)} className="text-white/40 hover:text-white p-1" title="Editar"><Pencil size={16} /></button>
                            <button
                                onClick={async () => {
                                    if (confirm('¿Eliminar tema?')) {
                                        removeTheme(theme.id);
                                        const result = await deleteTheme(theme.id);
                                        if (!result.success) { addTheme(theme); alert(result.error); }
                                    }
                                }}
                                className="text-white/40 hover:text-red-500 p-1" title="Eliminar"
                            >
                                <Trash2 size={16} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Sheet Music Link */}
            {theme.sheetMusicUrl && (
                <div className="mb-4">
                    <a
                        href={theme.sheetMusicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-jazz-gold hover:text-white flex items-center gap-1.5 text-xs transition-colors bg-jazz-gold/5 px-3 py-1.5 rounded-lg border border-jazz-gold/20 hover:border-jazz-gold/40 w-fit"
                    >
                        <FileMusic size={14} />
                        <span className="font-medium">Ver Partitura</span>
                    </a>
                </div>
            )}

            {/* New Instrument Participation System */}
            {theme.type !== 'TOPIC' && (
                <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                        {Object.keys(INSTRUMENT_MAP).map((instId) => (
                            <InstrumentIcon
                                key={instId}
                                instrumentId={instId}
                                count={instrumentCounts[instId]?.count || 0}
                                isActive={myParticipation?.instrument === instId}
                                participants={instrumentCounts[instId]?.names}
                                onClick={() => handleInstrumentClick(instId)}
                            />
                        ))}
                    </div>

                    {participations.length === 0 && (
                        <p className="text-white/10 text-[10px] italic">Haz clic en un instrumento para anotarte</p>
                    )}
                </div>
            )}

            {/* Topic Discussion Button - Only for topics */}
            {theme.type === 'TOPIC' && (
                <button
                    onClick={() => setShowDetails(true)}
                    className="w-full py-2.5 bg-jazz-accent/10 hover:bg-jazz-accent/20 text-jazz-accent text-sm font-bold rounded-xl border border-jazz-accent/20 transition-all flex items-center justify-center gap-2"
                >
                    <MessageSquare size={16} />
                    Ver Discusión
                </button>
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
