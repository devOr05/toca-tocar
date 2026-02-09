'use client';

import { useEffect, useState } from 'react';
import { useJamStore } from '../store/jamStore';
import ThemeList from './ThemeList';
import { Share2, Users, Music2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface JamViewProps {
    jamCode: string;
}

export default function JamView({ jamCode }: JamViewProps) {
    const router = useRouter();
    const { jam, setUser, currentUser } = useJamStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const storedName = localStorage.getItem('toca_tocar_user_name');
        if (storedName && !currentUser) {
            setUser(storedName);
        } else if (!storedName) {
            // If no name, redirect to landing to set name
            router.push(`/?code=${jamCode}`);
        }
    }, [jamCode, currentUser, setUser, router]);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Top Bar */}
            <header className="sticky top-0 z-50 bg-jazz-surface/90 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-jazz-gold/10 p-2 rounded-lg">
                        <Music2 className="w-5 h-5 text-jazz-gold" />
                    </div>
                    <div>
                        <h1 className="font-bold text-white text-sm leading-tight">{jam.name}</h1>
                        <p className="text-[10px] text-jazz-muted font-mono tracking-widest">CODE: <span className="text-jazz-accent">{jamCode}</span></p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            alert('Enlace copiado!');
                        }}
                        className="p-2 text-white/40 hover:text-white transition-colors"
                    >
                        <Share2 className="w-5 h-5" />
                    </button>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-jazz-accent to-purple-600 flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-black">
                        {currentUser?.name.slice(0, 2).toUpperCase() || '?'}
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="p-4 max-w-lg mx-auto">
                <ThemeList />
            </main>

            {/* Floating Action Button (Add Theme - Placeholder) */}
            <button className="fixed bottom-6 right-6 w-14 h-14 bg-jazz-gold text-black rounded-full shadow-lg shadow-jazz-gold/20 flex items-center justify-center hover:scale-110 transition-transform active:scale-95">
                <span className="text-3xl font-light mb-1">+</span>
            </button>
        </div>
    );
}
