// ── UPGRADES — Rarer, more impactful, synergy-ready ────────────────────────
// Costs are intentionally high so each purchase feels meaningful.
// Synergy tags enable combo bonuses in NeonDashModuleApply.
export const UPGRADES = [
  // ── Core Upgrades ──
  { id: 'coinMulti',    name: 'Coin Booster',    desc: 'Münzen geben mehr Punkte (+60 pro Lvl)',                icon: '🪙', maxLevel: 4, baseCost: 12000,  costMult: 3.2,  synergy: 'score' },
  { id: 'slowStart',    name: 'Chill Start',      desc: 'Das Spiel startet langsamer (-10% pro Lvl)',           icon: '🐢', maxLevel: 3, baseCost: 22000, costMult: 4.0,  synergy: 'defense' },
  { id: 'smallHitbox', name: 'Nano Hitbox',      desc: 'Kleineres Schiff, leichteres Ausweichen',               icon: '⚡', maxLevel: 3, baseCost: 38000, costMult: 4.5,  synergy: 'agility' },
  { id: 'scoreBoost',  name: 'Score Booster',    desc: 'Alle Punkte +15% pro Level',                           icon: '📈', maxLevel: 4, baseCost: 15000,  costMult: 3.5,  synergy: 'score' },
  { id: 'speedCap',    name: 'Speed Limiter',    desc: 'Maximale Spielgeschwindigkeit begrenzen (-12% pro Lvl)', icon: '🏎️', maxLevel: 3, baseCost: 30000, costMult: 4.0,  synergy: 'defense' },
  { id: 'startShield', name: 'Start Shield',     desc: 'Starte mit einem Schutzschild',                         icon: '🛡️', maxLevel: 3, baseCost: 28000, costMult: 3.8,  synergy: 'defense' },
  { id: 'coinMagnet',  name: 'Magnet Upgrade',   desc: 'Größerer Magnet-Radius (+80px pro Lvl)',               icon: '🧲', maxLevel: 3, baseCost: 18000, costMult: 3.5,  synergy: 'agility' },
  { id: 'powerupBoost',name: 'Power-Up Zeit',    desc: 'Power-Ups halten länger (+35% pro Lvl)',               icon: '⏳', maxLevel: 3, baseCost: 17000, costMult: 3.3,  synergy: 'support' },
  // ── Mechanic Upgrades ──
  { id: 'instantShield',name: 'Sofort-Schild',   desc: 'Aktiviere einen sofortigen Schutzschild (25s CD). Mobile: 🔰. PC: [S]. Lvl 2/3 = schnellerer CD. Synergie: defense-Set reduziert CD um 30%.',
                                                    icon: '🔰', maxLevel: 3, baseCost: 48000, costMult: 4.5, category: 'mechanic', synergy: 'defense' },
  { id: 'dualCannon',  name: 'Doppelkanone',     desc: 'Aktiviert sich nach dem ersten Portal. Lvl 1: Twin. Lvl 2: breiter. Lvl 3: Dreifach-Fächer. Synergie: score-Set gibt +20% Damage.',
                                                    icon: '🔫', maxLevel: 3, baseCost: 55000, costMult: 4.8, category: 'mechanic', synergy: 'score' },
  { id: 'afterburner', name: 'Afterburner',      desc: 'Kurzer Speed-Dash (Invincibility-Frames!). Mobile: 🚀. PC: [SHIFT]. Synergie: agility-Set gibt 2× Dauer.',
                                                    icon: '🚀', maxLevel: 3, baseCost: 42000, costMult: 4.2, category: 'mechanic', synergy: 'agility' },
  { id: 'orbitalMine', name: 'Orbital-Mine',     desc: 'Orbitale Minen zerstören Hindernisse (+1 Mine pro Lvl, max 3). Minen regenerieren nach 12s.',
                                                    icon: '💥', maxLevel: 3, baseCost: 52000, costMult: 4.5, category: 'mechanic', synergy: 'defense' },
  { id: 'ghostMode',   name: 'Geistermodus',     desc: 'Beim ersten Treffer 2.5s unverwundbar & transparent. Lvl 2/3 = länger + Geschwindigkeitsboost. Synergie: agility-Set gibt +0.5s.',
                                                    icon: '👻', maxLevel: 3, baseCost: 65000, costMult: 5.0, category: 'mechanic', synergy: 'agility' },
  { id: 'coinTrail',   name: 'Münzmagnet-Spur',  desc: 'Dein Schiff hinterlässt eine Spur die Münzen anzieht. Synergie: score+agility = Münzen geben Kurze Unverwundbarkeit.',
                                                    icon: '✨', maxLevel: 3, baseCost: 32000, costMult: 3.8, category: 'mechanic', synergy: 'support' },
  { id: 'warpDrive',   name: 'Warp-Antrieb',     desc: 'Teleportiere dich 200px seitlich (i-Frames!). Mobile: 🌀. PC: [W]. 18s CD. Synergie: agility-Set halbiert CD.',
                                                    icon: '🌀', maxLevel: 3, baseCost: 72000, costMult: 5.2, category: 'mechanic', synergy: 'agility' },
  { id: 'bulletSize',  name: 'Schwere Munition', desc: 'Geschosse +35% Trefferbereich pro Lvl. Synergie: score-Set gibt Chance auf Explosive Rounds.',
                                                    icon: '🔹', maxLevel: 4, baseCost: 26000, costMult: 3.5, category: 'mechanic', synergy: 'score' },
  // ── Risk/Reward Upgrade ──
  { id: 'riskyDash',   name: 'Kamikaze-Antrieb', desc: 'Dash durch Hindernisse für 3× Punkte – aber kein Schild-Schutz während des Dashes! Mobile: 🔴. PC: [X]. Lvl erhöht Punkte-Multiplikator.',
                                                    icon: '🔴', maxLevel: 3, baseCost: 80000, costMult: 5.5, category: 'mechanic', synergy: 'score', riskReward: true },
];

// ── SYNERGY SYSTEM ──────────────────────────────────────────────────────────
// If a player has 3+ upgrades with the same synergy tag, they get a set bonus.
export const SYNERGY_BONUSES = {
  score:   { label: '💥 Score Mastery',  desc: '+25% Gesamtpunkte',         scoreMultBonus: 1.25 },
  defense: { label: '🛡️ Iron Fortress',  desc: 'Schild lädt 30% schneller',  shieldCDMult: 0.7 },
  agility: { label: '⚡ Ghost Protocol', desc: '+20% Bewegungsgeschwindigkeit', agilityBonus: 1.2 },
  support: { label: '🧲 Magnet Mastery', desc: 'Münzen +30% Wert',            coinBonus: 1.3 },
};

export const computeSynergyBonus = (upgrades) => {
  const counts = {};
  for (const upg of UPGRADES) {
    if (upgrades[upg.id] > 0 && upg.synergy) {
      counts[upg.synergy] = (counts[upg.synergy] || 0) + 1;
    }
  }
  const active = [];
  for (const [tag, count] of Object.entries(counts)) {
    if (count >= 3 && SYNERGY_BONUSES[tag]) {
      active.push({ tag, ...SYNERGY_BONUSES[tag] });
    }
  }
  return active;
};

export const SHIP_SKINS = [
  { id: 'default',   name: 'Standard',       desc: 'Das klassische Schiff',                            color: '#ffffff', glowColor: '#06b6d4', cost: 0,     emoji: '🚀' },
  { id: 'fire',      name: 'Fire Ship',      desc: 'Ein Schiff in Flammen',                            color: '#f97316', glowColor: '#ef4444', cost: 8000,  emoji: '🔥' },
  { id: 'gold',      name: 'Gold Ship',      desc: 'Glänzendes Goldschiff',                            color: '#fbbf24', glowColor: '#eab308', cost: 12500, emoji: '✨' },
  { id: 'neon',      name: 'Neon Pink',      desc: 'Leuchtendes Neonschiff',                           color: '#ec4899', glowColor: '#a855f7', cost: 10000, emoji: '💜' },
  { id: 'cyber',     name: 'Cyber Green',    desc: 'Matrix-Style Schiff',                              color: '#22c55e', glowColor: '#06b6d4', cost: 10000, emoji: '💚' },
  { id: 'void',      name: 'Void Walker',    desc: 'Aus der Leere beschworen',                         color: '#a855f7', glowColor: '#7c3aed', cost: 15000, emoji: '🌀' },
  { id: 'ice',       name: 'Ice Blade',      desc: 'Gefrorenes Neonschiff',                            color: '#bae6fd', glowColor: '#38bdf8', cost: 13000, emoji: '❄️' },
  { id: 'cosmic',    name: 'Cosmic Rider',   desc: 'Durch das All reisen',                             color: '#818cf8', glowColor: '#3b82f6', cost: 18000, emoji: '🌌' },
  { id: 'shadow',    name: 'Shadow Clone',   desc: 'Dunkles Geisterschiff',                            color: '#374151', glowColor: '#9ca3af', cost: 20000, emoji: '👤' },
  { id: 'lightning', name: 'Lightning',      desc: 'Schnell wie ein Blitz',                            color: '#fde047', glowColor: '#facc15', cost: 16000, emoji: '⚡' },
  { id: 'rainbow',   name: 'Rainbow Dash',   desc: 'Alle Farben auf einmal',                           color: '#f43f5e', glowColor: '#ec4899', cost: 30000, emoji: '🌈' },
  { id: 'echo',      name: 'Echo Dimension', desc: 'Pro Pass Exklusiv – aus einer anderen Dimension',  color: '#a855f7', glowColor: '#06b6d4', cost: 0, emoji: '⬡', exclusive: true, special: true },
  // ── High-Speed Evolution – 5 neue Skins ──
  { id: 'void_specter',  name: 'Void Specter',  desc: '✦ High-Speed Evolution – Neon-Umriss aus dem Nichts. Glitch-Textur.', color: 'rgba(0,0,0,0)', glowColor: '#a855f7', cost: 45000, emoji: '👻', hse: true, legendary: true },
  { id: 'solar_hawk',    name: 'Solar Hawk',    desc: '☀️ High-Speed Evolution – Goldenes Chassis, Solar-Triebwerke.',        color: '#fbbf24', glowColor: '#f97316', cost: 35000, emoji: '🦅', hse: true },
  { id: 'data_ghost',    name: 'Data Ghost',    desc: '💾 High-Speed Evolution – Transparentes Schiff, sichtbare Schaltkreise.', color: '#67e8f9', glowColor: '#06b6d4', cost: 28000, emoji: '💾', hse: true },
  { id: 'cyber_wasp',    name: 'Cyber Wasp',    desc: '🐝 High-Speed Evolution – Gelb-schwarz, aggressiv eckig.',             color: '#fde047', glowColor: '#ca8a04', cost: 22000, emoji: '🐝', hse: true },
  { id: 'neon_phantom',  name: 'Neon Phantom',  desc: '🌑 High-Speed Evolution – Tiefblau, kaum sichtbar im Dunkeln.',        color: '#1e40af', glowColor: '#3b82f6', cost: 26000, emoji: '🌑', hse: true },
  // ── Season 2 Battle Pass Ships ──
  { id: 's2_phantom',  name: 'Phantom Strike',   desc: 'BP S2 Lvl 5 – Battle Pass S2 Exklusiv',  color: '#374151', glowColor: '#9ca3af', cost: 0, emoji: '👤', bpS2: true },
  { id: 's2_hellfire', name: 'Hellfire Mk.II',   desc: 'BP S2 Lvl 40 – Battle Pass S2 Exklusiv', color: '#dc2626', glowColor: '#f97316', cost: 0, emoji: '🔥', bpS2: true },
  { id: 's2_ghost',    name: 'Ghost Protocol',   desc: 'BP S2 Lvl 60 – Battle Pass S2 Exklusiv', color: '#e2e8f0', glowColor: '#a5f3fc', cost: 0, emoji: '👻', bpS2: true },
  { id: 's2_titan',    name: 'Apocalypse Titan', desc: 'BP S2 Lvl 80 – Battle Pass S2 Exklusiv', color: '#7c3aed', glowColor: '#22d3ee', cost: 0, emoji: '🌌', bpS2: true },
  { id: 's2_apex',     name: 'APEX Predator',    desc: 'BP S2 Lvl 100 – Das ultimative Schiff',  color: '#fbbf24', glowColor: '#f59e0b', cost: 0, emoji: '👑', bpS2: true },
  // Shard Shop Exclusive
  { id: 's2_void_titan_v2', name: 'Void Titan V2', desc: 'Shard Shop Exklusiv – Nur durch Omega Fragments craftbar', color: '#7c3aed', glowColor: '#a855f7', cost: 0, emoji: '🌌', shardExclusive: true },
];

// ── HIGH-SPEED EVOLUTION – BOOST EFFECTS ─────────────────────────────────────
// 3 neue Boost-Trails die im NeonDashDrawPlayer gerendert werden können
export const HSE_BOOST_EFFECTS = [
  {
    id: 'stardust',
    name: 'Stardust',
    desc: 'Goldener Partikel-Schweif – Funkeln bleibt kurz auf der Strecke',
    emoji: '✨',
    cost: 18000,
    particleColor: '#fbbf24',
    particleGlow: '#fde047',
    particleSize: 3,
    fadeSpeed: 0.025,
  },
  {
    id: 'system_error',
    name: 'System Error',
    desc: 'Glitch-Animation – Fragmentierter Pixel-Trail in Neonfarben',
    emoji: '💀',
    cost: 22000,
    particleColor: '#ff00ff',
    particleGlow: '#00ffff',
    particleSize: 4,
    fadeSpeed: 0.03,
    glitch: true,
  },
  {
    id: 'ion_wave',
    name: 'Ion Wave',
    desc: 'Plasma-Burst – Elektrische Schockwave beim Boost',
    emoji: '⚡',
    cost: 25000,
    particleColor: '#06b6d4',
    particleGlow: '#67e8f9',
    particleSize: 5,
    fadeSpeed: 0.02,
    shockwave: true,
  },
];

export const POWERUP_TYPES = [
  { id: 'shield',    name: 'Schild',         color: '#3b82f6', glow: '#60a5fa', emoji: '🛡️', duration: 6000 },
  { id: 'magnet',    name: 'Magnet',         color: '#a855f7', glow: '#c084fc', emoji: '🧲', duration: 8000 },
  { id: 'slowmo',    name: 'Zeitlupe',       color: '#06b6d4', glow: '#67e8f9', emoji: '⏱️', duration: 5000 },
  // ── Season 2 Power-Ups ──
  // Chain Lightning replaces nuke — targets 3 nearest obstacles (skill-based arc)
  { id: 'chain_lightning', name: 'Kettenblitz', color: '#fbbf24', glow: '#fde68a', emoji: '⚡', duration: 0, s2: true },
];

export const LEVELS = [
  { id: 1,  name: 'Aufwärmen',     desc: 'Überlebe 25 Sekunden',                      goal: { type: 'survive', target: 25    }, speed: 0.65, types: ['normal'],                                               reward: 300,   color: '#06b6d4', emoji: '🌊' },
  { id: 2,  name: 'Münzjäger',     desc: 'Sammle 8 Münzen',                           goal: { type: 'coins',   target: 8     }, speed: 0.72, types: ['normal'],                                               reward: 400,   color: '#eab308', emoji: '🪙' },
  { id: 3,  name: 'Ausdauer',      desc: 'Überlebe 55 Sekunden',                      goal: { type: 'survive', target: 55    }, speed: 0.82, types: ['normal'],                                               reward: 600,   color: '#22c55e', emoji: '💨' },
  { id: 4,  name: 'Score Jäger',   desc: 'Erreiche 800 Punkte',                       goal: { type: 'score',   target: 800   }, speed: 0.88, types: ['normal'],                                               reward: 750,   color: '#a855f7', emoji: '⭐' },
  { id: 5,  name: 'Wellenchaos',   desc: 'Überlebe 45 Sek mit Wellen & Zickzack',     goal: { type: 'survive', target: 45    }, speed: 0.95, types: ['normal', 'zigzag', 'wave'],                             reward: 950,   color: '#f97316', emoji: '⚡' },
  { id: 6,  name: 'Münzregen',     desc: 'Sammle 20 Münzen (Wellen & Zickzack)',      goal: { type: 'coins',   target: 20    }, speed: 1.00, types: ['normal', 'zigzag', 'wave'],                             reward: 1100,  color: '#ec4899', emoji: '💰' },
  { id: 7,  name: 'Abpraller',     desc: 'Überlebe 55 Sek mit Bouncern & Wellen',     goal: { type: 'survive', target: 55    }, speed: 1.10, types: ['normal', 'bounce', 'wave'],                             reward: 1400,  color: '#ef4444', emoji: '🏀' },
  { id: 8,  name: 'Speed Demon',   desc: 'Erreiche 2.200 Punkte – alle Typen',        goal: { type: 'score',   target: 2200  }, speed: 1.20, types: ['normal', 'zigzag', 'bounce', 'wave'],                   reward: 1800,  color: '#06b6d4', emoji: '🚀' },
  { id: 9,  name: 'Chaos',         desc: 'Überlebe 50 Sek im Vollchaos',              goal: { type: 'survive', target: 50    }, speed: 1.32, types: ['normal', 'zigzag', 'bounce', 'rotating', 'wave'],       reward: 2400,  color: '#7c3aed', emoji: '🌀' },
  { id: 10, name: 'Meister',       desc: 'Erreiche 4.500 Punkte im Vollchaos',        goal: { type: 'score',   target: 4500  }, speed: 1.50, types: ['normal', 'zigzag', 'bounce', 'rotating', 'wave'],       reward: 3200,  color: '#fbbf24', emoji: '👑' },
  { id: 11, name: 'Laserinferno',  desc: 'Überlebe 80 Sek – Laser aktiv!',            goal: { type: 'survive', target: 80    }, speed: 1.65, types: ['normal', 'zigzag', 'bounce', 'rotating', 'wave', 'laser'], reward: 4200, color: '#f43f5e', emoji: '🔥' },
  { id: 12, name: 'Münzgott',      desc: 'Sammle 35 Münzen – Laser überall!',         goal: { type: 'coins',   target: 35    }, speed: 1.72, types: ['normal', 'zigzag', 'bounce', 'rotating', 'wave', 'laser'], reward: 4800, color: '#fb923c', emoji: '🏆' },
  { id: 13, name: 'Hyperspeed',    desc: 'Erreiche 9.000 Punkte mit Laser',           goal: { type: 'score',   target: 9000  }, speed: 1.90, types: ['normal', 'zigzag', 'bounce', 'rotating', 'wave', 'laser'], reward: 6500, color: '#22d3ee', emoji: '💫' },
  { id: 14, name: 'Wahnsinnsflug', desc: 'Überlebe 95 Sek – Laser & Vollchaos!',     goal: { type: 'survive', target: 95    }, speed: 2.08, types: ['normal', 'zigzag', 'bounce', 'rotating', 'wave', 'laser'], reward: 8500, color: '#c084fc', emoji: '🌌' },
  { id: 15, name: 'Legende',       desc: 'Erreiche 16.000 Punkte – alles an!',        goal: { type: 'score',   target: 16000 }, speed: 2.35, types: ['normal', 'zigzag', 'bounce', 'rotating', 'wave', 'laser'], reward: 14000, color: '#fbbf24', emoji: '🌟' },
  // ── High-Speed Evolution – 2 neue Strecken ──
  { id: 16, name: 'Cyber-Abyss',  desc: 'Gravitationsumkehr + Glitch-Portale! Überlebe 70 Sek.', goal: { type: 'survive', target: 70 }, speed: 1.85, types: ['normal', 'zigzag', 'wave', 'homing', 'pulsar'], reward: 11000, color: '#a855f7', emoji: '🕳️', hse: true, hseTrack: 'cyber_abyss' },
  { id: 17, name: 'Solar-Grind',  desc: 'Zerbrechliche Plattformen, Solar-Boosts! Erreiche 12.000 Pkt.', goal: { type: 'score', target: 12000 }, speed: 2.10, types: ['normal', 'bounce', 'rotating', 'wave', 'cross'], reward: 13000, color: '#f97316', emoji: '☀️', hse: true, hseTrack: 'solar_grind' },
];