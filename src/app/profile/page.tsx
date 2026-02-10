import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProfileForm from "./ProfileForm";

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

            <ProfileForm user={user} />
        </div>
    );
}
