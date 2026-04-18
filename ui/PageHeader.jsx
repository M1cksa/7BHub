import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Unified page header used across all pages.
 * icon: lucide React component
 * accent: tailwind color key (e.g. 'red', 'violet', 'cyan') — used for glow
 */
export default function PageHeader({ icon: Icon, title, subtitle, accent = 'cyan', children, className }) {
  const glowMap = {
    cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    red: 'bg-red-500/10 border-red-500/20 text-red-400',
    violet: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    pink: 'bg-pink-500/10 border-pink-500/20 text-pink-400',
  };
  const colors = glowMap[accent] || glowMap.cyan;

  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8", className)}>
      <div className="flex items-center gap-4">
        {Icon && (
          <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center shrink-0", colors)}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">{title}</h1>
          {subtitle && <p className="text-white/40 text-sm mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
    </div>
  );
}