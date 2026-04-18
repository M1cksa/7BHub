import { useEffect, useRef } from 'react';

/**
 * Renders a detailed animated ship preview on a small canvas.
 * Each skin has its own unique shape and details.
 */
export default function ShipSkinPreview({ skinId, color, glowColor, size = 56 }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const s = size * 0.3; // ship "radius"

    const draw = () => {
      frameRef.current++;
      const f = frameRef.current;
      ctx.clearRect(0, 0, size, size);

      const pulse = Math.sin(f * 0.07) * 0.12 + 1;
      const glow = Math.sin(f * 0.09) * 4 + 10;
      const thrusterFlicker = Math.sin(f * 0.22) * 0.3 + 0.7;

      ctx.save();
      ctx.translate(cx, cy);

      // ── Per-skin drawing ──
      switch (skinId) {

        case 'default': {
          // Clean white fighter with cyan engine glow
          ctx.shadowBlur = glow; ctx.shadowColor = glowColor;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.lineTo(s * 0.65, s * 0.7);
          ctx.lineTo(0, s * 0.35);
          ctx.lineTo(-s * 0.65, s * 0.7);
          ctx.closePath(); ctx.fill();
          // cockpit
          ctx.shadowBlur = 8; ctx.shadowColor = '#06b6d4';
          ctx.fillStyle = 'rgba(6,182,212,0.9)';
          ctx.beginPath(); ctx.ellipse(0, -s * 0.2, s * 0.18, s * 0.3, 0, 0, Math.PI * 2); ctx.fill();
          // engine trail
          ctx.globalAlpha = thrusterFlicker * 0.8;
          ctx.fillStyle = glowColor;
          ctx.beginPath(); ctx.moveTo(-s * 0.2, s * 0.6); ctx.lineTo(0, s * 1.1); ctx.lineTo(s * 0.2, s * 0.6); ctx.closePath(); ctx.fill();
          ctx.globalAlpha = 1;
          break;
        }

        case 'fire': {
          // Jagged flame-red ship with fire trail
          ctx.shadowBlur = glow + 5; ctx.shadowColor = '#ef4444';
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.lineTo(s * 0.75, s * 0.5);
          ctx.lineTo(s * 0.35, s * 0.15);
          ctx.lineTo(s * 0.5, s * 0.75);
          ctx.lineTo(0, s * 0.4);
          ctx.lineTo(-s * 0.5, s * 0.75);
          ctx.lineTo(-s * 0.35, s * 0.15);
          ctx.lineTo(-s * 0.75, s * 0.5);
          ctx.closePath(); ctx.fill();
          // flame cockpit
          ctx.shadowBlur = 12; ctx.fillStyle = '#fde047';
          ctx.beginPath(); ctx.ellipse(0, -s * 0.25, s * 0.15, s * 0.22, 0, 0, Math.PI * 2); ctx.fill();
          // fire engines x2
          for (const ox of [-s * 0.28, s * 0.28]) {
            ctx.globalAlpha = thrusterFlicker;
            ctx.fillStyle = `rgba(251,191,36,0.9)`;
            ctx.beginPath(); ctx.moveTo(ox - s * 0.1, s * 0.5); ctx.lineTo(ox, s * (0.9 + Math.sin(f * 0.3) * 0.15)); ctx.lineTo(ox + s * 0.1, s * 0.5); ctx.closePath(); ctx.fill();
            ctx.globalAlpha = 1;
          }
          break;
        }

        case 'gold': {
          // Wide luxurious gold cruiser with wing details
          ctx.shadowBlur = glow; ctx.shadowColor = '#eab308';
          // wings
          ctx.fillStyle = '#ca8a04';
          ctx.beginPath(); ctx.moveTo(-s * 0.3, -s * 0.1); ctx.lineTo(-s * 1.0, s * 0.6); ctx.lineTo(-s * 0.6, s * 0.4); ctx.lineTo(-s * 0.3, s * 0.3); ctx.closePath(); ctx.fill();
          ctx.beginPath(); ctx.moveTo(s * 0.3, -s * 0.1); ctx.lineTo(s * 1.0, s * 0.6); ctx.lineTo(s * 0.6, s * 0.4); ctx.lineTo(s * 0.3, s * 0.3); ctx.closePath(); ctx.fill();
          // body
          ctx.fillStyle = color;
          ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s * 0.4, s * 0.55); ctx.lineTo(0, s * 0.3); ctx.lineTo(-s * 0.4, s * 0.55); ctx.closePath(); ctx.fill();
          // gem cockpit
          ctx.fillStyle = '#fef9c3'; ctx.shadowBlur = 14; ctx.shadowColor = '#fbbf24';
          ctx.beginPath(); ctx.moveTo(0, -s * 0.45); ctx.lineTo(s * 0.12, -s * 0.1); ctx.lineTo(0, s * 0.05); ctx.lineTo(-s * 0.12, -s * 0.1); ctx.closePath(); ctx.fill();
          // engine
          ctx.globalAlpha = thrusterFlicker;
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath(); ctx.moveTo(-s * 0.15, s * 0.5); ctx.lineTo(0, s * (0.85 + Math.sin(f * 0.25) * 0.1)); ctx.lineTo(s * 0.15, s * 0.5); ctx.closePath(); ctx.fill();
          ctx.globalAlpha = 1;
          break;
        }

        case 'neon': {
          // Sleek neon pink racer — thin and fast-looking
          ctx.shadowBlur = glow + 8; ctx.shadowColor = '#a855f7';
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.moveTo(0, -s * 1.1);
          ctx.lineTo(s * 0.5, s * 0.3);
          ctx.lineTo(s * 0.25, s * 0.15);
          ctx.lineTo(s * 0.2, s * 0.75);
          ctx.lineTo(0, s * 0.5);
          ctx.lineTo(-s * 0.2, s * 0.75);
          ctx.lineTo(-s * 0.25, s * 0.15);
          ctx.lineTo(-s * 0.5, s * 0.3);
          ctx.closePath(); ctx.fill();
          // neon stripe
          ctx.strokeStyle = '#f0abfc'; ctx.lineWidth = 2; ctx.shadowBlur = 12; ctx.shadowColor = '#f0abfc';
          ctx.beginPath(); ctx.moveTo(0, -s * 0.9); ctx.lineTo(0, s * 0.4); ctx.stroke();
          // cockpit
          ctx.fillStyle = 'rgba(240,171,252,0.9)';
          ctx.beginPath(); ctx.ellipse(0, -s * 0.3, s * 0.1, s * 0.22, 0, 0, Math.PI * 2); ctx.fill();
          // glow engine
          ctx.globalAlpha = thrusterFlicker * 0.9;
          ctx.fillStyle = '#a855f7';
          ctx.beginPath(); ctx.moveTo(-s * 0.12, s * 0.65); ctx.lineTo(0, s * (1.05 + Math.sin(f * 0.35) * 0.12)); ctx.lineTo(s * 0.12, s * 0.65); ctx.closePath(); ctx.fill();
          ctx.globalAlpha = 1;
          break;
        }

        case 'cyber': {
          // Angular matrix-green ship with circuit lines
          ctx.shadowBlur = glow; ctx.shadowColor = '#06b6d4';
          ctx.fillStyle = color;
          // main body — hexagonal-ish
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.lineTo(s * 0.5, -s * 0.2);
          ctx.lineTo(s * 0.7, s * 0.5);
          ctx.lineTo(s * 0.3, s * 0.7);
          ctx.lineTo(-s * 0.3, s * 0.7);
          ctx.lineTo(-s * 0.7, s * 0.5);
          ctx.lineTo(-s * 0.5, -s * 0.2);
          ctx.closePath(); ctx.fill();
          // circuit overlay
          ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 1.5; ctx.shadowBlur = 8; ctx.shadowColor = '#06b6d4';
          ctx.beginPath(); ctx.moveTo(-s * 0.3, s * 0.2); ctx.lineTo(s * 0.3, s * 0.2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(-s * 0.15, 0); ctx.lineTo(s * 0.15, 0); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0, -s * 0.7); ctx.lineTo(0, -s * 0.1); ctx.stroke();
          // green cockpit
          ctx.fillStyle = '#4ade80'; ctx.shadowBlur = 14; ctx.shadowColor = '#22c55e';
          ctx.beginPath(); ctx.rect(-s * 0.12, -s * 0.5, s * 0.24, s * 0.35); ctx.fill();
          ctx.globalAlpha = thrusterFlicker * 0.85;
          ctx.fillStyle = '#22c55e';
          ctx.beginPath(); ctx.moveTo(-s * 0.2, s * 0.65); ctx.lineTo(0, s * (1.0 + Math.sin(f * 0.28) * 0.1)); ctx.lineTo(s * 0.2, s * 0.65); ctx.closePath(); ctx.fill();
          ctx.globalAlpha = 1;
          break;
        }

        case 'void': {
          // Dark ethereal void ship with purple aura rings
          ctx.shadowBlur = glow + 10; ctx.shadowColor = '#7c3aed';
          // aura ring
          ctx.strokeStyle = 'rgba(168,85,247,0.4)'; ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.arc(0, 0, s * (pulse), 0, Math.PI * 2); ctx.stroke();
          ctx.strokeStyle = 'rgba(124,58,237,0.2)'; ctx.lineWidth = 5;
          ctx.beginPath(); ctx.arc(0, 0, s * (pulse * 1.25), 0, Math.PI * 2); ctx.stroke();
          // body
          ctx.fillStyle = color;
          ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s * 0.55, s * 0.6); ctx.lineTo(0, s * 0.25); ctx.lineTo(-s * 0.55, s * 0.6); ctx.closePath(); ctx.fill();
          // void eye
          ctx.fillStyle = 'rgba(196,181,253,0.95)'; ctx.shadowBlur = 20; ctx.shadowColor = '#a855f7';
          ctx.beginPath(); ctx.ellipse(0, -s * 0.15, s * 0.14, s * 0.26, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#3b0764';
          ctx.beginPath(); ctx.ellipse(0, -s * 0.15, s * 0.07, s * 0.13, 0, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = thrusterFlicker * 0.75;
          ctx.fillStyle = '#7c3aed';
          ctx.beginPath(); ctx.moveTo(-s * 0.15, s * 0.55); ctx.lineTo(0, s * (0.95 + Math.sin(f * 0.3) * 0.1)); ctx.lineTo(s * 0.15, s * 0.55); ctx.closePath(); ctx.fill();
          ctx.globalAlpha = 1;
          break;
        }

        case 'ice': {
          // Crystal blade — thin symmetric with ice facets
          ctx.shadowBlur = glow + 4; ctx.shadowColor = '#38bdf8';
          ctx.fillStyle = color;
          // faceted wings
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.lineTo(s * 0.4, -s * 0.2);
          ctx.lineTo(s * 0.9, s * 0.3);
          ctx.lineTo(s * 0.5, s * 0.6);
          ctx.lineTo(s * 0.2, s * 0.3);
          ctx.lineTo(0, s * 0.5);
          ctx.lineTo(-s * 0.2, s * 0.3);
          ctx.lineTo(-s * 0.5, s * 0.6);
          ctx.lineTo(-s * 0.9, s * 0.3);
          ctx.lineTo(-s * 0.4, -s * 0.2);
          ctx.closePath(); ctx.fill();
          // ice edge highlights
          ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s * 0.4, -s * 0.2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(-s * 0.4, -s * 0.2); ctx.stroke();
          // frost cockpit
          ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.shadowBlur = 16; ctx.shadowColor = '#bae6fd';
          ctx.beginPath(); ctx.ellipse(0, -s * 0.2, s * 0.11, s * 0.22, 0, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = thrusterFlicker * 0.7;
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath(); ctx.moveTo(-s * 0.12, s * 0.45); ctx.lineTo(0, s * (0.88 + Math.sin(f * 0.2) * 0.08)); ctx.lineTo(s * 0.12, s * 0.45); ctx.closePath(); ctx.fill();
          ctx.globalAlpha = 1;
          break;
        }

        case 'cosmic': {
          // Rounded spaceship with galaxy swirl cockpit
          ctx.shadowBlur = glow + 6; ctx.shadowColor = '#3b82f6';
          // outer hull (rounded)
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.bezierCurveTo(s * 0.7, -s * 0.5, s * 0.8, s * 0.2, s * 0.4, s * 0.7);
          ctx.lineTo(0, s * 0.4);
          ctx.lineTo(-s * 0.4, s * 0.7);
          ctx.bezierCurveTo(-s * 0.8, s * 0.2, -s * 0.7, -s * 0.5, 0, -s);
          ctx.fill();
          // side pods
          for (const [ox, oy] of [[s * 0.55, s * 0.1], [-s * 0.55, s * 0.1]]) {
            ctx.fillStyle = '#818cf8'; ctx.shadowBlur = 8; ctx.shadowColor = '#818cf8';
            ctx.beginPath(); ctx.ellipse(ox, oy, s * 0.14, s * 0.24, 0.3, 0, Math.PI * 2); ctx.fill();
          }
          // galaxy cockpit
          const grad = ctx.createRadialGradient(0, -s * 0.25, 0, 0, -s * 0.25, s * 0.22);
          grad.addColorStop(0, '#f0f9ff'); grad.addColorStop(0.4, '#818cf8'); grad.addColorStop(1, '#1e3a8a');
          ctx.fillStyle = grad; ctx.shadowBlur = 18; ctx.shadowColor = '#3b82f6';
          ctx.beginPath(); ctx.ellipse(0, -s * 0.25, s * 0.18, s * 0.22, 0, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = thrusterFlicker;
          ctx.fillStyle = '#3b82f6';
          ctx.beginPath(); ctx.moveTo(-s * 0.18, s * 0.55); ctx.lineTo(0, s * (0.95 + Math.sin(f * 0.26) * 0.1)); ctx.lineTo(s * 0.18, s * 0.55); ctx.closePath(); ctx.fill();
          ctx.globalAlpha = 1;
          break;
        }

        case 'shadow': {
          // Dark stealth with subtle gray shimmer
          ctx.shadowBlur = glow; ctx.shadowColor = '#9ca3af';
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.moveTo(0, -s * 1.05);
          ctx.lineTo(s * 0.35, -s * 0.3);
          ctx.lineTo(s * 0.8, s * 0.45);
          ctx.lineTo(s * 0.4, s * 0.35);
          ctx.lineTo(s * 0.25, s * 0.7);
          ctx.lineTo(0, s * 0.45);
          ctx.lineTo(-s * 0.25, s * 0.7);
          ctx.lineTo(-s * 0.4, s * 0.35);
          ctx.lineTo(-s * 0.8, s * 0.45);
          ctx.lineTo(-s * 0.35, -s * 0.3);
          ctx.closePath(); ctx.fill();
          // stealth lines
          ctx.strokeStyle = 'rgba(156,163,175,0.4)'; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(-s * 0.6, s * 0.3); ctx.lineTo(s * 0.6, s * 0.3); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(-s * 0.3, 0); ctx.lineTo(s * 0.3, 0); ctx.stroke();
          ctx.fillStyle = 'rgba(200,200,210,0.7)'; ctx.shadowBlur = 8;
          ctx.beginPath(); ctx.ellipse(0, -s * 0.25, s * 0.1, s * 0.2, 0, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = thrusterFlicker * 0.6;
          ctx.fillStyle = '#6b7280';
          ctx.beginPath(); ctx.moveTo(-s * 0.14, s * 0.6); ctx.lineTo(0, s * (0.92 + Math.sin(f * 0.32) * 0.08)); ctx.lineTo(s * 0.14, s * 0.6); ctx.closePath(); ctx.fill();
          ctx.globalAlpha = 1;
          break;
        }

        case 'lightning': {
          // Bolt-shaped yellow with electric crackles
          ctx.shadowBlur = glow + 8; ctx.shadowColor = '#facc15';
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.moveTo(0, -s * 1.1);
          ctx.lineTo(s * 0.3, -s * 0.1);
          ctx.lineTo(s * 0.7, s * 0.0);
          ctx.lineTo(s * 0.2, s * 0.1);
          ctx.lineTo(s * 0.45, s * 0.8);
          ctx.lineTo(0, s * 0.3);
          ctx.lineTo(-s * 0.45, s * 0.8);
          ctx.lineTo(-s * 0.2, s * 0.1);
          ctx.lineTo(-s * 0.7, s * 0.0);
          ctx.lineTo(-s * 0.3, -s * 0.1);
          ctx.closePath(); ctx.fill();
          // electric arcs
          if (f % 8 < 3) {
            ctx.strokeStyle = 'rgba(254,240,138,0.9)'; ctx.lineWidth = 1.5; ctx.shadowBlur = 15; ctx.shadowColor = '#fde047';
            ctx.beginPath();
            ctx.moveTo((Math.random() - 0.5) * s, -s * 0.8);
            ctx.lineTo((Math.random() - 0.5) * s * 0.5, 0);
            ctx.lineTo((Math.random() - 0.5) * s, s * 0.4);
            ctx.stroke();
          }
          ctx.fillStyle = '#fef08a'; ctx.shadowBlur = 16;
          ctx.beginPath(); ctx.ellipse(0, -s * 0.3, s * 0.12, s * 0.22, 0, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = thrusterFlicker;
          ctx.fillStyle = '#facc15';
          ctx.beginPath(); ctx.moveTo(-s * 0.15, s * 0.65); ctx.lineTo(0, s * (1.05 + Math.sin(f * 0.4) * 0.12)); ctx.lineTo(s * 0.15, s * 0.65); ctx.closePath(); ctx.fill();
          ctx.globalAlpha = 1;
          break;
        }

        case 'rainbow': {
          // Prismatic ship with cycling hue fill
          const hue = (f * 3) % 360;
          ctx.shadowBlur = glow + 6; ctx.shadowColor = `hsl(${hue},100%,65%)`;
          ctx.fillStyle = `hsl(${hue},100%,65%)`;
          ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s * 0.65, s * 0.7); ctx.lineTo(0, s * 0.3); ctx.lineTo(-s * 0.65, s * 0.7); ctx.closePath(); ctx.fill();
          // rainbow stripe
          const rg = ctx.createLinearGradient(-s, 0, s, 0);
          rg.addColorStop(0, '#f43f5e'); rg.addColorStop(0.2, '#f97316'); rg.addColorStop(0.4, '#facc15');
          rg.addColorStop(0.6, '#22c55e'); rg.addColorStop(0.8, '#3b82f6'); rg.addColorStop(1, '#a855f7');
          ctx.fillStyle = rg;
          ctx.beginPath(); ctx.rect(-s * 0.5, -s * 0.05, s, s * 0.12); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.shadowBlur = 14;
          ctx.beginPath(); ctx.ellipse(0, -s * 0.2, s * 0.13, s * 0.24, 0, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = thrusterFlicker;
          ctx.fillStyle = `hsl(${(hue + 120) % 360},100%,70%)`;
          ctx.beginPath(); ctx.moveTo(-s * 0.15, s * 0.58); ctx.lineTo(0, s * (0.98 + Math.sin(f * 0.3) * 0.1)); ctx.lineTo(s * 0.15, s * 0.58); ctx.closePath(); ctx.fill();
          ctx.globalAlpha = 1;
          break;
        }

        case 'echo': {
          // Glitchy dual-layer echo ship
          ctx.shadowBlur = 30; ctx.shadowColor = '#06b6d4';
          // ghost layer
          ctx.globalAlpha = 0.35 + Math.sin(f * 0.1) * 0.1;
          ctx.fillStyle = '#a855f7';
          ctx.beginPath(); ctx.moveTo(4, -s); ctx.lineTo(s + 4, s); ctx.lineTo(-s + 4, s); ctx.closePath(); ctx.fill();
          ctx.globalAlpha = 1;
          // main layer
          const eg = ctx.createLinearGradient(-s, s, s, -s);
          eg.addColorStop(0, '#a855f7'); eg.addColorStop(0.5, '#06b6d4'); eg.addColorStop(1, '#c084fc');
          ctx.fillStyle = eg;
          ctx.beginPath(); ctx.moveTo(0, -s - 2); ctx.lineTo(s + 3, s + 2); ctx.lineTo(-s - 3, s + 2); ctx.closePath(); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.shadowBlur = 15; ctx.shadowColor = '#06b6d4';
          ctx.beginPath(); ctx.arc(0, -s * 0.3, s * 0.5, 0, Math.PI * 2); ctx.fill();
          // scan line
          ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 2; ctx.shadowBlur = 12;
          const sl = ((f * 2) % (s * 2.5)) - s * 1.0;
          ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s * 0.6, s * 0.4); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(-s * 0.6, s * 0.4); ctx.stroke();
          ctx.globalAlpha = thrusterFlicker * 0.8;
          ctx.fillStyle = '#06b6d4';
          ctx.beginPath(); ctx.moveTo(-s * 0.18, s * 0.65); ctx.lineTo(0, s * (1.05 + Math.sin(f * 0.28) * 0.12)); ctx.lineTo(s * 0.18, s * 0.65); ctx.closePath(); ctx.fill();
          ctx.globalAlpha = 1;
          break;
        }

        // ── Season 2 Battle Pass Ships ──

        case 's2_phantom': {
          // Ghost ship — partial transparency, cloaking shimmer
          ctx.shadowBlur = glow + 5; ctx.shadowColor = '#9ca3af';
          ctx.globalAlpha = 0.6 + Math.sin(f * 0.07) * 0.12;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.moveTo(0, -s * 1.05);
          ctx.lineTo(s * 0.6, -s * 0.1);
          ctx.lineTo(s * 0.85, s * 0.55);
          ctx.lineTo(s * 0.3, s * 0.4);
          ctx.lineTo(s * 0.2, s * 0.75);
          ctx.lineTo(0, s * 0.5);
          ctx.lineTo(-s * 0.2, s * 0.75);
          ctx.lineTo(-s * 0.3, s * 0.4);
          ctx.lineTo(-s * 0.85, s * 0.55);
          ctx.lineTo(-s * 0.6, -s * 0.1);
          ctx.closePath(); ctx.fill();
          ctx.globalAlpha = 1;
          // cloaking scanlines
          ctx.strokeStyle = 'rgba(200,210,220,0.35)'; ctx.lineWidth = 1;
          for (let i = -1; i <= 1; i++) {
            ctx.beginPath(); ctx.moveTo(i * s * 0.3, -s * 0.8); ctx.lineTo(i * s * 0.5, s * 0.5); ctx.stroke();
          }
          // ghost cockpit
          ctx.globalAlpha = 0.7 + Math.sin(f * 0.09) * 0.2;
          ctx.fillStyle = '#e2e8f0'; ctx.shadowBlur = 16; ctx.shadowColor = '#94a3b8';
          ctx.beginPath(); ctx.ellipse(0, -s * 0.25, s * 0.13, s * 0.22, 0, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 1;
          ctx.globalAlpha = thrusterFlicker * 0.5;
          ctx.fillStyle = '#9ca3af';
          ctx.beginPath(); ctx.moveTo(-s * 0.12, s * 0.62); ctx.lineTo(0, s * (0.98 + Math.sin(f * 0.32) * 0.08)); ctx.lineTo(s * 0.12, s * 0.62); ctx.closePath(); ctx.fill();
          ctx.globalAlpha = 1;
          break;
        }

        case 's2_hellfire': {
          // Infernal Mk.II — dual wing cannons + lava drip
          ctx.shadowBlur = glow + 8; ctx.shadowColor = '#f97316';
          // wing cannons
          for (const [ox, oa] of [[-s * 0.7, -0.15], [s * 0.7, 0.15]]) {
            ctx.fillStyle = '#7f1d1d';
            ctx.save(); ctx.translate(ox, s * 0.1); ctx.rotate(oa);
            ctx.fillRect(-s * 0.1, -s * 0.35, s * 0.2, s * 0.5);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(-s * 0.06, -s * 0.35, s * 0.12, s * 0.12);
            ctx.restore();
          }
          // main hull
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.lineTo(s * 0.5, -s * 0.1);
          ctx.lineTo(s * 0.75, s * 0.5);
          ctx.lineTo(s * 0.4, s * 0.35);
          ctx.lineTo(s * 0.35, s * 0.75);
          ctx.lineTo(0, s * 0.45);
          ctx.lineTo(-s * 0.35, s * 0.75);
          ctx.lineTo(-s * 0.4, s * 0.35);
          ctx.lineTo(-s * 0.75, s * 0.5);
          ctx.lineTo(-s * 0.5, -s * 0.1);
          ctx.closePath(); ctx.fill();
          // lava cockpit
          const lg = ctx.createRadialGradient(0, -s * 0.2, 0, 0, -s * 0.2, s * 0.22);
          lg.addColorStop(0, '#fde047'); lg.addColorStop(0.5, '#f97316'); lg.addColorStop(1, '#7f1d1d');
          ctx.fillStyle = lg; ctx.shadowBlur = 18; ctx.shadowColor = '#ef4444';
          ctx.beginPath(); ctx.ellipse(0, -s * 0.2, s * 0.16, s * 0.24, 0, 0, Math.PI * 2); ctx.fill();
          // triple engine
          for (const ox of [-s * 0.22, 0, s * 0.22]) {
            ctx.globalAlpha = thrusterFlicker * (0.7 + Math.random() * 0.3);
            ctx.fillStyle = ox === 0 ? '#fbbf24' : '#f97316';
            ctx.beginPath(); ctx.moveTo(ox - s * 0.09, s * 0.6); ctx.lineTo(ox, s * (0.95 + Math.sin(f * 0.38 + ox) * 0.15)); ctx.lineTo(ox + s * 0.09, s * 0.6); ctx.closePath(); ctx.fill();
          }
          ctx.globalAlpha = 1;
          break;
        }

        case 's2_ghost': {
          // Ethereal white-blue with spectral trail
          ctx.shadowBlur = glow + 6; ctx.shadowColor = '#a5f3fc';
          // spectral aura
          ctx.strokeStyle = `rgba(165,243,252,${0.15 + Math.sin(f * 0.08) * 0.08})`; ctx.lineWidth = 8;
          ctx.beginPath(); ctx.arc(0, 0, s * pulse * 0.9, 0, Math.PI * 2); ctx.stroke();
          // body
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.lineTo(s * 0.45, s * 0.45);
          ctx.lineTo(s * 0.2, s * 0.25);
          ctx.lineTo(s * 0.3, s * 0.75);
          ctx.lineTo(0, s * 0.5);
          ctx.lineTo(-s * 0.3, s * 0.75);
          ctx.lineTo(-s * 0.2, s * 0.25);
          ctx.lineTo(-s * 0.45, s * 0.45);
          ctx.closePath(); ctx.fill();
          // ghost tinge
          ctx.globalAlpha = 0.3 + Math.sin(f * 0.06) * 0.1;
          ctx.fillStyle = '#a5f3fc';
          ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s * 0.45, s * 0.45); ctx.lineTo(-s * 0.45, s * 0.45); ctx.closePath(); ctx.fill();
          ctx.globalAlpha = 1;
          // cockpit
          ctx.fillStyle = 'rgba(224,242,254,0.95)'; ctx.shadowBlur = 20; ctx.shadowColor = '#a5f3fc';
          ctx.beginPath(); ctx.ellipse(0, -s * 0.22, s * 0.12, s * 0.22, 0, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = thrusterFlicker * 0.65;
          ctx.fillStyle = '#bae6fd';
          ctx.beginPath(); ctx.moveTo(-s * 0.12, s * 0.6); ctx.lineTo(0, s * (1.0 + Math.sin(f * 0.22) * 0.1)); ctx.lineTo(s * 0.12, s * 0.6); ctx.closePath(); ctx.fill();
          ctx.globalAlpha = 1;
          break;
        }

        case 's2_titan': {
          // Heavy Apocalypse Titan — broad war machine
          ctx.shadowBlur = glow + 10; ctx.shadowColor = '#22d3ee';
          // shoulder plates
          for (const [ox, ow] of [[-s * 0.62, -1], [s * 0.62, 1]]) {
            ctx.fillStyle = '#1e1b4b';
            ctx.beginPath(); ctx.moveTo(ox, -s * 0.3); ctx.lineTo(ox + ow * s * 0.38, -s * 0.05); ctx.lineTo(ox + ow * s * 0.4, s * 0.5); ctx.lineTo(ox, s * 0.35); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 1.5; ctx.strokeRect(ox + ow * s * 0.05, -s * 0.1, s * 0.18, s * 0.28);
          }
          // main hull
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.moveTo(0, -s * 1.0);
          ctx.lineTo(s * 0.55, -s * 0.25);
          ctx.lineTo(s * 0.6, s * 0.6);
          ctx.lineTo(s * 0.35, s * 0.75);
          ctx.lineTo(0, s * 0.55);
          ctx.lineTo(-s * 0.35, s * 0.75);
          ctx.lineTo(-s * 0.6, s * 0.6);
          ctx.lineTo(-s * 0.55, -s * 0.25);
          ctx.closePath(); ctx.fill();
          // energy lines
          ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2; ctx.shadowBlur = 12; ctx.shadowColor = '#22d3ee';
          ctx.beginPath(); ctx.moveTo(-s * 0.35, s * 0.05); ctx.lineTo(s * 0.35, s * 0.05); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(-s * 0.25, -s * 0.3); ctx.lineTo(s * 0.25, -s * 0.3); ctx.stroke();
          // titan cockpit
          const tg = ctx.createLinearGradient(0, -s * 0.5, 0, s * 0.1);
          tg.addColorStop(0, '#22d3ee'); tg.addColorStop(1, '#1e1b4b');
          ctx.fillStyle = tg; ctx.shadowBlur = 20; ctx.shadowColor = '#22d3ee';
          ctx.beginPath(); ctx.rect(-s * 0.15, -s * 0.55, s * 0.3, s * 0.45); ctx.fill();
          // 3 engines
          for (const [ox, oc] of [[-s * 0.3, '#7c3aed'], [0, '#22d3ee'], [s * 0.3, '#7c3aed']]) {
            ctx.globalAlpha = thrusterFlicker * (ox === 0 ? 1 : 0.75);
            ctx.fillStyle = oc;
            ctx.beginPath(); ctx.moveTo(ox - s * 0.1, s * 0.65); ctx.lineTo(ox, s * (1.05 + Math.sin(f * 0.3 + ox) * 0.12)); ctx.lineTo(ox + s * 0.1, s * 0.65); ctx.closePath(); ctx.fill();
          }
          ctx.globalAlpha = 1;
          break;
        }

        case 's2_apex': {
          // APEX Predator — golden crown-ship, maximum opulence
          ctx.shadowBlur = glow + 15; ctx.shadowColor = '#f59e0b';
          // crown spikes
          const crownPoints = [
            [0, -s * 1.25], [s * 0.15, -s * 0.85], [s * 0.35, -s * 1.05], [s * 0.5, -s * 0.65],
            [s * 0.7, -s * 0.8], [s * 0.75, -s * 0.3],
          ];
          ctx.fillStyle = '#ca8a04';
          ctx.beginPath(); ctx.moveTo(0, -s * 1.25);
          for (const [x, y] of crownPoints) ctx.lineTo(x, y);
          ctx.lineTo(s * 0.8, s * 0.5); ctx.lineTo(s * 0.35, s * 0.7); ctx.lineTo(0, s * 0.5);
          ctx.lineTo(-s * 0.35, s * 0.7); ctx.lineTo(-s * 0.8, s * 0.5);
          ctx.lineTo(-s * 0.75, -s * 0.3); ctx.lineTo(-s * 0.7, -s * 0.8); ctx.lineTo(-s * 0.5, -s * 0.65);
          ctx.lineTo(-s * 0.35, -s * 1.05); ctx.lineTo(-s * 0.15, -s * 0.85);
          ctx.closePath(); ctx.fill();
          // gold hull
          const ag = ctx.createLinearGradient(-s, s, s, -s);
          ag.addColorStop(0, '#92400e'); ag.addColorStop(0.35, color); ag.addColorStop(0.65, '#fef3c7'); ag.addColorStop(1, color);
          ctx.fillStyle = ag;
          ctx.beginPath();
          ctx.moveTo(0, -s * 0.9);
          ctx.lineTo(s * 0.65, -s * 0.2);
          ctx.lineTo(s * 0.7, s * 0.5);
          ctx.lineTo(s * 0.3, s * 0.65);
          ctx.lineTo(0, s * 0.45);
          ctx.lineTo(-s * 0.3, s * 0.65);
          ctx.lineTo(-s * 0.7, s * 0.5);
          ctx.lineTo(-s * 0.65, -s * 0.2);
          ctx.closePath(); ctx.fill();
          // gem cockpit
          ctx.fillStyle = '#fef9c3'; ctx.shadowBlur = 22; ctx.shadowColor = '#fbbf24';
          ctx.beginPath(); ctx.moveTo(0, -s * 0.6); ctx.lineTo(s * 0.16, -s * 0.1); ctx.lineTo(0, s * 0.12); ctx.lineTo(-s * 0.16, -s * 0.1); ctx.closePath(); ctx.fill();
          // gem facets
          ctx.strokeStyle = 'rgba(255,255,200,0.6)'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(0, -s * 0.6); ctx.lineTo(0, s * 0.12); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(-s * 0.16, -s * 0.1); ctx.lineTo(s * 0.16, -s * 0.1); ctx.stroke();
          // quad engines
          for (const [ox, oc] of [[-s * 0.38, '#f59e0b'], [-s * 0.13, '#fde047'], [s * 0.13, '#fde047'], [s * 0.38, '#f59e0b']]) {
            ctx.globalAlpha = thrusterFlicker * (Math.abs(ox) > s * 0.2 ? 0.75 : 1);
            ctx.fillStyle = oc;
            ctx.beginPath(); ctx.moveTo(ox - s * 0.08, s * 0.58); ctx.lineTo(ox, s * (0.98 + Math.sin(f * 0.35 + ox) * 0.13)); ctx.lineTo(ox + s * 0.08, s * 0.58); ctx.closePath(); ctx.fill();
          }
          ctx.globalAlpha = 1;
          break;
        }

        default: {
          // Fallback — simple triangle
          ctx.shadowBlur = glow; ctx.shadowColor = glowColor;
          ctx.fillStyle = color;
          ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s, s); ctx.lineTo(-s, s); ctx.closePath(); ctx.fill();
        }
      }

      ctx.restore();
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [skinId, color, glowColor, size]);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
}