'use client';

import { useState } from 'react';
import { Upload, X, Image as ImageIcon, Video } from 'lucide-react';
import { toast } from 'react-hot-toast';

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
            toast.error('Solo se permiten imágenes y videos');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('El archivo es demasiado grande. Máximo 10MB');
            return;
        }

        setIsUploading(true);

        try {
            // Create FormData
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dwzz6yxef';
            const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'toca-tocar';

            console.log('Cloudinary Upload Debug (Media):', { cloudName, uploadPreset, type: file.type });

            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', uploadPreset);

            // Upload to Cloudinary
            if (!cloudName || cloudName === 'your-cloud-name') {
                toast.error('Cloudinary no está configurado correctamente (Cloud Name ausente).');
                setIsUploading(false);
                return;
            }

            const resourceType = isImage ? 'image' : 'video';
            const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

            console.log('Final Cloudinary URL:', url);
            console.log('Upload Preset used:', uploadPreset);

            const response = await fetch(url, {
                method: 'POST',
                body: formData,
                // Ensure NO headers are set manually to let the browser set the correct Boundary for FormData
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Cloudinary error response:', data);
                if (response.status === 401) {
                    throw new Error('Error 401: ¿Configuraste el Upload Preset como "Unsigned" en Cloudinary? Es obligatorio.');
                }
                throw new Error(data.error?.message || 'Error al subir archivo a Cloudinary');
            }

            console.log('Media Upload Success:', data.secure_url);

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
        } catch (error: any) {
            console.error('Error uploading:', error);
            toast.error(error.message || 'Error al subir el archivo. Intenta de nuevo.');
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
