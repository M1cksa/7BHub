import React from 'react';
import { motion } from 'framer-motion';

export const ACHIEVEMENTS = [
  { id: 'coin_10',      name: 'Münzjäger',          desc: '10 Münzen gesammelt',           icon: '🪙', reward: 100  },
  { id: 'coin_50',      name: 'Münzregen',           desc: '50 Münzen gesammelt',           icon: '💰', reward: 400  },
  { id: 'coin_150',     name: 'Goldrausch',          desc: '150 Münzen in einer Runde',     icon: '🏆', reward: 1200 },
  { id: 'dodge_10',     name: 'Ausweicher',          desc: '10er Combo',                    icon: '⚡', reward: 150  },
  { id: 'dodge_25',     name: 'Phantom',             desc: '25er Combo erreicht',           icon: '👻', reward: 600  },
  { id: 'dodge_50',     name: 'Ghost Runner',        desc: 'Legendäre 50er Combo',          icon: '💀', reward: 2500 },
  { id: 'survive_60',   name: 'Überlebender',        desc: '60 Sekunden überlebt',          icon: '⏱️', reward: 200 },
  { id: 'survive_120',  name: 'Ausdauerläufer',      desc: '120 Sekunden überlebt',         icon: '🌟', reward: 600  },
  { id: 'survive_300',  name: 'Ewiger Läufer',       desc: '5 Minuten überlebt',            icon: '⌛', reward: 3000 },
  { id: 'score_1000',   name: 'Aufsteiger',          desc: '1.000 Punkte',                  icon: '📈', reward: 100  },
  { id: 'score_5000',   name: 'Score Jäger',         desc: '5.000 Punkte',                  icon: '🚀', reward: 350  },
  { id: 'score_15000',  name: 'Score Legende',       desc: '15.000 Punkte',                 icon: '👑', reward: 1500 },
  { id: 'dimension_1',  name: 'Reisender',           desc: 'Erste Dimension betreten',      icon: '⬡', reward: 500  },
  { id: 'dimension_3',  name: 'Multiversum',         desc: '3 Dimensionen in einer Runde',  icon: '🌀', reward: 1500 },
  { id: 'pro_30',       name: 'Pro Kämpfer',         desc: '30 Sek im Pro Modus',           icon: '🔥', reward: 350  },
  { id: 'pro_120',      name: 'Pro Legende',         desc: '120 Sek im Pro Modus',          icon: '🌋', reward: 2000 },
  { id: 'shield_save',  name: 'Schildretter',        desc: 'Schild absorbiert Treffer',     icon: '🛡️', reward: 200 },
  { id: 'combo_x5',     name: 'Combo King',          desc: 'x5 Multiplikator',              icon: '💥', reward: 300  },
  { id: 'combo_x8',     name: 'Combo Gott',          desc: 'x8 MAX Multiplikator',          icon: '✨', reward: 1200 },
];

export const checkAchievements = (state, unlockedSet) => {
  const sessionTime = (state.frames || 0) / 60;
  const conditions = {
    coin_10:     (state.challengeCoins || 0) >= 10,
    coin_50:     (state.challengeCoins || 0) >= 50,
    coin_150:    (state.challengeCoins || 0) >= 150,
    dodge_10:    (state.maxCombo || 0) >= 10,
    dodge_25:    (state.maxCombo || 0) >= 25,
    dodge_50:    (state.maxCombo || 0) >= 50,
    survive_60:  sessionTime >= 60,
    survive_120: sessionTime >= 120,
    survive_300: sessionTime >= 300,
    score_1000:  (state.score || 0) >= 1000,
    score_5000:  (state.score || 0) >= 5000,
    score_15000: (state.score || 0) >= 15000,
    dimension_1: (state.dimensionsEntered || 0) >= 1,
    dimension_3: (state.dimensionsEntered || 0) >= 3,
    pro_30:      !!state.proMode && sessionTime >= 30,
    pro_120:     !!state.proMode && sessionTime >= 120,
    shield_save: (state.shieldSaves || 0) >= 1,
    combo_x5:    (state.maxComboMult || 1) >= 5,
    combo_x8:    (state.maxComboMult || 1) >= 8,
  };
  return ACHIEVEMENTS.filter(a => !unlockedSet.has(a.id) && conditions[a.id]);
};

export function AchievementToast({ achievement }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 80, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.8 }}
      transition={{ type: 'spring', bounce: 0.5, duration: 0.4 }}
      className="flex items-center gap-3 rounded-2xl px-4 py-3 pointer-events-none"
      style={{
        background: 'linear-gradient(135deg, rgba(5,0,20,0.92) 0%, rgba(30,10,60,0.92) 100%)',
        border: '1px solid rgba(234,179,8,0.5)',
        boxShadow: '0 0 28px rgba(234,179,8,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
        minWidth: 215,
        backdropFilter: 'blur(16px)',
      }}
    >
      <div className="text-2xl flex-shrink-0">{achievement.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-yellow-400 font-black text-[9px] uppercase tracking-widest mb-0.5">Achievement!</div>
        <div className="text-white font-bold text-[13px] leading-tight truncate">{achievement.name}</div>
        <div className="text-white/45 text-[10px] truncate">{achievement.desc}</div>
      </div>
      <div className="text-right flex-shrink-0 ml-2">
        <div className="text-green-400 font-black text-xs">+{achievement.reward.toLocaleString()}</div>
        <div className="text-white/25 text-[9px]">Tokens</div>
      </div>
    </motion.div>
  );
}