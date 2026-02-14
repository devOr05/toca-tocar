'use client';

import { useState } from 'react';
import { Upload, X, Image as ImageIcon, Video } from 'lucide-react';

interface MediaUploadButtonProps {
    jamId: string;
    onUploadComplete?: () => void;
}

export default function MediaUploadButton({ jamId, onUploadComplete }: MediaUploadButtonProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (!isImage && !isVideo) {
            alert('Solo se permiten imágenes y videos');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('El archivo es demasiado grande. Máximo 10MB');
            return;
        }

        setIsUploading(true);

        try {
            // Create FormData
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'toca-tocar'); // You'll need to create this in Cloudinary

            // Upload to Cloudinary
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            if (!cloudName || cloudName === 'your-cloud-name') {
                alert('Cloudinary no está configurado. Contacta al administrador.');
                setIsUploading(false);
                return;
            }
            const resourceType = isImage ? 'image' : 'video';
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error('Error al subir archivo');
            }

            // Save to database
            const saveResponse = await fetch('/api/media/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jamId,
                    type: isImage ? 'PHOTO' : 'VIDEO',
                    url: data.secure_url,
                    thumbnailUrl: data.thumbnail_url || data.secure_url,
                }),
            });

            if (!saveResponse.ok) {
                throw new Error('Error al guardar en base de datos');
            }

            onUploadComplete?.();
            setPreview(null);
        } catch (error) {
            console.error('Error uploading:', error);
            alert('Error al subir el archivo. Intenta de nuevo.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="relative">
            <input
                type="file"
                id="media-upload"
                accept="image/*,video/*"
                onChange={handleFileChange}
                disabled={isUploading}
                className="hidden"
            />
            <label
                htmlFor="media-upload"
                className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm
                    transition-all cursor-pointer
                    ${isUploading
                        ? 'bg-white/5 text-white/40 cursor-not-allowed'
                        : 'bg-jazz-gold/20 hover:bg-jazz-gold/30 text-jazz-gold'
                    }
                `}
            >
                {isUploading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-jazz-gold/30 border-t-jazz-gold rounded-full animate-spin" />
                        <span>Subiendo...</span>
                    </>
                ) : (
                    <>
                        <Upload size={16} />
                        <span>Subir Foto/Video</span>
                    </>
                )}
            </label>
        </div>
    );
}
