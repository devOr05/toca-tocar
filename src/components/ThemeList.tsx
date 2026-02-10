'use client';

import ThemeCard from './ThemeCard';
import { useJamStore } from '../store/jamStore';

export default function ThemeList() {
    const { themes, participations, currentUser, jam, joinTheme, leaveTheme } = useJamStore();

    const playing = themes.filter(t => t.status === 'PLAYING');
    const queued = themes.filter(t => t.status === 'QUEUED');
    const open = themes.filter(t => t.status === 'OPEN');

    const getParticipations = (themeId: string) =>
        participations.filter(p => p.themeId === themeId);

    const isHost = Boolean(currentUser && jam && currentUser.id === jam.hostId);

    return (
        <div className="space-y-8 pb-20">
            {/* Playing Now */}
            {playing.length > 0 && (
                <section>
                    <h2 className="text-jazz-accent text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-jazz-accent animate-pulse" />
                        Sonando Ahora
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

            {/* Up Next */}
            {queued.length > 0 && (
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

            {/* Open Themes */}
            <section>
                <h2 className="text-jazz-muted text-xs font-bold uppercase tracking-widest mb-3">
                    Temas Abiertos
                </h2>
                <div className="grid gap-4">
                    {open.map(theme => (
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
        </div>
    );
}
