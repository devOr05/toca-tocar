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

    useEffect(() => {
        setJamState(initialJam, initialThemes, initialParticipations);

        if (initialJam.startTime) {
            const date = new Date(initialJam.startTime);
            const dateStr = date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
            // FORCE 24H format to avoid "07:00 p.m. hs" weirdness
            const timeStr = date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
            setFormattedDate(`${dateStr} • ${timeStr} hs`);
        }

        setMounted(true);

        if (initialUser) {
            setAuthenticatedUser(initialUser);
        } else if (!currentUser) {
            const storedName = localStorage.getItem('toca_tocar_user_name');
            if (storedName) {
                setUser(storedName);
            } else {
                router.push(`/?code=${initialJam.code}`);
            }
        }
    }, [initialJam, initialThemes, initialParticipations, setJamState, initialUser, currentUser, setUser, setAuthenticatedUser, router]);

    if (!mounted) return null;

    // Filter unique users for musician list using STORE participations to reflect real-time joins
    const { participations: storeParticipations } = useJamStore();
    const uniqueMusicians = Array.from(new Set(storeParticipations.map(p => p.userId)))
        .map(id => storeParticipations.find(p => p.userId === id)?.user)
        .filter(u => u !== undefined) as User[];

    return (
        <div className="min-h-screen bg-black pb-20 lg:pb-0 font-sans flex flex-col">
            {/* HEADER */}
            <header className="sticky top-0 z-50 bg-jazz-surface/90 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-white/10 transition-colors group"
                    >
                        <span className="flex items-center justify-center bg-jazz-gold/10 p-2 rounded-lg group-hover:bg-jazz-gold group-hover:text-black transition-colors">
                            <LogOut className="w-4 h-4 text-jazz-gold group-hover:text-black rotate-180" />
                        </span>
                        <span className="hidden sm:inline text-xs font-bold text-jazz-gold uppercase tracking-wider">Salir</span>
                    </button>

                    <div>
                        <h1 className="font-bold text-white text-sm leading-tight flex items-center gap-2">
                            {initialJam.name}
                            {initialJam.isPrivate && <span className="text-[10px] bg-red-500/20 text-red-200 px-1.5 py-0.5 rounded border border-red-500/30">Privada 🔒</span>}
                        </h1>
                        <p className="text-[10px] text-jazz-muted font-mono tracking-widest">CODE: <span className="text-jazz-accent">{initialJam.code}</span></p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-jazz-accent to-purple-600 flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-black">
                        {currentUser?.name.slice(0, 2).toUpperCase() || '?'}
                    </div>
                </div>
            </header>

            {/* DESKTOP LAYOUT (3 Cols) - DISABLED FOR DEBUG */}
            {/*
            <div className="hidden lg:flex flex-1 overflow-hidden h-[calc(100vh-64px)]">
                <div className="p-10 text-white">Layout Disabled</div>
            </div>
            */}

            {/* MOBILE LAYOUT - DISABLED FOR DEBUG */}
            {/*
            <div className="lg:hidden flex-1 overflow-y-auto">
                 <p className="p-10 text-white">Mobile Debug Mode</p>
            </div>
            */}

            {/* 
            <CreateThemeModal
                isOpen={isCreateThemeOpen}
                onClose={() => setIsCreateThemeOpen(false)}
                jamCode={jam.code}
                type={createType}
            /> 
            */}
        </div>
    );
}
