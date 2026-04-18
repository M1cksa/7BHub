import React, { useEffect, useRef } from 'react';

export default function GalaxySpiralBG() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let w, h;

    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    resize();

    // Spiral arms
    const STARS = 800;
    const stars = Array.from({ length: STARS }, (_, i) => {
      const arm = Math.floor(Math.random() * 3);
      const dist = Math.random() * Math.min(w, h) * 0.42;
      const baseAngle = (arm / 3) * Math.PI * 2;
      const angle = baseAngle + dist * 0.012 + (Math.random() - 0.5) * 0.8;
      return {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        r: Math.random() * 1.5 + 0.3,
        alpha: Math.random() * 0.8 + 0.2,
        hue: arm === 0 ? 200 : arm === 1 ? 270 : 180,
      };
    });

    let frame = 0;
    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2, cy = h / 2;
      const rot = frame * 0.0004;

      // Core glow
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80);
      coreGrad.addColorStop(0, 'rgba(200,180,255,0.35)');
      coreGrad.addColorStop(0.5, 'rgba(100,60,200,0.1)');
      coreGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 80, 0, Math.PI * 2);
      ctx.fill();

      // Stars
      stars.forEach(s => {
        const a = Math.atan2(s.y, s.x) + rot;
        const dist = Math.sqrt(s.x * s.x + s.y * s.y);
        const px = cx + Math.cos(a) * dist;
        const py = cy + Math.sin(a) * dist;
        ctx.globalAlpha = s.alpha * (0.6 + Math.sin(frame * 0.03 + s.x) * 0.4);
        ctx.fillStyle = `hsl(${s.hue},80%,75%)`;
        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      animId = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div className="absolute inset-0" style={{ background: '#04010f' }} />
      <canvas ref={canvasRef} className="absolute inset-0" style={{ opacity: 0.9 }} />
    </div>
  );
}