'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useStore } from 'zustand';
import { Mic2, Music2, ArrowRight, Plus } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [jamCode, setJamCode] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedName = localStorage.getItem('toca_tocar_user_name');
    if (storedName) setName(storedName);
  }, []);

  const handleSaveUser = () => {
    if (name.trim()) {
      localStorage.setItem('toca_tocar_user_name', name);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Por favor, ingresa tu nombre de músico.');
    if (!jamCode.trim()) return alert('Ingresa el código de la Jam.');

    handleSaveUser();
    router.push(`/jam/${jamCode.toUpperCase()}`);
  };

  const handleCreate = () => {
    if (!name.trim()) return alert('Por favor, ingresa tu nombre de músico.');

    handleSaveUser();
    // For MVP, we'll just redirect to a demo jam
    const newCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    router.push(`/jam/${newCode}?create=true`);
  };

  if (!isClient) return null;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-jazz-gold/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-jazz-accent/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 z-10"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-jazz-surface border border-white/5 rounded-full shadow-2xl">
              <Music2 className="w-10 h-10 text-jazz-gold" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tighter text-white">
            Toca <span className="text-jazz-gold">Tocar</span>
          </h1>
          <p className="text-jazz-muted text-sm font-medium tracking-wide">
            ORGANIZACIÓN DE JAMS EN TIEMPO REAL
          </p>
        </div>

        {/* User Identity */}
        <div className="bg-jazz-surface border border-white/5 p-6 rounded-2xl shadow-xl space-y-4">
          <div>
            <label className="text-xs text-jazz-muted uppercase tracking-widest font-bold ml-1">Tu Nombre / Apodo</label>
            <div className="mt-2 relative">
              <Mic2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Miles Davis"
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-jazz-gold/50 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 gap-4">
          {/* Join Jam */}
          <form onSubmit={handleJoin} className="bg-jazz-surface border border-white/5 p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-jazz-muted uppercase tracking-widest font-bold ml-1">Unirse a una Jam</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={jamCode}
                  onChange={(e) => setJamCode(e.target.value.toUpperCase())}
                  placeholder="CÓDIGO (EJ: JAZZ)"
                  maxLength={4}
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-center text-lg font-mono tracking-[0.2em] text-white placeholder:text-white/20 uppercase focus:outline-none focus:border-jazz-accent/50 transition-colors"
                />
                <button
                  type="submit"
                  className="bg-jazz-accent hover:bg-jazz-accent/90 text-white p-3 rounded-xl transition-colors shrink-0"
                >
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </form>

          {/* Create Jam */}
          <button
            onClick={handleCreate}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/5 p-4 rounded-2xl flex items-center justify-center gap-2 text-jazz-muted hover:text-white transition-all group"
          >
            <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Crear Nueva Jam</span>
          </button>
        </div>

        <p className="text-center text-xs text-white/20 font-mono">
          v0.1.0 MVP • Sin Audio, Solo Intención
        </p>
      </motion.div>
    </main>
  );
}
