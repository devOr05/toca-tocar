'use client';

import { useState } from 'react';
import { X, Music, FileText, Link as LinkIcon, Loader2 } from 'lucide-react';
import { createTheme } from '@/app/actions';
import { useRouter } from 'next/navigation';

interface CreateThemeModalProps {
    isOpen: boolean;
    onClose: () => void;
    jamCode: string;
}

export default function CreateThemeModal({ isOpen, onClose, jamCode }: CreateThemeModalProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        tonality: '',
        description: '',
        sheetMusicUrl: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await createTheme(
            jamCode,
            formData.name,
            formData.tonality,
            formData.description,
            formData.sheetMusicUrl
        );

        setIsLoading(false);

        if (result.success) {
            setFormData({ name: '', tonality: '', description: '', sheetMusicUrl: '' });
            router.refresh();
            onClose();
        } else {
            alert(result.error || 'Error al crear el tema');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-jazz-surface border border-white/10 rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Music className="text-jazz-gold" />
                            Proponer Tema
                        </h2>
                        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-jazz-muted mb-1 uppercase tracking-wider">
                                Nombre del Standard *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ej. Autumn Leaves"
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-white/20 focus:border-jazz-gold focus:ring-1 focus:ring-jazz-gold outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-jazz-muted mb-1 uppercase tracking-wider">
                                Tonalidad (Opcional)
                            </label>
                            <input
                                type="text"
                                value={formData.tonality}
                                onChange={(e) => setFormData({ ...formData, tonality: e.target.value })}
                                placeholder="Ej. Gm"
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-white/20 focus:border-jazz-gold focus:ring-1 focus:ring-jazz-gold outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-jazz-muted mb-1 uppercase tracking-wider flex items-center gap-1">
                                <FileText size={12} /> Descripción / Notas
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Ej. Versión bossa, intro de 8 compases..."
                                rows={3}
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-white/20 focus:border-jazz-gold focus:ring-1 focus:ring-jazz-gold outline-none transition-all resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-jazz-muted mb-1 uppercase tracking-wider flex items-center gap-1">
                                <LinkIcon size={12} /> Link a Partitura / RealBook
                            </label>
                            <input
                                type="url"
                                value={formData.sheetMusicUrl}
                                onChange={(e) => setFormData({ ...formData, sheetMusicUrl: e.target.value })}
                                placeholder="https://..."
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-white/20 focus:border-jazz-gold focus:ring-1 focus:ring-jazz-gold outline-none transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-jazz-gold text-black font-bold py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Creando...
                                </>
                            ) : (
                                'Crear Tema'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
