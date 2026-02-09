'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mic2, Music2, ArrowRight, Plus } from 'lucide-react';
import { createJam, joinJamAction } from './actions';

export default function LandingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [jamCode, setJamCode] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedName = localStorage.getItem('toca_tocar_user_name');
    if (storedName) setName(storedName);
  }, []);

  const handleSaveUser = (userId: string, userName: string) => {
    localStorage.setItem('toca_tocar_user_name', userName);
    localStorage.setItem('toca_tocar_user_id', userId);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Por favor, ingresa tu nombre de músico.');
    if (!jamCode.trim()) return alert('Ingresa el código de la Jam.');

    setIsLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('code', jamCode);

    try {
      const result = await joinJamAction(formData);
      if (result.error) {
        alert(result.error);
      } else if (result.success && result.jamCode) {
        handleSaveUser(result.userId!, result.userName!);
        router.push(`/jam/${result.jamCode}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error al unirse. ¿Está la base de datos conectada?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) return alert('Por favor, ingresa tu nombre de músico.');

    setIsLoading(true);
    const formData = new FormData();
    formData.append('name', name);

    try {
      const result = await createJam(formData);
      if (result.error) {
        alert(result.error);
      } else if (result.success && result.jamCode) {
        handleSaveUser(result.userId!, result.userName!);
        router.push(`/jam/${result.jamCode}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error al crear. Necesitas configurar la Base de Datos en Vercel.');
    } finally {
      setIsLoading(false);
    }
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
                  disabled={isLoading}
                  className="bg-jazz-accent hover:bg-jazz-accent/90 text-white p-3 rounded-xl transition-colors shrink-0 disabled:opacity-50"
                >
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </form>

          {/* Create Jam */}
          <button
            onClick={handleCreate}
            disabled={isLoading}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/5 p-4 rounded-2xl flex items-center justify-center gap-2 text-jazz-muted hover:text-white transition-all group disabled:opacity-50"
          >
            <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">{isLoading ? 'Creando...' : 'Crear Nueva Jam (DB Real)'}</span>
          </button>
        </div>

        <p className="text-center text-xs text-white/20 font-mono">
          v0.2.0 • Base de Datos Integrada
        </p>
      </motion.div>
    </main>
  );
}
