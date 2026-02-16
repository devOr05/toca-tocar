'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, Music2 } from 'lucide-react';
import { searchMusicians } from '@/app/actions';
import { User } from '@/types';
import { useDebounce } from 'use-debounce';

interface MusicianAutocompleteProps {
    onSelect: (musician: { userId: string; name: string; image?: string | null; mainInstrument?: string }) => void;
    placeholder?: string;
    existingMusicians?: string[]; // IDs to exclude
}

export default function MusicianAutocomplete({ onSelect, placeholder = 'Buscar músico...', existingMusicians = [] }: MusicianAutocompleteProps) {
    const [query, setQuery] = useState('');
    const [debouncedQuery] = useDebounce(query, 500);
    const [results, setResults] = useState<Partial<User>[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchMusicians = async () => {
            if (debouncedQuery.length < 2) {
                setResults([]);
                return;
            }

            setIsLoading(true);
            const musicians = await searchMusicians(debouncedQuery);
            // Filter out already selected musicians if needed
            const filtered = musicians.filter((m: any) => !existingMusicians.includes(m.id));

            // Fix type mismatch (null vs undefined)
            const mapped = filtered.map(m => ({
                ...m,
                name: m.name || undefined,
                image: m.image || undefined,
                city: m.city || undefined,
                mainInstrument: m.mainInstrument || undefined
            }));

            setResults(mapped);
            setIsLoading(false);
            setIsOpen(true);
        };

        fetchMusicians();
    }, [debouncedQuery, existingMusicians]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (user: Partial<User>) => {
        if (!user.id || !user.name) return;
        onSelect({
            userId: user.id,
            name: user.name,
            image: user.image || null,
            mainInstrument: user.mainInstrument || undefined
        });
        setQuery('');
        setResults([]);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={containerRef}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={16} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    placeholder={placeholder}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-jazz-gold/50 transition-colors"
                />
                {isLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="animate-spin text-jazz-gold" size={16} />
                    </div>
                )}
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-jazz-surface border border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <ul className="max-h-60 overflow-y-auto custom-scrollbar">
                        {results.map((user) => (
                            <li key={user.id}>
                                <button
                                    onClick={() => handleSelect(user)}
                                    className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0 group"
                                >
                                    <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden shrink-0 group-hover:scale-110 transition-transform">
                                        {user.image ? (
                                            <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs">👤</div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white group-hover:text-jazz-gold transition-colors">{user.name}</div>
                                        <div className="text-xs text-white/50 flex items-center gap-2">
                                            {user.mainInstrument && <span className="text-jazz-gold">{user.mainInstrument}</span>}
                                            {user.city && <span>• {user.city}</span>}
                                        </div>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
