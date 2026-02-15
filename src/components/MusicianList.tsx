'use client';

import { User } from '@/types';
import { MapPin, Music } from 'lucide-react';

import { useState } from 'react';
import { checkInToJam } from '@/app/actions';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { JamAttendance } from '@/types';

interface MusicianListProps {
    jamId: string;
    currentUser?: User;
    attendance: JamAttendance[];
    cityMusicians: Partial<User>[];
    title?: string;
}

export default function MusicianList({ jamId, currentUser, attendance, cityMusicians, title }: MusicianListProps) {
    const [isCheckingIn, setIsCheckingIn] = useState(false);

    const isCheckedIn = currentUser && attendance.some(a => a.userId === currentUser.id);

    const handleCheckIn = async () => {
        if (!currentUser) return;
        setIsCheckingIn(true);

        // Use user's profile instrument or ask (for now auto-use profile)
        const instrument = currentUser.mainInstrument || 'Varios';

        const result = await checkInToJam(jamId, instrument);
        if (result.success) {
            toast.success('¡Te has unido a la Jam!');
        } else {
            toast.error('Error al unirse');
        }
        setIsCheckingIn(false);
    };

    // Filter out musicians already in Jam from City list
    const attendanceIds = new Set(attendance.map(a => a.userId));
    const filteredCityMusicians = cityMusicians.filter(u => u.id && !attendanceIds.has(u.id));

    return (
        <div className="bg-jazz-surface border border-white/5 rounded-2xl p-4 h-full flex flex-col gap-6">

            {/* JAM MUSICIANS SECTION */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider text-jazz-gold flex items-center gap-2">
                        <Music size={14} /> En la Jam ({attendance.length})
                    </h3>
                    {currentUser && !isCheckedIn && (
                        <button
                            onClick={handleCheckIn}
                            disabled={isCheckingIn}
                            className="bg-jazz-accent text-black text-xs font-bold px-3 py-1.5 rounded-full hover:scale-105 transition-transform flex items-center gap-1.5"
                        >
                            {isCheckingIn ? <Loader2 size={12} className="animate-spin" /> : <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                            Estoy Disponible
                        </button>
                    )}
                    {currentUser && isCheckedIn && (
                        <span className="text-[10px] text-green-400 font-bold bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                            ✓ Disponible
                        </span>
                    )}
                </div>

                {attendance.length === 0 ? (
                    <p className="text-white/30 text-xs text-center py-2 italic bg-white/5 rounded-lg border border-dashed border-white/10">
                        Nadie se ha anotado aún. ¡Sé el primero!
                    </p>
                ) : (
                    <div className="grid grid-cols-1 gap-2">
                        {attendance.map((att) => (
                            <div key={att.userId} className="flex items-center gap-3 p-2 bg-white/5 rounded-xl border border-white/5">
                                <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden shrink-0">
                                    {att.user.image ? (
                                        <img src={att.user.image} alt={att.user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs">👤</div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-white text-xs truncate">{att.user.name}</h4>
                                    <span className="text-[10px] text-jazz-gold block truncate">{att.instrument}</span>
                                </div>
                                {att.userId === currentUser?.id && (
                                    <div className="ml-auto w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* DIVIDER */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* CITY MUSICIANS SECTION */}
            <div>
                <h3 className="font-bold text-white/50 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                    <MapPin size={12} /> Otros en la Ciudad
                </h3>
                <ul className="space-y-2 opacity-60 hover:opacity-100 transition-opacity">
                    {filteredCityMusicians.map((user) => (
                        <li key={user.id} className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded-lg transition-colors">
                            <div className="w-6 h-6 rounded-full bg-white/10 overflow-hidden shrink-0 grayscale hover:grayscale-0 transition-all">
                                {user.image ? (
                                    <img src={user.image} alt={user.name || ''} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[10px]">user</div>
                                )}
                            </div>
                            <span className="text-xs text-white truncate">{user.name}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
