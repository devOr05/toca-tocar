'use client';

import { useState, useEffect } from 'react';
import { X, MapPin, Music, Calendar } from 'lucide-react';
import { getMusicianProfile } from '@/app/actions';

interface MusicianProfileModalProps {
    userId: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function MusicianProfileModal({ userId, isOpen, onClose }: MusicianProfileModalProps) {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && userId) {
            setLoading(true);
            getMusicianProfile(userId).then((res) => {
                if (res.success) {
                    setProfile(res.user);
                }
                setLoading(false);
            });
        }
    }, [isOpen, userId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-jazz-surface border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-2 bg-black/40 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors z-10"
                >
                    <X size={18} />
                </button>

                {loading ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jazz-gold"></div>
                    </div>
                ) : profile ? (
                    <div className="flex flex-col">
                        <div className="relative h-32 bg-gradient-to-b from-jazz-gold/20 to-jazz-surface">
                            <div className="absolute -bottom-10 left-6">
                                <div className="w-24 h-24 rounded-full border-4 border-jazz-surface bg-white/10 overflow-hidden shadow-lg">
                                    {profile.image ? (
                                        <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pt-12 px-6 pb-6 space-y-4">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-1">{profile.name}</h2>
                                <p className="text-jazz-gold font-medium flex items-center gap-1.5">
                                    <Music size={14} /> {profile.mainInstrument || 'Músico'}
                                </p>
                            </div>

                            <div className="space-y-4">
                                {/* STATS & FAVORITE */}
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center gap-1">
                                        <span className="text-jazz-gold font-bold text-lg">{profile._count?.participations || 0}</span>
                                        <span className="text-white/50 uppercase tracking-wider text-[10px]">Temas Tocados</span>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center gap-1">
                                        <span className="text-jazz-accent font-bold text-lg truncate w-full px-1">{profile.favoriteTheme || '-'}</span>
                                        <span className="text-white/50 uppercase tracking-wider text-[10px]">Tema Preferido</span>
                                    </div>
                                </div>

                                {/* THEMES LIST */}
                                {profile.participations && profile.participations.length > 0 && (
                                    <div className="bg-white/5 rounded-xl border border-white/5 p-3">
                                        <h3 className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <Music size={12} /> Últimos Temas
                                        </h3>
                                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto custom-scrollbar">
                                            {profile.participations.map((p: any, i: number) => (
                                                <span key={i} className="text-[10px] bg-black/40 text-white/80 px-2 py-1 rounded border border-white/5 hover:border-jazz-gold/30 transition-colors">
                                                    {p.theme.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-center gap-4 text-xs text-white/40 pt-2 border-t border-white/5">
                                {profile.city && (
                                    <span className="flex items-center gap-1">
                                        <MapPin size={12} /> {profile.city}
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <Calendar size={12} /> Se unió {new Date(profile.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 text-center text-white/50">
                        Usuario no encontrado.
                    </div>
                )}
            </div>
        </div>
    );
}
