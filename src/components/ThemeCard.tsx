'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Theme, Participation, User } from '../types';
import { Info, Pencil, Trash2, MessageSquare, FileMusic } from 'lucide-react';
import { deleteTheme } from '@/app/actions';
import { useJamStore } from '@/store/jamStore';
import ThemeDetailsModal from './ThemeDetailsModal';
import EditThemeModal from './EditThemeModal';
import InstrumentSelector from './InstrumentSelector';

interface ThemeCardProps {
    theme: Theme;
    participations: Participation[];
    currentUser: User | null;
    isHost: boolean;
    onJoin: (instrument: string) => void;
    onLeave: () => void;
    onShowDetails: () => void;
}

export default function ThemeCard({ theme, participations, currentUser, isHost, onJoin, onLeave, onShowDetails }: ThemeCardProps) {
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
      relative rounded-xl border p-4 transition-all duration-300 hover:-translate-y-0.5
      ${isPlaying ? 'bg-jazz-accent/20 border-jazz-accent shadow-[0_0_20px_rgba(99,102,241,0.3)]' :
                isQueued ? 'bg-jazz-gold/10 border-jazz-gold/50' :
                    'bg-jazz-surface/80 border-white/5 hover:border-jazz-gold/20 hover:shadow-[0_8px_20px_rgba(0,0,0,0.3)] hover:shadow-jazz-gold/5 backdrop-blur-sm'}
    `}>
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0 mr-2">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-white leading-tight truncate">{theme.name}</h3>
                        {theme.type === 'TOPIC' && (
                            <span className="text-[10px] font-bold text-jazz-accent uppercase tracking-widest mt-1 block">
                                Discusión Abierta
                            </span>
                        )}
                    </div>
                    {theme.type !== 'TOPIC' && (
                        <span className="text-xs font-mono text-jazz-muted bg-white/5 px-2 py-0.5 rounded mt-1 inline-block">
                            {theme.tonality || 'Key?'}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {isPlaying && <span className="animate-pulse text-jazz-accent font-bold text-xs uppercase tracking-widest bg-jazz-accent/10 px-2 py-1 rounded">En Escenario</span>}
                    {isQueued && <span className="text-jazz-gold font-bold text-xs uppercase tracking-widest bg-jazz-gold/10 px-2 py-1 rounded">Siguiente</span>}

                    {(isHost || currentUser?.role === 'ADMIN' || (currentUser && theme.proposedById === currentUser.id)) && (
                        <button onClick={() => setShowEdit(true)} className="text-white/40 hover:text-white p-1" title="Editar"><Pencil size={16} /></button>
                    )}
                    {(isHost || currentUser?.role === 'ADMIN') && (
                        <button
                            onClick={async () => {
                                if (confirm('¿Eliminar tema?')) {
                                    removeTheme(theme.id);
                                    const result = await deleteTheme(theme.id);
                                    if (!result.success) {
                                        addTheme(theme);
                                        toast.error(result.error || 'Error al eliminar tema');
                                    } else {
                                        toast.success('Tema eliminado');
                                    }
                                }
                            }}
                            className="text-white/40 hover:text-red-500 p-1" title="Eliminar"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>
            {/* Sheet Music Preview - Only for Songs */}
            {theme.sheetMusicUrl && theme.type !== 'TOPIC' && (
                <div className="mb-4">
                    {/* 1. If it's an image (jpg/png) or a Cloudinary PDF we can convert */}
                    {(theme.sheetMusicUrl.match(/\.(jpg|jpeg|png|webp)$/i) || (theme.sheetMusicUrl.includes('cloudinary') && theme.sheetMusicUrl.endsWith('.pdf'))) ? (
                        <div className="relative group cursor-pointer overflow-hidden rounded-lg border border-white/10" onClick={onShowDetails}>
                            <img
                                src={theme.sheetMusicUrl.endsWith('.pdf') ? theme.sheetMusicUrl.replace('.pdf', '.jpg') : theme.sheetMusicUrl}
                                alt="Partitura Preview"
                                className="w-full h-32 object-cover object-top opacity-80 group-hover:opacity-100 transition-opacity bg-white/5"
                                onError={(e) => {
                                    // Fallback if image fails (e.g. PDF conversion failed)
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.style.display = 'none';
                                    // We could force show the link button here, but React state would be better.
                                    // For now, hiding the broken image is a good first step.
                                }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-xs font-bold flex items-center gap-1 bg-black/60 px-2 py-1 rounded">
                                    <FileMusic size={12} /> Ver Completa
                                </span>
                            </div>
                        </div>
                    ) : (
                        <a
                            href={theme.sheetMusicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-jazz-gold hover:text-white flex items-center gap-1.5 text-xs transition-colors bg-jazz-gold/5 px-3 py-1.5 rounded-lg border border-jazz-gold/20 hover:border-jazz-gold/40 w-fit"
                        >
                            <FileMusic size={14} />
                            <span className="font-medium">Ver Partitura / Link</span>
                        </a>
                    )}
                </div>
            )}
            {
                theme.type === 'TOPIC' && theme.description && (
                    <p className="text-white/60 text-sm mb-4 line-clamp-2">{theme.description}</p>
                )
            }

            {/* Participation Section */}
            {
                theme.type !== 'TOPIC' && (
                    <div className="space-y-4 pt-2">
                        <InstrumentSelector
                            participations={participations}
                            currentUser={currentUser}
                            myParticipation={myParticipation}
                            onJoin={async (inst) => {
                                if (!currentUser) {
                                    toast.error('Debes iniciar sesión para anotarte.');
                                    return;
                                }

                                onJoin(inst);
                            }}
                            onLeave={onLeave}
                        />
                    </div>
                )
            }


            <EditThemeModal
                isOpen={showEdit}
                onClose={() => setShowEdit(false)}
                theme={theme}
            />
        </div>
    );
}
