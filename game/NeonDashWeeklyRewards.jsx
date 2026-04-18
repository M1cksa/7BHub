import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Clock, Trophy, Zap, Star, Crown, Flame, CheckCircle, Lock, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

// 4 Wochen Belohnungen — alle ausrüstbar via AppUser-Felder
export const WEEKLY_REWARDS = [
  {
    week: 1,
    // Week 1: KW 11 (10. März – 16. März 2026)
    startDate: '2026-03-10',
    endDate: '2026-03-16',
    theme: 'NEON STORM',
    color: '#06b6d4',
    glow: '#0891b2',
    emoji: '⚡',
    tiers: [
      { points: 500,   reward: { type: 'tokens', amount: 1000 },                      label: '+1.000 Tokens',           icon: '🪙' },
      { points: 2000,  reward: { type: 'skin', id: 'neon', name: 'Neon Pink' },       label: 'Neon Pink Skin',          icon: '💜' },
      { points: 5000,  reward: { type: 'tokens', amount: 3000 },                      label: '+3.000 Tokens',           icon: '🪙' },
      { points: 10000, reward: { type: 'frame', id: 'neon', name: 'Neon Frame' },     label: 'Neon Profil-Rahmen',      icon: '🔵' },
      { points: 20000, reward: { type: 'skin', id: 'lightning', name: 'Lightning' },  label: 'Lightning Skin',          icon: '⚡' },
      { points: 35000, reward: { type: 'title', id: 'neon_storm', name: '⚡ NEON STORM', label: 'Neon Storm Titel', icon: '👑' }, label: 'Exkl. Titel: NEON STORM', icon: '👑' },
    ],
  },
  {
    week: 2,
    // Week 2: KW 12 (17. März – 23. März 2026)
    startDate: '2026-03-17',
    endDate: '2026-03-23',
    theme: 'VOID WALKER',
    color: '#a855f7',
    glow: '#7c3aed',
    emoji: '🌀',
    tiers: [
      { points: 500,   reward: { type: 'tokens', amount: 1200 },                     label: '+1.200 Tokens',          icon: '🪙' },
      { points: 2000,  reward: { type: 'skin', id: 'void', name: 'Void Walker' },    label: 'Void Walker Skin',       icon: '🌀' },
      { points: 5000,  reward: { type: 'tokens', amount: 3500 },                     label: '+3.500 Tokens',          icon: '🪙' },
      { points: 10000, reward: { type: 'frame', id: 'galaxy', name: 'Galaxy Frame' },label: 'Galaxy Profil-Rahmen',   icon: '🌌' },
      { points: 20000, reward: { type: 'skin', id: 'shadow', name: 'Shadow Clone' }, label: 'Shadow Clone Skin',      icon: '👤' },
      { points: 35000, reward: { type: 'title', id: 'void_walker', name: '🌀 VOID WALKER' }, label: 'Exkl. Titel: VOID WALKER', icon: '👑' },
    ],
  },
  {
    week: 3,
    // Week 3: KW 13 (24. März – 30. März 2026)
    startDate: '2026-03-24',
    endDate: '2026-03-30',
    theme: 'INFERNO RUN',
    color: '#f97316',
    glow: '#ea580c',
    emoji: '🔥',
    tiers: [
      { points: 500,   reward: { type: 'tokens', amount: 1500 },                      label: '+1.500 Tokens',           icon: '🪙' },
      { points: 2000,  reward: { type: 'skin', id: 'fire', name: 'Fire Ship' },       label: 'Fire Ship Skin',          icon: '🔥' },
      { points: 5000,  reward: { type: 'tokens', amount: 4000 },                      label: '+4.000 Tokens',           icon: '🪙' },
      { points: 10000, reward: { type: 'frame', id: 'fire', name: 'Fire Frame' },     label: 'Fire Profil-Rahmen',      icon: '🔴' },
      { points: 20000, reward: { type: 'badge', id: 'inferno_runner', name: '🔥 Inferno Runner' }, label: 'Inferno Runner Badge', icon: '🏆' },
      { points: 35000, reward: { type: 'title', id: 'inferno_run', name: '🔥 INFERNO RUN' }, label: 'Exkl. Titel: INFERNO RUN', icon: '👑' },
    ],
  },
  {
    week: 4,
    // Week 4: KW 14 (31. März – 6. April 2026)
    startDate: '2026-03-31',
    endDate: '2026-04-06',
    theme: 'COSMIC MASTER',
    color: '#3b82f6',
    glow: '#2563eb',
    emoji: '🌌',
    tiers: [
      { points: 500,   reward: { type: 'tokens', amount: 2000 },                        label: '+2.000 Tokens',            icon: '🪙' },
      { points: 2000,  reward: { type: 'skin', id: 'cosmic', name: 'Cosmic Rider' },    label: 'Cosmic Rider Skin',        icon: '🌌' },
      { points: 5000,  reward: { type: 'tokens', amount: 5000 },                        label: '+5.000 Tokens',            icon: '🪙' },
      { points: 10000, reward: { type: 'frame', id: 'cosmic', name: 'Cosmic Frame' },   label: 'Cosmic Profil-Rahmen',     icon: '💫' },
      { points: 20000, reward: { type: 'skin', id: 'ice', name: 'Ice Blade' },          label: 'Ice Blade Skin',           icon: '❄️' },
      { points: 35000, reward: { type: 'title', id: 'cosmic_master', name: '🌌 COSMIC MASTER' }, label: 'Exkl. Titel: COSMIC MASTER', icon: '👑' },
    ],
  },
];

// Hilfsfunktion: Aktuelle Woche ermitteln
export function getCurrentWeekReward() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  return WEEKLY_REWARDS.find(w => today >= w.startDate && today <= w.endDate) || null;
}

// Wöchentliche Punkte: beste Scores der Woche summiert (aus localStorage)
export function getWeeklyPoints() {
  const key = `neon_weekly_pts_${new Date().toISOString().slice(0, 10).slice(0, 7)}`;
  return parseInt(localStorage.getItem(key) || '0');
}

export function addWeeklyPoints(pts) {
  const week = WEEKLY_REWARDS.find(w => {
    const today = new Date().toISOString().split('T')[0];
    return today >= w.startDate && today <= w.endDate;
  });
  if (!week) return;
  const key = `neon_weekly_pts_w${week.week}_2026`;
  const prev = parseInt(localStorage.getItem(key) || '0');
  localStorage.setItem(key, (prev + pts).toString());
  return prev + pts;
}

export function getWeeklyPtsForWeek(week) {
  const key = `neon_weekly_pts_w${week}_2026`;
  return parseInt(localStorage.getItem(key) || '0');
}

// Reward claimen
async function claimReward(user, tier, weekNum, onSuccess) {
  const claimedKey = `neon_weekly_claimed_w${weekNum}_t${tier.points}`;
  if (localStorage.getItem(claimedKey) === 'true') {
    toast.error('Bereits eingesammelt!');
    return;
  }

  try {
    const { type, id, name, amount } = tier.reward;
    let updateData = {};

    if (type === 'tokens') {
      updateData.tokens = (user.tokens || 0) + amount;
    } else if (type === 'skin') {
      // Skin in neon_dash_upgrades.owned_skins hinzufügen
      const currentUpgrades = user.neon_dash_upgrades || {};
      const ownedSkins = currentUpgrades.owned_skins || ['default'];
      if (!ownedSkins.includes(id)) {
        updateData.neon_dash_upgrades = { ...currentUpgrades, owned_skins: [...ownedSkins, id] };
      }
    } else if (type === 'frame') {
      // Profil-Rahmen
      const ownedFrames = user.owned_frames || [];
      if (!ownedFrames.includes(id)) {
        updateData.owned_frames = [...ownedFrames, id];
      }
    } else if (type === 'badge') {
      const ownedBadges = user.owned_badges || [];
      if (!ownedBadges.includes(id)) {
        updateData.owned_badges = [...ownedBadges, id];
        updateData.active_badge = id;
      }
    } else if (type === 'title') {
      const ownedTitles = user.owned_titles || [];
      if (!ownedTitles.includes(id)) {
        updateData.owned_titles = [...ownedTitles, id];
        updateData.active_title = name;
      }
    }

    if (Object.keys(updateData).length > 0) {
      const updated = await base44.entities.AppUser.update(user.id, updateData);
      localStorage.setItem('app_user', JSON.stringify(updated));
      window.dispatchEvent(new Event('user-updated'));
    }

    localStorage.setItem(claimedKey, 'true');
    toast.success(`🎁 ${tier.label} eingesammelt!`);
    onSuccess?.();
  } catch (e) {
    toast.error('Fehler beim Einsammeln');
  }
}

export default function NeonDashWeeklyRewards({ user, onClose }) {
  const [claiming, setClaiming] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const currentWeek = getCurrentWeekReward();
  if (!currentWeek) return null;

  const weeklyPts = getWeeklyPtsForWeek(currentWeek.week);
  const totalTarget = currentWeek.tiers[currentWeek.tiers.length - 1].points;
  const pct = Math.min(100, (weeklyPts / totalTarget) * 100);

  const handleClaim = async (tier) => {
    if (!user) return;
    const claimedKey = `neon_weekly_claimed_w${currentWeek.week}_t${tier.points}`;
    if (localStorage.getItem(claimedKey) === 'true') return;
    if (weeklyPts < tier.points) return;

    setClaiming(tier.points);
    await claimReward(user, tier, currentWeek.week, () => setRefreshKey(k => k + 1));
    setClaiming(null);
  };

  const daysLeft = Math.max(0, Math.ceil((new Date(currentWeek.endDate) - new Date()) / (1000 * 60 * 60 * 24)));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="pointer-events-auto bg-black/90 backdrop-blur-2xl rounded-3xl border w-[92%] max-w-sm max-h-[85vh] flex flex-col overflow-hidden"
      style={{ borderColor: currentWeek.color + '50', boxShadow: `0 0 60px ${currentWeek.color}20` }}
    >
      {/* Header */}
      <div className="relative p-5 pb-4 flex-shrink-0"
        style={{ background: `linear-gradient(135deg, ${currentWeek.color}15, transparent)` }}>
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: `linear-gradient(${currentWeek.color} 1px, transparent 1px), linear-gradient(90deg, ${currentWeek.color} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
              style={{ background: currentWeek.color + '20', border: `1px solid ${currentWeek.color}40` }}>
              {currentWeek.emoji}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: currentWeek.color }}>Woche {currentWeek.week} · Exklusiv</p>
              <h3 className="text-lg font-black text-white leading-tight">{currentWeek.theme}</h3>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
              <Clock className="w-3 h-3" /> {daysLeft}d
            </div>
            {onClose && (
              <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-1">
          <div className="flex justify-between text-[10px] mb-1.5">
            <span className="text-white/40 font-bold">Wochenpunkte</span>
            <span className="font-black" style={{ color: currentWeek.color }}>{weeklyPts.toLocaleString()} / {totalTarget.toLocaleString()}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ background: `linear-gradient(90deg, ${currentWeek.glow}, ${currentWeek.color})` }} />
          </div>
          <p className="text-[9px] text-white/30 mt-1">Punkte werden pro Run addiert</p>
        </div>
      </div>

      {/* Tiers */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-4 space-y-2">
        {currentWeek.tiers.map((tier, idx) => {
          const claimedKey = `neon_weekly_claimed_w${currentWeek.week}_t${tier.points}`;
          const claimed = localStorage.getItem(claimedKey) === 'true';
          const unlocked = weeklyPts >= tier.points;
          const canClaim = unlocked && !claimed;

          return (
            <motion.div key={tier.points}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.06 }}
              className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                claimed ? 'bg-green-500/10 border-green-500/25' :
                canClaim ? 'border-opacity-60' :
                'bg-white/[0.03] border-white/8 opacity-60'
              }`}
              style={canClaim ? { background: currentWeek.color + '12', borderColor: currentWeek.color + '45' } : {}}>
              {/* Points milestone */}
              <div className="flex-shrink-0 w-12 text-center">
                <p className="font-black text-xs" style={{ color: unlocked ? currentWeek.color : 'rgba(255,255,255,0.3)' }}>
                  {tier.points >= 1000 ? `${tier.points / 1000}k` : tier.points}
                </p>
                <p className="text-[9px] text-white/20">Pkt</p>
              </div>

              {/* Reward info */}
              <div className="text-xl flex-shrink-0">{tier.icon}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold truncate ${claimed ? 'text-green-400' : unlocked ? 'text-white' : 'text-white/40'}`}>
                  {tier.label}
                </p>
                {tier.reward.type === 'skin' && (
                  <p className="text-[10px] text-white/30">Neon Dash Schiff-Skin</p>
                )}
                {tier.reward.type === 'frame' && (
                  <p className="text-[10px] text-white/30">Profil-Rahmen · Sofort ausrüstbar</p>
                )}
                {tier.reward.type === 'title' && (
                  <p className="text-[10px] text-white/30">Exklusiver Titel · Profil & Chat</p>
                )}
                {tier.reward.type === 'badge' && (
                  <p className="text-[10px] text-white/30">Profilabzeichen · Sofort aktiv</p>
                )}
              </div>

              {/* Action */}
              <div className="flex-shrink-0">
                {claimed ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : canClaim ? (
                  <button
                    onClick={() => handleClaim(tier)}
                    disabled={claiming === tier.points}
                    className="px-3 py-1.5 rounded-xl text-xs font-black text-black transition-all active:scale-95 disabled:opacity-60"
                    style={{ background: `linear-gradient(135deg, ${currentWeek.color}, ${currentWeek.glow})` }}>
                    {claiming === tier.points ? '...' : 'Claim'}
                  </button>
                ) : (
                  <Lock className="w-4 h-4 text-white/20" />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Upcoming weeks teaser */}
      <div className="px-4 pb-4 pt-2 flex-shrink-0 border-t border-white/5">
        <p className="text-[10px] text-white/25 text-center font-bold mb-2">Nächste Wochen</p>
        <div className="flex gap-1.5 justify-center">
          {WEEKLY_REWARDS.filter(w => w.week !== currentWeek.week).map(w => (
            <div key={w.week} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: w.color }}>
              {w.emoji} {w.theme}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}