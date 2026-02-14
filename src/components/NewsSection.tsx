'use client';

import { Megaphone, Calendar, ExternalLink, Music } from 'lucide-react';

interface NewsItem {
    id: string;
    title: string;
    content: string;
    date: string;
    tag: string;
    tagColor: string;
    link?: string;
}

const NEWS: NewsItem[] = [
    {
        id: '1',
        title: '¡Nueva Temporada de Jams!',
        content: 'Arrancamos Marzo con todo. Nuevas venues sugeridas y sistema de galería de fotos habilitado.',
        date: '14 Feb 2024',
        tag: 'Anuncio',
        tagColor: 'bg-jazz-gold/20 text-jazz-gold',
    },
    {
        id: '2',
        title: 'Tips: Cómo usar la Galería',
        content: 'Ya puedes subir fotos y videos de tus jams favoritas directamente desde la pestaña de galería.',
        date: '12 Feb 2024',
        tag: 'Tutorial',
        tagColor: 'bg-jazz-accent/20 text-jazz-accent',
    },
    {
        id: '3',
        title: 'Músicos Destacados',
        content: 'Este mes destacamos a los saxofonistas que mantuvieron viva la llama del bebop en las últimas sesiones.',
        date: '10 Feb 2024',
        tag: 'Comunidad',
        tagColor: 'bg-white/10 text-white/60',
    }
];

export default function NewsSection() {
    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Megaphone className="text-jazz-gold" size={24} />
                    Novedades
                </h2>
                <button
                    disabled
                    className="text-xs bg-white/5 border border-white/10 text-white/40 px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-all cursor-not-allowed"
                >
                    + Crear Anuncio
                </button>
            </div>

            <div className="grid gap-4">
                <div className="border border-dashed border-white/10 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                    <Megaphone className="text-white/10 mb-4" size={48} />
                    <p className="text-white/20 text-sm">No hay novedades por el momento.</p>
                </div>
            </div>

            {/* Quick Stats / Extras Placeholder */}
            <div className="bg-gradient-to-br from-jazz-gold/10 to-transparent border border-jazz-gold/20 rounded-2xl p-6 mt-8">
                <h3 className="text-jazz-gold font-bold mb-2 flex items-center gap-2">
                    <Music size={18} /> Tip del día
                </h3>
                <p className="text-white/80 text-sm italic">
                    "En una jam, el silencio es tan importante como las notas. Escucha al ensamble antes de entrar al solo."
                </p>
            </div>
        </section>
    );
}
