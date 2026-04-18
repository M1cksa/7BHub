import React from 'react';
import { cn } from '@/lib/utils';

export default function SectionTitle({ children, className }) {
  return (
    <div className={cn("flex items-center gap-3 mb-5", className)}>
      <h2 className="text-base font-semibold text-white/70 uppercase tracking-wider">{children}</h2>
      <div className="flex-1 h-px bg-white/[0.06]" />
    </div>
  );
}