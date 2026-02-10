'use client';

import { useState, useEffect } from 'react';

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
            {children}
        </div>
    );
}
