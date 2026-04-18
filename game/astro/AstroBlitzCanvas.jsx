import React, { useRef, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const SHIP_COLORS = {
  cyan:   { color: '#06b6d4', glow: '#67e8f9' },
  pink:   { color: '#ec4899', glow: '#f9a8d4' },
  green:  { color: '#22c55e', glow: '#86efac' },
  gold:   { color: '#fbbf24', glow: '#fde68a' },
  purple: { color: '#a855f7', glow: '#d8b4fe' },
  red:    { color: '#ef4444', glow: '#fca5a5' },
};

// ── 6 fire levels — each meaningfully different ──
const FIRE_LEVELS = [
  { kills: 0,  shots: 1, label: null,                   color: '#ffffff', desc: 'Einzel-Schuss' },
  { kills: 8,  shots: 2, label: '⚡ DOPPEL-FEUER!',      color: '#22c55e', desc: 'Doppel-Schuss' },
  { kills: 18, shots: 3, label: '🔥 DREIFACH-FEUER!',    color: '#f97316', desc: 'Dreifach-Spread' },
  { kills: 32, shots: 5, label: '💥 PENTA-FEUER!',       color: '#a855f7', desc: 'Penta-Fächer' },
  { kills: 50, shots: 5, label: '⚡ PLASMA-MODUS!',      color: '#06b6d4', desc: 'Plasma-Schnell' },
  { kills: 75, shots: 7, label: '👑 HYPER-KANONE!',      color: '#fbbf24', desc: 'Hyper-Volley' },
];

const POWERUP_DEFS = [
  { id: 'shield',    emoji: '🛡️', color: '#3b82f6', duration: 7000,  label: 'Schild' },
  { id: 'rapidfire', emoji: '🔥', color: '#f97316', duration: 6000,  label: 'Schnellfeuer' },
  { id: 'triple',    emoji: '✨', color: '#a855f7', duration: 8000,  label: 'Triple-Shot' },
  { id: 'homing',    emoji: '🎯', color: '#22c55e', duration: 7000,  label: 'Zielsuchend' },
  { id: 'nuke',      emoji: '💥', color: '#ef4444', duration: 0,     label: 'NUKE' },
  { id: 'laser',     emoji: '⚡', color: '#fbbf24', duration: 5000,  label: 'Laser' },
  { id: 'slow',      emoji: '🧊', color: '#67e8f9', duration: 6000,  label: 'Zeit-Slow' },
  { id: 'magnet',    emoji: '🧲', color: '#ec4899', duration: 8000,  label: 'Magnet' },
  { id: 'bigshot',   emoji: '🌀', color: '#8b5cf6', duration: 7000,  label: 'Mega-Shots' },
];

const ENEMY_TYPES = {
  drone:   { color: '#f43f5e', glow: '#fb7185', hp: 1,  size: 14, baseSpeed: 1.3, points: 100,  shape: 'diamond',  shootRate: 130, pattern: 'straight' },
  fighter: { color: '#f97316', glow: '#fdba74', hp: 2,  size: 18, baseSpeed: 1.0, points: 200,  shape: 'triangle', shootRate: 85,  pattern: 'zigzag'   },
  tank:    { color: '#7c3aed', glow: '#c084fc', hp: 5,  size: 26, baseSpeed: 0.5, points: 450,  shape: 'hex',      shootRate: 60,  pattern: 'straight' },
  sniper:  { color: '#06b6d4', glow: '#67e8f9', hp: 1,  size: 13, baseSpeed: 0.3, points: 350,  shape: 'arrow',    shootRate: 45,  pattern: 'side'     },
  boss:    { color: '#dc2626', glow: '#fca5a5', hp: 13, size: 44, baseSpeed: 0.35,points: 3000, shape: 'boss',     shootRate: 42,  pattern: 'boss'     },
};

const MAX_PARTICLES = 140;
const MAX_ENEMY_BULLETS = 55;

function buildWave(wave, w) {
  const queue = [];
  if (wave % 5 === 0) { queue.push({ type: 'boss', x: w / 2 }); return queue; }
  const count = Math.min(3 + Math.floor(wave * 1.5), 16);
  for (let i = 0; i < count; i++) {
    const r = Math.random();
    let type;
    if (wave <= 2)      type = r < 0.9 ? 'drone' : 'fighter';
    else if (wave <= 4) type = r < 0.6 ? 'drone' : r < 0.85 ? 'fighter' : 'tank';
    else                type = r < 0.3 ? 'drone' : r < 0.55 ? 'fighter' : r < 0.78 ? 'tank' : 'sniper';
    queue.push({ type, x: Math.random() * (w - 80) + 40 });
  }
  return queue;
}

function spawnEnemy(def, wave) {
  const t = ENEMY_TYPES[def.type];
  const speed = t.baseSpeed * (1 + (wave - 1) * 0.05);
  const extraHp = Math.floor(wave / 3);
  return {
    ...t, x: def.x, y: -t.size * 2,
    vx: 0, vy: speed, speed,
    hp: t.hp + extraHp, maxHp: t.hp + extraHp,
    type: def.type,
    shootTimer: Math.floor(t.shootRate * 0.8 + Math.random() * t.shootRate),
    angle: 0, waveOffset: Math.random() * Math.PI * 2,
    entryAnim: 25, flashTimer: 0, iframes: 0,
  };
}

function drawShip(ctx, x, y, size, color, glow, frames, dashAnim, tilt = 0) {
  const tiltAngle = Math.max(-0.28, Math.min(0.28, tilt * 0.045));
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tiltAngle);

  const flicker = 0.55 + Math.sin(frames * 0.55) * 0.25;
  const flicker2 = 0.4 + Math.cos(frames * 0.7 + 1) * 0.2;
  const flameGrad = ctx.createRadialGradient(0, size * 1.1, 0, 0, size * 1.5, size * 0.9 * flicker);
  flameGrad.addColorStop(0, glow + 'cc');
  flameGrad.addColorStop(0.4, glow + '55');
  flameGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = flameGrad; ctx.globalAlpha = flicker * 0.75;
  ctx.beginPath(); ctx.ellipse(0, size * 1.25, size * 0.25, size * 0.7 * flicker, 0, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = flicker2 * 0.55; ctx.fillStyle = glow + '88';
  ctx.beginPath(); ctx.ellipse(-size * 0.48, size * 0.95, size * 0.1, size * 0.38 * flicker2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(size * 0.48, size * 0.95, size * 0.1, size * 0.38 * flicker2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  if (dashAnim > 0) {
    ctx.globalAlpha = (dashAnim / 12) * 0.4;
    ctx.shadowBlur = 12; ctx.shadowColor = glow; ctx.fillStyle = glow;
    ctx.beginPath(); ctx.moveTo(0, -size); ctx.lineTo(size * 0.75, size * 0.8); ctx.lineTo(0, size * 0.35); ctx.lineTo(-size * 0.75, size * 0.8); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.shadowBlur = 22; ctx.shadowColor = glow; ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(0, -size); ctx.lineTo(size * 0.75, size * 0.8); ctx.lineTo(0, size * 0.35); ctx.lineTo(-size * 0.75, size * 0.8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = glow; ctx.globalAlpha = 0.3 + Math.sin(frames * 0.08) * 0.1;
  ctx.beginPath(); ctx.moveTo(0, -size * 0.3); ctx.lineTo(size * 0.55, size * 0.7); ctx.lineTo(0, size * 0.35); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, -size * 0.3); ctx.lineTo(-size * 0.55, size * 0.7); ctx.lineTo(0, size * 0.35); ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 1;
  const cgGrad = ctx.createRadialGradient(0, -size * 0.28, 0, 0, -size * 0.2, size * 0.28);
  cgGrad.addColorStop(0, '#ffffff'); cgGrad.addColorStop(0.4, glow); cgGrad.addColorStop(1, 'transparent');
  ctx.shadowBlur = 8; ctx.shadowColor = '#ffffff'; ctx.fillStyle = cgGrad; ctx.globalAlpha = 0.9;
  ctx.beginPath(); ctx.ellipse(0, -size * 0.28, size * 0.18, size * 0.24, 0, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}

// Enemy bullets drawn as distinct diamonds (red/orange) — much easier to see
function drawEnemyBullet(ctx, b, pm) {
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.shadowBlur = pm ? 0 : 14;
  ctx.shadowColor = b.color || '#ff4444';
  ctx.fillStyle = b.color || '#ff4444';
  const r = b.r || 5;
  ctx.beginPath();
  ctx.moveTo(0, -r * 1.4);
  ctx.lineTo(r, 0);
  ctx.lineTo(0, r * 1.4);
  ctx.lineTo(-r, 0);
  ctx.closePath();
  ctx.fill();
  // Bright core
  ctx.shadowBlur = pm ? 0 : 5; ctx.shadowColor = '#fff'; ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath(); ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawEnemy(ctx, e, frames, pm) {
  if (e.iframes > 0 && Math.floor(e.iframes / 3) % 2 === 0) return;
  const t = ENEMY_TYPES[e.type];
  const entryAlpha = e.entryAnim > 0 ? (1 - e.entryAnim / 25) : 1;
  ctx.save();
  ctx.translate(e.x, e.y);
  ctx.globalAlpha = entryAlpha;
  ctx.shadowBlur = pm ? 0 : (e.type === 'boss' ? 28 : 14);
  ctx.shadowColor = e.flashTimer > 0 ? '#ffffff' : t.glow;
  ctx.fillStyle = e.flashTimer > 0 ? '#ffffff' : t.color;

  if (e.shape === 'diamond') {
    const s = e.size + (pm ? 0 : Math.sin(frames * 0.1 + e.waveOffset) * 1.5);
    ctx.beginPath(); ctx.moveTo(0,-s); ctx.lineTo(s,0); ctx.lineTo(0,s); ctx.lineTo(-s,0); ctx.closePath(); ctx.fill();
  } else if (e.shape === 'triangle') {
    ctx.rotate(Math.PI); const s = e.size;
    ctx.beginPath(); ctx.moveTo(0,-s); ctx.lineTo(s*0.9,s); ctx.lineTo(-s*0.9,s); ctx.closePath(); ctx.fill();
  } else if (e.shape === 'hex') {
    ctx.rotate(frames * 0.018); const s = e.size;
    ctx.beginPath();
    for (let i=0;i<6;i++){const a=i*Math.PI/3; i===0?ctx.moveTo(Math.cos(a)*s,Math.sin(a)*s):ctx.lineTo(Math.cos(a)*s,Math.sin(a)*s);}
    ctx.closePath(); ctx.fill();
  } else if (e.shape === 'arrow') {
    ctx.rotate(Math.PI); const s = e.size;
    ctx.beginPath(); ctx.moveTo(0,-s*1.5); ctx.lineTo(s*0.5,s*0.5); ctx.lineTo(0,0); ctx.lineTo(-s*0.5,s*0.5); ctx.closePath(); ctx.fill();
  } else if (e.shape === 'boss') {
    e.angle = (e.angle||0) + 0.025;
    const s = e.size; const pulse = pm ? 0 : Math.sin(frames * 0.07) * 4;
    if (!pm) { ctx.strokeStyle=t.glow; ctx.lineWidth=3; ctx.globalAlpha=0.35; ctx.beginPath(); ctx.arc(0,0,s+pulse+18,0,Math.PI*2); ctx.stroke(); }
    ctx.globalAlpha = entryAlpha; ctx.fillStyle = e.flashTimer>0?'#ffffff':t.color;
    ctx.beginPath(); ctx.arc(0,0,s+pulse*0.4,0,Math.PI*2); ctx.fill();
    ctx.save(); ctx.rotate(e.angle); ctx.fillStyle='#ff6666';
    for(let c=0;c<4;c++){ctx.save();ctx.rotate(c*Math.PI/2);ctx.fillRect(-5,-(s+16),10,16);ctx.restore();}
    ctx.restore();
    ctx.fillStyle='#ffffff'; ctx.globalAlpha=0.85; ctx.shadowBlur=pm?0:20; ctx.shadowColor='#ffffff';
    ctx.beginPath(); ctx.arc(0,0,s*0.32,0,Math.PI*2); ctx.fill();
  }
  if (e.hp < e.maxHp && e.maxHp > 1) {
    const bw=e.size*3, bh=5; ctx.globalAlpha=0.9; ctx.shadowBlur=0;
    ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(-bw/2,e.size+7,bw,bh);
    const pct=e.hp/e.maxHp;
    ctx.fillStyle=pct>0.5?'#22c55e':pct>0.25?'#f97316':'#ef4444';
    ctx.fillRect(-bw/2,e.size+7,bw*pct,bh);
  }
  ctx.restore();
}

export default function AstroBlitzCanvas({ mode, user, matchId, isP1, onScoreUpdate, onWaveUpdate, onOppScoreUpdate, onGameOver }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const reqRef = useRef(null);
  const stateRef = useRef(null);
  const keysRef = useRef({});
  const joystickRef = useRef({ active: false, startX: 0, startY: 0, x: 0, y: 0 });
  const scoreIntervalRef = useRef(null);
  const oppSubRef = useRef(null);
  const [joystick, setJoystick] = useState(null);
  const [dashReady, setDashReady] = useState(true);
  const dashPressRef = useRef(false);

  const isMobile = /Mobi|Android|Touch/i.test(navigator.userAgent) || window.matchMedia('(pointer: coarse)').matches;

  const shipSkinId = (() => {
    try { return JSON.parse(localStorage.getItem('app_user')||'{}')?.neon_dash_upgrades?.active_skin_astro||'cyan'; }
    catch { return 'cyan'; }
  })();
  const shipSkin = SHIP_COLORS[shipSkinId] || SHIP_COLORS.cyan;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const pm = isMobile || (() => { const s = localStorage.getItem('neon_perf_mode'); return s === 'true'; })();

    const initState = (w, h) => ({
      w, h,
      player: { x: w/2, y: h-90, size: 15 },
      bullets: [], enemies: [], enemyBullets: [], particles: [], powerupDrops: [],
      activePowerups: {},
      score: 0, wave: 1,
      lives: 3,
      spawnQueue: buildWave(1, w),
      nextSpawnFrame: 30,
      waveTimer: 0,
      frames: 0,
      shootCooldown: 0,
      combo: 0, comboTimer: 0, maxCombo: 0,
      kills: 0, fireLevel: 0,
      screenShake: 0,
      dashCooldown: 0, dashAnim: 0, iframes: 0,
      gameOver: false,
      versusTimer: mode === 'versus' ? 90 * 60 : null,
      bgStars: Array.from({ length: pm ? 50 : 120 }, () => ({
        x: Math.random()*w, y: Math.random()*h,
        s: Math.random()*1.5+0.3,
        speed: Math.random()*0.6+0.1,
        twinkle: Math.random()*Math.PI*2,
        layer: Math.floor(Math.random()*3),
      })),
      bgNebula: pm ? [] : Array.from({ length: 3 }, () => ({
        x: Math.random()*w, y: Math.random()*h, r: 90+Math.random()*110,
        color: ['#06b6d4','#a855f7','#ec4899','#22c55e'][Math.floor(Math.random()*4)],
        speed: Math.random()*0.1+0.04,
      })),
    });

    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      if (!stateRef.current) stateRef.current = initState(canvas.width, canvas.height);
      else { stateRef.current.w = canvas.width; stateRef.current.h = canvas.height; }
    };
    resize();
    window.addEventListener('resize', resize);

    const onKeyDown = (e) => { keysRef.current[e.key]=true; if([' ','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) e.preventDefault(); };
    const onKeyUp   = (e) => { keysRef.current[e.key]=false; };
    const onMouseMove = (e) => {
      const r=canvas.getBoundingClientRect();
      if (stateRef.current) stateRef.current._aimX = e.clientX-r.left, stateRef.current._aimY = e.clientY-r.top;
    };

    // ── Mobile: single joystick on the LEFT half only ──
    // Right half: tap anywhere auto-aims. Shoot is always automatic.
    const activeTouches = new Map();

    const onTouchStart = (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      for (const t of e.changedTouches) {
        const cx = t.clientX - rect.left;
        const cy = t.clientY - rect.top;
        // Only the LEFT side spawns a joystick
        if (cx < canvas.width * 0.6) {
          activeTouches.set(t.identifier, { side: 'move', startX: cx, startY: cy, x: cx, y: cy });
          joystickRef.current = { active: true, startX: cx, startY: cy, x: cx, y: cy };
          setJoystick({ cx, cy, dx: 0, dy: 0 });
        } else {
          // Right side tap = manual aim override
          activeTouches.set(t.identifier, { side: 'aim', x: cx, y: cy });
          if (stateRef.current) { stateRef.current._aimX = cx; stateRef.current._aimY = cy; }
        }
      }
    };
    const onTouchMove = (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      for (const t of e.changedTouches) {
        const info = activeTouches.get(t.identifier);
        if (!info) continue;
        const cx = t.clientX - rect.left;
        const cy = t.clientY - rect.top;
        info.x = cx; info.y = cy;
        if (info.side === 'move') {
          const dx = cx - info.startX, dy = cy - info.startY;
          joystickRef.current = { active: true, startX: info.startX, startY: info.startY, x: cx, y: cy };
          setJoystick({ cx: info.startX, cy: info.startY, dx, dy });
        } else {
          if (stateRef.current) { stateRef.current._aimX = cx; stateRef.current._aimY = cy; }
        }
      }
    };
    const onTouchEnd = (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        const info = activeTouches.get(t.identifier);
        if (info?.side === 'move') { joystickRef.current.active = false; setJoystick(null); }
        activeTouches.delete(t.identifier);
      }
    };

    canvas.addEventListener('mousemove', onMouseMove);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });

    if (mode === 'versus' && matchId) {
      const sfDB = isP1 ? 'player1_score' : 'player2_score';
      scoreIntervalRef.current = setInterval(() => {
        if (!stateRef.current) return;
        base44.entities.NeonDashMatch.update(matchId, { [sfDB]: Math.floor(stateRef.current.score) }).catch(()=>{});
      }, 2000);
      oppSubRef.current = base44.entities.NeonDashMatch.subscribe((ev) => {
        if (ev.id !== matchId) return;
        onOppScoreUpdate(isP1 ? (ev.data?.player2_score||0) : (ev.data?.player1_score||0));
      });
    }

    // ── FIRE SYSTEM: based on fireLevel (0–5) ──
    const fireBullets = (st, bvx, bvy, bspd) => {
      const bx = st.player.x, by = st.player.y;
      const fl = st.fireLevel;
      const now = Date.now();
      const isTriple = (st.activePowerups.triple && st.activePowerups.triple > now);
      const isBigshot = (st.activePowerups.bigshot && st.activePowerups.bigshot > now);
      const isHoming = st.activePowerups.homing && st.activePowerups.homing > now;
      const bulletSize = isBigshot ? 7 : 4;

      let homingTarget = null;
      if (isHoming && st.enemies.length > 0) {
        let minD = Infinity;
        for (const e of st.enemies) { const d=Math.hypot(e.x-bx,e.y-by); if(d<minD){minD=d;homingTarget=e;} }
      }

      const mkB = (vx, vy, c, g, sz) => ({
        x: bx, y: by, vx, vy,
        color: c||shipSkin.color, glow: g||shipSkin.glow,
        homing: !!homingTarget, homingTarget,
        size: sz || bulletSize,
      });

      const perp = { x: -bvy/bspd, y: bvx/bspd };

      // Level 0: single
      st.bullets.push(mkB(bvx, bvy));

      // Level 1+: double
      if (fl >= 1 || isTriple) {
        st.bullets.push(mkB(bvx*0.97-perp.x*1.2, bvy*0.97-perp.y*1.2, '#a855f7', '#d8b4fe'));
        st.bullets.push(mkB(bvx*0.97+perp.x*1.2, bvy*0.97+perp.y*1.2, '#a855f7', '#d8b4fe'));
      }
      // Level 2+: triple spread (outer two)
      if (fl >= 2) {
        st.bullets.push(mkB(bvx*0.93-perp.x*2.6, bvy*0.93-perp.y*2.6, '#fbbf24', '#fde68a'));
        st.bullets.push(mkB(bvx*0.93+perp.x*2.6, bvy*0.93+perp.y*2.6, '#fbbf24', '#fde68a'));
      }
      // Level 3: penta — two diagonal back shots
      if (fl >= 3) {
        st.bullets.push(mkB(bvx*0.82-perp.x*4.0, bvy*0.82-perp.y*4.0, '#22c55e', '#86efac'));
        st.bullets.push(mkB(bvx*0.82+perp.x*4.0, bvy*0.82+perp.y*4.0, '#22c55e', '#86efac'));
      }
      // Level 4: plasma — extra center bullet, faster
      if (fl >= 4) {
        st.bullets.push(mkB(bvx*1.3, bvy*1.3, '#67e8f9', '#e0f2fe', 5));
      }
      // Level 5: hyper — two rear-facing side cannons
      if (fl >= 5) {
        const rearV = { x: perp.y, y: -perp.x }; // backwards
        st.bullets.push(mkB(-perp.x*bspd*0.7+rearV.x*bspd*0.4, -perp.y*bspd*0.7+rearV.y*bspd*0.4, '#fbbf24', '#fde68a'));
        st.bullets.push(mkB(perp.x*bspd*0.7+rearV.x*bspd*0.4,  perp.y*bspd*0.7+rearV.y*bspd*0.4,  '#fbbf24', '#fde68a'));
      }
    };

    const killEnemy = (st, e, idx, w, pm) => {
      const now = Date.now();
      const pts = ENEMY_TYPES[e.type].points * (1 + st.combo * 0.12);
      st.score += pts; st.kills++;
      st.combo = Math.min(st.combo+1, 25); st.comboTimer = 220;
      if (st.combo > st.maxCombo) st.maxCombo = st.combo;
      onScoreUpdate(Math.floor(st.score));
      st.screenShake = e.type === 'boss' ? 22 : 7;
      if (st.particles.length < MAX_PARTICLES)
        st.particles.push({ x:e.x, y:e.y-e.size, vx:0, vy:-1.6, life:1.6, color:'#fbbf24', isText:true, text:`+${Math.floor(pts)}${st.combo>2?` ×${st.combo}`:''}` });
      const streakLabel = st.combo===3?'DOPPELT!':st.combo===5?'DREIFACH!':st.combo===8?'RAMPAGE! 🔥':st.combo===12?'UNSTOPPABLE! 💥':st.combo===20?'GODLIKE! 👑':null;
      if (streakLabel && st.particles.length < MAX_PARTICLES)
        st.particles.push({ x:w/2, y:e.y-30, vx:0, vy:-0.7, life:2.2, color:'#f43f5e', isText:true, text:streakLabel });
      const cnt = e.type==='boss' ? (pm?25:60) : (pm?8:20);
      for (let p=0; p<cnt && st.particles.length<MAX_PARTICLES; p++) {
        const angle = (p/cnt)*Math.PI*2;
        const spd = e.type==='boss' ? 8+Math.random()*10 : 4+Math.random()*7;
        st.particles.push({ x:e.x, y:e.y, vx:Math.cos(angle)*spd, vy:Math.sin(angle)*spd, life:1.4+Math.random()*0.4, color:[ENEMY_TYPES[e.type].glow,ENEMY_TYPES[e.type].color,'#ffffff'][p%3], size: e.type==='boss'?4:2.5 });
      }
      // Powerup drop — slow gives extra chance
      const slowActive = st.activePowerups.slow && st.activePowerups.slow > now;
      if (Math.random() < (e.type==='boss'?1: slowActive ? 0.4 : 0.28)) {
        const pu = POWERUP_DEFS[Math.floor(Math.random()*POWERUP_DEFS.length)];
        st.powerupDrops.push({ x:e.x, y:e.y, ...pu, vy:1.8 });
      }
      st.enemies.splice(idx, 1);
    };

    const loop = () => {
      const st = stateRef.current;
      if (!st || st.gameOver) return;
      const ctx = canvas.getContext('2d');
      const { w, h } = st;
      st.frames++;

      if (st.screenShake > 0) st.screenShake *= 0.80;
      const sx = st.screenShake > 0.5 ? (Math.random()-0.5)*st.screenShake : 0;
      const sy = st.screenShake > 0.5 ? (Math.random()-0.5)*st.screenShake : 0;
      ctx.save(); ctx.translate(sx, sy);

      // ── BG ──
      ctx.fillStyle = '#03020f'; ctx.fillRect(-5,-5,w+10,h+10);
      if (!pm) {
        for (const nb of st.bgNebula) {
          nb.y = (nb.y+nb.speed)%(h+nb.r*2)-nb.r;
          const g=ctx.createRadialGradient(nb.x,nb.y,0,nb.x,nb.y,nb.r);
          g.addColorStop(0,nb.color+'12'); g.addColorStop(1,'transparent');
          ctx.fillStyle=g; ctx.beginPath(); ctx.arc(nb.x,nb.y,nb.r,0,Math.PI*2); ctx.fill();
        }
      }
      for (const s of st.bgStars) {
        const now = Date.now();
        const slowActive = st.activePowerups.slow && st.activePowerups.slow > now;
        const layerSpeed = slowActive ? [0.08,0.15,0.28][s.layer||0] : [0.3,0.6,1.1][s.layer||0];
        s.y = (s.y + s.speed * layerSpeed) % h;
        if (!pm) s.twinkle += 0.04;
        const a = pm ? 0.22 : Math.max(0.08, 0.22+Math.sin(s.twinkle)*0.18);
        const size = s.s * [0.55,0.85,1.2][s.layer||0];
        ctx.fillStyle=`rgba(255,255,255,${a})`;
        ctx.beginPath(); ctx.arc(s.x,s.y,size,0,Math.PI*2); ctx.fill();
      }

      // ── PLAYER MOVEMENT ──
      const keys = keysRef.current;
      const now = Date.now();
      const slowActive = st.activePowerups.slow && st.activePowerups.slow > now;
      const spd = 5;
      let pdx=0, pdy=0;
      if (keys['ArrowLeft']||keys['a']||keys['A']) pdx-=spd;
      if (keys['ArrowRight']||keys['d']||keys['D']) pdx+=spd;
      if (keys['ArrowUp']||keys['w']||keys['W']) pdy-=spd;
      if (keys['ArrowDown']||keys['s']||keys['S']) pdy+=spd;

      if (joystickRef.current.active) {
        const jt = joystickRef.current;
        const dx = jt.x - jt.startX, dy = jt.y - jt.startY;
        const dist = Math.hypot(dx, dy);
        const deadzone = 12;
        if (dist > deadzone) {
          const factor = Math.min(1, (dist - deadzone) / 55);
          pdx += (dx/dist)*spd*factor;
          pdy += (dy/dist)*spd*factor;
        }
      }

      // Dash (keyboard: Shift; mobile: handled via dashPressRef from button)
      if (st.dashCooldown > 0) {
        st.dashCooldown--;
        // Sync UI dash button state
        const rdy = st.dashCooldown === 0;
        if (rdy !== dashReady) setDashReady(rdy);
      }
      if (st.dashAnim > 0) st.dashAnim--;
      const doDash = (keys['Shift']||keys['ShiftLeft']||keys['ShiftRight']||dashPressRef.current) && st.dashCooldown===0 && (pdx!==0||pdy!==0||isMobile);
      if (doDash) {
        dashPressRef.current = false;
        const dl = Math.hypot(pdx,pdy)||1;
        const dboost = 80;
        pdx += (pdx/dl)*dboost; pdy += (pdy/dl)*dboost;
        st.dashCooldown=75; st.dashAnim=12; st.iframes=20;
        setDashReady(false);
        for (let i=0; i<(pm?4:10) && st.particles.length<MAX_PARTICLES; i++)
          st.particles.push({ x:st.player.x, y:st.player.y, vx:-pdx*0.06+(Math.random()-0.5)*3, vy:-pdy*0.06+(Math.random()-0.5)*3, life:0.6, color:shipSkin.glow });
      }

      st.player.x = Math.max(st.player.size, Math.min(w-st.player.size, st.player.x+pdx));
      st.player.y = Math.max(st.player.size, Math.min(h-st.player.size, st.player.y+pdy));
      st.player.tilt = (st.player.tilt||0) * 0.8 + pdx * 0.2;
      if (st.iframes > 0) st.iframes--;
      if (!pm && st.frames % 2 === 0 && st.particles.length < MAX_PARTICLES)
        st.particles.push({ x: st.player.x+(Math.random()-0.5)*5, y: st.player.y+st.player.size*1.1, vx:(Math.random()-0.5)*1.2, vy:1.5+Math.random()*1.5, life:0.55, color: shipSkin.glow, size:2 });

      // ── AIM & AUTO-SHOOT ──
      if (st.shootCooldown > 0) st.shootCooldown--;
      const isRapid = !!(st.activePowerups.rapidfire && st.activePowerups.rapidfire > now);
      // Level 4 = plasma = faster fire rate
      const baseCooldown = isRapid ? 4 : (st.fireLevel >= 4 ? 7 : st.fireLevel >= 1 ? 9 : 12);

      // Aim: mouse > state aim (from right-touch) > auto-target nearest enemy
      let aimX = st._aimX ?? null, aimY = st._aimY ?? null;
      if (aimX !== null && st.enemies.length > 0) {
        let near=null, nd=Infinity;
        for (const e of st.enemies) { const d=Math.hypot(e.x-aimX,e.y-aimY); if(d<nd&&d<80){nd=d;near=e;} }
        if (near) { aimX=near.x; aimY=near.y; }
      }
      if (aimX===null && st.enemies.length > 0) {
        let near=null, nd=Infinity;
        for (const e of st.enemies) { const d=Math.hypot(e.x-st.player.x,e.y-st.player.y); if(d<nd){nd=d;near=e;} }
        if (near) { aimX=near.x; aimY=near.y; }
      }

      if (st.shootCooldown <= 0) {
        st.shootCooldown = baseCooldown;
        const bspd = st.fireLevel >= 4 ? 17 : 15;
        let bvx=0, bvy=-bspd;
        if (aimX !== null) {
          const adx=aimX-st.player.x, ady=aimY-st.player.y;
          const adist=Math.hypot(adx,ady);
          if (adist > 5) { bvx=(adx/adist)*bspd; bvy=(ady/adist)*bspd; }
        }
        fireBullets(st, bvx, bvy, bspd);
      }

      // ── LASER POWERUP ──
      if (st.activePowerups.laser && st.activePowerups.laser>now && st.enemies.length>0) {
        let laserTarget=null; let ld=Infinity;
        for (const e of st.enemies) { const d=Math.hypot(e.x-st.player.x,e.y-st.player.y); if(d<ld){ld=d;laserTarget=e;} }
        if (laserTarget) {
          ctx.save();
          ctx.strokeStyle='#fbbf24'; ctx.lineWidth=pm?3:5;
          ctx.shadowBlur=pm?0:18; ctx.shadowColor='#fbbf24';
          ctx.globalAlpha=0.7+Math.sin(st.frames*0.4)*0.2;
          ctx.beginPath(); ctx.moveTo(st.player.x,st.player.y); ctx.lineTo(laserTarget.x,laserTarget.y); ctx.stroke();
          ctx.restore();
          if (st.frames%6===0) {
            laserTarget.hp--; laserTarget.flashTimer=3;
            if (laserTarget.hp<=0) { killEnemy(st, laserTarget, st.enemies.indexOf(laserTarget), w, pm); }
          }
        }
      }

      // ── SLOW POWERUP: apply to all enemy speeds ──
      const slowMult = (slowActive) ? 0.35 : 1;

      // ── EXPIRE POWERUPS ──
      for (const k of Object.keys(st.activePowerups)) { if (st.activePowerups[k]<now) delete st.activePowerups[k]; }

      if (st.comboTimer > 0) st.comboTimer--; else st.combo=0;

      // ── FIRE LEVEL UP ──
      const newFL = FIRE_LEVELS.reduce((acc, fl, idx) => st.kills >= fl.kills ? idx : acc, 0);
      if (newFL > st.fireLevel) {
        st.fireLevel = newFL;
        const flDef = FIRE_LEVELS[newFL];
        if (flDef.label && st.particles.length < MAX_PARTICLES)
          st.particles.push({ x:w/2, y:h/2-30, vx:0, vy:-1, life:2.2, color:flDef.color, isText:true, text:flDef.label });
        // Flash screen on level up
        st.screenShake = 10;
      }

      // ── WAVE SYSTEM ──
      if (st.waveTimer > 0) {
        st.waveTimer--;
        if (st.waveTimer === 0) st.nextSpawnFrame = st.frames + 10;
      } else {
        if (st.spawnQueue.length > 0 && st.frames >= st.nextSpawnFrame) {
          const def = st.spawnQueue.shift();
          st.enemies.push(spawnEnemy(def, st.wave));
          st.nextSpawnFrame = st.frames + 25;
        }
        if (st.spawnQueue.length === 0 && st.enemies.length === 0) {
          st.wave++; onWaveUpdate(st.wave);
          st.waveTimer = 110;
          st.spawnQueue = buildWave(st.wave, w);
          st.nextSpawnFrame = Infinity;
        }
      }

      if (st.versusTimer !== null) {
        st.versusTimer--;
        if (st.versusTimer <= 0) { st.gameOver=true; onGameOver(Math.floor(st.score),st.wave); ctx.restore(); return; }
      }

      // ── PLAYER BULLETS ──
      for (let i=st.bullets.length-1; i>=0; i--) {
        const b = st.bullets[i];
        b.x += b.vx; b.y += b.vy;
        if (b.y < -20 || b.y > h+20 || b.x < -20 || b.x > w+20) { st.bullets.splice(i,1); continue; }
        if (b.homing && b.homingTarget && b.homingTarget.hp > 0) {
          const hdx = b.homingTarget.x - b.x, hdy = b.homingTarget.y - b.y;
          const hd = Math.hypot(hdx, hdy);
          if (hd > 5) { b.vx += (hdx/hd)*0.8; b.vy += (hdy/hd)*0.8; const bspd=Math.hypot(b.vx,b.vy); if(bspd>16){b.vx=b.vx/bspd*16;b.vy=b.vy/bspd*16;} }
        }
        if (!pm && st.frames % 2 === 0 && st.particles.length < MAX_PARTICLES)
          st.particles.push({ x: b.x, y: b.y, vx:(Math.random()-0.5)*1.2, vy:(Math.random()-0.5)*1.2, life:0.35, color:b.glow, size:2.5 });
        const bsz = b.size || 4;
        ctx.save();
        ctx.shadowBlur = pm ? 0 : 18; ctx.shadowColor = b.glow;
        ctx.fillStyle = b.color;
        ctx.beginPath(); ctx.arc(b.x, b.y, bsz, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = pm ? 0 : 6; ctx.shadowColor = '#ffffff'; ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(b.x, b.y, bsz * 0.5, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      }

      // ── ENEMY BULLETS — distinct diamond shape ──
      if (st.enemyBullets.length > MAX_ENEMY_BULLETS) st.enemyBullets.splice(0, st.enemyBullets.length - MAX_ENEMY_BULLETS);
      for (let i=st.enemyBullets.length-1; i>=0; i--) {
        const b=st.enemyBullets[i];
        b.x+=b.vx*slowMult; b.y+=b.vy*slowMult;
        if (b.y>h+20||b.y<-20||b.x<-20||b.x>w+20) { st.enemyBullets.splice(i,1); continue; }
        drawEnemyBullet(ctx, b, pm);
        if (st.iframes===0 && Math.hypot(b.x-st.player.x,b.y-st.player.y)<st.player.size*0.7+(b.r||5)) {
          if (st.activePowerups.shield && st.activePowerups.shield>now) {
            st.enemyBullets.splice(i,1); st.screenShake=5;
            for(let p=0;p<8&&st.particles.length<MAX_PARTICLES;p++) st.particles.push({x:st.player.x,y:st.player.y,vx:(Math.random()-0.5)*12,vy:(Math.random()-0.5)*12,life:0.7,color:'#3b82f6'});
            continue;
          }
          st.enemyBullets.splice(i, 1);
          st.lives--; st.iframes=120; st.screenShake=18;
          for(let p=0;p<(pm?8:20)&&st.particles.length<MAX_PARTICLES;p++) st.particles.push({x:st.player.x,y:st.player.y,vx:(Math.random()-0.5)*15,vy:(Math.random()-0.5)*15,life:1.0,color:'#ef4444'});
          if (st.particles.length<MAX_PARTICLES) st.particles.push({x:w/2,y:h/2-20,vx:0,vy:-1,life:2.0,color:'#ef4444',isText:true,text:`💔 ${st.lives} Leben übrig`});
          if (st.lives <= 0) { st.gameOver=true; onGameOver(Math.floor(st.score),st.wave); ctx.restore(); return; }
        }
      }

      // ── ENEMIES ──
      for (let i=st.enemies.length-1; i>=0; i--) {
        const e=st.enemies[i];
        if (e.entryAnim>0) e.entryAnim--;
        if (e.flashTimer>0) e.flashTimer--;
        if (e.iframes>0) e.iframes--;

        // Slow powerup affects enemy movement
        const eSpeedMult = slowActive ? 0.3 : 1;
        if (e.type==='fighter') { e.x+=Math.sin(st.frames*0.05+e.waveOffset)*2.8*eSpeedMult; e.y+=e.vy*eSpeedMult; }
        else if (e.type==='sniper') { e.x+=Math.cos(st.frames*0.03+e.waveOffset)*3.2*eSpeedMult; e.y+=e.vy*eSpeedMult; }
        else if (e.type==='boss') { e.x+=Math.sin(st.frames*0.011+e.waveOffset)*2.5*eSpeedMult; e.y=Math.min(h*0.2,e.y+e.vy*(e.y<h*0.18?1:0.03)*eSpeedMult); }
        else { e.x+=e.vx*eSpeedMult; e.y+=e.vy*eSpeedMult; if(e.x<e.size||e.x>w-e.size) e.vx*=-1; }
        e.x = Math.max(e.size, Math.min(w - e.size, e.x));
        if (e.y > h + e.size * 2) { st.enemies.splice(i, 1); continue; }

        if (e.shootTimer>0) e.shootTimer--;
        else {
          e.shootTimer = Math.floor((ENEMY_TYPES[e.type].shootRate+Math.floor(Math.random()*25)) / (slowActive ? 3 : 1));
          const pdx2=st.player.x-e.x, pdy2=st.player.y-e.y;
          const dist2=Math.hypot(pdx2,pdy2);
          if (dist2>0) {
            const spd2=e.type==='boss'?3.8:e.type==='sniper'?8:3.5;
            // Enemy bullets: red for normal, orange for boss, cyan for sniper
            const col=e.type==='sniper'?'#ff9d00':e.type==='boss'?'#ff2200':'#ff4466';
            const r=e.type==='boss'?6:e.type==='sniper'?5:5;
            if (st.enemyBullets.length<MAX_ENEMY_BULLETS)
              st.enemyBullets.push({x:e.x,y:e.y+e.size*0.5,vx:(pdx2/dist2)*spd2,vy:(pdy2/dist2)*spd2,color:col,r});
            if (e.type==='boss') {
              for (const offset of [-0.3,-0.15,0.15,0.3]) {
                const ang=Math.atan2(pdy2,pdx2)+offset;
                if (st.enemyBullets.length<MAX_ENEMY_BULLETS)
                  st.enemyBullets.push({x:e.x,y:e.y+e.size*0.5,vx:Math.cos(ang)*spd2*0.8,vy:Math.sin(ang)*spd2*0.8,color:'#ff3300',r:5});
              }
            }
          }
        }

        drawEnemy(ctx, e, st.frames, pm);

        if (st.iframes===0 && Math.hypot(e.x-st.player.x,e.y-st.player.y)<e.size+st.player.size*0.65) {
          if (st.activePowerups.shield && st.activePowerups.shield>now) { killEnemy(st,e,i,w,pm); continue; }
          st.lives--; st.iframes = 120; st.screenShake = 18;
          for(let p=0;p<(pm?8:20)&&st.particles.length<MAX_PARTICLES;p++) st.particles.push({x:st.player.x,y:st.player.y,vx:(Math.random()-0.5)*15,vy:(Math.random()-0.5)*15,life:1.0,color:'#ef4444'});
          if (st.particles.length<MAX_PARTICLES) st.particles.push({x:w/2,y:h/2-20,vx:0,vy:-1,life:2.0,color:'#ef4444',isText:true,text:`💔 ${st.lives} Leben übrig`});
          if (st.lives <= 0) { st.gameOver=true; onGameOver(Math.floor(st.score),st.wave); ctx.restore(); return; }
        }

        let killed=false;
        for (let j=st.bullets.length-1; j>=0; j--) {
          const b=st.bullets[j];
          if (Math.hypot(b.x-e.x,b.y-e.y)<e.size+7) {
            if (e.iframes>0) { st.bullets.splice(j,1); continue; }
            e.hp--; e.flashTimer=5; e.iframes=4;
            st.bullets.splice(j,1);
            for (let p=0;p<(pm?2:6)&&st.particles.length<MAX_PARTICLES;p++)
              st.particles.push({x:b.x,y:b.y,vx:(Math.random()-0.5)*8,vy:(Math.random()-0.5)*8,life:0.5,color:ENEMY_TYPES[e.type].glow,size:2.5});
            if (e.hp<=0) { killEnemy(st,e,i,w,pm); killed=true; break; }
          }
          if (killed) break;
        }
      }

      // ── MAGNET POWERUP: pull drops toward player ──
      const magnetActive = st.activePowerups.magnet && st.activePowerups.magnet > now;

      // ── POWERUP DROPS ──
      for (let i=st.powerupDrops.length-1; i>=0; i--) {
        const p=st.powerupDrops[i];
        if (magnetActive) {
          const dx=st.player.x-p.x, dy=st.player.y-p.y;
          const d=Math.hypot(dx,dy);
          if (d > 1) { p.x += (dx/d)*5; p.y += (dy/d)*5; }
        } else { p.y+=p.vy; }
        if (p.y>h+40) { st.powerupDrops.splice(i,1); continue; }
        const pulse=Math.sin(st.frames*0.13)*2;
        ctx.save();
        ctx.shadowBlur=pm?0:20; ctx.shadowColor=p.color;
        ctx.strokeStyle=p.color; ctx.lineWidth=2; ctx.fillStyle=p.color+'28';
        ctx.beginPath(); ctx.arc(p.x,p.y,15+pulse,0,Math.PI*2); ctx.fill(); ctx.stroke();
        ctx.shadowBlur=0; ctx.font='17px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(p.emoji,p.x,p.y);
        ctx.restore();
        if (Math.hypot(p.x-st.player.x,p.y-st.player.y)<28) {
          if (p.id==='nuke') {
            const pts=st.enemies.reduce((a,e)=>a+ENEMY_TYPES[e.type].points,0);
            st.score+=pts; st.kills+=st.enemies.length; onScoreUpdate(Math.floor(st.score));
            st.enemies=[]; st.enemyBullets=[]; st.screenShake=25;
            for (let np=0;np<(pm?15:45)&&st.particles.length<MAX_PARTICLES;np++)
              st.particles.push({x:w/2,y:h/2,vx:(Math.random()-0.5)*26,vy:(Math.random()-0.5)*26,life:1.8,color:['#f97316','#fbbf24','#ef4444','#ffffff'][np%4]});
          } else { st.activePowerups[p.id]=now+p.duration; }
          // Pickup notification
          if (st.particles.length<MAX_PARTICLES)
            st.particles.push({x:p.x,y:p.y-20,vx:0,vy:-1.2,life:1.6,color:p.color,isText:true,text:`${p.emoji} ${p.label||p.id}`});
          st.powerupDrops.splice(i,1);
        }
      }

      // ── PARTICLES ──
      if (st.particles.length > MAX_PARTICLES) st.particles.splice(0, st.particles.length - MAX_PARTICLES);
      for (let i=st.particles.length-1; i>=0; i--) {
        const p=st.particles[i];
        p.x+=p.vx; p.y+=p.vy; p.life-=p.isText?0.010:0.022;
        p.vx*=0.92; p.vy*=0.92;
        if (p.life<=0) { st.particles.splice(i,1); continue; }
        ctx.save(); ctx.globalAlpha=Math.min(1,p.life*1.5);
        if (p.isText) {
          ctx.shadowBlur=pm?0:10; ctx.shadowColor=p.color; ctx.fillStyle=p.color;
          ctx.font=`bold ${p.life>0.8?15:13}px sans-serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
          ctx.fillText(p.text,p.x,p.y);
        } else {
          ctx.shadowBlur=pm?0:7; ctx.shadowColor=p.color; ctx.fillStyle=p.color;
          ctx.beginPath(); ctx.arc(p.x,p.y,(p.size||3.5)*Math.min(1,p.life*1.4),0,Math.PI*2); ctx.fill();
        }
        ctx.restore();
      }

      // ── AIM LINE (desktop) ──
      if (!pm && !isMobile && st.enemies.length>0) {
        let near=null; let nd=Infinity;
        for (const e of st.enemies) { const d=Math.hypot(e.x-st.player.x,e.y-st.player.y); if(d<nd){nd=d;near=e;} }
        if (near && nd < h*0.6) {
          ctx.save();
          ctx.setLineDash([4,8]); ctx.strokeStyle=shipSkin.glow+'50'; ctx.lineWidth=1;
          ctx.beginPath(); ctx.moveTo(st.player.x,st.player.y); ctx.lineTo(near.x,near.y); ctx.stroke();
          ctx.setLineDash([]);
          ctx.strokeStyle=shipSkin.glow+'80'; ctx.lineWidth=1.5; ctx.shadowBlur=6; ctx.shadowColor=shipSkin.glow;
          ctx.beginPath(); ctx.arc(near.x,near.y,near.size+5,0,Math.PI*2); ctx.stroke();
          ctx.restore();
        }
      }

      // ── PLAYER ──
      ctx.shadowBlur=0;
      if (st.activePowerups.shield && st.activePowerups.shield>now) {
        const sp=Math.sin(st.frames*0.15)*4;
        ctx.save(); ctx.strokeStyle='#60a5fa'; ctx.lineWidth=2.5;
        ctx.shadowBlur=pm?0:18; ctx.shadowColor='#3b82f6';
        ctx.globalAlpha=0.6+Math.sin(st.frames*0.2)*0.2;
        ctx.beginPath(); ctx.arc(st.player.x,st.player.y,st.player.size+16+sp,0,Math.PI*2); ctx.stroke();
        ctx.restore();
      }
      // Slow powerup: cyan tint around player
      if (slowActive) {
        const sp2=Math.sin(st.frames*0.1)*3;
        ctx.save(); ctx.strokeStyle='#67e8f9'; ctx.lineWidth=1.5;
        ctx.globalAlpha=0.4; ctx.shadowBlur=pm?0:12; ctx.shadowColor='#67e8f9';
        ctx.beginPath(); ctx.arc(st.player.x,st.player.y,st.player.size+22+sp2,0,Math.PI*2); ctx.stroke();
        ctx.restore();
      }
      if (st.iframes===0 || Math.floor(st.iframes/3)%2===0)
        drawShip(ctx,st.player.x,st.player.y,st.player.size,shipSkin.color,shipSkin.glow,st.frames,st.dashAnim, st.player.tilt||0);

      if (st.dashCooldown>0) {
        ctx.save(); ctx.strokeStyle='rgba(255,255,255,0.3)'; ctx.lineWidth=2;
        const pct=1-st.dashCooldown/75;
        ctx.beginPath(); ctx.arc(st.player.x,st.player.y+st.player.size+9,6,-Math.PI/2,-Math.PI/2+pct*Math.PI*2); ctx.stroke();
        ctx.restore();
      }

      // Danger vignette
      const closestEnemyDist = st.enemies.reduce((min, e) => Math.min(min, Math.hypot(e.x-st.player.x, e.y-st.player.y)), Infinity);
      if (closestEnemyDist < 130) {
        const pulse = 0.15 + Math.sin(st.frames * 0.28) * 0.07;
        const vig = ctx.createRadialGradient(st.player.x, st.player.y, 30, st.player.x, st.player.y, 180);
        vig.addColorStop(0, 'transparent');
        vig.addColorStop(1, `rgba(239,68,68,${pulse})`);
        ctx.fillStyle = vig; ctx.fillRect(0, 0, w, h);
      }

      // ── HUD ──
      ctx.shadowBlur=0;

      // Dark semi-transparent bar at top for readability
      ctx.fillStyle='rgba(0,0,0,0.35)'; ctx.fillRect(0,0,w,58);

      ctx.fillStyle='rgba(255,255,255,0.95)';
      ctx.font='bold 22px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top';
      ctx.fillText(Math.floor(st.score).toLocaleString(),w/2,10);
      const enemiesLeft = (st.spawnQueue?.length||0) + st.enemies.length;
      ctx.font='bold 10px sans-serif'; ctx.fillStyle='rgba(255,255,255,0.35)';
      ctx.fillText(`WELLE ${st.wave}${enemiesLeft>0?` · ${enemiesLeft}×`:''}`,w/2,36);

      // Lives
      ctx.font='16px sans-serif'; ctx.textAlign='left'; ctx.textBaseline='top';
      ctx.fillText(['💀','❤️','❤️❤️','❤️❤️❤️'][Math.max(0,st.lives)], 10, 8);

      // Fire level indicator
      if (st.fireLevel>0) {
        const flDef = FIRE_LEVELS[st.fireLevel];
        ctx.save(); ctx.fillStyle=flDef.color; ctx.font='bold 10px sans-serif'; ctx.textAlign='left';
        ctx.shadowBlur=pm?0:7; ctx.shadowColor=flDef.color;
        ctx.fillText(`🔥 ${flDef.desc}`, 10, 56);
        ctx.restore();
      }

      // Next level progress bar (bottom of HUD area)
      const nextFL = FIRE_LEVELS[st.fireLevel + 1];
      if (nextFL) {
        const currFL = FIRE_LEVELS[st.fireLevel];
        const pct = (st.kills - currFL.kills) / (nextFL.kills - currFL.kills);
        const bw = Math.min(100, w * 0.25), bh = 3;
        const bx2 = 10, by2 = 70;
        ctx.save();
        ctx.fillStyle='rgba(255,255,255,0.1)'; ctx.fillRect(bx2,by2,bw,bh);
        ctx.fillStyle=FIRE_LEVELS[st.fireLevel].color;
        ctx.fillRect(bx2,by2,bw*pct,bh);
        ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.font='9px sans-serif'; ctx.textAlign='left'; ctx.textBaseline='top';
        ctx.fillText(`→ ${nextFL.desc} (${st.kills}/${nextFL.kills})`, bx2, by2+5);
        ctx.restore();
      }

      // Combo
      if (st.combo>=2&&st.comboTimer>0) {
        const ca=Math.min(1,st.comboTimer/60);
        const cc=st.combo>=15?'#f43f5e':st.combo>=8?'#f97316':'#fbbf24';
        ctx.save(); ctx.globalAlpha=ca;
        const sc=1+Math.sin(st.frames*0.35)*0.06;
        ctx.translate(w-18,16); ctx.scale(sc,sc);
        ctx.shadowBlur=pm?0:12; ctx.shadowColor=cc;
        ctx.fillStyle=cc; ctx.font=`bold ${st.combo>=8?17:13}px sans-serif`; ctx.textAlign='right'; ctx.textBaseline='top';
        ctx.fillText(`⚡ ×${st.combo} COMBO`,0,0);
        ctx.restore();
      }

      // Versus timer
      if (st.versusTimer!==null) {
        const ts=Math.ceil(st.versusTimer/60);
        ctx.fillStyle=ts<=10?'#f43f5e':'rgba(255,255,255,0.7)'; ctx.font=`bold ${ts<=10?16:12}px sans-serif`;
        ctx.textAlign='right'; ctx.textBaseline='top';
        if (ts<=10&&!pm){ctx.shadowBlur=10;ctx.shadowColor='#f43f5e';}
        ctx.fillText(`⏱ ${ts}s`,w-16,36); ctx.shadowBlur=0;
      }

      // Active powerup bars
      const apKeys=Object.keys(st.activePowerups);
      if (apKeys.length > 0) {
        const barH = 22, barW = Math.min(140, (w - 20) / apKeys.length - 8);
        const totalW = apKeys.length * (barW + 8) - 8;
        let bx = w / 2 - totalW / 2;
        apKeys.forEach((k) => {
          const def=POWERUP_DEFS.find(d=>d.id===k); if(!def) { bx += barW + 8; return; }
          const rem=Math.max(0,(st.activePowerups[k]-now)/1000);
          const pct = def.duration > 0 ? rem / (def.duration / 1000) : 1;
          const by = h - barH - (isMobile ? 90 : 18);
          ctx.save();
          ctx.fillStyle='rgba(0,0,0,0.55)'; ctx.beginPath(); ctx.roundRect(bx, by, barW, barH, 6); ctx.fill();
          ctx.fillStyle = def.color;
          if (!pm) { ctx.shadowBlur=8; ctx.shadowColor=def.color; }
          ctx.beginPath(); ctx.roundRect(bx, by, barW * pct, barH, 6); ctx.fill();
          ctx.shadowBlur=0; ctx.fillStyle='#fff'; ctx.font='bold 10px sans-serif';
          ctx.textAlign='center'; ctx.textBaseline='middle';
          ctx.fillText(`${def.emoji} ${def.duration>0?rem.toFixed(1)+'s':'AKTIV'}`, bx + barW / 2, by + barH / 2);
          ctx.restore();
          bx += barW + 8;
        });
      }

      // Wave announcement
      if (st.waveTimer>0&&st.waveTimer<108) {
        const alpha=Math.min(1,Math.min(st.waveTimer,110-st.waveTimer)/18);
        ctx.save(); ctx.globalAlpha=alpha;
        const isBossWave = st.wave % 5 === 0;
        const bossColor = isBossWave ? '#dc2626' : '#fbbf24';
        const bossGlow  = isBossWave ? '#fca5a5' : '#fde68a';
        ctx.fillStyle='rgba(0,0,0,0.65)'; ctx.fillRect(0,h/2-44,w,88);
        ctx.shadowBlur=pm?0:28; ctx.shadowColor=bossGlow;
        ctx.fillStyle=bossColor; ctx.font=`bold ${isBossWave?28:24}px sans-serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(isBossWave ? `⚠️ BOSS WELLE ${st.wave}!` : `✅ WELLE ${st.wave-1} ABGESCHLOSSEN!`,w/2,h/2-10);
        if (isBossWave) {
          ctx.shadowBlur=0; ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='bold 13px sans-serif';
          ctx.fillText('Mach dich bereit...',w/2,h/2+18);
        }
        ctx.restore();
      }

      ctx.restore();
      reqRef.current = requestAnimationFrame(loop);
    };

    reqRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(reqRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      clearInterval(scoreIntervalRef.current);
      if (oppSubRef.current) oppSubRef.current();
    };
  }, []);

  const handleDash = () => {
    dashPressRef.current = true;
  };

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 touch-none select-none">
      <canvas ref={canvasRef} className="block w-full h-full" style={{ touchAction: 'none', cursor: isMobile ? 'default' : 'crosshair' }} />

      {/* Mobile joystick overlay */}
      {isMobile && joystick && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Large base ring */}
          <div style={{
            position: 'absolute',
            left: joystick.cx - 60, top: joystick.cy - 60,
            width: 120, height: 120,
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.04)',
          }} />
          {/* Inner ring */}
          <div style={{
            position: 'absolute',
            left: joystick.cx - 30, top: joystick.cy - 30,
            width: 60, height: 60,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.12)',
          }} />
          {/* Knob */}
          <div style={{
            position: 'absolute',
            left: joystick.cx + Math.max(-50, Math.min(50, joystick.dx)) - 24,
            top: joystick.cy + Math.max(-50, Math.min(50, joystick.dy)) - 24,
            width: 48, height: 48,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.3)',
            border: '2.5px solid rgba(255,255,255,0.7)',
            boxShadow: '0 0 12px rgba(255,255,255,0.2)',
          }} />
        </div>
      )}

      {/* Mobile DASH button — bottom right */}
      {isMobile && (
        <button
          onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); handleDash(); }}
          style={{
            position: 'absolute',
            bottom: 24, right: 20,
            width: 64, height: 64,
            borderRadius: '50%',
            background: dashReady ? 'rgba(6,182,212,0.35)' : 'rgba(255,255,255,0.08)',
            border: `2.5px solid ${dashReady ? 'rgba(6,182,212,0.8)' : 'rgba(255,255,255,0.2)'}`,
            color: dashReady ? '#67e8f9' : 'rgba(255,255,255,0.3)',
            fontSize: 11,
            fontWeight: 900,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            touchAction: 'none',
            userSelect: 'none',
            boxShadow: dashReady ? '0 0 18px rgba(6,182,212,0.4)' : 'none',
          }}>
          <span style={{ fontSize: 20 }}>⚡</span>
          <span style={{ fontSize: 9, letterSpacing: '0.1em' }}>DASH</span>
        </button>
      )}

      {/* Mobile hint */}
      {isMobile && !joystick && (
        <div className="absolute bottom-6 left-6 pointer-events-none text-white/25 text-xs leading-tight">
          <div>← Linke Seite: Bewegen</div>
          <div>⚡ Dash-Button: Ausweichen</div>
        </div>
      )}

      {/* Desktop hint */}
      {!isMobile && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none text-white/20 text-xs">
          WASD / Pfeiltasten · Maus = Zielen · SHIFT = Dash
        </div>
      )}
    </div>
  );
}