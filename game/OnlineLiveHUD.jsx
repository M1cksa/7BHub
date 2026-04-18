import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function AnimatedScore({ value }) {
  const [display, setDisplay] = useState(value);
  const [flash, setFlash] = useState(false);
  const prevRef = useRef(value);

  useEffect(() => {
    if (value !== prevRef.current) {
      setFlash(true);
      prevRef.current = value;
      setTimeout(() => setFlash(false), 300);
    }
    setDisplay(value);
  }, [value]);

  return (
    <motion.span
      animate={flash ? { scale: [1, 1.18, 1] } : {}}
      transition={{ duration: 0.25 }}
      className="tabular-nums font-black"
    >
      {display.toLocaleString()}
    </motion.span>
  );
}

export default function OnlineLiveHUD({ myScore, oppScore, oppName, myName, isCoop, coopLives }) {
  const myLeading = myScore > oppScore;
  const diff = Math.abs(myScore - oppScore);
  const total = myScore + oppScore + 1;
  const myPct = Math.max(0.05, Math.min(0.95, myScore / total));

  if (isCoop) {
    return (
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center gap-1">
        <div
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl"
          style={{
            background: 'rgba(0,0,0,0.55)',
            border: '1px solid rgba(34,197,94,0.25)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {[0, 1, 2].map(i => (
            <motion.span
              key={i}
              animate={i < coopLives ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="text-lg leading-none"
            >
              {i < coopLives ? '❤️' : '🖤'}
            </motion.span>
          ))}
        </div>
        <span
          className="text-[9px] font-bold uppercase tracking-widest"
          style={{ color: coopLives > 1 ? 'rgba(34,197,94,0.7)' : 'rgba(244,63,94,0.7)' }}
        >
          Co-op Leben
        </span>
      </div>
    );
  }

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none w-[min(260px,70vw)]">
      {/* Main pill */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        }}
      >
        {/* Progress bar */}
        <div className="relative h-1 w-full" style={{ background: 'rgba(244,63,94,0.25)' }}>
          <motion.div
            className="absolute left-0 top-0 h-full"
            animate={{ width: `${myPct * 100}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            style={{ background: 'linear-gradient(90deg, #06b6d4, #22d3ee)', borderRadius: '0 2px 2px 0' }}
          />
        </div>

        {/* Scores row */}
        <div className="flex items-center px-3 py-2 gap-2">
          {/* My score */}
          <div className="flex-1 flex flex-col items-start min-w-0">
            <span className="text-[9px] font-bold uppercase tracking-wider truncate w-full"
              style={{ color: 'rgba(103,232,249,0.7)' }}>
              {myName}
            </span>
            <span className="text-base leading-tight" style={{ color: '#67e8f9', textShadow: '0 0 12px rgba(6,182,212,0.8)' }}>
              <AnimatedScore value={myScore} />
            </span>
          </div>

          {/* VS badge + diff */}
          <div className="flex flex-col items-center flex-shrink-0">
            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>VS</span>
            {diff > 0 && (
              <motion.span
                key={`${myLeading}-${Math.floor(diff / 50)}`}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[8px] font-bold"
                style={{ color: myLeading ? 'rgba(34,197,94,0.85)' : 'rgba(244,63,94,0.85)' }}
              >
                {myLeading ? `+${diff.toLocaleString()}` : `-${diff.toLocaleString()}`}
              </motion.span>
            )}
          </div>

          {/* Opp score */}
          <div className="flex-1 flex flex-col items-end min-w-0">
            <span className="text-[9px] font-bold uppercase tracking-wider truncate w-full text-right"
              style={{ color: 'rgba(252,165,165,0.7)' }}>
              {oppName || 'Gegner'}
            </span>
            <span className="text-base leading-tight" style={{ color: '#fca5a5', textShadow: '0 0 12px rgba(244,63,94,0.7)' }}>
              <AnimatedScore value={oppScore} />
            </span>
          </div>
        </div>
      </div>

      {/* Leading indicator */}
      <AnimatePresence>
        {diff > 100 && (
          <motion.div
            key={myLeading ? 'leading' : 'trailing'}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center mt-1"
          >
            <span
              className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{
                background: myLeading ? 'rgba(34,197,94,0.12)' : 'rgba(244,63,94,0.12)',
                color: myLeading ? 'rgba(34,197,94,0.8)' : 'rgba(244,63,94,0.8)',
                border: `1px solid ${myLeading ? 'rgba(34,197,94,0.2)' : 'rgba(244,63,94,0.2)'}`,
              }}
            >
              {myLeading ? '🏆 Du führst' : '⚡ Aufholen!'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}