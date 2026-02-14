'use client';

import { useState, useEffect } from 'react';
import { Megaphone, Music, Loader } from 'lucide-react';
import { getAnnouncements } from '@/app/actions';
import CreateAnnouncementModal from './CreateAnnouncementModal';

interface NewsItem {
    id: string;
    title: string;
    content: string;
    tag?: string | null;
    tagColor?: string | null;
    createdAt: Date;
}

export default function NewsSection({ isAdmin = false }: { isAdmin?: boolean }) {
    const [announcements, setAnnouncements] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const fetchNews = async () => {
        setIsLoading(true);
        const data = await getAnnouncements();
        // @ts-ignore
        setAnnouncements(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchNews();
    }, []);

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Megaphone className="text-jazz-gold" size={24} />
                    Novedades
                </h2>
                {isAdmin && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="text-xs bg-jazz-gold/10 border border-jazz-gold/20 text-jazz-gold px-3 py-1.5 rounded-lg hover:bg-jazz-gold/20 transition-all font-bold"
                    >
                        + Crear Anuncio
                    </button>
                )}
            </div>

            <div className="grid gap-4">
                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <Loader className="animate-spin text-jazz-gold/40" size={32} />
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="border border-dashed border-white/10 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                        <Megaphone className="text-white/10 mb-4" size={48} />
                        <p className="text-white/20 text-sm">No hay novedades por el momento.</p>
                    </div>
                ) : (
                    announcements.map((news) => (
                        <div key={news.id} className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:bg-white/[0.08] transition-all group">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-white group-hover:text-jazz-gold transition-colors">{news.title}</h3>
                                {news.tag && (
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${news.tagColor || 'bg-white/10 text-white/40'}`}>
                                        {news.tag}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-white/50 leading-relaxed truncate-3-lines">{news.content}</p>
                            <div className="mt-3 text-[10px] text-white/20">
                                {new Date(news.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))
                )}
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

            <CreateAnnouncementModal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    fetchNews();
                }}
            />
        </section>
    );
}
