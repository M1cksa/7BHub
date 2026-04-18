import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RotateCcw, Home, Trophy, Zap, Globe } from 'lucide-react';

export default function ChronosphereGameOver({
  score, highScore, stats, tokensEarned, weekendBoost, onRestart, onMenu
}) {
  const isNewRecord = score >= highScore && score > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
      className="pointer-events-auto flex flex-col items-center text-center px-6 max-w-sm w-full"
    >
      <div
        className="w-full rounded-3xl p-8 relative overflow-hidden"
        style={{ background: 'rgba(5,10,30,0.9)', border: '1px solid rgba(0,150,255,0.3)', backdropFilter: 'blur(20px)', boxShadow: '0 0 60px rgba(0,80,200,0.2)' }}
      >
        <motion.div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, #00aaff, transparent)' }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />

        <div className="mb-5">
          {isNewRecord ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.6 }}>
              <div className="text-4xl mb-2">🏆</div>
              <h2 className="text-xl font-black text-yellow-400">Neuer Rekord!</h2>
            </motion.div>
          ) : (
            <div>
              <div className="text-4xl mb-2">💥</div>
              <h2 className="text-xl font-black text-white/50">Planet Gefallen</h2>
            </div>
          )}
        </div>

        {/* Score */}
        <div className="mb-5">
          <div className="text-5xl font-black text-blue-400 mb-1"
            style={{ textShadow: '0 0 20px rgba(0,150,255,0.6)' }}>
            {Math.floor(score).toLocaleString()}
          </div>
          <div className="text-xs text-white/30 uppercase tracking-widest font-bold">Punkte</div>
          {highScore > 0 && !isNewRecord && (
            <div className="flex items-center justify-center gap-1.5 mt-1.5 text-xs text-white/25">
              <Trophy className="w-3 h-3" /> Rekord: {highScore.toLocaleString()}
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-5 text-xs">
          {[
            { label: 'Welle', value: stats.wave || 1, icon: '🌊' },
            { label: 'Kristalle', value: stats.crystals || 0, icon: '💎' },
            { label: 'XP', value: `+${Math.floor(score / 5) + 60}`, icon: '⭐' },
          ].map(s => (
            <div key={s.label} className="rounded-xl px-2 py-2.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="text-base mb-0.5">{s.icon}</div>
              <div className="font-black text-white">{s.value}</div>
              <div className="text-white/30 text-[10px] uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tokens */}
        <div className="flex items-center gap-3 mb-6 px-4 py-3 rounded-2xl"
          style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)' }}>
          <span className="text-2xl">🪙</span>
          <div className="text-left">
            <div className="text-xl font-black text-yellow-400">+{tokensEarned.toLocaleString()}</div>
            <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
              Tokens{weekendBoost ? ' · 2× Weekend!' : ''}
            </div>
          </div>
          {weekendBoost && <Zap className="w-4 h-4 text-orange-400 ml-auto" />}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button onClick={onMenu} variant="outline" className="flex-1 h-12 rounded-xl border-white/10 text-white/50 font-bold">
            <Home className="w-4 h-4 mr-2" /> Menü
          </Button>
          <Button onClick={onRestart} className="flex-[2] h-12 rounded-xl border-0 font-black"
            style={{ background: 'linear-gradient(135deg, #1d4ed8, #0891b2)', boxShadow: '0 0 20px rgba(0,150,255,0.4)' }}>
            <RotateCcw className="w-4 h-4 mr-2" /> Nochmal
          </Button>
        </div>
      </div>
    </motion.div>
  );
}