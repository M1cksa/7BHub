import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Package, Users, HelpCircle, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ContestBanner from '@/components/contests/ContestBanner';
import PokemonShopSection from '@/components/pokemon/PokemonShopSection';
import { NEBEL_REGION, PVP_CONFIG, TRADE_SYSTEM } from '@/components/pokemon/PokemonLiveOpsConfig';

const FEATURED_CONTENT = [
  {
    title: `${NEBEL_REGION.name} Expedition`,
    badge: 'Neu',
    icon: '🌫️',
    description: `${NEBEL_REGION.biomes.length} Biome mit seltenen Spawns, Wettereffekten und Riss-Energie warten auf dein Team.`,
    meta: `${NEBEL_REGION.subtitle}`,
    accent: 'from-emerald-500/20 to-cyan-500/10',
    border: 'border-emerald-400/20',
  },
  {
    title: 'Ranglisten-PvP',
    badge: 'Competitive',
    icon: '⚔️',
    description: `Steige durch ${PVP_CONFIG.matchmakingSystem.divisions.length} Divisionen auf und sichere dir saisonale Belohnungen.`,
    meta: `Start-ELO ${PVP_CONFIG.matchmakingSystem.startRating} · Level 50 Normalisierung`,
    accent: 'from-rose-500/20 to-orange-500/10',
    border: 'border-rose-400/20',
  },
  {
    title: 'Sicheres Tauschsystem',
    badge: 'Social',
    icon: '🤝',
    description: `${TRADE_SYSTEM.tradeTypes.length} Handelstypen mit Fair-Value-Pruefung, Cooldowns und Schutz fuer neue Accounts.`,
    meta: `Min. Level ${TRADE_SYSTEM.rules.minTradeLevel} · ${TRADE_SYSTEM.rules.tradeWindowHours}h Angebotsdauer`,
    accent: 'from-violet-500/20 to-fuchsia-500/10',
    border: 'border-violet-400/20',
  },
];

function LeaderboardPanel({ onClose }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.GameScore.filter({ game_type: 'pokemon' }, '-score', 50)
      .then(all => {
        // Deduplicate: best score per player
        const map = new Map();
        all.forEach(s => {
          if (!map.has(s.player_id) || map.get(s.player_id).score < s.score) map.set(s.player_id, s);
        });
        setScores([...map.values()].sort((a, b) => b.score - a.score).slice(0, 10));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
      className="bg-black/80 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-4 w-full shadow-2xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-black text-yellow-400 flex items-center gap-1.5"><Trophy className="w-4 h-4" /> Top Trainer</h3>
        <button onClick={onClose} className="text-white/30 hover:text-white text-xs">✕</button>
      </div>

      {loading ? (
        <div className="text-center py-4 text-white/30 text-sm">Lädt...</div>
      ) : scores.length === 0 ? (
        <p className="text-white/30 text-center py-3 text-sm">Noch keine Einträge!</p>
      ) : (
        <div className="space-y-1.5">
          {scores.map((e, i) => (
            <div key={e.id} className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${i === 0 ? 'bg-yellow-500/10 border-yellow-500/30' : i === 1 ? 'bg-white/6 border-white/10' : i === 2 ? 'bg-amber-700/10 border-amber-700/25' : 'bg-white/4 border-white/6'}`}>
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 flex items-center justify-center rounded-lg font-black text-sm"
                  style={{ background: i === 0 ? '#f59e0b30' : i === 1 ? '#9ca3af20' : i === 2 ? '#d9770620' : '#ffffff08', color: i < 3 ? ['#f59e0b','#9ca3af','#d97706'][i] : '#ffffff50' }}>
                  {i < 3 ? medals[i] : i + 1}
                </span>
                <div>
                  <span className="text-white font-semibold text-sm">{e.player_username || 'Unbekannt'}</span>
                  {e.level > 0 && <span className="text-white/30 text-[10px] ml-1.5">🔥 {e.level} Streak</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-yellow-400 font-black text-sm">{e.score}</div>
                <div className="text-white/25 text-[9px]">Siege</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function PokemonMainMenu({
  storyProgress, wins, streak, coins, party, badges,
  exploredNodes, inventory, ballInventory, onBuyGameItem,
  onStartStory, onStartArena, onOpenShop, onShowParty, onShowTutorial,
  STORY_ZONES,
}) {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [shopUser, setShopUser] = useState(() => { try { const u = localStorage.getItem('app_user'); return u ? JSON.parse(u) : null; } catch { return null; } });
  // For contest progress: wins is most universal metric for pokemon
  const contestProgress = wins;

  const badgeCount = storyProgress.badges?.length || 0;
  const gymCount = STORY_ZONES.filter(z => z.type === 'gym').length;

  return (
    <motion.div key="main-menu" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="space-y-4">

      {/* ── HEADER ── */}
      <div className="relative rounded-3xl overflow-hidden border border-white/8 px-5 py-5"
        style={{ background: 'linear-gradient(135deg, #0f0a1e 0%, #1a0a2e 50%, #0a0a20 100%)' }}>
        <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-500/10 rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-red-500/10 rounded-full blur-[60px] pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400">Pokémon</h1>
            <p className="text-white/35 text-xs mt-0.5">Kämpfe · Erkunde · Fange</p>
          </div>
          <div className="text-5xl select-none">⚡</div>
        </div>
        <div className="relative z-10 grid grid-cols-4 gap-2">
          {[
            { icon: '💰', label: 'Münzen', value: coins.toLocaleString(), color: 'text-yellow-400' },
            { icon: '🏆', label: 'Siege',  value: wins,                   color: 'text-cyan-400'   },
            { icon: '🔥', label: 'Streak', value: streak,                 color: 'text-orange-400' },
            { icon: '🎒', label: 'Party',  value: `${party.filter(Boolean).length}/6`, color: 'text-green-400' },
          ].map(s => (
            <div key={s.label} className="text-center bg-white/5 rounded-xl py-2.5 border border-white/6">
              <div className="text-base mb-0.5">{s.icon}</div>
              <div className={`font-black text-sm ${s.color}`}>{s.value}</div>
              <div className="text-[9px] text-white/25">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MODI ── */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/20 mb-2.5">Spielmodi</p>
        <div className="grid grid-cols-2 gap-3">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={onStartStory}
            className="relative overflow-hidden flex flex-col gap-2.5 p-4 rounded-2xl text-left border border-blue-500/30 bg-gradient-to-br from-blue-900/40 to-cyan-900/30">
            <div className="text-2xl">🗺️</div>
            <div>
              <p className="text-white font-black text-sm">Story Modus</p>
              <p className="text-blue-200/50 text-[10px] mt-0.5">Routen · Arenen · Dungeons</p>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <span className="text-[9px] bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded-full font-bold border border-blue-500/20">{badgeCount}/{gymCount} Orden</span>
              <span className="text-[9px] bg-purple-900/60 text-purple-300 px-2 py-0.5 rounded-full font-bold border border-purple-500/20">🔍 {exploredNodes.length}</span>
            </div>
          </motion.button>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={onStartArena}
            className="relative overflow-hidden flex flex-col gap-2.5 p-4 rounded-2xl text-left border border-red-500/30 bg-gradient-to-br from-red-900/40 to-orange-900/30">
            <div className="text-2xl">⚔️</div>
            <div>
              <p className="text-white font-black text-sm">Arena Modus</p>
              <p className="text-red-200/50 text-[10px] mt-0.5">Endlos · Rangliste · Streak</p>
            </div>
            <span className="text-[9px] bg-red-900/60 text-red-300 px-2 py-0.5 rounded-full font-bold border border-red-500/20 w-fit">Streak: {streak} 🔥</span>
          </motion.button>
        </div>
      </div>

      {/* ── CONTEST ── */}
      <ContestBanner game="pokemon" userProgress={contestProgress} />

      {/* ── FEATURED CONTENT ── */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/20">Neue Inhalte</p>
          <span className="text-[10px] text-white/25">Website Update</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {FEATURED_CONTENT.map((feature) => (
            <div
              key={feature.title}
              className={`rounded-2xl border p-4 bg-gradient-to-br ${feature.accent} ${feature.border} backdrop-blur-sm`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{feature.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full bg-white/10 text-white/60">
                  {feature.badge}
                </span>
              </div>
              <h3 className="text-sm font-black text-white mb-1">{feature.title}</h3>
              <p className="text-[11px] text-white/55 leading-relaxed mb-3">{feature.description}</p>
              <p className="text-[10px] text-white/35">{feature.meta}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── AKTIONEN ── */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/20 mb-2.5">Aktionen</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: <Package className="w-5 h-5 text-yellow-400" />, label: 'Shop',      action: () => setShowShop(true),              active: false },
            { icon: <Users className="w-5 h-5 text-green-400" />,   label: `Party (${party.filter(Boolean).length})`, action: onShowParty, active: false },
            { icon: <Trophy className="w-5 h-5 text-yellow-400" />, label: 'Rangliste', action: () => setShowLeaderboard(s => !s),    active: showLeaderboard },
            { icon: <HelpCircle className="w-5 h-5 text-cyan-400" />, label: 'Hilfe',   action: onShowTutorial,                       active: false },
          ].map(item => (
            <button key={item.label} onClick={item.action}
            className={`flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all border ${
              item.active ? 'bg-yellow-500/12 border-yellow-500/25' : 'bg-white/4 border-white/8 hover:bg-white/8'
            }`}>
              {item.icon}
              <span className="text-[10px] font-bold text-white/45 leading-tight text-center">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── ORDEN ── */}
      {badgeCount > 0 && (
        <div className="bg-yellow-500/5 border border-yellow-500/15 rounded-2xl px-4 py-3">
          <p className="text-yellow-400/50 text-[10px] font-black uppercase tracking-wider mb-2">Deine Orden ({badgeCount})</p>
          <div className="flex flex-wrap gap-1.5">
            {storyProgress.badges.map(b => (
              <span key={b} className="text-xs px-2.5 py-1 bg-yellow-500/12 text-yellow-300 rounded-full font-bold border border-yellow-500/25">{b}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── LEADERBOARD ── */}
      {showLeaderboard && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <LeaderboardPanel onClose={() => setShowLeaderboard(false)} />
        </motion.div>
      )}

      {/* ── SHOP MODAL ── */}
      <AnimatePresence>
        {showShop && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 py-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-yellow-400 flex items-center gap-2"><Package className="w-5 h-5" /> Pokémon Shop</h2>
                <button onClick={() => setShowShop(false)} className="text-white/40 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <PokemonShopSection user={shopUser} setUser={setShopUser} gameCoins={coins} inventory={inventory} ballInventory={ballInventory} onBuyGameItem={onBuyGameItem} />
            </div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
