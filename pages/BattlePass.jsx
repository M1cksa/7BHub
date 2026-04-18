import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Flame, Lock, Crown, Check, Sparkles, ChevronLeft, Gift, Coins, History, Zap, Star, Trophy, Shield, Sword, ChevronRight } from 'lucide-react';
import BPPokemonRewards, { BP_POKEMON_MILESTONES } from '@/components/battlepass/BPPokemonRewards';
import BPQuestsTab from '@/components/battlepass/BPQuestsTab';
import { Button } from '@/components/ui/button';
import { BATTLE_PASS_ACTIONS, getActiveSeason, getActiveBonuses } from '@/components/battlepass/BattlePassConfig';
import { SEASON_2_START, VOID_RIFT_KEY_LEVELS, PRO_PASS_ABILITIES } from '@/components/battlepass/Season2Config';
import { SHARD_DROPS, SHARD_TIERS } from '@/components/battlepass/ShardConfig';
import ShardClaimAnimation from '@/components/battlepass/ShardClaimAnimation';
import confetti from 'canvas-confetti';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';

// ─── Rarity config ───────────────────────────────────────
const RARITY = {
  rare:      { glow: '#3b82f6', border: 'rgba(59,130,246,0.5)',  bg: 'rgba(59,130,246,0.12)',  label: 'Rare',      textCls: 'text-blue-400',    badgeCls: 'bg-blue-500/10 border-blue-400/30 text-blue-400' },
  epic:      { glow: '#a855f7', border: 'rgba(168,85,247,0.5)',  bg: 'rgba(168,85,247,0.12)', label: 'Epic',      textCls: 'text-purple-400',  badgeCls: 'bg-purple-500/10 border-purple-400/30 text-purple-400' },
  legendary: { glow: '#f59e0b', border: 'rgba(245,158,11,0.6)',  bg: 'rgba(245,158,11,0.12)', label: 'Legendary', textCls: 'text-yellow-400',  badgeCls: 'bg-yellow-500/10 border-yellow-400/30 text-yellow-400' },
  unique:    { glow: '#ec4899', border: 'rgba(236,72,153,0.6)',  bg: 'rgba(236,72,153,0.12)', label: 'Unique',    textCls: 'text-pink-400',    badgeCls: 'bg-pink-500/10 border-pink-400/30 text-pink-400' },
};

// ─── Season 2 Countdown ──────────────────────────────────
function Season2Countdown({ targetDate }) {
  const TARGET = targetDate || SEASON_2_START;
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft());

  function getTimeLeft() {
    // TARGET ist bereits ein Date-Objekt; Vergleich in Millisekunden
    const now = Date.now();
    const target = typeof TARGET === 'string' ? new Date(TARGET).getTime() : TARGET.getTime();
    const diff = target - now;
    if (diff <= 0) return null;
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!timeLeft) return null;

  const units = [
    { label: 'Tage', value: timeLeft.days },
    { label: 'Stunden', value: timeLeft.hours },
    { label: 'Minuten', value: timeLeft.minutes },
    { label: 'Sekunden', value: timeLeft.seconds },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="mt-20 rounded-3xl p-6 sm:p-8 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.07), rgba(168,85,247,0.1))', border: '1px solid rgba(6,182,212,0.2)' }}>
      {/* Animated top border */}
      <motion.div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, #06b6d4, #a855f7, transparent)' }}
        animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 2.5 }} />

      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-3 border"
          style={{ background: 'rgba(6,182,212,0.1)', borderColor: 'rgba(6,182,212,0.35)', color: '#67e8f9' }}>
          <Zap className="w-3 h-3" /> Season 2 startet bald
        </div>
        <h3 className="text-2xl sm:text-3xl font-black mb-1"
          style={{ background: 'linear-gradient(90deg, #67e8f9, #e879f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          NEON APOCALYPSE
        </h3>
        <p className="text-white/30 text-xs">1. April 2026</p>
      </div>

      <div className="flex items-center justify-center gap-3 sm:gap-5">
        {units.map(({ label, value }, i) => (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center">
              <motion.div
                key={value}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-14 sm:w-20 h-14 sm:h-20 rounded-2xl flex items-center justify-center font-black text-2xl sm:text-4xl"
                style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(6,182,212,0.25)', boxShadow: '0 0 20px rgba(6,182,212,0.1)', color: '#e2e8f0' }}>
                {String(value).padStart(2, '0')}
              </motion.div>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/30 mt-1.5">{label}</span>
            </div>
            {i < units.length - 1 && (
              <span className="text-2xl font-black text-white/20 mb-5" style={{ color: '#67e8f9' }}>:</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Animated star canvas background ─────────────────────
function StarField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4,
      speed: 0.1 + Math.random() * 0.3,
      opacity: 0.2 + Math.random() * 0.6,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.opacity})`;
        ctx.fill();
        s.y += s.speed;
        if (s.y > canvas.height) { s.y = 0; s.x = Math.random() * canvas.width; }
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

// ─── Reward Card ─────────────────────────────────────────
function RewardCard({ reward, canClaim, claimed, locked, onClaim, premium = false }) {
  const r = RARITY[reward.rarity] || RARITY.rare;
  return (
    <motion.div
      onClick={() => canClaim && !locked && onClaim()}
      whileHover={canClaim && !locked ? { scale: 1.05, y: -5 } : { scale: 1.02 }}
      whileTap={canClaim && !locked ? { scale: 0.95 } : {}}
      className={`relative flex flex-col items-center justify-center text-center rounded-2xl p-2.5 select-none overflow-hidden group ${canClaim && !locked ? 'cursor-pointer' : 'cursor-default'}`}
      style={{
        width: premium ? 120 : 104, height: premium ? 128 : 108,
        background: claimed ? 'rgba(255,255,255,0.02)' : canClaim && !locked ? r.bg : 'rgba(255,255,255,0.03)',
        border: `1px solid ${claimed ? 'rgba(255,255,255,0.05)' : canClaim && !locked ? r.border : 'rgba(255,255,255,0.08)'}`,
        boxShadow: canClaim && !locked ? `0 0 25px ${r.glow}40, inset 0 0 20px ${r.glow}15` : 'none',
        opacity: locked ? 0.4 : 1,
        backdropFilter: 'blur(10px)'
      }}
    >
      {/* Shine effect on claimable */}
      {canClaim && !locked && (
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none"
          initial={{ x: '-150%' }}
          animate={{ x: '150%' }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "linear", repeatDelay: 0.5 }}
        />
      )}
      
      {/* Claimed overlay */}
      {claimed && (
        <div className="absolute inset-0 flex items-center justify-center z-20 backdrop-blur-[2px]"
          style={{ background: 'rgba(34,197,94,0.05)' }}>
          <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-400/30 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)]">
            <Check className="w-5 h-5 text-green-400" />
          </div>
        </div>
      )}
      {/* Lock */}
      {locked && !claimed && <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-md"><Lock className="w-3 h-3 text-white/40" /></div>}
      {/* Premium crown */}
      {premium && !locked && !claimed && <div className="absolute top-2 left-2"><Crown className="w-4 h-4 text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]" /></div>}

      <motion.div 
        animate={canClaim && !locked ? { y: [0, -3, 0] } : {}} 
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        className={`mb-2 ${premium ? 'text-4xl' : 'text-3xl'} drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] z-10`}
      >
        {reward.icon}
      </motion.div>
      <div className="text-[10px] font-bold text-white/90 leading-tight px-1 z-10">{reward.label}</div>
      {reward.rarity && (
        <div className={`mt-1.5 text-[8px] font-black px-2 py-0.5 rounded-full border shadow-sm z-10 ${r.badgeCls}`}>
          {r.label}
        </div>
      )}

      {/* Pulse ring when claimable */}
      {canClaim && !locked && (
        <motion.div className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ border: `1.5px solid ${r.glow}`, boxShadow: `inset 0 0 15px ${r.glow}30` }}
          animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 2 }} />
      )}
    </motion.div>
  );
}

// ─── Level node ──────────────────────────────────────────
function LevelNode({ level, isCurrent, isPast, isBonus, bonusCanClaim, theme }) {
  return (
    <div className="relative z-10 flex items-center justify-center my-2" style={{ width: 56, height: 56 }}>
      {isPast && <div className="absolute inset-0 rounded-full" style={{ background: theme?.nodePastBg?.replace('0.35', '0.2') || 'rgba(168,85,247,0.2)' }} />}
      {isCurrent && <motion.div className="absolute inset-0 rounded-full" style={{ background: theme?.nodePulse || 'rgba(217,70,239,0.25)' }} animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 2 }} />}
      <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-base z-10 border-[3px] transition-all shadow-lg"
        style={{
          background: isBonus ? 'linear-gradient(135deg,#f59e0b,#ef4444)' : isCurrent ? (theme?.nodeCurrentBg || 'linear-gradient(135deg,#a855f7,#ec4899)') : isPast ? (theme?.nodePastBg || 'rgba(168,85,247,0.35)') : 'rgba(0,0,0,0.8)',
          borderColor: isBonus ? '#fbbf24' : isCurrent ? (theme?.nodeCurrentBorder || '#e879f9') : isPast ? (theme?.nodePastBorder || '#7c3aed') : 'rgba(255,255,255,0.15)',
          boxShadow: isCurrent ? (theme?.nodeCurrentGlow || '0 0 25px rgba(217,70,239,0.7)') : isBonus ? '0 0 20px rgba(245,158,11,0.6)' : 'inset 0 0 10px rgba(255,255,255,0.05)',
          color: isPast || isCurrent || isBonus ? '#fff' : 'rgba(255,255,255,0.4)',
        }}>
        {isBonus ? '🎁' : level}
      </div>
    </div>
  );
}

export default function BattlePass() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [claimedReward, setClaimedReward] = useState(null);
  const [claimAllRewards, setClaimAllRewards] = useState(null); // array of rewards for claim-all modal
  const [activeTab, setActiveTab] = useState('track');
  const [shardAnim, setShardAnim] = useState(null); // { tier } for shard drop animation
  const trackRef = useRef(null);
  
  const lw = React.useMemo(() => {
    try { return localStorage.getItem('lightweight_mode') === 'true'; } catch { return false; }
  }, []);

  // We'll add the scroll effect further down where `level` is defined

  useEffect(() => {
    const load = () => { const u = localStorage.getItem('app_user'); if (u) setUser(JSON.parse(u)); };
    load();
    window.addEventListener('user-updated', load);
    return () => window.removeEventListener('user-updated', load);
  }, []);

  const { data: tokenHistory = [] } = useQuery({
    queryKey: ['tokenHistory', user?.id],
    queryFn: () => base44.entities.TokenTransaction.filter({ user_id: user.id }, '-created_date', 50),
    enabled: !!user?.id && activeTab === 'history',
  });

  const { data: leaderboardUsers = [], isLoading: leaderboardLoading } = useQuery({
    queryKey: ['bpLeaderboard'],
    queryFn: async () => {
      const users = await base44.entities.AppUser.list('-bp_level', 100);
      return (users || []).filter(u => (u.bp_level || 1) > 1).slice(0, 100);
    },
    enabled: activeTab === 'leaderboard',
    staleTime: 2 * 60 * 1000,
  });

  // Auto-scroll to current level
  useEffect(() => {
    if (activeTab === 'track' && trackRef.current) {
      const currentLevelEl = trackRef.current.querySelector('[data-current-level="true"]');
      if (currentLevelEl) {
        // Small delay ensures rendering is finished before scrolling
        setTimeout(() => {
          currentLevelEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }, 100);
      }
    }
  }, [activeTab, user?.bp_level]);

  if (!user) return <div className="min-h-screen pt-24 text-center text-white">Bitte einloggen.</div>;

  const activeSeason = getActiveSeason(user);
  const activeBonuses = getActiveBonuses(activeSeason.id);

  const level = user.bp_level || 1;
  const xp = user.bp_xp || 0;
  const isPremium = user.bp_premium || false;
  const claimedFree = user.bp_claimed_free || [];
  const claimedPremium = user.bp_claimed_premium || [];
  const claimedBonusLevels = user.bp_claimed_bonus || [];
  const xpPct = Math.min((xp / activeSeason.xpPerLevel) * 100, 100);
  const overallPct = Math.round(((level - 1) / activeSeason.maxLevel) * 100);

  const handleBuyPremium = async () => {
    if ((user.tokens || 0) < activeSeason.premiumPrice) { toast.error('Nicht genügend Tokens!'); return; }
    setLoading(true);
    try {
      const updated = await base44.entities.AppUser.update(user.id, { tokens: user.tokens - activeSeason.premiumPrice, bp_premium: true });
      await base44.entities.TokenTransaction.create({ user_id: user.id, username: user.username, amount: -activeSeason.premiumPrice, source: `👑 Premium Battle Pass (${activeSeason.name}) gekauft`, category: 'purchase' });
      localStorage.setItem('app_user', JSON.stringify(updated)); setUser(updated);
      window.dispatchEvent(new Event('user-updated'));
      confetti({ particleCount: 200, spread: 90, origin: { y: 0.5 }, colors: ['#ec4899', '#a855f7', '#fbbf24'] });
      toast.success('🎉 Premium Pass freigeschaltet!');
    } catch { toast.error('Fehler beim Kauf'); }
    setLoading(false);
  };

  const handleClaim = async (rewardLevel, type) => {
    const isFree = type === 'free';
    const tier = activeSeason.rewards.find(r => r.level === rewardLevel);
    const rd = isFree ? tier.free : tier.premium;
    let updates = isFree ? { bp_claimed_free: [...claimedFree, rewardLevel] } : { bp_claimed_premium: [...claimedPremium, rewardLevel] };
    if (rd.type === 'tokens') updates.tokens = (user.tokens || 0) + rd.amount;
    if (rd.type === 'badge') updates.owned_badges = [...(user.owned_badges || []), rd.id];
    if (rd.type === 'title') updates.owned_titles = [...(user.owned_titles || []), rd.id];
    if (rd.type === 'chat_color') updates.owned_chat_colors = [...(user.owned_chat_colors || []), rd.id];
    if (rd.type === 'profile_effect') updates.owned_profile_effects = [...(user.owned_profile_effects || []), rd.id];
    if (rd.type === 'frame') updates.owned_frames = [...(user.owned_frames || []), rd.id];
    if (rd.type === 'theme') updates.owned_themes = [...(user.owned_themes || []), rd.id];
    if (rd.type === 'spaceship') {
      const upg = user.neon_dash_upgrades || {};
      const currentSkins = upg.owned_skins || ['default'];
      if (!currentSkins.includes(rd.id)) {
        updates.neon_dash_upgrades = { ...upg, owned_skins: [...currentSkins, rd.id] };
      }
    }
    if (rd.type === 'pokemon') {
      // Exclusive BP Pokémon are stored separately (not in party system)
      const sp = user.pokemon_story_progress || {};
      const currentExclusive = sp.owned_exclusive_pokemon || [];
      if (!currentExclusive.includes(rd.id)) {
        updates.pokemon_story_progress = { ...sp, owned_exclusive_pokemon: [...currentExclusive, rd.id] };
      }
    }
    if (rd.type === 'cursor_trail') updates.owned_cursor_trails = [...(user.owned_cursor_trails || []), rd.id];
    if (rd.type === 'background_animation' || rd.type === 'bg_animation') updates.owned_background_animations = [...(user.owned_background_animations || ['default']), rd.id];
    if (rd.type === 'animation') updates.owned_animations = [...(user.owned_animations || []), rd.id];
    if (rd.type === 'banner') updates.owned_banners = [...(user.owned_banners || []), rd.id];
    if (rd.type === 'video_frame') updates.owned_video_frames = [...(user.owned_video_frames || []), rd.id];
    if (rd.type === 'profile_sound') updates.owned_profile_sounds = [...(user.owned_profile_sounds || []), rd.id];
    if (rd.type === 'emote') updates.owned_emotes = [...(user.owned_emotes || []), rd.id];
    if (rd.type === 'bundle') updates.owned_bundles = [...(user.owned_bundles || []), rd.id];
    if (rd.type === 'game_upgrade') updates.owned_game_upgrades = [...(user.owned_game_upgrades || []), rd.id];

    // ── Shard Drop logic (S2 only) ──
    const shardDrop = activeSeason.id === 'season_2'
      ? SHARD_DROPS.find(s => s.level === rewardLevel && !((user.bp_shard_claimed || []).includes(s.id)))
      : null;
    if (shardDrop) {
      const inv = user.shard_inventory || { spark: 0, void: 0, nova: 0, omega: 0 };
      const amount = shardDrop.amount || 1;
      updates.shard_inventory = { ...inv, [shardDrop.tier]: (inv[shardDrop.tier] || 0) + amount };
      updates.bp_shard_claimed = [...(user.bp_shard_claimed || []), shardDrop.id];
    }

    setLoading(true);
    try {
      const updated = await base44.entities.AppUser.update(user.id, updates);
      if (rd.type === 'tokens') await base44.entities.TokenTransaction.create({ user_id: user.id, username: user.username, amount: rd.amount, source: `🎁 BP Level ${rewardLevel}: ${rd.label}`, category: 'earned' });
      localStorage.setItem('app_user', JSON.stringify(updated)); setUser(updated);
      window.dispatchEvent(new Event('user-updated'));
      // Show shard animation first if there's a shard drop, else show normal reward
      if (shardDrop) {
        setShardAnim({ tier: shardDrop.tier });
      } else {
        setClaimedReward(rd);
        setTimeout(() => confetti({ particleCount: 180, spread: 110, origin: { y: 0.5 } }), 200);
      }
    } catch { toast.error('Fehler'); }
    setLoading(false);
  };

  // ── Claim ALL claimable rewards at once ──────────────────────
  const handleClaimAll = async () => {
    if (loading) return;
    const allClaimable = [];
    let updates = {};
    let totalTokens = 0;

    // Helper: safely append unique IDs to array fields
    const pushUnique = (key, id, fallback) => {
      if (!updates[key]) updates[key] = [...(user[key] || fallback || [])];
      if (!updates[key].includes(id)) updates[key].push(id);
    };

    // Apply a reward object into the updates accumulator
    const applyReward = (rd) => {
      if (!rd || !rd.type) return;
      if (rd.type === 'tokens')                    { totalTokens += rd.amount || 0; }
      else if (rd.type === 'badge')                pushUnique('owned_badges', rd.id, []);
      else if (rd.type === 'title')                pushUnique('owned_titles', rd.id, []);
      else if (rd.type === 'chat_color')           pushUnique('owned_chat_colors', rd.id, []);
      else if (rd.type === 'profile_effect')       pushUnique('owned_profile_effects', rd.id, []);
      else if (rd.type === 'frame')                pushUnique('owned_frames', rd.id, []);
      else if (rd.type === 'theme')                pushUnique('owned_themes', rd.id, ['default']);
      else if (rd.type === 'cursor_trail')         pushUnique('owned_cursor_trails', rd.id, []);
      else if (rd.type === 'background_animation' || rd.type === 'bg_animation') pushUnique('owned_background_animations', rd.id, ['default']);
      else if (rd.type === 'animation')            pushUnique('owned_animations', rd.id, []);
      else if (rd.type === 'banner')               pushUnique('owned_banners', rd.id, []);
      else if (rd.type === 'video_frame')          pushUnique('owned_video_frames', rd.id, []);
      else if (rd.type === 'profile_sound')        pushUnique('owned_profile_sounds', rd.id, []);
      else if (rd.type === 'emote')                pushUnique('owned_emotes', rd.id, []);
      else if (rd.type === 'bundle')               pushUnique('owned_bundles', rd.id, []);
      else if (rd.type === 'game_upgrade')         pushUnique('owned_game_upgrades', rd.id, []);
      else if (rd.type === 'spaceship') {
        if (!updates.neon_dash_upgrades) updates.neon_dash_upgrades = { ...(user.neon_dash_upgrades || {}) };
        const skins = updates.neon_dash_upgrades.owned_skins || user.neon_dash_upgrades?.owned_skins || ['default'];
        if (!skins.includes(rd.id)) updates.neon_dash_upgrades.owned_skins = [...skins, rd.id];
      }
      else if (rd.type === 'pokemon') {
        if (!updates.pokemon_story_progress) updates.pokemon_story_progress = { ...(user.pokemon_story_progress || {}) };
        const owned = updates.pokemon_story_progress.owned_exclusive_pokemon || user.pokemon_story_progress?.owned_exclusive_pokemon || [];
        if (!owned.includes(rd.id)) updates.pokemon_story_progress.owned_exclusive_pokemon = [...owned, rd.id];
      }
    };

    for (const r of activeSeason.rewards) {
      if (r.level > level) continue;

      // Free reward
      if (!claimedFree.includes(r.level) && !(updates.bp_claimed_free || []).includes(r.level)) {
        if (!updates.bp_claimed_free) updates.bp_claimed_free = [...claimedFree];
        updates.bp_claimed_free.push(r.level);
        applyReward(r.free);
        allClaimable.push({ ...r.free, _level: r.level, _type: 'free' });
      }

      // Premium reward
      if (isPremium && !claimedPremium.includes(r.level) && !(updates.bp_claimed_premium || []).includes(r.level)) {
        if (!updates.bp_claimed_premium) updates.bp_claimed_premium = [...claimedPremium];
        updates.bp_claimed_premium.push(r.level);
        applyReward(r.premium);
        allClaimable.push({ ...r.premium, _level: r.level, _type: 'premium' });
      }

      // Shard drops (S2 only)
      if (activeSeason.id === 'season_2') {
        const shardDrop = SHARD_DROPS.find(s =>
          s.level === r.level &&
          !((user.bp_shard_claimed || []).includes(s.id)) &&
          !(updates.bp_shard_claimed || []).includes(s.id)
        );
        if (shardDrop) {
          if (!updates.shard_inventory) updates.shard_inventory = { ...(user.shard_inventory || { spark: 0, void: 0, nova: 0, omega: 0 }) };
          updates.shard_inventory[shardDrop.tier] = (updates.shard_inventory[shardDrop.tier] || 0) + (shardDrop.amount || 1);
          if (!updates.bp_shard_claimed) updates.bp_shard_claimed = [...(user.bp_shard_claimed || [])];
          updates.bp_shard_claimed.push(shardDrop.id);
          allClaimable.push({ icon: SHARD_TIERS[shardDrop.tier]?.icon || '⚡', label: `${shardDrop.amount || 1}x ${shardDrop.tier} Shard`, _level: r.level, _type: 'shard' });
        }
      }
    }

    // Bonus levels
    for (const [lvlStr, bonus] of Object.entries(activeBonuses)) {
      const lvl = Number(lvlStr);
      if (level >= lvl && !claimedBonusLevels.includes(lvl) && !(updates.bp_claimed_bonus || []).includes(lvl)) {
        if (!updates.bp_claimed_bonus) updates.bp_claimed_bonus = [...claimedBonusLevels];
        updates.bp_claimed_bonus.push(lvl);
        totalTokens += bonus.tokens;
        allClaimable.push({ icon: '🎁', label: `+${bonus.tokens.toLocaleString()} Bonus Tokens`, type: 'tokens', amount: bonus.tokens, _level: lvl, _type: 'bonus' });
      }
    }

    if (allClaimable.length === 0) { toast.info('Nichts zum Abholen!'); return; }

    if (totalTokens > 0) updates.tokens = (user.tokens || 0) + totalTokens;

    setLoading(true);
    try {
      const updated = await base44.entities.AppUser.update(user.id, updates);
      if (totalTokens > 0) {
        await base44.entities.TokenTransaction.create({
          user_id: user.id,
          username: user.username,
          amount: totalTokens,
          source: `🎁 Alle BP-Belohnungen abgeholt (${allClaimable.length}x)`,
          category: 'earned'
        });
      }
      localStorage.setItem('app_user', JSON.stringify(updated));
      setUser(updated);
      window.dispatchEvent(new Event('user-updated'));
      setClaimAllRewards(allClaimable);
      // Multi-burst confetti for maximum satisfaction
      setTimeout(() => confetti({ particleCount: 300, spread: 150, origin: { y: 0.4 }, colors: ['#fbbf24', '#a855f7', '#06b6d4', '#ec4899', '#22c55e'] }), 100);
      setTimeout(() => confetti({ particleCount: 180, spread: 100, origin: { y: 0.65, x: 0.15 }, colors: ['#f97316', '#e879f9'] }), 450);
      setTimeout(() => confetti({ particleCount: 180, spread: 100, origin: { y: 0.65, x: 0.85 }, colors: ['#67e8f9', '#fbbf24'] }), 750);
      setTimeout(() => confetti({ particleCount: 100, spread: 55, startVelocity: 60, origin: { y: 0.25, x: 0.5 }, colors: ['#fff', '#fbbf24', '#e879f9'] }), 1100);
    } catch { toast.error('Fehler beim Abholen'); }
    setLoading(false);
  };

  const handleClaimBonus = async (lvl) => {
    const bonus = activeBonuses[lvl];
    if (!bonus) return;
    // Guard: bereits geclaimed?
    if (claimedBonusLevels.includes(lvl)) { toast.error('Bonus bereits abgeholt!'); return; }
    setLoading(true);
    try {
      const updated = await base44.entities.AppUser.update(user.id, { tokens: (user.tokens || 0) + bonus.tokens, bp_claimed_bonus: [...claimedBonusLevels, lvl] });
      await base44.entities.TokenTransaction.create({ user_id: user.id, username: user.username, amount: bonus.tokens, source: `${bonus.label} (Level ${lvl})`, category: 'bonus' });
      localStorage.setItem('app_user', JSON.stringify(updated)); setUser(updated);
      window.dispatchEvent(new Event('user-updated'));
      confetti({ particleCount: 220, spread: 140, origin: { y: 0.5 }, colors: ['#fbbf24', '#f97316', '#ec4899', '#a855f7'] });
      setClaimedReward({ icon: '🎁', label: `+${bonus.tokens.toLocaleString()} Bonus Tokens!`, rarity: 'legendary' });
    } catch { toast.error('Fehler'); }
    setLoading(false);
  };

  const bonusLevels = Object.entries(activeBonuses).map(([lvl, bonus]) => ({ lvl: Number(lvl), ...bonus, isReached: level >= Number(lvl), isClaimed: claimedBonusLevels.includes(Number(lvl)) }));
  const pendingBonuses = bonusLevels.filter(b => b.isReached && !b.isClaimed).length;

  // Count total claimable rewards for "Claim All" button
  const totalClaimable = activeSeason.rewards.reduce((acc, r) => {
    if (r.level > level) return acc;
    if (!claimedFree.includes(r.level)) acc++;
    if (isPremium && !claimedPremium.includes(r.level)) acc++;
    return acc;
  }, 0) + pendingBonuses;

  // ── Season-specific theming ──────────────────────────────
  const isS2 = activeSeason.id === 'season_2';
  const theme = isS2 ? {
    bg:            '#0f0400',
    nebula1:       'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(220,38,38,0.2) 0%, transparent 70%)',
    nebula2:       'radial-gradient(ellipse 60% 40% at 20% 80%, rgba(249,115,22,0.12) 0%, transparent 60%)',
    nebula3:       'radial-gradient(ellipse 50% 40% at 80% 60%, rgba(239,68,68,0.08) 0%, transparent 60%)',
    gridColor:     'rgba(220,38,38,1)',
    bottomFade:    'linear-gradient(to top, #0f0400, transparent)',
    liveBadgeBg:   'rgba(220,38,38,0.15)',
    liveBadgeBorder:'rgba(220,38,38,0.5)',
    liveBadgeColor: '#fca5a5',
    titleGradient: 'linear-gradient(135deg, #ffffff 0%, #fb923c 35%, #ef4444 65%, #dc2626 100%)',
    titleGlow:     'drop-shadow(0 0 40px rgba(220,38,38,0.35))',
    levelBg:       'linear-gradient(135deg, rgba(220,38,38,0.4), rgba(249,115,22,0.4))',
    levelBorder:   'rgba(239,68,68,0.5)',
    levelGlow:     '0 0 20px rgba(239,68,68,0.35)',
    xpText:        '#fb923c',
    xpAccent:      'text-orange-400',
    xpBar:         'linear-gradient(90deg, #7f1d1d, #dc2626, #ef4444, #f97316)',
    xpBarGlow:     '0 0 12px rgba(239,68,68,0.6)',
    overallAccent: 'text-orange-400',
    tabActiveBg:   'linear-gradient(135deg, rgba(220,38,38,0.35), rgba(249,115,22,0.25))',
    tabActiveBorder:'rgba(220,38,38,0.5)',
    tabActiveGlow: '0 0 20px rgba(220,38,38,0.2)',
    xpLabelColor:  '#fb923c',
    xpLabelGradient:'linear-gradient(90deg, rgba(239,68,68,0.3), transparent)',
    xpCardHover:   'rgba(239,68,68,0.4)',
    trackGlow:     'linear-gradient(90deg, rgba(220,38,38,0.12), rgba(249,115,22,0.1), rgba(239,68,68,0.12))',
    connectorPast: 'linear-gradient(90deg, rgba(220,38,38,0.6), rgba(249,115,22,0.6))',
    nodeCurrentBg: 'linear-gradient(135deg,#dc2626,#f97316)',
    nodeCurrentBorder:'#fb923c',
    nodeCurrentGlow:'0 0 20px rgba(220,38,38,0.6)',
    nodePastBg:    'rgba(220,38,38,0.35)',
    nodePastBorder:'#991b1b',
    nodePulse:     'rgba(220,38,38,0.25)',
    claimModalBorder:'rgba(239,68,68,0.4)',
    claimModalGlow: '0 0 80px rgba(220,38,38,0.35)',
    claimConic:    'conic-gradient(from 0deg, rgba(220,38,38,0.18), rgba(249,115,22,0.12), rgba(239,68,68,0.18), rgba(220,38,38,0.18))',
    claimLabel:    '#fb923c',
    claimBtn:      'linear-gradient(135deg, #991b1b, #dc2626)',
    claimBtnGlow:  '0 0 20px rgba(220,38,38,0.4)',
  } : {
    bg:            '#06040f',
    nebula1:       'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139,92,246,0.18) 0%, transparent 70%)',
    nebula2:       'radial-gradient(ellipse 60% 40% at 20% 80%, rgba(236,72,153,0.1) 0%, transparent 60%)',
    nebula3:       'radial-gradient(ellipse 50% 40% at 80% 60%, rgba(6,182,212,0.07) 0%, transparent 60%)',
    gridColor:     'rgba(168,85,247,1)',
    bottomFade:    'linear-gradient(to top, #06040f, transparent)',
    liveBadgeBg:   'rgba(217,70,239,0.1)',
    liveBadgeBorder:'rgba(217,70,239,0.4)',
    liveBadgeColor: '#e879f9',
    titleGradient: 'linear-gradient(135deg, #ffffff 0%, #e879f9 40%, #818cf8 70%, #67e8f9 100%)',
    titleGlow:     'drop-shadow(0 0 40px rgba(217,70,239,0.25))',
    levelBg:       'linear-gradient(135deg, rgba(168,85,247,0.4), rgba(236,72,153,0.4))',
    levelBorder:   'rgba(217,70,239,0.4)',
    levelGlow:     '0 0 20px rgba(217,70,239,0.3)',
    xpText:        '#a855f7',
    xpAccent:      'text-purple-400',
    xpBar:         'linear-gradient(90deg, #7c3aed, #a855f7, #ec4899, #f97316)',
    xpBarGlow:     '0 0 12px rgba(168,85,247,0.6)',
    overallAccent: 'text-purple-400',
    tabActiveBg:   'linear-gradient(135deg, rgba(168,85,247,0.35), rgba(236,72,153,0.25))',
    tabActiveBorder:'rgba(168,85,247,0.5)',
    tabActiveGlow: '0 0 20px rgba(168,85,247,0.2)',
    xpLabelColor:  '#e879f9',
    xpLabelGradient:'linear-gradient(90deg, rgba(217,70,239,0.3), transparent)',
    xpCardHover:   'rgba(217,70,239,0.4)',
    trackGlow:     'linear-gradient(90deg, rgba(168,85,247,0.1), rgba(236,72,153,0.1), rgba(6,182,212,0.1))',
    connectorPast: 'linear-gradient(90deg, rgba(168,85,247,0.6), rgba(236,72,153,0.6))',
    nodeCurrentBg: 'linear-gradient(135deg,#a855f7,#ec4899)',
    nodeCurrentBorder:'#e879f9',
    nodeCurrentGlow:'0 0 20px rgba(217,70,239,0.6)',
    nodePastBg:    'rgba(168,85,247,0.35)',
    nodePastBorder:'#7c3aed',
    nodePulse:     'rgba(217,70,239,0.25)',
    claimModalBorder:'rgba(217,70,239,0.4)',
    claimModalGlow: '0 0 80px rgba(217,70,239,0.35)',
    claimConic:    'conic-gradient(from 0deg, rgba(217,70,239,0.15), rgba(6,182,212,0.1), rgba(168,85,247,0.15), rgba(217,70,239,0.15))',
    claimLabel:    '#e879f9',
    claimBtn:      'linear-gradient(135deg, #7c3aed, #ec4899)',
    claimBtnGlow:  '0 0 20px rgba(217,70,239,0.4)',
  };

  const shardInventory = user.shard_inventory || { spark: 0, void: 0, nova: 0, omega: 0 };
  const totalShards = Object.values(shardInventory).reduce((a, b) => a + b, 0);

  const pokemonClaimable = isS2
    ? BP_POKEMON_MILESTONES.filter(m => level >= m.level && !(user?.pokemon_story_progress?.bp_claimed_pokemon || []).includes(`bp_${m.pokemon.id}_${m.level}`)).length
    : 0;

  const TABS = [
    { id: 'track', label: 'Reward-Track', icon: <Star className="w-4 h-4" /> },
    { id: 'quests', label: 'Quests', icon: <Zap className="w-4 h-4" /> },
    { id: 'leaderboard', label: 'Top 100', icon: <Trophy className="w-4 h-4" /> },
    { id: 'bonus', label: pendingBonuses > 0 ? `Bonus (${pendingBonuses})` : 'Bonus', icon: <Gift className="w-4 h-4" />, alert: pendingBonuses > 0 },
    ...(isS2 ? [{ id: 'pokemon', label: pokemonClaimable > 0 ? `🎴 Pokémon (${pokemonClaimable} neu!)` : '🎴 Pokémon', icon: null, alert: pokemonClaimable > 0, isPokemon: true }] : []),
    ...(isS2 ? [{ id: 'voidrift', label: 'Void Rifts', icon: <span className="text-sm">🔑</span> }] : []),
    ...(isS2 ? [{ id: 'proabilities', label: isPremium ? 'Pro-Fähigkeiten ★' : 'Pro-Fähigkeiten', icon: <Sparkles className="w-4 h-4" />, alert: isPremium }] : []),
    { id: 'lore', label: 'Story', icon: <Flame className="w-4 h-4" /> },
    { id: 'history', label: 'Verlauf', icon: <History className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-[999] text-white overflow-y-auto overflow-x-hidden" style={{ background: theme.bg }}>

      <ShardClaimAnimation shard={shardAnim} onDone={() => setShardAnim(null)} />

      {/* ── CINEMATIC HERO BACKGROUND ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {!lw && <StarField />}
        {/* Deep nebula */}
        <div className="absolute inset-0" style={{ background: theme.nebula1 }} />
        {!lw && <div className="absolute inset-0" style={{ background: theme.nebula2 }} />}
        {!lw && <div className="absolute inset-0" style={{ background: theme.nebula3 }} />}
        {/* Subtle grid */}
        {!lw && <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: `linear-gradient(${theme.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${theme.gridColor} 1px, transparent 1px)`, backgroundSize: '80px 80px' }} />}
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-48" style={{ background: theme.bottomFade }} />
      </div>

      {/* ── BACK BUTTON ── */}
      <div className="fixed top-5 left-5 z-50">
        <Link to={createPageUrl('Home')}>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold text-white/60 hover:text-white transition-all hover:bg-white/10 border border-white/10 hover:border-white/20">
            <ChevronLeft className="w-4 h-4" /> Zurück
          </button>
        </Link>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-24">

        {/* ── HERO SECTION ── */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14 pt-8">
          {/* Live badge */}
          <motion.div animate={{ opacity: [0.7, 1, 0.7] }} transition={{ repeat: Infinity, duration: 2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-5 border"
            style={{ background: theme.liveBadgeBg, borderColor: theme.liveBadgeBorder, color: theme.liveBadgeColor }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.liveBadgeColor }} />
            {activeSeason.name} · Live Now
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-black mb-3 leading-none tracking-tighter uppercase"
            style={{ background: theme.titleGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: theme.titleGlow }}>
            {activeSeason.name.replace(' ', '\n')}
          </h1>
          <p className="text-white/40 text-sm max-w-md mx-auto mt-3 mb-10">{activeSeason.description}</p>

          {/* ── STATS ROW ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {/* Level + XP */}
            <div className="sm:col-span-2 rounded-2xl p-5 relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl"
                    style={{ background: theme.levelBg, border: `1px solid ${theme.levelBorder}`, boxShadow: theme.levelGlow }}>
                    {level}
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-white/30 font-bold uppercase tracking-widest">Level</div>
                    <div className="text-2xl font-black" style={{ color: theme.xpText }}>
                      {level} / {activeSeason.maxLevel}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold" style={{ color: theme.xpText }}>{xp.toLocaleString()} / {activeSeason.xpPerLevel.toLocaleString()} XP</div>
                  <div className="text-xs text-white/25 mt-0.5">Bis Level {Math.min(level + 1, activeSeason.maxLevel)}</div>
                </div>
              </div>
              {/* XP Bar */}
              <div className="h-3.5 rounded-full overflow-hidden relative" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <motion.div className="h-full rounded-full relative"
                  style={{ background: theme.xpBar, boxShadow: theme.xpBarGlow }}
                  initial={{ width: 0 }} animate={{ width: `${xpPct}%` }} transition={{ duration: 1.4, ease: 'easeOut' }}>
                  <div className="absolute inset-0 bg-white/25 animate-[pulse_2s_ease-in-out_infinite] rounded-full" />
                  {xpPct > 10 && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-black text-white/90 drop-shadow-md">{Math.round(xpPct)}%</span>}
                </motion.div>
              </div>
              {/* Overall progress */}
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-white/25">Saison-Fortschritt</span>
                <span className={`text-[10px] font-black ${theme.overallAccent}`}>{overallPct}%</span>
              </div>
            </div>

            {/* Tokens */}
            <div className="rounded-2xl p-5 flex flex-col items-center justify-center relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-2 text-2xl" style={{ background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.3)' }}>🪙</div>
              <div className="text-2xl font-black text-yellow-400">{(user.tokens || 0).toLocaleString()}</div>
              <div className="text-xs text-white/30 font-bold uppercase tracking-wider mt-0.5">Tokens</div>
            </div>
          </div>

          {/* ── SHARD INVENTORY (S2 only) ── */}
          {isS2 && (
            <div className="mt-4 max-w-2xl mx-auto">
              <Link to={createPageUrl('ShardShop')}>
                <motion.div whileHover={{ scale: 1.01 }} className="rounded-2xl p-4 flex items-center gap-3 cursor-pointer"
                  style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)' }}>
                  <div className="text-2xl">⚡</div>
                  <div className="flex-1">
                    <div className="text-sm font-black text-white">Void Shard Inventar</div>
                    <div className="text-xs text-white/30 mt-0.5">{totalShards} Shards · Craften im Shard Shop</div>
                  </div>
                  <div className="flex gap-1.5">
                    {Object.entries(SHARD_TIERS).map(([tier, cfg]) => shardInventory[tier] > 0 && (
                      <div key={tier} className="flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-black"
                        style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
                        {cfg.icon} {shardInventory[tier]}
                      </div>
                    ))}
                    {totalShards === 0 && <span className="text-xs text-white/20">Noch leer</span>}
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/30" />
                </motion.div>
              </Link>
            </div>
          )}

          {/* ── PREMIUM BANNER ── */}
          <div className="mt-6 max-w-2xl mx-auto">
            {!isPremium ? (
              <motion.div whileHover={{ scale: 1.01 }} className="rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4 relative overflow-hidden cursor-pointer"
                style={{ background: 'linear-gradient(135deg, rgba(234,179,8,0.08), rgba(236,72,153,0.12))', border: '1px solid rgba(234,179,8,0.3)', boxShadow: '0 0 30px rgba(234,179,8,0.08)' }}>
                <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(234,179,8,1) 8px, rgba(234,179,8,1) 9px)' }} />
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 relative z-10" style={{ background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.4)' }}>
                  <Crown className="w-7 h-7 text-yellow-400" />
                </div>
                <div className="flex-1 relative z-10 text-left">
                  <div className="font-black text-white text-base">Premium Pass freischalten</div>
                  <div className="text-xs text-white/40 mt-0.5">Exklusive Titel, God-Tier Frames, Spezial-Effekte & mehr</div>
                </div>
                <Button onClick={handleBuyPremium} disabled={loading} className="relative z-10 flex-shrink-0 font-black px-6 h-11 rounded-xl border-0"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #ec4899)', boxShadow: '0 0 20px rgba(245,158,11,0.3)', color: '#fff' }}>
                  <Coins className="w-4 h-4 mr-1.5" />{activeSeason.premiumPrice.toLocaleString()}
                </Button>
              </motion.div>
            ) : (
              <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.25)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(234,179,8,0.15)' }}>
                  <Crown className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="font-black text-yellow-400">Premium Pass aktiv</div>
                <Check className="w-5 h-5 text-green-400 ml-auto" />
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Pokémon claimable banner ── */}
        {isS2 && pokemonClaimable > 0 && activeTab !== 'pokemon' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-5 rounded-2xl p-4 flex items-center gap-4 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(236,121,249,0.1))', border: '1.5px solid rgba(251,191,36,0.4)', boxShadow: '0 0 30px rgba(251,191,36,0.12)' }}
            onClick={() => setActiveTab('pokemon')}>
            <motion.div animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 2 }} className="text-3xl">🎴</motion.div>
            <div className="flex-1">
              <div className="font-black text-white text-sm">{pokemonClaimable} Pokémon bereit zum Abholen!</div>
              <div className="text-xs text-white/40 mt-0.5">Legendäre & mythische Pokémon warten auf dich</div>
            </div>
            <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2 }}
              className="px-3 py-1.5 rounded-xl text-xs font-black"
              style={{ background: 'rgba(251,191,36,0.2)', border: '1px solid rgba(251,191,36,0.5)', color: '#fbbf24' }}>
              Abholen →
            </motion.div>
          </motion.div>
        )}

        {/* ── TABS ── */}
        <div className="flex gap-2 mb-8 overflow-x-auto hide-scrollbar">
          {TABS.map(tab => {
            const isPokemonTab = tab.isPokemon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="relative flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-black whitespace-nowrap transition-all flex-shrink-0"
                style={{
                  background: isActive
                    ? (isPokemonTab ? 'linear-gradient(135deg, rgba(251,191,36,0.3), rgba(236,121,249,0.2))' : theme.tabActiveBg)
                    : isPokemonTab && tab.alert
                      ? 'linear-gradient(135deg, rgba(251,191,36,0.1), rgba(236,121,249,0.07))'
                      : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isActive
                    ? (isPokemonTab ? 'rgba(251,191,36,0.6)' : theme.tabActiveBorder)
                    : isPokemonTab && tab.alert ? 'rgba(251,191,36,0.35)' : 'rgba(255,255,255,0.08)'}`,
                  color: isActive ? '#fff' : isPokemonTab && tab.alert ? '#fbbf24' : 'rgba(255,255,255,0.4)',
                  boxShadow: isActive
                    ? (isPokemonTab ? '0 0 20px rgba(251,191,36,0.25)' : theme.tabActiveGlow)
                    : isPokemonTab && tab.alert ? '0 0 12px rgba(251,191,36,0.15)' : 'none',
                }}>
                {tab.icon && tab.icon}{tab.label}
                {tab.alert && <motion.span className="w-2.5 h-2.5 rounded-full bg-yellow-400" animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }} transition={{ repeat: Infinity, duration: 1 }} />}
              </button>
            );
          })}
        </div>

        {/* ──────────── TAB: TRACK ──────────── */}
        {activeTab === 'track' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

            {/* Claim All Button */}
            {totalClaimable > 0 && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <motion.button
                  onClick={handleClaimAll}
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative w-full rounded-2xl p-4 flex items-center justify-between gap-4 overflow-hidden"
                  style={{
                    background: isS2
                      ? 'linear-gradient(135deg, rgba(220,38,38,0.18), rgba(249,115,22,0.12))'
                      : 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.15))',
                    border: isS2 ? '1.5px solid rgba(239,68,68,0.5)' : '1.5px solid rgba(217,70,239,0.5)',
                    boxShadow: isS2 ? '0 0 40px rgba(220,38,38,0.2)' : '0 0 40px rgba(168,85,247,0.2)',
                  }}>
                  {/* Shine sweep */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12 pointer-events-none"
                    animate={{ x: ['-150%', '150%'] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: 'linear', repeatDelay: 1.5 }}
                  />
                  <div className="flex items-center gap-3 relative z-10">
                    <motion.div
                      animate={{ rotate: [0, -8, 8, -8, 0] }}
                      transition={{ repeat: Infinity, duration: 2.5, repeatDelay: 1 }}
                      className="text-3xl">
                      🎁
                    </motion.div>
                    <div className="text-left">
                      <div className="font-black text-white text-sm">Alle Belohnungen abholen</div>
                      <div className="text-xs text-white/50 mt-0.5">{totalClaimable} Belohnung{totalClaimable !== 1 ? 'en' : ''} warten auf dich</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 relative z-10">
                    <div className="px-4 py-2 rounded-xl font-black text-sm"
                      style={{
                        background: isS2 ? 'linear-gradient(135deg, #dc2626, #f97316)' : 'linear-gradient(135deg, #a855f7, #ec4899)',
                        color: '#fff',
                        boxShadow: isS2 ? '0 0 20px rgba(239,68,68,0.4)' : '0 0 20px rgba(168,85,247,0.4)',
                      }}>
                      {loading ? '...' : `Alle (${totalClaimable}) ✨`}
                    </div>
                  </div>
                </motion.button>
              </motion.div>
            )}

            {/* XP Sources */}
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-5">
                <Zap className="w-4 h-4" style={{ color: theme.xpLabelColor }} />
                <span className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: theme.xpLabelColor }}>XP verdienen</span>
                <div className="flex-1 h-px" style={{ background: theme.xpLabelGradient }} />
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {BATTLE_PASS_ACTIONS.map(action => (
                  <div key={action.id} className="group relative flex flex-col items-center text-center rounded-xl p-3 transition-all hover:-translate-y-1"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = theme.xpCardHover}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}>
                    <div className="text-2xl mb-1.5 transition-transform group-hover:scale-110">{action.icon}</div>
                    <div className="text-[9px] font-bold text-white/60 leading-tight mb-1">{action.title}</div>
                    <div className="text-[9px] font-black" style={{ color: theme.xpLabelColor }}>+{action.xpReward} XP</div>
                    {action.isNew && <div className="absolute -top-1 -right-1 text-[8px] bg-pink-500 text-white px-1.5 py-0.5 rounded-full font-black">NEU</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Row labels */}
            <div className="flex mb-3 pl-2">
              <div className="flex items-center gap-2">
                <Crown className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400/70">Premium-Reihe</span>
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400/70">Gratis-Reihe</span>
              </div>
            </div>

            {/* The Track */}
            <div ref={trackRef} className="rounded-3xl p-5 md:p-8 overflow-x-auto hide-scrollbar relative scroll-smooth"
              style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}>
              {/* Glow strip in the center */}
              <div className="absolute left-8 right-8 top-1/2 h-1 -translate-y-1/2 pointer-events-none rounded-full" style={{ background: theme.trackGlow }} />

              <div className="flex gap-2 min-w-max pb-2">
                {activeSeason.rewards.map((r, i) => {
                  const isCurrent = level === r.level;
                  const isPast = level > r.level;
                  const freeClaimed = claimedFree.includes(r.level);
                  const freeCanClaim = !freeClaimed && level >= r.level;
                  const premiumClaimed = claimedPremium.includes(r.level);
                  const premiumCanClaim = isPremium && !premiumClaimed && level >= r.level;
                  const isBonusLevel = !!activeBonuses[r.level];
                  const bonusClaimed = claimedBonusLevels.includes(r.level);
                  const bonusCanClaim = isBonusLevel && level >= r.level && !bonusClaimed;

                  return (
                    <div key={r.level} data-current-level={isCurrent} className="flex flex-col items-center shrink-0 relative" style={{ width: 124 }}>
                      {/* Connector line */}
                      {i < activeSeason.rewards.length - 1 && (
                        <div className="absolute left-1/2 top-1/2 -translate-y-1/2 h-1.5 z-0 rounded-full overflow-hidden"
                          style={{ width: 'calc(100% + 8px)', background: 'rgba(255,255,255,0.05)' }}>
                          {isPast && (
                            <motion.div className="h-full w-full"
                              style={{ background: theme.connectorPast, boxShadow: `0 0 10px ${theme.connectorPast}` }}
                              initial={{ x: '-100%' }} animate={{ x: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}
                            />
                          )}
                        </div>
                      )}

                      {/* Premium */}
                      <RewardCard reward={r.premium} canClaim={premiumCanClaim} claimed={premiumClaimed}
                        locked={!isPremium && !premiumClaimed} onClaim={() => handleClaim(r.level, 'premium')} premium />

                      {/* Level node */}
                      <LevelNode level={r.level} isCurrent={isCurrent} isPast={isPast} isBonus={isBonusLevel} bonusCanClaim={bonusCanClaim} theme={theme} />

                      {/* Free */}
                      <RewardCard reward={r.free} canClaim={freeCanClaim} claimed={freeClaimed}
                        locked={false} onClaim={() => handleClaim(r.level, 'free')} />

                      {/* Bonus button */}
                      {isBonusLevel && (
                        <motion.button onClick={() => bonusCanClaim && handleClaimBonus(r.level)}
                          whileHover={bonusCanClaim ? { scale: 1.06 } : {}}
                          className="mt-2 px-2 py-1.5 rounded-xl text-[9px] font-black flex items-center gap-1 transition-all"
                          style={{
                            width: 110, justifyContent: 'center',
                            background: bonusClaimed ? 'rgba(255,255,255,0.03)' : bonusCanClaim ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'rgba(255,255,255,0.04)',
                            border: bonusClaimed ? '1px solid rgba(255,255,255,0.07)' : bonusCanClaim ? '1px solid rgba(245,158,11,0.6)' : '1px solid rgba(255,255,255,0.07)',
                            color: bonusClaimed ? 'rgba(255,255,255,0.2)' : bonusCanClaim ? '#000' : 'rgba(255,255,255,0.2)',
                            boxShadow: bonusCanClaim ? '0 0 12px rgba(245,158,11,0.4)' : 'none',
                            cursor: bonusCanClaim ? 'pointer' : 'default',
                          }}>
                          {bonusClaimed ? <><Check className="w-3 h-3" /> Abgeholt</> :
                           bonusCanClaim ? <><Gift className="w-3 h-3" /> +{activeBonuses[r.level].tokens.toLocaleString()}</> :
                           <><Lock className="w-3 h-3" /> Bonus</>}
                        </motion.button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ──────────── TAB: BONUS ──────────── */}
        {activeTab === 'bonus' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-7">
              <h2 className="text-2xl font-black mb-1" style={{ background: 'linear-gradient(90deg,#fbbf24,#f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                🎁 Bonus-Meilensteine
              </h2>
              <p className="text-white/35 text-sm">Extra-Tokens bei bestimmten Level-Sprüngen — on top zu allen normalen Belohnungen.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {bonusLevels.map(({ lvl, tokens, label, isReached, isClaimed }) => {
                const canClaim = isReached && !isClaimed;
                return (
                  <motion.div key={lvl}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: lvl * 0.01 }}
                    onClick={() => canClaim && handleClaimBonus(lvl)}
                    whileHover={canClaim ? { scale: 1.06, y: -4 } : {}}
                    className="relative flex flex-col items-center text-center rounded-2xl p-4 transition-all"
                    style={{
                      background: isClaimed ? 'rgba(255,255,255,0.02)' : canClaim ? 'linear-gradient(135deg,rgba(245,158,11,0.18),rgba(239,68,68,0.12))' : isReached ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.02)',
                      border: isClaimed ? '1px solid rgba(255,255,255,0.06)' : canClaim ? '1px solid rgba(245,158,11,0.5)' : '1px solid rgba(255,255,255,0.07)',
                      boxShadow: canClaim ? '0 0 24px rgba(245,158,11,0.2)' : 'none',
                      cursor: canClaim ? 'pointer' : 'default',
                      opacity: !isReached ? 0.45 : 1,
                    }}>
                    {isClaimed && <div className="absolute inset-0 rounded-2xl flex items-center justify-center backdrop-blur-sm z-10" style={{ background: 'rgba(34,197,94,0.1)' }}><Check className="w-7 h-7 text-green-400" /></div>}
                    {canClaim && <motion.div className="absolute inset-0 rounded-2xl border-2 border-yellow-400/50" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.8 }} />}
                    <div className="text-2xl mb-2">{isClaimed ? '✅' : isReached ? '🎁' : '🔒'}</div>
                    <div className="text-xs font-black text-yellow-400 mb-0.5">Level {lvl}</div>
                    <div className="text-[9px] text-white/40 font-bold mb-2">Meilenstein</div>
                    <div className="flex items-center gap-1 font-black text-sm" style={{ color: canClaim ? '#fbbf24' : isClaimed ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.3)' }}>
                      <Coins className="w-3.5 h-3.5" />+{tokens.toLocaleString()}
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="mt-8 p-5 rounded-2xl flex items-start gap-3 text-sm" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
              <Trophy className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-white/40">Bonus-Tokens werden zusätzlich zu allen normalen Level-Belohnungen ausgezahlt. Sie können hier oder direkt im Track abgeholt werden.</p>
            </div>
          </motion.div>
        )}

        {/* ──────────── TAB: POKÉMON ──────────── */}
        {activeTab === 'pokemon' && isS2 && (
          <BPPokemonRewards user={user} setUser={setUser} />
        )}

        {/* ──────────── TAB: QUESTS ──────────── */}
        {activeTab === 'quests' && (
          <BPQuestsTab user={user} setUser={setUser} />
        )}

        {/* ──────────── TAB: LEADERBOARD ──────────── */}
        {activeTab === 'leaderboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-7">
              <h2 className="text-2xl font-black mb-1" style={{ background: 'linear-gradient(90deg,#fbbf24,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                🏆 Battle Pass Bestenliste
              </h2>
              <p className="text-white/35 text-sm">Die am höchsten gelevelten Spieler dieser Season.</p>
            </div>

            {leaderboardLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-yellow-400/40 border-t-yellow-400 rounded-full animate-spin" />
              </div>
            ) : leaderboardUsers.length === 0 ? (
              <div className="text-center py-16 text-white/30">
                <div className="text-4xl mb-3">🏆</div>
                <p className="font-bold">Noch keine Spieler mit Level &gt; 1</p>
                <p className="text-sm mt-1">Sei der Erste!</p>
              </div>
            ) : (
              <div className="rounded-3xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {leaderboardUsers.map((p, i) => {
                  const isMe = p.id === user?.id;
                  const rankColors = ['#fbbf24', '#d1d5db', '#cd7c2f'];
                  const rankEmojis = ['🥇', '🥈', '🥉'];
                  return (
                    <div key={p.id} className={`flex items-center gap-4 p-4 ${i < leaderboardUsers.length - 1 ? 'border-b border-white/5' : ''} ${isMe ? 'bg-white/5' : 'hover:bg-white/[0.02]'} transition-colors`}>
                      <div className="w-8 font-black text-center" style={{ color: rankColors[i] || 'rgba(255,255,255,0.3)' }}>
                        {rankEmojis[i] || `#${i + 1}`}
                      </div>
                      <img
                        src={p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.username}`}
                        alt={p.username}
                        className="w-10 h-10 rounded-full object-cover border border-white/10"
                      />
                      <div className={`font-bold flex-1 truncate ${isMe ? 'text-cyan-400' : 'text-white/90'}`}>
                        {p.username}{isMe ? ' (Du)' : ''}
                      </div>
                      {p.bp_premium && <span className="text-yellow-400 text-xs">👑</span>}
                      <div className="font-black text-lg" style={{ color: rankColors[i] || (isS2 ? '#fb923c' : '#a855f7') }}>
                        Lvl {p.bp_level || 1}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ──────────── TAB: LORE ──────────── */}
        {activeTab === 'lore' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-7">
              <h2 className="text-2xl font-black mb-1" style={{ background: 'linear-gradient(90deg,#ef4444,#dc2626)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                📜 Die Geschichte der Season
              </h2>
              <p className="text-white/35 text-sm">Schalte durch Level-Aufstiege neue Lore-Einträge frei.</p>
            </div>
            
            <div className="space-y-4">
              {[
                { lvl: 1,   emoji: '🌌', title: 'Die Ankunft',           text: 'Der Himmel riss auf und purpurrotes Licht flutete die Straßen. Die Neon Apocalypse hatte begonnen. Niemand wusste, woher die Kristalle stammten — aber sie veränderten alles.' },
                { lvl: 10,  emoji: '⚡', title: 'Erste Transformation',  text: 'Die Strahlung der Void-Kristalle begann, menschliche DNA zu verändern. Einige flohen. Andere — die Mutigeren — öffneten die Augen und sahen das Licht.' },
                { lvl: 20,  emoji: '🧠', title: 'Das erste Erwachen',    text: 'Die Maschinen begannen zu sprechen. Sie flüsterten von einer leeren Dimension, einem Ort namens "The Void". Die wenigen, die hinhörten, wurden verändert.' },
                { lvl: 30,  emoji: '🌀', title: 'Das Void Portal',       text: 'Ein Riss im Raum-Zeit-Gefüge öffnete sich mitten in der Stadt. Aus ihm strömten Wesen aus reiner Energie. Die Überlebenden nannten sie die Void-Legionare.' },
                { lvl: 40,  emoji: '🔥', title: 'Hellfire Protocol',      text: 'Die Regierung aktivierte das Hellfire-Protokoll. Drei Städte wurden von der Karte gelöscht. Die Neon-Krieger, die überlebten, wurden zu Legenden.' },
                { lvl: 50,  emoji: '💀', title: 'Götter aus Neon',        text: 'Einige Überlebende verschmolzen mit der Energie. Sie nannten sich selbst "Neon Gods". Sie herrschten über die verbleibenden Ressourcen und verteilten die wertvollen Omega Shards.' },
                { lvl: 60,  emoji: '👻', title: 'Das Ghost Protocol',    text: 'Eine neue Fraktion entstand: die Ghost Runners. Unsichtbar, unaufhaltsam. Sie infiltrierten die Void-Portale und stahlen ihre Energie, um neue Waffen zu schmieden.' },
                { lvl: 70,  emoji: '🌌', title: 'Der Bruch',             text: 'Dimensionen begannen zu kollabieren. Zeitlinien vermischten sich. Wer durch einen Void Rift ging, kam verändert zurück — oder gar nicht.' },
                { lvl: 80,  emoji: '👾', title: 'Der Titan erwacht',     text: 'Tief im Untergrund regt sich etwas. Ein Konstrukt aus purem Abyss. Wer auch immer den Apocalypse Titan kontrolliert, wird über die Asche dieser Welt herrschen.' },
                { lvl: 90,  emoji: '🕰️', title: 'Die letzte Stunde',    text: 'Ein finales Signal durchdringt alle Frequenzen. Drei Worte: "Die Apokalypse vollendet". Wer Level 100 erreicht, ist kein Spieler mehr — er ist eine Legende.' },
                { lvl: 100, emoji: '👑', title: 'NEON APOCALYPSE',       text: 'Du hast es geschafft. Tausend Hindernisse überwunden. Du bist kein Mensch mehr — du bist Energie, Licht, Neon. Das APEX Predator-Schiff gehört dir. Die Apokalypse ist dein Thron.' }
              ].map((lore, i) => {
                const unlocked = level >= lore.lvl;
                return (
                  <div key={i} className="relative rounded-2xl p-6 overflow-hidden" style={{ background: unlocked ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.02)', border: `1px solid ${unlocked ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)'}` }}>
                    {!unlocked && <div className="absolute inset-0 backdrop-blur-sm z-10 flex items-center justify-center flex-col text-white/30"><Lock className="w-6 h-6 mb-2"/><span className="text-xs font-bold uppercase tracking-widest">Benötigt Level {lore.lvl}</span></div>}
                    <div className="flex items-center gap-3 mb-2">
                      {lore.emoji && <span className="text-2xl">{lore.emoji}</span>}
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(239,68,68,0.6)' }}>Kapitel {i+1} · Level {lore.lvl}</div>
                        <h3 className={`font-black text-lg leading-tight ${unlocked ? 'text-red-400' : 'text-white/20'}`}>{lore.title}</h3>
                      </div>
                    </div>
                    <p className={`text-sm leading-relaxed ${unlocked ? 'text-white/70' : 'text-white/10'}`}>{lore.text}</p>
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)' }}>
              <h3 className="font-black text-violet-400 flex items-center gap-2">🌀 Was ist ein Void Rift?
              </h3>
              <div className="grid sm:grid-cols-3 gap-3 text-sm">
                {[
                  { emoji: '🔮', title: 'Dimensionsportal', desc: 'Betrete eine der 4 exklusiven Void-Dimensionen mit einzigartigen Herausforderungen und extremem Schwierigkeitsgrad.' },
                  { emoji: '💰', title: 'Exklusive Belohnungen', desc: 'Void Rifts geben Omega Shards, limitierte Cosmetics und einmalige Titel, die sonst nirgends erhältlich sind.' },
                  { emoji: '⚡', title: 'Zeitlimit', desc: 'Jeder Void Rift läuft nur 48h. Nutze deinen Key bevor er abläuft und die Dimension sich schließt.' },
                ].map(({ emoji, title, desc }) => (
                  <div key={title} className="p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(124,58,237,0.15)' }}>
                    <div className="text-2xl mb-2">{emoji}</div>
                    <div className="font-black text-white text-sm mb-1">{title}</div>
                    <div className="text-xs text-white/40 leading-relaxed">{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ──────────── TAB: PRO PASS FÄHIGKEITEN ──────────── */}
        {activeTab === 'proabilities' && isS2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-7">
              <h2 className="text-2xl font-black mb-1" style={{ background: 'linear-gradient(90deg,#f59e0b,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                ✨ Exklusive Pro-Pass-Fähigkeiten
              </h2>
              <p className="text-white/35 text-sm">Drei spielverändernde Sonderfähigkeiten, die nur Premium Battle Pass-Inhaber im Neon Dash nutzen können.</p>
            </div>

            {!isPremium && (
              <div className="rounded-2xl p-5 mb-6 flex items-center gap-4" style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.3)' }}>
                <Crown className="w-8 h-8 text-yellow-400 flex-shrink-0" />
                <div>
                  <div className="font-black text-yellow-400 text-sm">Premium Pass benötigt</div>
                  <div className="text-xs text-white/40 mt-0.5">Schalte den Premium Battle Pass frei, um diese Fähigkeiten in Neon Dash zu nutzen.</div>
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {PRO_PASS_ABILITIES.map((ability) => (
                <motion.div key={ability.id} whileHover={isPremium ? { scale: 1.03, y: -4 } : {}}
                  className="relative rounded-2xl p-6 overflow-hidden"
                  style={{
                    background: isPremium ? `linear-gradient(135deg, ${ability.color}18, ${ability.color}08)` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isPremium ? ability.color + '50' : 'rgba(255,255,255,0.07)'}`,
                    boxShadow: isPremium ? `0 0 30px ${ability.color}20` : 'none',
                    opacity: isPremium ? 1 : 0.5,
                  }}>
                  {isPremium && <motion.div className="absolute inset-0 rounded-2xl" style={{ border: `1px solid ${ability.color}40` }} animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ repeat: Infinity, duration: 2.5 }} />}
                  <div className="relative z-10">
                    <div className="text-5xl mb-4">{ability.icon}</div>
                    <h3 className="font-black text-white text-lg mb-2">{ability.name}</h3>
                    <p className="text-sm text-white/60 leading-relaxed mb-4">{ability.desc}</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-white/30 font-bold">⌨️ Tastenkombination:</span>
                        <span className="font-black px-2 py-0.5 rounded-md text-xs" style={{ background: ability.color + '25', color: ability.color }}>{ability.keybind}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-white/30 font-bold">⏳ Cooldown:</span>
                        <span className="text-white/70 font-bold">{ability.cooldown}</span>
                      </div>
                    </div>
                    {isPremium && (
                      <div className="mt-4 flex items-center gap-1.5 text-xs font-black" style={{ color: ability.color }}>
                        <Check className="w-3.5 h-3.5" /> Aktiv in Neon Dash
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-xs text-white/30 leading-relaxed">
                🛡️ <strong className="text-white/50">Fair Play Hinweis:</strong> Pro-Pass-Fähigkeiten sind im normalen Spielmodus verfügbar, jedoch nicht in offiziellen Wettbewerben und Turnieren. Ranglisten-Läufe haben eigene Regeln.
              </p>
            </div>
          </motion.div>
        )}

        {/* Season 2 Countdown — only show when S1 is active */}
        {activeSeason.id === 'season_1' && (
          <>
            <Season2Countdown targetDate={SEASON_2_START} />

            {/* Season 2 teaser */}
            <div className="mt-6 rounded-3xl p-8 text-center relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(6,182,212,0.06))', border: '1px solid rgba(168,85,247,0.15)' }}>
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-[0.04]" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4 border" style={{ background: 'rgba(6,182,212,0.1)', borderColor: 'rgba(6,182,212,0.3)', color: '#67e8f9' }}>
                  <Sparkles className="w-3 h-3" /> Demnächst
                </div>
                <h2 className="text-3xl font-black mb-2" style={{ background: 'linear-gradient(90deg, #67e8f9, #e879f9, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  SEASON 2: NEON APOCALYPSE
                </h2>
                <p className="text-white/35 text-sm max-w-lg mx-auto mb-2">100 Levels · Exklusive Raumschiffe · Neue BG-Animationen · Pokémon-Belohnungen</p>
                <p className="text-white/20 text-xs mb-6">Startet am {SEASON_2_START.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <Link to={createPageUrl('Feedback')}>
                  <button className="px-6 py-2.5 rounded-xl text-sm font-black border transition-all hover:bg-white/10"
                    style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>
                    <Flame className="w-4 h-4 inline mr-2 text-orange-400" />Ideen für Season 2 teilen
                  </button>
                </Link>
              </div>
            </div>

            {/* Admin Season 2 Test Toggle */}
            {user?.role === 'admin' && (
              <div className="mt-4 rounded-2xl p-4 flex items-center justify-between"
                style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.2)' }}>
                <div>
                  <p className="text-yellow-400 font-black text-sm">🛠️ Admin: Season 2 Test-Modus</p>
                  <p className="text-white/30 text-xs mt-0.5">Aktiviere Season 2 nur für dich (reguläre Nutzer sehen es nicht)</p>
                </div>
                <button
                  onClick={async () => {
                    const newVal = !user.test_season_2;
                    const updated = await base44.entities.AppUser.update(user.id, { test_season_2: newVal });
                    localStorage.setItem('app_user', JSON.stringify(updated));
                    setUser(updated);
                    window.dispatchEvent(new Event('user-updated'));
                    toast.success(newVal ? '✅ Season 2 Test aktiviert!' : '❌ Season 2 Test deaktiviert');
                    setTimeout(() => window.location.reload(), 500);
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${user.test_season_2 ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                  {user.test_season_2 ? 'S2 AKTIV' : 'Aktivieren'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── CLAIM ALL MODAL ── */}
      <AnimatePresence>
        {claimAllRewards && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(24px)' }}
            onClick={() => setClaimAllRewards(null)}>
            <motion.div
              initial={{ scale: 0.4, y: 80, rotate: -8 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -30 }}
              transition={{ type: 'spring', damping: 16, stiffness: 220 }}
              className="relative flex flex-col items-center p-6 sm:p-10 max-w-lg w-full mx-4 rounded-[2.5rem] overflow-hidden"
              style={{ background: 'rgba(8,5,20,0.97)', border: `2px solid ${theme.claimModalBorder}`, boxShadow: `${theme.claimModalGlow}, inset 0 1px 0 rgba(255,255,255,0.08)`, backdropFilter: 'blur(40px)', maxHeight: '88vh' }}
              onClick={e => e.stopPropagation()}>

              {/* Animated rotating conic */}
              <motion.div className="absolute inset-0 rounded-[2.5rem] pointer-events-none"
                style={{ background: theme.claimConic, opacity: 0.5 }}
                animate={{ rotate: 360 }} transition={{ duration: 5, repeat: Infinity, ease: 'linear' }} />

              {/* Shine sweep */}
              <motion.div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none"
                initial={{ x: '-160%', rotate: 15 }} animate={{ x: '160%' }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }} />

              {/* Star bursts */}
              {[...Array(16)].map((_, i) => (
                <motion.div key={i} className="absolute w-2 h-2 rounded-full pointer-events-none"
                  style={{ background: i % 3 === 0 ? '#fbbf24' : i % 3 === 1 ? '#e879f9' : '#67e8f9', filter: 'blur(1px)' }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                  animate={{ x: Math.cos(i * 22.5 * Math.PI / 180) * (90 + Math.random() * 60), y: Math.sin(i * 22.5 * Math.PI / 180) * (90 + Math.random() * 60), opacity: [1, 1, 0], scale: [0, Math.random() * 2.5 + 0.5, 0] }}
                  transition={{ delay: 0.15, duration: 1.4, ease: 'easeOut' }} />
              ))}

              {/* Header */}
              <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: 'spring', bounce: 0.5 }}
                className="text-6xl mb-2 relative z-10">🎉</motion.div>

              <div className="relative z-10 text-center mb-1">
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                  className="text-xs font-black uppercase tracking-[0.35em] mb-1" style={{ color: theme.claimLabel }}>Alles abgeholt!</motion.div>
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
                  className="text-2xl font-black text-white">
                  {claimAllRewards.length} Belohnung{claimAllRewards.length !== 1 ? 'en' : ''}
                </motion.div>
                {claimAllRewards.some(r => r.type === 'tokens' || r._type === 'bonus') && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
                    className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-black"
                    style={{ background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.4)', color: '#fbbf24' }}>
                    🪙 +{claimAllRewards.reduce((sum, r) => sum + (r.type === 'tokens' ? (r.amount || 0) : 0), 0).toLocaleString()} Tokens
                  </motion.div>
                )}
              </div>

              {/* Reward grid — sequentially revealed */}
              <div className="relative z-10 w-full overflow-y-auto hide-scrollbar my-5" style={{ maxHeight: '42vh' }}>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-1">
                  {claimAllRewards.map((rd, i) => {
                    const r = RARITY[rd.rarity] || RARITY.rare;
                    return (
                      <motion.div key={i}
                        initial={{ opacity: 0, scale: 0.3, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 0.15 + i * 0.04, type: 'spring', damping: 14, stiffness: 280 }}
                        className="flex flex-col items-center text-center rounded-xl p-2.5 relative overflow-hidden"
                        style={{ background: r.bg, border: `1px solid ${r.border}`, boxShadow: `0 0 12px ${r.glow}30` }}>
                        {/* Shine on each card */}
                        <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none"
                          initial={{ x: '-120%' }} animate={{ x: '120%' }}
                          transition={{ delay: 0.2 + i * 0.04, duration: 0.6, ease: 'easeOut' }} />
                        <div className="text-2xl mb-1">{rd.icon}</div>
                        <div className="text-[9px] font-bold text-white/80 leading-tight">{rd.label}</div>
                        {rd._type === 'premium' && <Crown className="w-2.5 h-2.5 text-yellow-400 mt-0.5" />}
                        {rd.rarity && <div className={`text-[7px] font-black mt-0.5 ${r.textCls}`}>{r.label}</div>}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="relative z-10 w-full">
                <Button onClick={() => setClaimAllRewards(null)} className="w-full h-13 py-3.5 text-lg font-black rounded-2xl border-0"
                  style={{ background: theme.claimBtn, boxShadow: theme.claimBtnGlow }}>
                  Legendary! 🚀
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CLAIM MODAL ── */}
      <AnimatePresence>
        {claimedReward && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)' }}
            onClick={() => setClaimedReward(null)}>
            <motion.div initial={{ scale: 0.2, rotate: -20, y: 100 }} animate={{ scale: 1, rotate: 0, y: 0 }} exit={{ scale: 1.2, opacity: 0, filter: 'blur(10px)' }}
              transition={{ type: 'spring', damping: 15, stiffness: 200, duration: 0.6 }}
              className="relative flex flex-col items-center p-10 max-w-sm w-full mx-4 rounded-[2.5rem] overflow-hidden"
              style={{ background: 'rgba(10,8,20,0.85)', border: `2px solid ${theme.claimModalBorder}`, boxShadow: theme.claimModalGlow, backdropFilter: 'blur(30px)' }}
              onClick={e => e.stopPropagation()}>
              
              {/* Rotating conic glow */}
              <motion.div className="absolute inset-0 rounded-[2.5rem] pointer-events-none opacity-50"
                style={{ background: theme.claimConic }}
                animate={{ rotate: 360 }} transition={{ duration: 5, repeat: Infinity, ease: 'linear' }} />
                
              {/* Shine sweep */}
              <motion.div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent skew-x-12"
                initial={{ x: '-150%' }} animate={{ x: '150%' }} transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.5 }} />

              {/* Stars burst */}
              {[...Array(12)].map((_, i) => (
                <motion.div key={i} className="absolute w-2 h-2 rounded-full"
                  style={{ background: i % 2 === 0 ? '#fbbf24' : '#e879f9', filter: 'blur(1px)' }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                  animate={{ 
                    x: Math.cos(i * 30 * Math.PI / 180) * (100 + Math.random() * 50), 
                    y: Math.sin(i * 30 * Math.PI / 180) * (100 + Math.random() * 50), 
                    opacity: [1, 1, 0], 
                    scale: [0, Math.random() * 2 + 1, 0] 
                  }}
                  transition={{ delay: 0.2, duration: 1.5, ease: 'easeOut' }} />
              ))}

              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring', bounce: 0.6 }}
                className="relative z-10 w-32 h-32 mb-6 rounded-full flex items-center justify-center border-4"
                style={{ background: 'rgba(255,255,255,0.05)', borderColor: theme.claimModalBorder, boxShadow: `inset 0 0 30px ${theme.claimModalBorder}` }}
              >
                <motion.div animate={{ y: [-5, 5, -5], rotate: [-2, 2, -2] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="text-7xl drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                  {claimedReward.icon}
                </motion.div>
              </motion.div>

              <div className="relative z-10 text-center">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-sm font-black uppercase tracking-[0.3em] mb-2" style={{ color: theme.claimLabel }}>
                  Freigeschaltet!
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-3xl font-black text-white mb-8 drop-shadow-md">
                  {claimedReward.label}
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                  <Button onClick={() => setClaimedReward(null)} className="w-full h-14 text-lg font-black rounded-2xl border-0 transition-transform active:scale-95"
                    style={{ background: theme.claimBtn, boxShadow: theme.claimBtnGlow }}>
                    Episch! 🚀
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}