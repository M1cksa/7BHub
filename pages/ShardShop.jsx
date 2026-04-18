import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ChevronLeft, Hammer, Info, Check, Lock, BookOpen, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { SHARD_TIERS, SHARD_BLUEPRINTS } from '@/components/battlepass/ShardConfig';
import ShardClaimAnimation from '@/components/battlepass/ShardClaimAnimation';
import ShardsTutorial from '@/components/battlepass/ShardsTutorial';

const RARITY_BADGE = {
  rare:      'bg-blue-500/10 border-blue-400/30 text-blue-300',
  epic:      'bg-purple-500/10 border-purple-400/30 text-purple-300',
  legendary: 'bg-yellow-500/10 border-yellow-400/30 text-yellow-300',
  unique:    'bg-pink-500/10 border-pink-400/30 text-pink-300',
};

function ShardCounter({ tier, count }) {
  const cfg = SHARD_TIERS[tier];
  return (
    <div
      className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <span className="text-2xl" style={{ filter: `drop-shadow(0 0 8px ${cfg.color})` }}>{cfg.icon}</span>
      <span className="text-lg font-black" style={{ color: cfg.color }}>{count}</span>
      <span className="text-[9px] text-white/40 font-bold uppercase tracking-wider">{cfg.name.split(' ')[0]}</span>
    </div>
  );
}

function BlueprintCard({ bp, inventory, crafted, onCraft, loading }) {
  const isCrafted = crafted.includes(bp.id);
  const isConvert = bp.type === 'convert';

  const canAfford = Object.entries(bp.cost).every(([tier, amount]) => (inventory[tier] || 0) >= amount);
  const canCraft = !isCrafted && canAfford && !loading;

  return (
    <motion.div
      whileHover={canCraft ? { scale: 1.02, y: -3 } : {}}
      className="rounded-2xl p-5 relative overflow-hidden flex flex-col gap-3"
      style={{
        background: isCrafted ? 'rgba(255,255,255,0.02)' : canAfford ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${isCrafted ? 'rgba(255,255,255,0.06)' : canAfford ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)'}`,
        boxShadow: canAfford && !isCrafted ? '0 0 30px rgba(255,255,255,0.05)' : 'none',
        opacity: isCrafted ? 0.6 : 1,
      }}
    >
      {canAfford && !isCrafted && (
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
      )}

      <div className="flex items-start gap-3">
        <div className="text-3xl flex-shrink-0" style={{ filter: isCrafted ? 'grayscale(1)' : 'none' }}>{bp.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-black text-white text-sm">{bp.name}</span>
            {bp.rarity && (
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${RARITY_BADGE[bp.rarity]}`}>
                {bp.rarity.toUpperCase()}
              </span>
            )}
            {isConvert && <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300">UPGRADE</span>}
            {bp.isDynamic && (
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-400/50 text-orange-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> DYNAMISCH
              </span>
            )}
          </div>
          <p className="text-xs text-white/40 leading-relaxed">{bp.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Kosten:</span>
        {Object.entries(bp.cost).map(([tier, amount]) => {
          const cfg = SHARD_TIERS[tier];
          const have = inventory[tier] || 0;
          const enough = have >= amount;
          return (
            <div key={tier} className="flex items-center gap-1 px-2 py-1 rounded-lg"
              style={{ background: cfg.bg, border: `1px solid ${enough ? cfg.border : 'rgba(239,68,68,0.3)'}` }}>
              <span className="text-sm">{cfg.icon}</span>
              <span className="text-xs font-black" style={{ color: enough ? cfg.color : '#f87171' }}>
                {amount} <span className="text-white/30 font-normal">/ {have}</span>
              </span>
            </div>
          );
        })}
      </div>

      {bp.gives && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Ergibt:</span>
          {Object.entries(bp.gives).map(([tier, amount]) => {
            const cfg = SHARD_TIERS[tier];
            return (
              <div key={tier} className="flex items-center gap-1 px-2 py-1 rounded-lg"
                style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                <span className="text-sm">{cfg.icon}</span>
                <span className="text-xs font-black" style={{ color: cfg.color }}>+{amount} {cfg.name.split(' ')[0]}</span>
              </div>
            );
          })}
        </div>
      )}

      <motion.button
        onClick={() => canCraft && onCraft(bp)}
        whileTap={canCraft ? { scale: 0.95 } : {}}
        disabled={!canCraft}
        className="w-full py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all"
        style={{
          background: isCrafted ? 'rgba(34,197,94,0.1)' : canAfford ? 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${isCrafted ? 'rgba(34,197,94,0.3)' : canAfford ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
          color: isCrafted ? '#4ade80' : canAfford ? '#fff' : 'rgba(255,255,255,0.2)',
          cursor: canCraft ? 'pointer' : 'default',
        }}
      >
        {isCrafted
          ? <><Check className="w-4 h-4" /> Gecraftet</>
          : canAfford
          ? <><Hammer className="w-4 h-4" /> {isConvert ? 'Upgraden' : 'Craften'}</>
          : <><Lock className="w-3 h-3" /> Zu wenig Shards</>
        }
      </motion.button>
    </motion.div>
  );
}

export default function ShardShop() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [claimingAnim, setClaimingAnim] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const load = () => {
      const u = localStorage.getItem('app_user');
      if (u) setUser(JSON.parse(u));
    };
    load();
    window.addEventListener('user-updated', load);

    // Auto-show tutorial for first-time visitors
    if (!localStorage.getItem('shards_tutorial_seen')) {
      setShowTutorial(true);
    }

    return () => window.removeEventListener('user-updated', load);
  }, []);

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center text-white">
      Bitte einloggen.
    </div>
  );

  const inventory = user.shard_inventory || { spark: 0, void: 0, nova: 0, omega: 0 };
  const crafted = user.shard_crafted || [];
  const totalShards = Object.values(inventory).reduce((a, b) => a + b, 0);

  const handleCraft = async (bp) => {
    setLoading(true);
    try {
      const newInventory = { ...inventory };

      for (const [tier, amount] of Object.entries(bp.cost)) {
        newInventory[tier] = (newInventory[tier] || 0) - amount;
      }

      if (bp.gives) {
        for (const [tier, amount] of Object.entries(bp.gives)) {
          newInventory[tier] = (newInventory[tier] || 0) + amount;
        }
      }

      const newCrafted = [...crafted, bp.id];
      const updates = {
        shard_inventory: newInventory,
        shard_crafted: newCrafted,
      };

      if (!bp.gives) {
        if (bp.type === 'frame') updates.owned_frames = [...(user.owned_frames || []), bp.reward_id];
        if (bp.type === 'title') updates.owned_titles = [...(user.owned_titles || []), bp.reward_id];
        if (bp.type === 'profile_effect') updates.owned_profile_effects = [...(user.owned_profile_effects || []), bp.reward_id];
        if (bp.type === 'background_animation') updates.owned_background_animations = [...(user.owned_background_animations || []), bp.reward_id];
        if (bp.type === 'theme') updates.owned_themes = [...(user.owned_themes || []), bp.reward_id];
        if (bp.type === 'emotes') updates.owned_emotes = [...(user.owned_emotes || []), bp.reward_id];
        if (bp.type === 'spaceship') {
          const upg = user.neon_dash_upgrades || {};
          const skins = upg.owned_skins || ['default'];
          if (!skins.includes(bp.reward_id)) {
            updates.neon_dash_upgrades = { ...upg, owned_skins: [...skins, bp.reward_id] };
          }
        }
      }

      const updated = await base44.entities.AppUser.update(user.id, updates);
      localStorage.setItem('app_user', JSON.stringify(updated));
      setUser(updated);
      window.dispatchEvent(new Event('user-updated'));

      if (!bp.gives) {
        const rarityToTier = { rare: 'spark', epic: 'void', legendary: 'nova', unique: 'omega' };
        setClaimingAnim({ tier: rarityToTier[bp.rarity] || 'void' });
      } else {
        toast.success(`⬆️ Upgrade erfolgreich!`);
      }
    } catch (e) {
      toast.error('Fehler beim Craften.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(135deg, #06040f, #0a0415)' }}>

      <AnimatePresence>
        {showTutorial && (
          <ShardsTutorial onClose={() => setShowTutorial(false)} />
        )}
      </AnimatePresence>

      <ShardClaimAnimation
        shard={claimingAnim}
        onDone={() => setClaimingAnim(null)}
      />

      {/* Background nebula */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 50% at 30% 20%, rgba(168,85,247,0.12) 0%, transparent 70%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 50% 40% at 70% 80%, rgba(239,68,68,0.08) 0%, transparent 60%)' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-8 pb-24">

        {/* Back + Tutorial button */}
        <div className="flex items-center justify-between mb-8">
          <Link to={createPageUrl('BattlePass')}>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold text-white/50 hover:text-white transition-all hover:bg-white/10 border border-white/10">
              <ChevronLeft className="w-4 h-4" /> Battle Pass
            </button>
          </Link>
          <button
            onClick={() => setShowTutorial(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all hover:scale-105"
            style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.35)', color: '#c084fc' }}
          >
            <BookOpen className="w-4 h-4" />
            Shard Guide
          </button>
        </div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4 border"
            style={{ background: 'rgba(168,85,247,0.1)', borderColor: 'rgba(168,85,247,0.3)', color: '#c084fc' }}>
            ⚡ Exklusiv · Nicht käuflich
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-2"
            style={{ background: 'linear-gradient(135deg, #c084fc, #ef4444, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Void Shard Shop
          </h1>
          <p className="text-white/40 text-sm max-w-lg">
            Void Shards sind die seltenste Währung im Battle Pass — nicht kaufbar, nur durch Progression verdienbar. Crafte damit einzigartige Items.
          </p>
        </motion.div>

        {/* Inventory */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-white/25">Dein Inventar</span>
            <div className="flex-1 h-px bg-white/[0.04]" />
            <span className="text-xs text-white/20">{totalShards} Shards total</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {Object.keys(SHARD_TIERS).map(tier => (
              <ShardCounter key={tier} tier={tier} count={inventory[tier] || 0} />
            ))}
          </div>
        </div>

        {/* Info box */}
        <div className="mb-8 flex items-start gap-3 p-4 rounded-2xl"
          style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
          <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-white/40 leading-relaxed">
            Shards werden im Battle Pass S2 auf bestimmten Leveln gedroppt. Höhere Tier-Shards droppen seltener — Omega Fragments gibt es nur 1× im gesamten Pass (Level 99).
            Upgrade-Rezepte erlauben dir, niedrigere Shards zu höheren zu konvertieren.
          </p>
        </div>

        {/* Blueprints */}
        <div className="flex items-center gap-2 mb-4">
          <Hammer className="w-4 h-4 text-white/30" />
          <span className="text-xs font-black uppercase tracking-[0.2em] text-white/30">Blueprints & Upgrades</span>
          <div className="flex-1 h-px bg-white/[0.04]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SHARD_BLUEPRINTS.map((bp, i) => (
            <motion.div
              key={bp.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <BlueprintCard
                bp={bp}
                inventory={inventory}
                crafted={crafted}
                onCraft={handleCraft}
                loading={loading}
              />
            </motion.div>
          ))}
        </div>

        {/* How to earn */}
        <div className="mt-10 rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-black text-white mb-4">🔵 Wie verdiene ich Shards?</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(SHARD_TIERS).map(([tier, cfg]) => (
              <div key={tier} className="text-center p-3 rounded-xl" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                <div className="text-2xl mb-1">{cfg.icon}</div>
                <div className="text-xs font-black mb-0.5" style={{ color: cfg.color }}>{cfg.name}</div>
                <div className="text-[9px] text-white/30">{cfg.label}</div>
                <div className="text-[9px] text-white/20 mt-1">
                  {tier === 'spark' && 'Level 3, 7, 12, 22, 32'}
                  {tier === 'void' && 'Level 17, 27, 37, 42...'}
                  {tier === 'nova' && 'Level 47, 67, 77, 93, 97'}
                  {tier === 'omega' && 'Level 99 — einmalig'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}