'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body className="bg-black text-white min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md text-center space-y-4">
                    <h2 className="text-2xl font-bold text-red-500">Algo salió mal :(</h2>
                    <p className="text-white/60 text-sm font-mono break-all bg-white/5 p-4 rounded-lg border border-white/10">
                        {error.message || 'Error desconocido'}
                    </p>
                    <button
                        onClick={() => reset()}
                        className="bg-jazz-gold text-black font-bold px-6 py-3 rounded-xl hover:bg-jazz-gold/90 transition-colors"
                    >
                        Intentar de nuevo
                    </button>
                </div>
            </body>
        </html>
    );
}
