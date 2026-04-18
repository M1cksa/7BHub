import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const STEPS = [
  {
    id: 'welcome',
    emoji: '⭕',
    title: 'Der Absoluter Pro Pass',
    subtitle: 'Das ultimative Langzeitziel der Plattform',
    body: 'Willkommen zu etwas Besonderem. Der Pro Pass ist kein gewöhnlicher Kauf – er ist eine Reise durch 1.000 Dimensionen, die Monate dauern kann und dich für immer verändert.',
    visual: 'portal',
    color: '#fbbf24',
  },
  {
    id: 'howto',
    emoji: '⬡',
    title: 'Wie funktioniert es?',
    subtitle: 'Spiel Neon Dash · Traversiere Dimensionen · Erhalte Belohnungen',
    body: 'Jedes Mal, wenn du in Neon Dash ein Dimensionsportal betrittst, zählt das als eine traversierte Dimension. Du musst nichts extra tun – einfach spielen!',
    visual: 'dimensions',
    color: '#a855f7',
  },
  {
    id: 'tiers',
    emoji: '🏆',
    title: '10 epische Meilensteine',
    subtitle: 'Jeder Tier schaltet exklusive Belohnungen frei',
    body: 'Von "Rift Breaker" bei 50 Dimensionen bis hin zu "THE ABSOLUTE" bei 1.000 – jeder Meilenstein bringt einzigartige Cosmetics, Titel und Token-Belohnungen im Wert von über 250.000 Tokens.',
    visual: 'tiers',
    color: '#06b6d4',
  },
  {
    id: 'exclusive',
    emoji: '🚀',
    title: 'Nirgendwo sonst erhältlich',
    subtitle: 'Exklusive Inhalte die nur durch den Pro Pass existieren',
    body: 'Das Echo Dimension Ship, göttliche Frames, animierte Profil-Effekte und der Titel "THE ABSOLUTE" – diese Inhalte gibt es ausschließlich für Pro Pass Inhaber.',
    visual: 'exclusive',
    color: '#ec4899',
  },
  {
    id: 'ready',
    emoji: '👑',
    title: 'Deine epische Reise beginnt',
    subtitle: 'Bist du bereit für die Herausforderung?',
    body: 'Für 100.000 Tokens startest du eine Reise, die dich in die Geschichte dieser Plattform einschreibt. Schaffe 1.000 Dimensionen und werde THE ABSOLUTE.',
    visual: 'crown',
    color: '#fbbf24',
  },
];

// ── Mini Canvas visualizations ──

function PortalCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    c.width = 320; c.height = 220;
    let t = 0, raf;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      ctx.fillStyle = 'rgba(1,0,12,0.18)';
      ctx.fillRect(0, 0, 320, 220);
      t += 0.025;
      const cx = 160, cy = 110;
      // Outer rings
      for (let r = 3; r >= 0; r--) {
        const rad = 60 + r * 18 + Math.sin(t + r) * 5;
        const alpha = 0.15 + r * 0.08 + Math.sin(t * 1.2 + r) * 0.05;
        const colors = ['#fbbf24','#a855f7','#06b6d4','#ec4899'];
        ctx.save();
        ctx.strokeStyle = colors[r % colors.length];
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 3 - r * 0.4;
        ctx.shadowBlur = 20;
        ctx.shadowColor = colors[r % colors.length];
        ctx.beginPath();
        ctx.arc(cx, cy, rad, t * (r % 2 === 0 ? 1 : -1), t * (r % 2 === 0 ? 1 : -1) + Math.PI * 1.6);
        ctx.stroke();
        ctx.restore();
      }
      // Inner glow
      const ig = ctx.createRadialGradient(cx, cy, 0, cx, cy, 45);
      ig.addColorStop(0, 'rgba(251,191,36,0.5)');
      ig.addColorStop(0.5, 'rgba(168,85,247,0.25)');
      ig.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = ig;
      ctx.beginPath(); ctx.arc(cx, cy, 45, 0, Math.PI * 2); ctx.fill();
      // Center symbol
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.5);
      ctx.fillStyle = `rgba(251,191,36,${0.6 + Math.sin(t * 2) * 0.3})`;
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowBlur = 20; ctx.shadowColor = '#fbbf24';
      ctx.fillText('⭕', 0, 0);
      ctx.restore();
      // Orbiting particles
      for (let p = 0; p < 8; p++) {
        const angle = (p / 8) * Math.PI * 2 + t * 1.2;
        const dist = 78 + Math.sin(t * 2 + p) * 8;
        const px2 = cx + Math.cos(angle) * dist;
        const py2 = cy + Math.sin(angle) * dist;
        const pc = ['#fbbf24','#a855f7','#06b6d4','#ec4899'][p % 4];
        ctx.save();
        ctx.globalAlpha = 0.7 + Math.sin(t * 3 + p) * 0.25;
        ctx.fillStyle = pc;
        ctx.shadowBlur = 8; ctx.shadowColor = pc;
        ctx.beginPath(); ctx.arc(px2, py2, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} className="rounded-2xl w-full" style={{ maxWidth: 320, height: 220, display: 'block', margin: '0 auto' }} />;
}

function DimensionsCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    c.width = 320; c.height = 220;
    let t = 0, raf;
    const ships = Array.from({ length: 4 }, (_, i) => ({
      x: 40 + i * 65, y: 170, vy: -0.8 - i * 0.15, color: ['#ffffff','#f97316','#ec4899','#a855f7'][i], size: 10,
    }));
    const portals = [{ x: 90, y: 60, r: 28, c: '#a855f7' }, { x: 200, y: 50, r: 22, c: '#06b6d4' }, { x: 280, y: 65, r: 18, c: '#ec4899' }];
    const loop = () => {
      raf = requestAnimationFrame(loop);
      ctx.fillStyle = 'rgba(1,0,12,0.2)'; ctx.fillRect(0, 0, 320, 220);
      t += 0.02;
      // Grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.03)'; ctx.lineWidth = 1;
      for (let y = (t * 60) % 40; y < 220; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(320, y); ctx.stroke(); }
      // Portals
      for (const p of portals) {
        const pulse = p.r + Math.sin(t * 2 + p.x) * 4;
        ctx.save(); ctx.shadowBlur = 20; ctx.shadowColor = p.c;
        ctx.strokeStyle = p.c; ctx.lineWidth = 2.5; ctx.globalAlpha = 0.7;
        ctx.beginPath(); ctx.arc(p.x, p.y, pulse, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 0.15; ctx.fillStyle = p.c; ctx.fill();
        ctx.restore();
        // Label
        ctx.fillStyle = p.c; ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center'; ctx.globalAlpha = 0.5;
        ctx.fillText('⬡', p.x, p.y + 3); ctx.globalAlpha = 1;
      }
      // Ships flying into portals
      for (let i = 0; i < ships.length; i++) {
        const ship = ships[i];
        ship.y += ship.vy;
        if (ship.y < 30) ship.y = 175 + Math.random() * 10;
        ctx.save();
        ctx.translate(ship.x + Math.sin(t * 2 + i) * 8, ship.y);
        ctx.shadowBlur = 15; ctx.shadowColor = ship.color; ctx.fillStyle = ship.color;
        ctx.beginPath(); ctx.moveTo(0, -ship.size); ctx.lineTo(ship.size * 0.6, ship.size * 0.6); ctx.lineTo(-ship.size * 0.6, ship.size * 0.6); ctx.closePath(); ctx.fill();
        // Trail
        ctx.globalAlpha = 0.3; ctx.fillStyle = ship.color + '80';
        ctx.beginPath(); ctx.ellipse(0, ship.size + 5, 3, 8, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      // Counter display
      const count = Math.floor(t * 8) % 1001;
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.roundRect(90, 155, 140, 40, 8); ctx.fill();
      ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 22px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.shadowBlur = 12; ctx.shadowColor = '#fbbf24';
      ctx.fillText(String(count).padStart(4, '0'), 160, 175);
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = 'bold 7px sans-serif';
      ctx.fillText('DIMENSIONEN TRAVERSIERT', 160, 190);
      ctx.restore();
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} className="rounded-2xl w-full" style={{ maxWidth: 320, height: 220, display: 'block', margin: '0 auto' }} />;
}

function TiersCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    c.width = 320; c.height = 220;
    let t = 0, raf;
    const tiers = [
      { label: 'Rift Breaker', at: 50,   color: '#06b6d4', rarity: 'SELTEN' },
      { label: 'Prisma',       at: 200,  color: '#fbbf24', rarity: 'EPISCH' },
      { label: 'Kosmisch',     at: 500,  color: '#3b82f6', rarity: 'LEGEND' },
      { label: 'Echo Ship',    at: 650,  color: '#22c55e', rarity: 'LEGEND' },
      { label: 'THE ABSOLUTE', at: 1000, color: '#fbbf24', rarity: 'ABSOLUT' },
    ];
    const loop = () => {
      raf = requestAnimationFrame(loop);
      ctx.fillStyle = 'rgba(1,0,12,0.2)'; ctx.fillRect(0, 0, 320, 220);
      t += 0.018;
      // Progress bar background
      const barY = 100, barX = 20, barW = 280, barH = 12;
      ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.beginPath(); ctx.roundRect(barX, barY, barW, barH, 6); ctx.fill();
      // Animated progress fill (cycles 0→100%)
      const pct = (Math.sin(t * 0.3) * 0.5 + 0.5);
      const fillW = barW * pct;
      if (fillW > 0) {
        const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
        grad.addColorStop(0, '#7c3aed'); grad.addColorStop(0.3, '#06b6d4'); grad.addColorStop(0.6, '#a855f7'); grad.addColorStop(0.85, '#f97316'); grad.addColorStop(1, '#fbbf24');
        ctx.fillStyle = grad; ctx.beginPath(); ctx.roundRect(barX, barY, fillW, barH, 6); ctx.fill();
        // Shimmer
        const shimX = barX + (t * 120) % (barW + 60) - 60;
        const sg = ctx.createLinearGradient(shimX, 0, shimX + 60, 0);
        sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,0.3)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = sg; ctx.beginPath(); ctx.roundRect(barX, barY, fillW, barH, 6); ctx.fill();
      }
      // Tier markers
      for (const tier of tiers) {
        const mx = barX + (tier.at / 1000) * barW;
        const reached = pct >= tier.at / 1000;
        // Vertical line
        ctx.strokeStyle = reached ? tier.color : 'rgba(255,255,255,0.15)';
        ctx.lineWidth = reached ? 2 : 1;
        ctx.shadowBlur = reached ? 10 : 0; ctx.shadowColor = tier.color;
        ctx.beginPath(); ctx.moveTo(mx, barY - 8); ctx.lineTo(mx, barY + barH + 8); ctx.stroke();
        ctx.shadowBlur = 0;
        // Dot
        ctx.fillStyle = reached ? tier.color : 'rgba(255,255,255,0.15)';
        if (reached) { ctx.shadowBlur = 12; ctx.shadowColor = tier.color; }
        ctx.beginPath(); ctx.arc(mx, barY - 12, 4, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        // Pulse for reached
        if (reached) {
          const pulseR = 4 + Math.sin(t * 3) * 2;
          ctx.globalAlpha = 0.3 + Math.sin(t * 3) * 0.15;
          ctx.beginPath(); ctx.arc(mx, barY - 12, pulseR + 5, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 1;
        }
      }
      // Labels below bar
      const activeTier = tiers.filter(ti => pct >= ti.at / 1000).pop();
      if (activeTier) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.beginPath(); ctx.roundRect(60, 125, 200, 48, 8); ctx.fill();
        ctx.fillStyle = activeTier.color; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowBlur = 10; ctx.shadowColor = activeTier.color;
        ctx.fillText(activeTier.label, 160, 140);
        ctx.fillStyle = activeTier.color + '88'; ctx.font = 'bold 8px sans-serif';
        ctx.fillText(activeTier.rarity, 160, 155);
        ctx.restore();
      }
      // Dim count label
      const dims = Math.floor(pct * 1000);
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(`${dims} / 1000 Dims`, barX, barY + barH + 22);
      ctx.textAlign = 'right';
      ctx.fillText('10 Tiers', barX + barW, barY + barH + 22);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} className="rounded-2xl w-full" style={{ maxWidth: 320, height: 220, display: 'block', margin: '0 auto' }} />;
}

function ExclusiveCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    c.width = 320; c.height = 220;
    let t = 0, raf;
    const items = [
      { label: 'Echo Dimension Ship', emoji: '🚀', color: '#22c55e', x: 80, y: 70 },
      { label: 'THE ABSOLUTE Frame', emoji: '👑', color: '#fbbf24', x: 240, y: 70 },
      { label: 'Divine Ascension', emoji: '⚡', color: '#f97316', x: 80, y: 155 },
      { label: 'Eternal Nexus', emoji: '♾️', color: '#c084fc', x: 240, y: 155 },
    ];
    const loop = () => {
      raf = requestAnimationFrame(loop);
      ctx.fillStyle = 'rgba(1,0,12,0.2)'; ctx.fillRect(0, 0, 320, 220);
      t += 0.02;
      // Center "ONLY" badge
      ctx.save();
      ctx.fillStyle = 'rgba(251,191,36,0.08)'; ctx.beginPath(); ctx.arc(160, 110, 35, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.3 + Math.sin(t * 2) * 0.1;
      ctx.beginPath(); ctx.arc(160, 110, 35, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1; ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('ONLY', 160, 106); ctx.fillText('PRO', 160, 116);
      ctx.restore();
      // Lines from center to items
      for (const item of items) {
        ctx.save(); ctx.globalAlpha = 0.2 + Math.sin(t + item.x) * 0.08;
        ctx.strokeStyle = item.color; ctx.lineWidth = 1; ctx.setLineDash([3, 5]);
        ctx.beginPath(); ctx.moveTo(160, 110); ctx.lineTo(item.x, item.y); ctx.stroke();
        ctx.setLineDash([]); ctx.restore();
      }
      // Item bubbles
      for (const item of items) {
        const bounce = Math.sin(t * 1.5 + item.x * 0.05) * 4;
        ctx.save(); ctx.translate(item.x, item.y + bounce);
        // Glow ring
        ctx.shadowBlur = 20; ctx.shadowColor = item.color;
        ctx.fillStyle = item.color + '18'; ctx.strokeStyle = item.color;
        ctx.lineWidth = 1.5; ctx.globalAlpha = 0.9;
        ctx.beginPath(); ctx.arc(0, 0, 28, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.shadowBlur = 0;
        // Emoji
        ctx.font = '18px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(item.emoji, 0, 0);
        // Label
        ctx.fillStyle = item.color; ctx.font = 'bold 7px sans-serif';
        ctx.globalAlpha = 0.8;
        const lines = item.label.split(' ');
        lines.forEach((ln, li) => ctx.fillText(ln, 0, 36 + li * 10));
        ctx.restore();
      }
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} className="rounded-2xl w-full" style={{ maxWidth: 320, height: 220, display: 'block', margin: '0 auto' }} />;
}

function CrownCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    c.width = 320; c.height = 220;
    let t = 0, raf;
    const stars = Array.from({ length: 60 }, () => ({
      x: Math.random(), y: Math.random(), s: Math.random() * 1.5 + 0.3,
      sp: Math.random() * 0.04 + 0.01, ph: Math.random() * Math.PI * 2,
    }));
    const loop = () => {
      raf = requestAnimationFrame(loop);
      ctx.fillStyle = 'rgba(1,0,12,0.15)'; ctx.fillRect(0, 0, 320, 220);
      t += 0.02;
      // Stars
      for (const s of stars) {
        const op = 0.3 + Math.sin(t * s.sp * 50 + s.ph) * 0.3;
        ctx.fillStyle = `rgba(255,255,255,${op})`; ctx.beginPath(); ctx.arc(s.x * 320, s.y * 220, s.s, 0, Math.PI * 2); ctx.fill();
      }
      // Outer aura rings
      for (let r = 4; r >= 0; r--) {
        const rad = 55 + r * 12 + Math.sin(t * 0.8 + r) * 4;
        const colors = ['#fbbf24','#f97316','#a855f7','#06b6d4','#ec4899'];
        ctx.save(); ctx.globalAlpha = 0.06 + r * 0.02 + Math.sin(t + r) * 0.02;
        ctx.strokeStyle = colors[r]; ctx.lineWidth = 2.5;
        ctx.shadowBlur = 15; ctx.shadowColor = colors[r];
        ctx.beginPath(); ctx.arc(160, 105, rad, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }
      // Shimmer ground glow
      const gg = ctx.createRadialGradient(160, 105, 0, 160, 105, 75);
      gg.addColorStop(0, `rgba(251,191,36,${0.18 + Math.sin(t * 1.5) * 0.06})`);
      gg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(160, 105, 75, 0, Math.PI * 2); ctx.fill();
      // Crown emoji
      ctx.save();
      ctx.translate(160, 105);
      const scale = 1 + Math.sin(t * 1.2) * 0.06;
      ctx.scale(scale, scale);
      ctx.font = '52px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.shadowBlur = 30; ctx.shadowColor = '#fbbf24';
      ctx.fillText('👑', 0, 0);
      ctx.restore();
      // Floating reward tags
      const tags = [{ t: 'THE ABSOLUTE', c: '#fbbf24', angle: t * 0.4, r: 90 }, { t: '100k Tokens', c: '#a855f7', angle: t * 0.4 + 2.1, r: 90 }, { t: 'Ewiger Ruhm', c: '#06b6d4', angle: t * 0.4 + 4.2, r: 90 }];
      for (const tag of tags) {
        const tx = 160 + Math.cos(tag.angle) * tag.r;
        const ty = 105 + Math.sin(tag.angle) * 45;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.beginPath(); ctx.roundRect(tx - 38, ty - 10, 76, 20, 5); ctx.fill();
        ctx.fillStyle = tag.c; ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowBlur = 6; ctx.shadowColor = tag.c;
        ctx.fillText(tag.t, tx, ty);
        ctx.restore();
      }
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} className="rounded-2xl w-full" style={{ maxWidth: 320, height: 220, display: 'block', margin: '0 auto' }} />;
}

const VISUAL_MAP = {
  portal: PortalCanvas,
  dimensions: DimensionsCanvas,
  tiers: TiersCanvas,
  exclusive: ExclusiveCanvas,
  crown: CrownCanvas,
};

const STORAGE_KEY = 'propass_tutorial_seen_v1';

export default function ProPassTutorial({ onClose }) {
  const [step, setStep] = useState(0);
  const [exiting, setExiting] = useState(false);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const VisualComponent = VISUAL_MAP[current.visual];

  const next = () => {
    if (isLast) { handleClose(); return; }
    setStep(s => s + 1);
  };

  const handleClose = () => {
    setExiting(true);
    localStorage.setItem(STORAGE_KEY, '1');
    // Persistiere in AppUser für geräteübergreifende Einmaligkeit
    try {
      const stored = localStorage.getItem('app_user');
      const u = stored && stored !== 'undefined' ? JSON.parse(stored) : null;
      if (u?.id) {
        base44.entities.AppUser.update(u.id, { propass_tutorial_seen: true })
          .then(updated => localStorage.setItem('app_user', JSON.stringify(updated)))
          .catch(() => {});
      }
    } catch {}
    setTimeout(() => onClose(), 400);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      style={{ background: 'rgba(1,0,12,0.88)', backdropFilter: 'blur(16px)' }}
    >
      {/* Skip button */}
      <button onClick={handleClose} className="absolute top-5 right-5 text-white/30 hover:text-white/60 transition-colors z-10">
        <X className="w-5 h-5" />
      </button>

      {/* Step indicator */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {STEPS.map((_, i) => (
          <div key={i} className="rounded-full transition-all duration-300"
            style={{ width: i === step ? 20 : 6, height: 6, background: i === step ? current.color : 'rgba(255,255,255,0.15)' }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step}
          initial={{ opacity: 0, x: 40, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -40, scale: 0.97 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          {/* Card */}
          <div className="rounded-3xl overflow-hidden"
            style={{ background: 'rgba(8,4,24,0.95)', border: `1px solid ${current.color}35`, boxShadow: `0 0 60px ${current.color}18, 0 40px 80px rgba(0,0,0,0.6)` }}>

            {/* Color accent top bar */}
            <div className="h-1" style={{ background: `linear-gradient(90deg, ${current.color}, transparent 70%)` }} />

            {/* Visual area */}
            <div className="relative bg-black/40 overflow-hidden" style={{ height: 220 }}>
              <VisualComponent />
              {/* Subtle overlay with step info */}
              <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
                style={{ background: 'linear-gradient(to top, rgba(8,4,24,0.9), transparent)' }} />
            </div>

            {/* Content */}
            <div className="p-6 pt-5">
              {/* Step label */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                  style={{ background: current.color + '18', color: current.color, border: `1px solid ${current.color}30` }}>
                  SCHRITT {step + 1} VON {STEPS.length}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-xl font-black text-white leading-tight mb-1">{current.title}</h2>
              <p className="text-xs font-bold mb-3" style={{ color: current.color + 'aa' }}>{current.subtitle}</p>

              {/* Body */}
              <p className="text-sm text-white/50 leading-relaxed mb-6">{current.body}</p>

              {/* CTA */}
              <button onClick={next}
                className="w-full py-4 rounded-2xl font-black text-base transition-all active:scale-95 flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${current.color}, ${current.color}cc)`, color: '#000', boxShadow: `0 0 20px ${current.color}40` }}>
                {isLast ? '✓ Verstanden – Los geht\'s!' : (
                  <>Weiter <ChevronRight className="w-4 h-4" /></>
                )}
              </button>

              {/* Skip link */}
              {!isLast && (
                <button onClick={handleClose} className="w-full mt-3 text-xs text-white/20 hover:text-white/40 transition-colors">
                  Überspringen
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

export { STORAGE_KEY };