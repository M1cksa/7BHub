import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, Users, Wifi } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import BossRaidGame, { seedFromString } from '@/components/game/BossRaidGame';

const BOSS_MAX_HP = 3000;

export default function NeonBossRaid() {
  const [user] = useState(() => {
    try { const u = localStorage.getItem('app_user'); return u && u !== 'undefined' ? JSON.parse(u) : null; } catch { return null; }
  });
  const [gamePhase, setGamePhase] = useState('lobby');
  const [match, setMatch] = useState(null);
  const [isPlayer1, setIsPlayer1] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [bossHp, setBossHp] = useState(BOSS_MAX_HP);
  const [myLives, setMyLives] = useState(5);
  const [myDamage, setMyDamage] = useState(0);
  const [partnerDamage, setPartnerDamage] = useState(0);
  const [partnerX, setPartnerX] = useState(null);
  const [partnerSkin, setPartnerSkin] = useState('default');
  const [partnerDead, setPartnerDead] = useState(false);
  const [partnerHitSignal, setPartnerHitSignal] = useState(0); // bumped each time partner hits boss
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [earnedTokens, setEarnedTokens] = useState(0);
  const [isMVP, setIsMVP] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  const matchRef = useRef(null);
  const isP1Ref = useRef(false);
  const subRef = useRef(null);
  const posIntervalRef = useRef(null);
  const hpFlushRef = useRef(null);
  const myXRef = useRef(0);
  const gameEndedRef = useRef(false);
  const myDeadRef = useRef(false);
  const partnerDeadRef = useRef(false);
  const gamePhaseRef = useRef('lobby');
  gamePhaseRef.current = gamePhase;

  // Damage-based HP sync: each player writes their own cumulative damage.
  // bossHp = BOSS_MAX_HP - myDamage - partnerDamage  (no shared_lives race condition)
  // NOTE: score=-1 is used as a death signal and must NOT be counted as damage
  const pendingDmgRef = useRef(0);
  const myDamageRef = useRef(0);
  const partnerDamageRef = useRef(0);
  const localHpRef = useRef(BOSS_MAX_HP);

  const getMySkin = () => {
    try {
      const u = localStorage.getItem('app_user');
      const p = u && u !== 'undefined' ? JSON.parse(u) : null;
      return p?.neon_dash_upgrades?.active_skin || 'default';
    } catch { return 'default'; }
  };

  const cleanup = () => {
    if (subRef.current) { subRef.current(); subRef.current = null; }
    clearInterval(posIntervalRef.current);
    clearInterval(hpFlushRef.current);
  };

  useEffect(() => () => cleanup(), []);

  const startCountdown = useCallback((startedAtStr) => {
    // Prevent double-start
    if (gamePhaseRef.current === 'countdown' || gamePhaseRef.current === 'playing') return;
    setGamePhase('countdown');
    let c = 3;
    setCountdown(c);
    const iv = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(iv);
        setGamePhase('playing');
      }
    }, 1000);
  }, []);

  const BOSS_FRAME = 'void_titan';
  const BOSS_REWARD = 50000;

  const endGame = useCallback(async (result) => {
    if (gameEndedRef.current) return;
    gameEndedRef.current = true;
    cleanup();
    if (result === 'victory') {
      const myDmg = myDamageRef.current;
      const isMvp = myDmg > 0;
      setIsMVP(isMvp);
      const earned = BOSS_REWARD;
      setEarnedTokens(earned);
      try {
        const cuStr = localStorage.getItem('app_user');
        const cu = cuStr && cuStr !== 'undefined' ? JSON.parse(cuStr) : {};
        if (cu?.id) {
          // Award tokens + XP
          const { awardXpAndTokens } = await import('@/components/battlepass/xpUtils');
          await awardXpAndTokens(cu, earned / 2, earned, 'Neon Boss Raid – Victory');
          // Award exclusive void_titan frame if not already owned
          const freshUser = JSON.parse(localStorage.getItem('app_user') || '{}');
          const ownedFrames = freshUser.owned_frames || [];
          if (!ownedFrames.includes(BOSS_FRAME)) {
            const updated = await base44.entities.AppUser.update(freshUser.id, {
              owned_frames: [...ownedFrames, BOSS_FRAME],
            });
            localStorage.setItem('app_user', JSON.stringify(updated));
            window.dispatchEvent(new Event('user-updated'));
          }
        }
      } catch (e) { console.error(e); }
      if (matchRef.current) {
        base44.entities.NeonDashMatch.update(matchRef.current.id, { status: 'finished' }).catch(() => {});
      }
    }
    setGamePhase(result);
  }, []);

  const subscribeToMatch = useCallback((matchId, p1) => {
    if (subRef.current) subRef.current();
    subRef.current = base44.entities.NeonDashMatch.subscribe((event) => {
      if (event.id !== matchId || !event.data) return;
      const m = event.data;

      setMatch(prev => ({ ...(prev || {}), ...m }));
      matchRef.current = { ...(matchRef.current || {}), ...m };

      // Sync partner cumulative damage → derive boss HP
      // score=-1 is death signal, not actual damage — ignore it for HP calc
      const rawPScore = p1 ? (m.player2_score ?? 0) : (m.player1_score ?? 0);
      const pScore = rawPScore < 0 ? partnerDamageRef.current : rawPScore;
      if (pScore > partnerDamageRef.current) {
        partnerDamageRef.current = pScore;
        setPartnerDamage(pScore);
        setPartnerHitSignal(n => n + 1); // trigger visual flash in game
        const hp = Math.max(0, BOSS_MAX_HP - myDamageRef.current - pScore);
        setBossHp(hp);
        if (hp <= 0 && !gameEndedRef.current && gamePhaseRef.current === 'playing') {
          endGame('victory');
          return;
        }
      }

      // Sync partner position (stored as 0-1 ratio) + skin
      const pX = p1 ? (m.player2_x || null) : (m.player1_x || null);
      const pSkin = p1 ? (m.player2_skin || 'default') : (m.player1_skin || 'default');
      if (pX !== null) setPartnerX(pX);
      if (pSkin) setPartnerSkin(pSkin);

      // Partner died signal: score === -1
      const partnerDiedSignal = isP1Ref.current
        ? (m.player2_score === -1)
        : (m.player1_score === -1);
      if (partnerDiedSignal && !partnerDeadRef.current) {
        partnerDeadRef.current = true;
        setPartnerDead(true);
        // If both dead → defeat
        if (myDeadRef.current && !gameEndedRef.current) {
          endGame('defeat');
        }
      }

      // P2 detects game start
      if (m.status === 'active' && m.started_at) {
        const phase = gamePhaseRef.current;
        if (phase === 'waiting') {
          startCountdown(m.started_at);
        }
      }

      // P1: both ready → kick off
      if (p1 && m.player2_id && m.player1_ready && m.player2_ready && m.status === 'waiting') {
        const startedAt = new Date().toISOString();
        base44.entities.NeonDashMatch.update(matchId, {
          status: 'active',
          started_at: startedAt,
          shared_lives: BOSS_MAX_HP,
        }).then(updated => {
          setMatch(updated);
          matchRef.current = updated;
          startCountdown(startedAt);
        }).catch(() => {});
      }
    });
  }, [startCountdown, endGame]);

  const startPosSync = useCallback((matchId, p1) => {
    clearInterval(posIntervalRef.current);
    const xField = p1 ? 'player1_x' : 'player2_x';
    const skinField = p1 ? 'player1_skin' : 'player2_skin';
    posIntervalRef.current = setInterval(() => {
      if (!matchId || gamePhaseRef.current !== 'playing') return;
      // Send as 0-1 ratio – resolution-independent
      base44.entities.NeonDashMatch.update(matchId, {
        [xField]: myXRef.current,  // already a 0-1 ratio from onPositionUpdate
        [skinField]: getMySkin(),
      }).catch(() => {});
    }, 100); // 100ms for smoother partner movement
  }, []);

  const startHpFlush = useCallback((matchId, p1) => {
    clearInterval(hpFlushRef.current);
    const scoreField = p1 ? 'player1_score' : 'player2_score';
    hpFlushRef.current = setInterval(() => {
      if (!matchId || gamePhaseRef.current !== 'playing') return;
      if (pendingDmgRef.current === 0) return;
      pendingDmgRef.current = 0;
      // Write cumulative damage + position as ratio in one batch
      base44.entities.NeonDashMatch.update(matchId, {
        [scoreField]: myDamageRef.current,
      }).catch(() => {});
    }, 60); // 60ms flush – snappier sync
  }, []);

  const findOrCreate = async () => {
    if (!user) { toast.error('Bitte einloggen!'); return; }
    setLoading(true);
    try {
      const open = await base44.entities.NeonDashMatch.filter({ match_type: 'boss_raid', status: 'waiting' }, '-created_date', 10);
      const joinable = open.find(m => !m.player2_id && m.player1_id !== user.id);
      let newMatch, p1;
      if (joinable) {
        p1 = false;
        newMatch = await base44.entities.NeonDashMatch.update(joinable.id, {
          player2_id: user.id,
          player2_name: user.username,
          player2_ready: true,
        });
      } else {
        p1 = true;
        newMatch = await base44.entities.NeonDashMatch.create({
          player1_id: user.id,
          player1_name: user.username,
          player1_ready: true,
          match_type: 'boss_raid',
          mode: 'casual',
          status: 'waiting',
          shared_lives: BOSS_MAX_HP,
          invite_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        });
      }
      localHpRef.current = BOSS_MAX_HP;
      pendingDmgRef.current = 0;
      matchRef.current = newMatch;
      setMatch(newMatch);
      setIsPlayer1(p1);
      isP1Ref.current = p1;
      gameEndedRef.current = false;
      myDeadRef.current = false;
      partnerDeadRef.current = false;
      setBossHp(BOSS_MAX_HP);
      setMyDamage(0);
      setPartnerDamage(0);
      setPartnerX(null);
      setPartnerDead(false);
      setGamePhase('waiting');
      subscribeToMatch(newMatch.id, p1);
      startPosSync(newMatch.id, p1);
      startHpFlush(newMatch.id, p1);
    } catch (e) {
      toast.error('Fehler beim Erstellen des Matches');
    }
    setLoading(false);
  };

  const joinWithCode = async () => {
    if (!inviteCode.trim() || !user) return;
    setLoading(true);
    try {
      const list = await base44.entities.NeonDashMatch.filter({
        invite_code: inviteCode.trim().toUpperCase(), match_type: 'boss_raid', status: 'waiting',
      }, '', 1);
      if (!list.length) { toast.error('Kein Match gefunden'); setLoading(false); return; }
      const m = list[0];
      if (m.player1_id === user.id) { toast.error('Du bist bereits Player 1!'); setLoading(false); return; }
      const updated = await base44.entities.NeonDashMatch.update(m.id, {
        player2_id: user.id,
        player2_name: user.username,
        player2_ready: true,
      });
      localHpRef.current = BOSS_MAX_HP;
      pendingDmgRef.current = 0;
      matchRef.current = updated;
      setMatch(updated);
      setIsPlayer1(false);
      isP1Ref.current = false;
      gameEndedRef.current = false;
      myDeadRef.current = false;
      partnerDeadRef.current = false;
      setBossHp(BOSS_MAX_HP);
      setMyDamage(0);
      setPartnerDamage(0);
      setPartnerX(null);
      setPartnerDead(false);
      setGamePhase('waiting');
      subscribeToMatch(updated.id, false);
      startPosSync(updated.id, false);
      startHpFlush(updated.id, false);
    } catch (e) {
      toast.error('Fehler beim Beitreten');
    }
    setLoading(false);
  };

  // Called from game loop on every hit
  const onBossHit = useCallback((damage) => {
    if (gameEndedRef.current || !matchRef.current) return;
    myDamageRef.current += damage;
    pendingDmgRef.current += damage;
    setMyDamage(myDamageRef.current);
    const hp = Math.max(0, BOSS_MAX_HP - myDamageRef.current - partnerDamageRef.current);
    setBossHp(hp);
    if (hp <= 0 && !gameEndedRef.current) endGame('victory');
  }, [endGame]);

  const onPlayerDie = useCallback(() => {
    if (gameEndedRef.current) return;
    myDeadRef.current = true;
    // Signal partner we died via score=-1
    if (matchRef.current) {
      const scoreField = isP1Ref.current ? 'player1_score' : 'player2_score';
      base44.entities.NeonDashMatch.update(matchRef.current.id, { [scoreField]: -1 }).catch(() => {});
    }
    // If partner already dead → both dead = defeat
    if (partnerDeadRef.current) {
      endGame('defeat');
    } else {
      // Solo defeat (partner still alive → game continues for partner, we show defeat)
      endGame('defeat');
    }
  }, [endGame]);

  const onPositionUpdate = useCallback((ratio) => { myXRef.current = ratio; }, []);
  const onCanvasSize = useCallback((w) => { setCanvasWidth(w); }, []);

  const reset = () => {
    cleanup();
    gameEndedRef.current = false;
    myDeadRef.current = false;
    partnerDeadRef.current = false;
    localHpRef.current = BOSS_MAX_HP;
    pendingDmgRef.current = 0;
    setMatch(null);
    setBossHp(BOSS_MAX_HP);
    setMyDamage(0);
    setPartnerDamage(0);
    setPartnerX(null);
    setPartnerDead(false);
    setInviteCode('');
    setGamePhase('lobby');
  };

  // ── PLAYING ──
  if (gamePhase === 'playing' && match?.started_at) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#03000f] overflow-hidden touch-none">
        {/* Back button */}
        <div className="absolute top-4 left-4 z-20">
          <button onClick={() => { endGame('defeat'); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-white/30 hover:text-white/60 hover:bg-white/10 text-xs font-bold transition-all">
            <ChevronLeft className="w-3.5 h-3.5" /> Aufgeben
          </button>
        </div>
        <BossRaidGame
          matchSeed={seedFromString(match.id || '')}
          bossHp={bossHp}
          bossMaxHp={BOSS_MAX_HP}
          partnerX={partnerX}
          partnerSkin={partnerSkin}
          mySkin={getMySkin()}
          myName={user?.username || 'Du'}
          partnerName={isPlayer1 ? (match.player2_name || 'Partner') : (match.player1_name || 'Partner')}
          onBossHit={onBossHit}
          onPlayerDie={onPlayerDie}
          onPositionUpdate={onPositionUpdate}
          onCanvasSize={onCanvasSize}
          partnerHitSignal={partnerHitSignal}
        />
        {/* Live damage scoreboard */}
        <div className="absolute bottom-2 right-3 z-10 flex flex-col items-end gap-0.5 pointer-events-none">
          <div className="text-[9px] text-white/25 uppercase tracking-widest mb-0.5">Schaden</div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-cyan-400">{myDamage.toLocaleString()}</span>
            <span className="text-white/20 text-xs">Du</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-black ${partnerDead ? 'text-white/20 line-through' : 'text-violet-400'}`}>
              {partnerDamage > 0 ? partnerDamage.toLocaleString() : '---'}
            </span>
            <span className="text-white/20 text-xs">
              {isPlayer1 ? (match.player2_name || 'Partner') : (match.player1_name || 'Partner')}
              {partnerDead ? ' 💀' : ''}
            </span>
          </div>
        </div>
        {/* Partner died notification */}
        {partnerDead && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <div className="px-4 py-2 rounded-xl text-xs font-black text-red-300 bg-red-900/40 border border-red-500/30">
              💀 Partner gefallen – Halte durch!
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden text-white font-sans"
      style={{ background: 'linear-gradient(160deg, #030010 0%, #0a0025 50%, #030010 100%)' }}>

      <div className="absolute top-6 left-6 z-20">
        <Link to={createPageUrl('NeonDash')}>
          <button className="flex items-center gap-1 px-4 py-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 text-sm font-bold transition-all">
            <ChevronLeft className="w-4 h-4" /> Neon Dash
          </button>
        </Link>
      </div>

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: 'linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.5) 0%, transparent 70%)' }} />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <AnimatePresence mode="wait">

          {/* LOBBY */}
          {gamePhase === 'lobby' && (
            <motion.div key="lobby" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm">
              <div className="text-center mb-8">
                <motion.div
                  animate={{ scale: [1, 1.06, 1], boxShadow: ['0 0 40px rgba(139,92,246,0.4)', '0 0 70px rgba(139,92,246,0.7)', '0 0 40px rgba(139,92,246,0.4)'] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="w-24 h-24 mx-auto mb-5 rounded-3xl flex items-center justify-center text-5xl"
                  style={{ background: 'linear-gradient(135deg, #4c1d95, #7c3aed)' }}>
                  👾
                </motion.div>
                <h1 className="text-4xl font-black mb-1"
                  style={{ background: 'linear-gradient(90deg, #c084fc, #ffffff, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  BOSS RAID
                </h1>
                <p className="text-white/35 text-sm tracking-widest uppercase mb-1">2 Spieler vs VOID TITAN</p>
                <p className="text-violet-300/40 text-xs">Koop · Gemeinsam den Boss besiegen</p>
              </div>

              {/* Kurzanleitung */}
              <div className="mb-5 p-4 rounded-2xl border border-violet-500/15 bg-violet-500/5 text-left">
                <p className="text-violet-300/70 text-[10px] uppercase tracking-widest font-black mb-2.5">So geht's</p>
                <div className="space-y-1.5 text-xs text-white/50">
                  <div className="flex items-start gap-2"><span>🖱️</span><span>Maus/Finger = dein Schiff bewegen</span></div>
                  <div className="flex items-start gap-2"><span>⚡</span><span>Energie-Orbs einsammeln → automatisch auf den Boss schießen</span></div>
                  <div className="flex items-start gap-2"><span>🛡️</span><span>Nur treffen wenn der Boss-Schild offen ist (blinkt rot)</span></div>
                  <div className="flex items-start gap-2"><span>❤️</span><span>5 Leben – werde vom Boss getroffen → Leben verloren</span></div>
                  <div className="flex items-start gap-2"><span>🏆</span><span>Boss-HP auf 0 bringen → <span className="text-yellow-400 font-bold">50.000 Tokens + VOID TITAN Frame</span></span></div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <button onClick={findOrCreate} disabled={loading}
                  className="w-full py-4 rounded-2xl font-black text-white text-base flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #6d28d9, #4f46e5)', boxShadow: '0 4px 30px rgba(109,40,217,0.4)' }}>
                  {loading
                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Users className="w-5 h-5" />}
                  {loading ? 'Suche Mitspieler...' : 'Schnell-Match starten'}
                </button>

                <div className="relative flex items-center gap-2">
                  <div className="flex-1 h-px bg-white/8" />
                  <span className="text-white/20 text-[10px] font-bold uppercase tracking-wider">oder mit Code</span>
                  <div className="flex-1 h-px bg-white/8" />
                </div>

                <div className="flex gap-2">
                  <input value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="CODE EINGEBEN" maxLength={6}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-black tracking-widest text-center placeholder:text-white/20 focus:outline-none focus:border-violet-500/50" />
                  <button onClick={joinWithCode} disabled={loading || inviteCode.length < 5}
                    className="px-5 py-3 rounded-xl font-black text-sm bg-violet-600/20 border border-violet-500/30 text-violet-300 disabled:opacity-30 hover:bg-violet-600/40 transition-all">
                    Beitreten
                  </button>
                </div>
                <p className="text-white/20 text-[10px] text-center">Raum-Code von einem Freund erhalten? Hier eingeben.</p>
              </div>
            </motion.div>
          )}

          {/* WAITING */}
          {gamePhase === 'waiting' && (
            <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center w-full max-w-sm">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                className="w-20 h-20 mx-auto mb-5 rounded-3xl flex items-center justify-center"
                style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>
                <Wifi className="w-10 h-10 text-violet-400" />
              </motion.div>
              <h2 className="text-2xl font-black text-white mb-2">Warte auf Partner...</h2>
              {match?.invite_code && isPlayer1 && (
                <div className="mb-5">
                  <p className="text-white/35 text-xs mb-2 uppercase tracking-widest">Einladungscode</p>
                  <motion.div
                    animate={{ boxShadow: ['0 0 20px rgba(139,92,246,0.15)', '0 0 40px rgba(139,92,246,0.35)', '0 0 20px rgba(139,92,246,0.15)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-block px-8 py-3 rounded-2xl text-3xl font-black text-violet-300 tracking-[0.3em] cursor-pointer"
                    style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)' }}
                    onClick={() => { navigator.clipboard?.writeText(match.invite_code); toast.success('Code kopiert!'); }}>
                    {match.invite_code}
                  </motion.div>
                  <p className="text-white/20 text-[10px] mt-2">Antippen zum Kopieren</p>
                </div>
              )}
              <div className="flex items-center justify-center gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                  <span className="text-white/70 text-sm font-bold">{match?.player1_name || '...'}</span>
                </div>
                <span className="text-white/20 font-black text-lg">⚔</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold transition-colors ${match?.player2_id ? 'text-white/70' : 'text-white/25'}`}>
                    {match?.player2_name || 'Wartet...'}
                  </span>
                  <motion.div
                    animate={match?.player2_id ? {} : { opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className={`w-2.5 h-2.5 rounded-full ${match?.player2_id ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]' : 'bg-white/15'}`} />
                </div>
              </div>
              {match?.player2_id && (
                <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  className="text-green-400 text-xs font-bold mb-4">
                  ✓ Partner gefunden! Starte...
                </motion.p>
              )}
              <button onClick={reset} className="mt-6 text-white/25 text-xs hover:text-white/50 transition-colors">Abbrechen</button>
            </motion.div>
          )}

          {/* COUNTDOWN */}
          {gamePhase === 'countdown' && (
            <motion.div key="countdown" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center">
              <p className="text-white/30 text-sm font-bold tracking-widest uppercase mb-4">VOID TITAN erwacht...</p>
              <AnimatePresence mode="wait">
                <motion.div key={countdown} initial={{ scale: 2.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.3, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="text-[10rem] font-black leading-none"
                  style={{
                    color: countdown > 1 ? '#c084fc' : '#f43f5e',
                    textShadow: `0 0 80px ${countdown > 1 ? '#a855f7' : '#ef4444'}, 0 0 160px ${countdown > 1 ? '#a855f740' : '#ef444440'}`
                  }}>
                  {countdown > 0 ? countdown : '!'}
                </motion.div>
              </AnimatePresence>
              {countdown <= 0 && (
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-black text-white mt-2">ANGRIFF!</motion.p>
              )}
            </motion.div>
          )}

          {/* VICTORY */}
          {gamePhase === 'victory' && (
            <motion.div key="victory" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="text-center w-full max-w-sm">
              <motion.div animate={{ rotate: [0, -12, 12, -6, 0], scale: [1, 1.2, 1] }} transition={{ duration: 0.75, delay: 0.15 }}
                className="text-8xl mb-3">🏆</motion.div>
              <h2 className="text-6xl font-black mb-1"
                style={{ background: 'linear-gradient(90deg, #fde68a, #fbbf24, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: 'none' }}>
                SIEG!
              </h2>
              {isMVP && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="inline-block px-4 py-1 rounded-full text-sm font-black mb-3"
                  style={{ background: 'linear-gradient(90deg,#f59e0b,#f97316)', color: '#fff' }}>
                  ⚔ MVP
                </motion.div>
              )}
              <p className="text-white/45 mb-4 text-sm">Der VOID TITAN wurde vernichtet!</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-4 rounded-2xl border border-cyan-500/25 bg-cyan-500/8">
                  <div className="text-white/35 text-xs mb-1">Dein Schaden</div>
                  <div className="text-2xl font-black text-cyan-400">{myDamage.toLocaleString()}</div>
                </div>
                <div className="p-4 rounded-2xl border border-violet-500/25 bg-violet-500/8">
                  <div className="text-white/35 text-xs mb-1">Partner</div>
                  <div className="text-2xl font-black text-violet-400">{partnerDamage.toLocaleString()}</div>
                </div>
              </div>
              {(myDamage + partnerDamage) > 0 && (
                <div className="mb-4">
                  <div className="h-2.5 rounded-full overflow-hidden flex mb-1">
                    <div className="bg-cyan-400 h-full transition-all" style={{ width: `${(myDamage / (myDamage + partnerDamage)) * 100}%` }} />
                    <div className="bg-violet-400 h-full flex-1" />
                  </div>
                  <div className="flex justify-between text-[10px] text-white/30">
                    <span>Du {Math.round((myDamage / (myDamage + partnerDamage)) * 100)}%</span>
                    <span>{Math.round((partnerDamage / (myDamage + partnerDamage)) * 100)}% Partner</span>
                  </div>
                </div>
              )}
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.55 }}
                className="p-4 rounded-2xl mb-3"
                style={{ background: 'linear-gradient(135deg, rgba(234,179,8,0.14), rgba(249,115,22,0.10))', border: '1px solid rgba(234,179,8,0.35)' }}>
                <div className="text-yellow-300/60 text-xs uppercase tracking-widest mb-1">Belohnung</div>
                <div className="text-yellow-400 font-black text-3xl">+{earnedTokens.toLocaleString()} Tokens 🪙</div>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}
                className="p-4 rounded-2xl mb-5 flex items-center gap-4"
                style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(6,182,212,0.10))', border: '1px solid rgba(139,92,246,0.5)' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #4c1d95, #0c4a6e)', boxShadow: '0 0 20px rgba(139,92,246,0.6)' }}>
                  👾
                </div>
                <div className="text-left">
                  <div className="text-violet-300/70 text-[10px] uppercase tracking-widest mb-0.5">Exklusiver Frame</div>
                  <div className="text-white font-black text-base">VOID TITAN</div>
                  <div className="text-violet-400/70 text-xs">Nur für Boss-Raid Sieger ✦</div>
                </div>
              </motion.div>
              <div className="flex gap-3">
                <button onClick={findOrCreate} className="flex-1 py-4 rounded-2xl font-black text-white transition-all active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #6d28d9, #4f46e5)', boxShadow: '0 4px 20px rgba(109,40,217,0.4)' }}>Nochmal</button>
                <button onClick={reset} className="flex-1 py-4 rounded-2xl font-black text-white/50 border border-white/10 hover:border-white/25 transition-all">Menü</button>
              </div>
            </motion.div>
          )}

          {/* DEFEAT */}
          {gamePhase === 'defeat' && (
            <motion.div key="defeat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center w-full max-w-sm">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }}
                className="text-8xl mb-4">💀</motion.div>
              <h2 className="text-5xl font-black text-red-400 mb-2">NIEDERLAGE</h2>
              <p className="text-white/35 mb-2">Der VOID TITAN war zu mächtig...</p>
              <p className="text-white/20 text-sm mb-4">
                Boss-HP verblieben: {Math.ceil(bossHp).toLocaleString()} / {BOSS_MAX_HP.toLocaleString()}
              </p>
              <div className="h-2 bg-white/5 rounded-full mb-2 overflow-hidden">
                <div className="h-full bg-red-600 rounded-full transition-all" style={{ width: `${(bossHp / BOSS_MAX_HP) * 100}%` }} />
              </div>
              <p className="text-white/15 text-xs mb-6">{Math.round((1 - bossHp / BOSS_MAX_HP) * 100)}% Schaden verursacht</p>
              <div className="flex gap-3">
                <button onClick={findOrCreate} className="flex-1 py-4 rounded-2xl font-black text-red-300 border border-red-500/30 hover:bg-red-500/10 transition-all active:scale-95">Revenge</button>
                <button onClick={reset} className="flex-1 py-4 rounded-2xl font-black text-white/50 border border-white/10 hover:border-white/25 transition-all">Menü</button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}