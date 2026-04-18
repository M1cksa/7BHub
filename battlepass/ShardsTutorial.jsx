import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles, Zap, ShoppingBag, ArrowUp, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SHARD_TIERS, SHARD_BLUEPRINTS } from './ShardConfig';

const STEPS = [
  {
    id: 'intro',
    title: 'Was sind Void Shards?',
    subtitle: 'Die exklusivste Währung der Plattform',
    icon: '💎',
    color: '#a855f7',
    glow: 'rgba(168,85,247,0.4)',
    content: (
      <div className="space-y-4">
        <p className="text-white/70 text-lg leading-relaxed">
          <span className="text-purple-400 font-bold">Void Shards</span> sind eine einzigartige Währung, 
          die du <strong className="text-white">ausschließlich</strong> durch den Battle Pass verdienen kannst.
          Sie sind <span className="text-yellow-400 font-bold">nicht kaufbar</span> — nur echte Spieler bekommen sie.
        </p>
        <div className="grid grid-cols-2 gap-3 mt-6">
          {['Nur durch BP verdienbar', 'Nie käuflich', 'Exklusive Crafting-Items', 'Saisongebunden'].map((fact, i) => (
            <div key={i} className="flex items-center gap-2 bg-white/5 rounded-xl p-3">
              <div className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0" />
              <span className="text-white/70 text-sm font-medium">{fact}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'tiers',
    title: 'Die 4 Shard-Typen',
    subtitle: 'Von selten bis mythisch',
    icon: '🔮',
    color: '#06b6d4',
    glow: 'rgba(6,182,212,0.4)',
    content: (
      <div className="space-y-3">
        {Object.values(SHARD_TIERS).map((tier, i) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-4 rounded-2xl p-4 border"
            style={{ backgroundColor: tier.bg, borderColor: tier.border }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg"
              style={{ boxShadow: `0 0 20px ${tier.glow}`, background: `linear-gradient(135deg, ${tier.bg}, transparent)`, border: `1px solid ${tier.border}` }}
            >
              {tier.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{tier.name}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${tier.color}30`, color: tier.color }}>
                  {tier.label}
                </span>
              </div>
              <span className="text-xs text-white/40">
                {tier.id === 'spark' && 'Frühe Battle Pass Level · Häufigste Drops'}
                {tier.id === 'void' && 'Ab Level 17 · Wichtig fürs Crafting'}
                {tier.id === 'nova' && 'Ab Level 47 · Sehr wertvoll'}
                {tier.id === 'omega' && 'Level 99 · Einzigartig in der ganzen Season'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    id: 'earn',
    title: 'Shards verdienen',
    subtitle: 'Durch den Battle Pass freischalten',
    icon: '⚡',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.4)',
    content: (
      <div className="space-y-4">
        <p className="text-white/70 leading-relaxed">
          Shards warten auf dich im <span className="text-amber-400 font-bold">Battle Pass</span> — 
          verteilt über alle 100 Level. Du erkennst sie an den leuchtenden Shard-Icons in der Reward-Leiste.
        </p>
        {/* Visual drop schedule preview */}
        <div className="relative bg-white/5 rounded-2xl p-4 border border-white/10 overflow-hidden">
          <div className="text-xs text-white/40 font-bold uppercase tracking-wider mb-3">Shard-Drops im BP</div>
          <div className="flex items-end gap-1 h-16">
            {[
              { lvl: 3, tier: 'spark' }, { lvl: 7, tier: 'spark' }, { lvl: 12, tier: 'spark' },
              { lvl: 17, tier: 'void' }, { lvl: 22, tier: 'spark' }, { lvl: 27, tier: 'void' },
              { lvl: 37, tier: 'void' }, { lvl: 47, tier: 'nova' }, { lvl: 53, tier: 'void' },
              { lvl: 62, tier: 'void' }, { lvl: 67, tier: 'nova' }, { lvl: 77, tier: 'nova' },
              { lvl: 82, tier: 'void' }, { lvl: 89, tier: 'void' }, { lvl: 93, tier: 'nova' },
              { lvl: 97, tier: 'nova' }, { lvl: 99, tier: 'omega' },
            ].map((drop, i) => {
              const tier = SHARD_TIERS[drop.tier];
              const height = drop.tier === 'omega' ? 64 : drop.tier === 'nova' ? 48 : drop.tier === 'void' ? 36 : 24;
              return (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="flex-1 rounded-t-md cursor-pointer group relative"
                  style={{ backgroundColor: tier.color + '60', border: `1px solid ${tier.border}` }}
                  title={`${tier.name} — Level ${drop.lvl}`}
                >
                  {drop.tier === 'omega' && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs">🔴</div>
                  )}
                </motion.div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-white/30 mt-2">
            <span>Level 1</span>
            <span>Level 50</span>
            <span>Level 100</span>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          {Object.values(SHARD_TIERS).map(tier => (
            <div key={tier.id} className="flex items-center gap-1.5 text-xs">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: tier.color }} />
              <span className="text-white/50">{tier.name}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'crafting',
    title: 'Crafting & Blueprints',
    subtitle: 'Erschaffe einzigartige Items',
    icon: '🔨',
    color: '#ec4899',
    glow: 'rgba(236,72,153,0.4)',
    content: (
      <div className="space-y-3">
        <p className="text-white/70 leading-relaxed text-sm">
          Im <span className="text-pink-400 font-bold">Shard Shop</span> kannst du deine Shards für 
          exklusive Blueprints einsetzen — Items, die du <strong className="text-white">nirgendwo anders</strong> bekommst.
        </p>
        <div className="space-y-2">
          {SHARD_BLUEPRINTS.slice(0, 4).map((bp, i) => (
            <motion.div
              key={bp.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3 bg-white/[0.04] rounded-xl p-3 border border-white/10"
            >
              <span className="text-2xl">{bp.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate">{bp.name}</div>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {Object.entries(bp.cost).map(([type, amount]) => {
                    const tier = SHARD_TIERS[type];
                    return tier ? (
                      <span key={type} className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: tier.bg, color: tier.color, border: `1px solid ${tier.border}` }}>
                        {tier.icon} ×{amount}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                bp.rarity === 'unique' ? 'bg-yellow-500/20 text-yellow-400' :
                bp.rarity === 'legendary' ? 'bg-orange-500/20 text-orange-400' :
                bp.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>{bp.rarity}</span>
            </motion.div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'upgrade',
    title: 'Shards upgraden',
    subtitle: 'Kleine zu großen machen',
    icon: '⬆️',
    color: '#10b981',
    glow: 'rgba(16,185,129,0.4)',
    content: (
      <div className="space-y-4">
        <p className="text-white/70 leading-relaxed">
          Hast du viele <span className="text-blue-400 font-bold">Spark Shards</span> angesammelt, aber brauchst 
          Void oder Nova? Kein Problem — upgrade sie direkt im Shard Shop!
        </p>
        <div className="space-y-3">
          {[
            { from: SHARD_TIERS.spark, fromAmt: 5, to: SHARD_TIERS.void, toAmt: 1 },
            { from: SHARD_TIERS.void, fromAmt: 4, to: SHARD_TIERS.nova, toAmt: 1 },
          ].map((conv, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.15 }}
              className="flex items-center gap-4 bg-white/5 rounded-2xl p-5 border border-white/10"
            >
              <div className="text-center">
                <div className="text-3xl mb-1">{conv.from.icon}</div>
                <div className="text-xs font-bold" style={{ color: conv.from.color }}>×{conv.fromAmt}</div>
                <div className="text-[10px] text-white/40">{conv.from.name}</div>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <motion.div
                  animate={{ x: [0, 6, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.5 }}
                >
                  <ArrowUp className="w-6 h-6 text-emerald-400 rotate-90" />
                </motion.div>
                <div className="text-xs text-emerald-400 font-bold mt-1">Upgrade</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-1">{conv.to.icon}</div>
                <div className="text-xs font-bold" style={{ color: conv.to.color }}>×{conv.toAmt}</div>
                <div className="text-[10px] text-white/40">{conv.to.name}</div>
              </div>
            </motion.div>
          ))}
        </div>
        <p className="text-white/40 text-xs text-center">Upgrades sind im Shard Shop verfügbar → "Blueprints" Tab</p>
      </div>
    ),
  },
  {
    id: 'done',
    title: 'Du bist bereit!',
    subtitle: 'Starte jetzt mit dem Battle Pass',
    icon: '🏆',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.5)',
    content: (
      <div className="space-y-5 text-center">
        <motion.div
          animate={{ scale: [1, 1.08, 1], rotate: [0, -5, 5, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="text-8xl mx-auto"
        >
          💎
        </motion.div>
        <p className="text-white/70 leading-relaxed text-lg">
          Steige im Battle Pass auf, sammle Shards und crafte die 
          <span className="text-amber-400 font-bold"> exklusivsten Items</span> der Season — 
          Dinge, die sich kein anderer einfach kaufen kann.
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3">
            <div className="text-2xl mb-1">🟣</div>
            <div className="text-white/80 font-bold">Void Shards</div>
            <div className="text-white/40 text-xs">für Blueprints</div>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
            <div className="text-2xl mb-1">🔴</div>
            <div className="text-white/80 font-bold">Omega Fragment</div>
            <div className="text-white/40 text-xs">einmalig Level 99</div>
          </div>
        </div>
      </div>
    ),
  },
];

export default function ShardsTutorial({ onClose }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const markSeen = () => {
    localStorage.setItem('shards_tutorial_seen', 'true');
    onClose?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}
    >
      {/* Ambient glow */}
      <div
        className="absolute w-96 h-96 rounded-full blur-[120px] pointer-events-none transition-all duration-700"
        style={{ background: current.glow, top: '20%', left: '50%', transform: 'translateX(-50%)' }}
      />

      <motion.div
        key={step}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
        className="relative w-full max-w-lg bg-[#0a0a12] rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
      >
        {/* Top accent bar */}
        <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, transparent, ${current.color}, transparent)` }} />

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start gap-4">
          <motion.div
            animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="text-5xl flex-shrink-0 select-none"
          >
            {current.icon}
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: current.color }}>
              Shards Tutorial · {step + 1} / {STEPS.length}
            </div>
            <h2 className="text-2xl font-black text-white leading-tight">{current.title}</h2>
            <p className="text-white/40 text-sm mt-0.5">{current.subtitle}</p>
          </div>
          <button
            onClick={markSeen}
            className="p-2 rounded-xl hover:bg-white/10 text-white/30 hover:text-white transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator dots */}
        <div className="flex gap-1.5 px-6 pb-4">
          {STEPS.map((_, i) => (
            <button key={i} onClick={() => setStep(i)} className="flex-1 h-1 rounded-full transition-all duration-300" style={{
              background: i === step ? current.color : i < step ? `${current.color}50` : 'rgba(255,255,255,0.1)',
            }} />
          ))}
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {current.content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="px-6 pb-6 flex gap-3">
          {step > 0 && (
            <Button variant="ghost" onClick={() => setStep(s => s - 1)} className="text-white/50 hover:text-white gap-1.5">
              <ChevronLeft className="w-4 h-4" /> Zurück
            </Button>
          )}
          <div className="flex-1" />
          {isLast ? (
            <Button
              onClick={markSeen}
              className="gap-2 font-black px-8"
              style={{ background: `linear-gradient(135deg, ${current.color}, #f97316)` }}
            >
              <Trophy className="w-4 h-4" /> Los geht's!
            </Button>
          ) : (
            <Button onClick={() => setStep(s => s + 1)} className="gap-2 font-bold px-6" style={{ background: `linear-gradient(135deg, ${current.color}cc, ${current.color}88)` }}>
              Weiter <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}