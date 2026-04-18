import React from 'react';
import { motion } from 'framer-motion';

export default function SectionHeader({ 
  title, 
  subtitle, 
  icon: Icon,
  action 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center justify-between mb-8"
    >
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
        <div>
          <h2 className="text-3xl font-semibold text-white tracking-tight">{title}</h2>
          {subtitle && (
            <p className="text-white/50 text-sm mt-1 font-medium">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </motion.div>
  );
}