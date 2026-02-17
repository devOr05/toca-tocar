'use client';

import { User } from '@/types';
import { MapPin, Music, Trash2 } from 'lucide-react';

import { useState } from 'react';
import { checkInToJam } from '@/app/actions';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { JamAttendance } from '@/types';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

interface MusicianListProps {
    jamId: string;
    currentUser?: User | null;
    attendance: JamAttendance[];
    cityMusicians: Partial<User>[];
    isHost?: boolean;
    title?: string;
    onMusicianClick?: (userId: string) => void;
}

export default function MusicianList({ jamId, currentUser, attendance, cityMusicians, isHost, title, onMusicianClick }: MusicianListProps) {
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const isCheckedIn = currentUser && attendance.some(a => a.userId === currentUser.id);

    const handleCheckIn = async () => {
        if (!currentUser) return;
        setIsCheckingIn(true);

        const instrument = currentUser.mainInstrument || 'Varios';

        const result = await checkInToJam(jamId, instrument);
        if (result.success) {
            toast.success('¡Te has unido a la Jam!');
            startTransition(() => {
                router.refresh();
            });
        } else {
            toast.error('Error al unirse');
        }
        setIsCheckingIn(false);
    };

    // Filter out musicians already in Jam and the current user from City list
    const attendanceIds = new Set(attendance.map(a => a.userId));
    const filteredCityMusicians = cityMusicians.filter(u => u.id && !attendanceIds.has(u.id) && u.id !== currentUser?.id);

    const handleInviteToJam = async (userId: string, name: string) => {
        const { createNotification } = await import('@/lib/notifications');
        // Simple notification for now, we could create a real invitation record later
        toast.promise(
            createNotification(
                userId,
                'JAM_INVITE',
                `¡${currentUser?.name} te ha invitado a unirse a la Jam!`,
                `/jam/${jamId}`,
                currentUser?.id
            ),
            {
                loading: 'Enviando invitación...',
                success: `Invitación enviada a ${name}`,
                error: 'Error al enviar invitación'
            }
        );
    };

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
                            <div
                                key={att.userId}
                                onClick={() => onMusicianClick?.(att.userId)}
                                className={`flex items-center gap-3 p-2 bg-white/5 rounded-xl border border-white/5 ${onMusicianClick ? 'cursor-pointer hover:bg-white/10 active:scale-[0.98] transition-all' : ''}`}
                            >
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
                                {(currentUser?.role === 'ADMIN' || isHost) && att.userId !== currentUser?.id && (
                                    <button
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            const name = att.user?.name || 'este usuario';
                                            if (confirm(`¿Eliminar ${isHost ? 'invitado' : 'usuario'} ${name}?`)) {
                                                const { deleteUser } = await import('@/app/actions');

                                                if (att.userId.startsWith('guest-')) {
                                                    toast.info('Los invitados se eliminan al reiniciar o salir.');
                                                } else {
                                                    await deleteUser(att.userId);
                                                    window.location.reload();
                                                }
                                            }
                                        }}
                                        className="ml-2 text-red-500 hover:text-red-400 p-1"
                                    >
                                        <Trash2 size={12} />
                                    </button>
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
                    {filteredCityMusicians.length === 0 ? (
                        <p className="text-[10px] text-white/20 italic p-2 border border-white/5 rounded-lg border-dashed">
                            No hay otros músicos en {currentUser?.city || 'tu ciudad'} para invitar.
                        </p>
                    ) : (
                        filteredCityMusicians.map((user) => (
                            <li key={user.id} className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded-lg transition-colors group">
                                <div className="w-6 h-6 rounded-full bg-white/10 overflow-hidden shrink-0 grayscale hover:grayscale-0 transition-all">
                                    {user.image ? (
                                        <img src={user.image} alt={user.name || ''} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px]">user</div>
                                    )}
                                </div>
                                <span className="text-xs text-white truncate flex-1">{user.name}</span>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handleInviteToJam(user.id!, user.name || 'Músico')}
                                        className="text-jazz-gold hover:text-white p-1 text-[10px] font-bold uppercase border border-jazz-gold/30 rounded px-2 hover:bg-jazz-gold/20 transition-all"
                                        title="Invitar a la Jam"
                                    >
                                        Invitar
                                    </button>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
}
