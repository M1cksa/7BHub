import React, { useEffect, useRef } from 'react';

export default function AuroraNorthBG() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let w, h;

    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    resize();

    const bands = Array.from({ length: 6 }, (_, i) => ({
      phase: (i / 6) * Math.PI * 2,
      speed: 0.004 + i * 0.001,
      hue: 140 + i * 30,
      amplitude: 60 + i * 20,
      y: h * (0.1 + i * 0.08),
      width: 80 + i * 30,
    }));

    let frame = 0;
    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, w, h);

      bands.forEach(b => {
        const points = [];
        for (let x = -20; x <= w + 20; x += 8) {
          const y = b.y + Math.sin(x * 0.007 + frame * b.speed + b.phase) * b.amplitude
                       + Math.sin(x * 0.015 - frame * b.speed * 0.7) * b.amplitude * 0.4;
          points.push({ x, y });
        }

        const grad = ctx.createLinearGradient(0, b.y - b.width, 0, b.y + b.width);
        const alpha = 0.08 + Math.sin(frame * 0.02 + b.phase) * 0.04;
        grad.addColorStop(0, `hsla(${b.hue},90%,60%,0)`);
        grad.addColorStop(0.5, `hsla(${b.hue},90%,60%,${alpha})`);
        grad.addColorStop(1, `hsla(${b.hue},90%,60%,0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y - b.width);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        for (let i = points.length - 1; i >= 0; i--) ctx.lineTo(points[i].x, points[i].y + b.width);
        ctx.closePath();
        ctx.fill();
      });

      // Stars
      ctx.fillStyle = 'rgba(200,230,255,0.6)';
      for (let i = 0; i < 3; i++) {
        const sx = (frame * 0.7 + i * 337) % w;
        const sy = (i * 177 + Math.sin(frame * 0.008 + i) * 20) % (h * 0.5);
        ctx.beginPath();
        ctx.arc(sx, sy, 1, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, #020c1a 0%, #041a2e 100%)' }} />
      <canvas ref={canvasRef} className="absolute inset-0" style={{ opacity: 1 }} />
    </div>
  );
}