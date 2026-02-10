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
                    <label className="block text-sm font-medium text-white/60 mb-2">Temas favoritos o que más tocas</label>
                    <div className="relative group">
                        <Disc className="absolute left-3 top-3.5 w-5 h-5 text-white/40 group-focus-within:text-jazz-gold transition-colors" />
                        <input type="text" name="favoriteTheme" defaultValue={user.favoriteTheme || ''} placeholder="Ej: Giant Steps, So What..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-jazz-gold focus:ring-1 focus:ring-jazz-gold transition-all" />
                    </div>
                </div>

                {/* Social Links */}
                <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Redes para Promoción</label>
                    <div className="space-y-3">
                        {/* Instagram */}
                        <div className="relative group">
                            <LinkIcon className="absolute left-3 top-3.5 w-5 h-5 text-white/40 group-focus-within:text-pink-500 transition-colors" />
                            <input type="url" name="instagram" defaultValue={user.instagram || ''} placeholder="Instagram URL"
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all placeholder:text-white/20" />
                        </div>
                        {/* YouTube */}
                        <div className="relative group">
                            <LinkIcon className="absolute left-3 top-3.5 w-5 h-5 text-white/40 group-focus-within:text-red-500 transition-colors" />
                            <input type="url" name="youtube" defaultValue={user.youtube || ''} placeholder="YouTube URL"
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-white/20" />
                        </div>
                        {/* TikTok */}
                        <div className="relative group">
                            <LinkIcon className="absolute left-3 top-3.5 w-5 h-5 text-white/40 group-focus-within:text-cyan-400 transition-colors" />
                            <input type="url" name="tiktok" defaultValue={user.tiktok || ''} placeholder="TikTok URL"
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all placeholder:text-white/20" />
                        </div>
                    </div>
                </div>

                {/* New Socials */}
                <div className="space-y-3">
                    <div className="relative group">
                        <LinkIcon className="absolute left-3 top-3.5 w-5 h-5 text-white/40 group-focus-within:text-teal-400 transition-colors" />
                        <input type="url" name="bandcamp" defaultValue={user.bandcamp || ''} placeholder="Bandcamp URL"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all placeholder:text-white/20" />
                    </div>
                    {/* SoundCloud */}
                    <div className="relative group">
                        <LinkIcon className="absolute left-3 top-3.5 w-5 h-5 text-white/40 group-focus-within:text-orange-500 transition-colors" />
                        <input type="url" name="soundcloud" defaultValue={user.soundcloud || ''} placeholder="SoundCloud URL"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-white/20" />
                    </div>
                    <div className="relative group">
                        <LinkIcon className="absolute left-3 top-3.5 w-5 h-5 text-white/40 group-focus-within:text-gray-400 transition-colors" />
                        <input type="url" name="website" defaultValue={user.website || ''} placeholder="Web Personal / Otros"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all placeholder:text-white/20" />
                    </div>
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
