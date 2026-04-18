import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import AstroBlitzMenu from '@/components/game/astro/AstroBlitzMenu';
import AstroBlitzCanvas from '@/components/game/astro/AstroBlitzCanvas';
import AstroBlitzGameOver from '@/components/game/astro/AstroBlitzGameOver';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AstroBlitz() {
  const [gameState, setGameState] = useState('menu'); // menu | playing | gameover
  const [gameMode, setGameMode] = useState('solo'); // solo | versus
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [tokensEarned, setTokensEarned] = useState(0);
  const [matchId, setMatchId] = useState(null);
  const [isP1, setIsP1] = useState(false);
  const [oppScore, setOppScore] = useState(0);
  const [oppName, setOppName] = useState('');

  const [user] = useState(() => {
    try { const u = localStorage.getItem('app_user'); return u && u !== 'undefined' ? JSON.parse(u) : null; } catch { return null; }
  });

  const highScore = parseInt(localStorage.getItem('astroHighScore') || '0');

  const handleStartSolo = () => {
    setGameMode('solo');
    setScore(0);
    setWave(1);
    setGameState('playing');
  };

  const handleStartVersus = async (mid, ip1, opp, oppSkin) => {
    setMatchId(mid);
    setIsP1(ip1);
    setOppName(opp);
    setOppScore(0);
    setGameMode('versus');
    setScore(0);
    setWave(1);
    setGameState('playing');
  };

  const handleRematch = () => {
    setGameState('menu');
    // small delay so menu re-mounts cleanly
    setTimeout(() => {}, 100);
  };

  const handleGameOver = async (finalScore, finalWave) => {
    setScore(finalScore);
    setWave(finalWave);
    const earned = Math.floor(finalScore * 3) + finalWave * 500;
    setTokensEarned(earned);

    if (finalScore > highScore) {
      localStorage.setItem('astroHighScore', finalScore.toString());
    }

    if (user) {
      try {
        await base44.entities.GameScore.create({
          player_username: user.username,
          player_id: user.id,
          score: finalScore,
          level: finalWave,
          coins_collected: 0,
          game_type: 'astro_blitz',
        });
        const { awardXpAndTokens } = await import('@/components/battlepass/xpUtils');
        const cuStr = localStorage.getItem('app_user');
        const cu = cuStr && cuStr !== 'undefined' ? JSON.parse(cuStr) : user;
        await awardXpAndTokens(cu, earned / 2, earned, 'Astro Blitz');
      } catch (e) { console.error(e); }
    }

    setGameState('gameover');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#03020f] flex flex-col overflow-hidden text-white font-sans touch-none">
      {/* Back button */}
      <div className="absolute top-4 left-4 z-30">
        <Link to={createPageUrl('Home')}>
          <Button variant="ghost" size="sm" className="text-white/50 hover:text-white hover:bg-white/10 rounded-full text-xs">
            <ChevronLeft className="w-4 h-4 mr-1" /> Menü
          </Button>
        </Link>
      </div>

      {/* Game Canvas (always mounted when playing) */}
      {gameState === 'playing' && (
        <AstroBlitzCanvas
          mode={gameMode}
          user={user}
          matchId={matchId}
          isP1={isP1}
          oppScore={oppScore}
          oppName={oppName}
          onScoreUpdate={setScore}
          onWaveUpdate={setWave}
          onOppScoreUpdate={setOppScore}
          onGameOver={handleGameOver}
        />
      )}

      {/* Menu Overlay */}
      {gameState === 'menu' && (
        <AstroBlitzMenu
          user={user}
          highScore={highScore}
          onStartSolo={handleStartSolo}
          onStartVersus={handleStartVersus}
        />
      )}

      {/* Game Over Overlay */}
      {gameState === 'gameover' && (
        <AstroBlitzGameOver
          score={score}
          wave={wave}
          highScore={highScore}
          tokensEarned={tokensEarned}
          mode={gameMode}
          oppScore={oppScore}
          oppName={oppName}
          user={user}
          onMenu={() => setGameState('menu')}
          onRestart={gameMode === 'solo' ? handleStartSolo : handleRematch}
          onRematch={gameMode === 'versus' ? () => setGameState('menu') : null}
        />
      )}
    </div>
  );
}