import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'cost_reduction_notice_seen_v1';

export default function CostReductionNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show for existing logged-in users who haven't seen this yet
    const alreadySeen = localStorage.getItem(STORAGE_KEY);
    if (alreadySeen) return;
    const user = localStorage.getItem('app_user');
    if (!user) return; // not logged in / new visitor
    // Small delay so it doesn't pop up instantly on load
    const t = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible &&
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="fixed inset-x-4 bottom-24 z-[9999] max-w-md mx-auto md:bottom-8 md:right-6 md:left-auto md:inset-x-auto"
        style={{ bottom: 'calc(5.5rem + env(safe-area-inset-bottom))' }}>

          <div className="glass-card rounded-2xl border border-white/20 p-5 shadow-2xl">
            <button
            onClick={dismiss}
            className="absolute top-3 right-3 text-white/40 hover:text-white/80 transition-colors">

              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/30 to-fuchsia-500/30 border border-white/10 flex items-center justify-center text-lg">
                📢
              </div>
              <div>
                <p className="text-white font-semibold text-sm mb-1">7B Hub 2.0 – Update für dich</p>
                <p className="text-white/70 text-xs leading-relaxed">7B Hub 2.0 hat erfolgreich einen Prozess der Kostensenkung durchlaufen – die Plattform bleibt kostenlos und unabhängig. 🎉

Dennoch freuen ich mich weiterhin über jede Unterstützung durch freiwillige Spenden. Danke, dass du dabei bist! 

              </p>
                <div className="flex items-center gap-2 mt-3">
                  <Link
                  to="/Donate"
                  onClick={dismiss}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-600 to-rose-500 text-white text-xs font-semibold hover:opacity-90 transition-opacity">

                    <Heart className="w-3 h-3" /> Unterstützen
                  </Link>
                  <button
                  onClick={dismiss}
                  className="px-3 py-1.5 rounded-lg border border-white/15 text-white/60 text-xs hover:text-white/90 hover:border-white/30 transition-colors">

                    Verstanden
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      }
    </AnimatePresence>);

}