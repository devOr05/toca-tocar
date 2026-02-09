import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { updateProfile } from "../actions";
import { User, Music2, Link as LinkIcon, Save, Disc } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/");

    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    });

    if (!user) redirect("/");

    return (
        <div className="min-h-screen bg-background p-6 flex flex-col items-center">
            <header className="w-full max-w-md flex items-center justify-between mb-8">
                <Link href="/dashboard" className="text-white/60 hover:text-white transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-2xl font-bold text-white">Mi Perfil Musical 🎵</h1>
                <div className="w-6" /> {/* Spacer */}
            </header>

            <form action={updateProfile} className="w-full max-w-md space-y-6 bg-jazz-surface p-6 rounded-2xl border border-white/10 shadow-xl">

                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Nombre Artístico</label>
                    <div className="relative group">
                        <User className="absolute left-3 top-3.5 w-5 h-5 text-white/40 group-focus-within:text-jazz-gold transition-colors" />
                        <input type="text" name="name" defaultValue={user.name || ''} required
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-jazz-gold focus:ring-1 focus:ring-jazz-gold transition-all" />
                    </div>
                </div>

                {/* Main Instrument */}
                <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Instrumento Principal</label>
                    <div className="relative group">
                        <Music2 className="absolute left-3 top-3.5 w-5 h-5 text-white/40 group-focus-within:text-jazz-gold transition-colors" />
                        <input type="text" name="mainInstrument" defaultValue={user.mainInstrument || ''} placeholder="Ej: Saxo Tenor, Batería..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-jazz-gold focus:ring-1 focus:ring-jazz-gold transition-all" />
                    </div>
                </div>

                {/* Favorite Theme */}
                <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Tema Favorito (Standard)</label>
                    <div className="relative group">
                        <Disc className="absolute left-3 top-3.5 w-5 h-5 text-white/40 group-focus-within:text-jazz-gold transition-colors" />
                        <input type="text" name="favoriteTheme" defaultValue={user.favoriteTheme || ''} placeholder="Ej: Giant Steps"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-jazz-gold focus:ring-1 focus:ring-jazz-gold transition-all" />
                    </div>
                </div>

                {/* External Link */}
                <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Link (Instagram / YouTube)</label>
                    <div className="relative group">
                        <LinkIcon className="absolute left-3 top-3.5 w-5 h-5 text-white/40 group-focus-within:text-jazz-gold transition-colors" />
                        <input type="url" name="externalLink" defaultValue={user.externalLink || ''} placeholder="https://..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-jazz-gold focus:ring-1 focus:ring-jazz-gold transition-all" />
                    </div>
                </div>

                {/* Has Recorded */}
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-colors">
                    <input type="checkbox" name="hasRecorded" defaultChecked={user.hasRecorded} className="w-5 h-5 accent-jazz-gold cursor-pointer" />
                    <label className="text-white cursor-pointer select-none">¿Has grabado algún disco? 💿</label>
                </div>

                <button type="submit" className="w-full bg-jazz-gold text-black font-bold p-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-jazz-gold/20">
                    <Save className="w-5 h-5" />
                    Guardar Perfil
                </button>
            </form>
        </div>
    );
}
