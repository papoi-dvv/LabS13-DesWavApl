'use client';

import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  const handleSignOut = async () => {
    await fetch('/api/presence', {
      method: 'DELETE',
    }).catch(() => undefined);

    await signOut({ callbackUrl: '/signIn' });
  };

  return (
    <button 
        onClick={handleSignOut}
        className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800">
            Cerrar Sesión
    </button>
  );
}
