import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePokemonEvent } from './PokemonEventContext';
import PokemonRewardClaim from './PokemonRewardClaim';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const GENERATIONS = [
  { gen: 'I',   year: '1996', color: '#FF1744', pokemon: [1, 4, 7, 25, 150, 151] },
  { gen: 'II',  year: '1999', color: '#FF6D00', pokemon: [155, 158, 152, 245, 249, 250] },
  { gen: 'III', year: '2002', color: '#AA00FF', pokemon: [255, 258, 252, 384, 382, 383] },
  { gen: 'IV',  year: '2006', color: '#2962FF', pokemon: [390, 393, 387, 445, 448, 487] },
  { gen: 'V',   year: '2010', color: '#00BCD4', pokemon: [495, 498, 501, 643, 644, 646] },
  { gen: 'VI+', year: '2013+',color: '#00C853', pokemon: [650, 653, 656, 717, 718, 700] },
];

const GEN1_STARTERS = [
  { id: 1,   src: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',   name: 'Bisasam' },
  { id: 4,   src: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png',   name: 'Glumanda' },
  { id: 7,   src: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png',   name: 'Schiggy' },
  { id: 25,  src: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',  name: 'Pikachu' },
  { id: 150, src: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png', name: 'Mewtu' },
  { id: 151, src: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/151.png', name: 'Mew' },
];

function TypeBadge({ label, color }) {
  return (
    <span className="px-2 py-0.5 rounded-full text-black text-xs font-black" style={{ background: color }}>
      {label}
    </span>
  );
}

export default function PokemonHomeBanner({ user }) {
  const { isActive } = usePokemonEvent();
  const [tab, setTab] = useState('celebrate'); // 'celebrate' | 'gens' | 'claim'

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative overflow-hidden rounded-3xl my-6"
      style={{
        background: 'linear-gradient(135deg, #0a0018 0%, #120530 40%, #0a1a30 70%, #0a0018 100%)',
        border: '2px solid rgba(255,215,0,0.35)',
        boxShadow: '0 0 80px rgba(255,215,0,0.18), 0 0 160px rgba(255,107,0,0.08), inset 0 0 80px rgba(255,215,0,0.03)',
      }}
    >
      <style>{`
        @keyframes pokeTextShimmer { 0%{background-position:0%} 100%{background-position:200%} }
        @keyframes pokeGlowPulse   { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes pokeOrbit { from{transform:rotate(0deg) translateX(180px) rotate(0deg)} to{transform:rotate(360deg) translateX(180px) rotate(-360deg)} }
      `}</style>

      {/* Pokédex scanline overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 1px, transparent 1px, transparent 4px)' }}
      />

      {/* Rotating decorative pokéball */}
      <motion.div
        className="absolute -right-32 -top-32 w-80 h-80 rounded-full opacity-[0.04]"
        style={{ border: '50px solid #FFD700' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute -left-20 -bottom-20 w-60 h-60 rounded-full opacity-[0.04]"
        style={{ border: '40px solid #FF1744' }}
        animate={{ rotate: -360 }}
        transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
      />

      {/* Pokémon orbiting decoration (desktop only) */}
      <div className="absolute inset-0 pointer-events-none hidden lg:block overflow-hidden">
        {[149, 248, 373].map((id, i) => (
          <motion.img
            key={id}
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
            alt=""
            style={{
              imageRendering: 'pixelated',
              width: 40,
              height: 40,
              position: 'absolute',
              top: '50%',
              left: '50%',
              opacity: 0.15,
              filter: 'drop-shadow(0 0 6px rgba(255,215,0,0.5))',
            }}
            animate={{ rotate: [i * 120, i * 120 + 360] }}
            transition={{ duration: 30 + i * 10, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </div>

      <div className="relative z-10 p-5 md:p-8">

        {/* Header */}
        <div className="flex flex-col gap-3 mb-6">
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="flex items-center gap-3 mb-1">
              <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"
                alt="" style={{ imageRendering: 'pixelated', width: 32, height: 32 }}
                className="drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]"
              />
              <span
                className="text-2xl md:text-5xl font-black tracking-tight"
                style={{
                  background: 'linear-gradient(90deg, #FFD700, #FF6B00, #FF1744, #FFD700)',
                  backgroundSize: '300% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'pokeTextShimmer 4s linear infinite',
                }}
              >
                30 JAHRE
              </span>
              <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"
                alt="" style={{ imageRendering: 'pixelated', width: 32, height: 32, transform: 'scaleX(-1)' }}
                className="drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]"
              />
            </div>
            <p className="text-white/50 text-xs md:text-base">
              Seit 1996 auf Abenteuer – Danke für drei unglaubliche Jahrzehnte! 🎉
            </p>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2">
            {[
              { key: 'celebrate', label: '🎉 Feier' },
              { key: 'gens', label: '📖 Generationen' },
              { key: 'claim', label: '🎁 Belohnung' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: tab === t.key ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${tab === t.key ? 'rgba(255,215,0,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  color: tab === t.key ? '#FFD700' : 'rgba(255,255,255,0.5)',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab: Celebrate */}
        <AnimatePresence mode="wait">
          {tab === 'celebrate' && (
            <motion.div key="celebrate" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {/* Starter grid */}
              <div className="grid grid-cols-3 md:flex md:justify-center gap-3 md:gap-6 mb-6">
                {GEN1_STARTERS.map((p, i) => (
                  <motion.div
                    key={p.id}
                    className="flex flex-col items-center gap-1 cursor-pointer group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ scale: 1.25, y: -10 }}
                  >
                    <motion.img
                      src={p.src}
                      alt={p.name}
                      style={{ imageRendering: 'pixelated', width: 56, height: 56, filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.7))' }}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
                    />
                    <span className="text-yellow-400 text-xs font-bold opacity-70 group-hover:opacity-100 transition-opacity"
                      style={{ textShadow: '0 0 6px rgba(255,215,0,0.5)' }}>
                      {p.name}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Year milestones */}
              <div className="flex justify-center gap-2 flex-wrap">
                {[
                  { year: '1996', label: 'Gen I', icon: '🔴' },
                  { year: '2006', label: '10 Jahre', icon: '🎂' },
                  { year: '2016', label: '20 Jahre', icon: '🌟' },
                  { year: '2026', label: '30 Jahre', icon: '🏆', highlight: true },
                ].map((m, i) => (
                  <motion.div
                    key={m.year}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1, type: 'spring', bounce: 0.4 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black"
                    style={{
                      background: m.highlight
                        ? 'linear-gradient(135deg, #FFD700, #FF6B00)'
                        : 'rgba(255,255,255,0.06)',
                      color: m.highlight ? '#000' : '#FFD700',
                      border: `1px solid ${m.highlight ? 'transparent' : 'rgba(255,215,0,0.25)'}`,
                      boxShadow: m.highlight ? '0 0 20px rgba(255,215,0,0.4)' : 'none',
                    }}
                  >
                    <span>{m.icon}</span>
                    <span>{m.year}</span>
                    <span className="opacity-60 font-normal">{m.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Tab: Generations */}
          {tab === 'gens' && (
            <motion.div key="gens" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {GENERATIONS.map((g, gi) => (
                  <motion.div
                    key={g.gen}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: gi * 0.06 }}
                    className="rounded-xl p-3 flex flex-col gap-2"
                    style={{
                      background: `linear-gradient(135deg, ${g.color}18, ${g.color}08)`,
                      border: `1px solid ${g.color}40`,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-black text-white/90 text-sm">Gen {g.gen}</span>
                      <span className="text-white/40 text-xs">{g.year}</span>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {g.pokemon.slice(0, 3).map(id => (
                        <img
                          key={id}
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
                          alt=""
                          style={{ imageRendering: 'pixelated', width: 32, height: 32 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Tab: Claim */}
          {tab === 'claim' && (
            <motion.div key="claim" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {user
                ? <PokemonRewardClaim user={user} />
                : <p className="text-center text-white/40 py-8">Melde dich an, um deine Belohnung zu erhalten!</p>
              }
            </motion.div>
          )}
        </AnimatePresence>

        {/* Link to full page */}
        <div className="mt-4 text-center">
          <Link to={createPageUrl('Pokemon30')}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="text-xs font-bold px-4 py-2 rounded-xl"
              style={{ background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.3)', color: '#FFD700' }}
            >
              🎉 Zur 30-Jahre-Jubiläumsseite →
            </motion.button>
          </Link>
        </div>

      </div>

      {/* Pokédex color bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 flex">
        <div className="flex-1 bg-red-600" />
        <div className="w-12 bg-yellow-400" />
        <div className="flex-1 bg-blue-700" />
      </div>
    </motion.div>
  );
}