let audioCtx = null;

const getCtx = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
};

export const playCollect = () => {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  } catch {}
};

export const playCollision = () => {
  try {
    const ctx = getCtx();
    // Noise burst
    const bufferSize = Math.floor(ctx.sampleRate * 0.35);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.7, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(ctx.currentTime);
    // Low thump
    const osc = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.25);
    gain2.gain.setValueAtTime(0.5, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain2);
    gain2.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {}
};

export const playDimensionWarp = () => {
  try {
    const ctx = getCtx();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    // Sweep up
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(150, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.5);
    osc1.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 1.1);
    osc1.connect(gain);
    // Harmonics
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(300, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.4);
    osc2.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.9);
    osc2.connect(gain);
    gain.gain.setValueAtTime(0.0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.1);
    osc1.start(ctx.currentTime); osc1.stop(ctx.currentTime + 1.1);
    osc2.start(ctx.currentTime); osc2.stop(ctx.currentTime + 0.9);
  } catch {}
};