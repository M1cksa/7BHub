import React from 'react';
import { motion } from 'framer-motion';

export default function GlowCard({ children, className = '', glowColor = 'cyan', onClick, ...props }) {
  const glowColors = {
    cyan: 'shadow-cyan-500/50 hover:shadow-cyan-500/70',
    violet: 'shadow-violet-500/50 hover:shadow-violet-500/70',
    pink: 'shadow-pink-500/50 hover:shadow-pink-500/70',
    orange: 'shadow-orange-500/50 hover:shadow-orange-500/70',
    emerald: 'shadow-emerald-500/50 hover:shadow-emerald-500/70',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative group cursor-pointer ${className}`}
      {...props}
    >
      {/* Glow effect */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r from-${glowColor}-600 to-${glowColor}-400 rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-500`} />
      
      {/* Card content */}
      <div className="relative bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        {children}
      </div>
    </motion.div>
  );
}