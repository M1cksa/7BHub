import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function getSprite(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

// ─── Catch Rate Calculation ───────────────────────────────────────────────────
export function calcCatchRate(enemyPoke, enemyHP, enemyMaxHP, ballType = 'pokeball') {
  const hpFactor = 1 - (enemyHP / enemyMaxHP) * 0.7; // Lower HP = easier catch
  const ballBonus = ballType === 'greatball' ? 1.5 : ballType === 'ultraball' ? 2.0 : 1.0;
  const baseCatch = 0.25 + hpFactor * 0.4; // 25–65% base
  return Math.min(0.85, baseCatch * ballBonus);
}

// ─── Ball items ───────────────────────────────────────────────────────────────
export const BALL_ITEMS = [
  { id: 'pokeball',  name: 'Pokéball',   icon: '🔴', cost: 80,  catchBonus: 1.0 },
  { id: 'greatball', name: 'Superball',  icon: '🔵', cost: 200, catchBonus: 1.5 },
  { id: 'ultraball', name: 'Hyperball',  icon: '⚫', cost: 400, catchBonus: 2.0 },
];

// ─── Catch Animation Component ────────────────────────────────────────────────
export function CatchAnimation({ pokemon, success, onComplete }) {
  const [phase, setPhase] = useState('throw'); // throw → shake → result

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('shake'), 800);
    const t2 = setTimeout(() => setPhase('result'), 2800);
    const t3 = setTimeout(onComplete, 4000);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, []);

  return (
    <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        {phase === 'throw' && (
          <motion.div key="throw" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center space-y-4">
            <img src={getSprite(pokemon.id)} alt={pokemon.name}
              style={{ imageRendering: 'pixelated', width: 100, height: 100, margin: '0 auto' }} />
            <motion.div
              initial={{ x: -80, y: 40, scale: 0.5, opacity: 0 }}
              animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.4, duration: 0.7 }}
              className="text-6xl">
              🔴
            </motion.div>
            <p className="text-white/60 text-sm">Ball wird geworfen…</p>
          </motion.div>
        )}

        {phase === 'shake' && (
          <motion.div key="shake" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center space-y-6">
            <motion.div
              animate={{ rotate: [-15, 15, -10, 10, -5, 5, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 2, times: [0, 0.2, 0.4, 0.6, 0.7, 0.85, 1] }}
              className="text-7xl">🔴</motion.div>
            <p className="text-white/60 text-sm">
              {['Der Ball wackelt…', '…und wackelt…', '…noch einmal…'][Math.floor(Date.now() / 1000) % 3]}
            </p>
          </motion.div>
        )}

        {phase === 'result' && (
          <motion.div key="result" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }} className="text-center space-y-4">
            {success ? (
              <>
                <motion.div className="text-7xl"
                  animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.8 }}>⭐</motion.div>
                <div>
                  <p className="text-yellow-400 font-black text-2xl">Fangversuch erfolgreich!</p>
                  <p className="text-white/60 text-sm mt-1">{pokemon.name} wurde gefangen!</p>
                </div>
                {/* Stars */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div key={i} className="absolute text-yellow-300 text-lg pointer-events-none"
                    style={{ left: `${20 + (i % 4) * 20}%`, top: `${20 + Math.floor(i / 4) * 30}%` }}
                    animate={{ opacity: [0, 1, 0], y: [0, -40], scale: [0.5, 1.2, 0] }}
                    transition={{ duration: 1.2, delay: i * 0.1 }}>✨</motion.div>
                ))}
              </>
            ) : (
              <>
                <motion.div className="text-7xl"
                  animate={{ x: [0, -10, 10, 0], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 0.5, repeat: 2 }}>💨</motion.div>
                <div>
                  <p className="text-red-400 font-black text-xl">Ausgebrochen!</p>
                  <p className="text-white/50 text-sm mt-1">{pokemon.name} ist entkommen!</p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Catch Button Panel ────────────────────────────────────────────────────────
export function CatchPanel({ pokemon, enemyHP, enemyMaxHP, ballInventory, onCatch, onClose }) {
  const availableBalls = BALL_ITEMS.filter(b => (ballInventory[b.id] || 0) > 0);

  if (availableBalls.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
        className="bg-black/70 border border-white/10 rounded-2xl p-4 text-center">
        <p className="text-white/40 text-xs mb-2">Keine Pokébälle mehr!</p>
        <p className="text-white/25 text-[10px]">Kaufe Bälle im Shop am Menü.</p>
        <button onClick={onClose} className="mt-3 text-white/30 text-xs hover:text-white/60 transition-colors">Schließen</button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
      className="bg-black/70 border border-white/10 rounded-2xl p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-white/60 text-xs font-bold">Pokéball werfen:</p>
        <button onClick={onClose} className="text-white/30 text-[10px] hover:text-white/60 transition-colors">✕</button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {BALL_ITEMS.map(ball => {
          const count = ballInventory[ball.id] || 0;
          const catchPct = Math.floor(calcCatchRate(pokemon, enemyHP, enemyMaxHP, ball.id) * 100);
          return (
            <button key={ball.id}
              onClick={() => count > 0 && onCatch(ball.id)}
              disabled={count <= 0}
              className="flex flex-col items-center gap-1 p-2 rounded-xl border transition-all disabled:opacity-25 disabled:cursor-not-allowed hover:bg-white/10 border-white/10 hover:border-white/20">
              <span className="text-2xl">{ball.icon}</span>
              <span className="text-[9px] text-white/60">{ball.name}</span>
              <span className="text-[9px] text-green-400 font-bold">~{catchPct}%</span>
              <span className="text-[9px] text-white/30">×{count}</span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}