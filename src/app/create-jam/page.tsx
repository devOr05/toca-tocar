import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { ArrowLeft, Music, Sparkles } from "lucide-react";
import CreateJamForm from "./CreateJamForm";

export default async function CreateJamPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/");
    if (!session?.user?.email) redirect("/profile?error=email_required"); // Enforce email for hosting

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

            {/* Daily Jazz Tip */}
            <div className="w-full max-w-md bg-jazz-gold/10 border border-jazz-gold/20 rounded-xl p-4 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                    <Music size={48} />
                </div>
                <h2 className="text-[10px] font-bold text-jazz-gold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Sparkles size={12} /> Frase del Día
                </h2>
                <blockquote className="text-white/80 text-sm italic mb-2 relative z-10">
                    "{(() => {
                        const { JAZZ_QUOTES } = require('@/data/jazzQuotes');
                        const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
                        const quote = JAZZ_QUOTES[dayOfYear % JAZZ_QUOTES.length];
                        return quote.quote;
                    })()}"
                </blockquote>
                <cite className="text-xs text-jazz-gold font-bold block text-right">
                    — {(() => {
                        const { JAZZ_QUOTES } = require('@/data/jazzQuotes');
                        const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
                        const quote = JAZZ_QUOTES[dayOfYear % JAZZ_QUOTES.length];
                        return quote.author;
                    })()}
                </cite>
            </div>

            <CreateJamForm user={user} />
        </div>
    );
}
