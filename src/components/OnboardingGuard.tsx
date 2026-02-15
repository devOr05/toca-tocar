'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (status === 'loading') return;

        // Paths that don't require onboarding
        // Allowed: Home (maybe?), Profile itself, API routes
        const isPublicPath = pathname === '/' || pathname === '/login' || pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.');
        const isProfilePath = pathname === '/profile';

        if (!session) return; // Let middleware or page protection handle unauth

        // Check if user has completed profile
        const isProfileComplete = !!(session.user?.city && session.user?.mainInstrument);

        // If incomplete and NOT on profile page, redirect to profile
        if (!isProfileComplete && !isProfilePath && !isPublicPath) {
            console.log('Redirecting to profile due to incomplete data:', session.user);
            toast.info('Por favor completa tu perfil para continuar (Instrumento y Ciudad).');
            router.push('/profile');
        }

    }, [session, status, pathname, router]);


    if (status === 'loading') {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-black text-white">
                <Loader2 className="animate-spin text-jazz-gold" size={48} />
            </div>
        );
    }

    return <>{children}</>;
}
