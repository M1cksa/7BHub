import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Users, Trophy, Loader2, Play, Shield, Swords, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { NEW_WEAPONS, NEW_CLASSES, TEAM_ARENA_RULES } from '@/components/game/astro/AstroBlitzConfig';

const SHIP_COLORS = [
  { id: 'cyan',   color: '#06b6d4', glow: '#67e8f9', label: 'Neon Cyan'   },
  { id: 'pink',   color: '#ec4899', glow: '#f9a8d4', label: 'Magenta'     },
  { id: 'green',  color: '#22c55e', glow: '#86efac', label: 'Cyber Green' },
  { id: 'gold',   color: '#fbbf24', glow: '#fde68a', label: 'Gold Rush'   },
  { id: 'purple', color: '#a855f7', glow: '#d8b4fe', label: 'Void Purple' },
  { id: 'red',    color: '#ef4444', glow: '#fca5a5', label: 'Inferno'     },
];

export default function AstroBlitzMenu({ user, highScore, onStartSolo, onStartVersus }) {
  const [tab, setTab] = useState('solo'); // solo | versus | weapons | classes
  const [selectedShip, setSelectedShip] = useState(0);
  const [matchmaking, setMatchmaking] = useState(false);
  const [matchmakingStatus, setMatchmakingStatus] = useState('');
  const mmIntervalRef = React.useRef(null);
  const mmMatchRef = React.useRef(null);

  useEffect(() => {
    return () => {
      clearInterval(mmIntervalRef.current);
      if (mmMatchRef.current) {
        base44.entities.NeonDashMatch.update(mmMatchRef.current, { status: 'cancelled' }).catch(() => {});
      }
    };
  }, []);

  const [foundOpponent, setFoundOpponent] = useState(null);
  const [waitSeconds, setWaitSeconds] = useState(0);
  const waitTimerRef = React.useRef(null);

  const startMatchmaking = async () => {
    if (!user) { toast.error('Bitte melde dich an!'); return; }
    setMatchmaking(true);
    setFoundOpponent(null);
    setWaitSeconds(0);
    setMatchmakingStatus('Suche nach Gegner...');
    waitTimerRef.current = setInterval(() => setWaitSeconds(s => s + 1), 1000);

    try {
      // Cancel own stale lobbies first
      const myStale = await base44.entities.NeonDashMatch.filter({ status: 'waiting', game_type: 'astro_blitz', player1_id: user.id }, '-created_date', 5).catch(() => []);
      for (const s of (myStale || [])) {
        await base44.entities.NeonDashMatch.update(s.id, { status: 'cancelled' }).catch(() => {});
      }

      // Look for open lobbies from other players
      const openMatches = await base44.entities.NeonDashMatch.filter({ status: 'waiting', game_type: 'astro_blitz' }, '-created_date', 20);
      const joinable = (openMatches || []).filter(m =>
        m.player1_id !== user.id &&
        !m.player2_id
      );

      let matchId, isP1, oppName;

      if (joinable.length > 0) {
        const match = joinable[0];
        await base44.entities.NeonDashMatch.update(match.id, {
          player2_username: user.username,
          player2_id: user.id,
          player2_skin: SHIP_COLORS[selectedShip].id,
          status: 'active',
        });
        matchId = match.id;
        isP1 = false;
        oppName = match.player1_username || 'Gegner';
        clearInterval(waitTimerRef.current);
        setFoundOpponent(oppName);
        setMatchmakingStatus('Gegner gefunden!');
        clearInterval(mmIntervalRef.current);
        mmMatchRef.current = null;
        setTimeout(() => { setMatchmaking(false); onStartVersus(matchId, isP1, oppName); }, 1200);
      } else {
        // Create new lobby
        const newMatch = await base44.entities.NeonDashMatch.create({
          player1_username: user.username,
          player1_id: user.id,
          player1_skin: SHIP_COLORS[selectedShip].id,
          player1_score: 0,
          player2_score: 0,
          status: 'waiting',
          game_type: 'astro_blitz',
          shared_lives: 0,
        });
        matchId = newMatch.id;
        isP1 = true;
        mmMatchRef.current = matchId;
        setMatchmakingStatus('Warte auf Gegner...');

        mmIntervalRef.current = setInterval(async () => {
          try {
            const updated = await base44.entities.NeonDashMatch.get(matchId);
            if (updated?.status === 'active' && updated.player2_id) {
              clearInterval(mmIntervalRef.current);
              clearInterval(waitTimerRef.current);
              mmMatchRef.current = null;
              oppName = updated.player2_username || 'Gegner';
              setFoundOpponent(oppName);
              setMatchmakingStatus('Gegner gefunden!');
              setTimeout(() => { setMatchmaking(false); onStartVersus(matchId, true, oppName); }, 1200);
            } else if (!updated || updated.status === 'cancelled') {
              clearInterval(mmIntervalRef.current);
              clearInterval(waitTimerRef.current);
              mmMatchRef.current = null;
              setMatchmaking(false);
              setMatchmakingStatus('');
            }
          } catch (e) {}
        }, 1500);
      }
    } catch (e) {
      clearInterval(waitTimerRef.current);
      setMatchmaking(false);
      setMatchmakingStatus('');
      toast.error('Fehler beim Matchmaking');
    }
  };

  const cancelMatchmaking = async () => {
    clearInterval(mmIntervalRef.current);
    clearInterval(waitTimerRef.current);
    if (mmMatchRef.current) {
      await base44.entities.NeonDashMatch.update(mmMatchRef.current, { status: 'cancelled' }).catch(() => {});
      mmMatchRef.current = null;
    }
    setMatchmaking(false);
    setFoundOpponent(null);
    setMatchmakingStatus('');
    setWaitSeconds(0);
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-4"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(6,182,212,0.08) 0%, rgba(168,85,247,0.06) 50%, transparent 80%)' }}>

      {/* Stars bg */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{ width: Math.random() * 2 + 1, height: Math.random() * 2 + 1, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, opacity: Math.random() * 0.5 + 0.1 }} />
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md">
        {/* Title */}
        <div className="text-center mb-6">
          <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
            <div className="text-5xl mb-2">🚀</div>
          </motion.div>
          <h1 className="text-4xl font-black tracking-tight"
            style={{ background: 'linear-gradient(90deg, #06b6d4, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ASTRO BLITZ
          </h1>
          <p className="text-white/40 text-sm mt-1">Arena Shooter • Waves • Battle</p>
          {highScore > 0 && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}>
              <Trophy className="w-3 h-3" /> Highscore: {highScore.toLocaleString()}
            </div>
          )}
        </div>

        {/* Mode Tabs */}
        <div className="flex rounded-2xl p-1 mb-5 gap-0.5" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
          {[
            { id: 'solo',    label: '⚡ Solo'    },
            { id: 'versus',  label: '⚔️ 1v1'     },
            { id: 'weapons', label: '🔫 Waffen'  },
            { id: 'classes', label: '🛡️ Klassen' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-2 rounded-xl text-[11px] font-black transition-all duration-200 ${tab === t.id ? 'text-white' : 'text-white/35 hover:text-white/60'}`}
              style={tab === t.id ? { background: 'linear-gradient(135deg, rgba(6,182,212,0.25), rgba(168,85,247,0.15))', border: '1px solid rgba(6,182,212,0.4)' } : {}}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Ship selector */}
        <div className="mb-5">
          <p className="text-white/40 text-xs font-bold mb-2 uppercase tracking-widest text-center">Schiff wählen</p>
          <div className="flex gap-2 justify-center flex-wrap">
            {SHIP_COLORS.map((s, i) => (
              <button key={s.id} onClick={() => setSelectedShip(i)}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${selectedShip === i ? 'scale-110' : 'opacity-50 hover:opacity-80'}`}
                style={{ background: selectedShip === i ? `${s.color}22` : 'rgba(255,255,255,0.05)', border: `2px solid ${selectedShip === i ? s.color : 'rgba(255,255,255,0.1)'}`, boxShadow: selectedShip === i ? `0 0 14px ${s.glow}60` : 'none' }}>
                <svg width="22" height="22" viewBox="0 0 22 22">
                  <polygon points="11,2 20,18 11,14 2,18" fill={s.color} style={{ filter: `drop-shadow(0 0 4px ${s.glow})` }} />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Action */}
        <AnimatePresence mode="wait">
          {tab === 'weapons' ? (
            <motion.div key="weapons" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2.5 max-h-[50vh] overflow-y-auto hide-scrollbar">
              <p className="text-[10px] text-white/30 font-black uppercase tracking-widest px-1">⚡ High-Speed Evolution — Neue Waffen</p>
              {NEW_WEAPONS.map((w) => (
                <div key={w.id} className="rounded-2xl p-3 border" style={{ background: `${w.color}0d`, borderColor: `${w.color}40` }}>
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: `${w.color}18`, border: `1px solid ${w.color}40` }}>
                      {w.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-white font-black text-sm">{w.name}</span>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{ background: `${w.color}25`, color: w.color, border: `1px solid ${w.color}50` }}>
                          {w.rarity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-white/50 text-xs leading-snug">{w.desc}</p>
                      <div className="grid grid-cols-3 gap-1 mt-2 text-[10px]">
                        <span className="text-white/40">💥 {w.damage} Dmg</span>
                        <span className="text-white/40">⚡ {w.fireRate}/s</span>
                        <span style={{ color: w.color }}>🔓 Welle {w.unlockWave}</span>
                      </div>
                      {w.synergyId && (
                        <p className="text-[9px] mt-1.5 px-2 py-1 rounded-lg" style={{ background: `${w.color}12`, color: `${w.color}bb` }}>
                          🔗 Synergie: {w.synergyId.replace('_', ' ')} — {Object.entries(w.synergyBonus).map(([k,v]) => `${k}: ${v}`).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div className="pt-1 pb-2 text-center">
                <p className="text-white/20 text-[9px]">Waffen werden im Spiel freigeschalten</p>
              </div>
            </motion.div>
          ) : tab === 'classes' ? (
            <motion.div key="classes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3 max-h-[50vh] overflow-y-auto hide-scrollbar">
              <p className="text-[10px] text-white/30 font-black uppercase tracking-widest px-1">🛡️ Neue Charakterklassen</p>
              {NEW_CLASSES.map((cls) => (
                <div key={cls.id} className="rounded-2xl p-3.5 border border-white/10 bg-white/[0.04]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{cls.icon}</span>
                    <div>
                      <p className="text-white font-black text-sm">{cls.name}</p>
                      <p className="text-white/40 text-[9px] font-bold uppercase tracking-wider">{cls.role}</p>
                    </div>
                    <span className="ml-auto text-yellow-400 text-xs font-black">{cls.unlockCost.toLocaleString()} 🪙</span>
                  </div>
                  <p className="text-white/55 text-xs leading-snug mb-2.5">{cls.desc}</p>
                  <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                    {Object.entries(cls.baseStats).map(([stat, val]) => (
                      <div key={stat} className="flex items-center justify-between px-2 py-1 rounded-lg bg-white/5 text-[10px]">
                        <span className="text-white/40 capitalize">{stat}</span>
                        <span className="text-white font-bold">{val}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1">
                    {cls.passives.map((p) => (
                      <p key={p.name} className="text-[10px] text-white/40 leading-snug">
                        <span className="text-cyan-400 font-bold">{p.name}:</span> {p.desc}
                      </p>
                    ))}
                  </div>
                  {cls.teamAbility && (
                    <div className="mt-2.5 px-2.5 py-2 rounded-xl border border-violet-500/30 bg-violet-500/8">
                      <p className="text-violet-300 text-[10px] font-black mb-0.5">{cls.teamAbility.icon} Team-Fähigkeit: {cls.teamAbility.name}</p>
                      <p className="text-white/40 text-[10px]">{cls.teamAbility.desc} (CD: {cls.teamAbility.cooldown}s)</p>
                    </div>
                  )}
                </div>
              ))}
              {/* Team-Arena Vorschau */}
              <div className="rounded-2xl p-3.5 border border-fuchsia-500/30 bg-fuchsia-500/8">
                <p className="text-fuchsia-300 font-black text-xs mb-2">⚔️ Team-Arena Modi</p>
                {TEAM_ARENA_RULES.modes.map(m => (
                  <div key={m.id} className="flex items-center justify-between mb-1.5 text-[11px]">
                    <span className="text-white/70 font-bold">{m.icon} {m.name}</span>
                    <span className="text-white/35">{m.duration}s · {m.lives} Leben</span>
                  </div>
                ))}
                <p className="text-white/25 text-[9px] mt-1.5">Bald verfügbar — Story Kapitel 2 erforderlich</p>
              </div>
            </motion.div>
          ) : tab === 'solo' ? (
            <motion.div key="solo" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
              <div className="rounded-xl p-3 text-sm text-white/50" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p>🌊 Überlebe endlose Gegnerwellen. Jede Welle wird schneller und gefährlicher. Besiege Bosse und sammle Power-Ups!</p>
              </div>
              <Button onClick={onStartSolo} className="w-full h-12 font-black text-base"
                style={{ background: 'linear-gradient(135deg, #06b6d4, #7c3aed)', border: 'none' }}>
                <Play className="w-5 h-5 mr-2" /> Jetzt spielen
              </Button>
            </motion.div>
          ) : (
            <motion.div key="versus" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
              {!matchmaking ? (
                <>
                  <div className="rounded-xl p-3 text-sm" style={{ background: 'rgba(236,72,153,0.06)', border: '1px solid rgba(236,72,153,0.2)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Swords className="w-4 h-4 text-pink-400" />
                      <span className="text-pink-300 font-black text-xs uppercase tracking-widest">1v1 Versus</span>
                    </div>
                    <p className="text-white/50 text-xs leading-relaxed">Tritt gegen einen echten Spieler an. 90 Sekunden. Wer mehr Punkte macht, gewinnt!</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="text-lg font-black text-cyan-400">90s</div>
                      <div className="text-white/30 text-[10px] font-bold uppercase">Rundenzeit</div>
                    </div>
                    <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="text-lg font-black text-yellow-400">2×</div>
                      <div className="text-white/30 text-[10px] font-bold uppercase">Bonus-XP</div>
                    </div>
                  </div>
                  <Button onClick={startMatchmaking} className="w-full h-12 font-black text-base"
                    style={{ background: 'linear-gradient(135deg, #ec4899, #7c3aed)', border: 'none' }}>
                    <Users className="w-5 h-5 mr-2" /> Matchmaking starten
                  </Button>
                </>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence mode="wait">
                    {foundOpponent ? (
                      <motion.div key="found" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="rounded-xl p-4 text-center"
                        style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.4)' }}>
                        <div className="text-2xl mb-1">⚔️</div>
                        <div className="text-green-400 font-black text-sm">Gegner gefunden!</div>
                        <div className="text-white font-black text-lg mt-1">{foundOpponent}</div>
                        <div className="text-white/40 text-xs mt-1">Spiel startet...</div>
                      </motion.div>
                    ) : (
                      <motion.div key="searching" className="rounded-xl p-4"
                        style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)' }}>
                        <div className="flex items-center gap-3 mb-3">
                          <Loader2 className="w-4 h-4 animate-spin text-purple-400 shrink-0" />
                          <span className="text-white/70 text-sm font-bold">{matchmakingStatus}</span>
                          <span className="ml-auto text-white/30 text-xs font-mono">{waitSeconds}s</span>
                        </div>
                        <div className="flex gap-1">
                          {[0,1,2,3,4].map(i => (
                            <motion.div key={i} className="flex-1 h-1 rounded-full bg-purple-500/40"
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }} />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {!foundOpponent && (
                    <Button variant="outline" onClick={cancelMatchmaking} className="w-full h-10 text-sm border-white/20">
                      Abbrechen
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}