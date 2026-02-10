'use client';

import { Theme } from '@/types';
import { X, Music, FileText, Link as LinkIcon, ExternalLink } from 'lucide-react';

interface ThemeDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    theme: Theme;
}

export default function ThemeDetailsModal({ isOpen, onClose, theme }: ThemeDetailsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-jazz-surface border border-white/10 rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="p-6 space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-white leading-tight">{theme.name}</h2>
                            <span className="text-jazz-gold font-mono text-sm mt-1 inline-block bg-jazz-gold/10 px-2 py-0.5 rounded">
                                {theme.tonality || 'Sin tonalidad'}
                            </span>
                        </div>
                        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors bg-white/5 p-2 rounded-full">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {theme.description && (
                            <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                <h3 className="text-xs font-bold text-jazz-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <FileText size={14} /> Notas
                                </h3>
                                <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                                    {theme.description}
                                </p>
                            </div>
                        )}

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

                        {!theme.description && !theme.sheetMusicUrl && (
                            <div className="text-center py-8 text-white/30 italic text-sm">
                                Sin información adicional.
                            </div>
                        )}
                    </div>

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
