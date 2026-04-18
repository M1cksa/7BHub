// ══════════════════════════════════════════════════════════════════
//  ASTRO BLITZ — HIGH-SPEED EVOLUTION UPDATE CONFIG
//  Senior Game Designer Document — vollständige Spielkonstanten
// ══════════════════════════════════════════════════════════════════

// ── 1. NEUE WAFFEN ────────────────────────────────────────────────
// Drei Waffen mit einzigartigen Mechaniken & Synergie-Effekten

export const NEW_WEAPONS = [
  {
    id: 'arc_pulse',
    name: 'Arc-Pulse',
    desc: 'Kettenblitz: Trifft bis zu 3 Gegner in Reichweite hintereinander.',
    icon: '⚡',
    rarity: 'rare',
    damage: 40,
    damagePerChain: 0.65,    // jedes weitere Ziel erhält 65% des vorherigen Schadens
    maxChains: 3,
    fireRate: 1.2,            // Schuss pro Sekunde
    range: 220,               // px
    chainRadius: 80,          // px — Radius für Kettenziel-Suche
    color: '#67e8f9',
    glowColor: '#06b6d4',
    cost: 18000,              // Tokens
    // Synergie: mit "Volt-Shield" → +20% Kettenreichweite & jede Kette lädt Schild auf
    synergyId: 'volt_shield',
    synergyBonus: { chainRadiusBonus: 0.2, shieldCharge: 5 },
    unlockWave: 5,
  },
  {
    id: 'gravity_lance',
    name: 'Gravity Lance',
    desc: 'Durchdringt alle Gegner in einer Linie. Trifft von vorne nach hinten.',
    icon: '🔱',
    rarity: 'epic',
    damage: 75,
    pierceDamageFalloff: 0.85, // jeder weitere Gegner in der Linie: 85% Schaden
    maxPierce: 5,
    fireRate: 0.6,
    range: 999,               // durchdringt den gesamten Bildschirm
    projectileWidth: 8,
    color: '#a855f7',
    glowColor: '#7c3aed',
    cost: 28000,
    // Synergie: mit "Mass Disruptor" Klasse → Gravity Lance verlangsamt Gegner um 30%
    synergyId: 'mass_disruptor',
    synergyBonus: { slowFactor: 0.3, slowDuration: 1.5 },
    unlockWave: 10,
  },
  {
    id: 'void_eruption',
    name: 'Void Eruption',
    desc: 'Laden-und-Lösen: Kurz halten = Mini-Burst. Lang halten = Mega-Explosion mit 250% Schaden.',
    icon: '🌌',
    rarity: 'legendary',
    damage: 60,               // Mini-Burst
    chargedDamage: 150,       // Mega-Explosion (250% von Mini-Burst)
    chargeTime: 1.8,          // Sekunden zum Max-Charge
    blastRadius: 120,         // px — AoE beim Mega-Burst
    fireRate: 1.0,
    selfDamage: 0,            // kein Self-Damage (balanciert durch Ladezeit)
    color: '#ec4899',
    glowColor: '#be185d',
    cost: 42000,
    // Synergie: mit "Phase-Shift" Klasse → Charged Shot löscht 1 nahes Projektil
    synergyId: 'phase_shift',
    synergyBonus: { projDestroy: 1, chargeBonus: 0.15 },
    unlockWave: 20,
  },
];

// Waffen-Schadenstabelle (inkl. Multiplier)
export const WEAPON_DAMAGE_TABLE = [
  { weapon: 'Arc-Pulse',       dmgBase: 40,  dmgMax: 92,  fireRate: 1.2, dps: 48,   chainDPS: '48–110 (3 Ziele)' },
  { weapon: 'Gravity Lance',   dmgBase: 75,  dmgMax: 269, fireRate: 0.6, dps: 45,   pierceDPS: '45–161 (5 Ziele)' },
  { weapon: 'Void Eruption',   dmgBase: 60,  dmgMax: 150, fireRate: 0.55,dps: 33,   chargedDPS: '82.5 (Lade-Bonus)' },
];

// ── 2. NEUE CHARAKTERKLASSEN ──────────────────────────────────────

export const NEW_CLASSES = [
  {
    id: 'volt_shield',
    name: 'Volt-Guardian',
    icon: '🛡️',
    desc: 'Defensiver Tank mit elektrischem Schild. Blockiert Projektile und gibt Schaden zurück.',
    role: 'Tank / Support',
    baseStats: {
      hp:         150,    // +50% gegenüber Standard (100)
      atk:         70,    // –30% gegenüber Standard (100)
      speed:       80,    // –20%
      shieldHP:    60,    // zusätzlicher Schild-Pool
    },
    passives: [
      { name: 'Statische Barriere',  desc: 'Beim Blocken gibt der Schild 25% des Schadens zurück.' },
      { name: 'Volt-Reload',          desc: 'Jeder blockierte Schuss lädt Arc-Pulse um 5% auf.' },
      { name: 'Überspannung',         desc: 'Bei 0 Schild-HP: 3 Sek. Unverwundbarkeit + 2× Schuss-Rate.' },
    ],
    teamAbility: {
      name: 'Schutzfeld',
      desc: 'Projiziert einen 3-Sek.-Schild auf den schwächsten Teamkollegen.',
      cooldown: 20,
      icon: '🔋',
    },
    synergies: ['arc_pulse'], // volle Synergie mit Arc-Pulse
    unlockCost: 35000,
  },
  {
    id: 'mass_disruptor',
    name: 'Mass Disruptor',
    icon: '🌀',
    desc: 'Kontroll-Spezialist: Verlangsamt, zieht und stößt Gegner. Perfekt für Wave-Clearing.',
    role: 'Control / Crowd Control',
    baseStats: {
      hp:         90,     // –10%
      atk:        110,    // +10%
      speed:      105,    // +5%
      gravityPull: 90,    // Sog-Radius in px
    },
    passives: [
      { name: 'Massenverzerrung', desc: 'Alle Schüsse verlangsamen Gegner um 15% (stackt nicht).' },
      { name: 'Schwarzes Loch',   desc: 'Alle 30 Sek.: Mini-Schwarzes-Loch zieht alle Gegner ins Zentrum.' },
      { name: 'Schwerkraft-Rüstung', desc: 'Gegner die zu nah kommen werden 20 px zurückgestoßen.' },
    ],
    teamAbility: {
      name: 'Gravitationsimpuls',
      desc: 'Stoppt alle Gegner auf dem Bildschirm für 2 Sekunden.',
      cooldown: 35,
      icon: '⏸️',
    },
    synergies: ['gravity_lance'],
    unlockCost: 40000,
  },
];

// ── 3. TEAM-ARENA (2v2 / 3v3) ─────────────────────────────────────

export const TEAM_ARENA_RULES = {
  modes: [
    {
      id: '2v2',
      name: '2v2 Duo-Blitz',
      players: 4,
      teamsOf: 2,
      duration: 180,      // Sekunden
      waveScaling: 1.3,   // Gegner sind 30% stärker als Solo
      lives: 5,           // gemeinsame Teamleben
      respawnDelay: 8,    // Sekunden
      icon: '👥',
    },
    {
      id: '3v3',
      name: '3v3 Squad-War',
      players: 6,
      teamsOf: 3,
      duration: 240,
      waveScaling: 1.6,
      lives: 8,
      respawnDelay: 10,
      icon: '⚔️',
    },
  ],

  // Spawn-Logik
  spawnRules: {
    respawnZones: [
      { zone: 'top_left',   team: 'A', safeRadius: 80 },
      { zone: 'top_right',  team: 'B', safeRadius: 80 },
      { zone: 'bottom_mid', team: 'neutral', safeRadius: 50 },
    ],
    spawnInvincibilityMs: 3000,  // 3 Sek. nach Respawn unverwundbar
    enemySpawnEdges: ['top', 'left', 'right'], // Gegner spawnen von diesen Seiten
    bossSpawnCenter: true,       // Boss-Gegner erscheinen in der Mitte
  },

  // Team-Fähigkeiten (1 pro Team, 60s Cooldown)
  teamAbilities: [
    {
      id: 'shared_shield',
      name: 'Team-Barriere',
      desc: 'Schützt das gesamte Team für 5 Sek. (stackt mit Einzel-Schilden).',
      cooldown: 60,
      teamBuff: { shieldDuration: 5000 },
      icon: '🔰',
    },
    {
      id: 'coordinated_strike',
      name: 'Koordinierter Angriff',
      desc: 'Alle Teamschüsse konvergieren auf ein Ziel für 4 Sek. → 3× Schaden.',
      cooldown: 45,
      teamBuff: { damageMult: 3, duration: 4000, convergence: true },
      icon: '🎯',
    },
    {
      id: 'repair_beacon',
      name: 'Reparatur-Beacon',
      desc: 'Stellt allen Teammates 30% HP über 8 Sek. wieder her.',
      cooldown: 70,
      teamBuff: { healPct: 0.3, duration: 8000 },
      icon: '💊',
    },
  ],

  // Siegbedingungen
  victoryConditions: {
    type: 'score',          // 'score' | 'last_team_standing' | 'objectives'
    scoreTarget: 10000,
    tiebreaker: 'hp_percentage', // Bei Gleichstand: Teamleben-% entscheidet
    alternateMode: {
      type: 'last_team_standing',
      desc: 'Letztes Team mit Leben gewinnt — keine Punktezählung.'
    }
  },
};

// ── 4. STORY-KAPITEL: "VOID CONVERGENCE" ─────────────────────────

export const STORY_CHAPTER_2 = {
  title: 'Void Convergence',
  chapterNumber: 2,
  cliffhanger: 'Nach dem Sieg über Commander Vex enthüllt ein sterbender Feind: ' +
    'Die Anomalie war kein Angriff — sie war ein NOTRUF. Etwas Unbekanntes nähert sich ' +
    'aus dem Void-Sektor. Und Vex war nur der Wächter.',

  newFaction: {
    name: 'Die Äther-Konfluenz',
    lore: 'Kein Feind. Keine Allianz. Eine kollektive Intelligenz aus verschmolzenen ' +
          'Pilot-Bewusstseinszuständen, die durch Void-Strahlung entstanden. ' +
          'Sie sprechen gleichzeitig in allen Sprachen. Sie wissen was du tun wirst.',
    icon: '🌐',
    enemyTypes: [
      { name: 'Konfluenz-Probe',    hp: 80,   atk: 35, spawnWave: 1, color: '#67e8f9' },
      { name: 'Bewusstseins-Shard', hp: 150,  atk: 65, spawnWave: 3, color: '#a855f7' },
      { name: 'Äther-Koloss',       hp: 600,  atk: 120, spawnWave: 7, isBoss: true, color: '#ec4899' },
    ],
  },

  missions: [
    {
      id: 'c2_m1',
      name: 'Erste Signale',
      type: 'exploration',
      desc: 'Fliege zum Void-Sektor und scanne 5 Anomalie-Punkte.',
      reward: { tokens: 1500, weapon: null },
      unlockCondition: 'chapter_1_complete',
    },
    {
      id: 'c2_m2',
      name: 'Kontaktprotokoll',
      type: 'survival',
      desc: 'Überlebe 3 Wellen der Konfluenz-Probes ohne Schaden.',
      reward: { tokens: 2500, weapon: 'arc_pulse' },
      unlockCondition: 'c2_m1_complete',
    },
    {
      id: 'c2_m3',
      name: 'Das Verhör',
      type: 'boss_rush',
      desc: 'Besiege den Äther-Koloss in unter 90 Sekunden.',
      reward: { tokens: 5000, class: 'mass_disruptor', badge: '🌐 Konfluenz-Brecher' },
      unlockCondition: 'c2_m2_complete',
      bossData: { id: 'aether_colossus', hp: 600, atk: 120, phases: 2 },
    },
    {
      id: 'c2_m4',
      name: 'Der Entscheid',
      type: 'moral_choice',
      desc: 'Die Konfluenz bietet Frieden an — gegen deine Erinnerungen. Lass sie ein oder öffne Feuer?',
      reward: { tokens: 8000, unlocks: ['void_eruption', 'alt_ending'] },
      unlockCondition: 'c2_m3_complete',
      choices: [
        { id: 'accept', label: '🤝 Frieden akzeptieren', consequence: 'alt_ending_unlocked' },
        { id: 'fight',  label: '🔥 Kämpfen',             consequence: 'void_eruption_unlocked' },
      ],
    },
  ],
};

// ── 5. WELLEN-SPAWN-RATEN (technische Daten) ─────────────────────

export const WAVE_DATA = [
  { wave: 1,  enemies: 8,   elites: 0, boss: false, spawnInterval: 2.5, speedMult: 1.0,  hpMult: 1.0  },
  { wave: 3,  enemies: 12,  elites: 1, boss: false, spawnInterval: 2.0, speedMult: 1.1,  hpMult: 1.15 },
  { wave: 5,  enemies: 15,  elites: 2, boss: false, spawnInterval: 1.8, speedMult: 1.2,  hpMult: 1.3  },
  { wave: 7,  enemies: 18,  elites: 3, boss: true,  spawnInterval: 1.5, speedMult: 1.35, hpMult: 1.5  },
  { wave: 10, enemies: 22,  elites: 4, boss: true,  spawnInterval: 1.2, speedMult: 1.5,  hpMult: 1.8  },
  { wave: 15, enemies: 28,  elites: 6, boss: true,  spawnInterval: 1.0, speedMult: 1.7,  hpMult: 2.2  },
  { wave: 20, enemies: 35,  elites: 8, boss: true,  spawnInterval: 0.8, speedMult: 2.0,  hpMult: 2.8  },
];

export const TEAM_WAVE_SCALING = {
  '2v2': { hpMultiplier: 1.3, speedMultiplier: 1.1, spawnRateMultiplier: 1.2 },
  '3v3': { hpMultiplier: 1.6, speedMultiplier: 1.2, spawnRateMultiplier: 1.4 },
};