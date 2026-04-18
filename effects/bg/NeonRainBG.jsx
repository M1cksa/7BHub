import React, { useEffect, useRef } from 'react';

export default function NeonRainBG() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let w, h;

    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    resize();

    const COLS = Math.floor(w / 20) || 30;
    const drops = Array.from({ length: COLS }, () => Math.floor(Math.random() * -100));
    const chars = '01アイウエオカキクケコ∇∆◇◈⬡⬢'.split('');
    const COLORS = ['#06b6d4', '#a855f7', '#ec4899', '#22c55e'];

    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0, 0, w, h);

      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const color = COLORS[i % COLORS.length];
        ctx.fillStyle = color;
        ctx.font = '14px monospace';
        ctx.globalAlpha = 0.7;
        ctx.fillText(char, i * 20, y * 20);
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = color;
        ctx.fillText(char, i * 20, y * 20 - 20);
        ctx.globalAlpha = 1;

        if (y * 20 > h && Math.random() > 0.975) drops[i] = 0;
        else drops[i]++;
      });

      animId = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <canvas ref={canvasRef} className="absolute inset-0" style={{ opacity: 0.55 }} />
    </div>
  );
}