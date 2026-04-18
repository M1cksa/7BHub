import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function MinimalButton({ 
  children, 
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
  icon: Icon
}) {
  const variants = {
    primary: "bg-white text-black hover:bg-white/90 shadow-[0_2px_8px_rgba(255,255,255,0.15)]",
    secondary: "bg-white/[0.08] text-white hover:bg-white/[0.12] border border-white/[0.12]",
    ghost: "text-white/70 hover:text-white hover:bg-white/[0.08]"
  };

  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-6 text-base",
    lg: "h-14 px-8 text-lg"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-full font-medium",
        "transition-all duration-300",
        "flex items-center justify-center gap-2",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </motion.button>
  );
}