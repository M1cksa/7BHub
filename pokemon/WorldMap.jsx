import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Lock, Map, Zap, Gift, Swords, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─── Map Node Positions (% based, responsive) ────────────────────────────────
export const MAP_NODES = [
  // Starting area
  { id: 'pallet',   x: 12, y: 82, name: 'Alabastia',      type: 'town',    env: 'plains',  icon: '🏠', connects: ['route1'] },
  { id: 'route1',   x: 22, y: 75, name: 'Route 1',        type: 'route',   env: 'forest',  icon: '🌲', connects: ['pewter'] },
  { id: 'pewter',   x: 32, y: 68, name: 'Marmoria City',  type: 'gym',     env: 'cave',    icon: '🪨', connects: ['route2','secret_cave'] },
  { id: 'route2',   x: 44, y: 60, name: 'Route 3',        type: 'route',   env: 'water',   icon: '🌊', connects: ['cerulean'] },
  { id: 'secret_cave', x: 36, y: 82, name: '??? Höhle',   type: 'secret',  env: 'cave',    icon: '❓', connects: [] },
  { id: 'cerulean', x: 58, y: 52, name: 'Azuria City',    type: 'gym',     env: 'water',   icon: '💧', connects: ['route3','hidden_lake'] },
  { id: 'hidden_lake', x: 64, y: 68, name: 'Verborgener See', type: 'event', env: 'water', icon: '✨', connects: [] },
  { id: 'route3',   x: 70, y: 44, name: 'Route 6',        type: 'route',   env: 'plains',  icon: '⚡', connects: ['vermilion'] },
  { id: 'vermilion',x: 82, y: 36, name: 'Orania City',    type: 'gym',     env: 'plains',  icon: '⚡', connects: ['route4','mystery_hill'] },
  { id: 'mystery_hill', x: 88, y: 55, name: 'Mystischer Hügel', type: 'secret', env: 'forest', icon: '❓', connects: [] },
  { id: 'route4',   x: 78, y: 22, name: 'Route 9',        type: 'route',   env: 'forest',  icon: '🌸', connects: ['celadon'] },
  { id: 'celadon',  x: 62, y: 14, name: 'Prismania City', type: 'gym',     env: 'forest',  icon: '🌸', connects: ['route5'] },
  { id: 'route5',   x: 46, y: 14, name: 'Route 12',       type: 'route',   env: 'cave',    icon: '☠️', connects: ['fuchsia'] },
  { id: 'fuchsia',  x: 30, y: 22, name: 'Fuchsania City', type: 'gym',     env: 'cave',    icon: '☠️', connects: ['route6','ancient_ruins'] },
  { id: 'ancient_ruins', x: 18, y: 36, name: 'Alte Ruinen', type: 'event', env: 'cave',   icon: '🏛️', connects: [] },
  { id: 'route6',   x: 20, y: 48, name: 'Route 15',       type: 'route',   env: 'psychic', icon: '🔮', connects: ['saffron'] },
  { id: 'saffron',  x: 34, y: 52, name: 'Saffronia City', type: 'gym',     env: 'psychic', icon: '🔮', connects: ['route7'] },
  { id: 'route7',   x: 48, y: 78, name: 'Route 20',       type: 'route',   env: 'fire',    icon: '🌋', connects: ['cinnabar'] },
  { id: 'cinnabar', x: 62, y: 86, name: 'Zinnoberinsel',  type: 'gym',     env: 'fire',    icon: '🔥', connects: ['route8'] },
  { id: 'route8',   x: 78, y: 78, name: 'Route 22',       type: 'route',   env: 'dragon',  icon: '🐉', connects: ['viridian'] },
  { id: 'viridian', x: 88, y: 86, name: 'Vertania City',  type: 'gym',     env: 'cave',    icon: '🌍', connects: ['victory_road'] },
  { id: 'victory_road', x: 94, y: 70, name: 'Siegesstraße', type: 'special', env: 'dragon', icon: '⚔️', connects: ['elite4'] },
  { id: 'elite4',   x: 94, y: 52, name: 'Pokémon Liga 👑', type: 'champion', env: 'dragon', icon: '👑', connects: ['sevii1','dragon_summit'] },

  // ── POST-GAME CONTENT (freigeschaltet nach Champ-Titel) ────────────────────
  // Sevii-Inseln
  { id: 'sevii1',   x: 94, y: 30, name: 'Sevii-Insel 1',  type: 'postgame', env: 'water',   icon: '🏝️', connects: ['sevii2','moltres_peak'] },
  { id: 'sevii2',   x: 82, y: 18, name: 'Sevii-Insel 2',  type: 'postgame', env: 'water',   icon: '🌊', connects: ['sevii3'] },
  { id: 'sevii3',   x: 68, y: 10, name: 'Insel der Kälte', type: 'postgame', env: 'water',  icon: '❄️', connects: ['articuno_shrine','johto_gate'] },
  // Legendary Shrines
  { id: 'moltres_peak',  x: 88, y: 14, name: 'Lavados-Gipfel',    type: 'legendary_spot', env: 'fire',    icon: '🔥', connects: [] },
  { id: 'articuno_shrine', x: 55, y: 5, name: 'Arktos-Schrein',   type: 'legendary_spot', env: 'water',  icon: '❄️', connects: [] },
  { id: 'johto_gate',   x: 40, y: 10, name: 'Johto-Tor',          type: 'postgame', env: 'plains',  icon: '🌀', connects: ['mt_mortar','lugia_ruins'] },
  // Johto-Gebiete
  { id: 'mt_mortar',    x: 25, y: 12, name: 'Mörser-Berg',         type: 'postgame', env: 'cave',    icon: '⛰️', connects: ['dragon_shrine'] },
  { id: 'dragon_shrine',x: 12, y: 22, name: 'Drachenschrein',      type: 'legendary_spot', env: 'dragon', icon: '🐉', connects: [] },
  { id: 'lugia_ruins',  x: 30, y: 5,  name: 'Lugia-Tempel',        type: 'legendary_spot', env: 'water',  icon: '🌌', connects: [] },
  // Kanto Rematch / Extra Content
  { id: 'dragon_summit',x: 78, y: 5,  name: 'Drachen-Gipfel',      type: 'postgame', env: 'dragon',  icon: '⚔️', connects: ['cerulean_cave'] },
  { id: 'cerulean_cave',x: 64, y: 18, name: 'Blaue Höhle',         type: 'legendary_spot', env: 'psychic', icon: '💜', connects: [] },
];

// Node type → color/style
const NODE_STYLES = {
  town:           { bg: '#1e3a5f', border: '#3b82f6', glow: 'rgba(59,130,246,0.5)',  size: 36 },
  route:          { bg: '#1a3a1a', border: '#4ade80', glow: 'rgba(74,222,128,0.4)',  size: 32 },
  gym:            { bg: '#3b1f1f', border: '#f97316', glow: 'rgba(249,115,22,0.6)',  size: 42 },
  secret:         { bg: '#1f1f3b', border: '#818cf8', glow: 'rgba(129,140,248,0.5)', size: 34 },
  event:          { bg: '#3b2e0a', border: '#fbbf24', glow: 'rgba(251,191,36,0.6)',  size: 36 },
  special:        { bg: '#2e1f3b', border: '#c084fc', glow: 'rgba(192,132,252,0.6)', size: 38 },
  champion:       { bg: '#3b1f00', border: '#fcd34d', glow: 'rgba(252,211,77,0.8)',  size: 48 },
  postgame:       { bg: '#0a2a3b', border: '#22d3ee', glow: 'rgba(34,211,238,0.6)',  size: 38 },
  legendary_spot: { bg: '#2a0a3b', border: '#e879f9', glow: 'rgba(232,121,249,0.8)', size: 44 },
};

// Hidden item rewards for secret/event nodes
export const HIDDEN_REWARDS = {
  secret_cave:      { type: 'item', items: ['superp', 'xatk'], coins: 500,   text: 'Du findest einen verborgenen Schatz!' },
  hidden_lake:      { type: 'pokemon', pokeId: 131, text: 'Ein wildes Lapras wartet am See!' },
  mystery_hill:     { type: 'item', items: ['revive', 'superp'], coins: 800,  text: 'Mysteriöse Runen enthüllen sich — Belohnungen!' },
  ancient_ruins:    { type: 'item', items: ['xatk', 'xdef', 'fullheal'], coins: 1200, text: 'Uralte Kräfte stärken dich!' },
  // Post-Game Rewards
  sevii1:           { type: 'item', items: ['revive', 'superp', 'xatk'], coins: 2000, text: 'Willkommen auf den Sevii-Inseln! Die Wächter begrüßen dich!' },
  sevii2:           { type: 'pokemon', pokeId: 131, text: 'Ein wildes Lapras schwimmt in diesen Gewässern!' },
  sevii3:           { type: 'item', items: ['superp', 'fullheal', 'xdef'], coins: 2500, text: 'Eisige Stürme verbergen mächtige Schätze!' },
  moltres_peak:     { type: 'pokemon', pokeId: 146, text: 'LAVADOS thronte auf dem Gipfel — es dreht sich zu dir!' },
  articuno_shrine:  { type: 'pokemon', pokeId: 144, text: 'ARKTOS erwacht... Das Eis splittert unter seinen Flügeln!' },
  johto_gate:       { type: 'item', items: ['revive', 'revive', 'superp'], coins: 3000, text: 'Das Johto-Tor öffnet sich — eine neue Welt erwartet dich!' },
  mt_mortar:        { type: 'item', items: ['xatk', 'xdef', 'superp', 'fullheal'], coins: 2200, text: 'Der Mörser-Berg birgt Geheimnisse aus Johto!' },
  dragon_shrine:    { type: 'pokemon', pokeId: 149, text: 'DRAGORAN erwacht aus seinem ewigen Schlummer!' },
  lugia_ruins:      { type: 'pokemon', pokeId: 249, text: 'LUGIA taucht aus den Tiefen auf — das Wasser tobt!' },
  dragon_summit:    { type: 'item', items: ['xatk', 'xatk', 'superp', 'revive'], coins: 4000, text: 'Am Drachen-Gipfel wartet die härteste Prüfung!' },
  cerulean_cave:    { type: 'pokemon', pokeId: 150, text: 'MEWTU... Es mustert dich mit glühenden Augen.' },
};

// Story zone mapping: nodeId → STORY_ZONES index
export const NODE_TO_ZONE = {
  route1:       0,
  pewter:       1,
  route2:       2,
  cerulean:     3,
  route3:       4,
  vermilion:    5,
  route4:       6,
  celadon:      7,
  route5:       8,
  fuchsia:      9,
  route6:       10,
  saffron:      11,
  route7:       12,
  cinnabar:     13,
  route8:       14,
  viridian:     15,
  elite4:       16,
};

const POST_GAME_NODES = ['sevii1','sevii2','sevii3','moltres_peak','articuno_shrine','johto_gate','mt_mortar','dragon_shrine','lugia_ruins','dragon_summit','cerulean_cave'];

function getNodeStatus(nodeId, storyProgress, exploredNodes) {
  const zoneIdx = NODE_TO_ZONE[nodeId];
  const isChampion = storyProgress.zoneIndex >= 17; // alle 17 Zonen abgeschlossen
  if (nodeId === 'pallet') return 'done';
  if (nodeId === 'victory_road') return storyProgress.zoneIndex >= 15 ? 'current' : 'locked';

  // Post-Game Nodes: nur nach Champ-Titel
  if (POST_GAME_NODES.includes(nodeId)) {
    if (!isChampion) return 'locked';
    const parent = MAP_NODES.find(n => n.connects.includes(nodeId));
    if (parent) {
      const parentStatus = getNodeStatus(parent.id, storyProgress, exploredNodes);
      if (parentStatus === 'locked') return 'locked';
    }
    return exploredNodes.includes(nodeId) ? 'done' : 'available';
  }

  // Secret/event nodes: unlocked by exploring adjacent nodes
  const node = MAP_NODES.find(n => n.id === nodeId);
  if (node?.type === 'secret' || node?.type === 'event') {
    const parent = MAP_NODES.find(n => n.connects.includes(nodeId));
    if (parent && getNodeStatus(parent.id, storyProgress, exploredNodes) !== 'locked') {
      return exploredNodes.includes(nodeId) ? 'done' : 'available';
    }
    return 'locked';
  }

  if (zoneIdx === undefined) return 'locked';
  if (zoneIdx < storyProgress.zoneIndex) return 'done';
  if (zoneIdx === storyProgress.zoneIndex) return 'current';
  const parentNode = MAP_NODES.find(n => n.connects.includes(nodeId));
  if (parentNode) {
    const parentStatus = getNodeStatus(parentNode.id, storyProgress, exploredNodes);
    if (parentStatus === 'done' || parentStatus === 'current') return 'current';
  }
  return 'locked';
}

export default function WorldMap({ storyProgress, exploredNodes = [], onNodeSelect, onBack }) {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [camX, setCamX] = useState(0);
  const [camY, setCamY] = useState(0);
  const [zoom, setZoom] = useState(1);
  const mapRef = useRef(null);

  const handleNodeClick = (node) => {
    const status = getNodeStatus(node.id, storyProgress, exploredNodes);
    if (status === 'locked') return;
    setSelectedNode(node);
  };

  const handleConfirm = () => {
    if (selectedNode) onNodeSelect(selectedNode);
    setSelectedNode(null);
  };

  // Auto-center on current node
  useEffect(() => {
    const currentNode = MAP_NODES.find(n => getNodeStatus(n.id, storyProgress, exploredNodes) === 'current');
    if (currentNode && mapRef.current) {
      const w = mapRef.current.clientWidth;
      const h = mapRef.current.clientHeight;
      setCamX(-(currentNode.x / 100 * 900 - w / 2));
      setCamY(-(currentNode.y / 100 * 520 - h / 2));
    }
  }, [storyProgress]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-white/10 select-none" style={{ height: 520, background: 'linear-gradient(135deg,#040d20 0%,#061428 40%,#040a18 100%)' }}>
      {/* Sky stars */}
      {Array.from({ length: 40 }).map((_, i) => (
        <div key={i} className="absolute rounded-full bg-white/40"
          style={{ left: `${(i * 37 + 7) % 100}%`, top: `${(i * 23 + 5) % 60}%`, width: i % 3 === 0 ? 2 : 1, height: i % 3 === 0 ? 2 : 1, opacity: 0.3 + (i % 5) * 0.1 }} />
      ))}

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'linear-gradient(#4ade80 1px, transparent 1px),linear-gradient(90deg,#4ade80 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Map canvas */}
      <div ref={mapRef} className="absolute inset-0 overflow-hidden">
        <div style={{ transform: `translate(${camX}px,${camY}px) scale(${zoom})`, transformOrigin: 'center', transition: 'transform 0.5s ease', width: 900, height: 520, position: 'relative' }}>

          {/* SVG connection lines */}
          <svg className="absolute inset-0 w-full h-full" style={{ width: 900, height: 520 }}>
            {MAP_NODES.map(node =>
              node.connects.map(targetId => {
                const target = MAP_NODES.find(n => n.id === targetId);
                if (!target) return null;
                const status = getNodeStatus(node.id, storyProgress, exploredNodes);
                const isDone = status === 'done';
                const isCurrent = status === 'current';
                return (
                  <line key={`${node.id}-${targetId}`}
                    x1={node.x / 100 * 900} y1={node.y / 100 * 520}
                    x2={target.x / 100 * 900} y2={target.y / 100 * 520}
                    stroke={isDone ? '#4ade80' : isCurrent ? '#60a5fa' : '#ffffff18'}
                    strokeWidth={isDone ? 2 : 1.5}
                    strokeDasharray={isDone ? 'none' : '6 4'}
                    opacity={isDone ? 0.7 : 0.4}
                  />
                );
              })
            )}
          </svg>

          {/* Nodes */}
          {MAP_NODES.map(node => {
            const status = getNodeStatus(node.id, storyProgress, exploredNodes);
            const style = NODE_STYLES[node.type] || NODE_STYLES.route;
            const isLocked = status === 'locked';
            const isCurrent = status === 'current';
            const isDone = status === 'done';
            const isSelected = selectedNode?.id === node.id;
            const size = style.size;

            // Show Pokémon sprite for gym/champion/legendary nodes
            const showSprite = !isLocked && (node.type === 'gym' || node.type === 'champion' || node.type === 'legendary_spot');
            const spriteId = node.type === 'champion' ? 149 : node.type === 'legendary_spot' ? 
              (node.id === 'cerulean_cave' ? 150 : node.id === 'lugia_ruins' ? 249 : node.id === 'dragon_shrine' ? 149 : node.id === 'moltres_peak' ? 146 : node.id === 'articuno_shrine' ? 144 : 150) : null;

            return (
              <motion.button key={node.id}
                className="absolute flex items-center justify-center rounded-full border-2 font-bold text-lg transition-all overflow-visible"
                style={{
                  left: `${node.x}%`, top: `${node.y}%`,
                  transform: `translate(-50%,-50%)`,
                  width: size, height: size,
                  background: isLocked ? '#111' : style.bg,
                  borderColor: isLocked ? '#333' : isSelected ? '#fff' : style.border,
                  boxShadow: isLocked ? 'none' : `0 0 ${isSelected ? 24 : 12}px ${style.glow}`,
                  opacity: isLocked ? 0.35 : 1,
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  zIndex: isSelected ? 20 : 10,
                }}
                whileHover={!isLocked ? { scale: 1.25 } : {}}
                whileTap={!isLocked ? { scale: 0.95 } : {}}
                animate={isCurrent && !isSelected ? { boxShadow: [`0 0 12px ${style.glow}`, `0 0 28px ${style.glow}`, `0 0 12px ${style.glow}`] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
                onClick={() => !isLocked && handleNodeClick(node)}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}>

                {/* Pokémon sprite for special nodes */}
                {showSprite && spriteId ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <motion.img
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${spriteId}.png`}
                      alt="" className="w-full h-full object-contain" style={{ imageRendering: 'pixelated' }}
                      animate={isCurrent ? { y: [-2, 2, -2] } : {}}
                      transition={{ repeat: Infinity, duration: 1.5 }} />
                  </div>
                ) : (
                  <span>{isLocked ? '🔒' : isDone ? '✅' : node.icon}</span>
                )}

                {/* Current pulse ring */}
                {isCurrent && (
                  <motion.div className="absolute inset-0 rounded-full"
                    style={{ border: `2px solid ${style.border}` }}
                    animate={{ scale: [1, 1.6, 1], opacity: [0.8, 0, 0.8] }}
                    transition={{ repeat: Infinity, duration: 2 }} />
                )}
                {/* Legendary glow effect */}
                {node.type === 'legendary_spot' && !isLocked && (
                  <motion.div className="absolute inset-0 rounded-full pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${style.glow}, transparent 70%)` }}
                    animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1.1, 0.8] }}
                    transition={{ repeat: Infinity, duration: 2.5 }} />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredNode && !selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur border border-white/20 rounded-2xl px-4 py-2.5 z-30 pointer-events-none text-center">
            <p className="text-white font-black text-sm">{hoveredNode.name}</p>
            <p className="text-white/50 text-xs capitalize">{
              hoveredNode.type === 'gym' ? '🏟️ Arena' :
              hoveredNode.type === 'secret' ? '🔍 Geheimgebiet' :
              hoveredNode.type === 'event' ? '✨ Besonderes Ereignis' :
              hoveredNode.type === 'postgame' ? '🌐 Post-Game Gebiet' :
              hoveredNode.type === 'legendary_spot' ? '⭐ Legendäres Pokémon!' :
              hoveredNode.type
            }</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected node popup */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 flex items-center justify-center z-40 bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/20 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
              <div className="text-4xl mb-3 text-center">{selectedNode.icon}</div>
              <h3 className="text-xl font-black text-white text-center mb-1">{selectedNode.name}</h3>
              <p className="text-white/50 text-xs text-center capitalize mb-4">
                {selectedNode.type === 'gym' ? '🏟️ Arena — Besiege den Arenaleiter!' :
                 selectedNode.type === 'secret' ? '🔍 Geheimort — Erkunde und finde verborgene Items!' :
                 selectedNode.type === 'event' ? '✨ Besonderes Ereignis wartet auf dich!' :
                 selectedNode.type === 'champion' ? '👑 Pokémon Liga — Der finale Kampf!' :
                 selectedNode.type === 'postgame' ? '🌐 Post-Game — Neue Herausforderungen nach dem Champ!' :
                 selectedNode.type === 'legendary_spot' ? '⭐ Legendäres Pokémon wartet hier!' :
                 '🛤️ Route — Trainer fordern dich heraus!'}
              </p>
              {HIDDEN_REWARDS[selectedNode.id] && (
                <div className="mb-4 p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-center">
                  <p className="text-yellow-300 text-xs font-bold">⚠️ Noch nicht erkundet — Belohnungen warten!</p>
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={() => setSelectedNode(null)} variant="outline" className="flex-1 border-white/20 text-white rounded-xl text-sm h-10">
                  Abbrechen
                </Button>
                <Button onClick={handleConfirm} className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black rounded-xl text-sm h-10">
                  <ChevronRight className="w-4 h-4 mr-1" /> Los!
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back button */}
      <button onClick={onBack}
        className="absolute top-4 left-4 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 border border-white/20 text-white/70 hover:text-white text-xs font-bold transition-all">
        <ChevronRight className="w-3.5 h-3.5 rotate-180" /> Menü
      </button>

      {/* Zoom controls */}
      <div className="absolute top-4 right-4 z-30 flex flex-col gap-1">
        {[{ label: '+', val: 0.2 }, { label: '−', val: -0.2 }].map(b => (
          <button key={b.label} onClick={() => setZoom(z => Math.max(0.6, Math.min(1.6, z + b.val)))}
            className="w-8 h-8 rounded-full bg-black/60 border border-white/20 text-white text-lg font-black flex items-center justify-center hover:bg-white/10 transition-all">
            {b.label}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-30 flex flex-col gap-1 bg-black/60 border border-white/10 rounded-xl p-2">
        {[['🟢', 'Abgeschlossen'], ['🔵', 'Aktuell'], ['🟣', 'Geheimort'], ['🟡', 'Event'], ['🩵', 'Post-Game'], ['💜', 'Legendär'], ['🔒', 'Gesperrt']].map(([ic, label]) => (
          <div key={label} className="flex items-center gap-1.5 text-[9px] text-white/50">
            <span>{ic}</span><span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}