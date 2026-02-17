import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

function SearchToastHandler() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const error = searchParams.get('error');
        const message = searchParams.get('message');

        if (error) {
            toast.error(error);
            // Clean up URL without reload (optional but cleaner)
            window.history.replaceState({}, '', window.location.pathname);
        } else if (message) {
            toast.success(message);
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, [searchParams]);

    return null;
}

export default function GlobalClientWrapper({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-jazz-gold/30 border-t-jazz-gold rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div suppressHydrationWarning>
            <Suspense fallback={null}>
                <SearchToastHandler />
            </Suspense>
            {children}
        </div>
    );
}

