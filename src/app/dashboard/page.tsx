import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import JamList from "@/components/JamList";
import LogoutButton from "@/components/LogoutButton";

export default async function Dashboard() {
    const session = await auth();
    if (!session?.user) redirect("/");

    // Fetch active jams
    const jams = await prisma.jam.findMany({
        where: { status: { not: "FINISHED" } },
        include: { _count: { select: { themes: true } } },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="min-h-screen bg-background p-6">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-white">Hola, <span className="text-jazz-gold">{session.user.name}</span></h1>
                <div className="flex items-center gap-3">
                    <LogoutButton />
                    <Link href="/profile" className="w-10 h-10 rounded-full bg-jazz-surface border border-white/10 flex items-center justify-center hover:border-jazz-gold transition-colors overflow-hidden relative">
                        {session.user.image ? (
                            <img src={session.user.image} alt={session.user.name || ''} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-xl">🎷</span>
                        )}
                    </Link>
                </div>
            </header>

            <div className="grid gap-6 max-w-md mx-auto">
                <JamList jams={jams} />

                <Link href="/create-jam" className="w-full bg-jazz-gold text-black font-bold p-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg shadow-jazz-gold/20">
                    <Plus className="w-6 h-6" />
                    Organizar Nueva Jam
                </Link>
            </div>
        </div>
    );
}
