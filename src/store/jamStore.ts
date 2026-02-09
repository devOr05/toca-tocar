import { create } from 'zustand';
import { Jam, Theme, Participation, User } from '../types';
import { MOCK_JAM, MOCK_THEMES, MOCK_PARTICIPATIONS } from '../lib/mock-data';

interface JamState {
    jam: Jam;
    themes: Theme[];
    participations: Participation[];
    currentUser: User | null;

    setUser: (name: string) => void;
    setJamState: (jam: Jam, themes: Theme[], participations: Participation[]) => void;
    joinTheme: (themeId: string, instrument: string) => void;
    leaveTheme: (themeId: string) => void;
    checkEnsembles: () => void;
}

export const useJamStore = create<JamState>((set, get) => ({
    // Initialize with MOCK data as fallback, but setJamState will override it
    jam: MOCK_JAM,
    themes: MOCK_THEMES,
    participations: MOCK_PARTICIPATIONS,
    currentUser: null,

    setUser: (name: string) => {
        set({ currentUser: { id: `user-${Date.now()}`, name, role: 'USER' } });
    },

    setJamState: (jam, themes, participations) => {
        set({ jam, themes, participations });
    },

    joinTheme: (themeId: string, instrument: string) => {
        const { currentUser, participations } = get();
        if (!currentUser) return;

        // Optimistic Update
        // In a real app with DB, we would call a Server Action here too.
        // For this MVP step, we update local state.
        // NEXT STEP: Call joinThemeAction(themeId, instrument)

        const existing = participations.find((p) => p.userId === currentUser.id && p.themeId === themeId);
        if (existing) return;

        const newParticipation: Participation = {
            id: `p-${Date.now()}`,
            userId: currentUser.id,
            userName: currentUser.name,
            themeId,
            instrument,
            status: 'WAITING',
            createdAt: new Date(),
        };

        set({ participations: [...participations, newParticipation] });
        get().checkEnsembles();
    },

    leaveTheme: (themeId: string) => {
        const { currentUser, participations } = get();
        if (!currentUser) return;

        set({
            participations: participations.filter((p) => !(p.userId === currentUser.id && p.themeId === themeId)),
        });
    },

    checkEnsembles: () => {
        const { themes, participations } = get();

        const updatedThemes = themes.map((theme) => {
            if (theme.status !== 'OPEN') return theme;

            const parts = participations.filter((p) => p.themeId === theme.id);
            if (parts.length >= 3) {
                return { ...theme, status: 'QUEUED' as const };
            }
            return theme;
        });

        set({ themes: updatedThemes });
    },
}));
