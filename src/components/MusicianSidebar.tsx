'use client';

import { useState } from 'react';
import { Trash2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import DMChatModal from './DMChatModal';

export default function MusicianSidebar({ musicians, currentUser, userCity }: { musicians: any[], currentUser: any, userCity: string }) {
    const [selectedMusician, setSelectedMusician] = useState<any>(null);

    // Hardcoded Super Admin check
    const isSuperAdmin = currentUser?.email?.toLowerCase() === 'orostizagamario@gmail.com' || currentUser?.role === 'ADMIN';

    const handleDelete = async (userId: string, userName: string) => {
        if (!confirm(`¿Estás seguro de eliminar a ${userName}? Esta acción no se puede deshacer.`)) return;

        try {
            const { deleteUser } = await import('@/app/actions');
            const result = await deleteUser(userId);

            if (result.success) {
                toast.success(`Usuario ${userName} eliminado`);
                window.location.reload();
            } else {
                toast.error(result.error || 'Error al eliminar');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error de conexión');
        }
    };

    return (
        <div className="bg-jazz-surface border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-widest text-xs">
                <span className="text-jazz-gold">📍</span> Músicos en {userCity || 'tu zona'}
            </h3>
            {musicians && musicians.length > 0 ? (
                <ul className="space-y-3">
                    {musicians.map((musician: any) => (
                        <li key={musician.id} className="group flex items-center justify-between p-2 hover:bg-white/5 rounded-xl transition-colors">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden shrink-0">
                                    {musician.image ? (
                                        <img src={musician.image} alt={musician.name || ''} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-sm">👤</div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-sm text-white truncate">{musician.name}</p>
                                    <p className="text-xs text-white/50 truncate">{musician.mainInstrument || 'Músico'}</p>
                                </div>
                            </div>

                            <div className="flex gap-1">
                                {/* Message Action */}
                                {currentUser && currentUser.id !== musician.id && (
                                    <button
                                        onClick={() => setSelectedMusician(musician)}
                                        className="p-2 text-jazz-gold hover:bg-jazz-gold/10 rounded-lg transition-colors"
                                        title="Enviar mensaje directo"
                                    >
                                        <MessageSquare size={16} />
                                    </button>
                                )}

                                {/* Admin Actions */}
                                {isSuperAdmin && (
                                    <button
                                        onClick={() => handleDelete(musician.id, musician.name)}
                                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Eliminar usuario"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-white/30 text-sm italic">No hay músicos en tu zona aún.</p>
            )}

            {/* Chat Modal */}
            {selectedMusician && (
                <DMChatModal
                    isOpen={!!selectedMusician}
                    onClose={() => setSelectedMusician(null)}
                    currentUser={currentUser}
                    receiver={selectedMusician}
                />
            )}
        </div>
    );
}
