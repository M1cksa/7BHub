import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, ChevronLeft, Check, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SHIP_PARTS, SHIP_SLOTS, SLOT_LABELS, getPartById, loadEquippedParts, saveEquippedParts, loadOwnedParts, saveOwnedParts } from './ShipPartsSystem';

function PartPreviewVisual({ part }) {
  if (!part) return null;
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      {/* Glow */}
      <div className="absolute inset-0 rounded-full blur-xl opacity-60"
        style={{ backgroundColor: part.glowColor }} />
      <div className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center border text-3xl"
        style={{ backgroundColor: part.color + '22', borderColor: part.color + '66', boxShadow: `0 0 20px ${part.glowColor}50` }}>
        {part.emoji}
      </div>
    </div>
  );
}

export default function ShipPartsMenu({ user, onBack }) {
  const [equipped, setEquipped] = useState(loadEquippedParts);
  const [owned, setOwned] = useState(loadOwnedParts);
  const [tokens, setTokens] = useState(user?.tokens || 0);
  const [activeSlot, setActiveSlot] = useState('cockpit');
  const [justBought, setJustBought] = useState(null);

  const slotParts = SHIP_PARTS.filter(p => p.slot === activeSlot);

  function equip(partId) {
    const next = { ...equipped, [activeSlot]: partId };
    setEquipped(next);
    saveEquippedParts(next);
  }

  async function buy(part) {
    if (tokens < part.cost) return;
    const newTokens = tokens - part.cost;
    setTokens(newTokens);
    const newOwned = [...owned, part.id];
    setOwned(newOwned);
    saveOwnedParts(newOwned);
    equip(part.id);
    setJustBought(part.id);
    setTimeout(() => setJustBought(null), 1500);
    // Update user tokens in DB
    try {
      const { base44 } = await import('@/api/base44Client');
      if (user) await base44.entities.AppUser.update(user.id, { tokens: newTokens });
    } catch {}
  }

  const equippedInSlot = equipped[activeSlot];

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
      className="pointer-events-auto bg-black/85 backdrop-blur-xl rounded-3xl border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.12)] w-[92%] max-w-md max-h-[90vh] flex flex-col overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 flex-shrink-0">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">🛸 Schiffsteile</h2>
          <p className="text-[10px] text-white/30">Ausrüstung mit Spieleffekt & kosmetischem Look</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
            <Coins className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-yellow-400 font-black text-sm">{tokens.toLocaleString()}</span>
          </div>
          <button onClick={onBack} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Slot Tabs */}
      <div className="flex gap-1.5 px-4 py-3 border-b border-white/6 flex-shrink-0 overflow-x-auto hide-scrollbar">
        {SHIP_SLOTS.map(slot => {
          const eqPart = getPartById(equipped[slot]);
          return (
            <button key={slot} onClick={() => setActiveSlot(slot)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all ${activeSlot === slot ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>
              <span>{eqPart?.emoji || '?'}</span>
              <span>{SLOT_LABELS[slot].split(' ').slice(1).join(' ')}</span>
            </button>
          );
        })}
      </div>

      {/* Currently equipped preview */}
      {equippedInSlot && (() => {
        const part = getPartById(equippedInSlot);
        if (!part) return null;
        return (
          <div className="mx-4 mt-3 flex items-center gap-3 p-3 rounded-2xl border flex-shrink-0"
            style={{ background: part.color + '10', borderColor: part.color + '40' }}>
            <PartPreviewVisual part={part} />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider mb-0.5">Ausgerüstet</p>
              <p className="text-white font-black text-sm">{part.emoji} {part.name}</p>
              <p className="text-white/40 text-[10px] truncate">{part.desc}</p>
              {Object.keys(part.bonuses).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.entries(part.bonuses).map(([k, v]) => (
                    <span key={k} className="text-[9px] px-1.5 py-0.5 rounded-full font-bold text-green-300 bg-green-500/15 border border-green-500/25">
                      +{typeof v === 'number' ? Math.round(v * 100) + '%' : '✓'} {k}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Parts List */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-3 space-y-2">
        {slotParts.map(part => {
          const isOwned = owned.includes(part.id);
          const isEquipped = equipped[activeSlot] === part.id;
          const canAfford = tokens >= part.cost;
          return (
            <motion.div key={part.id}
              animate={justBought === part.id ? { scale: [1, 1.04, 1] } : {}}
              className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${isEquipped ? 'border-cyan-400/50 bg-cyan-500/8' : isOwned ? 'border-white/12 bg-white/4 hover:bg-white/8 cursor-pointer' : 'border-white/6 bg-white/2 opacity-70'}`}
              onClick={() => isOwned && !isEquipped ? equip(part.id) : undefined}>
              {/* Visual */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border"
                style={{ backgroundColor: part.color + '18', borderColor: part.color + '44', boxShadow: isEquipped ? `0 0 12px ${part.glowColor}50` : 'none' }}>
                {part.emoji}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-white font-black text-xs">{part.name}</span>
                  {isEquipped && <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded-full font-bold border border-cyan-500/30">Aktiv</span>}
                </div>
                <p className="text-white/40 text-[10px] truncate">{part.desc}</p>
                {Object.keys(part.bonuses).length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-0.5">
                    {Object.entries(part.bonuses).slice(0, 2).map(([k, v]) => (
                      <span key={k} className="text-[8px] px-1 py-0.5 rounded font-bold text-green-400/70 bg-green-500/10">
                        {typeof v === 'number' ? `+${Math.round(v * 100)}%` : '+'}{k}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="flex-shrink-0">
                {isEquipped ? (
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-cyan-300" />
                  </div>
                ) : isOwned ? (
                  <button onClick={(e) => { e.stopPropagation(); equip(part.id); }}
                    className="px-3 py-1.5 rounded-xl bg-white/8 hover:bg-white/15 text-white/60 hover:text-white text-[10px] font-black transition-all border border-white/10">
                    Anlegen
                  </button>
                ) : (
                  <button onClick={() => buy(part)} disabled={!canAfford}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all border ${canAfford ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/30' : 'bg-white/5 border-white/8 text-white/20 cursor-not-allowed'}`}>
                    {!canAfford && <Lock className="w-3 h-3" />}
                    <Coins className="w-3 h-3" />
                    {part.cost.toLocaleString()}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}