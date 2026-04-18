// ─── Season 2: Neon Apocalypse — Void Pokémon System ─────────────────────────
// Architektur-Entscheidung: Alles in einer Datei, damit keine zirkulären Importe entstehen.
// Die Void-Infizierung ist eine Overlay-Logik auf POKEMON_DATA — keine neuen Entitäten nötig.

export const S2_SEASON_START = new Date('2026-04-01T00:00:00+02:00');
export const S2_SEASON_END   = new Date('2026-07-01T00:00:00+02:00');

export function isS2Active() {
  const now = new Date();
  return now >= S2_SEASON_START && now < S2_SEASON_END;
}

// ─── 1. VOID-INFIZIERTE POKÉMON ───────────────────────────────────────────────
// Welche Pokémon können void-infiziert spawnen (IDs aus POKEMON_DATA)
export const VOID_ELIGIBLE_IDS = [92, 94, 197, 302, 570, 562, 229, 215];

// Stat-Multiplikatoren für void-infizierte Varianten
export const VOID_STAT_BOOST = { hp: 1.35, atk: 1.40, def: 1.25, spd: 1.20 };

// Prüft ob ein Pokémon void-infiziert ist (Flag im Objekt)
export function isVoidInfected(poke) {
  return !!poke?.void_infected;
}

// Erstellt eine void-infizierte Kopie eines Pokémon
export function makeVoidInfected(poke) {
  return {
    ...JSON.parse(JSON.stringify(poke)),
    void_infected: true,
    name: `Void-${poke.name}`,
    type: 'void', // Neuer Pseudo-Typ
    hp:  Math.floor(poke.hp  * VOID_STAT_BOOST.hp),
    atk: Math.floor(poke.atk * VOID_STAT_BOOST.atk),
    def: Math.floor(poke.def * VOID_STAT_BOOST.def),
    spd: Math.floor(poke.spd * VOID_STAT_BOOST.spd),
    catchable: false, // Standard-Bälle funktionieren NICHT
    void_catchable: false, // Wird auf true gesetzt, wenn Quest-Bedingung erfüllt
  };
}

// Prüft ob der Spieler den Void-Catcher hat (localStorage)
export function hasVoidCatcher() {
  try {
    const inv = JSON.parse(localStorage.getItem('pkS2Inventory') || '{}');
    return (inv.void_catcher || 0) > 0;
  } catch { return false; }
}

// Prüft ob Quest-Bedingung im Kampf erfüllt: Void-Pokémon unter 20% HP bringen
export function checkVoidCatchCondition(enemyHP, enemyMaxHP) {
  return (enemyHP / enemyMaxHP) <= 0.20;
}

// ─── 2. SHARD-EVOLUTIONEN ────────────────────────────────────────────────────
// Erweitert EVOLUTION_CHAINS um saisonal-limitierte Shard-Trigger
// Format: { fromId, toId, shardType, shardCost, toName, statBoost, seasonEnd, apocalypseForm }
export const SHARD_EVOLUTIONS = [
  {
    fromId: 92,   toId: 9001, shardType: 'void',  shardCost: 3,
    fromName: 'Gastly', toName: 'Void-Gengar',
    statBoost: { hp: 1.5, atk: 1.7, def: 1.3, spd: 1.4 },
    apocalypseForm: true, seasonEnd: S2_SEASON_END,
    newMoves: [
      { name: 'Void-Blitz', power: 110, type: 'ghost', pp: 8 },
      { name: 'Apokalypse-Schlag', power: 130, type: 'dark', pp: 5 },
    ],
  },
  {
    fromId: 147, toId: 9002, shardType: 'nova',  shardCost: 5,
    fromName: 'Dratini', toName: 'Nova-Dragoran',
    statBoost: { hp: 1.6, atk: 1.8, def: 1.4, spd: 1.5 },
    apocalypseForm: true, seasonEnd: S2_SEASON_END,
    newMoves: [
      { name: 'Nova-Sturm', power: 150, type: 'dragon', pp: 5 },
      { name: 'Sternenstrom', power: 90, type: 'electric', pp: 10 },
    ],
  },
  {
    fromId: 25,  toId: 9003, shardType: 'void',  shardCost: 2,
    fromName: 'Pikachu', toName: 'Apocalypse-Raichu',
    statBoost: { hp: 1.3, atk: 1.6, def: 1.2, spd: 1.5 },
    apocalypseForm: true, seasonEnd: S2_SEASON_END,
    newMoves: [
      { name: 'Void-Donner', power: 120, type: 'electric', pp: 5 },
      { name: 'Neon-Blitz', power: 85,  type: 'electric', pp: 12 },
    ],
  },
  {
    fromId: 570, toId: 9004, shardType: 'nova',  shardCost: 4,
    fromName: 'Zorua', toName: 'Nova-Zoroark',
    statBoost: { hp: 1.4, atk: 1.75, def: 1.3, spd: 1.6 },
    apocalypseForm: true, seasonEnd: S2_SEASON_END,
    newMoves: [
      { name: 'Neon-Täuschung', power: 100, type: 'dark', pp: 8 },
      { name: 'Apokalypse-Feuer', power: 90,  type: 'fire', pp: 10 },
    ],
  },
];

// Apokalypse-Formen als virtuelle Pokémon-Einträge (für Kämpfe)
export const APOCALYPSE_FORMS = {
  9001: { id: 9001, name: 'Void-Gengar',     type: 'ghost', hp: 150, atk: 161, def: 72, spd: 143, catchable: false, void_form: true,
    moves: [{ name: 'Void-Blitz', power: 110, type: 'ghost', pp: 8 }, { name: 'Apokalypse-Schlag', power: 130, type: 'dark', pp: 5 }, { name: 'Spukball', power: 80, type: 'ghost', pp: 15 }, { name: 'Shadowball', power: 80, type: 'ghost', pp: 15 }] },
  9002: { id: 9002, name: 'Nova-Dragoran',   type: 'dragon', hp: 208, atk: 230, def: 108, spd: 120, catchable: false, void_form: true,
    moves: [{ name: 'Nova-Sturm', power: 150, type: 'dragon', pp: 5 }, { name: 'Sternenstrom', power: 90, type: 'electric', pp: 10 }, { name: 'Drako-Meteor', power: 130, type: 'dragon', pp: 5 }, { name: 'Donner', power: 90, type: 'electric', pp: 10 }] },
  9003: { id: 9003, name: 'Apocalypse-Raichu', type: 'electric', hp: 117, atk: 136, def: 72, spd: 165, catchable: false, void_form: true,
    moves: [{ name: 'Void-Donner', power: 120, type: 'electric', pp: 5 }, { name: 'Neon-Blitz', power: 85, type: 'electric', pp: 12 }, { name: 'Donnerblitz', power: 90, type: 'electric', pp: 15 }, { name: 'Körpercheck', power: 100, type: 'normal', pp: 15 }] },
  9004: { id: 9004, name: 'Nova-Zoroark',    type: 'dark', hp: 91, atk: 140, def: 52, spd: 104, catchable: false, void_form: true,
    moves: [{ name: 'Neon-Täuschung', power: 100, type: 'dark', pp: 8 }, { name: 'Apokalypse-Feuer', power: 90, type: 'fire', pp: 10 }, { name: 'Foulspiel', power: 95, type: 'dark', pp: 15 }, { name: 'Shadowball', power: 80, type: 'ghost', pp: 15 }] },
};

// Prüft ob eine Shard-Evolution möglich ist (und Season aktiv)
export function checkShardEvolution(pokeId) {
  if (!isS2Active()) return null;
  return SHARD_EVOLUTIONS.find(e => e.fromId === pokeId) || null;
}

// Shard-Inventar lesen/schreiben
export function getShardInventory() {
  try { return JSON.parse(localStorage.getItem('pkS2Shards') || '{"void":0,"nova":0}'); }
  catch { return { void: 0, nova: 0 }; }
}

export function saveShardInventory(shards) {
  localStorage.setItem('pkS2Shards', JSON.stringify(shards));
}

// Shard-Evolution durchführen — gibt neues Pokémon zurück oder null
export function performShardEvolution(poke, evo) {
  const shards = getShardInventory();
  if ((shards[evo.shardType] || 0) < evo.shardCost) return null;
  shards[evo.shardType] -= evo.shardCost;
  saveShardInventory(shards);
  const form = APOCALYPSE_FORMS[evo.toId];
  if (!form) return null;
  return { ...JSON.parse(JSON.stringify(form)), evolved_from: poke.id, evolved_at: new Date().toISOString(), s2_exclusive: true };
}

// ─── 3. VERSTRAHLTE ZONEN ────────────────────────────────────────────────────
// Zonen-Manager: Welche Map-Nodes sind aktuell verstrahlt?
export const IRRADIATED_ZONES = [
  {
    id: 'void_zone_1', nodeIds: ['route5', 'fuchsia'],
    name: 'Verstrahlte Zone Alpha', emoji: '☢️',
    color: '#84cc16', glowColor: 'rgba(132,204,22,0.4)',
    voidSpawnRate: 0.55,  // 55% Chance auf Void-Pokémon statt normal
    shardDropRate: 0.35,  // 35% Chance auf Shard-Drop nach Kampf
    shardType: 'void',
    debuff: { type: 'hp_drain', value: 0.04 }, // 4% max HP Verlust pro Kampfeingang
    protectionItem: 'protection_suit',
    activeUntil: S2_SEASON_END,
  },
  {
    id: 'void_zone_2', nodeIds: ['route7', 'cinnabar'],
    name: 'Verstrahlte Zone Beta', emoji: '☢️',
    color: '#a855f7', glowColor: 'rgba(168,85,247,0.4)',
    voidSpawnRate: 0.70,
    shardDropRate: 0.50,
    shardType: 'nova',
    debuff: { type: 'spd_reduce', value: 0.15 }, // -15% Initiative
    protectionItem: 'protection_suit',
    activeUntil: S2_SEASON_END,
  },
];

export function getIrradiatedZone(nodeId) {
  if (!isS2Active()) return null;
  return IRRADIATED_ZONES.find(z => z.nodeIds.includes(nodeId)) || null;
}

export function hasProtectionSuit() {
  try {
    const inv = JSON.parse(localStorage.getItem('pkS2Inventory') || '{}');
    return (inv.protection_suit || 0) > 0;
  } catch { return false; }
}

// Shard-Drop nach Kampf in verstrahlter Zone
export function rollShardDrop(zone) {
  if (!zone || Math.random() > zone.shardDropRate) return null;
  const shards = getShardInventory();
  shards[zone.shardType] = (shards[zone.shardType] || 0) + 1;
  saveShardInventory(shards);
  return zone.shardType;
}

// ─── 4. S2 INVENTAR (Void-Catcher, Schutzausrüstung) ─────────────────────────
export const S2_ITEMS = [
  {
    id: 'void_catcher', name: 'Void-Catcher', icon: '🌀',
    desc: 'Fange Void-Infizierte Pokémon. Funktioniert nur unter 20% HP.',
    craftCost: { void: 3 }, buyCoins: 2000,
  },
  {
    id: 'protection_suit', name: 'Schutzausrüstung', icon: '🛡️',
    desc: 'Schützt dein Team vor Debuffs in verstrahlten Zonen.',
    craftCost: { void: 1, nova: 1 }, buyCoins: 1500,
  },
];

export function getS2Inventory() {
  try { return JSON.parse(localStorage.getItem('pkS2Inventory') || '{}'); }
  catch { return {}; }
}
export function saveS2Inventory(inv) {
  localStorage.setItem('pkS2Inventory', JSON.stringify(inv));
}

// ─── 5. PVP LAST STAND ───────────────────────────────────────────────────────
// Prüft ob ein Team PvP-berechtigt ist (mind. 1 Void/Shard-Pokemon)
export function isLastStandEligible(party) {
  return party.some(p => p && (p.void_infected || p.void_form || p.s2_exclusive));
}

// Elo-Berechnung (Standard K=32)
export function calcElo(winnerElo, loserElo, k = 32) {
  const expected = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  return {
    winner: Math.round(winnerElo + k * (1 - expected)),
    loser:  Math.round(loserElo  + k * (0 - (1 - expected))),
  };
}

// Rang-Titel basierend auf Elo
export function getLastStandRank(elo) {
  if (elo >= 2200) return { title: '☄️ Void-Kaiser',   color: '#f43f5e', min: 2200 };
  if (elo >= 1900) return { title: '🌌 Apokalypse-Lord', color: '#a855f7', min: 1900 };
  if (elo >= 1600) return { title: '⚡ Neon-Krieger',   color: '#06b6d4', min: 1600 };
  if (elo >= 1300) return { title: '🛡️ Void-Wächter',  color: '#4ade80', min: 1300 };
  return                  { title: '⚔️ Rookie',         color: '#9ca3af', min: 0    };
}

// localStorage-basiertes PvP-Rating (für Offline-Demo, kann auf DB migriert werden)
export function getMyLastStandElo() {
  return parseInt(localStorage.getItem('pkLastStandElo') || '1000');
}
export function saveMyLastStandElo(elo) {
  localStorage.setItem('pkLastStandElo', Math.max(0, elo).toString());
}
export function getMyLastStandWins() {
  return parseInt(localStorage.getItem('pkLastStandWins') || '0');
}
export function saveMyLastStandWins(w) {
  localStorage.setItem('pkLastStandWins', w.toString());
}