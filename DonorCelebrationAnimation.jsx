import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Star, Sparkles, Award, Zap } from 'lucide-react';

export default function DonorCelebrationAnimation({ show, onComplete }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!show) return;

    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 3000),
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 5000)
    ];

    return () => timers.forEach(clearTimeout);
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl overflow-hidden"
      >
        {/* Golden Particles Background */}
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-2 h-2 bg-gradient-to-br from-amber-300 to-orange-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, (Math.random() - 0.5) * 50, 0],
              opacity: [0, 1, 0],
              scale: [0, Math.random() * 2, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Confetti Explosion */}
        {phase >= 1 && [...Array(60)].map((_, i) => (
          <motion.div
            key={`confetti-${i}`}
            className="absolute w-3 h-3"
            style={{
              left: '50%',
              top: '50%',
              background: ['#fbbf24', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'][i % 5]
            }}
            initial={{ scale: 0, x: 0, y: 0 }}
            animate={{
              x: (Math.random() - 0.5) * window.innerWidth,
              y: Math.random() * window.innerHeight - window.innerHeight / 2,
              rotate: Math.random() * 720,
              scale: [0, 1, 0.5],
              opacity: [1, 1, 0]
            }}
            transition={{
              duration: 2 + Math.random(),
              ease: "easeOut"
            }}
          />
        ))}

        {/* Main Crown Animation */}
        <div className="relative z-10 text-center px-6">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ 
              scale: phase >= 0 ? 1 : 0, 
              rotate: 0,
              y: phase >= 2 ? [-10, 0, -10] : 0
            }}
            transition={{ 
              type: "spring", 
              duration: 0.8,
              y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="mb-8 relative inline-block"
          >
            {/* Pulsing Glow */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: [
                  '0 0 60px 30px rgba(251, 191, 36, 0.4)',
                  '0 0 100px 50px rgba(251, 191, 36, 0.6)',
                  '0 0 60px 30px rgba(251, 191, 36, 0.4)'
                ],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Crown Icon */}
            <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 flex items-center justify-center shadow-2xl border-4 border-amber-300">
              <Crown className="w-24 h-24 text-white drop-shadow-2xl" />
            </div>

            {/* Orbiting Stars */}
            {[0, 120, 240].map((angle, i) => (
              <motion.div
                key={`orbit-${i}`}
                className="absolute top-1/2 left-1/2"
                style={{ transformOrigin: '0 0' }}
                animate={{
                  rotate: 360
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.2
                }}
              >
                <Star 
                  className="w-8 h-8 text-amber-300 fill-amber-300" 
                  style={{ 
                    transform: `translate(-50%, -50%) translateX(90px) rotate(${-angle}deg)` 
                  }}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 50 }}
            transition={{ delay: 0.5 }}
          >
            <h1 className="text-6xl md:text-8xl font-black mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 drop-shadow-2xl">
                VIP Spender
              </span>
            </h1>
            <div className="flex items-center justify-center gap-4 mb-6">
              <Sparkles className="w-8 h-8 text-amber-400" />
              <p className="text-3xl text-white/90 font-bold">Du bist jetzt Premium!</p>
              <Sparkles className="w-8 h-8 text-amber-400" />
            </div>
          </motion.div>

          {/* Perks List */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: phase >= 2 ? 1 : 0, scale: phase >= 2 ? 1 : 0.8 }}
            transition={{ delay: 1.5 }}
            className="space-y-3 max-w-lg mx-auto"
          >
            {[
              { icon: Zap, text: 'Keine Werbung mehr', color: 'text-cyan-400' },
              { icon: Award, text: 'Exklusive VIP Shop Items', color: 'text-purple-400' },
              { icon: Crown, text: 'Unbegrenzte Tokens', color: 'text-amber-400' }
            ].map((perk, i) => (
              <motion.div
                key={i}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 2 + i * 0.2 }}
                className="flex items-center gap-3 text-white text-xl font-semibold bg-white/10 backdrop-blur-xl rounded-2xl px-6 py-3 border border-white/20"
              >
                <perk.icon className={`w-6 h-6 ${perk.color}`} />
                {perk.text}
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom Sparkles */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 3 ? 1 : 0 }}
            className="mt-8 text-amber-300/70 text-lg font-medium"
          >
            ✨ Vielen Dank für deine Unterstützung! ✨
          </motion.div>
        </div>

        {/* Shooting Stars */}
        {phase >= 1 && [...Array(8)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute w-1 h-20 bg-gradient-to-b from-amber-300 to-transparent"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-50px',
              rotate: '25deg'
            }}
            animate={{
              y: window.innerHeight + 100,
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 1 + Math.random(),
              delay: Math.random() * 3,
              repeat: Infinity,
              repeatDelay: Math.random() * 2
            }}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}