/**
 * SEASON 2 — Game Systems Module
 * Apocalypse Mode · Void Rifts · Loadout System · Dynamic Weather
 * Modular design: all systems are pure functions / config objects,
 * injected into the main game loop via stateRef.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. APOCALYPSE MODE
// ─────────────────────────────────────────────────────────────────────────────
export const APOCALYPSE_CONFIG = {
  // Base speed multiplier starts higher than normal
  startSpeed: 1.2,
  // Per-wave difficulty curve: exponential
  waveInterval: 20,  // seconds per wave
  speedScalePerWave: 0.18,   // +18% speed per wave
  spawnScalePerWave: 0.22,   // +22% spawn rate per wave
  maxWaves: 20,

  // Shard drop milestones (survived seconds → shard tier)
  shardMilestones: [
    { seconds: 30,  tier: 'spark',  mult: 1 },
    { seconds: 60,  tier: 'spark',  mult: 1 },
    { seconds: 90,  tier: 'void',   mult: 1 },
    { seconds: 120, tier: 'void',   mult: 2 },
    { seconds: 180, tier: 'nova',   mult: 1 },
    { seconds: 240, tier: 'nova',   mult: 2 },
    { seconds: 300, tier: 'omega',  mult: 1 },
  ],

  // Skin unlock triggers (survived seconds → skin id)
  skinUnlockTriggers: [
    { seconds: 120, skinId: 's2_phantom' },
    { seconds: 200, skinId: 's2_hellfire' },
    { seconds: 300, skinId: 's2_ghost' },
  ],
};

/**
 * Calculate current wave number from elapsed seconds.
 */
export const getApocalypseWave = (seconds) =>
  Math.min(APOCALYPSE_CONFIG.maxWaves, Math.floor(seconds / APOCALYPSE_CONFIG.waveInterval) + 1);

/**
 * Returns spawn rate multiplier for current wave (exponential growth).
 */
export const getApocalypseSpawnMult = (wave) =>
  Math.pow(1 + APOCALYPSE_CONFIG.spawnScalePerWave, wave - 1);

/**
 * Returns speed multiplier for current wave.
 */
export const getApocalypseSpeedMult = (wave) =>
  APOCALYPSE_CONFIG.startSpeed * Math.pow(1 + APOCALYPSE_CONFIG.speedScalePerWave, wave - 1);

/**
 * Check if a shard milestone was just crossed.
 * Returns { tier, mult } or null.
 */
export const checkShardMilestone = (prevSeconds, nowSeconds) => {
  for (const m of APOCALYPSE_CONFIG.shardMilestones) {
    if (prevSeconds < m.seconds && nowSeconds >= m.seconds) return m;
  }
  return null;
};

/**
 * Check if a skin unlock was just triggered.
 * Returns skinId or null.
 */
export const checkSkinUnlock = (prevSeconds, nowSeconds) => {
  for (const t of APOCALYPSE_CONFIG.skinUnlockTriggers) {
    if (prevSeconds < t.seconds && nowSeconds >= t.seconds) return t.skinId;
  }
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. POWER-UPS: Shield & EMP Blast
// ─────────────────────────────────────────────────────────────────────────────
export const S2_POWERUP_TYPES = [
  {
    id: 'chain_lightning',
    name: 'Kettenblitz',
    emoji: '⚡',
    color: '#fbbf24',
    glow: '#fde68a',
    duration: 0,     // instant activation
    desc: 'Kettenblitz trifft die 3 nächsten Hindernisse (Skill-basiert, kein Screen-Nuke)',
  },
];

/**
 * Activate Chain Lightning: arcs through the 3 nearest obstacles (skill-based).
 * Does NOT clear the whole screen — requires positioning near obstacle clusters.
 * Returns number of obstacles hit.
 */
export const activateChainLightning = (state, spawnParticles) => {
  if (!state.obstacles || state.obstacles.length === 0) return 0;
  const player = state.player;
  // Sort obstacles by distance to player
  const sorted = [...state.obstacles].map((ob, idx) => {
    const cx = ob.x + ob.width / 2, cy = ob.y + ob.height / 2;
    const dx = player.x - cx, dy = player.y - cy;
    return { idx, dist: Math.sqrt(dx * dx + dy * dy), ob, cx, cy };
  }).sort((a, b) => a.dist - b.dist);
  // Chain up to 3 nearest obstacles
  const targets = sorted.slice(0, 3);
  const hitIndices = new Set(targets.map(t => t.idx));
  // Score bonus: more obstacles hit = higher multiplier
  const scoreMult = targets.length;
  state.score += targets.length * 120 * scoreMult;
  // Spawn arc particles between player and each target
  for (const t of targets) {
    spawnParticles(t.cx, t.cy, '#fde68a', 8);
    spawnParticles(t.cx, t.cy, '#fbbf24', 5);
  }
  // Remove hit obstacles (reverse order to preserve indices)
  state.obstacles = state.obstacles.filter((_, i) => !hitIndices.has(i));
  return targets.length;
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. VOID RIFTS
// ─────────────────────────────────────────────────────────────────────────────
export const VOID_RIFT_EFFECTS = [
  { id: 'speedBoost', label: '⚡ Speed Boost!', color: '#06b6d4', duration: 4000,
    apply: (state) => { state.activePowerups.voidBoost = Date.now() + 4000; } },
  { id: 'slowDown',   label: '🐢 Verlangsamung!', color: '#a855f7', duration: 3000,
    apply: (state) => { state.activePowerups.voidSlow = Date.now() + 3000; } },
  { id: 'damage',     label: '💥 Void-Schaden!', color: '#ef4444', duration: 0,
    apply: (state, endGame) => {
      // If shield is active: absorb damage
      if (state.activePowerups?.shield) {
        delete state.activePowerups.shield;
        return false; // shield saved
      }
      // If ghost: skip damage
      if (state.ghostActive) return false;
      endGame();
      return true; // hit
    } },
];

/**
 * Spawn a Void Rift obstacle into the obstacle array.
 */
export const spawnVoidRift = (state, w) => {
  const size = 40 + Math.random() * 30;
  state.obstacles.push({
    x: Math.random() * (w - size),
    y: -size,
    startX: 0,
    width: size,
    height: size,
    speed: (3 + Math.random() * 2) * (state.speedMult || 1),
    color: '#a855f7',
    type: 'voidRift',
    angle: 0,
    vx: 0,
    riftPhase: Math.random() * Math.PI * 2,
    riftConsumed: false,
  });
};

/**
 * Roll and return a random void rift effect.
 */
export const rollVoidRiftEffect = () =>
  VOID_RIFT_EFFECTS[Math.floor(Math.random() * VOID_RIFT_EFFECTS.length)];

// ─────────────────────────────────────────────────────────────────────────────
// 4. LOADOUT SYSTEM — Ship Modules
// ─────────────────────────────────────────────────────────────────────────────
export const SHIP_MODULES = [
  {
    id: 'agility_core',
    name: 'Agility Core',
    icon: '🔷',
    desc: 'Schiff reagiert schneller auf Eingaben',
    slot: 'engine',
    stats: { agilityMult: 1.35 },
    drawbacks: { shieldRegenMult: 0.85 },
  },
  {
    id: 'heavy_plating',
    name: 'Heavy Plating',
    icon: '🛡️',
    desc: 'Schild hält länger, aber träges Handling',
    slot: 'hull',
    stats: { shieldDurationMult: 1.5 },
    drawbacks: { agilityMult: 0.80 },
  },
  {
    id: 'anti_toxin_filter',
    name: 'Anti-Toxin Filter',
    icon: '☣️',
    desc: 'Toxic Rain hat keinen Effekt',
    slot: 'hull',
    stats: { toxinImmunity: true },
    drawbacks: {},
  },
  {
    id: 'solar_visor',
    name: 'Solar-Visier',
    icon: '🕶️',
    desc: 'Solar Flares reduziert um 70%',
    slot: 'hull',
    stats: { solarFlareResist: 0.70 },
    drawbacks: {},
  },
  {
    id: 'overdrive_engine',
    name: 'Overdrive Engine',
    icon: '🚀',
    desc: '+20% Grundgeschwindigkeit, aber kein Shield-Start',
    slot: 'engine',
    stats: { speedMult: 1.20 },
    drawbacks: { noStartShield: true },
  },
  {
    id: 'void_lens',
    name: 'Void Lens',
    icon: '🔮',
    desc: 'Void Rift gibt immer Speed Boost (kein Schaden)',
    slot: 'special',
    stats: { voidRiftAlwaysBoost: true },
    drawbacks: {},
  },
  {
    id: 'emp_charger',
    name: 'EMP Charger',
    icon: '⚡',
    desc: 'EMP Blast Cooldown -40%',
    slot: 'special',
    stats: { empCooldownMult: 0.60 },
    drawbacks: {},
  },
];

export const MODULE_SLOTS = ['engine', 'hull', 'special'];
export const MAX_MODULE_SLOTS = 2;

/**
 * Build a flat stats object from an equipped modules array.
 * Later stats overwrite earlier ones for booleans; numbers are multiplied.
 */
export const computeModuleStats = (equippedIds = []) => {
  const stats = {
    agilityMult: 1,
    shieldDurationMult: 1,
    speedMult: 1,
    empCooldownMult: 1,
    toxinImmunity: false,
    solarFlareResist: 0,
    voidRiftAlwaysBoost: false,
    noStartShield: false,
  };
  for (const id of equippedIds) {
    const mod = SHIP_MODULES.find(m => m.id === id);
    if (!mod) continue;
    for (const [k, v] of Object.entries(mod.stats)) {
      if (typeof v === 'boolean') stats[k] = v;
      else if (typeof v === 'number') stats[k] *= v;
    }
    for (const [k, v] of Object.entries(mod.drawbacks)) {
      if (typeof v === 'boolean') stats[k] = v;
      else if (typeof v === 'number') stats[k] *= v;
    }
  }
  return stats;
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. DYNAMIC WEATHER SYSTEM
// ─────────────────────────────────────────────────────────────────────────────
export const WEATHER_EVENTS = [
  {
    id: 'toxic_rain',
    name: 'TOXIC RAIN',
    emoji: '☣️',
    color: '#84cc16',
    duration: 480,   // frames
    cooldown: 2400,
    overlay: { bg: 'rgba(132,204,22,0.08)', vignette: 'rgba(0,40,0,0.32)', blur: 2 },
    // Blocks Anti-Toxin Filter if present
    blockedBy: 'toxinImmunity',
  },
  {
    id: 'solar_flares',
    name: 'SOLAR FLARES',
    emoji: '☀️',
    color: '#fbbf24',
    duration: 360,
    cooldown: 2800,
    flashInterval: 90,  // every N frames a white flash
    flashDuration: 12,  // frames the flash lasts
    overlay: { bg: 'rgba(251,191,36,0.06)', vignette: 'rgba(60,30,0,0.2)' },
    resistedBy: 'solarFlareResist',  // 0–1 reduces flash alpha
  },
];

/**
 * Returns whether weather should trigger this frame.
 * Called from the game loop.
 */
export const shouldTriggerWeather = (state) => {
  if (state.weatherCooldown > 0) return false;
  if (state.weatherEvent) return false;
  if (state.score < 600) return false;
  if (state.frames % 200 !== 0) return false;
  return Math.random() < 0.45;
};

/**
 * Picks a random weather event, respecting cooldown IDs.
 */
export const pickWeatherEvent = (lastWeatherId) => {
  const pool = WEATHER_EVENTS.filter(e => e.id !== lastWeatherId);
  return pool[Math.floor(Math.random() * pool.length)];
};