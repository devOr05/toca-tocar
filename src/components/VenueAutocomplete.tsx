'use client';

import { useState, useEffect } from 'react';
import { getVenues } from '@/app/actions';
import { MapPin, TrendingUp } from 'lucide-react';

interface Venue {
    id: string;
    name: string;
    address?: string | null;
    city?: string | null;
    lat?: number | null;
    lng?: number | null;
    usageCount: number;
}

interface VenueAutocompleteProps {
    value: string;
    onSelect: (venue: Venue) => void;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function VenueAutocomplete({ value, onSelect, onChange, placeholder = "Buscar lugar..." }: VenueAutocompleteProps) {
    const [suggestions, setSuggestions] = useState<Venue[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (value.length < 2) {
                setSuggestions([]);
                return;
            }

            setIsLoading(true);
            const venues = await getVenues(value);
            setSuggestions(venues);
            setIsLoading(false);
        };

        const debounce = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(debounce);
    }, [value]);

    const handleSelect = (venue: Venue) => {
        onSelect(venue);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-jazz-gold" size={18} />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                    placeholder={placeholder}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-10 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-jazz-gold/50 focus:border-jazz-gold/50"
                />
                {isLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-jazz-gold/30 border-t-jazz-gold rounded-full animate-spin" />
                    </div>
                )}
            </div>

            {isOpen && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-jazz-surface border border-white/10 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {suggestions.map((venue) => (
                        <button
                            key={venue.id}
                            onClick={() => handleSelect(venue)}
                            className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-white text-sm truncate">{venue.name}</div>
                                    {venue.address && (
                                        <div className="text-xs text-white/40 truncate">{venue.address}</div>
                                    )}
                                    {venue.city && (
                                        <div className="text-xs text-jazz-gold/60">{venue.city}</div>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 text-jazz-gold/60 text-xs shrink-0">
                                    <TrendingUp size={12} />
                                    <span>{venue.usageCount}</span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {isOpen && value.length >= 2 && suggestions.length === 0 && !isLoading && (
                <div className="absolute z-50 w-full mt-2 bg-jazz-surface border border-white/10 rounded-lg shadow-xl p-4">
                    <p className="text-white/40 text-sm text-center">
                        No se encontraron lugares. El nombre que ingreses se guardará como nuevo lugar.
                    </p>
                </div>
            )}
        </div>
    );
}
