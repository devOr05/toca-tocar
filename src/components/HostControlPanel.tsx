'use client';

import { useState } from 'react';
import { Jam, Theme } from '../types';
import { Play, Square, CheckCircle2, ListOrdered, Settings2, Loader, Trash2, GripVertical, X } from 'lucide-react';
import { updateJamOpening, updateJamStatus, updateThemeStatus, reorderThemes } from '@/app/actions';
import MusicianAutocomplete from '@/components/MusicianAutocomplete';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface HostControlPanelProps {
    jam: Jam;
    themes: Theme[];
}

export default function HostControlPanel({ jam, themes }: HostControlPanelProps) {
    const router = useRouter();
    const [jamData, setJamData] = useState({
        description: jam.description || '',
        location: jam.location || '',
        city: jam.city || ''
    });
    const [isEditingJam, setIsEditingJam] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditingOpening, setIsEditingOpening] = useState(false);
    const [openingData, setOpeningData] = useState({
        openingBand: jam.openingBand || '',
        openingInfo: jam.openingInfo || '',
        openingThemes: jam.openingThemes || ''
    });

    // Parse initial musicians
    // Parse initial musicians
    const [openingMusicians, setOpeningMusicians] = useState<{ userId: string; name: string; image?: string | null; mainInstrument?: string }[]>(() => {
        try {
            if (!jam.openingMusicians) return [];
            return typeof jam.openingMusicians === 'string' ? JSON.parse(jam.openingMusicians) : jam.openingMusicians;
        } catch (e) {
            return [];
        }
    });

    const handleAddMusician = (musician: { userId: string; name: string; image?: string | null; mainInstrument?: string }) => {
        if (!openingMusicians.some(m => m.userId === musician.userId)) {
            setOpeningMusicians(prev => [...prev, musician]);
        }
    };

    const handleRemoveMusician = (userId: string) => {
        setOpeningMusicians(prev => prev.filter(m => m.userId !== userId));
    };

    // Dnd-kit sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Local state for optimistic updates
    const [queuedThemes, setQueuedThemes] = useState(
        themes.filter(t => t.status === 'QUEUED').sort((a, b) => (a.order || 0) - (b.order || 0))
    );

    // Sync queuedThemes when props change (e.g. pusher update)
    // We only update if the IDs changed or length changed to avoid conflict with local drag
    const propQueuedThemes = themes.filter(t => t.status === 'QUEUED').sort((a, b) => (a.order || 0) - (b.order || 0));
    if (JSON.stringify(propQueuedThemes.map(t => t.id)) !== JSON.stringify(queuedThemes.map(t => t.id))) {
        setQueuedThemes(propQueuedThemes);
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setQueuedThemes((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over?.id);
                const newItems = arrayMove(items, oldIndex, newIndex);

                // Update server
                // Calculate new order values based on index
                const updates = newItems.map((item, index) => ({
                    id: item.id,
                    order: index
                }));

                // Call server action without waiting to keep UI snappy
                reorderThemes(jam.id, updates).then(res => {
                    if (!res.success) toast.error("Error al reordenar");
                });

                return newItems;
            });
        }
    };

    const handleSaveOpening = async () => {
        setIsLoading(true);
        const result = await updateJamOpening(
            jam.id,
            openingData.openingBand,
            openingData.openingInfo,
            openingData.openingThemes,
            openingMusicians
        );
        if (result.success) {
            setIsEditingOpening(false);
            toast.success('Información de apertura actualizada');
            router.refresh();
        } else {
            toast.error(result.error || 'Error al guardar');
        }
        setIsLoading(false);
    };

    const handleSaveJamInfo = async () => {
        setIsLoading(true);
        const { updateJamInfo } = await import('@/app/actions');
        const result = await updateJamInfo(jam.id, jamData.description, jamData.location, jamData.city);
        if (result.success) {
            setIsEditingJam(false);
            toast.success('Información de la jam actualizada');
            router.refresh();
        } else {
            toast.error(result.error || 'Error al guardar');
        }
        setIsLoading(false);
    };

    const activeThemes = themes.filter(t => t.status === 'PLAYING');
    // const queuedThemes = themes.filter(t => t.status === 'QUEUED'); // Replaced by state
    const openThemes = themes.filter(t => t.status === 'OPEN');

    const handleStatusChange = async (newStatus: string) => {
        setIsLoading(true);
        const result = await updateJamStatus(jam.id, newStatus);
        if (result.success) {
            toast.success('Estado de la Jam actualizado');
            router.refresh();
        } else {
            toast.error(result.error || 'Error al cambiar estado');
        }
        setIsLoading(false);
    };

    const handleThemeStatus = async (themeId: string, newStatus: string) => {
        setIsLoading(true);
        const result = await updateThemeStatus(themeId, newStatus);
        if (result.success) {
            toast.success('Estado del tema actualizado');
            router.refresh();
        } else {
            toast.error(result.error || 'Error al cambiar estado');
        }
        setIsLoading(false);
    };

    return (
        <div className="bg-jazz-surface border border-jazz-gold/30 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-jazz-gold/10 border-b border-jazz-gold/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-jazz-gold font-bold flex items-center gap-2">
                    <Settings2 size={18} />
                    Panel del Organizador
                </h2>
                <div className="flex bg-black/40 p-1 rounded-lg border border-white/10 gap-1 w-full sm:w-auto overflow-x-auto">
                    <button
                        onClick={() => handleStatusChange('SCHEDULED')}
                        className={`flex-1 sm:flex-none px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all whitespace-nowrap ${jam.status === 'SCHEDULED' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                    >
                        Programada
                    </button>
                    <button
                        onClick={() => handleStatusChange('ACTIVE')}
                        className={`flex-1 sm:flex-none px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all whitespace-nowrap ${jam.status === 'ACTIVE' ? 'bg-jazz-accent text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                    >
                        Activada
                    </button>
                    <button
                        onClick={() => handleStatusChange('FINISHED')}
                        className={`flex-1 sm:flex-none px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all whitespace-nowrap ${jam.status === 'FINISHED' ? 'bg-red-500 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                    >
                        Finalizada
                    </button>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Jam Info Section */}
                <div className="pb-6 border-b border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold text-jazz-gold uppercase tracking-widest flex items-center gap-2">
                            Información General
                        </h3>
                        <button
                            onClick={() => setIsEditingJam(!isEditingJam)}
                            className="text-[10px] text-jazz-gold hover:underline font-bold"
                        >
                            {isEditingJam ? 'Cancelar' : 'Editar Jam'}
                        </button>
                    </div>

                    {isEditingJam ? (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-[10px] text-white/40 mb-1 uppercase">Descripción / Bio</label>
                                <textarea
                                    value={jamData.description}
                                    onChange={(e) => setJamData({ ...jamData, description: e.target.value })}
                                    rows={2}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] text-white/40 mb-1 uppercase">Lugar / Establecimiento</label>
                                    <input
                                        type="text"
                                        value={jamData.location}
                                        onChange={(e) => setJamData({ ...jamData, location: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-white/40 mb-1 uppercase">Ciudad</label>
                                    <input
                                        type="text"
                                        value={jamData.city}
                                        onChange={(e) => setJamData({ ...jamData, city: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleSaveJamInfo}
                                disabled={isLoading}
                                className="w-full bg-jazz-gold text-black font-bold py-2 rounded-lg text-xs hover:scale-[1.02] transition-all disabled:opacity-50"
                            >
                                {isLoading ? 'Guardando...' : 'Guardar Datos de Jam'}
                            </button>
                        </div>
                    ) : (
                        <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                            <div className="text-white font-bold text-sm">{jam.name}</div>
                            <div className="text-[10px] text-white/60 mt-1">{jam.location} • {jam.city}</div>
                            {jam.description && <p className="text-[10px] text-white/40 mt-1 line-clamp-2">{jam.description}</p>}
                        </div>
                    )}
                </div>

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
                            <div>
                                <label className="block text-[10px] text-white/40 mb-2 uppercase">Músicos de Apertura</label>
                                <div className="mb-3">
                                    <div className="flex flex-col gap-2 mb-3">
                                        {openingMusicians.map((m, idx) => (
                                            <div key={m.userId} className="flex items-center gap-3 bg-white/5 rounded-xl p-2 border border-white/5">
                                                <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden shrink-0">
                                                    {m.image ? (
                                                        <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[10px]">👤</div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm text-white font-medium truncate">{m.name}</div>
                                                    <input
                                                        type="text"
                                                        value={m.mainInstrument || ''}
                                                        onChange={(e) => {
                                                            const newMusicians = [...openingMusicians];
                                                            newMusicians[idx] = { ...newMusicians[idx], mainInstrument: e.target.value };
                                                            setOpeningMusicians(newMusicians);
                                                        }}
                                                        placeholder="Instrumento (ej. Saxo)"
                                                        className="bg-transparent text-[11px] text-jazz-gold placeholder:text-white/20 w-full focus:outline-none focus:border-b focus:border-jazz-gold/50"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveMusician(m.userId)}
                                                    className="w-6 h-6 rounded-full bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 flex items-center justify-center transition-colors"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <MusicianAutocomplete
                                        onSelect={(m) => handleAddMusician({ ...m, mainInstrument: m.mainInstrument || 'Invitado' } as any)}
                                        placeholder="Buscar y agregar músico..."
                                        existingMusicians={openingMusicians.map(m => m.userId)}
                                    />

                                    {/* Manual Add */}
                                    <div className="mt-2 flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Nombre (Manual)"
                                            className="flex-[2] bg-white/5 border border-white/10 rounded-xl p-2 text-sm text-white focus:outline-none focus:border-jazz-gold"
                                            id="manual-name-input"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Instrumento"
                                            className="flex-1 bg-white/5 border border-white/10 rounded-xl p-2 text-sm text-white focus:outline-none focus:border-jazz-gold"
                                            id="manual-instrument-input"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const nameInput = document.getElementById('manual-name-input') as HTMLInputElement;
                                                    const instrumentInput = e.currentTarget;
                                                    const name = nameInput.value.trim();
                                                    const instrument = instrumentInput.value.trim() || 'Invitado';

                                                    if (name) {
                                                        handleAddMusician({
                                                            userId: `manual-${Date.now()}`,
                                                            name: name,
                                                            image: null,
                                                            mainInstrument: instrument
                                                        } as any);
                                                        nameInput.value = '';
                                                        instrumentInput.value = '';
                                                        nameInput.focus();
                                                    }
                                                }
                                            }}
                                        />
                                        <button
                                            onClick={() => {
                                                const nameInput = document.getElementById('manual-name-input') as HTMLInputElement;
                                                const instrumentInput = document.getElementById('manual-instrument-input') as HTMLInputElement;
                                                const name = nameInput.value.trim();
                                                const instrument = instrumentInput.value.trim() || 'Invitado';

                                                if (name) {
                                                    handleAddMusician({
                                                        userId: `manual-${Date.now()}`,
                                                        name: name,
                                                        image: null,
                                                        mainInstrument: instrument
                                                    } as any);
                                                    nameInput.value = '';
                                                    instrumentInput.value = '';
                                                    nameInput.focus();
                                                }
                                            }}
                                            className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 rounded-xl transition-colors"
                                        >
                                            Agregar
                                        </button>
                                    </div>
                                </div>
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
                    <h3 className="text-xs font-bold text-jazz-muted uppercase tracking-widest mb-4 flex items-center justify-between">
                        <span className="flex items-center gap-2"><ListOrdered size={14} /> Cola de Espera ({queuedThemes.length})</span>
                        <span className="text-[10px] font-normal opacity-50 lowercase tracking-normal italic">Arrastra para reordenar</span>
                    </h3>
                    <div className="space-y-2">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={queuedThemes.map(t => t.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {queuedThemes.map((t, i) => (
                                    <SortableThemeItem
                                        key={t.id}
                                        id={t.id}
                                        theme={t}
                                        index={i}
                                        onStatusChange={handleThemeStatus}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    </div>
                </div>
                {/* Admin Zone */}
                <div className="pt-4 border-t border-white/5 mt-4">
                    <button
                        onClick={async () => {
                            if (confirm('¿Estás seguro de ELIMINAR esta Jam? Esta acción no se puede deshacer.')) {
                                setIsLoading(true);
                                const { deleteJam } = await import('@/app/actions');
                                const res = await deleteJam(jam.code);
                                if (res.success) {
                                    toast.success('Jam eliminada');
                                    router.push('/dashboard');
                                } else {
                                    toast.error(res.error || 'Error al eliminar jam');
                                    setIsLoading(false);
                                }
                            }
                        }}
                        className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 p-2 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                    >
                        <Trash2 size={14} /> Eliminar Jam (Zona Peligrosa)
                    </button>
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
function SortableThemeItem(props: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: props.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
                flex items-center justify-between text-sm bg-black/20 rounded-lg p-2 border transition-all
                ${isDragging ? 'border-jazz-gold z-50 shadow-2xl scale-[1.02] bg-jazz-surface' : 'border-white/5 hover:border-white/20'}
            `}
        >
            <div className="flex items-center gap-2 truncate flex-1">
                <button
                    {...attributes}
                    {...listeners}
                    className="p-1 hover:bg-white/10 rounded cursor-grab active:cursor-grabbing text-white/10 hover:text-white/40 transition-colors"
                >
                    <div className="flex flex-col gap-0.5">
                        <div className="flex gap-0.5">
                            <div className="w-1 h-1 rounded-full bg-current" />
                            <div className="w-1 h-1 rounded-full bg-current" />
                        </div>
                        <div className="flex gap-0.5">
                            <div className="w-1 h-1 rounded-full bg-current" />
                            <div className="w-1 h-1 rounded-full bg-current" />
                        </div>
                        <div className="flex gap-0.5">
                            <div className="w-1 h-1 rounded-full bg-current" />
                            <div className="w-1 h-1 rounded-full bg-current" />
                        </div>
                    </div>
                </button>
                <span className="text-jazz-muted font-mono text-[10px] w-4">
                    {props.index + 1}
                </span>
                <span className="text-white/80 truncate font-medium">{props.theme.name}</span>
            </div>
            <div className="flex gap-1 on-no-drag" onPointerDown={(e) => e.stopPropagation()}>
                <button
                    onClick={() => props.onStatusChange(props.id, 'PLAYING')}
                    className="text-jazz-gold hover:bg-jazz-gold/20 p-1.5 rounded-md transition-all"
                    title="Poner en Escenario"
                >
                    <Play size={14} fill="currentColor" />
                </button>
                <button
                    onClick={() => props.onStatusChange(props.id, 'OPEN')}
                    className="text-white/20 hover:text-white hover:bg-white/10 p-1.5 rounded-md transition-all"
                    title="Mover a Abiertos"
                >
                    <Square size={14} />
                </button>
            </div>
        </div>
    );
}
