import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BarChart2, Trophy, Clock, Coins, TrendingUp, Star, Zap, Flame, Map, CheckCircle, Award } from 'lucide-react';
import { ACHIEVEMENTS } from './NeonDashAchievements';

const LEVELS_COUNT = 15;

export default function NeonDashStats({ onBack, highScore, proHighScore, levelProgress, unlockedAchievementsRef, user }) {
  // Primär DB-Daten (neon_dash_stats auf AppUser), Fallback localStorage
  const stats = (() => {
    try {
      if (user?.neon_dash_stats && Object.keys(user.neon_dash_stats).length > 0) return user.neon_dash_stats;
      return JSON.parse(localStorage.getItem('neonStats') || '{}');
    } catch { return {}; }
  })();

  const totalGames = stats.totalGames || 0;
  const totalFrames = stats.totalFrames || 0;
  const totalCoins = stats.totalCoins || 0;
  const maxCoinsOneGame = stats.maxCoinsOneGame || 0;
  const totalTokensEarned = stats.totalTokensEarned || 0;
  const maxComboEver = stats.maxComboEver || 0;
  const dimensionsEntered = stats.dimensionsEntered || 0;
  const proGames = stats.proGames || 0;

  const playedHours = (totalFrames / 60 / 60 / 60).toFixed(1);
  const playedMinutes = Math.floor(totalFrames / 60 / 60);
  const avgCoinsPerGame = totalGames > 0 ? Math.round(totalCoins / totalGames) : 0;
  const unlockedAchs = [...(unlockedAchievementsRef?.current || [])];
  const completedLvls = levelProgress || [];

  const MILESTONES = [
    { id: 'first_game',   label: 'Erstes Spiel',         emoji: '🚀', unlocked: totalGames >= 1 },
    { id: 'ten_games',    label: '10 Spiele',             emoji: '🎮', unlocked: totalGames >= 10 },
    { id: 'pro_player',   label: 'Pro Spieler',           emoji: '🔥', unlocked: proGames >= 5 },
    { id: 'coin_hunter',  label: 'Münzjäger',             emoji: '🪙', unlocked: totalCoins >= 100 },
    { id: 'coin_god',     label: 'Münzgott',              emoji: '💰', unlocked: totalCoins >= 500 },
    { id: 'dim_explorer', label: 'Dim-Reisender',         emoji: '⬡',  unlocked: dimensionsEntered >= 5 },
    { id: 'dim_master',   label: 'Dim-Meister',           emoji: '🌀', unlocked: dimensionsEntered >= 25 },
    { id: 'hour_player',  label: '1 Stunde gespielt',     emoji: '⏰', unlocked: parseFloat(playedHours) >= 1 },
    { id: 'combo_king',   label: 'Combo König',           emoji: '⚡', unlocked: maxComboEver >= 20 },
    { id: 'level_5',      label: '5 Level geschafft',     emoji: '🗺️', unlocked: completedLvls.length >= 5 },
    { id: 'level_all',    label: 'Alle Level geschafft',  emoji: '👑', unlocked: completedLvls.length >= LEVELS_COUNT },
  ];
  const unlockedMilestones = MILESTONES.filter(m => m.unlocked);

  const statCards = [
    { icon: <Clock className="w-4 h-4" />, color: '#06b6d4', label: 'Gespielte Zeit', value: parseFloat(playedHours) >= 1 ? `${playedHours}h` : `${playedMinutes}min` },
    { icon: <Trophy className="w-4 h-4" />, color: '#fbbf24', label: 'Bester Score', value: Math.max(highScore, proHighScore).toLocaleString() },
    { icon: <Coins className="w-4 h-4" />, color: '#f59e0b', label: 'Münzen gesamt', value: totalCoins.toLocaleString() },
    { icon: <TrendingUp className="w-4 h-4" />, color: '#a78bfa', label: 'Ø Münzen/Spiel', value: avgCoinsPerGame.toString() },
    { icon: <Star className="w-4 h-4" />, color: '#f43f5e', label: 'Max Coins / Run', value: maxCoinsOneGame.toLocaleString() },
    { icon: <Zap className="w-4 h-4" />, color: '#facc15', label: 'Bester Combo', value: `x${maxComboEver}` },
    { icon: <BarChart2 className="w-4 h-4" />, color: '#34d399', label: 'Spiele gesamt', value: totalGames.toLocaleString() },
    { icon: <Flame className="w-4 h-4" />, color: '#f97316', label: 'Pro Spiele', value: proGames.toLocaleString() },
  ];

  return (
    <motion.div key="stats" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
      className="pointer-events-auto bg-black/85 backdrop-blur-xl rounded-3xl border border-emerald-500/25 shadow-[0_0_50px_rgba(16,185,129,0.12)] w-[92%] max-w-md max-h-[88vh] flex flex-col overflow-hidden">

      {/* Header */}
      <div className="px-6 pt-5 pb-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="text-xl font-black flex items-center gap-2" style={{ background: 'linear-gradient(90deg, #34d399, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          <BarChart2 className="w-5 h-5 text-emerald-400" /> Profil & Statistiken
        </h2>
        {user && <span className="text-white/30 text-xs font-bold">{user.username}</span>}
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-5 py-4 space-y-4">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-2">
          {statCards.map((s, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${s.color}18`, color: s.color }}>
                {s.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[9px] text-white/30 font-bold uppercase tracking-wider leading-none mb-0.5">{s.label}</p>
                <p className="text-sm font-black text-white leading-none">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Dimensions */}
        <div className="flex items-center gap-4 px-4 py-3 rounded-2xl"
          style={{ background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.2)' }}>
          <span className="text-2xl">⬡</span>
          <div className="flex-1">
            <p className="text-xs text-violet-400/70 font-bold uppercase tracking-wider">Dimensionen traversiert</p>
            <p className="text-2xl font-black text-violet-300">{dimensionsEntered.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/25">Tokens verdient</p>
            <p className="text-sm font-black text-yellow-400">{totalTokensEarned.toLocaleString()}</p>
          </div>
        </div>

        {/* Level Progress */}
        <div className="px-4 py-3 rounded-2xl"
          style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-violet-400 font-black flex items-center gap-1.5">
              <Map className="w-3.5 h-3.5" /> Level Fortschritt
            </span>
            <span className="text-xs text-white/40 font-bold">{completedLvls.length} / {LEVELS_COUNT}</span>
          </div>
          <div className="h-2 bg-white/6 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all"
              style={{ width: `${(completedLvls.length / LEVELS_COUNT) * 100}%` }} />
          </div>
        </div>

        {/* Milestones */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-black text-white/40 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-yellow-400" /> Meilensteine
            </p>
            <p className="text-xs text-white/25">{unlockedMilestones.length}/{MILESTONES.length}</p>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {MILESTONES.map(m => (
              <div key={m.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl ${m.unlocked ? '' : 'opacity-30'}`}
                style={{ background: m.unlocked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)', border: `1px solid ${m.unlocked ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)'}` }}>
                <span className="text-sm">{m.unlocked ? m.emoji : '🔒'}</span>
                <p className="text-[10px] font-bold text-white/70 leading-tight">{m.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        {unlockedAchs.length > 0 && (
          <div>
            <p className="text-xs font-black text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-green-400" /> Achievements ({unlockedAchs.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {unlockedAchs.map(id => {
                const ach = ACHIEVEMENTS.find(a => a.id === id);
                return ach ? (
                  <span key={id} className="text-[10px] px-2 py-1 rounded-full font-bold flex items-center gap-1"
                    style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#86efac' }}>
                    {ach.icon} {ach.name}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>

      <div className="px-5 pb-5 pt-3">
        <Button onClick={onBack} className="w-full bg-white/8 hover:bg-white/15 text-white py-5 rounded-2xl font-bold border-none">
          Zurück
        </Button>
      </div>
    </motion.div>
  );
}