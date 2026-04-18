// Dimension Superpowers — triggered when entering a dimensional portal

export const SUPERPOWERS = [
  {
    id: 'void_sweep',
    name: 'Void Sweep',
    desc: 'Alle Hindernisse werden zerstört!',
    emoji: '💥',
    color: '#a855f7',
    rarity: 'epic',
    weight: 10,
  },
  {
    id: 'score_frenzy',
    name: 'Score Frenzy',
    desc: 'Score x3 für 8 Sekunden!',
    emoji: '⭐',
    color: '#fbbf24',
    rarity: 'rare',
    weight: 20,
  },
  {
    id: 'mega_shield',
    name: 'Mega Shield',
    desc: '12 Sekunden Unverwundbarkeit!',
    emoji: '🛡️',
    color: '#3b82f6',
    rarity: 'rare',
    weight: 20,
  },
  {
    id: 'coin_shower',
    name: 'Coin Shower',
    desc: '20 Münzen fallen vom Himmel!',
    emoji: '🪙',
    color: '#eab308',
    rarity: 'common',
    weight: 35,
  },
  {
    id: 'time_warp',
    name: 'Time Warp',
    desc: 'Zeitlupe für 6 Sekunden!',
    emoji: '⏱️',
    color: '#06b6d4',
    rarity: 'rare',
    weight: 25,
  },
  {
    id: 'magnet_storm',
    name: 'Magnet Storm',
    desc: 'Riesiger Münzmagnet für 10 Sek!',
    emoji: '🧲',
    color: '#c084fc',
    rarity: 'common',
    weight: 35,
  },
  {
    id: 'combo_boost',
    name: 'Combo Boost',
    desc: '+15 Combo-Streak sofort!',
    emoji: '🔥',
    color: '#f97316',
    rarity: 'common',
    weight: 30,
  },
  {
    id: 'ghost_mode',
    name: 'Ghost Mode',
    desc: '5 Sekunden durch alles fliegen!',
    emoji: '👻',
    color: '#e2e8f0',
    rarity: 'epic',
    weight: 12,
  },
  {
    id: 'score_bomb',
    name: 'Score Bomb',
    desc: '+2000 Punkte sofort!',
    emoji: '💣',
    color: '#f43f5e',
    rarity: 'rare',
    weight: 18,
  },
  {
    id: 'dimension_echo',
    name: 'Dimension Echo',
    desc: 'Alle Power-Ups werden aktiviert!',
    emoji: '⬡',
    color: '#22d3ee',
    rarity: 'epic',
    weight: 8,
  },
];

/** Pick a random superpower using weighted probability */
export function pickRandomSuperpower() {
  const totalWeight = SUPERPOWERS.reduce((sum, sp) => sum + sp.weight, 0);
  let rand = Math.random() * totalWeight;
  for (const sp of SUPERPOWERS) {
    rand -= sp.weight;
    if (rand <= 0) return sp;
  }
  return SUPERPOWERS[0];
}

/** Apply the superpower effect to the current game state */
export function applySuperpowerToState(sp, state, w, h) {
  const now = Date.now();

  switch (sp.id) {
    case 'void_sweep':
      state.obstacles = [];
      state.lasers = [];
      break;

    case 'score_frenzy':
      state.activePowerups['score_x2'] = now + 8000;
      state.scoreMultiplierBoost = 3;
      state.scoreMultiplierBoostUntil = now + 8000;
      break;

    case 'mega_shield':
      state.activePowerups.shield = now + 12000;
      break;

    case 'coin_shower':
      for (let i = 0; i < 20; i++) {
        state.coins = state.coins || [];
        state.coins.push({
          x: Math.random() * (w - 40) + 20,
          y: -20 - Math.random() * 300,
          radius: 10,
          speed: 4 + Math.random() * 2,
          value: 1,
        });
      }
      break;

    case 'time_warp':
      state.activePowerups.slowmo = now + 6000;
      break;

    case 'magnet_storm':
      state.activePowerups.magnet = now + 10000;
      state.magnetRadiusBoost = 200;
      break;

    case 'combo_boost':
      state.combo = (state.combo || 0) + 15;
      state.comboTimer = 300;
      break;

    case 'ghost_mode':
      state.ghostMode = true;
      state.ghostModeUntil = now + 5000;
      break;

    case 'score_bomb':
      state.score += 2000;
      break;

    case 'dimension_echo':
      state.activePowerups.shield = now + 6000;
      state.activePowerups.magnet = now + 6000;
      state.activePowerups.slowmo = now + 4000;
      break;

    default:
      break;
  }
}