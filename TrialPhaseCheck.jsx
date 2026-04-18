import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Clock, Lock } from 'lucide-react';

/**
 * TrialPhaseCheck - Helper Komponente zur Überprüfung der Testphase
 * 
 * Überprüft ob der User sich in der 24h Testphase befindet.
 * Zeigt optional eine Warnung und verhindert Aktionen.
 */
export function isInTrialPhase(user) {
  if (!user) return false;
  if (user.role === 'admin') return false; // Admins haben keine Testphase
  if (user.trial_completed) return false; // Admin hat Testphase übersprungen
  
  const accountAge = Date.now() - new Date(user.created_date).getTime();
  const hours24 = 24 * 60 * 60 * 1000;
  
  return accountAge < hours24;
}

export function getTrialTimeRemaining(user) {
  if (!user) return 0;
  const accountAge = Date.now() - new Date(user.created_date).getTime();
  const hours24 = 24 * 60 * 60 * 1000;
  const remaining = hours24 - accountAge;
  
  return Math.max(0, remaining);
}

export function formatTrialTime(milliseconds) {
  const hours = Math.floor(milliseconds / (60 * 60 * 1000));
  const minutes = Math.floor((milliseconds % (60 * 60 * 1000)) / (60 * 1000));
  
  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes} Minuten`;
}

export default function TrialPhaseCheck({ action = 'diese Aktion', children, onBlock }) {
  const [user, setUser] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('app_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    if (user && isInTrialPhase(user)) {
      setIsBlocked(true);
      const remaining = getTrialTimeRemaining(user);
      toast.error(`Testphase aktiv - ${action} erst in ${formatTrialTime(remaining)} verfügbar`, {
        icon: <Lock className="w-4 h-4" />,
        duration: 5000
      });
      if (onBlock) onBlock();
    } else {
      setIsBlocked(false);
    }
  }, [user, action, onBlock]);

  if (isBlocked) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-amber-500/30 bg-amber-500/5 text-center">
        <Clock className="w-12 h-12 mx-auto mb-4 text-amber-400" />
        <h3 className="text-xl font-bold text-white mb-2">Testphase aktiv</h3>
        <p className="text-white/70 mb-4">
          Du kannst {action} erst nach Ablauf der 24-Stunden-Testphase nutzen.
        </p>
        <p className="text-amber-400 font-bold">
          Noch {formatTrialTime(getTrialTimeRemaining(user))} verbleibend
        </p>
      </div>
    );
  }

  return children;
}