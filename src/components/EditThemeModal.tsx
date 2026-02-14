'use client';

import { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { updateTheme } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { Theme } from '@/types';

interface EditThemeModalProps {
    isOpen: boolean;
    onClose: () => void;
    theme: Theme;
}

export default function EditThemeModal({ isOpen, onClose, theme }: EditThemeModalProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: theme.name,
        tonality: theme.tonality || '',
        description: theme.description || '',
        sheetMusicUrl: theme.sheetMusicUrl || ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Create FormData object
        const fd = new FormData();
        fd.append('name', formData.name);
        fd.append('tonality', formData.tonality);
        fd.append('description', formData.description);
        fd.append('sheetMusicUrl', formData.sheetMusicUrl);

        const result = await updateTheme(theme.id, fd);

        setIsLoading(false);

        if (result.success) {
            router.refresh();
            onClose();
        } else {
            alert(result.error || 'Error al actualizar tema');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-jazz-surface border border-white/10 rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Save className="text-jazz-gold" />
                            Editar Tema
                        </h2>
                        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-jazz-muted mb-1 uppercase tracking-wider">Nombre</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-jazz-gold outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-jazz-muted mb-1 uppercase tracking-wider">Tonalidad</label>
                                <input
                                    type="text"
                                    value={formData.tonality}
                                    onChange={(e) => setFormData({ ...formData, tonality: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-jazz-gold outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-jazz-muted mb-1 uppercase tracking-wider">Descripción / Notas</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-jazz-gold outline-none min-h-[100px]"
                                placeholder="Estructura, ritmo, detalles..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-jazz-muted mb-1 uppercase tracking-wider">URL Partitura (PDF/Imagen)</label>
                            <input
                                type="url"
                                value={formData.sheetMusicUrl}
                                onChange={(e) => setFormData({ ...formData, sheetMusicUrl: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-jazz-gold outline-none"
                                placeholder="https://..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-jazz-gold text-black font-bold py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Guardando...
                                </>
                            ) : (
                                'Guardar Cambios'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
