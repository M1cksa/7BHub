import React from 'react';
import { motion } from 'framer-motion';

export default function FloatingOrb({ color = 'cyan', size = 'lg', delay = 0, position = 'top-left' }) {
  const sizes = {
    sm: 'w-[300px] h-[300px]',
    md: 'w-[500px] h-[500px]',
    lg: 'w-[700px] h-[700px]',
    xl: 'w-[900px] h-[900px]'
  };

  const colors = {
    cyan: 'from-cyan-500/30 to-transparent',
    violet: 'from-violet-500/30 to-transparent',
    fuchsia: 'from-fuchsia-500/30 to-transparent',
    emerald: 'from-emerald-500/30 to-transparent',
    amber: 'from-amber-500/30 to-transparent'
  };

  const positions = {
    'top-left': 'top-[-10%] left-[-10%]',
    'top-right': 'top-[-10%] right-[-10%]',
    'bottom-left': 'bottom-[-10%] left-[-10%]',
    'bottom-right': 'bottom-[-10%] right-[-10%]',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
  };

  return (
    <motion.div
      className={`absolute ${sizes[size]} ${positions[position]} rounded-full blur-[120px] opacity-20 pointer-events-none`}
      style={{
        background: `radial-gradient(circle, var(--theme-${color === 'cyan' ? 'primary' : 'secondary'}) 0%, transparent 70%)`
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.15, 0.25, 0.15],
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: "easeInOut",
        delay
      }}
    />
  );
}