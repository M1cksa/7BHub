import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Shuffle, Users, Hash, ChevronLeft, Copy } from 'lucide-react';

export default function NeonDashOnlineLobby({ user, onStart, onCancel }) {
  const [screen, setScreen] = useState('mode_select');
  const [matchType, setMatchType] = useState('versus');
  const [opponentName, setOpponentName] = useState('');
  const [countdown, setCountdown] = useState(3);
  const [searchTime, setSearchTime] = useState(0);
  const [inviteCode, setInviteCode] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');

  const cancelledRef = useRef(false);
  const countdownStartedRef = useRef(false);
  const matchIdRef = useRef(null);
  const isPlayer1Ref = useRef(false);
  const matchTypeRef = useRef('versus');
  const pollRef = useRef(null);
  const subRef = useRef(null);
  const timerRef = useRef(null);

  const runCountdown = (matchId, isP1, oppName, isCoop) => {
    if (countdownStartedRef.current) return;
    countdownStartedRef.current = true;
    setOpponentName(oppName);
    setScreen('found');
    setTimeout(() => {
      if (cancelledRef.current) return;
      setScreen('countdown');
      setCountdown(3);
      let count = 3;
      const cd = setInterval(() => {
        count--;
        setCountdown(count);
        if (count <= 0) {
          clearInterval(cd);
          setTimeout(() => {
            if (!cancelledRef.current) onStart(matchId, isP1, oppName, isCoop);
          }, 500);
        }
      }, 1000);
    }, 800);
  };

  const doAutoSearch = async (type) => {
    if (!user) { onCancel(); return; }
    matchTypeRef.current = type;
    try {
      // Look for open matches of the same type (no invite code)
      const waiting = await base44.entities.NeonDashMatch.filter({ status: 'waiting', match_type: type }, '-created_date', 20);
      const joinable = (waiting || []).filter(m => m.player1_id !== user.id && !m.invite_code);

      if (cancelledRef.current) return;

      if (joinable.length > 0) {
        const match = joinable[0];
        await base44.entities.NeonDashMatch.update(match.id, {
          player2_id: user.id,
          player2_name: user.username || 'Spieler 2',
          status: 'active',
          started_at: new Date().toISOString(),
        });
        if (cancelledRef.current) return;
        matchIdRef.current = match.id;
        isPlayer1Ref.current = false;
        runCountdown(match.id, false, match.player1_name || 'Gegner', type === 'coop');
      } else {
        const newMatch = await base44.entities.NeonDashMatch.create({
          player1_id: user.id,
          player1_name: user.username || 'Spieler',
          status: 'waiting',
          mode: 'ranked',
          match_type: type,
          shared_lives: type === 'coop' ? 3 : 0,
        });
        if (cancelledRef.current) {
          base44.entities.NeonDashMatch.update(newMatch.id, { status: 'finished' }).catch(() => {});
          return;
        }
        matchIdRef.current = newMatch.id;
        isPlayer1Ref.current = true;

        subRef.current = base44.entities.NeonDashMatch.subscribe((event) => {
          if (cancelledRef.current || countdownStartedRef.current) return;
          if (event.id !== newMatch.id) return;
          const m = event.data;
          if (m?.status === 'active' && m.player2_id && m.started_at) {
            if (subRef.current) { subRef.current(); subRef.current = null; }
            runCountdown(newMatch.id, true, m.player2_name || 'Gegner', type === 'coop');
          }
        });

        setTimeout(() => {
          if (!cancelledRef.current && !countdownStartedRef.current) {
            if (subRef.current) { subRef.current(); subRef.current = null; }
            base44.entities.NeonDashMatch.update(newMatch.id, { status: 'finished' }).catch(() => {});
            onCancel();
          }
        }, 90000);
      }
    } catch(e) {
      if (!cancelledRef.current) onCancel();
    }
  };

  const createInviteRoom = async (type) => {
    if (!user) { onCancel(); return; }
    matchTypeRef.current = type;
    setMatchType(type);
    try {
      const newMatch = await base44.entities.NeonDashMatch.create({
        player1_id: user.id,
        player1_name: user.username || 'Spieler',
        status: 'waiting',
        mode: 'casual',
        match_type: type,
        shared_lives: type === 'coop' ? 3 : 0,
        invite_code: 'pending',
      });
      const code = newMatch.id.slice(0, 6).toUpperCase();
      await base44.entities.NeonDashMatch.update(newMatch.id, { invite_code: code });

      if (cancelledRef.current) {
        base44.entities.NeonDashMatch.update(newMatch.id, { status: 'finished' }).catch(() => {});
        return;
      }
      matchIdRef.current = newMatch.id;
      isPlayer1Ref.current = true;
      setInviteCode(code);
      setScreen('invite_create');

      subRef.current = base44.entities.NeonDashMatch.subscribe((event) => {
        if (cancelledRef.current || countdownStartedRef.current) return;
        if (event.id !== newMatch.id) return;
        const m = event.data;
        if (m?.status === 'active' && m.player2_id && m.started_at) {
          if (subRef.current) { subRef.current(); subRef.current = null; }
          runCountdown(newMatch.id, true, m.player2_name || 'Gast', type === 'coop');
        }
      });

      setTimeout(() => {
        if (!cancelledRef.current && !countdownStartedRef.current) {
          if (subRef.current) { subRef.current(); subRef.current = null; }
          base44.entities.NeonDashMatch.update(newMatch.id, { status: 'finished' }).catch(() => {});
          onCancel();
        }
      }, 300000);
    } catch(e) {
      if (!cancelledRef.current) onCancel();
    }
  };

  const joinByCode = async () => {
    if (codeInput.length < 6) { setCodeError('Code muss 6 Zeichen lang sein'); return; }
    setCodeError('');
    const code = codeInput.toUpperCase();
    try {
      const matches = await base44.entities.NeonDashMatch.filter({ invite_code: code, status: 'waiting' }, '', 5);
      const match = (matches || []).find(m => m.player1_id !== user?.id);
      if (!match) { setCodeError('Kein offener Raum mit diesem Code gefunden'); return; }
      await base44.entities.NeonDashMatch.update(match.id, {
        player2_id: user.id,
        player2_name: user?.username || 'Gast',
        status: 'active',
        started_at: new Date().toISOString(),
      });
      matchIdRef.current = match.id;
      isPlayer1Ref.current = false;
      const isCoop = match.match_type === 'coop';
      setMatchType(match.match_type || 'versus');
      runCountdown(match.id, false, match.player1_name || 'Host', isCoop);
    } catch(e) {
      setCodeError('Fehler beim Beitreten. Bitte versuche es erneut.');
    }
  };

  // Start searching when screen switches to 'searching'
  useEffect(() => {
    if (screen === 'searching') {
      doAutoSearch(matchType);
      timerRef.current = setInterval(() => setSearchTime(t => t + 1), 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [screen]);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      clearInterval(pollRef.current);
      clearInterval(timerRef.current);
      if (subRef.current) { subRef.current(); subRef.current = null; }
      if (matchIdRef.current && isPlayer1Ref.current && !countdownStartedRef.current) {
        base44.entities.NeonDashMatch.update(matchIdRef.current, { status: 'finished' }).catch(() => {});
      }
    };
  }, []);

  const isCoop = matchType === 'coop';

  // ── MODE SELECT ──
  if (screen === 'mode_select') return (
    <motion.div key="mode_select" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="pointer-events-auto w-[92%] max-w-sm">
      <h2 className="text-2xl font-black text-center text-white mb-1">Online Modus</h2>
      <p className="text-white/30 text-xs text-center mb-5">Spiele gegen oder mit anderen Spielern</p>
      <div className="space-y-3 mb-5">
        <button onClick={() => { setMatchType('versus'); setScreen('versus_select'); }}
          className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all active:scale-95"
          style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.25)' }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: 'rgba(6,182,212,0.15)' }}>⚔️</div>
          <div className="flex-1">
            <p className="font-black text-white text-sm">1v1 Duell</p>
            <p className="text-white/40 text-xs mt-0.5">Ihr spielt gleichzeitig — wer mehr Punkte macht, gewinnt</p>
          </div>
        </button>
        <button onClick={() => { setMatchType('coop'); setScreen('coop_select'); }}
          className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all active:scale-95"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: 'rgba(34,197,94,0.15)' }}>🤝</div>
          <div className="flex-1">
            <p className="font-black text-white text-sm">Co-op</p>
            <p className="text-white/40 text-xs mt-0.5">3 geteilte Leben — verliert keiner ein Leben, überlebt ihr gemeinsam länger</p>
          </div>
        </button>
      </div>
      <Button onClick={onCancel} variant="ghost" size="sm" className="w-full text-white/25 hover:text-white/60 text-xs">Abbrechen</Button>
    </motion.div>
  );

  // ── VERSUS SELECT ──
  if (screen === 'versus_select') return (
    <motion.div key="versus_select" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
      className="pointer-events-auto w-[92%] max-w-sm">
      <button onClick={() => setScreen('mode_select')} className="flex items-center gap-1 text-white/40 hover:text-white/70 text-xs mb-4 transition-colors">
        <ChevronLeft className="w-3.5 h-3.5" /> Zurück
      </button>
      <h2 className="text-xl font-black text-white mb-1">⚔️ 1v1 Duell</h2>
      <p className="text-white/30 text-xs mb-5">Wer mehr Punkte macht, gewinnt</p>
      <div className="space-y-3 mb-4">
        <button onClick={() => { setMatchType('versus'); setScreen('searching'); }}
          className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all active:scale-95"
          style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}>
          <Shuffle className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          <div><p className="font-black text-white text-sm">Auto-Matchmaking</p><p className="text-white/35 text-xs">Zufälliger Gegner</p></div>
        </button>
        <button onClick={() => createInviteRoom('versus')}
          className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all active:scale-95"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Users className="w-5 h-5 text-white/50 flex-shrink-0" />
          <div><p className="font-black text-white text-sm">Raum erstellen</p><p className="text-white/35 text-xs">Lade einen Freund per Code ein</p></div>
        </button>
        <button onClick={() => { setMatchType('versus'); setScreen('invite_join'); }}
          className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all active:scale-95"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Hash className="w-5 h-5 text-white/50 flex-shrink-0" />
          <div><p className="font-black text-white text-sm">Mit Code beitreten</p><p className="text-white/35 text-xs">Tritt einem Freund-Match bei</p></div>
        </button>
      </div>
      <Button onClick={onCancel} variant="ghost" size="sm" className="w-full text-white/25 hover:text-white/60 text-xs">Abbrechen</Button>
    </motion.div>
  );

  // ── COOP SELECT ──
  if (screen === 'coop_select') return (
    <motion.div key="coop_select" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
      className="pointer-events-auto w-[92%] max-w-sm">
      <button onClick={() => setScreen('mode_select')} className="flex items-center gap-1 text-white/40 hover:text-white/70 text-xs mb-4 transition-colors">
        <ChevronLeft className="w-3.5 h-3.5" /> Zurück
      </button>
      <h2 className="text-xl font-black text-white mb-1">🤝 Co-op Modus</h2>
      <p className="text-white/30 text-xs mb-5">3 geteilte Leben — überlebt gemeinsam so lang wie möglich</p>
      <div className="space-y-3 mb-4">
        <button onClick={() => { setMatchType('coop'); setScreen('searching'); }}
          className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all active:scale-95"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <Shuffle className="w-5 h-5 text-green-400 flex-shrink-0" />
          <div><p className="font-black text-white text-sm">Auto-Matchmaking</p><p className="text-white/35 text-xs">Zufälliger Mitspieler</p></div>
        </button>
        <button onClick={() => createInviteRoom('coop')}
          className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all active:scale-95"
          style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)' }}>
          <Users className="w-5 h-5 text-green-400/60 flex-shrink-0" />
          <div><p className="font-black text-white text-sm">Raum erstellen</p><p className="text-white/35 text-xs">Gib einem Freund den Code</p></div>
        </button>
        <button onClick={() => { setMatchType('coop'); setScreen('invite_join'); }}
          className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all active:scale-95"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Hash className="w-5 h-5 text-white/50 flex-shrink-0" />
          <div><p className="font-black text-white text-sm">Mit Code beitreten</p><p className="text-white/35 text-xs">Tritt dem Co-op Raum deines Freundes bei</p></div>
        </button>
      </div>
      <Button onClick={onCancel} variant="ghost" size="sm" className="w-full text-white/25 hover:text-white/60 text-xs">Abbrechen</Button>
    </motion.div>
  );

  // ── INVITE CREATE (waiting with code) ──
  if (screen === 'invite_create') return (
    <motion.div key="invite_create" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="pointer-events-auto text-center w-[90%] max-w-sm">
      <div className="text-5xl mb-4">{isCoop ? '🤝' : '⚔️'}</div>
      <h2 className="text-xl font-black text-white mb-1">Raum erstellt!</h2>
      <p className="text-white/40 text-xs mb-6">{isCoop ? 'Teile den Code mit deinem Mitspieler' : 'Teile den Code mit deinem Gegner'}</p>
      <div className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl mb-6"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
        <span className="text-3xl font-black text-white tracking-[0.15em] font-mono">{inviteCode}</span>
        <button onClick={() => navigator.clipboard?.writeText(inviteCode)}
          className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white/70 transition-all">
          <Copy className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-center justify-center gap-2 mb-6">
        {[0,1,2].map(i => (
          <motion.span key={i} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.2, delay: i * 0.4, repeat: Infinity }}
            className="text-white/30 text-xl font-black">.</motion.span>
        ))}
        <span className="text-white/30 text-xs ml-1">Warte auf Spieler</span>
      </div>
      <Button onClick={() => { cancelledRef.current = true; onCancel(); }}
        variant="ghost" size="sm" className="text-white/25 hover:text-white/60 text-xs">Abbrechen</Button>
    </motion.div>
  );

  // ── INVITE JOIN (enter code) ──
  if (screen === 'invite_join') return (
    <motion.div key="invite_join" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="pointer-events-auto w-[90%] max-w-sm">
      <button onClick={() => setScreen(matchType === 'coop' ? 'coop_select' : 'versus_select')}
        className="flex items-center gap-1 text-white/40 hover:text-white/70 text-xs mb-5 transition-colors">
        <ChevronLeft className="w-3.5 h-3.5" /> Zurück
      </button>
      <h2 className="text-xl font-black text-white mb-1">Mit Code beitreten</h2>
      <p className="text-white/30 text-xs mb-5">Gib den 6-stelligen Einladungscode ein</p>
      <input
        type="text"
        value={codeInput}
        onChange={e => { setCodeInput(e.target.value.toUpperCase()); setCodeError(''); }}
        placeholder="ABC123"
        maxLength={6}
        className="w-full text-center text-2xl font-black font-mono tracking-[0.2em] py-4 rounded-2xl mb-3 outline-none"
        style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${codeInput.length === 6 ? 'rgba(6,182,212,0.5)' : 'rgba(255,255,255,0.12)'}`, color: 'white' }}
      />
      {codeError && <p className="text-red-400 text-xs mb-3 text-center">{codeError}</p>}
      <Button onClick={joinByCode} disabled={codeInput.length < 6}
        className="w-full py-6 rounded-2xl font-black border-none"
        style={{ background: codeInput.length >= 6 ? 'linear-gradient(135deg, #0e7490, #1e40af)' : 'rgba(255,255,255,0.05)', color: 'white' }}>
        Beitreten
      </Button>
      <Button onClick={() => { cancelledRef.current = true; onCancel(); }}
        variant="ghost" size="sm" className="w-full mt-3 text-white/25 hover:text-white/60 text-xs">Abbrechen</Button>
    </motion.div>
  );

  // ── FOUND ──
  if (screen === 'found') return (
    <motion.div key="found" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="pointer-events-auto text-center w-[90%] max-w-sm">
      <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 0.5, repeat: 2 }}
        className="text-6xl mb-4">{isCoop ? '🤝' : '⚔️'}</motion.div>
      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="font-black text-2xl tracking-widest uppercase mb-1"
        style={{ color: isCoop ? '#22c55e' : '#06b6d4' }}>
        {isCoop ? 'Mitspieler gefunden!' : 'Gegner gefunden!'}
      </motion.p>
      <p className="text-white/50 text-sm">Verbindung wird hergestellt...</p>
    </motion.div>
  );

  // ── COUNTDOWN ──
  if (screen === 'countdown') return (
    <motion.div key="countdown" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="pointer-events-auto w-full h-full absolute inset-0 flex flex-col items-center justify-center">
      <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex items-center gap-6 mb-10">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2 text-2xl"
            style={{ background: isCoop ? 'linear-gradient(135deg,rgba(34,197,94,0.3),rgba(6,182,212,0.2))' : 'linear-gradient(135deg,rgba(6,182,212,0.3),rgba(124,58,237,0.2))', border: `1px solid ${isCoop ? 'rgba(34,197,94,0.4)' : 'rgba(6,182,212,0.4)'}` }}>
            🚀
          </div>
          <p className="font-bold text-xs truncate max-w-[80px]" style={{ color: isCoop ? '#22c55e' : '#06b6d4' }}>{user?.username || 'Du'}</p>
        </div>
        <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1, repeat: Infinity }}
          className="font-black text-2xl text-white/80"
          style={{ textShadow: `0 0 20px ${isCoop ? 'rgba(34,197,94,0.8)' : 'rgba(6,182,212,0.8)'}` }}>
          {isCoop ? '🤝' : 'VS'}
        </motion.div>
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2 text-2xl"
            style={{ background: isCoop ? 'linear-gradient(135deg,rgba(34,197,94,0.3),rgba(16,185,129,0.2))' : 'linear-gradient(135deg,rgba(244,63,94,0.3),rgba(249,115,22,0.2))', border: `1px solid ${isCoop ? 'rgba(34,197,94,0.4)' : 'rgba(244,63,94,0.4)'}` }}>
            {isCoop ? '🚀' : '👾'}
          </div>
          <p className="font-bold text-xs truncate max-w-[80px]" style={{ color: isCoop ? '#22c55e' : '#f87171' }}>{opponentName}</p>
        </div>
      </motion.div>
      <AnimatePresence mode="wait">
        <motion.div key={countdown} initial={{ scale: 2.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.3, opacity: 0 }}
          transition={{ duration: 0.35, type: 'spring', stiffness: 200 }}
          className="text-[120px] font-black leading-none select-none"
          style={{ color: isCoop ? '#22c55e' : '#06b6d4', textShadow: `0 0 60px ${isCoop ? 'rgba(34,197,94,0.9)' : 'rgba(6,182,212,0.9)'}, 0 0 120px rgba(34,197,94,0.3)` }}>
          {countdown > 0 ? countdown : 'GO!'}
        </motion.div>
      </AnimatePresence>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="text-white/30 text-xs mt-6 text-center">
        {isCoop ? '❤️❤️❤️ 3 geteilte Leben — überlebt zusammen so lang wie möglich' : '⚔️ Wer mehr Punkte macht, gewinnt'}
      </motion.p>
    </motion.div>
  );

  // ── SEARCHING ──
  return (
    <motion.div key="searching" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="pointer-events-auto text-center w-[90%] max-w-sm">
      <div className="relative w-24 h-24 mx-auto mb-6">
        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
        <div className="absolute inset-2 rounded-full border border-cyan-500/15" />
        <div className="absolute inset-4 rounded-full border border-cyan-500/10" />
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full"
          style={{ background: `conic-gradient(from 0deg, transparent 60%, ${matchType === 'coop' ? 'rgba(34,197,94,0.5)' : 'rgba(6,182,212,0.5)'} 100%)` }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl">{matchType === 'coop' ? '🤝' : '🎮'}</span>
        </div>
      </div>
      <h2 className="text-2xl font-black text-white mb-1">{matchType === 'coop' ? 'Mitspieler suchen' : 'Gegner suchen'}</h2>
      <div className="flex items-center justify-center gap-1 mb-6">
        {[0,1,2].map(i => (
          <motion.span key={i} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, delay: i * 0.3, repeat: Infinity }}
            className="text-xl font-black" style={{ color: matchType === 'coop' ? '#22c55e' : '#06b6d4' }}>.</motion.span>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 mb-1 text-white/30 text-xs">
        <span>⏱</span><span className="font-mono font-bold">{searchTime}s</span>
        <span>·</span><span>{matchType === 'coop' ? 'Co-op' : 'Ranked 1v1'}</span>
      </div>
      <div className="bg-white/4 border border-white/8 rounded-2xl px-4 py-3 mb-6 text-xs text-white/30 text-left space-y-1">
        {matchType === 'coop' ? (
          <>
            <div>🤝 Ihr spielt gleichzeitig, aber <span className="text-white/50 font-bold">teilt 3 Leben</span></div>
            <div>❌ Treffer = ein gemeinsames Leben verloren</div>
            <div>🏆 Ziel: so lang wie möglich gemeinsam überleben</div>
          </>
        ) : (
          <>
            <div>⚔️ Ihr spielt gleichzeitig, aber <span className="text-white/50 font-bold">getrennt</span></div>
            <div>📊 Punkte durch Ausweichen & Münzen sammeln</div>
            <div>🏆 Wer am Ende mehr Punkte hat, gewinnt</div>
          </>
        )}
      </div>
      <Button onClick={() => { cancelledRef.current = true; onCancel(); }}
        variant="ghost" size="sm" className="text-white/25 hover:text-white/60 text-xs">Abbrechen</Button>
    </motion.div>
  );
}