import { Flame, Radio, Play, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const stats = [
  { key: 'live',      icon: Radio,    label: 'Live',     glow: '#ef4444', border: 'rgba(239,68,68,0.25)',   text: '#f87171' },
  { key: 'trending',  icon: Flame,    label: 'Trending', glow: '#f97316', border: 'rgba(249,115,22,0.25)',  text: '#fb923c' },
  { key: 'newVideos', icon: Sparkles, label: 'Neu',      glow: 'var(--theme-primary)', border: 'color-mix(in srgb, var(--theme-primary) 25%, transparent)', text: 'var(--theme-primary)' },
  { key: 'total',     icon: Play,     label: 'Videos',   glow: 'var(--theme-secondary)', border: 'color-mix(in srgb, var(--theme-secondary) 25%, transparent)', text: 'var(--theme-secondary)' },
];

export default function QuickStats({ live = 0, trending = 0, newVideos = 0, total = 0 }) {
  const values = { live, trending, newVideos, total };

  return (
    <div className="grid grid-cols-4 gap-2 md:gap-3">
      {stats.map(({ key, icon: Icon, label, glow, border, text }, i) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 12, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex flex-col items-center gap-1.5 p-3 md:p-4 rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
            border: `1px solid ${border}`,
            boxShadow: `0 4px 24px color-mix(in srgb, ${glow} 20%, transparent), inset 0 1px 0 rgba(255,255,255,0.07)`,
          }}
        >
          {/* Glow dot */}
          <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: text, boxShadow: `0 0 6px ${text}` }} />
          
          <Icon className="w-4 h-4 shrink-0" style={{ color: text }} />
          <span className="text-xl md:text-2xl font-black text-white tabular-nums leading-none">{values[key]}</span>
          <span className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">{label}</span>
        </motion.div>
      ))}
    </div>
  );
}