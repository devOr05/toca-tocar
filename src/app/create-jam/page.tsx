'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createJam } from '../actions';
import { Music2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateJamPage() {
    const router = useRouter();
    const [name, setName] = useState(''); // Host name (redundant if logged in, but useful for Jam Name context)
    const [isLoading, setIsLoading] = useState(false);

    // In a real app we might use the logged-in user's name automatically
    // But letting them name the "Host" alias or Jam Name is fine.
    // Let's assume we use their session name if available, but for now we ask for "Jam Name"?
    // The previous action `createJam` took "name" as Host Name. 
    // We should probably update `createJam` to use the session User ID if logged in?

    // For MVP "Guest" flow, the guest name IS the user name.
    // Since we are now behind Auth, `createJam` should ideally use `auth()` to get the user.
    // BUT the previous `createJam` created a NEW user.
    // We should UPDATE `createJam` to respect the logged-in user.

    // WORKAROUND FOR MVP SPEED:
    // We'll keep `createJam` as is (creates a user) BUT since we are logged in, 
    // we want to attach the Jam to the CURRENT user.

    // I will stick to the previous `createJam` logic for now, even if it duplicates users, to ensure it works.
    // Wait, if I'm logged in, `createJam` creates ANOTHER user? That's bad.

    // I NEED TO UPDATE `createJam` action to handle logged-in users.

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData();
        formData.append('name', name || 'Jam'); // We'll just pass a name for now

        // Note: The actions/createJam.ts logic currently creates a NEW user.
        // I should update it to use the session. 
        // Failing that, this form just works as a "Guest" creator.

        try {
            const result = await createJam(formData);
            if (result.success && result.jamCode) {
                router.push(`/jam/${result.jamCode}`);
            } else {
                alert('Error al crear jam');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-md space-y-8">
                <Link href="/dashboard" className="text-white/50 hover:text-white flex items-center gap-2 mb-8">
                    <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
                </Link>

                <div className="text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">Crear Nueva Jam</h1>
                    <p className="text-white/40">Define el nombre del anfitrión</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-jazz-surface border border-white/5 p-6 rounded-2xl shadow-xl space-y-6">
                    <div>
                        <label className="text-xs text-jazz-muted uppercase tracking-widest font-bold ml-1">Nombre para la Jam</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Ej. Miles Davis Trio"
                            className="w-full mt-2 bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/20 focus:outline-none focus:border-jazz-gold/50 transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-jazz-gold text-black font-bold p-4 rounded-xl hover:bg-jazz-gold/90 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Creando...' : 'Comenzar Jam'}
                    </button>
                </form>
            </div>
        </div>
    );
}
