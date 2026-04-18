import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw, ChevronLeft, ChevronRight, ShoppingCart, Coins, ArrowUpCircle, Zap, Star, Map, Trophy, Clock, Wifi, Shield, Bot, Gift, Settings2, Wrench } from 'lucide-react';
import ContestBanner from '@/components/contests/ContestBanner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { LEVELS, UPGRADES, SHIP_SKINS } from '@/components/game/NeonDashConstants';
import ShipSkinPreview from '@/components/game/ShipSkinPreview';
import NeonDashWeeklyRewards, { getCurrentWeekReward, getWeeklyPtsForWeek } from '@/components/game/NeonDashWeeklyRewards';
import ShipPartsMenu from '@/components/game/ShipPartsMenu';

export default function NeonDashMenu({
  gameState,
  setGameState,
  startGame,
  startLevel,
  startOnline,
  user,
  highScore = 0,
  proHighScore = 0,
  completedLevels,
  todayChallenge,
  dailyProgress,
  dailyCompleted,
  weekendBoostActive,
  dimensionEventActive,
  getUpgradeLevel,
  buyUpgrade,
  getOwnedSkins,
  getActiveSkin,
  buySkin,
  isLevelUnlocked,
  perfMode,
  togglePerfMode,
  isMobile,
  // ── Season 2 props ──
  startApocalypse,
  onOpenLoadout,
  s2EquippedModules = [],
}) {
  const [lbMode, setLbMode] = useState('daily');
  const [showWeeklyRewards, setShowWeeklyRewards] = useState(false);
  const [showShipParts, setShowShipParts] = useState(false);
  const [expandedUpgrade, setExpandedUpgrade] = useState(null);
  const currentWeek = getCurrentWeekReward();

  const hasAffordableUpgrade = UPGRADES.some((upg) => {
    const lvl = getUpgradeLevel(upg.id);
    if (lvl >= upg.maxLevel) return false;
    const cost = Math.floor(upg.baseCost * Math.pow(upg.costMult, lvl));
    return (user?.tokens || 0) >= cost;
  });

  const hasAffordableSkin = SHIP_SKINS.some((skin) => {
    if (skin.cost === 0) return false;
    return !getOwnedSkins().includes(skin.id) && (user?.tokens || 0) >= skin.cost;
  });

  const getUpgradeCost = (upg) => Math.floor(upg.baseCost * Math.pow(upg.costMult, getUpgradeLevel(upg.id)));

  if (gameState === 'menu') {
    return (
      <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="pointer-events-auto absolute inset-0 flex flex-col overflow-y-auto hide-scrollbar"
      style={{ background: 'linear-gradient(160deg, #020818 0%, #050514 40%, #090514 100%)' }}>
        
        <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: 'linear-gradient(rgba(6,182,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(6,182,212,0.1) 0%, transparent 70%)' }} />

        <div className="relative z-10 flex flex-col flex-1 px-5 py-7 max-w-lg mx-auto w-full gap-5">

          {/* ── LOGO / HEADER ── */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #0891b2, #1d4ed8)', boxShadow: '0 0 30px rgba(6,182,212,0.35)' }}>
              <Zap className="w-7 h-7 text-white fill-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-black leading-none tracking-tight"
              style={{ background: 'linear-gradient(90deg, #67e8f9, #ffffff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                NEON DASH
              </h1>
              <p className="text-white/30 text-xs mt-0.5">Weiche aus · Sammle · Überlebe</p>
            </div>
            {user && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full shrink-0" style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)' }}>
                <Coins className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-yellow-400 font-black text-sm">{(user.tokens || 0).toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* ── SECTION: HAUPTMODI ── */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/20 mb-2.5">Spielmodi</p>
            <div className="grid grid-cols-2 gap-2.5 mb-2.5">
              <button onClick={() => startGame(false)}
              className="relative overflow-hidden flex flex-col items-start gap-2 p-4 rounded-2xl font-black text-white transition-all active:scale-95"
              style={{ background: 'linear-gradient(145deg, #0e7490, #1e40af)', boxShadow: '0 4px 20px rgba(6,182,212,0.2)', border: '1px solid rgba(6,182,212,0.25)' }}>
                <Play className="w-6 h-6 fill-white" />
                <div>
                  <p className="text-base font-black leading-none">Normal</p>
                  <p className="text-[10px] text-white/50 mt-0.5">Entspannter Einstieg</p>
                </div>
                <span className="text-[9px] font-bold text-cyan-300/70 bg-cyan-500/10 px-1.5 py-0.5 rounded-full">1× Tokens</span>
              </button>
              <button onClick={() => startGame(true)}
              className="relative overflow-hidden flex flex-col items-start gap-2 p-4 rounded-2xl font-black text-white transition-all active:scale-95"
              style={{ background: 'linear-gradient(145deg, #9a3412, #7f1d1d)', boxShadow: '0 4px 20px rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <Zap className="w-6 h-6 text-orange-300" />
                <div>
                  <p className="text-base font-black leading-none">Pro Modus</p>
                  <p className="text-[10px] text-orange-300/60 mt-0.5">Sofort schnell & hart</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold text-orange-300/80 bg-orange-500/15 px-1.5 py-0.5 rounded-full">2× Tokens</span>
                  {proHighScore > 0 && <span className="text-[9px] text-orange-300/40">{proHighScore.toLocaleString()}</span>}
                </div>
              </button>
            </div>

            {/* Weitere Modi */}
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setGameState('levelselect')}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all active:scale-95"
              style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(139,92,246,0.22)' }}>
                <Map className="w-4 h-4 text-violet-400 shrink-0" />
                <div className="text-left min-w-0">
                  <p className="text-xs font-black text-white leading-none">Level Modus</p>
                  <p className="text-[9px] text-violet-400/50 mt-0.5">{completedLevels.length}/{LEVELS.length} abgeschlossen</p>
                </div>
              </button>
              <button onClick={() => { if (startApocalypse) startApocalypse(); else startGame(true); }}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all active:scale-95"
              style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.25)' }}>
                <span className="text-lg leading-none shrink-0">☄️</span>
                <div className="text-left min-w-0">
                  <p className="text-xs font-black text-white leading-none">Apocalypse</p>
                  <p className="text-[9px] text-red-300/50 mt-0.5">Endlos-Survival</p>
                </div>
              </button>
              <button onClick={() => startOnline && startOnline()}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all active:scale-95"
              style={{ background: 'rgba(6,182,212,0.07)', border: '1px solid rgba(6,182,212,0.18)' }}>
                <Wifi className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="text-left min-w-0">
                  <p className="text-xs font-black text-white leading-none">1v1 Online</p>
                  <p className="text-[9px] text-cyan-400/50 mt-0.5">vs echte Spieler</p>
                </div>
              </button>
              <Link to="/NeonBossRaid"
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all active:scale-95"
              style={{ background: 'rgba(109,40,217,0.1)', border: '1px solid rgba(139,92,246,0.22)' }}>
                <span className="text-lg leading-none shrink-0">👾</span>
                <div className="text-left min-w-0">
                  <p className="text-xs font-black text-white leading-none">Boss Raid</p>
                  <p className="text-[9px] text-violet-400/50 mt-0.5">2-Spieler Coop</p>
                </div>
              </Link>
            </div>
          </div>

          {/* ── SECTION: TÄGLICHE CHALLENGE ── */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/20 mb-2.5">Heute</p>
            <ContestBanner game="neondash" userProgress={highScore} />
            {dailyCompleted ?
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl mt-2" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
              <span className="text-xl">✅</span>
              <div>
                <p className="text-green-400 font-black text-sm">Daily Challenge erledigt!</p>
                <p className="text-white/30 text-xs">Morgen gibt es eine neue</p>
              </div>
            </div> :
            <div className="px-4 py-3.5 rounded-2xl mt-2" style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.12)' }}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🎯</span>
                  <span className="text-cyan-400 font-black text-xs uppercase tracking-wider">Heutige Challenge</span>
                  {todayChallenge.proOnly && <span className="bg-orange-500/15 text-orange-400 text-[9px] px-1.5 py-0.5 rounded-full font-black">PRO</span>}
                </div>
                <span className="text-yellow-400 text-xs font-black">+{todayChallenge.reward.toLocaleString()} 🪙</span>
              </div>
              <p className="text-white/55 text-sm mb-2">{todayChallenge.desc}</p>
              <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full transition-all" style={{ width: `${Math.min(100, dailyProgress / todayChallenge.target * 100)}%` }} />
              </div>
            </div>
            }
            {currentWeek && (
              <button onClick={() => setShowWeeklyRewards(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl mt-2 transition-all active:scale-95"
                style={{ background: `${currentWeek.color}0d`, border: `1px solid ${currentWeek.color}30` }}>
                <span className="text-lg leading-none shrink-0">{currentWeek.emoji}</span>
                <div className="flex-1 text-left">
                  <p className="text-xs font-black text-white">Wochen-Belohnungen</p>
                  <p className="text-[10px]" style={{ color: currentWeek.color + 'aa' }}>{currentWeek.theme} · {getWeeklyPtsForWeek(currentWeek.week).toLocaleString()} Pkt</p>
                </div>
                <div className="flex items-center gap-1">
                  <Gift className="w-4 h-4" style={{ color: currentWeek.color }} />
                  <ChevronRight className="w-3.5 h-3.5 text-white/20" />
                </div>
              </button>
            )}
            {(weekendBoostActive || dimensionEventActive) && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {weekendBoostActive && <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-black" style={{ background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.15)', color: '#fbbf24' }}>🎉 2× Wochenend-Boost</div>}
                {dimensionEventActive && <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-black" style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.15)', color: '#a78bfa' }}>⬡ Dimensions-Anomalie</div>}
              </div>
            )}
          </div>

          {/* ── SECTION: ANPASSEN & MEHR ── */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/20 mb-2.5">Anpassen & Mehr</p>
            <div className="grid grid-cols-5 gap-2">
              {[
                { label: 'Stats',    icon: <Clock className="w-5 h-5 text-blue-400" />,    action: () => setGameState('stats'),       dot: false },
                { label: 'Top 10',  icon: <Trophy className="w-5 h-5 text-cyan-400" />,   action: () => setGameState('leaderboard'), dot: false },
                { label: 'Upgrades',icon: <ShoppingCart className="w-5 h-5 text-fuchsia-400" />, action: () => setGameState('upgrades'), dot: hasAffordableUpgrade },
                { label: 'Skins',   icon: <Star className="w-5 h-5 text-yellow-400" />,   action: () => setGameState('skins'),       dot: hasAffordableSkin },
                { label: 'Teile',   icon: <Wrench className="w-5 h-5 text-orange-400" />, action: () => setShowShipParts(true),      dot: false },
              ].map(item => (
                <button key={item.label} onClick={item.action}
                className="relative flex flex-col items-center gap-1.5 py-3.5 rounded-xl transition-all active:scale-95"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  {item.dot && <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-fuchsia-500 rounded-full text-[7px] font-black text-white flex items-center justify-center">!</span>}
                  {item.icon}
                  <span className="text-[10px] font-bold text-white/45">{item.label}</span>
                </button>
              ))}
            </div>

            <button onClick={() => onOpenLoadout && onOpenLoadout()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl mt-2 transition-all active:scale-95"
            style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
              <Settings2 className="w-4 h-4 text-violet-400 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-black text-white">Schiff-Loadout</p>
                <p className="text-[9px] text-violet-300/50">Module ausrüsten · {s2EquippedModules.length}/2 aktiv</p>
              </div>
              <span className="text-[9px] font-bold text-violet-300/60 bg-violet-500/10 px-1.5 py-0.5 rounded-full ml-auto border border-violet-500/20">S2</span>
            </button>
          </div>

          {/* ── Pro Pass ── */}
          {(() => {
            const proPass = user?.pro_pass || {};
            const hasPro = proPass.purchased;
            const proLevel = proPass.level || 1;
            return (
              <Link to="/ProPass" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all active:scale-95"
              style={{ background: hasPro ? 'linear-gradient(135deg, rgba(251,191,36,0.18), rgba(168,85,247,0.2))' : 'rgba(251,191,36,0.06)', border: `1px solid ${hasPro ? 'rgba(251,191,36,0.45)' : 'rgba(251,191,36,0.2)'}` }}>
                <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-2xl shrink-0">⭐</motion.span>
                <div className="flex-1">
                  <p className="font-black text-sm text-white leading-none">Pro Pass</p>
                  <p className="text-[10px] text-yellow-300/50 mt-0.5">{hasPro ? `Aktiv · Level ${proLevel}` : 'Echo Dimension · Exklusive Skins'}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-yellow-300/40 shrink-0" />
              </Link>
            );
          })()}

          {/* ── Performance ── */}
          <div className="flex items-center gap-3">
            <button onClick={togglePerfMode}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${perfMode ? 'bg-green-500/8 border-green-500/18 text-green-400' : 'bg-white/3 border-white/5 text-white/20 hover:text-white/35'}`}>
              ⚡ Perf-Mode: <span className={perfMode ? 'font-black' : 'text-white/15'}>{perfMode ? 'AN' : 'AUS'}</span>
            </button>
            <a href={base44.agents.getWhatsAppConnectURL('neon_dash_leaderboard')} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs border transition-all"
            style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)', color: 'rgba(34,197,94,0.6)' }}>
              <Bot className="w-3.5 h-3.5" /> Bot
            </a>
          </div>

        </div>

      {/* Weekly Rewards Overlay */}
      <AnimatePresence>
        {showWeeklyRewards && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-auto"
            onClick={(e) => { if (e.target === e.currentTarget) setShowWeeklyRewards(false); }}>
            <NeonDashWeeklyRewards user={user} onClose={() => setShowWeeklyRewards(false)} />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Ship Parts Overlay */}
      <AnimatePresence>
        {showShipParts && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm pointer-events-auto p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowShipParts(false); }}>
            <ShipPartsMenu user={user} onBack={() => setShowShipParts(false)} />
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>);

  }

  if (gameState === 'levelselect') {
    const goalIcons = { survive: '⏱️', coins: '🪙', score: '⭐' };
    const goalLabels = { survive: 'Überleben', coins: 'Münzen', score: 'Punkte' };
    return (
      <motion.div key="levelselect" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
      className="pointer-events-auto bg-black/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-violet-500/30 shadow-[0_0_50px_rgba(139,92,246,0.15)] w-[92%] max-w-md max-h-[88vh] flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-fuchsia-400 flex items-center gap-2">
            <Map className="w-6 h-6 text-violet-400" /> Level Modus
          </h2>
          <div className="text-xs text-white/40 font-bold">{completedLevels.length}/{LEVELS.length}</div>
        </div>
        <p className="text-white/30 text-xs mb-3">Schließe jedes Level ab, um das nächste freizuschalten.</p>

        <div className="mb-4 bg-white/5 rounded-full overflow-hidden h-1.5">
          <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
          style={{ width: `${completedLevels.length / LEVELS.length * 100}%` }} />
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-2 mb-4 hide-scrollbar">
          {LEVELS.map((lvl) => {
            const done = completedLevels.includes(lvl.id);
            const unlocked = isLevelUnlocked(lvl);
            return (
              <button key={lvl.id} disabled={!unlocked}
              onClick={() => unlocked && startLevel(lvl)}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all active:scale-95 text-left ${
              done ? 'bg-green-500/8 border-green-500/20 hover:bg-green-500/15' :
              unlocked ? 'bg-white/5 border-white/10 hover:bg-white/10' :
              'bg-white/[0.02] border-white/5 opacity-35 cursor-not-allowed'}`}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={unlocked ? { backgroundColor: lvl.color + '18', boxShadow: `0 0 10px ${lvl.color}25` } : { backgroundColor: 'rgba(255,255,255,0.04)' }}>
                  {!unlocked ? '🔒' : done ? '✅' : lvl.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] font-black text-white/25 bg-white/5 px-1.5 py-0.5 rounded-full">#{lvl.id}</span>
                    <span className="font-bold text-white/90 text-sm truncate">{lvl.name}</span>
                    {lvl.hse && <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(249,115,22,0.2)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.3)' }}>⚡ HSE</span>}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="text-white/35">{goalIcons[lvl.goal.type]}</span>
                    <span className="text-white/35">{goalLabels[lvl.goal.type]}:</span>
                    <span style={{ color: lvl.color + 'cc' }} className="font-bold">
                      {lvl.goal.type === 'survive' ? `${lvl.goal.target}s` : lvl.goal.type === 'coins' ? `${lvl.goal.target} Münzen` : `${lvl.goal.target.toLocaleString()} Pkt`}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {done ? (
                    <span className="text-green-400 text-xs font-black">✓ Fertig</span>
                  ) : (
                    <div className="flex items-center gap-1 text-yellow-400/70 text-xs font-bold">
                      <Coins className="w-3 h-3" />{lvl.reward.toLocaleString()}
                    </div>
                  )}
                </div>
              </button>);
          })}
        </div>
        <Button onClick={() => setGameState('menu')} className="w-full bg-white/10 hover:bg-white/20 text-white py-6 rounded-2xl font-bold border-none">Zurück</Button>
      </motion.div>);
  }

  if (gameState === 'upgrades') {
    return (
      <motion.div key="upgrades" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
      className="pointer-events-auto bg-black/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-fuchsia-500/30 shadow-[0_0_50px_rgba(217,70,239,0.15)] w-[90%] max-w-md max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-purple-500 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-fuchsia-400" /> Upgrades
          </h2>
          <div className="bg-white/10 px-3 py-1 rounded-full flex items-center gap-2 border border-white/20">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="font-bold text-yellow-400">{user?.tokens?.toLocaleString() || 0}</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 mb-5 hide-scrollbar">
          {UPGRADES.map((upg) => {
            const level = getUpgradeLevel(upg.id);
            const isMax = level >= upg.maxLevel;
            const cost = getUpgradeCost(upg);
            const canAfford = (user?.tokens || 0) >= cost;
            return (
              <div key={upg.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-start gap-3 cursor-pointer" onClick={() => setExpandedUpgrade(expandedUpgrade === upg.id ? null : upg.id)}>
                  <div className="bg-black/50 p-3 rounded-xl border border-white/10 text-2xl">{upg.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-white/90">{upg.name}</h3>
                      <span className="text-xs font-black bg-white/10 px-2 py-1 rounded-md text-white/70">Lvl {level}/{upg.maxLevel}</span>
                    </div>
                    {expandedUpgrade === upg.id && <p className="text-xs text-white/50 mt-1">{upg.desc}</p>}
                  </div>
                </div>
                <Button onClick={() => buyUpgrade(upg)} disabled={isMax || !canAfford}
                className={`w-full py-5 rounded-xl font-black flex items-center justify-center gap-2 ${isMax ? 'bg-green-500/20 text-green-400 border border-green-500/30' : canAfford ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white border-none' : 'bg-white/5 text-white/30 cursor-not-allowed border-none'}`}>
                  {isMax ? 'Max Level! ✓' : <><ArrowUpCircle className="w-5 h-5" /> {cost.toLocaleString()} Tokens</>}
                </Button>
              </div>);

          })}
        </div>
        <Button onClick={() => setGameState('menu')} className="w-full bg-white/10 hover:bg-white/20 text-white py-6 rounded-2xl font-bold border-none">Zurück</Button>
      </motion.div>);

  }

  if (gameState === 'skins') {
    return (
      <motion.div key="skins" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
      className="pointer-events-auto bg-black/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-yellow-500/30 shadow-[0_0_50px_rgba(234,179,8,0.15)] w-[90%] max-w-md max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-400" /> Schiff Skins
          </h2>
          <div className="bg-white/10 px-3 py-1 rounded-full flex items-center gap-2 border border-white/20">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="font-bold text-yellow-400">{user?.tokens?.toLocaleString() || 0}</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 mb-5 hide-scrollbar">
          {SHIP_SKINS.map((skin) => {
            const owned = getOwnedSkins().includes(skin.id);
            const active = getActiveSkin() === skin.id;
            const canAfford = (user?.tokens || 0) >= skin.cost;
            const isBpS2Locked = skin.bpS2 && !owned;
            return (
              <div key={skin.id} className={`bg-white/5 border rounded-2xl p-4 flex items-center gap-4 transition-all ${active ? 'border-yellow-400/50 shadow-[0_0_12px_rgba(251,191,36,0.15)]' : isBpS2Locked ? 'border-fuchsia-500/20 opacity-60' : 'border-white/10 hover:border-white/20'}`}>
                 <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
                 style={{ backgroundColor: 'rgba(0,0,0,0.5)', boxShadow: `0 0 18px ${skin.glowColor}45` }}>
                   <ShipSkinPreview skinId={skin.id} color={skin.color} glowColor={skin.glowColor} size={56} />
                 </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white/90">{skin.name}</h3>
                    {active && <span className="text-[10px] bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full font-bold">Aktiv</span>}
                    {skin.hse && <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(249,115,22,0.18)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.28)' }}>⚡ HSE</span>}
                    {skin.legendary && <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(168,85,247,0.18)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)' }}>LEGENDARY</span>}
                    {skin.bpS2 && !owned && <span className="text-[9px] bg-fuchsia-500/15 text-fuchsia-400 px-1.5 py-0.5 rounded-full font-bold border border-fuchsia-500/25">BP S2</span>}
                  </div>
                  <p className="text-xs text-white/50 mt-0.5 truncate">{skin.desc}</p>
                </div>
                <Button onClick={() => buySkin(skin)} disabled={active || (skin.exclusive && !owned) || isBpS2Locked}
                className={`rounded-xl px-4 py-2 font-black text-sm flex-shrink-0 border-none ${active ? 'bg-yellow-500/20 text-yellow-400' : owned ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : skin.exclusive ? 'bg-purple-500/10 text-purple-400/50 cursor-not-allowed' : isBpS2Locked ? 'bg-fuchsia-500/10 text-fuchsia-400/40 cursor-not-allowed' : canAfford ? 'bg-yellow-500 hover:bg-yellow-400 text-black' : 'bg-white/5 text-white/30 cursor-not-allowed'}`}>
                  {active ? '✓' : owned ? 'Anlegen' : skin.exclusive ? '⬡ Pro Pass' : isBpS2Locked ? '🔒 Battle Pass' : skin.cost === 0 ? 'Gratis' : `${skin.cost.toLocaleString()}`}
                </Button>
              </div>);

          })}
        </div>
        <Button onClick={() => setGameState('menu')} className="w-full bg-white/10 hover:bg-white/20 text-white py-6 rounded-2xl font-bold border-none">Zurück</Button>
      </motion.div>);

  }

  return null;
}