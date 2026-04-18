import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ChevronUp } from 'lucide-react';

export default function LevelUpCelebration() {
  const [show, setShow] = useState(false);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    const handleLevelUp = (e) => {
      setLevel(e.detail.level);
      setShow(true);
      
      // Fire confetti
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#06b6d4', '#8b5cf6', '#f59e0b'],
          zIndex: 9999
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#06b6d4', '#8b5cf6', '#f59e0b'],
          zIndex: 9999
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();

      setTimeout(() => setShow(false), 5000);
    };

    window.addEventListener('level-up', handleLevelUp);
    return () => window.removeEventListener('level-up', handleLevelUp);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          
          <motion.div 
            initial={{ y: 50, scale: 0.9 }}
            animate={{ y: 0, scale: 1 }}
            className="relative z-10 flex flex-col items-center bg-gradient-to-b from-slate-950 via-slate-900 to-black p-8 rounded-3xl border border-cyan-400/50 shadow-[0_0_120px_rgba(6,182,212,0.6),inset_0_0_40px_rgba(217,70,239,0.3)] text-center max-w-sm w-full pointer-events-auto overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] opacity-10 mix-blend-screen pointer-events-none" />
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,rgba(6,182,212,0.15)_50%,transparent_100%)] pointer-events-none z-0" 
            />

            <div className="absolute -top-12 z-20">
              <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 via-fuchsia-500 to-purple-600 rounded-full flex items-center justify-center border-4 border-black shadow-[0_0_30px_rgba(217,70,239,0.8)] animate-pulse">
                <ChevronUp className="w-12 h-12 text-white" strokeWidth={3} />
              </div>
            </div>
            
            <div className="mt-8 mb-4 relative z-10">
              <motion.h2 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-cyan-300 to-purple-400 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]"
              >
                Level Up!
              </motion.h2>
              <p className="text-fuchsia-300 text-sm font-bold mt-2 tracking-widest uppercase">Der Grind zahlt sich aus 🔥</p>
            </div>
            
            <div className="flex items-center gap-4 mb-8 relative z-10">
              <span className="text-4xl font-bold text-white/30 line-through">{level - 1}</span>
              <div className="flex flex-col items-center relative">
                <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full" />
                <div className="h-1.5 w-20 bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                <ChevronUp className="w-8 h-8 text-fuchsia-400 rotate-90 -mt-1 drop-shadow-[0_0_8px_rgba(217,70,239,0.8)]" strokeWidth={3} />
              </div>
              <motion.span 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 10, stiffness: 50, delay: 0.2 }}
                className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-cyan-200 drop-shadow-[0_0_25px_rgba(255,255,255,0.8)]"
              >
                {level}
              </motion.span>
            </div>
            
            <div className="bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 rounded-2xl p-5 w-full border border-cyan-500/30 shadow-[inset_0_0_20px_rgba(6,182,212,0.1)] relative overflow-hidden z-10">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000&auto=format&fit=crop')] opacity-10 bg-cover mix-blend-overlay" />
              <p className="text-base text-cyan-300 font-bold mb-1 relative z-10">🎁 Neue Belohnungen warten!</p>
              <p className="text-sm text-white/70 relative z-10">Hol sie dir jetzt im Battle Pass ab.</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}