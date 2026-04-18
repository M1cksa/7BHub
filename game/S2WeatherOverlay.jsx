import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * S2WeatherOverlay — React layer for weather effects.
 * Canvas-level effects (grid tint etc.) are handled in the game loop.
 * This component handles:
 *   - Toxic Rain: CSS vignette overlay restricting the view
 *   - Solar Flares: periodic white screen-flash
 */
export default function S2WeatherOverlay({ weatherEvent, solarFlashActive, toxinImmune, solarFlareResist = 0 }) {
  if (!weatherEvent) return null;

  const resistedFlashAlpha = Math.max(0, 1 - solarFlareResist);

  return (
    <div className="absolute inset-0 z-[6] pointer-events-none overflow-hidden">
      <AnimatePresence>
        {/* ── TOXIC RAIN OVERLAY ── */}
        {weatherEvent.id === 'toxic_rain' && !toxinImmune && (
          <motion.div
            key="toxic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(0,40,0,0.0) 30%, rgba(0,60,0,0.55) 100%)',
              backdropFilter: 'blur(1.5px) saturate(1.4)',
              WebkitBackdropFilter: 'blur(1.5px) saturate(1.4)',
            }}
          >
            {/* Scanlines effect */}
            <div className="absolute inset-0" style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(132,204,22,0.04) 3px, rgba(132,204,22,0.04) 4px)',
            }} />
            {/* Green dripping streaks */}
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-0 w-px"
                style={{ left: `${(i * 8.3) + 2}%`, background: 'linear-gradient(to bottom, transparent, rgba(132,204,22,0.4), transparent)', height: '40%' }}
                animate={{ y: ['-40%', '140%'] }}
                transition={{ duration: 1.8 + i * 0.2, repeat: Infinity, delay: i * 0.15, ease: 'linear' }}
              />
            ))}
          </motion.div>
        )}

        {/* ── SOLAR FLARE FLASH ── */}
        {weatherEvent.id === 'solar_flares' && solarFlashActive && (
          <motion.div
            key={`flash-${Date.now()}`}
            initial={{ opacity: 0.85 * resistedFlashAlpha }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="absolute inset-0"
            style={{ background: `rgba(255,255,220,${0.9 * resistedFlashAlpha})` }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}