import React, { useEffect, useRef } from 'react';

export default function VoidPulseBG() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let w, h;

    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    resize();

    const orbs = Array.from({ length: 8 }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 60 + Math.random() * 120,
      speed: 0.003 + Math.random() * 0.005,
      phase: Math.random() * Math.PI * 2,
      hue: 270 + Math.random() * 60,
    }));

    const rings = Array.from({ length: 4 }, (_, i) => ({
      r: 0,
      maxR: 300 + i * 120,
      speed: 0.8 + i * 0.3,
      alpha: 0,
      born: i * 80,
    }));

    let frame = 0;
    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, w, h);

      // Drifting void orbs
      orbs.forEach(o => {
        o.x += Math.sin(frame * o.speed + o.phase) * 0.4;
        o.y += Math.cos(frame * o.speed + o.phase * 1.3) * 0.3;
        const grd = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        grd.addColorStop(0, `hsla(${o.hue},80%,50%,0.12)`);
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Expanding void rings from center
      rings.forEach(ring => {
        if (frame < ring.born) return;
        ring.r += ring.speed;
        ring.alpha = 0.4 * (1 - ring.r / ring.maxR);
        if (ring.r >= ring.maxR) { ring.r = 0; ring.alpha = 0; }
        if (ring.alpha <= 0) return;
        ctx.strokeStyle = `rgba(168,85,247,${ring.alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, ring.r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Dark tendrils
      ctx.strokeStyle = 'rgba(88,28,235,0.06)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + frame * 0.002;
        const r = 100 + Math.sin(frame * 0.01 + i) * 40;
        ctx.beginPath();
        ctx.moveTo(w / 2, h / 2);
        ctx.lineTo(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r);
        ctx.stroke();
      }

      animId = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <canvas ref={canvasRef} className="absolute inset-0" style={{ opacity: 0.9 }} />
    </div>
  );
}