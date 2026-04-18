import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import HorizontalSection from './HorizontalSection';
import { Sparkles, Flame, Users } from 'lucide-react';

const AUDIENCE_CONFIG = {
  girl: {
    // Colors & gradients
    heroBg: 'linear-gradient(135deg, #1a0a1a 0%, #2d0a2d 40%, #1a0a1a 100%)',
    heroGlow1: 'rgba(236,72,153,0.35)',
    heroGlow2: 'rgba(168,85,247,0.25)',
    accentFrom: '#f472b6',
    accentTo: '#c084fc',
    borderColor: 'rgba(236,72,153,0.3)',
    shimmer: 'linear-gradient(90deg, rgba(244,114,182,0.0), rgba(244,114,182,0.15), rgba(244,114,182,0.0))',
    tagBg: 'rgba(236,72,153,0.15)',
    tagBorder: 'rgba(236,72,153,0.4)',
    tagText: '#f9a8d4',
    statColor: '#f472b6',
    dividerColor: 'rgba(236,72,153,0.2)',

    // Text
    tagLabel: '💅 Girls Zone',
    greeting: 'Hey Girlie',
    subtitle: 'Dein personalisierter Feed – nur für dich kuratiert',
    statsLabel: 'Videos für dich',
    Icon: Sparkles,

    // Sections
    highlightTitle: 'Trending bei den Girls',
    highlightEmoji: '💅',
    sectionTitle: 'Nur für dich',
    sectionEmoji: '✨',
    newTitle: 'Neu & frisch',
    newEmoji: '🌸',

    categories: ['fashion', 'lifestyle', 'music', 'art', 'fitness'],

    // Particle decoration
    particles: ['💗', '✨', '🌸', '💜', '🦋'],
  },
  boy: {
    heroBg: 'linear-gradient(135deg, #030e1a 0%, #0a1a2d 40%, #030e1a 100%)',
    heroGlow1: 'rgba(59,130,246,0.35)',
    heroGlow2: 'rgba(6,182,212,0.25)',
    accentFrom: '#60a5fa',
    accentTo: '#22d3ee',
    borderColor: 'rgba(59,130,246,0.3)',
    shimmer: 'linear-gradient(90deg, rgba(96,165,250,0.0), rgba(96,165,250,0.15), rgba(96,165,250,0.0))',
    tagBg: 'rgba(59,130,246,0.15)',
    tagBorder: 'rgba(59,130,246,0.4)',
    tagText: '#93c5fd',
    statColor: '#60a5fa',
    dividerColor: 'rgba(59,130,246,0.2)',

    tagLabel: '⚡ Boys Zone',
    greeting: 'Was geht Bro',
    subtitle: 'Dein personalisierter Feed – Games, Sports & mehr',
    statsLabel: 'Videos für dich',
    Icon: Flame,

    highlightTitle: 'Trending bei den Boys',
    highlightEmoji: '🔥',
    sectionTitle: 'Deine Welt',
    sectionEmoji: '⚡',
    newTitle: 'Frisch reingekommen',
    newEmoji: '🎮',

    categories: ['gaming', 'sports', 'technology', 'comedy', 'entertainment'],

    particles: ['⚡', '🔥', '💥', '🎮', '🏆'],
  },
  mixed: {
    heroBg: 'linear-gradient(135deg, #030f0a 0%, #0a1f17 40%, #030f0a 100%)',
    heroGlow1: 'rgba(16,185,129,0.35)',
    heroGlow2: 'rgba(6,182,212,0.25)',
    accentFrom: '#34d399',
    accentTo: '#22d3ee',
    borderColor: 'rgba(16,185,129,0.3)',
    shimmer: 'linear-gradient(90deg, rgba(52,211,153,0.0), rgba(52,211,153,0.15), rgba(52,211,153,0.0))',
    tagBg: 'rgba(16,185,129,0.15)',
    tagBorder: 'rgba(16,185,129,0.4)',
    tagText: '#6ee7b7',
    statColor: '#34d399',
    dividerColor: 'rgba(16,185,129,0.2)',

    tagLabel: '🤝 Mixed Zone',
    greeting: 'Hey, was geht',
    subtitle: 'Inhalte für alle – bunt gemischt & handverlesen',
    statsLabel: 'Videos für dich',
    Icon: Users,

    highlightTitle: 'Trending – für alle',
    highlightEmoji: '📈',
    sectionTitle: 'Gemischt & vielfältig',
    sectionEmoji: '🤝',
    newTitle: 'Neu entdecken',
    newEmoji: '🌍',

    categories: ['entertainment', 'music', 'lifestyle', 'education', 'comedy'],

    particles: ['🤝', '🌈', '🎉', '🌍', '💫'],
  },
};

function FloatingParticle({ emoji, delay, x, y }) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none text-lg"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ opacity: 0, scale: 0, rotate: -20 }}
      animate={{
        opacity: [0, 0.6, 0],
        scale: [0.5, 1.2, 0.8],
        y: [0, -20, -40],
        rotate: [0, 15, -10],
      }}
      transition={{ delay, duration: 4, repeat: Infinity, repeatDelay: 3 + Math.random() * 2 }}
    >
      {emoji}
    </motion.div>
  );
}

export default function AudiencePersonalization({ user, videos = [] }) {
  const group = user?.audience_group;
  const config = AUDIENCE_CONFIG[group];

  const audienceVideos = useMemo(() => {
    if (!group || !config) return [];
    return videos.filter(v => v.audience === group || v.audience === 'all' || v.audience === 'mixed');
  }, [videos, group, config]);

  const audienceTrending = useMemo(() =>
    [...audienceVideos].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 8),
    [audienceVideos]);

  const audienceNew = useMemo(() =>
    [...audienceVideos].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 8),
    [audienceVideos]);

  const categoryVideos = useMemo(() => {
    if (!config) return [];
    return audienceVideos.filter(v => config.categories.includes(v.category)).slice(0, 8);
  }, [audienceVideos, config]);

  if (!group || !config) return null;

  const { Icon } = config;

  // Particle positions
  const particlePositions = [
    { x: 5, y: 20 }, { x: 15, y: 60 }, { x: 75, y: 15 },
    { x: 85, y: 70 }, { x: 50, y: 80 }, { x: 92, y: 40 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="space-y-10"
    >
      {/* ─── HERO BANNER ─── */}
      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: config.heroBg,
          border: `1px solid ${config.borderColor}`,
          boxShadow: `0 0 80px ${config.heroGlow1}, inset 0 1px 0 rgba(255,255,255,0.07)`,
        }}
      >
        {/* Glow orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-[100px] -translate-y-1/3 translate-x-1/3"
            style={{ background: config.heroGlow1 }} />
          <div className="absolute bottom-0 left-1/4 w-56 h-56 rounded-full blur-[80px] translate-y-1/2"
            style={{ background: config.heroGlow2 }} />
          <div className="absolute top-1/2 left-0 w-40 h-40 rounded-full blur-[60px] -translate-x-1/2 -translate-y-1/2"
            style={{ background: config.heroGlow2 }} />
        </div>

        {/* Shimmer sweep */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ background: config.shimmer }}
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }}
        />

        {/* Floating particles */}
        {particlePositions.map((pos, i) => (
          <FloatingParticle
            key={i}
            emoji={config.particles[i % config.particles.length]}
            delay={i * 0.7}
            x={pos.x}
            y={pos.y}
          />
        ))}

        {/* Content */}
        <div className="relative z-10 p-7 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            {/* Left */}
            <div className="flex-1">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-widest mb-5"
                  style={{ background: config.tagBg, border: `1px solid ${config.tagBorder}`, color: config.tagText }}
                >
                  <Icon className="w-3 h-3" />
                  {config.tagLabel}
                </span>
              </motion.div>

              {/* Greeting */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl md:text-4xl font-black text-white leading-tight mb-2"
              >
                {config.greeting}{' '}
                <span style={{
                  background: `linear-gradient(135deg, ${config.accentFrom}, ${config.accentTo})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  {user?.username || ''}
                </span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-white/40 text-sm max-w-md"
              >
                {config.subtitle}
              </motion.p>
            </div>

            {/* Right – Stats */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 }}
              className="flex gap-6 md:gap-8 shrink-0"
            >
              {[
                { label: config.statsLabel, value: audienceVideos.length },
                { label: 'Trending', value: audienceTrending.length },
                { label: 'Neu', value: audienceNew.length },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <div
                    className="text-2xl md:text-3xl font-black"
                    style={{
                      background: `linear-gradient(135deg, ${config.accentFrom}, ${config.accentTo})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {value}
                  </div>
                  <div className="text-white/35 text-[11px] font-medium mt-0.5 whitespace-nowrap">{label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Divider */}
          <div className="mt-6 h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${config.dividerColor}, transparent)` }} />

          {/* Category tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {config.categories.map((cat) => (
              <span
                key={cat}
                className="text-xs px-2.5 py-1 rounded-lg font-medium capitalize"
                style={{ background: config.tagBg, color: config.tagText, border: `1px solid ${config.tagBorder}` }}
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── SECTIONS ─── */}
      {audienceTrending.length > 0 && (
        <HorizontalSection title={config.highlightTitle} emoji={config.highlightEmoji} videos={audienceTrending} />
      )}
      {audienceNew.length > 0 && (
        <HorizontalSection title={config.newTitle} emoji={config.newEmoji} videos={audienceNew} />
      )}
      {categoryVideos.length > 0 && (
        <HorizontalSection title={config.sectionTitle} emoji={config.sectionEmoji} videos={categoryVideos} />
      )}
    </motion.div>
  );
}