'use client';

import { useState } from 'react';
import { X, Music, FileText, Link as LinkIcon, MessageSquare, Loader } from 'lucide-react';
import { createTheme } from '@/app/actions';
import { useRouter } from 'next/navigation';

import { JAZZ_STANDARDS } from '../data/jazzStandards';

interface CreateThemeModalProps {
    isOpen: boolean;
    onClose: () => void;
    jamCode: string;
    type?: 'SONG' | 'TOPIC';
}

export default function CreateThemeModal({ isOpen, onClose, jamCode, type = 'SONG' }: CreateThemeModalProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        tonality: '',
        description: '',
        sheetMusicUrl: ''
    });

    const [suggestions, setSuggestions] = useState<typeof JAZZ_STANDARDS>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    if (!isOpen) return null;

    const isSong = type === 'SONG';

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, name: value }));

        if (isSong && value.length > 1) {
            const matches = JAZZ_STANDARDS.filter(s =>
                s.name.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(matches);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const selectSuggestion = (standard: typeof JAZZ_STANDARDS[0]) => {
        setFormData({
            ...formData,
            name: standard.name,
            tonality: standard.tonality,
            description: `Estilo: ${standard.style}`
        });
        setShowSuggestions(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await createTheme(
            jamCode,
            formData.name,
            formData.tonality,
            formData.description,
            formData.sheetMusicUrl,
            type
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
                            {isSong ? <Music className="text-jazz-gold" size={24} /> : <MessageSquare className="text-jazz-accent" size={24} />}
                            {isSong ? 'Proponer Tema' : 'Crear Tópico'}
                        </h2>
                        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <label className="block text-xs font-bold text-jazz-muted mb-1 uppercase tracking-wider">
                                {isSong ? 'Nombre del Standard *' : 'Título del Tópico *'}
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleNameChange}
                                onFocus={() => isSong && formData.name.length > 1 && setShowSuggestions(true)}
                                // Delay blur to allow clicking suggestions
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                placeholder={isSong ? "Ej. Autumn Leaves" : "Ej. ¿Quién trae amplificador?"}
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-white/20 focus:border-jazz-gold focus:ring-1 focus:ring-jazz-gold outline-none transition-all"
                            />

                            {/* Autocomplete Dropdown - Only for Songs */}
                            {isSong && showSuggestions && suggestions.length > 0 && (
                                <div className="absolute z-50 w-full mt-1 bg-neutral-900 border border-white/10 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                    {suggestions.map((s) => (
                                        <button
                                            key={s.name}
                                            type="button"
                                            onClick={() => selectSuggestion(s)}
                                            className="w-full text-left px-4 py-3 hover:bg-white/5 text-sm border-b border-white/5 last:border-0 transition-colors"
                                        >
                                            <span className="font-bold text-white block">{s.name}</span>
                                            <span className="text-xs text-jazz-muted">{s.tonality} • {s.style}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {isSong && (
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
                        )}

                        <div>
                            <label className="block text-xs font-bold text-jazz-muted mb-1 uppercase tracking-wider flex items-center gap-1">
                                <FileText size={12} /> {isSong ? 'Descripción / Notas' : 'Contenido'}
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder={isSong ? "Ej. Versión bossa, intro de 8 compases..." : "Escribe aquí los detalles..."}
                                rows={3}
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-white/20 focus:border-jazz-gold focus:ring-1 focus:ring-jazz-gold outline-none transition-all resize-none"
                            />
                        </div>

                        {isSong && (
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
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full ${isSong ? 'bg-jazz-gold' : 'bg-jazz-accent'} text-black font-bold py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader className="animate-spin" size={20} />
                                    Creando...
                                </>
                            ) : (
                                isSong ? 'Crear Tema' : 'Crear Tópico'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
