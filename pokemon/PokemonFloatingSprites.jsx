/**
 * Minimal floating Pokémon – just 1 at a time, slowly drifting.
 * Much less chaotic than before. Easter eggs live in PokemonEasterEggs.jsx.
 */
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const POKEMON = [
  { name: 'Bisasam',   sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png' },
  { name: 'Glumanda',  sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png' },
  { name: 'Schiggy',   sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png' },
  { name: 'Pikachu',   sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png' },
  { name: 'Relaxo',    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png' },
  { name: 'Dratini',   sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/147.png' },
  { name: 'Mew',       sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/151.png' },
  { name: 'Togepi',    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/175.png' },
  { name: 'Espeon',    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/196.png' },
  { name: 'Absol',     sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/359.png' },
  { name: 'Lucario',   sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/448.png' },
  { name: 'Togekiss',  sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/468.png' },
];

function FloatingSprite({ pokemon, uid, startX, duration }) {
  const drift = (Math.random() > 0.5 ? 1 : -1) * (20 + Math.random() * 40);
  return (
    <motion.div
      className="fixed pointer-events-none select-none"
      style={{ zIndex: 30, left: startX, bottom: 0 }}
      initial={{ y: 0, opacity: 0 }}
      animate={{ y: '-105vh', opacity: [0, 0.85, 0.85, 0], x: [0, drift, drift * 0.4, 0] }}
      transition={{ duration, ease: 'easeInOut' }}
    >
      <div className="flex flex-col items-center gap-1">
        <img
          src={pokemon.sprite}
          alt={pokemon.name}
          style={{ imageRendering: 'pixelated', width: 40, height: 40 }}
          className="drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]"
        />
        <span className="text-yellow-300 font-bold" style={{ fontSize: 8, textShadow: '0 0 6px rgba(255,200,0,0.8)' }}>
          {pokemon.name}
        </span>
      </div>
    </motion.div>
  );
}

import { usePokemonEvent } from './PokemonEventContext';

export default function PokemonFloatingSprites() {
  const { isActive } = usePokemonEvent();
  const [sprites, setSprites] = useState([]);

  useEffect(() => {
    const spawn = () => {
      const p = POKEMON[Math.floor(Math.random() * POKEMON.length)];
      const uid = Date.now() + Math.random();
      // Space Pokémon evenly across screen instead of random positions
      const screenSegments = 4;
      const segmentWidth = window.innerWidth / screenSegments;
      const segment = Math.floor(Math.random() * screenSegments);
      const startX = segment * segmentWidth + (Math.random() * (segmentWidth - 80));
      const duration = 10 + Math.random() * 6;
      setSprites(prev => [...prev.slice(-2), { ...p, uid, startX, duration }]);
      setTimeout(() => setSprites(prev => prev.filter(s => s.uid !== uid)), (duration + 1) * 1000);
    };

    const isMobile = window.innerWidth < 768;
    if (isMobile) return; // No floating sprites on mobile – too cluttered

    spawn();
    // One every 18s – calm and rare
    const iv = setInterval(spawn, 18000);
    return () => clearInterval(iv);
  }, []);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 30 }}>
      <AnimatePresence>
        {sprites.map(s => (
          <FloatingSprite key={s.uid} pokemon={s} uid={s.uid} startX={s.startX} duration={s.duration} />
        ))}
      </AnimatePresence>
    </div>
  );
}