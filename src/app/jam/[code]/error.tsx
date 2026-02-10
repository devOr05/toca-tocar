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
            <div className="text-center space-y-4">
                <h2 className="text-xl font-bold text-red-500">Error en la Jam</h2>
                <p className="text-sm opacity-50">{error.message}</p>
                <button
                    onClick={() => reset()}
                    className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200"
                >
                    Reintentar
                </button>
            </div>
        </div>
    );
}
