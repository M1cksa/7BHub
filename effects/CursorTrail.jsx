import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function CursorTrail({ type }) {
  const [trails, setTrails] = useState([]);

  useEffect(() => {
    if (type === 'none' || !type) return;

    let particleCount = 0;
    
    const handleMouseMove = (e) => {
      // Limit generation rate
      if (particleCount++ % 2 !== 0) return;
      
      const newParticle = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
      };

      setTrails((prev) => [...prev, newParticle].slice(-15));
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [type]);

  if (type === 'none' || !type) return null;

  const TRAIL_COLORS = {
    apocalypse_fire:    { color: '#f97316', glow: '#ef4444' },
    neon_laser:         { color: '#06b6d4', glow: '#06b6d4' },
    s2_fire_trail:      { color: '#f97316', glow: '#ef4444' },
    s2_toxic_trail:     { color: '#84cc16', glow: '#65a30d' },
    s2_lightning_bolt:  { color: '#fde047', glow: '#facc15' },
    s2_void_trail:      { color: '#a855f7', glow: '#7c3aed' },
    s2_electric_trail:  { color: '#22d3ee', glow: '#06b6d4' },
    s2_divine_trail:    { color: '#f0abfc', glow: '#e879f9' },
    s2_stardust:        { color: '#e0e7ff', glow: '#818cf8' },
    s2_apex_comet:      { color: '#fbbf24', glow: '#f59e0b' },
    s2_eternal_trail:   { color: '#34d399', glow: '#10b981' },
    s2_apocalypse_comet:{ color: '#f87171', glow: '#dc2626' },
  };

  const trailStyle = TRAIL_COLORS[type] || { color: '#a855f7', glow: '#a855f7' };

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {trails.map((t) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0.8, scale: 1 }}
          animate={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute rounded-full"
          style={{
            left: t.x - 5,
            top: t.y - 5,
            width: 10,
            height: 10,
            background: trailStyle.color,
            boxShadow: `0 0 10px ${trailStyle.glow}`,
            filter: 'blur(2px)'
          }}
        />
      ))}
    </div>
  );
}