import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import JamList from "@/components/JamList";
import LogoutButton from "@/components/LogoutButton";
import MusicianList from "@/components/MusicianList";
import NewsSection from "@/components/NewsSection";

export default async function Dashboard() {
    const session = await auth();
    if (!session?.user) redirect("/");

    // Fetch all relevant jams
    const allJams = await prisma.jam.findMany({
        where: {
            OR: [
                { isPrivate: false },
                { hostId: session.user.id }
            ]
        },
        include: { _count: { select: { themes: true } } },
        orderBy: { startTime: 'desc' }
    });

    const now = new Date();
    const threshold = new Date(now.getTime() - 6 * 60 * 60 * 1000); // 6 hours ago

    const activeJams = allJams.filter((jam: any) =>
        jam.status !== 'FINISHED' &&
        jam.startTime && jam.startTime > threshold
    );

    const pastJams = allJams.filter((jam: any) =>
        jam.status === 'FINISHED' ||
        (jam.startTime && jam.startTime <= threshold)
    ).slice(0, 3); // Limit history

    // Fetch user from DB to get latest metadata (city, etc)
    const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id }
    });

    const isAdmin = dbUser?.email === 'kavay86@gmail.com' || dbUser?.role === 'ADMIN';

    // Fetch musicians for sidebar
    const userCity = dbUser?.city || '';
    const musicians = await import('@/app/actions').then(mod => mod.getMusiciansByCity(userCity));

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

            <div className="max-w-6xl mx-auto mb-8">
                <Link href="/create-jam" className="w-full bg-jazz-gold text-black font-bold p-6 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.01] transition-all shadow-[0_0_30px_rgba(251,191,36,0.2)] border-b-4 border-jazz-gold-dark hover:brightness-110 active:translate-y-1 active:border-b-0">
                    <Plus className="w-8 h-8" />
                    <span className="text-xl uppercase tracking-tighter">Organizar Nueva Jam</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {/* Main Content: Jams */}
                <div className="lg:col-span-2 space-y-8">
                    <JamList
                        jams={activeJams.map((j: any) => ({ ...j, status: j.status as 'SCHEDULED' | 'ACTIVE' | 'FINISHED' }))}
                        currentUserId={session.user.id}
                        title="Jams Activas"
                    />

                    {pastJams.length > 0 && (
                        <JamList
                            jams={pastJams.map((j: any) => ({ ...j, status: j.status as 'SCHEDULED' | 'ACTIVE' | 'FINISHED' }))}
                            currentUserId={session.user.id}
                            title="Historial de Jams"
                            isHistory
                        />
                    )}

                    <div className="py-8">
                        <NewsSection isAdmin={isAdmin} currentUserId={session.user.id} />
                    </div>
                </div>

                {/* Sidebar: Musicians */}
                <div className="lg:col-span-1">
                    <div className="sticky top-6">
                        <MusicianList
                            // @ts-ignore
                            users={musicians}
                            title={`Músicos en ${userCity || 'tu zona'}`}
                            emptyMessage="No hay músicos en tu zona aún."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
