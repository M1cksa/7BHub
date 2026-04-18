import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Gift, Zap, Crown, Star, Flame, Sparkles, Trophy, X, Lock, CheckCircle2, ChevronRight, Coins } from 'lucide-react';

// ─── 30-Day Reward Schedule ───────────────────────────────────────────────────
export const DAILY_REWARDS = [
  // Week 1 - Token starters
  { day: 1,  type: 'tokens',    value: 50,   label: '50 Tokens',         icon: '🪙', color: '#f59e0b', tier: 'common' },
  { day: 2,  type: 'tokens',    value: 75,   label: '75 Tokens',         icon: '🪙', color: '#f59e0b', tier: 'common' },
  { day: 3,  type: 'badge',     value: 'daily_novice', label: 'Anfänger Badge',  icon: '🏅', color: '#64748b', tier: 'common' },
  { day: 4,  type: 'tokens',    value: 100,  label: '100 Tokens',        icon: '🪙', color: '#f59e0b', tier: 'common' },
  { day: 5,  type: 'animation', value: 'sparkle', label: 'Sparkle Effekt',  icon: '✨', color: '#06b6d4', tier: 'rare' },
  { day: 6,  type: 'tokens',    value: 125,  label: '125 Tokens',        icon: '🪙', color: '#f59e0b', tier: 'common' },
  { day: 7,  type: 'theme',     value: 'aurora', label: 'Aurora Theme',      icon: '🌌', color: '#8b5cf6', tier: 'rare', special: true },

  // Week 2 - Mid-tier rewards
  { day: 8,  type: 'tokens',    value: 150,  label: '150 Tokens',        icon: '🪙', color: '#f59e0b', tier: 'common' },
  { day: 9,  type: 'frame',     value: 'daily_aurora', label: 'Aurora Rahmen',     icon: '🖼️', color: '#7c3aed', tier: 'rare' },
  { day: 10, type: 'tokens',    value: 200,  label: '200 Tokens',        icon: '🪙', color: '#f59e0b', tier: 'rare' },
  { day: 11, type: 'badge',     value: 'daily_veteran', label: 'Veteran Badge',     icon: '🎖️', color: '#3b82f6', tier: 'rare' },
  { day: 12, type: 'tokens',    value: 250,  label: '250 Tokens',        icon: '🪙', color: '#f59e0b', tier: 'rare' },
  { day: 13, type: 'animation', value: 'fire_trail', label: 'Feuer Spur',          icon: '🔥', color: '#ef4444', tier: 'epic' },
  { day: 14, type: 'theme',     value: 'neon', label: 'Neon Theme',        icon: '💜', color: '#ec4899', tier: 'epic', special: true },

  // Week 3 - Epic tier
  { day: 15, type: 'tokens',    value: 300,  label: '300 Tokens',        icon: '🪙', color: '#f59e0b', tier: 'rare' },
  { day: 16, type: 'frame',     value: 'daily_cosmos', label: 'Cosmos Rahmen',     icon: '🖼️', color: '#4f46e5', tier: 'epic' },
  { day: 17, type: 'tokens',    value: 350,  label: '350 Tokens',        icon: '🪙', color: '#f59e0b', tier: 'rare' },
  { day: 18, type: 'badge',     value: 'daily_elite', label: 'Elite Badge',        icon: '💎', color: '#06b6d4', tier: 'epic' },
  { day: 19, type: 'tokens',    value: 400,  label: '400 Tokens',        icon: '🪙', color: '#f59e0b', tier: 'epic' },
  { day: 20, type: 'animation', value: 'galaxy_swirl', label: 'Galaxy Wirbel',     icon: '🌀', color: '#7c3aed', tier: 'epic' },
  { day: 21, type: 'theme',     value: 'galaxy', label: 'Galaxy Theme',      icon: '🌌', color: '#4338ca', tier: 'epic', special: true },

  // Week 4 - Legendary tier
  { day: 22, type: 'tokens',    value: 500,  label: '500 Tokens',        icon: '🪙', color: '#f59e0b', tier: 'epic' },
  { day: 23, type: 'frame',     value: 'daily_phoenix', label: 'Phoenix Rahmen',   icon: '🖼️', color: '#dc2626', tier: 'legendary' },
  { day: 24, type: 'tokens',    value: 600,  label: '600 Tokens',        icon: '🪙', color: '#f59e0b', tier: 'epic' },
  { day: 25, type: 'badge',     value: 'daily_legend', label: 'Legende Badge',     icon: '👑', color: '#f59e0b', tier: 'legendary' },
  { day: 26, type: 'tokens',    value: 700,  label: '700 Tokens',        icon: '🪙', color: '#f59e0b', tier: 'legendary' },
  { day: 27, type: 'animation', value: 'lightning', label: 'Blitz Effekt',      icon: '⚡', color: '#f59e0b', tier: 'legendary' },
  { day: 28, type: 'theme',     value: 'obsidian', label: 'Obsidian Theme',    icon: '⬛', color: '#374151', tier: 'legendary', special: true },

  // Final days - Ultimate
  { day: 29, type: 'tokens',    value: 1000, label: '1.000 Tokens',      icon: '🪙', color: '#f59e0b', tier: 'legendary' },
  { day: 30, type: 'title',     value: 'daily_champion', label: 'Champion Titel',  icon: '🏆', color: '#fbbf24', tier: 'legendary', special: true },
];

const TIER_CONFIG = {
  common:    { label: 'Common',    color: '#94a3b8', bg: 'rgba(148,163,184,0.1)',  border: 'rgba(148,163,184,0.25)', glow: 'rgba(148,163,184,0.2)' },
  rare:      { label: 'Rare',      color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.35)',  glow: 'rgba(59,130,246,0.25)' },
  epic:      { label: 'Epic',      color: '#7c3aed', bg: 'rgba(124,58,237,0.12)', border: 'rgba(124,58,237,0.4)',   glow: 'rgba(124,58,237,0.3)' },
  legendary: { label: 'Legendary', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.45)',  glow: 'rgba(245,158,11,0.35)' },
};

// ─── Confetti ─────────────────────────────────────────────────────────────────
function RewardConfetti({ tier }) {
  const colors = tier === 'legendary' ? ['#f59e0b','#fbbf24','#fde68a','#ef4444'] : tier === 'epic' ? ['#7c3aed','#a78bfa','#06b6d4','#818cf8'] : ['#3b82f6','#60a5fa','#06b6d4'];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div key={i}
          className="absolute w-2 h-2 rounded-sm"
          style={{ backgroundColor: colors[i % colors.length], top: '40%', left: `${20 + Math.random() * 60}%` }}
          initial={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{ y: -150 - Math.random() * 100, opacity: 0, rotate: Math.random() * 360, scale: 0.3 }}
          transition={{ duration: 0.8 + Math.random() * 0.5, ease: 'easeOut', delay: Math.random() * 0.2 }}
        />
      ))}
    </div>
  );
}

// ─── Single Reward Card ───────────────────────────────────────────────────────
function RewardCard({ reward, isClaimed, isCurrent, isLocked, onClick }) {
  const tier = TIER_CONFIG[reward.tier];
  return (
    <motion.button
      whileHover={isCurrent && !isClaimed ? { scale: 1.05, y: -2 } : {}}
      whileTap={isCurrent && !isClaimed ? { scale: 0.96 } : {}}
      onClick={() => isCurrent && !isClaimed && onClick(reward)}
      className="relative flex flex-col items-center gap-1.5 p-2.5 rounded-2xl transition-all overflow-hidden"
      style={{
        background: isClaimed ? 'rgba(16,185,129,0.1)' : isCurrent ? tier.bg : 'rgba(255,255,255,0.02)',
        border: `1px solid ${isClaimed ? 'rgba(16,185,129,0.4)' : isCurrent ? tier.border : 'rgba(255,255,255,0.06)'}`,
        boxShadow: isCurrent && !isClaimed ? `0 0 20px ${tier.glow}` : 'none',
        cursor: isCurrent && !isClaimed ? 'pointer' : 'default',
        minWidth: '68px',
      }}
    >
      {/* Streak fire glow for current */}
      {isCurrent && !isClaimed && (
        <motion.div className="absolute inset-0 rounded-2xl"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ background: `radial-gradient(circle at center, ${tier.glow} 0%, transparent 70%)` }}
        />
      )}

      {/* Day number */}
      <span className="text-[10px] font-black" style={{ color: isClaimed ? '#34d399' : isCurrent ? tier.color : 'rgba(255,255,255,0.25)' }}>
        Tag {reward.day}
      </span>

      {/* Icon / State */}
      <div className="relative w-10 h-10 rounded-xl flex items-center justify-center text-xl"
        style={{ background: isClaimed ? 'rgba(16,185,129,0.15)' : isCurrent ? `${tier.color}20` : 'rgba(255,255,255,0.04)' }}>
        {isLocked && !isCurrent ? (
          <Lock className="w-4 h-4 text-white/15" />
        ) : isClaimed ? (
          <CheckCircle2 className="w-5 h-5 text-green-400" />
        ) : (
          <span style={{ filter: isLocked ? 'grayscale(1) opacity(0.3)' : 'none' }}>{reward.icon}</span>
        )}

        {reward.special && !isClaimed && !isLocked && (
          <motion.div className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center"
            animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
            style={{ background: tier.color }}>
            <Star className="w-1.5 h-1.5 text-white fill-white" />
          </motion.div>
        )}
      </div>

      {/* Label */}
      <span className="text-[9px] font-semibold text-center leading-tight line-clamp-2 max-w-[64px]"
        style={{ color: isClaimed ? '#6ee7b7' : isCurrent ? tier.color : 'rgba(255,255,255,0.2)' }}>
        {reward.label}
      </span>

      {/* Tier badge */}
      {!isLocked && !isClaimed && (
        <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full"
          style={{ background: `${tier.color}20`, color: tier.color, border: `1px solid ${tier.color}40` }}>
          {tier.label}
        </span>
      )}
    </motion.button>
  );
}

// ─── Claim Animation Overlay ─────────────────────────────────────────────────
function ClaimOverlay({ reward, onClose }) {
  const tier = TIER_CONFIG[reward.tier];
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)' }}>
      <RewardConfetti tier={reward.tier} />
      <motion.div
        initial={{ scale: 0.5, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="relative flex flex-col items-center gap-5 p-10 rounded-3xl text-center max-w-sm mx-4"
        style={{ background: 'rgba(5,5,15,0.95)', border: `2px solid ${tier.border}`, boxShadow: `0 0 80px ${tier.glow}` }}>

        {/* Animated glow bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-3xl"
          style={{ background: `linear-gradient(90deg, transparent, ${tier.color}, transparent)` }} />

        <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl">{reward.icon}</motion.div>

        <div>
          <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: tier.color }}>{tier.label}</p>
          <h2 className="text-2xl font-black text-white mb-1">Tag {reward.day} ✓</h2>
          <p className="text-white/60">{reward.label} erhalten!</p>
        </div>

        {reward.type === 'tokens' && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl"
            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)' }}>
            <Coins className="w-5 h-5 text-yellow-400" />
            <span className="text-2xl font-black text-yellow-300">+{reward.value}</span>
          </motion.div>
        )}

        {reward.special && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: `${tier.color}20`, color: tier.color, border: `1px solid ${tier.color}40` }}>
            🎉 Exklusiv für Streaks freigeschaltet!
          </motion.div>
        )}

        <button onClick={onClose} className="text-white/30 hover:text-white text-sm transition-colors">Schließen</button>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DailyLoginReward({ user, onUserUpdate }) {
  const [claimingReward, setClaimingReward] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  if (!user) return null;

  const streak = user.daily_login_streak || 0;
  const claimedDays = user.daily_login_claimed_days || [];
  const lastClaim = user.daily_login_last_claim ? new Date(user.daily_login_last_claim) : null;

  // Check if today is claimable
  const now = new Date();
  const todayStr = now.toDateString();
  const lastClaimStr = lastClaim ? lastClaim.toDateString() : null;
  const alreadyClaimedToday = lastClaimStr === todayStr;

  // Current day in cycle (1-30), reset after 30
  const currentDay = (streak % 30) + (alreadyClaimedToday ? 0 : 1);
  const displayDay = Math.min(currentDay, 30);
  const todayReward = DAILY_REWARDS.find(r => r.day === displayDay);

  const handleClaim = async () => {
    if (alreadyClaimedToday || !todayReward || isClaiming) return;
    setIsClaiming(true);

    const reward = todayReward;
    const newStreak = streak + 1;
    const newClaimedDays = [...claimedDays, displayDay].filter((v, i, a) => a.indexOf(v) === i);

    // Build update payload
    const update = {
      daily_login_streak: newStreak,
      daily_login_last_claim: now.toISOString(),
      daily_login_claimed_days: newStreak % 30 === 0 ? [] : newClaimedDays,
    };

    // Apply reward
    let showOwnOverlay = true;
    if (reward.type === 'tokens') {
      update.tokens = (user.tokens || 0) + reward.value;
      window.dispatchEvent(new CustomEvent('token-reward', { detail: { amount: reward.value, source: 'Täglicher Login', rarity: reward.tier } }));
      showOwnOverlay = false;
    } else if (reward.type === 'theme') {
      update.owned_themes = [...new Set([...(user.owned_themes || []), reward.value])];
    } else if (reward.type === 'frame') {
      update.frame_style = reward.value;
    } else if (reward.type === 'animation') {
      update.owned_animations = [...new Set([...(user.owned_animations || []), reward.value])];
    } else if (reward.type === 'badge') {
      update.owned_badges = [...new Set([...(user.owned_badges || []), reward.value])];
      update.active_badge = reward.value;
    } else if (reward.type === 'title') {
      update.owned_badges = [...new Set([...(user.owned_badges || []), reward.value])];
    }

    await base44.entities.AppUser.update(user.id, update).catch(() => {});
    const updated = { ...user, ...update };
    localStorage.setItem('app_user', JSON.stringify(updated));
    window.dispatchEvent(new Event('user-updated'));
    onUserUpdate?.(updated);
    if (showOwnOverlay) setClaimingReward(reward);
    setIsClaiming(false);
  };

  if (!todayReward) return null;
  const todayTier = TIER_CONFIG[todayReward.tier];

  return (
    <>
      <AnimatePresence>
        {claimingReward && <ClaimOverlay reward={claimingReward} onClose={() => setClaimingReward(null)} />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl overflow-hidden"
        style={{ background: 'rgba(5,5,15,0.8)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}
      >
        {/* Top glow */}
        <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, transparent, ${todayTier.color}, rgba(6,182,212,0.6), transparent)` }} />

        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${todayTier.color}30, ${todayTier.color}10)`, border: `1px solid ${todayTier.border}` }}>
              <Gift className="w-5 h-5" style={{ color: todayTier.color }} />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-white font-black text-sm">Tägliche Belohnung</p>
                {streak >= 7 && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black"
                    style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.35)', color: '#fbbf24' }}>
                    <Flame className="w-3 h-3" /> {streak}
                  </div>
                )}
              </div>
              <p className="text-white/35 text-xs">
                {alreadyClaimedToday ? `Tag ${streak} abgeholt ✓` : `Tag ${displayDay} bereit!`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Claim button */}
            {!alreadyClaimedToday ? (
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={handleClaim}
                disabled={isClaiming}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${todayTier.color}, rgba(6,182,212,0.9))`, color: '#fff', boxShadow: `0 0 20px ${todayTier.glow}`, opacity: isClaiming ? 0.7 : 1 }}
              >
                <motion.div className="absolute inset-0" animate={{ x: ['-100%', '100%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)', width: '50%' }} />
                <Sparkles className="w-3.5 h-3.5 relative" />
                <span className="relative">Abholen!</span>
              </motion.button>
            ) : (
              <div className="px-3 py-1.5 rounded-xl text-xs font-bold text-green-400"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                ✓ Heute erhalten
              </div>
            )}

            <button onClick={() => setExpanded(!expanded)}
              className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/5 transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <ChevronRight className={`w-4 h-4 text-white/40 transition-transform duration-300 ${expanded ? 'rotate-90' : ''}`} />
            </button>
          </div>
        </div>

        {/* Today's preview (always visible) */}
        {!alreadyClaimedToday && todayReward && (
          <div className="px-4 pb-3">
            <div className="flex items-center gap-3 p-3 rounded-2xl"
              style={{ background: todayTier.bg, border: `1px solid ${todayTier.border}` }}>
              <span className="text-2xl">{todayReward.icon}</span>
              <div>
                <p className="text-white font-bold text-sm">{todayReward.label}</p>
                <p className="text-white/40 text-xs">{todayTier.label} Belohnung</p>
              </div>
              {streak >= 2 && (
                <div className="ml-auto text-xs font-bold flex items-center gap-1 px-2 py-1 rounded-lg"
                  style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.1)' }}>
                  <Flame className="w-3 h-3" /> Streak ×{Math.floor(streak / 7) + 1}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Expanded 30-day calendar */}
        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-white/[0.06]">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-black uppercase tracking-widest text-white/30">30-Tage Kalender</p>
                  <p className="text-xs text-white/20">{claimedDays.length}/30 abgeholt</p>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 rounded-full bg-white/5 mb-4 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(claimedDays.length / 30) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${todayTier.color}, rgba(6,182,212,0.8))` }} />
                </div>

                {/* Grid */}
                <div className="grid grid-cols-5 gap-2">
                  {DAILY_REWARDS.map(reward => {
                    const isClaimed = claimedDays.includes(reward.day);
                    const isCurrent = reward.day === displayDay && !alreadyClaimedToday;
                    const isLocked = !isClaimed && reward.day > displayDay;
                    return (
                      <RewardCard key={reward.day} reward={reward}
                        isClaimed={isClaimed} isCurrent={isCurrent} isLocked={isLocked}
                        onClick={handleClaim} />
                    );
                  })}
                </div>

                {/* Milestone hints */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {[
                    { day: 7,  label: 'Woche 1', icon: '🌟', reward: 'Aurora Theme' },
                    { day: 14, label: 'Woche 2', icon: '💜', reward: 'Neon Theme' },
                    { day: 21, label: 'Woche 3', icon: '🌌', reward: 'Galaxy Theme' },
                    { day: 30, label: 'Ziel!',   icon: '🏆', reward: 'Champion Titel' },
                  ].map(m => (
                    <div key={m.day} className="flex items-center gap-2 p-2 rounded-xl"
                      style={{ background: claimedDays.includes(m.day) ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.02)', border: `1px solid ${claimedDays.includes(m.day) ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)'}` }}>
                      <span className="text-base">{m.icon}</span>
                      <div>
                        <p className="text-white/60 text-[10px] font-bold">{m.label} – Tag {m.day}</p>
                        <p className="text-white/30 text-[9px]">{m.reward}</p>
                      </div>
                      {claimedDays.includes(m.day) && <CheckCircle2 className="w-3.5 h-3.5 text-green-400 ml-auto" />}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}