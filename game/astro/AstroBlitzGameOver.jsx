import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, RefreshCw, Home, Swords, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AstroBlitzGameOver({ score, wave, highScore, tokensEarned, mode, oppScore, oppName, user, onMenu, onRestart, onRematch }) {
  const isNewHighScore = score > highScore;
  const versusWin = mode === 'versus' && score >= oppScore;
  const scoreDiff = Math.abs(score - oppScore);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-20 flex items-center justify-center px-4"
      style={{ background: 'rgba(3,2,15,0.92)', backdropFilter: 'blur(12px)' }}>

      <motion.div initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', bounce: 0.4 }}
        className="w-full max-w-sm rounded-3xl p-7 text-center"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 0 60px rgba(6,182,212,0.15)' }}>

        {/* Icon / title */}
        {mode === 'versus' ? (
          <>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
              className="text-6xl mb-2">{versusWin ? '🏆' : '💀'}</motion.div>
            <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-3xl font-black mb-1"
              style={{ color: versusWin ? '#fbbf24' : '#f43f5e' }}>
              {versusWin ? 'SIEG!' : 'NIEDERLAGE'}
            </motion.h2>
            <p className="text-white/30 text-xs mb-4">{versusWin ? `Du gewinnst mit ${scoreDiff.toLocaleString()} Punkten Vorsprung!` : `Nur ${scoreDiff.toLocaleString()} Punkte gefehlt...`}</p>
            <div className="rounded-2xl p-4 mb-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-left">
                  <div className={`text-2xl font-black ${versusWin ? 'text-yellow-400' : 'text-white'}`}>{score.toLocaleString()}</div>
                  <div className="text-xs text-white/40 font-bold">{user?.username || 'Du'} {versusWin ? '👑' : ''}</div>
                </div>
                <div className="text-white/20 font-black text-sm">VS</div>
                <div className="text-right">
                  <div className={`text-2xl font-black ${!versusWin ? 'text-yellow-400' : 'text-white/60'}`}>{oppScore.toLocaleString()}</div>
                  <div className="text-xs text-white/40 font-bold">{oppName || 'Gegner'} {!versusWin ? '👑' : ''}</div>
                </div>
              </div>
              {/* Score bar */}
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${Math.max(5, Math.min(95, (score / Math.max(score + oppScore, 1)) * 100))}%`,
                    background: versusWin ? 'linear-gradient(90deg, #fbbf24, #f97316)' : 'linear-gradient(90deg, #06b6d4, #7c3aed)' }} />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="text-5xl mb-2">💥</div>
            <h2 className="text-3xl font-black mb-1 text-white">GAME OVER</h2>
            {isNewHighScore && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring', bounce: 0.6 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black mb-3"
                style={{ background: 'rgba(251,191,36,0.2)', border: '1px solid rgba(251,191,36,0.5)', color: '#fbbf24' }}>
                <Star className="w-3 h-3" /> NEUER HIGHSCORE!
              </motion.div>
            )}
            <div className="mt-3 mb-2">
              <div className="text-4xl font-black text-white">{score.toLocaleString()}</div>
              <div className="text-white/40 text-sm mt-1">Welle {wave} erreicht</div>
            </div>
          </>
        )}

        {/* Token reward */}
        <div className="rounded-2xl p-4 mb-5"
          style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }}>
          <div className="text-2xl font-black text-yellow-400">+{tokensEarned.toLocaleString()}</div>
          <div className="text-yellow-200/50 text-xs font-bold uppercase tracking-widest">Tokens verdient</div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          {mode === 'versus' && onRematch && (
            <Button onClick={onRematch} className="w-full h-11 font-black"
              style={{ background: 'linear-gradient(135deg, #ec4899, #7c3aed)', border: 'none' }}>
              <Users className="w-4 h-4 mr-2" /> Neues Match
            </Button>
          )}
          <Button onClick={onRestart} className="w-full h-11 font-black"
            style={{ background: mode === 'versus' ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #06b6d4, #7c3aed)', border: mode === 'versus' ? '1px solid rgba(255,255,255,0.15)' : 'none' }}>
            <RefreshCw className="w-4 h-4 mr-2" /> {mode === 'versus' ? 'Solo spielen' : 'Nochmal'}
          </Button>
          <Button variant="outline" onClick={onMenu} className="w-full h-11 border-white/15 text-white/70 hover:text-white">
            <Home className="w-4 h-4 mr-2" /> Hauptmenü
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}