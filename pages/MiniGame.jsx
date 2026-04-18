import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw, Trophy, Zap, Rocket, Star, Award } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function MiniGame() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('miniGameHighScore') || '0');
  });
  
  const [playerY, setPlayerY] = useState(250);
  const [obstacles, setObstacles] = useState([]);
  const [topObstacles, setTopObstacles] = useState([]);
  const [coins, setCoins] = useState([]);
  const [particles, setParticles] = useState([]);
  const [velocity, setVelocity] = useState(0);
  const [spawnProtection, setSpawnProtection] = useState(false);
  const [combo, setCombo] = useState(0);
  
  const gameLoopRef = useRef(null);
  const obstacleTimerRef = useRef(null);
  const topObstacleTimerRef = useRef(null);
  const coinTimerRef = useRef(null);

  const { data: allScores = [] } = useQuery({
    queryKey: ['gameScores'],
    queryFn: () => base44.entities.GameScore.list('-score', 100),
    enabled: showLeaderboard
  });

  // Filter: Nur bester Score pro Spieler
  const leaderboard = React.useMemo(() => {
    const bestScores = new Map();
    allScores.forEach(entry => {
      const existing = bestScores.get(entry.player_id);
      if (!existing || entry.score > existing.score) {
        bestScores.set(entry.player_id, entry);
      }
    });
    return Array.from(bestScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, [allScores]);

  const GRAVITY = 0.6;
  const JUMP_STRENGTH = -12;
  const GROUND_Y = 400;
  const PLAYER_SIZE = 50;

  const obstacleTypes = [
    { type: 'spike', color: 'from-red-500 to-orange-600', emoji: '⚡' },
    { type: 'rock', color: 'from-gray-600 to-gray-800', emoji: '🪨' },
    { type: 'fire', color: 'from-orange-500 to-red-600', emoji: '🔥' },
  ];

  const jump = () => {
    if (gameStarted && !gameOver && velocity >= -2) {
      setVelocity(JUMP_STRENGTH);
      createParticles(120, playerY + PLAYER_SIZE);
    }
  };

  const createParticles = (x, y) => {
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8 - 2,
    }));
    setParticles((p) => [...p, ...newParticles]);
  };

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setCoinsCollected(0);
    setCombo(0);
    setPlayerY(250);
    setVelocity(0);
    setObstacles([]);
    setTopObstacles([]);
    setCoins([]);
    setParticles([]);
    setSpawnProtection(true);
    
    setTimeout(() => setSpawnProtection(false), 3000);
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setCoinsCollected(0);
    setCombo(0);
    setPlayerY(250);
    setVelocity(0);
    setObstacles([]);
    setTopObstacles([]);
    setCoins([]);
    setParticles([]);
    setSpawnProtection(false);
  };

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const handleKeyPress = (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        jump();
      }
    };

    const handleTouch = (e) => {
      e.preventDefault();
      jump();
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('touchstart', handleTouch, { passive: false });
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('touchstart', handleTouch);
    };
  }, [gameStarted, gameOver, velocity]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameSpeed = 6 + (level - 1) * 0.5;

    gameLoopRef.current = setInterval(() => {
      setVelocity((v) => v + GRAVITY);
      setPlayerY((y) => {
        const newY = y + velocity;
        return Math.min(GROUND_Y - PLAYER_SIZE, Math.max(0, newY));
      });

      setObstacles((obs) => obs.map((ob) => ({ ...ob, x: ob.x - gameSpeed })).filter((ob) => ob.x > -100));
      setTopObstacles((obs) => obs.map((ob) => ({ ...ob, x: ob.x - gameSpeed })).filter((ob) => ob.x > -100));
      setCoins((cns) => cns.map((cn) => ({ ...cn, x: cn.x - gameSpeed })).filter((cn) => !cn.collected && cn.x > -50));
      
      setParticles((pts) => 
        pts
          .map((p) => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.3 }))
          .filter((p) => p.y < 500)
      );

      setScore((s) => {
        const newScore = s + 1;
        const newLevel = Math.floor(newScore / 500) + 1;
        if (newLevel > level) {
          setLevel(newLevel);
        }
        return newScore;
      });
    }, 1000 / 60);

    return () => clearInterval(gameLoopRef.current);
  }, [gameStarted, gameOver, velocity, level]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const spawnRate = Math.max(1000, 1800 - (level - 1) * 100);

    obstacleTimerRef.current = setInterval(() => {
      const height = Math.random() * 120 + 80;
      const randomType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
      setObstacles((obs) => [
        ...obs,
        {
          id: Date.now(),
          x: 800,
          height,
          ...randomType,
        },
      ]);
    }, spawnRate);

    return () => clearInterval(obstacleTimerRef.current);
  }, [gameStarted, gameOver, level]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const spawnRate = Math.max(2000, 3000 - (level - 1) * 150);

    topObstacleTimerRef.current = setInterval(() => {
      const height = Math.random() * 100 + 60;
      const randomType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
      setTopObstacles((obs) => [
        ...obs,
        {
          id: Date.now() + Math.random(),
          x: 800,
          height,
          ...randomType,
        },
      ]);
    }, spawnRate);

    return () => clearInterval(topObstacleTimerRef.current);
  }, [gameStarted, gameOver, level]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    coinTimerRef.current = setInterval(() => {
      const y = Math.random() * 250 + 50;
      setCoins((cns) => [
        ...cns,
        {
          id: Date.now(),
          x: 800,
          y,
          collected: false,
        },
      ]);
    }, 2500);

    return () => clearInterval(coinTimerRef.current);
  }, [gameStarted, gameOver]);

  useEffect(() => {
    if (!gameStarted || gameOver || spawnProtection) return;

    const playerX = 100;
    const playerLeft = playerX + 8;
    const playerRight = playerX + PLAYER_SIZE - 8;
    const playerTop = playerY + 8;
    const playerBottom = playerY + PLAYER_SIZE - 8;

    // Bottom obstacles collision
    obstacles.forEach((obs) => {
      const obsLeft = obs.x + 8;
      const obsRight = obs.x + 52;
      const obsTop = GROUND_Y - obs.height + 8;

      if (playerRight > obsLeft && playerLeft < obsRight) {
        if (playerBottom > obsTop) {
          endGame();
        }
      }
    });

    // Top obstacles collision
    topObstacles.forEach((obs) => {
      const obsLeft = obs.x + 8;
      const obsRight = obs.x + 52;
      const obsBottom = obs.height - 8;

      if (playerRight > obsLeft && playerLeft < obsRight) {
        if (playerTop < obsBottom) {
          endGame();
        }
      }
    });

    if (playerY >= GROUND_Y - PLAYER_SIZE - 2) {
      endGame();
    }
  }, [obstacles, topObstacles, playerY, gameStarted, gameOver, spawnProtection]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    coins.forEach((coin) => {
      if (coin.collected) return;
      
      const playerX = 100;
      const dist = Math.sqrt(
        Math.pow(coin.x - (playerX + PLAYER_SIZE / 2), 2) + 
        Math.pow(coin.y - (playerY + PLAYER_SIZE / 2), 2)
      );

      if (dist < 40) {
        setCoins((cns) => cns.map((c) => c.id === coin.id ? { ...c, collected: true } : c));
        setScore((s) => s + 50);
        setCoinsCollected((c) => c + 1);
        setCombo((c) => c + 1);
        createParticles(coin.x, coin.y);
      }
    });
  }, [coins, playerY, gameStarted, gameOver]);

  const endGame = async () => {
    setGameOver(true);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('miniGameHighScore', score.toString());
    }
    
    try {
      const storedUser = localStorage.getItem('app_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const tokenReward = Math.floor(score / 5);
        const newTokens = (user.tokens || 0) + tokenReward;
        await base44.entities.AppUser.update(user.id, { tokens: newTokens });
        
        const updatedUser = { ...user, tokens: newTokens };
        localStorage.setItem('app_user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('user-updated'));

        await base44.entities.GameScore.create({
          player_username: user.username,
          player_id: user.id,
          score: score,
          level: level,
          coins_collected: coinsCollected
        });
      }
    } catch (e) {
      console.error('Token reward failed:', e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050510] via-[#0a0a0b] to-[#0a0014] py-8 md:py-12 px-4 relative overflow-hidden">
      {/* Cosmic Glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[150px] animate-pulse pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-[150px] animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
      
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-8 md:mb-12">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="inline-block mb-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-violet-600 rounded-3xl blur-2xl opacity-60 animate-pulse" />
              <div className="relative w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-cyan-600 to-violet-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-cyan-500/40 border-4 border-cyan-400/20">
                <Rocket className="w-10 h-10 md:w-12 md:h-12 text-white drop-shadow-2xl" />
              </div>
            </div>
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 mb-4 drop-shadow-2xl tracking-tight">
            Space Runner
          </h1>
          <p className="text-white/60 text-base md:text-xl font-medium">
            <span className="hidden md:inline">🎮 Drücke SPACE oder klicke zum Springen! Sammle ⭐ für Bonuspunkte</span>
            <span className="md:hidden">🎮 Tippe zum Springen! Sammle ⭐</span>
          </p>
        </div>

        <div className="flex justify-between items-center mb-6 md:mb-8 px-2 md:px-4 flex-wrap gap-4">
          <Button
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            variant="outline"
            className="border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 rounded-2xl px-6 h-12 font-bold"
          >
            <Trophy className="w-5 h-5 mr-2" />
            Rangliste
          </Button>

          <div className="flex items-center gap-4 md:gap-8">
          <div className="bg-white/[0.03] backdrop-blur-2xl rounded-2xl px-5 md:px-8 py-3 md:py-4 border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
              <div className="text-xs md:text-sm text-white/40 font-bold uppercase tracking-wider mb-1">Level {level}</div>
              <div className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">
                {score}
              </div>
            </div>
            
            <div className="bg-white/[0.03] backdrop-blur-2xl bg-gradient-to-br from-amber-500/10 to-orange-600/10 rounded-2xl px-5 md:px-8 py-3 md:py-4 border border-amber-500/20 shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
              <div className="text-xs md:text-sm text-amber-300/60 font-bold uppercase tracking-wider mb-1">Best</div>
              <div className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 flex items-center gap-2">
                <Trophy className="w-6 h-6 md:w-8 md:h-8 text-amber-400" />
                {highScore}
              </div>
            </div>
            
            {combo > 1 && gameStarted && !gameOver && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 backdrop-blur-xl rounded-2xl px-5 md:px-8 py-3 md:py-4 border border-green-500/30 shadow-2xl shadow-green-500/20"
              >
                <div className="text-xs md:text-sm text-green-300/60 font-bold uppercase tracking-wider mb-1">Combo</div>
                <div className="text-3xl md:text-4xl font-black text-green-400">
                  x{combo} 🔥
                </div>
              </motion.div>
            )}
          </div>

          {!gameStarted && !gameOver && (
            <Button
              onClick={startGame}
              className="bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white rounded-2xl px-8 md:px-10 h-12 md:h-14 shadow-2xl shadow-cyan-500/40 border border-cyan-400/20 font-black text-base md:text-lg active:scale-95 md:hover:scale-105 transition-all"
            >
              <Play className="w-5 h-5 mr-2" />
              Spiel starten
            </Button>
          )}

          {gameOver && (
            <Button
              onClick={resetGame}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-2xl px-8 md:px-10 h-12 md:h-14 shadow-2xl shadow-amber-500/40 border border-amber-400/20 font-black text-base md:text-lg active:scale-95 md:hover:scale-105 transition-all"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Nochmal spielen
            </Button>
          )}
        </div>

        <div
          className="relative bg-gradient-to-b from-[#000510] via-[#0a0020] to-[#050010] rounded-3xl overflow-hidden border-2 border-white/20 shadow-[0_0_80px_rgba(6,182,212,0.3)] cursor-pointer select-none touch-none"
          style={{ width: '100%', maxWidth: '900px', height: '450px', margin: '0 auto' }}
          onClick={jump}
        >
          {/* Enhanced Starfield */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Large distant stars */}
            {[...Array(30)].map((_, i) => {
              const size = Math.random() * 2 + 1;
              return (
                <motion.div
                  key={`star-large-${i}`}
                  className="absolute rounded-full"
                  style={{
                    width: size,
                    height: size,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    background: `radial-gradient(circle, rgba(255,255,255,${0.6 + Math.random() * 0.4}) 0%, transparent 70%)`,
                    boxShadow: `0 0 ${size * 3}px rgba(255,255,255,0.8)`,
                  }}
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: Math.random() * 4 + 3,
                    repeat: Infinity,
                    delay: Math.random() * 3,
                    ease: "easeInOut",
                  }}
                />
              );
            })}
            
            {/* Medium colorful stars */}
            {[...Array(25)].map((_, i) => {
              const colors = ['#00D9FF', '#A855F7', '#EC4899', '#FBBF24'];
              const color = colors[Math.floor(Math.random() * colors.length)];
              const size = Math.random() * 3 + 2;
              return (
                <motion.div
                  key={`star-color-${i}`}
                  className="absolute rounded-full"
                  style={{
                    width: size,
                    height: size,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    background: `radial-gradient(circle, ${color} 0%, transparent 60%)`,
                    boxShadow: `0 0 ${size * 4}px ${color}`,
                  }}
                  animate={{
                    opacity: [0.4, 1, 0.4],
                    scale: [1, 1.4, 1],
                  }}
                  transition={{
                    duration: Math.random() * 3 + 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: "easeInOut",
                  }}
                />
              );
            })}
            
            {/* Small twinkling stars */}
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={`star-small-${i}`}
                className="absolute rounded-full bg-white"
                style={{
                  width: 1,
                  height: 1,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  boxShadow: '0 0 2px rgba(255,255,255,0.9)',
                }}
                animate={{
                  opacity: [0.2, 0.8, 0.2],
                }}
                transition={{
                  duration: Math.random() * 2 + 1,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Enhanced Ground */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-violet-900/60 via-purple-900/30 to-transparent pointer-events-none" />
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500"
            style={{ 
              top: `${GROUND_Y}px`,
              boxShadow: '0 0 30px rgba(139,92,246,0.6), 0 -5px 20px rgba(6,182,212,0.3)',
            }}
            animate={{
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {/* Ground shine effect */}
          <motion.div
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent"
            style={{ top: `${GROUND_Y}px` }}
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Spawn Protection Indicator */}
          {spawnProtection && gameStarted && (
            <motion.div
              className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-amber-500/20 border border-amber-500/50 rounded-full text-amber-300 text-sm font-bold backdrop-blur-sm"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              🛡️ Spawn Protection
            </motion.div>
          )}

          {/* Player Character */}
          {gameStarted && (
            <motion.div
              className="absolute flex items-center justify-center"
              style={{
                left: '100px',
                top: `${playerY}px`,
                width: PLAYER_SIZE,
                height: PLAYER_SIZE,
              }}
              animate={{
                rotate: velocity < 0 ? -15 : 10,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {/* Glow effect */}
              <motion.div 
                className="absolute inset-0 rounded-full blur-xl"
                style={{ 
                  background: spawnProtection 
                    ? 'radial-gradient(circle, rgba(251, 146, 60, 0.6) 0%, transparent 70%)' 
                    : 'radial-gradient(circle, rgba(6, 182, 212, 0.5) 0%, transparent 70%)'
                }}
                animate={{
                  scale: spawnProtection ? [1, 1.3, 1] : [1, 1.15, 1],
                  opacity: spawnProtection ? [0.8, 1, 0.8] : [0.6, 0.9, 0.6],
                }}
                transition={{
                  duration: spawnProtection ? 0.8 : 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              
              {/* Player body */}
              <div className={`absolute inset-0 rounded-full ${
                spawnProtection 
                  ? 'bg-gradient-to-br from-amber-400 via-orange-500 to-red-500' 
                  : 'bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600'
              } shadow-2xl`} 
                style={{ 
                  boxShadow: spawnProtection 
                    ? '0 0 40px rgba(251, 146, 60, 0.9), inset 0 2px 10px rgba(255,255,255,0.3)' 
                    : '0 0 40px rgba(6, 182, 212, 0.7), inset 0 2px 10px rgba(255,255,255,0.3)'
                }}
              />
              
              <Rocket className="w-8 h-8 text-white relative z-10 drop-shadow-lg" />
              
              {/* Enhanced Exhaust */}
              {velocity > 0 && (
                <>
                  <motion.div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-8 bg-gradient-to-b from-orange-400 via-red-500 to-transparent rounded-full blur-sm"
                    animate={{ 
                      scaleY: [1, 1.4, 1], 
                      scaleX: [1, 0.8, 1],
                      opacity: [0.9, 1, 0.9] 
                    }}
                    transition={{ duration: 0.15, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-gradient-to-b from-yellow-300 to-transparent rounded-full blur-md"
                    animate={{ 
                      scale: [0.8, 1.2, 0.8],
                      opacity: [0.6, 0.9, 0.6] 
                    }}
                    transition={{ duration: 0.2, repeat: Infinity }}
                  />
                </>
              )}
            </motion.div>
          )}

          {/* Particles */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute w-2 h-2 rounded-full"
              style={{ 
                left: p.x, 
                top: p.y,
                background: 'radial-gradient(circle, #22d3ee 0%, #06b6d4 50%, transparent 100%)',
                boxShadow: '0 0 8px #22d3ee',
              }}
              animate={{ opacity: [1, 0], scale: [1, 0.5] }}
              transition={{ duration: 0.6 }}
            />
          ))}

          {/* Bottom Obstacles */}
          {obstacles.map((obs) => (
            <motion.div
              key={obs.id}
              className={`absolute bg-gradient-to-t ${obs.color} rounded-t-2xl shadow-2xl overflow-hidden`}
              style={{
                left: `${obs.x}px`,
                bottom: '0px',
                width: '60px',
                height: `${obs.height}px`,
              }}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-80">
                {obs.emoji}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </motion.div>
          ))}

          {/* Top Obstacles */}
          {topObstacles.map((obs) => (
            <motion.div
              key={obs.id}
              className={`absolute bg-gradient-to-b ${obs.color} rounded-b-2xl shadow-2xl overflow-hidden`}
              style={{
                left: `${obs.x}px`,
                top: '0px',
                width: '60px',
                height: `${obs.height}px`,
              }}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-80 rotate-180">
                {obs.emoji}
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
            </motion.div>
          ))}

          {/* Coins */}
          {coins.map((coin) => (
            !coin.collected && (
              <motion.div
                key={coin.id}
                className="absolute w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 shadow-lg flex items-center justify-center"
                style={{
                  left: `${coin.x}px`,
                  top: `${coin.y}px`,
                  boxShadow: '0 0 20px rgba(251, 191, 36, 0.6)',
                }}
                animate={{
                  rotate: 360,
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 0.5, repeat: Infinity },
                }}
              >
                <Star className="w-5 h-5 text-yellow-900 fill-yellow-900" />
              </motion.div>
            )
          ))}

          {/* Start Screen */}
          <AnimatePresence>
            {!gameStarted && !gameOver && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-7xl md:text-9xl mb-6"
                >
                  🚀
                </motion.div>
                <h2 className="text-2xl md:text-4xl font-black text-white mb-4">
                  Bereit zum Abheben?
                </h2>
                <p className="text-white/60 mb-2 text-sm md:text-base">
                  <span className="hidden md:inline">Drücke START oder SPACE</span>
                  <span className="md:hidden">Tippe um zu starten</span>
                </p>
                <p className="text-cyan-400 text-xs md:text-sm">⭐ Sammle Münzen für Bonuspunkte!</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Game Over Screen */}
          <AnimatePresence>
            {gameOver && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-lg p-4"
              >
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                    className="text-6xl md:text-8xl mb-6"
                  >
                    💥
                  </motion.div>
                  <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
                    Game Over!
                  </h2>
                  <div className="space-y-3 mb-6">
                    <div className="text-xl md:text-3xl text-white/80">
                      Score: <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400 font-black">{score}</span>
                    </div>
                    <div className="text-lg md:text-2xl text-green-400 font-bold">
                      +{Math.floor(score / 5)} Tokens! 💰
                    </div>
                  </div>
                  {score === highScore && score > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-amber-400 font-bold mb-6 flex items-center justify-center gap-2 text-lg md:text-xl"
                    >
                      <Trophy className="w-6 h-6 md:w-8 md:h-8" />
                      Neuer Rekord! 🎉
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {showLeaderboard && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 max-w-3xl mx-auto bg-gradient-to-b from-[#1a1a1c]/90 to-[#0a0a0b]/90 backdrop-blur-2xl rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                Top 10 Spieler
              </h2>
            </div>

            <div className="space-y-2">
              {leaderboard.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center justify-between p-4 rounded-2xl ${
                    index < 3 
                      ? 'bg-white/[0.03] backdrop-blur-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 shadow-lg' 
                      : 'bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-lg'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-yellow-900 shadow-lg shadow-yellow-500/30' :
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800 shadow-lg' :
                      index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-amber-100 shadow-lg' :
                      'bg-white/10 text-white/60'
                    }`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </div>
                    <div>
                      <div className="font-bold text-white">{entry.player_username}</div>
                      <div className="text-white/40 text-sm flex items-center gap-2">
                        Level {entry.level} · {entry.coins_collected || 0} 🪙
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">
                      {entry.score}
                    </div>
                  </div>
                </motion.div>
              ))}
              {leaderboard.length === 0 && (
                <div className="text-center py-12 text-white/40">
                  Noch keine Einträge. Sei der Erste!
                </div>
              )}
            </div>
          </motion.div>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="bg-white/[0.03] backdrop-blur-2xl rounded-2xl p-4 border border-white/10 flex items-center gap-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg">
              <Star className="w-5 h-5 text-yellow-900" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">Münzen sammeln</div>
              <div className="text-white/40 text-xs">+50 Punkte pro Münze</div>
            </div>
          </div>
          
          <div className="bg-white/[0.03] backdrop-blur-2xl rounded-2xl p-4 border border-white/10 flex items-center gap-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shadow-lg">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">Level aufsteigen</div>
              <div className="text-white/40 text-xs">Alle 500 Punkte</div>
            </div>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-2xl rounded-2xl p-4 border border-white/10 flex items-center gap-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
              <span className="text-xl">🛡️</span>
            </div>
            <div>
              <div className="text-white font-bold text-sm">Spawn Schutz</div>
              <div className="text-white/40 text-xs">3 Sekunden zu Beginn</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}