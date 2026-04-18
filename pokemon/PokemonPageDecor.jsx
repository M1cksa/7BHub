import React from 'react';
import { motion } from 'framer-motion';
import { usePokemonEvent } from './PokemonEventContext';

// Pokémon type color palettes per page
const PAGE_CONFIGS = {
  home: {
    corner: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png', // Dragonite
    accent: '#FFD700',
    label: '✨ 30 Jahre Pokémon',
    cornerLabel: 'Dragonite',
    particles: ['⚡', '🔥', '💧', '🌿', '🔮', '⭐'],
  },
  watch: {
    corner: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png', // Charizard
    accent: '#FF6B00',
    label: '🎬 Schau wie ein Trainer!',
    cornerLabel: 'Charizard',
    particles: ['🔥', '⚡', '🎮', '💫', '🎯'],
  },
  shop: {
    corner: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/36.png', // Clefable
    accent: '#FF69B4',
    label: '🛍 Pokémon Shop Event',
    cornerLabel: 'Clefable',
    particles: ['✨', '🌟', '💎', '🎁', '🪙'],
  },
  profile: {
    corner: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/131.png', // Lapras
    accent: '#00BFFF',
    label: '👤 Trainerprofil',
    cornerLabel: 'Lapras',
    particles: ['💧', '❄️', '🌊', '⭐', '💙'],
  },
  shorts: {
    corner: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/35.png', // Clefairy
    accent: '#FF69B4',
    label: '🎵 Pokémon Shorts',
    cornerLabel: 'Clefairy',
    particles: ['🎵', '✨', '💕', '🌸', '⭐'],
  },
};

export default function PokemonPageDecor({ page = 'home' }) {
  const { isActive } = usePokemonEvent();
  if (!isActive) return null;
  // Only show on desktop to avoid cluttering mobile

  const cfg = PAGE_CONFIGS[page] || PAGE_CONFIGS.home;

  return (
    <>
      {/* Corner Pokémon - Bottom Right – desktop only to avoid overlap on mobile */}
      <motion.div
        className="hidden md:block fixed bottom-28 right-4 z-40 pointer-events-none"
        animate={{ y: [0, -12, 0], rotate: [-3, 3, -3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="relative">
          <img
            src={cfg.corner}
            alt={cfg.cornerLabel}
            className="w-16 h-16 drop-shadow-[0_0_12px_rgba(255,215,0,0.9)]"
            style={{ imageRendering: 'pixelated' }}
          />
          <motion.div
            className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-black rounded-full px-2 py-0.5"
            style={{ background: cfg.accent, color: '#000', fontSize: '9px' }}
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {cfg.cornerLabel}
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}