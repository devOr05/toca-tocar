'use client';

import { useActionState } from 'react';
import { updateProfile, logoutAction } from '@/app/actions';
import { User, Music2, Link as LinkIcon, Save, Disc, LogOut } from "lucide-react";

const initialState = {
    error: '',
    success: false
};

export default function ProfileForm({ user }: { user: any }) {
    const [state, formAction, isPending] = useActionState(updateProfile, initialState);

    return (
        <>
            <form action={formAction} className="w-full max-w-md space-y-6 bg-jazz-surface p-6 rounded-2xl border border-white/10 shadow-xl">

                {state?.success && (
                    <div className="bg-green-500/20 text-green-200 p-3 rounded-lg text-sm border border-green-500/50 text-center">
                        ¡Perfil actualizado correctamente!
                    </div>
                )}

                {state?.error && (
                    <div className="bg-red-500/20 text-red-200 p-3 rounded-lg text-sm border border-red-500/50">
                        {state.error}
                    </div>
                )}

                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Nombre Artístico</label>
                    <div className="relative group">
                        <User className="absolute left-3 top-3.5 w-5 h-5 text-white/40 group-focus-within:text-jazz-gold transition-colors" />
                        <input type="text" name="name" defaultValue={user.name || ''} required
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-jazz-gold focus:ring-1 focus:ring-jazz-gold transition-all" />
                    </div>
                </div>

                {/* Main Instrument */}
                <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Instrumento Principal</label>
                    <div className="relative group">
                        <Music2 className="absolute left-3 top-3.5 w-5 h-5 text-white/40 group-focus-within:text-jazz-gold transition-colors" />
                        <input type="text" name="mainInstrument" defaultValue={user.mainInstrument || ''} placeholder="Ej: Saxo Tenor, Batería..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-jazz-gold focus:ring-1 focus:ring-jazz-gold transition-all" />
                    </div>
                </div>

                {/* Favorite Theme */}
                <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Tema Favorito (Standard)</label>
                    <div className="relative group">
                        <Disc className="absolute left-3 top-3.5 w-5 h-5 text-white/40 group-focus-within:text-jazz-gold transition-colors" />
                        <input type="text" name="favoriteTheme" defaultValue={user.favoriteTheme || ''} placeholder="Ej: Giant Steps"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-jazz-gold focus:ring-1 focus:ring-jazz-gold transition-all" />
                    </div>
                </div>

                {/* External Link */}
                <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Link (Instagram / YouTube)</label>
                    <div className="relative group">
                        <LinkIcon className="absolute left-3 top-3.5 w-5 h-5 text-white/40 group-focus-within:text-jazz-gold transition-colors" />
                        <input type="url" name="externalLink" defaultValue={user.externalLink || ''} placeholder="https://..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-jazz-gold focus:ring-1 focus:ring-jazz-gold transition-all" />
                    </div>
                </div>

                {/* Has Recorded */}
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-colors">
                    <input type="checkbox" name="hasRecorded" defaultChecked={user.hasRecorded} className="w-5 h-5 accent-jazz-gold cursor-pointer" />
                    <label className="text-white cursor-pointer select-none">¿Has grabado algún disco? 💿</label>
                </div>

                <button type="submit" disabled={isPending} className="w-full bg-jazz-gold text-black font-bold p-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-jazz-gold/20 disabled:opacity-50 disabled:cursor-not-allowed">
                    <Save className="w-5 h-5" />
                    {isPending ? 'Guardando...' : 'Guardar Perfil'}
                </button>
            </form>

            <form action={logoutAction} className="w-full max-w-md mt-6">
                <button type="submit" className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium p-4 rounded-xl flex items-center justify-center gap-2 transition-colors border border-red-500/20">
                    <LogOut className="w-5 h-5" />
                    Cerrar Sesión
                </button>
            </form>
        </>
    );
}
