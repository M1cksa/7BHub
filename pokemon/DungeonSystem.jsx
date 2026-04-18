// ─── Endloses Prozedurales Dungeon-System ─────────────────────────────────────
// Endlos skalierend • Brutal schwer • Legendäre Pokémon • Visuelle Effekte

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skull, Flame, Zap, Shield, Swords, Star, Lock, Trophy, ChevronRight } from 'lucide-react';

// ─── Dungeon-Typen ─────────────────────────────────────────────────────────────
export const DUNGEON_TYPES = [
  { id: 'cave',     name: 'Abyssus-Höhle',    emoji: '⛰️', color: '#78716c', bg: 'from-stone-950 via-slate-950 to-black',       glow: 'rgba(120,113,108,0.4)', types: ['rock', 'ground', 'steel', 'ghost'] },
  { id: 'forest',   name: 'Ewiger Wald',       emoji: '🌲', color: '#16a34a', bg: 'from-emerald-950 via-green-950 to-black',     glow: 'rgba(22,163,74,0.4)',   types: ['grass', 'bug', 'flying', 'normal'] },
  { id: 'water',    name: 'Tiefseegraben',     emoji: '🌊', color: '#0284c7', bg: 'from-blue-950 via-cyan-950 to-black',         glow: 'rgba(2,132,199,0.4)',   types: ['water', 'ice', 'electric'] },
  { id: 'volcano',  name: 'Vulkan-Inferno',    emoji: '🌋', color: '#dc2626', bg: 'from-red-950 via-orange-950 to-black',        glow: 'rgba(220,38,38,0.5)',   types: ['fire', 'ground', 'rock'] },
  { id: 'psychic',  name: 'Geisterschloss',    emoji: '🔮', color: '#7c3aed', bg: 'from-purple-950 via-violet-950 to-black',     glow: 'rgba(124,58,237,0.5)',  types: ['psychic', 'ghost', 'dark', 'fairy'] },
  { id: 'dragon',   name: 'Drachennest',       emoji: '🐉', color: '#4338ca', bg: 'from-indigo-950 via-violet-950 to-black',     glow: 'rgba(67,56,202,0.5)',   types: ['dragon', 'flying', 'dark'] },
  { id: 'void',     name: 'Void-Dimension',    emoji: '☠️', color: '#a855f7', bg: 'from-purple-950 via-black to-slate-950',      glow: 'rgba(168,85,247,0.6)',  types: ['ghost', 'dark', 'psychic', 'dragon'] },
  { id: 'cosmic',   name: 'Kosmos-Ruinen',     emoji: '🌌', color: '#fbbf24', bg: 'from-yellow-950 via-amber-950 to-black',      glow: 'rgba(251,191,36,0.5)', types: ['psychic', 'fairy', 'dragon', 'normal'] },
  // Post-Game Exclusive Dungeons
  { id: 'abyss',    name: 'Der Ewige Abgrund', emoji: '🕳️', color: '#020202', bg: 'from-black via-slate-950 to-black',           glow: 'rgba(255,255,255,0.15)',types: ['ghost', 'dark', 'steel', 'dragon'] },
  { id: 'celestial',name: 'Himmelsburg',       emoji: '✨', color: '#e0f2fe', bg: 'from-sky-950 via-indigo-950 to-black',         glow: 'rgba(224,242,254,0.5)', types: ['fairy', 'flying', 'psychic', 'dragon'] },
  { id: 'hell',     name: 'Feuer-Hölle',       emoji: '😈', color: '#ff2200', bg: 'from-red-950 via-red-900 to-black',            glow: 'rgba(255,34,0,0.7)',    types: ['fire', 'fighting', 'dark', 'dragon'] },
];

// ─── Schwierigkeiten (BRUTAL skalierend) ────────────────────────────────────────
export const DUNGEON_DIFFICULTIES = [
  { id: 'normal',   name: 'Normal',        emoji: '🟡', rooms: [5, 7],   statMult: 1.0,  tokenMult: 1.0,  coinMult: 1.0,  bossStatMult: 1.6  },
  { id: 'hard',     name: 'Schwer',        emoji: '🔴', rooms: [7, 9],   statMult: 1.5,  tokenMult: 2.0,  coinMult: 1.5,  bossStatMult: 2.2  },
  { id: 'brutal',   name: 'Brutal',        emoji: '💀', rooms: [9, 12],  statMult: 2.2,  tokenMult: 3.5,  coinMult: 2.5,  bossStatMult: 3.2  },
  { id: 'inferno',  name: 'Inferno',       emoji: '🔥', rooms: [12, 15], statMult: 3.0,  tokenMult: 5.0,  coinMult: 4.0,  bossStatMult: 4.5  },
  { id: 'godtier',  name: 'GOTT-MODUS',    emoji: '👑', rooms: [15, 20], statMult: 5.0,  tokenMult: 10.0, coinMult: 8.0,  bossStatMult: 8.0  },
  { id: 'absolute', name: 'ABSOL. CHAOS',  emoji: '🌀', rooms: [18, 25], statMult: 8.0,  tokenMult: 20.0, coinMult: 15.0, bossStatMult: 14.0 },
  // Post-Game exclusive difficulties
  { id: 'nightmare',name: '💀 ALBTRAUM',   emoji: '😱', rooms: [20, 28], statMult: 12.0, tokenMult: 35.0, coinMult: 25.0, bossStatMult: 22.0 },
  { id: 'omega',    name: '⚡ OMEGA',      emoji: '🔱', rooms: [25, 35], statMult: 20.0, tokenMult: 60.0, coinMult: 50.0, bossStatMult: 40.0 },
];

// ─── Legendäre Boss-Pokémon ────────────────────────────────────────────────────
const LEGENDARY_BOSSES = [
  { id: 150, name: 'Mewtu',    type: 'psychic', hp: 200, atk: 180, def: 150, spd: 150, moves: [{ name: 'Psychokinese', power: 90, type: 'psychic', pp: 10 }, { name: 'Shadowball', power: 80, type: 'ghost', pp: 15 }, { name: 'Donner', power: 90, type: 'electric', pp: 10 }, { name: 'Feuerssturm', power: 110, type: 'fire', pp: 5 }] },
  { id: 249, name: 'Lugia',    type: 'psychic', hp: 210, atk: 140, def: 170, spd: 140, moves: [{ name: 'Aeroblast', power: 100, type: 'flying', pp: 5 }, { name: 'Eisstrahl', power: 90, type: 'ice', pp: 10 }, { name: 'Donnerschlag', power: 65, type: 'electric', pp: 20 }, { name: 'Psychokinese', power: 90, type: 'psychic', pp: 10 }] },
  { id: 250, name: 'Ho-Oh',    type: 'fire',    hp: 205, atk: 160, def: 155, spd: 115, moves: [{ name: 'Heiliges Feuer', power: 100, type: 'fire', pp: 5, status: 'burn', statusChance: 0.5 }, { name: 'Feuerssturm', power: 110, type: 'fire', pp: 5 }, { name: 'Morgengrauen', power: 85, type: 'fairy', pp: 10 }, { name: 'Windscherung', power: 60, type: 'flying', pp: 35 }] },
  { id: 384, name: 'Rayquaza', type: 'dragon',  hp: 195, atk: 185, def: 165, spd: 120, moves: [{ name: 'Drako-Meteor', power: 130, type: 'dragon', pp: 5 }, { name: 'Feuerssturm', power: 110, type: 'fire', pp: 5 }, { name: 'Donner', power: 90, type: 'electric', pp: 10 }, { name: 'Luftschnitt', power: 75, type: 'flying', pp: 20 }] },
  { id: 483, name: 'Dialga',   type: 'steel',   hp: 200, atk: 175, def: 170, spd: 115, moves: [{ name: 'Roar of Time', power: 150, type: 'dragon', pp: 5 }, { name: 'Klingensturm', power: 80, type: 'steel', pp: 20 }, { name: 'Erdkraft', power: 90, type: 'ground', pp: 10 }, { name: 'Eisstrahl', power: 90, type: 'ice', pp: 10 }] },
  { id: 484, name: 'Palkia',   type: 'water',   hp: 185, atk: 165, def: 140, spd: 130, moves: [{ name: 'Spacial Rend', power: 100, type: 'dragon', pp: 5 }, { name: 'Nassschweif', power: 90, type: 'water', pp: 10 }, { name: 'Drachen-Puls', power: 85, type: 'dragon', pp: 10 }, { name: 'Feuerssturm', power: 110, type: 'fire', pp: 5 }] },
  { id: 493, name: 'Arceus',   type: 'normal',  hp: 250, atk: 210, def: 200, spd: 180, moves: [{ name: 'Urteilsschlag', power: 120, type: 'normal', pp: 10 }, { name: 'Psychokinese', power: 90, type: 'psychic', pp: 10 }, { name: 'Feuerssturm', power: 110, type: 'fire', pp: 5 }, { name: 'Hyper-Strahl', power: 150, type: 'normal', pp: 5 }] },
];

const SEMI_RARE_BOSSES = [
  { id: 149, name: 'Dragoran',  type: 'dragon'  },
  { id: 248, name: 'Despotar',  type: 'rock'    },
  { id: 130, name: 'Garados',   type: 'water'   },
  { id: 143, name: 'Relaxo',    type: 'normal'  },
  { id: 94,  name: 'Gengar',    type: 'ghost'   },
  { id: 65,  name: 'Simsala',   type: 'psychic' },
  { id: 445, name: 'Knakrack',  type: 'dragon'  },
];

const ROOM_TYPES = ['trainer', 'wild', 'wild', 'item', 'miniboss', 'rest', 'elite', 'trap'];

const TRAINER_PREFIXES = ['Elite', 'Dungeon-', 'Finster-', 'Schatten-', 'Chaos-', 'Inferno-', 'Void-', 'Götter-'];
const TRAINER_SUFFIXES = ['Ritter', 'Krieger', 'Magier', 'Wächter', 'Jäger', 'Meister', 'Zerstörer', 'Titan'];

function rFrom(arr, rng) { return arr[Math.floor(rng() * arr.length)]; }
function seededRandom(seed) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

// ─── Dungeon generieren ────────────────────────────────────────────────────────
// dungeonIndex: 0-∞, je höher desto schwerer
// badgeCount: Orden-Count für Basis-Skalierung
// infiniteFloor: endloser Etagen-Counter (addiert extreme Skalierung)
export function generateDungeon(dungeonIndex, badgeCount = 0, infiniteFloor = 0) {
  const totalDifficulty = badgeCount + infiniteFloor;
  const seed = dungeonIndex * 1337 + totalDifficulty * 42 + 7;
  const rng = seededRandom(seed);

  const typeIdx = Math.floor(rng() * DUNGEON_TYPES.length);
  const dungeonType = DUNGEON_TYPES[typeIdx];

  // Schwierigkeit: beginnt bei normal, skaliert schnell
  // Post-Game (badge >= 17 = Champ): Nightmare/Omega freigeschaltet
  const maxDiff = badgeCount >= 17 ? DUNGEON_DIFFICULTIES.length - 1 : DUNGEON_DIFFICULTIES.length - 3;
  const diffIdx = Math.min(Math.floor(totalDifficulty / 2), maxDiff);
  const difficulty = DUNGEON_DIFFICULTIES[diffIdx];

  // Etagen-Skalierung: jeder clear erhöht Stats exponentiell
  const floorScaling = 1 + (infiniteFloor * 0.35);
  const actualStatMult = difficulty.statMult * floorScaling;
  const actualBossStatMult = difficulty.bossStatMult * floorScaling;

  const roomCount = difficulty.rooms[0] + Math.floor(rng() * (difficulty.rooms[1] - difficulty.rooms[0] + 1));

  const POKEMON_IDS_BY_TYPE = {
    rock:     [95, 74, 248, 524, 112], ground: [111, 112, 27, 95], steel: [81, 227, 212, 483],
    ghost:    [92, 94, 562, 93],  grass:  [1, 43, 45, 252, 495, 3], bug: [123, 127, 540],
    flying:   [227, 581, 123, 149], normal: [19, 52, 113, 235, 128, 143],
    water:    [60, 79, 86, 90, 393, 418, 130, 350], ice: [86, 124, 225, 459],
    electric: [25, 81, 100, 125, 604, 145], fire: [4, 58, 77, 126, 390, 146],
    psychic:  [63, 65, 196, 79, 150],  dark: [197, 215, 509, 570, 302, 430],
    dragon:   [147, 148, 443, 445, 373, 149], poison: [23, 43, 110],
    fairy:    [35, 39, 175, 302], fighting: [66, 106, 448, 68],
    normal2:  [19, 52, 133, 235, 128],
  };

  // Boss: Legendärer Pokémon bei höheren Schwierigkeiten
  let bossPoke;
  const legendChance = Math.min(0.15 + (totalDifficulty * 0.08), 0.95);
  if (rng() < legendChance) {
    const legendIdx = Math.floor(rng() * LEGENDARY_BOSSES.length);
    bossPoke = { ...LEGENDARY_BOSSES[legendIdx] };
    bossPoke.hp   = Math.floor(bossPoke.hp   * actualBossStatMult);
    bossPoke.atk  = Math.floor(bossPoke.atk  * actualBossStatMult);
    bossPoke.def  = Math.floor(bossPoke.def  * actualBossStatMult);
    bossPoke.spd  = Math.floor(bossPoke.spd  * actualBossStatMult);
    bossPoke.isLegendary = true;
    bossPoke.catchable = false;
  } else {
    const semiIdx = Math.floor(rng() * SEMI_RARE_BOSSES.length);
    bossPoke = { ...SEMI_RARE_BOSSES[semiIdx] };
  }

  const rooms = [];
  for (let i = 0; i < roomCount; i++) {
    const isLast = i === roomCount - 1;
    const isFirst = i === 0;
    let roomType;
    if (isLast) roomType = 'boss';
    else if (isFirst) roomType = 'wild';
    else if (i === Math.floor(roomCount / 2)) roomType = 'rest';
    else {
      roomType = ROOM_TYPES[Math.floor(rng() * ROOM_TYPES.length)];
    }

    const availableTypes = dungeonType.types;
    const chosenType = availableTypes[Math.floor(rng() * availableTypes.length)];
    const typePool = POKEMON_IDS_BY_TYPE[chosenType] || [19];
    const pokeId = isLast ? bossPoke.id : typePool[Math.floor(rng() * typePool.length)];

    const statMult = isLast ? actualBossStatMult
      : roomType === 'miniboss' || roomType === 'elite' ? actualStatMult * 1.3
      : roomType === 'trap' ? actualStatMult * 1.15
      : actualStatMult;

    const trainerName = (roomType === 'trainer' || roomType === 'miniboss' || roomType === 'boss' || roomType === 'elite')
      ? `${rFrom(TRAINER_PREFIXES, rng)}${rFrom(TRAINER_SUFFIXES, rng)}` : null;

    rooms.push({
      index: i, type: roomType, pokeId, trainerName,
      introText: getIntroText(roomType, rng, dungeonType, totalDifficulty),
      statMult,
      isLast,
      isLegendaryBoss: isLast && bossPoke.isLegendary,
      bossData: isLast ? bossPoke : null,
    });
  }

  const tokenReward = Math.floor(500 * difficulty.tokenMult * (1 + totalDifficulty * 0.15));
  const coinReward  = Math.floor(200 * difficulty.coinMult  * (1 + infiniteFloor * 0.2));

  return {
    seed, index: dungeonIndex,
    type: dungeonType,
    difficulty,
    rooms,
    totalRooms: roomCount,
    infiniteFloor,
    totalDifficulty,
    floorScaling,
    bossPoke,
    rewards: {
    tokens: tokenReward,
    coins: coinReward,
    badge: diffIdx >= 7 ? `⚡ OMEGA-BEZWINGER #${dungeonIndex + 1}` : diffIdx >= 6 ? `😱 Albtraum-Overlord` : diffIdx >= 3 ? `🔥 Inferno-Bezwinger #${dungeonIndex + 1}` : diffIdx >= 2 ? `💀 Brutal-Champion` : null,
    }
  };
}

function getIntroText(roomType, rng, dungeonType, difficulty) {
  const diffSuffix = difficulty >= 6 ? ' ...du bist bereits tot.' : difficulty >= 4 ? ' Kein Sterblicher überlebt das.' : '';
  const texts = {
    wild:     ['Ein wildes Pokémon springt dich an!', 'Vorsicht! Das Pokémon ist rasend!', 'Es riecht Blut...'],
    trainer:  ['Du kommst hier nicht durch!', 'Ich werde dich vernichten!', 'Mein Pokémon hat noch nie verloren!'],
    miniboss: ['Hahahaha... Du hast keine Chance!', 'Der Wächter dieser Etage bin ich!', 'Umkehren ist keine Option mehr!'],
    elite:    ['Ich bin einer der Vier Dungeon-Elites!', 'Nur Legenden überstehen mich!', 'Dein letzter Kampf. Ich garantiere es.'],
    trap:     ['Du bist in die Falle getappt!', 'Hier gibt es kein Entkommen!', 'Ich habe auf jemanden wie dich gewartet...'],
    boss:     [`Willkommen im Nichts, kleiner Trainer.${diffSuffix}`, 'Ich bin der Hüter der Ewigkeit!', 'Niemand — NIEMAND — verlässt diesen Dungeon.', 'Du wagst es, mich herauszufordern?'],
    rest:     [],
    item:     [],
  };
  const pool = texts[roomType] || ['...'];
  return pool[Math.floor(rng() * pool.length)];
}

// ─── Dungeon Selector UI ────────────────────────────────────────────────────────
export function DungeonSelector({ storyProgress, onSelectDungeon, onBack }) {
  const badgeCount = storyProgress.badges?.length || 0;
  const clearedDungeons = storyProgress.clearedDungeons || [];
  const infiniteFloor = storyProgress.infiniteFloor || 0;
  const isChampion = storyProgress.zoneIndex >= 17;
  // Champions bekommen mehr Dungeons (10 statt 6)
  const AVAILABLE = isChampion ? 10 : 6;

  const dungeons = Array.from({ length: AVAILABLE }, (_, i) =>
    generateDungeon((storyProgress.dungeonOffset || 0) + i, badgeCount, infiniteFloor)
  );

  const difficultyLabel = (d) => {
    if (d.id === 'absolute') return 'absolute chaos';
    if (d.id === 'godtier') return 'gott-modus';
    return d.id;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <h2 className="text-white font-black text-lg flex items-center gap-2">
            <span className="text-2xl">🗺️</span> Endlose Dungeons
            {isChampion && <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-400/40 text-yellow-300 font-black">👑 CHAMP</span>}
          </h2>
          <p className="text-white/30 text-[10px]">
            Etage {infiniteFloor + 1} • Skalierung: ×{(1 + infiniteFloor * 0.35).toFixed(1)} • {badgeCount} Orden • {AVAILABLE} verfügbar
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {infiniteFloor >= 1 && (
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-500/20 border border-red-400/30 text-red-300 font-black">
              🔥 ETAGE {infiniteFloor + 1}
            </span>
          )}
          <button onClick={onBack} className="text-white/40 hover:text-white text-xs font-bold transition-colors">← Zurück</button>
        </div>
      </div>

      {/* Etagen-Warnung */}
      {infiniteFloor >= 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="p-3 rounded-xl border border-red-500/40 bg-red-500/8 flex items-center gap-2">
          <Skull className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-red-300 text-[10px] font-bold">
            WARNUNG: Etage {infiniteFloor + 1} — Selbst Arceus wird hier Probleme haben. Pokémon mit Basis-HP über 250 empfohlen.
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-2.5">
        {dungeons.map((dungeon, i) => {
          const isCleared = clearedDungeons.includes(dungeon.seed);
          const isExtreme = dungeon.difficulty.id === 'godtier' || dungeon.difficulty.id === 'absolute' || dungeon.difficulty.id === 'nightmare' || dungeon.difficulty.id === 'omega';
          const isBrutal = dungeon.difficulty.id === 'brutal' || dungeon.difficulty.id === 'inferno';

          return (
            <motion.button key={dungeon.seed}
              whileHover={{ scale: 1.01, boxShadow: `0 0 20px ${dungeon.type.glow}` }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectDungeon(dungeon)}
              className={`relative flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all overflow-hidden ${
                isCleared ? 'border-green-500/25 bg-green-500/5'
                : isExtreme ? 'border-yellow-500/40 bg-yellow-500/5'
                : isBrutal ? 'border-red-500/30 bg-red-500/5'
                : 'border-white/10 bg-white/4 hover:bg-white/8'
              }`}>

              {/* Animated glow bg for extreme */}
              {isExtreme && (
                <motion.div className="absolute inset-0 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at 20% 50%, ${dungeon.type.glow}, transparent 60%)` }}
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }} />
              )}

              <div className="relative w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border"
                style={{ backgroundColor: dungeon.type.color + '20', borderColor: dungeon.type.color + '50' }}>
                {isCleared ? '✅' : dungeon.type.emoji}
                {dungeon.bossPoke?.isLegendary && !isCleared && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center text-[8px]">⭐</div>
                )}
              </div>

              <div className="relative flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                  <span className="text-white font-black text-sm">{dungeon.type.name}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black border ${
                    dungeon.difficulty.id === 'absolute' ? 'bg-purple-500/20 border-purple-400/40 text-purple-200 animate-pulse' :
                    dungeon.difficulty.id === 'godtier'  ? 'bg-yellow-500/20 border-yellow-400/40 text-yellow-200' :
                    dungeon.difficulty.id === 'inferno'  ? 'bg-orange-500/20 border-orange-400/40 text-orange-300' :
                    dungeon.difficulty.id === 'brutal'   ? 'bg-red-500/20 border-red-400/40 text-red-300' :
                    dungeon.difficulty.id === 'hard'     ? 'bg-red-500/10 border-red-400/20 text-red-400' :
                    'bg-white/10 border-white/10 text-white/50'
                  }`}>
                    {dungeon.difficulty.emoji} {dungeon.difficulty.name}
                  </span>
                  {dungeon.bossPoke?.isLegendary && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-black bg-yellow-500/15 border border-yellow-400/30 text-yellow-300">
                      ⭐ LEGENDÄRER BOSS
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-white/35 flex-wrap">
                  <span>🚪 {dungeon.totalRooms} Räume</span>
                  <span>💰 +{dungeon.rewards.coins}</span>
                  <span>🎫 +{dungeon.rewards.tokens} Token</span>
                  <span className="text-red-300/60">⚔️ ×{dungeon.floorScaling.toFixed(1)} Stats</span>
                  {dungeon.bossPoke?.name && <span className="text-yellow-200/50">Boss: {dungeon.bossPoke.name}</span>}
                </div>
              </div>

              <div className="relative flex-shrink-0">
                {isCleared
                  ? <span className="text-green-400 font-black text-xs">✓ Klar</span>
                  : <ChevronRight className="w-4 h-4 text-white/30" />
                }
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Champion Bonus Info */}
      {isChampion && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className="mt-1 p-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
          <p className="text-yellow-300/70 text-[9px] text-center leading-relaxed font-bold">
            👑 CHAMPION-STATUS: Nightmare & Omega-Dungeons freigeschaltet! 10 Dungeons verfügbar.
            <br/>💀 ALBTRAUM: ×12 Stats. ⚡ OMEGA: ×20 Stats — nur für die Härtesten.
          </p>
        </motion.div>
      )}

      {/* Endlos-Info */}
      <div className="mt-2 p-3 rounded-xl border border-white/5 bg-white/2">
        <p className="text-white/20 text-[9px] text-center leading-relaxed">
          🔄 Dungeons skalieren mit jeder Etage exponentiell. Etage 5+ erfordert legendäre Pokémon aus dem Season 2 Pass.
          <br/>Arceus (GOD TIER) kann erst ab Etage 3+ alle Bosse überleben.
        </p>
      </div>
    </motion.div>
  );
}

// ─── Dungeon Progress Bar (visuell verbessert) ─────────────────────────────────
export function DungeonProgressBar({ dungeon, currentRoom }) {
  const icons = { wild: '🐾', trainer: '⚔️', item: '🎁', rest: '🏕️', miniboss: '💥', boss: '☠️', elite: '👑', trap: '🪤' };
  const roomColors = {
    wild: '#4ade80', trainer: '#60a5fa', item: '#fbbf24',
    rest: '#a3e635', miniboss: '#f97316', boss: '#ef4444',
    elite: '#c084fc', trap: '#f43f5e',
  };

  return (
    <div className="w-full space-y-1.5 p-3 rounded-2xl bg-black/40 border border-white/8">
      <div className="flex items-center justify-between text-[10px] text-white/40">
        <span className="font-bold">{dungeon.type.emoji} {dungeon.type.name} • Raum {currentRoom + 1}/{dungeon.totalRooms}</span>
        <div className="flex items-center gap-2">
          <span>{dungeon.difficulty.emoji} {dungeon.difficulty.name}</span>
          {dungeon.infiniteFloor > 0 && (
            <span className="text-red-300 font-black">Etage {dungeon.infiniteFloor + 1}</span>
          )}
        </div>
      </div>

      {/* Room-Leiste */}
      <div className="flex gap-0.5">
        {dungeon.rooms.map((room, i) => {
          const isDone = i < currentRoom;
          const isCurrent = i === currentRoom;
          const color = roomColors[room.type] || '#fff';
          return (
            <motion.div key={i}
              className="h-2.5 flex-1 rounded-full"
              style={{
                backgroundColor: isDone ? '#22c55e40' : isCurrent ? color : color + '25',
                border: isCurrent ? `1px solid ${color}` : 'none',
                boxShadow: isCurrent ? `0 0 6px ${color}` : 'none',
              }}
              animate={isCurrent ? { opacity: [0.7, 1, 0.7] } : {}}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
          );
        })}
      </div>

      {/* Icons */}
      <div className="flex gap-0.5">
        {dungeon.rooms.map((room, i) => {
          const isCurrent = i === currentRoom;
          const isDone = i < currentRoom;
          return (
            <div key={i} className={`flex-1 text-center text-[8px] transition-all ${
              isDone ? 'opacity-25' : isCurrent ? 'opacity-100 scale-110' : 'opacity-30'
            }`}>
              {icons[room.type] || '?'}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Legendärer Boss-Ankündigung ───────────────────────────────────────────────
export function LegendaryBossAnnouncement({ boss, onContinue }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)' }}>
      <motion.div
        initial={{ scale: 0.5, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0.4 }}
        className="relative flex flex-col items-center gap-4 p-8 max-w-xs w-full mx-4 text-center rounded-3xl"
        style={{
          background: 'linear-gradient(135deg, rgba(220,38,38,0.15), rgba(0,0,0,0.9))',
          border: '1px solid rgba(220,38,38,0.5)',
          boxShadow: '0 0 60px rgba(220,38,38,0.3)',
        }}>
        {/* Pulsing rings */}
        {[1, 2, 3].map(r => (
          <motion.div key={r}
            className="absolute rounded-full border border-red-500/30"
            style={{ inset: `-${r * 15}px` }}
            animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: r * 0.3 }} />
        ))}

        <motion.div
          animate={{ rotate: [0, 5, -5, 0], y: [-5, 5, -5] }}
          transition={{ duration: 3, repeat: Infinity }}>
          <Skull className="w-16 h-16 text-red-400" />
        </motion.div>

        <div>
          <p className="text-red-400 text-xs font-black uppercase tracking-widest mb-1">⚠️ LEGENDÄRER BOSS</p>
          <p className="text-white text-2xl font-black">{boss.name}</p>
          <p className="text-white/40 text-xs mt-1">HP: {boss.hp} • ATK: {boss.atk} • DEF: {boss.def}</p>
        </div>

        <div className="w-full p-3 rounded-xl bg-red-500/8 border border-red-500/20">
          <p className="text-red-200 text-[10px] leading-relaxed">
            Dieser Boss ist extremst stark skaliert. Selbst Arceus kann hier verlieren. Überlege genau welches Pokémon du wählst.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onContinue}
          className="w-full py-3 rounded-xl text-sm font-black text-white"
          style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)' }}>
          Ich bin bereit — Kampf beginnen
        </motion.button>
      </motion.div>
    </motion.div>
  );
}