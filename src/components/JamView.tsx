'use client';

import { useEffect, useState } from 'react';
import { useJamStore } from '../store/jamStore';
import { leaveJam } from '@/app/actions';
import ThemeList from './ThemeList';
import { Share2, Users, Music2, LogOut, Trash2, Calendar, MapPin, Image as ImageIcon, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Jam, Theme, Participation, User } from '../types';
import CreateThemeModal from './CreateThemeModal';
import SuggestedThemes from './SuggestedThemes';
import JamChat from './JamChat';
import MusicianList from './MusicianList';

interface JamViewProps {
    initialJam: Jam;
    initialThemes: Theme[];
    initialParticipations: Participation[];
    currentUser?: User;
}

export default function JamView({ initialJam, initialThemes, initialParticipations, currentUser: initialUser }: JamViewProps) {
    const router = useRouter();
    const { jam, setUser, setAuthenticatedUser, currentUser, setJamState } = useJamStore();
    const [mounted, setMounted] = useState(false);
    const [formattedDate, setFormattedDate] = useState<string>('');
    const [isCreateThemeOpen, setIsCreateThemeOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'THEMES' | 'FORUM' | 'SUGGESTED'>('THEMES');
    const [createType, setCreateType] = useState<'SONG' | 'TOPIC'>('SONG');

    const openCreateModal = (type: 'SONG' | 'TOPIC') => {
        setCreateType(type);
        setIsCreateThemeOpen(true);
    };

    // MINIMAL SHELL FOR DEBUGGING

    // We need to initialize the store though
    useEffect(() => {
        setJamState(initialJam, initialThemes, initialParticipations);
        if (initialUser) {
            setAuthenticatedUser(initialUser);
        } else if (!currentUser) {
            const storedName = localStorage.getItem('toca_tocar_user_name');
            if (storedName) {
                setUser(storedName);
            }
        }
        setMounted(true);
    }, [initialJam, initialThemes, initialParticipations, setJamState, initialUser, currentUser, setUser, setAuthenticatedUser]);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-black text-white p-10">
            <h1 className="text-2xl text-jazz-gold">JamView Shell Loaded</h1>
            <p>Components commented out.</p>
            <p>Jam: {initialJam.name}</p>
        </div>
    );
}
