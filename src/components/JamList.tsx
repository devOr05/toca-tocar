'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Music2, ArrowRight, Trash2, Edit2 } from 'lucide-react';
import EditJamModal from './EditJamModal'; // Ensure this matches file name

import { Jam } from '@/types';

interface JamWithCount extends Jam {
    _count?: { themes: number };
}

export default function JamList({ jams, currentUserId, isAdmin = false, title = 'Jams Activas', isHistory = false }: {
    jams: JamWithCount[],
    currentUserId?: string,
    isAdmin?: boolean,
    title?: string,
    isHistory?: boolean
}) {
    const [query, setQuery] = useState('');
    const [editingJam, setEditingJam] = useState<Jam | null>(null);

    const filteredJams = jams.filter(jam =>
        jam.name.toLowerCase().includes(query.toLowerCase()) ||
        jam.code.toLowerCase().includes(query.toLowerCase()) ||
        (jam.city && jam.city.toLowerCase().includes(query.toLowerCase()))
    );

    return (
        <div className={`
            border transition-all rounded-2xl p-6 shadow-xl
            ${isHistory ? 'bg-black/40 border-white/10' : 'bg-jazz-surface border-white/10'}
        `}>
            <div className="flex items-center justify-between mb-6">
                <h2 className={`${isHistory ? 'text-xl text-white/70' : 'text-3xl text-white'} font-bold flex items-center gap-3`}>
                    <Music2 className={isHistory ? 'text-white/40 w-6 h-6' : 'text-jazz-accent w-8 h-8'} /> {title}
                </h2>
                <span className="bg-white/5 text-xs px-3 py-1.5 rounded-lg text-white/50 font-mono uppercase tracking-widest border border-white/5">
                    {filteredJams.length}
                </span>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                <input
                    type="text"
                    placeholder="Buscar por nombre, código o ciudad..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-jazz-gold transition-all placeholder:text-white/30"
                />
            </div>

            {filteredJams.length === 0 ? (
                <div className="text-center py-8 text-white/30">
                    {query ? (
                        <p>No se encontraron jams con "{query}"</p>
                    ) : (
                        <>
                            <p>No hay Jams activas.</p>
                            <p className="text-sm">¡Sé el primero en crear una!</p>
                        </>
                    )}
                </div>
            ) : (
                <ul className="space-y-3">
                    {filteredJams.map((jam) => (
                        <li key={jam.id}>
                            <Link href={`/jam/${jam.code}`} className="block bg-white/5 hover:bg-white/10 p-4 rounded-xl transition-colors border border-white/5 group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Music2 className="w-12 h-12 text-jazz-gold rotate-12" />
                                </div>
                                <div className="relative z-10 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-white group-hover:text-jazz-gold transition-colors">{jam.name}</h3>
                                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                                            <span className="text-xs text-white/40 font-mono bg-black/30 px-1.5 py-0.5 rounded border border-white/5">
                                                {jam.code}
                                            </span>

                                            {jam.city && (
                                                <span className="text-xs text-jazz-muted">
                                                    📍 {jam.city}
                                                </span>
                                            )}

                                            {/* Edit Button (Host Only or Admin) */}
                                            {(currentUserId?.trim() === jam.hostId?.trim() || isAdmin) && (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setEditingJam(jam);
                                                    }}
                                                    className="flex items-center gap-1 bg-jazz-gold/10 hover:bg-jazz-gold/20 text-jazz-gold px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-jazz-gold/20 transition-all z-20"
                                                >
                                                    <Edit2 className="w-3 h-3" />
                                                    Editar
                                                </button>
                                            )}

                                            {/* Delete Button (Host Only or 5J1E override or Admin) */}
                                            {(currentUserId?.trim() === jam.hostId?.trim() || jam.code === '5J1E' || isAdmin) && (
                                                <button
                                                    onClick={async (e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        if (confirm('¿Eliminar esta Jam?')) {
                                                            const { deleteJam } = await import('@/app/actions');
                                                            await deleteJam(jam.code);
                                                            window.location.reload();
                                                        }
                                                    }}
                                                    className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-red-500/20 transition-all z-20"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                    Eliminar
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <ArrowRight className="text-white/20 group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}

            {editingJam && (
                <EditJamModal
                    isOpen={!!editingJam}
                    onClose={() => setEditingJam(null)}
                    jam={editingJam}
                />
            )}
        </div>
    );
}
