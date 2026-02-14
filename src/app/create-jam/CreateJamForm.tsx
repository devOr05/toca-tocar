'use client';

import { useActionState, useState, useEffect } from 'react';
import { createJam, createOrUpdateVenue, getJamTemplates, getJamTemplateDetails } from '@/app/actions';
import { MapPin, Calendar, Music, Info, Sparkles } from 'lucide-react';
import VenueAutocomplete from '@/components/VenueAutocomplete';

const initialState = {
    error: '',
    success: false
};

export default function CreateJamForm({ user }: { user: any }) {
    const [state, formAction, isPending] = useActionState(createJam, initialState);
    const [selectedVenue, setSelectedVenue] = useState<any>(null);
    const [locationInput, setLocationInput] = useState('');
    const [jamName, setJamName] = useState(`${user.name}'s Jam`);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isAutoFilling, setIsAutoFilling] = useState(false);

    // Fetch suggestions as user types
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (jamName.length >= 2) {
                const results = await getJamTemplates(jamName);
                setSuggestions(results);
            } else {
                setSuggestions([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [jamName]);

    const handleAutoFill = async (name: string) => {
        setIsAutoFilling(true);
        const details = await getJamTemplateDetails(name);
        if (details) {
            // Fill normal inputs via state if we had them as state, but since they are mostly uncontrolled or via refs...
            // Let's use form selectors for simple ones or state for name
            setJamName(name);

            // For other fields, we can set values directly if we use refs or just DOM selection for simplicity in this specific component
            const setVal = (selector: string, val: string | null) => {
                const el = document.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement;
                if (el && val) el.value = val;
            };

            setVal('input[name="city"]', details.city);
            setVal('textarea[name="description"]', details.description);
            setVal('input[name="openingBand"]', details.openingBand);
            setVal('textarea[name="openingInfo"]', details.openingInfo);
            setVal('textarea[name="openingThemes"]', details.openingThemes);
            setVal('input[name="flyerUrl"]', details.flyerUrl);

            if (details.location) {
                setLocationInput(details.location);
                setVal('input[name="location"]', details.location);
            }
            if (details.lat) setVal('input[name="lat"]', details.lat.toString());
            if (details.lng) setVal('input[name="lng"]', details.lng.toString());
        }
        setIsAutoFilling(false);
    };

    const handleVenueSelect = (venue: any) => {
        setSelectedVenue(venue);
        setLocationInput(venue.name);

        // Auto-fill hidden fields
        if (venue.address) {
            (document.querySelector('input[name="location"]') as HTMLInputElement).value = venue.name;
        }
        if (venue.city) {
            (document.querySelector('input[name="city"]') as HTMLInputElement).value = venue.city;
        }
        if (venue.lat && venue.lng) {
            (document.getElementById('lat') as HTMLInputElement).value = venue.lat.toString();
            (document.getElementById('lng') as HTMLInputElement).value = venue.lng.toString();
        }
    };

    return (
        <form action={formAction} className="w-full max-w-md space-y-5 bg-jazz-surface p-6 rounded-2xl border border-white/10 shadow-xl">

            {state?.error && (
                <div className="bg-red-500/20 text-red-200 p-3 rounded-lg text-sm border border-red-500/50">
                    {state.error}
                </div>
            )}

            {/* Jam Name */}
            <div className="relative">
                <label className="block text-sm font-medium text-white/60 mb-2">Nombre del Evento</label>
                <div className="relative">
                    <input
                        type="text"
                        name="name"
                        value={jamName}
                        onChange={(e) => setJamName(e.target.value)}
                        required
                        autoComplete="off"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-jazz-gold transition-all"
                    />
                    {isAutoFilling && (
                        <div className="absolute right-3 top-3">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-jazz-gold"></div>
                        </div>
                    )}
                </div>

                {/* Custom Suggestions Dropdown */}
                {suggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-jazz-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-2 border-b border-white/5 bg-white/5">
                            <span className="text-[10px] uppercase font-bold text-jazz-gold tracking-widest flex items-center gap-2">
                                <Sparkles size={10} /> Sugerencias Guardadas
                            </span>
                        </div>
                        {suggestions.map((name) => (
                            <button
                                key={name}
                                type="button"
                                onClick={() => {
                                    handleAutoFill(name);
                                    setSuggestions([]);
                                }}
                                className="w-full text-left p-3 text-sm text-white hover:bg-jazz-gold/10 transition-colors border-b border-white/5 last:border-0"
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Date & Time */}
            <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Fecha y Hora de Inicio</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-white/40" />
                    <input type="datetime-local" name="startTime" required
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-jazz-gold transition-all [color-scheme:dark]" />
                </div>
            </div>

            {/* Location - With Venue Autocomplete */}
            <div className="grid grid-cols-2 gap-4">
                <input type="hidden" name="lat" id="lat" />
                <input type="hidden" name="lng" id="lng" />
                <input type="hidden" name="location" />

                <div className="col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-white/60">Ubicación (Lugar/Dirección)</label>
                    <VenueAutocomplete
                        value={locationInput}
                        onChange={setLocationInput}
                        onSelect={handleVenueSelect}
                        placeholder="Ej: Club de Jazz El Perseguidor"
                    />
                    <p className="text-xs text-white/40">
                        Empieza a escribir para ver lugares guardados o ingresa uno nuevo
                    </p>
                </div>

                {/* City */}
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-white/60 mb-2">Ciudad</label>
                    <input type="text" name="city" list="cities" placeholder="Ej: Buenos Aires" required
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-jazz-gold transition-all" />
                    <datalist id="cities">
                        <option value="Buenos Aires" />
                        <option value="Córdoba" />
                        <option value="Rosario" />
                        <option value="Mendoza" />
                        <option value="La Plata" />
                        <option value="Mar del Plata" />
                        <option value="San Miguel de Tucumán" />
                        <option value="Salta" />
                        <option value="Santa Fe" />
                        <option value="Santiago" />
                        <option value="Montevideo" />
                        <option value="Bogotá" />
                        <option value="México DF" />
                        <option value="Madrid" />
                        <option value="Barcelona" />
                    </datalist>
                </div>
            </div >

            {/* Flyer / Link */}
            < div >
                <label className="block text-sm font-medium text-white/60 mb-2">Flyer / Evento (Link)</label>
                <div className="relative">
                    <Info className="absolute left-3 top-3.5 w-5 h-5 text-white/40" />
                    <input type="url" name="flyerUrl" placeholder="https://instagram.com/p/..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-jazz-gold transition-all" />
                </div>
                <p className="text-[10px] text-white/40 mt-1 pl-1">Pega el link de tu post de Instagram, evento de Facebook o imagen.</p>
            </div >

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Descripción / Detalles</label>
                <textarea name="description" rows={2} placeholder="¿Qué vamos a tocar? ¿Hay backline?"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-jazz-gold transition-all" />
            </div>

            {/* Opening Info Section */}
            <div className="pt-4 border-t border-white/5">
                <h3 className="text-jazz-gold font-bold text-sm mb-4 uppercase tracking-wider flex items-center gap-2">
                    <Music size={16} /> Show de Apertura (Opcional)
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-white/40 mb-1 uppercase tracking-widest">¿Quién hace la apertura?</label>
                        <input type="text" name="openingBand" placeholder="Ej: Mario Oro Trio"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-jazz-gold transition-all" />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-white/40 mb-1 uppercase tracking-widest">Información del Grupo / Redes</label>
                        <textarea name="openingInfo" rows={2} placeholder="Redes sociales, bio corta..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-jazz-gold transition-all" />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-white/40 mb-1 uppercase tracking-widest">Temas que tocarán</label>
                        <textarea name="openingThemes" rows={2} placeholder="Listado de temas (estos se crearán como cerrados)..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-jazz-gold transition-all" />
                        <p className="text-[10px] text-white/30 mt-1">Estos temas aparecerán en la Jam pero no permitirán anotarse a otros músicos.</p>
                    </div>
                </div>
            </div>

            <div className="pt-4">
                <button type="submit" disabled={isPending} className="w-full bg-jazz-gold text-black font-bold p-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-jazz-gold/20 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isPending ? 'Creando...' : 'Crear Jam & Generar Flyer'}
                </button>
                <p className="text-xs text-center text-white/30 mt-3">
                    Al crearla, se generará un código único para compartir.
                </p>
            </div>
        </form >
    );
}
