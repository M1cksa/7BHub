import { useEffect } from 'react';
import { motion } from 'framer-motion';

const RARITY_STYLES = {
  common: { border: '#06b6d4', glow: 'rgba(6,182,212,0.4)', label: 'COMMON' },
  rare:   { border: '#a855f7', glow: 'rgba(168,85,247,0.4)', label: 'RARE' },
  epic:   { border: '#f59e0b', glow: 'rgba(245,158,11,0.5)', label: 'EPIC' },
};

export default function DimensionSuperpowerToast({ superpower }) {

  if (!superpower) return null;
  const rs = RARITY_STYLES[superpower.rarity] || RARITY_STYLES.common;

  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0, y: 40 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.8, opacity: 0, y: -30 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className="flex flex-col items-center gap-2 px-8 py-5 rounded-3xl text-white text-center pointer-events-none"
      style={{
        background: 'rgba(5,5,15,0.85)',
        border: `2px solid ${rs.border}`,
        boxShadow: `0 0 40px ${rs.glow}, 0 0 80px ${rs.glow}`,
        backdropFilter: 'blur(16px)',
        minWidth: 240,
      }}
    >
      <span className="text-xs font-black tracking-[0.3em] opacity-70" style={{ color: rs.border }}>
        DIMENSION SUPERPOWER · {rs.label}
      </span>
      <span className="text-5xl leading-none">{superpower.emoji}</span>
      <span className="text-2xl font-black tracking-wide" style={{ color: superpower.color }}>
        {superpower.name}
      </span>
      <span className="text-sm text-white/70 font-medium">{superpower.desc}</span>
    </motion.div>
  );
}