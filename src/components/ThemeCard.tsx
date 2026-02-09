'use client';

import { useState } from 'react';
import { Theme, Participation, User } from '../types';
import { Mic2, Music, Drum, Guitar, Keyboard } from 'lucide-react';
import { motion } from 'framer-motion';

interface ThemeCardProps {
    theme: Theme;
    participations: Participation[];
    currentUser: User | null;
    onJoin: (instrument: string) => void;
    onLeave: () => void;
}

const INSTRUMENTS = [
    { id: 'Sax', icon: Music, label: 'Vientos' },
    { id: 'Piano', icon: Keyboard, label: 'Piano/Git' },
    { id: 'Bass', icon: Guitar, label: 'Bajo' },
    { id: 'Drums', icon: Drum, label: 'Batería' },
    { id: 'Voice', icon: Mic2, label: 'Voz' },
];

export default function ThemeCard({ theme, participations, currentUser, onJoin, onLeave }: ThemeCardProps) {
    const [showInstruments, setShowInstruments] = useState(false);

    const myParticipation = currentUser
        ? participations.find(p => p.userId === currentUser.id)
        : null;

    const isQueued = theme.status === 'QUEUED';
    const isPlaying = theme.status === 'PLAYING';

    return (
        <div className={`
      relative overflow-hidden rounded-xl border p-4 transition-all
      ${isPlaying ? 'bg-jazz-accent/20 border-jazz-accent shadow-[0_0_20px_rgba(99,102,241,0.3)]' :
                isQueued ? 'bg-jazz-gold/10 border-jazz-gold/50' :
                    'bg-jazz-surface border-white/5'}
    `}>
            {/* Status Badge */}
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-bold text-lg text-white leading-tight">{theme.name}</h3>
                    <span className="text-xs font-mono text-jazz-muted bg-white/5 px-2 py-0.5 rounded mt-1 inline-block">
                        {theme.tonality || 'Key?'}
                    </span>
                </div>
                {isPlaying && <span className="animate-pulse text-jazz-accent font-bold text-xs uppercase tracking-widest bg-jazz-accent/10 px-2 py-1 rounded">En Escenario</span>}
                {isQueued && <span className="text-jazz-gold font-bold text-xs uppercase tracking-widest bg-jazz-gold/10 px-2 py-1 rounded">Siguiente</span>}
            </div>

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
                            onClick={onLeave}
                            className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors border border-red-500/20"
                        >
                            Salir
                        </button>
                    ) : showInstruments ? (
                        <div className="grid grid-cols-5 gap-1">
                            {INSTRUMENTS.map((inst) => (
                                <button
                                    key={inst.id}
                                    onClick={() => {
                                        onJoin(inst.id);
                                        setShowInstruments(false);
                                    }}
                                    className="flex flex-col items-center justify-center bg-white/5 hover:bg-jazz-gold/20 hover:text-jazz-gold border border-white/5 rounded-lg p-2 transition-all"
                                >
                                    <inst.icon className="w-4 h-4 mb-1" />
                                    <span className="text-[8px] uppercase">{inst.id.slice(0, 3)}</span>
                                </button>
                            ))}
                            <button
                                onClick={() => setShowInstruments(false)}
                                className="col-span-5 text-xs text-white/40 mt-1 hover:text-white"
                            >
                                Cancelar
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowInstruments(true)}
                            className="w-full py-3 bg-white/5 hover:bg-jazz-gold hover:text-black hover:font-bold text-jazz-muted text-sm transition-all rounded-xl border border-white/10 group"
                        >
                            <span className="group-hover:hidden">Quiero Tocar</span>
                            <span className="hidden group-hover:inline">¡Vamos!</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
