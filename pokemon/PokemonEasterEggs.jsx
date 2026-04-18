/**
 * Pokémon Easter Eggs – liebevolle versteckte Animationen
 * 1. Snorlax schläft am unteren Rand
 * 2. Mew huscht vorbei (selten)
 * 3. Gengar-Gesicht im Hintergrund
 * 4. Pikachu-Idle-Buddy
 * 5. Magikarp springt aus dem Nichts hoch
 * 6. Togepi läuft über den Bildschirm (sehr klein)
 * 7. Lugia taucht nachts kurz auf (basierend auf Uhrzeit)
 * 8. Ditto verwandelt sich (Klick-Easter-Egg auf Snorlax)
 * 9. Regenbogen von Ho-Oh zieht durch
 * 10. Pokémon-Geburtstagstorte bei rundem Datum
 */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ────────────────────────────────────────────────────────────────────────────
// 1. SLEEPING SNORLAX (+ klickbar → Ditto)
// ────────────────────────────────────────────────────────────────────────────
function SleepingSnorlax() {
  const [show, setShow] = useState(false);
  const [isDitto, setIsDitto] = useState(false);
  const [clicks, setClicks] = useState(0);
  const [showMsg, setShowMsg] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 8000);
    return () => clearTimeout(t);
  }, []);

  const handleClick = () => {
    const next = clicks + 1;
    setClicks(next);
    if (next === 1) {
      setIsDitto(true);
      setShowMsg(true);
      setTimeout(() => setShowMsg(false), 2500);
      setTimeout(() => setIsDitto(false), 4000);
    } else {
      setIsDitto(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-24 right-4 select-none z-40 cursor-pointer"
          style={{ pointerEvents: 'auto' }}
          initial={{ x: 120, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 60, damping: 14, delay: 0.2 }}
          onClick={handleClick}
          title="Psst... klick mich!"
        >
          <div className="relative">
            <motion.img
              src={isDitto
                ? 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png'
                : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png'}
              alt={isDitto ? 'Ditto' : 'Snorlax'}
              style={{ imageRendering: 'pixelated', width: 64, height: 64 }}
              className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
              animate={isDitto ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : {}}
              transition={{ duration: 0.4 }}
            />
            {/* Z Z Z when sleeping */}
            {!isDitto && ['z', 'Z', 'Z'].map((z, i) => (
              <motion.span
                key={i}
                className="absolute font-black text-white/80 pointer-events-none"
                style={{ fontSize: 10 + i * 3, right: -6 - i * 4, top: -8 - i * 10 }}
                animate={{ y: [0, -8, -16], opacity: [0.9, 0.6, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, delay: i * 0.5 }}
              >
                {z}
              </motion.span>
            ))}
            {/* Ditto message */}
            <AnimatePresence>
              {showMsg && (
                <motion.div
                  className="absolute -top-16 left-1/2 -translate-x-1/2 bg-pink-500 text-white text-xs font-black px-3 py-1.5 rounded-xl whitespace-nowrap shadow-lg z-50"
                  initial={{ opacity: 0, scale: 0.7, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                >
                  Ditto! 🫧
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-pink-500" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 2. MEW DASH
// ────────────────────────────────────────────────────────────────────────────
function MewDash() {
  const [active, setActive] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const delay = 20000 + Math.random() * 30000;
    const t = setTimeout(() => { setActive(true); setTimeout(() => setDone(true), 3000); }, delay);
    return () => clearTimeout(t);
  }, []);

  if (!active || done) return null;
  return (
    <motion.div
      className="fixed pointer-events-none select-none"
      style={{ zIndex: 9998, top: '35%' }}
      initial={{ x: '110vw', opacity: 0 }}
      animate={{ x: '-20vw', opacity: [0, 1, 1, 0] }}
      transition={{ duration: 2.5, ease: 'easeInOut' }}
    >
      <div className="flex flex-col items-center">
        <motion.img
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/151.png"
          alt="Mew"
          style={{ imageRendering: 'pixelated', width: 56, height: 56, transform: 'scaleX(-1)' }}
          className="drop-shadow-[0_0_20px_rgba(255,150,220,0.9)]"
          animate={{ y: [0, -12, 0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
        />
        <span className="text-pink-300 text-xs font-black" style={{ textShadow: '0 0 8px rgba(255,150,220,0.9)', whiteSpace: 'nowrap' }}>
          Mew! ✨
        </span>
      </div>
    </motion.div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 3. GHOST GENGAR
// ────────────────────────────────────────────────────────────────────────────
function GhostGengar() {
  return (
    <motion.div
      className="fixed bottom-32 left-0 pointer-events-none select-none"
      style={{ zIndex: 1, opacity: 0 }}
      animate={{ opacity: [0, 0.07, 0.04, 0.08, 0], x: ['-50px', '-20px', '-35px'] }}
      transition={{ repeat: Infinity, duration: 22, ease: 'easeInOut', delay: 8 }}
    >
      <img
        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png"
        alt=""
        style={{ imageRendering: 'pixelated', width: 130, height: 130, filter: 'brightness(0) invert(1) blur(2px)' }}
      />
    </motion.div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 4. PIKACHU IDLE BUDDY
// ────────────────────────────────────────────────────────────────────────────
const IDLE_MESSAGES = [
  'Pika pi! Bist du noch da? 👀',
  'Pikaaaa~ Schau dir mehr Videos an! 🎬',
  'Chu! Such nach Pokémon-Easter-Eggs! 🥚',
  'Pikachu ist einsam... Klick irgendwas! 🥺',
  '⚡ Pika pika! 30 Jahre Pokémon! ⚡',
];

function PikachuIdleBuddy() {
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState(IDLE_MESSAGES[0]);
  const timerRef = useRef(null);
  const countRef = useRef(0);

  const resetTimer = useCallback(() => {
    clearTimeout(timerRef.current);
    setShow(false);
    timerRef.current = setTimeout(() => {
      setMsg(IDLE_MESSAGES[countRef.current % IDLE_MESSAGES.length]);
      countRef.current++;
      setShow(true);
    }, 55000);
  }, []);

  useEffect(() => {
    timerRef.current = setTimeout(() => { setShow(true); }, 55000);
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    return () => {
      clearTimeout(timerRef.current);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, [resetTimer]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-28 left-1/2 -translate-x-1/2 pointer-events-none select-none z-50 flex flex-col items-center"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 14 }}
        >
          <div className="relative">
            <motion.div
              className="absolute -top-14 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
            >
              {msg}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-white" />
            </motion.div>
            <motion.img
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"
              alt="Pikachu"
              style={{ imageRendering: 'pixelated', width: 64, height: 64 }}
              animate={{ y: [0, -8, 0], rotate: [0, -5, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
              className="drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]"
            />
            {/* lightning sparks */}
            {[...Array(4)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute text-yellow-300 font-black pointer-events-none"
                style={{ fontSize: 10 + i * 2, top: -4 - i * 8, left: 60 + i * 6 }}
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
              >
                ⚡
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 5. MAGIKARP JUMP – springt plötzlich von unten hoch
// ────────────────────────────────────────────────────────────────────────────
function MagikarpJump() {
  const [active, setActive] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const delay = 35000 + Math.random() * 40000;
    const t = setTimeout(() => { setActive(true); setTimeout(() => setDone(true), 2500); }, delay);
    return () => clearTimeout(t);
  }, []);

  if (!active || done) return null;

  const left = 15 + Math.random() * 70;
  return (
    <motion.div
      className="fixed pointer-events-none select-none"
      style={{ zIndex: 9990, left: `${left}%`, bottom: 0 }}
      initial={{ y: 0, opacity: 0 }}
      animate={{ y: [0, -300, -500, -700], opacity: [0, 1, 1, 0], rotate: [0, -15, 15, -20] }}
      transition={{ duration: 2.2, ease: 'easeOut' }}
    >
      <div className="flex flex-col items-center">
        <img
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/129.png"
          alt="Magikarp"
          style={{ imageRendering: 'pixelated', width: 56, height: 56, filter: 'drop-shadow(0 0 12px rgba(255,120,60,0.9))' }}
        />
        <span className="text-orange-300 text-xs font-black" style={{ textShadow: '0 0 6px rgba(255,120,60,0.9)', whiteSpace: 'nowrap' }}>
          Platscher! 🐟
        </span>
      </div>
    </motion.div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 6. TOGEPI WALK – ganz klein von links nach rechts
// ────────────────────────────────────────────────────────────────────────────
function TogepiWalk() {
  const [active, setActive] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const delay = 25000 + Math.random() * 35000;
    const t = setTimeout(() => { setActive(true); setTimeout(() => setDone(true), 5000); }, delay);
    return () => clearTimeout(t);
  }, []);

  if (!active || done) return null;
  return (
    <motion.div
      className="fixed pointer-events-none select-none"
      style={{ zIndex: 45, bottom: 80 }}
      initial={{ x: '-80px', opacity: 0 }}
      animate={{ x: 'calc(100vw + 80px)', opacity: [0, 0.9, 0.9, 0] }}
      transition={{ duration: 4.5, ease: 'linear' }}
    >
      <div className="flex flex-col items-center">
        <motion.img
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/175.png"
          alt="Togepi"
          style={{ imageRendering: 'pixelated', width: 32, height: 32, filter: 'drop-shadow(0 0 8px rgba(255,255,200,0.8))' }}
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 0.5 }}
        />
        <span style={{ fontSize: 8, color: 'rgba(255,255,200,0.8)', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Togepi ✨</span>
      </div>
    </motion.div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 7. LUGIA NIGHT VISIT – nur wenn Uhrzeit 20–6 Uhr (abends/nachts)
// ────────────────────────────────────────────────────────────────────────────
function LugiaNightVisit() {
  const [active, setActive] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    const isNight = hour >= 20 || hour < 6;
    if (!isNight) return;
    const delay = 10000 + Math.random() * 20000;
    const t = setTimeout(() => { setActive(true); setTimeout(() => setDone(true), 5000); }, delay);
    return () => clearTimeout(t);
  }, []);

  if (!active || done) return null;
  return (
    <motion.div
      className="fixed pointer-events-none select-none"
      style={{ zIndex: 9995, top: '10%' }}
      initial={{ x: '-120px', opacity: 0 }}
      animate={{ x: 'calc(100vw + 120px)', opacity: [0, 0.7, 0.7, 0] }}
      transition={{ duration: 4.5, ease: 'easeInOut' }}
    >
      <div className="flex flex-col items-center">
        <img
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/249.png"
          alt="Lugia"
          style={{ imageRendering: 'pixelated', width: 96, height: 96, filter: 'drop-shadow(0 0 24px rgba(180,220,255,0.9)) brightness(1.2)' }}
        />
        <span className="text-blue-200 text-xs font-black" style={{ textShadow: '0 0 10px rgba(180,220,255,0.8)', whiteSpace: 'nowrap' }}>
          🌙 Lugia erscheint in der Nacht…
        </span>
      </div>
    </motion.div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 8. HO-OH RAINBOW – ein Regenbogen zieht diagonal durch
// ────────────────────────────────────────────────────────────────────────────
function HoOhRainbow() {
  const [active, setActive] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const delay = 45000 + Math.random() * 60000;
    const t = setTimeout(() => { setActive(true); setTimeout(() => setDone(true), 5000); }, delay);
    return () => clearTimeout(t);
  }, []);

  if (!active || done) return null;
  return (
    <motion.div
      className="fixed inset-0 pointer-events-none select-none"
      style={{ zIndex: 9992 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.6, 0.4, 0] }}
      transition={{ duration: 4.5, ease: 'easeInOut' }}
    >
      {/* Rainbow beam */}
      <div
        className="absolute"
        style={{
          top: '-10%',
          left: '-10%',
          width: '140%',
          height: '140%',
          background: 'linear-gradient(135deg, rgba(255,0,0,0.08) 0%, rgba(255,165,0,0.08) 16%, rgba(255,255,0,0.08) 32%, rgba(0,255,0,0.08) 48%, rgba(0,0,255,0.08) 64%, rgba(75,0,130,0.08) 80%, rgba(238,130,238,0.08) 100%)',
          transform: 'rotate(-20deg)',
        }}
      />
      {/* Ho-Oh flying */}
      <motion.div
        className="absolute"
        style={{ top: '8%', left: 0 }}
        initial={{ x: '-100px' }}
        animate={{ x: 'calc(100vw + 100px)' }}
        transition={{ duration: 4.5, ease: 'easeInOut' }}
      >
        <img
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/250.png"
          alt="Ho-Oh"
          style={{ imageRendering: 'pixelated', width: 80, height: 80, filter: 'drop-shadow(0 0 20px rgba(255,200,0,1))' }}
        />
      </motion.div>
      <motion.div
        className="absolute top-12 left-0 right-0 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 4, delay: 0.5 }}
      >
        <span className="text-yellow-300 font-black text-sm" style={{ textShadow: '0 0 12px rgba(255,200,0,0.9)' }}>
          Ho-Oh bringt dir Glück! 🌈
        </span>
      </motion.div>
    </motion.div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 9. EEVEE CORNER – bleibt dauerhaft in einer Ecke sitzen, wackelt gelegentlich
// ────────────────────────────────────────────────────────────────────────────
function EeveeCorner() {
  const [show, setShow] = useState(false);
  const [wiggle, setWiggle] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 15000);
    const iv = setInterval(() => {
      setWiggle(true);
      setTimeout(() => setWiggle(false), 800);
    }, 8000);
    return () => { clearTimeout(t); clearInterval(iv); };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-24 left-4 pointer-events-none select-none z-40"
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 60, damping: 14, delay: 0.3 }}
        >
          <motion.img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png"
            alt="Evoli"
            style={{ imageRendering: 'pixelated', width: 48, height: 48, filter: 'drop-shadow(0 0 8px rgba(200,150,80,0.7))' }}
            animate={wiggle ? { rotate: [-8, 8, -8, 0], y: [0, -4, 0] } : { y: [0, -2, 0] }}
            transition={wiggle ? { duration: 0.5 } : { repeat: Infinity, duration: 2.5 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 10. PSYDUCK CONFUSION – erscheint kurz mit Fragezeichen-Gedankenblase
// ────────────────────────────────────────────────────────────────────────────
function PsyduckConfusion() {
  const [active, setActive] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const delay = 50000 + Math.random() * 70000;
    const t = setTimeout(() => { setActive(true); setTimeout(() => setDone(true), 4000); }, delay);
    return () => clearTimeout(t);
  }, []);

  if (!active || done) return null;
  return (
    <motion.div
      className="fixed top-24 right-6 pointer-events-none select-none z-50"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ type: 'spring', bounce: 0.5 }}
    >
      <div className="relative">
        <motion.div
          className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white/90 text-black text-xs font-black px-2 py-1 rounded-xl whitespace-nowrap shadow"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
        >
          ??? 🤯
        </motion.div>
        <motion.img
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/54.png"
          alt="Enton"
          style={{ imageRendering: 'pixelated', width: 52, height: 52, filter: 'drop-shadow(0 0 10px rgba(100,180,255,0.8))' }}
          animate={{ rotate: [-5, 5, -5], y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 0.7 }}
        />
      </div>
    </motion.div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// EXPORT
// ────────────────────────────────────────────────────────────────────────────
import { usePokemonEvent } from './PokemonEventContext';

export default function PokemonEasterEggs() {
  const { isActive } = usePokemonEvent();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  if (!isActive) return null;
  return (
    <>
      <SleepingSnorlax />
      <MewDash />
      <GhostGengar />
      {!isMobile && <PikachuIdleBuddy />}
      <MagikarpJump />
      {!isMobile && <TogepiWalk />}
      <LugiaNightVisit />
      {!isMobile && <HoOhRainbow />}
      {/* EeveeCorner removed – Snorlax already occupies a corner */}
      {!isMobile && <PsyduckConfusion />}
    </>
  );
}