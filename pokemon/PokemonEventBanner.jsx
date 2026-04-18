import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { usePokemonEvent } from './PokemonEventContext';

const POKEBALL_SVG = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="white" stroke="#333" stroke-width="4"/><path d="M2 50 Q2 2 50 2 Q98 2 98 50 Z" fill="#FF1744"/><rect x="2" y="47" width="96" height="6" fill="#333"/><circle cx="50" cy="50" r="12" fill="white" stroke="#333" stroke-width="4"/><circle cx="50" cy="50" r="6" fill="white"/></svg>`)}`;

export default function PokemonEventBanner() {
  const { isActive, eventData } = usePokemonEvent();
  const [dismissed, setDismissed] = useState(false);

  if (!isActive || dismissed) return null;

  return (
    <motion.div
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -80, opacity: 0 }}
      className="relative overflow-hidden"
      style={{ position: 'relative', zIndex: 40 }}
      style={{
        background: 'linear-gradient(135deg, #FFD700 0%, #FF6B00 30%, #FF1744 60%, #FFD700 100%)',
        backgroundSize: '300% 100%',
        animation: 'pokeBannerShift 4s ease infinite',
      }}
    >
      <style>{`
        @keyframes pokeBannerShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pokeSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Pokéball pattern bg */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("${POKEBALL_SVG}")`,
        backgroundSize: '60px 60px',
        backgroundRepeat: 'repeat',
      }} />

      <div className="relative flex items-center justify-between px-4 py-2 max-w-[1920px] mx-auto">
        <div className="flex items-center gap-3 flex-1">
          <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"
            alt="Pikachu"
            className="w-10 h-10 drop-shadow-lg"
            style={{ imageRendering: 'pixelated', animation: 'pokeSpin 4s linear infinite' }}
          />
          <div className="flex flex-col">
            <span className="text-black font-black text-sm md:text-base tracking-wide drop-shadow">
              🎉 POKÉMON 30 JAHRE JUBILÄUM! 🎉
            </span>
            <span className="text-black/80 text-xs font-medium hidden md:block">
              {eventData?.message || '3 Jahrzehnte Abenteuer, Freundschaft und Pokémon-Kämpfe!'}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2 ml-4">
            {['https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
              'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png',
              'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png'].map((src, i) => (
              <img key={i} src={src} alt="" className="w-8 h-8" style={{ imageRendering: 'pixelated' }} />
            ))}
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 transition-colors flex-shrink-0 ml-2"
        >
          <X className="w-4 h-4 text-black" />
        </button>
      </div>
    </motion.div>
  );
}