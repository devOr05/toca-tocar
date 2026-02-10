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
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-white/60 mb-2">Ubicación (Lugar/Dirección)</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-white/40" />
                        <input type="text" name="location" placeholder="Ej: Club de Jazz El Perseguidor" required
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-jazz-gold transition-all" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Ciudad</label>
                    <input type="text" name="city" placeholder="Ej: Buenos Aires" required
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-jazz-gold transition-all" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Link Mapa (Opcional)</label>
                    <input type="url" name="mapLink" placeholder="https://maps.app..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-jazz-gold transition-all" />
                </div>
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
