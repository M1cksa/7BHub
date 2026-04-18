import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function AppleCard({ 
  children, 
  className = '', 
  hover = true,
  onClick,
  delay = 0 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { y: -4, scale: 1.01 } : {}}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden",
        "bg-white/[0.02] backdrop-blur-3xl",
        "border border-white/[0.08]",
        "rounded-[28px]",
        "shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
        "hover:shadow-[0_20px_60px_rgba(0,0,0,0.20)]",
        "hover:border-white/[0.12]",
        "transition-all duration-700 ease-out",
        onClick && "cursor-pointer",
        className
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}