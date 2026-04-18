import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePokemonEvent } from './PokemonEventContext';

const INTRO_KEY = 'pokemon_30_intro_shown_v2';

const LEGENDARY_SPRITES = [
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/249.png', // Lugia
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/250.png', // Ho-Oh
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/384.png', // Rayquaza
];

export default function PokemonCinematicIntro({ onDone }) {
  const { isActive } = usePokemonEvent();
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState(0); // 0=logo, 1=text, 2=legendary, 3=bye

  useEffect(() => {
    if (!isActive) { onDone?.(); return; }
    if (localStorage.getItem(INTRO_KEY)) { onDone?.(); return; }
    setVisible(true);

    const timers = [
      setTimeout(() => setPhase(1), 800),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 4000),
      setTimeout(() => {
        setVisible(false);
        localStorage.setItem(INTRO_KEY, '1');
        onDone?.();
      }, 5200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  if (!visible) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: phase < 3 ? 1 : 0 }}
      transition={{ duration: 0.6 }}
      style={{
        background: 'radial-gradient(ellipse at center, #1a0a2e 0%, #000000 100%)',
      }}
    >
      <style>{`
        @keyframes pokeStarField {
          0%  { transform: translateY(0); opacity: 0.6; }
          100%{ transform: translateY(-40px); opacity: 0; }
        }
        @keyframes goldShimmer {
          0%   { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.1,
              animation: `pokeStarField ${2 + Math.random() * 3}s ease-in-out infinite alternate`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Pokéball silhouette bg */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full border-[60px] border-white/5"
        initial={{ scale: 0, rotate: 0 }}
        animate={{ scale: 1.6, rotate: 30, opacity: [0, 0.08, 0] }}
        transition={{ duration: 5, ease: 'easeInOut' }}
      />

      {/* Phase 0: Pokéball */}
      <AnimatePresence>
        {phase === 0 && (
          <motion.div
            key="pokeball"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-32 h-32"
          >
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_40px_rgba(255,50,50,0.8)]">
              <circle cx="50" cy="50" r="48" fill="#CC0000" stroke="#111" strokeWidth="3"/>
              <path d="M2 50 Q2 98 50 98 Q98 98 98 50 Z" fill="#f5f5f5"/>
              <rect x="2" y="47" width="96" height="6" fill="#111"/>
              <circle cx="50" cy="50" r="15" fill="#f5f5f5" stroke="#111" strokeWidth="3"/>
              <circle cx="50" cy="50" r="8" fill="white" stroke="#111" strokeWidth="2"/>
            </svg>
          </motion.div>
        )}

        {/* Phase 1: Title */}
        {phase >= 1 && phase < 3 && (
          <motion.div
            key="title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.7 }}
            className="text-center px-6"
          >
            <motion.div
              className="text-5xl md:text-7xl font-black tracking-tight mb-3"
              style={{
                background: 'linear-gradient(90deg, #FFD700, #FF6B00, #FF1744, #FFD700)',
                backgroundSize: '300% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'goldShimmer 3s linear infinite',
              }}
            >
              POKÉMON
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="text-2xl md:text-3xl font-bold text-white/80 mb-2"
            >
              feiert <span className="text-yellow-400 font-black">30 Jahre</span> ✨
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-white/40 text-base"
            >
              1996 – 2026 · Gotta Catch 'Em All
            </motion.p>
          </motion.div>
        )}

        {/* Phase 2: Legendary parade */}
        {phase === 2 && (
          <motion.div
            key="legendaries"
            className="flex items-end gap-8 absolute bottom-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {LEGENDARY_SPRITES.map((src, i) => (
              <motion.img
                key={i}
                src={src}
                alt=""
                className="drop-shadow-[0_0_16px_rgba(255,215,0,0.9)]"
                style={{ imageRendering: 'pixelated', width: 72, height: 72 }}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: [100, -16, 0], opacity: 1 }}
                transition={{ delay: i * 0.2, duration: 0.6, ease: 'easeOut' }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip */}
      <button
        onClick={() => {
          setVisible(false);
          localStorage.setItem(INTRO_KEY, '1');
          onDone?.();
        }}
        className="absolute bottom-6 right-6 text-white/30 text-xs hover:text-white/60 transition-colors"
      >
        Überspringen →
      </button>
    </motion.div>
  );
}