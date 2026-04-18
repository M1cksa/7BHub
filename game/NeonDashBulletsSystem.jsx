/**
 * NeonDashBulletsSystem.js
 * Handles dualCannon + bulletSize upgrade logic.
 * Call once per frame from the game loop.
 */

export const updateBullets = (ctx, state, player, sf, w, pm, comboMult, spawnParticles) => {
  const _dualLvl = state.upgrades?.dualCannon || 0;
  if (!state.bullets) state.bullets = [];
  
  // Kanone-Cooldown: 30 Sek Pause + 5 Sek aktiv
  if (!state.cannonCycleStart) state.cannonCycleStart = Date.now();
  const elapsedSinceStart = (Date.now() - state.cannonCycleStart) / 1000;
  const cyclePos = elapsedSinceStart % 35; // 30 + 5 = 35 Sek Zyklus
  const cannonActive = cyclePos < 5; // Erste 5 Sek aktiv

  // ── Spawn bullets from dualCannon upgrade ──
  // Nur während aktiv-Phase des Cooldown-Zyklus
  if (_dualLvl > 0 && !(state.dimensionPortal) && cannonActive) {
    const fireRate = Math.max(10, Math.floor(36 / state.speedMult));
    if (state.frames % fireRate === 0) {
      const bulletR = 5 + (state.upgrades?.bulletSize || 0) * 3;
      const bulletSpeed = 10 + state.speedMult * 2.5;

      // Lvl 1: twin cannons ±22°, Lvl 2: twin ±28°, Lvl 3: triple fan ±18° + ±36°
      const angles =
        _dualLvl === 1 ? [-0.38, 0, 0.38]
        : _dualLvl === 2 ? [-0.48, 0, 0.48]
        : [-0.32, -0.64, 0, 0.32, 0.64];

      for (const ang of angles) {
        state.bullets.push({
          x: player.x + Math.sin(ang) * 8,
          y: player.y - player.size,
          vx: Math.sin(ang) * bulletSpeed,
          vy: -bulletSpeed * Math.max(0.55, Math.cos(Math.abs(ang))),
          r: bulletR,
          life: 1,
        });
      }
    }
  }

  // ── Update + draw bullets ──
  for (let bi = state.bullets.length - 1; bi >= 0; bi--) {
    const bul = state.bullets[bi];
    bul.x += bul.vx * sf;
    bul.y += bul.vy * sf;
    bul.life -= 0.012;

    // Out of bounds
    if (bul.y < -40 || bul.x < -40 || bul.x > w + 40 || bul.life <= 0) {
      state.bullets.splice(bi, 1);
      continue;
    }

    // Draw bullet as glowing orb
    ctx.save();
    ctx.globalAlpha = Math.min(1, bul.life * 2.5);
    ctx.shadowBlur = pm ? 8 : 22;
    ctx.shadowColor = state.skinGlow || '#06b6d4';
    const bGrad = ctx.createRadialGradient(bul.x, bul.y, 0, bul.x, bul.y, bul.r * 1.5);
    bGrad.addColorStop(0, '#ffffff');
    bGrad.addColorStop(0.35, state.skinColor || '#a5f3fc');
    bGrad.addColorStop(1, (state.skinGlow || '#06b6d4') + '00');
    ctx.fillStyle = bGrad;
    ctx.beginPath();
    ctx.arc(bul.x, bul.y, bul.r, 0, Math.PI * 2);
    ctx.fill();

    // Trail particle (not in perf mode)
    if (!pm && state.frames % 2 === 0) {
      state.particles.push({
        x: bul.x, y: bul.y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: 1 + Math.random(),
        life: 0.3,
        color: state.skinGlow || '#06b6d4',
      });
    }
    ctx.restore();

    // ── Bullet vs obstacle collision ──
    let hit = false;
    for (let oi = state.obstacles.length - 1; oi >= 0; oi--) {
      const ob = state.obstacles[oi];
      // Walls are indestructible
      if (ob.type === 'wall' || ob.type === 'energyWall') continue;
      const ocx = ob.x + ob.width / 2;
      const ocy = ob.y + ob.height / 2;
      const effR = ob.type === 'pulsar'
        ? (ob.width / 2) * (ob._pulsarScale || 1)
        : ob.width / 2 + bul.r;

      const ddx = bul.x - ocx;
      const ddy = bul.y - ocy;
      const hit2 = ob.type === 'pulsar'
        ? Math.abs(Math.sqrt(ddx * ddx + ddy * ddy) - effR) < bul.r + 4
        : Math.abs(ddx) < ob.width / 2 + bul.r && Math.abs(ddy) < ob.height / 2 + bul.r;

      if (hit2) {
        const bonus = Math.floor(90 * comboMult);
        state.score += bonus;
        state.combo = (state.combo || 0) + 1;
        state.comboTimer = 2.2;
        if (state.combo > (state.maxCombo || 0)) state.maxCombo = state.combo;
        spawnParticles(ocx, ocy, ob.color, pm ? 5 : 12);
        state.particles.push({
          x: ocx, y: ocy - 14,
          vx: 0, vy: -1.5,
          life: 1.1,
          color: '#fde047',
          isText: true,
          text: `💥 +${bonus}`,
        });
        state.obstacles.splice(oi, 1);
        hit = true;
        break;
      }
    }
    if (hit) state.bullets.splice(bi, 1);
  }
};