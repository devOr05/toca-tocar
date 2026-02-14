'use client';

import { useActionState, useState } from 'react';
import { createJam, createOrUpdateVenue } from '@/app/actions';
import { MapPin, Calendar, Music, Info } from 'lucide-react';
import VenueAutocomplete from '@/components/VenueAutocomplete';

const initialState = {
    error: '',
    success: false
};

const SUGGESTED_JAM_NAMES = [
    'Standard Jam',
    'Take The A Train Session',
    'Jam de Jazz',
    'Sesión de Bebop',
    'Noche de Bossa Nova',
    'Gypsy Jazz Night',
    'Fusion Session',
    'Blues & Jazz Jam',
    'Vocals Workshop Jam',
    'Encuentro de Músicos',
    'Autumn Leaves Jam',
    'Blue Bossa Night',
    'Summertime Session'
];

export default function CreateJamForm({ user }: { user: any }) {
    const [state, formAction, isPending] = useActionState(createJam, initialState);
    const [selectedVenue, setSelectedVenue] = useState<any>(null);
    const [locationInput, setLocationInput] = useState('');
    const [jamName, setJamName] = useState(`${user.name}'s Jam`);

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
            <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Nombre del Evento</label>
                <input
                    type="text"
                    name="name"
                    value={jamName}
                    onChange={(e) => setJamName(e.target.value)}
                    list="jam-names"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-jazz-gold transition-all"
                />
                <datalist id="jam-names">
                    {SUGGESTED_JAM_NAMES.map(name => (
                        <option key={name} value={name} />
                    ))}
                </datalist>
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
                <div>
                    {/* Map Link is implicitly handled via location detection mostly, but kept for manual override */}
                    <input type="hidden" name="mapLink" />
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
