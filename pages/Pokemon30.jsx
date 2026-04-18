import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePokemonEvent } from '@/components/pokemon/PokemonEventContext';
import PokemonRewardClaim from '@/components/pokemon/PokemonRewardClaim';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// ─── Data ────────────────────────────────────────────────────────────────────
const GENERATIONS = [
  { gen: 'I',   years: '1996–1999', region: 'Kanto',   color: '#FF1744', pokemon: [1,4,7,25,52,94,131,143,150,151], starters: [1,4,7], mascot: 25 },
  { gen: 'II',  years: '1999–2002', region: 'Johto',   color: '#FF6D00', pokemon: [152,155,158,175,197,245,248,249,250,251], starters: [152,155,158], mascot: 175 },
  { gen: 'III', years: '2002–2006', region: 'Hoenn',   color: '#AA00FF', pokemon: [252,255,258,282,384,382,383,350,373,376], starters: [252,255,258], mascot: 384 },
  { gen: 'IV',  years: '2006–2010', region: 'Sinnoh',  color: '#2962FF', pokemon: [387,390,393,448,445,442,487,491,492,493], starters: [387,390,393], mascot: 487 },
  { gen: 'V',   years: '2010–2013', region: 'Einall',  color: '#00BCD4', pokemon: [495,498,501,571,643,644,646,637,635,609], starters: [495,498,501], mascot: 646 },
  { gen: 'VI',  years: '2013–2016', region: 'Kalos',   color: '#00C853', pokemon: [650,653,656,700,716,717,718,719,720,721], starters: [650,653,656], mascot: 716 },
  { gen: 'VII', years: '2016–2019', region: 'Alola',   color: '#FFAB00', pokemon: [722,725,728,778,785,786,787,788,789,790], starters: [722,725,728], mascot: 791 },
  { gen: 'VIII',years: '2019–2022', region: 'Galar',   color: '#E040FB', pokemon: [810,813,816,842,888,889,890,891,892,893], starters: [810,813,816], mascot: 888 },
  { gen: 'IX',  years: '2022–2026', region: 'Paldea',  color: '#F50057', pokemon: [906,909,912,987,996,999,1000,1001,1002,1003], starters: [906,909,912], mascot: 996 },
];

const FUN_FACTS = [
  { icon: '🎮', fact: 'Rote & Blaue Edition wurde 1996 in Japan veröffentlicht – der Start einer Ära!' },
  { icon: '🐛', fact: 'MissingNo. war ein berühmter Glitch in Gen I – der erste "Easter Egg Bug"!' },
  { icon: '⚡', fact: 'Pikachu wurde Maskottchen, weil Kinder ihn am süßesten fanden in Tests!' },
  { icon: '🏆', fact: 'Pokémon ist das zweitmeist-verkaufte Videospiel-Franchise der Welt!' },
  { icon: '🃏', fact: 'Die Pokémon-Sammelkarten wurden im ersten Jahr 1 Milliarde mal verkauft!' },
  { icon: '🌍', fact: 'Pokémon GO brachte 2016 über 45 Millionen Menschen täglich raus!' },
  { icon: '🧬', fact: 'Mew war als geheimes "Backup-Pokémon" kurz vor Release heimlich ins Spiel gecoded!' },
  { icon: '📺', fact: 'Der Pikachu-Schrei kommt von Sprecherin Ikue Ōtani – seit 1997!' },
  { icon: '🌊', fact: 'Relaxo im Original-Spielfilm konnte dich mit 50 Tonnen flach drücken! 😂' },
  { icon: '💫', fact: 'Es gibt heute über 1.000 verschiedene Pokémon – von ursprünglich 151!' },
];

const TIMELINE = [
  { year: 1996, label: 'Gen I', desc: 'Rote & Blaue Edition – 151 Pokémon', color: '#FF1744' },
  { year: 1998, label: 'Anime', desc: 'Satoshi & Pikachu auf großer Reise', color: '#FF6B00' },
  { year: 1999, label: 'Gen II', desc: 'Gold & Silber – 251 Pokémon, 2 Regionen', color: '#FF6D00' },
  { year: 2000, label: 'Film', desc: 'Mewtwo kehrt zurück', color: '#FFD700' },
  { year: 2002, label: 'Gen III', desc: 'Rubin & Saphir – Hoenn', color: '#AA00FF' },
  { year: 2006, label: 'Gen IV', desc: 'Diamant & Perl – online spielen!', color: '#2962FF' },
  { year: 2010, label: 'Gen V', desc: 'Schwarz & Weiß – neuer Anfang', color: '#00BCD4' },
  { year: 2013, label: 'Gen VI', desc: 'X & Y – 3D & Mega-Entwicklungen', color: '#00C853' },
  { year: 2016, label: 'GO',    desc: 'Pokémon GO revolutioniert Mobilgaming', color: '#FFAB00' },
  { year: 2019, label: 'Gen VIII',desc: 'Schwert & Schild – Dynamax', color: '#E040FB' },
  { year: 2022, label: 'Arceus',desc: 'Legenden: Arceus – Open World!', color: '#F50057' },
  { year: 2026, label: '🎉 30!', desc: 'Drei Jahrzehnte Abenteuer!', color: '#FFD700', highlight: true },
];

const POKEBALL_TYPES = [
  { name: 'Pokéball', color: '#CC0000', bg: '#fff', desc: 'Der Klassiker seit 1996' },
  { name: 'Superball', color: '#1565C0', bg: '#fff', desc: 'Doppelte Fangchance' },
  { name: 'Hyperball', color: '#f5f5f5', bg: '#1a1a1a', desc: 'Maximale Effizienz' },
  { name: 'Meisterball', color: '#7B1FA2', bg: '#fff', desc: 'Trifft immer – legendär selten' },
  { name: 'Heilball', color: '#F48FB1', bg: '#fff', desc: 'Heilt nach dem Fang' },
  { name: 'Traumball', color: '#4FC3F7', bg: '#0d0d1a', desc: 'Fängt schlafende Pokémon' },
];

const WEBSITE_GAME_FEATURES = [
  {
    title: 'Story-Abenteuer',
    icon: '🗺️',
    description: 'Reise durch Routen, Arenen und neue Kapitel wie Nebelkante Erwacht und den Legendenpfad.',
    cta: 'Story spielen',
    to: 'StoryMode',
    color: '#22c55e',
  },
  {
    title: 'Arena & Rangliste',
    icon: '⚔️',
    description: 'Miss dich in schnellen Duellen, baue Streaks auf und kämpfe dich an die Spitze der Trainerliste.',
    cta: 'Zum Pokemon-Spiel',
    to: 'PokemonGame',
    color: '#f97316',
  },
  {
    title: 'Sammlung & Teamaufbau',
    icon: '🎒',
    description: 'Baue deine Party auf, sammle seltene Monster und optimiere dein Team für Events, Raids und PvP.',
    cta: 'Sammlung ansehen',
    to: 'PokemonCollection',
    color: '#a855f7',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function PokeballSVG({ color = '#CC0000', bg = '#fff', size = 48 }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
      <circle cx="50" cy="50" r="48" fill={color} stroke="#111" strokeWidth="3"/>
      <path d="M2 50 Q2 98 50 98 Q98 98 98 50 Z" fill={bg}/>
      <rect x="2" y="47" width="96" height="6" fill="#111"/>
      <circle cx="50" cy="50" r="15" fill={bg} stroke="#111" strokeWidth="3"/>
      <circle cx="50" cy="50" r="7" fill={bg} stroke="#111" strokeWidth="2"/>
    </svg>
  );
}

function GenCard({ gen, index }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06 }}
      className="rounded-2xl overflow-hidden cursor-pointer group"
      style={{
        background: `linear-gradient(135deg, ${gen.color}15, ${gen.color}06)`,
        border: `1px solid ${gen.color}40`,
      }}
      onClick={() => setExpanded(e => !e)}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="font-black text-white text-lg">Gen {gen.gen}</span>
            <span className="text-white/40 text-xs ml-2">{gen.years}</span>
          </div>
          <span className="text-white/50 text-xs px-2 py-0.5 rounded-full" style={{ background: `${gen.color}25`, color: gen.color }}>
            {gen.region}
          </span>
        </div>
        {/* Starter row */}
        <div className="flex gap-2">
          {gen.starters.map(id => (
            <motion.img
              key={id}
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
              alt=""
              style={{ imageRendering: 'pixelated', width: 40, height: 40, filter: `drop-shadow(0 0 6px ${gen.color}88)` }}
              whileHover={{ scale: 1.3, y: -6 }}
            />
          ))}
          <motion.img
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${gen.mascot}.png`}
            alt=""
            style={{ imageRendering: 'pixelated', width: 40, height: 40, opacity: 0.6 }}
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
          />
        </div>
      </div>

      {/* Expanded: all pokemon */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 flex flex-wrap gap-1.5 border-t" style={{ borderColor: `${gen.color}25` }}>
              {gen.pokemon.map(id => (
                <motion.img
                  key={id}
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
                  alt=""
                  style={{ imageRendering: 'pixelated', width: 36, height: 36 }}
                  whileHover={{ scale: 1.4, y: -4 }}
                  className="cursor-pointer"
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Pokemon30() {
  const { isActive } = usePokemonEvent();
  const [user] = useState(() => { try { const u = localStorage.getItem('app_user'); return u ? JSON.parse(u) : null; } catch { return null; } });
  const [tab, setTab] = useState('timeline');
  const [factIdx, setFactIdx] = useState(0);
  const [pokeballSpin, setPokeballSpin] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => setFactIdx(i => (i + 1) % FUN_FACTS.length), 5000);
    return () => clearInterval(iv);
  }, []);

  if (!isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-6">
        <div>
          <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png"
            alt="" style={{ imageRendering: 'pixelated', width: 80, height: 80, filter: 'brightness(0) invert(1) blur(1px)' }}
            className="mx-auto mb-4 opacity-30"
          />
          <p className="text-white/30 text-lg font-bold">Das Event ist derzeit nicht aktiv.</p>
          <Link to={createPageUrl('Home')} className="text-cyan-400 text-sm mt-2 block">← Zurück zur Startseite</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <style>{`
        @keyframes pokeGoldShimmer { 0%{background-position:0%} 100%{background-position:300%} }
        @keyframes pokeRainbow {
          0%   { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        @keyframes pokeStar { 0%,100%{opacity:0.4;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }
      `}</style>

      {/* Hero */}
      <div className="relative overflow-hidden py-16 md:py-24 px-4 text-center"
        style={{ background: 'linear-gradient(160deg, #0a0018 0%, #0d1a30 50%, #120a00 100%)' }}
      >
        {/* Animated stars */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 3 + 1, height: Math.random() * 3 + 1,
                left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
                animation: `pokeStar ${2 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        {/* Huge rotating pokéball bg */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-[700px] h-[700px] rounded-full opacity-[0.04]"
            style={{ border: '80px solid #FFD700' }}
          />
        </motion.div>

        {/* Legendary trio */}
        <div className="flex justify-center gap-4 md:gap-10 mb-8 relative z-10">
          {[249, 250, 384].map((id, i) => (
            <motion.img
              key={id}
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
              alt=""
              style={{ imageRendering: 'pixelated', width: 72, height: 72, filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.7))' }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: [40, 0] }}
              transition={{ delay: i * 0.2, duration: 0.8 }}
              whileHover={{ scale: 1.3, filter: 'drop-shadow(0 0 30px rgba(255,215,0,1))' }}
            />
          ))}
        </div>

        {/* Title */}
        <motion.h1
          className="text-5xl md:text-8xl font-black tracking-tight mb-4 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{
            background: 'linear-gradient(90deg, #FFD700, #FF6B00, #FF1744, #FF6B00, #FFD700)',
            backgroundSize: '300% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'pokeGoldShimmer 5s linear infinite',
          }}
        >
          POKÉMON
        </motion.h1>
        <motion.div
          className="text-3xl md:text-5xl font-black text-white/90 mb-3 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <span style={{ color: '#FFD700' }}>30</span> Jahre Abenteuer
        </motion.div>
        <motion.p
          className="text-white/40 text-base md:text-lg relative z-10 max-w-xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          1996 – 2026 · Gotta Catch 'Em All · Danke für drei unvergessliche Jahrzehnte!
        </motion.p>

        {/* Rotating pokéball click-animation */}
        <motion.div
          className="flex justify-center mt-8 relative z-10 cursor-pointer"
          onClick={() => { setPokeballSpin(true); setTimeout(() => setPokeballSpin(false), 1000); }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            animate={pokeballSpin ? { rotate: 360 } : { rotate: [0, -5, 5, 0] }}
            transition={pokeballSpin ? { duration: 0.6 } : { repeat: Infinity, duration: 4, repeatDelay: 2 }}
            className="w-20 h-20 drop-shadow-[0_0_30px_rgba(255,50,50,0.7)]"
          >
            <PokeballSVG size={80} />
          </motion.div>
        </motion.div>
        <p className="text-white/20 text-xs mt-2 relative z-10">Klick auf den Pokéball!</p>

        {/* Gen I starters parade */}
        <div className="flex justify-center gap-6 mt-10 relative z-10">
          {[1,4,7,25,150,151].map((id, i) => (
            <motion.img
              key={id}
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
              alt=""
              style={{ imageRendering: 'pixelated', width: 44, height: 44, filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.6))' }}
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2 + i * 0.3, delay: i * 0.2, ease: 'easeInOut' }}
              whileHover={{ scale: 1.4, y: -12 }}
              className="cursor-pointer"
            />
          ))}
        </div>
      </div>

      {/* Fun Fact carousel */}
      <div className="max-w-2xl mx-auto px-4 -mt-4 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={factIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl p-4 flex items-center gap-4"
            style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.2)' }}
          >
            <span className="text-3xl">{FUN_FACTS[factIdx].icon}</span>
            <p className="text-white/70 text-sm font-medium">{FUN_FACTS[factIdx].fact}</p>
          </motion.div>
        </AnimatePresence>
        <div className="flex justify-center gap-1 mt-2">
          {FUN_FACTS.map((_, i) => (
            <button key={i} onClick={() => setFactIdx(i)}
              className="w-1.5 h-1.5 rounded-full transition-all"
              style={{ background: i === factIdx ? '#FFD700' : 'rgba(255,255,255,0.2)' }}
            />
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Tabs */}
        <div className="flex gap-2 flex-wrap mb-8 justify-center">
          {[
            { key: 'timeline', label: '⏱ Zeitstrahl' },
            { key: 'generations', label: '📖 Generationen' },
            { key: 'game', label: '🎮 Website-Spiel' },
            { key: 'pokeballs', label: '🔴 Pokébälle' },
            { key: 'claim', label: '🎁 Belohnung' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="px-4 py-2 rounded-xl font-bold text-sm transition-all"
              style={{
                background: tab === t.key ? 'linear-gradient(135deg, #FFD700, #FF6B00)' : 'rgba(255,255,255,0.05)',
                color: tab === t.key ? '#000' : 'rgba(255,255,255,0.6)',
                border: `1px solid ${tab === t.key ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* TIMELINE */}
          {tab === 'timeline' && (
            <motion.div key="timeline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="relative">
                {/* vertical line */}
                <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-white/10 md:-translate-x-1/2" />
                <div className="space-y-6">
                  {TIMELINE.map((item, i) => (
                    <motion.div
                      key={item.year}
                      initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-start gap-4 md:gap-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} pl-14 md:pl-0`}
                    >
                      {/* Content */}
                      <div className={`md:w-[45%] ${i % 2 === 0 ? 'md:text-right md:pr-8' : 'md:pl-8'}`}>
                        <div
                          className="inline-block px-3 py-1.5 rounded-xl mb-1"
                          style={{
                            background: item.highlight ? 'linear-gradient(135deg, #FFD700, #FF6B00)' : `${item.color}20`,
                            border: `1px solid ${item.color}50`,
                          }}
                        >
                          <span className="font-black text-sm" style={{ color: item.highlight ? '#000' : item.color }}>
                            {item.year} · {item.label}
                          </span>
                        </div>
                        <p className="text-white/60 text-sm">{item.desc}</p>
                      </div>
                      {/* Dot */}
                      <div className="absolute left-[18px] md:left-1/2 md:-translate-x-1/2 w-4 h-4 rounded-full border-2 border-white/30 flex items-center justify-center"
                        style={{ background: item.color, boxShadow: item.highlight ? `0 0 16px ${item.color}` : 'none' }}
                      >
                        {item.highlight && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* GENERATIONS */}
          {tab === 'generations' && (
            <motion.div key="gens" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <p className="text-white/40 text-sm text-center mb-6">Klick auf eine Generation für mehr Pokémon!</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {GENERATIONS.map((g, i) => <GenCard key={g.gen} gen={g} index={i} />)}
              </div>
            </motion.div>
          )}

          {/* WEBSITE GAME */}
          {tab === 'game' && (
            <motion.div key="game" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="text-center max-w-2xl mx-auto mb-8">
                <h2 className="text-2xl md:text-4xl font-black text-white mb-3">Pokémon jetzt direkt auf der Website spielen</h2>
                <p className="text-white/50 text-sm md:text-base">
                  Das Fanprojekt verbindet Sammeln, Story-Fortschritt, Arena-Kaempfe und Event-Content in einer eigenen Browser-Erfahrung.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {WEBSITE_GAME_FEATURES.map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="rounded-3xl p-5 h-full"
                    style={{
                      background: `linear-gradient(160deg, ${feature.color}20, rgba(255,255,255,0.03))`,
                      border: `1px solid ${feature.color}55`,
                    }}
                  >
                    <div className="text-3xl mb-3">{feature.icon}</div>
                    <h3 className="text-lg font-black text-white mb-2">{feature.title}</h3>
                    <p className="text-white/55 text-sm leading-relaxed mb-5">{feature.description}</p>
                    <Link to={createPageUrl(feature.to)}>
                      <button
                        className="w-full rounded-xl px-4 py-2.5 font-black text-sm transition-transform hover:scale-[1.02]"
                        style={{ background: feature.color, color: '#050505' }}
                      >
                        {feature.cta}
                      </button>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div
                className="rounded-3xl p-6 md:p-8 text-center"
                style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,107,0,0.08))', border: '1px solid rgba(255,215,0,0.22)' }}
              >
                <p className="text-yellow-300 text-xs font-black uppercase tracking-[0.22em] mb-2">Neu auf der Website</p>
                <h3 className="text-white text-2xl md:text-3xl font-black mb-3">Mehr Content fuer Sammler, Kaempfer und Entdecker</h3>
                <p className="text-white/55 max-w-2xl mx-auto mb-5">
                  Neue Story-Kapitel, sichtbare Feature-Highlights im Spielmenue und direkter Einstieg in Sammlung, Story und Arena sorgen fuer mehr Tiefe auf der Pokemon-Seite.
                </p>
                <Link to={createPageUrl('PokemonGame')}>
                  <button
                    className="rounded-xl px-6 py-3 font-black text-sm"
                    style={{ background: 'linear-gradient(135deg, #FFD700, #FF6B00)', color: '#050505' }}
                  >
                    Spiel jetzt starten
                  </button>
                </Link>
              </div>
            </motion.div>
          )}

          {/* POKÉBALLS */}
          {tab === 'pokeballs' && (
            <motion.div key="pokeballs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {POKEBALL_TYPES.map((ball, i) => (
                  <motion.div
                    key={ball.name}
                    initial={{ opacity: 0, scale: 0.85 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ y: -6, scale: 1.04 }}
                    className="rounded-2xl p-5 flex flex-col items-center gap-3 cursor-pointer group"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <motion.div
                      animate={{ rotate: [0, -8, 8, 0] }}
                      transition={{ repeat: Infinity, duration: 3 + i, repeatDelay: 1 }}
                    >
                      <PokeballSVG color={ball.color} bg={ball.bg} size={64} />
                    </motion.div>
                    <div className="text-center">
                      <div className="font-black text-white text-sm">{ball.name}</div>
                      <div className="text-white/40 text-xs mt-0.5">{ball.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* CLAIM */}
          {tab === 'claim' && (
            <motion.div key="claim" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="max-w-lg mx-auto">
                {user
                  ? <PokemonRewardClaim user={user} />
                  : (
                    <div className="text-center py-12">
                      <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"
                        alt="" style={{ imageRendering: 'pixelated', width: 80, height: 80 }}
                        className="mx-auto mb-4 drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]"
                      />
                      <p className="text-white/50 mb-4">Melde dich an um deine 30.000 Tokens zu holen!</p>
                      <Link to={createPageUrl('SignIn')}>
                        <button className="px-6 py-2.5 rounded-xl font-bold"
                          style={{ background: 'linear-gradient(135deg, #FFD700, #FF6B00)', color: '#000' }}>
                          Anmelden
                        </button>
                      </Link>
                    </div>
                  )
                }
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Gen I walk */}
      <div className="relative overflow-hidden py-8 px-4" style={{ background: 'rgba(255,215,0,0.02)', borderTop: '1px solid rgba(255,215,0,0.08)' }}>
        <p className="text-center text-white/20 text-xs mb-4">~ Alle Pokémon-Starter seit 1996 ~</p>
        <div className="flex justify-center gap-2 flex-wrap">
          {[1,4,7,152,155,158,252,255,258,387,390,393,495,498,501,650,653,656,722,725,728,810,813,816,906,909,912].map((id) => (
            <motion.img
              key={id}
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
              alt=""
              style={{ imageRendering: 'pixelated', width: 36, height: 36, opacity: 0.7 }}
              whileHover={{ scale: 1.5, opacity: 1, y: -6, filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.8))' }}
              className="cursor-pointer transition-opacity"
            />
          ))}
        </div>
        <p className="text-center text-white/10 text-xs mt-6">
          Pokémon™ ist Eigentum von Nintendo, Game Freak & Creatures Inc. · 30 Jahre Pokémon 1996–2026
        </p>
      </div>
    </div>
  );
}
