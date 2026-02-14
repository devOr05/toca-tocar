import { Theme, User } from '@/types';
import { X, Music, FileText, Link as LinkIcon, ExternalLink, MessageSquare } from 'lucide-react';
import JamChat from './JamChat';

interface ThemeDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    theme: Theme;
    currentUser: User | null;
}

export default function ThemeDetailsModal({ isOpen, onClose, theme, currentUser }: ThemeDetailsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-jazz-surface border border-white/10 rounded-2xl w-full max-w-md h-[80vh] flex flex-col overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="p-6 pb-4 border-b border-white/5 shrink-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-white leading-tight">{theme.name}</h2>
                            <div className="flex gap-2 mt-1">
                                <span className="text-jazz-gold font-mono text-sm bg-jazz-gold/10 px-2 py-0.5 rounded">
                                    {theme.tonality || 'Sin tonalidad'}
                                </span>
                                {theme.type === 'TOPIC' && (
                                    <span className="text-jazz-accent font-bold text-xs bg-jazz-accent/10 px-2 py-0.5 rounded uppercase tracking-wider">
                                        Tópico
                                    </span>
                                )}
                            </div>
                        </div>
                        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors bg-white/5 p-2 rounded-full">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Notes */}
                    {theme.description && (
                        <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                            <h3 className="text-xs font-bold text-jazz-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <FileText size={14} /> {theme.type === 'TOPIC' ? 'Contenido' : 'Notas'}
                            </h3>
                            <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                                {theme.description}
                            </p>
                        </div>
                    )}

                    {/* Sheet Music */}
                    {theme.sheetMusicUrl && (
                        <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                            <h3 className="text-xs font-bold text-jazz-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <LinkIcon size={14} /> Partitura
                            </h3>
                            <a
                                href={theme.sheetMusicUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 text-jazz-gold hover:underline group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-jazz-gold/10 flex items-center justify-center group-hover:bg-jazz-gold/20 transition-colors">
                                    <Music size={20} />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-bold">Ver Partitura / Enlace</div>
                                    <div className="text-xs text-white/40 truncate max-w-[200px]">{theme.sheetMusicUrl}</div>
                                </div>
                                <ExternalLink size={16} />
                            </a>
                        </div>
                    )}

                    {/* Chat Section */}
                    <div className="pt-4 border-t border-white/5">
                        <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-2 uppercase tracking-wider">
                            <MessageSquare size={14} className="text-jazz-gold" />
                            {theme.type === 'TOPIC' ? 'Comentarios' : 'Chat del Tema'}
                        </h3>
                        {currentUser ? (
                            <div className="h-[300px]">
                                <JamChat
                                    jamId={theme.jamId}
                                    currentUser={currentUser}
                                    themeId={theme.id}
                                    isCommentMode={theme.type === 'TOPIC'}
                                    title={theme.type === 'TOPIC' ? 'Comentarios del Tópico' : 'Chat del Tema'}
                                />
                            </div>
                        ) : (
                            <p className="text-white/40 text-sm italic">Inicia sesión para comentar.</p>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-white/5 shrink-0 bg-jazz-surface">
                    <button
                        onClick={onClose}
                        className="w-full bg-white/5 hover:bg-white/10 text-white font-medium py-3 rounded-xl transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
