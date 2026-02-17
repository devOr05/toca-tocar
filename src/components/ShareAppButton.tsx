'use client';

import { Share2, Link as LinkIcon, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ShareAppButton() {
    const [copied, setCopied] = useState(false);

    const shareData = {
        title: 'Toca Tocar | Jazz Jam Organizer',
        text: '¡Únete a la mejor Jam de Jazz en tiempo real!',
        url: window.location.origin
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share(shareData);
                toast.success('¡Gracias por compartir!');
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            // Fallback: Copy to clipboard
            try {
                await navigator.clipboard.writeText(shareData.url);
                setCopied(true);
                toast.success('Link copiado al portapapeles');
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                toast.error('No se pudo copiar el link');
            }
        }
    };

    return (
        <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm font-bold"
        >
            {copied ? <Check size={16} className="text-green-500" /> : <Share2 size={16} />}
            {copied ? 'Link Copiado' : 'Compartir App'}
        </button>
    );
}
