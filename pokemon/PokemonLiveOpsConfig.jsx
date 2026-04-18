// ══════════════════════════════════════════════════════════════════
//  POKÉMON-FANPROJEKT — LIVE-OPS, PVP & TAUSCHSYSTEM CONFIG
//  Senior Game Designer Document
// ══════════════════════════════════════════════════════════════════

// ── 1. NEUE REGION: "NEBELKANTE" (MULTI-GEN INTEGRATION) ─────────

export const NEBEL_REGION = {
  name: 'Nebelkante',
  subtitle: 'Wo Generationen aufeinandertreffen',
  lore: 'Eine mystische Region zwischen zwei Kontinenten, in der Zeitanomalien ' +
        'Pokémon aus verschiedenen Generationen zusammenführen. Die Nebelkante ' +
        'ist kein Ort — sie ist ein Zustand.',
  icon: '🌫️',

  biomes: [
    {
      id: 'nebelwald',
      name: 'Nebelwald',
      env: 'forest',
      icon: '🌲',
      desc: 'Dichter Wald, Gen 1–2 Gras-/Gift-Typen. Pikachu, Bisasam, Endivie.',
      pokemonGenRange: [1, 2],
      spawnTypes: ['grass', 'poison', 'normal', 'bug'],
      spawnTable: [
        { id: 1,   name: 'Bisasam',   rate: 0.12, time: 'day'   },
        { id: 43,  name: 'Myrapla',   rate: 0.15, time: 'day'   },
        { id: 92,  name: 'Gastly',    rate: 0.08, time: 'night' },
        { id: 152, name: 'Endivie',   rate: 0.14, time: 'day'   },
        { id: 175, name: 'Togepi',    rate: 0.06, time: 'day',   weather: 'clear' },
        { id: 25,  name: 'Pikachu',   rate: 0.05, time: 'any',   special: 'rare' },
      ],
      weather: ['clear', 'rain', 'fog'],
    },
    {
      id: 'aschekueste',
      name: 'Aschekueste',
      env: 'fire',
      icon: '🌋',
      desc: 'Vulkanische Küste, Gen 1–3 Feuer-/Boden-Typen.',
      pokemonGenRange: [1, 3],
      spawnTypes: ['fire', 'ground', 'rock'],
      spawnTable: [
        { id: 4,   name: 'Glumanda',  rate: 0.12, time: 'any'   },
        { id: 58,  name: 'Fukano',    rate: 0.10, time: 'day'   },
        { id: 77,  name: 'Ponita',    rate: 0.14, time: 'day'   },
        { id: 111, name: 'Rihorn',    rate: 0.08, time: 'any'   },
        { id: 255, name: 'Flemmli',   rate: 0.12, time: 'any'   },
        { id: 126, name: 'Magmar',    rate: 0.07, time: 'night' },
        { id: 59,  name: 'Arkani',    rate: 0.02, time: 'any',   special: 'rare', weatherTrigger: 'heatwave' },
      ],
      weather: ['clear', 'sandstorm'],
    },
    {
      id: 'tiefmeer_hoehle',
      name: 'Tiefmeer-Höhle',
      env: 'water',
      icon: '🌊',
      desc: 'Unterwasser-Höhle mit Gen 1–4 Wasser-/Eis-Typen. Nachts erscheinen Geister.',
      pokemonGenRange: [1, 4],
      spawnTypes: ['water', 'ice', 'ghost'],
      spawnTable: [
        { id: 7,   name: 'Schiggy',   rate: 0.12, time: 'any'   },
        { id: 54,  name: 'Enton',     rate: 0.10, time: 'day'   },
        { id: 90,  name: 'Muschas',   rate: 0.15, time: 'any'   },
        { id: 86,  name: 'Jurob',     rate: 0.08, time: 'any'   },
        { id: 393, name: 'Plinfa',    rate: 0.10, time: 'any'   },
        { id: 418, name: 'Bamelin',   rate: 0.09, time: 'day'   },
        { id: 131, name: 'Lapras',    rate: 0.03, time: 'night', weather: 'rain', special: 'rare' },
      ],
      weather: ['rain', 'hail', 'fog'],
    },
    {
      id: 'psycho_turm',
      name: 'Psycho-Turm',
      env: 'psychic',
      icon: '🔮',
      desc: 'Verlassener Turm, Gen 1–5. Psycho-/Geist-Typen dominieren.',
      pokemonGenRange: [1, 5],
      spawnTypes: ['psychic', 'ghost', 'dark'],
      spawnTable: [
        { id: 63,  name: 'Abra',      rate: 0.10, time: 'any'   },
        { id: 92,  name: 'Gastly',    rate: 0.15, time: 'night' },
        { id: 562, name: 'Yamask',    rate: 0.12, time: 'night' },
        { id: 570, name: 'Zorua',     rate: 0.08, time: 'any'   },
        { id: 197, name: 'Nachtara',  rate: 0.07, time: 'night' },
        { id: 94,  name: 'Gengar',    rate: 0.02, time: 'night', special: 'event' },
      ],
      weather: ['fog'],
    },
  ],
};

// ── 2. COMPETITIVE PVP — MATCHMAKING & BALANCING ─────────────────

export const PVP_CONFIG = {
  matchmakingSystem: {
    type: 'ELO',
    startRating: 1000,
    kFactor: 32,           // ELO-K-Faktor (Ratingsensitivität)
    divisions: [
      { name: 'Novize',      minELO: 0,    maxELO: 999,  icon: '🥉', color: '#a16207' },
      { name: 'Trainer',     minELO: 1000, maxELO: 1199, icon: '🥈', color: '#6b7280' },
      { name: 'Rivale',      minELO: 1200, maxELO: 1499, icon: '🥇', color: '#d97706' },
      { name: 'Meister',     minELO: 1500, maxELO: 1799, icon: '💎', color: '#7c3aed' },
      { name: 'Elite',       minELO: 1800, maxELO: 2099, icon: '👑', color: '#ec4899' },
      { name: 'Legende',     minELO: 2100, maxELO: 9999, icon: '🌟', color: '#f59e0b' },
    ],
    queueTimeout: 120,     // Sekunden bis Skill-Range ausgeweitet wird
    rangeExpansion: 50,    // ELO-Punkte Erweiterung pro 30 Sek. Wartezeit
  },

  // Balancing-Regeln
  balancingRules: [
    {
      rule: 'Level-Normalisierung',
      desc: 'Im PvP werden alle Pokémon auf Level 50 normalisiert. Werte werden proportional angepasst.',
      implementation: (poke) => {
        const scaleFactor = 50 / (poke.level || 5);
        return {
          ...poke,
          hp:  Math.floor(poke.hp  * Math.min(scaleFactor, 2.5)),
          atk: Math.floor(poke.atk * Math.min(scaleFactor, 2.0)),
          def: Math.floor(poke.def * Math.min(scaleFactor, 2.0)),
        };
      },
    },
    {
      rule: 'Legendary-Beschränkung',
      desc: 'Legendäre Pokémon (Mewtu, Arktos, etc.) sind in Standard-PvP nicht erlaubt.',
      bannedIds: [144, 145, 146, 150, 243, 248],
      legendaryMode: 'Titan-Cup', // Separater Modus für Legendäre
    },
    {
      rule: 'Item-Beschränkung',
      desc: 'Im PvP: Nur 3 Items erlaubt. Keine Revive/Beleber. Keine X-Angriff Stacks.',
      allowedItems: ['potion', 'superp', 'fullheal'],
      maxItems: 3,
    },
    {
      rule: 'Typdeckung',
      desc: 'Das eigene Team darf maximal 2 Pokémon desselben Typs enthalten.',
      maxSameType: 2,
    },
    {
      rule: 'Nur-fangbare Pokémon',
      desc: 'Nur Pokémon, die der Spieler selbst gefangen hat, dürfen eingesetzt werden (catchable: true).',
      mustBeCaught: true,
    },
  ],

  // Belohnungsstruktur
  rewards: {
    win:  { baseELO: 15, baseTokens: 300, streakBonus: 50 },
    lose: { baseELO: -12, baseTokens: 50, consolation: true },
    draw: { baseELO: 0, baseTokens: 100 },
    seasonEndRewards: [
      { division: 'Novize',  tokens: 1000, badge: '🥉 Novize-Siegel' },
      { division: 'Trainer', tokens: 2000, badge: '🥈 Trainer-Siegel' },
      { division: 'Rivale',  tokens: 4000, badge: '🥇 Rivalen-Siegel', skin: 'pvp_rival_frame' },
      { division: 'Meister', tokens: 8000, badge: '💎 Meister-Siegel',  skin: 'pvp_master_frame', title: 'Meister' },
      { division: 'Elite',   tokens: 15000,badge: '👑 Elite-Siegel',    skin: 'pvp_elite_aura',  title: 'Elite-Vier' },
      { division: 'Legende', tokens: 25000,badge: '🌟 Legendär',        skin: 'pvp_legend_aura', title: 'Champion' },
    ],
  },
};

// ── 3. TAUSCHSYSTEM — FAIR PLAY & ANTI-BETRUG ────────────────────

export const TRADE_SYSTEM = {
  rules: {
    minTradeLevel: 5,           // Spieler muss mindestens Level 5 sein (Wins)
    maxPendingTrades: 3,        // Gleichzeitig max. 3 offene Angebote
    tradeWindowHours: 48,       // Angebot verfällt nach 48h
    cooldownAfterTrade: 60,     // Sekunden Cooldown nach Abschluss eines Trades
  },

  // Anti-Betrug Mechanismen
  antiFraud: [
    {
      name: 'Fair-Value-System',
      desc: 'Jedes Pokémon hat einen berechneten "Fair Value" (basierend auf Seltenheit, Level, Typ).',
      implementation: 'Trades mit >300% Wertunterschied werden markiert und benötigen Admin-Approval.',
      alertThreshold: 3.0,      // 300% Wertunterschied
    },
    {
      name: 'Neue-Nutzer-Sperre',
      desc: 'Accounts unter 3 Tagen alt können keine Legendären Pokémon tauschen.',
      minAccountAgeDays: 3,
      restrictedRarities: ['legendary', 'mythical'],
    },
    {
      name: 'Trade-Log',
      desc: 'Alle Trades werden 90 Tage lang gespeichert für Abuse-Reports.',
      retentionDays: 90,
    },
    {
      name: 'Einweg-Schutz',
      desc: 'Trades müssen von BEIDEN Seiten bestätigt werden. Einseitige Transfers nur an sich selbst.',
      requiresBothConfirm: true,
    },
    {
      name: 'Pay-to-Win-Schutz',
      desc: 'Nur selbst-gefangene oder selbst-verdiente Pokémon sind handelbar. Kein direkter Kauf von Pokémon mit Echtgeld.',
      noPurchasableWildPokemon: true,
      tokenBuyable: ['pokeballs', 'items'], // Nur Items, keine Pokémon
    },
  ],

  // Handelstypen
  tradeTypes: [
    {
      id: 'direct',
      name: 'Direkttausch',
      desc: 'Pokémon gegen Pokémon. Beide Seiten legen ein Pokémon + optionale Items an.',
      requiresItem: false,
    },
    {
      id: 'item_trade',
      name: 'Item-Beigabe',
      desc: 'Pokémon + Items gegen Pokémon + Items. Items erhöhen den Fair Value.',
      requiresItem: false,
    },
    {
      id: 'evolution_trade',
      name: 'Entwicklungs-Tausch',
      desc: 'Manche Pokémon entwickeln sich durch Tausch (z.B. Abra → Simsala).',
      evolutionBonus: true,
      evolutionPairs: [
        { fromId: 63, toId: 65,  name: 'Abra → Simsala' },
        { fromId: 66, toId: 68,  name: 'Machollo → Machomei' },
        { fromId: 123, toId: 212, name: 'Sichlor → Scherox' },
      ],
    },
  ],

  // Fair-Value Berechnung
  calculateFairValue: (pokemon) => {
    const baseValue = 100;
    const rarityMult  = pokemon.catchable ? 1.0 : 3.0;
    const levelBonus  = (pokemon.level || 5) * 8;
    const typeBonus   = ['dragon', 'psychic', 'ghost'].includes(pokemon.type) ? 1.4 : 1.0;
    return Math.floor((baseValue + levelBonus) * rarityMult * typeBonus);
  },
};

// ── 4. LIVE-EVENT-KALENDER (30 TAGE) ─────────────────────────────

export const LIVE_EVENT_CALENDAR = [
  // WOCHE 1
  {
    day: 1, date: 'Tag 1',
    event: {
      id: 'grand_opening',
      name: '🎊 Nebelkante Eröffnung',
      type: 'bonus_xp',
      desc: 'Doppelte XP für alle Kämpfe in der Nebelkante.',
      duration: 24,           // Stunden
      trigger: 'always',
      multiplier: 2.0,
      icon: '🎊',
    },
  },
  {
    day: 3, date: 'Tag 3',
    event: {
      id: 'rain_spawn',
      name: '🌧️ Regenfront',
      type: 'weather_spawn',
      desc: 'Regen in allen Biomen. Wasser-Pokémon spawnen 3× häufiger.',
      duration: 12,
      trigger: { weather: 'rain', time: 'any' },
      spawnBonus: { types: ['water', 'ice'], multiplier: 3.0 },
      rareSpawn: { id: 131, name: 'Lapras', rate: 0.05, condition: 'rain_active' },
      icon: '🌧️',
    },
  },
  {
    day: 5, date: 'Tag 5',
    event: {
      id: 'night_ghost_raid',
      name: '🌑 Geisterstunde',
      type: 'raid',
      desc: 'Nachts erscheint Gengar-Raid in der Tiefmeer-Höhle. Besiege ihn mit der Gruppe!',
      duration: 6,
      trigger: { time: 'night', timeRange: { start: 22, end: 4 } },
      raid: {
        bossId: 94,           // Gengar
        bossHP: 800,
        bossAtk: 200,
        maxPlayers: 5,
        reward: { tokens: 3000, badge: '👻 Geister-Bezwinger' },
      },
      icon: '🌑',
    },
  },
  // WOCHE 2
  {
    day: 8, date: 'Tag 8',
    event: {
      id: 'fire_festival',
      name: '🔥 Feuerfestival',
      type: 'biome_event',
      desc: 'Hitzewelle in der Aschekueste. Arkani erscheint, wenn 500 Feuer-Pokémon besiegt wurden.',
      duration: 48,
      trigger: { communityGoal: { type: 'defeat', pokemonType: 'fire', target: 500 } },
      communityReward: { id: 59, name: 'Arkani', spawnRate: 0.08, duration: 6 },
      icon: '🔥',
    },
  },
  {
    day: 10, date: 'Tag 10',
    event: {
      id: 'pvp_tournament',
      name: '⚔️ Nebelkante-Cup',
      type: 'tournament',
      desc: 'Wöchentliches PvP-Turnier. Top 3 erhalten exklusive Frames.',
      duration: 72,
      trigger: 'scheduled',
      format: 'single_elimination',
      brackets: [8, 16, 32],
      rewards: [
        { place: 1, tokens: 10000, badge: '🥇 Nebelkante-Champion', frame: 'nebel_gold' },
        { place: 2, tokens: 5000,  badge: '🥈 Nebelkante-Finalist',  frame: 'nebel_silver' },
        { place: 3, tokens: 2500,  badge: '🥉 Nebelkante-Semi',     frame: 'nebel_bronze' },
      ],
      icon: '⚔️',
    },
  },
  {
    day: 12, date: 'Tag 12',
    event: {
      id: 'psycho_tower_mystery',
      name: '🔮 Turm der Geheimnisse',
      type: 'mystery_event',
      desc: 'Im Psycho-Turm erscheinen für 24h zufällige Pokémon aus allen Generationen.',
      duration: 24,
      trigger: { time: 'night', biome: 'psycho_turm' },
      specialSpawns: [
        { id: 196, name: 'Psiana',  rate: 0.06, condition: 'psycho_turm_active' },
        { id: 65,  name: 'Simsala', rate: 0.04, condition: 'psycho_turm_active' },
      ],
      icon: '🔮',
    },
  },
  // WOCHE 3
  {
    day: 15, date: 'Tag 15',
    event: {
      id: 'legendary_birds',
      name: '🦅 Tag der Legendären Vögel',
      type: 'legendary_spawn',
      desc: 'Arktos, Zapdos und Lavados können für 8h in ihren Biomen als Raid-Bosse herausgefordert werden.',
      duration: 8,
      trigger: { time: 'day', condition: 'midpoint_event' },
      raidBosses: [
        { id: 144, name: 'Arktos',  biome: 'tiefmeer_hoehle', hp: 1200, reward: 5000 },
        { id: 145, name: 'Zapdos', biome: 'psycho_turm',     hp: 1200, reward: 5000 },
        { id: 146, name: 'Lavados',biome: 'aschekueste',     hp: 1200, reward: 5000 },
      ],
      icon: '🦅',
    },
  },
  {
    day: 17, date: 'Tag 17',
    event: {
      id: 'shiny_weekend',
      name: '✨ Glitzer-Wochenende',
      type: 'shiny_boost',
      desc: 'Shiny-Rate für alle Pokémon x5. (Visuelle Besonderheit, kein Stat-Bonus)',
      duration: 48,
      trigger: { dayOfWeek: [0, 6] }, // Samstag & Sonntag
      shinyMultiplier: 5,
      icon: '✨',
    },
  },
  {
    day: 19, date: 'Tag 19',
    event: {
      id: 'trade_festival',
      name: '🤝 Tauschmarkt',
      type: 'economy',
      desc: 'Trade-Cooldowns auf 10s reduziert. Faire Trades geben 50% Token-Bonus.',
      duration: 24,
      trigger: 'scheduled',
      tradeBonus: { cooldownReduction: 0.83, fairTradeTokenBonus: 0.5 },
      icon: '🤝',
    },
  },
  // WOCHE 4
  {
    day: 22, date: 'Tag 22',
    event: {
      id: 'dragon_invasion',
      name: '🐉 Dracheninvasion',
      type: 'invasion',
      desc: 'Dragon-Pokémon aus Gen 1–4 invadieren alle Biome. Dratini sehr häufig!',
      duration: 36,
      trigger: { condition: 'community_goal', goal: 100 }, // 100 aktive Spieler
      spawnBonus: { types: ['dragon'], multiplier: 4.0, addedPokemon: [147, 148, 443] },
      icon: '🐉',
    },
  },
  {
    day: 25, date: 'Tag 25',
    event: {
      id: 'fog_of_war',
      name: '🌫️ Dichte Nebelschwaden',
      type: 'mystery_spawn',
      desc: 'Nebel-Wetter aktiviert: Unbekannte Pokémon erscheinen ohne Vorankündigung.',
      duration: 12,
      trigger: { weather: 'fog', probability: 0.7 },
      mysterySpawns: 'random_any_gen', // Pokémon aus einer zufälligen Generation
      icon: '🌫️',
    },
  },
  {
    day: 28, date: 'Tag 28',
    event: {
      id: 'mewtu_encounter',
      name: '🧬 Mewtu-Annäherung',
      type: 'legendary_raid',
      desc: 'Das stärkste Event des Monats: Mewtu-Raid für 4h. Nur Gruppen von 5 haben eine Chance.',
      duration: 4,
      trigger: { time: 'night', timeRange: { start: 20, end: 24 }, condition: 'end_of_month' },
      raid: {
        bossId: 150,
        bossHP: 2500,
        bossAtk: 300,
        maxPlayers: 5,
        reward: { tokens: 15000, badge: '🧬 Mewtu-Bezwinger', title: 'Psycho-Meister' },
      },
      icon: '🧬',
    },
  },
  {
    day: 30, date: 'Tag 30',
    event: {
      id: 'season_finale',
      name: '🏆 Saisonfinale',
      type: 'finale',
      desc: 'Alle Bonus-Spawns aktiv. PvP-Saison endet. Season-Belohnungen ausgezahlt.',
      duration: 24,
      trigger: 'scheduled',
      effects: ['double_tokens', 'all_biome_bonuses', 'pvp_season_end'],
      icon: '🏆',
    },
  },
];

// Hilfs-Funktion: Gibt aktive Events für den aktuellen Tag zurück
export function getActiveEvents(dayOfMonth = new Date().getDate(), hourOfDay = new Date().getHours()) {
  return LIVE_EVENT_CALENDAR.filter(entry => {
    const event = entry.event;
    if (entry.day > dayOfMonth) return false;
    const eventEndsDay = entry.day + Math.ceil((event.duration || 24) / 24);
    if (dayOfMonth >= eventEndsDay) return false;

    // Zeit-Trigger prüfen
    if (event.trigger?.time === 'night' && (hourOfDay < 20 && hourOfDay >= 6)) return false;
    if (event.trigger?.time === 'day'   && (hourOfDay >= 20 || hourOfDay < 6)) return false;

    return true;
  }).map(e => e.event);
}

// Spawn-Rate-Berechnung mit Event-Boost
export function getSpawnRateWithBonus(pokemonId, baseRate, activeEvents) {
  let multiplier = 1.0;
  for (const event of activeEvents) {
    if (event.spawnBonus) {
      const pokemon = getPokemonById(pokemonId);
      if (pokemon && event.spawnBonus.types?.includes(pokemon.type)) {
        multiplier *= event.spawnBonus.multiplier;
      }
    }
    if (event.specialSpawns) {
      const special = event.specialSpawns.find(s => s.id === pokemonId);
      if (special) multiplier *= (special.rate / baseRate);
    }
  }
  return Math.min(baseRate * multiplier, 0.8); // Maximal 80% Spawn-Rate
}

function getPokemonById(id) {
  // Gibt Pokémon-Basisinfos zurück (vereinfacht)
  const types = {
    7: 'water', 25: 'electric', 94: 'ghost', 131: 'water',
    144: 'ice', 145: 'electric', 146: 'fire', 147: 'dragon', 148: 'dragon', 150: 'psychic',
    443: 'dragon', 59: 'fire',
  };
  return types[id] ? { id, type: types[id] } : null;
}