import React, { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Zap, Gamepad2, Play, Trophy, Star, Flame, Crown, ChevronRight } from 'lucide-react';
import PageTransition from '@/components/mobile/PageTransition';

const BattlePassWidget = lazy(() => import('@/components/battlepass/BattlePassWidget'));
const PokemonHomeBanner = lazy(() => import('@/components/pokemon/PokemonHomeBanner'));

const GAME_CARDS = [
  {
    href: 'NeonDash',
    icon: Zap,
    label: 'Neon Dash',
    desc: 'Portale · Dimensionen · Pro Modus',
    badge: '🎮 SPIELEN',
    gradient: 'from-cyan-900/60 to-violet-900/40',
    border: 'rgba(6,182,212,0.3)',
    glow: 'rgba(6,182,212,0.15)',
    iconColor: 'text-cyan-400',
    iconFill: 'fill-cyan-400',
    textGradient: 'linear-gradient(90deg, #67e8f9, #a855f7)',
    grid: true,
  },
  {
    href: 'NeonRacer',
    icon: Zap,
    label: 'Neon Racer',
    desc: 'Rennen · Upgrades · Online',
    badge: '🏁 RACEN',
    gradient: 'from-violet-900/60 to-pink-900/40',
    border: 'rgba(168,85,247,0.3)',
    glow: 'rgba(168,85,247,0.15)',
    iconColor: 'text-violet-400',
    iconFill: 'fill-violet-400',
    textGradient: 'linear-gradient(90deg, #c4b5fd, #f0abfc)',
    grid: false,
  },
  {
    href: 'PokemonGame',
    icon: Gamepad2,
    label: 'Pokémon',
    desc: 'Story · Arena · Dungeons',
    badge: '⚡ EVENT',
    gradient: 'from-yellow-900/60 to-orange-900/40',
    border: 'rgba(250,204,21,0.3)',
    glow: 'rgba(250,204,21,0.15)',
    iconColor: 'text-yellow-400',
    iconFill: 'fill-yellow-400',
    textGradient: 'linear-gradient(90deg, #fde68a, #fb923c)',
    grid: false,
  },
];

const PASS_CARDS = [
  {
    href: 'BattlePass',
    icon: Flame,
    label: 'Battle Pass',
    desc: 'XP · Rewards · Shard-System',
    color: 'text-fuchsia-400',
    bg: 'rgba(217,70,239,0.08)',
    border: 'rgba(217,70,239,0.2)',
  },
  {
    href: 'ProPass',
    icon: Crown,
    label: 'Pro Pass',
    desc: 'Exklusive Titel, Badges & Effekte',
    color: 'text-yellow-400',
    bg: 'rgba(251,191,36,0.08)',
    border: 'rgba(251,191,36,0.2)',
  },
  {
    href: 'Leaderboard',
    icon: Trophy,
    label: 'Rangliste',
    desc: 'Top Spieler · Hall of Fame',
    color: 'text-cyan-400',
    bg: 'rgba(6,182,212,0.08)',
    border: 'rgba(6,182,212,0.2)',
  },
];

export default function GamerHomePage({ user }) {
  const highScore = parseInt(localStorage.getItem('neonHighScore') || '0');

  return (
    <PageTransition>
      <div className="min-h-screen relative">
        {/* Background glows */}
        <div className="fixed top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[200px] pointer-events-none z-0" />
        <div className="fixed bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-500/8 rounded-full blur-[180px] pointer-events-none z-0" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 pt-4 pb-8 space-y-6">

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl p-5 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #0d0515 50%, #050a1a 100%)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-[60px]" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-500/10 rounded-full blur-[50px]" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mb-1">🎮 Gamer Hub</p>
                <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300">
                  Hey, {user?.username || 'Gamer'}!
                </h1>
                <p className="text-white/35 text-xs mt-1">Bereit für dein nächstes Abenteuer?</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-yellow-400 font-black text-sm"
                  style={{ background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)' }}>
                  💰 {(user?.tokens || 0).toLocaleString()}
                </div>
                {highScore > 0 && (
                  <div className="flex items-center gap-1 text-[10px] text-cyan-400/70 font-bold">
                    <Trophy className="w-3 h-3" /> {highScore.toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            {/* BP Level bar */}
            {(() => {
              const lvl = user?.bp_level || 1;
              const xp = user?.bp_xp || 0;
              const pct = Math.min((xp / 1000) * 100, 100);
              return (
                <div className="relative z-10 mt-4 flex items-center gap-3">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Flame className="w-3.5 h-3.5 text-fuchsia-400" />
                    <span className="text-fuchsia-300 text-xs font-black">Lvl {lvl}</span>
                  </div>
                  <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #d946ef, #7c3aed)' }} />
                  </div>
                  <span className="text-white/25 text-[10px] font-bold shrink-0">{xp}/1000 XP</span>
                </div>
              );
            })()}
          </motion.div>

          {/* Pokemon Banner */}
          <Suspense fallback={null}>
            <PokemonHomeBanner user={user} />
          </Suspense>

          {/* Games */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25">🎮 Games</span>
              <div className="flex-1 h-px bg-white/[0.04]" />
            </div>

            {/* Neon Dash – full width */}
            <Link to={createPageUrl('NeonDash')} className="block mb-2.5">
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                className="relative rounded-2xl overflow-hidden cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #030318 0%, #0a001a 40%, #001a1a 100%)', border: `1px solid ${GAME_CARDS[0].border}` }}>
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(6,182,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,1) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
                <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-28 h-28 rounded-full blur-[35px]" style={{ backgroundColor: GAME_CARDS[0].glow }} />
                <div className="relative z-10 p-3.5 flex items-center gap-3">
                  <div className="w-11 h-11 flex-shrink-0 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.18), rgba(168,85,247,0.18))', border: `1px solid ${GAME_CARDS[0].border}` }}>
                    <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(6,182,212,0.12)', border: `1px solid ${GAME_CARDS[0].border}`, color: '#67e8f9' }}>
                        {GAME_CARDS[0].badge}
                      </span>
                      {highScore > 0 && <span className="text-[8px] text-yellow-400/60 font-bold">🏆 {highScore.toLocaleString()}</span>}
                    </div>
                    <h3 className="text-sm font-black" style={{ background: GAME_CARDS[0].textGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      {GAME_CARDS[0].label}
                    </h3>
                    <p className="text-white/30 text-[9px]">{GAME_CARDS[0].desc}</p>
                  </div>
                  <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400 flex-shrink-0" />
                </div>
              </motion.div>
            </Link>

            {/* Neon Racer + Pokémon – 2 columns */}
            <div className="grid grid-cols-2 gap-2.5">
              {GAME_CARDS.slice(1).map((g) => (
                <Link key={g.href} to={createPageUrl(g.href)}>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="relative rounded-2xl overflow-hidden cursor-pointer h-full"
                    style={{ background: `linear-gradient(135deg, #0a0016 0%, #080010 100%)`, border: `1px solid ${g.border}` }}>
                    <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: `linear-gradient(${g.iconColor.replace('text-', 'rgba(').replace('400', '255,255,255,1)')} 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
                    <div className="relative z-10 p-3.5 flex flex-col gap-2">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: g.bg || 'rgba(255,255,255,0.05)', border: `1px solid ${g.border}` }}>
                        <g.icon className={`w-4 h-4 ${g.iconColor}`} />
                      </div>
                      <div>
                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full mb-1 inline-block"
                          style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${g.border}`, color: g.iconColor.replace('text-', '') }}>
                          {g.badge}
                        </span>
                        <h3 className="text-xs font-black mt-0.5" style={{ background: g.textGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                          {g.label}
                        </h3>
                        <p className="text-white/25 text-[9px] mt-0.5">{g.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>

          {/* Battle Pass Widget */}
          <Suspense fallback={<div className="h-20 rounded-2xl bg-white/5 animate-pulse" />}>
            <BattlePassWidget user={user} />
          </Suspense>

          {/* Quick links: Pro Pass, Leaderboard */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25">⭐ Passes & Rangliste</span>
              <div className="flex-1 h-px bg-white/[0.04]" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {PASS_CARDS.map((c) => (
                <Link key={c.href} to={createPageUrl(c.href)}>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl cursor-pointer text-center"
                    style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                    <c.icon className={`w-5 h-5 ${c.color}`} />
                    <span className={`text-[10px] font-black ${c.color}`}>{c.label}</span>
                    <span className="text-white/25 text-[8px] leading-tight">{c.desc}</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}