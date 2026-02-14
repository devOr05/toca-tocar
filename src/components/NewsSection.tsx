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
                    Noticias y Anuncios
                </h2>
                <span className="text-xs text-jazz-muted hover:text-white cursor-pointer transition-colors">Ver todas</span>
            </div>

            <div className="grid gap-4">
                {NEWS.map((item) => (
                    <div
                        key={item.id}
                        className="bg-jazz-surface border border-white/5 rounded-2xl p-5 hover:border-white/20 transition-all group"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${item.tagColor}`}>
                                {item.tag}
                            </span>
                            <span className="text-[10px] text-jazz-muted font-mono">{item.date}</span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-jazz-gold transition-colors">
                            {item.title}
                        </h3>
                        <p className="text-white/60 text-sm leading-relaxed mb-4">
                            {item.content}
                        </p>
                        {item.link && (
                            <a
                                href={item.link}
                                className="inline-flex items-center gap-2 text-jazz-gold text-xs font-bold uppercase tracking-wider hover:underline"
                            >
                                Leer más <ExternalLink size={12} />
                            </a>
                        )}
                    </div>
                ))}
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
