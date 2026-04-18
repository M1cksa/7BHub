import React, { useState, useEffect } from 'react';
import { X, Heart, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function PreRollDonationAd({ onSkip, canSkip = false }) {
  const [countdown, setCountdown] = useState(5);
  const [particles, setParticles] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('app_user');
    if (stored) {
      try {
        const parsedUser = JSON.parse(stored);
        setUser(parsedUser);
        
        // Skip donation ad for donors
        if (parsedUser?.is_donor) {
          onSkip();
          return;
        }
      } catch (e) {}
    }

    // Generate floating particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 4,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2
    }));
    setParticles(newParticles);

    // Countdown timer
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Don't show for donors
  if (user?.is_donor) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-gradient-to-br from-red-950 via-pink-950 to-purple-950 flex items-center justify-center overflow-hidden">

        {/* Animated Background Particles */}
        {particles.map((particle) =>
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-br from-pink-400 to-red-400 opacity-30 blur-xl"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size
          }}
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }} />

        )}

        {/* Skip Button */}
        {(canSkip || countdown === 0) &&
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={onSkip}
          className="absolute top-6 right-6 z-10 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full text-white font-bold transition-all hover:scale-105 border border-white/20">

            <X className="w-5 h-5 inline mr-2" />
            Überspringen
          </motion.button>
        }

        {/* Countdown Badge */}
        {countdown > 0 &&
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-6 right-6 w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white font-black text-xl shadow-2xl shadow-red-500/50 border-2 border-white/30">

            {countdown}
          </motion.div>
        }

        {/* Main Content */}
        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="mb-8">

            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-red-500 via-pink-500 to-purple-500 flex items-center justify-center shadow-2xl shadow-pink-500/50 border-4 border-white/30 relative">
              <Heart className="w-16 h-16 text-white fill-white animate-pulse" />
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-white/50"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }} />

            </div>
          </motion.div>

          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">

            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-pink-200 to-white">
              Hilf 7B Hub zu überleben!
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-white/90 mb-4 font-medium">

            🚨 Wir benötigen dringend deine Unterstützung
          </motion.p>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-white/70 mb-10 max-w-xl mx-auto leading-relaxed">

            Mit einer Spende von mindestens <span className="text-pink-300 font-bold text-xl">5€</span> hilfst du uns, die Plattform am Laufen zu halten und weiter zu verbessern.
          </motion.p>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center">

            <a
              href="mailto:7bhubofficial@gmail.com"
              className="group">

              <Button
                size="lg"
                className="bg-gradient-to-r from-pink-500 via-red-500 to-pink-500 hover:from-pink-600 hover:via-red-600 hover:to-pink-600 text-white font-black text-lg px-10 py-7 rounded-2xl shadow-2xl shadow-pink-500/50 border-2 border-white/30 transition-all hover:scale-105">

                <Mail className="w-6 h-6 mr-3" />
                Jetzt Kontakt aufnehmen
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 flex items-center justify-center gap-2 text-white/50 text-sm">

            <Sparkles className="w-4 h-4" />
            <span>Vielen Dank für deine Unterstützung!</span>
            <Sparkles className="w-4 h-4" />
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>);

}