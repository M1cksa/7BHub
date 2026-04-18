import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Zap, Trophy, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function ClanTrainingGame({ clan, user, isMember }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });
  
  const queryClient = useQueryClient();

  const finishMutation = useMutation({
    mutationFn: async (finalScore) => {
      const xpEarned = Math.floor(finalScore / 2);
      if (xpEarned <= 0) return;
      
      const newXp = (clan.xp || 0) + xpEarned;
      // Calculate level: let's say every 1000 XP is a level
      const newLevel = Math.floor(newXp / 1000) + 1;
      
      await base44.entities.Clan.update(clan.id, {
        xp: newXp,
        level: newLevel
      });
      
      return xpEarned;
    },
    onSuccess: (xpEarned) => {
      if (xpEarned > 0) {
        toast.success(`Training beendet! Du hast ${xpEarned} XP für den Clan gesammelt!`);
        queryClient.invalidateQueries({ queryKey: ['clan', clan.id] });
      }
    }
  });

  useEffect(() => {
    let timer;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (isPlaying && timeLeft === 0) {
      setIsPlaying(false);
      finishMutation.mutate(score);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, score]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(15);
    setIsPlaying(true);
    moveTarget();
  };

  const moveTarget = () => {
    const x = Math.random() * 80 + 10;
    const y = Math.random() * 80 + 10;
    setTargetPos({ x, y });
  };

  const handleHit = (e) => {
    e.stopPropagation();
    setScore(s => s + 10);
    moveTarget();
  };

  if (!isMember) return null;

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10 mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Target className="w-32 h-32" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-fuchsia-400" /> Clan Training
          </h2>
          {isPlaying && (
            <div className="flex gap-4">
              <span className="text-fuchsia-400 font-bold">Zeit: {timeLeft}s</span>
              <span className="text-yellow-400 font-bold">Punkte: {score}</span>
            </div>
          )}
        </div>

        {!isPlaying && timeLeft === 15 ? (
          <div>
            <p className="text-white/60 text-sm mb-4">
              Trainiere deine Reflexe und sammle XP für <strong>{clan.name}</strong>. Klicke in 15 Sekunden so oft wie möglich auf das Ziel!
            </p>
            <Button 
              onClick={startGame}
              className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold h-12 px-6"
            >
              <Zap className="w-5 h-5 mr-2" /> Training starten
            </Button>
          </div>
        ) : !isPlaying && timeLeft === 0 ? (
          <div>
            <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400 mb-2">
              Zeit abgelaufen!
            </h3>
            <p className="text-white/70 mb-4">Du hast {score} Punkte erreicht.</p>
            <Button 
              onClick={startGame}
              className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold h-10 px-6"
            >
              Nochmal spielen
            </Button>
          </div>
        ) : (
          <div 
            className="w-full h-64 bg-black/40 rounded-xl relative overflow-hidden border border-white/5 cursor-crosshair"
            onClick={() => setScore(s => Math.max(0, s - 2))}
          >
            <AnimatePresence>
              <motion.button
                key={`${targetPos.x}-${targetPos.y}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleHit}
                className="absolute w-12 h-12 -ml-6 -mt-6 bg-gradient-to-br from-fuchsia-500 to-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(217,70,239,0.5)] border-2 border-white"
                style={{ left: `${targetPos.x}%`, top: `${targetPos.y}%` }}
              >
                <Target className="w-6 h-6 text-white" />
              </motion.button>
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}