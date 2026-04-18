// ─── Ship Parts System ────────────────────────────────────────────────────────
// Modulare Schiffsteile: kosmetisch + leichte Spieleinflüsse
// Jedes Teil hat: id, name, emoji, desc, slot, cost, color, visual effect, stat bonus

export const SHIP_SLOTS = ['cockpit', 'wing', 'engine', 'weapon'];

export const SLOT_LABELS = {
  cockpit: '🪖 Cockpit',
  wing:    '🪶 Flügel',
  engine:  '🔥 Triebwerk',
  weapon:  '🔫 Waffe',
};

export const SHIP_PARTS = [
  // ── Cockpit ──────────────────────────────────────────────────────────────────
  { id: 'cockpit_basic',    slot: 'cockpit', name: 'Standard-Cockpit',   desc: 'Solides Standardcockpit ohne Bonus.', emoji: '🪖', cost: 0,      color: '#94a3b8', glowColor: '#64748b', bonuses: {} },
  { id: 'cockpit_sensor',   slot: 'cockpit', name: 'Sensor-Cockpit',     desc: 'Verbesserte Sensoren: Münzen leuchten weiter auf.', emoji: '🔭', cost: 5000,  color: '#06b6d4', glowColor: '#22d3ee', bonuses: { coinRadius: 40 } },
  { id: 'cockpit_shield',   slot: 'cockpit', name: 'Schild-Cockpit',     desc: 'Startet jede Runde mit einem Mini-Schild.', emoji: '🛡️', cost: 12000, color: '#3b82f6', glowColor: '#60a5fa', bonuses: { startShield: true } },
  { id: 'cockpit_ghost',    slot: 'cockpit', name: 'Phantom-Cockpit',    desc: 'Beim ersten Treffer 1,5s unverwundbar.', emoji: '👻', cost: 20000, color: '#a855f7', glowColor: '#c084fc', bonuses: { ghostOnHit: 1.5 } },
  { id: 'cockpit_gold',     slot: 'cockpit', name: 'Gold-Cockpit',       desc: '+10% Münzwert auf jede eingesammelte Münze.', emoji: '👑', cost: 25000, color: '#fbbf24', glowColor: '#fde68a', bonuses: { coinBonus: 0.1 } },

  // ── Flügel ───────────────────────────────────────────────────────────────────
  { id: 'wing_basic',       slot: 'wing', name: 'Standard-Flügel',    desc: 'Normale Flügel ohne Spezialwirkung.', emoji: '🪶', cost: 0,      color: '#94a3b8', glowColor: '#64748b', bonuses: {} },
  { id: 'wing_agile',       slot: 'wing', name: 'Agil-Flügel',        desc: '+8% Beweglichkeit — weiche schneller aus.', emoji: '🦅', cost: 6000,  color: '#22c55e', glowColor: '#4ade80', bonuses: { agility: 0.08 } },
  { id: 'wing_delta',       slot: 'wing', name: 'Delta-Flügel',       desc: 'Reduziert Hitbox um 15%.', emoji: '✈️', cost: 10000, color: '#f97316', glowColor: '#fb923c', bonuses: { hitboxReduce: 0.15 } },
  { id: 'wing_plasma',      slot: 'wing', name: 'Plasma-Flügel',      desc: 'Hinterlässt leuchtende Plasmaspur (kosmetisch).', emoji: '🌟', cost: 14000, color: '#ec4899', glowColor: '#f472b6', bonuses: { trail: 'plasma' } },
  { id: 'wing_void',        slot: 'wing', name: 'Void-Flügel',        desc: '+10% Ausweichgeschwindigkeit. Lila Aura.', emoji: '🌑', cost: 22000, color: '#7c3aed', glowColor: '#a78bfa', bonuses: { agility: 0.1, trail: 'void' } },

  // ── Triebwerk ────────────────────────────────────────────────────────────────
  { id: 'engine_basic',     slot: 'engine', name: 'Standard-Triebwerk', desc: 'Normaler Antrieb.', emoji: '🔥', cost: 0,      color: '#94a3b8', glowColor: '#64748b', bonuses: {} },
  { id: 'engine_nitro',     slot: 'engine', name: 'Nitro-Triebwerk',    desc: 'Afterburner hält 0,5s länger.', emoji: '🚀', cost: 7000,  color: '#ef4444', glowColor: '#f87171', bonuses: { afterburnerBonus: 0.5 } },
  { id: 'engine_eco',       slot: 'engine', name: 'Öko-Triebwerk',      desc: 'Münzen geben +5 Bonus-Punkte.', emoji: '🌿', cost: 9000,  color: '#16a34a', glowColor: '#4ade80', bonuses: { coinScoreBonus: 5 } },
  { id: 'engine_turbo',     slot: 'engine', name: 'Turbo-Triebwerk',    desc: 'Startet jede Runde 5% langsamer (mehr Zeit).', emoji: '⚡', cost: 16000, color: '#facc15', glowColor: '#fde047', bonuses: { slowStart: 0.05 } },
  { id: 'engine_omega',     slot: 'engine', name: 'Omega-Reaktor',      desc: 'Power-Ups dauern 25% länger. Neon-Glühen.', emoji: '☢️', cost: 28000, color: '#06b6d4', glowColor: '#67e8f9', bonuses: { powerupBonus: 0.25, glow: 'omega' } },

  // ── Waffe ────────────────────────────────────────────────────────────────────
  { id: 'weapon_none',      slot: 'weapon', name: 'Keine Waffe',         desc: 'Kein Waffensystem.', emoji: '🚫', cost: 0,      color: '#94a3b8', glowColor: '#64748b', bonuses: {} },
  { id: 'weapon_cannon',    slot: 'weapon', name: 'Mini-Kanone',         desc: 'Schießt langsamer, aber Treffer sind sicherer.', emoji: '🔫', cost: 5500,  color: '#f59e0b', glowColor: '#fcd34d', bonuses: { bulletSize: 0.1 } },
  { id: 'weapon_laser',     slot: 'weapon', name: 'Lasergewehr',         desc: 'Schüsse durchbohren eine Linie (kosmetisch).', emoji: '🔴', cost: 11000, color: '#dc2626', glowColor: '#f87171', bonuses: { trail: 'laser' } },
  { id: 'weapon_scatter',   slot: 'weapon', name: 'Streuschuss',         desc: 'Extra-Schuss im 45°-Winkel.', emoji: '💥', cost: 18000, color: '#8b5cf6', glowColor: '#a78bfa', bonuses: { dualCannon: true } },
  { id: 'weapon_orbital',   slot: 'weapon', name: 'Orbital-Mine',        desc: 'Startet mit einer orbitalen Mine.', emoji: '🌀', cost: 24000, color: '#0ea5e9', glowColor: '#38bdf8', bonuses: { orbitalMine: 1 } },
];

// Helper: get part by id
export function getPartById(id) {
  return SHIP_PARTS.find(p => p.id === id) || null;
}

// Helper: get default (free) parts for each slot
export function getDefaultParts() {
  const defaults = {};
  SHIP_SLOTS.forEach(slot => {
    const free = SHIP_PARTS.find(p => p.slot === slot && p.cost === 0);
    defaults[slot] = free?.id || null;
  });
  return defaults;
}

// Helper: compute aggregate bonuses from equipped parts
export function computePartBonuses(equippedParts) {
  const bonuses = {};
  Object.values(equippedParts || {}).forEach(partId => {
    if (!partId) return;
    const part = getPartById(partId);
    if (!part) return;
    Object.entries(part.bonuses || {}).forEach(([key, val]) => {
      if (typeof val === 'number') {
        bonuses[key] = (bonuses[key] || 0) + val;
      } else {
        bonuses[key] = val; // boolean or string
      }
    });
  });
  return bonuses;
}

// LocalStorage helpers
export function loadEquippedParts() {
  try { return JSON.parse(localStorage.getItem('neon_ship_parts')) || getDefaultParts(); }
  catch { return getDefaultParts(); }
}

export function saveEquippedParts(parts) {
  localStorage.setItem('neon_ship_parts', JSON.stringify(parts));
}

export function loadOwnedParts() {
  try {
    const stored = JSON.parse(localStorage.getItem('neon_owned_parts'));
    if (stored) return stored;
    // Default: own all free parts
    const free = SHIP_PARTS.filter(p => p.cost === 0).map(p => p.id);
    localStorage.setItem('neon_owned_parts', JSON.stringify(free));
    return free;
  } catch {
    return SHIP_PARTS.filter(p => p.cost === 0).map(p => p.id);
  }
}

export function saveOwnedParts(parts) {
  localStorage.setItem('neon_owned_parts', JSON.stringify(parts));
}