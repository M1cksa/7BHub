import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function UserPopupNotification() {
  const [pending, setPending] = useState([]);
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const stored = localStorage.getItem('app_user');
        if (!stored) return;
        const user = JSON.parse(stored);
        if (!user?.id) return;

        const notifs = await base44.entities.UserPopupNotification.filter({ is_active: true });
        const mine = notifs.filter(n =>
          Array.isArray(n.target_user_ids) &&
          n.target_user_ids.includes(user.id) &&
          !(n.seen_by || []).includes(user.id)
        );
        setPending(mine);
        if (mine.length > 0) setCurrent(mine[0]);
      } catch (e) {
        // silent
      }
    };

    checkNotifications();
  }, []);

  const handleAcknowledge = async () => {
    if (!current) return;
    try {
      const stored = localStorage.getItem('app_user');
      const user = JSON.parse(stored);
      const seenBy = [...(current.seen_by || []), user.id];
      await base44.entities.UserPopupNotification.update(current.id, { seen_by: seenBy });
    } catch (e) {}
    const remaining = pending.filter(n => n.id !== current.id);
    setPending(remaining);
    setCurrent(remaining[0] || null);
  };

  if (!current) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-md bg-[#111118] border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600/80 to-orange-600/80 px-6 py-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-0.5">Admin-Benachrichtigung</p>
              <h2 className="text-white font-black text-lg leading-tight truncate">{current.title}</h2>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            <p className="text-white/80 text-sm leading-relaxed">{current.message}</p>
            {current.sent_by && (
              <p className="text-white/30 text-xs mt-3">Gesendet von: {current.sent_by}</p>
            )}
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 flex gap-3">
            <Button
              onClick={handleAcknowledge}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 h-11 font-bold"
            >
              ✓ Einverstanden
            </Button>
            <Link to="/Support" className="flex-1" onClick={handleAcknowledge}>
              <Button
                variant="outline"
                className="w-full border-white/10 text-white/70 hover:bg-white/10 h-11"
              >
                Support kontaktieren
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}