import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const PRIORITY_CONFIG = {
  info:     { gradient: 'from-cyan-600 to-blue-600',     glow: 'rgba(6,182,212,0.4)',    icon: Info,          label: 'Mitteilung', bg: 'rgba(6,182,212,0.08)',    border: 'rgba(6,182,212,0.3)' },
  warning:  { gradient: 'from-amber-500 to-orange-500',  glow: 'rgba(245,158,11,0.4)',   icon: AlertTriangle, label: 'Wichtig',    bg: 'rgba(245,158,11,0.08)',   border: 'rgba(245,158,11,0.3)' },
  success:  { gradient: 'from-emerald-500 to-teal-500',  glow: 'rgba(16,185,129,0.4)',   icon: CheckCircle,   label: 'News',       bg: 'rgba(16,185,129,0.08)',   border: 'rgba(16,185,129,0.3)' },
  critical: { gradient: 'from-red-600 to-rose-600',      glow: 'rgba(220,38,38,0.5)',    icon: AlertTriangle, label: '⚠️ Kritisch', bg: 'rgba(220,38,38,0.1)',     border: 'rgba(220,38,38,0.4)' },
};

export default function AdminBroadcastPopup() {
  const [broadcast, setBroadcast] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const seen = JSON.parse(localStorage.getItem('seenBroadcasts') || '[]');
        const items = await base44.entities.AdminBroadcast.filter({ is_active: true }, '-created_date', 10);
        const unseen = items.find(b => !seen.includes(b.id));
        if (unseen) setBroadcast(unseen);
      } catch (e) {}
    };
    // Wait a bit so it doesn't clash with page load
    const t = setTimeout(load, 1500);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    if (!broadcast) return;
    const seen = JSON.parse(localStorage.getItem('seenBroadcasts') || '[]');
    localStorage.setItem('seenBroadcasts', JSON.stringify([...seen, broadcast.id]));
    setBroadcast(null);
  };

  if (!broadcast) return null;

  const cfg = PRIORITY_CONFIG[broadcast.priority] || PRIORITY_CONFIG.info;
  const Icon = cfg.icon;
  const color = broadcast.color || '#06b6d4';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
        onClick={dismiss}
      >
        <motion.div
          initial={{ scale: 0.85, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 260 }}
          className="relative w-full max-w-md rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(8,6,18,0.97)',
            border: `1.5px solid ${cfg.border}`,
            boxShadow: `0 0 60px ${cfg.glow}, 0 24px 64px rgba(0,0,0,0.6)`,
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Top gradient bar */}
          <div className={`h-1 w-full bg-gradient-to-r ${cfg.gradient}`} />

          {/* Background glow */}
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
            style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${cfg.glow}, transparent)` }}
          />

          <div className="relative p-6">
            {/* Close */}
            <button
              onClick={dismiss}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/8 hover:bg-white/15 flex items-center justify-center transition-all text-white/40 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon + label */}
            <div className="flex items-center gap-3 mb-5">
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${cfg.gradient} flex-shrink-0 shadow-lg`}
                style={{ boxShadow: `0 0 20px ${cfg.glow}` }}
              >
                <span className="text-3xl">{broadcast.emoji || '📢'}</span>
              </motion.div>
              <div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-gradient-to-r ${cfg.gradient} text-white`}>
                  {cfg.label}
                </span>
                <h2 className="text-xl font-black text-white mt-1 leading-tight pr-8">{broadcast.title}</h2>
              </div>
            </div>

            {/* Message */}
            <div
              className="rounded-2xl p-4 mb-5 text-sm text-white/80 leading-relaxed"
              style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
            >
              {broadcast.message}
            </div>

            {/* CTA */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={dismiss}
              className={`w-full h-12 rounded-2xl font-black text-white text-sm bg-gradient-to-r ${cfg.gradient} transition-all`}
              style={{ boxShadow: `0 4px 20px ${cfg.glow}` }}
            >
              Verstanden ✓
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}