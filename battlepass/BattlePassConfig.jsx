import { BATTLE_PASS_SEASON_2 as S2_CONFIG, LEVEL_UP_BONUS_S2, SEASON_2_START } from './Season2Config';

export const BATTLE_PASS_SEASON_1 = {
  id: "season_1",
  name: "Cyber Genesis",
  description: "Erforsche die Neon-Matrix und schalte exklusive Cyber-Ausrüstung frei.",
  premiumPrice: 125000,
  maxLevel: 75,
  xpPerLevel: 1000,
  rewards: [
    // ─── TIER 1: Initiation (1–10) ───
    { level: 1, free: { type: "tokens", amount: 500, label: "500 Tokens", icon: "💰" }, premium: { type: "title", id: "Cyber Initiate", label: "Titel: Cyber Initiate", icon: "🏷️", rarity: "rare" } },
    { level: 2, free: { type: "badge", id: "bp_s1_pixel_heart", label: "Pixel Heart Badge", icon: "❤️" }, premium: { type: "tokens", amount: 1000, label: "1.000 Tokens", icon: "💰" } },
    { level: 3, free: { type: "tokens", amount: 600, label: "600 Tokens", icon: "💰" }, premium: { type: "chat_color", id: "neon_matrix", label: "Chat-Farbe: Matrix", icon: "💬", rarity: "epic" } },
    { level: 4, free: { type: "tokens", amount: 700, label: "700 Tokens", icon: "💰" }, premium: { type: "tokens", amount: 1500, label: "1.500 Tokens", icon: "💰" } },
    { level: 5, free: { type: "theme", id: "cyber", label: "Theme: Cyberpunk", icon: "🎨", rarity: "rare" }, premium: { type: "profile_effect", id: "digital_rain", label: "Effekt: Digital Rain", icon: "✨", rarity: "epic" } },
    { level: 6, free: { type: "tokens", amount: 800, label: "800 Tokens", icon: "💰" }, premium: { type: "tokens", amount: 2000, label: "2.000 Tokens", icon: "💰" } },
    { level: 7, free: { type: "badge", id: "bp_s1_glitch", label: "Glitch Badge", icon: "👾" }, premium: { type: "title", id: "Netrunner", label: "Titel: Netrunner", icon: "🏷️", rarity: "epic" } },
    { level: 8, free: { type: "tokens", amount: 900, label: "900 Tokens", icon: "💰" }, premium: { type: "tokens", amount: 2500, label: "2.500 Tokens", icon: "💰" } },
    { level: 9, free: { type: "tokens", amount: 1000, label: "1.000 Tokens", icon: "💰" }, premium: { type: "chat_color", id: "abyssal_void", label: "Chat-Farbe: Abyss", icon: "💬", rarity: "legendary" } },
    { level: 10, free: { type: "frame", id: "neon", label: "Neon Frame", icon: "🖼️", rarity: "epic" }, premium: { type: "frame", id: "bp_cosmic_rift", label: "Frame: Cosmic Rift", icon: "🌌", rarity: "legendary" } },

    // ─── TIER 2: Aufstieg (11–20) ───
    { level: 11, free: { type: "tokens", amount: 1200, label: "1.200 Tokens", icon: "💰" }, premium: { type: "tokens", amount: 3000, label: "3.000 Tokens", icon: "💰" } },
    { level: 12, free: { type: "tokens", amount: 1300, label: "1.300 Tokens", icon: "💰" }, premium: { type: "title", id: "Neon God", label: "Titel: Neon God", icon: "🏷️", rarity: "legendary" } },
    { level: 13, free: { type: "badge", id: "bp_s1_hacker", label: "Hacker Badge", icon: "💻" }, premium: { type: "tokens", amount: 3500, label: "3.500 Tokens", icon: "💰" } },
    { level: 14, free: { type: "tokens", amount: 1400, label: "1.400 Tokens", icon: "💰" }, premium: { type: "profile_effect", id: "sakura_falling", label: "Effekt: Sakura", icon: "🌸", rarity: "epic" } },
    { level: 15, free: { type: "theme", id: "dark_neon", label: "Theme: Dark Neon", icon: "🎨", rarity: "epic" }, premium: { type: "frame", id: "bp_dragon_breath", label: "Frame: Dragon", icon: "🐉", rarity: "legendary" } },
    { level: 16, free: { type: "tokens", amount: 1500, label: "1.500 Tokens", icon: "💰" }, premium: { type: "tokens", amount: 4000, label: "4.000 Tokens", icon: "💰" } },
    { level: 17, free: { type: "tokens", amount: 1600, label: "1.600 Tokens", icon: "💰" }, premium: { type: "title", id: "The Architect", label: "Titel: The Architect", icon: "🏷️", rarity: "unique" } },
    { level: 18, free: { type: "tokens", amount: 1800, label: "1.800 Tokens", icon: "💰" }, premium: { type: "tokens", amount: 5000, label: "5.000 Tokens", icon: "💰" } },
    { level: 19, free: { type: "tokens", amount: 2000, label: "2.000 Tokens", icon: "💰" }, premium: { type: "chat_color", id: "god_tier_gold", label: "Chat: God Gold", icon: "💬", rarity: "unique" } },
    { level: 20, free: { type: "badge", id: "bp_s1_veteran", label: "S1 Veteran Badge", icon: "🏆", rarity: "legendary" }, premium: { type: "profile_effect", id: "thunderstorm", label: "Effekt: Thunderstorm", icon: "⚡", rarity: "unique" } },

    // ─── TIER 3: Elite (21–30) ───
    { level: 21, free: { type: "tokens", amount: 2500, label: "2.500 Tokens", icon: "💰" }, premium: { type: "tokens", amount: 6000, label: "6.000 Tokens", icon: "💰" } },
    { level: 22, free: { type: "title", id: "Neon Traveler", label: "Titel: Neon Traveler", icon: "🏷️", rarity: "rare" }, premium: { type: "theme", id: "crimson", label: "Theme: Crimson", icon: "🎨", rarity: "epic" } },
    { level: 23, free: { type: "tokens", amount: 3000, label: "3.000 Tokens", icon: "💰" }, premium: { type: "tokens", amount: 7000, label: "7.000 Tokens", icon: "💰" } },
    { level: 24, free: { type: "badge", id: "bp_s1_cyborg", label: "Cyborg Badge", icon: "🤖", rarity: "epic" }, premium: { type: "profile_effect", id: "fire_ring", label: "Effekt: Fire Ring", icon: "🔥", rarity: "epic" } },
    { level: 25, free: { type: "theme", id: "arctic", label: "Theme: Arctic", icon: "🎨", rarity: "epic" }, premium: { type: "frame", id: "bp_cyber_samurai", label: "Frame: Samurai", icon: "⚔️", rarity: "legendary" } },
    { level: 26, free: { type: "tokens", amount: 4000, label: "4.000 Tokens", icon: "💰" }, premium: { type: "tokens", amount: 8000, label: "8.000 Tokens", icon: "💰" } },
    { level: 27, free: { type: "title", id: "Virtual Legend", label: "Titel: Virtual Legend", icon: "🏷️", rarity: "legendary" }, premium: { type: "chat_color", id: "cyber_pink", label: "Chat: Cyber Pink", icon: "💬", rarity: "legendary" } },
    { level: 28, free: { type: "tokens", amount: 5000, label: "5.000 Tokens", icon: "💰" }, premium: { type: "tokens", amount: 10000, label: "10.000 Tokens", icon: "💰" } },
    { level: 29, free: { type: "badge", id: "bp_s1_hologram", label: "Hologram Badge", icon: "💠", rarity: "legendary" }, premium: { type: "profile_effect", id: "plasma_burst", label: "Effekt: Plasma", icon: "💫", rarity: "legendary" } },
    { level: 30, free: { type: "frame", id: "rainbow", label: "Frame: Rainbow", icon: "🌈", rarity: "legendary" }, premium: { type: "frame", id: "bp_god_tier", label: "Frame: GOD OF 7B HUB", icon: "👑", rarity: "unique" } },

    // ─── TIER 4: Shadow Realm (31–40) ───
    { level: 31, free: { type: "tokens", amount: 5500, label: "5.500 Tokens", icon: "💰" }, premium: { type: "title", id: "Shadow Walker", label: "Titel: Shadow Walker", icon: "🏷️", rarity: "epic" } },
    { level: 32, free: { type: "badge", id: "bp_s1_phantom", label: "Phantom Badge", icon: "👻", rarity: "epic" }, premium: { type: "tokens", amount: 11000, label: "11.000 Tokens", icon: "💰" } },
    { level: 33, free: { type: "tokens", amount: 6000, label: "6.000 Tokens", icon: "💰" }, premium: { type: "chat_color", id: "shadow_crimson", label: "Chat: Shadow Crimson", icon: "💬", rarity: "epic" } },
    { level: 34, free: { type: "theme", id: "stealth", label: "Theme: Stealth", icon: "🎨", rarity: "epic" }, premium: { type: "tokens", amount: 12000, label: "12.000 Tokens", icon: "💰" } },
    { level: 35, free: { type: "tokens", amount: 6500, label: "6.500 Tokens", icon: "💰" }, premium: { type: "profile_effect", id: "void_pulse", label: "Effekt: Void Pulse", icon: "🌀", rarity: "legendary" } },
    { level: 36, free: { type: "badge", id: "bp_s1_dark_knight", label: "Dark Knight Badge", icon: "🗡️", rarity: "legendary" }, premium: { type: "tokens", amount: 13000, label: "13.000 Tokens", icon: "💰" } },
    { level: 37, free: { type: "tokens", amount: 7000, label: "7.000 Tokens", icon: "💰" }, premium: { type: "title", id: "Abyss Keeper", label: "Titel: Abyss Keeper", icon: "🏷️", rarity: "legendary" } },
    { level: 38, free: { type: "tokens", amount: 7500, label: "7.500 Tokens", icon: "💰" }, premium: { type: "frame", id: "shadow", label: "Frame: Shadow", icon: "🖤", rarity: "legendary" } },
    { level: 39, free: { type: "theme", id: "volcanic", label: "Theme: Volcanic", icon: "🌋", rarity: "epic" }, premium: { type: "tokens", amount: 14000, label: "14.000 Tokens", icon: "💰" } },
    { level: 40, free: { type: "badge", id: "bp_s1_shadow_master", label: "Shadow Master Badge", icon: "🌑", rarity: "legendary" }, premium: { type: "profile_effect", id: "dark_nova", label: "Effekt: Dark Nova", icon: "💥", rarity: "unique" } },

    // ─── TIER 5: Cosmic Power (41–50) ───
    { level: 41, free: { type: "tokens", amount: 8000, label: "8.000 Tokens", icon: "💰" }, premium: { type: "title", id: "Cosmic Voyager", label: "Titel: Cosmic Voyager", icon: "🏷️", rarity: "legendary" } },
    { level: 42, free: { type: "badge", id: "bp_s1_nebula", label: "Nebula Badge", icon: "🌌", rarity: "legendary" }, premium: { type: "tokens", amount: 15000, label: "15.000 Tokens", icon: "💰" } },
    { level: 43, free: { type: "tokens", amount: 8500, label: "8.500 Tokens", icon: "💰" }, premium: { type: "chat_color", id: "cosmic_aurora", label: "Chat: Cosmic Aurora", icon: "💬", rarity: "legendary" } },
    { level: 44, free: { type: "theme", id: "galaxy", label: "Theme: Galaxy", icon: "🌠", rarity: "legendary" }, premium: { type: "tokens", amount: 16000, label: "16.000 Tokens", icon: "💰" } },
    { level: 45, free: { type: "tokens", amount: 9000, label: "9.000 Tokens", icon: "💰" }, premium: { type: "frame", id: "galaxy", label: "Frame: Galaxy", icon: "✨", rarity: "legendary" } },
    { level: 46, free: { type: "badge", id: "bp_s1_stardust", label: "Stardust Badge", icon: "⭐", rarity: "legendary" }, premium: { type: "tokens", amount: 17000, label: "17.000 Tokens", icon: "💰" } },
    { level: 47, free: { type: "tokens", amount: 9500, label: "9.500 Tokens", icon: "💰" }, premium: { type: "title", id: "Star Destroyer", label: "Titel: Star Destroyer", icon: "🏷️", rarity: "unique" } },
    { level: 48, free: { type: "theme", id: "midnight", label: "Theme: Midnight", icon: "🌙", rarity: "epic" }, premium: { type: "profile_effect", id: "supernova", label: "Effekt: Supernova", icon: "🌟", rarity: "unique" } },
    { level: 49, free: { type: "tokens", amount: 10000, label: "10.000 Tokens", icon: "💰" }, premium: { type: "tokens", amount: 18000, label: "18.000 Tokens", icon: "💰" } },
    { level: 50, free: { type: "frame", id: "cosmic", label: "Frame: Cosmic", icon: "🌌", rarity: "unique" }, premium: { type: "frame", id: "celestial", label: "Frame: Celestial", icon: "🌠", rarity: "unique" } },

    // ─── TIER 6: Divine Ascension (51–60) ───
    { level: 51, free: { type: "tokens", amount: 11000, label: "11.000 Tokens", icon: "💰" }, premium: { type: "title", id: "Divine Being", label: "Titel: Divine Being", icon: "🏷️", rarity: "unique" } },
    { level: 52, free: { type: "badge", id: "bp_s1_angel", label: "Angel Badge", icon: "😇", rarity: "unique" }, premium: { type: "tokens", amount: 20000, label: "20.000 Tokens", icon: "💰" } },
    { level: 53, free: { type: "tokens", amount: 12000, label: "12.000 Tokens", icon: "💰" }, premium: { type: "chat_color", id: "divine_light", label: "Chat: Divine Light", icon: "💬", rarity: "unique" } },
    { level: 54, free: { type: "theme", id: "royal", label: "Theme: Royal", icon: "👑", rarity: "legendary" }, premium: { type: "tokens", amount: 22000, label: "22.000 Tokens", icon: "💰" } },
    { level: 55, free: { type: "tokens", amount: 13000, label: "13.000 Tokens", icon: "💰" }, premium: { type: "profile_effect", id: "golden_wings", label: "Effekt: Golden Wings", icon: "🪽", rarity: "unique" } },
    { level: 56, free: { type: "badge", id: "bp_s1_crown", label: "Crown Badge", icon: "👑", rarity: "unique" }, premium: { type: "tokens", amount: 24000, label: "24.000 Tokens", icon: "💰" } },
    { level: 57, free: { type: "tokens", amount: 14000, label: "14.000 Tokens", icon: "💰" }, premium: { type: "title", id: "The Eternal", label: "Titel: The Eternal", icon: "🏷️", rarity: "unique" } },
    { level: 58, free: { type: "theme", id: "gold", label: "Theme: Gold", icon: "🥇", rarity: "legendary" }, premium: { type: "tokens", amount: 26000, label: "26.000 Tokens", icon: "💰" } },
    { level: 59, free: { type: "tokens", amount: 15000, label: "15.000 Tokens", icon: "💰" }, premium: { type: "frame", id: "eternal", label: "Frame: Eternal", icon: "♾️", rarity: "unique" } },
    { level: 60, free: { type: "badge", id: "bp_s1_deity", label: "Deity Badge", icon: "⚜️", rarity: "unique" }, premium: { type: "profile_effect", id: "divine_aura", label: "Effekt: Divine Aura", icon: "✨", rarity: "unique" } },

    // ─── TIER 7: Void Transcendence (61–70) ───
    { level: 61, free: { type: "tokens", amount: 16000, label: "16.000 Tokens", icon: "💰" }, premium: { type: "tokens", amount: 28000, label: "28.000 Tokens", icon: "💰" } },
    { level: 62, free: { type: "title", id: "Void Walker", label: "Titel: Void Walker", icon: "🏷️", rarity: "unique" }, premium: { type: "chat_color", id: "void_purple", label: "Chat: Void Purple", icon: "💬", rarity: "unique" } },
    { level: 63, free: { type: "tokens", amount: 17000, label: "17.000 Tokens", icon: "💰" }, premium: { type: "tokens", amount: 30000, label: "30.000 Tokens", icon: "💰" } },
    { level: 64, free: { type: "badge", id: "bp_s1_void_lord", label: "Void Lord Badge", icon: "🕳️", rarity: "unique" }, premium: { type: "frame", id: "void", label: "Frame: Void", icon: "🌑", rarity: "unique" } },
    { level: 65, free: { type: "theme", id: "hub_2_0", label: "Theme: 7B Hub 2.0", icon: "🎨", rarity: "unique" }, premium: { type: "profile_effect", id: "dimension_rift", label: "Effekt: Dimension Rift", icon: "🌀", rarity: "unique" } },
    { level: 66, free: { type: "tokens", amount: 18000, label: "18.000 Tokens", icon: "💰" }, premium: { type: "tokens", amount: 33000, label: "33.000 Tokens", icon: "💰" } },
    { level: 67, free: { type: "badge", id: "bp_s1_transcendent", label: "Transcendent Badge", icon: "🔮", rarity: "unique" }, premium: { type: "title", id: "Dimension Lord", label: "Titel: Dimension Lord", icon: "🏷️", rarity: "unique" } },
    { level: 68, free: { type: "tokens", amount: 20000, label: "20.000 Tokens", icon: "💰" }, premium: { type: "tokens", amount: 36000, label: "36.000 Tokens", icon: "💰" } },
    { level: 69, free: { type: "tokens", amount: 22000, label: "22.000 Tokens", icon: "💰" }, premium: { type: "frame", id: "legendary", label: "Frame: Legendary", icon: "🔱", rarity: "unique" } },
    { level: 70, free: { type: "badge", id: "bp_s1_legend70", label: "Legend-70 Badge", icon: "🦁", rarity: "unique" }, premium: { type: "profile_effect", id: "ethereal_flames", label: "Effekt: Ethereal Flames", icon: "🔥", rarity: "unique" } },

    // ─── TIER 8: APEX — The End (71–75) ───
    { level: 71, free: { type: "tokens", amount: 25000, label: "25.000 Tokens", icon: "💰" }, premium: { type: "title", id: "Apex Predator", label: "Titel: Apex Predator", icon: "🏷️", rarity: "unique" } },
    { level: 72, free: { type: "tokens", amount: 28000, label: "28.000 Tokens", icon: "💰" }, premium: { type: "frame", id: "divine", label: "Frame: Divine", icon: "🌟", rarity: "unique" } },
    { level: 73, free: { type: "badge", id: "bp_s1_apex_warrior", label: "Apex Warrior Badge", icon: "⚡", rarity: "unique" }, premium: { type: "tokens", amount: 50000, label: "50.000 Tokens", icon: "💰" } },
    { level: 74, free: { type: "tokens", amount: 30000, label: "30.000 Tokens", icon: "💰" }, premium: { type: "title", id: "The Mythic", label: "Titel: The Mythic", icon: "🏷️", rarity: "unique" } },
    { level: 75, free: { type: "frame", id: "mythic", label: "Frame: Mythic", icon: "💎", rarity: "unique" }, premium: { type: "frame", id: "genesis", label: "Frame: Cyber Genesis", icon: "🌐", rarity: "unique" } },
  ]
};

export const BATTLE_PASS_ACTIONS = [
  { id: 'a_watch', title: 'Video ansehen', xpReward: 150, icon: '👁️' },
  { id: 'a_like', title: 'Video liken', xpReward: 50, icon: '❤️' },
  { id: 'a_comment', title: 'Kommentieren', xpReward: 100, icon: '💬' },
  { id: 'a_login', title: 'Täglicher Login', xpReward: 500, icon: '📅' },
  { id: 'a_upload', title: 'Video hochladen', xpReward: 1500, icon: '📤' },
  { id: 'a_neondash', title: 'Neon Dash spielen', xpReward: '250+', icon: '⚡' },
  { id: 'a_feedback', title: 'Feedback geben', xpReward: 300, icon: '💡', isNew: true },
];

export const LEVEL_UP_BONUS_REWARDS = {
  5:  { tokens: 500,   label: '🎁 Level-5-Bonus' },
  10: { tokens: 1500,  label: '🎁 Level-10-Meilenstein' },
  15: { tokens: 2000,  label: '🎁 Level-15-Bonus' },
  20: { tokens: 3000,  label: '🎁 Level-20-Meilenstein' },
  25: { tokens: 4000,  label: '🎁 Level-25-Bonus' },
  30: { tokens: 6000,  label: '🎁 Level-30-Meilenstein' },
  35: { tokens: 7000,  label: '🎁 Level-35-Bonus' },
  40: { tokens: 8000,  label: '🎁 Level-40-Meilenstein' },
  50: { tokens: 12000, label: '🎁 Level-50-Meilenstein' },
  60: { tokens: 18000, label: '🎁 Level-60-Meilenstein' },
  70: { tokens: 25000, label: '🎁 Level-70-Meilenstein' },
  75: { tokens: 50000, label: '👑 Saison abgeschlossen!' },
};

export function getActiveSeason(user) {
  const now = new Date();
  if (user?.test_season_2) return S2_CONFIG;
  if (now >= SEASON_2_START) return S2_CONFIG;
  return BATTLE_PASS_SEASON_1;
}

export function getActiveBonuses(seasonId) {
  return seasonId === 'season_2' ? LEVEL_UP_BONUS_S2 : LEVEL_UP_BONUS_REWARDS;
}

// Re-export for convenience
export { S2_CONFIG as BATTLE_PASS_SEASON_2 };
export { SEASON_2_START };