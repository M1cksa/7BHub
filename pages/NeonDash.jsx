import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { playCollect, playCollision, playDimensionWarp } from '@/components/game/NeonDashSounds';
import { startMusic, stopMusic, updateMusic } from '@/components/game/NeonDashMusic';
import NeonDashStats from '@/components/game/NeonDashStats';
import { checkAchievements, AchievementToast } from '@/components/game/NeonDashAchievements';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import NeonDashMenu from '@/components/game/NeonDashMenu';
import { addWeeklyPoints } from '@/components/game/NeonDashWeeklyRewards';
import NeonDashGameOver from '@/components/game/NeonDashGameOver';
import NeonDashOnlineLobby from '@/components/game/NeonDashOnlineLobby';
import NeonDashOnlineResult from '@/components/game/NeonDashOnlineResult';
import NeonDashCoopResult from '@/components/game/NeonDashCoopResult';
import OnlineLiveHUD from '@/components/game/OnlineLiveHUD';
import { useNeonDashP2P } from '@/components/game/useNeonDashP2P';

const _seedFromId = (str) => { let h = 0x811c9dc5; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); } return h >>> 0; };
const _makePRNG = (seed) => { let s = seed >>> 0; return () => { s += 0x6D2B79F5; let t = s; t = Math.imul(t ^ (t >>> 15), 1 | t); t ^= t + Math.imul(t ^ (t >>> 7), 61 | t); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
import NeonDashWhatsAppPopup from '@/components/game/NeonDashWhatsAppPopup';
import { UPGRADES, SHIP_SKINS, POWERUP_TYPES, LEVELS } from '@/components/game/NeonDashConstants';
import { drawPlayer as drawPlayerSkin } from '@/components/game/NeonDashDrawPlayer';
import { APOCALYPSE_CONFIG, getApocalypseWave, getApocalypseSpeedMult, getApocalypseSpawnMult, checkShardMilestone, checkSkinUnlock, activateChainLightning, spawnVoidRift, rollVoidRiftEffect, computeModuleStats, WEATHER_EVENTS, shouldTriggerWeather, pickWeatherEvent } from '@/components/game/S2GameSystems';
import { loadModuleStats, applyModulesToState, getAgilityFactor, getWarpDirection } from '@/components/game/NeonDashModuleApply';
import { updateBullets } from '@/components/game/NeonDashBulletsSystem';
import S2LoadoutScreen from '@/components/game/S2LoadoutScreen';
import S2WeatherOverlay from '@/components/game/S2WeatherOverlay';
import { pickRandomSuperpower, applySuperpowerToState } from '@/components/game/DimensionSuperpowers';
import DimensionSuperpowerToastWrapper from '@/components/game/DimensionSuperpowerToastWrapper';

const DAILY_CHALLENGES = [
  { id: 0,  type: 'survive', target: 60,   desc: 'Überlebe 60 Sekunden',         reward: 500  },
  { id: 1,  type: 'coins',   target: 20,   desc: 'Sammle 20 Münzen',              reward: 400  },
  { id: 2,  type: 'score',   target: 2000, desc: 'Erreiche 2.000 Punkte',         reward: 600  },
  { id: 3,  type: 'survive', target: 120,  desc: 'Überlebe 120 Sekunden',         reward: 1000 },
  { id: 4,  type: 'coins',   target: 40,   desc: 'Sammle 40 Münzen',              reward: 800  },
  { id: 5,  type: 'score',   target: 5000, desc: 'Erreiche 5.000 Punkte',         reward: 1200 },
  { id: 6,  type: 'survive', target: 45,   desc: 'Überlebe 45 Sek im Pro Modus',  reward: 1500, proOnly: true },
  { id: 7,  type: 'coins',   target: 10,   desc: 'Sammle 10 Münzen',              reward: 300  },
  { id: 8,  type: 'score',   target: 1000, desc: 'Erreiche 1.000 Punkte',         reward: 350  },
  { id: 9,  type: 'survive', target: 90,   desc: 'Überlebe 90 Sekunden',          reward: 750  },
  { id: 10, type: 'coins',   target: 30,   desc: 'Sammle 30 Münzen im Pro Modus', reward: 900,  proOnly: true },
  { id: 11, type: 'score',   target: 8000, desc: 'Erreiche 8.000 Punkte (Pro)',   reward: 2000, proOnly: true },
];

const getTodayKey = () => new Date().toISOString().split('T')[0];
const getDailyChallenge = () => {
  const seed = getTodayKey().replace(/-/g, '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return DAILY_CHALLENGES[seed % DAILY_CHALLENGES.length];
};
const isWeekendBoost = () => { const d = new Date().getDay(); return d === 0 || d === 6; };
const isDimensionEvent = () => {
  const now = new Date();
  const weekNum = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
  return weekNum % 2 === 0;
};

export default function NeonDash() {
  const canvasRef    = useRef(null);
  const containerRef = useRef(null);
  const reqRef       = useRef(null);

  const [gameState, setGameState]       = useState('menu');
  const [score, setScore]               = useState(0);
  const [highScore, setHighScore]       = useState(() => parseInt(localStorage.getItem('neonHighScore') || '0'));
  const [proHighScore, setProHighScore] = useState(() => parseInt(localStorage.getItem('neonProHighScore') || '0'));
  const [tokensEarned, setTokensEarned] = useState(0);
  const [isProMode, setIsProMode]       = useState(false);
  const [activePowerups, setActivePowerups] = useState([]);
  const [lbMode, setLbMode]             = useState('daily');
  const [comboDisplay, setComboDisplay] = useState({ combo: 0, mult: 1 });
  const [inDimension, setInDimension]   = useState(false);
  const [currentDimStyle, setCurrentDimStyle] = useState('void');
  const [activeEnvEvent, setActiveEnvEvent] = useState(null);
  const [showLoadoutScreen, setShowLoadoutScreen] = useState(false);
  const [activeAchievements, setActiveAchievements] = useState([]); const [activeSuperpower, setActiveSuperpower] = useState(null);
  const unlockedAchievementsRef = useRef(new Set(
    JSON.parse(localStorage.getItem('neonAchievements') || '[]')
  ));
  const isMobile = /Android|iPhone|iPad|iPod|Tablet/i.test(navigator.userAgent) || window.innerWidth < 1024 || navigator.maxTouchPoints > 1;
  const [perfMode, setPerfMode] = useState(() => { const s = localStorage.getItem('neon_perf_mode'); return s !== null ? s === 'true' : isMobile; });
  const perfModeRef = useRef(perfMode);
  const togglePerfMode = () => {
    const next = !perfModeRef.current;
    perfModeRef.current = next;
    setPerfMode(next);
    localStorage.setItem('neon_perf_mode', next.toString());
    window.dispatchEvent(new Event('perf-mode-changed'));
  };

  const todayChallenge      = getDailyChallenge();
  const weekendBoostActive  = isWeekendBoost();
  const dimensionEventActive = isDimensionEvent();
  const [dailyProgress, setDailyProgress]   = useState(() => parseInt(localStorage.getItem(`neon_dc_${getTodayKey()}_progress`) || '0'));
  const [dailyCompleted, setDailyCompleted] = useState(() => localStorage.getItem(`neon_dc_${getTodayKey()}_completed`) === 'true');

  const [levelProgress, setLevelProgress] = useState(() => {
    try {
      const localProgress = JSON.parse(localStorage.getItem('neonLevelProgress') || '[]');
      const u = (() => { try { const s = localStorage.getItem('app_user'); return s && s !== 'undefined' ? JSON.parse(s) : null; } catch { return null; } })();
      const dbProgress = u?.neon_dash_stats?.level_progress || [];
      // Merge both sources
      const merged = [...new Set([...localProgress, ...dbProgress])];
      if (merged.length > localProgress.length) localStorage.setItem('neonLevelProgress', JSON.stringify(merged));
      return merged;
    } catch { return []; }
  });
  const levelProgressRef = useRef(levelProgress);
  levelProgressRef.current = levelProgress;
  const [currentLevelId, setCurrentLevelId]       = useState(null);
  const [levelGoalProgress, setLevelGoalProgress] = useState(0);
  const [levelWin, setLevelWin]                   = useState(false);

  const [user, setUser] = useState(() => {
    try { const u = localStorage.getItem('app_user'); return u && u !== 'undefined' ? JSON.parse(u) : null; } catch { return null; }
  });

  const [upgrades, setUpgrades] = useState(() => {
    try {
      if (user?.neon_dash_upgrades) return user.neon_dash_upgrades;
      return JSON.parse(localStorage.getItem('neonUpgrades_' + user?.id) || '{}');
    } catch { return {}; }
  });

  const getUpgradeLevel = (id) => upgrades[id] || 0;
  const getUpgradeCost  = (upg) => Math.floor(upg.baseCost * Math.pow(upg.costMult, getUpgradeLevel(upg.id)));
  const getOwnedSkins   = () => upgrades.owned_skins || ['default'];
  const getActiveSkin   = () => upgrades.active_skin || 'default';

  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery({
    queryKey: ['neonLeaderboard', lbMode],
    queryFn: async () => {
      let scores;
      if (lbMode === 'daily') {
        const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
        const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999);
        const all = await base44.entities.GameScore.filter({ game_type: 'neon_dash' }, '-score', 500);
        scores = (all || []).filter(s => { const d = new Date(s.created_date); return d >= todayStart && d <= todayEnd; });
      } else if (lbMode === 'week') {
        const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7); weekStart.setHours(0, 0, 0, 0);
        const weekEnd   = new Date(); weekEnd.setHours(23, 59, 59, 999);
        const all = await base44.entities.GameScore.filter({ game_type: 'neon_dash' }, '-score', 500);
        scores = (all || []).filter(s => { const d = new Date(s.created_date); return d >= weekStart && d <= weekEnd; });
      } else {
        const gameType = lbMode === 'pro' ? 'neon_dash_pro' : lbMode === 'level' ? 'neon_dash_level' : 'neon_dash';
        scores = await base44.entities.GameScore.filter({ game_type: gameType }, '-score', 100);
      }
      if (!scores) return [];
      const uniqueScores = []; const seenUsers = new Set();
      for (const s of scores) {
        if (!seenUsers.has(s.player_username)) {
          seenUsers.add(s.player_username); uniqueScores.push(s);
          if (uniqueScores.length >= 10) break;
        }
      }
      return uniqueScores;
    },
    enabled: gameState === 'leaderboard'
  });

  const buyUpgrade = async (upg) => {
    const level = getUpgradeLevel(upg.id);
    if (level >= upg.maxLevel) return;
    const cost = getUpgradeCost(upg);
    if (!user || (user.tokens || 0) < cost) { toast.error('Nicht genug Tokens!'); return; }
    const newUpgrades = { ...upgrades, [upg.id]: level + 1 };
    try {
      const updated = await base44.entities.AppUser.update(user.id, { tokens: user.tokens - cost, neon_dash_upgrades: newUpgrades });
      localStorage.setItem('app_user', JSON.stringify(updated));
      setUser(updated); setUpgrades(newUpgrades);
      toast.success(`${upg.name} verbessert!`);
      window.dispatchEvent(new Event('user-updated'));
    } catch { toast.error('Fehler beim Kauf'); }
  };

  const buySkin = async (skin) => {
    const owned = getOwnedSkins();
    if (owned.includes(skin.id)) {
      if (getActiveSkin() === skin.id) return;
      const newUpgrades = { ...upgrades, active_skin: skin.id };
      try {
        const updated = await base44.entities.AppUser.update(user.id, { neon_dash_upgrades: newUpgrades });
        localStorage.setItem('app_user', JSON.stringify(updated));
        setUser(updated); setUpgrades(newUpgrades);
        toast.success(`${skin.name} ausgerüstet!`);
      } catch { toast.error('Fehler'); }
      return;
    }
    if (!user || (user.tokens || 0) < skin.cost) { toast.error('Nicht genug Tokens!'); return; }
    const newUpgrades = { ...upgrades, owned_skins: [...owned, skin.id], active_skin: skin.id };
    try {
      const updated = await base44.entities.AppUser.update(user.id, { tokens: user.tokens - skin.cost, neon_dash_upgrades: newUpgrades });
      localStorage.setItem('app_user', JSON.stringify(updated));
      setUser(updated); setUpgrades(newUpgrades);
      toast.success(`${skin.name} gekauft & ausgerüstet!`);
      window.dispatchEvent(new Event('user-updated'));
    } catch { toast.error('Fehler beim Kauf'); }
  };

  // Online mode state
  const [onlineMatchId, setOnlineMatchId]       = useState(null);
  const [onlineIsPlayer1, setOnlineIsPlayer1]   = useState(false);
  const [onlineOppName, setOnlineOppName]       = useState('');
  const [onlineMyScore, setOnlineMyScore]       = useState(0);
  const [onlineOppScore, setOnlineOppScore]     = useState(0);
  const [isCoopMode, setIsCoopMode]             = useState(false);
  const [coopLives, setCoopLives]               = useState(3);
  const onlineMatchIdRef    = useRef(null);
  const onlineIsP1Ref       = useRef(false);
  const isCoopRef           = useRef(false);
  const coopLivesRef        = useRef(3);
  const onlineOppNameRef    = useRef('');
  const onlineScorePushRef  = useRef(null);
  const onlinePosRef        = useRef(null);
  const onlineSubRef        = useRef(null);
  const coopEndedRef        = useRef(false);
  const p2pModeRef          = useRef(false); // true = WebRTC active
  const { init: p2pInit, send: p2pSend, cleanup: p2pCleanup, connectedRef: p2pConnectedRef } = useNeonDashP2P();

  const stateRef = useRef({
    width: 0, height: 0,
    player: { x: 0, y: 0, size: 20 }, targetX: 0,
    obstacles: [], coins: [], powerups: [], particles: [], lasers: [], portals: [],
    activePowerups: {},
    speedMult: 1, score: 0, frames: 0,
    proMode: false, skinColor: '#ffffff', skinGlow: '#06b6d4',
    levelMode: false, levelGoal: null, levelId: 0,
    levelColor: '#06b6d4', levelTypes: ['normal'],
    levelTimeFrames: 0, levelCoinsCollected: 0, levelReward: 0,
    bgHue: 0, tempSkinColor: null, tempSkinFrames: 0,
    combo: 0, comboTimer: 0, dimensionActive: false, dimensionFrames: 0,
    dimensionPortal: null, lastDimensionThreshold: 0,
    lastFrameTime: null, elapsedTime: 0,
  });

  const startGame = (proMode = false) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const w = canvas.width, h = canvas.height;
    const playerSize = 18 - (getUpgradeLevel('smallHitbox') * 2);
    const modStats = loadModuleStats();
    const startSpeed = (proMode ? 0.9 : (1 - (getUpgradeLevel('slowStart') * 0.08))) * (modStats.speedMult || 1);
    const skin = SHIP_SKINS.find(s => s.id === getActiveSkin()) || SHIP_SKINS[0];
    setIsProMode(proMode);
    // Orbital mines
    const mineLvl = getUpgradeLevel('orbitalMine');
    const initMines = mineLvl > 0 ? Array.from({ length: mineLvl }, (_, i) => ({
      angle: (i / mineLvl) * Math.PI * 2,
      orbitR: 55 + i * 10,
      speed: 1.5 + i * 0.3,
      exploding: false, explodeTimer: 0,
    })) : [];
    stateRef.current = {
      width: w, height: h,
      player: { x: w / 2, y: h - 80, size: playerSize }, targetX: w / 2,
      obstacles: [], coins: [], powerups: [], particles: [], lasers: [], portals: [],
      activePowerups: {},
      speedMult: startSpeed, score: 0, frames: 0, proMode,
      upgrades: {
        coinMulti: getUpgradeLevel('coinMulti'), scoreBoost: getUpgradeLevel('scoreBoost'),
        speedCap: getUpgradeLevel('speedCap'), coinMagnet: getUpgradeLevel('coinMagnet'),
        powerupBoost: getUpgradeLevel('powerupBoost'), dualCannon: getUpgradeLevel('dualCannon'),
        bulletSize: getUpgradeLevel('bulletSize'), afterburner: getUpgradeLevel('afterburner'),
        ghostMode: getUpgradeLevel('ghostMode'), coinTrail: getUpgradeLevel('coinTrail'),
        warpDrive: getUpgradeLevel('warpDrive'), instantShield: getUpgradeLevel('instantShield'),
        orbitalMine: getUpgradeLevel('orbitalMine'), smallHitbox: getUpgradeLevel('smallHitbox'),
      },
      skinColor: skin.color, skinGlow: skin.glowColor, skinId: skin.id,
      levelMode: false, bgHue: 0, tempSkinColor: null, tempSkinFrames: 0,
      combo: 0, comboTimer: 0, dimensionActive: false, dimensionFrames: 0,
      dimensionPortal: null, lastDimensionThreshold: 0, lastFrameTime: null,
      challengeCoins: 0, dimensionEvent: isDimensionEvent(), dimensionCooldown: 0,
      maxCombo: 0, maxComboMult: 1, dimensionsEntered: 0, shieldSaves: 0,
      perfMode: perfModeRef.current,
      envEvent: null, envEventTimer: 0, envEventCooldown: 0,
      instantShieldCd: 0,
      ghostActive: false, ghostTimer: 0, ghostUsed: false,
      afterburnerActive: false, afterburnerTimer: 0, afterburnerCd: 0,
      warpCd: 0, warpFlash: 0,
      orbitalMines: initMines,
      coinTrailParticles: [],
      modStats,
    };
    const startShieldLvl = getUpgradeLevel('startShield');
    if (startShieldLvl > 0 && !modStats.noStartShield) {
      stateRef.current.activePowerups.shield = Date.now() + startShieldLvl * 8000 * (modStats.shieldDurationMult || 1);
    }
    setScore(0); setActivePowerups([]); setComboDisplay({ combo: 0, mult: 1 });
    setInDimension(false); setCurrentDimStyle('void'); setActiveEnvEvent(null);
    startMusic();
    setGameState('playing');
  };

  const startLevel = (lvl) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const w = canvas.width, h = canvas.height;
    const playerSize = 18 - (getUpgradeLevel('smallHitbox') * 2);
    const skin = SHIP_SKINS.find(s => s.id === getActiveSkin()) || SHIP_SKINS[0];
    setCurrentLevelId(lvl.id); setLevelGoalProgress(0); setLevelWin(false); setIsProMode(false);
    stateRef.current = {
      width: w, height: h,
      player: { x: w / 2, y: h - 80, size: playerSize }, targetX: w / 2,
      obstacles: [], coins: [], powerups: [], particles: [], lasers: [],
      activePowerups: {},
      speedMult: lvl.speed, score: 0, frames: 0, proMode: false,
      upgrades: {
        coinMulti: getUpgradeLevel('coinMulti'), scoreBoost: getUpgradeLevel('scoreBoost'),
        speedCap: getUpgradeLevel('speedCap'), coinMagnet: getUpgradeLevel('coinMagnet'),
        powerupBoost: getUpgradeLevel('powerupBoost'), dualCannon: getUpgradeLevel('dualCannon'),
        bulletSize: getUpgradeLevel('bulletSize'), afterburner: getUpgradeLevel('afterburner'),
        ghostMode: getUpgradeLevel('ghostMode'), coinTrail: getUpgradeLevel('coinTrail'),
        warpDrive: getUpgradeLevel('warpDrive'), instantShield: getUpgradeLevel('instantShield'),
        orbitalMine: getUpgradeLevel('orbitalMine'), smallHitbox: getUpgradeLevel('smallHitbox'),
      },
      skinColor: skin.color, skinGlow: skin.glowColor, skinId: skin.id,
      levelMode: true, levelGoal: lvl.goal, levelId: lvl.id, levelColor: lvl.color,
      levelTypes: lvl.types, levelTimeFrames: 0, levelCoinsCollected: 0, levelReward: lvl.reward,
      bgHue: 0, tempSkinColor: null, tempSkinFrames: 0,
      combo: 0, comboTimer: 0, dimensionActive: false, dimensionFrames: 0,
      dimensionPortal: null, lastDimensionThreshold: 0, lastFrameTime: null,
      challengeCoins: 0, dimensionEvent: false,
      maxCombo: 0, maxComboMult: 1, dimensionsEntered: 0, shieldSaves: 0,
      perfMode: perfModeRef.current,
    };
    setScore(0); setActivePowerups([]); setComboDisplay({ combo: 0, mult: 1 });
    setInDimension(false); setCurrentDimStyle('void'); setActiveAchievements([]);
    startMusic();
    setGameState('playing');
  };

  const endGame = async () => {
    stopMusic();
    setGameState('gameover');
    const finalScore = Math.floor(stateRef.current.score);
    const pro = stateRef.current.proMode;
    if (pro) { if (finalScore > proHighScore) { setProHighScore(finalScore); localStorage.setItem('neonProHighScore', finalScore.toString()); } }
    else { if (finalScore > highScore) { setHighScore(finalScore); localStorage.setItem('neonHighScore', finalScore.toString()); } }
    const multiplier  = pro ? 2 : 1;
    const weekendMult = isWeekendBoost() ? 2 : 1;
    const earned  = Math.floor((Math.floor(finalScore / 25) + 12) * multiplier * weekendMult);
    const xpEarned = Math.floor((Math.floor(finalScore / 25) + 15) * multiplier * weekendMult);
    setTokensEarned(earned);
    // Wöchentliche Punkte tracken
    addWeeklyPoints(finalScore);
    try {
      const cuStr = localStorage.getItem('app_user');
      const cu    = cuStr && cuStr !== 'undefined' ? JSON.parse(cuStr) : null;
      const prev  = cu?.neon_dash_stats || JSON.parse(localStorage.getItem('neonStats') || '{}');
      const rc    = stateRef.current.challengeCoins || 0;
      const upd   = { totalGames: (prev.totalGames||0)+1, totalFrames: (prev.totalFrames||0)+(stateRef.current.frames||0), totalCoins: (prev.totalCoins||0)+rc, maxCoinsOneGame: Math.max(prev.maxCoinsOneGame||0,rc), totalTokensEarned: (prev.totalTokensEarned||0)+earned, maxComboEver: Math.max(prev.maxComboEver||0,stateRef.current.maxCombo||0), dimensionsEntered: (prev.dimensionsEntered||0)+(stateRef.current.dimensionsEntered||0), proGames: (prev.proGames||0)+(pro?1:0), highScore: Math.max(prev.highScore||0,pro?0:finalScore), proHighScore: Math.max(prev.proHighScore||0,pro?finalScore:0) };
      localStorage.setItem('neonStats', JSON.stringify(upd));
      if (cu) base44.entities.AppUser.update(cu.id, { neon_dash_stats: upd }).then(updated => { localStorage.setItem('app_user', JSON.stringify(updated)); window.dispatchEvent(new Event('user-updated')); }).catch(() => {});
    } catch(e) {}
    if (user) {
      try {
        await base44.entities.GameScore.create({ player_username: user.username, player_id: user.id, score: finalScore, level: 1, coins_collected: 0, game_type: pro ? 'neon_dash_pro' : 'neon_dash' });
        try {
          const currentStr = localStorage.getItem('app_user');
          const currentUser = currentStr && currentStr !== 'undefined' ? JSON.parse(currentStr) : user;
          const { awardXpAndTokens } = await import('@/components/battlepass/xpUtils');
          await awardXpAndTokens(currentUser, xpEarned, earned, pro ? 'Neon Dash Pro' : 'Neon Dash');
        } catch(e) { console.error(e); }
      } catch(e) { console.error(e); }
    }
    const challenge = getDailyChallenge();
    const todayKeyStr = getTodayKey();
    const alreadyCompleted = localStorage.getItem(`neon_dc_${todayKeyStr}_completed`) === 'true';
    const timeSecs = Math.floor(stateRef.current.frames / 60);
    const runProgress = challenge.type === 'survive' ? timeSecs : challenge.type === 'coins' ? (stateRef.current.challengeCoins || 0) : finalScore;
    if (!challenge.proOnly || pro) {
      const prevProg = parseInt(localStorage.getItem(`neon_dc_${todayKeyStr}_progress`) || '0');
      const newProg  = Math.max(prevProg, runProgress);
      localStorage.setItem(`neon_dc_${todayKeyStr}_progress`, newProg.toString());
      setDailyProgress(newProg);
      if (!alreadyCompleted && newProg >= challenge.target) {
        localStorage.setItem(`neon_dc_${todayKeyStr}_completed`, 'true');
        setDailyCompleted(true);
        toast.success(`🎯 Daily Challenge abgeschlossen! +${challenge.reward.toLocaleString()} Tokens!`);
        if (user) {
          try {
            const currentStr = localStorage.getItem('app_user');
            const currentUser = currentStr && currentStr !== 'undefined' ? JSON.parse(currentStr) : user;
            const { awardXpAndTokens } = await import('@/components/battlepass/xpUtils');
            await awardXpAndTokens(currentUser, Math.floor(challenge.reward / 10), Math.floor(challenge.reward / 6), 'Neon Dash Daily Challenge');
          } catch(e) { console.error(e); }
        }
      }
    }
  };

  const endLevel = async (success) => {
    stopMusic();
    const state = stateRef.current;
    if (success) {
      setLevelWin(true); setGameState('levelcomplete');
      const lvlId = state.levelId, reward = state.levelReward;
      const prev = levelProgressRef.current;
      if (!prev.includes(lvlId)) {
        const next = [...prev, lvlId];
        setLevelProgress(next); levelProgressRef.current = next;
        localStorage.setItem('neonLevelProgress', JSON.stringify(next));
        // Always read fresh user from localStorage (avoids stale closure)
        try {
          const cuStr = localStorage.getItem('app_user');
          const cu = cuStr && cuStr !== 'undefined' ? JSON.parse(cuStr) : null;
          if (cu?.id) {
            const prevStats = cu.neon_dash_stats || {};
            const updStats = { ...prevStats, level_progress: next };
            const updated = await base44.entities.AppUser.update(cu.id, { neon_dash_stats: updStats });
            localStorage.setItem('app_user', JSON.stringify(updated));
            window.dispatchEvent(new Event('user-updated'));
          }
        } catch(e) { console.error('Level progress save failed:', e); }
      }
      setTokensEarned(reward);
      try {
        const cuStr = localStorage.getItem('app_user');
        const cu = cuStr && cuStr !== 'undefined' ? JSON.parse(cuStr) : null;
        if (cu?.id) {
          await base44.entities.GameScore.create({ player_username: cu.username, player_id: cu.id, score: lvlId, level: lvlId, coins_collected: state.levelCoinsCollected || 0, game_type: 'neon_dash_level' });
          const { awardXpAndTokens } = await import('@/components/battlepass/xpUtils');
          await awardXpAndTokens(cu, Math.floor(reward / 10), Math.floor(reward / 6), `Neon Dash Level ${lvlId}`);
        }
      } catch(e) { console.error(e); }
    } else {
      setLevelWin(false); setGameState('levelfailed');
    }
  };

  const startOnline = () => {
    setGameState('online_lobby');
  };

  const endCoopGame = async (livesLeft) => {
    clearInterval(onlineScorePushRef.current);
    clearInterval(onlinePosRef.current);
    if (onlineSubRef.current) { onlineSubRef.current(); onlineSubRef.current = null; }
    p2pCleanup();
    const finalScore = Math.floor(stateRef.current.score);
    setOnlineMyScore(finalScore);
    const weekendMult = isWeekendBoost() ? 2 : 1;
    const earned = Math.floor((finalScore / 40 + 8) * weekendMult);
    setTokensEarned(earned);
    setGameState('coop_result');

    const field = onlineIsP1Ref.current ? 'player1_score' : 'player2_score';
    const readyField = onlineIsP1Ref.current ? 'player1_ready' : 'player2_ready';
    base44.entities.NeonDashMatch.update(onlineMatchIdRef.current, {
      [field]: finalScore,
      [readyField]: true,
      shared_lives: livesLeft,
      status: 'finished',
    }).catch(() => {});

    if (user) {
      (async () => {
        try {
          const cuStr = localStorage.getItem('app_user');
          const cu = cuStr && cuStr !== 'undefined' ? JSON.parse(cuStr) : user;
          const { awardXpAndTokens } = await import('@/components/battlepass/xpUtils');
          await awardXpAndTokens(cu, earned / 2, earned, 'Neon Dash Co-op');
        } catch(e) {}
      })();
    }
  };

  const startOnlineGame = (matchId, isP1, oppName, isCoop = false) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const w = canvas.width, h = canvas.height;
    const playerSize = 18 - (getUpgradeLevel('smallHitbox') * 2);
    const skin = SHIP_SKINS.find(s => s.id === getActiveSkin()) || SHIP_SKINS[0];
    setOnlineMatchId(matchId);
    setOnlineIsPlayer1(isP1);
    setOnlineOppName(oppName);
    onlineOppNameRef.current = oppName;
    setOnlineMyScore(0);
    setOnlineOppScore(0);
    setIsCoopMode(isCoop);
    setCoopLives(3);
    isCoopRef.current = isCoop;
    coopLivesRef.current = 3;
    onlineMatchIdRef.current = matchId;
    onlineIsP1Ref.current = isP1;
    setIsProMode(false);
    stateRef.current = {
      width: w, height: h,
      player: { x: w / 2, y: h - 80, size: playerSize }, targetX: w / 2,
      obstacles: [], coins: [], powerups: [], particles: [], portals: [],
      activePowerups: {},
      speedMult: 1.0, score: 0, frames: 0, proMode: false,
      upgrades: {
        coinMulti: getUpgradeLevel('coinMulti'), scoreBoost: getUpgradeLevel('scoreBoost'),
        speedCap: getUpgradeLevel('speedCap'), coinMagnet: getUpgradeLevel('coinMagnet'),
        powerupBoost: getUpgradeLevel('powerupBoost'), dualCannon: getUpgradeLevel('dualCannon'),
        bulletSize: getUpgradeLevel('bulletSize'), afterburner: getUpgradeLevel('afterburner'),
        ghostMode: getUpgradeLevel('ghostMode'), coinTrail: getUpgradeLevel('coinTrail'),
        warpDrive: getUpgradeLevel('warpDrive'), instantShield: getUpgradeLevel('instantShield'),
        orbitalMine: getUpgradeLevel('orbitalMine'), smallHitbox: getUpgradeLevel('smallHitbox'),
      },
      skinColor: skin.color, skinGlow: skin.glowColor, skinId: skin.id,
      levelMode: false, bgHue: 0, tempSkinColor: null, tempSkinFrames: 0,
      combo: 0, comboTimer: 0, dimensionActive: false, dimensionFrames: 0,
      dimensionPortal: null, lastDimensionThreshold: 0, lastFrameTime: null,
      challengeCoins: 0, dimensionEvent: isDimensionEvent(), dimensionCooldown: 0,
      maxCombo: 0, maxComboMult: 1, dimensionsEntered: 0, shieldSaves: 0,
      perfMode: perfModeRef.current,
      onlineMode: true, coopMode: isCoop,
      instantShieldCd: 0, ghostActive: false, ghostTimer: 0, ghostUsed: false,
      afterburnerActive: false, afterburnerTimer: 0, afterburnerCd: 0,
      warpCd: 0, warpFlash: 0, orbitalMines: [],
    };
    coopEndedRef.current = false;
    setScore(0); setActivePowerups([]); setComboDisplay({ combo: 0, mult: 1 });
    setInDimension(false); setCurrentDimStyle('void');

    const _matchId = matchId;
    const _isP1 = isP1;
    const _isCoop = isCoop;
    p2pModeRef.current = false;

    const mySkinId = (SHIP_SKINS.find(s => s.id === getActiveSkin()) || SHIP_SKINS[0]).id;

    // ── Handler for incoming P2P/DB messages ──
    const handleMsg = (msg) => {
      if (msg.type === 'score') {
        setOnlineOppScore(msg.score);
        stateRef.current._onlineOppScore = msg.score;
      } else if (msg.type === 'state' && _isCoop) {
        const lives = msg.lives ?? coopLivesRef.current;
        if (lives < coopLivesRef.current) {
          coopLivesRef.current = lives;
          setCoopLives(lives);
          stateRef.current._coopLives = lives;
        }
        // Smooth partner position update
        if (msg.x !== undefined) stateRef.current._partnerTargetX = msg.x;
        if (msg.skin !== undefined) stateRef.current._partnerSkin = msg.skin;
        // P2P: P1 sends world state to P2 (obstacles + coins)
        if (msg.obstacles !== undefined) stateRef.current._remoteObstacles = msg.obstacles;
        if (msg.coins !== undefined) stateRef.current._remoteCoins = msg.coins;
        if (lives <= 0 && !coopEndedRef.current && stateRef.current.coopMode) {
          coopEndedRef.current = true;
          clearInterval(onlineScorePushRef.current);
          clearInterval(onlinePosRef.current);
          if (onlineSubRef.current) { onlineSubRef.current(); onlineSubRef.current = null; }
          p2pCleanup();
          endCoopGame(0);
        }
      } else if (msg.type === 'end') {
        if (!coopEndedRef.current && _isCoop) {
          coopEndedRef.current = true;
          clearInterval(onlineScorePushRef.current);
          clearInterval(onlinePosRef.current);
          p2pCleanup();
          endCoopGame(msg.lives ?? 0);
        }
      }
    };

    // ── DB sync (always starts, P2P cancels it when connected) ──
    const startDBSync = (_mid, _ip1, _ic, _onMsg) => {
      if (onlineSubRef.current) { onlineSubRef.current(); onlineSubRef.current = null; }
      onlineSubRef.current = base44.entities.NeonDashMatch.subscribe((event) => {
        if (p2pModeRef.current) return;
        if (event.id !== _mid) return;
        const m = event.data; if (!m) return;
        const oppS = _ip1 ? (m.player2_score || 0) : (m.player1_score || 0);
        _onMsg({ type: 'score', score: oppS });
        if (_ic) {
          const lives = m.shared_lives ?? 3;
          const px = _ip1 ? (m.player2_x || 0) : (m.player1_x || 0);
          const ps = _ip1 ? (m.player2_skin || 'default') : (m.player1_skin || 'default');
          _onMsg({ type: 'state', lives, x: px, skin: ps });
        }
      });
    };
    startDBSync(_matchId, _isP1, _isCoop, handleMsg);

    // ── Try WebRTC P2P ──
    p2pInit({
      matchId,
      isP1,
      onMessage: handleMsg,
      onConnected: () => {
        p2pModeRef.current = true;
        if (onlineSubRef.current) { onlineSubRef.current(); onlineSubRef.current = null; }
      },
      onFallback: () => { p2pModeRef.current = false; },
    });

    // ── Unified push loop (50ms = 20fps) ──
    clearInterval(onlineScorePushRef.current);
    clearInterval(onlinePosRef.current);
    const _sfDB = _isP1 ? 'player1_score' : 'player2_score';
    const _xfDB = _isP1 ? 'player1_x' : 'player2_x';
    const _skfDB = _isP1 ? 'player1_skin' : 'player2_skin';

    onlineScorePushRef.current = setInterval(() => {
      if (!onlineMatchIdRef.current) return;
      const st = stateRef.current;
      const s = Math.floor(st.score);
      const x = Math.round(st.player?.x || 0);

      if (p2pModeRef.current) {
        // P2P path
        if (_isCoop) {
          const payload = { type: 'state', score: s, lives: coopLivesRef.current, x, skin: mySkinId };
          // P1 = world authority: send obstacles + coins to P2
          if (_isP1 && st.obstacles && st.coins) {
            // Send compact representation (only key fields)
            payload.obstacles = st.obstacles.map(o => ({ x: o.x, y: o.y, w: o.width, h: o.height, vx: o.vx || 0, type: o.type, angle: o.angle || 0, color: o.color, speed: o.speed, startX: o.startX || o.x, wA: o.waveAmplitude || 0, wF: o.waveFrequency || 0, wO: o.waveOffset || 0 }));
            payload.coins = st.coins.map(c => ({ x: c.x, y: c.y, r: c.radius, speed: c.speed }));
          }
          p2pSend(payload);
        } else {
          p2pSend({ type: 'score', score: s });
        }
      } else {
        // DB fallback
        const dbUpdate = { [_sfDB]: s };
        if (_isCoop) { dbUpdate[_xfDB] = x; dbUpdate[_skfDB] = mySkinId; }
        base44.entities.NeonDashMatch.update(onlineMatchIdRef.current, dbUpdate).catch(() => {});
      }
    }, 50);

    setGameState('playing');
  };

  const endOnlineGame = () => {
    stopMusic();
    clearInterval(onlineScorePushRef.current);
    clearInterval(onlinePosRef.current);
    if (onlineSubRef.current) { onlineSubRef.current(); onlineSubRef.current = null; }
    p2pCleanup();
    const finalScore = Math.floor(stateRef.current.score);
    setOnlineMyScore(finalScore);

    // Change state IMMEDIATELY — no lag
    const weekendMult = isWeekendBoost() ? 2 : 1;
    const earned = Math.floor((finalScore / 40 + 10) * weekendMult);
    setTokensEarned(earned);
    setGameState('online_result');

    // DB updates in background
    const field = onlineIsP1Ref.current ? 'player1_score' : 'player2_score';
    const readyField = onlineIsP1Ref.current ? 'player1_ready' : 'player2_ready';
    base44.entities.NeonDashMatch.update(onlineMatchIdRef.current, {
      [field]: finalScore,
      [readyField]: true,
      status: 'finished',
    }).catch(() => {});

    if (user) {
      (async () => {
        try {
          const cuStr = localStorage.getItem('app_user');
          const cu = cuStr && cuStr !== 'undefined' ? JSON.parse(cuStr) : user;
          const { awardXpAndTokens } = await import('@/components/battlepass/xpUtils');
          await awardXpAndTokens(cu, earned / 2, earned, 'Neon Dash Online');
        } catch(e) {}
      })();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(onlineScorePushRef.current);
      clearInterval(onlinePosRef.current);
      if (onlineSubRef.current) { onlineSubRef.current(); onlineSubRef.current = null; }
      p2pCleanup();
      stopMusic();
    };
  }, []);

  // Sync level progress from DB on mount
  useEffect(() => {
    if (!user) return;
    base44.entities.AppUser.filter({ id: user.id }, '', 1).then(([freshUser]) => {
      if (!freshUser) return;
      const dbProgress = freshUser?.neon_dash_stats?.level_progress || [];
      if (dbProgress.length > levelProgressRef.current.length) {
        const merged = [...new Set([...levelProgressRef.current, ...dbProgress])];
        setLevelProgress(merged);
        levelProgressRef.current = merged;
        localStorage.setItem('neonLevelProgress', JSON.stringify(merged));
      }
    }).catch(() => {});
  }, []);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current, canvas = canvasRef.current;
      if (container && canvas) {
        canvas.width = container.clientWidth; canvas.height = container.clientHeight;
        stateRef.current.width = canvas.width; stateRef.current.height = canvas.height;
        if (gameState !== 'playing') { stateRef.current.player.x = canvas.width / 2; stateRef.current.player.y = canvas.height - 80; }
      }
    };
    window.addEventListener('resize', handleResize); handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [gameState]);

  const keysRef = useRef({});
  const buttonTouchIdsRef = useRef(new Set());

  useEffect(() => {
    const onKeyDown = (e) => { keysRef.current[e.key] = true; };
    const onKeyUp   = (e) => { keysRef.current[e.key] = false; };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); };
  }, []);

  // Pointer/touch movement — skip touches that are on ability buttons
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const handlePointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      if (e.touches) {
        // Find a touch that is NOT a button touch
        let movingTouch = null;
        for (let i = 0; i < e.touches.length; i++) {
          if (!buttonTouchIdsRef.current.has(e.touches[i].identifier)) {
            movingTouch = e.touches[i];
            break;
          }
        }
        if (!movingTouch) return;
        let x = movingTouch.clientX - rect.left;
        x = Math.max(stateRef.current.player.size, Math.min(canvas.width - stateRef.current.player.size, x));
        stateRef.current.targetX = x;
      } else {
        let x = e.clientX - rect.left;
        x = Math.max(stateRef.current.player.size, Math.min(canvas.width - stateRef.current.player.size, x));
        stateRef.current.targetX = x;
      }
    };
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    return () => { window.removeEventListener('mousemove', handlePointerMove); window.removeEventListener('touchmove', handlePointerMove); };
  }, []);

  // ── GAME LOOP ──
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const spawnParticles = (x, y, color, count) => {
      for (let i = 0; i < count; i++) {
        stateRef.current.particles.push({ x, y, vx: (Math.random() - 0.5) * 12, vy: (Math.random() - 0.5) * 12, life: 1, color });
      }
    };

    const drawPlayer = (p) => drawPlayerSkin(ctx, p, stateRef.current);

    const gameLoop = (timestamp) => {
      if (gameState !== 'playing') return;
      const state = stateRef.current;
      if (state.lastFrameTime === null) { state.lastFrameTime = timestamp; reqRef.current = requestAnimationFrame(gameLoop); return; }
      const deltaTime = (timestamp - state.lastFrameTime) / 1000;
      state.lastFrameTime = timestamp; state.elapsedTime += deltaTime;
      const dt = Math.min(deltaTime, 0.033);
      ctx.shadowBlur = 0;
      const { width: w, height: h, player } = state;
      if (state.perfMode) { ctx.shadowBlur = 0; ctx.shadowColor = 'transparent'; }
      const slowActive = !!state.activePowerups?.slowmo;
      const sf = slowActive ? 0.4 : (state.dimensionActive ? 0.65 : 1);
      const pm = state.perfMode;

      // Combo timer — time-based (seconds), not frame-based
      if (state.comboTimer > 0) {
        state.comboTimer -= dt;
        if (state.comboTimer <= 0 && state.combo > 0) { state.combo = 0; if (state.frames % 3 === 0) setComboDisplay({ combo: 0, mult: 1 }); }
      }
      const comboMult = Math.min(8, 1 + Math.floor((state.combo || 0) / 3) * 0.5);
      if (state.dimensionActive) state.dimensionFrames = (state.dimensionFrames || 0) + 1;
      state.bgHue = (state.bgHue || 0) + 0.3 * sf * dt * 60;
      const bgAlpha = state.levelMode ? 0.30 : 0.35;

      // ── BACKGROUND ──
      if (state.dimensionActive) {
        const dimStyle = state.dimensionStyle || 'void';
        const dimPulse = Math.sin(state.elapsedTime * 2.5) * 0.06 + 0.10;
        ctx.fillStyle = `rgba(5, 0, 15, ${bgAlpha})`; ctx.fillRect(0, 0, w, h);
        if (dimStyle === 'void') {
          ctx.fillStyle = `rgba(120, 0, 255, ${dimPulse})`; ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = `rgba(0, 200, 255, ${dimPulse * 0.4})`; ctx.fillRect(0, 0, w, h);
          if (!pm) { const vg = (state.frames * 4) % 80; ctx.strokeStyle = `rgba(160, 0, 255, 0.12)`; ctx.lineWidth = 1; for (let gy = -80 + vg; gy < h; gy += 80) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke(); } for (let gx = 0; gx < w; gx += 80) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke(); } }
          ctx.fillStyle = 'rgba(200, 150, 255, 0.7)'; const starCount = pm ? 6 : 12;
          for (let s = 0; s < starCount; s++) { const sx = (s * 137 + state.frames * 1.2 * s * 0.1) % w; const sy = (s * 97 + state.frames * 2.5) % h; ctx.beginPath(); ctx.arc(sx, sy, 1.5, 0, Math.PI * 2); ctx.fill(); }
        } else if (dimStyle === 'neon') {
          ctx.fillStyle = `rgba(0, 255, 100, ${dimPulse * 0.7})`; ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = `rgba(0, 200, 255, ${dimPulse * 0.3})`; ctx.fillRect(0, 0, w, h);
          ctx.font = '12px monospace'; ctx.fillStyle = 'rgba(34, 197, 94, 0.35)';
          for (let col = 0; col < Math.floor(w / 18); col++) { const charY = ((state.frames * 3 + col * 53) % (h + 20)) - 10; ctx.fillText(String.fromCharCode(33 + ((state.frames + col * 7) % 94)), col * 18, charY); }
          ctx.strokeStyle = 'rgba(0,255,120,0.06)'; ctx.lineWidth = 2; for (let sl = 0; sl < h; sl += 6) { ctx.beginPath(); ctx.moveTo(0, sl); ctx.lineTo(w, sl); ctx.stroke(); }
        } else if (dimStyle === 'fire') {
          ctx.fillStyle = `rgba(200, 0, 0, ${bgAlpha})`; ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = `rgba(255, 100, 0, ${dimPulse * 1.2})`; ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = `rgba(255, 220, 0, ${dimPulse * 0.4})`; ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = 'rgba(255, 160, 20, 0.8)';
          for (let e = 0; e < 18; e++) { const ex = (e * 97 + state.frames * 0.8) % w; const ey = h - ((e * 71 + state.frames * (2 + e % 3)) % (h + 20)); ctx.beginPath(); ctx.arc(ex, ey, 1.5 + (e % 3) * 0.5, 0, Math.PI * 2); ctx.fill(); }
          ctx.strokeStyle = 'rgba(255, 120, 0, 0.08)'; ctx.lineWidth = 1; for (let hl = 0; hl < h; hl += 10) { ctx.beginPath(); const wave = Math.sin(state.frames * 0.03 + hl * 0.1) * 3; ctx.moveTo(0, hl + wave); ctx.lineTo(w, hl - wave); ctx.stroke(); }
        } else if (dimStyle === 'cosmic') {
          ctx.fillStyle = `rgba(0, 10, 60, ${bgAlpha})`; ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = `rgba(30, 50, 200, ${dimPulse})`; ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = `rgba(100, 0, 200, ${dimPulse * 0.5})`; ctx.fillRect(0, 0, w, h);
          for (let s = 0; s < 20; s++) { const sx = (s * 113 + 50) % w; const sy = (s * 79 + 30) % h; const twinkle = Math.sin(state.frames * 0.08 + s * 1.3) * 0.5 + 0.5; ctx.fillStyle = `rgba(150, 200, 255, ${0.4 + twinkle * 0.6})`; ctx.beginPath(); ctx.arc(sx, sy, 1 + twinkle * 1.5, 0, Math.PI * 2); ctx.fill(); }
          ctx.strokeStyle = 'rgba(80, 120, 255, 0.08)'; ctx.lineWidth = 2; for (let sw = 0; sw < 4; sw++) { ctx.beginPath(); for (let t = 0; t < 100; t++) { const a = t * 0.2 + state.frames * 0.005 + sw * Math.PI / 2; const r = t * 1.5; const nx = w * 0.5 + Math.cos(a) * r; const ny = h * 0.5 + Math.sin(a) * r; t === 0 ? ctx.moveTo(nx, ny) : ctx.lineTo(nx, ny); } ctx.stroke(); }
        } else if (dimStyle === 'ice') {
          ctx.fillStyle = `rgba(0, 30, 80, ${bgAlpha})`; ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = `rgba(100, 200, 255, ${dimPulse * 0.6})`; ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = `rgba(200, 240, 255, ${dimPulse * 0.25})`; ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = 'rgba(200, 240, 255, 0.8)'; for (let sf2 = 0; sf2 < 20; sf2++) { const sfx = (sf2 * 89 + state.frames * (0.5 + sf2 * 0.05)) % w; const sfy = (sf2 * 61 + state.frames * (1 + sf2 % 3)) % h; ctx.beginPath(); ctx.arc(sfx, sfy, 1.5, 0, Math.PI * 2); ctx.fill(); }
          ctx.strokeStyle = 'rgba(150, 220, 255, 0.08)'; ctx.lineWidth = 1; const ig = (state.frames * 1.5) % 60; for (let gy = -60 + ig; gy < h; gy += 60) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke(); } for (let gx = 0; gx < w; gx += 60) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke(); }
        } else if (dimStyle === 'glitch') {
          ctx.fillStyle = `rgba(0, 0, 5, ${bgAlpha})`; ctx.fillRect(0, 0, w, h);
          const glitchCount = pm ? 4 : 8;
          for (let g = 0; g < glitchCount; g++) { if ((state.frames + g * 17) % 12 < 3) { const gy = (g * 71 + state.frames * 3) % h; const gh = 4 + (g % 5) * 6; const offset = (Math.random() - 0.5) * 40; ctx.save(); ctx.beginPath(); ctx.rect(0, gy, w, gh); ctx.clip(); ctx.fillStyle = g % 2 === 0 ? `rgba(255,0,255,0.25)` : `rgba(0,255,255,0.25)`; ctx.fillRect(offset, gy, w, gh); ctx.restore(); } }
          ctx.fillStyle = `rgba(255, 0, 255, ${dimPulse * 0.15})`; ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = 'rgba(0,255,255,0.07)'; ctx.lineWidth = 1; for (let sl = 0; sl < h; sl += 4) { ctx.beginPath(); ctx.moveTo(0, sl); ctx.lineTo(w, sl); ctx.stroke(); }
          for (let p2 = 0; p2 < (pm ? 10 : 25); p2++) { const px2 = Math.random() * w; const py2 = Math.random() * h; ctx.fillStyle = ['#ff00ff','#00ffff','#ffffff','#ff0055'][p2%4]; ctx.fillRect(px2, py2, 2, 2); }
        } else if (dimStyle === 'quantum') {
          ctx.fillStyle = `rgba(10, 0, 30, ${bgAlpha})`; ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = `rgba(124, 58, 237, ${dimPulse * 0.6})`; ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = `rgba(6, 182, 212, ${dimPulse * 0.25})`; ctx.fillRect(0, 0, w, h);
          for (let b = 0; b < (pm ? 8 : 18); b++) { const bx = (b * 113 + Math.sin(state.frames * 0.02 + b) * 50 + w/2) % w; const by = (b * 79 + Math.cos(state.frames * 0.015 + b) * 40 + h/2) % h; const br = 4 + Math.sin(state.frames * 0.05 + b * 2) * 3; ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.strokeStyle = `rgba(168, 85, 247, ${0.3 + Math.sin(state.frames*0.08+b)*0.2})`; ctx.lineWidth = 1.5; ctx.stroke(); }
          ctx.strokeStyle = 'rgba(6,182,212,0.06)'; ctx.lineWidth = 1; for (let row = 0; row < h; row += 8) { ctx.beginPath(); for (let x2 = 0; x2 <= w; x2 += 4) { const y2 = row + Math.sin(x2 * 0.04 + state.frames * 0.05) * 4 + Math.sin(x2 * 0.02 - state.frames * 0.03) * 3; x2 === 0 ? ctx.moveTo(x2, y2) : ctx.lineTo(x2, y2); } ctx.stroke(); }
        } else if (dimStyle === 'blood') {
          ctx.fillStyle = `rgba(30, 0, 0, ${bgAlpha})`; ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = `rgba(180, 0, 0, ${dimPulse * 0.8})`; ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = `rgba(255, 30, 30, ${dimPulse * 0.25})`; ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = 'rgba(200, 0, 0, 0.9)';
          for (let d = 0; d < (pm ? 6 : 14); d++) { const dx = (d * 97 + 30) % w; const dy = (d * 61 + state.frames * (1.5 + d % 3)) % (h + 60) - 30; const dlen = 15 + (d % 5) * 8; ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(dx + (d%3-1)*2, dy + dlen); ctx.lineWidth = 3 + d%3; ctx.strokeStyle = 'rgba(180,0,0,0.8)'; ctx.stroke(); ctx.beginPath(); ctx.arc(dx + (d%3-1)*2, dy + dlen, 4 + d%3, 0, Math.PI*2); ctx.fill(); }
          ctx.strokeStyle = 'rgba(150,0,0,0.08)'; ctx.lineWidth = 2; for (let v = 0; v < 5; v++) { ctx.beginPath(); for (let t = 0; t <= w; t += 5) { const vy2 = (h * (v+1)/6) + Math.sin(t * 0.03 + state.frames * 0.04 + v) * (8 + Math.sin(state.frames*0.06)*6); t === 0 ? ctx.moveTo(t, vy2) : ctx.lineTo(t, vy2); } ctx.stroke(); }
        } else if (dimStyle === 'aurora') {
          ctx.fillStyle = `rgba(0, 10, 20, ${bgAlpha})`; ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = `rgba(16, 185, 129, ${dimPulse * 0.5})`; ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = `rgba(6, 182, 212, ${dimPulse * 0.25})`; ctx.fillRect(0, 0, w, h);
          const auroraCount = pm ? 3 : 6;
          for (let a = 0; a < auroraCount; a++) { const ax = (a / auroraCount) * w; const aGrad = ctx.createLinearGradient(ax, 0, ax + w/auroraCount, h); aGrad.addColorStop(0, `rgba(16,185,129,0)`); aGrad.addColorStop(0.3 + Math.sin(state.frames*0.02+a)*0.1, `rgba(16,185,129,0.18)`); aGrad.addColorStop(0.6, `rgba(6,182,212,0.12)`); aGrad.addColorStop(1, `rgba(52,211,153,0)`); ctx.fillStyle = aGrad; const waveOff = Math.sin(state.frames * 0.015 + a * 1.2) * 20; ctx.beginPath(); ctx.moveTo(ax + waveOff, 0); ctx.lineTo(ax + w/auroraCount + waveOff, 0); ctx.lineTo(ax + w/auroraCount - waveOff, h); ctx.lineTo(ax - waveOff, h); ctx.closePath(); ctx.fill(); }
          ctx.fillStyle = 'rgba(200, 255, 220, 0.7)'; for (let s = 0; s < (pm ? 8 : 20); s++) { const sx = (s * 137 + 20) % w; const sy = (s * 89 + 15) % (h * 0.5); const twink = Math.sin(state.frames * 0.06 + s * 1.4) * 0.5 + 0.5; ctx.beginPath(); ctx.arc(sx, sy, twink * 1.5, 0, Math.PI*2); ctx.fill(); }
        } else if (dimStyle === 'thunder') {
          ctx.fillStyle = `rgba(10, 10, 0, ${bgAlpha})`; ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = `rgba(250, 204, 21, ${dimPulse * 0.6})`; ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = `rgba(249, 115, 22, ${dimPulse * 0.2})`; ctx.fillRect(0, 0, w, h);
          const boltCount = pm ? 2 : 5;
          for (let b = 0; b < boltCount; b++) { if ((state.frames + b * 7) % 20 < 4) { ctx.strokeStyle = 'rgba(255,255,100,0.9)'; ctx.lineWidth = 2; ctx.shadowBlur = 15; ctx.shadowColor = '#fde047'; ctx.beginPath(); let lx = (b * 137 + 50) % w; let ly = 0; ctx.moveTo(lx, ly); while (ly < h) { lx += (Math.random()-0.5)*60; ly += 20 + Math.random()*30; ctx.lineTo(lx, ly); } ctx.stroke(); ctx.shadowBlur = 0; } }
          ctx.fillStyle = 'rgba(253, 224, 71, 0.9)'; for (let e = 0; e < (pm ? 10 : 22); e++) { const ex = (e * 89 + state.frames * 4) % w; const ey = (e * 67 + state.frames * 2) % h; ctx.beginPath(); ctx.arc(ex, ey, 1.5 + (e%3)*0.5, 0, Math.PI*2); ctx.fill(); }
          for (let c = 0; c < 4; c++) { ctx.fillStyle = `rgba(20,15,0,0.15)`; ctx.beginPath(); ctx.ellipse((c*w/4) + w/8, (c%2)*60 + 20, 80, 30, 0, 0, Math.PI*2); ctx.fill(); }
        } else if (dimStyle === 'toxic') {
          ctx.fillStyle = `rgba(5, 20, 0, ${bgAlpha})`; ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = `rgba(132, 204, 22, ${dimPulse * 0.55})`; ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = `rgba(34, 197, 94, ${dimPulse * 0.2})`; ctx.fillRect(0, 0, w, h);
          const bubbleTime = state.frames * 0.02;
          for (let b = 0; b < (pm ? 8 : 18); b++) { const bx2 = (b * 97 + Math.sin(bubbleTime + b) * 20) % w; const by2 = h - 20 - ((b * 37 + state.frames * (1 + b%3)) % (h * 0.7)); const br2 = 3 + (b%4)*2; ctx.beginPath(); ctx.arc(bx2, by2, br2, 0, Math.PI*2); ctx.fillStyle = `rgba(163, 230, 53, ${0.5 + Math.sin(bubbleTime+b)*0.3})`; ctx.fill(); }
          ctx.fillStyle = 'rgba(132,204,22,0.7)'; for (let d = 0; d < (pm ? 5 : 10); d++) { const dx2 = (d * 113 + 40) % w; const dy2 = (d * 47 + state.frames * (1 + d%2)) % (h * 0.6); ctx.fillRect(dx2, 0, 2, dy2); ctx.beginPath(); ctx.arc(dx2+1, dy2, 4, 0, Math.PI*2); ctx.fill(); }
          ctx.strokeStyle = 'rgba(132,204,22,0.04)'; ctx.lineWidth = 1; for (let sl = 0; sl < h; sl += 5) { ctx.beginPath(); ctx.moveTo(0, sl); ctx.lineTo(w, sl); ctx.stroke(); }
        } else if (dimStyle === 'neo') {
          ctx.fillStyle = `rgba(40, 20, 0, ${bgAlpha})`; ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = `rgba(251, 191, 36, ${dimPulse * 0.8})`; ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = `rgba(168, 85, 247, ${dimPulse * 0.4})`; ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = 'rgba(251, 191, 36, 0.9)'; for (let p2 = 0; p2 < 15; p2++) { const px = (p2 * 127 + state.frames * 2.5) % w; const py = (p2 * 83 + state.frames * 1.8) % h; ctx.beginPath(); ctx.arc(px, py, 2 + Math.sin(state.frames * 0.1 + p2) * 1, 0, Math.PI * 2); ctx.fill(); }
          ctx.strokeStyle = 'rgba(168, 85, 247, 0.1)'; ctx.lineWidth = 1.5; for (let sl = 0; sl < 3; sl++) { ctx.beginPath(); for (let t = 0; t < 80; t++) { const a = t * 0.08 + state.frames * 0.004 + sl * Math.PI * 0.66; const rr = t * 1.2; const nx = w * 0.5 + Math.cos(a) * rr; const ny = h * 0.5 + Math.sin(a) * rr; t === 0 ? ctx.moveTo(nx, ny) : ctx.lineTo(nx, ny); } ctx.stroke(); }
        }
      } else {
        ctx.fillStyle = `rgba(5, 5, 10, ${bgAlpha})`; ctx.fillRect(0, 0, w, h);
        if (state.levelMode && state.levelColor) { const pulse = Math.sin(state.frames * 0.05) * 0.04 + 0.04; ctx.fillStyle = state.levelColor + Math.floor(pulse * 255).toString(16).padStart(2, '0'); ctx.fillRect(0, 0, w, h); }
        const gridOffset = (state.frames * state.speedMult * 2) % 60;
        
        ctx.strokeStyle = `rgba(6, 182, 212, ${Math.min(0.15, 0.03 + state.speedMult * 0.02)})`; ctx.lineWidth = 1.5;
        for (let gy = -60 + gridOffset; gy < h; gy += 60) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke(); }
        for (let gx = 0; gx < w; gx += 60) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke(); }

        // ── ENV EVENT VISUAL OVERLAYS ──
        if (state.envEvent) {
          const evProgress = 1 - (state.envEventTimer / state.envEvent.duration);
          const evPulse = Math.sin(state.frames * 0.07) * 0.06 + 0.07;
          if (state.envEvent.id === 'gravity_storm') {
            // Swirling blue tint + horizontal wave lines
            ctx.fillStyle = `rgba(56,189,248,${evPulse})`; ctx.fillRect(0, 0, w, h);
            if (!pm) {
              ctx.strokeStyle = `rgba(125,211,252,0.10)`; ctx.lineWidth = 1.5;
              for (let wl = 0; wl < h; wl += 30) {
                ctx.beginPath();
                for (let wx = 0; wx <= w; wx += 6) {
                  const wy = wl + Math.sin(wx * 0.04 + state.frames * 0.06) * 8;
                  wx === 0 ? ctx.moveTo(wx, wy) : ctx.lineTo(wx, wy);
                }
                ctx.stroke();
              }
            }
          } else if (state.envEvent.id === 'meteor_shower') {
            // Orange tint + diagonal streak lines
            ctx.fillStyle = `rgba(249,115,22,${evPulse})`; ctx.fillRect(0, 0, w, h);
            if (!pm) {
              ctx.strokeStyle = 'rgba(251,191,36,0.08)'; ctx.lineWidth = 1;
              for (let sl = 0; sl < w + h; sl += 40) {
                ctx.beginPath(); ctx.moveTo(sl, 0); ctx.lineTo(sl - h * 0.5, h); ctx.stroke();
              }
            }
          } else if (state.envEvent.id === 'energy_surge') {
            // Purple electric tint
            ctx.fillStyle = `rgba(168,85,247,${evPulse})`; ctx.fillRect(0, 0, w, h);
            if (!pm && state.frames % 8 < 2) {
              ctx.strokeStyle = 'rgba(216,180,254,0.15)'; ctx.lineWidth = 2;
              const lx = Math.random() * w;
              ctx.beginPath(); ctx.moveTo(lx, 0);
              let cy = 0;
              while (cy < h) { ctx.lineTo(lx + (Math.random() - 0.5) * 30, cy += 25 + Math.random() * 20); }
              ctx.stroke();
            }
          }
        }
      }

      state.frames++;
      if (state.levelMode) state.levelTimeFrames = (state.levelTimeFrames || 0) + dt * 60;

      const portalOpen = !!state.dimensionPortal;
      const scoreBoostMult = 1 + (state.upgrades?.scoreBoost || 0) * 0.1;
      const scoreX2Active = !!state.activePowerups?.score_x2;
      const scoreX2Mult = scoreX2Active ? 2.0 : 1.0;
      if (!portalOpen) state.score += 0.22 * state.speedMult * sf * comboMult * scoreBoostMult * scoreX2Mult * dt * 60;
      const speedCapFactor = 1 - (state.upgrades?.speedCap || 0) * 0.12;
      // Normal: accelerates noticeably over ~4min to reach 2x; Pro: faster ramp, starts at 1.5x
      if (!state.levelMode) state.speedMult += (state.proMode ? 0.0018 : 0.0007) * sf * speedCapFactor * dt * 60;

      // ── Instant Shield [S] ────────────────────────────────────────────
      const _shieldLvl = state.upgrades?.instantShield || 0;
      if (_shieldLvl > 0) {
        if ((state.instantShieldCd || 0) > 0) state.instantShieldCd -= dt;
        const keys = keysRef.current;
        const _isk = keys['s'] || keys['S'];
        if (_isk && !state._sPressed && (state.instantShieldCd || 0) <= 0) {
          state._sPressed = true;
          const duration = (5 + _shieldLvl * 2) * 1000 * (state.modStats?.shieldDurationMult || 1);
          state.activePowerups.shield = Date.now() + duration;
          setActivePowerups(Object.keys(state.activePowerups));
          state.instantShieldCd = [30, 22, 15][_shieldLvl - 1] || 30;
          for (let pi = 0; pi < 10; pi++) state.particles.push({ x: player.x, y: player.y, vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10, life: 0.6, color: '#00d4ff' });
        }
        if (!_isk) state._sPressed = false;
      }

      // ── Afterburner [SHIFT] ────────────────────────────────────────────
      const _afterLvl = state.upgrades?.afterburner || 0;
      if (_afterLvl > 0) {
        if ((state.afterburnerCd || 0) > 0) state.afterburnerCd -= dt;
        const keys = keysRef.current;
        const _shiftHeld = keys['Shift'];
        if (_shiftHeld && !state.afterburnerActive && (state.afterburnerCd || 0) <= 0) {
          state.afterburnerActive = true;
          state.afterburnerTimer = 0.8 + _afterLvl * 0.4;
          state.afterburnerCd = 8;
        }
        if (state.afterburnerActive) {
          state.afterburnerTimer -= dt;
          if (state.afterburnerTimer <= 0) state.afterburnerActive = false;
        }
      }

      // ── Warp Drive [W] ─────────────────────────────────────────────────
      const _warpLvl = state.upgrades?.warpDrive || 0;
      if (_warpLvl > 0) {
        if ((state.warpCd || 0) > 0) state.warpCd -= dt;
        if ((state.warpFlash || 0) > 0) state.warpFlash -= dt * 4;
        const _warpKeys = keysRef.current;
        const _wk = _warpKeys['w'] || _warpKeys['W'];
        if (_wk && !state._warpPressed && (state.warpCd || 0) <= 0) {
          state._warpPressed = true;
          const warpDist = 180 + _warpLvl * 50; // buffed: was 150+30 per lvl
          const dir = getWarpDirection(player.x, w);
          const newX = Math.max(player.size, Math.min(w - player.size, player.x + dir * warpDist));
          for (let wi = 0; wi < 16; wi++) state.particles.push({ x: player.x, y: player.y, vx: (Math.random()-0.5)*14, vy: (Math.random()-0.5)*14, life: 0.5, color: '#a855f7' });
          player.x = newX; state.targetX = newX;
          state.warpCd = [20, 15, 10][_warpLvl - 1] || 20;
          state.warpFlash = 1.0;
        }
        if (!_warpKeys['w'] && !_warpKeys['W']) state._warpPressed = false;
      }

      // ── Ghost Mode timer ──────────────────────────────────────────────
      if (state.ghostActive && (state.ghostTimer || 0) > 0) {
        state.ghostTimer -= dt;
        if (state.ghostTimer <= 0) { state.ghostActive = false; state.ghostTimer = 0; }
      }

      // ── Orbital Mines ─────────────────────────────────────────────────
      if (state.orbitalMines && state.orbitalMines.length > 0) {
        for (let mi = state.orbitalMines.length - 1; mi >= 0; mi--) {
          const mine = state.orbitalMines[mi];
          if (mine.exploding) { mine.explodeTimer -= dt; if (mine.explodeTimer <= 0) state.orbitalMines.splice(mi, 1); continue; }
          mine.angle = (mine.angle || 0) + mine.speed * dt;
          mine.wx = player.x + Math.cos(mine.angle) * mine.orbitR;
          mine.wy = player.y + Math.sin(mine.angle) * mine.orbitR;
          for (let oi = state.obstacles.length - 1; oi >= 0; oi--) {
            const ob = state.obstacles[oi];
            const mx = mine.wx - (ob.x + ob.width/2), my = mine.wy - (ob.y + ob.height/2);
            if (mx*mx + my*my < (ob.width/2 + 14)**2) {
              mine.exploding = true; mine.explodeTimer = 0.4;
              state.score += 120 * Math.max(1, state.combo || 1);
              for (let ep = 0; ep < 12; ep++) state.particles.push({ x: mine.wx, y: mine.wy, vx: (Math.random()-0.5)*12, vy: (Math.random()-0.5)*12, life: 0.6, color: '#f97316' });
              state.obstacles.splice(oi, 1); break;
            }
          }
          if (!mine.exploding) {
            ctx.save(); ctx.translate(mine.wx, mine.wy);
            const mPulse = Math.sin(state.elapsedTime * 4 + mi) * 0.2 + 0.8;
            ctx.shadowBlur = pm ? 8 : 18; ctx.shadowColor = '#f97316';
            ctx.fillStyle = `rgba(249,115,22,${mPulse})`;
            ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(0, 0, 11, 0, Math.PI*2); ctx.stroke();
            ctx.restore();
            if (!pm) {
              ctx.save(); ctx.globalAlpha = 0.1; ctx.strokeStyle = '#f97316'; ctx.lineWidth = 1;
              ctx.beginPath(); ctx.arc(player.x, player.y, mine.orbitR, 0, Math.PI*2); ctx.stroke(); ctx.restore();
            }
          } else {
            const prog = 1 - mine.explodeTimer / 0.4;
            ctx.save(); ctx.globalAlpha = (1-prog) * 0.9; ctx.fillStyle = '#ff6600';
            ctx.beginPath(); ctx.arc(mine.wx, mine.wy, 7*(1+prog*2), 0, Math.PI*2); ctx.fill(); ctx.restore();
          }
        }
      }

      // Expire power-ups
      const now = Date.now(); let changed = false;
      for (const [key, expiry] of Object.entries(state.activePowerups)) { if (now > expiry) { delete state.activePowerups[key]; changed = true; } }
      if (changed) setActivePowerups(Object.keys(state.activePowerups));

      // Magnet (also apply coinTrail upgrade extra radius)
      const _coinMagLvl = state.upgrades?.coinMagnet || 0;
      const _coinTrailLvl = state.upgrades?.coinTrail || 0;
      if (state.activePowerups?.magnet || _coinTrailLvl > 0) {
        const magnetRadius = (state.activePowerups?.magnet ? 200 : 80) + _coinMagLvl * 60 + _coinTrailLvl * 40;
        for (const c of state.coins) { const dx = player.x - c.x, dy = player.y - c.y; if (Math.sqrt(dx * dx + dy * dy) < magnetRadius) { c.x += dx * 0.08; c.y += dy * 0.08; } }
      }

      // Afterburner + Agility Core module applied to player movement
      const _agilityFactor = getAgilityFactor(state);
      player.x += (state.targetX - player.x) * (1 - Math.exp(-5 * _agilityFactor * dt));
      player.y += (h - 80 - player.y) * (1 - Math.exp(-3 * dt));

      // ── BEAT / RHYTHM SYSTEM ──
      // BPM synced to music speed (~120 BPM base). A "beat" every ~30 frames at 60fps.
      const BPM_BASE = 120;
      const beatInterval = Math.round((60 / BPM_BASE) * 60 / state.speedMult);
      const isBeat = state.frames % Math.max(8, beatInterval) === 0;
      const isBeatDrop = state.envEvent?.id === 'beat_drop';

      // Rhythm dodge tracking: did the player dodge an obstacle within beat window?
      if (!state.rhythmStreak) state.rhythmStreak = 0;
      if (!state.rhythmBeatWindow) state.rhythmBeatWindow = 0;
      state.rhythmBeatWindow = Math.max(0, (state.rhythmBeatWindow || 0) - dt);

      // Flash effect on beat (subtle canvas pulse)
      if (isBeat && !pm && state.speedMult > 1.1) {
        state.particles.push({ x: w / 2, y: h / 2, vx: 0, vy: 0, life: 0.18, color: state.dimensionActive ? (state.skinGlow || '#a855f7') : '#ffffff', isBeatFlash: true, bw: w, bh: h });
      }

      // ── SPAWN OBSTACLES ──
      // P2 in co-op P2P mode: use world state received from P1 instead of local RNG
      const isP2RemoteWorld = state.coopMode && !onlineIsP1Ref.current && p2pModeRef.current;
      if (isP2RemoteWorld && state._remoteObstacles !== undefined) {
        state.obstacles = state._remoteObstacles.map(o => ({
          x: o.x, y: o.y, width: o.w, height: o.h, vx: o.vx || 0,
          type: o.type, angle: o.angle || 0, color: o.color, speed: o.speed,
          startX: o.startX || o.x, waveAmplitude: o.wA || 0, waveFrequency: o.wF || 0, waveOffset: o.wO || 0,
          hp: o.hp, maxHp: o.maxHp, homingTimer: o.homingTimer,
        }));
        state._remoteObstacles = undefined;
      } else if (!isP2RemoteWorld) {
        // Beat Drop: obstacles spawn on every beat
        const spawnRate = isBeatDrop
          ? Math.max(8, beatInterval)
          : (state.proMode ? Math.max(22, Math.floor(65 / state.speedMult)) : Math.max(20, Math.floor(60 / state.speedMult)));

        const shouldSpawn = isBeatDrop ? isBeat : (!portalOpen && state.frames % spawnRate === 0);
        if (shouldSpawn && !portalOpen) {
          let type;
          if (state.levelMode) {
            const types = state.levelTypes || ['normal'];
            type = types[Math.floor(Math.random() * types.length)];
          } else {
            const typeRoll = Math.random();
            const spd = state.speedMult;
            if (state.proMode) {
              type = typeRoll < 0.30 ? 'normal' : typeRoll < 0.44 ? 'zigzag' : typeRoll < 0.56 ? 'bounce' : typeRoll < 0.68 ? 'rotating' : typeRoll < 0.77 ? 'cross' : typeRoll < 0.86 ? 'wave' : typeRoll < 0.93 ? 'homing' : 'pulsar';
            } else if (spd < 1.4) {
              type = typeRoll < 0.72 ? 'normal' : typeRoll < 0.88 ? 'zigzag' : typeRoll < 0.96 ? 'cross' : 'pulsar';
            } else if (spd < 1.8) {
              type = typeRoll < 0.42 ? 'normal' : typeRoll < 0.60 ? 'zigzag' : typeRoll < 0.73 ? 'bounce' : typeRoll < 0.84 ? 'wave' : typeRoll < 0.92 ? 'cross' : 'pulsar';
            } else {
              type = typeRoll < 0.24 ? 'normal' : typeRoll < 0.40 ? 'zigzag' : typeRoll < 0.55 ? 'bounce' : typeRoll < 0.68 ? 'rotating' : typeRoll < 0.78 ? 'wave' : typeRoll < 0.87 ? 'cross' : typeRoll < 0.94 ? 'homing' : 'pulsar';
            }
          }
          const size = 25 + Math.random() * 45;
          const isMeteor = state.envEvent?.id === 'meteor_shower';
          const meteorVx = isMeteor ? (Math.random() > 0.5 ? 1 : -1) * (0.8 + Math.random() * 1.5) : 0;
          const obColor = isMeteor ? '#f97316'
            : type === 'wave' ? '#22d3ee'
            : type === 'laser' ? '#ff0080'
            : type === 'cross' ? '#f59e0b'
            : type === 'homing' ? '#ec4899'
            : type === 'pulsar' ? '#a855f7'
            : '#f43f5e';
          state.obstacles.push({
            x: Math.random() * (w - size), y: -size,
            startX: Math.random() * (w - size),
            width: size, height: size,
            speed: (isMeteor ? (3 + Math.random() * 3) : (5 + Math.random() * 5)) * state.speedMult * sf,
            color: obColor, type, angle: 0,
            vx: (type === 'zigzag' || type === 'bounce') ? (Math.random() > 0.5 ? 3 : -3) : meteorVx,
            waveAmplitude: 60 + Math.random() * 80,
            waveFrequency: 0.03 + Math.random() * 0.04,
            waveOffset: Math.random() * Math.PI * 2,
            // New type data
            homingTimer: type === 'homing' ? 120 : 0, // frames to track player
            pulsarPhase: Math.random() * Math.PI * 2, // pulsar oscillation offset
            beatSpawned: isBeat, // was this spawned on a beat?
          });
        }

        if (!portalOpen && state.proMode && state.frames % Math.max(450, Math.floor(1000 / state.speedMult)) === 0) {
          const gapW = 180 + Math.random() * 100; const gapX = Math.random() * (w - gapW - 40) + 20; const wallSpeed = (4 + Math.random() * 3) * state.speedMult * sf;
          state.obstacles.push({ x: 0, y: -20, width: gapX, height: 20, speed: wallSpeed, color: '#7c3aed', type: 'wall', angle: 0, vx: 0 });
          state.obstacles.push({ x: gapX + gapW, y: -20, width: w - gapX - gapW, height: 20, speed: wallSpeed, color: '#7c3aed', type: 'wall', angle: 0, vx: 0 });
        }

        // ── SCORE MULTIPLIER ORB ──
        // Spawns as a special pickup (golden orb) — gives x2 score for 8 seconds
        if (!portalOpen && !state.levelMode && state.speedMult > 1.2 && state.frames % Math.max(400, Math.floor(900 / state.speedMult)) === 0 && Math.random() < 0.6) {
          state.powerups.push({
            x: Math.random() * (w - 40) + 20, y: -20, radius: 18,
            speed: 3.5 * state.speedMult * sf,
            id: 'score_x2', name: 'Score x2', emoji: '✨',
            color: '#f59e0b', glow: '#fde047', duration: 8000,
            isScoreOrb: true,
          });
        }
      }

      // ── DYNAMIC ENVIRONMENT EVENTS ──
      const ENV_EVENTS = [
        { id: 'gravity_storm',  name: 'GRAVITY STORM',  emoji: '🌀', color: '#38bdf8', duration: 480, cooldown: 1800 },
        { id: 'meteor_shower',  name: 'METEOR SHOWER',  emoji: '☄️',  color: '#f97316', duration: 360, cooldown: 2200 },
        { id: 'energy_surge',   name: 'ENERGY SURGE',   emoji: '⚡', color: '#a855f7', duration: 420, cooldown: 2000 },
        { id: 'beat_drop',      name: 'BEAT DROP',      emoji: '🎵', color: '#ec4899', duration: 300, cooldown: 2500 },
      ];
      if (!state.levelMode) {
        if (state.envEventCooldown > 0) state.envEventCooldown -= dt * 60;
        if (state.envEvent) {
          state.envEventTimer -= dt * 60;
          if (state.envEventTimer <= 0) {
            const endedEventId = state.envEvent.id;
            state.envEvent = null;
            state.envEventCooldown = ENV_EVENTS.find(e => e.id === endedEventId)?.cooldown || 1800;
            setActiveEnvEvent(null);
          }
        } else if (state.score > 800 && state.envEventCooldown <= 0 && state.frames % 180 === 0 && Math.random() < 0.55) {
          const roll = Math.floor(Math.random() * ENV_EVENTS.length);
          const ev = ENV_EVENTS[roll];
          state.envEvent = { ...ev };
          state.envEventTimer = ev.duration;
          state.envEventCooldown = ev.cooldown;
          setActiveEnvEvent({ name: ev.name, emoji: ev.emoji, color: ev.color });
          // For meteor shower: flip all existing obstacles to angle
          if (ev.id === 'meteor_shower') {
            for (const ob of state.obstacles) {
              ob.vx = (Math.random() > 0.5 ? 1 : -1) * (0.8 + Math.random() * 1.2);
            }
          }
        }
        // Spawn energy wall during energy surge
        if (state.envEvent?.id === 'energy_surge' && !portalOpen && state.frames % 120 === 0) {
          const gapW = 120 + Math.random() * 100;
          const gapX = 40 + Math.random() * (w - gapW - 80);
          const wallSpeed = (4 + Math.random() * 2.5) * state.speedMult * sf;
          state.obstacles.push({ x: 0, y: -18, width: gapX, height: 18, speed: wallSpeed, color: '#a855f7', type: 'energyWall', angle: 0, vx: 0 });
          state.obstacles.push({ x: gapX + gapW, y: -18, width: w - gapX - gapW, height: 18, speed: wallSpeed, color: '#a855f7', type: 'energyWall', angle: 0, vx: 0 });
        }
      }

      // ── UPDATE & DRAW OBSTACLES ──
      for (let i = state.obstacles.length - 1; i >= 0; i--) {
        const ob = state.obstacles[i];
        if (!portalOpen) {
          ob.y += ob.speed * sf;
          // Gravity Storm: drift obstacles sideways
          if (state.envEvent?.id === 'gravity_storm' && ob.type !== 'wall' && ob.type !== 'energyWall') {
            const driftDir = Math.sin(state.frames * 0.02) > 0 ? 1 : -1;
            ob.x = Math.max(0, Math.min(w - ob.width, ob.x + driftDir * 1.8 * sf));
          }
          // Meteor Shower: diagonal movement
          if (ob.vx && ob.type !== 'zigzag' && ob.type !== 'bounce' && ob.type !== 'energyWall' && ob.type !== 'wall') {
            ob.x += ob.vx * sf;
            if (ob.x < -ob.width || ob.x > w) { state.obstacles.splice(i, 1); continue; }
          }
          if (ob.type === 'rotating') ob.angle += 0.05;
          if (ob.type === 'cross') ob.angle += 0.03;
          if (ob.type === 'zigzag' || ob.type === 'bounce') { ob.x += ob.vx * sf; if (ob.x <= 0 || ob.x + ob.width >= w) ob.vx *= -1; }
          if (ob.type === 'wave') { ob.x = Math.max(0, Math.min(w - ob.width, ob.startX + Math.sin(ob.y * ob.waveFrequency + ob.waveOffset) * ob.waveAmplitude)); }
          // Homing: tracks player for a limited time then goes straight
          if (ob.type === 'homing' && (ob.homingTimer || 0) > 0) {
            ob.homingTimer -= dt * 60;
            const hdx = player.x - (ob.x + ob.width / 2);
            ob.vx = (ob.vx || 0) + hdx * 0.006 * sf;
            ob.vx = Math.max(-4, Math.min(4, ob.vx));
            ob.x = Math.max(0, Math.min(w - ob.width, ob.x + ob.vx * sf));
          }
          // Pulsar: size oscillates with beat
          if (ob.type === 'pulsar') {
            ob.pulsarPhase = (ob.pulsarPhase || 0) + dt * 6;
            ob._pulsarScale = 0.7 + Math.sin(ob.pulsarPhase) * 0.35; // 0.35 – 1.05
          }
        }
        const obPulse = pm ? 0 : Math.sin(state.frames * 0.1 + ob.x * 0.05) * 4;
        ctx.save(); ctx.shadowColor = ob.color;
        if (ob.type === 'rotating') {
          ctx.translate(ob.x + ob.width / 2, ob.y + ob.height / 2); ctx.rotate(ob.angle); ctx.shadowBlur = pm ? 10 : (22 + obPulse); ctx.fillStyle = ob.color;
          const s = ob.width / 2; ctx.beginPath();
          for (let pt = 0; pt < 8; pt++) { const a = pt * Math.PI / 4; const rr = pt % 2 === 0 ? s : s * 0.45; pt === 0 ? ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
          ctx.closePath(); ctx.fill();
        } else if (ob.type === 'wave') {
          ctx.translate(ob.x + ob.width / 2, ob.y + ob.height / 2); ctx.rotate(Math.PI / 4 + ob.y * 0.008); ctx.shadowBlur = pm ? 8 : 22;
          const s = ob.width / 2; ctx.fillStyle = ob.color;
          ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s, 0); ctx.lineTo(0, s); ctx.lineTo(-s, 0); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = ob.color + '88'; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(0, -s * 0.5); ctx.lineTo(s * 0.5, 0); ctx.lineTo(0, s * 0.5); ctx.lineTo(-s * 0.5, 0); ctx.closePath(); ctx.stroke();
        } else if (ob.type === 'zigzag' || ob.type === 'bounce') {
          ctx.translate(ob.x + ob.width / 2, ob.y + ob.height / 2); ctx.shadowBlur = pm ? 8 : 18; ctx.fillStyle = ob.color;
          const s = ob.width / 2; ctx.beginPath();
          for (let side = 0; side < 6; side++) { const a = (side * Math.PI / 3) - Math.PI / 6; side === 0 ? ctx.moveTo(Math.cos(a) * s, Math.sin(a) * s) : ctx.lineTo(Math.cos(a) * s, Math.sin(a) * s); }
          ctx.closePath(); ctx.fill();
        } else if (ob.type === 'cross') {
          ctx.translate(ob.x + ob.width / 2, ob.y + ob.height / 2); ctx.rotate(ob.angle); ctx.shadowBlur = pm ? 10 : (22 + obPulse); ctx.fillStyle = ob.color;
          const s = ob.width / 2, t = s * 0.32;
          ctx.beginPath(); ctx.moveTo(-t, -s); ctx.lineTo(t, -s); ctx.lineTo(t, -t); ctx.lineTo(s, -t); ctx.lineTo(s, t); ctx.lineTo(t, t); ctx.lineTo(t, s); ctx.lineTo(-t, s); ctx.lineTo(-t, t); ctx.lineTo(-s, t); ctx.lineTo(-s, -t); ctx.lineTo(-t, -t); ctx.closePath(); ctx.fill();
        } else if (ob.type === 'homing') {
          // Homing missile — pointed arrow shape tracking player
          ctx.translate(ob.x + ob.width / 2, ob.y + ob.height / 2);
          const angle = Math.atan2(ob.vx || 0, -1) * 0.5;
          ctx.rotate(angle);
          ctx.shadowBlur = pm ? 12 : 28; ctx.shadowColor = '#ec4899';
          const s = ob.width / 2;
          const grad = ctx.createLinearGradient(0, -s, 0, s);
          grad.addColorStop(0, '#f43f5e'); grad.addColorStop(1, '#ec4899');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(0, -s); ctx.lineTo(s * 0.55, s * 0.3); ctx.lineTo(s * 0.25, s); ctx.lineTo(0, s * 0.6);
          ctx.lineTo(-s * 0.25, s); ctx.lineTo(-s * 0.55, s * 0.3); ctx.closePath(); ctx.fill();
          // Flame trail
          if (!pm) {
            ctx.fillStyle = 'rgba(251,113,133,0.5)';
            for (let f = 0; f < 3; f++) {
              const fy = s + f * 5; const fw = (3 - f) * 3;
              ctx.beginPath(); ctx.ellipse((Math.random()-0.5)*4, fy, fw, fw * 0.6, 0, 0, Math.PI*2); ctx.fill();
            }
          }
        } else if (ob.type === 'pulsar') {
          // Pulsar — pulsating ring obstacle
          ctx.translate(ob.x + ob.width / 2, ob.y + ob.height / 2);
          const sc = ob._pulsarScale || 1;
          const s = (ob.width / 2) * sc;
          ctx.shadowBlur = pm ? 12 : (28 + obPulse * 2);
          ctx.shadowColor = '#a855f7';
          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = 3 + sc * 2;
          ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI * 2); ctx.stroke();
          ctx.strokeStyle = 'rgba(192,132,252,0.4)';
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(0, 0, s * 1.4, 0, Math.PI * 2); ctx.stroke();
          // Inner fill when big
          if (sc > 0.9) {
            ctx.fillStyle = `rgba(168,85,247,${(sc - 0.9) * 0.6})`;
            ctx.beginPath(); ctx.arc(0, 0, s * 0.6, 0, Math.PI * 2); ctx.fill();
          }
        } else if (ob.type === 'energyWall') {
          // Pulsing energy wall with electric effect
          const ewPulse = Math.sin(state.frames * 0.25 + ob.x * 0.05) * 0.4 + 0.6;
          ctx.shadowBlur = pm ? 8 : 22;
          ctx.fillStyle = `rgba(168,85,247,${0.85 * ewPulse})`;
          ctx.fillRect(ob.x, ob.y, ob.width, ob.height);
          // Electric top edge
          if (!pm) {
            ctx.strokeStyle = `rgba(216,180,254,${ewPulse})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let ex = ob.x; ex < ob.x + ob.width; ex += 8) {
              const ey = ob.y + (Math.random() - 0.5) * 4;
              ex === ob.x ? ctx.moveTo(ex, ey) : ctx.lineTo(ex, ey);
            }
            ctx.stroke();
          }
        } else {
          // Meteor: draw with trail particles
          if (state.envEvent?.id === 'meteor_shower' && ob.vx && !pm && state.frames % 4 === 0) {
            state.particles.push({ x: ob.x + ob.width / 2, y: ob.y + ob.height, vx: -ob.vx * 0.3, vy: -2, life: 0.7, color: '#f97316' });
          }
          ctx.shadowBlur = pm ? 6 : (14 + obPulse);
          ctx.fillStyle = ob.vx ? '#f97316' : ob.color;
          if (ob.vx) ctx.shadowColor = '#f97316';
          ctx.fillRect(ob.x, ob.y, ob.width, ob.height);
          ctx.strokeStyle = (ob.vx ? '#fbbf24' : ob.color) + 'AA'; ctx.lineWidth = 1; ctx.strokeRect(ob.x + 3, ob.y + 3, ob.width - 6, ob.height - 6);
        }
        ctx.restore();
        // Pulsar uses dynamic radius for collision
        let collX, collY;
        if (ob.type === 'pulsar') {
          const cx = ob.x + ob.width / 2, cy = ob.y + ob.height / 2;
          const effR = (ob.width / 2) * (ob._pulsarScale || 1);
          const pdx = player.x - cx, pdy = player.y - cy;
          const dist = Math.sqrt(pdx * pdx + pdy * pdy);
          // Only hit if within ring (±3px tolerance)
          if (!portalOpen && Math.abs(dist - effR) < player.size * 0.7) {
            collX = player.x; collY = player.y;
          } else { collX = null; }
        } else {
          collX = Math.max(ob.x, Math.min(player.x, ob.x + ob.width));
          collY = Math.max(ob.y, Math.min(player.y, ob.y + ob.height));
        }
        const dx = collX != null ? player.x - collX : Infinity;
        const dy = collX != null ? player.y - (collY ?? player.y) : Infinity;
        if (collX != null && !portalOpen && (dx * dx + dy * dy) < (player.size * 0.6) * (player.size * 0.6)) {
          if (state.activePowerups?.shield) {
            delete state.activePowerups.shield; setActivePowerups(Object.keys(state.activePowerups));
            spawnParticles(player.x, player.y, '#3b82f6', pm ? 8 : 20);
            state.shieldSaves = (state.shieldSaves || 0) + 1; state.obstacles.splice(i, 1); continue;
          }
          // Ghost Mode: first hit makes player invincible instead of dying
          const _ghostLvl = state.upgrades?.ghostMode || 0;
          if (_ghostLvl > 0 && !state.ghostActive && !state.ghostUsed) {
            state.ghostActive = true; state.ghostUsed = true;
            state.ghostTimer = 1.5 + _ghostLvl * 0.5;
            for (let gp = 0; gp < 14; gp++) state.particles.push({ x: player.x, y: player.y, vx: (Math.random()-0.5)*8, vy: (Math.random()-0.5)*8, life: 0.8, color: '#a855f7' });
            state.obstacles.splice(i, 1); continue;
          }
          if (state.ghostActive) { state.obstacles.splice(i, 1); continue; }
          playCollision(); spawnParticles(player.x, player.y, '#06b6d4', pm ? 15 : 40);
          if (state.levelMode) { endLevel(false); return; }
          if (state.coopMode) {
            const livesLeft = Math.max(0, (coopLivesRef.current ?? 3) - 1);
            coopLivesRef.current = livesLeft;
            setCoopLives(livesLeft);
            state._coopLives = livesLeft;
            // Sync via P2P (fast) and DB (reliable fallback)
            const lifeMsg = livesLeft <= 0
              ? { type: 'end', lives: 0 }
              : { type: 'state', lives: livesLeft, x: Math.round(state.player?.x || 0), skin: state.skinId || 'default' };
            if (!p2pSend(lifeMsg)) {
              base44.entities.NeonDashMatch.update(onlineMatchIdRef.current, { shared_lives: livesLeft }).catch(() => {});
            }
            if (livesLeft <= 0) {
              coopEndedRef.current = true;
              clearInterval(onlineScorePushRef.current);
              clearInterval(onlinePosRef.current);
              p2pCleanup();
              endCoopGame(0);
              return;
            }
            state.activePowerups.shield = Date.now() + 3000;
            setActivePowerups(Object.keys(state.activePowerups));
            state.obstacles.splice(i, 1);
            continue;
          }
          if (state.onlineMode) { endOnlineGame(); return; }
          endGame(); return;
        }
        if (ob.y > h) {
          state.obstacles.splice(i, 1); state.combo = (state.combo || 0) + 1; state.comboTimer = 2.2;
          if (state.combo > (state.maxCombo || 0)) state.maxCombo = state.combo;
          const dodgeMult2 = Math.min(8, 1 + Math.floor(state.combo / 3) * 0.5);
          if (dodgeMult2 > (state.maxComboMult || 1)) state.maxComboMult = dodgeMult2;
          // ── RHYTHM BONUS: if obstacle dodged within beat window, bonus points
          if (ob.beatSpawned && isBeat) {
            state.rhythmStreak = (state.rhythmStreak || 0) + 1;
            const rhythmBonus = 50 * state.rhythmStreak * comboMult;
            state.score += rhythmBonus;
            state.particles.push({ x: ob.x + ob.width / 2, y: h - 20, vx: 0, vy: -1.8, life: 1.4, color: '#ec4899', isText: true, text: `🎵 +${Math.floor(rhythmBonus)}` });
          } else {
            state.rhythmStreak = 0;
          }
          if (state.frames % 3 === 0) setComboDisplay({ combo: state.combo, mult: dodgeMult2 });
        }
      }

      // ── DUAL CANNON + BULLET SYSTEM ──
      if ((state.upgrades?.dualCannon || 0) > 0 && !portalOpen) {
        updateBullets(ctx, state, player, sf, w, pm, comboMult, spawnParticles);
      }

      // Achievements
      if (state.frames % 60 === 0) {
        const newOnes = checkAchievements(state, unlockedAchievementsRef.current);
        if (newOnes.length > 0) {
          for (const ach of newOnes) unlockedAchievementsRef.current.add(ach.id);
          localStorage.setItem('neonAchievements', JSON.stringify([...unlockedAchievementsRef.current]));
          setActiveAchievements(prev => [...prev, ...newOnes]);
          newOnes.forEach((ach, i) => {
            setTimeout(() => {
              setActiveAchievements(prev => prev.filter(a => a.id !== ach.id));
              const achUser = (() => { try { const u = localStorage.getItem('app_user'); return u && u !== 'undefined' ? JSON.parse(u) : null; } catch { return null; } })();
              if (achUser) { base44.entities.AppUser.update(achUser.id, { tokens: (achUser.tokens || 0) + ach.reward }).then(updated => { localStorage.setItem('app_user', JSON.stringify(updated)); window.dispatchEvent(new Event('user-updated')); }).catch(() => {}); }
            }, 3500 + i * 600);
          });
        }
      }

      // ── COINS ──
      if (isP2RemoteWorld && state._remoteCoins !== undefined) {
        state.coins = state._remoteCoins.map(c => ({ x: c.x, y: c.y, radius: c.r, speed: c.speed }));
        state._remoteCoins = undefined;
      } else if (!isP2RemoteWorld) {
        // Coins spawn more frequently as speed increases; minimum interval 20 frames
        if (!portalOpen && state.frames % Math.max(20, Math.floor(80 / state.speedMult)) === 0) {
          state.coins.push({ x: Math.random() * (w - 20), y: -20, radius: 12, speed: (4 + Math.random() * 3) * state.speedMult * sf });
        }
      }
      for (let i = state.coins.length - 1; i >= 0; i--) {
        const c = state.coins[i];
        if (!portalOpen) c.y += c.speed * sf;
        ctx.shadowBlur = pm ? 8 : 20; ctx.shadowColor = '#eab308'; ctx.fillStyle = '#fde047';
        ctx.beginPath(); ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2); ctx.fill();
        const dx = player.x - c.x, dy = player.y - c.y;
        if (Math.sqrt(dx * dx + dy * dy) < player.size + c.radius) {
          const coinPoints = (100 + ((state.upgrades?.coinMulti || 0) * 50)) * comboMult * (1 + (state.upgrades?.scoreBoost || 0) * 0.1);
          playCollect(); state.score += coinPoints; state.combo = (state.combo || 0) + 1; state.comboTimer = 2.2;
          if (state.levelMode) state.levelCoinsCollected = (state.levelCoinsCollected || 0) + 1;
          state.challengeCoins = (state.challengeCoins || 0) + 1;
          spawnParticles(c.x, c.y, '#eab308', pm ? 8 : 20);
          if (comboMult > 1) { state.particles.push({ x: c.x, y: c.y - 10, vx: 0, vy: -1.2, life: 1.2, color: '#fde047', isText: true, text: `x${comboMult.toFixed(1)}` }); }
          const newMult = Math.min(8, 1 + Math.floor(state.combo / 3) * 0.5);
          if (state.combo > (state.maxCombo || 0)) state.maxCombo = state.combo;
          if (newMult > (state.maxComboMult || 1)) state.maxComboMult = newMult;
          if (state.frames % 3 === 0) setComboDisplay({ combo: state.combo, mult: newMult });
          state.coins.splice(i, 1); continue;
        }
        if (c.y > h + 20) state.coins.splice(i, 1);
      }

      // ── DIMENSION PORTAL ──
      if (state.dimensionCooldown > 0) state.dimensionCooldown--;
      const PORTAL_THRESHOLD = state.levelMode ? 18000 : state.dimensionEvent ? 12000 : (state.proMode ? 25000 : 18000);
      const ownedDims = (user?.neon_dash_upgrades?.owned_dimensions || []);
      const DIM_CYCLE = ['void', 'neon', 'fire', 'cosmic', 'ice', 'glitch', 'quantum', 'blood', 'aurora', 'thunder', 'toxic', ...(ownedDims.includes('neo') ? ['neo'] : [])];
      const currentThreshold = Math.floor(state.score / PORTAL_THRESHOLD) * PORTAL_THRESHOLD;
      if (currentThreshold > 0 && currentThreshold > (state.lastDimensionThreshold || 0) && !state.dimensionPortal && !state.dimensionCooldown) {
        state.lastDimensionThreshold = currentThreshold;
        const availableDims = DIM_CYCLE.filter(d => d !== (state.dimensionStyle || ''));
        const nextDim = availableDims[Math.floor(Math.random() * availableDims.length)];
        const dimRings = { void: ['#a855f7','#06b6d4','#ec4899'], neon: ['#22c55e','#06b6d4','#facc15'], fire: ['#f97316','#ef4444','#fbbf24'], cosmic: ['#3b82f6','#a855f7','#06b6d4'], ice: ['#bae6fd','#60a5fa','#a5f3fc'], neo: ['#fbbf24','#a855f7','#06b6d4'], glitch: ['#ff00ff','#00ffff','#ff0055'], quantum: ['#7c3aed','#06b6d4','#a855f7'], blood: ['#dc2626','#991b1b','#ff4444'], aurora: ['#10b981','#06b6d4','#34d399'], thunder: ['#facc15','#f97316','#fde047'], toxic: ['#84cc16','#a3e635','#22c55e'] };
        const dimLabels = { void: '✦ VOID DIMENSION ✦', neon: '⚡ NEON DIMENSION ⚡', fire: '🔥 INFERNO ZONE 🔥', cosmic: '🌌 COSMIC RIFT 🌌', ice: '❄ FROZEN REALM ❄', neo: '⭐ NEO DIMENSION ⭐', glitch: '💀 GLITCH ZONE 💀', quantum: '⬡ QUANTUM REALM ⬡', blood: '🩸 BLOOD REALM 🩸', aurora: '🌌 AURORA GATE 🌌', thunder: '⚡ THUNDER ZONE ⚡', toxic: '☢ TOXIC WASTE ☢' };
        state.dimensionPortal = { x: w / 2, y: 0, radius: Math.min(w * 0.38, 130), angle: 0, phase: 'appearing', phaseFrames: 0, entered: false, vy: 4.5, nextDimension: nextDim, rings: dimRings[nextDim] || dimRings.void, label: dimLabels[nextDim] || '✦ DIMENSION ✦' };
      }

      if (state.tempSkinFrames > 0) { state.tempSkinFrames -= 1; if (state.tempSkinFrames <= 0) state.tempSkinColor = null; }

      if (state.dimensionPortal) {
        const dp = state.dimensionPortal;
        dp.angle += 0.025; dp.phaseFrames++;
        const r = dp.radius;
        if (dp.phase === 'appearing' && dp.phaseFrames > 50) dp.phase = 'active';
        if (dp.phase === 'fading' && dp.phaseFrames > 25) { state.dimensionPortal = null; }
        if (dp.phase === 'active' && !dp.entered) { dp.y += (dp.vy || 1.8) * sf; if (dp.y > h + r * 2) { state.dimensionPortal = null; } }
        const pulse = Math.sin(dp.phaseFrames * 0.08) * 0.06 + 1;
        const alpha = dp.phase === 'appearing' ? Math.min(1, dp.phaseFrames / 20) : dp.phase === 'fading' ? Math.max(0, 1 - dp.phaseFrames / 20) : 1;
        ctx.save(); ctx.globalAlpha = alpha; ctx.translate(dp.x, dp.y);
        const grad = ctx.createRadialGradient(0, 0, r * 0.6, 0, 0, r * 1.8 * pulse);
        grad.addColorStop(0, 'rgba(168,85,247,0.35)'); grad.addColorStop(0.5, 'rgba(6,182,212,0.18)'); grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(0, 0, r * 1.8 * pulse, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = pm ? 15 : 40; ctx.shadowColor = '#a855f7';
        const innerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * pulse);
        innerGrad.addColorStop(0, '#0a0018'); innerGrad.addColorStop(0.5, '#1a0040'); innerGrad.addColorStop(1, '#2d006e');
        ctx.fillStyle = innerGrad; ctx.beginPath(); ctx.arc(0, 0, r * pulse, 0, Math.PI * 2); ctx.fill();
        const ringColors = dp.rings || ['#a855f7','#06b6d4','#ec4899'];
        ctx.rotate(dp.angle);
        for (let ring = 0; ring < 3; ring++) { ctx.rotate(Math.PI * 2 / 3); ctx.strokeStyle = ringColors[ring] || '#a855f7'; ctx.lineWidth = 3.5; ctx.shadowBlur = pm ? 8 : 20; ctx.shadowColor = ctx.strokeStyle; ctx.beginPath(); ctx.arc(0, 0, r * pulse * (0.88 + ring * 0.06), ring * 0.4, ring * 0.4 + Math.PI * 1.4); ctx.stroke(); }
        ctx.rotate(-dp.angle * 2); ctx.fillStyle = 'rgba(255,255,255,0.8)';
        for (let st = 0; st < 8; st++) { const sa = st * Math.PI / 4 + dp.angle * 3; const sr = r * 0.5 * pulse; ctx.beginPath(); ctx.arc(Math.cos(sa) * sr, Math.sin(sa) * sr, 1.5, 0, Math.PI * 2); ctx.fill(); }
        ctx.rotate(dp.angle * 2); ctx.shadowBlur = 12; ctx.shadowColor = '#c084fc';
        const labelColor = dp.rings ? dp.rings[0] : '#e9d5ff';
        ctx.fillStyle = labelColor; ctx.font = `bold ${Math.floor(r * 0.22)}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(dp.label || '✦ DIMENSION ✦', 0, r * pulse * 1.35);
        ctx.font = `bold ${Math.floor(r * 0.18)}px sans-serif`; ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText(dp.phase === 'active' ? '⬇ Positioniere dich!' : `bei ${state.lastDimensionThreshold.toLocaleString()} Pkt`, 0, r * pulse * 1.6);
        ctx.restore();
        if (dp.phase === 'active' && !dp.entered) {
          const dxPull = dp.x - player.x, dyPull = dp.y - player.y;
          const distPull = Math.sqrt(dxPull * dxPull + dyPull * dyPull);
          const pullRadius = r * 2.5;
          if (distPull < pullRadius) { const pullStrength = 1 - (distPull / pullRadius); state.targetX += dxPull * pullStrength * 0.18; player.y += dyPull * pullStrength * 0.12; }
        }
        if (dp.phase === 'active' && !dp.entered) {
          const dx = player.x - dp.x, dy = player.y - dp.y;
          if (Math.sqrt(dx * dx + dy * dy) < r * pulse * 1.1) {
            const dimColors = { void: '#a855f7', neon: '#22c55e', fire: '#f97316', cosmic: '#3b82f6', ice: '#bae6fd', neo: '#fbbf24', glitch: '#ff00ff', quantum: '#7c3aed', blood: '#dc2626', aurora: '#10b981', thunder: '#facc15', toxic: '#84cc16' };
            const newDim = dp.nextDimension || 'void';
            dp.entered = true; dp.phase = 'fading'; dp.phaseFrames = 0;
            playDimensionWarp(); state.dimensionCooldown = 900;
            const _sp = pickRandomSuperpower(); applySuperpowerToState(_sp, state, w, h); setActiveSuperpower(_sp);
            const ppUser = (() => { try { const u = localStorage.getItem('app_user'); return u && u !== 'undefined' ? JSON.parse(u) : null; } catch { return null; } })();
            if (ppUser?.pro_pass?.purchased) { const pp = ppUser.pro_pass; const newDims = (pp.dims_traversed || 0) + 1; const updPP = { ...pp, dims_traversed: newDims }; base44.entities.AppUser.update(ppUser.id, { pro_pass: updPP }).then(updated => { localStorage.setItem('app_user', JSON.stringify(updated)); window.dispatchEvent(new Event('user-updated')); }).catch(() => {}); }
            state.dimensionActive = true; state.dimensionStyle = newDim; state.dimensionFrames = 0;
            state.dimensionsEntered = (state.dimensionsEntered || 0) + 1;
            state.tempSkinColor = dimColors[newDim] || '#a855f7'; state.tempSkinFrames = 9999;
            state.activePowerups.shield = Date.now() + 4000; // shield on dimension enter
            state.score += 500 * comboMult; state.combo = (state.combo || 0) + 8; state.comboTimer = 240;
            setComboDisplay({ combo: state.combo, mult: Math.min(8, 1 + Math.floor(state.combo / 3) * 0.5) });
            setInDimension(true); setCurrentDimStyle(newDim);
            const ppCount = pm ? 15 : 40;
            for (let pp = 0; pp < ppCount; pp++) { state.particles.push({ x: dp.x + (Math.random()-0.5)*120, y: dp.y + (Math.random()-0.5)*60, vx: (Math.random()-0.5)*10, vy: Math.random()*8+2, life: 1.8, color: ['#a855f7','#06b6d4','#c084fc','#ffffff'][pp % 4] }); }
          }
        }
      }

      // ── POWER-UPS ──
      // Available in all modes — in Normal mode starts appearing after speedMult > 1.1
      const allowPowerups = state.proMode || (state.levelMode && state.levelId >= 6) || (!state.levelMode && state.speedMult >= 1.1);
      if (!portalOpen && allowPowerups && state.frames % Math.max(150, Math.floor(400 / state.speedMult)) === 0) {
        const pu = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
        state.powerups.push({ x: Math.random() * (w - 30) + 15, y: -20, radius: 16, speed: 3 * state.speedMult * sf, ...pu });
      }
      for (let i = state.powerups.length - 1; i >= 0; i--) {
        const pu = state.powerups[i];
        if (!portalOpen) pu.y += pu.speed * sf;
        const pulse = pm ? 0 : Math.sin(state.frames * 0.1) * 3;
        ctx.shadowBlur = pm ? 10 : (25 + pulse); ctx.shadowColor = pu.glow;
        ctx.fillStyle = pu.color + '40'; ctx.strokeStyle = pu.color; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(pu.x, pu.y, pu.radius + pulse, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.shadowBlur = 0; ctx.font = '18px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff'; ctx.fillText(pu.emoji, pu.x, pu.y);
        const dx = player.x - pu.x, dy = player.y - pu.y;
        if (Math.sqrt(dx * dx + dy * dy) < player.size + pu.radius) {
          const puDurationMult = 1 + (state.upgrades?.powerupBoost || 0) * 0.3;
          state.activePowerups[pu.id] = Date.now() + pu.duration * puDurationMult;
          setActivePowerups(Object.keys(state.activePowerups));
          spawnParticles(pu.x, pu.y, pu.glow, pm ? 10 : 25);
          state.powerups.splice(i, 1); continue;
        }
        if (pu.y > h + 20) state.powerups.splice(i, 1);
      }

      // ── PARTICLES & TRAILS ──
      if ((state.proMode || state.speedMult > 1.5) && !pm && state.frames % 2 === 0) {
        state.particles.push({ 
          x: player.x, 
          y: player.y + player.size * 0.8, 
          vx: 0, 
          vy: 2 + Math.random() * 2, 
          life: 0.6, 
          color: state.skinGlow || '#06b6d4',
          isTrail: true
        });
      }
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx; p.y += p.vy; p.life -= 0.018;
        if (p.life <= 0) { state.particles.splice(i, 1); continue; }
        ctx.globalAlpha = Math.min(1, p.life);
        if (p.isText) { ctx.shadowBlur = 10; ctx.shadowColor = p.color; ctx.fillStyle = p.color; ctx.font = `bold 14px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(p.text, p.x, p.y); }
        else if (p.isTrail) {
          ctx.shadowBlur = 15; ctx.shadowColor = p.color; ctx.fillStyle = p.color; 
          ctx.beginPath(); ctx.arc(p.x, p.y, (player.size * 0.6) * p.life, 0, Math.PI * 2); ctx.fill();
        }
        else if (p.isBeatFlash) { ctx.shadowBlur = 0; ctx.strokeStyle = `rgba(255,255,255,${p.life * 0.12})`; ctx.lineWidth = 4; ctx.strokeRect(4, 4, (p.bw||w)-8, (p.bh||h)-8); }
        else { ctx.shadowBlur = 12; ctx.shadowColor = p.color; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, 4 * Math.min(1, p.life), 0, Math.PI * 2); ctx.fill(); }
        ctx.globalAlpha = 1;
      }

      // ── SPEED LINES & HYPERDRIVE EFFECT ──
      if (state.speedMult > 1.4 && !pm) {
        ctx.save();
        const hyperAlpha = Math.min(0.4, (state.speedMult - 1.4) * 0.2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${hyperAlpha})`;
        ctx.lineWidth = 1 + state.speedMult * 0.4;
        ctx.beginPath();
        for (let sl = 0; sl < 12; sl++) {
          const lx = (sl * 89 + state.frames * 18) % w;
          const ly = Math.random() * h;
          const len = 30 + state.speedMult * 20;
          ctx.moveTo(lx, ly);
          ctx.lineTo(lx, ly + len);
        }
        ctx.stroke();
        ctx.restore();
      }
      ctx.shadowBlur = 0;

      if (!state.tempSkinColor && state.skinId === 'rainbow') { const hue = (state.frames * 3) % 360; state.skinColor = `hsl(${hue}, 100%, 65%)`; state.skinGlow = `hsl(${(hue + 60) % 360}, 100%, 55%)`; }

      drawPlayer(player);

      // ── DRAW PARTNER SHIP (Co-op) ──
      if (state.coopMode && state._partnerTargetX) {
        // Smooth lerp toward partner's reported position
        if (!state._partnerX) state._partnerX = state._partnerTargetX;
        else state._partnerX += (state._partnerTargetX - state._partnerX) * (1 - Math.exp(-14 * dt));
        const partnerSkinId = state._partnerSkin || 'default';
        const partnerSkinDef = SHIP_SKINS.find(s => s.id === partnerSkinId) || SHIP_SKINS[0];
        const partnerPx = state._partnerX;
        const partnerPy = h - 80;
        ctx.save();
        ctx.translate(partnerPx, partnerPy);
        ctx.globalAlpha = 0.85;
        ctx.shadowBlur = pm ? 10 : 22;
        ctx.shadowColor = partnerSkinDef.glowColor;
        ctx.fillStyle = partnerSkinDef.color;
        const ps = player.size;
        ctx.beginPath();
        ctx.moveTo(0, -ps);
        ctx.lineTo(ps, ps);
        ctx.lineTo(-ps, ps);
        ctx.closePath();
        ctx.fill();
        // Partner label above ship
        ctx.globalAlpha = 0.7;
        ctx.shadowBlur = 0;
        ctx.fillStyle = partnerSkinDef.glowColor;
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText((onlineOppNameRef.current || 'Partner').substring(0, 6), 0, -ps - 4);
        ctx.restore();
      }

      // ── HUD ──
      ctx.shadowBlur = 0;
      // Canvas score only shown in offline modes (React HUD handles online/coop)
      if (!state.onlineMode && !state.coopMode) {
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.font = 'bold 24px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillText(Math.floor(state.score).toString(), w / 2, 28);
      }

      if ((state.combo || 0) >= 3 && state.comboTimer > 0) {
        const mult = Math.min(8, 1 + Math.floor(state.combo / 3) * 0.5);
        const comboAlpha = Math.min(1, state.comboTimer / 2.2);
        const scale = 1 + Math.sin(state.frames * 0.25) * 0.06;
        ctx.save(); ctx.globalAlpha = comboAlpha; ctx.translate(w - 18, 18); ctx.scale(scale, scale);
        ctx.textAlign = 'right'; ctx.textBaseline = 'top';
        const comboColor = mult >= 6 ? '#f43f5e' : mult >= 4 ? '#f97316' : mult >= 2 ? '#facc15' : '#06b6d4';
        ctx.shadowBlur = 18; ctx.shadowColor = comboColor; ctx.font = `bold ${mult >= 4 ? 20 : 16}px sans-serif`; ctx.fillStyle = comboColor;
        ctx.fillText(`x${mult.toFixed(1)} COMBO`, 0, 0);
        ctx.font = 'bold 11px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.shadowBlur = 0;
        ctx.fillText(`${state.combo} dodge streak`, 0, mult >= 4 ? 24 : 20); ctx.restore();
      }

      if (!state.dimensionPortal && !state.dimensionActive && !state.levelMode) {
        const nextThreshold = (Math.floor(state.score / PORTAL_THRESHOLD) + 1) * PORTAL_THRESHOLD;
        const pct = (state.score % PORTAL_THRESHOLD) / PORTAL_THRESHOLD; const barW = 60; const bx = w / 2 - barW / 2;
        ctx.save(); ctx.globalAlpha = 0.45; ctx.fillStyle = 'rgba(168,85,247,0.15)'; ctx.fillRect(bx, 56, barW, 3);
        ctx.fillStyle = '#a855f7'; ctx.fillRect(bx, 56, barW * pct, 3);
        ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillStyle = '#c084fc';
        ctx.fillText(`⬡ ${nextThreshold.toLocaleString()}`, w / 2, 61); ctx.restore();
      }

      if (state.dimensionActive) {
        const dimHudColors = { void: '#a855f7', neon: '#22c55e', fire: '#f97316', cosmic: '#3b82f6', ice: '#bae6fd', neo: '#fbbf24', glitch: '#ff00ff', quantum: '#7c3aed', blood: '#dc2626', aurora: '#10b981', thunder: '#facc15', toxic: '#84cc16' };
        const dimHudLabels = { void: '✦ VOID DIMENSION ✦', neon: '⚡ NEON DIMENSION ⚡', fire: '🔥 INFERNO ZONE 🔥', cosmic: '🌌 COSMIC RIFT 🌌', ice: '❄ FROZEN REALM ❄', neo: '⭐ NEO DIMENSION ⭐', glitch: '💀 GLITCH ZONE 💀', quantum: '⬡ QUANTUM REALM ⬡', blood: '🩸 BLOOD REALM 🩸', aurora: '🌌 AURORA GATE 🌌', thunder: '⚡ THUNDER ZONE ⚡', toxic: '☢ TOXIC WASTE ☢' };
        const dimCol = dimHudColors[state.dimensionStyle || 'void'] || '#a855f7';
        const dimLabel = dimHudLabels[state.dimensionStyle || 'void'] || '✦ DIMENSION ✦';
        const pulse = Math.sin(state.frames * 0.06) * 0.15 + 0.85;
        ctx.save(); ctx.globalAlpha = pulse; ctx.shadowBlur = 12; ctx.shadowColor = dimCol;
        ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillStyle = dimCol; ctx.fillText(dimLabel, w / 2, 80); ctx.restore();
      }

      if (state.levelMode) {
        const goal = state.levelGoal; const timeSecs = (state.levelTimeFrames || 0) / 60;
        const progressVal = goal.type === 'survive' ? timeSecs : goal.type === 'coins' ? (state.levelCoinsCollected || 0) : state.score;
        const pct = Math.min(1, progressVal / goal.target);
        if (state.frames % 15 === 0) setLevelGoalProgress(Math.floor(progressVal));
        const barW = Math.min(180, w * 0.38); const barX = w / 2 - barW / 2;
        ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(barX, 60, barW, 5);
        ctx.fillStyle = state.levelColor || '#06b6d4'; ctx.shadowColor = state.levelColor || '#06b6d4'; ctx.shadowBlur = 8;
        ctx.fillRect(barX, 60, barW * pct, 5); ctx.shadowBlur = 0;
        const progressText = goal.type === 'survive' ? `${Math.floor(timeSecs)}/${goal.target}s` : goal.type === 'coins' ? `${state.levelCoinsCollected || 0}/${goal.target} 🪙` : `${Math.floor(state.score)}/${goal.target}`;
        ctx.fillStyle = state.levelColor || '#06b6d4'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(`Lvl ${state.levelId} · ${progressText}`, w / 2, 70); ctx.shadowBlur = 0;
        if (progressVal >= goal.target) { endLevel(true); return; }
      } else if (state.proMode) {
        ctx.fillStyle = '#fb923c'; ctx.font = 'bold 11px sans-serif'; ctx.fillText('⚡ PRO MODE', w / 2, 58);
      }

      if (state.frames % 5 === 0) {
        setScore(Math.floor(state.score));
        if (state.upgrades?.instantShield > 0) {
          const btn = document.getElementById('btn-shield-cooldown');
          if (btn) btn.style.height = (state.instantShieldCd || 0) > 0 ? `${((state.instantShieldCd || 0) / ([30, 22, 15][state.upgrades.instantShield - 1] || 30)) * 100}%` : '0%';
        }
        if (state.upgrades?.warpDrive > 0) {
          const btn = document.getElementById('btn-warp-cooldown');
          if (btn) btn.style.height = (state.warpCd || 0) > 0 ? `${((state.warpCd || 0) / ([20, 15, 10][state.upgrades.warpDrive - 1] || 20)) * 100}%` : '0%';
        }
        if (state.upgrades?.afterburner > 0) {
          const btn = document.getElementById('btn-boost-cooldown');
          if (btn) btn.style.height = (state.afterburnerCd || 0) > 0 ? `${((state.afterburnerCd || 0) / 8) * 100}%` : '0%';
        }
      }

      // Update dynamic music engine
      if (state.frames % 6 === 0) {
        updateMusic(state.speedMult, state.combo || 0, state.proMode, state.dimensionActive);
      }

          reqRef.current = requestAnimationFrame(gameLoop);
    };

    if (gameState === 'playing') {
      reqRef.current = requestAnimationFrame(gameLoop);
    } else {
      ctx.fillStyle = '#05050a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (gameState === 'menu' || gameState === 'levelselect') {
        stateRef.current.player.x = canvas.width / 2; stateRef.current.player.y = canvas.height - 80;
        const skin = SHIP_SKINS.find(s => s.id === getActiveSkin()) || SHIP_SKINS[0];
        stateRef.current.skinColor = skin.color; stateRef.current.skinGlow = skin.glowColor;
        drawPlayer(stateRef.current.player);
      }
    }
    return () => cancelAnimationFrame(reqRef.current);
  }, [gameState]);

  const activePowerupInfo = activePowerups.map(id => [...POWERUP_TYPES, { id: 'score_x2', name: 'Score x2', emoji: '✨', color: '#f59e0b', glow: '#fde047' }].find(p => p.id === id)).filter(Boolean);
  const completedLevels   = levelProgressRef.current;
  const isLevelUnlocked   = (lvl) => lvl.id === 1 || completedLevels.includes(lvl.id - 1);

  const dimOverlays = {
    void:    { bg: 'radial-gradient(ellipse at center, rgba(120,0,255,0.18) 0%, rgba(0,200,255,0.08) 50%, transparent 80%)', shadow: 'inset 0 0 80px rgba(168,85,247,0.25), inset 0 0 160px rgba(6,182,212,0.12)' },
    neon:    { bg: 'radial-gradient(ellipse at center, rgba(34,197,94,0.15) 0%, rgba(6,182,212,0.06) 50%, transparent 80%)', shadow: 'inset 0 0 80px rgba(34,197,94,0.2), inset 0 0 160px rgba(6,182,212,0.08)' },
    fire:    { bg: 'radial-gradient(ellipse at center, rgba(249,115,22,0.2) 0%, rgba(239,68,68,0.1) 50%, transparent 80%)', shadow: 'inset 0 0 80px rgba(249,115,22,0.3), inset 0 0 160px rgba(239,68,68,0.15)' },
    cosmic:  { bg: 'radial-gradient(ellipse at center, rgba(59,130,246,0.18) 0%, rgba(168,85,247,0.08) 50%, transparent 80%)', shadow: 'inset 0 0 80px rgba(59,130,246,0.25), inset 0 0 160px rgba(168,85,247,0.1)' },
    ice:     { bg: 'radial-gradient(ellipse at center, rgba(186,230,253,0.15) 0%, rgba(96,165,250,0.07) 50%, transparent 80%)', shadow: 'inset 0 0 80px rgba(186,230,253,0.2), inset 0 0 160px rgba(96,165,250,0.1)' },
    glitch:  { bg: 'radial-gradient(ellipse at center, rgba(255,0,255,0.18) 0%, rgba(0,255,255,0.08) 50%, transparent 80%)', shadow: 'inset 0 0 80px rgba(255,0,255,0.2), inset 0 0 160px rgba(0,255,255,0.1)' },
    quantum: { bg: 'radial-gradient(ellipse at center, rgba(124,58,237,0.2) 0%, rgba(6,182,212,0.08) 50%, transparent 80%)', shadow: 'inset 0 0 80px rgba(124,58,237,0.25), inset 0 0 160px rgba(6,182,212,0.1)' },
    blood:   { bg: 'radial-gradient(ellipse at center, rgba(220,38,38,0.22) 0%, rgba(153,27,27,0.1) 50%, transparent 80%)', shadow: 'inset 0 0 80px rgba(220,38,38,0.3), inset 0 0 160px rgba(153,27,27,0.15)' },
    aurora:  { bg: 'radial-gradient(ellipse at center, rgba(16,185,129,0.18) 0%, rgba(6,182,212,0.08) 50%, transparent 80%)', shadow: 'inset 0 0 80px rgba(16,185,129,0.22), inset 0 0 160px rgba(6,182,212,0.1)' },
    thunder: { bg: 'radial-gradient(ellipse at center, rgba(250,204,21,0.2) 0%, rgba(249,115,22,0.08) 50%, transparent 80%)', shadow: 'inset 0 0 80px rgba(250,204,21,0.28), inset 0 0 160px rgba(249,115,22,0.12)' },
    toxic:   { bg: 'radial-gradient(ellipse at center, rgba(132,204,22,0.18) 0%, rgba(34,197,94,0.08) 50%, transparent 80%)', shadow: 'inset 0 0 80px rgba(132,204,22,0.22), inset 0 0 160px rgba(34,197,94,0.1)' },
    neo:     { bg: 'radial-gradient(ellipse at center, rgba(251,191,36,0.18) 0%, rgba(168,85,247,0.08) 50%, transparent 80%)', shadow: 'inset 0 0 80px rgba(251,191,36,0.22), inset 0 0 160px rgba(168,85,247,0.1)' },
  };
  const ov = dimOverlays[currentDimStyle] || dimOverlays.void;

  return (
    <div className="fixed inset-0 z-[100] bg-[#05050a] flex flex-col overflow-hidden text-white font-sans touch-none selection:bg-transparent">
      <div className="absolute top-4 left-4 z-20">
        <Link to={createPageUrl('Home')}>
          <Button variant="ghost" size="sm" className="text-white/50 hover:text-white hover:bg-white/8 rounded-xl px-3 py-1.5 h-auto text-sm font-bold gap-1.5 backdrop-blur-sm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <ChevronLeft className="w-4 h-4" /> Zurück
          </Button>
        </Link>
      </div>

      <NeonDashWhatsAppPopup />
      {showLoadoutScreen && <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-auto"><S2LoadoutScreen equippedModules={(() => { try { return JSON.parse(localStorage.getItem('s2_modules')||'[]'); } catch { return []; } })()} onSave={(m) => { localStorage.setItem('s2_modules', JSON.stringify(m)); setShowLoadoutScreen(false); }} onClose={() => setShowLoadoutScreen(false)} /></div>}
      {gameState === 'playing' && inDimension && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 z-[5] pointer-events-none"
          style={{ background: ov.bg, boxShadow: ov.shadow }} />
      )}

      {/* Dynamic Environment Event Banner */}
      <AnimatePresence>
        {gameState === 'playing' && activeEnvEvent && (
          <motion.div
            key={activeEnvEvent.name}
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.4, duration: 0.5 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-sm"
            style={{
              background: `linear-gradient(135deg, ${activeEnvEvent.color}22, ${activeEnvEvent.color}10)`,
              border: `1px solid ${activeEnvEvent.color}60`,
              boxShadow: `0 0 20px ${activeEnvEvent.color}30`,
              color: activeEnvEvent.color,
              backdropFilter: 'blur(12px)',
            }}>
            <span className="text-base">{activeEnvEvent.emoji}</span>
            <span className="uppercase tracking-widest text-xs">{activeEnvEvent.name}</span>
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="w-2 h-2 rounded-full"
              style={{ background: activeEnvEvent.color }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {gameState === 'playing' && activeSuperpower && (
        <DimensionSuperpowerToastWrapper superpower={activeSuperpower} onDone={() => setActiveSuperpower(null)} />
      )}
      {/* ── Online Live Score HUD ── */}
      {gameState === 'playing' && (isCoopMode || onlineMatchId) && (
        <OnlineLiveHUD
          myScore={score}
          oppScore={onlineOppScore}
          oppName={onlineOppName}
          myName={user?.username || 'Du'}
          isCoop={isCoopMode}
          coopLives={coopLives}
        />
      )}

      {/* Power-Up Indicators */}
      {gameState === 'playing' && activePowerupInfo.length > 0 && (
        <div className="absolute top-6 right-6 z-20 flex flex-col gap-2">
          {activePowerupInfo.map(pu => (
            <motion.div key={pu.id} initial={{ scale: 0, x: 20 }} animate={{ scale: 1, x: 0 }} exit={{ scale: 0 }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-bold"
              style={{ backgroundColor: pu.color + '25', borderColor: pu.color + '70', color: pu.glow }}>
              <span>{pu.emoji}</span> {pu.name}
            </motion.div>
          ))}
        </div>
      )}

      {/* Canvas */}
      <div ref={containerRef} className="absolute inset-0 z-0 touch-none">
        <canvas ref={canvasRef} className="block w-full h-full touch-none" style={{ touchAction: 'none' }} />
      </div>

      {/* Mobile Ability Buttons — nur innerhalb einer Dimension */}
      {gameState === 'playing' && isMobile && inDimension && (
        <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-between px-4 pointer-events-none">
          <div className="flex gap-2 pointer-events-auto">
            {getUpgradeLevel('instantShield') > 0 && (
              <button
                onTouchStart={(e) => { e.stopPropagation(); Array.from(e.changedTouches).forEach(t => buttonTouchIdsRef.current.add(t.identifier)); keysRef.current['s'] = true; }}
                onTouchEnd={(e) => { e.stopPropagation(); Array.from(e.changedTouches).forEach(t => buttonTouchIdsRef.current.delete(t.identifier)); keysRef.current['s'] = false; }}
                onTouchCancel={(e) => { e.stopPropagation(); Array.from(e.changedTouches).forEach(t => buttonTouchIdsRef.current.delete(t.identifier)); keysRef.current['s'] = false; }}
                onPointerDown={(e) => { e.stopPropagation(); keysRef.current['s'] = true; }}
                onPointerUp={(e) => { e.stopPropagation(); keysRef.current['s'] = false; }}
                onPointerOut={(e) => { e.stopPropagation(); keysRef.current['s'] = false; }}
                className="relative w-16 h-16 rounded-2xl flex flex-col items-center justify-center gap-0.5 text-white font-black text-xs select-none active:scale-90 transition-transform overflow-hidden"
                style={{ background: 'rgba(0,212,255,0.22)', border: '2px solid rgba(0,212,255,0.6)', backdropFilter: 'blur(8px)', WebkitTapHighlightColor: 'transparent' }}>
                <div id="btn-shield-cooldown" className="absolute bottom-0 left-0 right-0 bg-black/60 transition-all duration-75" style={{ height: '0%' }} />
                <span className="relative z-10 text-2xl leading-none">🔰</span>
                <span className="relative z-10 text-[9px] opacity-70">Schild</span>
              </button>
            )}
            {getUpgradeLevel('warpDrive') > 0 && (
              <button
                onTouchStart={(e) => { e.stopPropagation(); Array.from(e.changedTouches).forEach(t => buttonTouchIdsRef.current.add(t.identifier)); keysRef.current['w'] = true; }}
                onTouchEnd={(e) => { e.stopPropagation(); Array.from(e.changedTouches).forEach(t => buttonTouchIdsRef.current.delete(t.identifier)); keysRef.current['w'] = false; }}
                onTouchCancel={(e) => { e.stopPropagation(); Array.from(e.changedTouches).forEach(t => buttonTouchIdsRef.current.delete(t.identifier)); keysRef.current['w'] = false; }}
                onPointerDown={(e) => { e.stopPropagation(); keysRef.current['w'] = true; }}
                onPointerUp={(e) => { e.stopPropagation(); keysRef.current['w'] = false; }}
                onPointerOut={(e) => { e.stopPropagation(); keysRef.current['w'] = false; }}
                className="relative w-16 h-16 rounded-2xl flex flex-col items-center justify-center gap-0.5 text-white font-black text-xs select-none active:scale-90 transition-transform overflow-hidden"
                style={{ background: 'rgba(168,85,247,0.22)', border: '2px solid rgba(168,85,247,0.6)', backdropFilter: 'blur(8px)', WebkitTapHighlightColor: 'transparent' }}>
                <div id="btn-warp-cooldown" className="absolute bottom-0 left-0 right-0 bg-black/60 transition-all duration-75" style={{ height: '0%' }} />
                <span className="relative z-10 text-2xl leading-none">🌀</span>
                <span className="relative z-10 text-[9px] opacity-70">Warp</span>
              </button>
            )}
          </div>
          <div className="pointer-events-auto">
            {getUpgradeLevel('afterburner') > 0 && (
              <button
                onTouchStart={(e) => { e.stopPropagation(); Array.from(e.changedTouches).forEach(t => buttonTouchIdsRef.current.add(t.identifier)); keysRef.current['Shift'] = true; }}
                onTouchEnd={(e) => { e.stopPropagation(); Array.from(e.changedTouches).forEach(t => buttonTouchIdsRef.current.delete(t.identifier)); keysRef.current['Shift'] = false; }}
                onTouchCancel={(e) => { e.stopPropagation(); Array.from(e.changedTouches).forEach(t => buttonTouchIdsRef.current.delete(t.identifier)); keysRef.current['Shift'] = false; }}
                onPointerDown={(e) => { e.stopPropagation(); keysRef.current['Shift'] = true; }}
                onPointerUp={(e) => { e.stopPropagation(); keysRef.current['Shift'] = false; }}
                onPointerOut={(e) => { e.stopPropagation(); keysRef.current['Shift'] = false; }}
                className="relative w-16 h-16 rounded-2xl flex flex-col items-center justify-center gap-0.5 text-white font-black text-xs select-none active:scale-90 transition-transform overflow-hidden"
                style={{ background: 'rgba(249,115,22,0.22)', border: '2px solid rgba(249,115,22,0.6)', backdropFilter: 'blur(8px)', WebkitTapHighlightColor: 'transparent' }}>
                <div id="btn-boost-cooldown" className="absolute bottom-0 left-0 right-0 bg-black/60 transition-all duration-75" style={{ height: '0%' }} />
                <span className="relative z-10 text-2xl leading-none">🚀</span>
                <span className="relative z-10 text-[9px] opacity-70">Boost</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
        <AnimatePresence mode="wait">

          {/* Menu, Level Select, Upgrades, Skins */}
          {['menu', 'levelselect', 'upgrades', 'skins'].includes(gameState) && (
            <NeonDashMenu
              key={gameState}
              gameState={gameState}
              setGameState={setGameState}
              startGame={startGame}
              startLevel={startLevel}
              startOnline={startOnline}
              user={user}
              highScore={highScore}
              proHighScore={proHighScore}
              completedLevels={completedLevels}
              todayChallenge={todayChallenge}
              dailyProgress={dailyProgress}
              dailyCompleted={dailyCompleted}
              weekendBoostActive={weekendBoostActive}
              dimensionEventActive={dimensionEventActive}
              getUpgradeLevel={getUpgradeLevel}
              buyUpgrade={buyUpgrade}
              getOwnedSkins={getOwnedSkins}
              getActiveSkin={getActiveSkin}
              buySkin={buySkin}
              isLevelUnlocked={isLevelUnlocked}
              perfMode={perfMode}
              togglePerfMode={togglePerfMode}
              isMobile={isMobile}
              onOpenLoadout={() => setShowLoadoutScreen(true)}
              s2EquippedModules={(() => { try { return JSON.parse(localStorage.getItem('s2_modules') || '[]'); } catch { return []; } })()}
            />
          )}

          {/* Leaderboard, Game Over, Level Complete/Failed */}
          {['leaderboard', 'gameover', 'levelcomplete', 'levelfailed'].includes(gameState) && (
            <NeonDashGameOver
              key={gameState}
              gameState={gameState}
              setGameState={setGameState}
              score={score}
              highScore={highScore}
              proHighScore={proHighScore}
              tokensEarned={tokensEarned}
              isProMode={isProMode}
              startGame={startGame}
              weekendBoostActive={weekendBoostActive}
              lbMode={lbMode}
              setLbMode={setLbMode}
              leaderboard={leaderboard}
              leaderboardLoading={leaderboardLoading}
              currentLevelId={currentLevelId}
              startLevel={startLevel}
            />
          )}

          {/* Online Lobby */}
          {gameState === 'online_lobby' && (
            <NeonDashOnlineLobby
              key="online_lobby"
              user={user}
              onStart={(matchId, isP1, oppName, isCoop) => startOnlineGame(matchId, isP1, oppName, isCoop)}
              onCancel={() => setGameState('menu')}
            />
          )}

          {/* Co-op Result */}
          {gameState === 'coop_result' && (
            <NeonDashCoopResult
              key="coop_result"
              myScore={onlineMyScore}
              opponentScore={onlineOppScore}
              opponentName={onlineOppName}
              tokensEarned={tokensEarned}
              weekendBoostActive={weekendBoostActive}
              onMenu={() => setGameState('menu')}
              onRematch={startOnline}
            />
          )}

          {/* Online Result */}
          {gameState === 'online_result' && (
            <NeonDashOnlineResult
              key="online_result"
              myScore={onlineMyScore}
              opponentScore={onlineOppScore}
              opponentName={onlineOppName}
              matchId={onlineMatchId}
              isPlayer1={onlineIsPlayer1}
              tokensEarned={tokensEarned}
              weekendBoostActive={weekendBoostActive}
              onMenu={() => setGameState('menu')}
              onRematch={startOnline}
            />
          )}

          {/* Stats */}
          {gameState === 'stats' && (
            <NeonDashStats
              onBack={() => setGameState('menu')}
              highScore={highScore}
              proHighScore={proHighScore}
              levelProgress={levelProgressRef.current}
              unlockedAchievementsRef={unlockedAchievementsRef}
              user={(() => { try { const s = localStorage.getItem('app_user'); return s && s !== 'undefined' ? JSON.parse(s) : user; } catch { return user; } })()}
            />
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}