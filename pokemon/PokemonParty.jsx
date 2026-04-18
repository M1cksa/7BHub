import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Package, ChevronLeft, ChevronRight, Repeat } from 'lucide-react';
import { XPBar } from './EvolutionSystem';

function getSprite(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

const TYPE_COLORS = {
  normal: '#A8A878', fire: '#F08030', water: '#6890F0', electric: '#F8D030',
  grass: '#78C850', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
  ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
  rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', dark: '#705848',
  steel: '#B8B8D0', fairy: '#EE99AC',
};

const PAGE_SIZE = 15;

function PartySlot({ poke, level, xp, isActive, onSelect, onRelease, onMoveToBox }) {
  if (!poke) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/2 h-14 opacity-40">
        <span className="text-white/20 text-xs">leer</span>
      </div>
    );
  }
  const typeColor = TYPE_COLORS[poke.type] || '#888';
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(poke)}
      className={`relative flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all group ${
        isActive ? 'border-yellow-400/60 bg-yellow-500/10' : 'border-white/10 bg-white/4 hover:bg-white/8'
      }`}>
      <button onClick={e => { e.stopPropagation(); onRelease(poke.id); }}
        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500/70 text-white hidden group-hover:flex items-center justify-center z-10 text-[8px]">
        <X className="w-2.5 h-2.5" />
      </button>
      {onMoveToBox && (
        <button onClick={e => { e.stopPropagation(); onMoveToBox(poke.id); }}
          className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-blue-500/70 text-white hidden group-hover:flex items-center justify-center z-10 text-[8px]"
          title="In Box legen">
          <Package className="w-2.5 h-2.5" />
        </button>
      )}
      <img src={getSprite(poke.id)} alt={poke.name} className="w-9 h-9 flex-shrink-0" style={{ imageRendering: 'pixelated' }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 mb-0.5">
          <span className="text-white font-black text-xs truncate">{poke.name}</span>
          {isActive && <Star className="w-2.5 h-2.5 text-yellow-400 flex-shrink-0" />}
        </div>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold text-white" style={{ backgroundColor: typeColor + '80' }}>{poke.type}</span>
        <span className="text-[9px] text-white/40 ml-1">Lv.{level || 5}</span>
        <XPBar currentXP={xp || 0} level={level || 5} small />
      </div>
    </motion.div>
  );
}

function BoxSlot({ poke, level, xp, onMoveToParty, onRelease }) {
  if (!poke) return null;
  const typeColor = TYPE_COLORS[poke.type] || '#888';
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
      className="relative p-2 rounded-xl border border-white/10 bg-white/4 hover:bg-white/8 cursor-pointer text-center group">
      <button onClick={() => onMoveToParty(poke.id)}
        className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 bg-green-500/20 rounded-xl flex items-center justify-center text-[8px] text-green-300 font-bold z-10">
        Party
      </button>
      <button onClick={e => { e.stopPropagation(); onRelease(poke.id); }}
        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500/70 text-white hidden group-hover:flex items-center justify-center z-20 text-[8px]">
        <X className="w-2.5 h-2.5" />
      </button>
      <img src={getSprite(poke.id)} alt={poke.name} className="w-10 h-10 mx-auto" style={{ imageRendering: 'pixelated' }} />
      <p className="text-white text-[8px] font-bold truncate">{poke.name}</p>
      <span className="text-[7px] px-1 rounded-full text-white font-bold" style={{ backgroundColor: typeColor + '80' }}>{poke.type}</span>
      <p className="text-white/40 text-[7px]">Lv.{level || 5}</p>
    </motion.div>
  );
}

export default function PokemonParty({ party, box, partyLevel, partyXP, activePokemon, onSelectActive, onRelease, onMoveToBox, onMoveToParty, onClose }) {
  const [tab, setTab] = useState('party'); // party | box
  const [boxPage, setBoxPage] = useState(0);

  const partyList = (party || []).filter(Boolean);
  const boxList = (box || []).filter(Boolean);
  const totalBoxPages = Math.ceil(boxList.length / PAGE_SIZE);
  const boxPageItems = boxList.slice(boxPage * PAGE_SIZE, (boxPage + 1) * PAGE_SIZE);

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
      className="bg-black/85 backdrop-blur-xl border border-white/10 rounded-3xl p-4 w-80 max-h-[85vh] flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex gap-1">
          <button onClick={() => setTab('party')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${tab === 'party' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>
            🎒 Party ({partyList.length}/6)
          </button>
          <button onClick={() => setTab('box')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${tab === 'box' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>
            📦 Box ({boxList.length})
          </button>
        </div>
        <button onClick={onClose} className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center transition-all">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {tab === 'party' && (
          <div className="space-y-1.5">
            {Array.from({ length: 6 }).map((_, i) => {
              const poke = partyList[i] || null;
              return (
                <div key={i} className="group">
                  <PartySlot
                    poke={poke}
                    level={poke ? (partyLevel?.[poke.id] || 5) : 0}
                    xp={poke ? (partyXP?.[poke.id] || 0) : 0}
                    isActive={poke && activePokemon?.id === poke.id}
                    onSelect={onSelectActive}
                    onRelease={onRelease}
                    onMoveToBox={onMoveToBox && poke ? onMoveToBox : null}
                  />
                </div>
              );
            })}
            {partyList.length === 0 && (
              <p className="text-white/25 text-xs text-center mt-3">Fange Pokémon um deine Party aufzubauen!</p>
            )}
          </div>
        )}

        {tab === 'box' && (
          <div>
            <p className="text-white/30 text-[10px] mb-2">Tippe auf ein Pokémon um es in die Party zu holen</p>
            {boxList.length === 0 ? (
              <p className="text-white/20 text-xs text-center py-6">Box ist leer — fange mehr Pokémon!</p>
            ) : (
              <>
                <div className="grid grid-cols-4 gap-1.5 mb-3">
                  {boxPageItems.map(poke => (
                    <BoxSlot key={poke.id + Math.random()}
                      poke={poke}
                      level={partyLevel?.[poke.id] || 5}
                      xp={partyXP?.[poke.id] || 0}
                      onMoveToParty={(id) => onMoveToParty && onMoveToParty(id)}
                      onRelease={onRelease}
                    />
                  ))}
                </div>
                {totalBoxPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <button disabled={boxPage === 0} onClick={() => setBoxPage(p => p - 1)}
                      className="p-1 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all">
                      <ChevronLeft className="w-3 h-3 text-white" />
                    </button>
                    <span className="text-white/40 text-xs">{boxPage + 1}/{totalBoxPages}</span>
                    <button disabled={boxPage >= totalBoxPages - 1} onClick={() => setBoxPage(p => p + 1)}
                      className="p-1 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all">
                      <ChevronRight className="w-3 h-3 text-white" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}