import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Season2Banner() {
  const [dismissed, setDismissed] = useState(() =>
    localStorage.getItem('s2_banner_dismissed_v1') === 'true'
  );

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem('s2_banner_dismissed_v1', 'true');
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="relative rounded-2xl overflow-hidden mb-6"
        style={{
          background: 'linear-gradient(135deg, #0a0020 0%, #12003a 40%, #0a001f 100%)',
          border: '1px solid rgba(168,85,247,0.4)',
          boxShadow: '0 0 40px rgba(168,85,247,0.15), inset 0 0 60px rgba(168,85,247,0.05)',
        }}
      >
        {/* Animated glow orbs */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cyan-500/15 rounded-full blur-[60px] pointer-events-none" />

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 z-20 w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/50 hover:text-white transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="relative z-10 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Badge */}
          <div
            className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.25), rgba(6,182,212,0.15))',
              border: '1px solid rgba(168,85,247,0.5)',
              boxShadow: '0 0 20px rgba(168,85,247,0.3)',
            }}
          >
            🌌
          </div>

          <div className="flex-1 min-w-0">
            {/* Label */}
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[10px] font-black px-2 py-0.5 rounded-full tracking-widest uppercase"
                style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.4)', color: '#c084fc' }}
              >
                ✦ Neu
              </span>
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-1.5 h-1.5 rounded-full bg-purple-400"
              />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white mb-1">
              Season 2:{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg, #c084fc, #67e8f9)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Apocalypse
              </span>
            </h3>
            <p className="text-white/50 text-sm">
              Neue Battle Pass Rewards · Apokalypse-Modus · S2 Module · Exklusive Skins
            </p>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Link to={createPageUrl('BattlePass')} className="flex-1 sm:flex-none">
              <button
                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm text-white transition-all hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  boxShadow: '0 0 20px rgba(124,58,237,0.4)',
                }}
              >
                <Zap className="w-4 h-4" />
                Battle Pass
              </button>
            </Link>
            <Link to={createPageUrl('NeonDash')} className="flex-1 sm:flex-none">
              <button
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm text-white/80 hover:text-white transition-all hover:scale-105"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                Spielen <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}