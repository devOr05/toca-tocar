'use client';

import { useState } from 'react';
import { X, Calendar, MapPin, Loader2, Save } from 'lucide-react';
import { Jam } from '@/types';
// We need an updateJam action. I'll need to create it in actions.ts first or mock it.
// Assuming updateJam exists for now to keep flow, or I'll add it in next step.
import { updateJam } from '@/app/actions';
import { useRouter } from 'next/navigation';

interface EditJamModalProps {
    isOpen: boolean;
    onClose: () => void;
    jam: Jam;
}

export default function EditJamModal({ isOpen, onClose, jam }: EditJamModalProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: jam.name,
        description: jam.description || '',
        location: jam.location || '',
        city: jam.city || '',
        startTime: jam.startTime ? new Date(jam.startTime).toISOString().slice(0, 16) : '',
        flyerUrl: jam.flyerUrl || '',
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await updateJam(
            jam.code,
            formData.name,
            formData.description,
            formData.location,
            formData.city,
            formData.startTime,
            formData.flyerUrl
        );

        setIsLoading(false);

        if (result.success) {
            router.refresh();
            onClose();
        } else {
            alert(result.error || 'Error al actualizar la Jam');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-jazz-surface border border-white/10 rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Save className="text-jazz-gold" />
                            Editar Jam
                        </h2>
                        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-jazz-muted mb-1 uppercase tracking-wider">Nombre del Evento</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-jazz-gold outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-jazz-muted mb-1 uppercase tracking-wider">Fecha y Hora</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-jazz-gold outline-none [color-scheme:dark]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-jazz-muted mb-1 uppercase tracking-wider">Ciudad</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-jazz-gold outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-jazz-muted mb-1 uppercase tracking-wider">Lugar / Dirección</label>
                            <input
                                type="text"
                                required
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-jazz-gold outline-none"
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
