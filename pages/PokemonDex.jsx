import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Search, Filter, SortAsc, SortDesc, ChevronLeft, Star, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const TYPE_COLORS = {
  normal: 'bg-gray-400',
  fire: 'bg-red-500',
  water: 'bg-blue-500',
  grass: 'bg-green-500',
  electric: 'bg-yellow-400',
  ice: 'bg-cyan-300',
  fighting: 'bg-orange-600',
  poison: 'bg-purple-500',
  ground: 'bg-amber-600',
  flying: 'bg-indigo-400',
  psychic: 'bg-pink-500',
  bug: 'bg-lime-500',
  rock: 'bg-yellow-700',
  ghost: 'bg-indigo-600',
  dragon: 'bg-violet-600',
  dark: 'bg-slate-700',
  steel: 'bg-slate-400',
  fairy: 'bg-pink-300'
};

export default function PokemonDex() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRarity, setFilterRarity] = useState('all');
  const [sortBy, setSortBy] = useState('id_asc');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
      } catch (e) {
        const stored = localStorage.getItem('app_user');
        if (stored) setUser(JSON.parse(stored));
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const allPokemon = useMemo(() => {
    if (!user || !user.pokemon_story_progress) return [];
    const party = user.pokemon_story_progress.party || [];
    const box = user.pokemon_story_progress.box || [];
    const levels = user.pokemon_story_progress.pokemon_levels || {};
    
    // Combine and map current levels
    return [...party, ...box].map(p => ({
        ...p,
        currentLevel: levels[p.id] || p.startLevel || 5
    }));
  }, [user]);

  const uniqueTypes = useMemo(() => {
      const types = new Set(allPokemon.map(p => p.type).filter(Boolean));
      return Array.from(types);
  }, [allPokemon]);

  const uniqueRarities = useMemo(() => {
    const rarities = new Set(allPokemon.map(p => p.rarity).filter(Boolean));
    return Array.from(rarities);
  }, [allPokemon]);

  const filteredAndSortedPokemon = useMemo(() => {
    let result = [...allPokemon];

    // Filter
    if (searchTerm) {
      result = result.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (filterType !== 'all') {
      result = result.filter(p => p.type === filterType);
    }
    if (filterRarity !== 'all') {
      result = result.filter(p => p.rarity === filterRarity);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'id_asc': return a.id - b.id;
        case 'id_desc': return b.id - a.id;
        case 'name_asc': return a.name.localeCompare(b.name);
        case 'name_desc': return b.name.localeCompare(a.name);
        case 'level_desc': return (b.currentLevel) - (a.currentLevel);
        case 'level_asc': return (a.currentLevel) - (b.currentLevel);
        default: return 0;
      }
    });

    return result;
  }, [allPokemon, searchTerm, filterType, filterRarity, sortBy]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"/></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Bitte melde dich an</h2>
        <Link to={createPageUrl('SignIn')} className="px-6 py-3 bg-cyan-600 rounded-xl font-bold">Zum Login</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-24">
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6">
          <ChevronLeft className="w-5 h-5" /> Zurück zum Hub
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
              Pokémon-Dex
            </h1>
            <p className="text-white/60">
              Du hast <span className="text-cyan-400 font-bold">{allPokemon.length}</span> Pokémon gesammelt.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input 
                placeholder="Pokémon suchen..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white/5 border-white/10"
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[140px] bg-white/5 border-white/10">
                <SelectValue placeholder="Typ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Typen</SelectItem>
                {uniqueTypes.map(t => (
                  <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterRarity} onValueChange={setFilterRarity}>
              <SelectTrigger className="w-[140px] bg-white/5 border-white/10">
                <SelectValue placeholder="Seltenheit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Seltenheiten</SelectItem>
                {uniqueRarities.map(r => (
                  <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px] bg-white/5 border-white/10">
                <SelectValue placeholder="Sortierung" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id_asc">Nummer (Aufsteigend)</SelectItem>
                <SelectItem value="id_desc">Nummer (Absteigend)</SelectItem>
                <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                <SelectItem value="level_desc">Level (Höchste)</SelectItem>
                <SelectItem value="level_asc">Level (Niedrigste)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Grid */}
        {filteredAndSortedPokemon.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredAndSortedPokemon.map((pokemon, idx) => (
                <motion.div
                  key={`${pokemon.id}-${idx}`}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="relative group rounded-3xl overflow-hidden"
                  style={{
                    background: pokemon.bg || 'rgba(255,255,255,0.05)',
                    border: `1px solid ${pokemon.border || 'rgba(255,255,255,0.1)'}`
                  }}
                >
                  {pokemon.glow && (
                    <div 
                      className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
                      style={{ background: `radial-gradient(circle at center, ${pokemon.glow} 0%, transparent 70%)` }}
                    />
                  )}

                  <div className="p-5 flex flex-col h-full relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-white/40 font-mono text-sm font-bold">
                        #{String(pokemon.id).padStart(4, '0')}
                      </span>
                      {pokemon.isShiny && (
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 animate-pulse" />
                      )}
                    </div>

                    <div className="h-32 flex items-center justify-center mb-4 relative">
                      <img 
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${pokemon.isShiny ? 'shiny/' : ''}${pokemon.id}.gif`}
                        alt={pokemon.name}
                        className="max-h-full max-w-full object-contain filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.isShiny ? 'shiny/' : ''}${pokemon.id}.png`;
                        }}
                      />
                    </div>

                    <div className="text-center mb-4">
                      <h3 className="text-xl font-black mb-2" style={{ color: pokemon.color || 'white' }}>
                        {pokemon.name}
                      </h3>
                      <div className="flex justify-center gap-2">
                        {pokemon.type && (
                          <Badge className={`${TYPE_COLORS[pokemon.type] || 'bg-gray-500'} text-white border-0 capitalize`}>
                            {pokemon.type}
                          </Badge>
                        )}
                        <Badge variant="outline" className="bg-white/5 backdrop-blur-md border-white/20 capitalize text-white">
                          Lv. {pokemon.currentLevel}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-white/10">
                      <div className="flex items-start gap-2 text-xs text-white/60 bg-black/20 p-3 rounded-xl border border-white/5">
                        <Info className="w-4 h-4 shrink-0 mt-0.5 text-cyan-400" />
                        <div>
                          <p className="font-bold text-white/80 mb-1">
                            {pokemon.ot ? `OT: ${pokemon.ot}` : 'Unbekannter Ursprung'}
                          </p>
                          <p className="line-clamp-2">
                            {pokemon.description || 'Ein geheimnisvolles Pokémon, das sich dir angeschlossen hat.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-white/40">
            <Search className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-xl font-bold">Keine Pokémon gefunden</p>
            <p className="text-sm">Passe deine Filter an oder spiele weiter, um mehr zu fangen.</p>
          </div>
        )}
      </div>
    </div>
  );
}