/**
 * Decorations shown site-wide when user has a Pokémon theme active.
 * Adds corner sprites, glowing dividers, and subtle Pokémon-themed accents.
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const POKEMON_THEMES = ['gold', 'ocean', 'volcanic', 'forest', 'dark_neon', 'royal'];

// Theme → Pokémon mapping
const THEME_POKEMON = {
  gold:      { id: 25,  name: 'Pikachu',   sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png' },
  ocean:     { id: 131, name: 'Lapras',     sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/131.png' },
  volcanic:  { id: 6,   name: 'Charizard',  sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png' },
  forest:    { id: 3,   name: 'Bisaflor',   sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png' },
  dark_neon: { id: 26,  name: 'Raichu',     sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/26.png' },
  royal:     { id: 94,  name: 'Gengar',     sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png' },
};

const CORNER_POKEMON = [
  { id: 1,   name: 'Bisasam',  sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png' },
  { id: 4,   name: 'Glumanda', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png' },
  { id: 7,   name: 'Schiggy',  sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png' },
  { id: 25,  name: 'Pikachu',  sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png' },
  { id: 39,  name: 'Pummeluff',sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png' },
  { id: 52,  name: 'Mauzi',    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/52.png' },
  { id: 133, name: 'Evoli',    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png' },
  { id: 151, name: 'Mew',      sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/151.png' },
];

function CornerPokemon({ pokemon, corner }) {
  const [hovered, setHovered] = useState(false);

  const posStyle = {
    'top-left':     { top: 72, left: 8 },
    'top-right':    { top: 72, right: 8 },
    'bottom-left':  { bottom: 80, left: 8 },
    'bottom-right': { bottom: 80, right: 8 },
  }[corner] || { top: 72, left: 8 };

  return (
    <motion.div
      className="fixed pointer-events-auto z-50 cursor-pointer"
      style={posStyle}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 0.85, scale: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <motion.div
        animate={hovered ? { y: -6, rotate: [0, -10, 10, 0] } : { y: [0, -3, 0] }}
        transition={hovered ? { duration: 0.4 } : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="flex flex-col items-center"
      >
        <img
          src={pokemon.sprite}
          alt={pokemon.name}
          style={{ imageRendering: 'pixelated', width: 36, height: 36 }}
          className="drop-shadow-[0_0_10px_rgba(255,215,0,0.7)]"
        />
        <AnimatePresence>
          {hovered && (
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="text-yellow-300 font-bold text-[9px] mt-0.5 bg-black/60 px-1.5 py-0.5 rounded-full"
            >
              {pokemon.name}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

import { usePokemonEvent } from './PokemonEventContext';

export default function PokemonThemeDecorations() {
  const { isActive } = usePokemonEvent();
  const [activeTheme, setActiveTheme] = useState(null);
  const [corners, setCorners] = useState([]);

  useEffect(() => {
    const load = () => {
      try {
        const stored = localStorage.getItem('app_user');
        if (stored) {
          const u = JSON.parse(stored);
          const theme = u.active_theme;
          if (POKEMON_THEMES.includes(theme)) {
            setActiveTheme(theme);
            // Pick 4 unique corner Pokémon
            const shuffled = [...CORNER_POKEMON].sort(() => Math.random() - 0.5);
            const picks = shuffled.slice(0, 4);
            setCorners([
              { ...picks[0], corner: 'top-left' },
              { ...picks[1], corner: 'top-right' },
              { ...picks[2], corner: 'bottom-left' },
              { ...picks[3], corner: 'bottom-right' },
            ]);
          } else {
            setActiveTheme(null);
            setCorners([]);
          }
        }
      } catch (e) { /* ignore */ }
    };

    load();
    window.addEventListener('user-updated', load);
    return () => window.removeEventListener('user-updated', load);
  }, []);

  if (!activeTheme || !isActive) return null;

  const themePokemon = THEME_POKEMON[activeTheme];

  return (
    <>
      {/* Corner Pokémon */}
      {corners.map(c => (
        <CornerPokemon key={c.corner} pokemon={c} corner={c.corner} />
      ))}

      {/* Theme Pokémon badge – bottom center */}
      <motion.div
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.6, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <div className="flex flex-col items-center gap-1">
          <motion.img
            src={themePokemon.sprite}
            alt={themePokemon.name}
            style={{ imageRendering: 'pixelated', width: 28, height: 28 }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]"
          />
          <span className="text-yellow-300 text-[8px] font-bold opacity-80">{themePokemon.name}</span>
        </div>
      </motion.div>

      {/* Pokéball watermark top-center */}
      <motion.div
        className="fixed top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none select-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.04 }}
        transition={{ delay: 0.8 }}
      >
        <div className="text-[120px]">⚪</div>
      </motion.div>
    </>
  );
}