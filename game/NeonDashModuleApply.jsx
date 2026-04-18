/**
 * NeonDashModuleApply.js
 * Applies S2 module stats to the game state at the start of a run
 * and provides per-frame helpers used in the game loop.
 */
import { computeModuleStats } from './S2GameSystems';

/**
 * Load equipped modules from localStorage and compute their combined stats.
 */
export const loadModuleStats = () => {
  try {
    const ids = JSON.parse(localStorage.getItem('s2_modules') || '[]');
    return computeModuleStats(ids);
  } catch {
    return computeModuleStats([]);
  }
};

/**
 * Apply module stats to the initial state object.
 * Mutates `state` in place.
 * 
 * Called AFTER stateRef.current is assigned in startGame.
 */
export const applyModulesToState = (state, modStats, startShieldLvl) => {
  // Store modStats on state for per-frame access
  state.modStats = modStats;

  // Overdrive Engine: already applied to startSpeed in startGame.
  // Here we handle side effects:

  // Start Shield: Heavy Plating extends it, Overdrive Engine disables it
  if (startShieldLvl > 0) {
    if (modStats.noStartShield) {
      delete state.activePowerups.shield;
    } else {
      const base = startShieldLvl * 8000;
      state.activePowerups.shield = Date.now() + base * (modStats.shieldDurationMult || 1);
    }
  }
};

/**
 * Get effective agility multiplier (module + afterburner combined).
 * Used in player movement lerp.
 */
export const getAgilityFactor = (state) => {
  const modAgility = state.modStats?.agilityMult ?? 1;
  const afterburnerBoost = state.afterburnerActive ? 1.6 : 1.0;
  return modAgility * afterburnerBoost;
};

/**
 * Get warp direction: toward the side with more empty space.
 * Fixes the broken `state.playerSpeed` approach.
 */
export const getWarpDirection = (playerX, canvasWidth) => {
  // Warp toward the side with more room
  return playerX < canvasWidth / 2 ? 1 : -1;
};

/**
 * Get effective shield duration multiplier (from modules).
 */
export const getShieldDurationMult = (state) => {
  return state.modStats?.shieldDurationMult ?? 1;
};