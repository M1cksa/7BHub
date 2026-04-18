import React, { useEffect, useRef, useCallback } from 'react';
import { SHIP_SKINS } from '@/components/game/NeonDashConstants';

// ── CONSTANTS ──
// Tighter shield window = requires precise timing (skill check)
const SHIELD_CYCLE    = 3.8;   // was 5.2 — faster cycle
const SHIELD_OPEN_SECS = 1.8;  // was 3.2 — tighter window
const CHARGE_MAX      = 5;
const PLAYER_SIZE     = 16;
const BULLET_SPEED    = 13;
const INVINCIBLE_SECS = 2.5;
const MAX_LIVES       = 5;
const FIXED_DT        = 1 / 60; // deterministic fixed simulation timestep

// Significantly harder spawn rates — Phase 2/3 are brutal
// Lower = more frequent. Phase order: [phase1, phase2, phase3]
const SPAWN_BASE = {
  orb:       [0.90, 0.80, 0.65],  // orbs slightly rarer = ammo management
  debris:    [1.8,  1.2,  0.85],  // much faster debris
  aim:       [999,  2.8,  1.6],   // aimed shots earlier in P2
  spiral:    [4.0,  2.4,  1.5],   // spiral is now threatening in all phases
  bomb:      [7.0,  4.5,  2.8],   // bombs much more frequent
  bounce:    [999,  5.5,  3.2],   // bounce balls active in P2
  missile:   [999,  5.0,  2.8],   // faster missiles
  laser:     [999,  7.5,  4.0],   // laser unlocked in P2
  shockwave: [999,  999,  4.5],   // P3 shockwave more frequent
  taunt:     [8.0,  5.5,  3.5],
  combo:     [14,   10,   7],     // combo attacks very frequent in P3
  enrage:    [22,   16,   11],    // enrage cycles faster
};

const POWERUP_DROPS = [
  { id: 'shield',    emoji: '🛡️', label: 'SCHILD',       color: '#3b82f6', glow: '#60a5fa', duration: 6 },
  { id: 'rapidfire', emoji: '⚡', label: 'SCHNELLFEUER',  color: '#f59e0b', glow: '#fde047', duration: 6 },
  { id: 'doubledmg', emoji: '🔥', label: 'DOPPELSCHADEN', color: '#ef4444', glow: '#f87171', duration: 7 },
  { id: 'heal',      emoji: '❤️', label: '+LEBEN',         color: '#22c55e', glow: '#86efac', duration: 0 },
];

// ── SEEDED PRNG (Mulberry32) ──
// Both clients use the same matchId → same seed → identical world events
export const seedFromString = (str) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
};

const makePRNG = (seed) => {
  let s = seed >>> 0;
  return () => {
    s += 0x6D2B79F5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// jitter with seeded rng for deterministic spawn intervals
const jitter = (base, rng) => base * (0.75 + rng() * 0.5);

// Fisher-Yates shuffle using seeded rng
const seededShuffle = (arr, rng) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Visual star positions (static, seeded by index – not match seed)
const sr = (seed) => {
  let s = seed;
  s = Math.sin(s * 9301 + 49297) * 233280;
  return s - Math.floor(s);
};

export default function BossRaidGame({
  matchSeed,
  bossHp, bossMaxHp, partnerX, partnerSkin,
  mySkin, partnerName, onBossHit, onPlayerDie, onPositionUpdate,
  partnerHitSignal, onCanvasSize,
}) {
  const canvasRef    = useRef(null);
  const containerRef = useRef(null);
  const reqRef       = useRef(null);
  const stateRef     = useRef(null);

  const bossHpRef           = useRef(bossHp);
  const partnerXRef         = useRef(partnerX);
  const partnerSkinRef      = useRef(partnerSkin);
  const mySkinRef           = useRef(mySkin);
  const partnerNameRef      = useRef(partnerName);
  const onBossHitRef        = useRef(onBossHit);
  const onPlayerDieRef      = useRef(onPlayerDie);
  const onPositionUpdateRef = useRef(onPositionUpdate);
  const matchSeedRef        = useRef(matchSeed || 0);
  const onCanvasSizeRef     = useRef(onCanvasSize);

  useEffect(() => { bossHpRef.current = bossHp; }, [bossHp]);
  useEffect(() => { partnerXRef.current = partnerX; }, [partnerX]);
  useEffect(() => { partnerSkinRef.current = partnerSkin; }, [partnerSkin]);
  useEffect(() => { mySkinRef.current = mySkin; }, [mySkin]);
  useEffect(() => { partnerNameRef.current = partnerName; }, [partnerName]);
  useEffect(() => { onBossHitRef.current = onBossHit; }, [onBossHit]);
  useEffect(() => { onPlayerDieRef.current = onPlayerDie; }, [onPlayerDie]);
  useEffect(() => { onPositionUpdateRef.current = onPositionUpdate; }, [onPositionUpdate]);
  useEffect(() => { matchSeedRef.current = matchSeed || 0; }, [matchSeed]);
  useEffect(() => { onCanvasSizeRef.current = onCanvasSize; }, [onCanvasSize]);
  // Flash boss with partner color when partner deals damage
  useEffect(() => {
    if (partnerHitSignal && stateRef.current) stateRef.current.partnerBossHitFlash = 1.0;
  }, [partnerHitSignal]);

  const initState = useCallback((w, h) => {
    const seed = matchSeedRef.current;
    const rng = makePRNG(seed);
    const stars = Array.from({ length: 140 }, (_, i) => ({
      x: sr(i * 17 + 1) * w, y: sr(i * 13 + 2) * h,
      r: sr(i * 7 + 3) * 2 + 0.3,
      twinkle: sr(i * 11) * Math.PI * 2,
      speed: (sr(i * 5 + 1) * 0.14 + 0.04) * 60,
      brightness: sr(i * 19 + 5) * 0.5 + 0.5,
      colorIdx: Math.floor(sr(i * 3) * 3),
    }));
    if (onCanvasSizeRef.current) onCanvasSizeRef.current(w);
    stateRef.current = {
      w, h,
      player: { x: w / 2, y: h - 80 },
      targetX: w / 2,
      time: 0,
      // PRNG – seeded from matchId for deterministic world simulation
      rng,
      matchSeed: seed,
      // Fixed timestep accumulator
      accumulator: 0,
      lastRealTime: null,
      // spawn timers (seeded initial values)
      orbTimer: 0.5,        debrisTimer: 1.2,
      aimTimer: 2.0,        spiralTimer: 3.2,
      bombTimer: 5.0,       bounceTimer: 6.0,
      missileTimer: 4.0,    laserTimer: 8.0,
      shockwaveTimer: 10.0, tauntTimer: 7.0,
      comboTimer: jitter(SPAWN_BASE.combo[0], rng),
      enrageTimer: jitter(SPAWN_BASE.enrage[0], rng),
      // misc
      shieldTime: 0,        invincibleTime: 0,
      screenShakeTime: 0,   screenShakeMag: 0,
      bossHitFlash: 0,      phaseFlashTime: 0,
      bossRageShakeTime: 0, warningText: null,
      enraged: false,       enrageDuration: 0,
      enrageCount: 0,
      rapidFireTimer: 0,
      bulletCooldown: 0,
      charge: 0,            lives: MAX_LIVES,
      bullets: [],          orbs: [],          debris: [],
      particles: [],        textParticles: [],
      missiles: [],         shockwaves: [],    bombs: [],
      bounceBalls: [],      laserBeam: null,
      powerupItems: [],
      activePowerups: {},
      spiralAngle: 0,
      shieldOpen: false,
      dead: false,
      lastPhase: 1,
      phaseCount: 0,
      bossAnger: 0,
      lastAttacks: [],
      stars,
      // cached boss position for render
      bossX: w / 2, bossY: h * 0.27, phase: 1, hpRatio: 1,
      partnerBossHitFlash: 0,
    };
  }, []);

  useEffect(() => {
    const c = containerRef.current; if (!c) return;
    const w = c.clientWidth, h = c.clientHeight;
    if (canvasRef.current) { canvasRef.current.width = w; canvasRef.current.height = h; }
    initState(w, h);
    const handleResize = () => {
      const nw = c.clientWidth, nh = c.clientHeight;
      if (canvasRef.current) { canvasRef.current.width = nw; canvasRef.current.height = nh; }
      if (stateRef.current) { stateRef.current.w = nw; stateRef.current.h = nh; }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initState]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const move = (e) => {
      const rect = canvas.getBoundingClientRect();
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const x = Math.max(PLAYER_SIZE, Math.min(canvas.width - PLAYER_SIZE, cx - rect.left));
      if (stateRef.current) stateRef.current.targetX = x;
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, { passive: false });
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('touchmove', move); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let loopDead = false;

    // ── VISUAL HELPERS (use Math.random – not seeded, purely cosmetic) ──
    const spawnParticles = (x, y, color, count, force = 8) => {
      const st = stateRef.current; if (!st) return;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = Math.random() * force + 2;
        st.particles.push({ x, y, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd, life: 1.4, color, r: 2.5 + Math.random() * 3 });
      }
    };
    const spawnText = (x, y, text, color, size = 14) => {
      const st = stateRef.current; if (!st) return;
      st.textParticles.push({ x, y, text, color, life: 1.8, vy: -90, size });
    };
    // dropPowerup is player-local (each player collects their own), uses Math.random
    const dropPowerup = (bx, by) => {
      const st = stateRef.current; if (!st) return;
      const def = POWERUP_DROPS[Math.floor(Math.random() * POWERUP_DROPS.length)];
      st.powerupItems.push({
        ...def, x: bx + (Math.random() - 0.5) * 60, y: by + 20,
        vy: (2.2 + Math.random() * 1.2) * 60, collected: false,
      });
    };

    // ── SHOOT (player-specific, not seeded) ──
    const shoot = (burst = false) => {
      const st = stateRef.current;
      if (!st || st.dead) return;
      const hasRapid = st.activePowerups.rapidfire > 0;
      if (!hasRapid && !burst && (st.bulletCooldown || 0) > 0) return;
      const dmgMult = st.activePowerups.doubledmg > 0 ? 2 : 1;
      if (burst && st.charge >= 3) {
        st.charge = Math.max(0, st.charge - 3);
        const spd = BULLET_SPEED * 60;
        for (const off of [-0.3, -0.15, 0, 0.15, 0.3]) {
          st.bullets.push({ x: st.player.x, y: st.player.y - 20, vx: Math.sin(off) * spd, vy: -Math.cos(off) * spd, dmgMult, isBurst: true });
        }
        st.bulletCooldown = 0.45;
      } else if (hasRapid) {
        for (const off of [-18, 0, 18]) {
          st.bullets.push({ x: st.player.x + off, y: st.player.y - 20, vx: off * 3.5, vy: -BULLET_SPEED * 60, dmgMult });
        }
      } else if (st.charge >= 1) {
        st.charge--;
        st.bullets.push({ x: st.player.x, y: st.player.y - 20, vx: 0, vy: -BULLET_SPEED * 68, dmgMult: dmgMult * 2.5, isPower: true });
        st.bulletCooldown = 0.20;
      } else {
        st.bullets.push({ x: st.player.x, y: st.player.y - 20, vx: 0, vy: -BULLET_SPEED * 60, dmgMult });
        st.bulletCooldown = 0.28;
      }
    };

    const handleTap = () => {
      const st = stateRef.current;
      if (!st || st.dead) return;
      const now = performance.now() / 1000;
      if ((now - (st.lastTapTime || 0)) < 0.35 && st.charge >= 3) {
        shoot(true); st.lastTapTime = -999;
      } else {
        shoot(false); st.lastTapTime = now;
      }
    };
    window.addEventListener('click', handleTap);
    window.addEventListener('touchstart', handleTap, { passive: true });

    // ── SEEDED ATTACK HELPERS ──
    // These use st.rng() so both clients produce identical world events
    const fireAim = (st, bx, by, bossR, phase) => {
      if (phase < 2) return;
      const a = Math.atan2(st.player.y - by, st.player.x - bx);
      const spd = (phase === 3 ? 3.5 : 2.8) * 60;
      const color = phase === 3 ? '#22d3ee' : '#f43f5e';
      for (const off of (phase === 3 ? [-0.22, 0, 0.22] : [0])) {
        st.debris.push({ x: bx+Math.cos(a+off)*(bossR+30), y: by+Math.sin(a+off)*(bossR+30), vx: Math.cos(a+off)*spd, vy: Math.sin(a+off)*spd, type:'aimed', color, size:12, angle:0, rotSpeed:0 });
      }
    };

    const fireSpiral = (st, bx, by, bossR, phase, glowColor) => {
      const count = phase === 3 ? 9 : phase === 2 ? 6 : 4;
      const spd = (3 + (phase-1)*0.6)*60;
      for (let i = 0; i < count; i++) {
        const a = (i/count)*Math.PI*2 + st.spiralAngle;
        st.debris.push({ x: bx+Math.cos(a)*(bossR+28), y: by+Math.sin(a)*(bossR+28), vx: Math.cos(a)*spd, vy: Math.sin(a)*spd, type:'spiral', color:glowColor, size:11, angle:0, rotSpeed:3 });
      }
      st.spiralAngle += Math.PI / (phase===3?5:7);
    };

    const fireBombs = (st, bx, by, bossR, phase) => {
      const rng = st.rng;
      const bCount = phase===3?3:phase===2?2:1;
      for (let bi = 0; bi < bCount; bi++) {
        st.bombs.push({ x: 80+rng()*(st.w-160), y: by+bossR+12, vy: (2.0+rng()*1.0)*60, timer:0, explodeAt:2.2, r:17, exploding:false, explodeR:0, explodeTimer:0 });
      }
      st.warningText = { text:`💣 BOMBEN x${bCount}!`, timer:1.5, color:'#f97316' };
    };

    const fireMissile = (st, bx, by, bossR, phase) => {
      if (st.laserBeam) return;
      const a = Math.atan2(st.player.y-by, st.player.x-bx);
      const mCount = phase===3?2:1;
      for (let m = 0; m < mCount; m++) {
        const off = (m-(mCount-1)/2)*0.48;
        // Missiles start slow and dumb – gives player time to react
        st.missiles.push({ x: bx+Math.cos(a+off)*(bossR+24), y: by+Math.sin(a+off)*(bossR+24), vx: Math.cos(a+off)*70, vy: Math.sin(a+off)*70, trail:[], life:4.5, phase, dumbTime: 0.9 });
      }
      st.warningText = { text:'🚀 MISSILES INCOMING!', timer:1.8, color:'#f97316' };
    };

    const fireLaser = (st, bx, by, bossR, phase) => {
      if (st.laserBeam) return;
      const sweepDir = st.rng() > 0.5 ? 1 : -1; // SEEDED: same direction on both clients
      const a = Math.atan2(st.player.y-by, st.player.x-bx);
      const color = phase===3?'#22d3ee':'#ef4444';
      st.laserBeam = { bx, by, angle:a-sweepDir*0.42, sweepDir, phase:'charging', timer:0, chargeTime:1.3, fireTime:1.15, color, glowCol:phase===3?'#67e8f9':'#fca5a5' };
      st.warningText = { text:'☢ LASER CHARGING!', timer:1.6, color };
    };

    const fireBounce = (st, bx, by, bossR, phase, glowColor) => {
      if (phase < 2) return;
      const rng = st.rng;
      const bCount = phase===3?3:2;
      const color = phase===3?'#22d3ee':'#ec4899';
      for (let bi = 0; bi < bCount; bi++) {
        st.bounceBalls.push({ x: bx+(rng()-0.5)*bossR*1.2, y: by+bossR+8, vx: (rng()-0.5)*300, vy: (3.5+rng()*2)*60, r:14, bounces:0, maxBounces:5, color });
      }
      st.warningText = { text:'🎱 BOUNCE ATTACK!', timer:1.4, color };
    };

    const pickComboAttacks = (phase, lastAttacks, rng) => {
      const pool = phase >= 3
        ? ['aim','spiral','bomb','bounce','missile','laser','shockwave']
        : phase >= 2
          ? ['aim','spiral','bomb','bounce','missile','laser']
          : ['spiral','bomb','aim'];
      const available = pool.filter(a => !lastAttacks.slice(-2).includes(a));
      const choices = available.length >= 2 ? available : pool;
      const count = 1 + Math.floor(rng() * 2);
      return seededShuffle(choices, rng).slice(0, Math.min(count, choices.length));
    };

    // ── SIMULATE (deterministic fixed-step, uses st.rng for world events) ──
    const simulate = (st, dt) => {
      if (st.dead) return;
      const { w, h, player } = st;
      const rng = st.rng;

      // Boss position — Phase 2+ adds aggressive lateral sweeps (movement pattern)
      const bossHp  = bossHpRef.current;
      const hpRatio = Math.max(0, bossHp / bossMaxHp);
      const phase   = hpRatio > 0.66 ? 1 : hpRatio > 0.33 ? 2 : 3;
      const pi      = phase - 1;
      const bossR   = 56;
      const bossFloatY = Math.sin(st.time*1.6)*16 + Math.sin(st.time*3.2)*7;
      // Phase 2: wide sine sweep. Phase 3: figure-8 pattern (forces player to track)
      const bossFloatX = phase === 3
        ? Math.cos(st.time * 1.1) * (w * 0.28) + Math.sin(st.time * 2.6) * (w * 0.08)
        : phase === 2
          ? Math.cos(st.time * 0.7) * (w * 0.18)
          : Math.cos(st.time * 0.45) * (w * 0.06);
      const bx = w/2 + bossFloatX;
      const by = h*0.27 + bossFloatY;
      // Cache for render
      st.bossX = bx; st.bossY = by; st.phase = phase; st.hpRatio = hpRatio;
      st.bossAnger = 1 - hpRatio;
      const glowColor = phase===1?'#a855f7':phase===2?'#f43f5e':'#22d3ee';

      st.time += dt;

      // Decay timers
      if ((st.bulletCooldown||0) > 0) st.bulletCooldown -= dt;
      if (st.invincibleTime > 0)      st.invincibleTime -= dt;
      if (st.screenShakeTime > 0)     st.screenShakeTime -= dt;
      if (st.bossHitFlash > 0)        st.bossHitFlash -= dt * 1.8;
      if (st.partnerBossHitFlash > 0) st.partnerBossHitFlash -= dt * 2.5;
      if (st.phaseFlashTime > 0)      st.phaseFlashTime -= dt * 0.55;
      if (st.bossRageShakeTime > 0)   st.bossRageShakeTime -= dt * 11;
      if (st.warningText)             { st.warningText.timer -= dt; if (st.warningText.timer <= 0) st.warningText = null; }
      if (st.enraged)                 { st.enrageDuration -= dt; if (st.enrageDuration <= 0) { st.enraged = false; spawnText(w/2, h*0.5, '😤 WUTANFALL VORBEI', '#ffffff', 13); } }

      for (const k of Object.keys(st.activePowerups)) {
        st.activePowerups[k] -= dt;
        if (st.activePowerups[k] <= 0) delete st.activePowerups[k];
      }
      if (st.activePowerups.rapidfire > 0) {
        st.rapidFireTimer -= dt;
        if (st.rapidFireTimer <= 0) { st.rapidFireTimer = 0.55; shoot(); }
      }

      const spd = st.enraged ? 2.0 : 1.0;
      st.orbTimer      -= dt * spd; st.debrisTimer   -= dt * spd;
      st.aimTimer      -= dt * spd; st.spiralTimer   -= dt * spd;
      st.bombTimer     -= dt * spd; st.bounceTimer   -= dt * spd;
      st.missileTimer  -= dt * spd; st.laserTimer    -= dt * spd;
      st.shockwaveTimer -= dt * spd; st.tauntTimer   -= dt;
      st.comboTimer    -= dt;       st.enrageTimer   -= dt;

      // Phase transition – uses phase-local rng (doesn't disturb main rng sequence)
      if (phase !== st.lastPhase) {
        st.lastPhase = phase;
        st.phaseCount++;
        // Use a phase-specific RNG so both clients get same reset values
        // regardless of when the phase transition happens (HP sync latency)
        const phaseRng = makePRNG(st.matchSeed ^ (st.phaseCount * 0x9e3779b9));
        st.phaseFlashTime = 2.0; st.bossRageShakeTime = 0.85;
        spawnParticles(w/2, h*0.27, glowColor, 90, 20);
        st.shockwaves.push({ x:w/2, y:h*0.27, r:30, speed:480, maxR:Math.sqrt(w*w+h*h), alpha:1.4, color:glowColor });
        st.bombs=[]; st.bounceBalls=[]; st.missiles=[];
        st.warningText = { text:phase===2?'☠ PHASE II – AGGRESSION':'⚡ PHASE III – VOID RAGE', timer:2.8, color:glowColor };
        spawnText(w/2, h*0.27-80, phase===2?'😤 JA JETZT WIRDS ERNST!':'💀 ICH BIN UNLEASHED!', glowColor, 18);
        st.aimTimer=1.5; st.spiralTimer=2.0; st.bombTimer=3.5;
        st.bounceTimer=5.0; st.missileTimer=3.0; st.laserTimer=5.0;
        st.comboTimer  = jitter(SPAWN_BASE.combo[pi], phaseRng);
        st.enrageTimer = jitter(SPAWN_BASE.enrage[pi], phaseRng);
        dropPowerup(bx, by);
      }

      // Enrage – uses enrage-count-local rng
      if (st.enrageTimer <= 0 && !st.enraged) {
        st.enrageCount++;
        const enrageRng = makePRNG(st.matchSeed ^ (st.enrageCount * 0x7f4a9c3b));
        st.enrageTimer = jitter(SPAWN_BASE.enrage[pi], enrageRng);
        st.enraged = true;
        st.enrageDuration = 3.5 + enrageRng() * 2;
        st.bossRageShakeTime = 0.4;
        spawnParticles(bx, by, glowColor, 50, 18);
        st.warningText = { text:'🔥 WUTANFALL! DOPPELGESCHWINDIGKEIT!', timer:2.2, color:'#ef4444' };
        spawnText(bx, by-bossR-50, '😡 JETZT REICHT\'S!', '#ef4444', 20);
      }

      // Combo attack – seeded
      if (st.comboTimer <= 0) {
        st.comboTimer = jitter(SPAWN_BASE.combo[pi], rng);
        const attacks = pickComboAttacks(phase, st.lastAttacks, rng);
        st.lastAttacks = [...st.lastAttacks.slice(-3), ...attacks];
        for (const atk of attacks) {
          if (atk === 'aim')       fireAim(st, bx, by, bossR, phase);
          if (atk === 'spiral')    fireSpiral(st, bx, by, bossR, phase, glowColor);
          if (atk === 'bomb')      fireBombs(st, bx, by, bossR, phase);
          if (atk === 'missile')   fireMissile(st, bx, by, bossR, phase);
          if (atk === 'laser')     fireLaser(st, bx, by, bossR, phase);
          if (atk === 'bounce')    fireBounce(st, bx, by, bossR, phase, glowColor);
          if (atk === 'shockwave' && phase===3) {
            st.shockwaves.push({ x:bx, y:by, r:bossR+8, speed:480, maxR:Math.sqrt(w*w+h*h), alpha:1.0, color:glowColor });
            spawnParticles(bx, by, glowColor, 40, 15);
          }
        }
        if (attacks.length >= 2) st.warningText = { text:`⚡ COMBO ANGRIFF! (${attacks.length}x)`, timer:2.0, color:'#fbbf24' };
      }

      st.shieldTime = (st.shieldTime + dt) % SHIELD_CYCLE;
      st.shieldOpen = st.shieldTime < SHIELD_OPEN_SECS;

      // Individual spawn timers – all seeded
      if (st.debrisTimer <= 0) {
        st.debrisTimer = jitter(SPAWN_BASE.debris[pi], rng);
        const dType = phase>=2 && rng()>0.55 ? 'laser' : 'chunk';
        const color = phase===1?'#7c3aed':phase===2?'#dc2626':'#06b6d4';
        st.debris.push({ x:rng()*(w-60)+30, y:-10, vx:0, vy:(2.5+rng()*(phase===3?3.8:2.2))*60, type:dType, color, size:12+rng()*16, angle:0, rotSpeed:(rng()-0.5)*4 });
      }
      if (st.aimTimer <= 0)   { st.aimTimer   = jitter(SPAWN_BASE.aim[pi], rng);   fireAim(st, bx, by, bossR, phase); }
      if (st.spiralTimer <= 0){ st.spiralTimer = jitter(SPAWN_BASE.spiral[pi], rng); fireSpiral(st, bx, by, bossR, phase, glowColor); }
      if (st.bombTimer <= 0)  { st.bombTimer   = jitter(SPAWN_BASE.bomb[pi], rng);  fireBombs(st, bx, by, bossR, phase); }
      if (st.bounceTimer <= 0){ st.bounceTimer = jitter(SPAWN_BASE.bounce[pi], rng); fireBounce(st, bx, by, bossR, phase, glowColor); }
      if (st.missileTimer <= 0){ st.missileTimer = jitter(SPAWN_BASE.missile[pi], rng); fireMissile(st, bx, by, bossR, phase); }
      if (st.shockwaveTimer <= 0) {
        st.shockwaveTimer = jitter(SPAWN_BASE.shockwave[pi], rng);
        if (phase === 3) {
          st.shockwaves.push({ x:bx, y:by, r:bossR+8, speed:480, maxR:Math.sqrt(w*w+h*h), alpha:1.0, color:glowColor });
          spawnParticles(bx, by, glowColor, 50, 16);
          st.warningText = { text:'⚡ SHOCKWAVE!', timer:1.5, color:glowColor };
        }
      }
      if (st.laserTimer <= 0) { st.laserTimer = jitter(SPAWN_BASE.laser[pi], rng); fireLaser(st, bx, by, bossR, phase); }
      if (st.tauntTimer <= 0) {
        st.tauntTimer = jitter(SPAWN_BASE.taunt[pi], rng);
        const taunts = phase===3
          ? ['💀 NICHTS KANN MICH STOPPEN!','⚡ MEHR POWER!','🔥 VOID ÜBERNIMMT!','😈 IHR SEID ERLEDIGT!']
          : phase===2
            ? ['😤 NICHT SCHLECHT!','HAHA IST DAS ALLES?','😠 ICH WERDE WÜTEND!','🤬 AUFHÖREN MICH ZU NERVEN!']
            : ['😒 SO SCHWACH!','LANGWEILIG!','KOMM SCHON!','😴 ICH SCHLAFE FAST EIN!'];
        spawnText(bx, by-bossR-32, taunts[Math.floor(rng()*taunts.length)], glowColor, 15);
      }
      if (st.orbTimer <= 0) {
        st.orbTimer = jitter(SPAWN_BASE.orb[pi], rng);
        st.orbs.push({ x: rng()*(w-60)+30, y:-15, vy:(2.4+rng()*1.6)*60 });
      }

      // Update laser beam
      if (st.laserBeam) {
        const lb = st.laserBeam; lb.timer += dt; lb.bx = bx; lb.by = by;
        const beamLen = Math.sqrt(w*w+h*h)*1.35;
        if (lb.phase === 'charging') {
          if (lb.timer >= lb.chargeTime) { lb.phase = 'firing'; lb.timer = 0; }
        } else {
          lb.angle += lb.sweepDir*1.5*dt;
          if (st.invincibleTime <= 0) {
            const curEx = lb.bx+Math.cos(lb.angle)*beamLen, curEy = lb.by+Math.sin(lb.angle)*beamLen;
            const lDx = curEx-lb.bx, lDy = curEy-lb.by, lLen = Math.sqrt(lDx*lDx+lDy*lDy);
            const tProj = ((player.x-lb.bx)*lDx+(player.y-lb.by)*lDy)/(lLen*lLen);
            if (tProj>0&&tProj<1) {
              const cx3=lb.bx+tProj*lDx, cy3=lb.by+tProj*lDy;
              if (Math.sqrt((player.x-cx3)**2+(player.y-cy3)**2)<PLAYER_SIZE+18) {
                const hasShield = st.activePowerups.shield > 0;
                if (hasShield) { delete st.activePowerups.shield; spawnText(player.x, player.y-30,'🛡️ SCHILD ABSORBIERT!','#3b82f6'); }
                else { st.lives--; st.invincibleTime=INVINCIBLE_SECS; st.screenShakeTime=0.35; st.screenShakeMag=14; spawnParticles(player.x,player.y,'#f43f5e',32,13); if (st.lives<=0) st.dead=true; else spawnText(player.x,player.y-30,`❤ ${st.lives}`,'#f43f5e'); }
              }
            }
          }
          if (lb.timer >= lb.fireTime) st.laserBeam = null;
        }
      }

      // Update shockwaves
      for (let i = st.shockwaves.length-1; i>=0; i--) {
        const sw = st.shockwaves[i]; const prevR = sw.r;
        sw.r += sw.speed*dt; sw.alpha -= 0.36*dt;
        if (st.invincibleTime <= 0) {
          const hasShield = st.activePowerups.shield > 0;
          const pD = Math.sqrt((player.x-sw.x)**2+(player.y-sw.y)**2);
          if (prevR < pD+PLAYER_SIZE && sw.r > pD-PLAYER_SIZE) {
            if (hasShield) { delete st.activePowerups.shield; spawnText(player.x, player.y-30,'🛡️ SCHILD ABSORBIERT!','#3b82f6'); }
            else { st.lives--; st.invincibleTime=INVINCIBLE_SECS*0.85; st.screenShakeTime=0.3; st.screenShakeMag=12; spawnParticles(player.x,player.y,sw.color,26,11); if (st.lives<=0) st.dead=true; else spawnText(player.x,player.y-30,`❤ ${st.lives}`,'#f43f5e'); }
          }
        }
        if (sw.r>sw.maxR||sw.alpha<=0) st.shockwaves.splice(i,1);
      }

      // Update bombs
      for (let i = st.bombs.length-1; i>=0; i--) {
        const bomb = st.bombs[i]; bomb.timer += dt;
        if (!bomb.exploding) {
          if (bomb.y < h*0.66) bomb.y += bomb.vy*dt;
          if (bomb.timer >= bomb.explodeAt) {
            bomb.exploding=true; bomb.timer=0; bomb.explodeR=8; bomb.explodeTimer=0;
            st.screenShakeTime=0.45; st.screenShakeMag=20;
            spawnParticles(bomb.x,bomb.y,'#f97316',65,17); spawnParticles(bomb.x,bomb.y,'#fbbf24',35,12); spawnParticles(bomb.x,bomb.y,'#ffffff',22,8);
            spawnText(bomb.x, bomb.y-40,'💥 BOOM!','#f97316',22);
          }
        } else {
          bomb.explodeR += 600*dt; bomb.explodeTimer += dt;
          if (st.invincibleTime<=0 && bomb.explodeR>0 && bomb.explodeR<88) {
            const hasShield = st.activePowerups.shield > 0;
            const edx=player.x-bomb.x, edy=player.y-bomb.y;
            if (Math.sqrt(edx*edx+edy*edy) < bomb.explodeR+PLAYER_SIZE*0.7) {
              if (hasShield) { delete st.activePowerups.shield; spawnText(player.x,player.y-30,'🛡️ SCHILD ABSORBIERT!','#3b82f6'); }
              else { st.lives--; st.invincibleTime=INVINCIBLE_SECS; st.screenShakeTime=0.4; st.screenShakeMag=20; spawnParticles(player.x,player.y,'#f43f5e',30,12); if (st.lives<=0) st.dead=true; else spawnText(player.x,player.y-30,`❤ ${st.lives}`,'#f43f5e'); }
            }
          }
          if (bomb.explodeTimer > 0.65) st.bombs.splice(i,1);
        }
      }

      // Update bounce balls
      for (let i = st.bounceBalls.length-1; i>=0; i--) {
        const bb = st.bounceBalls[i];
        bb.x += bb.vx*dt; bb.y += bb.vy*dt;
        if (bb.x<bb.r) { bb.x=bb.r; bb.vx=Math.abs(bb.vx); spawnParticles(bb.x,bb.y,bb.color,5,5); }
        if (bb.x>w-bb.r) { bb.x=w-bb.r; bb.vx=-Math.abs(bb.vx); spawnParticles(bb.x,bb.y,bb.color,5,5); }
        if (bb.y>h-bb.r) { bb.y=h-bb.r; bb.vy=-Math.abs(bb.vy)*0.82; bb.bounces++; spawnParticles(bb.x,h-4,bb.color,12,7); }
        if (st.invincibleTime<=0) {
          const hasShield = st.activePowerups.shield > 0;
          const bdx=player.x-bb.x, bdy=player.y-bb.y;
          if (Math.sqrt(bdx*bdx+bdy*bdy)<PLAYER_SIZE+bb.r*0.85) {
            bb.vx=-(bb.vx*1.1); bb.vy=-Math.abs(bb.vy)*1.1;
            if (hasShield) { delete st.activePowerups.shield; spawnText(player.x,player.y-30,'🛡️ SCHILD ABSORBIERT!','#3b82f6'); }
            else { st.lives--; st.invincibleTime=INVINCIBLE_SECS; st.screenShakeTime=0.3; st.screenShakeMag=11; spawnParticles(player.x,player.y,'#f43f5e',22,10); if (st.lives<=0) st.dead=true; else spawnText(player.x,player.y-30,`❤ ${st.lives}`,'#f43f5e'); }
          }
        }
        if (bb.bounces>=bb.maxBounces) { spawnParticles(bb.x,bb.y,bb.color,16,8); st.bounceBalls.splice(i,1); }
      }

      // Update missiles
      for (let i = st.missiles.length-1; i>=0; i--) {
        const m = st.missiles[i]; m.life -= dt;
        // Dumb phase: missile flies straight before homing kicks in
        if (m.dumbTime > 0) { m.dumbTime -= dt; }
        else {
          const tA = Math.atan2(player.y-m.y, player.x-m.x);
          let cA = Math.atan2(m.vy, m.vx);
          let diff = tA-cA;
          while (diff>Math.PI) diff-=Math.PI*2;
          while (diff<-Math.PI) diff+=Math.PI*2;
          // Reduced turn rate (was 2.28) – more dodgeable
          cA += Math.sign(diff)*Math.min(Math.abs(diff), 1.35*dt);
          // Reduced max speed (was 300) and slower acceleration
          const elapsed = 4.5 - m.life;
          const mSpd = Math.min(200, 80 + elapsed * 24);
          m.vx=Math.cos(cA)*mSpd; m.vy=Math.sin(cA)*mSpd;
        }
        m.x+=m.vx*dt; m.y+=m.vy*dt;
        m.trail.push({x:m.x,y:m.y}); if (m.trail.length>24) m.trail.shift();
        if (st.invincibleTime<=0) {
          const hasShield = st.activePowerups.shield > 0;
          const mdx=player.x-m.x, mdy=player.y-m.y;
          if (Math.sqrt(mdx*mdx+mdy*mdy)<PLAYER_SIZE+15) {
            spawnParticles(m.x,m.y,'#f97316',40,14); spawnText(m.x,m.y-20,'💥','#f97316',24);
            if (hasShield) { delete st.activePowerups.shield; spawnText(player.x,player.y-30,'🛡️ SCHILD ABSORBIERT!','#3b82f6'); }
            else { st.lives--; st.invincibleTime=INVINCIBLE_SECS; st.screenShakeTime=0.4; st.screenShakeMag=16; spawnParticles(player.x,player.y,'#f43f5e',24,10); if (st.lives<=0) st.dead=true; else spawnText(player.x,player.y-30,`❤ ${st.lives}`,'#f43f5e'); }
            st.missiles.splice(i,1); continue;
          }
        }
        if (m.life<=0||m.y>h+60) { spawnParticles(m.x,m.y,'#f97316',16,7); st.missiles.splice(i,1); }
      }

      // Update orbs
      for (let i = st.orbs.length-1; i>=0; i--) {
        const o = st.orbs[i]; o.y += o.vy*dt;
        const odx=player.x-o.x, ody=player.y-o.y;
        if (Math.sqrt(odx*odx+ody*ody)<PLAYER_SIZE+20) {
          st.orbs.splice(i,1); st.charge=Math.min(CHARGE_MAX,st.charge+1);
          spawnParticles(o.x,o.y,'#a855f7',18,10); spawnText(o.x,o.y-24,'+CHARGE','#c084fc'); continue;
        }
        if (o.y>h+20) st.orbs.splice(i,1);
      }

      // Update powerup drops
      for (let i = st.powerupItems.length-1; i>=0; i--) {
        const pu = st.powerupItems[i]; pu.y += pu.vy*dt;
        const pdx=player.x-pu.x, pdy=player.y-pu.y;
        if (Math.sqrt(pdx*pdx+pdy*pdy)<PLAYER_SIZE+22) {
          spawnParticles(pu.x,pu.y,pu.glow,20,10);
          if (pu.id==='heal') {
            if (st.lives<MAX_LIVES) { st.lives++; spawnText(pu.x,pu.y-28,`❤ GEHEILT! (${st.lives})`,pu.glow,16); }
            else spawnText(pu.x,pu.y-28,'❤ MAX!',pu.glow,16);
          } else { st.activePowerups[pu.id]=pu.duration; spawnText(pu.x,pu.y-28,`${pu.emoji} ${pu.label}!`,pu.glow,16); }
          st.powerupItems.splice(i,1); continue;
        }
        if (pu.y>h+30) st.powerupItems.splice(i,1);
      }

      // Update debris
      for (let i = st.debris.length-1; i>=0; i--) {
        const d = st.debris[i];
        d.x+=d.vx*dt; d.y+=d.vy*dt; d.angle+=d.rotSpeed*dt;
        if (st.invincibleTime<=0) {
          const hasShield = st.activePowerups.shield > 0;
          const pdx=player.x-d.x, pdy=player.y-d.y;
          const hitR = d.type==='aimed'?PLAYER_SIZE+d.size*0.8:PLAYER_SIZE+d.size*0.48;
          if (Math.sqrt(pdx*pdx+pdy*pdy)<hitR) {
            if (hasShield) { delete st.activePowerups.shield; spawnText(player.x,player.y-30,'🛡️ SCHILD ABSORBIERT!','#3b82f6'); st.invincibleTime=0.5; }
            else { st.lives--; st.invincibleTime=INVINCIBLE_SECS; st.screenShakeTime=0.3; st.screenShakeMag=9; spawnParticles(player.x,player.y,'#f43f5e',24,9); if (st.lives<=0) { st.dead=true; spawnParticles(player.x,player.y,'#f43f5e',65,18); } else spawnText(player.x,player.y-30,`❤ ${st.lives}`,'#f43f5e'); }
          }
        }
        if (d.y>h+60||d.x<-80||d.x>w+80||d.y<-80) st.debris.splice(i,1);
      }

      // Update bullets
      for (let i = st.bullets.length-1; i>=0; i--) {
        const b = st.bullets[i];
        b.x+=(b.vx||0)*dt; b.y+=b.vy*dt;
        const bDx=b.x-bx, bDy=b.y-by;
        if (Math.sqrt(bDx*bDx+bDy*bDy)<bossR+32) {
          if (st.shieldOpen) {
            const baseDmg = phase===3?120:phase===2?80:50;
            const dmg = Math.round(baseDmg*(b.dmgMult||1));
            spawnParticles(b.x,b.y,'#f59e0b',24,13); spawnParticles(b.x,b.y,'#ffffff',10,7);
            spawnText(b.x,b.y-20,`-${dmg}`,b.dmgMult>1?'#f87171':'#fbbf24');
            st.bossHitFlash=1;
            onBossHitRef.current(dmg);
            if (Math.random()<0.15) dropPowerup(bx, by); // player-local drop
          } else {
            spawnParticles(b.x,b.y,'#a855f7',14,8);
            st.debris.push({ x:b.x, y:b.y, vx:(Math.random()-0.5)*240, vy:330, type:'chunk', color:'#a855f7', size:10, angle:0, rotSpeed:3 });
            spawnText(b.x,b.y-16,'BLOCKED!','#a855f7');
          }
          st.bullets.splice(i,1); continue;
        }
        if (b.y<-20) st.bullets.splice(i,1);
      }

      // Update particles
      for (let i = st.particles.length-1; i>=0; i--) {
        const p = st.particles[i];
        p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=6*dt; p.life-=1.08*dt;
        if (p.life<=0) st.particles.splice(i,1);
      }
      for (let i = st.textParticles.length-1; i>=0; i--) {
        const tp = st.textParticles[i]; tp.y+=tp.vy*dt; tp.life-=0.96*dt;
        if (tp.life<=0) st.textParticles.splice(i,1);
      }

      // Update player — report as 0-1 ratio so both clients resolve to same canvas pos
      player.x += (st.targetX-player.x)*(1-Math.exp(-13*dt));
      onPositionUpdateRef.current(player.x / w);
    };

    // ── DRAW PLAYER ──
    const drawPlayer = (p, skinId, invincible, hasShield) => {
      const skin = SHIP_SKINS.find(sk => sk.id === skinId) || SHIP_SKINS[0];
      if (invincible && Math.floor(Date.now()/80)%2===0) return;
      ctx.save(); ctx.translate(p.x, p.y);
      if (hasShield) {
        ctx.shadowBlur=40; ctx.shadowColor='#3b82f6';
        ctx.strokeStyle=`rgba(96,165,250,${0.6+Math.sin(Date.now()*0.01)*0.4})`; ctx.lineWidth=4;
        ctx.beginPath(); ctx.arc(0,0,PLAYER_SIZE+16,0,Math.PI*2); ctx.stroke();
        ctx.globalAlpha=0.15; ctx.fillStyle='#3b82f6'; ctx.beginPath(); ctx.arc(0,0,PLAYER_SIZE+16,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
      } else if (invincible) {
        ctx.shadowBlur=35; ctx.shadowColor='#3b82f6';
        ctx.strokeStyle=`rgba(96,165,250,${0.35+Math.sin(Date.now()*0.015)*0.35})`; ctx.lineWidth=3;
        ctx.beginPath(); ctx.arc(0,0,PLAYER_SIZE+14,0,Math.PI*2); ctx.stroke();
      }
      ctx.shadowBlur=15; ctx.shadowColor=skin.glowColor; ctx.fillStyle=skin.glowColor+'80';
      ctx.beginPath(); ctx.ellipse(0,PLAYER_SIZE+6,5,10,0,0,Math.PI*2); ctx.fill();
      ctx.shadowBlur=28; ctx.shadowColor=skin.glowColor; ctx.fillStyle=skin.color;
      ctx.beginPath(); ctx.moveTo(0,-PLAYER_SIZE); ctx.lineTo(PLAYER_SIZE,PLAYER_SIZE); ctx.lineTo(-PLAYER_SIZE,PLAYER_SIZE); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#ffffff55'; ctx.beginPath(); ctx.arc(0,-PLAYER_SIZE*0.3,PLAYER_SIZE*0.4,0,Math.PI*2); ctx.fill();
      ctx.restore();
    };

    // ── RENDER ──
    const render = (st, ts) => {
      const { w, h, player } = st;
      const bx = st.bossX, by = st.bossY;
      const phase = st.phase, hpRatio = st.hpRatio;
      const bossR = 56;
      const rot = st.time*(phase===3?2.04:1.02);
      const baseColor  = phase===1?'#4c1d95':phase===2?'#7f1d1d':'#0c4a6e';
      const glowColor  = phase===1?'#a855f7':phase===2?'#f43f5e':'#22d3ee';
      const nebulaColor= phase===1?'#7c3aed':phase===2?'#dc2626':'#06b6d4';

      // Screen shake (visual only – Math.random OK)
      const shakeMag = st.screenShakeTime>0?st.screenShakeMag*(st.screenShakeTime/0.35):0;
      const shX = shakeMag>0?(Math.random()-0.5)*shakeMag*5:0;
      const shY = shakeMag>0?(Math.random()-0.5)*shakeMag*3:0;
      ctx.save(); ctx.translate(shX, shY);

      // Boss rage shake (visual only)
      const rageShX = st.bossRageShakeTime>0?(Math.random()-0.5)*st.bossRageShakeTime*120:0;
      const rageShY = st.bossRageShakeTime>0?(Math.random()-0.5)*st.bossRageShakeTime*60:0;
      const rbx = bx+rageShX, rby = by+rageShY;

      // Background
      ctx.fillStyle='rgba(3,0,12,0.28)'; ctx.fillRect(-10,-10,w+20,h+20);
      const nebulaBlobs = [
        { x:w*0.2, y:h*0.2, r:240, ox:Math.cos(st.time*0.24)*30 },
        { x:w*0.8, y:h*0.18, r:195, ox:Math.cos(st.time*0.3+2.1)*24 },
        { x:w*0.5, y:h*0.07, r:170, ox:Math.cos(st.time*0.18+4.2)*18 },
        { x:w*0.5, y:h*0.55, r:140, ox:Math.cos(st.time*0.36+1)*20 },
      ];
      for (const nb of nebulaBlobs) {
        const nx=nb.x+nb.ox, ny=nb.y+Math.sin(st.time*0.24+nb.r*0.01)*14;
        const ng=ctx.createRadialGradient(nx,ny,0,nx,ny,nb.r);
        ng.addColorStop(0,nebulaColor+'2a'); ng.addColorStop(0.5,nebulaColor+'0e'); ng.addColorStop(1,'transparent');
        ctx.fillStyle=ng; ctx.beginPath(); ctx.arc(nx,ny,nb.r,0,Math.PI*2); ctx.fill();
      }
      const starColors=['#ffffff','#c4b5fd','#bae6fd'];
      for (const star of st.stars) {
        star.y+=star.speed*FIXED_DT; if (star.y>h+5) star.y=-5;
        const alpha=(Math.sin(st.time*5.4+star.twinkle)*0.38+0.62)*star.brightness;
        ctx.save(); ctx.globalAlpha=alpha; ctx.shadowBlur=star.r>1.3?8:0;
        ctx.shadowColor=starColors[star.colorIdx]; ctx.fillStyle=starColors[star.colorIdx];
        ctx.beginPath(); ctx.arc(star.x,star.y,star.r,0,Math.PI*2); ctx.fill(); ctx.restore();
      }
      ctx.strokeStyle='rgba(139,92,246,0.02)'; ctx.lineWidth=1;
      const scan=(st.time*96)%80;
      for (let y2=-80+scan; y2<h; y2+=80) { ctx.beginPath(); ctx.moveTo(0,y2); ctx.lineTo(w,y2); ctx.stroke(); }
      if (st.phaseFlashTime>0) {
        const fa=Math.min(0.42,st.phaseFlashTime*0.22);
        const fc=phase===2?'220,38,38':phase===3?'6,182,212':'139,92,246';
        ctx.fillStyle=`rgba(${fc},${fa})`; ctx.fillRect(0,0,w,h);
      }
      if (st.enraged) {
        const ep=Math.sin(st.time*18)*0.06+0.06;
        ctx.fillStyle=`rgba(239,68,68,${ep})`; ctx.fillRect(0,0,w,h);
      }

      // Boss atmosphere
      const atm=ctx.createRadialGradient(rbx,rby,bossR*0.3,rbx,rby,bossR+110);
      atm.addColorStop(0,glowColor+'38'); atm.addColorStop(0.5,glowColor+'14'); atm.addColorStop(1,'transparent');
      ctx.fillStyle=atm; ctx.beginPath(); ctx.arc(rbx,rby,bossR+110,0,Math.PI*2); ctx.fill();

      // Energy arcs
      const arcSeed=Math.floor(st.time/0.33);
      const arcCount=phase===3?8:phase===2?5:3;
      for (let a=0; a<arcCount; a++) {
        const sAng=sr(arcSeed*13+a*7)*Math.PI*2, eAng=sAng+(sr(arcSeed*7+a*11)-0.5)*Math.PI*1.3;
        const aLen=bossR+22+sr(arcSeed*11+a*3)*60;
        const cpx=rbx+Math.cos((sAng+eAng)*0.5+0.9)*(aLen*0.7), cpy=rby+Math.sin((sAng+eAng)*0.5+0.9)*(aLen*0.7);
        const arcAlpha=(sr(st.time*174+a*1.4)*0.6+0.12)*(phase===3?1.0:0.55);
        ctx.save(); ctx.globalAlpha=arcAlpha; ctx.strokeStyle=glowColor; ctx.lineWidth=phase===3?2:1.4;
        ctx.shadowBlur=14; ctx.shadowColor=glowColor;
        ctx.beginPath(); ctx.moveTo(rbx+Math.cos(sAng)*bossR,rby+Math.sin(sAng)*bossR);
        ctx.quadraticCurveTo(cpx,cpy,rbx+Math.cos(eAng)*aLen,rby+Math.sin(eAng)*aLen); ctx.stroke(); ctx.restore();
      }
      if (st.bossHitFlash>0) {
        ctx.save(); ctx.globalAlpha=st.bossHitFlash*0.7;
        const fg=ctx.createRadialGradient(rbx,rby,0,rbx,rby,bossR+50);
        fg.addColorStop(0,'#ffffff'); fg.addColorStop(0.35,'#f59e0b'); fg.addColorStop(1,'transparent');
        ctx.fillStyle=fg; ctx.beginPath(); ctx.arc(rbx,rby,bossR+50,0,Math.PI*2); ctx.fill(); ctx.restore();
      }
      // Partner boss hit flash (violet)
      if (st.partnerBossHitFlash>0) {
        ctx.save(); ctx.globalAlpha=st.partnerBossHitFlash*0.55;
        const pfg=ctx.createRadialGradient(rbx,rby,0,rbx,rby,bossR+45);
        pfg.addColorStop(0,'#c084fc'); pfg.addColorStop(0.4,'#a855f7'); pfg.addColorStop(1,'transparent');
        ctx.fillStyle=pfg; ctx.beginPath(); ctx.arc(rbx,rby,bossR+45,0,Math.PI*2); ctx.fill(); ctx.restore();
      }

      // Boss body
      ctx.save(); ctx.translate(rbx,rby); ctx.rotate(rot);
      ctx.shadowBlur=phase===3?60:42; ctx.shadowColor=glowColor;
      const bg2=ctx.createRadialGradient(0,0,0,0,0,bossR);
      bg2.addColorStop(0,baseColor+'f2'); bg2.addColorStop(0.55,baseColor+'cc'); bg2.addColorStop(1,baseColor+'55');
      ctx.fillStyle=bg2;
      const breathe=1+Math.sin(st.time*4.2)*(0.05+st.bossAnger*0.1);
      ctx.beginPath();
      for (let i=0;i<6;i++) { const a=(i*Math.PI)/3, r=bossR*breathe*(1+Math.sin(st.time*5.4+i*1.1)*(phase===3?0.08:0.04)); i===0?ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r):ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r); }
      ctx.closePath(); ctx.fill(); ctx.strokeStyle=glowColor; ctx.lineWidth=phase===3?4:3; ctx.stroke();
      ctx.rotate(-rot*2.4); ctx.strokeStyle=glowColor+'75'; ctx.lineWidth=2;
      ctx.beginPath();
      for (let i=0;i<6;i++) { const a=(i*Math.PI)/3,r=bossR*0.58; i===0?ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r):ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r); }
      ctx.closePath(); ctx.stroke(); ctx.rotate(rot*2.4);
      const coreR=bossR*0.3+Math.sin(st.time*10.8)*(phase===3?10:6);
      const cg=ctx.createRadialGradient(0,0,0,0,0,coreR);
      cg.addColorStop(0,'#ffffff'); cg.addColorStop(0.4,phase===3?'#67e8f9':glowColor); cg.addColorStop(1,glowColor+'80');
      ctx.shadowBlur=40; ctx.fillStyle=cg; ctx.beginPath(); ctx.arc(0,0,coreR,0,Math.PI*2); ctx.fill();
      for (let ri=1;ri<=3;ri++) { ctx.globalAlpha=0.22/ri; ctx.strokeStyle=glowColor; ctx.lineWidth=1.5; ctx.shadowBlur=0; ctx.beginPath(); ctx.arc(0,0,coreR+ri*10,0,Math.PI*2); ctx.stroke(); }
      ctx.globalAlpha=1; ctx.restore();

      // Eyes
      ctx.save(); ctx.translate(rbx,rby);
      const eyeAngle=Math.atan2(player.y-rby,player.x-rbx);
      const eyeDist=bossR*0.3, pupilOff=bossR*0.09;
      for (let eye=-1;eye<=1;eye+=2) {
        const ex=Math.cos(rot+eye*0.72)*eyeDist, ey=Math.sin(rot+eye*0.72)*eyeDist;
        ctx.fillStyle=phase===3?'#ffe0e0':'#ffffffcc'; ctx.shadowBlur=10; ctx.shadowColor=glowColor;
        ctx.beginPath(); ctx.arc(ex,ey,bossR*0.14,0,Math.PI*2); ctx.fill();
        const pupilX=ex+Math.cos(eyeAngle)*pupilOff, pupilY=ey+Math.sin(eyeAngle)*pupilOff;
        ctx.fillStyle=phase===3?'#ef4444':phase===2?'#dc2626':'#7c3aed'; ctx.shadowBlur=16; ctx.shadowColor=ctx.fillStyle;
        ctx.beginPath(); ctx.arc(pupilX,pupilY,bossR*0.075,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#ffffff90'; ctx.shadowBlur=0; ctx.beginPath(); ctx.arc(pupilX-2,pupilY-2,bossR*0.025,0,Math.PI*2); ctx.fill();
      }
      if (phase>=2) {
        ctx.strokeStyle=glowColor; ctx.lineWidth=2.5; ctx.globalAlpha=0.7*st.bossAnger;
        for (let eye=-1;eye<=1;eye+=2) { const ex=Math.cos(rot+eye*0.72)*eyeDist, ey=Math.sin(rot+eye*0.72)*eyeDist; ctx.beginPath(); ctx.moveTo(ex-eye*bossR*0.18,ey-bossR*0.2); ctx.lineTo(ex+eye*bossR*0.08,ey-bossR*0.14); ctx.stroke(); }
        ctx.globalAlpha=1;
      }
      ctx.restore();

      // Orbiting crystals
      if (phase>=2) {
        const cCount=phase===3?9:5;
        for (let i=0;i<cCount;i++) {
          const a=(i/cCount)*Math.PI*2+st.time*(phase===3?3.9:2.64), cr=bossR+(phase===3?74:62);
          const cx2=rbx+Math.cos(a)*cr, cy2=rby+Math.sin(a)*cr;
          ctx.save(); ctx.translate(cx2,cy2); ctx.rotate(a*2+st.time*4.2);
          ctx.shadowBlur=24; ctx.shadowColor=glowColor; ctx.fillStyle=glowColor;
          const cs=phase===3?12:9;
          ctx.beginPath(); ctx.moveTo(0,-cs); ctx.lineTo(cs*0.65,0); ctx.lineTo(0,cs); ctx.lineTo(-cs*0.65,0); ctx.closePath(); ctx.fill();
          ctx.fillStyle='#ffffff70'; ctx.beginPath(); ctx.arc(-cs*0.2,-cs*0.3,cs*0.28,0,Math.PI*2); ctx.fill(); ctx.restore();
        }
      }
      if (phase===3) {
        for (let ri=0;ri<3;ri++) {
          const rr=bossR+22+ri*22;
          ctx.save(); ctx.translate(rbx,rby); ctx.rotate(st.time*(ri%2===0?2.88:-2.4)+ri*1.4);
          ctx.strokeStyle=glowColor+'60'; ctx.lineWidth=2; ctx.setLineDash([8,8]);
          ctx.beginPath(); ctx.arc(0,0,rr,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
        }
      }

      // Shield arcs
      for (let i=0;i<3;i++) {
        const arcStart=(i/3)*Math.PI*2+rot*0.7, arcEnd=arcStart+(Math.PI*2)/3*0.68;
        ctx.save(); ctx.translate(rbx,rby);
        if (st.shieldOpen) { ctx.globalAlpha=Math.sin(st.time*36)*0.18+0.12; ctx.strokeStyle='#ef4444'; ctx.lineWidth=2; }
        else { ctx.globalAlpha=0.9; ctx.strokeStyle=glowColor; ctx.shadowBlur=26; ctx.shadowColor=glowColor; ctx.lineWidth=phase===3?9:6; }
        ctx.beginPath(); ctx.arc(0,0,bossR+28,arcStart,arcEnd); ctx.stroke(); ctx.restore();
      }
      if (st.shieldOpen) {
        ctx.save(); ctx.translate(rbx,rby);
        const p2=Math.sin(st.time*24)*0.5+0.5;
        ctx.shadowBlur=40; ctx.shadowColor='#ef4444';
        ctx.strokeStyle=`rgba(239,68,68,${0.3+p2*0.5})`; ctx.lineWidth=2.5;
        ctx.beginPath(); ctx.arc(0,0,bossR+14+Math.sin(st.time*18)*12,0,Math.PI*2); ctx.stroke();
        ctx.strokeStyle='rgba(239,68,68,0.2)'; ctx.lineWidth=1; const cl=bossR+30;
        ctx.beginPath(); ctx.moveTo(-cl,0); ctx.lineTo(cl,0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0,-cl); ctx.lineTo(0,cl); ctx.stroke(); ctx.restore();
      }

      // Laser beam
      if (st.laserBeam) {
        const lb=st.laserBeam; const beamLen=Math.sqrt(w*w+h*h)*1.35;
        if (lb.phase==='charging') {
          const pa=(Math.sin(lb.timer*24)*0.3+0.3)*Math.min(1,lb.timer/0.37);
          const lEx=lb.bx+Math.cos(lb.angle)*beamLen, lEy=lb.by+Math.sin(lb.angle)*beamLen;
          ctx.save(); ctx.globalAlpha=pa; ctx.strokeStyle=lb.color; ctx.lineWidth=4; ctx.setLineDash([15,10]);
          ctx.shadowBlur=16; ctx.shadowColor=lb.color;
          ctx.beginPath(); ctx.moveTo(lb.bx,lb.by); ctx.lineTo(lEx,lEy); ctx.stroke(); ctx.setLineDash([]);
          ctx.fillStyle=lb.color; ctx.font='bold 22px sans-serif'; ctx.textAlign='center';
          ctx.fillText('⚠',lEx*0.45+lb.bx*0.55,lEy*0.45+lb.by*0.55); ctx.restore();
        } else {
          const curEx=lb.bx+Math.cos(lb.angle)*beamLen, curEy=lb.by+Math.sin(lb.angle)*beamLen;
          const alpha=1-(lb.timer/lb.fireTime)*0.5;
          ctx.save(); ctx.lineCap='round';
          ctx.globalAlpha=0.22*alpha; ctx.strokeStyle=lb.color; ctx.lineWidth=50; ctx.shadowBlur=70; ctx.shadowColor=lb.color;
          ctx.beginPath(); ctx.moveTo(lb.bx,lb.by); ctx.lineTo(curEx,curEy); ctx.stroke();
          ctx.globalAlpha=0.5*alpha; ctx.lineWidth=18; ctx.shadowBlur=36; ctx.beginPath(); ctx.moveTo(lb.bx,lb.by); ctx.lineTo(curEx,curEy); ctx.stroke();
          ctx.globalAlpha=0.95*alpha; ctx.strokeStyle='#ffffff'; ctx.lineWidth=5; ctx.shadowBlur=24; ctx.beginPath(); ctx.moveTo(lb.bx,lb.by); ctx.lineTo(curEx,curEy); ctx.stroke(); ctx.restore();
          if (st.time%0.05<FIXED_DT) { const t2=0.25+Math.random()*0.55; spawnParticles(lb.bx+Math.cos(lb.angle)*beamLen*t2,lb.by+Math.sin(lb.angle)*beamLen*t2,lb.glowCol,2,4); }
        }
      }

      // Shockwaves
      for (const sw of st.shockwaves) {
        ctx.save(); ctx.globalAlpha=Math.max(0,sw.alpha);
        ctx.shadowBlur=35; ctx.shadowColor=sw.color; ctx.strokeStyle=sw.color; ctx.lineWidth=Math.max(1.5,9*(1-sw.r/sw.maxR));
        ctx.beginPath(); ctx.arc(sw.x,sw.y,sw.r,0,Math.PI*2); ctx.stroke();
        ctx.globalAlpha=Math.max(0,sw.alpha*0.2); ctx.lineWidth=22*(1-sw.r/sw.maxR);
        ctx.beginPath(); ctx.arc(sw.x,sw.y,sw.r*0.87,0,Math.PI*2); ctx.stroke(); ctx.restore();
      }

      // Bombs
      for (const bomb of st.bombs) {
        if (!bomb.exploding) {
          const countdown=Math.max(0,1-bomb.timer/bomb.explodeAt);
          const bPulse=1+Math.sin(bomb.timer*(7.2+(1-countdown)*27))*0.13;
          ctx.save(); ctx.translate(bomb.x,bomb.y);
          if (countdown<0.45) { ctx.globalAlpha=(0.45-countdown)*0.4; ctx.fillStyle='#f97316'; ctx.beginPath(); ctx.arc(0,0,78,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1; }
          ctx.strokeStyle=countdown>0.35?'#f97316':'#ef4444'; ctx.lineWidth=3.5; ctx.shadowBlur=16; ctx.shadowColor=ctx.strokeStyle;
          ctx.beginPath(); ctx.arc(0,0,bomb.r+10,-Math.PI/2,-Math.PI/2+countdown*Math.PI*2); ctx.stroke();
          if (countdown>0.1&&Math.floor(st.time*7.5)%2===0) { ctx.fillStyle='#fde047'; ctx.shadowBlur=20; ctx.shadowColor='#fde047'; ctx.beginPath(); ctx.arc(0,-bomb.r-8,3.5,0,Math.PI*2); ctx.fill(); }
          ctx.shadowBlur=20; ctx.shadowColor='#f97316'; ctx.fillStyle='#1a1005'; ctx.beginPath(); ctx.arc(0,0,bomb.r*bPulse,0,Math.PI*2); ctx.fill();
          ctx.shadowBlur=0; ctx.font=`bold ${Math.round(bomb.r*1.4)}px sans-serif`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('💣',0,1); ctx.restore();
        } else {
          const ea=Math.max(0,1-bomb.explodeTimer/0.53);
          ctx.save(); ctx.globalAlpha=ea*0.65;
          const eg=ctx.createRadialGradient(bomb.x,bomb.y,0,bomb.x,bomb.y,bomb.explodeR);
          eg.addColorStop(0,'#ffffff'); eg.addColorStop(0.22,'#fde047'); eg.addColorStop(0.5,'#f97316'); eg.addColorStop(0.85,'#dc2626'); eg.addColorStop(1,'transparent');
          ctx.fillStyle=eg; ctx.shadowBlur=55; ctx.shadowColor='#f97316';
          ctx.beginPath(); ctx.arc(bomb.x,bomb.y,bomb.explodeR,0,Math.PI*2); ctx.fill();
          ctx.globalAlpha=ea*0.9; ctx.strokeStyle='#fbbf24'; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(bomb.x,bomb.y,bomb.explodeR,0,Math.PI*2); ctx.stroke(); ctx.restore();
        }
      }

      // Bounce balls
      for (const bb of st.bounceBalls) {
        const bbG=ctx.createRadialGradient(bb.x-bb.r*0.35,bb.y-bb.r*0.4,0,bb.x,bb.y,bb.r);
        bbG.addColorStop(0,'#ffffff'); bbG.addColorStop(0.35,bb.color); bbG.addColorStop(1,bb.color+'88');
        ctx.save(); ctx.shadowBlur=26; ctx.shadowColor=bb.color; ctx.fillStyle=bbG;
        ctx.beginPath(); ctx.arc(bb.x,bb.y,bb.r,0,Math.PI*2); ctx.fill(); ctx.restore();
      }

      // Missiles
      for (const m of st.missiles) {
        for (let t=0;t<m.trail.length-1;t++) {
          const tp=m.trail[t];
          ctx.save(); ctx.globalAlpha=(t/m.trail.length)*0.85;
          ctx.strokeStyle=t>m.trail.length*0.55?'#fbbf24':'#f97316'; ctx.lineWidth=(t/m.trail.length)*6; ctx.lineCap='round'; ctx.shadowBlur=12; ctx.shadowColor='#f97316';
          ctx.beginPath(); ctx.moveTo(tp.x,tp.y); ctx.lineTo(m.trail[t+1].x,m.trail[t+1].y); ctx.stroke(); ctx.restore();
        }
        const mA=Math.atan2(m.vy,m.vx);
        ctx.save(); ctx.translate(m.x,m.y); ctx.rotate(mA);
        ctx.shadowBlur=32; ctx.shadowColor='#f97316'; ctx.fillStyle='#fbbf24';
        ctx.beginPath(); ctx.ellipse(0,0,15,7,0,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#fff9'; ctx.beginPath(); ctx.arc(-3,-1,4,0,Math.PI*2); ctx.fill(); ctx.restore();
      }

      // Orbs
      for (let i=0; i<st.orbs.length; i++) {
        const o=st.orbs[i]; const pulse=Math.sin(st.time*8.4+i*1.8)*5;
        ctx.save(); ctx.shadowBlur=26; ctx.shadowColor='#a855f7';
        ctx.fillStyle='rgba(168,85,247,0.15)'; ctx.beginPath(); ctx.arc(o.x,o.y,24+pulse,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle='#c084fc'; ctx.lineWidth=2.5; ctx.shadowBlur=22; ctx.beginPath(); ctx.arc(o.x,o.y,13,0,Math.PI*2); ctx.stroke();
        ctx.shadowBlur=0; ctx.fillStyle='#e9d5ff'; ctx.font='bold 15px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('⚡',o.x,o.y); ctx.restore();
      }

      // Powerup drops
      for (let i=0; i<st.powerupItems.length; i++) {
        const pu=st.powerupItems[i]; const pulse=Math.sin(st.time*9+i*2.1)*4;
        ctx.save(); ctx.shadowBlur=30; ctx.shadowColor=pu.glow; ctx.strokeStyle=pu.color; ctx.lineWidth=2.5; ctx.fillStyle=pu.color+'22';
        ctx.beginPath(); ctx.arc(pu.x,pu.y,18+pulse,0,Math.PI*2); ctx.fill(); ctx.stroke();
        ctx.shadowBlur=0; ctx.font='bold 16px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(pu.emoji,pu.x,pu.y); ctx.restore();
      }

      // Debris
      for (const d of st.debris) {
        ctx.save(); ctx.translate(d.x,d.y); ctx.rotate(d.angle); ctx.shadowBlur=20; ctx.shadowColor=d.color;
        if (d.type==='laser') { ctx.fillStyle=d.color+'bb'; ctx.fillRect(-4.5,-d.size,9,d.size*2); ctx.fillStyle=d.color; ctx.fillRect(-2,-d.size,4,d.size*2); }
        else if (d.type==='aimed') {
          const ag=ctx.createRadialGradient(0,0,0,0,0,d.size); ag.addColorStop(0,'#ffffff'); ag.addColorStop(0.4,d.color); ag.addColorStop(1,d.color+'40'); ctx.fillStyle=ag;
          ctx.beginPath(); ctx.arc(0,0,d.size,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='#ffffff40'; ctx.lineWidth=2; ctx.stroke();
        } else if (d.type==='spiral') {
          ctx.fillStyle=d.color; ctx.shadowBlur=24;
          ctx.beginPath(); ctx.moveTo(0,-d.size); ctx.lineTo(d.size*0.65,0); ctx.lineTo(0,d.size); ctx.lineTo(-d.size*0.65,0); ctx.closePath(); ctx.fill();
          ctx.fillStyle='#ffffff60'; ctx.beginPath(); ctx.arc(-d.size*0.2,-d.size*0.25,d.size*0.3,0,Math.PI*2); ctx.fill();
        } else {
          ctx.strokeStyle=d.color; ctx.lineWidth=1.8; ctx.fillStyle=d.color+'75';
          ctx.beginPath();
          for (let v=0;v<5;v++) { const a=(v*Math.PI*2)/5-Math.PI/2, r=d.size*(v%2===0?1:0.5); v===0?ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r):ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r); }
          ctx.closePath(); ctx.fill(); ctx.stroke();
        }
        ctx.restore();
      }

      // Bullets
      for (const b of st.bullets) {
        const bColor=b.isPower?'#fbbf24':b.isBurst?'#818cf8':(b.dmgMult>1?'#f87171':'#06b6d4');
        const bGlow=b.isPower?'#f59e0b':b.isBurst?'#6366f1':(b.dmgMult>1?'#ef4444':'#06b6d4');
        const bSize=b.isPower?9:b.isBurst?5:(b.dmgMult>1?7:5.5);
        ctx.save(); ctx.shadowBlur=b.isPower?32:24; ctx.shadowColor=bGlow;
        const tg=ctx.createLinearGradient(b.x,b.y,b.x,b.y+32);
        tg.addColorStop(0,bColor+'cc'); tg.addColorStop(1,'transparent');
        ctx.fillStyle=tg; ctx.fillRect(b.x-(b.isPower?5:3),b.y,b.isPower?10:6,32);
        ctx.fillStyle='#ffffff'; ctx.beginPath(); ctx.arc(b.x,b.y,bSize,0,Math.PI*2); ctx.fill(); ctx.restore();
      }

      // Particles
      for (const p of st.particles) {
        ctx.globalAlpha=Math.min(1,p.life); ctx.shadowBlur=10; ctx.shadowColor=p.color; ctx.fillStyle=p.color;
        ctx.beginPath(); ctx.arc(p.x,p.y,(p.r||3)*Math.min(1,p.life),0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
      }
      ctx.shadowBlur=0;

      // Text particles
      for (const tp of st.textParticles) {
        ctx.globalAlpha=Math.min(1,tp.life*1.4); ctx.shadowBlur=14; ctx.shadowColor=tp.color; ctx.fillStyle=tp.color;
        ctx.font=`bold ${tp.size||14}px sans-serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(tp.text,tp.x,tp.y); ctx.globalAlpha=1;
      }

      // Player
      drawPlayer(player, mySkinRef.current, st.invincibleTime>0, st.activePowerups.shield>0);

      // Partner – ratio (0-1) → actual canvas px so both clients always agree on position
      const rawPRatio = partnerXRef.current;
      if (rawPRatio) {
        const rawPX = rawPRatio * w;
        if (!st._partnerSmoothX) st._partnerSmoothX = rawPX;
        else st._partnerSmoothX += (rawPX - st._partnerSmoothX) * (1 - Math.exp(-12 * FIXED_DT));
        const pSkin2 = SHIP_SKINS.find(s => s.id === partnerSkinRef.current) || SHIP_SKINS[0];
        ctx.save(); ctx.translate(st._partnerSmoothX, h-80);
        ctx.shadowBlur=30; ctx.shadowColor=pSkin2.glowColor; ctx.fillStyle=pSkin2.color;
        ctx.beginPath(); ctx.moveTo(0,-PLAYER_SIZE); ctx.lineTo(PLAYER_SIZE,PLAYER_SIZE); ctx.lineTo(-PLAYER_SIZE,PLAYER_SIZE); ctx.closePath(); ctx.fill();
        ctx.shadowBlur=14; ctx.fillStyle=pSkin2.glowColor+'80'; ctx.beginPath(); ctx.ellipse(0,PLAYER_SIZE+6,5,10,0,0,Math.PI*2); ctx.fill();
        ctx.shadowBlur=0; ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.font='bold 10px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='bottom';
        ctx.fillText((partnerNameRef.current||'Partner').substring(0,8), 0, -PLAYER_SIZE-5); ctx.restore();
      }

      ctx.shadowBlur=0;

      // HUD
      const bossHpCurrent = bossHpRef.current;
      const hpRatioCurrent = Math.max(0, bossHpCurrent / bossMaxHp);
      const barW=Math.min(340,w*0.72), barX=w/2-barW/2;
      const hpColor=hpRatioCurrent>0.66?'#a855f7':hpRatioCurrent>0.33?'#f43f5e':'#06b6d4';
      ctx.fillStyle='rgba(255,255,255,0.05)'; ctx.fillRect(barX,12,barW,14);
      ctx.shadowBlur=22; ctx.shadowColor=hpColor; ctx.fillStyle=hpColor;
      ctx.fillRect(barX,12,barW*Math.max(0,hpRatioCurrent),14);
      ctx.shadowBlur=0; ctx.fillStyle='rgba(255,255,255,0.22)'; ctx.fillRect(barX,12,barW*Math.max(0,hpRatioCurrent),4);
      ctx.fillStyle='rgba(3,0,12,0.7)'; ctx.fillRect(barX+barW*0.33-1,11,2,16); ctx.fillRect(barX+barW*0.66-1,11,2,16);
      ctx.fillStyle='rgba(255,255,255,0.75)'; ctx.font='bold 10px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top';
      ctx.fillText(`VOID TITAN  ${Math.ceil(bossHpCurrent).toLocaleString()} HP`,w/2,29);

      const phaseCurrent = hpRatioCurrent > 0.66 ? 1 : hpRatioCurrent > 0.33 ? 2 : 3;
      const pColors=['','#a855f7','#f43f5e','#06b6d4'];
      const pLabels=['','✦ Phase I','☠ Phase II','⚡ Phase III – VOID RAGE'];
      if (st.phaseFlashTime>0.45) {
        ctx.save(); ctx.globalAlpha=Math.min(1,st.phaseFlashTime*1.1); ctx.font='bold 18px sans-serif'; ctx.fillStyle=pColors[phaseCurrent]; ctx.shadowBlur=30; ctx.shadowColor=pColors[phaseCurrent];
        ctx.fillText('⚡ PHASE WECHSEL!',w/2,46); ctx.restore();
      } else { ctx.fillStyle=pColors[phaseCurrent]; ctx.font='bold 9px sans-serif'; ctx.fillText(pLabels[phaseCurrent],w/2,46); }

      if (st.enraged) {
        ctx.save(); ctx.globalAlpha=Math.sin(st.time*12)*0.35+0.65; ctx.fillStyle='#ef4444'; ctx.font='bold 11px sans-serif'; ctx.shadowBlur=18; ctx.shadowColor='#ef4444';
        ctx.fillText(`😡 WUTANFALL! ${st.enrageDuration.toFixed(1)}s`,w/2,61); ctx.restore();
      } else if (st.shieldOpen) {
        ctx.save(); ctx.globalAlpha=Math.sin(st.time*27)*0.4+0.6; ctx.shadowBlur=22; ctx.shadowColor='#ef4444'; ctx.fillStyle='#fca5a5'; ctx.font='bold 14px sans-serif';
        ctx.fillText('⚠ SCHILD OFFEN – FEUER FREI!',w/2,61); ctx.restore();
      } else {
        const rem=SHIELD_CYCLE-st.shieldTime;
        ctx.fillStyle='rgba(255,255,255,0.15)'; ctx.font='9px sans-serif'; ctx.fillText(`Schild aktiv · öffnet in ${rem.toFixed(1)}s`,w/2,61);
      }

      if (st.warningText) {
        const wA=Math.min(1,st.warningText.timer/0.35)*Math.min(1,st.warningText.timer>1.0?1:st.warningText.timer/1.0);
        ctx.save(); ctx.globalAlpha=wA; ctx.shadowBlur=30; ctx.shadowColor=st.warningText.color; ctx.fillStyle=st.warningText.color;
        ctx.font='bold 17px sans-serif'; ctx.textAlign='center'; ctx.fillText(st.warningText.text,w/2,h/2-28); ctx.restore();
      }

      // Lives
      const livesY=h-28;
      ctx.font='bold 9px sans-serif'; ctx.textAlign='left'; ctx.fillStyle='rgba(255,255,255,0.22)'; ctx.fillText('LEBEN',14,livesY-18);
      for (let li=0;li<MAX_LIVES;li++) {
        ctx.save(); ctx.shadowBlur=li<st.lives?20:0; ctx.shadowColor='#f43f5e'; ctx.font='21px sans-serif'; ctx.textAlign='left'; ctx.textBaseline='middle';
        ctx.globalAlpha=li<st.lives?1:0.18; ctx.fillText('❤',14+li*32,livesY); ctx.restore();
      }

      // Charge HUD
      const orbY=h-32;
      ctx.fillStyle='rgba(255,255,255,0.22)'; ctx.font='bold 11px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('CHARGE',w/2,orbY-21);
      const hasRapidFire = st.activePowerups.rapidfire > 0;
      for (let ci=0;ci<CHARGE_MAX;ci++) {
        const cx4=w/2-(CHARGE_MAX-1)*14+ci*28, filled=hasRapidFire||ci<st.charge;
        ctx.save(); ctx.shadowBlur=filled?26:5; ctx.shadowColor=filled?(hasRapidFire?'#f59e0b':'#a855f7'):'transparent';
        ctx.strokeStyle=filled?(hasRapidFire?'#fde047':'#c084fc'):'rgba(255,255,255,0.12)'; ctx.lineWidth=2.5;
        ctx.fillStyle=filled?(hasRapidFire?'rgba(245,158,11,0.6)':'rgba(168,85,247,0.58)'):'rgba(255,255,255,0.04)';
        ctx.beginPath(); ctx.arc(cx4,orbY,13,0,Math.PI*2); ctx.fill(); ctx.stroke();
        if (filled) { ctx.fillStyle='#e9d5ff'; ctx.font='bold 13px sans-serif'; ctx.fillText('⚡',cx4,orbY); }
        ctx.restore();
      }
      ctx.fillStyle=hasRapidFire?'rgba(253,224,71,0.9)':(st.charge>0?'rgba(196,132,252,0.75)':'rgba(255,255,255,0.1)');
      ctx.font=hasRapidFire?'bold 10px sans-serif':(st.charge>0?'bold 10px sans-serif':'9px sans-serif'); ctx.textBaseline='top';
      const shootHint = hasRapidFire ? `⚡ SCHNELLFEUER ${(st.activePowerups.rapidfire||0).toFixed(1)}s`
        : st.charge >= 3 ? '💥 DOPPELTIPP = 5x BURST!'
        : st.charge >= 1 ? '⚡ POWER SHOT – Tippen!'
        : 'Tippen = Schuss · Orbs = Power';
      ctx.fillText(shootHint, w/2, orbY+19);

      // Active powerup HUD
      const activePUKeys = Object.entries(st.activePowerups).filter(([,v])=>v>0);
      if (activePUKeys.length > 0) {
        ctx.save(); let puY = h-100;
        for (const [id, secs] of activePUKeys) {
          const def = POWERUP_DROPS.find(p=>p.id===id); if (!def) continue;
          const bw=100, bx2=w-12-bw;
          ctx.fillStyle=def.color+'22'; ctx.strokeStyle=def.color; ctx.lineWidth=1.5;
          ctx.beginPath(); ctx.roundRect(bx2,puY,bw,26,6); ctx.fill(); ctx.stroke();
          ctx.shadowBlur=10; ctx.shadowColor=def.glow; ctx.fillStyle=def.color; ctx.font='bold 11px sans-serif'; ctx.textAlign='left'; ctx.textBaseline='middle';
          ctx.fillText(`${def.emoji} ${def.label.substring(0,6)}`,bx2+8,puY+13);
          ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='9px sans-serif'; ctx.textAlign='right'; ctx.fillText(`${secs.toFixed(1)}s`,bx2+bw-6,puY+13);
          ctx.fillStyle=def.color+'66'; ctx.fillRect(bx2+4,puY+22,(bw-8)*(secs/def.duration),3);
          ctx.restore(); ctx.save(); puY-=32;
        }
        ctx.restore();
      }

      if (st.activePowerups.doubledmg>0) {
        ctx.save(); ctx.globalAlpha=Math.sin(st.time*20)*0.04+0.04; ctx.fillStyle='#ef4444'; ctx.fillRect(0,0,w,h); ctx.restore();
      }
      if (st.lives===1) {
        const vp=Math.sin(st.time*5.4)*0.32+0.35;
        const vg=ctx.createRadialGradient(w/2,h/2,h*0.24,w/2,h/2,h*0.9);
        vg.addColorStop(0,'transparent'); vg.addColorStop(1,`rgba(220,38,38,${vp})`);
        ctx.fillStyle=vg; ctx.fillRect(0,0,w,h);
      }

      ctx.restore(); // screen shake
    };

    // ── MAIN LOOP with fixed timestep accumulator ──
    const loop = (ts) => {
      if (loopDead) return;
      const st = stateRef.current;
      if (!st) { reqRef.current = requestAnimationFrame(loop); return; }

      if (st.dead) {
        loopDead = true;
        window.removeEventListener('click', handleTap);
        window.removeEventListener('touchstart', handleTap);
        onPlayerDieRef.current();
        return;
      }

      if (st.lastRealTime === null) { st.lastRealTime = ts; reqRef.current = requestAnimationFrame(loop); return; }

      const realDt = Math.min((ts - st.lastRealTime) / 1000, 0.1);
      st.lastRealTime = ts;
      st.accumulator += realDt;

      // Run simulation in deterministic fixed steps (max 3 catch-up steps)
      let steps = 0;
      while (st.accumulator >= FIXED_DT && steps < 3) {
        simulate(st, FIXED_DT);
        st.accumulator -= FIXED_DT;
        steps++;
        if (st.dead) break;
      }

      // Render once per real frame
      if (!st.dead) render(st, ts);

      reqRef.current = requestAnimationFrame(loop);
    };

    reqRef.current = requestAnimationFrame(loop);
    return () => {
      loopDead = true;
      cancelAnimationFrame(reqRef.current);
      window.removeEventListener('click', handleTap);
      window.removeEventListener('touchstart', handleTap);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 touch-none">
      <canvas ref={canvasRef} className="block w-full h-full touch-none" style={{ touchAction:'none' }} />
    </div>
  );
}