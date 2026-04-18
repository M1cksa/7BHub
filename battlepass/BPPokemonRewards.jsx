import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Lock, Gift, Zap, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

// ── Exklusive BP S2 Pokémon Meilensteine ──────────────────────────────────
// Pokédex-ID → echtes Pokémon (Sprite von PokeAPI)
// Level 80–100: mythisch / gottgleich (Arceus-Ästhetik)
export const BP_POKEMON_MILESTONES = [
  {
    level: 10,
    pokemon: {
      id: 151,
      name: 'Mew',
      type: 'psychic',
      rarity: 'epic',
      isShiny: false,
      startLevel: 10,
      ot: 'Neon Apocalypse',
      description: 'Das mystische Mew. Ein seltener Begleiter für den Start.',
      color: '#f472b6',
      glow: 'rgba(244,114,182,0.4)',
      bg: 'rgba(244,114,182,0.08)',
      border: 'rgba(244,114,182,0.35)',
      badge: 'EPIC',
      badgeStyle: 'bg-pink-500/15 border-pink-400/40 text-pink-300',
    }
  },
  {
    level: 20,
    pokemon: {
      id: 251,
      name: 'Celebi',
      type: 'grass',
      rarity: 'epic',
      isShiny: false,
      startLevel: 20,
      ot: 'Neon Apocalypse',
      description: 'Der Zeitreisende Celebi. Bringt Leben in die Apokalypse.',
      color: '#4ade80',
      glow: 'rgba(74,222,128,0.4)',
      bg: 'rgba(74,222,128,0.08)',
      border: 'rgba(74,222,128,0.35)',
      badge: 'EPIC',
      badgeStyle: 'bg-green-500/15 border-green-400/40 text-green-300',
    }
  },
  {
    level: 30,
    pokemon: {
      id: 385,
      name: 'Jirachi',
      type: 'steel',
      rarity: 'epic',
      isShiny: true,
      startLevel: 30,
      ot: 'Neon Apocalypse',
      description: '✨ SHINY Jirachi — Erfüllt dir jeden Wunsch.',
      color: '#fbbf24',
      glow: 'rgba(251,191,36,0.4)',
      bg: 'rgba(251,191,36,0.08)',
      border: 'rgba(251,191,36,0.35)',
      badge: '✨ SHINY',
      badgeStyle: 'bg-yellow-500/15 border-yellow-400/40 text-yellow-300',
    }
  },
  {
    level: 40,
    pokemon: {
      id: 491,
      name: 'Darkrai',
      type: 'dark',
      rarity: 'legendary',
      isShiny: false,
      startLevel: 40,
      ot: 'Neon Apocalypse',
      description: 'Der Meister der Albträume. Perfekt für die Dunkelheit.',
      color: '#a855f7',
      glow: 'rgba(168,85,247,0.4)',
      bg: 'rgba(168,85,247,0.08)',
      border: 'rgba(168,85,247,0.35)',
      badge: 'LEGENDARY',
      badgeStyle: 'bg-purple-500/15 border-purple-400/40 text-purple-300',
    }
  },
  {
    level: 50,
    pokemon: {
      id: 249,           // Lugia
      name: 'Lugia',
      type: 'psychic',
      rarity: 'legendary',
      isShiny: false,
      startLevel: 50,
      ot: 'Neon Apocalypse',
      description: 'Legendärer Hüter der Meere. Nur im Season 2 Pass erhältlich.',
      color: '#818cf8',
      glow: 'rgba(129,140,248,0.4)',
      bg: 'rgba(129,140,248,0.08)',
      border: 'rgba(129,140,248,0.35)',
      badge: 'LEGENDARY',
      badgeStyle: 'bg-indigo-500/15 border-indigo-400/40 text-indigo-300',
    }
  },
  {
    level: 60,
    pokemon: {
      id: 250,           // Ho-Oh
      name: 'Ho-Oh',
      type: 'fire',
      rarity: 'legendary',
      isShiny: true,     // Shiny!
      startLevel: 60,
      ot: 'Neon Apocalypse',
      description: '✨ SHINY Ho-Oh — der Phönix der Apokalypse. Einmalig.',
      color: '#f97316',
      glow: 'rgba(249,115,22,0.5)',
      bg: 'rgba(249,115,22,0.08)',
      border: 'rgba(249,115,22,0.4)',
      badge: '✨ SHINY',
      badgeStyle: 'bg-orange-500/15 border-orange-400/40 text-orange-300',
    }
  },
  {
    level: 70,
    pokemon: {
      id: 384,           // Rayquaza
      name: 'Rayquaza',
      type: 'dragon',
      rarity: 'legendary',
      isShiny: false,
      startLevel: 70,
      ot: 'Neon Apocalypse',
      description: 'Drache des Himmels. Schützt die Welt vor Apokalypsen.',
      color: '#22c55e',
      glow: 'rgba(34,197,94,0.45)',
      bg: 'rgba(34,197,94,0.08)',
      border: 'rgba(34,197,94,0.35)',
      badge: 'LEGENDARY',
      badgeStyle: 'bg-green-500/15 border-green-400/40 text-green-300',
    }
  },
  {
    level: 80,
    pokemon: {
      id: 483,           // Dialga
      name: 'Dialga',
      type: 'steel',
      rarity: 'mythic',
      isShiny: true,     // Shiny!
      startLevel: 80,
      ot: 'Neon Apocalypse',
      description: '✨ SHINY Dialga — Herrscher über die Zeit. Göttliche Macht.',
      color: '#60a5fa',
      glow: 'rgba(96,165,250,0.55)',
      bg: 'rgba(96,165,250,0.1)',
      border: 'rgba(96,165,250,0.45)',
      badge: '✨ MYTHIC',
      badgeStyle: 'bg-blue-500/20 border-blue-400/50 text-blue-200',
    }
  },
  {
    level: 90,
    pokemon: {
      id: 484,           // Palkia
      name: 'Palkia',
      type: 'water',
      rarity: 'mythic',
      isShiny: true,
      startLevel: 90,
      ot: 'Neon Apocalypse',
      description: '✨ SHINY Palkia — Herrscher des Raums. Gottgleiche Entität.',
      color: '#e879f9',
      glow: 'rgba(232,121,249,0.55)',
      bg: 'rgba(232,121,249,0.1)',
      border: 'rgba(232,121,249,0.45)',
      badge: '✨ MYTHIC',
      badgeStyle: 'bg-fuchsia-500/20 border-fuchsia-400/50 text-fuchsia-200',
    }
  },
  {
    level: 100,
    pokemon: {
      id: 493,           // Arceus — der absolute Gott
      name: 'Arceus',
      type: 'normal',
      rarity: 'god',
      isShiny: true,
      startLevel: 100,
      ot: 'Neon Apocalypse',
      description: '✨ SHINY Arceus — der Ursprung allen Lebens. Das absolute Endspiel.',
      color: '#fbbf24',
      glow: 'rgba(251,191,36,0.7)',
      bg: 'rgba(251,191,36,0.12)',
      border: 'rgba(251,191,36,0.6)',
      badge: '👑 GOD TIER',
      badgeStyle: 'bg-yellow-500/25 border-yellow-300/60 text-yellow-200',
    }
  },
];

// ── Sprite URL Helper ──────────────────────────────────────────────────────
function getSpriteUrl(id, isShiny) {
  const base = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
  return isShiny ? `${base}/shiny/${id}.png` : `${base}/${id}.png`;
}

// ── addRewardPokemonToParty ────────────────────────────────────────────────
// Fügt das geclaimte Pokémon zur Party hinzu — oder zur Box, falls Party voll (6/6).
async function addRewardPokemonToParty(user, pokemon) {
  const sp = user.pokemon_story_progress || {};
  const party = sp.party || [];
  const box = sp.box || [];
  const levels = sp.pokemon_levels || {};
  const xp = sp.pokemon_xp || {};
  const activeMon = sp.active_pokemon || null;

  // Prüfe ob bereits vorhanden (verhindere Duplikate)
  const alreadyInParty = party.some(p => p.id === pokemon.id && p.ot === pokemon.ot);
  const alreadyInBox = box.some(p => p.id === pokemon.id && p.ot === pokemon.ot);
  if (alreadyInParty || alreadyInBox) return null; // bereits owned

  // Battle-Stats und Moves für BP-Pokémon (damit sie im Kampf einsetzbar sind)
  const BP_BATTLE_STATS = {
    151: { hp: 100, atk: 100, def: 100, spd: 100, moves: [{ name: 'Psychokinese', power: 90, type: 'psychic', pp: 10 }, { name: 'Aurasphäre', power: 80, type: 'fighting', pp: 20 }, { name: 'Eisstrahl', power: 90, type: 'ice', pp: 10 }, { name: 'Spukball', power: 80, type: 'ghost', pp: 15 }] },
    251: { hp: 100, atk: 100, def: 100, spd: 100, moves: [{ name: 'Blättersturm', power: 130, type: 'grass', pp: 5 }, { name: 'Psychokinese', power: 90, type: 'psychic', pp: 10 }, { name: 'Zauberblatt', power: 60, type: 'grass', pp: 20 }, { name: 'Antik-Kraft', power: 60, type: 'rock', pp: 5 }] },
    385: { hp: 100, atk: 100, def: 100, spd: 100, moves: [{ name: 'Kismetwunsch', power: 140, type: 'steel', pp: 5 }, { name: 'Psychokinese', power: 90, type: 'psychic', pp: 10 }, { name: 'Lichtkanone', power: 80, type: 'steel', pp: 10 }, { name: 'Zauberschein', power: 80, type: 'fairy', pp: 10 }] },
    491: { hp: 70, atk: 135, def: 90, spd: 125, moves: [{ name: 'Finsteraura', power: 80, type: 'dark', pp: 15 }, { name: 'Traumfresser', power: 100, type: 'ghost', pp: 15 }, { name: 'Eisstrahl', power: 90, type: 'ice', pp: 10 }, { name: 'Schlammbombe', power: 90, type: 'poison', pp: 10 }] },
    249: { hp: 160, atk: 110, def: 130, spd: 110, moves: [{ name: 'Aeroblast', power: 100, type: 'flying', pp: 5 }, { name: 'Psychokinese', power: 90, type: 'psychic', pp: 10 }, { name: 'Eisstrahl', power: 90, type: 'ice', pp: 10, status: 'freeze', statusChance: 0.1 }, { name: 'Donnerschlag', power: 65, type: 'electric', pp: 20 }] },
    250: { hp: 155, atk: 130, def: 120, spd: 90,  moves: [{ name: 'Heiliges Feuer', power: 100, type: 'fire', pp: 5, status: 'burn', statusChance: 0.5 }, { name: 'Feuerssturm', power: 110, type: 'fire', pp: 5 }, { name: 'Windscherung', power: 60, type: 'flying', pp: 35 }, { name: 'Morgengrauen', power: 85, type: 'fairy', pp: 10 }] },
    384: { hp: 150, atk: 150, def: 130, spd: 95,  moves: [{ name: 'Drako-Meteor', power: 130, type: 'dragon', pp: 5 }, { name: 'Feuerssturm', power: 110, type: 'fire', pp: 5 }, { name: 'Donner', power: 90, type: 'electric', pp: 10 }, { name: 'Luftschnitt', power: 75, type: 'flying', pp: 20 }] },
    483: { hp: 155, atk: 140, def: 135, spd: 90,  moves: [{ name: 'Roar of Time', power: 150, type: 'dragon', pp: 5 }, { name: 'Klingensturm', power: 80, type: 'steel', pp: 20 }, { name: 'Erdkraft', power: 90, type: 'ground', pp: 10 }, { name: 'Eisstrahl', power: 90, type: 'ice', pp: 10 }] },
    484: { hp: 145, atk: 130, def: 110, spd: 100, moves: [{ name: 'Spacial Rend', power: 100, type: 'dragon', pp: 5 }, { name: 'Nassschweif', power: 90, type: 'water', pp: 10 }, { name: 'Drachen-Puls', power: 85, type: 'dragon', pp: 10 }, { name: 'Feuerssturm', power: 110, type: 'fire', pp: 5 }] },
    493: { hp: 170, atk: 140, def: 140, spd: 120, moves: [{ name: 'Urteilsschlag', power: 100, type: 'normal', pp: 10 }, { name: 'Psychokinese', power: 90, type: 'psychic', pp: 10 }, { name: 'Feuerssturm', power: 110, type: 'fire', pp: 5 }, { name: 'Hyper-Strahl', power: 150, type: 'normal', pp: 5 }] },
  };
  const stats = BP_BATTLE_STATS[pokemon.id] || { hp: 130, atk: 120, def: 110, spd: 90, moves: [{ name: 'Tackle', power: 40, type: 'normal', pp: 35 }, { name: 'Psychokinese', power: 90, type: 'psychic', pp: 10 }] };

  const newMon = {
    id: pokemon.id,
    name: pokemon.name,
    type: pokemon.type,
    isShiny: pokemon.isShiny || false,
    ot: pokemon.ot,
    obtained: 'battle_pass_s2',
    catchable: false,
    hp: stats.hp,
    atk: stats.atk,
    def: stats.def,
    spd: stats.spd,
    moves: stats.moves,
  };

  // Setze Start-Level & XP
  levels[pokemon.id] = pokemon.startLevel || 5;
  xp[pokemon.id] = 0;

  // BP-Pokémon in die Party, wenn Platz ist, sonst in die Box
  let newParty = [...party];
  let newBox = [...box];
  let destination;

  if (party.length < 6) {
    newParty.push(newMon);
    destination = 'party';
  } else {
    newBox.push(newMon);
    destination = 'box';
  }

  const updates = {
    pokemon_story_progress: {
      ...sp,
      party: newParty,
      box: newBox,
      pokemon_levels: levels,
      pokemon_xp: xp,
    }
  };

  const updated = await base44.entities.AppUser.update(user.id, updates);
  localStorage.setItem('app_user', JSON.stringify(updated));

  // Lokalen Game-Storage synchronisieren
  const localParty = (() => { try { return JSON.parse(localStorage.getItem('pkParty')) || []; } catch { return []; } })();
  const localBox = (() => { try { return JSON.parse(localStorage.getItem('pkBox')) || []; } catch { return []; } })();
  const localLevels = (() => { try { return JSON.parse(localStorage.getItem('pkPartyLevel')) || {}; } catch { return {}; } })();
  const localXP = (() => { try { return JSON.parse(localStorage.getItem('pkPartyXP')) || {}; } catch { return {}; } })();

  localLevels[pokemon.id] = pokemon.startLevel || 5;
  localXP[pokemon.id] = 0;

  if (destination === 'party') {
    localStorage.setItem('pkParty', JSON.stringify([...localParty.filter(p => p && p.id !== pokemon.id), newMon]));
  } else {
    localStorage.setItem('pkBox', JSON.stringify([...localBox.filter(p => p && p.id !== pokemon.id), newMon]));
  }
  localStorage.setItem('pkPartyLevel', JSON.stringify(localLevels));
  localStorage.setItem('pkPartyXP', JSON.stringify(localXP));

  window.dispatchEvent(new Event('user-updated'));

  return { updated, destination };
}

// ── Progress Bar ───────────────────────────────────────────────────────────
function MilestoneProgressBar({ currentLevel }) {
  const levels = BP_POKEMON_MILESTONES.map(m => m.level);
  const maxLevel = levels[levels.length - 1];
  const pct = Math.min((currentLevel / maxLevel) * 100, 100);

  return (
    <div className="relative mb-8">
      {/* Track */}
      <div className="h-2 rounded-full bg-white/[0.06] relative overflow-visible">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #6366f1, #a855f7, #f97316, #22c55e, #60a5fa, #e879f9, #fbbf24)' }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        {/* Milestone dots */}
        {BP_POKEMON_MILESTONES.map(({ level, pokemon }) => {
          const dotPct = (level / maxLevel) * 100;
          const reached = currentLevel >= level;
          return (
            <div key={level}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${dotPct}%` }}>
              <div className="w-4 h-4 rounded-full border-2 transition-all"
                style={{
                  background: reached ? pokemon.color : 'rgba(0,0,0,0.8)',
                  borderColor: reached ? pokemon.color : 'rgba(255,255,255,0.2)',
                  boxShadow: reached ? `0 0 10px ${pokemon.glow}` : 'none',
                }} />
              <span className="text-[8px] text-white/40 mt-1 font-bold whitespace-nowrap">Lv.{level}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Single Pokémon Milestone Card ──────────────────────────────────────────
function PokemonMilestoneCard({ milestone, currentLevel, user, onClaim }) {
  const { level, pokemon } = milestone;
  const reached = currentLevel >= level;
  const sp = user.pokemon_story_progress || {};
  const bpPokemon = sp.bp_claimed_pokemon || [];
  const claimed = bpPokemon.includes(`bp_${pokemon.id}_${level}`);
  const canClaim = reached && !claimed;
  const isGod = pokemon.rarity === 'god';

  return (
    <motion.div
      whileHover={canClaim ? { scale: 1.03, y: -4 } : {}}
      className="relative rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: claimed ? 'rgba(255,255,255,0.02)' : canClaim ? pokemon.bg : 'rgba(255,255,255,0.02)',
        border: `1px solid ${claimed ? 'rgba(255,255,255,0.07)' : canClaim ? pokemon.border : !reached ? 'rgba(255,255,255,0.06)' : pokemon.border}`,
        boxShadow: canClaim ? `0 0 30px ${pokemon.glow}, inset 0 0 20px ${pokemon.bg}` : 'none',
        opacity: !reached && !claimed ? 0.5 : 1,
      }}
    >
      {/* God Tier animated border */}
      {isGod && canClaim && (
        <motion.div className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{ background: 'conic-gradient(from 0deg, rgba(251,191,36,0.4), rgba(236,72,153,0.3), rgba(251,191,36,0.4))' }}
          animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} />
      )}

      {/* Level badge */}
      <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[9px] font-black border"
        style={{ background: 'rgba(0,0,0,0.6)', borderColor: pokemon.border, color: pokemon.color }}>
        Level {level}
      </div>

      {/* Rarity badge */}
      <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-black border ${pokemon.badgeStyle}`}>
        {pokemon.badge}
      </div>

      {/* Sprite area */}
      <div className="relative flex items-center justify-center pt-10 pb-4"
        style={{ background: `radial-gradient(ellipse at center, ${pokemon.bg} 0%, transparent 70%)` }}>
        {/* Glow ring */}
        {canClaim && (
          <motion.div className="absolute w-24 h-24 rounded-full"
            style={{ background: `radial-gradient(circle, ${pokemon.glow} 0%, transparent 70%)` }}
            animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity }} />
        )}
        <img
          src={getSpriteUrl(pokemon.id, pokemon.isShiny)}
          alt={pokemon.name}
          className="relative z-10 drop-shadow-lg"
          style={{
            width: isGod ? 100 : 84,
            height: isGod ? 100 : 84,
            imageRendering: 'pixelated',
            filter: canClaim ? `drop-shadow(0 0 12px ${pokemon.color})` : !reached ? 'grayscale(1) brightness(0.4)' : 'none',
          }}
        />
        {/* Lock overlay */}
        {!reached && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Lock className="w-8 h-8 text-white/20" />
          </div>
        )}
        {/* Claimed check */}
        {claimed && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-t-2xl">
            <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-400/40 flex items-center justify-center">
              <Check className="w-5 h-5 text-green-400" />
            </div>
          </div>
        )}
        {/* Shiny sparkles */}
        {pokemon.isShiny && reached && !claimed && (
          <>
            {[...Array(4)].map((_, i) => (
              <motion.div key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{ background: pokemon.color, left: `${20 + i * 20}%`, top: `${15 + (i % 2) * 60}%` }}
                animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.35 }} />
            ))}
          </>
        )}
      </div>

      {/* Info */}
      <div className="px-4 pb-4 flex flex-col gap-2 flex-1">
        <div>
          <div className="font-black text-white text-sm">{pokemon.isShiny && '✨ '}{pokemon.name}</div>
          <div className="text-[10px] text-white/40 leading-relaxed mt-0.5">{pokemon.description}</div>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-white/30">
          <span className="px-1.5 py-0.5 rounded font-bold"
            style={{ background: `${pokemon.color}20`, color: pokemon.color }}>
            Lv.{pokemon.startLevel}
          </span>
          <span>OT: {pokemon.ot}</span>
          {pokemon.isShiny && <span style={{ color: pokemon.color }}>★ Shiny</span>}
        </div>

        {/* Claim button */}
        <motion.button
          onClick={() => canClaim && onClaim(milestone)}
          whileTap={canClaim ? { scale: 0.95 } : {}}
          disabled={!canClaim}
          className="w-full py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 mt-auto transition-all"
          style={{
            background: claimed ? 'rgba(34,197,94,0.08)' : canClaim
              ? isGod
                ? 'linear-gradient(135deg, rgba(251,191,36,0.25), rgba(236,72,153,0.2))'
                : `linear-gradient(135deg, ${pokemon.bg}, rgba(255,255,255,0.05))`
              : 'rgba(255,255,255,0.03)',
            border: `1px solid ${claimed ? 'rgba(34,197,94,0.3)' : canClaim ? pokemon.border : 'rgba(255,255,255,0.06)'}`,
            color: claimed ? '#4ade80' : canClaim ? pokemon.color : 'rgba(255,255,255,0.2)',
            boxShadow: canClaim ? `0 0 15px ${pokemon.glow}` : 'none',
            cursor: canClaim ? 'pointer' : 'default',
          }}>
          {claimed ? <><Check className="w-3.5 h-3.5" /> Im Team</> :
           canClaim ? <><Gift className="w-3.5 h-3.5" /> Beanspruchen</> :
           !reached ? <><Lock className="w-3 h-3" /> Level {level} benötigt</> :
           <><Check className="w-3.5 h-3.5" /> Erhalten</>}
        </motion.button>
      </div>

      {/* Pulse ring when claimable */}
      {canClaim && (
        <motion.div className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ border: `1.5px solid ${pokemon.color}` }}
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }} />
      )}
    </motion.div>
  );
}

// ── Claim Success Modal ────────────────────────────────────────────────────
function ClaimSuccessModal({ pokemon, destination, onClose }) {
  if (!pokemon) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1100] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)' }}
      onClick={onClose}>
      <motion.div
        initial={{ scale: 0.5, rotate: -8 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 1.1, opacity: 0 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="relative flex flex-col items-center p-8 max-w-xs w-full mx-4 rounded-3xl text-center"
        style={{
          background: `linear-gradient(135deg, rgba(0,0,0,0.9), ${pokemon.bg})`,
          border: `1px solid ${pokemon.border}`,
          boxShadow: `0 0 60px ${pokemon.glow}`,
        }}
        onClick={e => e.stopPropagation()}>

        {/* Rotating glow ring */}
        <motion.div className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{ background: `conic-gradient(from 0deg, ${pokemon.glow}, transparent, ${pokemon.glow})` }}
          animate={{ rotate: 360 }} transition={{ duration: 5, repeat: Infinity, ease: 'linear' }} />

        {/* Sprite */}
        <motion.img
          src={getSpriteUrl(pokemon.id, pokemon.isShiny)}
          alt={pokemon.name}
          className="relative z-10 mb-4"
          style={{ width: 100, height: 100, imageRendering: 'pixelated', filter: `drop-shadow(0 0 20px ${pokemon.color})` }}
          animate={{ y: [-8, 8, -8], rotate: [-3, 3, -3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        <div className="relative z-10">
          <div className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: pokemon.color }}>
            {pokemon.isShiny ? '✨ Shiny Pokémon erhalten!' : 'Pokémon erhalten!'}
          </div>
          <div className="text-2xl font-black text-white mb-1">{pokemon.name}</div>
          <div className="text-xs text-white/40 mb-1">{pokemon.description}</div>
          <div className="text-xs font-bold mb-4"
            style={{ color: destination === 'box' ? '#60a5fa' : '#4ade80' }}>
            {destination === 'box' ? '📦 Party war voll → In Box verschoben' : '🎒 Deiner Party hinzugefügt!'}
          </div>

          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-black transition-all"
            style={{ background: `linear-gradient(135deg, ${pokemon.color}, ${pokemon.glow})`, color: '#000' }}>
            Weiter ✨
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Export ────────────────────────────────────────────────────────────
export default function BPPokemonRewards({ user, setUser }) {
  const [claiming, setClaiming] = useState(false);
  const [successData, setSuccessData] = useState(null); // { pokemon, destination }

  const currentLevel = user?.bp_level || 1;
  const claimedPokemon = user?.pokemon_story_progress?.bp_claimed_pokemon || [];
  const claimable = BP_POKEMON_MILESTONES.filter(m => currentLevel >= m.level && !claimedPokemon.includes(`bp_${m.pokemon.id}_${m.level}`)).length;

  const handleClaim = async (milestone) => {
    const { level, pokemon } = milestone;
    const claimKey = `bp_${pokemon.id}_${level}`;

    setClaiming(true);
    try {
      const result = await addRewardPokemonToParty(user, pokemon);
      if (!result) { toast.error('Bereits erhalten!'); setClaiming(false); return; }

      // Markiere als geclaimed
      const sp = result.updated.pokemon_story_progress || {};
      const bpClaimed = sp.bp_claimed_pokemon || [];
      const finalUpdates = {
        pokemon_story_progress: { ...sp, bp_claimed_pokemon: [...bpClaimed, claimKey] }
      };
      const final = await base44.entities.AppUser.update(user.id, finalUpdates);
      localStorage.setItem('app_user', JSON.stringify(final));
      setUser(final);
      window.dispatchEvent(new Event('user-updated'));

      // Confetti!
      confetti({ particleCount: pokemon.rarity === 'god' ? 300 : 180, spread: 120, origin: { y: 0.5 }, colors: [pokemon.color, '#ffffff', '#fbbf24'] });

      setSuccessData({ pokemon, destination: result.destination });
    } catch (e) {
      toast.error('Fehler beim Beanspruchen.');
    }
    setClaiming(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-black"
              style={{ background: 'linear-gradient(90deg, #fbbf24, #e879f9, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              🎴 Pokémon-Belohnungen
            </h2>
            {claimable > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-yellow-500/20 border border-yellow-400/40 text-yellow-300 animate-pulse">
                {claimable} verfügbar
              </span>
            )}
          </div>
          <p className="text-white/35 text-sm">Exklusive legendäre & mythische Pokémon — nur im Season 2 Battle Pass.</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-xs text-white/30 font-bold uppercase tracking-wider">BP Level</div>
          <div className="text-2xl font-black" style={{ color: '#fb923c' }}>{currentLevel}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <MilestoneProgressBar currentLevel={currentLevel} />

      {/* Info Box */}
      <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl"
        style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)' }}>
        <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-white/40 leading-relaxed">
          Diese Pokémon werden direkt deiner Party hinzugefügt — ist sie voll (6/6), landen sie automatisch in der Box.
          Alle Pokémon kommen mit korrektem Original-Trainer-Tag <strong className="text-white/60">„Neon Apocalypse"</strong>.
          Level 80+ Pokémon sind gottgleiche Wesen (Mythic/God Tier).
        </p>
      </div>

      {/* Milestone Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {BP_POKEMON_MILESTONES.map((milestone, i) => (
          <motion.div key={milestone.level}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}>
            <PokemonMilestoneCard
              milestone={milestone}
              currentLevel={currentLevel}
              user={user}
              onClaim={handleClaim}
            />
          </motion.div>
        ))}
      </div>

      {/* Footer note */}
      <div className="mt-8 text-center">
        <p className="text-xs text-white/20">
          ⭐ Shiny-Pokémon sind als solche dauerhaft markiert und unterscheiden sich im Spiel von normalen Exemplaren.
        </p>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {successData && (
          <ClaimSuccessModal
            pokemon={successData.pokemon}
            destination={successData.destination}
            onClose={() => setSuccessData(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}