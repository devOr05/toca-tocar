'use client';

import { useState } from 'react';
import ThemeCard from './ThemeCard';
import ThemeDetailsModal from './ThemeDetailsModal';
import { useJamStore } from '../store/jamStore';

interface ThemeListProps {
    type?: 'SONG' | 'TOPIC';
}

export default function ThemeList({ type = 'SONG' }: ThemeListProps) {
    const { themes, participations, currentUser, jam, joinTheme, leaveTheme } = useJamStore();
    const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);

    const cityMusicians = (jam as any)?.cityMusicians || [];

    const selectedTheme = themes.find(t => t.id === selectedThemeId);

    const filteredThemes = themes.filter(t => (t.type || 'SONG') === type);

    const playing = filteredThemes.filter(t => t.status === 'PLAYING');
    const queued = filteredThemes.filter(t => t.status === 'QUEUED');
    const open = filteredThemes.filter(t => t.status === 'OPEN');

    const getParticipations = (themeId: string) =>
        participations.filter(p => p.themeId === themeId);

    const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.email === 'kavay86@gmail.com' || currentUser?.email === 'orostizagamario@gmail.com' || currentUser?.email === 'kavay.86@gmail.com';
    const isHost = Boolean(currentUser && jam && (currentUser.id === jam.hostId || isAdmin));

    return (
        <div className="space-y-8 pb-20">
            {/* Active / Featured */}
            {playing.length > 0 && (
                <section>
                    <h2 className="text-jazz-accent text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-jazz-accent animate-pulse" />
                        {type === 'TOPIC' ? 'Tópicos Destacados' : 'Sonando Ahora'}
                    </h2>
                    <div className="grid gap-4">
                        {playing.map(theme => (
                            <ThemeCard
                                key={theme.id}
                                theme={theme}
                                participations={getParticipations(theme.id)}
                                currentUser={currentUser}
                                isHost={isHost}
                                onJoin={(inst) => joinTheme(theme.id, inst)}
                                onLeave={() => leaveTheme(theme.id)}
                                onShowDetails={() => setSelectedThemeId(theme.id)}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Up Next - Only for Songs */}
            {type === 'SONG' && queued.length > 0 && (
                <section>
                    <h2 className="text-jazz-gold text-xs font-bold uppercase tracking-widest mb-3">
                        Siguiente (Ensamble Listo)
                    </h2>
                    <div className="grid gap-4">
                        {queued.map(theme => (
                            <ThemeCard
                                key={theme.id}
                                theme={theme}
                                participations={getParticipations(theme.id)}
                                currentUser={currentUser}
                                isHost={isHost}
                                onJoin={(inst) => joinTheme(theme.id, inst)}
                                onLeave={() => leaveTheme(theme.id)}
                                onShowDetails={() => setSelectedThemeId(theme.id)}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Open / Regular */}
            <section>
                <h2 className="text-jazz-muted text-xs font-bold uppercase tracking-widest mb-3">
                    {type === 'TOPIC' ? 'Discusiones Abiertas' : 'Temas Abiertos'}
                </h2>
                <div className="grid gap-4">
                    {type === 'TOPIC'
                        ? filteredThemes.filter(t => t.status !== 'PLAYING').map(theme => (
                            <ThemeCard
                                key={theme.id}
                                theme={theme}
                                participations={getParticipations(theme.id)}
                                currentUser={currentUser}
                                isHost={isHost}
                                onJoin={(inst) => joinTheme(theme.id, inst)}
                                onLeave={() => leaveTheme(theme.id)}
                                onShowDetails={() => setSelectedThemeId(theme.id)}
                            />
                        ))
                        : open.map(theme => (
                            <ThemeCard
                                key={theme.id}
                                theme={theme}
                                participations={getParticipations(theme.id)}
                                currentUser={currentUser}
                                isHost={isHost}
                                onJoin={(inst) => joinTheme(theme.id, inst)}
                                onLeave={() => leaveTheme(theme.id)}
                                onShowDetails={() => setSelectedThemeId(theme.id)}
                            />
                        ))
                    }
                </div>
            </section>

            {selectedTheme && (
                <ThemeDetailsModal
                    isOpen={!!selectedTheme}
                    onClose={() => setSelectedThemeId(null)}
                    theme={selectedTheme}
                    currentUser={currentUser}
                    isHost={isHost}
                    cityMusicians={cityMusicians}
                />
            )}
        </div>
    );
}
