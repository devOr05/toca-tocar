'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (status === 'loading') return;

        // Paths that don't require onboarding
        // Allowed: Home (maybe?), Onboarding itself, API routes
        const isPublicPath = pathname === '/' || pathname === '/login' || pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.');
        const isOnboardingPath = pathname === '/onboarding';

        if (!session) return; // Let middleware or page protection handle unauth

        // Check if user has completed profile
        const isProfileComplete = !!(session.user?.city && session.user?.mainInstrument);

        // If incomplete and NOT on onboarding page, redirect to onboarding
        if (!isProfileComplete && !isOnboardingPath && !isPublicPath) {
            console.log('Redirecting to onboarding due to incomplete profile:', session.user);
            router.push('/onboarding');
        }

        // If complete and ON onboarding page, redirect to dashboard
        if (isProfileComplete && isOnboardingPath) {
            router.push('/dashboard');
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
