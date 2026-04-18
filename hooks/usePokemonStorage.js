/**
 * usePokemonStorage — Robuste, atomare Pokémon-Speicherlösung
 *
 * Problem vorher:
 * - saveParty() und saveBox() riefen beide syncToCloud() auf, welches
 *   pkStoryProgress aus localStorage las (veraltet!) und dadurch den jeweils
 *   anderen Wert überschrieb (Race Condition).
 * - Beim Laden wurde keine klare Priorität gesetzt (Cloud vs. Local).
 *
 * Lösung:
 * - Ein zentrales state-Objekt `pkData` enthält party, box, xp, levels, etc.
 * - Jede Änderung geht durch `updatePkData` → atomar, kein Race Condition.
 * - Cloud-Sync erfolgt gebündelt mit debounce (500ms).
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const STORAGE_KEY = 'pkData_v2';
const LEGACY_KEYS = {
  party: 'pkParty',
  box: 'pkBox',
  xp: 'pkPartyXP',
  levels: 'pkPartyLevel',
  explored: 'pkExploredNodes',
  story: 'pkStoryProgress',
  inventory: 'pkInventory',
  balls: 'pkBalls',
  coins: 'pkCoins',
  wins: 'pkWins',
  streak: 'pkStreak',
};

function repairMoves(pokeList, pokemonData) {
  return (pokeList || []).filter(Boolean).map(poke => {
    if (!poke?.id) return null;
    const base = pokemonData.find(p => p.id === poke.id);
    if (!poke.moves || poke.moves.length === 0 || poke.moves.some(m => !m?.name)) {
      return { ...poke, moves: base?.moves || [{ name: 'Tackle', power: 40, type: 'normal', pp: 35 }] };
    }
    return poke;
  }).filter(Boolean);
}

function loadInitialData(user, pokemonData) {
  // Try new unified storage first
  try {
    const unified = localStorage.getItem(STORAGE_KEY);
    if (unified) {
      const parsed = JSON.parse(unified);
      // Still merge with cloud if cloud is newer
      const cloudProgress = user?.pokemon_story_progress;
      if (cloudProgress) {
        const cloudVersion = cloudProgress.version || 0;
        const localVersion = parsed.version || 0;
        if (cloudVersion > localVersion) {
          // Cloud is newer, use cloud data
          const merged = mergeCloudData(parsed, cloudProgress, pokemonData);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          return merged;
        }
      }
      // Repair moves in case data is corrupted
      parsed.party = repairMoves(parsed.party, pokemonData);
      parsed.box = repairMoves(parsed.box, pokemonData);
      return parsed;
    }
  } catch {}

  // Fall back to legacy keys + cloud merge
  const cloudProgress = user?.pokemon_story_progress;

  const localStory = (() => { try { return JSON.parse(localStorage.getItem(LEGACY_KEYS.story)) || {}; } catch { return {}; } })();
  const cloudStory = cloudProgress || {};

  // Pick whichever has higher zoneIndex
  const story = (cloudStory.zoneIndex || 0) >= (localStory.zoneIndex || 0) ? cloudStory : localStory;

  const localParty = (() => { try { return JSON.parse(localStorage.getItem(LEGACY_KEYS.party)) || []; } catch { return []; } })();
  const localBox = (() => { try { return JSON.parse(localStorage.getItem(LEGACY_KEYS.box)) || []; } catch { return []; } })();

  // Cloud wins if it has more data
  const cloudParty = cloudProgress?.party || [];
  const cloudBox = cloudProgress?.box || [];
  const party = cloudParty.length >= localParty.length ? cloudParty : localParty;
  const box = cloudBox.length >= localBox.length ? cloudBox : localBox;

  const localXP = (() => { try { return JSON.parse(localStorage.getItem(LEGACY_KEYS.xp)) || {}; } catch { return {}; } })();
  const cloudXP = cloudProgress?.pokemon_xp || {};
  const xp = Object.keys(cloudXP).length >= Object.keys(localXP).length ? cloudXP : localXP;

  const localLevels = (() => { try { return JSON.parse(localStorage.getItem(LEGACY_KEYS.levels)) || {}; } catch { return {}; } })();
  const cloudLevels = cloudProgress?.pokemon_levels || {};
  const levels = Object.keys(cloudLevels).length >= Object.keys(localLevels).length ? cloudLevels : localLevels;

  const explored = (() => {
    const localE = (() => { try { return JSON.parse(localStorage.getItem(LEGACY_KEYS.explored)) || []; } catch { return []; } })();
    const cloudE = cloudProgress?.exploredNodes || [];
    return cloudE.length >= localE.length ? cloudE : localE;
  })();

  const data = {
    version: Date.now(),
    story: { zoneIndex: 0, trainerIndex: 0, badges: [], ...story },
    party: repairMoves(party, pokemonData),
    box: repairMoves(box, pokemonData),
    xp,
    levels,
    explored,
    inventory: (() => { try { return JSON.parse(localStorage.getItem(LEGACY_KEYS.inventory)) || { potion: 2, superp: 0, fullheal: 1, xatk: 1, xdef: 0, revive: 0 }; } catch { return { potion: 2, superp: 0, fullheal: 1, xatk: 1, xdef: 0, revive: 0 }; } })(),
    balls: (() => { try { return JSON.parse(localStorage.getItem(LEGACY_KEYS.balls)) || { pokeball: 5, greatball: 2, ultraball: 0 }; } catch { return { pokeball: 5, greatball: 2, ultraball: 0 }; } })(),
    coins: (() => { try { return parseInt(localStorage.getItem(LEGACY_KEYS.coins) || '500'); } catch { return 500; } })(),
    wins: (() => { try { return parseInt(localStorage.getItem(LEGACY_KEYS.wins) || '0'); } catch { return 0; } })(),
    streak: (() => { try { return parseInt(localStorage.getItem(LEGACY_KEYS.streak) || '0'); } catch { return 0; } })(),
  };

  // Save in new unified format
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

function mergeCloudData(local, cloud, pokemonData) {
  const cloudParty = cloud.party || [];
  const cloudBox = cloud.box || [];
  const party = cloudParty.length >= (local.party || []).length ? cloudParty : (local.party || []);
  const box = cloudBox.length >= (local.box || []).length ? cloudBox : (local.box || []);

  return {
    ...local,
    version: cloud.version || local.version,
    story: (cloud.zoneIndex || 0) >= (local.story?.zoneIndex || 0) ? { zoneIndex: 0, trainerIndex: 0, badges: [], ...cloud } : local.story,
    party: repairMoves(party, pokemonData),
    box: repairMoves(box, pokemonData),
    xp: Object.keys(cloud.pokemon_xp || {}).length >= Object.keys(local.xp || {}).length ? (cloud.pokemon_xp || {}) : (local.xp || {}),
    levels: Object.keys(cloud.pokemon_levels || {}).length >= Object.keys(local.levels || {}).length ? (cloud.pokemon_levels || {}) : (local.levels || {}),
    explored: (cloud.exploredNodes || []).length >= (local.explored || []).length ? (cloud.exploredNodes || []) : (local.explored || []),
  };
}

export default function usePokemonStorage(user, pokemonData) {
  const [data, setData] = useState(() => loadInitialData(user, pokemonData));
  const syncTimeoutRef = useRef(null);
  const latestDataRef = useRef(data);

  useEffect(() => {
    latestDataRef.current = data;
  }, [data]);

  // Atomic update: updates state + localStorage atomically
  const update = useCallback((patch) => {
    setData(prev => {
      const next = typeof patch === 'function' ? patch(prev) : { ...prev, ...patch, version: Date.now() };
      // Ensure arrays are clean
      if (next.party) next.party = repairMoves(next.party.filter(Boolean), pokemonData);
      if (next.box) next.box = repairMoves(next.box.filter(Boolean), pokemonData);
      // Save to localStorage immediately
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      // Debounced cloud sync
      if (user?.id) {
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = setTimeout(() => {
          const d = latestDataRef.current;
          const cloudPayload = {
            version: d.version,
            ...d.story,
            party: d.party,
            box: d.box,
            pokemon_xp: d.xp,
            pokemon_levels: d.levels,
            exploredNodes: d.explored,
          };
          base44.entities.AppUser.update(user.id, { pokemon_story_progress: cloudPayload })
            .then(u => {
              localStorage.setItem('app_user', JSON.stringify(u));
              window.dispatchEvent(new Event('user-updated'));
            })
            .catch(() => {});
        }, 500);
      }
      return next;
    });
  }, [user, pokemonData]);

  // Convenience methods
  const saveParty = useCallback((party) => update({ party }), [update]);
  const saveBox = useCallback((box) => update({ box }), [update]);
  const saveStory = useCallback((story) => update({ story }), [update]);
  const saveXP = useCallback((xp) => update({ xp }), [update]);
  const saveLevels = useCallback((levels) => update({ levels }), [update]);
  const saveExplored = useCallback((explored) => update({ explored }), [update]);
  const saveInventory = useCallback((inventory) => update({ inventory }), [update]);
  const saveBalls = useCallback((balls) => update({ balls }), [update]);
  const saveCoins = useCallback((coins) => {
    update({ coins });
    localStorage.setItem(LEGACY_KEYS.coins, coins); // keep legacy for other components
  }, [update]);
  const saveWins = useCallback((wins) => {
    update({ wins });
    localStorage.setItem(LEGACY_KEYS.wins, wins);
  }, [update]);
  const saveStreak = useCallback((streak) => {
    update({ streak });
    localStorage.setItem(LEGACY_KEYS.streak, streak);
  }, [update]);

  const addToParty = useCallback((poke) => {
    update(prev => {
      const safeParty = (prev.party || []).filter(Boolean);
      const safeBox = (prev.box || []).filter(Boolean);
      // Already in party? Put in box instead
      if (safeParty.find(p => p.id === poke.id)) {
        return { ...prev, box: [...safeBox, poke] };
      }
      if (safeParty.length >= 6) {
        return { ...prev, box: [...safeBox, poke] };
      }
      return { ...prev, party: [...safeParty, poke] };
    });
  }, [update]);

  const moveToBox = useCallback((pokeId) => {
    update(prev => {
      const poke = (prev.party || []).find(p => p?.id === pokeId);
      if (!poke) return prev;
      return {
        ...prev,
        party: (prev.party || []).filter(p => p?.id !== pokeId),
        box: [...(prev.box || []).filter(Boolean), poke],
      };
    });
  }, [update]);

  const moveToParty = useCallback((pokeId) => {
    update(prev => {
      const safeParty = (prev.party || []).filter(Boolean);
      const safeBox = (prev.box || []).filter(Boolean);
      if (safeParty.length >= 6) return prev;
      const idx = safeBox.findIndex(p => p?.id === pokeId);
      if (idx === -1) return prev;
      const poke = safeBox[idx];
      if (safeParty.find(p => p.id === pokeId)) return prev; // already in party
      const newBox = [...safeBox];
      newBox.splice(idx, 1);
      return { ...prev, party: [...safeParty, poke], box: newBox };
    });
  }, [update]);

  const releasePokemon = useCallback((pokeId) => {
    update(prev => ({
      ...prev,
      party: (prev.party || []).filter(p => p?.id !== pokeId),
      box: (prev.box || []).filter(p => p?.id !== pokeId),
    }));
  }, [update]);

  return {
    data,
    update,
    saveParty,
    saveBox,
    saveStory,
    saveXP,
    saveLevels,
    saveExplored,
    saveInventory,
    saveBalls,
    saveCoins,
    saveWins,
    saveStreak,
    addToParty,
    moveToBox,
    moveToParty,
    releasePokemon,
  };
}