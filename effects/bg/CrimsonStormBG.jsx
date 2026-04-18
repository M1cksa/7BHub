import React, { useEffect, useRef } from 'react';

export default function CrimsonStormBG() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let w, h;

    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    resize();

    // Lightning bolts
    const bolts = Array.from({ length: 6 }, (_, i) => ({
      x: (i / 6) * w + Math.random() * 100,
      life: Math.random() * 40,
      maxLife: 40 + Math.random() * 30,
      segs: [],
    }));

    const makeBolt = (b) => {
      b.x = Math.random() * w;
      b.life = 0;
      b.maxLife = 35 + Math.random() * 30;
      b.segs = [];
      let cx = b.x, cy = 0;
      while (cy < h * 0.7) {
        const nx = cx + (Math.random() - 0.5) * 80;
        const ny = cy + 20 + Math.random() * 40;
        b.segs.push({ x1: cx, y1: cy, x2: nx, y2: ny });
        cx = nx; cy = ny;
      }
    };

    bolts.forEach(makeBolt);

    // Red particles
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * (typeof w !== 'undefined' ? w : 400),
      y: Math.random() * (typeof h !== 'undefined' ? h : 700),
      vx: (Math.random() - 0.5) * 1.2,
      vy: -Math.random() * 1.5 - 0.3,
      r: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.6 + 0.2,
    }));

    let frame = 0;
    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, w, h);

      // Dark red atmosphere
      ctx.fillStyle = 'rgba(60,0,0,0.04)';
      ctx.fillRect(0, 0, w, h);

      // Particles (embers)
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        ctx.globalAlpha = p.alpha * (0.5 + Math.sin(frame * 0.05 + p.x) * 0.5);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Lightning
      bolts.forEach(b => {
        b.life++;
        if (b.life > b.maxLife) makeBolt(b);

        const alpha = Math.sin((b.life / b.maxLife) * Math.PI) * 0.85;
        if (alpha > 0 && b.segs.length) {
          ctx.strokeStyle = `rgba(239,68,68,${alpha})`;
          ctx.lineWidth = 1.5;
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#ef4444';
          ctx.beginPath();
          b.segs.forEach((s, i) => { i === 0 ? ctx.moveTo(s.x1, s.y1) : null; ctx.lineTo(s.x2, s.y2); });
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      });

      animId = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(120,0,0,0.25) 0%, transparent 70%)' }} />
      <canvas ref={canvasRef} className="absolute inset-0" style={{ opacity: 0.85 }} />
    </div>
  );
}