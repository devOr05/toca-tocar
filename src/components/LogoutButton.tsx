'use client';

import { LogOut } from 'lucide-react';
import { logoutAction } from '@/app/actions';

export default function LogoutButton() {
    return (
        <button
            onClick={() => logoutAction()}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 transition-all text-white/40"
            title="Cerrar Sesión"
        >
            <LogOut className="w-5 h-5" />
        </button>
    );
}
