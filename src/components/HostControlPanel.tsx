'use client';

import { useState } from 'react';
import { Jam, Theme } from '../types';
import { Play, Square, CheckCircle2, ListOrdered, Settings2, Loader } from 'lucide-react';
import { updateJamOpening, updateJamStatus, updateThemeStatus } from '@/app/actions';
import { useRouter } from 'next/navigation';

interface HostControlPanelProps {
    jam: Jam;
    themes: Theme[];
}

export default function HostControlPanel({ jam, themes }: HostControlPanelProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isEditingOpening, setIsEditingOpening] = useState(false);
    const [openingData, setOpeningData] = useState({
        openingBand: jam.openingBand || '',
        openingInfo: jam.openingInfo || '',
        openingThemes: jam.openingThemes || ''
    });

    const handleSaveOpening = async () => {
        setIsLoading(true);
        const result = await updateJamOpening(
            jam.id,
            openingData.openingBand,
            openingData.openingInfo,
            openingData.openingThemes
        );
        if (result.success) {
            setIsEditingOpening(false);
            router.refresh();
        } else {
            alert(result.error);
        }
        setIsLoading(false);
    };

    const activeThemes = themes.filter(t => t.status === 'PLAYING');
    const queuedThemes = themes.filter(t => t.status === 'QUEUED');
    const openThemes = themes.filter(t => t.status === 'OPEN');

    const handleStatusChange = async (newStatus: string) => {
        setIsLoading(true);
        const result = await updateJamStatus(jam.id, newStatus);
        if (result.success) {
            router.refresh();
        } else {
            alert(result.error);
        }
        setIsLoading(false);
    };

    const handleThemeStatus = async (themeId: string, newStatus: string) => {
        setIsLoading(true);
        const result = await updateThemeStatus(themeId, newStatus);
        if (result.success) {
            router.refresh();
        } else {
            alert(result.error);
        }
        setIsLoading(false);
    };

    return (
        <div className="bg-jazz-surface border border-jazz-gold/30 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-jazz-gold/10 border-b border-jazz-gold/20 flex justify-between items-center">
                <h2 className="text-jazz-gold font-bold flex items-center gap-2">
                    <Settings2 size={18} />
                    Panel del Organizador
                </h2>
                <div className="flex bg-black/40 p-1 rounded-lg border border-white/10 gap-1">
                    <button
                        onClick={() => handleStatusChange('SCHEDULED')}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${jam.status === 'SCHEDULED' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                    >
                        Programada
                    </button>
                    <button
                        onClick={() => handleStatusChange('ACTIVE')}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${jam.status === 'ACTIVE' ? 'bg-jazz-accent text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                    >
                        Activada
                    </button>
                    <button
                        onClick={() => handleStatusChange('FINISHED')}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${jam.status === 'FINISHED' ? 'bg-red-500 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                    >
                        Finalizada
                    </button>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Opening Info Section for Host */}
                <div className="pb-6 border-b border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold text-jazz-gold uppercase tracking-widest flex items-center gap-2">
                            Show de Apertura
                        </h3>
                        <button
                            onClick={() => setIsEditingOpening(!isEditingOpening)}
                            className="text-[10px] text-jazz-gold hover:underline font-bold"
                        >
                            {isEditingOpening ? 'Cancelar' : 'Editar Info'}
                        </button>
                    </div>

                    {isEditingOpening ? (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-[10px] text-white/40 mb-1 uppercase">Músico / Banda</label>
                                <input
                                    type="text"
                                    value={openingData.openingBand}
                                    onChange={(e) => setOpeningData({ ...openingData, openingBand: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-white/40 mb-1 uppercase">Información / Links</label>
                                <textarea
                                    value={openingData.openingInfo}
                                    onChange={(e) => setOpeningData({ ...openingData, openingInfo: e.target.value })}
                                    rows={2}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-white/40 mb-1 uppercase">Temas (uno por línea)</label>
                                <textarea
                                    value={openingData.openingThemes}
                                    onChange={(e) => setOpeningData({ ...openingData, openingThemes: e.target.value })}
                                    rows={2}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white"
                                />
                            </div>
                            <button
                                onClick={handleSaveOpening}
                                disabled={isLoading}
                                className="w-full bg-jazz-gold text-black font-bold py-2 rounded-lg text-xs hover:scale-[1.02] transition-all disabled:opacity-50"
                            >
                                {isLoading ? 'Guardando...' : 'Guardar Cambios de Apertura'}
                            </button>
                        </div>
                    ) : (
                        <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                            {jam.openingBand ? (
                                <div>
                                    <div className="text-white font-bold text-sm">{jam.openingBand}</div>
                                    <div className="text-[10px] text-white/40 truncate">{jam.openingThemes?.split('\n').filter(t => t.trim()).length || 0} temas declarados</div>
                                </div>
                            ) : (
                                <p className="text-white/40 text-xs italic">No hay información de apertura configurada.</p>
                            )}
                        </div>
                    )}
                </div>
                {/* Current Subject */}
                <div>
                    <h3 className="text-xs font-bold text-jazz-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Play size={14} className="text-jazz-accent" /> Controles de Flujo
                    </h3>

                    <div className="grid gap-3">
                        {activeThemes.length > 0 ? (
                            activeThemes.map(t => (
                                <div key={t.id} className="flex items-center justify-between bg-jazz-accent/10 border border-jazz-accent/30 rounded-xl p-4 group">
                                    <div>
                                        <div className="text-[10px] text-jazz-accent font-bold uppercase mb-1">En Escenario</div>
                                        <div className="text-white font-bold">{t.name}</div>
                                    </div>
                                    <button
                                        onClick={() => handleThemeStatus(t.id, 'FINISHED')}
                                        className="bg-jazz-accent/20 hover:bg-jazz-accent text-jazz-accent hover:text-white p-2 rounded-lg transition-all"
                                        title="Terminar Tema"
                                    >
                                        <Square size={20} fill="currentColor" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="bg-black/20 border border-white/5 rounded-xl p-4 text-center">
                                <p className="text-white/40 text-sm italic">No hay ningún tema sonando ahora.</p>
                                {queuedThemes.length > 0 && (
                                    <button
                                        onClick={() => handleThemeStatus(queuedThemes[0].id, 'PLAYING')}
                                        className="mt-3 bg-jazz-gold text-black font-bold px-4 py-2 rounded-lg hover:scale-105 transition-all text-sm flex items-center gap-2 mx-auto"
                                    >
                                        <Play size={16} fill="currentColor" /> Hacer sonar: {queuedThemes[0].name}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Queue Summary */}
                <div className="pt-4 border-t border-white/5">
                    <h3 className="text-xs font-bold text-jazz-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                        <ListOrdered size={14} /> Cola de Espera ({queuedThemes.length})
                    </h3>
                    <div className="space-y-2">
                        {queuedThemes.map((t, i) => (
                            <div key={t.id} className="flex items-center justify-between text-sm bg-black/20 rounded-lg p-2 border border-white/5 hover:border-jazz-gold/30 transition-colors">
                                <div className="flex items-center gap-3 truncate">
                                    <span className="text-jazz-muted font-mono text-[10px]">{i + 1}</span>
                                    <span className="text-white/80 truncate">{t.name}</span>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleThemeStatus(t.id, 'PLAYING')}
                                        className="text-jazz-gold hover:bg-jazz-gold/20 p-1.5 rounded-md transition-all"
                                        title="Poner en Escenario"
                                    >
                                        <Play size={14} fill="currentColor" />
                                    </button>
                                    <button
                                        onClick={() => handleThemeStatus(t.id, 'OPEN')}
                                        className="text-white/20 hover:text-white hover:bg-white/10 p-1.5 rounded-md transition-all"
                                        title="Mover a Abiertos"
                                    >
                                        <Square size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {isLoading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <Loader className="animate-spin text-jazz-gold" size={32} />
                </div>
            )}
        </div>
    );
}
