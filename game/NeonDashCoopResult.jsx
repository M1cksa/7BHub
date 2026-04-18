import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RotateCcw, Home } from 'lucide-react';

export default function NeonDashCoopResult({
  myScore, opponentScore, opponentName, tokensEarned,
  weekendBoostActive, onMenu, onRematch
}) {
  const totalScore = (myScore || 0) + (opponentScore || 0);

  return (
    <motion.div key="coop_result"
      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', bounce: 0.35 }}
      className="pointer-events-auto bg-black/88 backdrop-blur-2xl p-8 rounded-3xl text-center w-[90%] max-w-sm"
      style={{ border: '1px solid rgba(34,197,94,0.25)', boxShadow: '0 0 60px rgba(34,197,94,0.12)' }}>

      <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
        className="text-7xl mb-3">🤝</motion.div>
      <h2 className="text-4xl font-black mb-1 text-white">CO-OP</h2>
      <p className="text-white/30 text-xs mb-4 uppercase tracking-widest font-bold">Gemeinsam gekämpft!</p>

      {/* Team Score */}
      <div className="px-4 py-3 rounded-2xl mb-4"
        style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
        <p className="text-green-400/60 text-xs font-bold uppercase tracking-wider mb-1">Team Score</p>
        <p className="text-4xl font-black text-white">{totalScore.toLocaleString()}</p>
      </div>

      {/* Individual scores */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="rounded-2xl p-3" style={{ background: 'rgba(6,182,212,0.07)', border: '1px solid rgba(6,182,212,0.15)' }}>
          <p className="text-cyan-400/60 text-[10px] font-bold uppercase mb-1">Du</p>
          <p className="text-xl font-black text-white">{(myScore || 0).toLocaleString()}</p>
        </div>
        <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-white/35 text-[10px] font-bold uppercase mb-1 truncate">{opponentName || 'Partner'}</p>
          <p className="text-xl font-black text-white/70">{(opponentScore || 0).toLocaleString()}</p>
        </div>
      </div>

      {tokensEarned > 0 && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5, delay: 0.3 }}
          className="rounded-2xl p-3 mb-4"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <p className="text-green-400 font-black">+{tokensEarned.toLocaleString()} Tokens! 💰</p>
          {weekendBoostActive && <p className="text-yellow-400/70 text-xs mt-0.5">🎉 2× Wochenend-Boost inbegriffen</p>}
        </motion.div>
      )}

      <div className="flex flex-col gap-3">
        <Button onClick={onRematch}
          className="w-full font-black py-6 rounded-2xl border-none text-white"
          style={{ background: 'linear-gradient(135deg, #059669, #0e7490)', boxShadow: '0 4px 20px rgba(34,197,94,0.25)' }}>
          <RotateCcw className="w-5 h-5 mr-2" /> Neues Co-op Match
        </Button>
        <Button onClick={onMenu} variant="ghost" className="w-full text-white/40 hover:text-white rounded-2xl">
          <Home className="w-4 h-4 mr-2" /> Hauptmenü
        </Button>
      </div>
    </motion.div>
  );
}