import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronLeft, Coins, Lock, CheckCircle, Trophy, Star, Zap, Crown, Target, Gift, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import ProPassTutorial, { STORAGE_KEY as PP_TUTORIAL_KEY } from '@/components/ProPassTutorial';

const PASS_COST = 100_000;
const MAX_DIMS  = 1000;

const TIERS = [
  { id: 1,  dims: 50,   name: 'Rift Breaker',      emoji: '⬡',  rarity: 'rare',
    color: '#06b6d4', desc: 'Dein erstes Dimensionstor – der Anfang einer unendlichen Reise.',
    rewards: [{ type: 'title', id: 'rift_breaker', label: '⬡ Rift Breaker ⬡' }, { type: 'profile_effect', id: 'rift_sparkle', label: '✨ Rift Sparkle' }, { type: 'tokens', amount: 2000 }]
  },
  { id: 2,  dims: 100,  name: 'Neon Voyager',       emoji: '🚀',  rarity: 'rare',
    color: '#ec4899', desc: '100 Dimensionen gemeistert – du wirst schneller und stärker.',
    rewards: [{ type: 'badge', id: 'neon_voyager', label: '🚀 Neon Voyager Badge' }, { type: 'profile_effect', id: 'neon_aura', label: '🌆 Neon Aura' }, { type: 'tokens', amount: 5000 }]
  },
  { id: 3,  dims: 200,  name: 'Prisma Erwacht',    emoji: '✨',  rarity: 'epic',
    color: '#fbbf24', desc: 'Dein Avatar beginnt, in Regenbogenfarben zu strahlen – du bist transformiert.',
    rewards: [{ type: 'animation', id: 'prisma_burst', label: '✨ Prisma Burst' }, { type: 'frame', id: 'prisma', label: '🌈 Prisma Frame' }, { type: 'tokens', amount: 8000 }]
  },
  { id: 4,  dims: 350,  name: 'Genesis Unbound',    emoji: '👁️', rarity: 'epic',
    color: '#a855f7', desc: 'Ein mystischer Rahmen aus Void-Energie. Der Anfang einer göttlichen Form.',
    rewards: [{ type: 'frame', id: 'genesis_unbound', label: '👁️ Genesis Unbound Frame' }, { type: 'profile_effect', id: 'genesis_shimmer', label: '🔮 Genesis Shimmer' }, { type: 'tokens', amount: 12000 }]
  },
  { id: 5,  dims: 500,  name: 'Kosmische Entität',  emoji: '🌌', rarity: 'legendary',
    color: '#3b82f6', desc: 'Die Hälfte geschafft. Du bist nun mehr Kosmos als Mensch.',
    rewards: [{ type: 'title', id: 'cosmic_entity', label: '🌌 Kosmische Entität 🌌' }, { type: 'bg_anim', id: 'cosmic_nebula', label: 'Kosmische Nebel-Animation' }, { type: 'profile_effect', id: 'cosmic_stars', label: '⭐ Cosmic Star Field' }, { type: 'tokens', amount: 20000 }]
  },
  { id: 6,  dims: 650,  name: 'Echo Dimensions',    emoji: '🚀', rarity: 'legendary',
    color: '#22c55e', desc: 'Ein exklusives Schiff aus parallelen Dimensionen – nur für echte Pioniere.',
    rewards: [{ type: 'neon_dash_skin', id: 'echo', label: '⬡ Echo Dimension Ship' }, { type: 'neon_dash_dimension', id: 'neo', label: '⭐ Neo Dimension' }, { type: 'profile_effect', id: 'echo_pulse', label: '💫 Echo Pulse' }, { type: 'tokens', amount: 25000 }]
  },
  { id: 7,  dims: 750,  name: 'Divine Ascension',   emoji: '⚡',  rarity: 'legendary',
    color: '#f97316', desc: 'Der Genesis-Rahmen transformiert sich in einen göttlichen Artefakt.',
    rewards: [{ type: 'frame', id: 'divine_ascension', label: '⚡ Divine Ascension Frame' }, { type: 'badge', id: 'celestial_one', label: '⭐ Celestial One Badge' }, { type: 'profile_effect', id: 'ascension_wings', label: '😇 Ascension Wings' }, { type: 'tokens', amount: 30000 }]
  },
  { id: 8,  dims: 850,  name: 'Realitätsbeuger',   emoji: '🔮', rarity: 'mythic',
    color: '#f43f5e', desc: 'Die Realität selbst beugt sich vor dir. Du wirst zu einer Legende.',
    rewards: [{ type: 'animation', id: 'reality_warp', label: '🌀 Reality Warp Animation' }, { type: 'profile_effect', id: 'reality_bend_ultra', label: '🔮 Reality Bend Ultra' }, { type: 'badge', id: 'reality_bender', label: '🔮 Reality Bender Badge' }, { type: 'tokens', amount: 40000 }]
  },
  { id: 9,  dims: 950,  name: 'Eternal Nexus',      emoji: '♾️', rarity: 'mythic',
    color: '#c084fc', desc: 'Du verbindest alle Dimensionen – unsterblich und allmächtig.',
    rewards: [{ type: 'frame', id: 'eternal_nexus', label: '♾️ Eternal Nexus Frame' }, { type: 'title', id: 'eternal_void', label: '♾️ Eternal Nexus Keeper ♾️' }, { type: 'profile_effect', id: 'nexus_rifts', label: '🌀 Nexus Rifts' }, { type: 'tokens', amount: 50000 }]
  },
  { id: 10, dims: 1000, name: 'THE ABSOLUTE',       emoji: '👑', rarity: 'absolute', isLegendary: true,
    color: '#fbbf24', desc: '🌟 DU BIST DAS ABSOLUTE. Der unerreichbare Gipfel. Dein Name wird in den Annalen dieser Plattform verewigt. 🌟',
    rewards: [{ type: 'frame', id: 'absolute_throne', label: '👑 THE ABSOLUTE THRONE' }, { type: 'title', id: 'der_absolute', label: '⭕ THE ABSOLUTE ⭕' }, { type: 'badge', id: 'absolute_crowned', label: '👑 Absolute Crowned Badge' }, { type: 'profile_effect', id: 'absolute_coronation', label: '✨ Absolute Coronation' }, { type: 'badge', id: 's2_vip', label: '🎟️ SEASON 2 VIP PASS' }, { type: 'tokens', amount: 100000 }]
  },
];

const RARITY_CFG = {
  rare:      { label: 'RARE',      color: '#06b6d4', glow: 'rgba(6,182,212,0.4)',    bg: 'rgba(6,182,212,0.08)' },
  epic:      { label: 'EPIC',      color: '#a855f7', glow: 'rgba(168,85,247,0.4)',   bg: 'rgba(168,85,247,0.08)' },
  legendary: { label: 'LEGENDARY', color: '#f97316', glow: 'rgba(249,115,22,0.4)',   bg: 'rgba(249,115,22,0.08)' },
  mythic:    { label: 'MYTHIC',    color: '#c084fc', glow: 'rgba(192,132,252,0.45)', bg: 'rgba(192,132,252,0.1)' },
  absolute:  { label: 'ABSOLUTE',  color: '#fbbf24', glow: 'rgba(251,191,36,0.6)',   bg: 'rgba(251,191,36,0.12)' },
};

export default function ProPass() {
  const canvasRef = useRef(null);
  const [user, setUser] = useState(() => {
    try { const u = localStorage.getItem('app_user'); return u && u !== 'undefined' ? JSON.parse(u) : null; } catch { return null; }
  });
  const [purchasing, setPurchasing] = useState(false);
  const [claiming, setClaiming] = useState(null);
  const [showPurchaseConfirm, setShowPurchaseConfirm] = useState(false);
  const [dimensionOpen, setDimensionOpen] = useState(null);
  const [showTutorial, setShowTutorial] = useState(() => {
    try {
      const stored = localStorage.getItem('app_user');
      const u = stored && stored !== 'undefined' ? JSON.parse(stored) : null;
      if (u?.propass_tutorial_seen) return false;
    } catch {}
    return !localStorage.getItem(PP_TUTORIAL_KEY);
  });

  useEffect(() => {
    const sync = async () => {
      try {
        if (!user?.id) return;
        const fresh = await base44.entities.AppUser.filter({ id: user.id }, '-created_date', 1);
        if (fresh?.[0]) { setUser(fresh[0]); localStorage.setItem('app_user', JSON.stringify(fresh[0])); }
      } catch {}
    };
    sync();
  }, []);

  // Animated cosmic canvas
  useEffect(() => {
    const lw = localStorage.getItem('lightweight_mode') === 'true';
    if (lw) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const ctx = canvas.getContext('2d');
    const stars = Array.from({ length: 300 }, () => ({
      x: Math.random(), y: Math.random(), size: Math.random() * 1.5 + 0.3,
      flicker: Math.random() * Math.PI * 2, fSpeed: Math.random() * 0.03 + 0.008, opacity: Math.random() * 0.5 + 0.2,
    }));
    const orbs = [
      { x: 0.12, y: 0.22, r: 0.24, c: '120,40,200',  p: 0.0 },
      { x: 0.82, y: 0.12, r: 0.20, c: '6,182,212',   p: 1.2 },
      { x: 0.48, y: 0.78, r: 0.22, c: '236,72,153',  p: 2.4 },
      { x: 0.88, y: 0.65, r: 0.17, c: '251,191,36',  p: 3.6 },
      { x: 0.25, y: 0.60, r: 0.18, c: '59,130,246',  p: 0.8 },
    ];
    let rafId;
    const loop = () => {
      rafId = requestAnimationFrame(loop);
      const W = canvas.width, H = canvas.height;
      ctx.fillStyle = 'rgba(1, 0, 12, 0.18)';
      ctx.fillRect(0, 0, W, H);
      for (const orb of orbs) {
        orb.p += 0.003;
        const ox = orb.x * W + Math.sin(orb.p) * W * 0.07;
        const oy = orb.y * H + Math.cos(orb.p * 0.7) * H * 0.06;
        const r = orb.r * Math.min(W, H) * 0.48;
        const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, r);
        g.addColorStop(0, `rgba(${orb.c},0.2)`);
        g.addColorStop(1, `rgba(${orb.c},0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(ox, oy, r, 0, Math.PI * 2); ctx.fill();
      }
      for (const s of stars) {
        s.flicker += s.fSpeed;
        const op = Math.max(0, s.opacity * (0.65 + Math.sin(s.flicker) * 0.35));
        ctx.fillStyle = `rgba(255,255,255,${op.toFixed(2)})`;
        ctx.beginPath(); ctx.arc(s.x * W, s.y * H, s.size, 0, Math.PI * 2); ctx.fill();
      }
    };
    loop();
    return () => { cancelAnimationFrame(rafId); window.removeEventListener('resize', resize); };
  }, []);

  const proPass       = user?.pro_pass || {};
  const isPurchased   = proPass.purchased || false;
  const dimsTraversed = proPass.dims_traversed || 0;
  const claimedTiers  = proPass.claimed_tiers || [];
  const progressPct   = Math.min(100, (dimsTraversed / MAX_DIMS) * 100);

  const isClaimed  = (tier) => claimedTiers.includes(tier.id);
  const isUnlocked = (tier) => isPurchased && dimsTraversed >= tier.dims;
  const canClaim   = (tier) => isUnlocked(tier) && !isClaimed(tier);
  const nextTier   = TIERS.find(t => !isClaimed(t) && isPurchased);

  const purchase = async () => {
    if (!user) { toast.error('Nicht eingeloggt!'); return; }
    if ((user.tokens || 0) < PASS_COST) { toast.error(`Nicht genug Tokens!`); return; }
    setPurchasing(true); setShowPurchaseConfirm(false);
    try {
      const updated = await base44.entities.AppUser.update(user.id, {
        tokens: user.tokens - PASS_COST,
        pro_pass: { purchased: true, purchased_at: new Date().toISOString(), dims_traversed: 0, claimed_tiers: [] },
      });
      localStorage.setItem('app_user', JSON.stringify(updated)); setUser(updated);
      window.dispatchEvent(new Event('user-updated'));
      confetti({ particleCount: 250, spread: 120, origin: { y: 0.45 }, colors: ['#fbbf24', '#a855f7', '#06b6d4', '#ffffff', '#f97316'] });
      setTimeout(() => confetti({ particleCount: 150, spread: 80, angle: 60, origin: { x: 0, y: 0.5 }, colors: ['#fbbf24', '#ec4899'] }), 300);
      setTimeout(() => confetti({ particleCount: 150, spread: 80, angle: 120, origin: { x: 1, y: 0.5 }, colors: ['#06b6d4', '#a855f7'] }), 600);
      toast.success('🌟 ABSOLUTER PRO PASS FREIGESCHALTET!', { duration: 6000 });
    } catch { toast.error('Fehler beim Kauf'); }
    finally { setPurchasing(false); }
  };

  const claimTier = async (tier) => {
    if (!user || claiming) return;
    setClaiming(tier.id);
    try {
      const updates = { pro_pass: { ...proPass, claimed_tiers: [...claimedTiers, tier.id] } };
      let ndUpgrades = { ...(user.neon_dash_upgrades || {}) };
      for (const r of tier.rewards) {
        if (r.type === 'tokens')             updates.tokens = (updates.tokens ?? user.tokens ?? 0) + r.amount;
        if (r.type === 'title')              updates.owned_titles = [...new Set([...(user.owned_titles || []), r.id])];
        if (r.type === 'badge')              updates.owned_badges = [...new Set([...(user.owned_badges || []), r.id])];
        if (r.type === 'frame')              updates.owned_frames = [...new Set([...(user.owned_frames || []), r.id])];
        if (r.type === 'animation')          updates.owned_animations = [...new Set([...(user.owned_animations || []), r.id])];
        if (r.type === 'bg_anim')            updates.owned_background_animations = [...new Set([...(user.owned_background_animations || ['default']), r.id])];
        if (r.type === 'profile_effect')     updates.owned_profile_effects = [...new Set([...(user.owned_profile_effects || []), r.id])];
        if (r.type === 'neon_dash_skin')     { ndUpgrades = { ...ndUpgrades, owned_skins: [...new Set([...(ndUpgrades.owned_skins || ['default']), r.id])] }; updates.neon_dash_upgrades = ndUpgrades; }
        if (r.type === 'neon_dash_dimension') { ndUpgrades = { ...ndUpgrades, owned_dimensions: [...new Set([...(ndUpgrades.owned_dimensions || []), r.id])] }; updates.neon_dash_upgrades = ndUpgrades; }
      }
      updates.neon_dash_upgrades = ndUpgrades;
      const updated = await base44.entities.AppUser.update(user.id, updates);
      localStorage.setItem('app_user', JSON.stringify(updated)); setUser(updated);
      window.dispatchEvent(new Event('user-updated'));
      setDimensionOpen(tier.id);
      setTimeout(() => setDimensionOpen(null), 1400);
      const colors = [tier.color, '#ffffff', '#fbbf24', '#a855f7'];
      confetti({ particleCount: tier.isLegendary ? 500 : 160, spread: tier.isLegendary ? 200 : 90, origin: { y: 0.4 }, colors });
      if (tier.isLegendary) {
        setTimeout(() => confetti({ particleCount: 300, spread: 160, angle: 60, origin: { x: 0, y: 0.5 }, colors }), 400);
        setTimeout(() => confetti({ particleCount: 300, spread: 160, angle: 120, origin: { x: 1, y: 0.5 }, colors }), 800);
      }
      toast.success(tier.isLegendary ? '👑 DU BIST DER ABSOLUTE!' : `✨ Tier ${tier.id} freigeschaltet: ${tier.name}!`, { duration: tier.isLegendary ? 8000 : 3500 });
    } catch { toast.error('Fehler beim Freischalten'); }
    finally { setClaiming(null); }
  };

  return (
    <div className="min-h-screen relative text-white overflow-x-hidden" style={{ background: '#01000c' }}>
      <AnimatePresence>{showTutorial && <ProPassTutorial onClose={() => setShowTutorial(false)} />}</AnimatePresence>

      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: 'rgba(1,0,12,0.5)' }} />

      <style>{`
        @keyframes shimmer { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
        @keyframes ppGlow { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes floatUp { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes portalSpin { 0% { transform: scale(0) rotate(0deg); opacity:0; } 50% { transform: scale(1.25) rotate(180deg); opacity:1; } 100% { transform: scale(1) rotate(360deg); opacity:0.7; } }
        @keyframes rotateSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .shimmer-text { background-image: linear-gradient(90deg, #fbbf24, #f97316, #c084fc, #06b6d4, #fbbf24); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; background-size: 300% 100%; animation: shimmer 4s linear infinite; }
        .float-anim { animation: floatUp 3.5s ease-in-out infinite; }
      `}</style>

      {/* Nav */}
      <div className="fixed top-5 left-5 z-30">
        <Link to={createPageUrl('NeonDash')}>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold text-white/50 hover:text-white bg-black/30 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all">
            <ChevronLeft className="w-4 h-4" /> Neon Dash
          </button>
        </Link>
      </div>
      <div className="fixed top-5 right-5 z-30">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(251,191,36,0.3)', backdropFilter: 'blur(16px)' }}>
          <Coins className="w-4 h-4 text-yellow-400" />
          <span className="font-black text-yellow-400 text-sm">{(user?.tokens || 0).toLocaleString()}</span>
        </div>
      </div>

      {/* Dimension Open Overlay */}
      <AnimatePresence>
        {dimensionOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none">
            <div className="relative flex items-center justify-center" style={{ width: 400, height: 400 }}>
              <motion.div className="absolute inset-0 rounded-full" initial={{ scale: 0, rotate: 0 }} animate={{ scale: [0, 1.3, 1], rotate: [0, 180, 360], opacity: [0, 1, 0.7] }} transition={{ duration: 1.4 }}
                style={{ border: '3px solid #a855f7', boxShadow: '0 0 60px rgba(168,85,247,0.8), 0 0 120px rgba(6,182,212,0.4)' }} />
              <motion.div className="absolute rounded-full" style={{ inset: 40 }} initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 1.2, delay: 0.1 }}
                style={{ border: '2px solid #06b6d4', boxShadow: '0 0 40px rgba(6,182,212,0.6)' }} />
              <div className="text-center z-10">
                <div className="text-7xl animate-pulse mb-3">⬡</div>
                <p className="text-white font-black text-lg tracking-widest">DIMENSION ÖFFNET!</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-20 pb-28">

        {/* ── HERO ── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12 pt-6">
          <div className="float-anim text-8xl mb-6 select-none leading-none">⭕</div>

          <motion.div animate={{ opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 2.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-5 border"
            style={{ background: 'rgba(251,191,36,0.08)', borderColor: 'rgba(251,191,36,0.35)', color: '#fbbf24' }}>
            <Crown className="w-3 h-3" /> Die ultimative Herausforderung
          </motion.div>

          <h1 className="shimmer-text text-5xl md:text-6xl font-black tracking-tight leading-none mb-4">
            ABSOLUTER<br />PRO PASS
          </h1>
          <p className="text-white/35 text-sm font-bold max-w-xs mx-auto leading-relaxed">
            1.000 Dimensionen · 10 Meilensteine · Ewiger Ruhm
          </p>

          {/* Stats pills */}
          <div className="flex justify-center gap-3 mt-8 flex-wrap">
            {[
              { icon: Gift, label: '10 Tiers', sub: '250k+ Tokens Wert', color: '#fbbf24' },
              { icon: Target, label: '1.000 Dims', sub: 'Ultimatives Ziel', color: '#a855f7' },
              { icon: Trophy, label: 'Ewiger Ruhm', sub: 'Exklusiv für immer', color: '#06b6d4' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                className="flex flex-col items-center gap-1.5 px-5 py-3 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
                <p className="text-xs font-black text-white/80">{s.label}</p>
                <p className="text-[10px] text-white/30">{s.sub}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── PURCHASE CTA ── */}
        {!isPurchased && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="mb-10">
            <div className="rounded-3xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.07), rgba(168,85,247,0.1))', border: '1px solid rgba(251,191,36,0.25)' }}>
              {/* Animated top line */}
              <motion.div className="h-px w-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}
                style={{ background: 'linear-gradient(90deg, transparent, #fbbf24, #a855f7, transparent)' }} />
              {/* Diagonal stripes */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(251,191,36,0.8) 10px, rgba(251,191,36,0.8) 11px)' }} />

              <div className="relative p-7 text-center">
                <p className="text-white/50 text-sm mb-7 leading-relaxed max-w-md mx-auto">
                  Der Absoluter Pro Pass ist das <strong className="text-white/90">ultimative Langzeitziel</strong> dieser Plattform.
                  Traversiere 1000 Dimensionen in Neon Dash und erhalte einzigartige evolutionäre Belohnungen –
                  darunter exklusive Rahmen, Titel, Animationen und ein einzigartiges Raumschiff,
                  das <strong className="text-white/90">nirgendwo sonst erhältlich</strong> ist.
                </p>

                {/* Price display */}
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Coins className="w-7 h-7 text-yellow-400" />
                  <span className="text-5xl font-black text-yellow-400 tabular-nums">100.000</span>
                  <span className="text-white/30 font-bold text-lg">Tokens</span>
                </div>
                <p className="text-xs mb-7">
                  Du hast: <span className={`font-black ${(user?.tokens || 0) >= PASS_COST ? 'text-green-400' : 'text-red-400'}`}>{(user?.tokens || 0).toLocaleString()}</span>
                  {(user?.tokens || 0) < PASS_COST && <span className="text-orange-400/60 ml-2">· Fehlen noch {(PASS_COST - (user?.tokens || 0)).toLocaleString()}</span>}
                </p>

                {!showPurchaseConfirm ? (
                  <button
                    onClick={() => (user?.tokens || 0) >= PASS_COST && setShowPurchaseConfirm(true)}
                    disabled={(user?.tokens || 0) < PASS_COST}
                    className="w-full py-5 rounded-2xl font-black text-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: (user?.tokens || 0) >= PASS_COST ? 'linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #fbbf24 100%)' : 'rgba(255,255,255,0.08)', backgroundSize: '200%', animation: (user?.tokens || 0) >= PASS_COST ? 'shimmer 3s linear infinite' : 'none', color: (user?.tokens || 0) >= PASS_COST ? '#000' : '#ffffff30', boxShadow: (user?.tokens || 0) >= PASS_COST ? '0 0 40px rgba(251,191,36,0.3)' : 'none' }}>
                    ⭕ JETZT FREISCHALTEN
                  </button>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
                    <p className="text-yellow-400 font-black text-sm">⚠️ Bist du sicher? Du gibst 100.000 Tokens aus!</p>
                    <div className="flex gap-3">
                      <button onClick={() => setShowPurchaseConfirm(false)} className="flex-1 py-3 rounded-2xl border border-white/15 text-white/50 hover:text-white hover:border-white/30 transition-all font-bold text-sm">Abbrechen</button>
                      <button onClick={purchase} disabled={purchasing}
                        className="flex-1 py-3 rounded-2xl font-black text-black text-sm transition-all"
                        style={{ background: 'linear-gradient(135deg, #fbbf24, #f97316)', boxShadow: '0 0 20px rgba(251,191,36,0.3)' }}>
                        {purchasing ? '⏳ Wird gekauft...' : '✓ Ja, kaufen!'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── PROGRESS DASHBOARD (if purchased) ── */}
        {isPurchased && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="rounded-3xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(168,85,247,0.2)', backdropFilter: 'blur(20px)' }}>
              {/* Rainbow accent top */}
              <div className="h-1" style={{ background: 'linear-gradient(90deg, #7c3aed, #06b6d4, #a855f7, #f97316, #fbbf24)' }} />

              <div className="p-6">
                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { value: dimsTraversed.toLocaleString(), label: 'Dimensionen', color: '#fbbf24' },
                    { value: `${claimedTiers.length}/10`, label: 'Tiers', color: claimedTiers.length >= 10 ? '#fbbf24' : '#c084fc' },
                    { value: `${Math.floor(progressPct)}%`, label: 'Abschluss', color: '#06b6d4' },
                  ].map(({ value, label, color }) => (
                    <div key={label} className="text-center rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <p className="text-2xl font-black tabular-nums" style={{ color }}>{value}</p>
                      <p className="text-[10px] text-white/30 font-black uppercase tracking-wider mt-1">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Main progress bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">Gesamtfortschritt</span>
                    <span className="text-[10px] text-white/30 font-black">{dimsTraversed.toLocaleString()} / {MAX_DIMS.toLocaleString()}</span>
                  </div>
                  <div className="h-4 rounded-full overflow-hidden relative" style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} transition={{ duration: 1.6, ease: 'easeOut' }}
                      className="h-full rounded-full relative overflow-hidden"
                      style={{ background: 'linear-gradient(90deg, #7c3aed, #06b6d4, #a855f7, #f97316, #fbbf24)', boxShadow: '0 0 12px rgba(168,85,247,0.5)' }}>
                      <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)', backgroundSize: '200% 100%', animation: 'shimmer 2s linear infinite' }} />
                    </motion.div>
                    {TIERS.map(t => (
                      <div key={t.id} className="absolute top-0 bottom-0 w-px" style={{ left: `${(t.dims / MAX_DIMS) * 100}%`, background: isClaimed(t) ? t.color + '80' : 'rgba(255,255,255,0.12)' }} />
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] text-white/20 font-black mt-1 px-0.5">
                    <span>0</span><span>500</span><span>1000</span>
                  </div>
                </div>

                {/* Tier dots */}
                <div className="flex items-center justify-between px-1">
                  {TIERS.map(t => {
                    const done = isClaimed(t);
                    const rdy = canClaim(t);
                    return (
                      <div key={t.id} className="flex flex-col items-center gap-1">
                        <motion.div animate={rdy ? { scale: [1, 1.2, 1] } : {}} transition={{ repeat: Infinity, duration: 1.5 }}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black transition-all"
                          style={{ background: done ? t.color : rdy ? `${t.color}60` : isUnlocked(t) ? `${t.color}25` : 'rgba(255,255,255,0.05)', border: `1.5px solid ${done || rdy ? t.color : 'rgba(255,255,255,0.1)'}`, boxShadow: rdy ? `0 0 10px ${t.color}70` : 'none', color: done || rdy ? '#fff' : 'rgba(255,255,255,0.3)' }}>
                          {done ? '✓' : t.id}
                        </motion.div>
                        <span className="text-[7px] text-white/20 font-black">{t.dims >= 1000 ? '1k' : t.dims}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Next milestone banner */}
                {nextTier && claimedTiers.length < 10 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="mt-5 flex items-center gap-3 rounded-2xl px-4 py-3"
                    style={{ background: `${nextTier.color}08`, border: `1px solid ${nextTier.color}30` }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: `${nextTier.color}15` }}>
                      {canClaim(nextTier) ? '🎁' : nextTier.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black" style={{ color: nextTier.color }}>
                        {canClaim(nextTier) ? '🎉 Bereit zum Einlösen!' : `Nächstes Ziel: ${nextTier.name}`}
                      </p>
                      <p className="text-[10px] text-white/30">
                        {canClaim(nextTier) ? `Tier ${nextTier.id} – klicke CLAIM weiter unten` : `${nextTier.dims} Dims · noch ${Math.max(0, nextTier.dims - dimsTraversed).toLocaleString()} übrig`}
                      </p>
                    </div>
                    {canClaim(nextTier) && (
                      <button onClick={() => claimTier(nextTier)} disabled={!!claiming}
                        className="font-black text-xs px-5 py-2.5 rounded-xl border-none text-black whitespace-nowrap flex-shrink-0 transition-all hover:scale-105"
                        style={{ background: `linear-gradient(135deg, ${nextTier.color}, #f97316)`, boxShadow: `0 0 16px ${nextTier.color}50` }}>
                        {claiming === nextTier.id ? '⏳' : 'CLAIM!'}
                      </button>
                    )}
                  </motion.div>
                )}

                {claimedTiers.length === 10 && (
                  <div className="mt-5 text-center py-4 rounded-2xl" style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.3)' }}>
                    <p className="shimmer-text text-xl font-black">👑 DU BIST DER ABSOLUTE 👑</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── TIER LIST ── */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.3))' }} />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/25">{isPurchased ? 'Deine Meilensteine' : 'Belohnungen Vorschau'}</span>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(168,85,247,0.3), transparent)' }} />
          </div>

          <div className="space-y-3">
            {TIERS.map((tier, idx) => {
              const rcfg = RARITY_CFG[tier.rarity];
              const unlocked = isUnlocked(tier);
              const claimed = isClaimed(tier);
              const claimable = canClaim(tier);
              const tierPct = isPurchased ? Math.min(100, (dimsTraversed / tier.dims) * 100) : 0;
              const tokenReward = tier.rewards.find(r => r.type === 'tokens');
              const nonTokenRewards = tier.rewards.filter(r => r.type !== 'tokens');

              return (
                <motion.div key={tier.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.35 }}
                  className={`rounded-2xl overflow-hidden relative transition-all duration-400 ${tier.isLegendary ? 'scale-[1.015]' : ''}`}
                  style={{
                    background: claimed ? 'rgba(255,255,255,0.015)' : claimable ? rcfg.bg : unlocked ? rcfg.bg : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${claimable ? tier.color + '80' : claimed ? 'rgba(255,255,255,0.05)' : unlocked ? rcfg.glow : 'rgba(255,255,255,0.07)'}`,
                    boxShadow: claimable ? `0 0 30px ${tier.color}35, inset 0 0 20px ${tier.color}08` : tier.isLegendary && unlocked ? `0 0 40px ${tier.color}20` : 'none',
                  }}>

                  {/* Color accent bar */}
                  <div className="h-0.5" style={{ background: claimed ? 'rgba(255,255,255,0.04)' : claimable ? `linear-gradient(90deg, ${tier.color}, ${tier.color}50)` : `linear-gradient(90deg, ${tier.color}50, transparent)` }} />

                  {/* Legendary shimmer overlay */}
                  {tier.isLegendary && unlocked && (
                    <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(105deg, transparent 40%, ${tier.color}20 50%, transparent 60%)`, backgroundSize: '200% 100%', animation: 'shimmer 2.5s linear infinite' }} />
                  )}

                  <div className="p-4 md:p-5">
                    <div className="flex items-start gap-3">
                      {/* Emoji icon */}
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl select-none flex-shrink-0 transition-all"
                        style={{ background: claimed ? 'rgba(255,255,255,0.03)' : `${tier.color}15`, border: `1px solid ${claimed ? 'rgba(255,255,255,0.06)' : tier.color + '30'}`, boxShadow: unlocked && !claimed ? `0 0 20px ${tier.color}35` : 'none' }}>
                        {claimed ? '✅' : unlocked ? tier.emoji : '🔒'}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: rcfg.bg, color: rcfg.color, border: `1px solid ${rcfg.color}30` }}>{rcfg.label}</span>
                          <span className="text-[9px] text-white/20 font-black">TIER {tier.id}</span>
                          <span className="text-[9px] font-black" style={{ color: tier.color + '99' }}>⬡ {tier.dims.toLocaleString()} Dims</span>
                          {claimed && <span className="text-[9px] text-green-400/50 font-black">✓ ERHALTEN</span>}
                        </div>
                        <h3 className={`font-black leading-tight mb-1 ${claimed ? 'text-white/25' : 'text-white'} ${tier.isLegendary ? 'text-base' : 'text-sm'}`}
                          style={!claimed && unlocked ? { color: tier.color } : {}}>
                          {tier.name}
                        </h3>
                        <p className={`text-[11px] leading-snug mb-2.5 ${claimed ? 'text-white/15' : 'text-white/35'}`}>{tier.desc}</p>

                        {/* Rewards */}
                        <div className="flex flex-wrap gap-1.5">
                          {nonTokenRewards.map((r, ri) => (
                            <span key={ri} className="text-[9px] px-2 py-0.5 rounded-full font-bold"
                              style={{ background: `${tier.color}10`, color: `${tier.color}cc`, border: `1px solid ${tier.color}20` }}>
                              {r.label}
                            </span>
                          ))}
                        </div>

                        {/* Per-tier progress bar */}
                        {isPurchased && !claimed && (
                          <div className="mt-3">
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
                              <motion.div initial={{ width: 0 }} animate={{ width: `${tierPct}%` }} transition={{ duration: 1.2, delay: idx * 0.05, ease: 'easeOut' }}
                                className="h-full rounded-full"
                                style={{ background: tierPct >= 100 ? `linear-gradient(90deg, ${tier.color}, #fff)` : tier.color, boxShadow: tierPct >= 100 ? `0 0 6px ${tier.color}` : 'none' }} />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right side: token badge + action */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {tokenReward && (
                          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
                            <span className="text-xs">🪙</span>
                            <span className="text-xs font-black text-yellow-400">{tokenReward.amount >= 1000 ? `${tokenReward.amount / 1000}k` : tokenReward.amount}</span>
                          </div>
                        )}
                        {claimable && (
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
                            onClick={() => claimTier(tier)} disabled={!!claiming}
                            className="font-black text-xs px-4 py-2.5 rounded-xl border-none text-black whitespace-nowrap"
                            style={{ background: tier.isLegendary ? `linear-gradient(135deg, ${tier.color}, #f97316, ${tier.color})` : `linear-gradient(135deg, ${tier.color}, ${tier.color}cc)`, backgroundSize: '200%', animation: tier.isLegendary ? 'shimmer 2s linear infinite' : 'none', boxShadow: `0 0 14px ${tier.color}55` }}>
                            {claiming === tier.id ? '⏳' : tier.isLegendary ? '👑 CLAIM!' : '✦ CLAIM!'}
                          </motion.button>
                        )}
                        {claimed && <CheckCircle className="w-5 h-5" style={{ color: tier.color + '50' }} />}
                        {!claimable && !claimed && <Lock className="w-4 h-4" style={{ color: unlocked ? tier.color + '30' : 'rgba(255,255,255,0.07)' }} />}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="mt-10 rounded-3xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.05), rgba(168,85,247,0.06))', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="p-7 text-center space-y-4">
              <div className="text-4xl">⭕</div>
              <p className="font-black tracking-widest text-white/25 uppercase text-[10px]">— Über 250.000 Tokens Wert an Belohnungen —</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl p-4" style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p className="text-2xl font-black text-yellow-400">250k+</p>
                  <p className="text-[10px] text-white/25 mt-1">Tokens Belohnungen</p>
                </div>
                <div className="rounded-2xl p-4" style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p className="text-2xl font-black text-violet-400">S2 VIP</p>
                  <p className="text-[10px] text-white/25 mt-1">Season 2 VIP Pass inklusive</p>
                </div>
              </div>
              <p className="text-white/12 text-xs leading-relaxed">Spieler mit dem Absoluten Pro Pass erhalten ewigen Ruhm<br />und einen unvergänglichen Platz in der Geschichte dieser Plattform.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}