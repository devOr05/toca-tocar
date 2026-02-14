'use client';

import { LucideIcon, Music, Keyboard, Guitar, Drum, Mic2, Music2, Music3, Music4, Wind, AudioLines, Speaker } from 'lucide-react';

export const INSTRUMENT_MAP: Record<string, { icon: LucideIcon, label: string }> = {
    'Sax': { icon: Music, label: 'Saxo' },
    'Trumpet': { icon: Music2, label: 'Trompeta' },
    'Trombone': { icon: Music3, label: 'Trombón' },
    'Piano': { icon: Keyboard, label: 'Piano' },
    'Keys': { icon: Speaker, label: 'Sinte/Teclas' },
    'Guitar': { icon: Guitar, label: 'Guitarra' },
    'Bass': { icon: AudioLines, label: 'Bajo/Contrabajo' },
    'Drums': { icon: Drum, label: 'Batería' },
    'Percussion': { icon: Drum, label: 'Percusión' },
    'Voice': { icon: Mic2, label: 'Voz' },
    'Flute': { icon: Wind, label: 'Flauta' },
    'Clarinet': { icon: Music4, label: 'Clarinete' },
    'Vibraphone': { icon: Keyboard, label: 'Vibráfono' },
    'Harmonica': { icon: Wind, label: 'Armónica' },
    'Violin': { icon: AudioLines, label: 'Violín' },
    'Other': { icon: Music, label: 'Otro' },
};

interface InstrumentIconProps {
    instrumentId: string;
    count: number;
    isActive?: boolean;
    isMobile?: boolean;
    onClick?: () => void;
    participants?: string[]; // Names for tooltip
}

export default function InstrumentIcon({
    instrumentId,
    count,
    isActive = false,
    isMobile = false,
    onClick,
    participants = []
}: InstrumentIconProps) {
    const config = INSTRUMENT_MAP[instrumentId] || INSTRUMENT_MAP['Other'];
    const Icon = config.icon;

    return (
        <button
            onClick={onClick}
            title={`${config.label}: ${participants.join(', ')}`}
            className={`
                relative flex items-center justify-center p-2 rounded-xl transition-all
                ${count > 0
                    ? 'bg-jazz-gold/10 border border-jazz-gold/30 text-jazz-gold'
                    : 'bg-white/5 border border-white/5 text-jazz-muted hover:border-white/20'
                }
                ${isActive ? 'ring-2 ring-jazz-gold bg-jazz-gold/20' : ''}
                ${isMobile ? 'p-1.5' : 'p-2'}
                hover:scale-110 active:scale-95 group
            `}
        >
            <Icon size={isMobile ? 18 : 22} />

            {count > 0 && (
                <span className={`
                    absolute -top-1.5 -right-1.5 flex items-center justify-center
                    min-w-[18px] h-[18px] rounded-full text-[10px] font-bold
                    ${isActive ? 'bg-white text-black' : 'bg-jazz-gold text-black'}
                `}>
                    {count}
                </span>
            )}

            {/* Tooltip logic could be added here if needed, or handled by Title */}
            {!isMobile && participants.length > 0 && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                    <div className="bg-black/90 border border-white/10 rounded-lg py-1 px-3 shadow-xl whitespace-nowrap text-[10px] text-white">
                        {participants.map((name, i) => (
                            <div key={i}>{name}</div>
                        ))}
                    </div>
                </div>
            )}
        </button>
    );
}
