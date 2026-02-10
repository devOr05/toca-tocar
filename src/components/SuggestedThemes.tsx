'use client';

import { useState } from 'react';
import { JAZZ_STANDARDS } from '../data/jazzStandards';
import { createTheme } from '@/app/actions';
import { Plus, Music, Loader2, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SuggestedThemesProps {
    jamCode: string;
}

export default function SuggestedThemes({ jamCode }: SuggestedThemesProps) {
    const router = useRouter();
    const [addingId, setAddingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleAdd = async (standard: typeof JAZZ_STANDARDS[0]) => {
        setAddingId(standard.name);
        try {
            await createTheme(
                jamCode,
                standard.name,
                standard.tonality,
                `Estilo: ${standard.style}`,
                undefined // sheetMusicUrl
            );
            router.refresh();
        } catch (error) {
            console.error('Error adding theme:', error);
        } finally {
            setAddingId(null);
        }
    };

    const filteredStandards = JAZZ_STANDARDS.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-jazz-surface border border-white/5 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <Music className="text-jazz-gold" size={18} />
                    Temas Sugeridos (Standards)
                </h3>
            </div>

            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                <input
                    type="text"
                    placeholder="Buscar standard..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:border-jazz-gold outline-none"
                />
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredStandards.map((standard) => (
                    <div
                        key={standard.name}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors group"
                    >
                        <div>
                            <div className="font-bold text-white text-sm">{standard.name}</div>
                            <div className="text-xs text-jazz-muted">
                                {standard.tonality} • {standard.style}
                            </div>
                        </div>

                        <button
                            onClick={() => handleAdd(standard)}
                            disabled={addingId === standard.name}
                            className={`
                                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                                ${addingId === standard.name
                                    ? 'bg-white/10 text-white/50 cursor-not-allowed'
                                    : 'bg-jazz-gold/10 text-jazz-gold hover:bg-jazz-gold hover:text-black'
                                }
                            `}
                        >
                            {addingId === standard.name ? (
                                <Loader2 className="animate-spin" size={14} />
                            ) : (
                                <Plus size={14} />
                            )}
                            {addingId === standard.name ? 'Agregando...' : 'Proponer'}
                        </button>
                    </div>
                ))}

                {filteredStandards.length === 0 && (
                    <div className="text-center py-8 text-white/40 text-sm">
                        No se encontraron standards.
                    </div>
                )}
            </div>
        </div>
    );
}
