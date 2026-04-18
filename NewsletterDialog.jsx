import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Sparkles, Bell } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

export default function NewsletterDialog({ isOpen, onClose, user }) {
  const [email, setEmail] = useState(user?.email || '');
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(true);
  const [loading, setLoading] = useState(false);
  const needsEmail = !user?.email;

  const handleSubmit = async () => {
    if (!user?.id) return;
    if (needsEmail && !email.trim()) {
      alert('Bitte gib eine E-Mail-Adresse ein');
      return;
    }
    
    setLoading(true);
    
    try {
      const updateData = {
        newsletter_subscribed: subscribeNewsletter,
        newsletter_asked: true
      };
      
      if (needsEmail) {
        updateData.email = email.trim();
      }
      
      await base44.entities.AppUser.update(user.id, updateData);

      const updatedUser = {
        ...user,
        ...updateData
      };
      localStorage.setItem('app_user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('user-updated'));
      
      onClose();
    } catch (error) {
      console.error('Newsletter update error:', error);
      alert('Fehler beim Speichern');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 backdrop-blur-3xl border border-white/10 text-white max-w-lg shadow-2xl shadow-cyan-500/20">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black flex items-center gap-3 mb-2">
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="relative w-14 h-14"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl blur opacity-75 animate-pulse" />
              <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
            </motion.div>
            Bleib up-to-date
          </DialogTitle>
        </DialogHeader>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6 mt-4"
        >
          <div className="space-y-4">
            {needsEmail && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-semibold text-white/80 mb-2.5">E-Mail-Adresse</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="deine@email.de"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 h-11 rounded-xl focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all"
                  required
                />
                <p className="text-white/40 text-xs mt-2">Nur für Newsletter und KI-Benachrichtigungen</p>
              </motion.div>
            )}
            
            <div className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-cyan-500/30 rounded-2xl p-5 space-y-3">
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white/90 font-medium">KI-gesteuerte Benachrichtigungen</p>
                  <p className="text-white/50 text-sm mt-1">Erhalte personalisierte Updates über neue Inhalte basierend auf deinen Interessen</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] transition-all cursor-pointer group">
              <Checkbox 
                id="newsletter-dialog" 
                checked={subscribeNewsletter}
                onCheckedChange={setSubscribeNewsletter}
                className="mt-1"
              />
              <label htmlFor="newsletter-dialog" className="text-sm text-white/80 leading-relaxed cursor-pointer group-hover:text-white transition-colors">
                <span className="font-semibold">Ja, ich möchte KI-Benachrichtigungen aktivieren</span>
                <p className="text-white/50 text-xs mt-1">Updates nur wenn es wirklich interessant ist – keine Spam</p>
              </label>
            </div>

            <p className="text-white/40 text-xs leading-relaxed px-1">
              Du kannst deine Einstellungen jederzeit in deinem Profil ändern oder dich abmelden.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleSubmit}
              disabled={loading || (needsEmail && !email.trim())}
              className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/30 disabled:opacity-50 rounded-xl h-11"
            >
              {loading ? 'Speichert...' : 'Aktivieren'}
            </Button>
            {!needsEmail && (
              <Button
                onClick={async () => {
                  setSubscribeNewsletter(false);
                  await handleSubmit();
                }}
                disabled={loading}
                variant="outline"
                className="bg-white/5 border-white/15 hover:bg-white/10 text-white rounded-xl h-11"
              >
                Später
              </Button>
            )}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}