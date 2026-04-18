import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Typ-basierte Farben für Angriffs-Effekte
const TYPE_EFFECT_COLORS = {
  fire:     { primary: '#ff6b35', secondary: '#ff9500', particles: '🔥' },
  water:    { primary: '#4fc3f7', secondary: '#0288d1', particles: '💧' },
  electric: { primary: '#ffeb3b', secondary: '#f9a825', particles: '⚡' },
  grass:    { primary: '#66bb6a', secondary: '#2e7d32', particles: '🍃' },
  psychic:  { primary: '#f48fb1', secondary: '#c2185b', particles: '🔮' },
  ice:      { primary: '#b3e5fc', secondary: '#0277bd', particles: '❄️' },
  dragon:   { primary: '#7c4dff', secondary: '#4527a0', particles: '🐉' },
  dark:     { primary: '#546e7a', secondary: '#263238', particles: '🌑' },
  ghost:    { primary: '#ab47bc', secondary: '#6a1b9a', particles: '👻' },
  fighting: { primary: '#ef5350', secondary: '#b71c1c', particles: '💥' },
  poison:   { primary: '#ab47bc', secondary: '#4a148c', particles: '☠️' },
  ground:   { primary: '#8d6e63', secondary: '#4e342e', particles: '🌪️' },
  rock:     { primary: '#90a4ae', secondary: '#37474f', particles: '💎' },
  bug:      { primary: '#aed581', secondary: '#558b2f', particles: '🦋' },
  steel:    { primary: '#b0bec5', secondary: '#546e7a', particles: '⚙️' },
  fairy:    { primary: '#f48fb1', secondary: '#880e4f', particles: '✨' },
  flying:   { primary: '#81d4fa', secondary: '#0277bd', particles: '🌬️' },
  normal:   { primary: '#bdbdbd', secondary: '#757575', particles: '💫' },
};

// Hit-Flash Overlay über dem Pokémon
export function HitFlash({ active, side }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none z-10"
          initial={{ opacity: 0.8 }}
          animate={{ opacity: [0.8, 0, 0.6, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{ background: side === 'enemy' ? 'rgba(239,68,68,0.6)' : 'rgba(96,165,250,0.6)' }}
        />
      )}
    </AnimatePresence>
  );
}

// Angriffs-Effekt: Welle die vom Angreifer zum Ziel geht
export function AttackEffect({ active, moveType, direction }) {
  const colors = TYPE_EFFECT_COLORS[moveType] || TYPE_EFFECT_COLORS.normal;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}>
          {/* Main projectile */}
          <motion.div
            className="absolute w-8 h-8 rounded-full flex items-center justify-center text-xl"
            style={{
              backgroundColor: colors.primary + '40',
              boxShadow: `0 0 20px ${colors.primary}, 0 0 40px ${colors.secondary}40`,
              border: `2px solid ${colors.primary}`,
            }}
            initial={{ x: direction === 'toEnemy' ? -80 : 80, opacity: 1, scale: 0.5 }}
            animate={{ x: direction === 'toEnemy' ? 80 : -80, opacity: [1, 1, 0], scale: [0.5, 1.2, 0.8] }}
            transition={{ duration: 0.45, ease: 'easeIn' }}>
            {colors.particles}
          </motion.div>

          {/* Trail particles */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{ backgroundColor: colors.primary }}
              initial={{ x: direction === 'toEnemy' ? -80 + i * 15 : 80 - i * 15, opacity: 0.7, scale: 0.3 }}
              animate={{ x: direction === 'toEnemy' ? 80 - i * 10 : -80 + i * 10, opacity: 0, scale: 0 }}
              transition={{ duration: 0.45, delay: i * 0.04, ease: 'easeIn' }}
            />
          ))}

          {/* Impact burst */}
          <motion.div
            className="absolute rounded-full"
            style={{ backgroundColor: colors.primary + '30', border: `2px solid ${colors.primary}` }}
            initial={{ width: 0, height: 0, opacity: 1, x: direction === 'toEnemy' ? 80 : -80 }}
            animate={{ width: 80, height: 80, opacity: 0, x: direction === 'toEnemy' ? 80 : -80 }}
            transition={{ duration: 0.35, delay: 0.35 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Super-Effektiv Anzeige
export function EffectivenessFlash({ effectiveness }) {
  if (!effectiveness) return null;
  const config = {
    super:   { text: '⚡ SEHR EFFEKTIV!',  bg: 'from-yellow-500 to-orange-500', shadow: 'rgba(251,191,36,0.6)' },
    not:     { text: '↓ Nicht sehr eff.', bg: 'from-slate-600 to-slate-700',   shadow: 'rgba(100,116,139,0.4)' },
    immune:  { text: '✗ Keine Wirkung!',   bg: 'from-gray-700 to-gray-800',     shadow: 'rgba(107,114,128,0.3)' },
    crit:    { text: '💥 KRITISCHER TREFFER!', bg: 'from-red-500 to-rose-600', shadow: 'rgba(239,68,68,0.7)' },
  };
  const c = config[effectiveness];
  if (!c) return null;

  return (
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none whitespace-nowrap"
      initial={{ scale: 0.5, opacity: 0, y: 0 }}
      animate={{ scale: [0.5, 1.2, 1.0], opacity: [0, 1, 1, 0], y: -30 }}
      transition={{ duration: 1.2, times: [0, 0.2, 0.5, 1] }}>
      <span
        className={`px-3 py-1.5 rounded-full text-white text-xs font-black bg-gradient-to-r ${c.bg} shadow-lg`}
        style={{ boxShadow: `0 0 20px ${c.shadow}` }}>
        {c.text}
      </span>
    </motion.div>
  );
}

// Screen-Shake bei kritischem Treffer
export function CritScreenFlash({ active }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-50"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0, 0.15, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.4) 0%, transparent 70%)' }}
        />
      )}
    </AnimatePresence>
  );
}

// Statuseffekt-Indikator beim Treffer (Vergiftung, Verbrennung etc.)
export function StatusAppliedBubble({ status, visible }) {
  const STATUS_STYLES = {
    burn:     { icon: '🔥', label: 'VERBRENNUNG', color: '#f97316' },
    poison:   { icon: '☠️', label: 'VERGIFTUNG',  color: '#a855f7' },
    sleep:    { icon: '💤', label: 'SCHLAF',       color: '#6366f1' },
    paralyze: { icon: '⚡', label: 'LÄHMUNG',      color: '#eab308' },
    freeze:   { icon: '❄️', label: 'GEFROREN',     color: '#22d3ee' },
  };
  const s = STATUS_STYLES[status];
  if (!s || !visible) return null;

  return (
    <motion.div
      className="absolute top-0 right-0 z-30 pointer-events-none"
      initial={{ scale: 0, opacity: 0, y: 0 }}
      animate={{ scale: 1, opacity: [0, 1, 1, 0], y: -40 }}
      transition={{ duration: 1.5 }}>
      <div className="px-2 py-1 rounded-full text-white text-[10px] font-black flex items-center gap-1"
        style={{ backgroundColor: s.color + 'cc', border: `1px solid ${s.color}`, boxShadow: `0 0 10px ${s.color}60` }}>
        {s.icon} {s.label}
      </div>
    </motion.div>
  );
}

// HP-Rückgangs-Animation (zeigt verlorene HP als roten Streifen)
export function HPLossIndicator({ loss, maxHP }) {
  if (!loss) return null;
  const pct = Math.min(100, (loss / maxHP) * 100);

  return (
    <motion.div
      className="absolute right-0 top-0 h-full rounded-r-full pointer-events-none z-10"
      style={{ width: `${pct}%`, backgroundColor: 'rgba(239,68,68,0.5)' }}
      initial={{ opacity: 0.8 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    />
  );
}