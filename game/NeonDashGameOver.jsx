import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw, Trophy, CheckCircle, Zap } from 'lucide-react';
import { LEVELS } from '@/components/game/NeonDashConstants';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function NeonDashGameOver({
  gameState,
  setGameState,
  score,
  highScore,
  proHighScore,
  tokensEarned,
  isProMode,
  startGame,
  weekendBoostActive,
  lbMode,
  setLbMode,
  leaderboard,
  leaderboardLoading,
  currentLevelId,
  startLevel
}) {
  if (gameState === 'leaderboard') {
    return (
      <motion.div key="leaderboard" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
        className="pointer-events-auto bg-black/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-yellow-500/30 shadow-[0_0_50px_rgba(250,204,21,0.15)] w-[90%] max-w-md max-h-[80vh] flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-500 flex items-center gap-2">
            <Trophy className="w-7 h-7 text-yellow-400" /> Top 10
          </h2>
          <div className="flex gap-1 ml-auto bg-white/5 p-1 rounded-full border border-white/10">
            {[['daily', 'Heute', '#22c55e'], ['week', 'Diese Woche', '#a855f7'], ['normal', 'Normal', '#06b6d4'], ['pro', 'Pro', '#f97316'], ['level', 'Level', '#7c3aed']].map(([id, label, c]) => (
              <button key={id} onClick={() => setLbMode(id)}
                className={`text-xs px-2.5 py-1 rounded-full font-bold transition-all ${lbMode === id ? 'text-white' : 'text-white/40 hover:text-white'}`}
                style={lbMode === id ? { background: c } : {}}>
                {label}
              </button>
            ))}
          </div>
        </div>
        {lbMode === 'level' && <p className="text-white/30 text-[11px] mb-3">Höchstes abgeschlossenes Level</p>}
        {lbMode === 'daily' && <p className="text-white/30 text-[11px] mb-3">Beste Scores heute · {new Date().toLocaleDateString('de-DE')}</p>}
        {lbMode === 'week' && <p className="text-white/30 text-[11px] mb-3">Beste Scores diese Woche</p>}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 mb-5 hide-scrollbar">
          {leaderboardLoading ? (
            <p className="text-center text-white/50 py-4">Lade...</p>
          ) : leaderboard.length === 0 ? (
            <p className="text-center text-white/50 py-4">Noch keine Einträge.</p>
          ) : leaderboard.map((entry, i) => (
            <div key={entry.id || i} className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-yellow-400 text-black' : i === 1 ? 'bg-gray-300 text-black' : i === 2 ? 'bg-orange-400 text-black' : 'bg-white/10 text-white/50'}`}>{i + 1}</span>
                <span className="font-bold text-white/90 truncate max-w-[120px]">{entry.player_username}</span>
              </div>
              <div className="text-right">
                <span className="font-black text-cyan-400">
                  {lbMode === 'level' ? `Level ${entry.score} ${LEVELS.find(l => l.id === entry.score)?.emoji || ''}` : lbMode === 'daily' ? <span className="text-green-400">{entry.score.toLocaleString()}</span> : entry.score.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
        <Button onClick={() => setGameState('menu')} className="w-full bg-white/10 hover:bg-white/20 text-white py-6 rounded-2xl font-bold border-none">Zurück</Button>
      </motion.div>
    );
  }

  // Hook must be at top level — always called regardless of gameState
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data: topScore } = useQuery({
    queryKey: ['neonTop1', isProMode ? 'pro' : 'normal'],
    queryFn: async () => {
      const scores = await base44.entities.GameScore.filter(
        { game_type: isProMode ? 'neon_dash_pro' : 'neon_dash' }, '-score', 5
      );
      if (!scores?.length) return null;
      const unique = []; const seen = new Set();
      for (const s of scores) { if (!seen.has(s.player_username)) { seen.add(s.player_username); unique.push(s); } }
      return unique[0] || null;
    },
    staleTime: 60000,
    enabled: gameState === 'gameover',
  });

  if (gameState === 'gameover') {
    const currentHS = isProMode ? proHighScore : highScore;
    const isNewRecord = score >= currentHS && score > 0;
    const gapToRecord = currentHS - score;
    const nearRecord = !isNewRecord && gapToRecord > 0 && gapToRecord <= currentHS * 0.3 && currentHS > 0;

    const currentUser = (() => { try { const u = localStorage.getItem('app_user'); return u ? JSON.parse(u) : null; } catch { return null; } })();
    const gapToTop = topScore && topScore.player_username !== currentUser?.username ? topScore.score - score : null;

    return (
      <motion.div key="gameover" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="pointer-events-auto bg-black/80 backdrop-blur-2xl p-6 rounded-3xl border border-red-500/30 text-center shadow-[0_0_50px_rgba(244,63,94,0.2)] w-[90%] max-w-sm">
        
        {isNewRecord ? (
          <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.6 }}>
            <div className="text-5xl mb-2">🏆</div>
            <h2 className="text-3xl font-black text-yellow-400 mb-1">NEUER REKORD!</h2>
            <p className="text-yellow-300/60 text-sm mb-4">Persönlicher Highscore!</p>
          </motion.div>
        ) : (
          <div className="mb-4">
            <div className="text-4xl mb-1">💥</div>
            <h2 className="text-3xl font-black text-red-400 mb-0.5">CRASH!</h2>
            {isProMode && <p className="text-orange-400/70 text-xs font-bold">⚡ Pro Modus</p>}
          </div>
        )}

        {/* Score vs Best */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <p className="text-white/35 text-[10px] font-bold uppercase tracking-wider mb-1">Dieser Run</p>
            <p className="text-2xl font-black text-white">{score.toLocaleString()}</p>
          </div>
          <div className={`rounded-2xl p-3 border ${isNewRecord ? 'bg-yellow-500/12 border-yellow-400/35' : 'bg-white/5 border-white/10'}`}>
            <p className="text-white/35 text-[10px] font-bold uppercase tracking-wider mb-1">Dein Rekord</p>
            <p className={`text-2xl font-black ${isNewRecord ? 'text-yellow-400' : 'text-white/70'}`}>{currentHS > 0 ? currentHS.toLocaleString() : '–'}</p>
          </div>
        </div>

        {/* Tokens */}
        {tokensEarned > 0 && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.6, delay: 0.25 }}
            className="bg-green-500/8 border border-green-500/25 rounded-2xl px-4 py-3 mb-4">
            <p className="text-green-400 font-black text-base">+{tokensEarned.toLocaleString()} Tokens 💰</p>
            <div className="flex items-center justify-center gap-2 mt-0.5">
              {isProMode && <span className="text-orange-400/70 text-[10px] font-bold">⚡ 2× Pro</span>}
              {weekendBoostActive && <span className="text-yellow-400/70 text-[10px] font-bold">🎉 2× Weekend</span>}
            </div>
          </motion.div>
        )}

        {/* Motivation: Nähe zum eigenen Rekord */}
        {nearRecord && gapToRecord > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="bg-cyan-500/8 border border-cyan-500/20 rounded-2xl px-4 py-2.5 mb-3 text-center">
            <p className="text-cyan-300 font-bold text-xs">
              Nur noch <span className="text-white font-black">{gapToRecord.toLocaleString()} Punkte</span> bis zu deinem Rekord!
            </p>
          </motion.div>
        )}
        {/* Motivation: Abstand zu #1 */}
        {gapToTop && gapToTop > 0 && !isNewRecord && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="bg-yellow-500/6 border border-yellow-500/20 rounded-2xl px-4 py-2.5 mb-3 text-center">
            <p className="text-yellow-300/80 text-xs">
              🏆 <span className="text-white font-black">{gapToTop.toLocaleString()}</span> Pkt bis <span className="text-yellow-400">#{1} @{topScore.player_username}</span>
            </p>
          </motion.div>
        )}

        <div className="flex flex-col gap-2.5 mt-2">
          {!isProMode && (
            <Button onClick={() => startGame(false)} size="lg"
              className="w-full font-black py-5 rounded-2xl border-none bg-gradient-to-r from-cyan-600 to-blue-700 text-white">
              <RotateCcw className="w-4 h-4 mr-2" /> Nochmal (Normal)
            </Button>
          )}
          {isProMode && (
            <Button onClick={() => startGame(true)} size="lg"
              className="w-full font-black py-5 rounded-2xl border-none bg-gradient-to-r from-orange-600 to-red-700 text-white">
              <RotateCcw className="w-4 h-4 mr-2" /> Nochmal (Pro)
            </Button>
          )}
          {isProMode && (
            <Button onClick={() => startGame(false)} variant="ghost"
              className="w-full text-white/40 hover:text-white/70 rounded-2xl text-sm py-4 border border-white/8">
              Normal spielen
            </Button>
          )}
          {!isProMode && score > 0 && (
            <Button onClick={() => startGame(true)} variant="ghost"
              className="w-full text-orange-400/50 hover:text-orange-300 rounded-2xl text-xs py-3 border border-orange-500/15">
              ⚡ Pro Modus versuchen (2× Tokens)
            </Button>
          )}
          <Button onClick={() => setGameState('menu')} variant="ghost" className="w-full text-white/30 hover:text-white/60 rounded-2xl text-sm">Zum Menü</Button>
        </div>
      </motion.div>
    );
  }

  if (gameState === 'levelcomplete') {
    const currentLevelObj = LEVELS.find(l => l.id === currentLevelId);
    return (
      <motion.div key="levelcomplete" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', bounce: 0.4 }}
        className="pointer-events-auto bg-black/80 backdrop-blur-2xl p-8 rounded-3xl text-center w-[90%] max-w-sm"
        style={{ border: `1px solid ${currentLevelObj.color}50`, boxShadow: `0 0 50px ${currentLevelObj.color}25` }}>
        <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', bounce: 0.6, delay: 0.1 }}
          className="text-7xl mb-4">{currentLevelObj.emoji}</motion.div>
        <h2 className="text-3xl font-black mb-1" style={{ color: currentLevelObj.color }}>Level {currentLevelObj.id} geschafft!</h2>
        <p className="text-white/60 font-bold mb-5">{currentLevelObj.name}</p>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.6, delay: 0.3 }}
          className="rounded-2xl p-4 mb-6 border"
          style={{ backgroundColor: currentLevelObj.color + '12', borderColor: currentLevelObj.color + '40' }}>
          <p className="font-black text-2xl" style={{ color: currentLevelObj.color }}>+{currentLevelObj.reward.toLocaleString()} Tokens! 🏆</p>
        </motion.div>
        <div className="flex flex-col gap-3">
          {currentLevelObj.id < 10 && (
            <Button onClick={() => {
              const next = LEVELS.find(l => l.id === currentLevelObj.id + 1);
              if (next) startLevel(next);
            }} size="lg" className="w-full font-black text-lg py-6 rounded-2xl border-none text-white"
              style={{ background: `linear-gradient(135deg, ${currentLevelObj.color}, ${LEVELS[currentLevelObj.id]?.color || currentLevelObj.color})` }}>
              <Play className="w-5 h-5 mr-2 fill-white" /> Nächstes Level
            </Button>
          )}
          <Button onClick={() => setGameState('levelselect')} variant="ghost" className="w-full text-white/50 hover:text-white rounded-2xl">Level Auswahl</Button>
          <Button onClick={() => setGameState('menu')} variant="ghost" className="w-full text-white/30 hover:text-white/60 rounded-2xl text-sm">Hauptmenü</Button>
        </div>
      </motion.div>
    );
  }

  if (gameState === 'levelfailed') {
    const currentLevelObj = LEVELS.find(l => l.id === currentLevelId);
    const goalIcons = { survive: '⏱️', coins: '🪙', score: '⭐' };
    const goalText = currentLevelObj?.goal?.type === 'survive'
      ? `${currentLevelObj.goal.target} Sekunden überleben`
      : currentLevelObj?.goal?.type === 'coins'
      ? `${currentLevelObj.goal.target} Münzen sammeln`
      : `${currentLevelObj?.goal?.target?.toLocaleString()} Punkte erreichen`;
    return (
      <motion.div key="levelfailed" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="pointer-events-auto bg-black/80 backdrop-blur-2xl p-7 rounded-3xl border border-red-500/25 text-center shadow-[0_0_40px_rgba(244,63,94,0.18)] w-[90%] max-w-sm">
        <div className="text-5xl mb-3">💥</div>
        <h2 className="text-3xl font-black text-red-400 mb-1">Nicht geschafft!</h2>
        <p className="text-white/40 text-xs font-bold mb-4">Level {currentLevelObj?.id}: {currentLevelObj?.name}</p>

        {/* Ziel nochmal anzeigen */}
        <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 mb-5 text-left">
          <p className="text-white/30 text-[10px] uppercase tracking-wider font-black mb-1.5">Dein Ziel war</p>
          <div className="flex items-center gap-2">
            <span className="text-lg">{goalIcons[currentLevelObj?.goal?.type]}</span>
            <span className="text-white/70 text-sm font-bold">{goalText}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <Button onClick={() => startLevel(currentLevelObj)} size="lg"
            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 font-black text-base py-5 rounded-2xl border-none text-white">
            <RotateCcw className="w-4 h-4 mr-2" /> Nochmal versuchen
          </Button>
          <Button onClick={() => setGameState('levelselect')} variant="ghost" className="w-full text-white/45 hover:text-white rounded-2xl text-sm">Level Auswahl</Button>
        </div>
      </motion.div>
    );
  }

  return null;
}