import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Star, Zap } from 'lucide-react';

// ─── Evolution chains ──────────────────────────────────────────────────────────
// Format: { fromId, toId, level, name, statBoost }
export const EVOLUTION_CHAINS = [
  // Pikachu → Raichu
  { fromId: 25,  toId: 26,  level: 16, fromName: 'Pikachu',    toName: 'Raichu',     statBoost: { hp: 1.15, atk: 1.2,  def: 1.15, spd: 1.1  } },
  // Dragonir → Dragoran
  { fromId: 148, toId: 149, level: 20, fromName: 'Dragonir',   toName: 'Dragoran',   statBoost: { hp: 1.3,  atk: 1.4,  def: 1.2,  spd: 1.25 } },
  // Quapsel → Turtok (simplified 1-step)
  { fromId: 60,  toId: 9,   level: 18, fromName: 'Quapsel',    toName: 'Turtok',     statBoost: { hp: 1.4,  atk: 1.3,  def: 1.5,  spd: 1.1  } },
  // Rattfratz → Despotar (thematic)
  { fromId: 19,  toId: 248, level: 22, fromName: 'Rattfratz',  toName: 'Despotar',   statBoost: { hp: 1.6,  atk: 1.7,  def: 1.5,  spd: 1.0  } },
  // Magnetilo → Scherox (thematic)
  { fromId: 81,  toId: 212, level: 20, fromName: 'Magnetilo',  toName: 'Scherox',    statBoost: { hp: 1.5,  atk: 1.7,  def: 1.6,  spd: 1.1  } },
  // Giflor → Bisaflor (thematic grass)
  { fromId: 45,  toId: 3,   level: 25, fromName: 'Giflor',     toName: 'Bisaflor',   statBoost: { hp: 1.3,  atk: 1.25, def: 1.25, spd: 1.1  } },
  // Serpifeu → Bisaflor alt
  { fromId: 497, toId: 3,   level: 30, fromName: 'Serpifeu',   toName: 'Bisaflor',   statBoost: { hp: 1.3,  atk: 1.35, def: 1.2,  spd: 1.15 } },
  // Panferno → Glurak (thematic fire)
  { fromId: 392, toId: 6,   level: 28, fromName: 'Panferno',   toName: 'Glurak',     statBoost: { hp: 1.25, atk: 1.3,  def: 1.2,  spd: 1.2  } },
  // Dragonir → Dragoran chain (same as above for clarity)
  // Quapsel → Impoleon (water alt)
  { fromId: 60,  toId: 395, level: 15, fromName: 'Quapsel',    toName: 'Impoleon',   statBoost: { hp: 1.35, atk: 1.2,  def: 1.45, spd: 1.05 } },
  // Smogmog → Gengar (ghost alt)
  { fromId: 110, toId: 94,  level: 24, fromName: 'Smogmog',    toName: 'Gengar',     statBoost: { hp: 1.2,  atk: 1.4,  def: 1.1,  spd: 1.3  } },
  // Lucario → Knakrack (fighting/dragon)
  { fromId: 448, toId: 445, level: 32, fromName: 'Lucario',    toName: 'Knakrack',   statBoost: { hp: 1.35, atk: 1.4,  def: 1.3,  spd: 1.15 } },
];

// XP needed per level
export function xpForLevel(level) {
  return Math.floor(level * level * 12);
}

// Get evolution for a pokemon at a level
export function checkEvolution(pokeId, level) {
  return EVOLUTION_CHAINS.find(e => e.fromId === pokeId && level >= e.level) || null;
}

// XP gained from a battle (based on enemy stats)
export function xpFromBattle(enemyPoke, wave = 1) {
  const base = Math.floor((enemyPoke.atk + enemyPoke.def + enemyPoke.hp / 2) / 3);
  return Math.max(20, Math.floor(base * (0.8 + wave * 0.1)));
}

// ─── XP Bar component ──────────────────────────────────────────────────────────
export function XPBar({ currentXP, level, small = false }) {
  const needed = xpForLevel(level + 1);
  const pct = Math.min(100, (currentXP / needed) * 100);
  return (
    <div className={small ? 'space-y-0.5' : 'space-y-1'}>
      {!small && (
        <div className="flex justify-between text-[10px] text-white/40 font-bold">
          <span>Lv.{level}</span>
          <span>{currentXP}/{needed} EP</span>
        </div>
      )}
      <div className={`w-full bg-black/30 rounded-full overflow-hidden ${small ? 'h-1' : 'h-2'}`}>
        <motion.div className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg,#60a5fa,#818cf8)', width: `${pct}%` }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, type: 'spring' }} />
      </div>
      {small && <span className="text-[8px] text-white/30">Lv.{level}</span>}
    </div>
  );
}

// ─── Level-Up notification ────────────────────────────────────────────────────
export function LevelUpNotif({ pokemon, newLevel, onDismiss }) {
  useEffect(() => { const t = setTimeout(onDismiss, 3500); return () => clearTimeout(t); }, []);
  return (
    <motion.div
      initial={{ y: -60, opacity: 0, scale: 0.8 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -60, opacity: 0, scale: 0.8 }}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-blue-800 to-indigo-800 border-2 border-blue-400/60 rounded-2xl px-5 py-3 shadow-2xl shadow-blue-500/30 text-center">
      <div className="flex items-center gap-3">
        <TrendingUp className="w-5 h-5 text-blue-300" />
        <div>
          <p className="text-[10px] text-blue-300 uppercase font-bold tracking-wider">Level Up!</p>
          <p className="text-white font-black text-sm">{pokemon.name} ist jetzt Level {newLevel}!</p>
        </div>
        <TrendingUp className="w-5 h-5 text-blue-300" />
      </div>
    </motion.div>
  );
}

// ─── Evolution screen ─────────────────────────────────────────────────────────
export function EvolutionScreen({ fromPoke, chain, onComplete }) {
  const [phase, setPhase] = useState('intro'); // intro → flash → reveal → done
  const spriteBase = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('flash'), 1000),
      setTimeout(() => setPhase('reveal'), 2800),
      setTimeout(() => setPhase('done'), 4200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black text-white">
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-6">
            <p className="text-blue-300 font-bold text-lg animate-pulse">Was ist das?!</p>
            <motion.img
              src={`${spriteBase}/${fromPoke.id}.png`} alt={fromPoke.name}
              style={{ imageRendering: 'pixelated', width: 120, height: 120 }}
              animate={{ scale: [1, 1.05, 1], y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 1.2 }} />
            <p className="text-white/60 text-sm">{fromPoke.name} entwickelt sich…</p>
          </motion.div>
        )}

        {phase === 'flash' && (
          <motion.div key="flash" className="relative">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div key={i} className="absolute inset-0 rounded-full bg-white"
                animate={{ scale: [0, 6], opacity: [1, 0] }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut' }} />
            ))}
            <motion.img
              src={`${spriteBase}/${fromPoke.id}.png`} alt={fromPoke.name}
              style={{ imageRendering: 'pixelated', width: 120, height: 120, filter: 'brightness(10)' }}
              animate={{ rotate: [0, 360], scale: [1, 0.1] }}
              transition={{ duration: 1.5 }} />
          </motion.div>
        )}

        {phase === 'reveal' && (
          <motion.div key="reveal" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }} className="text-center space-y-4">
            <motion.div
              animate={{ boxShadow: ['0 0 40px #60a5fa', '0 0 80px #818cf8', '0 0 40px #60a5fa'] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="rounded-full p-4 inline-block">
              <img src={`${spriteBase}/${chain.toId}.png`} alt={chain.toName}
                style={{ imageRendering: 'pixelated', width: 140, height: 140 }} />
            </motion.div>
            <p className="text-white font-black text-2xl">{chain.toName}!</p>
          </motion.div>
        )}

        {phase === 'done' && (
          <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6 px-6">
            <div className="flex items-center justify-center gap-6">
              <div className="text-center opacity-50">
                <img src={`${spriteBase}/${fromPoke.id}.png`} alt={chain.fromName}
                  style={{ imageRendering: 'pixelated', width: 80, height: 80, filter: 'grayscale(1)' }} />
                <p className="text-white/50 text-xs mt-1">{chain.fromName}</p>
              </div>
              <div className="text-3xl">→</div>
              <div className="text-center">
                <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                  <img src={`${spriteBase}/${chain.toId}.png`} alt={chain.toName}
                    style={{ imageRendering: 'pixelated', width: 100, height: 100 }} />
                </motion.div>
                <p className="text-white font-black text-sm mt-1">{chain.toName}</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm">
              <p className="text-white/60 mb-2 font-bold text-xs uppercase tracking-widest">Neue Werte:</p>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[['❤️', 'HP', chain.statBoost.hp], ['⚔️', 'ATK', chain.statBoost.atk], ['🛡', 'DEF', chain.statBoost.def], ['💨', 'SPD', chain.statBoost.spd]].map(([ic, label, boost]) => (
                  <div key={label} className="bg-black/30 rounded-xl py-2">
                    <div className="text-lg">{ic}</div>
                    <div className="text-white/50 text-[9px]">{label}</div>
                    <div className="text-green-400 font-black text-xs">+{Math.floor((boost - 1) * 100)}%</div>
                  </div>
                ))}
              </div>
            </div>

            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={onComplete}
              className="w-full py-3 rounded-2xl font-black text-black text-base"
              style={{ background: 'linear-gradient(135deg,#fbbf24,#f97316)' }}>
              <Star className="inline w-5 h-5 mr-2" />
              Weiter!
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Particle stars */}
      {phase === 'reveal' && Array.from({ length: 16 }).map((_, i) => (
        <motion.div key={i} className="absolute text-yellow-300 text-xl pointer-events-none"
          style={{ left: `${10 + (i % 5) * 20}%`, top: `${10 + Math.floor(i / 5) * 25}%` }}
          animate={{ opacity: [0, 1, 0], y: [-20, -60], scale: [0.5, 1.5, 0] }}
          transition={{ duration: 1.5, delay: i * 0.1, repeat: Infinity, repeatDelay: 0.8 }}>
          ✨
        </motion.div>
      ))}
    </div>
  );
}