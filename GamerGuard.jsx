import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Gamepad2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * GamerGuard – wraps pages that are NOT accessible to the "gamer" role.
 * If the current user is a gamer, shows a friendly block screen instead.
 */
export default function GamerGuard({ children }) {
  const user = useMemo(() => {
    try {
      const u = localStorage.getItem('app_user');
      return u && u !== 'undefined' ? JSON.parse(u) : null;
    } catch { return null; }
  }, []);

  if (user?.role === 'gamer') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center mx-auto mb-5">
            <Lock className="w-7 h-7 text-white/40" />
          </div>
          <h2 className="text-xl font-black text-white mb-2">Kein Zugriff</h2>
          <p className="text-white/40 text-sm mb-6">
            Diese Seite ist für deinen Account-Typ nicht verfügbar.
          </p>
          <Link to={createPageUrl('Home')}>
            <Button className="gap-2">
              <Gamepad2 className="w-4 h-4" /> Zurück zu den Games
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return children;
}