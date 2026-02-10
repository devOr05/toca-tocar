import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/");

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { hostedJams: { orderBy: { createdAt: 'desc' } } }
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

            <ProfileForm user={user} />

            <div className="w-full max-w-md mt-8 border-t border-white/10 pt-8">
                <h2 className="text-xl font-bold text-white mb-4">Mis Jams Creadas 🎹</h2>
                {user.hostedJams && user.hostedJams.length > 0 ? (
                    <div className="space-y-4">
                        {user.hostedJams.map((jam: any) => (
                            <div key={jam.id} className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-white">{jam.name}</div>
                                    <div className="text-xs text-white/40 font-mono">{jam.code} • {jam.status}</div>
                                </div>
                                <form action={async () => {
                                    'use server';
                                    const { deleteJam } = await import('@/app/actions');
                                    await deleteJam(jam.code);
                                    // Revalidate handled by action usually, or we redirect
                                    // For simplicity in server component we can just let it refresh
                                    redirect('/profile');
                                }}>
                                    <button type="submit" className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Eliminar Jam">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-white/40 text-sm">No has creado ninguna Jam aún.</p>
                )}
            </div>
        </div>
    );
}
