'use client';

import ThemeCard from './ThemeCard';
import { useJamStore } from '../store/jamStore';

interface ThemeListProps {
    type?: 'SONG' | 'TOPIC';
}

export default function ThemeList({ type = 'SONG' }: ThemeListProps) {
    const { themes, participations, currentUser, jam, joinTheme, leaveTheme } = useJamStore();

    const filteredThemes = themes.filter(t => (t.type || 'SONG') === type);

    const playing = filteredThemes.filter(t => t.status === 'PLAYING');
    const queued = filteredThemes.filter(t => t.status === 'QUEUED');
    const open = filteredThemes.filter(t => t.status === 'OPEN');

    const getParticipations = (themeId: string) =>
        participations.filter(p => p.themeId === themeId);

    const isHost = Boolean(currentUser && jam && currentUser.id === jam.hostId);

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
                            />
                        ))
                    }
                </div>
            </section>
        </div>
    );
}
