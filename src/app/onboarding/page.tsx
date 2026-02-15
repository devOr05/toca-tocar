'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { completeOnboarding } from './actions';
import { toast } from 'sonner';
import { Music, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

const INSTRUMENTS = [
    'Guitarra', 'Piano', 'Bajo', 'Batería', 'Saxofón', 'Trompeta', 'Voz', 'Percusión', 'Violín', 'Otro'
];

export default function OnboardingPage() {
    const { update } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        const res = await completeOnboarding(formData);

        if (res.success) {
            toast.success('¡Perfil completado!');
            // Update session client-side to reflect new fields immediately
            await update();
            router.push('/dashboard');
        } else {
            toast.error(res.error || 'Error al guardar');
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Background Ambience */}
            <div className="absolute inset-0 bg-gradient-to-b from-jazz-gold/5 via-black to-black z-0" />
            <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-jazz-gold/10 rounded-full blur-[100px]" />

            <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2 tracking-tight">
                        Bienvenido a la <span className="text-jazz-gold">Aldea</span>
                    </h1>
                    <p className="text-white/60">
                        Para conectar con otros músicos, necesitamos saber quién eres y dónde estás.
                    </p>
                </div>

                <form action={handleSubmit} className="bg-jazz-surface border border-white/5 rounded-2xl p-6 space-y-6 shadow-2xl shadow-jazz-gold/5">

                    {/* Instrument Field */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-jazz-gold flex items-center gap-2">
                            <Music size={14} /> Tu Instrumento Principal
                        </label>
                        <select
                            name="mainInstrument"
                            required
                            className="w-full bg-black/50 border border-white/10 rounded-lg h-12 px-4 text-white focus:outline-none focus:border-jazz-gold/50 transition-colors"
                        >
                            <option value="">Selecciona tu instrumento...</option>
                            {INSTRUMENTS.map(inst => (
                                <option key={inst} value={inst}>{inst}</option>
                            ))}
                        </select>
                    </div>

                    {/* City Field */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-jazz-gold flex items-center gap-2">
                            <MapPin size={14} /> Tu Ciudad
                        </label>
                        <input
                            type="text"
                            name="city"
                            placeholder="Ej. Buenos Aires, Madrid, CDMX"
                            required
                            className="w-full bg-black/50 border border-white/10 rounded-lg h-12 px-4 text-white focus:outline-none focus:border-jazz-gold/50 transition-colors"
                        />
                        <p className="text-[10px] text-white/30">
                            Esto nos ayuda a mostrarte Jams cerca de ti.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-jazz-gold text-black font-bold h-12 rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <>
                                Entrar a la Aldea <ArrowRight size={18} />
                            </>
                        )}
                    </button>

                </form>
            </div>
        </div>
    );
}
