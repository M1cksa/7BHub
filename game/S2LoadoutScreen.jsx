import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SHIP_MODULES, MODULE_SLOTS, MAX_MODULE_SLOTS, computeModuleStats } from './S2GameSystems';

export default function S2LoadoutScreen({ equippedModules = [], onSave, onClose }) {
  const [equipped, setEquipped] = useState(equippedModules.slice(0, MAX_MODULE_SLOTS));

  const toggle = (modId) => {
    if (equipped.includes(modId)) {
      setEquipped(equipped.filter(id => id !== modId));
    } else {
      if (equipped.length >= MAX_MODULE_SLOTS) return; // max slots reached
      setEquipped([...equipped, modId]);
    }
  };

  const stats = computeModuleStats(equipped);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="pointer-events-auto bg-black/85 backdrop-blur-xl rounded-3xl border border-violet-500/30 shadow-[0_0_60px_rgba(139,92,246,0.2)] w-[92%] max-w-md max-h-[88vh] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 pt-6 pb-3 border-b border-white/8">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              🔩 Schiff-Loadout
              <span className="text-[10px] font-bold bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30">S2 NEU</span>
            </h2>
            <p className="text-white/35 text-xs mt-0.5">Bis zu {MAX_MODULE_SLOTS} Module ausrüsten · Synergie & Konflikte beachten</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/30 font-bold">{equipped.length}/{MAX_MODULE_SLOTS}</div>
            <div className="flex gap-1 mt-0.5">
              {Array.from({ length: MAX_MODULE_SLOTS }).map((_, i) => (
                <div key={i} className="w-4 h-4 rounded border"
                  style={{ background: i < equipped.length ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.05)', borderColor: i < equipped.length ? 'rgba(139,92,246,0.8)' : 'rgba(255,255,255,0.1)' }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Module list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 hide-scrollbar">
        {MODULE_SLOTS.map(slot => {
          const slotMods = SHIP_MODULES.filter(m => m.slot === slot);
          return (
            <div key={slot}>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/25 mb-1.5 pl-1">
                {slot === 'engine' ? '⚙️ Antrieb' : slot === 'hull' ? '🛡️ Hülle' : '✨ Spezial'}
              </p>
              {slotMods.map(mod => {
                const isEquipped = equipped.includes(mod.id);
                const isFull = !isEquipped && equipped.length >= MAX_MODULE_SLOTS;
                return (
                  <motion.button
                    key={mod.id}
                    onClick={() => !isFull && toggle(mod.id)}
                    whileTap={!isFull ? { scale: 0.97 } : {}}
                    className="w-full flex items-start gap-3 p-3 rounded-2xl text-left transition-all mb-1.5"
                    style={{
                      background: isEquipped ? 'rgba(139,92,246,0.18)' : isFull ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isEquipped ? 'rgba(139,92,246,0.55)' : 'rgba(255,255,255,0.07)'}`,
                      boxShadow: isEquipped ? '0 0 14px rgba(139,92,246,0.2)' : 'none',
                      opacity: isFull ? 0.45 : 1,
                      cursor: isFull ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <div className="text-2xl leading-none flex-shrink-0 mt-0.5">{mod.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">{mod.name}</span>
                        {isEquipped && <span className="text-[9px] bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded-full font-bold">✓ Ausgerüstet</span>}
                      </div>
                      <p className="text-xs text-white/45 mt-0.5">{mod.desc}</p>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {Object.entries(mod.stats).map(([k, v]) => (
                          <span key={k} className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                            ↑ {formatStatLabel(k, v)}
                          </span>
                        ))}
                        {Object.entries(mod.drawbacks).map(([k, v]) => (
                          <span key={k} className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                            ↓ {formatStatLabel(k, v)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Active stats summary */}
      <div className="px-4 py-3 border-t border-white/8">
        <p className="text-[9px] font-black uppercase tracking-widest text-white/25 mb-2">Aktive Modifikatoren</p>
        <div className="flex flex-wrap gap-1.5">
          {stats.agilityMult !== 1 && (
            <StatBadge label={`Agilität ${stats.agilityMult > 1 ? '+' : ''}${Math.round((stats.agilityMult - 1) * 100)}%`} positive={stats.agilityMult > 1} />
          )}
          {stats.shieldDurationMult !== 1 && (
            <StatBadge label={`Schild-Dauer ${stats.shieldDurationMult > 1 ? '+' : ''}${Math.round((stats.shieldDurationMult - 1) * 100)}%`} positive={stats.shieldDurationMult > 1} />
          )}
          {stats.speedMult !== 1 && (
            <StatBadge label={`Speed ${stats.speedMult > 1 ? '+' : ''}${Math.round((stats.speedMult - 1) * 100)}%`} positive={stats.speedMult > 1} />
          )}
          {stats.toxinImmunity && <StatBadge label="☣️ Toxin-Immun" positive={true} />}
          {stats.solarFlareResist > 0 && <StatBadge label={`☀️ Solar -${Math.round(stats.solarFlareResist * 100)}%`} positive={true} />}
          {stats.voidRiftAlwaysBoost && <StatBadge label="🔮 Void = Boost" positive={true} />}
          {stats.empCooldownMult !== 1 && <StatBadge label={`EMP CD ${Math.round((stats.empCooldownMult - 1) * 100)}%`} positive={stats.empCooldownMult < 1} />}
          {stats.noStartShield && <StatBadge label="Kein Start-Schild" positive={false} />}
          {equipped.length === 0 && <span className="text-xs text-white/20">Keine Module aktiv</span>}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-5 flex gap-2">
        <Button onClick={onClose} className="flex-1 bg-white/8 hover:bg-white/15 text-white py-5 rounded-2xl font-bold border-none">
          Abbrechen
        </Button>
        <Button
          onClick={() => onSave(equipped)}
          className="flex-1 py-5 rounded-2xl font-black border-none text-white"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)', boxShadow: '0 0 18px rgba(124,58,237,0.35)' }}
        >
          💾 Speichern
        </Button>
      </div>
    </motion.div>
  );
}

function StatBadge({ label, positive }) {
  return (
    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border"
      style={{
        background: positive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
        borderColor: positive ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)',
        color: positive ? '#4ade80' : '#f87171',
      }}>
      {label}
    </span>
  );
}

function formatStatLabel(key, value) {
  const labels = {
    agilityMult: `Agilität ${Math.round((value - 1) * 100)}%`,
    shieldDurationMult: `Schild ${Math.round((value - 1) * 100)}%`,
    speedMult: `Speed ${Math.round((value - 1) * 100)}%`,
    empCooldownMult: `EMP CD ${Math.round((value - 1) * 100)}%`,
    toxinImmunity: 'Toxin-Immunität',
    solarFlareResist: `Solar -${Math.round(value * 100)}%`,
    voidRiftAlwaysBoost: 'Void = Boost',
    noStartShield: 'Kein Start-Schild',
    shieldRegenMult: `Schild-Regen ${Math.round((value - 1) * 100)}%`,
  };
  return labels[key] || key;
}