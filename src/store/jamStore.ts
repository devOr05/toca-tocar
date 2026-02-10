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

    joinTheme: async (themeId: string, instrument: string) => {
        const { currentUser, participations } = get();
        if (!currentUser) return;

        // Optimistic Update
        const newParticipation: Participation = {
            id: `temp-${Date.now()}`,
            userId: currentUser.id,
            userName: currentUser.name || 'Yo',
            themeId,
            instrument,
            status: 'WAITING',
            createdAt: new Date(),
        };

        set({ participations: [...participations, newParticipation] });

        // Server Action
        // We need to import the action. But we can't import server action directly in client store file usually?
        // Yes we can if we use 'use server' in actions file and import it here.
        // Dynamic import or passed as dependency?
        // Next.js allows importing server actions in client files.

        try {
            const { joinThemeAction } = await import('@/app/actions');
            const result = await joinThemeAction(themeId, instrument);
            if (!result.success) {
                // Revert if failed
                set({ participations: get().participations.filter(p => p.id !== newParticipation.id) });
                alert(result.error);
            }
        } catch (err) {
            console.error(err);
            set({ participations: get().participations.filter(p => p.id !== newParticipation.id) });
        }

        get().checkEnsembles();
    },

    leaveTheme: async (themeId: string) => {
        const { currentUser, participations } = get();
        if (!currentUser) return;

        const previousParticipations = [...participations];

        set({
            participations: participations.filter((p) => !(p.userId === currentUser.id && p.themeId === themeId)),
        });

        try {
            const { leaveTheme } = await import('@/app/actions');
            const result = await leaveTheme(themeId);
            if (!result.success) {
                set({ participations: previousParticipations });
                alert(result.error);
            }
        } catch (err) {
            console.error(err);
            set({ participations: previousParticipations });
        }
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
