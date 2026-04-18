import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { KeyRound, CheckCircle, XCircle } from 'lucide-react';

export default function ResetPassword() {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get('token') || '');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirm) {
      setError('Passwörter stimmen nicht überein.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }
    setLoading(true);
    const res = await base44.functions.invoke('resetPassword', { token, newPassword });
    if (res.data?.error) {
      setError(res.data.error);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
        <div className="text-center text-white/50">
          <XCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
          <p>Ungültiger Reset-Link.</p>
          <Link to={createPageUrl('ForgotPassword')} className="text-cyan-400 mt-4 block">Neuen Link anfordern</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a0014] via-[#050505] to-[#0a0a0b] -z-20" />
      <div className="fixed top-0 left-1/3 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[200px] animate-pulse pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="bg-white/[0.03] backdrop-blur-2xl p-8 md:p-10 rounded-3xl border border-white/10 shadow-[0_0_80px_rgba(6,182,212,0.15)]">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.8 }}
              className="relative w-20 h-20 mx-auto mb-6"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-teal-600 rounded-full blur-2xl opacity-60 animate-pulse" />
              <div className="relative w-full h-full rounded-full bg-gradient-to-br from-cyan-600 to-teal-600 flex items-center justify-center shadow-2xl shadow-cyan-500/30 border-4 border-cyan-400/20">
                <KeyRound className="w-10 h-10 text-white" />
              </div>
            </motion.div>
            <h1 className="text-3xl font-black text-white mb-2">Neues Passwort</h1>
            <p className="text-white/50 text-sm">Wähle ein neues sicheres Passwort.</p>
          </div>

          {success ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center p-6 rounded-2xl bg-green-500/10 border border-green-500/30">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-green-400 font-bold text-lg mb-1">Passwort geändert!</p>
              <Link to={createPageUrl('SignIn')}
                className="mt-3 inline-block text-cyan-400 font-bold hover:text-cyan-300 transition-all">
                Jetzt einloggen →
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-white/80 mb-3">Neues Passwort</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-black/40 border-white/20 text-white h-14 rounded-2xl text-lg placeholder:text-white/30 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white/80 mb-3">Passwort bestätigen</label>
                <Input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="bg-black/40 border-white/20 text-white h-14 rounded-2xl text-lg placeholder:text-white/30 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="p-4 rounded-2xl bg-red-500/10 border-2 border-red-500/30 text-red-400 text-sm text-center font-medium">
                  {error}
                </motion.div>
              )}

              <Button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white h-14 text-lg font-black shadow-2xl shadow-cyan-500/40 rounded-2xl border border-cyan-400/20 transition-all">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Speichere...
                  </div>
                ) : 'Passwort ändern'}
              </Button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}