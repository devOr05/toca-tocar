'use client';

import { useState, useEffect } from 'react';
import { X, Download, Trash2 } from 'lucide-react';
import { getJamMedia, deleteMedia } from '@/app/actions';

interface Media {
    id: string;
    type: 'PHOTO' | 'VIDEO';
    url: string;
    thumbnailUrl?: string;
    caption?: string;
    uploadedBy: {
        id: string;
        name: string;
        image?: string;
    };
    createdAt: Date;
}

interface MediaGalleryProps {
    jamId: string;
    currentUserId?: string;
    isHost: boolean;
}

export default function MediaGallery({ jamId, currentUserId, isHost }: MediaGalleryProps) {
    const [media, setMedia] = useState<Media[]>([]);
    const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchMedia = async () => {
        setIsLoading(true);
        const data = await getJamMedia(jamId);
        setMedia(data as any);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchMedia();
        // Poll every 10 seconds
        const interval = setInterval(fetchMedia, 10000);
        return () => clearInterval(interval);
    }, [jamId]);

    const handleDelete = async (mediaId: string) => {
        if (!confirm('¿Estás seguro de eliminar este archivo?')) return;

        const result = await deleteMedia(mediaId);
        if (result.success) {
            setMedia(prev => prev.filter(m => m.id !== mediaId));
            setSelectedMedia(null);
        } else {
            alert(result.error || 'Error al eliminar');
        }
    };

    const canDelete = (mediaItem: Media) => {
        return currentUserId === mediaItem.uploadedBy.id || isHost;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-jazz-gold/30 border-t-jazz-gold rounded-full animate-spin" />
            </div>
        );
    }

    if (media.length === 0) {
        return (
            <div className="text-center py-12 text-white/40">
                <p>No hay fotos ni videos aún.</p>
                <p className="text-sm mt-2">Sé el primero en compartir un momento!</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {media.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => setSelectedMedia(item)}
                        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group bg-black/20 border border-white/5 hover:border-jazz-gold/50 transition-all"
                    >
                        {item.type === 'PHOTO' ? (
                            <img
                                src={item.thumbnailUrl || item.url}
                                alt={item.caption || 'Foto'}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                        ) : (
                            <video
                                src={item.url}
                                className="w-full h-full object-cover"
                                muted
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-2 left-2 right-2 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="font-bold truncate">{item.uploadedBy.name}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            {selectedMedia && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
                    onClick={() => setSelectedMedia(null)}
                >
                    <button
                        onClick={() => setSelectedMedia(null)}
                        className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
                    >
                        <X size={32} />
                    </button>

                    <div className="max-w-4xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
                        {selectedMedia.type === 'PHOTO' ? (
                            <img
                                src={selectedMedia.url}
                                alt={selectedMedia.caption || 'Foto'}
                                className="w-full h-full object-contain rounded-lg"
                            />
                        ) : (
                            <video
                                src={selectedMedia.url}
                                controls
                                autoPlay
                                className="w-full h-full object-contain rounded-lg"
                            />
                        )}

                        <div className="mt-4 bg-jazz-surface/90 backdrop-blur-md rounded-lg p-4 border border-white/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-jazz-accent to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                                        {selectedMedia.uploadedBy.name?.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">{selectedMedia.uploadedBy.name}</p>
                                        <p className="text-xs text-white/40">
                                            {new Date(selectedMedia.createdAt).toLocaleDateString('es-AR', {
                                                day: 'numeric',
                                                month: 'long',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <a
                                        href={selectedMedia.url}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-white/60 hover:text-jazz-gold transition-colors"
                                        title="Descargar"
                                    >
                                        <Download size={20} />
                                    </a>
                                    {canDelete(selectedMedia) && (
                                        <button
                                            onClick={() => handleDelete(selectedMedia.id)}
                                            className="p-2 text-white/60 hover:text-red-500 transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {selectedMedia.caption && (
                                <p className="mt-3 text-white/80">{selectedMedia.caption}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
