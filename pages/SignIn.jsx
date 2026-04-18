import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/api/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { LogIn, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import NewsletterDialog from '@/components/NewsletterDialog';

export default function SignIn() {
  const lw = (() => { try { const s = localStorage.getItem('lightweight_mode_v2'); return s !== null ? s === 'true' : true; } catch { return true; } })();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNewsletterDialog, setShowNewsletterDialog] = useState(false);
  const [showWhyGroupsDialog, setShowWhyGroupsDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const cleanUsername = username.trim();
      const cleanPassword = password.trim();

      // 1. Username -> E-Mail via RPC
      console.log('[login] step 1: rpc lookup');
      const { data: resolvedEmail, error: rpcErr } = await supabase.rpc(
        'get_email_for_username',
        { p_username: cleanUsername },
      );
      if (rpcErr) console.warn('[login] rpc error:', rpcErr);
      console.log('[login] resolvedEmail:', resolvedEmail);

      if (!resolvedEmail) {
        setError('Benutzer nicht gefunden.');
        return;
      }

      // 2. Auth
      console.log('[login] step 2: signInWithPassword');
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password: cleanPassword,
      });
      console.log('[login] authError:', authError);

      if (authError || !authData?.user) {
        setError(authError?.message || 'Falsches Passwort.');
        return;
      }

      // 3. Profil laden (mit Timeout, damit UI nicht hängt)
      console.log('[login] step 3: profile (timeout 3s)');
      const profilePromise = supabase
        .from('app_users')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle()
        .then(({ data }) => data);
      const timeout = new Promise((resolve) => setTimeout(() => resolve(null), 3000));
      const profile = await Promise.race([profilePromise, timeout]);
      console.log('[login] profile:', profile);

      const user = profile || {
        id: authData.user.id,
        email: resolvedEmail,
        username: cleanUsername,
        approved: true,
      };

      if (user.banned) {
        await supabase.auth.signOut();
        setError(user.ban_reason || 'Dein Account wurde gesperrt.');
        return;
      }

      if (user.approved === false) {
        await supabase.auth.signOut();
        setError('Dein Account wartet noch auf Freischaltung.');
        return;
      }

      localStorage.setItem('app_user', JSON.stringify(user));
      window.dispatchEvent(new Event('user-updated'));

      // Newsletter-Dialog oder weiterleiten
      if (!user.newsletter_asked) {
        setCurrentUser(user);
        setShowNewsletterDialog(true);
        return;
      }

      window.location.href = user.has_seen_tutorial
        ? createPageUrl('Home')
        : createPageUrl('Tutorial');

    } catch (err) {
      console.error('[login] error:', err);
      setError('Systemfehler: ' + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  const handleNewsletterClose = () => {
    setShowNewsletterDialog(false);
    if (!currentUser.has_seen_tutorial) {
      window.location.href = createPageUrl('Tutorial');
    } else {
      window.location.href = createPageUrl('Home');
    }
  };

  return (
    <>
      <NewsletterDialog 
        isOpen={showNewsletterDialog} 
        onClose={handleNewsletterClose}
        user={currentUser}
      />

      <Dialog open={showWhyGroupsDialog} onOpenChange={setShowWhyGroupsDialog}>
        <DialogContent className="bg-slate-900/95 backdrop-blur-2xl border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Warum fragen wir nach einer Gruppe?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-white/80 text-sm leading-relaxed">
            <p>
              Die Auswahl einer Gruppe (Girl/Boy) hilft uns, dir <strong>altersgerechte und personalisierte Inhalte</strong> zu zeigen. Das ist nicht diskriminierend, sondern:
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong>Sicherheit:</strong> Wir können Community-Standards altersgerecht umsetzen</li>
              <li><strong>Personalisierung:</strong> Du siehst Inhalte, die zu deinen Interessen passen</li>
              <li><strong>Moderation:</strong> Wir können besseren Jugendschutz bieten</li>
              <li><strong>Deine Wahl:</strong> Du kannst deine Gruppe später in den Einstellungen ändern</li>
            </ul>
            <p className="text-white/60 text-xs italic">
              Alle Gruppen haben Zugang zu allen Features. Das ist rein zur Inhalts-Kuratierung.
            </p>
          </div>
        </DialogContent>
      </Dialog>
      
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a0014] via-[#050505] to-[#0a0a0b] -z-20" />
      {!lw && <><div className="fixed top-0 left-1/3 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[200px] animate-pulse pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/3 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[200px] animate-pulse pointer-events-none -z-10" style={{ animationDelay: '1.5s' }} /></>}
      
      <motion.div 
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="bg-white/[0.03] backdrop-blur-2xl p-8 md:p-10 rounded-3xl md:rounded-[32px] border border-white/10 shadow-[0_0_80px_rgba(6,182,212,0.15)]">
          
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="relative w-20 h-20 mx-auto mb-6"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-teal-600 rounded-full blur-2xl opacity-60 animate-pulse" />
              <div className="relative w-full h-full rounded-full bg-gradient-to-br from-cyan-600 to-teal-600 flex items-center justify-center shadow-2xl shadow-cyan-500/30 border-4 border-cyan-400/20">
                <LogIn className="w-10 h-10 text-white drop-shadow-2xl" />
              </div>
            </motion.div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-white mb-2">Willkommen zurück</h1>
            <p className="text-white/50 text-sm mb-4">Melde dich an um fortzufahren</p>
            <button
              onClick={() => setShowWhyGroupsDialog(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-400/60 transition-all font-medium text-sm"
            >
              <Info className="w-4 h-4" />
              Warum fragen wir nach einer Gruppe?
            </button>
          </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-white/80 mb-3">Benutzername</label>
            <Input 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-black/40 border-white/20 text-white h-14 rounded-2xl text-lg placeholder:text-white/30 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              placeholder="Benutzername"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-white/80 mb-3">Passwort</label>
            <Input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black/40 border-white/20 text-white h-14 rounded-2xl text-lg placeholder:text-white/30 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-2xl bg-red-500/10 border-2 border-red-500/30 text-red-400 text-sm text-center font-medium backdrop-blur-xl"
            >
              {error}
            </motion.div>
          )}

          <Button 
          type="submit" 
          disabled={loading || !username || !password}
          className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white h-16 text-lg font-black shadow-2xl shadow-cyan-500/40 rounded-2xl border border-cyan-400/20 active:scale-95 md:hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Prüfe Daten...
              </div>
            ) : (
              'Einloggen'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link to={createPageUrl('ForgotPassword')}>
            <span className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 text-sm font-medium transition-all active:scale-95">
              Passwort vergessen?
            </span>
          </Link>
        </div>

        <div className="mt-8 text-center border-t border-white/10 pt-8">
          <p className="text-white/40 text-sm mb-3">Du bist neu hier?</p>
          <Link to={createPageUrl('Register')}>
            <span className="inline-flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 font-black text-xl transition-all hover:scale-105 active:scale-95">
              Kostenlos registrieren <span className="text-teal-400">→</span>
            </span>
          </Link>
        </div>
        </div>
      </motion.div>
    </div>
    </>
  );
}