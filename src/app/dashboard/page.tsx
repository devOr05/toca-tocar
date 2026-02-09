import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Music2, Users, ArrowRight } from "lucide-react";

export default async function Dashboard() {
    const session = await auth();
    if (!session?.user) redirect("/");

    // Fetch active jams (or all jams for now)
    const jams = await prisma.jam.findMany({
        where: { status: { not: "FINISHED" } },
        include: { _count: { select: { themes: true } } },
        // Wait, Jam doesn't have direct participants relation in my schema?
        // User -> participations -> Theme -> Jam
        // Let's just fetch basic jam info for now
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="min-h-screen bg-background p-6">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-white">Hola, <span className="text-jazz-gold">{session.user.name}</span></h1>
                <div className="w-10 h-10 rounded-full bg-jazz-surface border border-white/10 flex items-center justify-center">
                    {session.user.image ? (
                        <img src={session.user.image} alt={session.user.name || ''} className="rounded-full" />
                    ) : (
                        <span className="text-xl">🎷</span>
                    )}
                </div>
            </header>

            <div className="grid gap-6 max-w-md mx-auto">
                <div className="bg-jazz-surface border border-white/5 rounded-2xl p-6 shadow-xl">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Music2 className="text-jazz-accent" /> Jams Activas
                    </h2>

                    {jams.length === 0 ? (
                        <div className="text-center py-8 text-white/30">
                            <p>No hay Jams activas.</p>
                            <p className="text-sm">¡Sé el primero en crear una!</p>
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {jams.map((jam: any) => (
                                <li key={jam.id}>
                                    <Link href={`/jam/${jam.code}`} className="block bg-white/5 hover:bg-white/10 p-4 rounded-xl transition-colors border border-white/5 group">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="font-bold text-white group-hover:text-jazz-gold transition-colors">{jam.name}</h3>
                                                <p className="text-xs text-white/40 font-mono">CODE: {jam.code}</p>
                                            </div>
                                            <ArrowRight className="text-white/20 group-hover:text-white transition-colors" />
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <Link href="/create-jam?from=dashboard" className="w-full bg-jazz-gold text-black font-bold p-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg shadow-jazz-gold/20">
                    <Plus className="w-6 h-6" />
                    Crear Nueva Jam
                </Link>
            </div>
        </div>
    );
}
