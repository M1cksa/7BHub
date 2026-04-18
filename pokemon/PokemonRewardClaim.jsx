import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const POKEBALL_SVG = (
  <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#CC0000" stroke="#111" strokeWidth="3"/>
    <path d="M2 50 Q2 98 50 98 Q98 98 98 50 Z" fill="#f5f5f5"/>
    <rect x="2" y="47" width="96" height="6" fill="#111"/>
    <circle cx="50" cy="50" r="15" fill="#f5f5f5" stroke="#111" strokeWidth="3"/>
    <circle cx="50" cy="50" r="8" fill="white" stroke="#111" strokeWidth="2"/>
  </svg>
);

const POKEMON_SPRITES = [
  { sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',  name: 'Pikachu' },
  { sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png',   name: 'Glurak' },
  { sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png', name: 'Mewtu' },
  { sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/151.png', name: 'Mew' },
  { sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/384.png', name: 'Rayquaza' },
];

function ConfettiParticle({ x, color, delay }) {
  const symbols = ['⭐', '✨', '🌟', '💫', '🎉', '🎊'];
  return (
    <motion.div
      className="absolute text-2xl pointer-events-none select-none"
      style={{ left: `${x}%`, top: '-10%' }}
      initial={{ y: 0, opacity: 1, rotate: 0 }}
      animate={{ y: '120vh', opacity: [1, 1, 0], rotate: 720 }}
      transition={{ duration: 2.5 + Math.random(), delay, ease: 'easeIn' }}
    >
      {symbols[Math.floor(Math.random() * symbols.length)]}
    </motion.div>
  );
}

export default function PokemonRewardClaim({ user, onClaimed }) {
  const [claimed, setClaimed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pokeballOpen, setPokeballOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);
  const [chosenPokemon] = useState(() => POKEMON_SPRITES[Math.floor(Math.random() * POKEMON_SPRITES.length)]);

  useEffect(() => {
    // Check if already claimed via localStorage key
    const key = `pokemon_30_reward_claimed_${user?.id}`;
    if (localStorage.getItem(key) === 'true') setAlreadyClaimed(true);
  }, [user?.id]);

  const handleClaim = async () => {
    if (loading || claimed || alreadyClaimed) return;
    setLoading(true);

    // Pokéball öffnen Animation
    setPokeballOpen(true);
    await new Promise(r => setTimeout(r, 1200));

    try {
      // Aktuellen Token-Stand direkt aus der DB holen (nicht aus dem möglicherweise veralteten prop)
      const freshUsers = await base44.entities.AppUser.filter({ id: user.id }, 1);
      const freshUser = freshUsers?.[0];
      const currentTokens = freshUser?.tokens ?? user?.tokens ?? 0;

      await base44.entities.AppUser.update(user.id, {
        tokens: currentTokens + 30000,
      });

      // LocalStorage setzen damit es nur einmal geht
      const key = `pokemon_30_reward_claimed_${user.id}`;
      localStorage.setItem(key, 'true');

      // User in localStorage aktualisieren
      const updatedUser = { ...(freshUser || user), tokens: currentTokens + 30000 };
      localStorage.setItem('app_user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('user-updated'));

      setClaimed(true);
      setShowSuccess(true);
      setShowConfetti(true);
      if (onClaimed) onClaimed(updatedUser);
    } catch {
      toast.error('Fehler beim Abholen der Belohnung.');
      setPokeballOpen(false);
    }
    setLoading(false);
  };

  const confettiItems = Array.from({ length: 20 }, (_, i) => i);

  if (alreadyClaimed) {
    return (
      <div
        className="rounded-2xl p-4 flex items-center gap-3"
        style={{
          background: 'linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,107,0,0.06))',
          border: '1px solid rgba(255,215,0,0.2)',
        }}
      >
        <img
          src={chosenPokemon.sprite}
          alt={chosenPokemon.name}
          className="w-10 h-10"
          style={{ imageRendering: 'pixelated' }}
        />
        <div>
          <p className="text-yellow-400 font-black text-sm">Belohnung bereits abgeholt ✅</p>
          <p className="text-white/40 text-xs">Du hast deine 30.000 Tokens bereits erhalten!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
            {confettiItems.map((i) => (
              <ConfettiParticle key={i} x={Math.random() * 100} color="" delay={i * 0.08} />
            ))}
          </div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0.3 }}
        className="relative rounded-3xl overflow-hidden cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, #1a0a2e 0%, #0d1a3a 40%, #1a0a0a 100%)',
          border: '2px solid #FFD700',
          boxShadow: '0 0 40px rgba(255,215,0,0.25), inset 0 0 60px rgba(255,215,0,0.03)',
        }}
        onClick={!claimed && !loading ? handleClaim : undefined}
      >
        {/* Pokédex-style decorative lines */}
        <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.06 }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="absolute w-full h-px bg-yellow-400" style={{ top: `${i * 14 + 7}%` }} />
          ))}
        </div>

        {/* Red/Blue stripes like a Pokédex */}
        <div className="absolute top-0 left-0 w-full h-2 flex">
          <div className="flex-1 bg-red-600" />
          <div className="w-16 bg-black" />
          <div className="flex-1 bg-blue-700" />
        </div>

        <AnimatePresence mode="wait">
          {!showSuccess ? (
            <motion.div
              key="claim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 pt-8"
            >
              <div className="flex items-start gap-5">
                {/* Pokéball */}
                <div className="relative flex-shrink-0">
                  <motion.div
                    className="w-20 h-20"
                    animate={pokeballOpen
                      ? { rotate: [0, -30, 30, -20, 20, 0], scale: [1, 1.3, 0.8, 1.2, 1] }
                      : { rotate: [0, -5, 5, 0] }
                    }
                    transition={pokeballOpen
                      ? { duration: 1, ease: 'easeInOut' }
                      : { repeat: Infinity, duration: 3, repeatDelay: 1 }
                    }
                  >
                    {POKEBALL_SVG}
                  </motion.div>
                  {/* Glint */}
                  {!pokeballOpen && (
                    <motion.div
                      className="absolute top-2 left-3 w-3 h-3 rounded-full bg-white/60 blur-[2px]"
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-xs font-black px-2 py-0.5 rounded-full"
                      style={{ background: '#FFD700', color: '#000' }}
                    >
                      🎂 30 JAHRE EVENT
                    </span>
                  </div>
                  <h3
                    className="font-black text-xl leading-tight mb-1"
                    style={{
                      background: 'linear-gradient(90deg, #FFD700, #FF6B00, #FFD700)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundSize: '200%',
                    }}
                  >
                    30.000 Tokens abholen!
                  </h3>
                  <p className="text-white/50 text-sm mb-4">
                    Pokémon feiert 30 Jahre – hol dir dein Jubiläumsgeschenk!<br/>
                    <span className="text-yellow-400/70 text-xs">Einmalig pro Event ⚡</span>
                  </p>

                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={loading}
                    className="w-full py-3 rounded-2xl font-black text-base relative overflow-hidden"
                    style={{
                      background: loading
                        ? 'rgba(255,215,0,0.3)'
                        : 'linear-gradient(135deg, #FFD700 0%, #FF6B00 50%, #CC0000 100%)',
                      color: '#000',
                      border: 'none',
                      boxShadow: loading ? 'none' : '0 4px 20px rgba(255,215,0,0.4)',
                    }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Öffne Pokéball...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <span>⚡</span>
                        Jetzt abholen
                        <span>⚡</span>
                      </span>
                    )}
                    {/* shine sweep */}
                    {!loading && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        initial={{ x: '-100%' }}
                        animate={{ x: '200%' }}
                        transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                      />
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="p-8 text-center"
            >
              <motion.img
                src={chosenPokemon.sprite}
                alt={chosenPokemon.name}
                className="w-24 h-24 mx-auto mb-3 drop-shadow-[0_0_20px_rgba(255,220,0,1)]"
                style={{ imageRendering: 'pixelated' }}
                animate={{ y: [0, -10, 0], scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', bounce: 0.6 }}
                className="text-5xl font-black mb-2"
                style={{
                  background: 'linear-gradient(90deg, #FFD700, #FF6B00, #FFD700)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundSize: '200%',
                }}
              >
                +30.000 ⚡
              </motion.div>
              <p className="text-white font-bold text-lg mb-1">Tokens erhalten!</p>
              <p className="text-white/50 text-sm">{chosenPokemon.name} übergibt dir dein Geschenk! 🎁</p>

              {/* Stars */}
              {[...Array(5)].map((_, i) => (
                <motion.span
                  key={i}
                  className="inline-block text-yellow-400 text-xl mx-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  ★
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 flex">
          <div className="flex-1 bg-red-600" />
          <div className="flex-1 bg-yellow-400" />
          <div className="flex-1 bg-blue-600" />
        </div>
      </motion.div>
    </div>
  );
}