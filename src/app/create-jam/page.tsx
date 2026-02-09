import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { createJam } from "../actions";
import { MapPin, Calendar, Music, Info, AlertCircle } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function CreateJamPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/");

    // 1. Check Profile Completeness
    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    });

    const isProfileComplete = user?.name && user?.mainInstrument;

    if (!isProfileComplete) {
        return (
            <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center text-center">
                <div className="bg-jazz-surface border border-jazz-gold/20 p-8 rounded-2xl max-w-sm shadow-2xl">
                    <AlertCircle className="w-12 h-12 text-jazz-gold mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-white mb-2">Perfil Incompleto</h1>
                    <p className="text-white/60 mb-6">Para organizar una Jam, necesitamos saber quién eres y qué tocas.</p>
                    <Link href="/profile" className="block w-full bg-jazz-gold text-black font-bold p-3 rounded-xl hover:scale-105 transition-transform">
                        Completar Perfil
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-6 flex flex-col items-center">
            <header className="w-full max-w-md flex items-center justify-between mb-8">
                <Link href="/dashboard" className="text-white/60 hover:text-white transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-2xl font-bold text-white">Nueva Jam 🎷</h1>
                <div className="w-6" />
            </header>

            <form action={createJam} className="w-full max-w-md space-y-5 bg-jazz-surface p-6 rounded-2xl border border-white/10 shadow-xl">

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
                    <button type="submit" className="w-full bg-jazz-gold text-black font-bold p-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-jazz-gold/20">
                        Crear Jam & Generar Flyer
                    </button>
                    <p className="text-xs text-center text-white/30 mt-3">
                        Al crearla, se generará un código único para compartir.
                    </p>
                </div>
            </form>
        </div>
    );
}
