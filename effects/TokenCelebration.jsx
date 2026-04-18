import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Coins, Sparkles, Star, Flame } from 'lucide-react';

function isNeonDashActive() {
  return window.location.pathname.includes('NeonDash');
}

export default function TokenCelebration() {
  const [rewards, setRewards] = useState([]);

  useEffect(() => {
    const handleReward = (e, type) => {
      if (isNeonDashActive()) return;
      const { amount, source, rarity } = e.detail;
      const id = Date.now() + Math.random();
      
      let finalRarity = rarity;
      if (!finalRarity) {
        if (amount <= 100) finalRarity = 'common';
        else if (amount <= 500) finalRarity = 'rare';
        else if (amount <= 2000) finalRarity = 'epic';
        else finalRarity = 'legendary';
      }

      setRewards(prev => [...prev, { id, amount, source, rarity: finalRarity, type }]);

      const colors = type === 'xp' ? ['#d946ef', '#c026d3', '#86198f', '#fb7185']
                   : finalRarity === 'legendary' ? ['#f59e0b','#fbbf24','#fde68a','#ef4444'] 
                   : finalRarity === 'epic' ? ['#7c3aed','#a78bfa','#06b6d4','#818cf8'] 
                   : ['#3b82f6','#60a5fa','#06b6d4'];
                   
      if (type !== 'xp') {
        confetti({
          particleCount: finalRarity === 'legendary' ? 250 : finalRarity === 'epic' ? 150 : 100,
          spread: finalRarity === 'legendary' ? 160 : 120,
          origin: { y: 0.4 },
          colors,
          zIndex: 99999
        });
      }

      setTimeout(() => {
        setRewards(prev => prev.filter(r => r.id !== id));
      }, type === 'xp' ? 3000 : 4500);
    };

    const handleToken = (e) => handleReward(e, 'token');
    const handleXp = (e) => handleReward(e, 'xp');

    window.addEventListener('token-reward', handleToken);
    window.addEventListener('xp-reward', handleXp);
    return () => {
      window.removeEventListener('token-reward', handleToken);
      window.removeEventListener('xp-reward', handleXp);
    };
  }, []);

  const tokenRewards = rewards.filter(r => r.type === 'token');
  const xpRewards = rewards.filter(r => r.type === 'xp');

  return (
    <>
      <div className="fixed bottom-24 right-4 sm:right-8 z-[99999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {rewards.map(reward => {
            const isXp = reward.type === 'xp';
            
            const tierStyles = {
              common: { border: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)', bg: 'from-blue-500 to-blue-800' },
              rare: { border: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', bg: 'from-green-500 to-green-800' },
              epic: { border: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)', bg: 'from-purple-500 to-purple-800' },
              legendary: { border: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)', bg: 'from-yellow-400 to-orange-600' }
            }[reward.rarity] || { border: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)', bg: 'from-cyan-500 to-cyan-800' };

            const baseColor = isXp ? '#d946ef' : tierStyles.border;
            const glowColor = isXp ? 'rgba(217, 70, 239, 0.4)' : tierStyles.glow;
            const bgGradient = isXp ? 'from-fuchsia-500 to-fuchsia-800' : tierStyles.bg;
            const Icon = isXp ? Flame : Coins;

            return (
              <motion.div
                key={reward.id}
                initial={{ x: 100, opacity: 0, scale: 0.8 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: 100, opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
                className="flex items-center gap-4 p-3 pr-6 rounded-2xl bg-black/60 backdrop-blur-md border"
                style={{ borderColor: `${baseColor}40`, boxShadow: `0 4px 20px ${glowColor}` }}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 bg-gradient-to-br ${bgGradient}`} style={{ borderColor: baseColor, boxShadow: `0 0 10px ${glowColor}` }}>
                  <Icon className="w-6 h-6 text-white drop-shadow-md" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white leading-none">+{reward.amount.toLocaleString()} {isXp ? 'XP' : 'Tokens'}</h3>
                  {(reward.source || !isXp) && (
                    <p className="text-xs font-medium uppercase mt-1 tracking-wider" style={{ color: baseColor }}>
                      {reward.source || `${reward.rarity} Drop`}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </>
  );
}