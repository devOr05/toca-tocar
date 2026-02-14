'use client';

import { useState } from 'react';
import { X, Megaphone, Loader } from 'lucide-react';
import { createAnnouncement } from '@/app/actions';

interface CreateAnnouncementModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateAnnouncementModal({ isOpen, onClose }: CreateAnnouncementModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        tag: 'Anuncio',
        tagColor: 'bg-jazz-gold/20 text-jazz-gold'
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await createAnnouncement(
            formData.title,
            formData.content,
            formData.tag,
            formData.tagColor
        );

        setIsLoading(false);

        if (result.success) {
            setFormData({ title: '', content: '', tag: 'Anuncio', tagColor: 'bg-jazz-gold/20 text-jazz-gold' });
            onClose();
        } else {
            alert(result.error);
        }
    };

    const tags = [
        { label: 'Anuncio', color: 'bg-jazz-gold/20 text-jazz-gold' },
        { label: 'Tutorial', color: 'bg-jazz-accent/20 text-jazz-accent' },
        { label: 'Comunidad', color: 'bg-white/10 text-white/60' },
        { label: 'Evento', color: 'bg-red-500/20 text-red-400' }
    ];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-jazz-surface border border-white/10 rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Megaphone className="text-jazz-gold" size={24} />
                            Crear Anuncio
                        </h2>
                        <button onClick={onClose} className="text-white/40 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-jazz-muted mb-1 uppercase tracking-wider">Título</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-jazz-gold"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-jazz-muted mb-1 uppercase tracking-wider">Etiqueta</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {tags.map((t) => (
                                    <button
                                        key={t.label}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, tag: t.label, tagColor: t.color })}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${formData.tag === t.label ? 'ring-2 ring-white ' + t.color : 'opacity-40 ' + t.color
                                            }`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-jazz-muted mb-1 uppercase tracking-wider">Mensaje</label>
                            <textarea
                                required
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                rows={4}
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-jazz-gold resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-jazz-gold text-black font-bold py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader className="animate-spin" size={20} /> : 'Publicar'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
