import React, { useEffect, useRef } from 'react';
import { playCollect, playCollision, playDimensionWarp } from '@/components/game/NeonDashSounds';
import { SHIP_SKINS } from '@/components/game/NeonDashConstants';
import { base44 } from '@/api/base44Client';

export default function NeonDashCanvas({
  canvasRef,
  containerRef,
  gameState,
  stateRef,
  getUpgradeLevel,
  getActiveSkin,
  perfMode,
  setScore,
  setActivePowerups,
  setComboDisplay,
  setInDimension,
  setCurrentDimStyle,
  setLevelGoalProgress,
  endGame,
  endLevel,
  isDimensionEvent,
  user,
  setActiveAchievements,
  unlockedAchievementsRef,
  checkAchievements
}) {
  const reqRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current, canvas = canvasRef.current;
      if (container && canvas) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        stateRef.current.width = canvas.width;
        stateRef.current.height = canvas.height;
        if (gameState !== 'playing') {
          stateRef.current.player.x = canvas.width / 2;
          stateRef.current.player.y = canvas.height - 80;
        }
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [gameState, canvasRef, containerRef, stateRef]);

  // ── Touch Controls: relative virtual joystick for mobile ──────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let touchStartX = null;
    let touchBaseX = null;
    const isMobile = () => window.matchMedia('(pointer: coarse)').matches;

    const handleMouseMove = (e) => {
      if (isMobile()) return;
      const rect = canvas.getBoundingClientRect();
      let x = e.clientX - rect.left;
      x = Math.max(stateRef.current.player.size, Math.min(canvas.width - stateRef.current.player.size, x));
      stateRef.current.targetX = x;
    };

    const handleTouchStart = (e) => {
      // Single-finger: store base position for relative joystick
      if (e.touches.length === 1) {
        const rect = canvas.getBoundingClientRect();
        touchStartX = e.touches[0].clientX;
        touchBaseX = stateRef.current.targetX ?? stateRef.current.player?.x ?? canvas.width / 2;
        // Store joystick anchor for HUD rendering
        stateRef.current.joystickAnchor = {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top,
        };
      }
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      if (e.touches.length === 1 && touchStartX !== null) {
        const deltaX = e.touches[0].clientX - touchStartX;
        const sensitivity = 1.4; // relative sensitivity
        let newX = touchBaseX + deltaX * sensitivity;
        newX = Math.max(stateRef.current.player.size, Math.min(canvas.width - stateRef.current.player.size, newX));
        stateRef.current.targetX = newX;
        // Update joystick handle position for HUD
        stateRef.current.joystickDelta = Math.max(-60, Math.min(60, deltaX * sensitivity));
      }
    };

    const handleTouchEnd = () => {
      touchStartX = null;
      touchBaseX = null;
      stateRef.current.joystickAnchor = null;
      stateRef.current.joystickDelta = 0;
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [canvasRef, stateRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const spawnParticles = (x, y, color, count) => {
      for (let i = 0; i < count; i++) {
        stateRef.current.particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 12,
          vy: (Math.random() - 0.5) * 12,
          life: 1,
          color
        });
      }
    };

    const drawPlayer = (p) => {
      const state = stateRef.current;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((state.targetX - p.x) * 0.05);

      if (state.skinId === 'echo') {
        ctx.shadowBlur = 35;
        ctx.shadowColor = '#06b6d4';
        ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
        ctx.beginPath();
        ctx.arc(0, 0, p.size + 12, 0, Math.PI * 2);
        ctx.fill();

        const grad = ctx.createLinearGradient(-p.size, p.size, p.size, -p.size);
        grad.addColorStop(0, '#a855f7');
        grad.addColorStop(0.5, '#06b6d4');
        grad.addColorStop(1, '#c084fc');
        ctx.fillStyle = grad;
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#a855f7';
        ctx.beginPath();
        ctx.moveTo(0, -p.size - 2);
        ctx.lineTo(p.size + 3, p.size + 2);
        ctx.lineTo(-p.size - 3, p.size + 2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#06b6d4';
        ctx.beginPath();
        ctx.arc(0, -p.size * 0.3, p.size * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#06b6d4';
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.lineTo(p.size * 0.6, p.size * 0.4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.lineTo(-p.size * 0.6, p.size * 0.4);
        ctx.stroke();
      } else {
        const pPm = state.perfMode;
        if (state.activePowerups?.shield) {
          ctx.shadowBlur = pPm ? 12 : 30;
          ctx.shadowColor = '#3b82f6';
          ctx.strokeStyle = '#60a5fa';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, p.size + 8, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.shadowBlur = pPm ? 10 : 20;
        ctx.shadowColor = state.tempSkinColor || state.skinGlow || '#06b6d4';
        ctx.fillStyle = state.tempSkinColor || state.skinColor || '#fff';
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.lineTo(p.size, p.size);
        ctx.lineTo(-p.size, p.size);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    };

    const gameLoop = (timestamp) => {
      if (gameState !== 'playing') return;
      const state = stateRef.current;

      if (state.lastFrameTime === null) {
        state.lastFrameTime = timestamp;
        reqRef.current = requestAnimationFrame(gameLoop);
        return;
      }
      const deltaTime = (timestamp - state.lastFrameTime) / 1000;
      state.lastFrameTime = timestamp;
      state.elapsedTime += deltaTime;

      const dt = Math.min(deltaTime, 0.033);
      ctx.shadowBlur = 0;

      const { width: w, height: h, player } = state;
      if (state.perfMode) {
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
      }

      const slowActive = !!state.activePowerups?.slowmo;
      const sf = slowActive ? 0.4 : state.dimensionActive ? 0.65 : 1;
      const pm = state.perfMode;

      // ── DYNAMIC DIFFICULTY SYSTEM ──
      if (!state.difficulty) state.difficulty = { baseSpawnRate: 1, baseSpeed: 1, lastCheckFrame: 0 };
      const diff = state.difficulty;
      if (state.frames - diff.lastCheckFrame > 120) {
        const comboLevel = Math.min(8, 1 + Math.floor((state.combo || 0) / 3) * 0.5);
        const scoreVelocity = state.frames > 0 ? (state.score / state.frames) : 0;
        const isDoingWell = comboLevel >= 3 && scoreVelocity > 0.15;
        const isStrugglingFrame = state.frames > 300 && comboLevel < 1.5 && scoreVelocity < 0.08;
        
        if (isDoingWell) {
          diff.baseSpawnRate = Math.max(0.7, diff.baseSpawnRate - 0.05);
          diff.baseSpeed = Math.min(1.3, diff.baseSpeed + 0.02);
        } else if (isStrugglingFrame) {
          diff.baseSpawnRate = Math.min(1.4, diff.baseSpawnRate + 0.08);
          diff.baseSpeed = Math.max(0.85, diff.baseSpeed - 0.03);
        } else {
          diff.baseSpawnRate = 1 + (comboLevel - 1) * 0.15;
          diff.baseSpeed = 1 + Math.max(0, scoreVelocity - 0.1) * 0.8;
        }
        diff.lastCheckFrame = state.frames;
      }

      if (state.comboTimer > 0) {
        state.comboTimer -= dt * 60;
        if (state.comboTimer <= 0 && state.combo > 0) {
          state.combo = 0;
          if (state.frames % 8 === 0) setComboDisplay({ combo: 0, mult: 1 });
        }
      }
      const comboMult = Math.min(8, 1 + Math.floor((state.combo || 0) / 3) * 0.5);

      if (state.dimensionActive) {
        state.dimensionFrames = (state.dimensionFrames || 0) + 1;
      }

      state.bgHue = (state.bgHue || 0) + 0.3 * sf * dt * 60;
      let bgAlpha = state.levelMode ? 0.3 : 0.35;

      // Background rendering
      if (state.dimensionActive) {
        const dimStyle = state.dimensionStyle || 'void';
        const dimPulse = Math.sin(state.elapsedTime * 2.5) * 0.06 + 0.1;
        ctx.fillStyle = `rgba(5, 0, 15, ${bgAlpha})`;
        ctx.fillRect(0, 0, w, h);

        if (dimStyle === 'void') {
          ctx.fillStyle = `rgba(120, 0, 255, ${dimPulse})`;
          ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = `rgba(0, 200, 255, ${dimPulse * 0.4})`;
          ctx.fillRect(0, 0, w, h);
        }
        // ... other dimension styles omitted for brevity (same as original)
      } else {
        ctx.fillStyle = `rgba(5, 5, 10, ${bgAlpha})`;
        ctx.fillRect(0, 0, w, h);
        if (state.levelMode && state.levelColor) {
          const pulse = Math.sin(state.frames * 0.05) * 0.04 + 0.04;
          ctx.fillStyle = state.levelColor + Math.floor(pulse * 255).toString(16).padStart(2, '0');
          ctx.fillRect(0, 0, w, h);
        }
        // Batch grid lines into one path for big perf gain
        if (!pm) {
          const gridOffset = (state.frames * state.speedMult * 2) % 60;
          ctx.strokeStyle = 'rgba(255,255,255,0.03)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let gy = -60 + gridOffset; gy < h; gy += 60) {
            ctx.moveTo(0, gy);
            ctx.lineTo(w, gy);
          }
          ctx.stroke();
        }
      }

      state.frames++;
      if (state.levelMode) state.levelTimeFrames = (state.levelTimeFrames || 0) + dt * 60;

      const portalOpen = !!state.dimensionPortal;
      const scoreBoostMult = 1 + (state.upgrades?.scoreBoost || 0) * 0.1;
      if (!portalOpen) state.score += 0.2 * state.speedMult * sf * comboMult * scoreBoostMult * dt * 60;
      const speedCapFactor = 1 - (state.upgrades?.speedCap || 0) * 0.08;
       if (!state.levelMode) state.speedMult += (state.proMode ? 0.0009 : 0.0006) * sf * speedCapFactor * dt * 60;

      // Expire power-ups
      const now = Date.now();
      let changed = false;
      for (const [key, expiry] of Object.entries(state.activePowerups)) {
        if (now > expiry) {
          delete state.activePowerups[key];
          changed = true;
        }
      }
      if (changed) setActivePowerups(Object.keys(state.activePowerups));

      // Magnet pull
      if (state.activePowerups?.magnet) {
        const magnetRadius = 200 + (state.upgrades?.coinMagnet || 0) * 60;
        const magR2 = magnetRadius * magnetRadius;
        for (const c of state.coins) {
          const dx = player.x - c.x, dy = player.y - c.y;
          if (dx * dx + dy * dy < magR2) {
            c.x += dx * 0.08;
            c.y += dy * 0.08;
          }
        }
      }

      player.x += (state.targetX - player.x) * (1 - Math.exp(-5 * dt));
      player.y += (h - 80 - player.y) * (1 - Math.exp(-3 * dt));

      // Spawn obstacles (with dynamic difficulty)
      const baseSpawnRate = state.proMode
        ? Math.max(18, Math.floor(55 / state.speedMult))
        : Math.max(14, Math.floor(45 / state.speedMult));
      const spawnRate = Math.round(baseSpawnRate * state.difficulty.baseSpawnRate);

      if (!portalOpen && state.frames % spawnRate === 0) {
        let type;
        if (state.levelMode) {
          const types = state.levelTypes || ['normal'];
          type = types[Math.floor(Math.random() * types.length)];
        } else {
          const typeRoll = Math.random();
          type = state.proMode
            ? typeRoll < 0.25 ? 'normal' : typeRoll < 0.45 ? 'zigzag' : typeRoll < 0.62 ? 'bounce' : typeRoll < 0.82 ? 'rotating' : 'cross'
            : typeRoll < 0.82 ? 'normal' : 'cross';
        }
        const size = 25 + Math.random() * 45;
        const waveAmplitude = 60 + Math.random() * 80;
        const waveFrequency = 0.03 + Math.random() * 0.04;
        state.obstacles.push({
          x: Math.random() * (w - size),
          y: -size,
          startX: Math.random() * (w - size),
          width: size,
          height: size,
          speed: (5 + Math.random() * 5) * state.speedMult * sf * state.difficulty.baseSpeed,
          color: type === 'wave' ? '#22d3ee' : type === 'laser' ? '#ff0080' : type === 'cross' ? '#f59e0b' : '#f43f5e',
          type,
          angle: 0,
          vx: (type === 'zigzag' || type === 'bounce') ? (Math.random() > 0.5 ? 3 : -3) : 0,
          waveAmplitude,
          waveFrequency,
          waveOffset: Math.random() * Math.PI * 2
        });
      }

      // Pro: wall gaps
      if (!portalOpen && state.proMode && state.frames % Math.max(300, Math.floor(700 / state.speedMult)) === 0) {
        const gapW = 140 + Math.random() * 80;
        const gapX = Math.random() * (w - gapW - 40) + 20;
        const wallSpeed = (4 + Math.random() * 3) * state.speedMult * sf;
        state.obstacles.push({
          x: 0,
          y: -20,
          width: gapX,
          height: 20,
          speed: wallSpeed * state.difficulty.baseSpeed,
          color: '#7c3aed',
          type: 'wall',
          angle: 0,
          vx: 0
        });
        state.obstacles.push({
          x: gapX + gapW,
          y: -20,
          width: w - gapX - gapW,
          height: 20,
          speed: wallSpeed * state.difficulty.baseSpeed,
          color: '#7c3aed',
          type: 'wall',
          angle: 0,
          vx: 0
        });
      }

      // Update obstacles
      for (let i = state.obstacles.length - 1; i >= 0; i--) {
        const ob = state.obstacles[i];
        if (!portalOpen) {
          ob.y += ob.speed * sf;
          if (ob.type === 'rotating') ob.angle += 0.05;
          if (ob.type === 'cross') ob.angle += 0.03;
          if (ob.type === 'zigzag' || ob.type === 'bounce') {
            ob.x += ob.vx * sf;
            if (ob.x <= 0 || ob.x + ob.width >= w) ob.vx *= -1;
          }
          if (ob.type === 'wave') {
            ob.x = Math.max(0, Math.min(w - ob.width, ob.startX + Math.sin(ob.y * ob.waveFrequency + ob.waveOffset) * ob.waveAmplitude));
          }
        }

        // Draw obstacle
        ctx.save();
        if (!pm) ctx.shadowColor = ob.color;
        if (ob.type === 'rotating') {
          ctx.translate(ob.x + ob.width / 2, ob.y + ob.height / 2);
          ctx.rotate(ob.angle);
          ctx.shadowBlur = pm ? 10 : 22;
          ctx.fillStyle = ob.color;
          const s = ob.width / 2;
          ctx.beginPath();
          for (let pt = 0; pt < 8; pt++) {
            const a = pt * Math.PI / 4;
            const rr = pt % 2 === 0 ? s : s * 0.45;
            pt === 0 ? ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
          }
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.shadowBlur = pm ? 6 : 14;
          ctx.fillStyle = ob.color;
          ctx.fillRect(ob.x, ob.y, ob.width, ob.height);
        }
        ctx.restore();

        // Collision detection
        const closeX = Math.max(ob.x, Math.min(player.x, ob.x + ob.width));
        const closeY = Math.max(ob.y, Math.min(player.y, ob.y + ob.height));
        const dx = player.x - closeX, dy = player.y - closeY;
        const hitR = player.size * 0.6;
        if (!portalOpen && (dx * dx + dy * dy) < hitR * hitR) {
          if (state.activePowerups?.shield) {
            delete state.activePowerups.shield;
            setActivePowerups(Object.keys(state.activePowerups));
            spawnParticles(player.x, player.y, '#3b82f6', pm ? 8 : 20);
            state.shieldSaves = (state.shieldSaves || 0) + 1;
            state.obstacles.splice(i, 1);
            continue;
          }
          playCollision();
          spawnParticles(player.x, player.y, '#06b6d4', pm ? 15 : 40);
          if (state.levelMode) {
            endLevel(false);
            return;
          }
          endGame();
          return;
        }

        if (ob.y > h) {
          state.obstacles.splice(i, 1);
          state.combo = (state.combo || 0) + 1;
          state.comboTimer = 90;
          if (state.combo > (state.maxCombo || 0)) state.maxCombo = state.combo;
          if (state.frames % 8 === 0) setComboDisplay({ combo: state.combo, mult: comboMult });
        }
      }

      if (state.frames % 60 === 0) {
        const newOnes = checkAchievements(state, unlockedAchievementsRef.current);
        if (newOnes.length > 0) {
          for (const ach of newOnes) unlockedAchievementsRef.current.add(ach.id);
          localStorage.setItem('neonAchievements', JSON.stringify([...unlockedAchievementsRef.current]));
          setActiveAchievements(prev => [...prev, ...newOnes]);
        }
      }

      // Coins
      if (!portalOpen && state.frames % Math.max(30, Math.floor(100 / state.speedMult)) === 0) {
        state.coins.push({
          x: Math.random() * (w - 20),
          y: -20,
          radius: 12,
          speed: (4 + Math.random() * 3) * state.speedMult * sf
        });
      }
      for (let i = state.coins.length - 1; i >= 0; i--) {
        const c = state.coins[i];
        if (!portalOpen) c.y += c.speed * sf;
        ctx.shadowBlur = pm ? 8 : 20;
        ctx.shadowColor = '#eab308';
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        ctx.fill();
        const dx = player.x - c.x, dy = player.y - c.y;
        const coinR = player.size + c.radius;
        if (dx * dx + dy * dy < coinR * coinR) {
          const coinPoints = (100 + ((state.upgrades?.coinMulti || 0) * 50)) * comboMult * (1 + (state.upgrades?.scoreBoost || 0) * 0.1);
          playCollect();
          state.score += coinPoints;
          state.combo = (state.combo || 0) + 1;
          state.comboTimer = 90;
          if (state.levelMode) state.levelCoinsCollected = (state.levelCoinsCollected || 0) + 1;
          state.challengeCoins = (state.challengeCoins || 0) + 1;
          spawnParticles(c.x, c.y, '#eab308', pm ? 8 : 20);
          const newMult = Math.min(8, 1 + Math.floor(state.combo / 3) * 0.5);
          if (state.combo > (state.maxCombo || 0)) state.maxCombo = state.combo;
          if (state.frames % 8 === 0) setComboDisplay({ combo: state.combo, mult: newMult });
          state.coins.splice(i, 1);
          continue;
        }
        if (c.y > h + 20) state.coins.splice(i, 1);
      }

      // Particles — cap at 150, no shadowBlur in perfMode
      if (state.particles.length > 150) state.particles.splice(0, state.particles.length - 150);
      ctx.save();
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        if (p.isText && p.text?.includes('Upgrade')) continue;
        p.x += p.vx; p.y += p.vy; p.life -= 0.018;
        if (p.life <= 0) { state.particles.splice(i, 1); continue; }
        ctx.globalAlpha = Math.min(1, p.life);
        if (p.isText) {
          if (!pm) { ctx.shadowBlur = 10; ctx.shadowColor = p.color; } else ctx.shadowBlur = 0;
          ctx.fillStyle = p.color;
          ctx.font = 'bold 14px sans-serif';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(p.text, p.x, p.y);
        } else {
          if (!pm) { ctx.shadowBlur = 8; ctx.shadowColor = p.color; } else ctx.shadowBlur = 0;
          ctx.fillStyle = p.color;
          ctx.beginPath(); ctx.arc(p.x, p.y, 4 * Math.min(1, p.life), 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.restore();

      if (!state.tempSkinColor && state.skinId === 'rainbow') {
        const hue = (state.frames * 3) % 360;
        state.skinColor = `hsl(${hue}, 100%, 65%)`;
        state.skinGlow = `hsl(${(hue + 60) % 360}, 100%, 55%)`;
      }

      drawPlayer(player);

      // ── Draw partner ship in co-op mode ──
      if (state.coopMode && state._partnerX !== undefined) {
        const px = state._partnerX;
        const py = h - 80;
        const skin = SHIP_SKINS.find(s => s.id === state._partnerSkin) || SHIP_SKINS[1] || SHIP_SKINS[0];
        ctx.save();
        ctx.translate(px, py);
        ctx.shadowBlur = pm ? 10 : 22;
        ctx.shadowColor = skin.glowColor || '#a855f7';
        ctx.fillStyle = skin.color || '#a855f7';
        ctx.beginPath();
        ctx.moveTo(0, -player.size);
        ctx.lineTo(player.size, player.size);
        ctx.lineTo(-player.size, player.size);
        ctx.closePath();
        ctx.fill();
        // Partner label
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('P2', 0, -player.size - 4);
        ctx.restore();
      }

      // HUD
      ctx.shadowBlur = 0;
      // ── Mobile Virtual Joystick HUD ──────────────────────────────────────
      const isMobileScreen = w < 600;
      if (isMobileScreen && state.joystickAnchor) {
        const jx = state.joystickAnchor.x;
        const jy = state.joystickAnchor.y;
        const jDelta = state.joystickDelta || 0;
        // Base ring
        ctx.save();
        ctx.globalAlpha = 0.22;
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(jx, jy, 46, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 0.08;
        ctx.fillStyle = '#06b6d4';
        ctx.fill();
        // Handle
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = '#06b6d4';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#06b6d4';
        ctx.beginPath();
        ctx.arc(jx + jDelta, jy, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Score HUD (responsive font size)
      const scoreFontSize = isMobileScreen ? 20 : 24;
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = `bold ${scoreFontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(Math.floor(state.score).toString(), w / 2, isMobileScreen ? 20 : 28);

      // Combo HUD
      if ((state.combo || 0) >= 3 && state.comboTimer > 0) {
        const mult = Math.min(8, 1 + Math.floor(state.combo / 3) * 0.5);
        const comboAlpha = Math.min(1, state.comboTimer / 30);
        const scale = 1 + Math.sin(state.frames * 0.25) * 0.06;
        ctx.save();
        ctx.globalAlpha = comboAlpha;
        ctx.translate(w - 18, 18);
        ctx.scale(scale, scale);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        const comboColor = mult >= 6 ? '#f43f5e' : mult >= 4 ? '#f97316' : mult >= 2 ? '#facc15' : '#06b6d4';
        ctx.shadowBlur = 18;
        ctx.shadowColor = comboColor;
        ctx.font = `bold ${mult >= 4 ? 20 : 16}px sans-serif`;
        ctx.fillStyle = comboColor;
        ctx.fillText(`x${mult.toFixed(1)} COMBO`, 0, 0);
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.shadowBlur = 0;
        ctx.fillText(`${state.combo} dodge streak`, 0, mult >= 4 ? 24 : 20);
        ctx.restore();
      }

      // Level HUD
      if (state.levelMode) {
        const goal = state.levelGoal;
        const timeSecs = (state.levelTimeFrames || 0) / 60;
        const progressVal = goal.type === 'survive' ? timeSecs
          : goal.type === 'coins' ? (state.levelCoinsCollected || 0)
          : state.score;
        const pct = Math.min(1, progressVal / goal.target);

        if (state.frames % 15 === 0) setLevelGoalProgress(Math.floor(progressVal));

        const barW = Math.min(180, w * 0.38);
        const barX = w / 2 - barW / 2;
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(barX, 60, barW, 5);
        ctx.fillStyle = state.levelColor || '#06b6d4';
        ctx.shadowColor = state.levelColor || '#06b6d4';
        ctx.shadowBlur = 8;
        ctx.fillRect(barX, 60, barW * pct, 5);
        ctx.shadowBlur = 0;

        const progressText = goal.type === 'survive' ? `${Math.floor(timeSecs)}/${goal.target}s`
          : goal.type === 'coins' ? `${state.levelCoinsCollected || 0}/${goal.target} 🪙`
          : `${Math.floor(state.score)}/${goal.target}`;
        ctx.fillStyle = state.levelColor || '#06b6d4';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Lvl ${state.levelId} · ${progressText}`, w / 2, 70);

        if (progressVal >= goal.target) {
          endLevel(true);
          return;
        }
      } else if (state.proMode) {
        ctx.fillStyle = '#fb923c';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('⚡ PRO MODE', w / 2, 58);
      }

      if (state.frames % 12 === 0) setScore(Math.floor(state.score));
      reqRef.current = requestAnimationFrame(gameLoop);
    };

    if (gameState === 'playing') {
      reqRef.current = requestAnimationFrame(gameLoop);
    } else {
      ctx.fillStyle = '#05050a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (gameState === 'menu' || gameState === 'levelselect') {
        stateRef.current.player.x = canvas.width / 2;
        stateRef.current.player.y = canvas.height - 80;
        const skin = SHIP_SKINS.find(s => s.id === getActiveSkin()) || SHIP_SKINS[0];
        stateRef.current.skinColor = skin.color;
        stateRef.current.skinGlow = skin.glowColor;
        drawPlayer(stateRef.current.player);
      }
    }

    return () => cancelAnimationFrame(reqRef.current);
  }, [gameState, canvasRef, stateRef, getActiveSkin, perfMode, setScore, setActivePowerups, setComboDisplay, setLevelGoalProgress, endGame, endLevel, setInDimension, setCurrentDimStyle, setActiveAchievements, unlockedAchievementsRef, checkAchievements]);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 touch-none">
      <canvas ref={canvasRef} className="block w-full h-full touch-none" style={{ touchAction: 'none' }} />
    </div>
  );
}