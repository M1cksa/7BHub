import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { RotateCcw, Home, Loader2 } from 'lucide-react';

export default function NeonDashOnlineResult({
  myScore, opponentScore: initialOpScore, opponentName,
  matchId, isPlayer1, tokensEarned, weekendBoostActive,
  onMenu, onRematch
}) {
  const [opponentScore, setOpponentScore] = useState(initialOpScore || 0);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    if (!matchId) { setResolved(true); return; }
    let attempts = 0;
    const poll = setInterval(async () => {
      attempts++;
      try {
        const matches = await base44.entities.NeonDashMatch.filter({ id: matchId }, '', 1);
        const m = matches?.[0];
        if (!m) { clearInterval(poll); setResolved(true); return; }
        const oppScore = isPlayer1 ? (m.player2_score || 0) : (m.player1_score || 0);
        const oppReady = isPlayer1 ? m.player2_ready : m.player1_ready;
        setOpponentScore(oppScore);
        if (oppReady || attempts >= 15) {
          clearInterval(poll);
          setResolved(true);
          base44.entities.NeonDashMatch.update(matchId, { status: 'finished' }).catch(() => {});
        }
      } catch(e) { clearInterval(poll); setResolved(true); }
    }, 2000);
    return () => clearInterval(poll);
  }, [matchId]);

  const iWin = myScore > opponentScore;
  const isDraw = myScore === opponentScore;

  return (
    <motion.div key="online_result"
      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', bounce: 0.35 }}
      className="pointer-events-auto bg-black/88 backdrop-blur-2xl p-8 rounded-3xl text-center w-[90%] max-w-sm"
      style={{
        border: `1px solid ${iWin ? 'rgba(250,204,21,0.35)' : isDraw ? 'rgba(255,255,255,0.15)' : 'rgba(244,63,94,0.3)'}`,
        boxShadow: iWin ? '0 0 60px rgba(250,204,21,0.18)' : isDraw ? 'none' : '0 0 60px rgba(244,63,94,0.15)',
      }}>

      {!resolved ? (
        <div className="py-8 flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-white/50 text-sm">Warte auf <span className="text-white/80 font-bold">{opponentName}</span>...</p>
        </div>
      ) : (
        <>
          <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
            className="text-7xl mb-3">
            {iWin ? '🏆' : isDraw ? '🤝' : '💀'}
          </motion.div>
          <h2 className="text-4xl font-black mb-1"
            style={{ color: iWin ? '#facc15' : isDraw ? '#ffffff' : '#f43f5e', textShadow: iWin ? '0 0 25px rgba(250,204,21,0.5)' : 'none' }}>
            {iWin ? 'GEWONNEN!' : isDraw ? 'UNENTSCHIEDEN' : 'VERLOREN!'}
          </h2>
          <p className="text-white/30 text-xs mb-6 uppercase tracking-widest font-bold">1v1 Online Match</p>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="rounded-2xl p-4" style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}>
              <p className="text-cyan-400/60 text-xs font-bold uppercase tracking-wider mb-1">Du</p>
              <p className="text-3xl font-black text-white">{myScore.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-white/35 text-xs font-bold uppercase tracking-wider mb-1 truncate">{opponentName}</p>
              <p className="text-3xl font-black text-white/70">{opponentScore.toLocaleString()}</p>
            </div>
          </div>

          {tokensEarned > 0 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5, delay: 0.3 }}
              className="rounded-2xl p-3 mb-5"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <p className="text-green-400 font-black">+{tokensEarned.toLocaleString()} Tokens! 💰</p>
              {iWin && <p className="text-green-400/50 text-xs mt-0.5">Sieg! Gut gemacht 🎯</p>}
              {weekendBoostActive && <p className="text-yellow-400/70 text-xs mt-0.5">🎉 2× Wochenend-Boost inbegriffen</p>}
            </motion.div>
          )}
        </>
      )}

      <div className="flex flex-col gap-3 mt-2">
        <Button onClick={onRematch}
          className="w-full font-black py-6 rounded-2xl border-none text-white"
          style={{ background: 'linear-gradient(135deg, #0e7490, #1e40af)', boxShadow: '0 4px 20px rgba(6,182,212,0.25)' }}>
          <RotateCcw className="w-5 h-5 mr-2" /> Neues Match
        </Button>
        <Button onClick={onMenu} variant="ghost" className="w-full text-white/40 hover:text-white rounded-2xl">
          <Home className="w-4 h-4 mr-2" /> Hauptmenü
        </Button>
      </div>
    </motion.div>
  );
}