import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Star, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  isVoidInfected, hasVoidCatcher, checkVoidCatchCondition,
  SHARD_EVOLUTIONS, checkShardEvolution, performShardEvolution,
  getShardInventory, getIrradiatedZone, hasProtectionSuit,
  IRRADIATED_ZONES, S2_ITEMS, getS2Inventory, saveS2Inventory,
  APOCALYPSE_FORMS, isS2Active,
  isLastStandEligible, getMyLastStandElo, getMyLastStandWins,
  saveMyLastStandElo, saveMyLastStandWins, calcElo, getLastStandRank,
} from './S2VoidSystem';

// ─── Void-Pokémon Aura Overlay ────────────────────────────────────────────────
export function VoidAura({ size = 80 }) {
  return (
    <>
      {[0, 1, 2].map(i => (
        <motion.div key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: -8 - i * 6,
            background: `radial-gradient(circle, rgba(168,85,247,${0.18 - i * 0.04}) 0%, transparent 70%)`,
            border: `1px solid rgba(168,85,247,${0.35 - i * 0.1})`,
          }}
          animate={{ scale: [1, 1.08 + i * 0.04, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.8 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      {/* Particle sparks */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div key={`spark-${i}`}
          className="absolute w-1 h-1 rounded-full bg-purple-400 pointer-events-none"
          style={{ left: `${15 + (i % 3) * 35}%`, top: `${10 + Math.floor(i / 3) * 40}%` }}
          animate={{ y: [-4, -12, -4], opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 1.5, delay: i * 0.25, repeat: Infinity }}
        />
      ))}
    </>
  );
}

// ─── Void-Fang Panel ──────────────────────────────────────────────────────────
export function VoidCatchPanel({ enemyHP, enemyMaxHP, onCatch, onClose }) {
  const hasCatcher = hasVoidCatcher();
  const conditionMet = checkVoidCatchCondition(enemyHP, enemyMaxHP);
  const hpPct = Math.floor((enemyHP / enemyMaxHP) * 100);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
      className="bg-black/80 border border-purple-500/40 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-purple-300 text-xs font-black flex items-center gap-1.5">
          🌀 Void-Catcher
        </p>
        <button onClick={onClose} className="text-white/30 text-[10px] hover:text-white/60">✕</button>
      </div>

      {!hasCatcher ? (
        <div className="text-center py-3">
          <p className="text-white/40 text-xs mb-1">Kein Void-Catcher im Inventar!</p>
          <p className="text-white/25 text-[10px]">Kaufe oder crafte einen im S2-Shop.</p>
        </div>
      ) : !conditionMet ? (
        <div className="text-center py-2">
          <p className="text-yellow-400 text-xs font-bold mb-1">⚠️ Bedingung nicht erfüllt!</p>
          <p className="text-white/50 text-[10px]">Bringe das Pokémon auf unter 20% HP ({hpPct}% aktuell).</p>
          <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-red-500 transition-all" style={{ width: `${Math.min(100, (1 - hpPct / 100) * 100 / 80 * 100)}%` }} />
          </div>
          <p className="text-[9px] text-white/30 mt-1">Fortschritt: {Math.floor((1 - hpPct / 100) / 0.8 * 100)}%</p>
        </div>
      ) : (
        <div className="text-center">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="text-3xl mb-2">🌀</motion.div>
          <p className="text-green-400 text-xs font-black mb-3">✅ Bedingung erfüllt! Fang jetzt!</p>
          <button onClick={onCatch}
            className="w-full py-2.5 rounded-xl font-black text-sm text-white"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
            Void-Catcher werfen!
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ─── Shard-Evolutions Panel ───────────────────────────────────────────────────
export function ShardEvolutionPanel({ party, onEvolve, onClose }) {
  const shards = getShardInventory();
  const eligible = party.filter(Boolean).filter(p => checkShardEvolution(p.id));

  if (!isS2Active()) return (
    <div className="bg-black/80 border border-white/10 rounded-2xl p-4 text-center">
      <p className="text-white/40 text-sm">Season 2 ist nicht aktiv.</p>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
      className="bg-gradient-to-br from-purple-950/90 to-black/90 border border-purple-500/40 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-purple-300 font-black text-sm flex items-center gap-1.5">
          <Star className="w-4 h-4" /> Shard-Evolutionen
        </h3>
        <button onClick={onClose} className="text-white/30 text-xs hover:text-white/60">✕</button>
      </div>

      {/* Shard Inventar */}
      <div className="flex gap-2 mb-3">
        {[{ key: 'void', icon: '🟣', label: 'Void-Shards' }, { key: 'nova', icon: '🟡', label: 'Nova-Shards' }].map(s => (
          <div key={s.key} className="flex-1 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-center">
            <span className="text-base">{s.icon}</span>
            <div>
              <p className="text-white font-black text-sm">{shards[s.key] || 0}</p>
              <p className="text-white/30 text-[9px]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {eligible.length === 0 ? (
        <p className="text-white/30 text-xs text-center py-3">
          Kein Pokémon in der Party kann sich via Shard entwickeln.<br/>
          <span className="text-[9px]">Benötigt: Gastly, Dratini, Pikachu oder Zorua</span>
        </p>
      ) : (
        <div className="space-y-2">
          {eligible.map(poke => {
            const evo = checkShardEvolution(poke.id);
            const canEvolve = (shards[evo.shardType] || 0) >= evo.shardCost;
            const form = APOCALYPSE_FORMS[evo.toId];
            return (
              <div key={poke.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.id}.png`}
                  alt={poke.name} style={{ imageRendering: 'pixelated', width: 40, height: 40 }} />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-black text-xs">{poke.name}</p>
                  <p className="text-purple-300 text-[10px]">→ {evo.toName}</p>
                  <p className="text-white/40 text-[9px]">
                    Kosten: {evo.shardCost}× {evo.shardType === 'void' ? '🟣' : '🟡'}
                    {evo.shardType === 'void' ? ' Void-Shard' : ' Nova-Shard'}
                  </p>
                </div>
                <button
                  onClick={() => canEvolve && onEvolve(poke, evo)}
                  disabled={!canEvolve}
                  className="px-3 py-1.5 rounded-xl text-[10px] font-black disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white"
                  style={{ background: canEvolve ? 'linear-gradient(135deg,#7c3aed,#a855f7)' : '#333' }}>
                  {canEvolve ? '✨ Entwickeln' : 'Zu wenig'}
                </button>
              </div>
            );
          })}
        </div>
      )}
      <p className="text-[9px] text-white/20 text-center mt-3">⏳ Nur bis Ende Season 2 verfügbar</p>
    </motion.div>
  );
}

// ─── Verstrahlte Zonen Warnung ────────────────────────────────────────────────
export function IrradiatedZoneWarning({ nodeId, onContinue, onCancel }) {
  const zone = getIrradiatedZone(nodeId);
  const protected_ = hasProtectionSuit();
  if (!zone) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
        className="bg-gradient-to-br from-slate-900 to-black border-2 rounded-3xl p-6 max-w-sm w-full shadow-2xl"
        style={{ borderColor: zone.color }}>
        <div className="text-center mb-4">
          <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-5xl mb-3">{zone.emoji}</motion.div>
          <h3 className="text-xl font-black text-white">{zone.name}</h3>
          <p className="text-white/50 text-xs mt-1">Season 2 — Neon Apocalypse</p>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs">
            <span>🌀</span>
            <span className="text-white/70">Erhöhte Void-Pokémon Spawn-Rate: <span className="text-purple-300 font-bold">{Math.floor(zone.voidSpawnRate * 100)}%</span></span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs">
            <span>{zone.shardType === 'void' ? '🟣' : '🟡'}</span>
            <span className="text-white/70">Shard-Drop Chance: <span className="text-yellow-300 font-bold">{Math.floor(zone.shardDropRate * 100)}%</span></span>
          </div>
          <div className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs ${protected_ ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            <AlertTriangle className={`w-3.5 h-3.5 ${protected_ ? 'text-green-400' : 'text-red-400'}`} />
            <span className={protected_ ? 'text-green-300' : 'text-red-300'}>
              {protected_ ? '✅ Schutzausrüstung aktiv — kein Debuff' :
                zone.debuff.type === 'hp_drain'
                  ? `⚠️ Team verliert ${Math.floor(zone.debuff.value * 100)}% HP pro Kampf`
                  : `⚠️ -${Math.floor(zone.debuff.value * 100)}% Initiative aller Pokémon`}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={onCancel} variant="outline" className="flex-1 border-white/20 text-white rounded-xl text-sm h-10">Zurück</Button>
          <Button onClick={onContinue} className="flex-1 font-black rounded-xl text-sm h-10 text-white"
            style={{ background: `linear-gradient(135deg, ${zone.color}88, ${zone.color})` }}>
            Eintreten {zone.emoji}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── S2 Items Shop ────────────────────────────────────────────────────────────
export function S2ItemShop({ coins, onBuy, onClose }) {
  const inv = getS2Inventory();
  const shards = getShardInventory();

  function handleBuy(item) {
    const craftCost = item.craftCost;
    const canCraft = Object.entries(craftCost).every(([type, amt]) => (shards[type] || 0) >= amt);
    if (canCraft) {
      // Craft via shards
      const newShards = { ...shards };
      Object.entries(craftCost).forEach(([type, amt]) => { newShards[type] -= amt; });
      localStorage.setItem('pkS2Shards', JSON.stringify(newShards));
      const newInv = { ...inv, [item.id]: (inv[item.id] || 0) + 1 };
      saveS2Inventory(newInv);
      onBuy(item, 'craft');
    } else if (coins >= item.buyCoins) {
      const newInv = { ...inv, [item.id]: (inv[item.id] || 0) + 1 };
      saveS2Inventory(newInv);
      onBuy(item, 'buy');
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="bg-gradient-to-br from-purple-950/95 to-black/95 border border-purple-500/30 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-purple-300 font-black text-sm flex items-center gap-1.5">☢️ S2 Shop</h3>
        <button onClick={onClose} className="text-white/30 text-xs hover:text-white/60">✕</button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {S2_ITEMS.map(item => {
          const owned = inv[item.id] || 0;
          const craftPossible = Object.entries(item.craftCost).every(([t, a]) => (shards[t] || 0) >= a);
          const buyPossible = coins >= item.buyCoins;
          return (
            <div key={item.id} className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="text-white font-black text-xs">{item.name}</p>
                  <p className="text-white/30 text-[9px]">×{owned} vorhanden</p>
                </div>
              </div>
              <p className="text-white/50 text-[9px]">{item.desc}</p>
              <div className="flex gap-1 mt-1">
                {Object.entries(item.craftCost).map(([type, amt]) => (
                  <span key={type} className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${(shards[type] || 0) >= amt ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                    {type === 'void' ? '🟣' : '🟡'}×{amt}
                  </span>
                ))}
              </div>
              <button
                onClick={() => (craftPossible || buyPossible) && handleBuy(item)}
                disabled={!craftPossible && !buyPossible}
                className="w-full py-1.5 rounded-lg text-[10px] font-black disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all"
                style={{ background: craftPossible ? 'linear-gradient(135deg,#7c3aed,#a855f7)' : buyPossible ? 'linear-gradient(135deg,#b45309,#d97706)' : '#333' }}>
                {craftPossible ? 'Craften' : buyPossible ? `Kaufen (${item.buyCoins}💰)` : 'Nicht verfügbar'}
              </button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Last Stand PvP Arena ─────────────────────────────────────────────────────
export function LastStandArena({ party, onStartFight, onClose }) {
  const [result, setResult] = useState(null); // 'win'|'lose'
  const myElo = getMyLastStandElo();
  const myWins = getMyLastStandWins();
  const rank = getLastStandRank(myElo);
  const eligible = isLastStandEligible(party);

  // Simulierter Gegner (da kein echtes P2P vorhanden)
  const fakeOpponentElo = 900 + Math.floor(Math.random() * 400);
  const fakeOpponentRank = getLastStandRank(fakeOpponentElo);

  function simulateFight() {
    if (!eligible) return;
    const winChance = 1 / (1 + Math.pow(10, (fakeOpponentElo - myElo) / 400));
    const won = Math.random() < winChance;
    const newElos = calcElo(myElo, fakeOpponentElo);
    if (won) {
      saveMyLastStandElo(newElos.winner);
      saveMyLastStandWins(myWins + 1);
      setResult('win');
    } else {
      saveMyLastStandElo(newElos.loser);
      setResult('lose');
    }
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
      className="bg-gradient-to-br from-red-950/95 to-black/95 border border-red-500/30 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-red-300 font-black text-base flex items-center gap-1.5">⚔️ Last Stand Arena</h3>
        <button onClick={onClose} className="text-white/30 text-xs hover:text-white/60">✕</button>
      </div>

      {result ? (
        <div className="text-center py-4">
          <div className="text-5xl mb-3">{result === 'win' ? '🏆' : '💀'}</div>
          <p className={`text-xl font-black mb-2 ${result === 'win' ? 'text-yellow-400' : 'text-red-400'}`}>
            {result === 'win' ? 'Sieg!' : 'Niederlage!'}
          </p>
          <p className="text-white/60 text-sm mb-1">Elo: {getMyLastStandElo()} · Rang: {getLastStandRank(getMyLastStandElo()).title}</p>
          <Button onClick={() => setResult(null)} className="mt-4 bg-red-700 hover:bg-red-600 text-white font-black rounded-xl">
            Nochmal
          </Button>
        </div>
      ) : (
        <>
          {/* Mein Rang */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ background: `${rank.color}22`, border: `2px solid ${rank.color}` }}>⚔️</div>
            <div>
              <p className="text-white font-black text-sm">{rank.title}</p>
              <p className="text-white/50 text-xs">Elo: {myElo} · Siege: {myWins}</p>
            </div>
          </div>

          {!eligible ? (
            <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 mb-3">
              <p className="text-yellow-300 text-xs font-bold">⚠️ Nicht berechtigt!</p>
              <p className="text-white/50 text-[10px] mt-1">Dein Team benötigt mind. ein Void-infiziertes oder Shard-evolviertes Pokémon.</p>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 mb-3">
              <p className="text-green-300 text-xs font-bold">✅ Team qualifiziert!</p>
              <p className="text-white/50 text-[10px] mt-1">Mind. 1 Void/Apex-Pokémon gefunden.</p>
            </div>
          )}

          {/* Simulierter Gegner */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 mb-4">
            <div className="text-xl">🎭</div>
            <div>
              <p className="text-white/70 text-xs font-bold">Nächster Gegner</p>
              <p className="text-white/50 text-[10px]">{fakeOpponentRank.title} · Elo {fakeOpponentElo}</p>
            </div>
          </div>

          <Button onClick={simulateFight} disabled={!eligible}
            className="w-full font-black rounded-xl h-11 text-white disabled:opacity-40"
            style={{ background: eligible ? 'linear-gradient(135deg,#dc2626,#ef4444)' : '#333' }}>
            ⚔️ Kampf starten
          </Button>
        </>
      )}
    </motion.div>
  );
}

// ─── S2 Hub Widget (Kompaktes Overlay für PokemonGame Menü) ──────────────────
export function S2SeasonHub({ party, coins, onShardEvo, onLastStand, onShop }) {
  const [tab, setTab] = useState('overview'); // overview|shards|pvp|shop
  const shards = getShardInventory();
  const myElo = getMyLastStandElo();
  const rank = getLastStandRank(myElo);
  const eligible = isLastStandEligible(party || []);

  if (!isS2Active()) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-950/80 to-black/80 border border-purple-500/30 rounded-2xl p-4 backdrop-blur-xl">
      {/* S2 Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-lg">☄️</motion.span>
          <div>
            <p className="text-purple-300 font-black text-xs">SEASON 2</p>
            <p className="text-white/40 text-[9px]">Neon Apocalypse</p>
          </div>
        </div>
        <div className="flex gap-1.5 text-xs">
          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">🟣×{shards.void || 0}</span>
          <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 font-bold border border-yellow-500/30">🟡×{shards.nova || 0}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1 mb-3">
        {[
          { id: 'shards', label: '🧬 Evolutionen', action: onShardEvo },
          { id: 'pvp', label: '⚔️ Last Stand', action: onLastStand },
          { id: 'shop', label: '🛒 S2 Shop', action: onShop },
        ].map(btn => (
          <button key={btn.id} onClick={btn.action}
            className="py-2 rounded-xl text-[10px] font-black text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/40 transition-all">
            {btn.label}
          </button>
        ))}
      </div>

      {/* PvP Rang */}
      <div className="flex items-center gap-2 p-2 rounded-xl bg-white/3 border border-white/8">
        <span className="text-base">⚔️</span>
        <div className="flex-1">
          <p className="text-[10px] font-bold" style={{ color: rank.color }}>{rank.title}</p>
          <p className="text-white/30 text-[9px]">Elo: {myElo}</p>
        </div>
        {eligible && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 font-bold">Qualifiziert</span>}
      </div>
    </motion.div>
  );
}