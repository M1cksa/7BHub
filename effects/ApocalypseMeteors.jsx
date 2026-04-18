import React, { useEffect, useRef } from 'react';

export default function ApocalypseMeteors() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let animId;
    let w, h;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();

    // Meteors
    const COUNT = 15;
    const meteors = Array.from({ length: COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h - h,
      vx: 2 + Math.random() * 3,
      vy: 4 + Math.random() * 6,
      r: Math.random() * 3 + 2,
      trail: []
    }));

    // Floating embers
    const EMBERS_COUNT = 40;
    const embers = Array.from({ length: EMBERS_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 1,
      vy: Math.random() * -2 - 0.5,
      r: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.8 + 0.2
    }));

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Draw embers
      embers.forEach(e => {
        e.x += e.vx;
        e.y += e.vy;
        if (e.y < -10) {
          e.y = h + 10;
          e.x = Math.random() * w;
        }
        ctx.fillStyle = `rgba(249, 115, 22, ${e.opacity})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw meteors
      meteors.forEach(m => {
        m.trail.push({ x: m.x, y: m.y });
        if (m.trail.length > 20) m.trail.shift();

        m.x += m.vx;
        m.y += m.vy;

        if (m.y > h + 50 || m.x > w + 50) {
          m.x = Math.random() * w - w / 2;
          m.y = -50;
          m.trail = [];
          m.vx = 2 + Math.random() * 3;
          m.vy = 4 + Math.random() * 6;
        }

        // Draw trail
        if (m.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(m.trail[0].x, m.trail[0].y);
          for (let i = 1; i < m.trail.length; i++) {
            ctx.lineTo(m.trail[i].x, m.trail[i].y);
          }
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
          ctx.lineWidth = m.r * 1.5;
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        // Draw meteor head
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(m.x - m.vx * 0.5, m.y - m.vy * 0.5, m.r * 1.2, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div className="absolute inset-0 bg-red-950/20 mix-blend-overlay"></div>
      <canvas ref={canvasRef} className="absolute inset-0" style={{ opacity: 0.8 }} />
    </div>
  );
}