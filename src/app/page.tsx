'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Music2, Mic2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [guestName, setGuestName] = useState("");
  const router = useRouter();

  const handleGuestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    // We use the "credentials" provider we set up for "Guest"
    await signIn("credentials", {
      name: guestName,
      redirectTo: "/dashboard"
    });
  };

  const handleGoogleLogin = () => {
    signIn("google", { redirectTo: "/dashboard" });
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-background">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-jazz-gold/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-8 z-10"
      >
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-jazz-surface border border-white/5 rounded-full shadow-2xl">
              <Music2 className="w-10 h-10 text-jazz-gold" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tighter text-white">
            Toca <span className="text-jazz-gold">Tocar</span>
          </h1>
          <p className="text-white/40 text-sm">Organiza tu Jam Session</p>
        </div>

        <div className="grid gap-4">
          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white text-black font-medium p-4 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors"
          >
            <img src="https://authjs.dev/img/providers/google.svg" className="w-5 h-5" alt="Google" />
            Continuar con Google
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-white/30 text-xs uppercase">O entra como invitado</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {/* Guest Login */}
          <form onSubmit={handleGuestLogin} className="space-y-4">
            <div className="relative">
              <Mic2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="text"
                placeholder="Tu Nombre de Músico"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                className="w-full bg-jazz-surface border border-white/10 p-4 pl-12 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-jazz-gold/50"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-jazz-accent hover:bg-jazz-accent/90 text-white font-bold p-4 rounded-xl transition-colors flex justify-center items-center gap-2"
            >
              Entrar <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </motion.div>
    </main>
  );
}
