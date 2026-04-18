import { useState } from 'react';
import { Unlock, Zap, Sparkles, MonitorPlay, Gamepad2, Users, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UNLOCK_CODE = '313840';

export default function PlatformLockScreen({ lockData, onUnlocked }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const handleUnlock = () => {
    if (code === UNLOCK_CODE) {
      // Einmalzugriff: nur Session, keine DB-Änderung
      sessionStorage.setItem('preview_unlocked', 'true');
      onUnlocked();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setTimeout(() => setError(false), 2000);
      setCode('');
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center p-6 text-white overflow-hidden">
      {/* Animated orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />

        <motion.div
          className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)' }}
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 3 }} />

        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(#ef4444 1px, transparent 1px), linear-gradient(90deg, #ef4444 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center text-center max-w-lg w-full">

        {/* Logo / badge */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-8">

          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 rounded-2xl blur-2xl opacity-60"
            style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }} />
            <div className="relative px-6 py-3 rounded-2xl flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(249,115,22,0.2))', border: '1px solid rgba(239,68,68,0.4)' }}>

              <Zap className="w-6 h-6 text-red-400" />
              <span className="text-xl font-black tracking-tight text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(90deg, #ef4444, #fb923c)' }}>
                7B Hub
              </span>
              <span className="px-2 py-0.5 rounded-lg text-xs font-black text-white"
              style={{ background: 'linear-gradient(90deg, #ef4444, #f97316)' }}>
                Season 2
              </span>
            </div>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-4xl md:text-5xl font-black leading-tight mb-3">
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #f87171, #facc15)' }}>Vorbereitungen auf Season 2</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-orange-300 border border-orange-400/30"
          style={{ background: 'rgba(251,146,60,0.08)' }}>
            <motion.span
              className="w-2 h-2 rounded-full bg-orange-400 inline-block"
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }} />
            System-Update läuft
          </span>
        </motion.div>

        {/* Preview Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full mb-10 grid grid-cols-2 gap-3 text-left mt-6">

          {[
          { icon: Award, title: 'Battle Pass S2', desc: '100 neue Level' },
          { icon: Zap, title: 'Void Shards', desc: 'Neues Crafting System' },
          { icon: Gamepad2, title: 'Neon Dash', desc: 'Exklusive Raumschiffe' },
          { icon: Sparkles, title: 'Pokémon', desc: 'Story Mode Integration' },
          { icon: Users, title: 'Leaderboards', desc: 'Saisonale Ranglisten' },
          { icon: MonitorPlay, title: 'Videos & Streams', desc: 'Weiterhin verfügbar' }].
          map((feat, i) =>
          <div
            key={i}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 transition-all hover:bg-white/10 hover:border-red-500/30">

              <feat.icon className="w-5 h-5 text-red-400 mb-2" />
              <h3 className="text-white font-bold text-sm mb-1">{feat.title}</h3>
              <p className="text-white/40 text-xs">{feat.desc}</p>
            </div>
          )}
        </motion.div>

        {/* Animated dots */}
        <div className="flex gap-2 mb-12">
          {[0, 1, 2].map((i) =>
          <motion.div key={i}
          className="w-2 h-2 rounded-full bg-red-400"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }} />

          )}
        </div>

        {/* Dev access toggle */}
        <AnimatePresence>
          {!showInput ?
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowInput(true)}
            className="text-white/20 text-xs hover:text-white/40 transition-colors underline underline-offset-4">
              Zugang
            </motion.button> :

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="w-full max-w-xs">

              <motion.div animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}} transition={{ duration: 0.4 }}>
                <input
                autoFocus
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                placeholder="Code eingeben"
                maxLength={6}
                className={`w-full text-center text-xl font-mono tracking-widest rounded-2xl px-4 py-3 border outline-none transition-all mb-3 ${
                error ?
                'bg-red-500/10 border-red-500 text-red-400' :
                'bg-white/5 border-white/10 text-white focus:border-red-500/50'}`
                } />

                {error && <p className="text-red-400 text-xs text-center mb-3">Falscher Code</p>}
                <button
                onClick={handleUnlock}
                className="w-full py-3 rounded-2xl text-white font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}>
                  <Unlock className="w-4 h-4" />
                  Einmalzugriff
                </button>
              </motion.div>
            </motion.div>
          }
        </AnimatePresence>
      </motion.div>
    </div>
  );
}