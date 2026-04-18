import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MissionCard({ mission, status, onAccept, onClaim, progress = 0 }) {
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const isActive = status === 'active';
  const isReadyToClaim = status === 'ready_to_claim';

  const Icon = mission.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl border p-5 transition-all
        ${isActive ? 'bg-cyan-950/30 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]' : 
          isCompleted ? 'bg-green-950/20 border-green-500/30 opacity-70' :
          isLocked ? 'bg-slate-900/50 border-white/5 grayscale opacity-50' : 
          'bg-white/5 border-white/10 hover:border-white/20'}`}
    >
      {/* Character Bg Overlay */}
      <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none overflow-hidden">
        <img src={mission.character.avatar} alt="Character" className="h-full object-cover scale-150 translate-x-4 opacity-50 mix-blend-overlay" />
      </div>

      <div className="relative z-10 flex gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg
          ${isActive ? 'bg-cyan-500/20 text-cyan-400' : isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-white/40'}`}>
          {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border 
                  ${isActive ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' : 'bg-white/5 border-white/10 text-white/40'}`}>
                  {mission.character.name}
                </span>
                {isActive && <span className="text-[10px] text-cyan-400 animate-pulse font-bold">● AKTIV</span>}
              </div>
              <h3 className="font-bold text-lg leading-tight mb-1">{mission.title}</h3>
            </div>
          </div>
          
          <p className="text-sm text-white/60 mb-4 line-clamp-2">{mission.description}</p>

          <div className="bg-black/40 rounded-lg p-3 mb-4 border border-white/5">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-white/70">{mission.taskLabel}</span>
              <span className={isActive ? 'text-cyan-400' : 'text-white/40'}>
                {isActive ? `${progress} / ${mission.targetAmount}` : mission.targetAmount}
              </span>
            </div>
            {isActive && (
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-cyan-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((progress / mission.targetAmount) * 100, 100)}%` }}
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-2 text-xs">
              {mission.rewards.xp > 0 && (
                <span className="px-2 py-1 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                  +{mission.rewards.xp} XP
                </span>
              )}
              {mission.rewards.unlocks && (
                <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {mission.rewards.unlocks}
                </span>
              )}
            </div>

            {!isLocked && !isCompleted && !isActive && !isReadyToClaim && (
              <Button size="sm" onClick={() => onAccept(mission)} className="h-8 bg-white/10 hover:bg-white/20 text-white border-0">
                Annehmen
              </Button>
            )}
            
            {isActive && !isReadyToClaim && (
              <Button size="sm" disabled className="h-8 opacity-70 bg-transparent border border-white/10 text-white/50">
                Läuft...
              </Button>
            )}

            {isReadyToClaim && (
              <Button size="sm" onClick={() => onClaim(mission)} className="h-8 bg-cyan-500 hover:bg-cyan-400 text-black font-bold animate-pulse">
                Belohnung!
              </Button>
            )}
            
            {isCompleted && (
              <div className="text-xs text-green-500 font-bold flex items-center gap-1">
                Abgeschlossen <CheckCircle2 className="w-3 h-3" />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}