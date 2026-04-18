import { base44 } from '@/api/base44Client';
import { getActiveSeason, getActiveBonuses } from './BattlePassConfig';

// ── Daily game XP cap (stored in DB) ──────────────────────────────────
// Prevents abusing games to jump many levels per day.
const DAILY_GAME_XP_CAP = 5000; // Max XP from games per calendar day
const MAX_LEVELS_PER_CALL = 5;  // Max level-ups in a single XP grant

const GAME_SOURCES = ['neon dash', 'astro', 'void', 'game', 'boss', 'racer', 'chronosphere', 'level'];

function isGameSource(source = '') {
  const s = source.toLowerCase();
  return GAME_SOURCES.some(g => s.includes(g));
}

function getDailyGameXpUsed(user) {
  const today = new Date().toISOString().slice(0, 10);
  if (user?.daily_game_xp_date !== today) return 0;
  return user?.daily_game_xp_used || 0;
}

export const awardXpAndTokens = async (user, xpAmount, tokenAmount = 0, source = 'Aktion') => {
  if (!user || !user.id) return user;

  let finalXpAmount = xpAmount;
  let finalTokenAmount = tokenAmount;

  try {
    const statuses = await base44.entities.ServerStatus.list('-created_date', 1);
    if (statuses.length > 0) {
      if (statuses[0].xp_boost_active) finalXpAmount *= 2;
      if (statuses[0].token_boost_active) finalTokenAmount *= 2;
    }
  } catch (e) {}

  // ── Game XP daily cap (tracked in DB) ──────────────────────────────
  let dailyXpUpdate = {};
  if (isGameSource(source) && finalXpAmount > 0) {
    const used = getDailyGameXpUsed(user);
    const remaining = Math.max(0, DAILY_GAME_XP_CAP - used);
    if (remaining <= 0) {
      finalXpAmount = 0; // Cap reached — no XP from games today
    } else {
      finalXpAmount = Math.min(finalXpAmount, remaining);
    }
    if (finalXpAmount > 0) {
      const today = new Date().toISOString().slice(0, 10);
      dailyXpUpdate = {
        daily_game_xp_used: used + finalXpAmount,
        daily_game_xp_date: today,
      };
    }
  }

  const activeSeason = getActiveSeason(user);
  const activeBonuses = getActiveBonuses(activeSeason.id);
  
  let xp = (user.bp_xp || 0) + finalXpAmount;
  let level = user.bp_level || 1;
  let tokens = (user.tokens || 0) + finalTokenAmount;
  
  const maxLevel = activeSeason.maxLevel;
  const xpNeeded = activeSeason.xpPerLevel;

  let leveledUp = false;
  let newLevels = [];
  let levelsGained = 0;
  while (xp >= xpNeeded && level < maxLevel && levelsGained < MAX_LEVELS_PER_CALL) {
    xp -= xpNeeded;
    level++;
    levelsGained++;
    leveledUp = true;
    newLevels.push(level);
  }
  
  if (level >= maxLevel) {
    level = maxLevel;
    xp = 0;
  }

  // Apply level-up bonus rewards (tokens)
  let bonusTokens = 0;
  let bonusRewardLabels = [];
  for (const lvl of newLevels) {
    const bonus = activeBonuses[lvl];
    if (bonus) {
      bonusTokens += bonus.tokens || 0;
      bonusRewardLabels.push(bonus.label);
    }
  }
  tokens += bonusTokens;

  try {
    const updated = await base44.entities.AppUser.update(user.id, { 
      bp_xp: xp, 
      bp_level: level,
      tokens: tokens,
      ...dailyXpUpdate,
    });
    // Log token transaction
    if (finalTokenAmount > 0 || bonusTokens > 0) {
      const totalTokens = finalTokenAmount + bonusTokens;
      base44.entities.TokenTransaction.create({
        user_id: user.id,
        username: user.username,
        amount: totalTokens,
        source: bonusTokens > 0 ? bonusRewardLabels.join(', ') : source,
        category: bonusTokens > 0 ? 'bonus' : 'earned'
      }).catch(() => {});
    }
    localStorage.setItem('app_user', JSON.stringify(updated));
    window.dispatchEvent(new Event('user-updated'));
    
    if (finalXpAmount > 0) {
      window.dispatchEvent(new CustomEvent('xp-reward', { 
        detail: { amount: finalXpAmount, source, type: 'xp' } 
      }));
    }

    if (finalTokenAmount > 0 || bonusTokens > 0) {
      window.dispatchEvent(new CustomEvent('token-reward', { 
        detail: { amount: finalTokenAmount + bonusTokens, source: bonusTokens > 0 ? `Level-Up Bonus: ${bonusRewardLabels.join(', ')}` : source, rarity: bonusTokens > 0 ? 'legendary' : 'rare', type: 'token' } 
      }));
    }
    
    if (leveledUp) {
      window.dispatchEvent(new CustomEvent('level-up', { detail: { level, bonusRewards: bonusRewardLabels } }));
    }
    return updated;
  } catch(e) {
    console.error('Failed to update XP/Tokens', e);
    return user;
  }
};

// XP sources registry
export const XP_SOURCES = {
  watch: { xp: 150, tokens: 0, label: '👁️ Video ansehen' },
  like: { xp: 50, tokens: 0, label: '❤️ Video liken' },
  comment: { xp: 100, tokens: 0, label: '💬 Kommentieren' },
  login: { xp: 500, tokens: 0, label: '📅 Täglicher Login' },
  upload: { xp: 1500, tokens: 100000, label: '📤 Video hochladen' },
  feedback: { xp: 300, tokens: 50, label: '💡 Feedback geben' },
  neondash: { xp: 80, tokens: 0, label: '⚡ Neon Dash spielen' },
};