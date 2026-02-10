'use client';

import { useActionState } from 'react';
import { createJam } from '@/app/actions';
import { MapPin, Calendar, Music, Info } from 'lucide-react';

const initialState = {
    error: '',
    success: false
};

export default function CreateJamForm({ user }: { user: any }) {
    const [state, formAction, isPending] = useActionState(createJam, initialState);

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
                <input type="text" name="name" defaultValue={`${user.name}'s Jam`} required
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-jazz-gold transition-all" />
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

            {/* Location - Expanded */}
            <div className="grid grid-cols-2 gap-4">
                <input type="hidden" name="lat" id="lat" />
                <input type="hidden" name="lng" id="lng" />

                <div className="col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-white/60">Ubicación (Lugar/Dirección)</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-white/40" />
                            <input type="text" name="location" id="location" placeholder="Ej: Club de Jazz El Perseguidor" required
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-jazz-gold transition-all" />
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                if (navigator.geolocation) {
                                    const btn = document.activeElement as HTMLButtonElement;
                                    if (btn) btn.disabled = true;

                                    navigator.geolocation.getCurrentPosition(async (position) => {
                                        const { latitude, longitude } = position.coords;
                                        (document.getElementById('lat') as HTMLInputElement).value = latitude.toString();
                                        (document.getElementById('lng') as HTMLInputElement).value = longitude.toString();

                                        // Reverse Geocoding via OSM (Free)
                                        try {
                                            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                                            const data = await res.json();
                                            const address = data.address;

                                            // Auto-fill City
                                            const city = address.city || address.town || address.village || address.state;
                                            if (city) (document.querySelector('input[name="city"]') as HTMLInputElement).value = city;

                                            // Auto-fill Location Name (Road/Building)
                                            const place = address.road || address.building || address.amenity || 'Ubicación Detectada';
                                            (document.getElementById('location') as HTMLInputElement).value = place;

                                            // Auto-fill Map Link
                                            const mapLink = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
                                            (document.querySelector('input[name="mapLink"]') as HTMLInputElement).value = mapLink;

                                        } catch (e) {
                                            console.error("Error geocoding", e);
                                            alert("Ubicación detectada (Coords), pero no se pudo obtener la dirección exacta.");
                                        } finally {
                                            if (btn) btn.disabled = false;
                                        }
                                    }, (err) => {
                                        console.error(err);
                                        alert("No se pudo obtener la ubicación. Verifica los permisos.");
                                        if (btn) btn.disabled = false;
                                    });
                                } else {
                                    alert("Geolocalización no soportada.");
                                }
                            }}
                            className="bg-jazz-gold/10 hover:bg-jazz-gold/20 text-jazz-gold p-3 rounded-xl transition-colors"
                            title="Detectar mi ubicación actual"
                        >
                            <MapPin className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div>
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
            </div>

            {/* Flyer / Link */}
            <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Flyer / Evento (Link)</label>
                <div className="relative">
                    <Info className="absolute left-3 top-3.5 w-5 h-5 text-white/40" />
                    <input type="url" name="flyerUrl" placeholder="https://instagram.com/p/..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-jazz-gold transition-all" />
                </div>
                <p className="text-[10px] text-white/40 mt-1 pl-1">Pega el link de tu post de Instagram, evento de Facebook o imagen.</p>
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Descripción / Detalles</label>
                <textarea name="description" rows={3} placeholder="¿Qué vamos a tocar? ¿Hay backline?"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-jazz-gold transition-all" />
            </div>

            <div className="pt-4">
                <button type="submit" disabled={isPending} className="w-full bg-jazz-gold text-black font-bold p-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-jazz-gold/20 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isPending ? 'Creando...' : 'Crear Jam & Generar Flyer'}
                </button>
                <p className="text-xs text-center text-white/30 mt-3">
                    Al crearla, se generará un código único para compartir.
                </p>
            </div>
        </form>
    );
}
