/**
 * VOID SHARDS — Exklusive Battle Pass Währung
 * Nicht käuflich. Nur durch Battle Pass verdienbar.
 */

export const SHARD_TIERS = {
  spark: {
    id: 'spark',
    name: 'Spark Shard',
    icon: '🔵',
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.6)',
    border: 'rgba(59,130,246,0.4)',
    bg: 'rgba(59,130,246,0.1)',
    label: 'Selten',
    animationClass: 'spark',
  },
  void: {
    id: 'void',
    name: 'Void Shard',
    icon: '🟣',
    color: '#a855f7',
    glow: 'rgba(168,85,247,0.7)',
    border: 'rgba(168,85,247,0.5)',
    bg: 'rgba(168,85,247,0.12)',
    label: 'Episch',
    animationClass: 'void',
  },
  nova: {
    id: 'nova',
    name: 'Nova Shard',
    icon: '🟡',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.8)',
    border: 'rgba(245,158,11,0.5)',
    bg: 'rgba(245,158,11,0.12)',
    label: 'Legendär',
    animationClass: 'nova',
  },
  omega: {
    id: 'omega',
    name: 'Omega Fragment',
    icon: '🔴',
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.9)',
    border: 'rgba(239,68,68,0.6)',
    bg: 'rgba(239,68,68,0.12)',
    label: 'Mythisch',
    animationClass: 'omega',
  },
};

// Shard-Drops pro Level — nur S2
// Format: { level: N, tier: 'spark'|'void'|'nova'|'omega', id: 'unique_claim_key' }
export const SHARD_DROPS = [
  // Tier 1–10: 10 Spark
  { level: 3,  tier: 'spark', amount: 5, id: 'l3_spark' },
  { level: 7,  tier: 'spark', amount: 5, id: 'l7_spark' },
  // Tier 11–20: 5 Spark + 3 Void
  { level: 12, tier: 'spark', amount: 5, id: 'l12_spark' },
  { level: 17, tier: 'void',  amount: 3, id: 'l17_void' },
  // Tier 21–30: 5 Spark + 3 Void
  { level: 22, tier: 'spark', amount: 5, id: 'l22_spark' },
  { level: 27, tier: 'void',  amount: 3, id: 'l27_void' },
  // Tier 31–40: 5 Spark + 4 Void
  { level: 32, tier: 'spark', amount: 5, id: 'l32_spark' },
  { level: 37, tier: 'void',  amount: 4, id: 'l37_void' },
  // Tier 41–50: 4 Void + 3 Nova (Halbzeit)
  { level: 42, tier: 'void',  amount: 4, id: 'l42_void' },
  { level: 47, tier: 'nova',  amount: 3, id: 'l47_nova' },  // ⭐ Halbzeit-Moment
  // Tier 51–60: 10 Void
  { level: 53, tier: 'void',  amount: 5, id: 'l53_void' },
  { level: 57, tier: 'void',  amount: 5, id: 'l57_void' },
  // Tier 61–70: 5 Void + 4 Nova
  { level: 62, tier: 'void',  amount: 5, id: 'l62_void' },
  { level: 67, tier: 'nova',  amount: 4, id: 'l67_nova' },
  // Tier 71–80: 6 Void + 4 Nova
  { level: 72, tier: 'void',  amount: 6, id: 'l72_void' },
  { level: 77, tier: 'nova',  amount: 4, id: 'l77_nova' },
  // Tier 81–90: 4 Nova + 4 Omega
  { level: 82, tier: 'nova',  amount: 4, id: 'l82_nova' },
  { level: 86, tier: 'omega', amount: 2, id: 'l86_omega' },
  { level: 89, tier: 'omega', amount: 2, id: 'l89_omega' },
  // Tier 91–100: 6 Omega
  { level: 93, tier: 'omega', amount: 2, id: 'l93_omega' },
  { level: 97, tier: 'omega', amount: 2, id: 'l97_omega' },
  { level: 99, tier: 'omega', amount: 2, id: 'l99_omega' }, // 🔴 Legendärer Moment
];

// Gesamt: 25 Spark, 35 Void, 15 Nova, 10 Omega
// Dies ermöglicht es Spielern, fast alles im Shard-Shop freizuschalten, wenn sie max Level erreichen!

// Blueprint-Rezepte für den Shard-Shop
export const SHARD_BLUEPRINTS = [
  {
    id: 'bp_dynamic_bg_nebula',
    name: 'Dynamic Nebula (BG)',
    description: 'Interaktiver Profil-Hintergrund, der auf Tageszeit und Cursor-Bewegungen reagiert.',
    icon: '🌌',
    rarity: 'legendary',
    type: 'background_animation',
    reward_id: 'dynamic_nebula',
    cost: { void: 8, nova: 3 },
    isDynamic: true,
  },
  {
    id: 'bp_dynamic_theme_void',
    name: 'Void Nexus UI-Theme',
    description: 'Spezial UI-Theme, welches seine Farben während Boss Raids oder Streams dynamisch anpasst.',
    icon: '🌗',
    rarity: 'unique',
    type: 'theme',
    reward_id: 'void_nexus',
    cost: { nova: 4, omega: 1 },
    isDynamic: true,
  },
  {
    id: 'bp_animated_emote_pack',
    name: 'Holo-Emotes (Pack)',
    description: 'Schalte 5 exklusive, holografische und voll animierte Chat-Emotes frei!',
    icon: '🎭',
    rarity: 'epic',
    type: 'emotes',
    reward_id: 'holo_pack_1',
    cost: { spark: 15, void: 5 },
    isDynamic: true,
  },
  {
    id: 'bp_apocalypse_aura_v2',
    name: 'Apocalypse Aura V2',
    description: 'Animierter Profileffekt — einzigartig im gesamten Spiel',
    icon: '💥',
    rarity: 'legendary',
    type: 'profile_effect',
    reward_id: 's2_bp_apocalypse_aura_v2',
    cost: { void: 5, nova: 2 },
  },
  {
    id: 'bp_s2_champion_frame',
    name: 'S2 Champion Frame',
    description: 'Exklusiver Rahmen mit Partikel-Effekt — nur durch Crafting erhältlich',
    icon: '🏆',
    rarity: 'unique',
    type: 'frame',
    reward_id: 'bp_s2_champion',
    cost: { void: 10, omega: 1 },
  },
  {
    id: 'bp_s2_legend_title',
    name: '"Season 2 Legend" Titel',
    description: 'Goldener animierter Titel für echte S2-Veteranen',
    icon: '🔱',
    rarity: 'unique',
    type: 'title',
    reward_id: 'Season 2 Legend',
    cost: { nova: 3, omega: 1 },
  },
  {
    id: 'bp_void_titan_skin_v2',
    name: 'Void Titan Skin V2',
    description: 'Das seltenste Schiff im gesamten Spiel — nur 3 Omega Fragments',
    icon: '🚀',
    rarity: 'unique',
    type: 'spaceship',
    reward_id: 's2_void_titan_v2',
    cost: { omega: 3 },
  },
  {
    id: 'bp_spark_bundle',
    name: 'Spark → Void Upgrade',
    description: 'Wandle 5 Spark Shards in 1 Void Shard um',
    icon: '⬆️',
    rarity: 'rare',
    type: 'convert',
    reward_id: null,
    cost: { spark: 5 },
    gives: { void: 1 },
  },
  {
    id: 'bp_void_nova_upgrade',
    name: 'Void → Nova Upgrade',
    description: 'Wandle 4 Void Shards in 1 Nova Shard um',
    icon: '⬆️',
    rarity: 'epic',
    type: 'convert',
    reward_id: null,
    cost: { void: 4 },
    gives: { nova: 1 },
  },
];