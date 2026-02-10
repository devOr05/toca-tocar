'use client';

import dynamic from 'next/dynamic';
import { Music2 } from 'lucide-react';

const HomeContent = dynamic(() => import('@/components/home/HomeContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="p-4 bg-jazz-surface border border-white/5 rounded-full shadow-2xl animate-pulse">
        <Music2 className="w-10 h-10 text-jazz-gold" />
      </div>
    </div>
  ),
});

export default function LoginPage() {
  return <HomeContent />;
}
