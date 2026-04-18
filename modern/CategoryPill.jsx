import React from 'react';
import { motion } from 'framer-motion';

const categoryIcons = {
  all: '🌟',
  gaming: '🎮',
  music: '🎵',
  education: '📚',
  entertainment: '🎬',
  tech: '💻',
  art: '🎨',
  lifestyle: '✨',
  sports: '⚽'
};

// Pokémon sprites that match each category vibe
const categoryPokemon = {
  all:           'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',   // Pikachu
  gaming:        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png',   // Gengar
  music:         'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/40.png',   // Wigglytuff
  education:     'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/65.png',   // Alakazam
  entertainment: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/35.png',   // Clefairy
  tech:          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/81.png',   // Magnemite
  art:           'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/151.png',  // Mew
  lifestyle:     'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png',  // Eevee
  sports:        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/106.png',  // Hitmonlee
};

const categoryColors = {
  all: 'from-cyan-500 via-violet-500 to-fuchsia-500',
  gaming: 'from-purple-500 via-pink-500 to-fuchsia-500',
  music: 'from-pink-500 via-rose-500 to-red-500',
  education: 'from-blue-500 via-cyan-500 to-teal-500',
  entertainment: 'from-orange-500 via-red-500 to-pink-500',
  tech: 'from-cyan-500 via-blue-500 to-indigo-500',
  art: 'from-violet-500 via-purple-500 to-fuchsia-500',
  lifestyle: 'from-emerald-500 via-teal-500 to-cyan-500',
  sports: 'from-green-500 via-emerald-500 to-teal-500'
};

export default function CategoryPill({ category, active, onClick }) {
  const lightweightMode = localStorage.getItem('lightweight_mode') === 'true';

  return (
    <motion.button
      whileHover={lightweightMode ? {} : { scale: 1.08, y: -4 }}
      whileTap={lightweightMode ? {} : { scale: 0.95 }}
      onClick={onClick}
      className={`relative px-6 py-3.5 rounded-2xl font-bold transition-all duration-300 whitespace-nowrap overflow-hidden group ${
        active ? 'text-white shadow-2xl' : 'text-white/70 hover:text-white'
      }`}
    >
      {active && (
        <>
          <motion.div
            layoutId="activeCategory"
            className={`absolute inset-0 rounded-2xl ${category !== 'all' && categoryColors[category] ? 'bg-gradient-to-r ' + categoryColors[category] : ''}`}
            style={category === 'all' || !categoryColors[category] ? { background: 'linear-gradient(to right, var(--theme-primary), var(--theme-secondary))' } : {}}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
          />
          {/* Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
        </>
      )}
      
      <span className="relative flex items-center gap-2.5 z-10">
        {categoryPokemon[category] ? (
          <motion.img
            src={categoryPokemon[category]}
            alt=""
            className="w-7 h-7 object-contain"
            style={{ imageRendering: 'pixelated' }}
            animate={active ? { y: [0, -4, 0], rotate: [0, 8, -8, 0] } : { y: 0 }}
            transition={{ duration: 0.6, repeat: active ? Infinity : 0, repeatDelay: 2 }}
          />
        ) : (
          <motion.span
            className="text-2xl"
            animate={active ? { rotate: [0, 10, -10, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            {categoryIcons[category] || '📁'}
          </motion.span>
        )}
        <span className="capitalize tracking-wide">{category}</span>
      </span>
      
      {!active && (
        <div className="absolute inset-0 bg-white/5 backdrop-blur-xl rounded-2xl ring-2 ring-white/10 group-hover:ring-white/30 group-hover:bg-white/10 transition-all" />
      )}
    </motion.button>
  );
}