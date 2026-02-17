import { useState } from 'react';
import { Theme, User } from '@/types';
import { X, Music, FileText, Link as LinkIcon, ExternalLink, MessageSquare, Plus, Check, Loader2 } from 'lucide-react';
import JamChat from './JamChat';
import { useJamStore } from '@/store/jamStore';
import { inviteMusicianToTheme } from '@/app/actions';
import { toast } from 'sonner';

interface ThemeDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    theme: Theme;
    currentUser: User | null;
    isHost?: boolean;
    cityMusicians?: Partial<User>[];
}

export default function ThemeDetailsModal({ isOpen, onClose, theme, currentUser, isHost, cityMusicians = [] }: ThemeDetailsModalProps) {
    const { participations, jam } = useJamStore();
    const [isInviting, setIsInviting] = useState(false);
    const [isLoadingInvite, setIsLoadingInvite] = useState<string | null>(null);

    if (!isOpen) return null;

    // Get current musicians in the Jam that are NOT in this theme
    const currentMusicianIds = new Set(participations.filter(p => p.themeId === theme.id).map(p => p.userId));

    // Combine musicians in Jam and city musicians, filtering out self and existing participants
    const musiciansInJam = jam.attendance?.map(a => a.user).filter(Boolean) as User[] || [];

    // Merge both lists, deduplicate by ID, and filter
    const allPotential = [...musiciansInJam, ...cityMusicians as User[]];
    const availableMusicians = Array.from(new Map(allPotential.map(u => [u.id, u])).values())
        .filter(u =>
            u.id &&
            !currentMusicianIds.has(u.id) &&
            u.id !== currentUser?.id
        );

    const handleInvite = async (userId: string, musicianName: string) => {
        setIsLoadingInvite(userId);
        const result = await inviteMusicianToTheme(theme.id, userId, 'Varios');
        if (result.success) {
            toast.success(`Invitación enviada a ${musicianName}`);
        } else {
            toast.error(result.error || 'Error al invitar');
        }
        setIsLoadingInvite(null);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-[#121212] border border-white/10 rounded-3xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="p-6 border-b border-white/5 shrink-0 bg-[#0a0a0a]">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-white leading-tight">{theme.name}</h2>
                            <div className="flex items-center gap-2 mt-2">
                                {theme.type !== 'TOPIC' && (
                                    <span className="text-jazz-gold font-mono text-xs bg-jazz-gold/10 px-2.5 py-1 rounded-full border border-jazz-gold/20 font-bold uppercase tracking-widest">
                                        {theme.tonality || 'Tonality: ?'}
                                    </span>
                                )}
                                {theme.type === 'TOPIC' && (
                                    <span className="text-jazz-accent font-bold text-[10px] bg-jazz-accent/20 px-2 py-1 rounded-full uppercase tracking-wider border border-jazz-accent/30">
                                        Foro / Tópico
                                    </span>
                                )}
                                <span className="text-[10px] text-white/40 font-mono">ID: {theme.id.slice(0, 8)}</span>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors bg-white/5 p-2 rounded-xl hover:bg-white/10">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Main Content Area - Split into Info and Chat */}
                <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">

                    {/* INFO SIDE (Scrollable) */}
                    <div className="flex-1 md:flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-black/20 max-h-[40%] md:max-h-none border-b md:border-b-0 md:border-r border-white/5 shrink-0">
                        {/* Description */}
                        {theme.description && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-jazz-gold uppercase tracking-widest flex items-center gap-2">
                                    <FileText size={14} /> {theme.type === 'TOPIC' ? 'Contenido' : 'Descripción'}
                                </h3>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                                        {theme.description}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Sheet Music / Link */}
                        {theme.sheetMusicUrl && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-jazz-gold uppercase tracking-widest flex items-center gap-2">
                                    <LinkIcon size={14} /> Material Adicional
                                </h3>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    {(theme.sheetMusicUrl.match(/\.(jpg|jpeg|png|webp)$/i) || theme.sheetMusicUrl.includes('cloudinary')) ? (
                                        <div className="space-y-4">
                                            <div className="relative group">
                                                <img
                                                    src={theme.sheetMusicUrl.endsWith('.pdf') ? theme.sheetMusicUrl.replace('.pdf', '.jpg') : theme.sheetMusicUrl}
                                                    alt="Vista previa"
                                                    className="w-full rounded-xl border border-white/10 shadow-lg group-hover:opacity-90 transition-opacity"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <a href={theme.sheetMusicUrl} target="_blank" className="bg-jazz-gold text-black p-3 rounded-full shadow-xl">
                                                        <ExternalLink size={20} />
                                                    </a>
                                                </div>
                                            </div>
                                            <a
                                                href={theme.sheetMusicUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 text-jazz-gold hover:text-white text-xs py-2.5 border border-jazz-gold/30 rounded-xl hover:bg-jazz-gold/10 transition-all font-bold uppercase tracking-wider"
                                            >
                                                Ver Pantalla Completa
                                            </a>
                                        </div>
                                    ) : (
                                        <a href={theme.sheetMusicUrl} target="_blank" className="flex items-center gap-4 text-jazz-gold hover:underline group">
                                            <div className="w-12 h-12 rounded-xl bg-jazz-gold/10 flex items-center justify-center group-hover:bg-jazz-gold/20 transition-colors shrink-0">
                                                <Music size={24} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-bold truncate">Ver Enlace Externo</div>
                                                <div className="text-[10px] text-white/40 truncate">{theme.sheetMusicUrl}</div>
                                            </div>
                                            <ExternalLink size={16} className="ml-auto" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Host Tools - Invitation */}
                        {isHost && (
                            <div className="pt-4 border-t border-white/10">
                                <button
                                    onClick={() => setIsInviting(!isInviting)}
                                    className="w-full flex items-center justify-between p-4 bg-jazz-gold/5 border border-jazz-gold/20 rounded-2xl text-jazz-gold hover:bg-jazz-gold/10 transition-all group"
                                >
                                    <span className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                        <Plus size={18} /> Invitar Músicos
                                    </span>
                                    <div className="w-6 h-6 rounded-full bg-jazz-gold/20 flex items-center justify-center group-hover:bg-jazz-gold group-hover:text-black transition-colors">
                                        <Plus size={14} />
                                    </div>
                                </button>

                                {isInviting && (
                                    <div className="mt-4 space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                                        {availableMusicians.length === 0 ? (
                                            <p className="text-[10px] text-white/30 italic text-center py-4">No hay más músicos disponibles en la Jam.</p>
                                        ) : (
                                            availableMusicians.map(user => (
                                                <div key={user.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden">
                                                            {user.image ? <img src={user.image} className="w-full h-full object-cover" /> : <div className="text-[10px] flex items-center justify-center h-full">👤</div>}
                                                        </div>
                                                        <span className="text-sm text-white font-medium">{user.name}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleInvite(user.id, user.name!)}
                                                        disabled={!!isLoadingInvite}
                                                        className="text-[10px] font-bold uppercase bg-jazz-gold text-black px-3 py-1.5 rounded-lg hover:scale-105 transition-transform disabled:opacity-50"
                                                    >
                                                        {isLoadingInvite === user.id ? <Loader2 size={12} className="animate-spin" /> : 'Invitar'}
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* CHAT/COMMENTS SIDE (Flexible Height Mobile, Fixed Width Desktop) */}
                    <div className="flex-1 md:flex-[1.5] flex flex-col bg-[#0d0d0d] overflow-hidden">
                        <div className="flex-1 min-h-0">
                            {currentUser ? (
                                <JamChat
                                    jamId={theme.jamId}
                                    currentUser={currentUser}
                                    themeId={theme.id}
                                    isCommentMode={theme.type === 'TOPIC'}
                                    title={theme.type === 'TOPIC' ? 'Comentarios' : 'Chat del tema'}
                                />
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 opacity-40">
                                    <MessageSquare size={48} />
                                    <p className="text-sm italic">Inicia sesión o regístrate para participar en la conversación.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Fixed Footer for Host Control */}
                {(isHost || (currentUser && theme.proposedById === currentUser.id)) && theme.status !== 'QUEUED' && theme.type !== 'TOPIC' && (
                    <div className="p-4 bg-[#0a0a0a] border-t border-white/10 shrink-0">
                        <button
                            onClick={async () => {
                                const { updateThemeStatus } = await import('@/app/actions');
                                const res = await updateThemeStatus(theme.id, 'QUEUED');
                                if (res.success) onClose();
                            }}
                            className="w-full bg-jazz-gold text-black font-black py-4 rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99] uppercase tracking-tighter shadow-lg shadow-jazz-gold/10"
                        >
                            Confirmar para Cola de Reproducción
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
