/**
 * Draws the player ship on the canvas with skin-specific detailed shapes.
 * Called from the NeonDash game loop.
 */
export function drawPlayer(ctx, p, state) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate((state.targetX - p.x) * 0.05);

  if (state.skinId === 'echo') {
    ctx.shadowBlur = 35; ctx.shadowColor = '#06b6d4';
    ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
    ctx.beginPath(); ctx.arc(0, 0, p.size + 12, 0, Math.PI * 2); ctx.fill();
    const grad = ctx.createLinearGradient(-p.size, p.size, p.size, -p.size);
    grad.addColorStop(0, '#a855f7'); grad.addColorStop(0.5, '#06b6d4'); grad.addColorStop(1, '#c084fc');
    ctx.fillStyle = grad; ctx.shadowBlur = 25; ctx.shadowColor = '#a855f7';
    ctx.beginPath(); ctx.moveTo(0, -p.size - 2); ctx.lineTo(p.size + 3, p.size + 2); ctx.lineTo(-p.size - 3, p.size + 2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; ctx.shadowBlur = 15; ctx.shadowColor = '#06b6d4';
    ctx.beginPath(); ctx.arc(0, -p.size * 0.3, p.size * 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 2; ctx.shadowBlur = 12; ctx.shadowColor = '#06b6d4';
    ctx.beginPath(); ctx.moveTo(0, -p.size); ctx.lineTo(p.size * 0.6, p.size * 0.4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -p.size); ctx.lineTo(-p.size * 0.6, p.size * 0.4); ctx.stroke();
  } else {
    const pPm = state.perfMode;
    const sid = state.skinId || 'default';
    const skinC = state.tempSkinColor || state.skinColor || '#fff';
    const skinG = state.tempSkinColor || state.skinGlow || '#06b6d4';
    const ps2 = p.size;

    // Shield ring
    if (state.activePowerups?.shield) {
      ctx.shadowBlur = pPm ? 12 : 30; ctx.shadowColor = '#3b82f6';
      ctx.strokeStyle = '#60a5fa'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 0, ps2 + 8, 0, Math.PI * 2); ctx.stroke();
    }

    ctx.shadowBlur = pPm ? 10 : 22; ctx.shadowColor = skinG;

    if (pPm) {
      ctx.fillStyle = skinC;
      ctx.beginPath(); ctx.moveTo(0, -ps2); ctx.lineTo(ps2, ps2); ctx.lineTo(-ps2, ps2); ctx.closePath(); ctx.fill();
    } else if (sid === 'fire') {
      ctx.fillStyle = skinC;
      ctx.beginPath(); ctx.moveTo(0,-ps2); ctx.lineTo(ps2*0.75,ps2*0.5); ctx.lineTo(ps2*0.35,ps2*0.15); ctx.lineTo(ps2*0.5,ps2*0.75); ctx.lineTo(0,ps2*0.4); ctx.lineTo(-ps2*0.5,ps2*0.75); ctx.lineTo(-ps2*0.35,ps2*0.15); ctx.lineTo(-ps2*0.75,ps2*0.5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fde047'; ctx.shadowBlur = 10; ctx.shadowColor = '#fbbf24';
      ctx.beginPath(); ctx.ellipse(0,-ps2*0.2,ps2*0.15,ps2*0.22,0,0,Math.PI*2); ctx.fill();
    } else if (sid === 'gold') {
      ctx.fillStyle = '#ca8a04';
      ctx.beginPath(); ctx.moveTo(-ps2*0.3,-ps2*0.1); ctx.lineTo(-ps2*1.0,ps2*0.6); ctx.lineTo(-ps2*0.6,ps2*0.4); ctx.lineTo(-ps2*0.3,ps2*0.3); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(ps2*0.3,-ps2*0.1); ctx.lineTo(ps2*1.0,ps2*0.6); ctx.lineTo(ps2*0.6,ps2*0.4); ctx.lineTo(ps2*0.3,ps2*0.3); ctx.closePath(); ctx.fill();
      ctx.fillStyle = skinC; ctx.shadowColor = '#eab308';
      ctx.beginPath(); ctx.moveTo(0,-ps2); ctx.lineTo(ps2*0.4,ps2*0.55); ctx.lineTo(0,ps2*0.3); ctx.lineTo(-ps2*0.4,ps2*0.55); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fef9c3'; ctx.shadowBlur = 12; ctx.shadowColor = '#fbbf24';
      ctx.beginPath(); ctx.moveTo(0,-ps2*0.45); ctx.lineTo(ps2*0.12,-ps2*0.1); ctx.lineTo(0,ps2*0.05); ctx.lineTo(-ps2*0.12,-ps2*0.1); ctx.closePath(); ctx.fill();
    } else if (sid === 'neon') {
      ctx.fillStyle = skinC;
      ctx.beginPath(); ctx.moveTo(0,-ps2*1.1); ctx.lineTo(ps2*0.5,ps2*0.3); ctx.lineTo(ps2*0.25,ps2*0.15); ctx.lineTo(ps2*0.2,ps2*0.75); ctx.lineTo(0,ps2*0.5); ctx.lineTo(-ps2*0.2,ps2*0.75); ctx.lineTo(-ps2*0.25,ps2*0.15); ctx.lineTo(-ps2*0.5,ps2*0.3); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#f0abfc'; ctx.lineWidth = 1.5; ctx.shadowBlur = 10; ctx.shadowColor = '#f0abfc';
      ctx.beginPath(); ctx.moveTo(0,-ps2*0.9); ctx.lineTo(0,ps2*0.4); ctx.stroke();
    } else if (sid === 'cyber') {
      ctx.fillStyle = skinC;
      ctx.beginPath(); ctx.moveTo(0,-ps2); ctx.lineTo(ps2*0.5,-ps2*0.2); ctx.lineTo(ps2*0.7,ps2*0.5); ctx.lineTo(ps2*0.3,ps2*0.7); ctx.lineTo(-ps2*0.3,ps2*0.7); ctx.lineTo(-ps2*0.7,ps2*0.5); ctx.lineTo(-ps2*0.5,-ps2*0.2); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 1.5; ctx.shadowBlur = 8; ctx.shadowColor = '#06b6d4';
      ctx.beginPath(); ctx.moveTo(-ps2*0.3,ps2*0.2); ctx.lineTo(ps2*0.3,ps2*0.2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,-ps2*0.7); ctx.lineTo(0,-ps2*0.1); ctx.stroke();
      ctx.fillStyle = '#4ade80'; ctx.shadowBlur = 12; ctx.shadowColor = '#22c55e';
      ctx.beginPath(); ctx.rect(-ps2*0.12,-ps2*0.5,ps2*0.24,ps2*0.35); ctx.fill();
    } else if (sid === 'void') {
      ctx.strokeStyle = 'rgba(168,85,247,0.3)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0,0,ps2+5,0,Math.PI*2); ctx.stroke();
      ctx.fillStyle = skinC;
      ctx.beginPath(); ctx.moveTo(0,-ps2); ctx.lineTo(ps2*0.55,ps2*0.6); ctx.lineTo(0,ps2*0.25); ctx.lineTo(-ps2*0.55,ps2*0.6); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(196,181,253,0.9)'; ctx.shadowBlur = 16; ctx.shadowColor = '#a855f7';
      ctx.beginPath(); ctx.ellipse(0,-ps2*0.15,ps2*0.14,ps2*0.26,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#3b0764'; ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.ellipse(0,-ps2*0.15,ps2*0.07,ps2*0.13,0,0,Math.PI*2); ctx.fill();
    } else if (sid === 'ice') {
      ctx.fillStyle = skinC;
      ctx.beginPath(); ctx.moveTo(0,-ps2); ctx.lineTo(ps2*0.4,-ps2*0.2); ctx.lineTo(ps2*0.9,ps2*0.3); ctx.lineTo(ps2*0.5,ps2*0.6); ctx.lineTo(ps2*0.2,ps2*0.3); ctx.lineTo(0,ps2*0.5); ctx.lineTo(-ps2*0.2,ps2*0.3); ctx.lineTo(-ps2*0.5,ps2*0.6); ctx.lineTo(-ps2*0.9,ps2*0.3); ctx.lineTo(-ps2*0.4,-ps2*0.2); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(0,-ps2); ctx.lineTo(ps2*0.4,-ps2*0.2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,-ps2); ctx.lineTo(-ps2*0.4,-ps2*0.2); ctx.stroke();
    } else if (sid === 'cosmic') {
      ctx.fillStyle = skinC;
      ctx.beginPath(); ctx.moveTo(0,-ps2); ctx.bezierCurveTo(ps2*0.7,-ps2*0.5,ps2*0.8,ps2*0.2,ps2*0.4,ps2*0.7); ctx.lineTo(0,ps2*0.4); ctx.lineTo(-ps2*0.4,ps2*0.7); ctx.bezierCurveTo(-ps2*0.8,ps2*0.2,-ps2*0.7,-ps2*0.5,0,-ps2); ctx.fill();
      ctx.fillStyle = '#818cf8'; ctx.shadowBlur = 8; ctx.shadowColor = '#818cf8';
      for (const [ox,oy] of [[ps2*0.55,ps2*0.1],[-ps2*0.55,ps2*0.1]]) { ctx.beginPath(); ctx.ellipse(ox,oy,ps2*0.14,ps2*0.24,0.3,0,Math.PI*2); ctx.fill(); }
      const cg = ctx.createRadialGradient(0,-ps2*0.25,0,0,-ps2*0.25,ps2*0.22);
      cg.addColorStop(0,'#f0f9ff'); cg.addColorStop(0.4,'#818cf8'); cg.addColorStop(1,'#1e3a8a');
      ctx.fillStyle = cg; ctx.shadowBlur = 16; ctx.shadowColor = '#3b82f6';
      ctx.beginPath(); ctx.ellipse(0,-ps2*0.25,ps2*0.18,ps2*0.22,0,0,Math.PI*2); ctx.fill();
    } else if (sid === 'shadow') {
      ctx.fillStyle = skinC;
      ctx.beginPath(); ctx.moveTo(0,-ps2*1.05); ctx.lineTo(ps2*0.35,-ps2*0.3); ctx.lineTo(ps2*0.8,ps2*0.45); ctx.lineTo(ps2*0.4,ps2*0.35); ctx.lineTo(ps2*0.25,ps2*0.7); ctx.lineTo(0,ps2*0.45); ctx.lineTo(-ps2*0.25,ps2*0.7); ctx.lineTo(-ps2*0.4,ps2*0.35); ctx.lineTo(-ps2*0.8,ps2*0.45); ctx.lineTo(-ps2*0.35,-ps2*0.3); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(156,163,175,0.35)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-ps2*0.6,ps2*0.3); ctx.lineTo(ps2*0.6,ps2*0.3); ctx.stroke();
    } else if (sid === 'lightning') {
      ctx.fillStyle = skinC;
      ctx.beginPath(); ctx.moveTo(0,-ps2*1.1); ctx.lineTo(ps2*0.3,-ps2*0.1); ctx.lineTo(ps2*0.7,0); ctx.lineTo(ps2*0.2,ps2*0.1); ctx.lineTo(ps2*0.45,ps2*0.8); ctx.lineTo(0,ps2*0.3); ctx.lineTo(-ps2*0.45,ps2*0.8); ctx.lineTo(-ps2*0.2,ps2*0.1); ctx.lineTo(-ps2*0.7,0); ctx.lineTo(-ps2*0.3,-ps2*0.1); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fef08a'; ctx.shadowBlur = 14; ctx.shadowColor = '#fde047';
      ctx.beginPath(); ctx.ellipse(0,-ps2*0.3,ps2*0.12,ps2*0.22,0,0,Math.PI*2); ctx.fill();
    } else if (sid === 's2_phantom') {
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = skinC;
      ctx.beginPath(); ctx.moveTo(0,-ps2*1.05); ctx.lineTo(ps2*0.6,-ps2*0.1); ctx.lineTo(ps2*0.85,ps2*0.55); ctx.lineTo(ps2*0.3,ps2*0.4); ctx.lineTo(ps2*0.2,ps2*0.75); ctx.lineTo(0,ps2*0.5); ctx.lineTo(-ps2*0.2,ps2*0.75); ctx.lineTo(-ps2*0.3,ps2*0.4); ctx.lineTo(-ps2*0.85,ps2*0.55); ctx.lineTo(-ps2*0.6,-ps2*0.1); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(200,210,220,0.3)'; ctx.lineWidth = 1;
      for (const ix of [-ps2*0.3,0,ps2*0.3]) { ctx.beginPath(); ctx.moveTo(ix,-ps2*0.8); ctx.lineTo(ix*1.5,ps2*0.4); ctx.stroke(); }
      ctx.fillStyle = '#e2e8f0'; ctx.shadowBlur = 14; ctx.shadowColor = '#94a3b8';
      ctx.beginPath(); ctx.ellipse(0,-ps2*0.25,ps2*0.13,ps2*0.22,0,0,Math.PI*2); ctx.fill();
    } else if (sid === 's2_hellfire') {
      ctx.fillStyle = '#7f1d1d';
      for (const [ox,oa] of [[-ps2*0.7,-0.15],[ps2*0.7,0.15]]) { ctx.save(); ctx.translate(ox,ps2*0.1); ctx.rotate(oa); ctx.fillRect(-ps2*0.1,-ps2*0.35,ps2*0.2,ps2*0.5); ctx.restore(); }
      ctx.fillStyle = skinC; ctx.shadowColor = '#f97316';
      ctx.beginPath(); ctx.moveTo(0,-ps2); ctx.lineTo(ps2*0.5,-ps2*0.1); ctx.lineTo(ps2*0.75,ps2*0.5); ctx.lineTo(ps2*0.4,ps2*0.35); ctx.lineTo(ps2*0.35,ps2*0.75); ctx.lineTo(0,ps2*0.45); ctx.lineTo(-ps2*0.35,ps2*0.75); ctx.lineTo(-ps2*0.4,ps2*0.35); ctx.lineTo(-ps2*0.75,ps2*0.5); ctx.lineTo(-ps2*0.5,-ps2*0.1); ctx.closePath(); ctx.fill();
      const hlg = ctx.createRadialGradient(0,-ps2*0.2,0,0,-ps2*0.2,ps2*0.22);
      hlg.addColorStop(0,'#fde047'); hlg.addColorStop(0.5,'#f97316'); hlg.addColorStop(1,'#7f1d1d');
      ctx.fillStyle = hlg; ctx.shadowBlur = 16; ctx.shadowColor = '#ef4444';
      ctx.beginPath(); ctx.ellipse(0,-ps2*0.2,ps2*0.16,ps2*0.24,0,0,Math.PI*2); ctx.fill();
    } else if (sid === 's2_ghost') {
      ctx.fillStyle = skinC;
      ctx.beginPath(); ctx.moveTo(0,-ps2); ctx.lineTo(ps2*0.45,ps2*0.45); ctx.lineTo(ps2*0.2,ps2*0.25); ctx.lineTo(ps2*0.3,ps2*0.75); ctx.lineTo(0,ps2*0.5); ctx.lineTo(-ps2*0.3,ps2*0.75); ctx.lineTo(-ps2*0.2,ps2*0.25); ctx.lineTo(-ps2*0.45,ps2*0.45); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(165,243,252,0.3)'; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.arc(0,0,ps2*0.9,0,Math.PI*2); ctx.stroke();
      ctx.fillStyle = 'rgba(224,242,254,0.95)'; ctx.shadowBlur = 18; ctx.shadowColor = '#a5f3fc';
      ctx.beginPath(); ctx.ellipse(0,-ps2*0.22,ps2*0.12,ps2*0.22,0,0,Math.PI*2); ctx.fill();
    } else if (sid === 's2_titan') {
      ctx.fillStyle = '#1e1b4b';
      for (const [ox,ow] of [[-ps2*0.62,-1],[ps2*0.62,1]]) { ctx.beginPath(); ctx.moveTo(ox,-ps2*0.3); ctx.lineTo(ox+ow*ps2*0.38,-ps2*0.05); ctx.lineTo(ox+ow*ps2*0.4,ps2*0.5); ctx.lineTo(ox,ps2*0.35); ctx.closePath(); ctx.fill(); }
      ctx.fillStyle = skinC; ctx.shadowColor = '#22d3ee';
      ctx.beginPath(); ctx.moveTo(0,-ps2); ctx.lineTo(ps2*0.55,-ps2*0.25); ctx.lineTo(ps2*0.6,ps2*0.6); ctx.lineTo(ps2*0.35,ps2*0.75); ctx.lineTo(0,ps2*0.55); ctx.lineTo(-ps2*0.35,ps2*0.75); ctx.lineTo(-ps2*0.6,ps2*0.6); ctx.lineTo(-ps2*0.55,-ps2*0.25); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 1.5; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.moveTo(-ps2*0.35,ps2*0.05); ctx.lineTo(ps2*0.35,ps2*0.05); ctx.stroke();
      const tg2 = ctx.createLinearGradient(0,-ps2*0.5,0,ps2*0.1);
      tg2.addColorStop(0,'#22d3ee'); tg2.addColorStop(1,'#1e1b4b');
      ctx.fillStyle = tg2; ctx.shadowBlur = 18; ctx.shadowColor = '#22d3ee';
      ctx.beginPath(); ctx.rect(-ps2*0.15,-ps2*0.55,ps2*0.3,ps2*0.45); ctx.fill();
    } else if (sid === 's2_apex') {
      ctx.fillStyle = '#ca8a04';
      ctx.beginPath(); ctx.moveTo(0,-ps2*1.25); ctx.lineTo(ps2*0.15,-ps2*0.85); ctx.lineTo(ps2*0.35,-ps2*1.05); ctx.lineTo(ps2*0.5,-ps2*0.65); ctx.lineTo(ps2*0.7,-ps2*0.8); ctx.lineTo(ps2*0.75,-ps2*0.3); ctx.lineTo(ps2*0.8,ps2*0.5); ctx.lineTo(ps2*0.35,ps2*0.7); ctx.lineTo(0,ps2*0.5); ctx.lineTo(-ps2*0.35,ps2*0.7); ctx.lineTo(-ps2*0.8,ps2*0.5); ctx.lineTo(-ps2*0.75,-ps2*0.3); ctx.lineTo(-ps2*0.7,-ps2*0.8); ctx.lineTo(-ps2*0.5,-ps2*0.65); ctx.lineTo(-ps2*0.35,-ps2*1.05); ctx.lineTo(-ps2*0.15,-ps2*0.85); ctx.closePath(); ctx.fill();
      const ag = ctx.createLinearGradient(-ps2,ps2,ps2,-ps2);
      ag.addColorStop(0,'#92400e'); ag.addColorStop(0.35,skinC); ag.addColorStop(0.65,'#fef3c7'); ag.addColorStop(1,skinC);
      ctx.fillStyle = ag;
      ctx.beginPath(); ctx.moveTo(0,-ps2*0.9); ctx.lineTo(ps2*0.65,-ps2*0.2); ctx.lineTo(ps2*0.7,ps2*0.5); ctx.lineTo(ps2*0.3,ps2*0.65); ctx.lineTo(0,ps2*0.45); ctx.lineTo(-ps2*0.3,ps2*0.65); ctx.lineTo(-ps2*0.7,ps2*0.5); ctx.lineTo(-ps2*0.65,-ps2*0.2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fef9c3'; ctx.shadowBlur = 20; ctx.shadowColor = '#fbbf24';
      ctx.beginPath(); ctx.moveTo(0,-ps2*0.6); ctx.lineTo(ps2*0.16,-ps2*0.1); ctx.lineTo(0,ps2*0.12); ctx.lineTo(-ps2*0.16,-ps2*0.1); ctx.closePath(); ctx.fill();
    } else if (sid === 's2_void_titan_v2') {
      // Gottgleicher Void Titan V2 — massives, dunkles Raumschiff mit lila/cyan Energie-Ringen
      ctx.fillStyle = '#0f0020';
      // Outer wings
      for (const [ox,ow] of [[-ps2*0.7,-1],[ps2*0.7,1]]) {
        ctx.beginPath(); ctx.moveTo(ox,-ps2*0.4); ctx.lineTo(ox+ow*ps2*0.55,-ps2*0.1); ctx.lineTo(ox+ow*ps2*0.6,ps2*0.55); ctx.lineTo(ox,ps2*0.4); ctx.closePath(); ctx.fill();
      }
      ctx.fillStyle = skinC; ctx.shadowColor = '#a855f7';
      ctx.beginPath(); ctx.moveTo(0,-ps2*1.1); ctx.lineTo(ps2*0.5,-ps2*0.35); ctx.lineTo(ps2*0.65,ps2*0.65); ctx.lineTo(ps2*0.35,ps2*0.8); ctx.lineTo(0,ps2*0.6); ctx.lineTo(-ps2*0.35,ps2*0.8); ctx.lineTo(-ps2*0.65,ps2*0.65); ctx.lineTo(-ps2*0.5,-ps2*0.35); ctx.closePath(); ctx.fill();
      // Energy rings
      ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 2; ctx.shadowBlur = 16; ctx.shadowColor = '#a855f7';
      ctx.beginPath(); ctx.ellipse(0, ps2*0.1, ps2*0.5, ps2*0.12, 0, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 1.5; ctx.shadowColor = '#06b6d4';
      ctx.beginPath(); ctx.ellipse(0, ps2*0.3, ps2*0.35, ps2*0.08, 0, 0, Math.PI*2); ctx.stroke();
      // Void core cockpit
      const vtg = ctx.createRadialGradient(0,-ps2*0.3,0,0,-ps2*0.3,ps2*0.22);
      vtg.addColorStop(0,'#ffffff'); vtg.addColorStop(0.3,'#a855f7'); vtg.addColorStop(1,'#1e0040');
      ctx.fillStyle = vtg; ctx.shadowBlur = 22; ctx.shadowColor = '#a855f7';
      ctx.beginPath(); ctx.ellipse(0,-ps2*0.3,ps2*0.17,ps2*0.25,0,0,Math.PI*2); ctx.fill();
    } else if (sid === 'rainbow') {
      ctx.fillStyle = skinC;
      ctx.beginPath(); ctx.moveTo(0,-ps2); ctx.lineTo(ps2*0.65,ps2*0.7); ctx.lineTo(0,ps2*0.35); ctx.lineTo(-ps2*0.65,ps2*0.7); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.shadowBlur = 12; ctx.shadowColor = '#ffffff';
      ctx.beginPath(); ctx.ellipse(0,-ps2*0.2,ps2*0.18,ps2*0.3,0,0,Math.PI*2); ctx.fill();
    } else {
      // Default: detailed fighter with cockpit
      ctx.fillStyle = skinC;
      ctx.beginPath(); ctx.moveTo(0,-ps2); ctx.lineTo(ps2*0.65,ps2*0.7); ctx.lineTo(0,ps2*0.35); ctx.lineTo(-ps2*0.65,ps2*0.7); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(6,182,212,0.85)'; ctx.shadowBlur = 8; ctx.shadowColor = '#06b6d4';
      ctx.beginPath(); ctx.ellipse(0,-ps2*0.2,ps2*0.18,ps2*0.3,0,0,Math.PI*2); ctx.fill();
    }
  }

  ctx.restore();
}