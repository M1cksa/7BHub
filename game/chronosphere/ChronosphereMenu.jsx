import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, Trophy, Zap } from 'lucide-react';

export default function ChronosphereMenu({ highScore, user, weekendBoost, onStart }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="pointer-events-auto flex flex-col items-center text-center px-6 max-w-sm w-full"
    >
      <div
        className="w-full rounded-3xl p-8 relative overflow-hidden"
        style={{ background: 'rgba(5,15,40,0.9)', border: '1px solid rgba(0,150,255,0.3)', backdropFilter: 'blur(20px)', boxShadow: '0 0 60px rgba(0,100,255,0.15)' }}
      >
        <motion.div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, #00aaff, #00ffcc, transparent)' }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
        />

        <div className="text-5xl mb-3">🌍</div>

        <h1 className="text-4xl font-black mb-1"
          style={{ background: 'linear-gradient(135deg, #60a5fa, #00ffcc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          CHRONO<br />SPHERE
        </h1>
        <p className="text-white/30 text-xs uppercase tracking-[0.3em] font-bold mb-5">
          Planet Defender
        </p>

        <div className="flex items-center justify-center gap-3 mb-5">
          {highScore > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-yellow-400/20 bg-yellow-400/5">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-yellow-400 font-black text-sm">{highScore.toLocaleString()}</span>
            </div>
          )}
          {weekendBoost && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-orange-400/20 bg-orange-400/5">
              <Zap className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-orange-400 font-black text-xs">2× WEEKEND</span>
            </div>
          )}
        </div>

        <div className="mb-6 rounded-2xl p-4 text-left space-y-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-white/40 text-xs font-black uppercase tracking-widest mb-3">So geht's</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-white/55">
            <div className="flex items-start gap-2"><span>🚀</span><span>Schiff kreist um den Planeten</span></div>
            <div className="flex items-start gap-2"><span>☄️</span><span>Meteore schießen oder ausweichen</span></div>
            <div className="flex items-start gap-2"><span>💎</span><span>Kristalle auf dem Planeten sammeln</span></div>
            <div className="flex items-start gap-2"><span>🛡</span><span>Power-Ups einsammeln</span></div>
            <div className="flex items-start gap-2"><span>🛸</span><span>Wingman-Power-Up: 1–2 Begleitschiffe</span></div>
            <div className="flex items-start gap-2"><span>🔫</span><span>Geschütz-Power-Up: Auto-Abwehr Turm</span></div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5 text-xs text-white/35">
            <div>⬡ <strong className="text-white/50">5.000 Pkt</strong> = Dual Cannon &nbsp;·&nbsp; <strong className="text-white/50">15.000 Pkt</strong> = Triple Spread</div>
            <div>⌨️ <strong className="text-white/50">← →</strong> Bewegen &nbsp;·&nbsp; <strong className="text-white/50">B</strong> Bombe</div>
            <div>📱 Links/Rechts tippen = Bewegen</div>
          </div>
        </div>

        <Button
          onClick={onStart}
          className="w-full h-14 text-lg font-black rounded-2xl border-0"
          style={{ background: 'linear-gradient(135deg, #1d4ed8, #0891b2)', boxShadow: '0 0 30px rgba(0,150,255,0.4)' }}
        >
          <Play className="w-5 h-5 mr-2 fill-white" />
          PLANETEN VERTEIDIGEN
        </Button>
      </div>
    </motion.div>
  );
}