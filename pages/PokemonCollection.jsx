import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trophy, Zap, Lock, Unlock, ChevronRight, Sparkles, Package, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageTransition from '@/components/mobile/PageTransition';
import PokemonPageDecor from '@/components/pokemon/PokemonPageDecor';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const TYPE_COLORS = {
  normal: '#A8A878', fire: '#F08030', water: '#6890F0', electric: '#F8D030',
  grass: '#78C850', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
  ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
  rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', dark: '#705848',
  steel: '#B8B8D0', fairy: '#EE99AC',
};

const COLLECTION_SETS = [
  { id: 'starter_trio', name: 'Kanto Starters', description: 'Fange alle 3 Kanto-Starter', required: [1, 4, 7], emoji: '🌿', reward: '🏆 Kanto-Trainer Titel' },
  { id: 'electric_squad', name: 'Elektro-Trupp', description: 'Sammle 3 Elektro-Pokémon', required: [25, 81, 125], emoji: '⚡', reward: '⚡ Blitzstarter Titel' },
  { id: 'legendary_birds', name: 'Legendäre Vögel', description: 'Besiege alle 3 legendären Vögel', required: [144, 145, 146], emoji: '🦅', reward: '👑 Legende Rahmen' },
  { id: 'water_masters', name: 'Wassermeister', description: 'Sammle 4 Wasser-Pokémon', required: [7, 54, 60, 86], emoji: '💧', reward: '🌊 Wasser-Master Titel' },
  { id: 'ghost_hunters', name: 'Geisterjäger', description: 'Fange alle Geist-Pokémon', required: [92, 562, 94], emoji: '👻', reward: '👻 Geisterjäger Titel' },
  { id: 'dragon_riders', name: 'Drachenreiter', description: 'Sammle alle Drachen-Pokémon', required: [147, 148, 443], emoji: '🐉', reward: '🐉 Drachen-Lord Titel' },
  { id: 'cute_crew', name: 'Niedlichkeits-Crew', description: 'Sammle die niedlichsten Pokémon', required: [35, 39, 133, 175], emoji: '🩷', reward: '🌸 Süß & Stark Titel' },
  { id: 'gen1_complete', name: 'Kanto Komplett', description: 'Sammle 15 verschiedene Gen-1 Pokémon', required: [1, 4, 7, 19, 25, 52, 54, 58, 60, 63, 66, 74, 77, 81, 90], emoji: '🔴', reward: '🏅 Kanto Champion Rahmen' },
];

function getSprite(id, big = false) {
  if (big) return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

export default function PokemonCollectionPage() {
  const [user] = useState(() => {
    try { const u = localStorage.getItem('app_user'); return u ? JSON.parse(u) : null; } catch { return null; }
  });

  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSource, setFilterSource] = useState('all');

  // Load party and box
  const party = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('pkParty')) || []; } catch { return []; }
  }, []);
  const box = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('pkBox')) || []; } catch { return []; }
  }, []);
  const partyLevel = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('pkPartyLevel')) || {}; } catch { return {}; }
  }, []);
  const partyXP = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('pkPartyXP')) || {}; } catch { return {}; }
  }, []);
  const storyProgress = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('pkStoryProgress')) || { badges: [] }; } catch { return { badges: [] }; }
  }, []);

  // All unique caught pokemon (party + box, deduplicated by id for collection display)
  const allCaught = useMemo(() => {
    const all = [...party.filter(Boolean), ...box.filter(Boolean)];
    const map = new Map();
    all.forEach(p => { if (!map.has(p.id)) map.set(p.id, p); });
    return [...map.values()];
  }, [party, box]);

  const totalCaught = allCaught.length;

  // Filter caught pokemon
  const filteredCaught = useMemo(() => {
    let list = allCaught;
    if (searchQuery) list = list.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filterType !== 'all') list = list.filter(p => p.type === filterType);
    if (filterSource === 'bp') list = list.filter(p => p.obtained === 'battle_pass_s2');
    return list;
  }, [allCaught, searchQuery, filterType, filterSource]);

  const allTypes = useMemo(() => [...new Set(allCaught.map(p => p.type))].sort(), [allCaught]);

  // Collection set progress
  const collectionProgress = useMemo(() => COLLECTION_SETS.map(set => {
    const caughtIds = new Set(allCaught.map(p => p.id));
    const completedCount = set.required.filter(id => caughtIds.has(id)).length;
    const completed = completedCount === set.required.length;
    return { ...set, completedCount, completed };
  }), [allCaught]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p className="text-white/60">Bitte melde dich an</p>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen text-white relative overflow-x-hidden">
        <PokemonPageDecor page="collection" />

        {/* HEADER */}
        <div className="relative overflow-hidden pt-8 pb-10 px-4">
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 via-orange-500/5 to-transparent" />
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-yellow-400/20 rounded-full blur-[100px]" />

          <div className="relative max-w-6xl mx-auto">
            <div className="flex items-end gap-4 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-4xl shadow-xl shadow-yellow-400/40">📔</div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-1">Pokédex Album</h1>
                <p className="text-white/50 text-sm">Fange Pokémon im Spiel und sammle sie hier!</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Gefangen', value: totalCaught, icon: '🔴', color: 'from-red-500/20 to-red-600/20' },
                { label: 'In Party', value: party.filter(Boolean).length, icon: '🎒', color: 'from-green-500/20 to-green-600/20' },
                { label: 'In Box', value: box.filter(Boolean).length, icon: '📦', color: 'from-blue-500/20 to-blue-600/20' },
                { label: 'Orden', value: storyProgress.badges?.length || 0, icon: '🏅', color: 'from-yellow-400/20 to-orange-500/20' },
              ].map(({ label, value, icon, color }) => (
                <motion.div key={label} whileHover={{ y: -4 }}
                  className={`p-4 rounded-2xl bg-gradient-to-br ${color} border border-white/10`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span>{icon}</span>
                    <span className="text-xs text-white/50 font-bold">{label}</span>
                  </div>
                  <p className="text-2xl font-black text-white">{value}</p>
                </motion.div>
              ))}
            </div>

            <Link to={createPageUrl('PokemonGame')}>
              <Button className="bg-gradient-to-r from-red-600 to-orange-500 text-white font-black">
                🎮 Pokémon fangen
              </Button>
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 pb-16">

          {/* DEIN POKÉDEX */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="text-2xl font-black flex items-center gap-2">🎯 Dein Pokédex ({totalCaught})</h2>
              <div className="flex gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                  <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Suchen..." className="bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/30 outline-none focus:border-white/30 w-32" />
                </div>
                <select value={filterType} onChange={e => setFilterType(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-white/30">
                  <option value="all">Alle Typen</option>
                  {allTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={filterSource} onChange={e => setFilterSource(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-white/30">
                  <option value="all">Alle Quellen</option>
                  <option value="bp">🏆 Battle Pass</option>
                </select>
              </div>
            </div>

            {totalCaught === 0 ? (
              <div className="text-center py-16 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-white/40 font-bold mb-2">Dein Pokédex ist leer!</p>
                <p className="text-white/25 text-sm mb-4">Spiele das Pokémon-Spiel und fange Pokémon mit Pokébällen.</p>
                <Link to={createPageUrl('PokemonGame')}>
                  <Button size="sm" className="bg-red-600 hover:bg-red-500 text-white">Jetzt spielen</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {filteredCaught.map((pokemon) => {
                  const level = partyLevel[pokemon.id] || 5;
                  const inParty = party.filter(Boolean).find(p => p.id === pokemon.id);
                  const typeColor = TYPE_COLORS[pokemon.type] || '#888';
                  return (
                    <motion.button key={pokemon.id} whileHover={{ scale: 1.06, y: -4 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedPokemon(pokemon)}
                      className={`relative p-2 rounded-2xl border-2 transition-all text-center ${
                        selectedPokemon?.id === pokemon.id ? 'border-yellow-400 bg-yellow-400/20' : inParty ? 'border-green-400/40 bg-green-500/8' : 'border-white/10 bg-white/[0.04] hover:border-white/25'
                      }`}>
                      {inParty && <div className="absolute top-1 left-1 text-[8px]">🎒</div>}
                      <div className="absolute top-1 right-1 flex flex-col gap-0.5 items-end">
                        {pokemon.obtained === 'battle_pass_s2' && <span className="text-[8px] bg-yellow-500/20 text-yellow-300 px-1 rounded-sm border border-yellow-500/40">BP</span>}
                        {pokemon.isShiny && <span className="text-[10px]">✨</span>}
                      </div>
                      <img src={getSprite(pokemon.id)} alt={pokemon.name} className="w-12 h-12 mx-auto object-contain" style={{ imageRendering: 'pixelated' }} />
                      <p className="text-[9px] font-bold text-white truncate mt-1">{pokemon.name}</p>
                      <span className="text-[8px] px-1.5 py-0.5 rounded-full text-white font-bold" style={{ backgroundColor: typeColor + '90' }}>{pokemon.type}</span>
                      <p className="text-[8px] text-white/40 mt-0.5">Lv.{level}</p>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          {/* SAMMLUNG-SETS */}
          <div>
            <h2 className="text-2xl font-black mb-4 flex items-center gap-2"><span>🏆</span> Sammlung-Sets</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {collectionProgress.map((set) => {
                const pct = Math.floor(set.completedCount / set.required.length * 100);
                return (
                  <motion.div key={set.id} whileHover={{ scale: 1.01 }}
                    className={`relative rounded-2xl p-5 border-2 overflow-hidden transition-all ${
                      set.completed ? 'bg-gradient-to-br from-yellow-500/15 to-orange-500/15 border-yellow-400/50 shadow-lg shadow-yellow-400/10' : 'bg-white/[0.04] border-white/10'
                    }`}>
                    {set.completed && <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-transparent pointer-events-none" />}
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{set.emoji}</span>
                          <div>
                            <h3 className="text-base font-black text-white">{set.name}</h3>
                            <p className="text-xs text-white/50">{set.description}</p>
                          </div>
                        </div>
                        {set.completed ? <Unlock className="w-5 h-5 text-yellow-400 flex-shrink-0" /> : <Lock className="w-5 h-5 text-white/30 flex-shrink-0" />}
                      </div>

                      {/* Progress */}
                      <div className="mb-3">
                        <div className="flex justify-between text-[10px] text-white/40 mb-1">
                          <span>{set.completedCount}/{set.required.length}</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div className="h-full rounded-full" style={{ background: set.completed ? 'linear-gradient(90deg, #fbbf24, #f97316)' : 'linear-gradient(90deg, #06b6d4, #818cf8)', width: `${pct}%` }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} />
                        </div>
                      </div>

                      {/* Required sprites */}
                      <div className="flex gap-1 mb-3">
                        {set.required.map(id => {
                          const caught = allCaught.find(p => p.id === id);
                          return (
                            <div key={id} className={`w-10 h-10 rounded-lg border flex items-center justify-center ${caught ? 'bg-green-500/20 border-green-400/40' : 'bg-white/5 border-white/10'}`}>
                              {caught ? (
                                <img src={getSprite(id)} alt="" className="w-9 h-9" style={{ imageRendering: 'pixelated' }} />
                              ) : (
                                <span className="text-xs">❓</span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {set.completed ? (
                        <div className="px-3 py-2 rounded-xl bg-yellow-400/20 border border-yellow-400/40 text-xs font-black text-yellow-300">
                          ✨ Belohnung: {set.reward}
                        </div>
                      ) : (
                        <p className="text-[10px] text-white/30">Noch {set.required.length - set.completedCount} Pokémon zu fangen</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* POKEMON DETAIL MODAL */}
        <AnimatePresence>
          {selectedPokemon && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedPokemon(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-end md:items-center justify-center p-4">
              <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-sm rounded-3xl p-6 bg-gradient-to-br from-slate-900 to-black border border-yellow-400/30 shadow-2xl">
                <div className="text-center">
                  <img src={getSprite(selectedPokemon.id, true)} alt={selectedPokemon.name}
                    className="w-36 h-36 object-contain mx-auto mb-3 drop-shadow-2xl" />
                  <h2 className="text-3xl font-black text-white mb-1">{selectedPokemon.name}</h2>
                  <span className="text-xs px-2.5 py-1 rounded-full font-bold text-white"
                    style={{ backgroundColor: (TYPE_COLORS[selectedPokemon.type] || '#888') + 'cc' }}>
                    {selectedPokemon.type}
                  </span>
                  <div className="grid grid-cols-3 gap-2 mt-4 mb-4">
                    {[['❤️ HP', selectedPokemon.hp], ['⚔️ ATK', selectedPokemon.atk], ['🛡 DEF', selectedPokemon.def]].map(([label, val]) => (
                      <div key={label} className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-[10px] text-white/40 mb-1">{label}</p>
                        <p className="text-xl font-black text-white">{val}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-white/40 text-xs mb-1">Level: <span className="text-white font-bold">{partyLevel[selectedPokemon.id] || 5}</span></p>
                  {party.filter(Boolean).find(p => p.id === selectedPokemon.id) && (
                    <p className="text-green-400 text-xs font-bold mb-2">🎒 In deiner Party</p>
                  )}
                  {selectedPokemon.obtained === 'battle_pass_s2' && (
                    <p className="text-yellow-400 text-xs font-bold mb-2">🏆 Battle Pass Exklusiv</p>
                  )}
                  <p className="text-white/40 text-[10px] mb-4">
                    Teil von: {COLLECTION_SETS.filter(set => set.required.includes(selectedPokemon.id)).map(s => s.name).join(', ') || 'keinem Set'}
                  </p>
                  <Button onClick={() => setSelectedPokemon(null)} className="w-full">Schließen</Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}