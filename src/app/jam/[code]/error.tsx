'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
            <div className="text-center space-y-6 max-w-md bg-white/5 p-8 rounded-2xl border border-white/10">
                <h2 className="text-xl font-bold text-red-500">Error de Aplicación</h2>
                <div className="text-sm text-gray-300 space-y-2">
                    <p>Tu navegador o una extensión está bloqueando la aplicación.</p>
                    <p className="font-mono text-xs bg-black/30 p-2 rounded text-red-300 break-all">{error.message}</p>
                </div>
                <div className="bg-jazz-gold/10 p-4 rounded-lg border border-jazz-gold/20 text-left">
                    <p className="text-jazz-gold font-bold text-sm mb-2">Solución Recomendada:</p>
                    <ul className="list-disc list-inside text-xs text-gray-300 space-y-1">
                        <li>Abre esta página en <strong>Modo Incógnito</strong>.</li>
                        <li>O desactiva extensiones de seguridad/traducción.</li>
                        <li>Usa otro navegador (Firefox, Edge).</li>
                    </ul>
                </div>
                <button
                    onClick={() => reset()}
                    className="bg-white text-black font-bold px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors w-full"
                >
                    Reintentar
                </button>
            </div>
        </div>
    );
}
