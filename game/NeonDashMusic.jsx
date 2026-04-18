/**
 * NeonDash Dynamic Music Engine
 * Procedurally generates a layered synthwave soundtrack that
 * reacts to player speed (speedMult) and combo streak.
 *
 * Layers (additive):
 *  1. Kick drum        – always on
 *  2. Bass line        – always on, pitch follows chord
 *  3. Arp melody       – unlocks at speed ≥ 1.3
 *  4. Pad / chord wash – unlocks at combo ≥ 3
 *  5. Lead synth       – unlocks at speed ≥ 1.8 OR combo ≥ 6
 *  6. Hi-hat           – unlocks at speed ≥ 1.5
 */

let ctx = null;
let masterGain = null;
let compressor = null;
let running = false;
let schedulerTimer = null;

// ── Timing ──────────────────────────────────────────────────────
const BPM_BASE = 128;
let bpm = BPM_BASE;
let nextNoteTime = 0;
let currentStep = 0;
const STEPS = 16; // 16th-note sequencer
const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD = 0.1; // seconds

// ── State (updated from game loop) ──────────────────────────────
let _speedMult = 1.0;
let _combo = 0;
let _proMode = false;
let _dimension = false;

// ── Chord progression (I–VI–IV–V in D minor = Dm, Bb, F, A) ──
const CHORDS = [
  [293.66, 349.23, 440.00],   // Dm  (D4, F4, A4)
  [233.08, 293.66, 349.23],   // Bb3 (Bb3, D4, F4)
  [174.61, 220.00, 261.63],   // F3  (F3, A3, C4)
  [220.00, 277.18, 329.63],   // A3  (A3, C#4, E4)
];
// Bass root notes (one octave down from chord root)
const BASS_ROOTS = [146.83, 116.54, 87.31, 110.00];
// Arp pattern (index into chord notes: 0,1,2,1,0,2,1,0 …)
const ARP_PAT = [0, 2, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 1, 0, 2];
let chordIdx = 0;

// ── Gain nodes per layer ─────────────────────────────────────────
let kickGain, bassGain, arpGain, padGain, leadGain, hihatGain;

// ── Utils ────────────────────────────────────────────────────────
const getCtx = () => {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -14;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.0;
    masterGain.connect(compressor);
    compressor.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
};

const lerpGain = (node, target, time, ramp = 0.15) => {
  node.gain.cancelScheduledValues(time);
  node.gain.setValueAtTime(node.gain.value, time);
  node.gain.linearRampToValueAtTime(target, time + ramp);
};

// ── Synth helpers ────────────────────────────────────────────────
const makeOsc = (type, freq, when) => {
  const c = ctx;
  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, when);
  return osc;
};

const playKick = (when) => {
  const c = ctx;
  const g = c.createGain();
  g.connect(kickGain);
  g.gain.setValueAtTime(1.0, when);
  g.gain.exponentialRampToValueAtTime(0.001, when + 0.35);
  const osc = c.createOscillator();
  osc.frequency.setValueAtTime(150, when);
  osc.frequency.exponentialRampToValueAtTime(35, when + 0.25);
  osc.connect(g);
  osc.start(when); osc.stop(when + 0.4);

  // Click transient
  const bufSize = Math.floor(c.sampleRate * 0.01);
  const buf = c.createBuffer(1, bufSize, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
  const src = c.createBufferSource();
  src.buffer = buf;
  const cg = c.createGain();
  cg.gain.value = 0.4;
  src.connect(cg); cg.connect(kickGain);
  src.start(when);
};

const playSnare = (when) => {
  const c = ctx;
  const bufSize = Math.floor(c.sampleRate * 0.18);
  const buf = c.createBuffer(1, bufSize, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const g = c.createGain();
  g.gain.setValueAtTime(0.45, when);
  g.gain.exponentialRampToValueAtTime(0.001, when + 0.18);
  src.connect(g); g.connect(kickGain);
  src.start(when);
};

const playHihat = (when, open = false) => {
  const c = ctx;
  const bufSize = Math.floor(c.sampleRate * (open ? 0.12 : 0.04));
  const buf = c.createBuffer(1, bufSize, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  // High-pass filter
  const hp = c.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 8000;
  const g = c.createGain();
  g.gain.setValueAtTime(open ? 0.35 : 0.22, when);
  g.gain.exponentialRampToValueAtTime(0.001, when + (open ? 0.12 : 0.04));
  src.connect(hp); hp.connect(g); g.connect(hihatGain);
  src.start(when);
};

const playBassNote = (freq, when, dur) => {
  const c = ctx;
  const osc = c.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq, when);

  // Low-pass filter for warmth
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 600;
  lp.Q.value = 2;

  const g = c.createGain();
  g.gain.setValueAtTime(0.0, when);
  g.gain.linearRampToValueAtTime(0.85, when + 0.01);
  g.gain.setValueAtTime(0.75, when + dur - 0.04);
  g.gain.linearRampToValueAtTime(0.0, when + dur);

  osc.connect(lp); lp.connect(g); g.connect(bassGain);
  osc.start(when); osc.stop(when + dur + 0.01);
};

const playArpNote = (freq, when, dur) => {
  const c = ctx;

  // Square wave + detuned copy
  const osc1 = c.createOscillator();
  osc1.type = 'square';
  osc1.frequency.setValueAtTime(freq, when);
  const osc2 = c.createOscillator();
  osc2.type = 'sawtooth';
  osc2.frequency.setValueAtTime(freq * 1.005, when);

  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(3000, when);
  lp.frequency.linearRampToValueAtTime(800, when + dur);

  const g = c.createGain();
  g.gain.setValueAtTime(0.0, when);
  g.gain.linearRampToValueAtTime(0.55, when + 0.008);
  g.gain.setValueAtTime(0.45, when + dur * 0.7);
  g.gain.linearRampToValueAtTime(0.0, when + dur);

  osc1.connect(lp); osc2.connect(lp); lp.connect(g); g.connect(arpGain);
  osc1.start(when); osc1.stop(when + dur + 0.01);
  osc2.start(when); osc2.stop(when + dur + 0.01);
};

const playPadChord = (freqs, when, dur) => {
  const c = ctx;
  freqs.forEach((freq, i) => {
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, when);
    const osc2 = c.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 0.997, when);

    const g = c.createGain();
    g.gain.setValueAtTime(0.0, when);
    g.gain.linearRampToValueAtTime(0.18 - i * 0.02, when + 0.08);
    g.gain.setValueAtTime(0.14 - i * 0.015, when + dur - 0.1);
    g.gain.linearRampToValueAtTime(0.0, when + dur);

    osc.connect(g); osc2.connect(g); g.connect(padGain);
    osc.start(when); osc.stop(when + dur + 0.02);
    osc2.start(when); osc2.stop(when + dur + 0.02);
  });
};

const playLeadNote = (freq, when, dur) => {
  const c = ctx;
  const osc = c.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq * 2, when); // Lead is one octave up

  const dist = c.createWaveShaper();
  const curve = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const x = (i * 2) / 256 - 1;
    curve[i] = (Math.PI + 40) * x / (Math.PI + 40 * Math.abs(x));
  }
  dist.curve = curve;

  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(2400, when);
  lp.frequency.exponentialRampToValueAtTime(900, when + dur);

  const g = c.createGain();
  g.gain.setValueAtTime(0.0, when);
  g.gain.linearRampToValueAtTime(0.35, when + 0.02);
  g.gain.setValueAtTime(0.28, when + dur - 0.05);
  g.gain.linearRampToValueAtTime(0.0, when + dur);

  osc.connect(dist); dist.connect(lp); lp.connect(g); g.connect(leadGain);
  osc.start(when); osc.stop(when + dur + 0.01);
};

// ── Chord change every 4 bars (64 steps) ─────────────────────────
let barCount = 0;

// ── Lead melody pattern (relative to chord tones) ────────────────
const LEAD_PAT = [0, -1, 1, -1, 2, -1, 0, -1, 1, -1, 2, -1, 1, -1, 0, -1]; // -1 = rest

// ── Scheduler ────────────────────────────────────────────────────
const scheduleStep = (step, when) => {
  const c = ctx;
  const secPerStep = 60 / (bpm * 4); // 16th note duration
  const chord = CHORDS[chordIdx];
  const bassRoot = BASS_ROOTS[chordIdx];

  // Kick pattern: steps 0, 4, 8, 12
  if (step % 4 === 0) playKick(when);

  // Snare: steps 4 and 12
  if (step === 4 || step === 12) playSnare(when);

  // Bass: 8th notes on 0,2,4,6,8,10,12,14
  if (step % 2 === 0) {
    const bassFreq = step === 6 || step === 14 ? bassRoot * 1.5 : bassRoot;
    playBassNote(bassFreq, when, secPerStep * 1.8);
  }

  // Hi-hat: depends on speed
  const hihatOn = _speedMult >= 1.5;
  if (hihatOn) {
    playHihat(when, step % 8 === 6);
  }

  // Arp: depends on speed
  if (_speedMult >= 1.3) {
    const arpNote = ARP_PAT[step];
    const freq = chord[arpNote % chord.length] * (_speedMult >= 1.8 ? 2 : 1);
    playArpNote(freq, when, secPerStep * 0.85);
  }

  // Pad chord: on beat starts (every 4 steps), needs combo ≥ 3
  if (step % 4 === 0 && _combo >= 3) {
    playPadChord(chord, when, secPerStep * 4);
  }

  // Lead: speed ≥ 1.8 or combo ≥ 6
  if (_speedMult >= 1.8 || _combo >= 6) {
    const leadPat = LEAD_PAT[step];
    if (leadPat >= 0) {
      playLeadNote(chord[leadPat % chord.length], when, secPerStep * 0.75);
    }
  }

  // Advance chord every 4 bars (64 steps)
  if (step === STEPS - 1) {
    barCount++;
    if (barCount % 4 === 0) {
      chordIdx = (chordIdx + 1) % CHORDS.length;
    }
  }
};

const scheduler = () => {
  if (!ctx || !running) return;

  // Dynamically update BPM based on speed
  const targetBpm = Math.min(180, BPM_BASE + (_speedMult - 1) * 35);
  bpm += (targetBpm - bpm) * 0.05;

  while (nextNoteTime < ctx.currentTime + SCHEDULE_AHEAD) {
    scheduleStep(currentStep, nextNoteTime);
    const secPerStep = 60 / (bpm * 4);
    nextNoteTime += secPerStep;
    currentStep = (currentStep + 1) % STEPS;
  }
  schedulerTimer = setTimeout(scheduler, LOOKAHEAD_MS);
};

// ── Layer volume update (called from game loop) ──────────────────
const updateLayers = () => {
  if (!ctx || !running) return;
  const t = ctx.currentTime;

  // Master volume: fade based on dimension (eerie quiet)
  const masterTarget = _dimension ? 0.4 : 0.72;
  lerpGain(masterGain, masterTarget, t, 0.5);

  // Kick – always present
  lerpGain(kickGain, 0.85, t, 0.3);

  // Bass – always present, louder in pro mode
  lerpGain(bassGain, _proMode ? 0.75 : 0.6, t, 0.3);

  // Hi-hat – speed ≥ 1.5
  lerpGain(hihatGain, _speedMult >= 1.5 ? 0.7 : 0.0, t, 0.4);

  // Arp – speed ≥ 1.3
  lerpGain(arpGain, _speedMult >= 1.3 ? Math.min(0.9, (_speedMult - 1.3) * 2 + 0.5) : 0.0, t, 0.5);

  // Pad – combo ≥ 3
  lerpGain(padGain, _combo >= 3 ? Math.min(0.85, (_combo / 10) + 0.4) : 0.0, t, 0.6);

  // Lead – speed ≥ 1.8 or combo ≥ 6
  const leadTarget = (_speedMult >= 1.8 || _combo >= 6) ? Math.min(0.9, (_combo / 8) * 0.5 + 0.5) : 0.0;
  lerpGain(leadGain, leadTarget, t, 0.7);
};

// ── Public API ───────────────────────────────────────────────────

export const startMusic = () => {
  try {
    const c = getCtx();
    if (running) return;
    running = true;

    // Create layer gain nodes
    kickGain   = c.createGain(); kickGain.gain.value   = 0.0; kickGain.connect(masterGain);
    bassGain   = c.createGain(); bassGain.gain.value   = 0.0; bassGain.connect(masterGain);
    arpGain    = c.createGain(); arpGain.gain.value    = 0.0; arpGain.connect(masterGain);
    padGain    = c.createGain(); padGain.gain.value    = 0.0; padGain.connect(masterGain);
    leadGain   = c.createGain(); leadGain.gain.value   = 0.0; leadGain.connect(masterGain);
    hihatGain  = c.createGain(); hihatGain.gain.value  = 0.0; hihatGain.connect(masterGain);

    // Reset sequencer
    currentStep = 0;
    barCount = 0;
    chordIdx = 0;
    bpm = BPM_BASE;
    nextNoteTime = c.currentTime + 0.05;

    // Fade master in
    masterGain.gain.setValueAtTime(0, c.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.72, c.currentTime + 1.5);

    // Kick starts immediately
    lerpGain(kickGain, 0.85, c.currentTime, 0.3);
    lerpGain(bassGain, 0.6,  c.currentTime, 0.5);

    scheduler();
  } catch(e) { console.warn('NeonDashMusic startMusic error:', e); }
};

export const stopMusic = () => {
  try {
    running = false;
    clearTimeout(schedulerTimer);
    if (masterGain && ctx) {
      masterGain.gain.cancelScheduledValues(ctx.currentTime);
      masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.0, ctx.currentTime + 0.8);
    }
    // Disconnect all layers after fade
    setTimeout(() => {
      try {
        [kickGain, bassGain, arpGain, padGain, leadGain, hihatGain].forEach(g => {
          if (g) g.disconnect();
        });
        kickGain = bassGain = arpGain = padGain = leadGain = hihatGain = null;
      } catch {}
    }, 1000);
  } catch(e) {}
};

/**
 * Call this every frame from the game loop to keep layers in sync.
 * @param {number} speedMult  – current game speed multiplier
 * @param {number} combo      – current combo streak
 * @param {boolean} proMode   – whether pro mode is active
 * @param {boolean} dimension – whether inside a dimension
 */
export const updateMusic = (speedMult, combo, proMode = false, dimension = false) => {
  _speedMult = speedMult;
  _combo = combo;
  _proMode = proMode;
  _dimension = dimension;
  // Throttle layer updates to ~10 fps to save CPU
  if (ctx && running && Math.random() < 0.17) updateLayers();
};