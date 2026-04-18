import { useEffect, useRef } from 'react';

/**
 * Renders a rich canvas-based background animation that matches the current theme.
 * Each theme has its own visual style and color palette.
 */
export default function ThemeBackground({ theme = 'default' }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const stateRef = useRef({});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    // Theme configs
    const configs = {
      default:    { colors: ['#06b6d4','#0891b2','#14b8a6','#7c3aed'], style: 'orbs' },
      midnight:   { colors: ['#4f46e5','#6d28d9','#7c3aed','#1e1b4b'], style: 'stars' },
      neon:       { colors: ['#ec4899','#a855f7','#06b6d4','#f0abfc'], style: 'scanlines' },
      dark_neon:  { colors: ['#ff00ff','#00ffff','#ff3399','#0099ff'], style: 'scanlines' },
      ocean:      { colors: ['#0284c7','#06b6d4','#0ea5e9','#38bdf8'], style: 'waves' },
      forest:     { colors: ['#059669','#10b981','#34d399','#064e3b'], style: 'particles' },
      sunset:     { colors: ['#f97316','#ef4444','#ec4899','#fbbf24'], style: 'orbs' },
      volcanic:   { colors: ['#dc2626','#ea580c','#f97316','#7f1d1d'], style: 'embers' },
      galaxy:     { colors: ['#7c3aed','#ec4899','#4f46e5','#c026d3'], style: 'stars' },
      royal:      { colors: ['#7c3aed','#6d28d9','#4c1d95','#ddd6fe'], style: 'stars' },
      arctic:     { colors: ['#22d3ee','#7dd3fc','#bae6fd','#0369a1'], style: 'snow' },
      gold:       { colors: ['#eab308','#f59e0b','#fbbf24','#713f12'], style: 'sparkles' },
      crimson:    { colors: ['#dc2626','#b91c1c','#ef4444','#450a0a'], style: 'embers' },
      emerald:    { colors: ['#10b981','#059669','#34d399','#022c22'], style: 'particles' },
      cherry:     { colors: ['#ec4899','#f472b6','#fbcfe8','#be185d'], style: 'particles' },
      rainbow:    { colors: ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#a855f7'], style: 'rainbow' },
      obsidian:   { colors: ['#1a1a1a','#2d2d2d','#404040','#111111'], style: 'grid' },
      stealth:    { colors: ['#374151','#4b5563','#6b7280','#1f2937'], style: 'grid' },
      platinum:   { colors: ['#d1d5db','#9ca3af','#6b7280','#e5e7eb'], style: 'orbs' },
      ruby:       { colors: ['#b91c1c','#dc2626','#f87171','#450a0a'], style: 'embers' },
      sapphire:   { colors: ['#0369a1','#0284c7','#38bdf8','#0c4a6e'], style: 'waves' },
      white:      { colors: ['#3b82f6','#8b5cf6','#06b6d4','#e0e7ff'], style: 'orbs' },
    };

    const cfg = configs[theme] || configs.default;

    let particles = [];
    let animFrame = 0;

    function hexToRgb(hex) {
      const r = parseInt(hex.slice(1,3),16);
      const g = parseInt(hex.slice(3,5),16);
      const b = parseInt(hex.slice(5,7),16);
      return { r, g, b };
    }

    function init() {
      particles = [];
      animFrame = 0;
      const W = canvas.width, H = canvas.height;

      if (cfg.style === 'orbs') {
        for (let i = 0; i < 6; i++) {
          const c = hexToRgb(cfg.colors[i % cfg.colors.length]);
          particles.push({
            x: Math.random() * W, y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
            r: 200 + Math.random() * 350,
            color: c, opacity: 0.12 + Math.random() * 0.08
          });
        }
      } else if (cfg.style === 'stars') {
        for (let i = 0; i < 120; i++) {
          particles.push({
            x: Math.random() * W, y: Math.random() * H,
            r: 0.5 + Math.random() * 1.8,
            opacity: 0.3 + Math.random() * 0.7,
            twinkle: Math.random() * Math.PI * 2,
            speed: 0.01 + Math.random() * 0.03,
            color: hexToRgb(cfg.colors[Math.floor(Math.random() * cfg.colors.length)])
          });
        }
      } else if (cfg.style === 'scanlines') {
        for (let i = 0; i < 8; i++) {
          particles.push({
            y: Math.random() * H, speed: 0.3 + Math.random() * 0.8,
            width: W, height: 1 + Math.random(),
            opacity: 0.03 + Math.random() * 0.04,
            color: hexToRgb(cfg.colors[i % cfg.colors.length])
          });
        }
      } else if (cfg.style === 'waves') {
        for (let i = 0; i < 5; i++) {
          particles.push({
            phase: i * (Math.PI * 2 / 5), amplitude: 40 + i * 20,
            frequency: 0.003 + i * 0.001, speed: 0.008 + i * 0.003,
            y: H * (0.3 + i * 0.12), color: hexToRgb(cfg.colors[i % cfg.colors.length]),
            opacity: 0.06 + i * 0.015
          });
        }
      } else if (cfg.style === 'particles' || cfg.style === 'snow' || cfg.style === 'sparkles') {
        for (let i = 0; i < 80; i++) {
          particles.push({
            x: Math.random() * W, y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.5,
            vy: cfg.style === 'snow' ? 0.3 + Math.random() * 0.7 : -0.3 - Math.random() * 0.5,
            r: 1 + Math.random() * 2.5,
            opacity: 0.2 + Math.random() * 0.6,
            color: hexToRgb(cfg.colors[Math.floor(Math.random() * cfg.colors.length)]),
            flicker: Math.random() * Math.PI * 2
          });
        }
      } else if (cfg.style === 'embers') {
        for (let i = 0; i < 50; i++) {
          particles.push({
            x: Math.random() * W, y: H + Math.random() * 100,
            vx: (Math.random() - 0.5) * 1.5, vy: -(0.5 + Math.random() * 1.5),
            r: 1.5 + Math.random() * 3, life: Math.random(),
            color: hexToRgb(cfg.colors[Math.floor(Math.random() * cfg.colors.length)])
          });
        }
      } else if (cfg.style === 'grid') {
        // nothing, drawn directly
      } else if (cfg.style === 'rainbow') {
        for (let i = 0; i < 6; i++) {
          particles.push({ i, phase: i * (Math.PI / 3) });
        }
      }
    }

    function draw() {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      animFrame++;

      if (cfg.style === 'orbs') {
        particles.forEach(p => {
          p.x += p.vx; p.y += p.vy;
          if (p.x < -p.r) p.x = W + p.r;
          if (p.x > W + p.r) p.x = -p.r;
          if (p.y < -p.r) p.y = H + p.r;
          if (p.y > H + p.r) p.y = -p.r;
          const pulse = Math.sin(animFrame * 0.008 + p.x * 0.001) * 0.03;
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
          g.addColorStop(0, `rgba(${p.color.r},${p.color.g},${p.color.b},${p.opacity + pulse})`);
          g.addColorStop(1, `rgba(${p.color.r},${p.color.g},${p.color.b},0)`);
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        });
      } else if (cfg.style === 'stars') {
        particles.forEach(p => {
          p.twinkle += p.speed;
          const a = p.opacity * (0.5 + 0.5 * Math.sin(p.twinkle));
          ctx.fillStyle = `rgba(${p.color.r},${p.color.g},${p.color.b},${a})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        });
      } else if (cfg.style === 'scanlines') {
        particles.forEach(p => {
          p.y += p.speed;
          if (p.y > H) p.y = 0;
          ctx.fillStyle = `rgba(${p.color.r},${p.color.g},${p.color.b},${p.opacity})`;
          ctx.fillRect(0, p.y, p.width, p.height);
        });
        // Extra horizontal glow lines
        for (let y = 0; y < H; y += 4) {
          ctx.fillStyle = `rgba(255,255,255,0.008)`;
          ctx.fillRect(0, y, W, 1);
        }
      } else if (cfg.style === 'waves') {
        particles.forEach(p => {
          p.phase += p.speed;
          ctx.beginPath();
          ctx.moveTo(0, p.y);
          for (let x = 0; x <= W; x += 4) {
            const y = p.y + Math.sin(x * p.frequency + p.phase) * p.amplitude;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
          ctx.fillStyle = `rgba(${p.color.r},${p.color.g},${p.color.b},${p.opacity})`;
          ctx.fill();
        });
      } else if (cfg.style === 'particles' || cfg.style === 'snow' || cfg.style === 'sparkles') {
        particles.forEach(p => {
          p.x += p.vx; p.y += p.vy;
          p.flicker += 0.05;
          if (p.y < -10) p.y = H + 10;
          if (p.y > H + 10) p.y = -10;
          if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
          const a = p.opacity * (0.7 + 0.3 * Math.sin(p.flicker));
          if (cfg.style === 'sparkles') {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(animFrame * 0.02);
            ctx.fillStyle = `rgba(${p.color.r},${p.color.g},${p.color.b},${a})`;
            ctx.fillRect(-p.r / 2, -p.r * 1.5, p.r, p.r * 3);
            ctx.fillRect(-p.r * 1.5, -p.r / 2, p.r * 3, p.r);
            ctx.restore();
          } else {
            ctx.fillStyle = `rgba(${p.color.r},${p.color.g},${p.color.b},${a})`;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
          }
        });
      } else if (cfg.style === 'embers') {
        particles.forEach(p => {
          p.x += p.vx; p.y += p.vy;
          p.life -= 0.004;
          if (p.life <= 0 || p.y < -20) {
            p.x = Math.random() * W; p.y = H + 20;
            p.vx = (Math.random() - 0.5) * 1.5; p.vy = -(0.5 + Math.random() * 1.5);
            p.life = 0.8 + Math.random() * 0.2;
          }
          ctx.fillStyle = `rgba(${p.color.r},${p.color.g},${p.color.b},${p.life * 0.6})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2); ctx.fill();
        });
      } else if (cfg.style === 'grid') {
        const gridSize = 60;
        ctx.strokeStyle = `rgba(255,255,255,0.025)`;
        ctx.lineWidth = 1;
        for (let x = 0; x < W; x += gridSize) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        }
        for (let y = 0; y < H; y += gridSize) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }
        // Moving dot
        const dotX = (animFrame * 2) % W;
        const c = hexToRgb(cfg.colors[0]);
        ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},0.4)`;
        ctx.beginPath(); ctx.arc(dotX, H / 2, 3, 0, Math.PI * 2); ctx.fill();
      } else if (cfg.style === 'rainbow') {
        particles.forEach((p, i) => {
          const hue = ((i / 6) * 360 + animFrame * 0.5) % 360;
          const y = H / 2 + Math.sin(animFrame * 0.01 + p.phase) * (H * 0.3);
          const g = ctx.createRadialGradient(W / 2, y, 0, W / 2, y, W * 0.6);
          g.addColorStop(0, `hsla(${hue},80%,60%,0.05)`);
          g.addColorStop(1, `hsla(${hue},80%,60%,0)`);
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, W, H);
        });
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: -1, willChange: 'transform', transform: 'translateZ(0)' }}
    />
  );
}