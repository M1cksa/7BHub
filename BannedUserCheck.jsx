import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BannedUserCheck() {
  const [user, setUser] = useState(null);
  const [isBanned, setIsBanned] = useState(false);

  useEffect(() => {
    const checkBanStatus = async () => {
      const stored = localStorage.getItem('app_user');
      if (!stored) return;

      try {
        const localUser = JSON.parse(stored);
        
        // Fetch fresh user data from database
        const freshUsers = await base44.entities.AppUser.filter({ id: localUser.id }, 1);
        if (freshUsers.length > 0) {
          const freshUser = freshUsers[0];
          
          if (freshUser.banned) {
            setIsBanned(true);
            setUser(freshUser);
            // Clear local storage and logout
            localStorage.removeItem('app_user');
          }
        }
      } catch (e) {
        console.error('Ban check error:', e);
      }
    };

    checkBanStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkBanStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (!isBanned) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gradient-to-br from-red-950 to-red-900 rounded-3xl p-8 border-2 border-red-500/50 shadow-2xl">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-12 h-12 text-red-400" />
          </div>
          
          <h1 className="text-3xl font-black text-white mb-3">Account gesperrt</h1>
          
          <p className="text-white/80 mb-6">
            Dein Account wurde von einem Administrator gesperrt.
          </p>
          
          {user?.ban_reason && (
            <div className="bg-black/30 rounded-xl p-4 mb-6">
              <p className="text-sm text-white/60 mb-2">Grund der Sperrung:</p>
              <p className="text-white font-semibold">{user.ban_reason}</p>
            </div>
          )}
          
          <p className="text-white/60 text-sm mb-6">
            Du hast keinen Zugriff mehr auf diese Plattform. Bei Fragen kontaktiere bitte das Support-Team.
          </p>
          
          <Button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }}
            className="w-full bg-red-600 hover:bg-red-500"
          >
            Verstanden
          </Button>
        </div>
      </div>
    </div>
  );
}