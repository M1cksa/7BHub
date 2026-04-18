import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Zap, Star, Rocket } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Version2Banner() {
  const [visible, setVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('v2_banner_dismissed');
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = (e) => {
    e.stopPropagation();
    localStorage.setItem('v2_banner_dismissed', 'true');
    setVisible(false);
  };

  const handleBannerClick = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#7c3aed', '#d946ef', '#ffffff']
    });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.97, filter: 'blur(10px)' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          onClick={handleBannerClick}
          className="relative overflow-hidden rounded-2xl mb-6 cursor-pointer group"
          style={{
            background: 'linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(124,58,237,0.2) 50%, rgba(217,70,239,0.15) 100%)',
            border: '1px solid rgba(6,182,212,0.4)',
            boxShadow: '0 0 40px rgba(124,58,237,0.2), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}
        >
          {/* Animated background shimmer */}
          <motion.div
            className="absolute inset-0 opacity-40 mix-blend-overlay"
            style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)' }}
            animate={{ x: ['-200%', '200%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
          />
          
          {/* Hover glow effect */}
          <motion.div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ background: 'radial-gradient(circle at center, rgba(6,182,212,0.2) 0%, transparent 70%)' }}
          />

          <div className="relative z-10 flex items-center gap-5 px-6 py-5">
            {/* Icon */}
            <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #06b6d4, #7c3aed)', boxShadow: '0 0 20px rgba(6,182,212,0.4)' }}
            >
              <Zap className="w-5 h-5 text-white" />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white font-black text-sm md:text-base">7B Hub 2.0 ist da!</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest"
                  style={{ background: 'linear-gradient(90deg, #06b6d4, #7c3aed)', color: 'white' }}
                >
                  NEU
                </span>
              </div>
              <p className="text-white/50 text-xs md:text-sm mt-0.5">Komplett überarbeitetes Design, neue Animationen & schnellere Performance.</p>
            </div>

            {/* Stars decoration */}
            <div className="hidden md:flex items-center gap-1 shrink-0">
              {[0,1,2].map(i => (
                <motion.div key={i}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, delay: i * 0.4, repeat: Infinity }}
                >
                  <Star className="w-3 h-3 text-cyan-400 fill-cyan-400" />
                </motion.div>
              ))}
            </div>

            {/* Dismiss */}
            <button onClick={dismiss}
              className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}