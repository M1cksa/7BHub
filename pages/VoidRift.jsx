import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import ChronosphereGame from '@/components/game/chronosphere/ChronosphereGame';
import ChronosphereMenu from '@/components/game/chronosphere/ChronosphereMenu';
import ChronosphereGameOver from '@/components/game/chronosphere/ChronosphereGameOver';

const isWeekendBoost = () => { const d = new Date().getDay(); return d === 0 || d === 6; };

export default function VoidRift() {
  const [gameState, setGameState] = useState('menu');
  const [finalScore, setFinalScore] = useState(0);
  const [finalStats, setFinalStats] = useState({});
  const [tokensEarned, setTokensEarned] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('chronoHighScore') || '0'));
  const weekendBoost = isWeekendBoost();

  const [user] = useState(() => {
    try { const u = localStorage.getItem('app_user'); return u && u !== 'undefined' ? JSON.parse(u) : null; } catch { return null; }
  });

  const handleGameOver = async (score, stats) => {
    setFinalScore(score);
    setFinalStats(stats);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('chronoHighScore', score.toString());
    }
    const weekendMult = weekendBoost ? 2 : 1;
    const earned = (Math.floor(score / 5) + 50) * weekendMult;
    setTokensEarned(earned);
    setGameState('gameover');

    if (user) {
      try {
        await base44.entities.GameScore.create({
          player_username: user.username,
          player_id: user.id,
          score,
          level: stats.wave || 1,
          coins_collected: stats.crystals || 0,
          game_type: 'chronosphere',
        });
        const { awardXpAndTokens } = await import('@/components/battlepass/xpUtils');
        const cu = JSON.parse(localStorage.getItem('app_user') || '{}');
        await awardXpAndTokens(cu, Math.floor(score / 5) + 60, earned, 'Chronosphere');
      } catch (e) { console.error(e); }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden text-white font-sans select-none">
      <div className="absolute top-5 left-5 z-50">
        <Link to={createPageUrl('Home')}>
          <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10 rounded-full">
            <ChevronLeft className="w-5 h-5 mr-1" /> Zurück
          </Button>
        </Link>
      </div>

      {/* Game canvas always mounted */}
      <ChronosphereGame
        isPlaying={gameState === 'playing'}
        onGameOver={handleGameOver}
      />

      {/* Overlays */}
      <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
        <AnimatePresence mode="wait">
          {gameState === 'menu' && (
            <ChronosphereMenu
              key="menu"
              highScore={highScore}
              user={user}
              weekendBoost={weekendBoost}
              onStart={() => setGameState('playing')}
            />
          )}
          {gameState === 'gameover' && (
            <ChronosphereGameOver
              key="gameover"
              score={finalScore}
              highScore={highScore}
              stats={finalStats}
              tokensEarned={tokensEarned}
              weekendBoost={weekendBoost}
              onRestart={() => setGameState('playing')}
              onMenu={() => setGameState('menu')}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}