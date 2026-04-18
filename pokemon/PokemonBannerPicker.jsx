/**
 * Lets users pick a Pokémon as their profile banner/partner.
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Check } from 'lucide-react';

const POKEMON_LIST = [
  { id: 1,   name: 'Bisasam',    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',   type: '🌿 Pflanze' },
  { id: 4,   name: 'Glumanda',   sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png',   type: '🔥 Feuer' },
  { id: 7,   name: 'Schiggy',    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png',   type: '💧 Wasser' },
  { id: 25,  name: 'Pikachu',    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',  type: '⚡ Elektro' },
  { id: 39,  name: 'Pummeluff',  sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/39.png',  type: '🌸 Normal' },
  { id: 52,  name: 'Mauzi',      sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/52.png',  type: '😈 Normal' },
  { id: 63,  name: 'Abra',       sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/63.png',  type: '🔮 Psycho' },
  { id: 94,  name: 'Gengar',     sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png',  type: '👻 Geist' },
  { id: 129, name: 'Karpador',   sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/129.png', type: '💧 Wasser' },
  { id: 131, name: 'Lapras',     sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/131.png', type: '🧊 Eis' },
  { id: 133, name: 'Evoli',      sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png', type: '🌟 Normal' },
  { id: 143, name: 'Relaxo',     sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png', type: '😴 Normal' },
  { id: 147, name: 'Dratini',    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/147.png', type: '🐉 Drache' },
  { id: 150, name: 'Mewtu',      sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png', type: '🔮 Psycho' },
  { id: 151, name: 'Mew',        sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png', type: '✨ Psycho' },
  { id: 196, name: 'Psiana',     sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/196.png', type: '🔮 Psycho' },
  { id: 197, name: 'Nachtara',   sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/197.png', type: '🌑 Unlicht' },
  { id: 245, name: 'Suicune',    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/245.png', type: '💧 Wasser' },
  { id: 249, name: 'Lugia',      sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/249.png', type: '🌀 Psycho' },
  { id: 250, name: 'Ho-Oh',      sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/250.png', type: '🔥 Feuer' },
  { id: 359, name: 'Absol',      sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/359.png', type: '🌑 Unlicht' },
  { id: 380, name: 'Latias',     sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/380.png', type: '🐉 Drache' },
  { id: 381, name: 'Latios',     sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/381.png', type: '🐉 Drache' },
  { id: 384, name: 'Rayquaza',   sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/384.png', type: '🐉 Drache' },
  { id: 448, name: 'Lucario',    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png', type: '⚔️ Kampf' },
  { id: 468, name: 'Togekiss',   sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/468.png', type: '🕊️ Fee' },
  { id: 493, name: 'Arceus',     sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/493.png', type: '✨ Normal' },
];

export default function PokemonBannerPicker({ currentPokemonId, onSelect }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(currentPokemonId || null);

  const filtered = POKEMON_LIST.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.type.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (pokemon) => {
    setSelected(pokemon.id);
    onSelect(pokemon);
  };

  const handleClear = () => {
    setSelected(null);
    onSelect(null);
  };

  const currentPokemon = POKEMON_LIST.find(p => p.id === selected);

  return (
    <div className="space-y-4">
      {/* Current partner preview */}
      <AnimatePresence mode="wait">
        {currentPokemon ? (
          <motion.div
            key={currentPokemon.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20"
          >
            <motion.img
              src={currentPokemon.sprite}
              alt={currentPokemon.name}
              className="w-20 h-20 object-contain drop-shadow-[0_0_12px_rgba(255,215,0,0.5)]"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="flex-1">
              <p className="text-yellow-300 font-bold text-lg">Partner: {currentPokemon.name}</p>
              <p className="text-white/50 text-sm">{currentPokemon.type}</p>
              <p className="text-white/40 text-xs mt-1">Wird auf deinem Profil als Begleiter angezeigt</p>
            </div>
            <button
              onClick={handleClear}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 rounded-2xl bg-white/5 border border-dashed border-white/10 text-center text-white/40 text-sm"
          >
            Kein Pokémon-Partner ausgewählt
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Pokémon suchen..."
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-yellow-500/40"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-64 overflow-y-auto pr-1">
        {filtered.map(pokemon => (
          <motion.button
            key={pokemon.id}
            type="button"
            onClick={() => handleSelect(pokemon)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative flex flex-col items-center gap-1 p-2 rounded-xl border transition-all duration-200 ${
              selected === pokemon.id
                ? 'bg-yellow-500/20 border-yellow-500/50 shadow-[0_0_12px_rgba(255,215,0,0.3)]'
                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
            }`}
            title={pokemon.name}
          >
            <img
              src={pokemon.sprite}
              alt={pokemon.name}
              className="w-10 h-10 object-contain"
            />
            <span className="text-[9px] text-white/60 truncate w-full text-center">{pokemon.name}</span>
            {selected === pokemon.id && (
              <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-yellow-400 rounded-full flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-black" />
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}