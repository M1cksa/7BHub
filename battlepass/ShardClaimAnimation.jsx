import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SHARD_TIERS } from './ShardConfig';

/**
 * ShardClaimAnimation
 * Unterbricht die UI mit einer tier-spezifischen Celebration.
 * Props: shard = { tier: 'spark'|'void'|'nova'|'omega' } | null
 *        onDone: () => void
 */
export default function ShardClaimAnimation({ shard, onDone }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!shard) return;
    const count = shard.tier === 'omega' ? 20 : shard.tier === 'nova' ? 14 : shard.tier === 'void' ? 10 : 6;
    setParticles(Array.from({ length: count }, (_, i) => ({
      id: i,
      angle: (360 / count) * i,
      dist: 60 + Math.random() * 60,
    })));

    const timeout = setTimeout(onDone, shard.tier === 'omega' ? 3200 : shard.tier === 'nova' ? 2600 : 2000);
    return () => clearTimeout(timeout);
  }, [shard]);

  if (!shard) return null;
  const cfg = SHARD_TIERS[shard.tier];

  const isOmega = shard.tier === 'omega';
  const isNova = shard.tier === 'nova';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ background: isOmega ? 'rgba(0,0,0,0.92)' : 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
        onClick={onDone}
      >
        {/* Screen-wide glow for Omega */}
        {isOmega && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.25, 0, 0.18, 0] }}
            transition={{ duration: 1.5, times: [0, 0.2, 0.5, 0.7, 1] }}
            style={{ background: `radial-gradient(ellipse at center, ${cfg.color} 0%, transparent 70%)` }}
          />
        )}

        {/* Particles burst */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {particles.map(p => (
            <motion.div
              key={p.id}
              className="absolute w-2 h-2 rounded-full"
              style={{ backgroundColor: cfg.color, boxShadow: `0 0 8px ${cfg.color}` }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
              animate={{
                x: Math.cos((p.angle * Math.PI) / 180) * p.dist,
                y: Math.sin((p.angle * Math.PI) / 180) * p.dist,
                opacity: [1, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{ duration: 1.2, delay: 0.15 }}
            />
          ))}
        </div>

        {/* Main card */}
        <motion.div
          initial={{ scale: 0.2, rotate: -12 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 1.2, opacity: 0 }}
          transition={{ type: 'spring', bounce: 0.55, duration: 0.7 }}
          className="relative flex flex-col items-center px-10 py-10 rounded-[2rem] text-center max-w-xs w-full mx-4"
          style={{
            background: `linear-gradient(135deg, rgba(0,0,0,0.9), rgba(0,0,0,0.7))`,
            border: `1.5px solid ${cfg.border}`,
            boxShadow: `0 0 60px ${cfg.glow}, inset 0 0 40px ${cfg.bg}`,
          }}
        >
          {/* Rotating ring */}
          <motion.div
            className="absolute inset-0 rounded-[2rem] pointer-events-none"
            style={{ border: `1.5px solid ${cfg.color}` }}
            animate={{ opacity: [0.2, 0.9, 0.2] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
          />

          {/* Omega: screen-shake simulation via card shake */}
          {isOmega && (
            <motion.div
              className="absolute inset-0 rounded-[2rem]"
              animate={{ x: [0, -4, 4, -4, 4, 0] }}
              transition={{ duration: 0.5, delay: 0.3 }}
            />
          )}

          {/* Icon */}
          <motion.div
            animate={isOmega
              ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }
              : isNova
              ? { scale: [1, 1.2, 1] }
              : { y: [-4, 4, -4] }
            }
            transition={{ duration: 2, repeat: Infinity }}
            className="text-7xl mb-4 relative z-10 select-none"
            style={{ filter: `drop-shadow(0 0 20px ${cfg.color})` }}
          >
            {cfg.icon}
          </motion.div>

          {/* Tier label */}
          <div
            className="text-xs font-black uppercase tracking-[0.3em] mb-1 relative z-10"
            style={{ color: cfg.color }}
          >
            {cfg.label}
          </div>

          {/* Name */}
          <div className="text-xl font-black text-white mb-1 relative z-10">{cfg.name}</div>

          {/* Flavor text */}
          <div className="text-xs text-white/40 mb-6 relative z-10">
            {isOmega && 'Eines von nur 3 im gesamten Pass.'}
            {isNova && 'Ein mächtiges Fragment — selten und begehrt.'}
            {shard.tier === 'void' && 'Eine Fragment-Energie aus dem Void.'}
            {shard.tier === 'spark' && 'Der erste Funke deiner Macht.'}
          </div>

          {/* CTA */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDone}
            className="relative z-10 px-8 py-3 rounded-xl text-sm font-black text-white border-0"
            style={{
              background: `linear-gradient(135deg, ${cfg.color}cc, ${cfg.color}88)`,
              boxShadow: `0 0 20px ${cfg.glow}`,
            }}
          >
            Zum Inventar →
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}