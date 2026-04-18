import React, { useEffect, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// CHRONOSPHERE — Top-Down Orbital Defender
// ═══════════════════════════════════════════════════════════════════════════════

const PLANET_R   = 68;
const ORBIT_R    = 138;
const PLAYER_W   = 10;
const BULLET_SPD = 480;
const SHOOT_CD   = 0.18;

// Wingman orbits slightly behind the player at +/-30°
const WINGMAN_OFFSET = Math.PI / 6; // 30°
// Defense turret: fixed on orbit ring, auto-shoots nearest meteor
const TURRET_SHOOT_CD = 0.55;

function lerp(a, b, t) { return a + (b - a) * t; }

const CITY_LIGHTS = Array.from({ length: 20 }, (_, i) => ({
  a: (i / 20) * Math.PI * 2 + 0.3,
  r: 0.3 + (i % 4) * 0.13,
}));

// ── Spawn helpers ──────────────────────────────────────────────────────────────
function spawnMeteor(wave, spawnR) {
  const angle = Math.random() * Math.PI * 2;
  const speed = 48 + wave * 8 + Math.random() * 22;
  const size  = 7 + Math.random() * 14;
  const sides = 6 + Math.floor(Math.random() * 3);
  const shape = Array.from({ length: sides }, (_, i) => {
    const a = (i / sides) * Math.PI * 2;
    const r = size * (0.62 + Math.random() * 0.42);
    return { x: Math.cos(a) * r, y: Math.sin(a) * r };
  });
  return {
    x: Math.cos(angle) * spawnR,
    y: Math.sin(angle) * spawnR,
    vx: -Math.cos(angle) * speed,
    vy: -Math.sin(angle) * speed,
    size, hp: size > 17 ? 2 : 1,
    angle: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 3.2,
    shape, trail: [],
    exploding: false, explodeTimer: 0,
    split: size > 17, big: size > 17,
  };
}

function spawnCrystal() {
  const angle = Math.random() * Math.PI * 2;
  const r = PLANET_R + 22 + Math.random() * (ORBIT_R - PLANET_R - 40);
  return {
    angle, r,
    x: Math.cos(angle) * r,
    y: Math.sin(angle) * r,
    pulse: Math.random() * Math.PI * 2,
    spinAngle: 0,
    spin: (Math.random() - 0.5) * 2.0,
    floatPhase: Math.random() * Math.PI * 2,
  };
}

function spawnPowerup(spawnR) {
  const types = ['shield', 'rapidfire', 'bomb', 'wingman', 'turret'];
  const type = types[Math.floor(Math.random() * types.length)];
  const angle = Math.random() * Math.PI * 2;
  return {
    x: Math.cos(angle) * spawnR,
    y: Math.sin(angle) * spawnR,
    vx: -Math.cos(angle) * 26,
    vy: -Math.sin(angle) * 26,
    type, angle: 0, size: 14,
    glowPhase: Math.random() * Math.PI * 2,
  };
}

function puColor(type) {
  if (type === 'shield')    return '#00d4ff';
  if (type === 'rapidfire') return '#f97316';
  if (type === 'wingman')   return '#22c55e';
  if (type === 'turret')    return '#fbbf24';
  return '#a855f7'; // bomb
}

function spawnBurst(st, x, y, baseSize, color, count) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const spd = 35 + Math.random() * baseSize * 3.5;
    st.particles.push({ x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
      size: 1.5 + Math.random() * 2, color, life: 0.3 + Math.random() * 0.4, maxLife: 0.7 });
  }
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function ChronosphereGame({ isPlaying, onGameOver }) {
  const canvasRef = useRef(null);
  const stateRef  = useRef({});

  // ── Input ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const keys = {};
    const kd = (e) => {
      keys[e.key] = true;
      if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key)) e.preventDefault();
    };
    const ku = (e) => { keys[e.key] = false; };
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    stateRef.current._keys = keys;

    // ── Improved touch controls ─────────────────────────────────────────
    // Uses a joystick-style delta: track where touch started & current X
    const touches = {};
    const joy = { left: false, right: false, dx: 0 };
    stateRef.current._joy = joy;

    const updateJoy = (e) => {
      e.preventDefault();
      joy.left = false; joy.right = false; joy.dx = 0;

      let totalDx = 0;
      let count = 0;

      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        const id = touch.identifier;

        if (e.type === 'touchstart' || !touches[id]) {
          touches[id] = { startX: touch.clientX, currentX: touch.clientX };
        } else {
          touches[id].currentX = touch.clientX;
        }

        const dx = touches[id].currentX - touches[id].startX;
        totalDx += dx;
        count++;
      }

      if (count > 0) {
        const avgDx = totalDx / count;
        joy.dx = avgDx;
        // Dead zone of 8px, then proportional response
        if (avgDx < -8) joy.left = true;
        else if (avgDx > 8) joy.right = true;
      }
    };

    const onTouchEnd = (e) => {
      e.preventDefault();
      // Remove ended touches
      const activeTouches = new Set();
      for (let i = 0; i < e.touches.length; i++) {
        activeTouches.add(e.touches[i].identifier);
      }
      for (const id in touches) {
        if (!activeTouches.has(parseInt(id))) delete touches[id];
      }

      // Re-evaluate remaining touches
      joy.left = false; joy.right = false; joy.dx = 0;
      let totalDx = 0;
      let count = 0;
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        const id = touch.identifier;
        if (touches[id]) {
          const dx = touches[id].currentX - touches[id].startX;
          totalDx += dx;
          count++;
        }
      }
      if (count > 0) {
        const avgDx = totalDx / count;
        joy.dx = avgDx;
        if (avgDx < -8) joy.left = true;
        else if (avgDx > 8) joy.right = true;
      }
    };

    window.addEventListener('touchstart', updateJoy, { passive: false });
    window.addEventListener('touchmove',  updateJoy, { passive: false });
    window.addEventListener('touchend',   onTouchEnd, { passive: false });
    window.addEventListener('touchcancel',onTouchEnd, { passive: false });
    return () => {
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
      window.removeEventListener('touchstart', updateJoy);
      window.removeEventListener('touchmove', updateJoy);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
  }, []);

  // ── Game loop ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = canvas.parentElement?.clientWidth  || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const st = stateRef.current;
    let rafId = null;

    // ── IDLE ────────────────────────────────────────────────────────────
    if (!isPlaying) {
      st.alive = false;
      let idleAngle = 0;
      const idleLoop = () => {
        rafId = requestAnimationFrame(idleLoop);
        idleAngle += 0.004;
        const w = canvas.width, h = canvas.height;
        drawBackground(ctx, w, h, idleAngle * 0.05);
        drawPlanet(ctx, w, h, idleAngle * 0.08);
        drawOrbitRing(ctx, w, h, 0.3);
        const px = w / 2 + Math.cos(idleAngle * 0.7) * ORBIT_R;
        const py = h / 2 + Math.sin(idleAngle * 0.7) * ORBIT_R;
        drawShip(ctx, px, py, idleAngle * 0.7 + Math.PI / 2 + Math.PI, false, false, 0.6);
      };
      rafId = requestAnimationFrame(idleLoop);
      return () => { cancelAnimationFrame(rafId); window.removeEventListener('resize', resize); };
    }

    // ── INIT ────────────────────────────────────────────────────────────
    Object.assign(st, {
      alive: true,
      score: 0, wave: 1, crystals: 0, lives: 3,
      playerAngle: -Math.PI / 2,
      playerSpeed: 0,
      bullets: [], meteors: [], crystalList: [], powerups: [],
      particles: [], floatTexts: [],
      shieldTimer: 0, rapidTimer: 0,
      shootCd: 0, waveTimer: 0, meteorTimer: 0,
      combo: 0, comboTimer: 0, maxCombo: 0,
      bombCount: 0,
      screenShake: 0, shakeX: 0, shakeY: 0,
      hitFlash: 0, planetRot: 0,
      invincibleTimer: 0,
      scoreMultTimer: 0,
      scoreMult: 2,
      // ── NEW: Wingmen & Turrets ──────────────────────────────────────────
      wingmanTimer: 0,       // seconds remaining for wingmen
      wingmanCount: 0,       // 0, 1 or 2 active wingmen
      wingmanShootCds: [0, 0],
      turrets: [],           // [{ angle, shootCd, level }] — permanent-style per-pickup
      turretTimer: 0,        // countdown before oldest turret expires
      // Permanent upgrades (earned at score milestones)
      upgFormation: 0,       // 0=single, 1=dual, 2=triple spread
    });

    for (let i = 0; i < 4; i++) st.crystalList.push(spawnCrystal());

    let last = performance.now();

    // ── GAME LOOP ────────────────────────────────────────────────────────
    const loop = (now) => {
      if (!st.alive) return;
      rafId = requestAnimationFrame(loop);
      const rawDt = (now - last) / 1000;
      last = now;
      const dt = Math.min(rawDt, 0.05);
      const t = now * 0.001;

      const w = canvas.width, h = canvas.height;
      const spawnR = Math.min(w, h) * 0.52;
      const keys = st._keys || {};
      const joy  = st._joy  || {};

      // ── Wave progression ──────────────────────────────────────────────
      st.waveTimer += dt;
      if (st.waveTimer > 30) { st.waveTimer = 0; st.wave++; }
      st.planetRot += dt * 0.1;
      st.score += dt * 10 * st.wave * st.scoreMult;

      // ── Score-milestone formation upgrades ───────────────────────────
      if (st.score >= 5000  && st.upgFormation < 1) { st.upgFormation = 1; st.floatTexts.push({ x: 0, y: -ORBIT_R - 30, text: '⬡ DUAL CANNON!', life: 2.5, color: '#00ffcc' }); }
      if (st.score >= 15000 && st.upgFormation < 2) { st.upgFormation = 2; st.floatTexts.push({ x: 0, y: -ORBIT_R - 30, text: '⬡ TRIPLE SPREAD!', life: 2.5, color: '#fbbf24' }); }

      // ── Wingman timer ──────────────────────────────────────────────────
      if (st.wingmanTimer > 0) {
        st.wingmanTimer = Math.max(0, st.wingmanTimer - dt);
        if (st.wingmanTimer <= 0) { st.wingmanCount = 0; }
      }

      // ── Turret timer (oldest expires after 20s) ───────────────────────
      if (st.turrets.length > 0) {
        st.turretTimer = Math.max(0, st.turretTimer - dt);
        if (st.turretTimer <= 0 && st.turrets.length > 0) {
          st.turrets.shift(); // remove oldest
          if (st.turrets.length > 0) st.turretTimer = 20;
        }
      }

      // ── Player movement — improved feel ───────────────────────────────
      // Proportional speed from touch delta for precise control
      const maxSpd = (2.2 + st.wave * 0.04) * 0.0174533;
      const goL = keys['ArrowLeft']  || keys['a'] || keys['A'] || joy.left;
      const goR = keys['ArrowRight'] || keys['d'] || keys['D'] || joy.right;

      // Touch: scale speed by drag distance for analog feel (max at 80px drag)
      const touchScale = joy.dx !== 0 ? Math.min(1.0, Math.abs(joy.dx) / 80) : 1.0;
      const accelT = 12; // how fast to reach target speed
      const decelT = 18; // faster deceleration for snappier stop

      if      (goL) st.playerSpeed = lerp(st.playerSpeed, -maxSpd * (joy.dx !== 0 ? touchScale : 1), accelT * dt);
      else if (goR) st.playerSpeed = lerp(st.playerSpeed,  maxSpd * (joy.dx !== 0 ? touchScale : 1), accelT * dt);
      else          st.playerSpeed = lerp(st.playerSpeed,  0,      decelT * dt);

      st.playerAngle += st.playerSpeed * dt * 60;
      const px = Math.cos(st.playerAngle) * ORBIT_R;
      const py = Math.sin(st.playerAngle) * ORBIT_R;

      // ── Auto-shoot outward ────────────────────────────────────────────
      st.shootCd -= dt;
      const cd = st.rapidTimer > 0 ? SHOOT_CD * 0.28 : SHOOT_CD;
      const makeB = (ox, oy, ang, spd = 1, col = null) => ({
        x: ox + Math.cos(ang) * (PLAYER_W + 8),
        y: oy + Math.sin(ang) * (PLAYER_W + 8),
        vx: Math.cos(ang) * BULLET_SPD * spd,
        vy: Math.sin(ang) * BULLET_SPD * spd,
        life: 1.1, rapid: st.rapidTimer > 0, col,
      });
      if (st.shootCd <= 0) {
        st.shootCd = cd;
        const ba = st.playerAngle;
        // Formation upgrades
        if (st.upgFormation >= 2) {
          // Triple spread
          st.bullets.push(makeB(px, py, ba));
          st.bullets.push(makeB(px, py, ba - 0.18, 0.92));
          st.bullets.push(makeB(px, py, ba + 0.18, 0.92));
        } else if (st.upgFormation === 1) {
          // Dual: main + offset
          st.bullets.push(makeB(px, py, ba));
          st.bullets.push(makeB(px, py, ba - 0.12, 0.95));
        } else {
          st.bullets.push(makeB(px, py, ba));
        }
        // Rapid extra spread
        if (st.rapidTimer > 0) {
          st.bullets.push(makeB(px, py, ba - 0.22, 0.88));
          st.bullets.push(makeB(px, py, ba + 0.22, 0.88));
        }
      }

      // ── Wingman shooting ──────────────────────────────────────────────
      for (let wi = 0; wi < st.wingmanCount; wi++) {
        const wDir = wi === 0 ? 1 : -1;
        const wAngle = st.playerAngle + wDir * WINGMAN_OFFSET;
        const wpx = Math.cos(wAngle) * ORBIT_R;
        const wpy = Math.sin(wAngle) * ORBIT_R;
        st.wingmanShootCds[wi] = Math.max(0, (st.wingmanShootCds[wi] || 0) - dt);
        if (st.wingmanShootCds[wi] <= 0) {
          st.wingmanShootCds[wi] = SHOOT_CD * 1.3;
          st.bullets.push(makeB(wpx, wpy, wAngle, 1.0, '#22c55e'));
        }
      }

      // ── Defense turrets auto-shoot nearest meteor ─────────────────────
      for (let ti = 0; ti < st.turrets.length; ti++) {
        const turr = st.turrets[ti];
        turr.shootCd = Math.max(0, (turr.shootCd || 0) - dt);
        const tx = Math.cos(turr.angle) * ORBIT_R;
        const ty = Math.sin(turr.angle) * ORBIT_R;
        // Slowly drift turret angle
        turr.angle += 0.003 * dt * 60;
        if (turr.shootCd <= 0 && st.meteors.length > 0) {
          // Find nearest meteor
          let nearest = null, nearDist = 99999;
          for (const m of st.meteors) {
            if (m.exploding) continue;
            const dd = (m.x - tx) ** 2 + (m.y - ty) ** 2;
            if (dd < nearDist) { nearDist = dd; nearest = m; }
          }
          if (nearest) {
            turr.shootCd = TURRET_SHOOT_CD * (st.rapidTimer > 0 ? 0.5 : 1);
            const ang = Math.atan2(nearest.y - ty, nearest.x - tx);
            st.bullets.push({ x: tx + Math.cos(ang) * 14, y: ty + Math.sin(ang) * 14, vx: Math.cos(ang) * BULLET_SPD * 0.85, vy: Math.sin(ang) * BULLET_SPD * 0.85, life: 1.4, rapid: false, col: '#fbbf24', isTurret: true });
          }
        }
      }

      // ── Bomb (B key or double-tap) ────────────────────────────────────
      if ((keys['b'] || keys['B']) && !st._bombPressed && st.bombCount > 0) {
        st._bombPressed = true;
        st.bombCount--;
        st.meteors.forEach(m => {
          spawnBurst(st, m.x, m.y, m.size, '#f97316', 16);
          st.score += 80 * Math.max(1, st.combo);
        });
        st.meteors = [];
        st.screenShake = 0.7; st.hitFlash = 0.5;
      }
      if (!keys['b'] && !keys['B']) st._bombPressed = false;

      // ── Timers ────────────────────────────────────────────────────────
      if (st.shieldTimer     > 0) st.shieldTimer     = Math.max(0, st.shieldTimer - dt);
      if (st.rapidTimer      > 0) st.rapidTimer      = Math.max(0, st.rapidTimer  - dt);
      if (st.invincibleTimer > 0) st.invincibleTimer = Math.max(0, st.invincibleTimer - dt);
      if (st.scoreMultTimer  > 0) { st.scoreMultTimer = Math.max(0, st.scoreMultTimer - dt); if (st.scoreMultTimer <= 0) st.scoreMult = 1; }
      if (st.comboTimer  > 0) { st.comboTimer -= dt; if (st.comboTimer <= 0) st.combo = 0; }
      if (st.screenShake > 0) {
        st.shakeX = (Math.random() - 0.5) * st.screenShake * 14;
        st.shakeY = (Math.random() - 0.5) * st.screenShake * 14;
        st.screenShake = Math.max(0, st.screenShake - dt * 3.5);
      } else { st.shakeX = 0; st.shakeY = 0; }
      if (st.hitFlash > 0) st.hitFlash = Math.max(0, st.hitFlash - dt * 2.5);

      // ── Spawn meteors ─────────────────────────────────────────────────
      st.meteorTimer += dt;
      const spawnRate = Math.max(0.40, 2.4 - st.wave * 0.15);
      if (st.meteorTimer >= spawnRate) {
        st.meteorTimer = 0;
        st.meteors.push(spawnMeteor(st.wave, spawnR));
        // Two meteors at once from wave 5+
        if (st.wave >= 5 && Math.random() < 0.30) st.meteors.push(spawnMeteor(st.wave, spawnR));
        if (Math.random() < 0.15) st.powerups.push(spawnPowerup(spawnR));
      }

      // ── Bullets ───────────────────────────────────────────────────────
      for (let i = st.bullets.length - 1; i >= 0; i--) {
        const b = st.bullets[i];
        b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
        if (b.life <= 0) { st.bullets.splice(i, 1); continue; }
        const bDist = Math.sqrt(b.x * b.x + b.y * b.y);
        if (bDist > spawnR + 20) { st.bullets.splice(i, 1); continue; }
        let hit = false;
        for (let j = st.meteors.length - 1; j >= 0; j--) {
          const m = st.meteors[j];
          if (m.exploding) continue;
          const dx = b.x - m.x, dy = b.y - m.y;
          if (dx * dx + dy * dy < (m.size + 4) ** 2) {
            m.hp--;
            spawnBurst(st, m.x, m.y, 5, '#ffaa44', 5);
            if (m.hp <= 0) {
              m.exploding = true; m.explodeTimer = 0.45;
              st.combo++; st.comboTimer = 2.8;
              if (st.combo > st.maxCombo) st.maxCombo = st.combo;
              // Score multiplier milestone at combo 10
              if (st.combo === 10) { st.scoreMult = 2; st.scoreMultTimer = 8; st.floatTexts.push({ x: m.x, y: m.y - 20, text: '🔥 2× PUNKTE!', life: 2.0, color: '#f43f5e' }); }
              const pts = Math.floor(m.size * 9) * Math.max(1, 1 + Math.floor(st.combo / 3) * 0.5) * st.scoreMult;
              st.score += pts;
              spawnBurst(st, m.x, m.y, m.size, m.big ? '#ff6600' : '#ff9933', 16);
              st.floatTexts.push({ x: m.x, y: m.y, text: `+${Math.floor(pts)}`, life: 1.0, color: st.combo >= 5 ? '#f43f5e' : '#facc15' });
              if (m.split) {
                [-1, 1].forEach(dir => {
                  const nm = spawnMeteor(st.wave, spawnR);
                  nm.x = m.x; nm.y = m.y;
                  nm.size = m.size * 0.55; nm.hp = 1; nm.split = false; nm.big = false;
                  const da = Math.PI * 0.5 + (Math.random() - 0.5) * 0.5;
                  const base = Math.atan2(m.vy, m.vx) + dir * da;
                  const spd = Math.sqrt(m.vx * m.vx + m.vy * m.vy) * 0.78;
                  nm.vx = Math.cos(base) * spd; nm.vy = Math.sin(base) * spd;
                  st.meteors.push(nm);
                });
              }
            }
            hit = true; break;
          }
        }
        if (hit) st.bullets.splice(i, 1);
      }

      // ── Meteors ───────────────────────────────────────────────────────
      for (let i = st.meteors.length - 1; i >= 0; i--) {
        const m = st.meteors[i];
        if (m.exploding) { m.explodeTimer -= dt; if (m.explodeTimer <= 0) st.meteors.splice(i, 1); continue; }
        m.x += m.vx * dt; m.y += m.vy * dt;
        m.angle += m.rotSpeed * dt;
        if (m.trail.length > 8) m.trail.shift();
        m.trail.push({ x: m.x, y: m.y });

        const dist = Math.sqrt(m.x * m.x + m.y * m.y);
        if (dist < PLANET_R + m.size * 0.45) {
          spawnBurst(st, m.x, m.y, m.size * 1.4, '#ff4400', 20);
          st.meteors.splice(i, 1);
          st.screenShake = 0.6; st.hitFlash = 0.85; st.combo = 0;
          st.lives--;
          if (st.lives <= 0) { st.alive = false; cancelAnimationFrame(rafId); onGameOver(Math.floor(st.score), { wave: st.wave, crystals: st.crystals, combo: st.maxCombo }); return; }
          continue;
        }
        // Hit player — with brief invincibility window after taking damage
        if (st.invincibleTimer > 0) continue;
        const dx = m.x - px, dy = m.y - py;
        const hitR = st.shieldTimer > 0 ? PLAYER_W * 2.3 : PLAYER_W * 1.1;
        if (dx * dx + dy * dy < (m.size + hitR) ** 2) {
          if (st.shieldTimer > 0) {
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            m.vx = (dx / len) * 130; m.vy = (dy / len) * 130;
            spawnBurst(st, px, py, 10, '#00d4ff', 12);
          } else {
            spawnBurst(st, px, py, 18, '#4488ff', 16);
            st.meteors.splice(i, 1);
            st.screenShake = 0.55; st.hitFlash = 1.1; st.combo = 0;
            st.invincibleTimer = 1.5; // 1.5s grace period
            st.lives--;
            if (st.lives <= 0) { st.alive = false; cancelAnimationFrame(rafId); onGameOver(Math.floor(st.score), { wave: st.wave, crystals: st.crystals, combo: st.maxCombo }); return; }
          }
        }
      }

      // ── Powerups ──────────────────────────────────────────────────────
      for (let i = st.powerups.length - 1; i >= 0; i--) {
        const p = st.powerups[i];
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.angle += 2 * dt; p.glowPhase += dt * 2.5;
        if (Math.sqrt(p.x * p.x + p.y * p.y) < PLANET_R + 5) { st.powerups.splice(i, 1); continue; }
        const dx = p.x - px, dy = p.y - py;
        if (dx * dx + dy * dy < (p.size + PLAYER_W + 8) ** 2) {
          if      (p.type === 'shield')    { st.shieldTimer = 8; }
          else if (p.type === 'rapidfire') { st.rapidTimer  = 7; }
          else if (p.type === 'bomb')      { st.bombCount++; }
          else if (p.type === 'wingman') {
            st.wingmanTimer = 14;
            st.wingmanCount = Math.min(2, st.wingmanCount + 1);
            st.wingmanShootCds = [0, 0];
          }
          else if (p.type === 'turret') {
            const tAngle = st.playerAngle + Math.PI * (0.5 + Math.random() * 0.5) * (Math.random() > 0.5 ? 1 : -1);
            if (st.turrets.length < 4) st.turrets.push({ angle: tAngle, shootCd: 0 });
            st.turretTimer = 20;
          }
          spawnBurst(st, px, py, 16, puColor(p.type), 14);
          const labelMap = { shield: '🛡 SCHILD', rapidfire: '⚡ RAPID', bomb: '💣 BOMBE', wingman: '🛸 WINGMAN', turret: '🔫 GESCHÜTZ' };
          const label = labelMap[p.type] || p.type;
          st.floatTexts.push({ x: p.x, y: p.y, text: label, life: 1.5, color: puColor(p.type) });
          st.score += 300;
          st.powerups.splice(i, 1);
        }
      }

      // ── Crystals ──────────────────────────────────────────────────────
      for (let i = st.crystalList.length - 1; i >= 0; i--) {
        const c = st.crystalList[i];
        c.pulse += dt * 2; c.spinAngle += c.spin * dt; c.floatPhase += dt;
        c.angle += 0.007 * dt * 60;
        const cr = c.r + Math.sin(c.floatPhase * 1.2) * 3;
        c.x = Math.cos(c.angle) * cr;
        c.y = Math.sin(c.angle) * cr;
        const dx = c.x - px, dy = c.y - py;
        if (dx * dx + dy * dy < (13 + PLAYER_W) ** 2) {
          st.crystalList.splice(i, 1);
          st.crystals++;
          const pts = Math.floor(180 * st.wave * Math.max(1, 1 + Math.floor(st.combo / 3) * 0.5) * st.scoreMult);
          st.score += pts;
          spawnBurst(st, c.x, c.y, 11, '#00ffcc', 14);
          st.floatTexts.push({ x: c.x, y: c.y, text: `+${pts} 💎`, life: 1.2, color: '#00ffcc' });
          setTimeout(() => { if (st.alive) st.crystalList.push(spawnCrystal()); }, 1200);
        }
      }
      while (st.crystalList.length < 4) st.crystalList.push(spawnCrystal());

      // ── Particles & floatTexts ────────────────────────────────────────
      for (let i = st.particles.length - 1; i >= 0; i--) {
        const p = st.particles[i];
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.vx *= 0.93; p.vy *= 0.93;
        p.life -= dt;
        if (p.life <= 0) st.particles.splice(i, 1);
      }
      for (let i = st.floatTexts.length - 1; i >= 0; i--) {
        st.floatTexts[i].life -= dt;
        st.floatTexts[i].y -= 22 * dt;
        if (st.floatTexts[i].life <= 0) st.floatTexts.splice(i, 1);
      }

      // ── RENDER ────────────────────────────────────────────────────────
      const camX = w / 2 + st.shakeX;
      const camY = h / 2 + st.shakeY;

      drawBackground(ctx, w, h, st.playerAngle * 0.05);
      drawPlanet(ctx, w, h, st.planetRot);
      drawOrbitRing(ctx, w, h, 0.38 + Math.sin(t * 1.8) * 0.05);

      ctx.save();
      ctx.translate(camX, camY);

      // Particles
      for (const p of st.particles) {
        const alpha = Math.max(0, p.life / (p.maxLife || 0.7));
        ctx.globalAlpha = alpha * 0.88;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.5, p.size * alpha), 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Meteor trails
      for (const m of st.meteors) {
        if (m.exploding || m.trail.length < 2) continue;
        for (let ti = 1; ti < m.trail.length; ti++) {
          const a = (ti / m.trail.length) * 0.25;
          ctx.strokeStyle = m.big ? `rgba(255,90,10,${a})` : `rgba(255,150,50,${a})`;
          ctx.lineWidth = m.size * 0.28 * (ti / m.trail.length);
          ctx.beginPath(); ctx.moveTo(m.trail[ti-1].x, m.trail[ti-1].y); ctx.lineTo(m.trail[ti].x, m.trail[ti].y); ctx.stroke();
        }
      }

      // Crystals
      for (const c of st.crystalList) {
        const pulse = Math.sin(c.pulse + t) * 0.16 + 0.9;
        const s = 6.5 * pulse;
        ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.spinAngle);
        ctx.fillStyle = `rgba(0,255,200,${0.82 * pulse})`;
        ctx.strokeStyle = 'rgba(100,255,230,0.85)'; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -s*1.5); ctx.lineTo(s*0.6, -s*0.25);
        ctx.lineTo(s*0.78, s*0.42); ctx.lineTo(0, s*1.0);
        ctx.lineTo(-s*0.78, s*0.42); ctx.lineTo(-s*0.6, -s*0.25);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.restore();
      }

      // Powerups
      for (const p of st.powerups) {
        const col = puColor(p.type);
        const pulse = Math.sin(p.glowPhase + t * 3) * 0.15 + 1;
        const icon = p.type === 'shield' ? '🛡' : p.type === 'rapidfire' ? '⚡' : '💣';
        const ps = p.size * pulse;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle);
        ctx.strokeStyle = col; ctx.lineWidth = 2;
        ctx.fillStyle = col + '28';
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          i === 0 ? ctx.moveTo(Math.cos(a)*ps, Math.sin(a)*ps) : ctx.lineTo(Math.cos(a)*ps, Math.sin(a)*ps);
        }
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.restore();
        ctx.font = `${Math.max(11, Math.floor(ps * 1.1))}px sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(icon, p.x, p.y);
      }

      // Turrets on orbit ring
      for (const turr of st.turrets) {
        const tx = Math.cos(turr.angle) * ORBIT_R;
        const ty = Math.sin(turr.angle) * ORBIT_R;
        ctx.save();
        ctx.translate(tx, ty);
        ctx.rotate(turr.angle + Math.PI / 4);
        ctx.shadowBlur = 10; ctx.shadowColor = '#fbbf24';
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
        const ts = 9;
        ctx.strokeRect(-ts/2, -ts/2, ts, ts);
        // barrel
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-2, -ts/2 - 5, 4, 7);
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = 0.15 + Math.sin(t * 3 + turr.angle) * 0.05;
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1; ctx.setLineDash([3, 6]);
        ctx.beginPath(); ctx.arc(tx, ty, 55, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]); ctx.restore();
      }

      // Wingmen ships
      for (let wi = 0; wi < st.wingmanCount; wi++) {
        const wDir = wi === 0 ? 1 : -1;
        const wAngle = st.playerAngle + wDir * WINGMAN_OFFSET;
        const wpx = Math.cos(wAngle) * ORBIT_R;
        const wpy = Math.sin(wAngle) * ORBIT_R;
        const wFlicker = st.wingmanTimer < 3 ? Math.sin(t * 15) > 0 : true;
        if (wFlicker) drawShip(ctx, wpx, wpy, wAngle - Math.PI / 2 + Math.PI, false, goL || goR, 0.72, t, '#22c55e');
      }

      // Bullets
      for (const b of st.bullets) {
        const col = b.col || (b.rapid ? '#ff9944' : b.isTurret ? '#fbbf24' : '#00d4ff');
        ctx.globalAlpha = Math.min(1, b.life * 1.8);
        ctx.strokeStyle = col; ctx.lineWidth = b.rapid ? 3 : 2.2;
        const tailLen = b.isTurret ? 10 : 16;
        const bLen = Math.sqrt(b.vx*b.vx + b.vy*b.vy) || 1;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x - (b.vx/bLen)*tailLen, b.y - (b.vy/bLen)*tailLen);
        ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.globalAlpha = Math.min(1, b.life * 2);
        ctx.beginPath(); ctx.arc(b.x, b.y, b.rapid ? 3.2 : 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Meteors
      for (const m of st.meteors) {
        if (m.exploding) {
          const prog = 1 - m.explodeTimer / 0.45;
          const er = m.size * (1 + prog * 2.2);
          ctx.globalAlpha = (1 - prog) * 0.88;
          ctx.fillStyle = prog < 0.4 ? '#ff6600' : '#ffcc44';
          ctx.beginPath(); ctx.arc(m.x, m.y, er, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 1;
          continue;
        }
        ctx.save();
        ctx.translate(m.x, m.y); ctx.rotate(m.angle);
        ctx.fillStyle = m.big ? '#8b2a0a' : '#bb3a1a';
        ctx.strokeStyle = m.big ? '#ff5522' : '#ff3d1a'; ctx.lineWidth = 1.5;
        ctx.beginPath();
        m.shape.forEach((pt, i) => i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y));
        ctx.closePath(); ctx.fill(); ctx.stroke();
        if (m.big && m.hp > 0) {
          ctx.strokeStyle = 'rgba(255,180,80,0.7)'; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(0, 0, m.size + 5, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.restore();
      }

      // Float texts
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (const ft of st.floatTexts) {
        ctx.globalAlpha = Math.max(0, ft.life);
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(ft.text, ft.x, ft.y);
      }
      ctx.globalAlpha = 1;

      // Player ship — flicker during invincibility
      const invFlicker = st.invincibleTimer > 0 ? Math.sin(t * 22) > 0 : true;
      const thrusterOn = goL || goR;
      if (invFlicker) {
        drawShip(ctx, px, py, st.playerAngle - Math.PI / 2, st.shieldTimer > 0, thrusterOn, 1.0, t);
      }

      ctx.restore();

      // Mobile touch controls overlay
      drawTouchOverlay(ctx, w, h, joy);

      // HUD in screen space
      drawHUD(ctx, w, h, st, t);

      // Hit flash overlay
      if (st.hitFlash > 0) {
        ctx.fillStyle = `rgba(255,0,0,${Math.min(0.32, st.hitFlash * 0.22)})`;
        ctx.fillRect(0, 0, w, h);
      }
    };

    rafId = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(rafId); window.removeEventListener('resize', resize); };
  }, [isPlaying, onGameOver]);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ touchAction: 'none', display: 'block' }} />
  );
}

// ── Draw helpers ───────────────────────────────────────────────────────────────

function drawBackground(ctx, w, h, parallaxAngle) {
  ctx.fillStyle = '#000008';
  ctx.fillRect(0, 0, w, h);
  const nebs = [
    { x: 0.28, y: 0.38, r: 0.5, col: 'rgba(12,5,45,0.75)' },
    { x: 0.72, y: 0.62, r: 0.4, col: 'rgba(0,12,38,0.65)' },
    { x: 0.5,  y: 0.18, r: 0.3, col: 'rgba(18,2,32,0.5)'  },
  ];
  for (const n of nebs) {
    const g = ctx.createRadialGradient(n.x*w, n.y*h, 0, n.x*w, n.y*h, n.r*w);
    g.addColorStop(0, n.col); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }
  const cx = w / 2, cy = h / 2;
  for (let i = 0; i < 100; i++) {
    const a = i * 2.399963 + parallaxAngle * (0.1 + (i % 3) * 0.08);
    const r = 25 + (i * 43 % 230);
    const sx = cx + Math.cos(a) * r * (w / 360);
    const sy = cy + Math.sin(a) * r * (h / 360) * 0.7;
    if (sx < 0 || sx > w || sy < 0 || sy > h) continue;
    const size = i % 15 === 0 ? 1.6 : i % 5 === 0 ? 1.0 : 0.55;
    ctx.globalAlpha = 0.25 + (i % 6) * 0.08;
    ctx.fillStyle = i % 18 === 0 ? '#aaddff' : i % 11 === 0 ? '#ffddaa' : '#ffffff';
    ctx.beginPath(); ctx.arc(sx, sy, size, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawPlanet(ctx, w, h, planetRot) {
  const cx = w / 2, cy = h / 2;
  const pr = PLANET_R;
  const glow = ctx.createRadialGradient(cx, cy, pr * 0.65, cx, cy, pr * 1.65);
  glow.addColorStop(0, 'rgba(25,70,240,0.16)'); glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, cy, pr * 1.65, 0, Math.PI * 2); ctx.fill();
  const pg = ctx.createRadialGradient(cx - pr*0.3, cy - pr*0.25, pr*0.04, cx, cy, pr);
  pg.addColorStop(0, '#2870e5'); pg.addColorStop(0.4, '#1640b5'); pg.addColorStop(0.8, '#0c2570'); pg.addColorStop(1, '#060e3a');
  ctx.beginPath(); ctx.arc(cx, cy, pr, 0, Math.PI * 2); ctx.fillStyle = pg; ctx.fill();
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, pr, 0, Math.PI * 2); ctx.clip();
  ctx.translate(cx, cy); ctx.rotate(planetRot);
  ctx.fillStyle = 'rgba(34,197,94,0.22)';
  [[-0.18,-0.20,0.26,0.16,0.4],[0.22,0.12,0.20,0.13,-0.3],[-0.25,0.26,0.16,0.10,0.7],[0.13,0.31,0.13,0.08,1.0]].forEach(([ox,oy,rx,ry,rot]) => {
    ctx.beginPath(); ctx.ellipse(ox*pr, oy*pr, rx*pr, ry*pr, rot, 0, Math.PI*2); ctx.fill();
  });
  ctx.fillStyle = 'rgba(200,240,255,0.18)';
  ctx.beginPath(); ctx.arc(0, -pr*0.82, pr*0.20, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(255,240,100,0.17)';
  CITY_LIGHTS.forEach(cl => {
    ctx.beginPath(); ctx.arc(Math.cos(cl.a)*cl.r*pr, Math.sin(cl.a)*cl.r*pr, 1.2, 0, Math.PI*2); ctx.fill();
  });
  ctx.restore();
  const atm = ctx.createRadialGradient(cx, cy, pr*0.88, cx, cy, pr*1.08);
  atm.addColorStop(0, 'rgba(50,130,255,0)'); atm.addColorStop(0.5, 'rgba(45,115,255,0.22)'); atm.addColorStop(1, 'rgba(25,75,200,0)');
  ctx.beginPath(); ctx.arc(cx, cy, pr*1.08, 0, Math.PI*2); ctx.fillStyle = atm; ctx.fill();
  const spec = ctx.createRadialGradient(cx-pr*0.28, cy-pr*0.28, 0, cx-pr*0.1, cy-pr*0.1, pr*0.68);
  spec.addColorStop(0, 'rgba(255,255,255,0.11)'); spec.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.beginPath(); ctx.arc(cx, cy, pr, 0, Math.PI*2); ctx.fillStyle = spec; ctx.fill();
}

function drawOrbitRing(ctx, w, h, alpha) {
  ctx.save(); ctx.translate(w/2, h/2);
  ctx.strokeStyle = `rgba(0,140,255,${alpha * 0.22})`;
  ctx.lineWidth = 1; ctx.setLineDash([5, 9]);
  ctx.beginPath(); ctx.arc(0, 0, ORBIT_R, 0, Math.PI*2); ctx.stroke();
  ctx.setLineDash([]); ctx.restore();
}

function drawShip(ctx, wx, wy, angle, shielded, thrusting, alpha, t = 0, tintColor = null) {
  const sw = PLAYER_W;
  ctx.save();
  ctx.translate(wx, wy);
  ctx.rotate(angle);
  ctx.globalAlpha = alpha;
  if (shielded) {
    const sa = 0.32 + Math.sin((t||0) * 5) * 0.1;
    ctx.strokeStyle = `rgba(0,212,255,${sa})`; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.arc(0, 0, sw*2.1, 0, Math.PI*2); ctx.stroke();
    ctx.fillStyle = `rgba(0,212,255,${sa*0.1})`;
    ctx.beginPath(); ctx.arc(0, 0, sw*2.1, 0, Math.PI*2); ctx.fill();
  }
  if (thrusting) {
    const flicker = 0.65 + Math.sin(t * 40) * 0.35;
    ctx.fillStyle = `rgba(255,140,20,${0.65 * flicker})`;
    ctx.beginPath();
    ctx.moveTo(-sw*0.45, sw*0.7);
    ctx.lineTo(0, sw*1.55 * flicker);
    ctx.lineTo(sw*0.45, sw*0.7);
    ctx.fill();
    ctx.fillStyle = `rgba(255,220,80,${0.4 * flicker})`;
    ctx.beginPath();
    ctx.moveTo(-sw*0.22, sw*0.7);
    ctx.lineTo(0, sw*1.1 * flicker);
    ctx.lineTo(sw*0.22, sw*0.7);
    ctx.fill();
  }
  const sg = ctx.createLinearGradient(0, -sw, 0, sw);
  if (tintColor) {
    sg.addColorStop(0, '#ffffff'); sg.addColorStop(1, tintColor);
  } else {
    sg.addColorStop(0, '#b0d8ff'); sg.addColorStop(1, '#1a55c0');
  }
  ctx.fillStyle = sg; ctx.strokeStyle = tintColor || '#55aaff'; ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(0, -sw);
  ctx.lineTo(sw*0.62, sw*0.68);
  ctx.lineTo(0, sw*0.32);
  ctx.lineTo(-sw*0.62, sw*0.68);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(140,225,255,0.55)';
  ctx.beginPath(); ctx.arc(0, -sw*0.22, sw*0.28, 0, Math.PI*2); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}

// ── Touch overlay — visual joystick hint ───────────────────────────────────────
function drawTouchOverlay(ctx, w, h, joy) {
  const isMobile = w < 768;
  if (!isMobile) return;

  // Left arrow zone
  const arrowY = h / 2;
  const leftActive  = joy.left;
  const rightActive = joy.right;

  ctx.save();
  ctx.globalAlpha = leftActive ? 0.55 : 0.14;
  ctx.fillStyle = leftActive ? '#00d4ff' : '#ffffff';
  ctx.font = 'bold 38px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('◄', 44, arrowY);

  ctx.globalAlpha = rightActive ? 0.55 : 0.14;
  ctx.fillStyle = rightActive ? '#00d4ff' : '#ffffff';
  ctx.fillText('►', w - 44, arrowY);

  ctx.restore();
}

function drawHUD(ctx, w, h, st, t) {
  const scoreSz = Math.max(20, Math.floor(w * 0.030));
  ctx.font = `bold ${scoreSz}px sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(Math.floor(st.score).toLocaleString(), w / 2, 14);

  ctx.fillStyle = 'rgba(0,140,255,0.18)'; ctx.strokeStyle = 'rgba(0,170,255,0.5)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(14, 12, 80, 24, 8); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#00ccff'; ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(`Welle ${st.wave}`, 22, 24);

  // Lives
  for (let i = 0; i < 3; i++) {
    ctx.globalAlpha = i < st.lives ? 1 : 0.2;
    // Flicker when invincible
    if (i === st.lives - 1 && st.invincibleTimer > 0) {
      ctx.globalAlpha = 0.4 + Math.sin(t * 18) * 0.4;
    }
    ctx.fillStyle = i < st.lives ? '#ef4444' : '#444';
    ctx.font = '17px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('♥', w - 16 - i * 24, 24);
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = '#00ffcc'; ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  ctx.fillText(`💎 ${st.crystals}`, w - 12, 46);

  // Score multiplier indicator
  if (st.scoreMult > 1) {
    const ms = 1 + Math.sin(t * 8) * 0.06;
    ctx.save(); ctx.translate(w - 60, 65); ctx.scale(ms, ms);
    ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f43f5e'; ctx.fillText(`×${st.scoreMult} PUNKTE`, 0, 0);
    ctx.restore();
  }

  if (st.combo >= 2) {
    const cc = st.combo >= 10 ? '#f43f5e' : st.combo >= 5 ? '#f97316' : '#facc15';
    const cs = 1 + Math.sin(t * 10) * 0.05;
    ctx.save(); ctx.translate(w/2, 48); ctx.scale(cs, cs);
    ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = cc; ctx.fillText(`🔥 ${st.combo}× COMBO`, 0, 0);
    ctx.restore();
  }

  // Formation upgrade indicator (top-right area)
  if (st.upgFormation >= 1) {
    const fLabel = st.upgFormation >= 2 ? '⬡ TRIPLE' : '⬡ DUAL';
    const fCol   = st.upgFormation >= 2 ? '#fbbf24' : '#00ffcc';
    ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'top';
    ctx.fillStyle = fCol; ctx.fillText(fLabel, w - 12, 58);
  }

  // Powerup bars
  const isMobile = w < 768;
  const barY = h - (isMobile ? 62 : 42);
  let barX = w / 2 - 160;
  const drawBar = (col, frac, icon, label) => {
    const bw = 96, bh = 15;
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.strokeStyle = col + '50'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(barX, barY, bw, bh, 5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = col + '80';
    ctx.beginPath(); ctx.roundRect(barX, barY, bw * Math.max(0, frac), bh, 5); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(`${icon} ${label || 'aktiv'}`, barX + 4, barY + bh/2);
    barX += bw + 5;
  };
  if (st.shieldTimer  > 0) drawBar('#00d4ff', st.shieldTimer / 8, '🛡');
  if (st.rapidTimer   > 0) drawBar('#f97316', st.rapidTimer  / 7, '⚡');
  if (st.wingmanTimer > 0) drawBar('#22c55e', st.wingmanTimer / 14, '🛸', `×${st.wingmanCount}`);
  if (st.turrets.length > 0) drawBar('#fbbf24', st.turretTimer / 20, '🔫', `×${st.turrets.length}`);
  if (st.bombCount > 0) {
    const bw = 96, bh = 15;
    ctx.fillStyle = 'rgba(168,85,247,0.18)'; ctx.strokeStyle = 'rgba(168,85,247,0.5)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(barX, barY, bw, bh, 5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#c084fc'; ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(`💣 ×${st.bombCount}  [B]`, barX + 4, barY + bh/2);
  }

  // Control hint
  ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.font = '9px sans-serif'; ctx.textBaseline = 'bottom';
  ctx.fillText(
    isMobile ? 'Wischen ◄ ► zum Steuern' : '← → Bewegen  ·  Automatisch schießen  ·  B Bombe',
    w / 2, h - 2
  );
}