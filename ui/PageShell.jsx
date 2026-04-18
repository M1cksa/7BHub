import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Consistent page wrapper with max-width, padding, and optional top spacing.
 */
export default function PageShell({ children, className, maxWidth = '6xl' }) {
  const widths = {
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };
  return (
    <div className={cn("mx-auto px-4 md:px-6 py-6 md:py-8", widths[maxWidth] || widths['6xl'], className)}>
      {children}
    </div>
  );
}