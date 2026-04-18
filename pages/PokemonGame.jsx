import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Zap, Shield, Heart, Star, RotateCcw, Trophy, Swords, ChevronRight, HelpCircle, Flame, Droplets, Wind, Activity, TrendingUp, Package, Map as MapIcon, Users } from 'lucide-react';
import usePokemonStorage from '@/hooks/usePokemonStorage';
import PokemonMainMenu from '@/components/pokemon/PokemonMainMenu';
import { DungeonSelector, DungeonProgressBar, generateDungeon, LegendaryBossAnnouncement } from '@/components/pokemon/DungeonSystem.jsx';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import WorldMap, { MAP_NODES, NODE_TO_ZONE, HIDDEN_REWARDS } from '@/components/pokemon/WorldMap';
import { EvolutionScreen, LevelUpNotif, XPBar, xpForLevel, checkEvolution, xpFromBattle, EVOLUTION_CHAINS } from '@/components/pokemon/EvolutionSystem';
import PokemonParty from '@/components/pokemon/PokemonParty';
import { CatchPanel, CatchAnimation, calcCatchRate, BALL_ITEMS } from '@/components/pokemon/CatchSystem';
import {
  isVoidInfected, makeVoidInfected, hasVoidCatcher, VOID_ELIGIBLE_IDS,
  getIrradiatedZone, rollShardDrop, checkShardEvolution, performShardEvolution,
  isS2Active, APOCALYPSE_FORMS,
} from '@/components/pokemon/S2VoidSystem';
import {
  VoidAura, VoidCatchPanel, ShardEvolutionPanel,
  IrradiatedZoneWarning, S2ItemShop, LastStandArena, S2SeasonHub,
} from '@/components/pokemon/S2PokemonUI';
import { AttackEffect, HitFlash, EffectivenessFlash, CritScreenFlash, StatusAppliedBubble } from '@/components/pokemon/BattleEffects';

// ─── Type System ─────────────────────────────────────────────────────────────
const TYPE_COLORS = {
  normal: '#A8A878', fire: '#F08030', water: '#6890F0', electric: '#F8D030',
  grass: '#78C850', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
  ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
  rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', dark: '#705848',
  steel: '#B8B8D0', fairy: '#EE99AC',
};
const TYPE_BG = {
  normal: 'from-stone-700 to-stone-800', fire: 'from-orange-700 to-red-800', water: 'from-blue-600 to-blue-800',
  electric: 'from-yellow-500 to-amber-700', grass: 'from-green-600 to-emerald-800', ice: 'from-cyan-400 to-sky-700',
  fighting: 'from-red-700 to-rose-900', poison: 'from-purple-600 to-purple-900', ground: 'from-amber-600 to-yellow-900',
  flying: 'from-indigo-400 to-indigo-700', psychic: 'from-pink-500 to-rose-700', bug: 'from-lime-600 to-green-800',
  rock: 'from-stone-500 to-stone-700', ghost: 'from-violet-800 to-purple-950', dragon: 'from-indigo-700 to-violet-900',
  dark: 'from-slate-700 to-slate-900', steel: 'from-slate-400 to-slate-600', fairy: 'from-pink-400 to-rose-600',
};
const TYPE_CHART = {
  fire:     { grass: 2, ice: 2, bug: 2, steel: 2, water: 0.5, rock: 0.5, fire: 0.5, dragon: 0.5 },
  water:    { fire: 2, ground: 2, rock: 2, grass: 0.5, water: 0.5, dragon: 0.5 },
  grass:    { water: 2, ground: 2, rock: 2, fire: 0.5, grass: 0.5, poison: 0.5, flying: 0.5, bug: 0.5, dragon: 0.5, steel: 0.5 },
  electric: { water: 2, flying: 2, grass: 0.5, electric: 0.5, dragon: 0.5, ground: 0 },
  psychic:  { fighting: 2, poison: 2, psychic: 0.5, steel: 0.5, dark: 0 },
  fighting: { normal: 2, ice: 2, rock: 2, dark: 2, steel: 2, poison: 0.5, bug: 0.5, psychic: 0.5, flying: 0.5, fairy: 0.5, ghost: 0 },
  dragon:   { dragon: 2, steel: 0.5, fairy: 0 },
  dark:     { ghost: 2, psychic: 2, fighting: 0.5, dark: 0.5, fairy: 0.5 },
  fairy:    { fighting: 2, dragon: 2, dark: 2, poison: 0.5, steel: 0.5, fire: 0.5 },
  ghost:    { ghost: 2, psychic: 2, normal: 0, fighting: 0 },
  ice:      { grass: 2, ground: 2, flying: 2, dragon: 2, water: 0.5, ice: 0.5, steel: 0.5, fire: 0.5 },
  normal:   { ghost: 0 },
  ground:   { fire: 2, electric: 2, poison: 2, rock: 2, steel: 2, grass: 0.5, bug: 0.5, flying: 0 },
  rock:     { fire: 2, ice: 2, flying: 2, bug: 2, fighting: 0.5, ground: 0.5, steel: 0.5 },
  bug:      { grass: 2, psychic: 2, dark: 2, fire: 0.5, fighting: 0.5, flying: 0.5, ghost: 0.5, steel: 0.5, fairy: 0.5 },
  poison:   { grass: 2, fairy: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0 },
  flying:   { grass: 2, fighting: 2, bug: 2, electric: 0.5, rock: 0.5, steel: 0.5 },
  steel:    { ice: 2, rock: 2, fairy: 2, fire: 0.5, water: 0.5, electric: 0.5, steel: 0.5, poison: 0 },
};

// ─── Status Effects ───────────────────────────────────────────────────────────
const STATUS_EFFECTS = {
  burn:     { name: 'Verbrennung', icon: '🔥', color: '#F08030', dot: 0.06, atkMod: 0.85 },
  poison:   { name: 'Vergiftung',  icon: '☠️', color: '#A040A0', dot: 0.10, atkMod: 1.0  },
  sleep:    { name: 'Schlaf',      icon: '💤', color: '#6890F0', dot: 0,    atkMod: 0,   skipTurns: 2 },
  paralyze: { name: 'Lähmung',     icon: '⚡', color: '#F8D030', dot: 0,    atkMod: 0.75, skipChance: 0.25 },
  freeze:   { name: 'Gefroren',    icon: '❄️', color: '#98D8D8', dot: 0,    atkMod: 0,   skipTurns: 1 },
};

// ─── Weather ──────────────────────────────────────────────────────────────────
const WEATHER_TYPES = {
  clear:   { name: 'Klares Wetter',  icon: '☀️',  fireMult: 1.5, waterMult: 0.5, dot: 0 },
  rain:    { name: 'Regen',          icon: '🌧️',  fireMult: 0.5, waterMult: 1.5, dot: 0 },
  hail:    { name: 'Hagel',          icon: '🌨️',  iceMult: 1.3,  dot: 0.04 },
  sandstorm: { name: 'Sandsturm',   icon: '🌪️',  rockMult: 1.2, dot: 0.04 },
};

// ─── Items ─────────────────────────────────────────────────────────────────────
const ITEMS = [
  { id: 'potion',    name: 'Trank',          icon: '🧪', desc: 'Heilt 30 HP',             cost: 100, type: 'heal',   value: 30  },
  { id: 'superp',   name: 'Supertrank',      icon: '💊', desc: 'Heilt 80 HP',             cost: 250, type: 'heal',   value: 80  },
  { id: 'fullheal', name: 'Heilpulver',      icon: '✨', desc: 'Heilt Statusprobleme',    cost: 150, type: 'cure',   value: 0   },
  { id: 'xatk',     name: 'X-Angriff',       icon: '⚔️', desc: '+20% Angriff (3 Runden)', cost: 200, type: 'buff',   value: 0.2, stat: 'atk', turns: 3 },
  { id: 'xdef',     name: 'X-Verteidigung',  icon: '🛡', desc: '+20% Verteid. (3 Runden)',cost: 200, type: 'buff',   value: 0.2, stat: 'def', turns: 3 },
  { id: 'revive',   name: 'Beleber',         icon: '💫', desc: 'Stellt HP auf 50% wieder',cost: 500, type: 'revive', value: 0.5 },
];

// ─── Story Zones ─────────────────────────────────────────────────────────────
const STORY_ZONES = [
  { id: 'route1', name: 'Route 1: Steiniger Pfad', type: 'route', env: 'forest', trainers: [
    { name: 'Pfadfinder Tom', pokeId: 25, text: 'Pikachu, los!' },
    { name: 'Wanderer Ben', pokeId: 19, text: 'Go, Rattfratz!' },
  ]},
  { id: 'gym1', name: 'Marmoria Arena 🪨', type: 'gym', env: 'cave', leader: 'Arenaleiter Rocko', badge: '🪨 Felsorden', pokeId: 95, text: 'Meine Pokémon sind hart wie Stein!', buffs: { hp: 1.1, atk: 1.1, def: 1.2 } },
  { id: 'route2', name: 'Route 3: Wasserweg', type: 'route', env: 'water', trainers: [
    { name: 'Angler Bob', pokeId: 60, text: 'Quapsel!' },
    { name: 'Schwimmer Kai', pokeId: 395, text: 'Impoleon!' },
  ]},
  { id: 'gym2', name: 'Azuria Arena 💧', type: 'gym', env: 'water', leader: 'Arenaleiterin Misty', badge: '💧 Quellorden', pokeId: 130, text: 'Du denkst du kannst das Wasser bändigen?', buffs: { hp: 1.2, atk: 1.15 } },
  { id: 'route3', name: 'Route 6: Elektrofeld', type: 'route', env: 'plains', trainers: [
    { name: 'Gitarrist Leo', pokeId: 25, text: 'Schockierend!' },
    { name: 'Ingenieur Max', pokeId: 81, text: 'Magnetilo, los!' },
  ]},
  { id: 'gym3', name: 'Orania Arena ⚡', type: 'gym', env: 'plains', leader: 'Arenaleiter Surge', badge: '⚡ Donnerorden', pokeId: 26, text: 'Hier gibts einen Schock fürs Leben!', buffs: { hp: 1.2, atk: 1.2 } },
  { id: 'route4', name: 'Route 9: Blumenwiese', type: 'route', env: 'forest', trainers: [
    { name: 'Pflanzen-Fan Mia', pokeId: 497, text: 'Serpifeu!' },
    { name: 'Gärtnerin Ina', pokeId: 3, text: 'Bisaflor!' },
  ]},
  { id: 'gym4', name: 'Prismania Arena 🌸', type: 'gym', env: 'forest', leader: 'Arenaleiterin Erika', badge: '🌸 Farborden', pokeId: 45, text: 'Meine Pflanzen-Pokémon sind anmutig.', buffs: { hp: 1.3, atk: 1.2 } },
  { id: 'route5', name: 'Route 12: Giftmoor', type: 'route', env: 'cave', trainers: [
    { name: 'Rebellin Zoe', pokeId: 430, text: 'Honorav!' },
    { name: 'Biker Ron', pokeId: 94, text: 'Gengar, erschrecke ihn!' },
  ]},
  { id: 'gym5', name: 'Fuchsania Arena ☠️', type: 'gym', env: 'cave', leader: 'Arenaleiter Koga', badge: '☠️ Seelenorden', pokeId: 110, text: 'Verzweifle an meinen Ninja-Techniken!', buffs: { hp: 1.3, atk: 1.3, def: 1.1 } },
  { id: 'route6', name: 'Route 15: Psycho-Pfad', type: 'route', env: 'psychic', trainers: [
    { name: 'Psycho-Kid Leo', pokeId: 196, text: 'Psiana!' },
    { name: 'Schwarzgurt Ken', pokeId: 68, text: 'Machomei zerschmettert dich!' },
  ]},
  { id: 'gym6', name: 'Saffronia Arena 🔮', type: 'gym', env: 'psychic', leader: 'Arenaleiterin Sabrina', badge: '🔮 Sumpforden', pokeId: 65, text: 'Ich habe deine Niederlage vorausgesehen.', buffs: { hp: 1.4, atk: 1.3 } },
  { id: 'route7', name: 'Route 20: Vulkanpfad', type: 'route', env: 'fire', trainers: [
    { name: 'Feuerspucker Roy', pokeId: 59, text: 'Arkani, Flammenwurf!' },
    { name: 'Hitzkopf Dan', pokeId: 392, text: 'Panferno brennt!' },
  ]},
  { id: 'gym7', name: 'Zinnoberinsel Arena 🔥', type: 'gym', env: 'fire', leader: 'Arenaleiter Pyro', badge: '🔥 Vulkanorden', pokeId: 6, text: 'Mein feuriger Wille wird dich verbrennen!', buffs: { hp: 1.4, atk: 1.4 } },
  { id: 'route8', name: 'Route 22: Drachenhöhle', type: 'route', env: 'dragon', trainers: [
    { name: 'Drachenzähmerin Lisa', pokeId: 148, text: 'Dragonir!' },
    { name: 'Drachenmeister Kai', pokeId: 373, text: 'Brutalanda!' },
    { name: 'Veteran Sam', pokeId: 445, text: 'Knakrack!' },
  ]},
  { id: 'gym8', name: 'Vertania Arena 🌍', type: 'gym', env: 'cave', leader: 'Arenaleiter Giovanni', badge: '🌍 Erdorden', pokeId: 112, text: 'Ich bin Giovanni! Erlebe meine wahre Kraft!', buffs: { hp: 1.5, atk: 1.5 } },
  { id: 'champion', name: '👑 Pokémon Liga', type: 'gym', env: 'dragon', leader: 'Champ Blau', badge: '👑 Champ-Titel', pokeId: 149, text: 'Ich bin der Champ! Mein Partner ist unbesiegbar!', buffs: { hp: 2.0, atk: 1.6, def: 1.3 } },
];

const ENV_STYLES = {
  forest:  { bg: 'from-emerald-950 via-green-950 to-slate-950', ground: 'bg-emerald-800/30', sky: 'from-emerald-900/20 to-transparent', emoji: '🌲' },
  water:   { bg: 'from-blue-950 via-cyan-950 to-slate-950', ground: 'bg-blue-800/30', sky: 'from-blue-900/20 to-transparent', emoji: '🌊' },
  cave:    { bg: 'from-stone-950 via-slate-950 to-neutral-950', ground: 'bg-stone-700/30', sky: 'from-stone-900/20 to-transparent', emoji: '⛰️' },
  plains:  { bg: 'from-amber-950 via-yellow-950 to-slate-950', ground: 'bg-amber-700/30', sky: 'from-amber-900/20 to-transparent', emoji: '🌾' },
  psychic: { bg: 'from-purple-950 via-pink-950 to-slate-950', ground: 'bg-purple-800/30', sky: 'from-purple-900/20 to-transparent', emoji: '🔮' },
  fire:    { bg: 'from-red-950 via-orange-950 to-slate-950', ground: 'bg-red-800/30', sky: 'from-red-900/20 to-transparent', emoji: '🌋' },
  dragon:  { bg: 'from-indigo-950 via-violet-950 to-slate-950', ground: 'bg-indigo-800/30', sky: 'from-indigo-900/20 to-transparent', emoji: '🐉' },
};

// ─── Pokémon Data ─────────────────────────────────────────────────────────────
const POKEMON_DATA = [
  // Starter & Basics
  { id: 1,   name: 'Bisasam',    type: 'grass',    hp: 70,  atk: 65,  def: 65,  spd: 45,  catchable: true,  moves: [{ name: 'Rankenhieb', power: 35, type: 'grass', pp: 20 }, { name: 'Rasierblatt', power: 55, type: 'grass', pp: 25 }, { name: 'Giftpuder', power: 0, type: 'poison', pp: 35, status: 'poison', statusChance: 1.0 }, { name: 'Tackle', power: 40, type: 'normal', pp: 35 }] },
  { id: 4,   name: 'Glumanda',   type: 'fire',     hp: 65,  atk: 70,  def: 55,  spd: 65,  catchable: true,  moves: [{ name: 'Glut', power: 40, type: 'fire', pp: 25, status: 'burn', statusChance: 0.1 }, { name: 'Kratzattacke', power: 40, type: 'normal', pp: 35 }, { name: 'Feuerfeger', power: 55, type: 'fire', pp: 20 }, { name: 'Flammenwurf', power: 65, type: 'fire', pp: 15, status: 'burn', statusChance: 0.1 }] },
  { id: 7,   name: 'Schiggy',    type: 'water',    hp: 70,  atk: 60,  def: 75,  spd: 43,  catchable: true,  moves: [{ name: 'Wasserpistole', power: 40, type: 'water', pp: 25 }, { name: 'Tackle', power: 40, type: 'normal', pp: 35 }, { name: 'Bodycheck', power: 85, type: 'normal', pp: 15 }, { name: 'Aquaknarre', power: 60, type: 'water', pp: 25 }] },
  { id: 25,  name: 'Pikachu',    type: 'electric', hp: 90,  atk: 85,  def: 60,  spd: 110, catchable: true,  moves: [{ name: 'Donnerschock', power: 40, type: 'electric', pp: 30 }, { name: 'Blitz', power: 70, type: 'electric', pp: 15 }, { name: 'Körperangriff', power: 50, type: 'normal', pp: 15 }, { name: 'Eisenschweif', power: 80, type: 'steel', pp: 15 }] },
  { id: 26,  name: 'Raichu',     type: 'electric', hp: 90,  atk: 90,  def: 75,  spd: 110, catchable: false, moves: [{ name: 'Donnerblitz', power: 90, type: 'electric', pp: 15 }, { name: 'Ruckzuckhieb', power: 40, type: 'normal', pp: 30 }, { name: 'Donnerschlag', power: 75, type: 'electric', pp: 10, status: 'paralyze', statusChance: 0.3 }, { name: 'Eisenschweif', power: 80, type: 'steel', pp: 15 }] },
  // Gen 1 Catchable
  { id: 19,  name: 'Rattfratz',  type: 'normal',   hp: 45,  atk: 56,  def: 35,  spd: 72,  catchable: true,  moves: [{ name: 'Tackle', power: 40, type: 'normal', pp: 35 }, { name: 'Ruckzuckhieb', power: 40, type: 'normal', pp: 30 }, { name: 'Knirscher', power: 60, type: 'dark', pp: 10 }, { name: 'Bisattacke', power: 60, type: 'dark', pp: 25 }] },
  { id: 23,  name: 'Rettan',     type: 'poison',   hp: 55,  atk: 60,  def: 44,  spd: 55,  catchable: true,  moves: [{ name: 'Gifthieb', power: 35, type: 'poison', pp: 35 }, { name: 'Wickel', power: 15, type: 'normal', pp: 20 }, { name: 'Giftbiss', power: 50, type: 'poison', pp: 25, status: 'poison', statusChance: 0.2 }, { name: 'Tackle', power: 40, type: 'normal', pp: 35 }] },
  { id: 35,  name: 'Piepi',      type: 'fairy',    hp: 115, atk: 45,  def: 20,  spd: 35,  catchable: true,  moves: [{ name: 'Pfund', power: 40, type: 'normal', pp: 35 }, { name: 'Sing', power: 0, type: 'normal', pp: 15, status: 'sleep', statusChance: 0.55 }, { name: 'Entzücken', power: 0, type: 'fairy', pp: 30 }, { name: 'Doppelklaps', power: 15, type: 'normal', pp: 10 }] },
  { id: 39,  name: 'Pummeluff',  type: 'fairy',    hp: 115, atk: 45,  def: 20,  spd: 20,  catchable: true,  moves: [{ name: 'Pfund', power: 40, type: 'normal', pp: 35 }, { name: 'Sing', power: 0, type: 'normal', pp: 15, status: 'sleep', statusChance: 0.55 }, { name: 'Körpercheck', power: 100, type: 'normal', pp: 15 }, { name: 'Donnerschlag', power: 65, type: 'electric', pp: 20 }] },
  { id: 43,  name: 'Myrapla',    type: 'grass',    hp: 60,  atk: 55,  def: 50,  spd: 30,  catchable: true,  moves: [{ name: 'Rankenhieb', power: 35, type: 'grass', pp: 20 }, { name: 'Giftpuder', power: 0, type: 'poison', pp: 35, status: 'poison', statusChance: 1.0 }, { name: 'Rasierblatt', power: 55, type: 'grass', pp: 25 }, { name: 'Tackle', power: 40, type: 'normal', pp: 35 }] },
  { id: 45,  name: 'Giflor',     type: 'grass',    hp: 105, atk: 100, def: 85,  spd: 75,  catchable: false, moves: [{ name: 'Megasauger', power: 40, type: 'grass', pp: 25 }, { name: 'Matschbombe', power: 90, type: 'poison', pp: 10, status: 'poison', statusChance: 0.3 }, { name: 'Blättertanz', power: 120, type: 'grass', pp: 5 }, { name: 'Stachelspore', power: 0, type: 'poison', pp: 30, status: 'poison', statusChance: 1.0 }] },
  { id: 52,  name: 'Mauzi',      type: 'normal',   hp: 65,  atk: 70,  def: 40,  spd: 90,  catchable: true,  moves: [{ name: 'Kratzer', power: 40, type: 'normal', pp: 35 }, { name: 'Nutzlosigkeit', power: 0, type: 'normal', pp: 40 }, { name: 'Bisattacke', power: 60, type: 'dark', pp: 25 }, { name: 'Zahnarsch', power: 60, type: 'dark', pp: 25 }] },
  { id: 54,  name: 'Enton',      type: 'water',    hp: 80,  atk: 75,  def: 60,  spd: 55,  catchable: true,  moves: [{ name: 'Wasserpistole', power: 40, type: 'water', pp: 25 }, { name: 'Schlammschuss', power: 55, type: 'ground', pp: 15 }, { name: 'Psystrahl', power: 65, type: 'psychic', pp: 20 }, { name: 'Aquaknarre', power: 60, type: 'water', pp: 25 }] },
  { id: 58,  name: 'Fukano',     type: 'fire',     hp: 75,  atk: 90,  def: 55,  spd: 60,  catchable: true,  moves: [{ name: 'Glut', power: 40, type: 'fire', pp: 25, status: 'burn', statusChance: 0.1 }, { name: 'Bisattacke', power: 60, type: 'dark', pp: 25 }, { name: 'Schnellsprint', power: 30, type: 'normal', pp: 40 }, { name: 'Flammenwurf', power: 65, type: 'fire', pp: 15 }] },
  { id: 59,  name: 'Arkani',     type: 'fire',     hp: 105, atk: 110, def: 75,  spd: 100, catchable: false, moves: [{ name: 'Flammenrad', power: 60, type: 'fire', pp: 25, status: 'burn', statusChance: 0.1 }, { name: 'Schnellsprint', power: 30, type: 'normal', pp: 40 }, { name: 'Bisattacke', power: 60, type: 'dark', pp: 25 }, { name: 'Flammenwurf', power: 65, type: 'fire', pp: 15, status: 'burn', statusChance: 0.1 }] },
  { id: 60,  name: 'Quapsel',    type: 'water',    hp: 70,  atk: 48,  def: 48,  spd: 42,  catchable: true,  moves: [{ name: 'Aquaknarre', power: 60, type: 'water', pp: 25 }, { name: 'Schlammschuss', power: 55, type: 'ground', pp: 15 }, { name: 'Tackle', power: 40, type: 'normal', pp: 35 }, { name: 'Körpercheck', power: 100, type: 'normal', pp: 15 }] },
  { id: 63,  name: 'Abra',       type: 'psychic',  hp: 45,  atk: 105, def: 35,  spd: 90,  catchable: true,  moves: [{ name: 'Teleport', power: 0, type: 'psychic', pp: 20 }, { name: 'Psystrahl', power: 65, type: 'psychic', pp: 20 }, { name: 'Psychokinese', power: 90, type: 'psychic', pp: 10 }, { name: 'Shadowball', power: 80, type: 'ghost', pp: 15 }] },
  { id: 65,  name: 'Simsala',    type: 'psychic',  hp: 85,  atk: 135, def: 65,  spd: 120, catchable: false, moves: [{ name: 'Psychokinese', power: 90, type: 'psychic', pp: 10 }, { name: 'Seher', power: 120, type: 'psychic', pp: 5 }, { name: 'Spukball', power: 80, type: 'ghost', pp: 15 }, { name: 'Psystrahl', power: 65, type: 'psychic', pp: 20 }] },
  { id: 66,  name: 'Machollo',   type: 'fighting', hp: 80,  atk: 80,  def: 50,  spd: 35,  catchable: true,  moves: [{ name: 'Karateschlag', power: 50, type: 'fighting', pp: 25 }, { name: 'Körpercheck', power: 100, type: 'normal', pp: 15 }, { name: 'Rumpfhauer', power: 65, type: 'fighting', pp: 20 }, { name: 'Steinschnitt', power: 75, type: 'rock', pp: 15 }] },
  { id: 68,  name: 'Machomei',   type: 'fighting', hp: 120, atk: 130, def: 100, spd: 55,  catchable: false, moves: [{ name: 'Kreuzhieb', power: 100, type: 'fighting', pp: 10 }, { name: 'Karateschlag', power: 50, type: 'fighting', pp: 25 }, { name: 'Erdbeben', power: 100, type: 'ground', pp: 10 }, { name: 'Steinhagel', power: 100, type: 'rock', pp: 5 }] },
  { id: 74,  name: 'Kleinstein', type: 'rock',     hp: 50,  atk: 65,  def: 100, spd: 15,  catchable: true,  moves: [{ name: 'Tackle', power: 40, type: 'normal', pp: 35 }, { name: 'Steinwurf', power: 50, type: 'rock', pp: 15 }, { name: 'Selbstzerstörer', power: 100, type: 'normal', pp: 5 }, { name: 'Felsgrab', power: 75, type: 'rock', pp: 10 }] },
  { id: 77,  name: 'Ponita',     type: 'fire',     hp: 65,  atk: 85,  def: 55,  spd: 90,  catchable: true,  moves: [{ name: 'Glut', power: 40, type: 'fire', pp: 25, status: 'burn', statusChance: 0.1 }, { name: 'Schnellsprint', power: 30, type: 'normal', pp: 40 }, { name: 'Stampfer', power: 65, type: 'normal', pp: 20 }, { name: 'Flammenwurf', power: 65, type: 'fire', pp: 15 }] },
  { id: 79,  name: 'Flegmon',    type: 'water',    hp: 95,  atk: 70,  def: 60,  spd: 15,  catchable: true,  moves: [{ name: 'Wasserpistole', power: 40, type: 'water', pp: 25 }, { name: 'Schlammschuss', power: 55, type: 'ground', pp: 15 }, { name: 'Psystrahl', power: 65, type: 'psychic', pp: 20 }, { name: 'Aquaknarre', power: 60, type: 'water', pp: 25 }] },
  { id: 81,  name: 'Magnetilo',  type: 'electric', hp: 55,  atk: 60,  def: 95,  spd: 45,  catchable: true,  moves: [{ name: 'Donnerschock', power: 40, type: 'electric', pp: 30 }, { name: 'Blitz', power: 70, type: 'electric', pp: 15 }, { name: 'Bodycheck', power: 85, type: 'normal', pp: 15 }, { name: 'Eisenschneide', power: 75, type: 'steel', pp: 20 }] },
  { id: 86,  name: 'Jurob',      type: 'water',    hp: 90,  atk: 70,  def: 80,  spd: 45,  catchable: true,  moves: [{ name: 'Aquaknarre', power: 60, type: 'water', pp: 25 }, { name: 'Körpercheck', power: 100, type: 'normal', pp: 15 }, { name: 'Eisstrahl', power: 90, type: 'ice', pp: 10, status: 'freeze', statusChance: 0.1 }, { name: 'Schlammschuss', power: 55, type: 'ground', pp: 15 }] },
  { id: 90,  name: 'Muschas',    type: 'water',    hp: 55,  atk: 51,  def: 95,  spd: 40,  catchable: true,  moves: [{ name: 'Wasserpistole', power: 40, type: 'water', pp: 25 }, { name: 'Tackle', power: 40, type: 'normal', pp: 35 }, { name: 'Klammer', power: 35, type: 'normal', pp: 20 }, { name: 'Aquaknarre', power: 60, type: 'water', pp: 25 }] },
  { id: 92,  name: 'Gastly',     type: 'ghost',    hp: 60,  atk: 65,  def: 35,  spd: 80,  catchable: true,  moves: [{ name: 'Schattenstoß', power: 40, type: 'ghost', pp: 30 }, { name: 'Schlafpuder', power: 0, type: 'ghost', pp: 15, status: 'sleep', statusChance: 0.75 }, { name: 'Gifthieb', power: 35, type: 'poison', pp: 35 }, { name: 'Spukball', power: 80, type: 'ghost', pp: 15 }] },
  { id: 94,  name: 'Gengar',     type: 'ghost',    hp: 100, atk: 115, def: 65,  spd: 110, catchable: false, moves: [{ name: 'Spukball', power: 80, type: 'ghost', pp: 15 }, { name: 'Albtraum', power: 0, type: 'dark', pp: 15, status: 'sleep', statusChance: 0.75 }, { name: 'Schattenstoß', power: 40, type: 'ghost', pp: 30 }, { name: 'Psychokinese', power: 90, type: 'psychic', pp: 10, status: 'burn', statusChance: 0.15 }] },
  { id: 95,  name: 'Onix',       type: 'rock',     hp: 80,  atk: 75,  def: 160, spd: 70,  catchable: true,  moves: [{ name: 'Steinwurf', power: 50, type: 'rock', pp: 15 }, { name: 'Klammer', power: 35, type: 'normal', pp: 20 }, { name: 'Felsgrab', power: 75, type: 'rock', pp: 10 }, { name: 'Erdbeben', power: 100, type: 'ground', pp: 10 }] },
  { id: 100, name: 'Voltobal',   type: 'electric', hp: 60,  atk: 50,  def: 70,  spd: 100, catchable: true,  moves: [{ name: 'Tackle', power: 40, type: 'normal', pp: 35 }, { name: 'Donnerschock', power: 40, type: 'electric', pp: 30 }, { name: 'Selbstzerstörer', power: 100, type: 'normal', pp: 5 }, { name: 'Blitz', power: 70, type: 'electric', pp: 15 }] },
  { id: 106, name: 'Kicklee',    type: 'fighting', hp: 80,  atk: 120, def: 53,  spd: 87,  catchable: true,  moves: [{ name: 'Karateschlag', power: 50, type: 'fighting', pp: 25 }, { name: 'Sprungkick', power: 85, type: 'fighting', pp: 5 }, { name: 'Ruckzuckhieb', power: 40, type: 'normal', pp: 30 }, { name: 'Nahkampf', power: 120, type: 'fighting', pp: 5 }] },
  { id: 108, name: 'Schlurp',    type: 'normal',   hp: 130, atk: 70,  def: 80,  spd: 23,  catchable: true,  moves: [{ name: 'Körpercheck', power: 100, type: 'normal', pp: 15 }, { name: 'Feuerssturm', power: 110, type: 'fire', pp: 5 }, { name: 'Donner', power: 90, type: 'electric', pp: 10 }, { name: 'Eisstrahl', power: 90, type: 'ice', pp: 10 }] },
  { id: 110, name: 'Smogmog',    type: 'poison',   hp: 95,  atk: 90,  def: 120, spd: 50,  catchable: true,  moves: [{ name: 'Matschbombe', power: 90, type: 'poison', pp: 10, status: 'poison', statusChance: 0.3 }, { name: 'Tackle', power: 40, type: 'normal', pp: 35 }, { name: 'Feuersturm', power: 110, type: 'fire', pp: 5 }, { name: 'Finsteraura', power: 80, type: 'dark', pp: 15 }] },
  { id: 111, name: 'Rihorn',     type: 'ground',   hp: 105, atk: 95,  def: 95,  spd: 25,  catchable: true,  moves: [{ name: 'Hornattacke', power: 65, type: 'normal', pp: 25 }, { name: 'Erdbeben', power: 100, type: 'ground', pp: 10 }, { name: 'Steinkante', power: 75, type: 'rock', pp: 10 }, { name: 'Ramme', power: 90, type: 'normal', pp: 20 }] },
  { id: 112, name: 'Rizeros',    type: 'ground',   hp: 135, atk: 130, def: 120, spd: 25,  catchable: false, moves: [{ name: 'Erdbeben', power: 100, type: 'ground', pp: 10 }, { name: 'Steinkante', power: 75, type: 'rock', pp: 10 }, { name: 'Vielender', power: 120, type: 'bug', pp: 5 }, { name: 'Hornbohrer', power: 150, type: 'normal', pp: 5 }] },
  { id: 113, name: 'Chaneira',   type: 'normal',   hp: 250, atk: 5,   def: 5,   spd: 50,  catchable: true,  moves: [{ name: 'Doppelklaps', power: 15, type: 'normal', pp: 10 }, { name: 'Ei-Bombe', power: 100, type: 'normal', pp: 10 }, { name: 'Sing', power: 0, type: 'normal', pp: 15, status: 'sleep', statusChance: 0.55 }, { name: 'Bodycheck', power: 85, type: 'normal', pp: 15 }] },
  { id: 115, name: 'Kangama',    type: 'normal',   hp: 105, atk: 95,  def: 80,  spd: 90,  catchable: true,  moves: [{ name: 'Körpercheck', power: 100, type: 'normal', pp: 15 }, { name: 'Krallenhieb', power: 40, type: 'normal', pp: 35 }, { name: 'Eisenschneide', power: 75, type: 'steel', pp: 20 }, { name: 'Ramme', power: 90, type: 'normal', pp: 20 }] },
  { id: 116, name: 'Seeper',     type: 'water',    hp: 65,  atk: 65,  def: 60,  spd: 45,  catchable: true,  moves: [{ name: 'Wasserpistole', power: 40, type: 'water', pp: 25 }, { name: 'Surfbrett', power: 0, type: 'water', pp: 30 }, { name: 'Aquaknarre', power: 60, type: 'water', pp: 25 }, { name: 'Donnerschlag', power: 65, type: 'electric', pp: 20 }] },
  { id: 123, name: 'Sichlor',    type: 'bug',      hp: 85,  atk: 110, def: 80,  spd: 105, catchable: true,  moves: [{ name: 'Käfergeräusch', power: 90, type: 'bug', pp: 10 }, { name: 'Luftschnitt', power: 75, type: 'flying', pp: 20 }, { name: 'Klingensturm', power: 80, type: 'steel', pp: 20 }, { name: 'Nahkampf', power: 120, type: 'fighting', pp: 5 }] },
  { id: 124, name: 'Rossana',    type: 'ice',      hp: 80,  atk: 75,  def: 80,  spd: 95,  catchable: true,  moves: [{ name: 'Eisstrahl', power: 90, type: 'ice', pp: 10, status: 'freeze', statusChance: 0.1 }, { name: 'Psystrahl', power: 65, type: 'psychic', pp: 20 }, { name: 'Blizzard', power: 110, type: 'ice', pp: 5 }, { name: 'Küss', power: 0, type: 'fairy', pp: 10, status: 'sleep', statusChance: 0.75 }] },
  { id: 125, name: 'Elektek',    type: 'electric', hp: 80,  atk: 95,  def: 67,  spd: 105, catchable: true,  moves: [{ name: 'Donnerschlag', power: 65, type: 'electric', pp: 20, status: 'paralyze', statusChance: 0.3 }, { name: 'Donnerblitz', power: 90, type: 'electric', pp: 15 }, { name: 'Ruckzuckhieb', power: 40, type: 'normal', pp: 30 }, { name: 'Blitz', power: 70, type: 'electric', pp: 15 }] },
  { id: 126, name: 'Magmar',     type: 'fire',     hp: 80,  atk: 95,  def: 57,  spd: 93,  catchable: true,  moves: [{ name: 'Flammenwurf', power: 65, type: 'fire', pp: 15, status: 'burn', statusChance: 0.1 }, { name: 'Feuerfeger', power: 55, type: 'fire', pp: 20 }, { name: 'Feuerwirbel', power: 95, type: 'fire', pp: 5, status: 'burn', statusChance: 0.1 }, { name: 'Druckwelle', power: 0, type: 'normal', pp: 30 }] },
  { id: 127, name: 'Pinsir',     type: 'bug',      hp: 95,  atk: 125, def: 100, spd: 85,  catchable: true,  moves: [{ name: 'Klammerhieb', power: 80, type: 'bug', pp: 15 }, { name: 'Käfergeräusch', power: 90, type: 'bug', pp: 10 }, { name: 'Körpercheck', power: 100, type: 'normal', pp: 15 }, { name: 'Steinhagel', power: 100, type: 'rock', pp: 5 }] },
  { id: 128, name: 'Tauros',     type: 'normal',   hp: 95,  atk: 100, def: 95,  spd: 110, catchable: true,  moves: [{ name: 'Ramme', power: 90, type: 'normal', pp: 20, status: 'paralyze', statusChance: 0.1 }, { name: 'Körpercheck', power: 100, type: 'normal', pp: 15 }, { name: 'Erdbeben', power: 100, type: 'ground', pp: 10 }, { name: 'Steinhagel', power: 100, type: 'rock', pp: 5 }] },
  { id: 130, name: 'Garados',    type: 'water',    hp: 120, atk: 125, def: 90,  spd: 81,  catchable: false, moves: [{ name: 'Surfer', power: 70, type: 'water', pp: 15 }, { name: 'Knirscher', power: 60, type: 'dragon', pp: 10 }, { name: 'Donnerschlag', power: 65, type: 'electric', pp: 20 }, { name: 'Ramme', power: 90, type: 'normal', pp: 20, status: 'paralyze', statusChance: 0.1 }] },
  { id: 129, name: 'Karpador',   type: 'water',    hp: 45,  atk: 10,  def: 55,  spd: 80,  catchable: true,  moves: [{ name: 'Platscher', power: 40, type: 'water', pp: 35 }, { name: 'Tackle', power: 40, type: 'normal', pp: 35 }, { name: 'Platscher', power: 40, type: 'water', pp: 35 }, { name: 'Platscher', power: 40, type: 'water', pp: 35 }] },
  { id: 131, name: 'Lapras',     type: 'water',    hp: 145, atk: 85,  def: 100, spd: 60,  catchable: false, moves: [{ name: 'Surfer', power: 70, type: 'water', pp: 15 }, { name: 'Eisstrahl', power: 90, type: 'ice', pp: 10, status: 'freeze', statusChance: 0.1 }, { name: 'Donnerschock', power: 40, type: 'electric', pp: 30 }, { name: 'Körperangriff', power: 50, type: 'normal', pp: 15 }] },
  { id: 133, name: 'Evoli',      type: 'normal',   hp: 75,  atk: 55,  def: 50,  spd: 55,  catchable: true,  moves: [{ name: 'Ruckzuckhieb', power: 40, type: 'normal', pp: 30 }, { name: 'Tackle', power: 40, type: 'normal', pp: 35 }, { name: 'Bisattacke', power: 60, type: 'dark', pp: 25 }, { name: 'Bodycheck', power: 85, type: 'normal', pp: 15 }] },
  { id: 136, name: 'Flamara',    type: 'fire',     hp: 95,  atk: 95,  def: 65,  spd: 65,  catchable: true,  moves: [{ name: 'Flammenwurf', power: 65, type: 'fire', pp: 15, status: 'burn', statusChance: 0.1 }, { name: 'Bodycheck', power: 85, type: 'normal', pp: 15 }, { name: 'Feuerwirbel', power: 95, type: 'fire', pp: 5 }, { name: 'Ruckzuckhieb', power: 40, type: 'normal', pp: 30 }] },
  { id: 137, name: 'Porygon',    type: 'normal',   hp: 95,  atk: 60,  def: 70,  spd: 40,  catchable: true,  moves: [{ name: 'Psystrahl', power: 65, type: 'psychic', pp: 20 }, { name: 'Donnerschlag', power: 65, type: 'electric', pp: 20 }, { name: 'Eisstrahl', power: 90, type: 'ice', pp: 10 }, { name: 'Tackle', power: 40, type: 'normal', pp: 35 }] },
  { id: 143, name: 'Relaxo',     type: 'normal',   hp: 180, atk: 95,  def: 100, spd: 30,  catchable: false, moves: [{ name: 'Körpercheck', power: 100, type: 'normal', pp: 15 }, { name: 'Erdrutsch', power: 80, type: 'ground', pp: 10 }, { name: 'Schlaf', power: 0, type: 'normal', pp: 10, status: 'sleep', statusChance: 0.75 }, { name: 'Hyper-Strahl', power: 150, type: 'normal', pp: 5 }] },
  { id: 147, name: 'Dratini',    type: 'dragon',   hp: 65,  atk: 64,  def: 45,  spd: 50,  catchable: true,  moves: [{ name: 'Drachenwut', power: 40, type: 'dragon', pp: 20 }, { name: 'Wickel', power: 15, type: 'normal', pp: 20 }, { name: 'Aquaknarre', power: 60, type: 'water', pp: 25 }, { name: 'Drachenpuls', power: 85, type: 'dragon', pp: 10 }] },
  { id: 148, name: 'Dragonir',   type: 'dragon',   hp: 95,  atk: 84,  def: 85,  spd: 50,  catchable: true,  moves: [{ name: 'Drachenwut', power: 40, type: 'dragon', pp: 20 }, { name: 'Nassschweif', power: 90, type: 'water', pp: 10 }, { name: 'Drachenpuls', power: 85, type: 'dragon', pp: 10 }, { name: 'Eisstrahl', power: 90, type: 'ice', pp: 10, status: 'freeze', statusChance: 0.1 }] },
  { id: 149, name: 'Dragoran',   type: 'dragon',   hp: 130, atk: 120, def: 90,  spd: 80,  catchable: false, moves: [{ name: 'Dragonbreath', power: 60, type: 'dragon', pp: 20, status: 'paralyze', statusChance: 0.3 }, { name: 'Drako-Meteor', power: 130, type: 'dragon', pp: 5 }, { name: 'Donner', power: 90, type: 'electric', pp: 10 }, { name: 'Feuerssturm', power: 110, type: 'fire', pp: 5 }] },
  // Gen 2
  { id: 152, name: 'Endivie',    type: 'grass',    hp: 70,  atk: 49,  def: 65,  spd: 45,  catchable: true,  moves: [{ name: 'Rankenhieb', power: 35, type: 'grass', pp: 20 }, { name: 'Rasierblatt', power: 55, type: 'grass', pp: 25 }, { name: 'Tackle', power: 40, type: 'normal', pp: 35 }, { name: 'Blattklinge', power: 65, type: 'grass', pp: 15 }] },
  { id: 155, name: 'Feurigel',   type: 'fire',     hp: 65,  atk: 52,  def: 50,  spd: 65,  catchable: true,  moves: [{ name: 'Glut', power: 40, type: 'fire', pp: 25 }, { name: 'Tackle', power: 40, type: 'normal', pp: 35 }, { name: 'Igel', power: 65, type: 'normal', pp: 15 }, { name: 'Flammenwurf', power: 65, type: 'fire', pp: 15 }] },
  { id: 158, name: 'Karnimani',  type: 'water',    hp: 65,  atk: 65,  def: 60,  spd: 58,  catchable: true,  moves: [{ name: 'Wasserpistole', power: 40, type: 'water', pp: 25 }, { name: 'Biss', power: 60, type: 'dark', pp: 25 }, { name: 'Bodycheck', power: 85, type: 'normal', pp: 15 }, { name: 'Aquaknarre', power: 60, type: 'water', pp: 25 }] },
  { id: 175, name: 'Togepi',     type: 'fairy',    hp: 55,  atk: 20,  def: 40,  spd: 20,  catchable: true,  moves: [{ name: 'Pfund', power: 40, type: 'normal', pp: 35 }, { name: 'Morgengrauen', power: 85, type: 'fairy', pp: 10 }, { name: 'Sing', power: 0, type: 'normal', pp: 15, status: 'sleep', statusChance: 0.55 }, { name: 'Doppelklaps', power: 15, type: 'normal', pp: 10 }] },
  { id: 196, name: 'Psiana',     type: 'psychic',  hp: 95,  atk: 105, def: 75,  spd: 110, catchable: false, moves: [{ name: 'Psychokinese', power: 90, type: 'psychic', pp: 10 }, { name: 'Morgengrauen', power: 85, type: 'fairy', pp: 10 }, { name: 'Shadowball', power: 80, type: 'ghost', pp: 15 }, { name: 'Kraftreserve', power: 70, type: 'psychic', pp: 10 }] },
  { id: 197, name: 'Nachtara',   type: 'dark',     hp: 95,  atk: 90,  def: 80,  spd: 110, catchable: true,  moves: [{ name: 'Hinterhalt', power: 70, type: 'dark', pp: 10 }, { name: 'Nachtschatten', power: 85, type: 'dark', pp: 15 }, { name: 'Shadowball', power: 80, type: 'ghost', pp: 15 }, { name: 'Biss', power: 60, type: 'dark', pp: 25 }] },
  { id: 212, name: 'Scherox',    type: 'steel',    hp: 100, atk: 130, def: 110, spd: 65,  catchable: false, moves: [{ name: 'Klingensturm', power: 80, type: 'steel', pp: 20 }, { name: 'Nahkampf', power: 120, type: 'fighting', pp: 5 }, { name: 'Eisenschneide', power: 75, type: 'steel', pp: 20 }, { name: 'Käfergeräusch', power: 90, type: 'bug', pp: 10 }] },
  { id: 215, name: 'Sneasel',    type: 'dark',     hp: 70,  atk: 95,  def: 55,  spd: 115, catchable: true,  moves: [{ name: 'Eiskristall', power: 65, type: 'ice', pp: 20 }, { name: 'Hinterhalt', power: 70, type: 'dark', pp: 10 }, { name: 'Scharfklaue', power: 55, type: 'normal', pp: 25 }, { name: 'Eismesser', power: 75, type: 'ice', pp: 20 }] },
  { id: 225, name: 'Botogel',    type: 'ice',      hp: 70,  atk: 55,  def: 55,  spd: 40,  catchable: true,  moves: [{ name: 'Eisstrahl', power: 90, type: 'ice', pp: 10 }, { name: 'Körpercheck', power: 100, type: 'normal', pp: 15 }, { name: 'Blizzard', power: 110, type: 'ice', pp: 5 }, { name: 'Aquaknarre', power: 60, type: 'water', pp: 25 }] },
  { id: 227, name: 'Panzaeron',  type: 'steel',    hp: 85,  atk: 80,  def: 100, spd: 70,  catchable: true,  moves: [{ name: 'Windscherung', power: 60, type: 'flying', pp: 35 }, { name: 'Luftschnitt', power: 75, type: 'flying', pp: 20 }, { name: 'Klingensturm', power: 80, type: 'steel', pp: 20 }, { name: 'Stahlflügel', power: 70, type: 'steel', pp: 25 }] },
  { id: 229, name: 'Hundemon',   type: 'dark',     hp: 90,  atk: 90,  def: 80,  spd: 95,  catchable: true,  moves: [{ name: 'Hinterhalt', power: 70, type: 'dark', pp: 10 }, { name: 'Flammenwurf', power: 65, type: 'fire', pp: 15, status: 'burn', statusChance: 0.1 }, { name: 'Biss', power: 60, type: 'dark', pp: 25 }, { name: 'Nachtschatten', power: 85, type: 'dark', pp: 15 }] },
  { id: 235, name: 'Farbeagle',  type: 'normal',   hp: 70,  atk: 45,  def: 55,  spd: 75,  catchable: true,  moves: [{ name: 'Tackle', power: 40, type: 'normal', pp: 35 }, { name: 'Aquaknarre', power: 60, type: 'water', pp: 25 }, { name: 'Feuerfeger', power: 55, type: 'fire', pp: 20 }, { name: 'Donnerschlag', power: 65, type: 'electric', pp: 20 }] },
  { id: 241, name: 'Miltank',    type: 'normal',   hp: 120, atk: 80,  def: 105, spd: 100, catchable: true,  moves: [{ name: 'Körpercheck', power: 100, type: 'normal', pp: 15 }, { name: 'Erdrutsch', power: 80, type: 'ground', pp: 10 }, { name: 'Stampfer', power: 65, type: 'normal', pp: 20 }, { name: 'Blizzard', power: 110, type: 'ice', pp: 5 }] },
  { id: 243, name: 'Raikou',     type: 'electric', hp: 115, atk: 115, def: 85,  spd: 115, catchable: false, moves: [{ name: 'Donnerblitz', power: 90, type: 'electric', pp: 15 }, { name: 'Shadowball', power: 80, type: 'ghost', pp: 15 }, { name: 'Blizzard', power: 110, type: 'ice', pp: 5 }, { name: 'Reflexion', power: 0, type: 'psychic', pp: 20 }] },
  { id: 248, name: 'Despotar',   type: 'rock',     hp: 140, atk: 130, def: 110, spd: 61,  catchable: false, moves: [{ name: 'Biss', power: 60, type: 'dark', pp: 25 }, { name: 'Steinschnitt', power: 75, type: 'rock', pp: 15 }, { name: 'Erdbeben', power: 100, type: 'ground', pp: 10 }, { name: 'Kratzer', power: 40, type: 'normal', pp: 35 }] },
  // Gen 3
  { id: 252, name: 'Geckarbor',  type: 'grass',    hp: 70,  atk: 65,  def: 45,  spd: 70,  catchable: true,  moves: [{ name: 'Rasierblatt', power: 55, type: 'grass', pp: 25 }, { name: 'Tackle', power: 40, type: 'normal', pp: 35 }, { name: 'Rankenhieb', power: 35, type: 'grass', pp: 20 }, { name: 'Blattklinge', power: 65, type: 'grass', pp: 15 }] },
  { id: 255, name: 'Flemmli',    type: 'fire',     hp: 65,  atk: 60,  def: 40,  spd: 65,  catchable: true,  moves: [{ name: 'Glut', power: 40, type: 'fire', pp: 25 }, { name: 'Krallenhieb', power: 40, type: 'normal', pp: 35 }, { name: 'Feuerssturm', power: 110, type: 'fire', pp: 5 }, { name: 'Flammenwurf', power: 65, type: 'fire', pp: 15 }] },
  { id: 258, name: 'Hydropi',    type: 'water',    hp: 70,  atk: 60,  def: 70,  spd: 40,  catchable: true,  moves: [{ name: 'Wasserpistole', power: 40, type: 'water', pp: 25 }, { name: 'Schlammschuss', power: 55, type: 'ground', pp: 15 }, { name: 'Aquaknarre', power: 60, type: 'water', pp: 25 }, { name: 'Bodycheck', power: 85, type: 'normal', pp: 15 }] },
  { id: 302, name: 'Zobiris',    type: 'dark',     hp: 85,  atk: 75,  def: 60,  spd: 60,  catchable: true,  moves: [{ name: 'Hinterhalt', power: 70, type: 'dark', pp: 10 }, { name: 'Nachtschatten', power: 85, type: 'dark', pp: 15 }, { name: 'Mondgebet', power: 0, type: 'fairy', pp: 10 }, { name: 'Schattenstoß', power: 40, type: 'ghost', pp: 30 }] },
  { id: 350, name: 'Milotic',    type: 'water',    hp: 130, atk: 60,  def: 79,  spd: 81,  catchable: false, moves: [{ name: 'Surfer', power: 70, type: 'water', pp: 15 }, { name: 'Eisstrahl', power: 90, type: 'ice', pp: 10 }, { name: 'Aquaknarre', power: 60, type: 'water', pp: 25 }, { name: 'Hypnose', power: 0, type: 'psychic', pp: 20, status: 'sleep', statusChance: 0.6 }] },
  { id: 373, name: 'Brutalanda', type: 'dragon',   hp: 135, atk: 135, def: 100, spd: 100, catchable: false, moves: [{ name: 'Drachentanz', power: 0, type: 'dragon', pp: 20, buff: 'atk', buffVal: 0.3 }, { name: 'Drako-Meteor', power: 130, type: 'dragon', pp: 5 }, { name: 'Feuerssturm', power: 110, type: 'fire', pp: 5 }, { name: 'Erdbeben', power: 100, type: 'ground', pp: 10 }] },
  { id: 380, name: 'Latias',     type: 'dragon',   hp: 110, atk: 80,  def: 90,  spd: 110, catchable: false, moves: [{ name: 'Dragonbreath', power: 60, type: 'dragon', pp: 20 }, { name: 'Psychokinese', power: 90, type: 'psychic', pp: 10 }, { name: 'Morgengrauen', power: 85, type: 'fairy', pp: 10 }, { name: 'Eisstrahl', power: 90, type: 'ice', pp: 10 }] },
  // Gen 4
  { id: 390, name: 'Panflam',    type: 'fire',     hp: 65,  atk: 60,  def: 50,  spd: 65,  catchable: true,  moves: [{ name: 'Glut', power: 40, type: 'fire', pp: 25 }, { name: 'Kratzer', power: 40, type: 'normal', pp: 35 }, { name: 'Flammenwurf', power: 65, type: 'fire', pp: 15 }, { name: 'Karateschlag', power: 50, type: 'fighting', pp: 25 }] },
  { id: 392, name: 'Panferno',   type: 'fire',     hp: 105, atk: 115, def: 80,  spd: 108, catchable: false, moves: [{ name: 'Flammenwurf', power: 65, type: 'fire', pp: 15, status: 'burn', statusChance: 0.1 }, { name: 'Nahkampf', power: 120, type: 'fighting', pp: 5 }, { name: 'Flammensturz', power: 55, type: 'fire', pp: 15 }, { name: 'Erdbeben', power: 100, type: 'ground', pp: 10 }] },
  { id: 393, name: 'Plinfa',     type: 'water',    hp: 65,  atk: 51,  def: 53,  spd: 40,  catchable: true,  moves: [{ name: 'Wasserpistole', power: 40, type: 'water', pp: 25 }, { name: 'Wettstreit', power: 40, type: 'normal', pp: 35 }, { name: 'Aquaknarre', power: 60, type: 'water', pp: 25 }, { name: 'Schnellsprint', power: 30, type: 'normal', pp: 40 }] },
  { id: 395, name: 'Impoleon',   type: 'water',    hp: 115, atk: 95,  def: 110, spd: 60,  catchable: false, moves: [{ name: 'Aquajet', power: 40, type: 'water', pp: 20 }, { name: 'Surf', power: 70, type: 'water', pp: 15 }, { name: 'Stahlklaue', power: 75, type: 'steel', pp: 15 }, { name: 'Eisstrahl', power: 90, type: 'ice', pp: 10, status: 'freeze', statusChance: 0.1 }] },
  { id: 418, name: 'Bamelin',    type: 'water',    hp: 80,  atk: 70,  def: 55,  spd: 85,  catchable: true,  moves: [{ name: 'Aquaknarre', power: 60, type: 'water', pp: 25 }, { name: 'Ruckzuckhieb', power: 40, type: 'normal', pp: 30 }, { name: 'Wasserring', power: 65, type: 'water', pp: 20 }, { name: 'Schlammschuss', power: 55, type: 'ground', pp: 15 }] },
  { id: 430, name: 'Honorav',    type: 'dark',     hp: 100, atk: 125, def: 90,  spd: 71,  catchable: false, moves: [{ name: 'Hinterhalt', power: 70, type: 'dark', pp: 10 }, { name: 'Flatterwing', power: 60, type: 'flying', pp: 35 }, { name: 'Nachtschatten', power: 85, type: 'dark', pp: 15 }, { name: 'Luftschnitt', power: 75, type: 'flying', pp: 20 }] },
  { id: 443, name: 'Kaumalat',   type: 'dragon',   hp: 70,  atk: 90,  def: 65,  spd: 50,  catchable: true,  moves: [{ name: 'Knirscher', power: 60, type: 'dragon', pp: 10 }, { name: 'Biss', power: 60, type: 'dark', pp: 25 }, { name: 'Erdbeben', power: 100, type: 'ground', pp: 10 }, { name: 'Drachenwut', power: 40, type: 'dragon', pp: 20 }] },
  { id: 445, name: 'Knakrack',   type: 'dragon',   hp: 130, atk: 130, def: 95,  spd: 102, catchable: false, moves: [{ name: 'Knirscher', power: 60, type: 'dragon', pp: 10 }, { name: 'Erdbeben', power: 100, type: 'ground', pp: 10 }, { name: 'Kracher', power: 85, type: 'normal', pp: 10 }, { name: 'Drachensturm', power: 120, type: 'dragon', pp: 10 }] },
  { id: 448, name: 'Lucario',    type: 'fighting', hp: 100, atk: 115, def: 80,  spd: 90,  catchable: true,  moves: [{ name: 'Aura-Kugel', power: 80, type: 'fighting', pp: 10 }, { name: 'Shadowball', power: 80, type: 'ghost', pp: 15 }, { name: 'Metallklaue', power: 50, type: 'steel', pp: 35 }, { name: 'Extrerna', power: 80, type: 'fighting', pp: 5 }] },
  { id: 459, name: 'Shnebedeck', type: 'ice',      hp: 80,  atk: 55,  def: 95,  spd: 40,  catchable: true,  moves: [{ name: 'Rasierblatt', power: 55, type: 'grass', pp: 25 }, { name: 'Blizzard', power: 110, type: 'ice', pp: 5 }, { name: 'Bodycheck', power: 85, type: 'normal', pp: 15 }, { name: 'Eisstrahl', power: 90, type: 'ice', pp: 10 }] },
  // Gen 5
  { id: 495, name: 'Serpifeu',   type: 'grass',    hp: 75,  atk: 75,  def: 70,  spd: 63,  catchable: true,  moves: [{ name: 'Rasierblatt', power: 55, type: 'grass', pp: 25 }, { name: 'Rankenhieb', power: 35, type: 'grass', pp: 20 }, { name: 'Blattklinge', power: 65, type: 'grass', pp: 15 }, { name: 'Tackle', power: 40, type: 'normal', pp: 35 }] },
  { id: 497, name: 'Serpiroyal', type: 'grass',    hp: 105, atk: 100, def: 95,  spd: 63,  catchable: false, moves: [{ name: 'Rasierblatt', power: 55, type: 'grass', pp: 25 }, { name: 'Rankenhieb', power: 35, type: 'grass', pp: 20 }, { name: 'Fokusstoß', power: 120, type: 'fighting', pp: 5 }, { name: 'Giftschlag', power: 75, type: 'poison', pp: 10, status: 'poison', statusChance: 0.3 }] },
  { id: 501, name: 'Ottaro',     type: 'water',    hp: 65,  atk: 65,  def: 60,  spd: 45,  catchable: true,  moves: [{ name: 'Wasserpistole', power: 40, type: 'water', pp: 25 }, { name: 'Schnellsprint', power: 30, type: 'normal', pp: 40 }, { name: 'Aquaknarre', power: 60, type: 'water', pp: 25 }, { name: 'Schlammschuss', power: 55, type: 'ground', pp: 15 }] },
  { id: 504, name: 'Nagelotz',   type: 'normal',   hp: 60,  atk: 56,  def: 36,  spd: 72,  catchable: true,  moves: [{ name: 'Tackle', power: 40, type: 'normal', pp: 35 }, { name: 'Bisattacke', power: 60, type: 'dark', pp: 25 }, { name: 'Ruckzuckhieb', power: 40, type: 'normal', pp: 30 }, { name: 'Knirscher', power: 60, type: 'dark', pp: 10 }] },
  { id: 509, name: 'Felilou',    type: 'dark',     hp: 65,  atk: 75,  def: 40,  spd: 90,  catchable: true,  moves: [{ name: 'Zahnarsch', power: 60, type: 'dark', pp: 25 }, { name: 'Nachtschatten', power: 85, type: 'dark', pp: 15 }, { name: 'Ruckzuckhieb', power: 40, type: 'normal', pp: 30 }, { name: 'Hinterhalt', power: 70, type: 'dark', pp: 10 }] },
  { id: 524, name: 'Geosenge',   type: 'rock',     hp: 55,  atk: 75,  def: 85,  spd: 25,  catchable: true,  moves: [{ name: 'Steinwurf', power: 50, type: 'rock', pp: 15 }, { name: 'Tackle', power: 40, type: 'normal', pp: 35 }, { name: 'Felsgrab', power: 75, type: 'rock', pp: 10 }, { name: 'Steinhagel', power: 100, type: 'rock', pp: 5 }] },
  { id: 540, name: 'Strawick',   type: 'bug',      hp: 70,  atk: 55,  def: 70,  spd: 30,  catchable: true,  moves: [{ name: 'Rankenhieb', power: 35, type: 'grass', pp: 20 }, { name: 'Rasierblatt', power: 55, type: 'grass', pp: 25 }, { name: 'Käfergeräusch', power: 90, type: 'bug', pp: 10 }, { name: 'Tackle', power: 40, type: 'normal', pp: 35 }] },
  { id: 562, name: 'Yamask',     type: 'ghost',    hp: 70,  atk: 55,  def: 85,  spd: 30,  catchable: true,  moves: [{ name: 'Schattenstoß', power: 40, type: 'ghost', pp: 30 }, { name: 'Spukball', power: 80, type: 'ghost', pp: 15 }, { name: 'Finsteraura', power: 80, type: 'dark', pp: 15 }, { name: 'Psychokinese', power: 90, type: 'psychic', pp: 10 }] },
  { id: 570, name: 'Zorua',      type: 'dark',     hp: 65,  atk: 80,  def: 44,  spd: 65,  catchable: true,  moves: [{ name: 'Nachtschatten', power: 85, type: 'dark', pp: 15 }, { name: 'Hinterhalt', power: 70, type: 'dark', pp: 10 }, { name: 'Foulspiel', power: 95, type: 'dark', pp: 15 }, { name: 'Shadowball', power: 80, type: 'ghost', pp: 15 }] },
  { id: 581, name: 'Waumboll',   type: 'normal',   hp: 75,  atk: 45,  def: 50,  spd: 75,  catchable: true,  moves: [{ name: 'Flügeltanz', power: 60, type: 'flying', pp: 35 }, { name: 'Windscherung', power: 60, type: 'flying', pp: 35 }, { name: 'Luftschnitt', power: 75, type: 'flying', pp: 20 }, { name: 'Schallwelle', power: 0, type: 'normal', pp: 20, status: 'paralyze', statusChance: 1.0 }] },
  { id: 604, name: 'Elevoltek',  type: 'electric', hp: 95,  atk: 105, def: 85,  spd: 115, catchable: true,  moves: [{ name: 'Donnerschlag', power: 65, type: 'electric', pp: 20, status: 'paralyze', statusChance: 0.3 }, { name: 'Donnerblitz', power: 90, type: 'electric', pp: 15 }, { name: 'Nahkampf', power: 120, type: 'fighting', pp: 5 }, { name: 'Blitz', power: 70, type: 'electric', pp: 15 }] },
  // Legendaries (uncatchable, boss battles)
  { id: 144, name: 'Arktos',     type: 'ice',      hp: 130, atk: 85,  def: 100, spd: 85,  catchable: false, moves: [{ name: 'Blizzard', power: 110, type: 'ice', pp: 5, status: 'freeze', statusChance: 0.1 }, { name: 'Eisstrahl', power: 90, type: 'ice', pp: 10 }, { name: 'Luftschnitt', power: 75, type: 'flying', pp: 20 }, { name: 'Donnerschlag', power: 65, type: 'electric', pp: 20 }] },
  { id: 145, name: 'Zapdos',     type: 'electric', hp: 130, atk: 90,  def: 85,  spd: 100, catchable: false, moves: [{ name: 'Donner', power: 90, type: 'electric', pp: 10, status: 'paralyze', statusChance: 0.3 }, { name: 'Donnerschlag', power: 65, type: 'electric', pp: 20 }, { name: 'Luftschnitt', power: 75, type: 'flying', pp: 20 }, { name: 'Donnersturm', power: 110, type: 'electric', pp: 5 }] },
  { id: 146, name: 'Lavados',    type: 'fire',     hp: 130, atk: 100, def: 85,  spd: 90,  catchable: false, moves: [{ name: 'Feuerssturm', power: 110, type: 'fire', pp: 5, status: 'burn', statusChance: 0.1 }, { name: 'Flammenwurf', power: 65, type: 'fire', pp: 15 }, { name: 'Luftschnitt', power: 75, type: 'flying', pp: 20 }, { name: 'Sonnentag', power: 0, type: 'fire', pp: 5 }] },
  { id: 150, name: 'Mewtu',      type: 'psychic',  hp: 160, atk: 150, def: 130, spd: 130, catchable: false, moves: [{ name: 'Psychokinese', power: 90, type: 'psychic', pp: 10 }, { name: 'Shadowball', power: 80, type: 'ghost', pp: 15 }, { name: 'Donner', power: 90, type: 'electric', pp: 10 }, { name: 'Feuerssturm', power: 110, type: 'fire', pp: 5 }] },
  { id: 3,   name: 'Bisaflor',   type: 'grass',    hp: 115, atk: 95,  def: 95,  spd: 80,  catchable: false, moves: [{ name: 'Rasierblatt', power: 55, type: 'grass', pp: 25 }, { name: 'Solarbeam', power: 120, type: 'grass', pp: 10 }, { name: 'Giftpuder', power: 0, type: 'poison', pp: 35, status: 'poison', statusChance: 1.0 }, { name: 'Rankenhieb', power: 35, type: 'grass', pp: 20 }] },
  { id: 6,   name: 'Glurak',     type: 'fire',     hp: 110, atk: 110, def: 80,  spd: 100, catchable: false, moves: [{ name: 'Flammenwurf', power: 65, type: 'fire', pp: 15 }, { name: 'Feuerwirbel', power: 95, type: 'fire', pp: 5 }, { name: 'Krallenhieb', power: 40, type: 'normal', pp: 35 }, { name: 'Luftschnitt', power: 75, type: 'flying', pp: 20, status: 'paralyze', statusChance: 0.1 }] },
  { id: 9,   name: 'Turtok',     type: 'water',    hp: 120, atk: 90,  def: 110, spd: 78,  catchable: false, moves: [{ name: 'Surfer', power: 70, type: 'water', pp: 15 }, { name: 'Aquaknarre', power: 60, type: 'water', pp: 25 }, { name: 'Bodycheck', power: 85, type: 'normal', pp: 15 }, { name: 'Eisstrahl', power: 90, type: 'ice', pp: 10, status: 'freeze', statusChance: 0.1 }] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getEff(moveType, defType) { return (TYPE_CHART[moveType] || {})[defType] ?? 1; }
function calcDmg(atk, power, def, eff) {
  if (power === 0) return 0;
  const base = Math.floor(((2 * 50 / 5 + 2) * power * atk / def) / 50 + 2);
  return Math.max(1, Math.floor(base * eff * (0.85 + Math.random() * 0.15)));
}
function randomEnemy(excludeId) {
  const pool = POKEMON_DATA.filter(p => p.id !== excludeId);
  return JSON.parse(JSON.stringify(pool[Math.floor(Math.random() * pool.length)]));
}
function getSprite(id, back = false) {
  return back
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${id}.png`
    : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}
function deepCopy(o) { return JSON.parse(JSON.stringify(o)); }

// ─── Sub-components ───────────────────────────────────────────────────────────
function HPBar({ current, max }) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const color = pct > 50 ? '#4ade80' : pct > 25 ? '#facc15' : '#ef4444';
  return (
    <div className="w-full bg-black/30 rounded-full h-2.5 overflow-hidden">
      <motion.div className="h-full rounded-full transition-all"
        style={{ backgroundColor: color, width: `${pct}%` }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, type: 'spring' }} />
    </div>
  );
}

function TypeBadge({ type, size = 'sm' }) {
  const color = TYPE_COLORS[type] || '#888';
  return (
    <span className={`font-bold rounded-full text-white uppercase ${size === 'xs' ? 'text-[9px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'}`}
      style={{ backgroundColor: color }}>
      {type}
    </span>
  );
}

function StatusBadge({ status }) {
  if (!status) return null;
  const s = STATUS_EFFECTS[status];
  if (!s) return null;
  return <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: s.color + '40', color: s.color, border: `1px solid ${s.color}60` }}>{s.icon} {s.name}</span>;
}

function BattleLog({ messages }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [messages]);
  return (
    <div ref={ref} className="h-24 overflow-y-auto space-y-0.5 p-3 bg-black/50 rounded-2xl border border-white/10">
      {messages.map((msg, i) => (
        <motion.p key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
          className={`text-xs leading-relaxed ${
            msg.type === 'player' ? 'text-cyan-300' :
            msg.type === 'enemy' ? 'text-red-300' :
            msg.type === 'super' ? 'text-yellow-300 font-bold' :
            msg.type === 'status' ? 'text-purple-300 font-semibold' :
            msg.type === 'heal' ? 'text-green-300 font-semibold' :
            msg.type === 'not' ? 'text-white/30 italic' : 'text-white/60'
          }`}>
          {msg.text}
        </motion.p>
      ))}
    </div>
  );
}

function DamageNumber({ dmg, x, y, type }) {
  const color = type === 'player' ? '#67e8f9' : type === 'super' ? '#fbbf24' : '#f87171';
  return (
    <motion.div
      className="absolute pointer-events-none font-black text-lg z-20 drop-shadow-lg"
      style={{ left: x, top: y, color }}
      initial={{ opacity: 1, y: 0, scale: 1.3 }}
      animate={{ opacity: 0, y: -50, scale: 0.8 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}>
      -{dmg}
    </motion.div>
  );
}

// ─── PHASES ───────────────────────────────────────────────────────────────────
const PHASES = { MENU: 'menu', MAP: 'map', PICK: 'pick', BATTLE: 'battle', WIN: 'win', LOSE: 'lose' };

export default function PokemonGame() {
  const [user] = useState(() => { try { const u = localStorage.getItem('app_user'); return u && u !== 'undefined' ? JSON.parse(u) : null; } catch { return null; } });
  const [phase, setPhase] = useState(PHASES.MENU);
  const [gameMode, setGameMode] = useState('arena');
  const [useWorldMap, setUseWorldMap] = useState(false);
  const [storyEnemy, setStoryEnemy] = useState(null);
  const [showDungeonSelect, setShowDungeonSelect] = useState(false);
  const [activeDungeon, setActiveDungeon] = useState(null); // current dungeon run
  const [dungeonRoomIndex, setDungeonRoomIndex] = useState(0);
  const [showLegendaryBoss, setShowLegendaryBoss] = useState(null); // { boss } — zeigt Ankündigung

  // ── Zentraler Storage-Hook ─────────────────────────────────────────────────
  const storage = usePokemonStorage(user, POKEMON_DATA);
  const { data: pkData } = storage;

  // Derived convenience aliases
  const party = pkData.party;
  const box = pkData.box;
  const partyXP = pkData.xp;
  const partyLevel = pkData.levels;
  const exploredNodes = pkData.explored;
  const storyProgress = pkData.story;
  const inventory = pkData.inventory;
  const ballInventory = pkData.balls;
  const coins = pkData.coins;

  const [pendingEvolution, setPendingEvolution] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(null);
  const [pendingReward, setPendingReward] = useState(null);

  // Battle state
  const [playerPoke, setPlayerPoke] = useState(null);
  const [enemyPoke, setEnemyPoke] = useState(null);
  const [playerHP, setPlayerHP] = useState(0);
  const [enemyHP, setEnemyHP] = useState(0);
  const [playerStatus, setPlayerStatus] = useState(null);
  const [enemyStatus, setEnemyStatus] = useState(null);
  const [playerBuffs, setPlayerBuffs] = useState({ atk: 1, def: 1 });
  const [enemyBuffs, setEnemyBuffs] = useState({ atk: 1, def: 1 });
  const [playerStatusTurns, setPlayerStatusTurns] = useState(0);
  const [movePPs, setMovePPs] = useState({}); // { moveIndex: currentPP }
  const [log, setLog] = useState([]);
  const [battleLocked, setBattleLocked] = useState(false);
  const [shake, setShake] = useState(null);
  const [damageNums, setDamageNums] = useState([]);
  const [earnedTokens, setEarnedTokens] = useState(0);
  const wins = pkData.wins;
  const streak = pkData.streak;
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showItems, setShowItems] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showTutorial, setShowTutorial] = useState(() => !localStorage.getItem('pkTutorialSeen'));
  const [battleEnv, setBattleEnv] = useState('plains');
  const [battlePhaseAnim, setBattlePhaseAnim] = useState('idle'); // 'idle'|'attacking'|'hit'
  const [currentTurn, setCurrentTurn] = useState(0);
  const [critHit, setCritHit] = useState(false);
  const [weather, setWeather] = useState(null); // 'clear'|'rain'|'hail'|'sandstorm'
  const [weatherTurns, setWeatherTurns] = useState(0);
  const [comboCount, setComboCount] = useState(0); // consecutive super-effective hits
  const [battleStats, setBattleStats] = useState({ dmgDealt: 0, dmgTaken: 0, crits: 0, superEffective: 0 });
  const [attackEffect, setAttackEffect] = useState(null);
  const [hitFlash, setHitFlash] = useState(null);
  const [effectivenessFlash, setEffectivenessFlash] = useState(null);
  const [critFlash, setCritFlash] = useState(false);
  function triggerAttack(moveType, dir, eff, isCrit) {
    setAttackEffect({ moveType, direction: dir });
    setTimeout(() => setAttackEffect(null), 500);
    setTimeout(() => {
      setHitFlash(dir === 'toEnemy' ? 'enemy' : 'player');
      if (isCrit) { setCritFlash(true); setEffectivenessFlash('crit'); }
      else if (eff >= 2) setEffectivenessFlash('super');
      else if (eff === 0) setEffectivenessFlash('immune');
      else if (eff < 1) setEffectivenessFlash('not');
      setTimeout(() => { setHitFlash(null); setCritFlash(false); setEffectivenessFlash(null); }, 800);
    }, 380);
  }

  const [showParty, setShowParty] = useState(false);
  const [showCatch, setShowCatch] = useState(false);
  const [catchAnimation, setCatchAnimation] = useState(null);

  // ── Season 2 State ──────────────────────────────────────────────────────────
  const [showShardEvo, setShowShardEvo] = useState(false);
  const [showLastStand, setShowLastStand] = useState(false);
  const [showS2Shop, setShowS2Shop] = useState(false);
  const [showVoidCatch, setShowVoidCatch] = useState(false);
  const [pendingZoneNode, setPendingZoneNode] = useState(null);
  const [s2ShardDrop, setS2ShardDrop] = useState(null);
  const [activeIrradiatedZone, setActiveIrradiatedZone] = useState(null);

  const { data: allScores = [] } = useQuery({
    queryKey: ['gameScores'], queryFn: () => base44.entities.GameScore.list('-score', 100), enabled: showLeaderboard,
  });
  const leaderboard = useMemo(() => {
    const map = new Map();
    allScores.filter(s => s.game_type === 'pokemon').forEach(s => { if (!map.has(s.player_id) || map.get(s.player_id).score < s.score) map.set(s.player_id, s); });
    return [...map.values()].sort((a, b) => b.score - a.score).slice(0, 10);
  }, [allScores]);

  const partnerPoke = useMemo(() => {
    if (!user?.pokemon_partner_id) return null;
    return POKEMON_DATA.find(p => p.id === user.pokemon_partner_id) || null;
  }, [user]);

  const addLog = useCallback((text, type = 'info') => setLog(prev => [...prev.slice(-40), { text, type }]), []);



  // ── Storage Convenience (via hook) ─────────────────────────────────────────
  function ensureMoves(poke) {
    if (!poke) return poke;
    const base = POKEMON_DATA.find(p => p.id === poke.id);
    if (!poke.moves || poke.moves.length === 0 || poke.moves.some(m => !m || !m.name)) {
      return { ...poke, moves: base?.moves || [{ name: 'Tackle', power: 40, type: 'normal', pp: 35 }] };
    }
    return poke;
  }
  const saveParty = storage.saveParty;
  const saveBox = storage.saveBox;
  const saveCoins = storage.saveCoins;
  const saveInventory = storage.saveInventory;
  const saveBallInventory = storage.saveBalls;
  const addToParty = storage.addToParty;
  const moveToBox = storage.moveToBox;
  const moveToParty = storage.moveToParty;
  function savePartyXP(xp) { storage.saveXP(xp); }
  function savePartyLevel(lv) { storage.saveLevels(lv); }
  function saveExplored(nodes) { storage.saveExplored(nodes); }

  function throwPokeball(ballId) {
    if (!enemyPoke || !ballInventory[ballId]) return;
    setShowCatch(false);
    const newBalls = { ...ballInventory, [ballId]: ballInventory[ballId] - 1 };
    saveBallInventory(newBalls);
    const statusBonus = enemyStatus ? (enemyStatus === 'sleep' || enemyStatus === 'freeze' ? 2.0 : 1.5) : 1.0;
    const catchRate = Math.min(0.95, calcCatchRate(enemyPoke, enemyHP, enemyPoke.hp, ballId) * statusBonus);
    const success = Math.random() < catchRate;
    setCatchAnimation({ pokemon: enemyPoke, success });
    if (success) { addToParty(deepCopy(enemyPoke)); }
  }

  // Void-Catcher (Season 2)
  function throwVoidCatcher() {
    if (!enemyPoke || !isVoidInfected(enemyPoke)) return;
    setShowVoidCatch(false);
    const success = Math.random() < 0.75; // 75% bei erfüllter Bedingung
    setCatchAnimation({ pokemon: enemyPoke, success });
    if (success) { addToParty(deepCopy(enemyPoke)); }
  }

  function spawnDmgNum(dmg, side, isSuper) {
    const num = { id: Date.now() + Math.random(), dmg, x: side === 'player' ? '15%' : '65%', y: '30%', type: isSuper ? 'super' : side };
    setDamageNums(prev => [...prev, num]);
    setTimeout(() => setDamageNums(prev => prev.filter(n => n.id !== num.id)), 1300);
  }

  // ── Verstrahlte Zone confirm ───────────────────────────────────────────────
  function confirmZoneEntry(node) {
    const zone = getIrradiatedZone(node.id);
    setActiveIrradiatedZone(zone || null);
    setPendingZoneNode(null);
    // Proceed with original handleMapNodeSelect logic
    _doMapNodeSelect(node);
  }

  // ── World Map node selection ───────────────────────────────────────────────
  function handleMapNodeSelect(node) {
    // S2: Check for irradiated zone
    if (isS2Active() && getIrradiatedZone(node.id)) {
      setPendingZoneNode(node);
      return;
    }
    setActiveIrradiatedZone(null);
    _doMapNodeSelect(node);
  }

  function _doMapNodeSelect(node) {
    const reward = HIDDEN_REWARDS[node.id];
    if (reward && !exploredNodes.includes(node.id)) {
      // Mark as explored first, then handle reward
      const newExplored = [...exploredNodes, node.id];
      saveExplored(newExplored);
      if (reward.type === 'item') {
        const newInv = { ...inventory };
        reward.items.forEach(it => { newInv[it] = (newInv[it] || 0) + 1; });
        saveInventory(newInv);
        if (reward.coins) saveCoins(coins + reward.coins);
        setPendingReward({ ...reward, nodeId: node.id });
        return; // Don't go to battle, just show reward
      } else if (reward.type === 'pokemon') {
        // Wild battle with special pokemon
        const specialEnemy = POKEMON_DATA.find(p => p.id === reward.pokeId);
        if (specialEnemy) {
          setBattleEnv(node.env || 'plains');
          setStoryEnemy({ ...deepCopy(specialEnemy), trainerName: null, introText: reward.text });
          setGameMode('story');
          setUseWorldMap(true);
          setPhase(PHASES.PICK);
          return;
        }
      }
    }

    const zoneIdx = NODE_TO_ZONE[node.id]; // closing _doMapNodeSelect
    if (zoneIdx !== undefined) {
      // Jump story progress to this node if it's accessible
      if (zoneIdx === storyProgress.zoneIndex) {
        startStoryBattle();
      }
    }
  }

  function pickPokemon(poke) {
    // Apply level bonuses from partyLevel
    const pokeLevel = partyLevel[poke.id] || 5;
    const lvBonus = 1 + (pokeLevel - 5) * 0.02; // +2% per level above 5
    const evoChain = EVOLUTION_CHAINS.find(e => e.toId === poke.id);
    const evoBoost = evoChain ? evoChain.statBoost : { hp: 1, atk: 1, def: 1, spd: 1 };
    const buffed = { ...deepCopy(poke),
      hp:  Math.floor(poke.hp  * 1.5 * lvBonus * (evoBoost.hp  || 1)),
      atk: Math.floor(poke.atk * 1.3 * lvBonus * (evoBoost.atk || 1)),
      def: Math.floor(poke.def * 1.2 * lvBonus * (evoBoost.def || 1)),
      level: pokeLevel,
    };
    // S2: Void-spawn in irradiated zones
    let enemy;
    if (gameMode === 'story') {
      enemy = storyEnemy;
    } else {
      const base = randomEnemy(poke.id);
      const zone = activeIrradiatedZone;
      if (zone && isS2Active() && VOID_ELIGIBLE_IDS.includes(base.id) && Math.random() < zone.voidSpawnRate) {
        enemy = makeVoidInfected(base);
      } else {
        enemy = base;
      }
    }
    const pps = {};
    buffed.moves.forEach((m, i) => { pps[i] = m.pp; });

    // Random weather (30% chance)
    const weatherRoll = Math.random();
    const weatherTypes = Object.keys(WEATHER_TYPES);
    const newWeather = weatherRoll < 0.3 ? weatherTypes[Math.floor(Math.random() * weatherTypes.length)] : null;
    setWeather(newWeather);
    setWeatherTurns(newWeather ? 5 + Math.floor(Math.random() * 3) : 0);
    setComboCount(0);
    setBattleStats({ dmgDealt: 0, dmgTaken: 0, crits: 0, superEffective: 0 });

    setPlayerPoke(buffed); setEnemyPoke(enemy);
    setPlayerHP(buffed.hp); setEnemyHP(enemy.hp);
    setPlayerStatus(null); setEnemyStatus(null);
    setPlayerBuffs({ atk: 1, def: 1 }); setEnemyBuffs({ atk: 1, def: 1 });
    setPlayerStatusTurns(0); setMovePPs(pps);
    setCurrentTurn(0); setCritHit(false);

    const introLogs = [];
    if (gameMode === 'story' && enemy.trainerName) {
      introLogs.push({ text: `${enemy.trainerName}: "${enemy.introText}"`, type: 'info' });
      introLogs.push({ text: `${enemy.trainerName} schickt ${enemy.name} (Lv.?)!`, type: 'enemy' });
    } else {
      introLogs.push({ text: `Ein wildes ${enemy.name} erscheint!`, type: 'info' });
    }
    introLogs.push({ text: `Los, ${poke.name}! Zeig was du kannst!`, type: 'player' });
    if (newWeather) {
      introLogs.push({ text: `${WEATHER_TYPES[newWeather].icon} Das Wetter ist: ${WEATHER_TYPES[newWeather].name}!`, type: 'status' });
    }
    setLog(introLogs);
    setPhase(PHASES.BATTLE);
  }

  function startStoryBattle() {
    const zone = STORY_ZONES[storyProgress.zoneIndex];
    let enemyData = zone.type === 'route' ? zone.trainers[storyProgress.trainerIndex] : zone;
    const baseEnemy = POKEMON_DATA.find(p => p.id === enemyData.pokeId) || POKEMON_DATA[0];
    const buffed = deepCopy(baseEnemy);
    if (zone.buffs) {
      buffed.hp  = Math.floor(buffed.hp  * (zone.buffs.hp  || 1));
      buffed.atk = Math.floor(buffed.atk * (zone.buffs.atk || 1));
      buffed.def = Math.floor(buffed.def * (zone.buffs.def || 1));
    }
    buffed.trainerName = enemyData.name || zone.leader;
    buffed.introText = enemyData.text || '...';
    setBattleEnv(zone.env || 'plains');
    setStoryEnemy(buffed);
    setPhase(PHASES.PICK);
  }

  async function handleMove(move, moveIdx) {
    if (battleLocked || phase !== PHASES.BATTLE) return;
    if ((movePPs[moveIdx] || 0) <= 0) { addLog('Keine AP mehr für diese Attacke!', 'not'); return; }
    setBattleLocked(true);

    // Consume PP
    const newPPs = { ...movePPs, [moveIdx]: (movePPs[moveIdx] || 0) - 1 };
    setMovePPs(newPPs);

    // Check player status
    const pStatus = playerStatus;
    if (pStatus === 'sleep' || pStatus === 'freeze') {
      addLog(`${playerPoke.name} kann sich nicht bewegen! (${STATUS_EFFECTS[pStatus]?.name})`, 'status');
      if (playerStatusTurns <= 1) { setPlayerStatus(null); addLog(`${playerPoke.name} ist erwacht!`, 'status'); }
      else setPlayerStatusTurns(t => t - 1);
      return doEnemyTurn(playerHP, enemyHP);
    }
    if (pStatus === 'paralyze' && Math.random() < 0.25) {
      addLog(`${playerPoke.name} ist gelähmt und kann sich nicht bewegen!`, 'status');
      return doEnemyTurn(playerHP, enemyHP);
    }

    // Crit check (higher chance at combo)
    const critChance = 0.0625 + Math.min(comboCount * 0.03, 0.15);
    const isCrit = Math.random() < critChance;
    setCritHit(isCrit);

    const eff = getEff(move.type, enemyPoke.type);

    // Weather multiplier
    let weatherMult = 1;
    if (weather) {
      const w = WEATHER_TYPES[weather];
      if (move.type === 'fire' && w.fireMult) weatherMult = w.fireMult;
      if (move.type === 'water' && w.waterMult) weatherMult = w.waterMult;
      if (move.type === 'ice' && w.iceMult) weatherMult = w.iceMult;
      if (move.type === 'rock' && w.rockMult) weatherMult = w.rockMult;
    }

    const rawAtk = Math.floor(playerPoke.atk * playerBuffs.atk * (pStatus === 'burn' ? 0.85 : 1));
    const rawDef = Math.floor(enemyPoke.def * enemyBuffs.def);
    const dmg = move.power > 0 ? Math.floor(calcDmg(rawAtk, move.power, rawDef, eff) * (isCrit ? 1.5 : 1) * weatherMult) : 0;

    // Handle buff moves
    if (move.buff) {
      if (move.buff === 'atk') {
        setPlayerBuffs(b => ({ ...b, atk: b.atk + move.buffVal }));
        addLog(`${playerPoke.name} stärkt seinen Angriff! +${Math.floor(move.buffVal * 100)}%`, 'player');
      }
    }

    const newEnemyHP = Math.max(0, enemyHP - dmg);
    if (dmg > 0) {
      setEnemyHP(newEnemyHP);
      setShake('enemy');
      setBattlePhaseAnim('attacking');
      triggerAttack(move.type, 'toEnemy', eff, isCrit);
      spawnDmgNum(dmg, 'enemy', eff >= 2);
      setTimeout(() => { setShake(null); setBattlePhaseAnim('idle'); }, 500);

      if (move.power === 0) addLog(`${playerPoke.name} setzt ${move.name} ein!`, 'player');
      else {
        const critText = isCrit ? ' 💥 KRITISCH!' : '';
        const weatherText = weatherMult > 1 ? ' 🌤️ Wetter-Boost!' : weatherMult < 1 ? ' 🌧️ Wetter-geschwächt' : '';
        addLog(`${playerPoke.name} → ${move.name}! ${dmg} Schaden${critText}${weatherText}`, 'player');
        if (eff >= 2) { addLog('⚡ Das ist sehr effektiv!', 'super'); setComboCount(c => c + 1); }
        else { setComboCount(0); }
        if (eff === 0) addLog('❌ Kein Effekt...', 'not');
        else if (eff < 1) addLog('↓ Nicht sehr effektiv...', 'not');
      }
      // Track stats
      setBattleStats(s => ({ ...s, dmgDealt: s.dmgDealt + dmg, crits: s.crits + (isCrit ? 1 : 0), superEffective: s.superEffective + (eff >= 2 ? 1 : 0) }));

      // Chance to apply status
      if (move.status && !enemyStatus && Math.random() < (move.statusChance || 0)) {
        setEnemyStatus(move.status);
        addLog(`${enemyPoke.name} ${STATUS_EFFECTS[move.status]?.name} wurde angewendet!`, 'status');
      }
    } else if (move.power === 0 && !move.buff) {
      addLog(`${playerPoke.name} setzt ${move.name} ein!`, 'player');
    }

    if (newEnemyHP <= 0) {
      return handleWin(newEnemyHP, playerHP);
    }

    // Enemy status damage
    let eStatusDmg = 0;
    if (enemyStatus && STATUS_EFFECTS[enemyStatus]?.dot > 0) {
      eStatusDmg = Math.floor(enemyPoke.hp * STATUS_EFFECTS[enemyStatus].dot);
      const afterStatus = Math.max(0, newEnemyHP - eStatusDmg);
      setEnemyHP(afterStatus);
      addLog(`${enemyPoke.name} erleidet ${eStatusDmg} Schaden durch ${STATUS_EFFECTS[enemyStatus].name}!`, 'status');
      if (afterStatus <= 0) return handleWin(afterStatus, playerHP);
    }

    setTimeout(() => doEnemyTurn(playerHP, Math.max(0, newEnemyHP - eStatusDmg)), 850);
  }

  function doEnemyTurn(curPlayerHP, curEnemyHP) {
    // Weather tick
    if (weather) {
      setWeatherTurns(t => {
        const next = t - 1;
        if (next <= 0) { setWeather(null); addLog('Das Wetter normalisiert sich.', 'info'); }
        return next;
      });
      // Weather DOT (hail/sandstorm) on both
      if ((weather === 'hail' || weather === 'sandstorm') && WEATHER_TYPES[weather]?.dot > 0) {
        const wDot = Math.floor(playerPoke.hp * WEATHER_TYPES[weather].dot);
        setPlayerHP(prev => Math.max(0, prev - wDot));
        addLog(`${playerPoke.name} erleidet ${wDot} Wetterschaden!`, 'status');
        curPlayerHP = Math.max(0, curPlayerHP - wDot);
      }
    }

    // Enemy picks best move (weighted by effectiveness + weather consideration)
    const enemyMove = enemyPoke.moves.reduce((best, m) => {
      const eff = getEff(m.type, playerPoke.type);
      let weatherBonus = 1;
      if (weather) {
        const w = WEATHER_TYPES[weather];
        if (m.type === 'fire' && w.fireMult) weatherBonus = w.fireMult;
        if (m.type === 'water' && w.waterMult) weatherBonus = w.waterMult;
      }
      // Prefer status moves when enemy HP is above 50%, attack otherwise
      const hpRatio = curEnemyHP / enemyPoke.hp;
      const statusBonus = m.status && hpRatio > 0.5 ? 25 : 0;
      const score = (m.power || 20) * eff * weatherBonus + statusBonus;
      return score > best.score ? { move: m, score } : best;
    }, { move: enemyPoke.moves[Math.floor(Math.random() * enemyPoke.moves.length)], score: -1 }).move;

    const eEff = getEff(enemyMove.type, playerPoke.type);
    const eDef = Math.floor(playerPoke.def * playerBuffs.def);
    const eAtk = Math.floor(enemyPoke.atk * enemyBuffs.atk * (enemyStatus === 'burn' ? 0.85 : 1));
    const eDmg = enemyMove.power > 0 ? calcDmg(eAtk, enemyMove.power, eDef, eEff) : 0;
    const newPHP = Math.max(0, curPlayerHP - eDmg);

    if (eDmg > 0) {
      setPlayerHP(newPHP);
      setShake('player');
      triggerAttack(enemyMove.type, 'toPlayer', eEff, false);
      spawnDmgNum(eDmg, 'player', eEff >= 2);
      setTimeout(() => setShake(null), 500);
      setBattleStats(s => ({ ...s, dmgTaken: s.dmgTaken + eDmg }));
      addLog(`${enemyPoke.name} → ${enemyMove.name}! ${eDmg} Schaden${eEff >= 2 ? ' ⚡ Sehr effektiv!' : ''}`, 'enemy');

      if (enemyMove.status && !playerStatus && Math.random() < (enemyMove.statusChance || 0)) {
        setPlayerStatus(enemyMove.status);
        setPlayerStatusTurns(STATUS_EFFECTS[enemyMove.status]?.skipTurns || 2);
        addLog(`${playerPoke.name} hat ${STATUS_EFFECTS[enemyMove.status]?.name} bekommen!`, 'status');
      }
    } else {
      addLog(`${enemyPoke.name} setzt ${enemyMove.name} ein!`, 'enemy');
    }

    // Player status DOT
    let pDot = 0;
    if (playerStatus && STATUS_EFFECTS[playerStatus]?.dot > 0) {
      pDot = Math.floor(playerPoke.hp * STATUS_EFFECTS[playerStatus].dot);
      const afterDot = Math.max(0, newPHP - pDot);
      setPlayerHP(afterDot);
      addLog(`${playerPoke.name} erleidet ${pDot} Schaden durch ${STATUS_EFFECTS[playerStatus].name}!`, 'status');
      if (afterDot <= 0) {
        addLog(`${playerPoke.name} wurde besiegt! 😢`, 'enemy');
          storage.saveStreak(0);
          setPhase(PHASES.LOSE);
          setBattleLocked(false);
          return;
      }
    }

    setCurrentTurn(t => t + 1);
    if (newPHP - pDot <= 0 && eDmg > 0) {
      addLog(`${playerPoke.name} wurde besiegt! 😢`, 'enemy');
      storage.saveStreak(0);
      setPhase(PHASES.LOSE);
    }
    setBattleLocked(false);
  }

  // ── Award XP after battle ─────────────────────────────────────────────────
  function awardBattleXP(pokemon, enemy) {
    const gained = xpFromBattle(enemy, storyProgress.zoneIndex + 1);
    const pokeId = pokemon.id;
    const currentLv = partyLevel[pokeId] || 5;
    const currentXP = (partyXP[pokeId] || 0) + gained;
    const needed = xpForLevel(currentLv + 1);

    const newLvMap = { ...partyLevel };
    const newXPMap = { ...partyXP };

    if (currentXP >= needed && currentLv < 50) {
      const newLv = currentLv + 1;
      newLvMap[pokeId] = newLv;
      newXPMap[pokeId] = currentXP - needed;
      savePartyLevel(newLvMap);
      savePartyXP(newXPMap);
      setShowLevelUp({ pokemon, newLevel: newLv });

      // Check evolution
      const evoChain = checkEvolution(pokeId, newLv);
      if (evoChain) {
        setTimeout(() => setPendingEvolution({ fromPoke: pokemon, chain: evoChain }), 1500);
      }
    } else {
      newXPMap[pokeId] = currentXP;
      savePartyXP(newXPMap);
    }
    return gained;
  }

  async function handleWin(newEnemyHP, newPlayerHP) {
    addLog(`${enemyPoke.name} wurde besiegt! 🎉`, 'super');
    let tokenReward = 0;

    // Award XP to player pokemon
    if (playerPoke) awardBattleXP(playerPoke, enemyPoke);

    if (gameMode === 'arena') {
      const nw = wins + 1, ns = streak + 1;
      storage.saveWins(nw); storage.saveStreak(ns);
      tokenReward = 50 + ns * 10;
      const coinReward = 100 + ns * 15;
      saveCoins(coins + coinReward);
      if (user) {
        try { await base44.entities.GameScore.create({ player_username: user.username, player_id: user.id, score: nw, level: ns, coins_collected: coinReward, game_type: 'pokemon' }); } catch {}
      }
    } else if (activeDungeon) {
      // ── Dungeon room cleared ──
      const nextRoomIdx = dungeonRoomIndex + 1;
      if (nextRoomIdx >= activeDungeon.totalRooms) {
        // Dungeon complete! → infiniteFloor erhöhen für endlose Skalierung
        tokenReward = activeDungeon.rewards.tokens;
        saveCoins(coins + activeDungeon.rewards.coins);
        const newInfiniteFloor = (storyProgress.infiniteFloor || 0) + 1;
        const np = {
          ...storyProgress,
          clearedDungeons: [...(storyProgress.clearedDungeons || []), activeDungeon.seed],
          infiniteFloor: newInfiniteFloor,
        };
        if (activeDungeon.rewards.badge) np.badges = [...(np.badges || []), activeDungeon.rewards.badge];
        storage.saveStory(np);
        setActiveDungeon(null);
        setDungeonRoomIndex(0);
      } else {
        tokenReward = 100;
        setDungeonRoomIndex(nextRoomIdx);
        // Pre-load next room enemy
        const room = activeDungeon.rooms[nextRoomIdx];
        // Boss-Raum: nutze bossData wenn vorhanden (legendäres Pokémon mit vollen Stats)
        let nextEnemy;
        if (room.bossData && room.bossData.moves) {
          nextEnemy = { ...deepCopy(room.bossData), trainerName: room.trainerName, introText: room.introText };
          // Zeige Ankündigung für legendäre Bosse
          if (room.isLegendaryBoss) setShowLegendaryBoss(room.bossData);
        } else {
          const baseEnemy = POKEMON_DATA.find(p => p.id === room.pokeId) || POKEMON_DATA[0];
          nextEnemy = { ...deepCopy(baseEnemy),
            hp:  Math.floor(baseEnemy.hp  * room.statMult),
            atk: Math.floor(baseEnemy.atk * room.statMult),
            def: Math.floor(baseEnemy.def * room.statMult),
            trainerName: room.trainerName,
            introText: room.introText,
          };
        }
        setStoryEnemy(nextEnemy);
      }
    } else {
      const zone = STORY_ZONES[storyProgress.zoneIndex];
      let np = { ...storyProgress };
      if (zone.type === 'route') {
        np.trainerIndex++;
        tokenReward = 200;
        if (np.trainerIndex >= zone.trainers.length) { np.zoneIndex++; np.trainerIndex = 0; tokenReward = 400; }
      } else {
        np.badges = [...np.badges, zone.badge]; np.zoneIndex++; np.trainerIndex = 0; tokenReward = 1000;
      }
      storage.saveStory(np);
      const coinReward = 300;
      saveCoins(coins + coinReward);
    }

    if (user && tokenReward > 0) {
      try {
        await base44.entities.AppUser.update(user.id, { tokens: (user.tokens || 0) + tokenReward });
        const u2 = { ...user, tokens: (user.tokens || 0) + tokenReward };
        localStorage.setItem('app_user', JSON.stringify(u2));
        window.dispatchEvent(new Event('user-updated'));
      } catch {}
    }
    // S2: Shard-Drop in verstrahlten Zonen
    if (activeIrradiatedZone && isS2Active()) {
      const dropped = rollShardDrop(activeIrradiatedZone);
      if (dropped) setS2ShardDrop({ type: dropped });
    }

    setEarnedTokens(tokenReward);
    setPhase(PHASES.WIN);
    setBattleLocked(false);
  }

  function handleItem(item) {
    if (!inventory[item.id] || inventory[item.id] <= 0) return;
    const newInv = { ...inventory, [item.id]: inventory[item.id] - 1 };
    saveInventory(newInv);
    setShowItems(false);

    if (item.type === 'heal') {
      const healed = Math.min(playerPoke.hp, playerHP + item.value);
      setPlayerHP(healed);
      addLog(`Du benutzt ${item.name}! +${healed - playerHP} HP`, 'heal');
    } else if (item.type === 'cure') {
      setPlayerStatus(null);
      addLog(`${playerPoke.name} ist von seinem Statusproblem geheilt!`, 'heal');
    } else if (item.type === 'buff') {
      if (item.stat === 'atk') setPlayerBuffs(b => ({ ...b, atk: b.atk + item.value }));
      else setPlayerBuffs(b => ({ ...b, def: b.def + item.value }));
      addLog(`${item.name} wurde eingesetzt! +${Math.floor(item.value * 100)}% ${item.stat === 'atk' ? 'Angriff' : 'Verteidigung'}`, 'heal');
    } else if (item.type === 'revive') {
      const revHP = Math.floor(playerPoke.hp * item.value);
      setPlayerHP(revHP);
      addLog(`${playerPoke.name} wurde mit ${item.name} wiederbelebt! HP: ${revHP}`, 'heal');
    }
    // Enemy still attacks after item use
    setTimeout(() => doEnemyTurn(playerHP, enemyHP), 600);
  }

  function buyItem(item) {
    if (coins < item.cost) return;
    saveCoins(coins - item.cost);
    saveInventory({ ...inventory, [item.id]: (inventory[item.id] || 0) + 1 });
  }

  function nextBattle() {
    if (!playerPoke) return;
    const enemy = randomEnemy(playerPoke.id);
    setEnemyPoke(enemy);
    setPlayerHP(playerPoke.hp); setEnemyHP(enemy.hp);
    setPlayerStatus(null); setEnemyStatus(null);
    setPlayerBuffs({ atk: 1, def: 1 }); setEnemyBuffs({ atk: 1, def: 1 });
    const pps = {};
    playerPoke.moves.forEach((m, i) => { pps[i] = m.pp; });
    setMovePPs(pps);
    setCurrentTurn(0);
    setLog([{ text: `Nächster Gegner: ${enemy.name} erscheint!`, type: 'info' }]);
    setPhase(PHASES.BATTLE);
  }

  function reset() { setPlayerPoke(null); setEnemyPoke(null); setLog([]); setPhase(gameMode === 'story' ? PHASES.MAP : PHASES.PICK); }
  function quitToMenu() { setPlayerPoke(null); setEnemyPoke(null); setLog([]); setPhase(PHASES.MENU); }

  const filteredPokemon = useMemo(() => filter === 'all' ? POKEMON_DATA : POKEMON_DATA.filter(p => p.type === filter), [filter]);
  const allTypes = [...new Set(POKEMON_DATA.map(p => p.type))].sort();
  const currentEnv = ENV_STYLES[battleEnv] || ENV_STYLES.plains;

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-[#040408] via-[#080814] to-[#04040c] overflow-y-auto text-white font-sans">
      {/* S2: Irradiated Zone Warning */}
      <AnimatePresence>
        {pendingZoneNode && (
          <IrradiatedZoneWarning
            nodeId={pendingZoneNode.id}
            onContinue={() => confirmZoneEntry(pendingZoneNode)}
            onCancel={() => setPendingZoneNode(null)}
          />
        )}
      </AnimatePresence>

      {/* S2: Shard Evolution Panel */}
      <AnimatePresence>
        {showShardEvo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-sm">
              <ShardEvolutionPanel
                party={party}
                onEvolve={(poke, evo) => {
                  const result = performShardEvolution(poke, evo);
                  if (result) { addToParty(result); setShowShardEvo(false); }
                }}
                onClose={() => setShowShardEvo(false)}
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* S2: Last Stand Arena */}
      <AnimatePresence>
        {showLastStand && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-sm">
              <LastStandArena party={party} onStartFight={() => {}} onClose={() => setShowLastStand(false)} />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* S2: Item Shop */}
      <AnimatePresence>
        {showS2Shop && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-sm">
              <S2ItemShop
                coins={coins}
                onBuy={(item, method) => {
                  if (method === 'buy') saveCoins(coins - item.buyCoins);
                  setShowS2Shop(false);
                }}
                onClose={() => setShowS2Shop(false)}
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Legendärer Boss Ankündigung */}
      <AnimatePresence>
        {showLegendaryBoss && (
          <LegendaryBossAnnouncement
            boss={showLegendaryBoss}
            onContinue={() => setShowLegendaryBoss(null)}
          />
        )}
      </AnimatePresence>

      {/* Back button */}
      <div className="absolute top-4 left-4 z-20">
        <Link to={createPageUrl('Home')}>
          <Button variant="ghost" size="sm" className="text-white/50 hover:text-white hover:bg-white/8 rounded-xl px-3 py-1.5 h-auto text-sm font-bold gap-1.5 backdrop-blur-sm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <ChevronRight className="w-4 h-4 rotate-180" /> Zurück
          </Button>
        </Link>
      </div>

      {/* Background glows */}
      <div className="fixed top-0 left-1/4 w-80 h-80 bg-red-500/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-80 h-80 bg-yellow-400/8 rounded-full blur-[120px] pointer-events-none" />

      {/* Evolution Screen */}
      <AnimatePresence>
        {pendingEvolution && (
          <EvolutionScreen
            fromPoke={pendingEvolution.fromPoke}
            chain={pendingEvolution.chain}
            onComplete={() => setPendingEvolution(null)}
          />
        )}
      </AnimatePresence>

      {/* Catch Animation */}
      <AnimatePresence>
        {catchAnimation && (
          <CatchAnimation
            pokemon={catchAnimation.pokemon}
            success={catchAnimation.success}
            onComplete={() => setCatchAnimation(null)}
          />
        )}
      </AnimatePresence>

      {/* Party Panel */}
      <AnimatePresence>
        {showParty && (
          <div className="fixed top-20 right-4 z-40">
            <PokemonParty
              party={party}
              box={box}
              partyLevel={partyLevel}
              partyXP={partyXP}
              activePokemon={playerPoke}
              onSelectActive={(poke) => {}}
              onRelease={(id) => storage.releasePokemon(id)}
              onMoveToBox={moveToBox}
              onMoveToParty={moveToParty}
              onClose={() => setShowParty(false)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Level Up notification */}
      <AnimatePresence>
        {showLevelUp && (
          <LevelUpNotif
            pokemon={showLevelUp.pokemon}
            newLevel={showLevelUp.newLevel}
            onDismiss={() => setShowLevelUp(null)}
          />
        )}
      </AnimatePresence>

      <div className="max-w-3xl mx-auto relative z-10 px-3 pt-16 pb-8">

        {/* Tutorial */}
        <AnimatePresence>
          {showTutorial && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gradient-to-br from-blue-950 to-indigo-950 border-2 border-blue-500/50 rounded-3xl p-6 max-w-lg w-full shadow-2xl">
                <h2 className="text-2xl font-black text-yellow-400 mb-4 flex items-center gap-2"><Star className="w-6 h-6" /> Spielanleitung</h2>
                <div className="space-y-3 text-blue-100 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { t: '🎮 Story Modus', d: 'Routen erkunden, Trainer besiegen, Arenaleiter herausfordern & Orden sammeln.' },
                      { t: '⚔️ Arena Modus', d: 'Endlos-Kämpfe! Baue deinen Streak auf und steige in der Rangliste auf.' },
                      { t: '⚡ Typen-System', d: 'Feuer > Pflanze > Wasser > Feuer. Sehr effektive Treffer = 2x Schaden!' },
                      { t: '☠️ Statuseffekte', d: 'Verbrannt, Vergiftet, Gelähmt, Schläfrig, Gefroren — beeinflusst den Kampf!' },
                      { t: '🧪 Items', d: 'Tränke heilen HP, X-Angriff boostet Werte, Beleber nach KO.' },
                      { t: '💰 Münzen', d: 'Verdiene Münzen durch Siege und kaufe Items im Shop!' },
                    ].map(x => (
                      <div key={x.t} className="bg-black/30 p-3 rounded-xl border border-white/10">
                        <p className="font-bold text-white text-xs mb-1">{x.t}</p>
                        <p className="text-xs text-blue-200/70">{x.d}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <Button onClick={() => { setShowTutorial(false); localStorage.setItem('pkTutorialSeen', 'true'); }}
                  className="mt-5 w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black text-base py-5 rounded-2xl">
                  Auf Abenteuer!
                </Button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            {phase !== PHASES.MENU && (
              <button onClick={quitToMenu} className="flex items-center gap-1 text-white/35 hover:text-white/70 text-xs font-bold transition-colors mb-1.5 uppercase tracking-wider">
                <ChevronRight className="w-3 h-3 rotate-180" /> Hauptmenü
              </button>
            )}
            <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-400 to-pink-400">
              Pokémon {phase !== PHASES.MENU && gameMode === 'story' ? 'Abenteuer' : 'Kampf-Arena'}
            </h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Coins */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/15 border border-yellow-500/30 rounded-full text-yellow-400 font-black text-sm">
              💰 {coins.toLocaleString()}
            </div>
            {gameMode === 'arena' && phase !== PHASES.MENU && (
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 bg-blue-500/15 border border-blue-500/30 rounded-full text-blue-300 font-black text-sm">🏆 {wins}</div>
                <div className="px-3 py-1.5 bg-orange-500/15 border border-orange-500/30 rounded-full text-orange-300 font-black text-sm">🔥 {streak}</div>
              </div>
            )}
            <button onClick={() => setShowTutorial(true)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all">
              <HelpCircle className="w-4 h-4" />
            </button>
            <button onClick={() => setShowParty(s => !s)}
              className={`p-2 rounded-full transition-all ${showParty ? 'bg-green-500/20 text-green-400' : 'bg-white/5 hover:bg-white/10 text-white/50 hover:text-white'}`}>
              <Users className="w-4 h-4" />
            </button>
            <button onClick={() => setShowLeaderboard(s => !s)} className="p-2 rounded-full bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 transition-all">
              <Trophy className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Leaderboard */}
        <AnimatePresence>
          {showLeaderboard && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="mb-5 bg-black/60 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
              <h3 className="text-base font-black text-yellow-400 mb-3 flex items-center gap-2"><Trophy className="w-4 h-4" /> Top 10 Trainer</h3>
              {leaderboard.length === 0 ? <p className="text-white/30 text-center py-3 text-sm">Noch keine Einträge!</p> : (
                <div className="space-y-1.5">
                  {leaderboard.map((e, i) => (
                    <div key={e.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 flex items-center justify-center rounded-lg font-black text-xs"
                          style={{ background: i === 0 ? '#f59e0b' : i === 1 ? '#9ca3af' : i === 2 ? '#d97706' : '#ffffff10', color: i < 3 ? '#000' : '#fff' }}>
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                        </span>
                        <span className="text-white font-semibold text-sm">{e.player_username}</span>
                      </div>
                      <span className="text-yellow-400 font-black text-sm">{e.score} Siege</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">

          {/* ── MENU ── */}
          {phase === PHASES.MENU && !showDungeonSelect && (
            <PokemonMainMenu
              storyProgress={storyProgress}
              wins={wins}
              streak={streak}
              coins={coins}
              party={party}
              badges={storyProgress.badges}
              exploredNodes={exploredNodes}
              STORY_ZONES={STORY_ZONES}
              inventory={inventory}
              ballInventory={ballInventory}
              onBuyGameItem={(item) => {
                if (coins < item.cost) { toast.error("Nicht genug Münzen!"); return; }
                saveCoins(coins - item.cost);
                if (item.category === 'ball') {
                  saveBallInventory({ ...ballInventory, [item.id]: (ballInventory[item.id] || 0) + 1 });
                } else {
                  saveInventory({ ...inventory, [item.id]: (inventory[item.id] || 0) + 1 });
                }
                toast.success(`${item.name} gekauft!`);
              }}
              onStartStory={() => { setGameMode('story'); setUseWorldMap(true); setPhase(PHASES.MAP); }}
              onStartArena={() => { setGameMode('arena'); setPhase(PHASES.PICK); }}
              onOpenShop={() => {/* handled inline below */}}
              onShowParty={() => setShowParty(s => !s)}
              onShowTutorial={() => setShowTutorial(true)}
            />
          )}

          {/* ── DUNGEON SELECT ── */}
          {phase === PHASES.MENU && showDungeonSelect && (
            <motion.div key="dungeon-select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DungeonSelector
                storyProgress={storyProgress}
                onSelectDungeon={(dungeon) => {
                  setActiveDungeon(dungeon);
                  setDungeonRoomIndex(0);
                  setShowDungeonSelect(false);
                  // Start first room — Boss hat volle Stats aus bossData
                  const room = dungeon.rooms[0];
                  let firstEnemy;
                  if (room.bossData && room.bossData.moves) {
                    firstEnemy = { ...deepCopy(room.bossData), trainerName: room.trainerName, introText: room.introText };
                    if (room.isLegendaryBoss) setShowLegendaryBoss(room.bossData);
                  } else {
                    const baseEnemy = POKEMON_DATA.find(p => p.id === room.pokeId) || POKEMON_DATA[0];
                    firstEnemy = { ...deepCopy(baseEnemy),
                      hp:  Math.floor(baseEnemy.hp  * room.statMult),
                      atk: Math.floor(baseEnemy.atk * room.statMult),
                      def: Math.floor(baseEnemy.def * room.statMult),
                      trainerName: room.trainerName,
                      introText: room.introText,
                    };
                  }
                  const envMap = { cave: 'cave', forest: 'forest', water: 'water', volcano: 'fire', psychic: 'psychic', dragon: 'dragon', void: 'cave', cosmic: 'psychic', abyss: 'cave', celestial: 'psychic', hell: 'fire' };
                  setBattleEnv(envMap[dungeon.type.id] || 'plains');
                  setStoryEnemy(firstEnemy);
                  setGameMode('story');
                  setPhase(PHASES.PICK);
                }}
                onBack={() => setShowDungeonSelect(false)}
              />
            </motion.div>
          )}

          {/* ── MAP ── */}
          {phase === PHASES.MAP && gameMode === 'story' && (
            <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Pending Reward Modal */}
              <AnimatePresence>
                {pendingReward && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
                      className="bg-gradient-to-br from-yellow-950 to-amber-950 border-2 border-yellow-500/50 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
                      <div className="text-6xl mb-3">🎁</div>
                      <h3 className="text-xl font-black text-yellow-400 mb-2">Versteckter Schatz!</h3>
                      <p className="text-white/70 text-sm mb-4">{pendingReward.text}</p>
                      <div className="flex flex-wrap gap-2 justify-center mb-4">
                        {pendingReward.items?.map(it => {
                          const item = ITEMS.find(i => i.id === it);
                          return item ? (
                            <span key={it} className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-white text-sm font-bold">
                              {item.icon} {item.name}
                            </span>
                          ) : null;
                        })}
                        {pendingReward.coins > 0 && (
                          <span className="px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded-full text-yellow-300 text-sm font-bold">
                            💰 +{pendingReward.coins}
                          </span>
                        )}
                      </div>
                      <Button onClick={() => setPendingReward(null)} className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black rounded-xl">
                        Super, danke!
                      </Button>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {storyProgress.zoneIndex >= STORY_ZONES.length ? (
                // CHAMPION SCREEN — zeigt Post-Game Karte
                <>
                  {/* Champion Banner */}
                  <div className="mb-4 p-4 rounded-2xl border border-yellow-500/40 bg-yellow-500/8 text-center">
                    <div className="text-4xl mb-2">👑</div>
                    <h2 className="text-xl text-yellow-400 font-black">Champion-Modus</h2>
                    <p className="text-white/50 text-xs mt-1">Sevii-Inseln & Johto-Gebiet freigeschaltet! Mewtu & Lugia warten...</p>
                    <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                      {(storyProgress.badges || []).slice(0, 5).map(b => (
                        <span key={b} className="text-[10px] px-2 py-0.5 bg-yellow-500/15 text-yellow-300 rounded-full font-bold border border-yellow-500/30">{b}</span>
                      ))}
                      {(storyProgress.badges || []).length > 5 && <span className="text-[10px] text-yellow-300/50">+{storyProgress.badges.length - 5} mehr</span>}
                    </div>
                  </div>
                  {/* Badges */}
                  <div className="flex gap-1.5 mb-3 flex-wrap">
                    <button onClick={() => setUseWorldMap(true)}
                      className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${useWorldMap ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                      <MapIcon className="w-3.5 h-3.5" /> Post-Game Karte
                    </button>
                    <button onClick={() => { setPhase(PHASES.MENU); setShowDungeonSelect(true); }}
                      className="flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all bg-white/5 text-white/50 hover:bg-purple-500/20 hover:text-purple-300">
                      ⛰️ Dungeons (10+)
                    </button>
                    <Button onClick={() => { const f = { zoneIndex: 0, trainerIndex: 0, badges: [] }; storage.saveStory(f); }}
                      variant="outline" className="border-white/20 text-white rounded-xl text-xs h-8 px-3">
                      Neues Spiel+
                    </Button>
                  </div>
                  <WorldMap
                    storyProgress={storyProgress}
                    exploredNodes={exploredNodes}
                    onNodeSelect={handleMapNodeSelect}
                    onBack={() => setPhase(PHASES.MENU)}
                  />
                </>
              ) : (
                <>
                  {/* Badges */}
                  {storyProgress.badges.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {storyProgress.badges.map(b => (
                        <span key={b} className="text-xs px-2.5 py-1 bg-yellow-500/15 text-yellow-300 rounded-full font-bold border border-yellow-500/40">{b}</span>
                      ))}
                    </div>
                  )}

                  {/* Toggle: WorldMap vs list vs Dungeon */}
                  <div className="flex gap-1.5 mb-3 flex-wrap">
                    <button onClick={() => setUseWorldMap(true)}
                      className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${useWorldMap ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                      <MapIcon className="w-3.5 h-3.5" /> Weltkarte
                    </button>
                    <button onClick={() => setUseWorldMap(false)}
                      className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${!useWorldMap ? 'bg-cyan-700 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                      📋 Routen
                    </button>
                    <button onClick={() => { setPhase(PHASES.MENU); setShowDungeonSelect(true); }}
                      className="flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all bg-white/5 text-white/50 hover:bg-purple-500/20 hover:text-purple-300">
                      ⛰️ Dungeons
                    </button>
                  </div>

                  {useWorldMap ? (
                    <WorldMap
                      storyProgress={storyProgress}
                      exploredNodes={exploredNodes}
                      onNodeSelect={handleMapNodeSelect}
                      onBack={() => setPhase(PHASES.MENU)}
                    />
                  ) : (
                  <div className="space-y-2.5">
                    {STORY_ZONES.map((zone, i) => {
                      const isUnlocked = i <= storyProgress.zoneIndex;
                      const isCurrent  = i === storyProgress.zoneIndex;
                      const isDone     = i < storyProgress.zoneIndex;
                      const env = ENV_STYLES[zone.env] || ENV_STYLES.plains;
                      return (
                        <div key={zone.id} className={`rounded-2xl border transition-all ${isCurrent ? 'border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.15)]' : isDone ? 'border-green-500/30' : 'border-white/5 opacity-50 grayscale'}`}
                          style={{ background: isCurrent ? 'rgba(6,182,212,0.06)' : isDone ? 'rgba(74,222,128,0.04)' : 'rgba(255,255,255,0.03)' }}>
                          <div className="flex items-center gap-3 p-3.5">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${isDone ? 'bg-green-500/20' : isCurrent ? 'bg-cyan-500/20' : 'bg-white/5'}`}>
                              {isDone ? '✅' : isCurrent ? env.emoji : zone.type === 'gym' ? '🏟️' : '🛤️'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className={`font-black text-sm ${isCurrent ? 'text-cyan-300' : isDone ? 'text-green-400' : 'text-white/50'}`}>{zone.name}</h3>
                                {zone.type === 'gym' && <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/15 text-yellow-400 rounded-full font-bold">ARENA</span>}
                              </div>
                              <p className="text-white/40 text-xs truncate">
                                {isDone ? `✓ Abgeschlossen${zone.badge ? ` • ${zone.badge}` : ''}` :
                                 isCurrent && zone.type === 'route' ? `Trainer ${storyProgress.trainerIndex + 1}/${zone.trainers.length}` :
                                 isCurrent ? `Gegner: ${zone.leader}` : 'Gesperrt'}
                              </p>
                            </div>
                            {isCurrent && (
                              <Button onClick={startStoryBattle} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs h-8 px-4 rounded-xl shrink-0">
                                Kämpfen
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* ── PICK ── */}
          {phase === PHASES.PICK && (
            <motion.div key="pick" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {gameMode === 'story' && storyEnemy && (
                <div className="mb-4 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
                  <img src={getSprite(storyEnemy.id)} alt={storyEnemy.name} className="w-12 h-12" style={{ imageRendering: 'pixelated' }} />
                  <div>
                    <p className="text-red-300 text-[10px] font-bold uppercase mb-0.5">Dein Gegner</p>
                    <p className="text-white font-black text-sm">{storyEnemy.trainerName}: "{storyEnemy.introText}"</p>
                  </div>
                </div>
              )}

              {partnerPoke && (
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  onClick={() => pickPokemon(partnerPoke)}
                  className="mb-4 p-3.5 rounded-2xl border border-yellow-500/40 bg-yellow-500/8 flex items-center gap-3 cursor-pointer hover:bg-yellow-500/15 transition-all">
                  <img src={getSprite(partnerPoke.id)} alt={partnerPoke.name} className="w-14 h-14" style={{ imageRendering: 'pixelated' }} />
                  <div className="flex-1">
                    <p className="text-yellow-300 text-[10px] font-bold uppercase mb-0.5">⭐ Dein Partner</p>
                    <p className="text-white font-black">{partnerPoke.name}</p>
                    <TypeBadge type={partnerPoke.type} />
                  </div>
                  <ChevronRight className="text-yellow-400 w-5 h-5" />
                </motion.div>
              )}

              {/* Gefangene Pokémon aus Party zuerst anzeigen */}
              {party.filter(Boolean).length > 0 && (
                <div className="mb-4">
                  <p className="text-green-400 text-[10px] font-black uppercase tracking-widest mb-2">🎒 Deine gefangenen Pokémon (Party)</p>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-1">
                    {party.filter(Boolean).map(poke => {
                      const baseData = POKEMON_DATA.find(p => p.id === poke.id);
                      const basePoke = baseData
                        ? { ...baseData, ...poke, moves: (poke.moves?.length > 0 && poke.moves.every(m => m?.name)) ? poke.moves : baseData.moves }
                        : { ...poke, moves: poke.moves?.length > 0 ? poke.moves : [{ name: 'Tackle', power: 40, type: 'normal', pp: 35 }], hp: poke.hp || 80, atk: poke.atk || 80, def: poke.def || 80, spd: poke.spd || 60 };
                      const lv = partyLevel[poke.id] || 5;
                      return (
                        <motion.button key={poke.id + 'party'} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                          onClick={() => pickPokemon(basePoke)}
                          className="p-2 rounded-xl border border-green-500/40 bg-green-500/10 hover:bg-green-500/20 text-center flex flex-col items-center gap-1 transition-all">
                          <img src={getSprite(poke.id)} alt={poke.name} className="w-12 h-12" style={{ imageRendering: 'pixelated' }} />
                          <span className="text-white font-black text-[10px] truncate w-full">{poke.name}</span>
                          <span className="text-green-400 text-[9px]">Lv.{lv}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white font-black">Wähle dein Pokémon</h2>
                <div className="flex flex-wrap gap-1">
                  <button onClick={() => setFilter('all')} className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${filter === 'all' ? 'bg-white text-black' : 'bg-white/10 text-white/50 hover:bg-white/20'}`}>Alle</button>
                  {allTypes.map(t => (
                    <button key={t} onClick={() => setFilter(t)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold text-white transition-all ${filter === t ? 'ring-2 ring-white/60 scale-105' : 'opacity-60 hover:opacity-100'}`}
                      style={{ backgroundColor: TYPE_COLORS[t] }}>{t}</button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {filteredPokemon.map(poke => {
                  const lv = partyLevel[poke.id] || 5;
                  const xp = partyXP[poke.id] || 0;
                  const evo = checkEvolution(poke.id, lv);
                  const inParty = party.filter(Boolean).find(p => p.id === poke.id);
                  return (
                    <motion.button key={poke.id} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                      onClick={() => pickPokemon(poke)}
                      className={`p-3 rounded-2xl border transition-all text-center flex flex-col items-center gap-1.5 bg-gradient-to-b ${TYPE_BG[poke.type] || 'from-slate-800 to-slate-900'} bg-opacity-30 relative ${inParty ? 'border-green-400/50' : 'border-white/10 hover:border-yellow-400/50'}`}>
                      {evo && <div className="absolute top-1.5 right-1.5 text-[8px] bg-yellow-500/20 text-yellow-300 rounded-full px-1 font-bold border border-yellow-400/30">⬆️</div>}
                      {poke.catchable && <div className="absolute top-1.5 left-1.5 text-[8px]">🔴</div>}
                      {inParty && <div className="absolute bottom-1.5 right-1.5 text-[8px]">🎒</div>}
                      <img src={getSprite(poke.id)} alt={poke.name} className="w-16 h-16 drop-shadow-lg" style={{ imageRendering: 'pixelated' }} />
                      <span className="text-white font-black text-xs">{poke.name}</span>
                      <TypeBadge type={poke.type} size="xs" />
                      <div className="grid grid-cols-3 gap-1 w-full text-[9px] text-white/50 mt-0.5">
                        <span>❤️{poke.hp}</span>
                        <span>⚔️{poke.atk}</span>
                        <span>🛡{poke.def}</span>
                      </div>
                      <div className="w-full mt-1">
                        <XPBar currentXP={xp} level={lv} small />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── BATTLE ── */}
          {phase === PHASES.BATTLE && playerPoke && enemyPoke && (
            <motion.div key="battle" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {/* Dungeon Progress */}
              {activeDungeon && (
                <DungeonProgressBar dungeon={activeDungeon} currentRoom={dungeonRoomIndex} />
              )}

              {/* Legendary Boss visual indicator */}
              {activeDungeon && enemyPoke?.isLegendary && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 p-2.5 rounded-2xl border border-yellow-500/40 bg-yellow-500/8 mb-1">
                  <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-xl">⭐</motion.span>
                  <div>
                    <p className="text-yellow-300 text-[10px] font-black uppercase tracking-wide">LEGENDÄRER DUNGEON-BOSS</p>
                    <p className="text-white/40 text-[9px]">HP: {enemyPoke.hp} • ATK: {enemyPoke.atk} • DEF: {enemyPoke.def} • Etage {activeDungeon.infiniteFloor + 1}</p>
                  </div>
                </motion.div>
              )}

              {/* Arena */}
              <div className={`relative rounded-3xl overflow-hidden border ${activeDungeon?.bossPoke?.isLegendary && enemyPoke?.isLegendary ? 'border-yellow-500/40' : 'border-white/10'} bg-gradient-to-b ${currentEnv.bg}`} style={{ minHeight: 220, boxShadow: activeDungeon?.bossPoke?.isLegendary && enemyPoke?.isLegendary ? '0 0 30px rgba(251,191,36,0.15)' : 'none' }}>
                {/* Sky */}
                <div className={`absolute inset-0 bg-gradient-to-b ${currentEnv.sky} pointer-events-none`} />
                {/* Ground */}
                <div className={`absolute bottom-0 left-0 right-0 h-16 ${currentEnv.ground} rounded-b-3xl`} />
                <div className="absolute bottom-[60px] left-0 right-0 h-px bg-white/10" />

                {/* Battle Effects + Damage */}
                <AttackEffect active={!!attackEffect} moveType={attackEffect?.moveType} direction={attackEffect?.direction} />
                <CritScreenFlash active={critFlash} />
                <EffectivenessFlash effectiveness={effectivenessFlash} />
                {damageNums.map(n => <DamageNumber key={n.id} dmg={n.dmg} x={n.x} y={n.y} type={n.type} />)}

                {/* Enemy */}
                <motion.div className="absolute top-4 right-8 md:right-16" animate={shake === 'enemy' ? { x: [0,-12,12,-8,8,0] } : {}} transition={{ duration: 0.4 }}>
                  {isVoidInfected(enemyPoke) && isS2Active() && (
                    <div className="relative inline-block mb-1"><VoidAura /><span className="relative z-10 text-[9px] px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-300 border border-purple-500/40 font-black">☠️ VOID-INFIZIERT</span></div>
                  )}
                  <div className="bg-black/60 backdrop-blur rounded-xl p-2 mb-2 w-36 md:w-44">
                    <div className="flex items-center justify-between mb-1.5">
                      <div><span className="text-white text-xs font-black">{enemyPoke.name}</span>{enemyStatus && <StatusBadge status={enemyStatus} />}</div>
                      <TypeBadge type={enemyPoke.type} size="xs" />
                    </div>
                    <HPBar current={enemyHP} max={enemyPoke.hp} />
                    <div className="text-white/40 text-[10px] mt-1">{enemyHP}/{enemyPoke.hp} HP</div>
                  </div>
                  <motion.img src={getSprite(enemyPoke.id)} alt={enemyPoke.name} className="w-20 h-20 md:w-24 md:h-24 drop-shadow-2xl mx-auto" style={{ imageRendering: 'pixelated' }}
                    animate={hitFlash === 'enemy' ? { filter: ['brightness(4)','brightness(1)'], scale:[1,0.93,1] } : {}} transition={{ duration: 0.3 }} />
                </motion.div>

                {/* Player */}
                <motion.div className="absolute bottom-4 left-8 md:left-16" animate={shake === 'player' ? { x: [0,12,-12,8,-8,0] } : {}} transition={{ duration: 0.4 }}>
                  <motion.img src={getSprite(playerPoke.id, true)} alt={playerPoke.name} style={{ imageRendering: 'pixelated', width: 88, height: 88 }} className="drop-shadow-2xl"
                    animate={hitFlash === 'player' ? { filter: ['brightness(4)','brightness(1)'], scale:[1,0.93,1] } : {}} transition={{ duration: 0.3 }} />
                  <div className="bg-black/60 backdrop-blur rounded-xl p-2 mt-1 w-36 md:w-44">
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <span className="text-white text-xs font-black">{playerPoke.name}</span>
                        {playerStatus && <StatusBadge status={playerStatus} />}
                      </div>
                      <TypeBadge type={playerPoke.type} size="xs" />
                    </div>
                    <HPBar current={playerHP} max={playerPoke.hp} />
                    <div className="flex justify-between text-[10px] mt-1">
                      <span className="text-white/40">{playerHP}/{playerPoke.hp}</span>
                      {(playerBuffs.atk > 1 || playerBuffs.def > 1) && (
                        <span className="text-green-400">
                          {playerBuffs.atk > 1 ? `⚔️+${Math.floor((playerBuffs.atk - 1) * 100)}% ` : ''}
                          {playerBuffs.def > 1 ? `🛡+${Math.floor((playerBuffs.def - 1) * 100)}%` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Turn counter + XP */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="text-[10px] text-white/30 font-bold">Runde {currentTurn + 1}</span>
                  {comboCount >= 2 && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-orange-500/30 text-orange-300 border border-orange-500/40">
                      🔥 {comboCount}x COMBO!
                    </motion.span>
                  )}
                </div>
                {/* Weather indicator */}
                {weather && WEATHER_TYPES[weather] && (
                  <div className="absolute top-10 left-4 flex items-center gap-1">
                    <span className="text-base">{WEATHER_TYPES[weather].icon}</span>
                    <span className="text-[9px] text-white/50 font-bold">{WEATHER_TYPES[weather].name} ({weatherTurns})</span>
                  </div>
                )}
                {playerPoke && (
                  <div className="absolute top-4 right-4 w-24">
                    <XPBar currentXP={partyXP[playerPoke.id] || 0} level={partyLevel[playerPoke.id] || 5} small />
                  </div>
                )}
              </div>

              {/* Battle Log */}
              <BattleLog messages={log} />

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2.5">
                {playerPoke.moves.map((move, i) => {
                  const eff = getEff(move.type, enemyPoke.type);
                  const ppLeft = movePPs[i] ?? move.pp;
                  const ppPct = ppLeft / move.pp;
                  return (
                    <motion.button key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={() => handleMove(move, i)} disabled={battleLocked || ppLeft <= 0}
                      className={`p-3 rounded-2xl border transition-all text-left ${ppLeft <= 0 ? 'opacity-30 border-white/5 bg-white/3' : eff >= 2 ? 'border-yellow-500/40 bg-yellow-500/8 hover:bg-yellow-500/15' : eff === 0 ? 'border-white/5 bg-white/3 opacity-40' : 'border-white/10 bg-white/5 hover:bg-white/10'} disabled:opacity-40`}>
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="text-white font-bold text-xs leading-tight">{move.name}</span>
                        <TypeBadge type={move.type} size="xs" />
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-white/40">💥 {move.power || '—'}</span>
                        {move.status && <span className="text-purple-300">☠️ {STATUS_EFFECTS[move.status]?.icon}</span>}
                        {eff >= 2 && <span className="text-yellow-400 font-bold">⚡ Sehr eff.</span>}
                        {eff === 0 && <span className="text-white/30">❌ Kein Eff.</span>}
                      </div>
                      {/* PP bar */}
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <div className="flex-1 bg-white/10 rounded-full h-1">
                          <div className="h-1 rounded-full transition-all" style={{ width: `${ppPct * 100}%`, backgroundColor: ppPct > 0.5 ? '#4ade80' : ppPct > 0.2 ? '#facc15' : '#ef4444' }} />
                        </div>
                        <span className="text-[9px] text-white/30 font-bold">{ppLeft}/{move.pp}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Bottom actions */}
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setShowItems(s => !s)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-bold transition-all border border-white/10">
                  <Package className="w-3.5 h-3.5" /> Items {Object.values(inventory).some(v => v > 0) && '●'}
                </button>
                {/* S2: Void-Catcher Button */}
                {isVoidInfected(enemyPoke) && isS2Active() && (
                  <button onClick={() => setShowVoidCatch(s => !s)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${showVoidCatch ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border-purple-500/20'}`}>
                    🌀 Void-Fangen
                  </button>
                )}
                {/* Show catch in arena (wild) AND story wild battles (no trainer) */}
                {!isVoidInfected(enemyPoke) && (gameMode === 'arena' || (gameMode === 'story' && !storyEnemy?.trainerName)) && (
                  <button onClick={() => setShowCatch(s => !s)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${showCatch ? 'bg-red-500/20 border-red-500/40 text-red-300' : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border-white/10'}`}>
                    🔴 Fangen {Object.values(ballInventory).some(v => v > 0) && '●'}
                  </button>
                )}
                <button onClick={reset} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/80 text-xs font-bold transition-all border border-white/10">
                  <RotateCcw className="w-3.5 h-3.5" /> Pokémon wechseln
                </button>
                {gameMode === 'arena' && (
                  <button onClick={() => { setPhase(PHASES.LOSE); storage.saveStreak(0); localStorage.setItem('pkStreak', '0'); }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-red-500/15 text-white/30 hover:text-red-400 text-xs font-bold transition-all border border-white/10">
                    🏃 Fliehen
                  </button>
                )}
              </div>

              {/* S2: Void Catch panel */}
              <AnimatePresence>
                {showVoidCatch && enemyPoke && isVoidInfected(enemyPoke) && (
                  <VoidCatchPanel
                    enemyHP={enemyHP}
                    enemyMaxHP={enemyPoke.hp}
                    onCatch={throwVoidCatcher}
                    onClose={() => setShowVoidCatch(false)}
                  />
                )}
              </AnimatePresence>

              {/* Catch panel */}
              <AnimatePresence>
                {showCatch && enemyPoke && (
                  <div>
                    {enemyStatus && (
                      <div className="mb-1.5 px-3 py-1.5 bg-purple-500/15 border border-purple-500/30 rounded-xl text-purple-300 text-[10px] font-bold">
                        {STATUS_EFFECTS[enemyStatus]?.icon} {STATUS_EFFECTS[enemyStatus]?.name} aktiv → {enemyStatus === 'sleep' || enemyStatus === 'freeze' ? '+100% Fangchance' : '+50% Fangchance'}!
                      </div>
                    )}
                    <CatchPanel
                      pokemon={enemyPoke}
                      enemyHP={enemyHP}
                      enemyMaxHP={enemyPoke.hp}
                      ballInventory={ballInventory}
                      onCatch={throwPokeball}
                      onClose={() => setShowCatch(false)}
                    />
                  </div>
                )}
              </AnimatePresence>

              {/* Items panel */}
              <AnimatePresence>
                {showItems && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    className="bg-black/60 border border-white/10 rounded-2xl p-3">
                    <p className="text-white/60 text-xs font-bold mb-2">Items benutzen:</p>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {ITEMS.map(item => (
                        <button key={item.id} onClick={() => handleItem(item)}
                          disabled={!inventory[item.id] || inventory[item.id] <= 0 || battleLocked}
                          className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-center">
                          <span className="text-lg">{item.icon}</span>
                          <span className="text-[9px] text-white/60 leading-tight">{item.name}</span>
                          <span className="text-[9px] font-bold text-white/40">×{inventory[item.id] || 0}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── WIN ── */}
          {phase === PHASES.WIN && (
            <motion.div key="win" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-8 space-y-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.6 }} className="text-7xl">🏆</motion.div>
              <h2 className="text-3xl font-black text-yellow-400">Sieg!</h2>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
                className="text-3xl font-black text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]">
                +{earnedTokens} Tokens 💰
              </motion.div>

              {/* Battle stats */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
                {[
                  { label: 'Schaden', value: battleStats.dmgDealt, icon: '⚔️', color: 'text-red-400' },
                  { label: 'Kassiert', value: battleStats.dmgTaken, icon: '🛡️', color: 'text-blue-400' },
                  { label: 'Kritisch', value: battleStats.crits, icon: '💥', color: 'text-yellow-400' },
                  { label: 'Sehr eff.', value: battleStats.superEffective, icon: '⚡', color: 'text-purple-400' },
                ].map(s => (
                  <div key={s.label} className="bg-white/5 rounded-xl p-2 border border-white/8">
                    <div className="text-base">{s.icon}</div>
                    <div className={`font-black text-sm ${s.color}`}>{s.value}</div>
                    <div className="text-[8px] text-white/30">{s.label}</div>
                  </div>
                ))}
              </motion.div>

              {gameMode === 'arena' && (
                <p className="text-white/60 text-sm">Siege: <span className="text-yellow-400 font-black">{wins}</span> · Streak: <span className="text-orange-400 font-black">{streak}</span></p>
              )}

              {/* S2: Shard Drop Notification */}
              {s2ShardDrop && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-sm border"
                  style={{ background: s2ShardDrop.type === 'void' ? 'rgba(168,85,247,0.15)' : 'rgba(234,179,8,0.15)', borderColor: s2ShardDrop.type === 'void' ? 'rgba(168,85,247,0.4)' : 'rgba(234,179,8,0.4)', color: s2ShardDrop.type === 'void' ? '#a855f7' : '#eab308' }}>
                  {s2ShardDrop.type === 'void' ? '🟣 Void-Shard' : '🟡 Nova-Shard'} gefunden!
                  <button onClick={() => setS2ShardDrop(null)} className="text-white/30 text-xs ml-1">✕</button>
                </motion.div>
              )}
              {activeDungeon && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold text-sm">
                  {dungeonRoomIndex + 1 >= activeDungeon.totalRooms ? '🏆 Dungeon abgeschlossen!' : `⛰️ Weiter zu Raum ${dungeonRoomIndex + 2}/${activeDungeon.totalRooms}`}
                </div>
              )}
              {gameMode === 'story' && storyProgress.zoneIndex > 0 && STORY_ZONES[storyProgress.zoneIndex - 1]?.badge && STORY_ZONES[storyProgress.zoneIndex - 1].type === 'gym' && (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="my-4">
                  <p className="text-lg font-bold text-white mb-2">🎖️ Orden erhalten!</p>
                  <span className="px-4 py-2 bg-yellow-500/20 text-yellow-300 rounded-full font-bold border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                    {STORY_ZONES[storyProgress.zoneIndex - 1].badge}
                  </span>
                </motion.div>
              )}

              <div className="flex justify-center gap-3 flex-wrap mt-6">
                {gameMode === 'arena' ? (
                  <>
                    <Button onClick={nextBattle} className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black px-6 rounded-xl">
                      <Swords className="w-4 h-4 mr-1.5" /> Nächster Kampf
                    </Button>
                    <Button variant="outline" onClick={reset} className="border-white/20 text-white rounded-xl">
                      <RotateCcw className="w-4 h-4 mr-1.5" /> Pokémon wechseln
                    </Button>
                  </>
                ) : activeDungeon ? (
                  <>
                    {dungeonRoomIndex < activeDungeon.totalRooms ? (
                      <Button onClick={() => setPhase(PHASES.PICK)} className="bg-gradient-to-r from-purple-600 to-violet-600 text-white font-black px-6 rounded-xl">
                        <Swords className="w-4 h-4 mr-1.5" /> Nächster Raum ({dungeonRoomIndex + 1}/{activeDungeon.totalRooms})
                      </Button>
                    ) : (
                      <Button onClick={() => { setActiveDungeon(null); setPhase(PHASES.MAP); }} className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black px-6 rounded-xl">
                        🏆 Dungeon abgeschlossen!
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    {STORY_ZONES[storyProgress.zoneIndex]?.type === 'route' && storyProgress.trainerIndex > 0 ? (
                      <Button onClick={startStoryBattle} className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black px-6 rounded-xl">
                        <Swords className="w-4 h-4 mr-1.5" /> Nächster Trainer
                      </Button>
                    ) : (
                      <Button onClick={() => setPhase(PHASES.MAP)} className="bg-cyan-600 hover:bg-cyan-500 text-white font-black px-6 rounded-xl">
                        <MapIcon className="w-4 h-4 mr-1.5" /> Zur Karte
                      </Button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* ── LOSE ── */}
          {phase === PHASES.LOSE && (
            <motion.div key="lose" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-12 space-y-4">
              <div className="text-7xl">💀</div>
              <h2 className="text-3xl font-black text-red-400">Niederlage!</h2>
              <p className="text-white/50 text-sm">
                {gameMode === 'arena' ? `Dein Streak war ${streak === 0 ? 0 : streak} 🔥` : 'Ruh dich aus und versuche es erneut!'}
              </p>
              <div className="flex justify-center gap-3 flex-wrap mt-6">
                <Button onClick={reset} className="bg-gradient-to-r from-red-600 to-pink-600 text-white font-black px-6 rounded-xl">
                  <RotateCcw className="w-4 h-4 mr-1.5" /> Nochmal
                </Button>
                {gameMode === 'story' && (
                  <Button onClick={() => setPhase(PHASES.MAP)} className="bg-cyan-600 hover:bg-cyan-500 text-white font-black px-6 rounded-xl">
                    <MapIcon className="w-4 h-4 mr-1.5" /> Zur Karte
                  </Button>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}