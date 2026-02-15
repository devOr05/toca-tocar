'use client';

import { useMemo } from 'react';
import { INSTRUMENT_MAP } from './InstrumentIcon';
import { Participation, User } from '../types'; // Adjust path if needed
import { Plus } from 'lucide-react';

interface InstrumentSelectorProps {
    participations: Participation[];
    currentUser: User | null;
    onJoin: (instrument: string) => void;
    onLeave: () => void;
    myParticipation: Participation | null | undefined;
}

export default function InstrumentSelector({
    participations,
    currentUser,
    onJoin,
    onLeave,
    myParticipation
}: InstrumentSelectorProps) {

    // Group participants by instrument
    const instrumentCounts = useMemo(() => {
        return participations.reduce((acc: Record<string, { count: number, names: string[] }>, p: Participation) => {
            const inst = p.instrument;
            if (!acc[inst]) acc[inst] = { count: 0, names: [] };
            acc[inst].count++;
            acc[inst].names.push(p.userName || 'Músico');
            return acc;
        }, {});
    }, [participations]);

    // Get list of instruments to show
    // 1. Always show instruments that have participants
    // 2. If user is participating, ensure their instrument is shown (it should be covered by #1 usually)
    // 3. If user is NOT participating, show common instruments or all? 
    //    The requirement is "Sax (2) | Guitar (1)". 
    //    But how does a user ADD a new instrument? 
    //    We probably need a mode to "Add" or show all available when likely to join.
    //    Let's show ALL instruments that have count > 0.
    //    AND if I am participating, highlight mine.
    //    PLUS a way to add an instrument if I'm not in?

    //    Actually, the previous UI showed ALL icons. The new UI "Sax (2)" implies only showing active ones?
    //    If we only show active ones, how does the first person join?
    //    Proposal: Show active ones + a "Join" button that expands to show all? 
    //    Or just show the grid of all, but styled differently?
    //    
    //    User request: "System of Participation by Instruments (instead of names show counters: Sax (2)...)"
    //    This implies the *display* of participants.
    //    But for *joining*, we still need access to the instrument list.

    //    Hybrid approach:
    //    - Rows of pills for active instruments.
    //    - If I am NOT participating, show a "Tocar" button that opens/expands the full list.
    //    - If I AM participating, my instrument pill is highlighted (and I can click to leave).

    const activeInstruments = Object.keys(instrumentCounts);

    // We also need the full list for the "picker" mode
    const allInstruments = Object.keys(INSTRUMENT_MAP);

    return (
        <div className="flex flex-wrap gap-2 items-center">
            {/* Active Instruments Pills */}
            {activeInstruments.map(instId => {
                const config = INSTRUMENT_MAP[instId] || INSTRUMENT_MAP['Other'];
                const data = instrumentCounts[instId];
                const isMyInstrument = myParticipation?.instrument === instId;

                return (
                    <button
                        key={instId}
                        onClick={() => {
                            if (isMyInstrument) {
                                onLeave();
                            } else if (!myParticipation) {
                                onJoin(instId);
                            } else {
                                // Switch instrument
                                onLeave();
                                onJoin(instId);
                            }
                        }}
                        className={`
                            flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all border
                            ${isMyInstrument
                                ? 'bg-jazz-gold text-black border-jazz-gold shadow-lg shadow-jazz-gold/20'
                                : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10 hover:border-white/20'
                            }
                        `}
                        title={data.names.join(', ')}
                    >
                        <span>{config.emoji}</span>
                        <span>{config.label}</span>
                        <span className={`
                            flex items-center justify-center h-5 min-w-[20px] rounded-full text-[10px] px-1
                            ${isMyInstrument ? 'bg-black/20 text-black font-bold' : 'bg-white/10 text-white/60'}
                        `}>
                            {data.count}
                        </span>
                    </button>
                );
            })}

            {/* "Add Info" or "Join" Pill if not participating or to show empty state actions */}
            {!myParticipation && (
                <div className="dropdown dropdown-end relative group">
                    <button
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold bg-jazz-accent/10 text-jazz-accent border border-jazz-accent/20 hover:bg-jazz-accent/20 transition-all"
                    >
                        <Plus size={14} />
                        <span>Sumarme</span>
                    </button>

                    {/* Dropdown with all instruments */}
                    <div className="absolute top-full left-0 mt-2 w-48 bg-jazz-surface border border-white/10 rounded-xl shadow-xl p-2 z-50 hidden group-hover:block grid grid-cols-2 gap-1 animate-in fade-in zoom-in-95 duration-200">
                        {allInstruments.map(instId => {
                            const config = INSTRUMENT_MAP[instId];
                            return (
                                <button
                                    key={instId}
                                    onClick={() => onJoin(instId)}
                                    className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg text-left transition-colors"
                                >
                                    <span className="text-lg">{config.emoji}</span>
                                    <span className="text-xs text-white">{config.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
