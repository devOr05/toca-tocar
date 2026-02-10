'use client';

import { User } from '@/types';
import { MapPin, Music } from 'lucide-react';

interface MusicianListProps {
    users: Partial<User>[];
    title: string;
    emptyMessage?: string;
}

export default function MusicianList({ users, title, emptyMessage = 'No se encontraron músicos.' }: MusicianListProps) {
    return (
        <div className="bg-jazz-surface border border-white/5 rounded-2xl p-4 h-full">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-sm uppercase tracking-wider text-jazz-muted">
                {title}
            </h3>

            {users.length === 0 ? (
                <p className="text-white/30 text-sm text-center py-4">{emptyMessage}</p>
            ) : (
                <ul className="space-y-3">
                    {users.map((user) => (
                        <li key={user.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-colors">
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden flex-shrink-0 border border-white/10">
                                {user.image ? (
                                    <img src={user.image} alt={user.name || ''} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-lg">🎷</div>
                                )}
                            </div>

                            <div className="min-w-0">
                                <h4 className="font-bold text-white text-sm truncate">{user.name}</h4>
                                <div className="flex flex-col gap-0.5">
                                    {user.mainInstrument && (
                                        <span className="text-xs text-jazz-gold flex items-center gap-1">
                                            <Music size={10} /> {user.mainInstrument}
                                        </span>
                                    )}
                                    {user.city && (
                                        <span className="text-[10px] text-white/40 flex items-center gap-1">
                                            <MapPin size={10} /> {user.city}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
