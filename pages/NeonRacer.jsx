import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronLeft, Trophy, Play, RotateCcw, Coins, Star, ShoppingCart, Zap, Target, BarChart2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

const LANES = [-5, 0, 5];
const ROAD_WIDTH = 14;
const TILE_LEN = 50;
const TILE_COUNT = 12;
const TOTAL_LEN = TILE_COUNT * TILE_LEN;

const CAR_SKINS = [
  { id: 'default', name: 'Cyber Racer',   color: 0x06b6d4, accent: 0x0e7490, cost: 0,     emoji: '🏎️' },
  { id: 'fire',    name: 'Fire Breather', color: 0xef4444, accent: 0xf97316, cost: 8000,  emoji: '🔥' },
  { id: 'gold',    name: 'Golden Glory',  color: 0xfbbf24, accent: 0xeab308, cost: 15000, emoji: '✨' },
  { id: 'neon',    name: 'Neon Ghost',    color: 0xec4899, accent: 0xa855f7, cost: 12000, emoji: '💜' },
  { id: 'cyber',   name: 'Matrix',        color: 0x22c55e, accent: 0x16a34a, cost: 10000, emoji: '💚' },
  { id: 'void',    name: 'Void Walker',   color: 0xa855f7, accent: 0x7c3aed, cost: 20000, emoji: '🌀' },
];

const UPGRADES = [
  { id: 'tokenBoost', name: 'Token Booster', desc: '+15% Tokens pro Stufe',       icon: '🪙', maxLevel: 5, baseCost: 5000,  costMult: 2.5 },
  { id: 'autoShield', name: 'Start Schild',  desc: 'Starte mit Schutzschild',     icon: '🛡️', maxLevel: 3, baseCost: 12000, costMult: 3   },
  { id: 'coinMagnet', name: 'Münzmagnet',    desc: 'Größerer Münz-Radius',        icon: '🧲', maxLevel: 4, baseCost: 8000,  costMult: 2.8 },
  { id: 'scoreBoost', name: 'Score Boost',   desc: '+10% Score pro Stufe',        icon: '📈', maxLevel: 5, baseCost: 7000,  costMult: 2.6 },
  { id: 'rareSpawn',  name: 'Leichtmodus',   desc: 'Weniger Hindernisse',         icon: '🌊', maxLevel: 3, baseCost: 15000, costMult: 3.2 },
  { id: 'nitroCap',   name: 'Nitro Tank',    desc: '+20% Nitro-Kapazität/Stufe',  icon: '⚡', maxLevel: 3, baseCost: 9000,  costMult: 2.7 },
];

const PU_TYPES = [
  { id: 'shield',    color: 0x3b82f6, hex: '#3b82f6', emoji: '🛡️', label: 'SCHILD',    duration: 8000 },
  { id: 'magnet',    color: 0xa855f7, hex: '#a855f7', emoji: '🧲', label: 'MAGNET',    duration: 6000 },
  { id: 'slowmo',    color: 0x06b6d4, hex: '#06b6d4', emoji: '⏱️', label: 'ZEITLUPE',  duration: 5000 },
  { id: 'nitroFill', color: 0xf97316, hex: '#f97316', emoji: '🔥', label: 'NITRO+',    duration: 0    },
  { id: 'x2score',   color: 0xfbbf24, hex: '#fbbf24', emoji: '×2', label: '×2 SCORE',  duration: 7000 },
];

// ── Daily Challenges ──
const ALL_CHALLENGES = [
  { id: 0,  type: 'score',   target: 2000,  desc: 'Erreiche 2.000 Punkte',         reward: 300  },
  { id: 1,  type: 'coins',   target: 15,    desc: 'Sammle 15 Münzen',               reward: 250  },
  { id: 2,  type: 'survive', target: 60,    desc: 'Überlebe 60 Sekunden',           reward: 400  },
  { id: 3,  type: 'combo',   target: 8,     desc: 'Erreiche 8er Kombo',             reward: 350  },
  { id: 4,  type: 'score',   target: 5000,  desc: 'Erreiche 5.000 Punkte',          reward: 600  },
  { id: 5,  type: 'coins',   target: 30,    desc: 'Sammle 30 Münzen',               reward: 500  },
  { id: 6,  type: 'survive', target: 120,   desc: 'Überlebe 2 Minuten',             reward: 800  },
  { id: 7,  type: 'nitro',   target: 5,     desc: 'Benutze Nitro 5x',               reward: 300  },
  { id: 8,  type: 'score',   target: 10000, desc: 'Erreiche 10.000 Punkte',         reward: 1200 },
  { id: 9,  type: 'combo',   target: 15,    desc: 'Erreiche 15er Kombo',            reward: 700  },
  { id: 10, type: 'coins',   target: 50,    desc: 'Sammle 50 Münzen',               reward: 900  },
  { id: 11, type: 'survive', target: 180,   desc: 'Überlebe 3 Minuten – MEISTER!',  reward: 1500 },
];
const getTodayKey = () => new Date().toISOString().split('T')[0];
const getTodayChallenge = () => {
  const seed = getTodayKey().replace(/-/g, '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return ALL_CHALLENGES[seed % ALL_CHALLENGES.length];
};

function buildCar(color, accent, scene, addLight = true) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0a0a18, metalness: 0.7, roughness: 0.4 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.65, 4.6), bodyMat);
  body.position.y = 0.65;
  g.add(body);
  const cabinMat = new THREE.MeshStandardMaterial({ color, metalness: 0.8, roughness: 0.3, emissive: color, emissiveIntensity: 0.2 });
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.55, 2.4), cabinMat);
  cabin.position.set(0, 1.2, 0.2);
  g.add(cabin);
  const glowMat = new THREE.MeshBasicMaterial({ color: accent });
  [[0, 0.28, 2.35, 2.5, 0.05, 0.08],[0, 0.28, -2.35, 2.5, 0.05, 0.08],[-1.2, 0.28, 0, 0.08, 0.05, 4.7],[1.2, 0.28, 0, 0.08, 0.05, 4.7]].forEach(([x, y, z, w, h, d]) => {
    const s = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), glowMat);
    s.position.set(x, y, z); g.add(s);
  });
  const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  [-0.65, 0.65].forEach(xOff => {
    const hl = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.05, 8), hlMat);
    hl.rotation.x = Math.PI / 2; hl.position.set(xOff, 0.75, 2.35); g.add(hl);
  });
  const tlMat = new THREE.MeshBasicMaterial({ color: 0xff2222 });
  [-0.65, 0.65].forEach(xOff => {
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.04), tlMat);
    tl.position.set(xOff, 0.75, -2.32); g.add(tl);
  });
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
  const rimMat = new THREE.MeshBasicMaterial({ color: accent });
  [[-1.15,0.38,1.4],[1.15,0.38,1.4],[-1.15,0.38,-1.4],[1.15,0.38,-1.4]].forEach(([wx,wy,wz]) => {
    const wg = new THREE.Group();
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.28, 12), wheelMat);
    wheel.rotation.z = Math.PI / 2; wg.add(wheel);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.07, 6, 12), rimMat);
    rim.rotation.z = Math.PI / 2; wg.add(rim);
    wg.position.set(wx, wy, wz); wg.userData.isWheel = true; g.add(wg);
  });
  if (addLight) { const light = new THREE.PointLight(color, 1.5, 6); light.position.set(0, 1.5, 0); g.add(light); }
  scene.add(g);
  return g;
}

export default function NeonRacer() {
  const mountRef   = useRef(null);
  const gsRef      = useRef(null);
  const nitroRef   = useRef(false);

  const [gameState, setGameState]       = useState('menu');
  const [score, setScore]               = useState(0);
  const [highScore, setHighScore]       = useState(() => parseInt(localStorage.getItem('neonRacerHS') || '0'));
  const [tokensEarned, setTokensEarned] = useState(0);
  const [nitroPercent, setNitroPercent] = useState(100);
  const [nitroCooling, setNitroCooling] = useState(false);
  const [nitroOn, setNitroOn]           = useState(false);
  const [combo, setCombo]               = useState(0);
  const [activePuIds, setActivePuIds]   = useState([]);
  const [countdown, setCountdown]       = useState(null);
  const [speedPct, setSpeedPct]         = useState(0);
  const [dangerLane, setDangerLane]     = useState(false);
  const [scorePopups, setScorePopups]   = useState([]);

  const [lbTab, setLbTab]           = useState('alltime'); // alltime | weekly

  const todayChallenge = useMemo(() => getTodayChallenge(), []);
  const [challengeProgress, setChallengeProgress] = useState(() => parseInt(localStorage.getItem(`nr_dc_${getTodayKey()}_prog`) || '0'));
  const [challengeDone, setChallengeDone]         = useState(() => localStorage.getItem(`nr_dc_${getTodayKey()}_done`) === 'true');

  const [racerStats, setRacerStats] = useState(() => {
    try { return JSON.parse(localStorage.getItem('neonRacerStats') || '{}'); } catch { return {}; }
  });

  const [user, setUser] = useState(() => {
    try { const u = localStorage.getItem('app_user'); return u && u !== 'undefined' ? JSON.parse(u) : null; } catch { return null; }
  });
  const [racerData, setRacerData] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('app_user') || 'null');
      if (u?.neon_racer_data) return u.neon_racer_data;
      return JSON.parse(localStorage.getItem('neonRacerData') || '{}');
    } catch { return {}; }
  });

  const getUL         = (id) => racerData.upgrades?.[id] || 0;
  const getUC         = (upg) => Math.floor(upg.baseCost * Math.pow(upg.costMult, getUL(upg.id)));
  const getOwnedSkins = () => racerData.owned_skins || ['default'];
  const getActiveSkin = () => racerData.active_skin || 'default';

  const saveData = async (newData) => {
    setRacerData(newData);
    localStorage.setItem('neonRacerData', JSON.stringify(newData));
    if (user) {
      try {
        const updated = await base44.entities.AppUser.update(user.id, { neon_racer_data: newData });
        localStorage.setItem('app_user', JSON.stringify(updated));
        setUser(updated);
        window.dispatchEvent(new Event('user-updated'));
      } catch(e) { console.error(e); }
    }
  };

  const buyUpgrade = async (upg) => {
    const level = getUL(upg.id);
    if (level >= upg.maxLevel) return;
    const cost = getUC(upg);
    if (!user || (user.tokens || 0) < cost) { toast.error('Nicht genug Tokens!'); return; }
    const newData = { ...racerData, upgrades: { ...(racerData.upgrades || {}), [upg.id]: level + 1 } };
    try {
      const updated = await base44.entities.AppUser.update(user.id, { tokens: user.tokens - cost, neon_racer_data: newData });
      localStorage.setItem('app_user', JSON.stringify(updated));
      setUser(updated); setRacerData(newData);
      toast.success(`${upg.name} verbessert!`);
      window.dispatchEvent(new Event('user-updated'));
    } catch { toast.error('Fehler beim Kauf'); }
  };

  const buySkin = async (skin) => {
    const owned = getOwnedSkins();
    if (owned.includes(skin.id)) { await saveData({ ...racerData, active_skin: skin.id }); toast.success(`${skin.name} ausgerüstet!`); return; }
    if (!user || (user.tokens || 0) < skin.cost) { toast.error('Nicht genug Tokens!'); return; }
    const newData = { ...racerData, owned_skins: [...owned, skin.id], active_skin: skin.id };
    try {
      const updated = await base44.entities.AppUser.update(user.id, { tokens: user.tokens - skin.cost, neon_racer_data: newData });
      localStorage.setItem('app_user', JSON.stringify(updated));
      setUser(updated); setRacerData(newData);
      toast.success(`${skin.name} gekauft!`);
      window.dispatchEvent(new Event('user-updated'));
    } catch { toast.error('Fehler beim Kauf'); }
  };

  const { data: leaderboard = [], isLoading: lbLoading } = useQuery({
    queryKey: ['neonRacerLB', lbTab],
    queryFn: async () => {
      let scores;
      if (lbTab === 'weekly') {
        const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7); weekStart.setHours(0,0,0,0);
        const all = await base44.entities.GameScore.filter({ game_type: 'neon_racer' }, '-score', 500);
        scores = (all || []).filter(s => new Date(s.created_date) >= weekStart);
      } else {
        scores = await base44.entities.GameScore.filter({ game_type: 'neon_racer' }, '-score', 200);
      }
      const unique = []; const seen = new Set();
      for (const s of (scores || [])) {
        if (!seen.has(s.player_username)) { seen.add(s.player_username); unique.push(s); if (unique.length >= 10) break; }
      }
      return unique;
    },
    enabled: gameState === 'leaderboard'
  });

  // ─── THREE.JS SETUP ───────────────────────────────────────────────
  useEffect(() => {
    if (gameState !== 'playing') return;
    const container = mountRef.current;
    if (!container) return;

    const W = container.clientWidth, H = container.clientHeight;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020010, 0.015);
    scene.background = new THREE.Color(0x020010);

    const camera = new THREE.PerspectiveCamera(70, W / H, 0.1, 300);
    camera.position.set(0, 7, -14);
    camera.lookAt(0, 1, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x111133, 1.0));
    const dirLight = new THREE.DirectionalLight(0x4444ff, 0.4);
    dirLight.position.set(0, 20, -5);
    scene.add(dirLight);

    [0x06b6d4, 0xa855f7, 0xec4899, 0x22c55e].forEach((c, i) => {
      const pl = new THREE.PointLight(c, 1.2, 25);
      pl.position.set((i % 2 === 0 ? -10 : 10), 4, i * 12 + 10);
      scene.add(pl);
    });

    const scrollObjs = [];

    // Road
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x05050f, roughness: 0.2, metalness: 0.8 });
    for (let i = 0; i < TILE_COUNT; i++) {
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_WIDTH, TILE_LEN), roadMat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(0, 0, i * TILE_LEN - 20);
      scene.add(mesh);
      scrollObjs.push({ mesh, recycleAdd: TOTAL_LEN, recycleAt: -TILE_LEN - 20 });
    }

    // Floor Grid
    const floorGrid = new THREE.GridHelper(300, 60, 0x06b6d4, 0x1e3a8a);
    floorGrid.position.y = -0.5;
    scene.add(floorGrid);
    scrollObjs.push({ mesh: floorGrid, recycleAdd: 0, recycleAt: 0, isGrid: true });

    // Lane markings
    const laneMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const edgeMat = new THREE.MeshBasicMaterial({ color: 0xa855f7 });
    for (let i = 0; i < TILE_COUNT; i++) {
      for (let lane = 0; lane < 2; lane++) {
        const lx = lane === 0 ? -2.5 : 2.5;
        for (let d = 0; d < 4; d++) {
          const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 5), laneMat);
          dash.rotation.x = -Math.PI / 2;
          dash.position.set(lx, 0.01, i * TILE_LEN - 20 + d * 12);
          scene.add(dash);
          scrollObjs.push({ mesh: dash, recycleAdd: TOTAL_LEN, recycleAt: -TILE_LEN - 20 });
        }
      }
      for (let side = 0; side < 2; side++) {
        const ex = side === 0 ? -ROAD_WIDTH / 2 + 0.12 : ROAD_WIDTH / 2 - 0.12;
        const edge = new THREE.Mesh(new THREE.PlaneGeometry(0.25, TILE_LEN), edgeMat);
        edge.rotation.x = -Math.PI / 2;
        edge.position.set(ex, 0.01, i * TILE_LEN - 20);
        scene.add(edge);
        scrollObjs.push({ mesh: edge, recycleAdd: TOTAL_LEN, recycleAt: -TILE_LEN - 20 });
      }
    }

    // ── BOOST STRIPS (golden road strips that refill nitro) ──
    const boostStrips = [85, 185, 285, 385].map(z => {
      const mat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.55 });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_WIDTH * 0.85, 1.6), mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(0, 0.02, z);
      scene.add(mesh);
      scrollObjs.push({ mesh, recycleAdd: TOTAL_LEN, recycleAt: -35 });
      return { mesh, mat };
    });

    // Buildings
    const BUILD_COUNT = 20;
    const BUILD_SPACING = TOTAL_LEN / BUILD_COUNT;
    const bColorOpts = [0x0a0a20, 0x0a0014, 0x000a14];
    const wColorOpts = [0x06b6d4, 0xa855f7, 0xec4899, 0x22c55e, 0xfbbf24];
    for (let i = 0; i < BUILD_COUNT; i++) {
      for (let side = 0; side < 2; side++) {
        const bh = 8 + Math.random() * 28;
        const bw = 4 + Math.random() * 5;
        const bd = 5 + Math.random() * 5;
        const bMat = new THREE.MeshStandardMaterial({ color: bColorOpts[Math.floor(Math.random() * bColorOpts.length)], roughness: 0.8 });
        const building = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), bMat);
        const bx = side === 0 ? -(ROAD_WIDTH / 2 + bw / 2 + 1 + Math.random() * 2) : (ROAD_WIDTH / 2 + bw / 2 + 1 + Math.random() * 2);
        building.position.set(bx, bh / 2, i * BUILD_SPACING - 20);
        scene.add(building);
        scrollObjs.push({ mesh: building, recycleAdd: TOTAL_LEN, recycleAt: -(bh / 2) - 60 });
        const wc = wColorOpts[Math.floor(Math.random() * wColorOpts.length)];
        const wMat = new THREE.MeshBasicMaterial({ color: wc });
        for (let wi = 0; wi < Math.floor(bh / 3); wi++) {
          if (Math.random() > 0.55) continue;
          const win = new THREE.Mesh(new THREE.PlaneGeometry(0.5 + Math.random() * 0.5, 0.35), wMat);
          const faceZ = side === 0 ? bd / 2 + 0.01 : -(bd / 2 + 0.01);
          win.position.set(Math.random() * (bw - 1) - (bw / 2 - 0.5), -bh / 2 + 1 + wi * 2.5, faceZ);
          if (side === 1) win.rotation.y = Math.PI;
          building.add(win);
        }
      }
    }

    // Stars
    const starPos = new Float32Array(1200 * 3);
    for (let i = 0; i < 1200; i++) {
      starPos[i*3] = (Math.random() - 0.5) * 400;
      starPos[i*3+1] = 15 + Math.random() * 80;
      starPos[i*3+2] = Math.random() * 500;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starPoints = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.25 }));
    scene.add(starPoints);

    // Player car
    const skinData = CAR_SKINS.find(s => s.id === getActiveSkin()) || CAR_SKINS[0];
    const playerCar = buildCar(skinData.color, skinData.accent, scene, true);
    playerCar.position.set(0, 0, 0);

    // Shield ring
    const shieldRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.0, 0.1, 8, 32),
      new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.8 })
    );
    shieldRing.rotation.x = Math.PI / 2;
    shieldRing.visible = false;
    scene.add(shieldRing);

    // ── EXHAUST TRAIL PARTICLES ──
    const exhaustParticles = Array.from({ length: 28 }, () => {
      const mat = new THREE.MeshBasicMaterial({ color: skinData.accent, transparent: true, opacity: 0 });
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.1, 4, 4), mat);
      mesh.visible = false;
      scene.add(mesh);
      return { mesh, mat, life: 0 };
    });

    // ── POWER-UP ORB POOL ──
    const puOrbs = Array.from({ length: 6 }, () => {
      const group = new THREE.Group();
      group.visible = false;
      scene.add(group);
      return { group, active: false, ptype: null };
    });

    const rampMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 0.3, wireframe: true });
    const ramps = Array.from({ length: 5 }, () => {
      const g = new THREE.Group();
      const shape = new THREE.Shape();
      shape.moveTo(-2, 0);
      shape.lineTo(2, 0);
      shape.lineTo(2, 2.5);
      const extrudeSettings = { depth: 4, bevelEnabled: false };
      const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geom.center();
      const m = new THREE.Mesh(geom, rampMat);
      m.rotation.y = -Math.PI / 2;
      m.position.y = 1.25;
      g.add(m);
      g.visible = false;
      g.userData = { active: false };
      scene.add(g);
      return g;
    });

    const barrierMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xfacc15, emissiveIntensity: 0.2 });
    const barriers = Array.from({ length: 8 }, () => {
      const g = new THREE.Group();
      const m = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2, 1), barrierMat);
      m.position.y = 1;
      
      const stripesMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const stripe1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.1, 1.1), stripesMat);
      stripe1.position.set(-1, 1, 0);
      const stripe2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.1, 1.1), stripesMat);
      stripe2.position.set(1, 1, 0);
      
      g.add(m, stripe1, stripe2);
      g.visible = false;
      g.userData = { active: false, dodged: false };
      scene.add(g);
      return g;
    });

    const activatePuOrb = (orb, ptype) => {
      while (orb.group.children.length) orb.group.remove(orb.group.children[0]);
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.55, 10, 10),
        new THREE.MeshBasicMaterial({ color: ptype.color, transparent: true, opacity: 0.85 })
      );
      const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.07, 6, 24), new THREE.MeshBasicMaterial({ color: ptype.color }));
      const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.05, 6, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 }));
      ring2.rotation.x = Math.PI / 3;
      const glow = new THREE.PointLight(ptype.color, 2.5, 6);
      orb.group.add(sphere, ring1, ring2, glow);
      orb.group.visible = true;
      orb.active = true;
      orb.ptype = ptype;
    };

    // Obstacle pool
    const obstacles = Array.from({ length: 14 }, () => {
      const car = buildCar(0xe11d48, 0xfb7185, scene, false);
      car.visible = false;
      car.userData = { active: false, extraSpeed: 0, dodged: false };
      return car;
    });

    // Coin pool
    const coinMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const coins = Array.from({ length: 24 }, () => {
      const c = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.15, 8, 16), coinMat);
      c.visible = false;
      c.userData = { active: false };
      scene.add(c);
      return c;
    });

    // Nitro road glow light
    const nitroRoadLight = new THREE.PointLight(skinData.color, 0, 14);
    scene.add(nitroRoadLight);

    const shieldLvl    = getUL('autoShield');
    const nitroCapLvl  = getUL('nitroCap');
    const maxNitro     = 100 + nitroCapLvl * 20;

    const gs = {
      scene, camera, renderer,
      scrollObjs, obstacles, coins, boostStrips, exhaustParticles, puOrbs,
      playerCar, shieldRing, nitroRoadLight, starPoints,
      targetLane: 1, laneX: 0,
      speed: 0.35, frames: 0,
      score: 0, coinsCollected: 0,
      shieldActive: shieldLvl > 0,
      shieldExpiry: shieldLvl > 0 ? Date.now() + shieldLvl * 8000 : 0,
      carY: 0, carVy: 0, isJumping: false,
      gameOver: false,
      lastObsSpawn: 0, lastCoinSpawn: 0, lastPuSpawn: 0, exhaustIdx: 0,
      animId: null,
      coinMagnetRadius: 2.5 + getUL('coinMagnet') * 0.7,
      scoreMult: 1 + getUL('scoreBoost') * 0.1,
      tokenMult: 1 + getUL('tokenBoost') * 0.15,
      spawnFactor: 1 - getUL('rareSpawn') * 0.15,
      // Nitro
      nitro: maxNitro, maxNitro,
      nitroCooldown: false, nitroActive: false,
      // Combo
      combo: 0, comboTimer: 0,
      // Power-ups
      activePowerups: {},
      // Camera shake
      cameraShake: 0,
      // Milestones
      lastMilestone: 0,
      // Stats tracking
      nitroUses: 0, maxComboEver: 0,
      wasNitroActive: false,
    };
    gsRef.current = gs;
    if (shieldLvl > 0) shieldRing.visible = true;

    const onResize = () => {
      const w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    const doGameOver = async (finalGs) => {
      const finalScore = Math.floor(finalGs.score);
      setScore(finalScore);
      setGameState('gameover');
      const prevHS = parseInt(localStorage.getItem('neonRacerHS') || '0');
      if (finalScore > prevHS) { setHighScore(finalScore); localStorage.setItem('neonRacerHS', finalScore.toString()); }
      const earned = Math.floor((finalScore / 1.5 + 500) * finalGs.tokenMult);
      setTokensEarned(earned);

      // ── Stats tracking ──
      const timeSec = Math.floor(finalGs.frames / 60);
      const prevStats = JSON.parse(localStorage.getItem('neonRacerStats') || '{}');
      const updStats = {
        totalGames: (prevStats.totalGames || 0) + 1,
        totalCoins: (prevStats.totalCoins || 0) + finalGs.coinsCollected,
        totalNitroUses: (prevStats.totalNitroUses || 0) + (finalGs.nitroUses || 0),
        bestCombo: Math.max(prevStats.bestCombo || 0, finalGs.maxComboEver || 0),
        totalTimeSec: (prevStats.totalTimeSec || 0) + timeSec,
        highScore: Math.max(prevStats.highScore || 0, finalScore),
      };
      localStorage.setItem('neonRacerStats', JSON.stringify(updStats));
      setRacerStats(updStats);

      // ── Daily Challenge ──
      const ch = getTodayChallenge();
      const todayDone = localStorage.getItem(`nr_dc_${getTodayKey()}_done`) === 'true';
      const runVal = ch.type === 'score' ? finalScore : ch.type === 'coins' ? finalGs.coinsCollected : ch.type === 'survive' ? timeSec : ch.type === 'combo' ? (finalGs.maxComboEver || 0) : (finalGs.nitroUses || 0);
      const prevProg = parseInt(localStorage.getItem(`nr_dc_${getTodayKey()}_prog`) || '0');
      const newProg = Math.max(prevProg, runVal);
      localStorage.setItem(`nr_dc_${getTodayKey()}_prog`, newProg.toString());
      setChallengeProgress(newProg);
      if (!todayDone && newProg >= ch.target) {
        localStorage.setItem(`nr_dc_${getTodayKey()}_done`, 'true');
        setChallengeDone(true);
        toast.success(`🎯 Tages-Challenge abgeschlossen! +${ch.reward.toLocaleString()} Tokens!`);
        if (user) {
          try {
            const cu = JSON.parse(localStorage.getItem('app_user') || 'null') || user;
            const { awardXpAndTokens } = await import('@/components/battlepass/xpUtils');
            await awardXpAndTokens(cu, ch.reward / 3, ch.reward, 'Neon Racer Daily Challenge');
          } catch(e) { console.error(e); }
        }
      }

      if (user) {
        try {
          await base44.entities.GameScore.create({ player_username: user.username, player_id: user.id, score: finalScore, level: finalGs.coinsCollected, coins_collected: finalGs.coinsCollected, game_type: 'neon_racer' });
          const cu = JSON.parse(localStorage.getItem('app_user') || 'null') || user;
          const { awardXpAndTokens } = await import('@/components/battlepass/xpUtils');
          await awardXpAndTokens(cu, Math.floor(finalScore / 5), earned, 'Neon Racer');
        } catch(e) { console.error(e); }
      }
    };

    // ── GAME LOOP ──
    const loop = () => {
      if (!gsRef.current || gs.gameOver) return;
      gs.animId = requestAnimationFrame(loop);
      gs.frames++;

      const now = Date.now();

      // ── NITRO ──
      const isNitroHeld = nitroRef.current;
      if (!gs.nitroCooldown && isNitroHeld && gs.nitro > 0) {
        gs.nitroActive = true;
        gs.nitro = Math.max(0, gs.nitro - 0.75);
        if (gs.nitro <= 0) { gs.nitroCooldown = true; gs.nitroActive = false; }
      } else {
        gs.nitroActive = false;
        if (gs.nitroCooldown) {
          gs.nitro = Math.min(gs.maxNitro, gs.nitro + 0.28);
          if (gs.nitro >= gs.maxNitro * 0.25) gs.nitroCooldown = false;
        } else {
          gs.nitro = Math.min(gs.maxNitro, gs.nitro + 0.12);
        }
      }
      if (gs.frames % 4 === 0) {
        setNitroPercent(Math.round((gs.nitro / gs.maxNitro) * 100));
        setNitroOn(gs.nitroActive);
        setNitroCooling(gs.nitroCooldown);
      }

      // Camera FOV animation for nitro
      const targetFov = gs.nitroActive ? 82 : 70;
      camera.fov += (targetFov - camera.fov) * 0.07;
      camera.updateProjectionMatrix();

      // Nitro road glow
      nitroRoadLight.intensity = gs.nitroActive ? 3.5 + Math.sin(gs.frames * 0.35) * 0.8 : 0;
      nitroRoadLight.position.set(playerCar.position.x, 0.5, playerCar.position.z - 4);

      // Track nitro uses
      if (gs.nitroActive && !gs.wasNitroActive) gs.nitroUses = (gs.nitroUses || 0) + 1;
      gs.wasNitroActive = gs.nitroActive;
      if (gs.combo > (gs.maxComboEver || 0)) gs.maxComboEver = gs.combo;

      // Active power-up check
      const slowActive = !!gs.activePowerups?.slowmo && now < gs.activePowerups.slowmo;
      const magnetActive = !!gs.activePowerups?.magnet && now < gs.activePowerups.magnet;
      const shieldPuActive = !!gs.activePowerups?.shield && now < gs.activePowerups.shield;
      const x2scoreActive = !!gs.activePowerups?.x2score && now < gs.activePowerups.x2score;
      let puChanged = false;
      for (const key of Object.keys(gs.activePowerups)) {
        if (now > gs.activePowerups[key]) { delete gs.activePowerups[key]; puChanged = true; }
      }
      if (puChanged && gs.frames % 3 === 0) setActivePuIds(Object.keys(gs.activePowerups));

      const speedFactor = slowActive ? 0.45 : 1.0;
      const nitroBoost  = gs.nitroActive ? 1.55 : 1.0;

      gs.speed = Math.min(0.85, 0.35 + gs.frames * 0.000045);
      const ws = gs.speed * 0.55 * speedFactor * nitroBoost;

      // ── COMBO ──
      if (gs.comboTimer > 0) {
        gs.comboTimer--;
        if (gs.comboTimer <= 0) { gs.combo = 0; if (gs.frames % 4 === 0) setCombo(0); }
      }
      const comboMult = gs.combo >= 10 ? 3.0 : gs.combo >= 6 ? 2.0 : gs.combo >= 3 ? 1.5 : 1.0;

      // ── PLAYER CAR Y LOGIC ──
      gs.carVy -= 0.02; // gravity
      gs.carY += gs.carVy;
      
      let onRamp = false;
      for (const ramp of ramps) {
        if (!ramp.userData.active) continue;
        ramp.position.z -= ws * speedFactor;
        if (ramp.position.z < -25) { ramp.visible = false; ramp.userData.active = false; continue; }
        
        const dx = Math.abs(ramp.position.x - playerCar.position.x);
        const dz = ramp.position.z - playerCar.position.z;
        if (dx < 2.0 && dz > -2.0 && dz < 2.0) {
            onRamp = true;
            const rampProgress = (2.0 - dz) / 4.0; // 0 to 1
            const expectedY = rampProgress * 2.5; 
            if (gs.carY < expectedY) {
                gs.carY = expectedY;
                gs.carVy = 0;
            }
            if (dz < -1.5 && gs.carVy <= 0) { 
                gs.carVy = 0.28 * (ws / 0.5); // launch
            }
        }
      }
      
      if (gs.carY < 0 && !onRamp) {
        gs.carY = 0;
        gs.carVy = 0;
        gs.isJumping = false;
      } else if (gs.carY > 0) {
        gs.isJumping = true;
      }
      playerCar.position.y = gs.carY;

      // Smooth lane + tilt
      const targetX = LANES[gs.targetLane];
      gs.laneX += (targetX - gs.laneX) * 0.1;
      playerCar.position.x = gs.laneX;
      playerCar.rotation.z = (targetX - gs.laneX) * 0.04;
      
      playerCar.rotation.x += (gs.nitroActive ? -0.04 : 0) - playerCar.rotation.x * 0.1;
      if (gs.isJumping) {
        playerCar.rotation.x = -gs.carVy * 0.4;
      }

      // Camera follow + shake
      camera.position.x += (gs.laneX - camera.position.x) * 0.07;
      let camTargetY = 7 + gs.carY * 0.3;
      camera.position.y += (camTargetY - camera.position.y) * 0.1;
      if (gs.cameraShake > 0) {
        camera.position.x += (Math.random() - 0.5) * gs.cameraShake * 0.3;
        camera.position.y += (Math.random() - 0.5) * gs.cameraShake * 0.12;
        gs.cameraShake = Math.max(0, gs.cameraShake - 0.18);
      }

      // Shield ring
      if (gs.shieldActive && now > gs.shieldExpiry) { gs.shieldActive = false; shieldRing.visible = false; }
      if (gs.shieldActive) {
        shieldRing.position.set(playerCar.position.x, gs.carY + 0.8, playerCar.position.z);
        shieldRing.rotation.z += 0.05;
      }
      // Power-up shield ring (second visual if both active)
      if (shieldPuActive) {
        shieldRing.visible = true;
        shieldRing.material.color.setHex(0x60a5fa);
        shieldRing.position.set(playerCar.position.x, gs.carY + 0.8, playerCar.position.z);
        shieldRing.rotation.z += 0.06;
      } else if (!gs.shieldActive) {
        shieldRing.visible = false;
      }

      // Score
      gs.score += gs.speed * gs.scoreMult * comboMult * 0.3 * (gs.nitroActive ? 1.25 : 1.0) * (x2scoreActive ? 2.0 : 1.0);
      if (gs.frames % 6 === 0) setScore(Math.floor(gs.score));
      // Speed display
      if (gs.frames % 10 === 0) setSpeedPct(Math.round(((gs.speed - 0.35) / (0.85 - 0.35)) * 100));

      // Milestones
      const milestone = Math.floor(gs.score / 1000) * 1000;
      if (milestone > 0 && milestone > gs.lastMilestone && milestone <= 15000) {
        gs.lastMilestone = milestone;
        toast.success(`🔥 ${milestone.toLocaleString()} Punkte!`, { duration: 1400 });
      }

      // Scroll world
      for (const obj of scrollObjs) {
        if (obj.isGrid) {
            obj.mesh.position.z -= ws;
            if (obj.mesh.position.z < -5) obj.mesh.position.z += 5;
        } else {
            obj.mesh.position.z -= ws;
            if (obj.mesh.position.z < obj.recycleAt) obj.mesh.position.z += obj.recycleAdd;
        }
      }

      // ── EXHAUST TRAIL ──
      if (gs.frames % (gs.nitroActive ? 1 : 3) === 0) {
        const ep = exhaustParticles[gs.exhaustIdx % exhaustParticles.length];
        gs.exhaustIdx++;
        ep.mesh.position.set(
          playerCar.position.x + (Math.random() - 0.5) * 1.1,
          gs.carY + 0.28 + Math.random() * 0.25,
          playerCar.position.z - 2.5
        );
        ep.life = gs.nitroActive ? 1.6 : 1.0;
        ep.mesh.scale.setScalar(gs.nitroActive ? 1.9 : 1.0);
        ep.mesh.visible = true;
      }
      for (const ep of exhaustParticles) {
        if (ep.life <= 0) continue;
        ep.life -= 0.055;
        ep.mat.opacity = Math.max(0, ep.life * 0.65);
        ep.mesh.position.z -= ws * 0.15;
        ep.mesh.position.y += 0.014;
        ep.mesh.scale.multiplyScalar(0.96);
        if (ep.life <= 0) ep.mesh.visible = false;
      }

      // ── BOOST STRIPS ──
      for (const bs of boostStrips) {
        bs.mat.opacity = 0.35 + Math.sin(gs.frames * 0.14 + bs.mesh.position.z * 0.01) * 0.2;
        const dz = Math.abs(bs.mesh.position.z - playerCar.position.z);
        if (dz < 2.0 && Math.abs(bs.mesh.position.x - playerCar.position.x) < ROAD_WIDTH / 2) {
          gs.nitro = Math.min(gs.maxNitro, gs.nitro + 30);
          gs.nitroCooldown = false;
          gs.cameraShake = 0.5;
          bs.mesh.position.z += TOTAL_LEN;
          toast('⚡ BOOST!', { duration: 800, style: { background: '#fbbf24', color: '#000', fontWeight: 'bold' } });
        }
      }

      // ── SPAWN HAZARDS ──
      const hazardInterval = Math.max(45, Math.floor((140 - gs.frames * 0.025) * gs.spawnFactor));
      if (gs.frames - gs.lastObsSpawn > hazardInterval) {
        gs.lastObsSpawn = gs.frames;
        const lane = Math.floor(Math.random() * 3);
        const r = Math.random();
        
        if (r < 0.2) {
          const free = ramps.find(o => !o.userData.active);
          if (free) {
            free.position.set(LANES[lane], 0, 100);
            free.userData.active = true;
            free.visible = true;
          }
        } else if (r < 0.4) {
          const free = barriers.find(o => !o.userData.active);
          if (free) {
            free.position.set(LANES[lane], 0, 100);
            free.userData.active = true;
            free.userData.dodged = false;
            free.visible = true;
          }
        } else {
          const free = obstacles.find(o => !o.userData.active);
          if (free) {
            free.position.set(LANES[lane], 0, 100);
            free.userData.active = true;
            free.userData.extraSpeed = 0.2 + Math.random() * 0.15;
            free.userData.dodged = false;
            free.userData.movingDir = Math.random() < 0.35 ? (Math.random() > 0.5 ? 1 : -1) : 0;
            free.visible = true;
          }
        }
      }

      // ── UPDATE OBSTACLES ──
      for (const obs of obstacles) {
        if (!obs.userData.active) continue;
        
        if (obs.userData.movingDir) {
            obs.position.x += obs.userData.movingDir * 0.08 * speedFactor;
            if (obs.position.x > 6) obs.userData.movingDir = -1;
            else if (obs.position.x < -6) obs.userData.movingDir = 1;
            obs.rotation.y = -obs.userData.movingDir * 0.15;
        } else {
            obs.rotation.y = 0;
        }
        
        obs.position.z -= (ws + obs.userData.extraSpeed) * speedFactor;
        obs.children.forEach(c => { if (c.userData.isWheel) c.rotation.x += (ws + obs.userData.extraSpeed) * 0.4; });

        if (obs.position.z < -25) { obs.visible = false; obs.userData.active = false; continue; }

        // Combo: obstacle dodged
        if (!obs.userData.dodged && obs.position.z < playerCar.position.z - 5) {
          obs.userData.dodged = true;
          gs.combo++;
          gs.comboTimer = 200;
          if (gs.frames % 3 === 0) setCombo(gs.combo);
        }

        // Danger warning: obstacle in same lane approaching
        const sameLane = Math.abs(obs.position.x - playerCar.position.x) < 2.5;
        const approaching = obs.position.z > playerCar.position.z && obs.position.z < playerCar.position.z + 28;
        if (gs.frames % 8 === 0) setDangerLane(sameLane && approaching);

        const dx = Math.abs(obs.position.x - playerCar.position.x);
        const dz = Math.abs(obs.position.z - playerCar.position.z);
        if (dx < 2.8 && dz < 3.5 && gs.carY < 1.5) {
          if (shieldPuActive) {
            delete gs.activePowerups.shield;
            setActivePuIds(Object.keys(gs.activePowerups));
            obs.visible = false; obs.userData.active = false;
            gs.cameraShake = 1.0;
          } else if (gs.shieldActive) {
            gs.shieldActive = false; gs.shieldExpiry = 0; shieldRing.visible = false;
            obs.visible = false; obs.userData.active = false;
            gs.cameraShake = 0.9;
          } else {
            gs.combo = 0; gs.comboTimer = 0;
            gs.gameOver = true;
            doGameOver(gs);
            return;
          }
        }
      }

      // ── UPDATE BARRIERS ──
      for (const bar of barriers) {
        if (!bar.userData.active) continue;
        bar.position.z -= ws * speedFactor;
        if (bar.position.z < -25) { bar.visible = false; bar.userData.active = false; continue; }

        if (!bar.userData.dodged && bar.position.z < playerCar.position.z - 3) {
          bar.userData.dodged = true;
          gs.combo++; gs.comboTimer = 200;
          if (gs.frames % 3 === 0) setCombo(gs.combo);
        }

        const dx = Math.abs(bar.position.x - playerCar.position.x);
        const dz = Math.abs(bar.position.z - playerCar.position.z);
        if (dx < 2.2 && dz < 2.0 && gs.carY < 1.8) {
          if (shieldPuActive) {
            delete gs.activePowerups.shield; setActivePuIds(Object.keys(gs.activePowerups));
            bar.visible = false; bar.userData.active = false; gs.cameraShake = 1.0;
          } else if (gs.shieldActive) {
            gs.shieldActive = false; gs.shieldExpiry = 0; shieldRing.visible = false;
            bar.visible = false; bar.userData.active = false; gs.cameraShake = 0.9;
          } else {
            gs.combo = 0; gs.comboTimer = 0; gs.gameOver = true;
            doGameOver(gs); return;
          }
        }
      }

      // ── SPAWN COINS ──
      const coinInterval = Math.max(30, 85 - Math.floor(gs.frames * 0.012));
      if (gs.frames - gs.lastCoinSpawn > coinInterval) {
        gs.lastCoinSpawn = gs.frames;
        const free = coins.find(c => !c.userData.active);
        if (free) {
          free.position.set(LANES[Math.floor(Math.random() * 3)], 0.9, 90);
          free.userData.active = true;
          free.visible = true;
        }
      }

      // ── UPDATE COINS ──
      for (const coin of coins) {
        if (!coin.userData.active) continue;
        coin.position.z -= ws * speedFactor;
        coin.rotation.y += 0.06 * nitroBoost;
        coin.position.y = 0.9 + Math.sin(gs.frames * 0.08 + coin.position.x) * 0.22;
        if (coin.position.z < -25) { coin.visible = false; coin.userData.active = false; continue; }

        const magnetRange = gs.coinMagnetRadius + (magnetActive ? 6 : 0) + 3.5;
        const mx = playerCar.position.x - coin.position.x;
        const mz = playerCar.position.z - coin.position.z;
        if (Math.sqrt(mx*mx + mz*mz) < magnetRange) { coin.position.x += mx * 0.18; coin.position.z += mz * 0.18; }

        if (Math.abs(coin.position.x - playerCar.position.x) < 1.8 && Math.abs(coin.position.z - playerCar.position.z) < 2.5 && Math.abs(coin.position.y - (gs.carY + 0.5)) < 3.0) {
          coin.visible = false; coin.userData.active = false;
          const coinPts = Math.floor(120 * gs.scoreMult * comboMult * (x2scoreActive ? 2.0 : 1.0));
          gs.score += coinPts;
          gs.coinsCollected++;
          gs.combo++; gs.comboTimer = 200;
          if (gs.frames % 3 === 0) setCombo(gs.combo);
          // Score popup
          setScorePopups(prev => [...prev.slice(-4), { id: Date.now(), pts: coinPts, combo: comboMult }]);
          setTimeout(() => setScorePopups(prev => prev.slice(1)), 900);
        }
      }

      // ── SPAWN POWER-UP ORBS ──
      const puInterval = Math.max(180, 420 - Math.floor(gs.frames * 0.015));
      if (gs.frames - gs.lastPuSpawn > puInterval) {
        gs.lastPuSpawn = gs.frames;
        const freeOrb = puOrbs.find(o => !o.active);
        if (freeOrb) {
          const ptype = PU_TYPES[Math.floor(Math.random() * PU_TYPES.length)];
          activatePuOrb(freeOrb, ptype);
          freeOrb.group.position.set(LANES[Math.floor(Math.random() * 3)], 1.2, 100);
        }
      }

      // ── UPDATE POWER-UP ORBS ──
      for (const orb of puOrbs) {
        if (!orb.active) continue;
        orb.group.position.z -= ws * speedFactor;
        orb.group.rotation.y += 0.045;
        if (orb.group.children[1]) orb.group.children[1].rotation.y += 0.07;
        if (orb.group.children[2]) orb.group.children[2].rotation.z += 0.05;
        orb.group.position.y = 1.2 + Math.sin(gs.frames * 0.065 + orb.group.position.x) * 0.32;

        if (orb.group.position.z < -25) { orb.group.visible = false; orb.active = false; continue; }

        const odx = Math.abs(orb.group.position.x - playerCar.position.x);
        const odz = Math.abs(orb.group.position.z - playerCar.position.z);
        if (odx < 2.2 && odz < 2.5 && Math.abs(orb.group.position.y - (gs.carY + 0.5)) < 3.0) {
          orb.group.visible = false; orb.active = false;
          const ptype = orb.ptype;
          if (ptype.id === 'nitroFill') {
            gs.nitro = gs.maxNitro; gs.nitroCooldown = false;
          } else {
            gs.activePowerups[ptype.id] = now + ptype.duration;
            setActivePuIds(Object.keys(gs.activePowerups));
          }
          gs.cameraShake = 0.7;
          toast(`${ptype.emoji} ${ptype.label}`, { duration: 1400, style: { background: ptype.hex, color: '#000', fontWeight: 'bold' } });
        }
      }

      // Player wheels spin
      playerCar.children.forEach(c => { if (c.userData.isWheel) c.rotation.x += ws * 0.4; });

      // Stars subtle drift
      starPoints.rotation.y += 0.0001;

      renderer.render(scene, camera);
    };

    loop();

    return () => {
      cancelAnimationFrame(gs.animId);
      window.removeEventListener('resize', onResize);
      scene.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) { if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose()); else obj.material.dispose(); }
      });
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      gsRef.current = null;
    };
  }, [gameState]); // eslint-disable-line

  // ─── CONTROLS ────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState !== 'playing') return;
    const onKey = (e) => {
      const gs = gsRef.current; if (!gs) return;
      if (e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A') gs.targetLane = Math.min(2, gs.targetLane + 1);
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') gs.targetLane = Math.max(0, gs.targetLane - 1);
      else if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { e.preventDefault(); nitroRef.current = true; }
    };
    const onKeyUp = (e) => {
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') nitroRef.current = false;
    };
    let tx = 0, ty = 0;
    const onTS = (e) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; };
    const onTE = (e) => {
      const gs = gsRef.current; if (!gs) return;
      const diffX = e.changedTouches[0].clientX - tx;
      const diffY = e.changedTouches[0].clientY - ty;
      // Only treat as lane-change if horizontal swipe dominates
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 20) {
        if (diffX < 0) gs.targetLane = Math.min(2, gs.targetLane + 1);
        else gs.targetLane = Math.max(0, gs.targetLane - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('touchstart', onTS, { passive: true });
    window.addEventListener('touchend', onTE, { passive: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('touchstart', onTS);
      window.removeEventListener('touchend', onTE);
      nitroRef.current = false;
    };
  }, [gameState]);

  const startGame = () => {
    setScore(0); setTokensEarned(0); setNitroPercent(100);
    setCombo(0); setActivePuIds([]); setNitroOn(false); setNitroCooling(false);
    setSpeedPct(0); setDangerLane(false); setScorePopups([]);
    nitroRef.current = false;
    // Countdown before start
    setCountdown(3);
    let c = 3;
    const iv = setInterval(() => {
      c--;
      if (c <= 0) { clearInterval(iv); setCountdown(null); setGameState('playing'); }
      else setCountdown(c);
    }, 800);
  };

  const activeSkin   = CAR_SKINS.find(s => s.id === getActiveSkin()) || CAR_SKINS[0];
  const activePuInfo = activePuIds.map(id => PU_TYPES.find(p => p.id === id)).filter(Boolean);
  const comboMult    = combo >= 10 ? 3.0 : combo >= 6 ? 2.0 : combo >= 3 ? 1.5 : 1.0;
  const nitroBgColor = nitroCooling ? '#ef4444' : nitroOn ? '#f97316' : nitroPercent < 25 ? '#ef4444' : '#06b6d4';

  return (
    <div className="fixed inset-0 z-[100] bg-[#000510] overflow-hidden text-white font-sans touch-none select-none">

      {/* Countdown overlay */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div key={`cd-${countdown}`}
            initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
            <div className="text-[10rem] font-black drop-shadow-[0_0_60px_rgba(6,182,212,1)]"
              style={{ background: 'linear-gradient(90deg,#67e8f9,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {countdown}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Speed lines overlay (nitro) */}
      {gameState === 'playing' && nitroOn && (
        <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 110%, rgba(249,115,22,0.18) 0%, rgba(6,182,212,0.08) 45%, transparent 70%)' }} />
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(6,182,212,0.08) 28px, rgba(6,182,212,0.08) 29px)',
          }} />
        </div>
      )}

      {/* Back */}
      <div className="absolute top-6 left-6 z-30">
        <Link to={createPageUrl('Home')}>
          <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10 rounded-full">
            <ChevronLeft className="w-5 h-5 mr-1" /> Menü
          </Button>
        </Link>
      </div>

      {/* Canvas */}
      <div ref={mountRef} className="absolute inset-0 z-0" />

      {/* HUD */}
      {gameState === 'playing' && (
        <>
          {/* Top bar */}
          <div className="absolute top-5 inset-x-0 z-20 flex items-start justify-between px-6 pointer-events-none">
            {/* Score */}
            <div className="bg-black/50 backdrop-blur-md border border-cyan-500/20 rounded-2xl px-5 py-3 flex flex-col items-center min-w-[90px]">
              <div className="text-3xl font-black text-white drop-shadow-[0_0_12px_rgba(6,182,212,0.9)]">{score.toLocaleString()}</div>
              <div className="text-[9px] text-cyan-400/60 font-bold uppercase tracking-widest">Score</div>
            </div>

            {/* Combo */}
            <AnimatePresence>
              {combo >= 3 && (
                <motion.div key={`combo-${Math.floor(combo/3)}`}
                  initial={{ scale: 0.7, opacity: 0, y: -8 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="flex flex-col items-center bg-black/70 backdrop-blur-md rounded-2xl px-4 py-2 border"
                  style={{ borderColor: comboMult >= 3 ? '#f43f5e80' : comboMult >= 2 ? '#f9731680' : '#facc1580' }}>
                  <div className="font-black text-xl leading-none" style={{ color: comboMult >= 3 ? '#f43f5e' : comboMult >= 2 ? '#f97316' : '#facc15' }}>
                    ×{comboMult.toFixed(1)}
                  </div>
                  <div className="text-[9px] text-white/40 font-black tracking-wider mt-0.5">{combo} KOMBO</div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Best */}
            <div className="bg-black/40 backdrop-blur-md border border-yellow-500/20 rounded-2xl px-4 py-2 flex flex-col items-center min-w-[80px]">
              <div className="text-lg font-black text-yellow-400">{highScore.toLocaleString()}</div>
              <div className="text-[9px] text-yellow-400/50 font-bold uppercase tracking-widest">Rekord</div>
            </div>
          </div>

          {/* Danger flash */}
          <AnimatePresence>
            {dangerLane && (
              <motion.div key="danger"
                initial={{ opacity: 0 }} animate={{ opacity: [0, 0.35, 0] }} transition={{ duration: 0.4, repeat: Infinity }}
                className="absolute inset-0 z-[4] pointer-events-none border-4 border-red-500 rounded-none"
                style={{ boxShadow: 'inset 0 0 60px rgba(239,68,68,0.4)' }} />
            )}
          </AnimatePresence>

          {/* Score popups */}
          <div className="absolute inset-0 z-[25] pointer-events-none overflow-hidden">
            <AnimatePresence>
              {scorePopups.map(p => (
                <motion.div key={p.id}
                  initial={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
                  animate={{ opacity: 0, y: -60, scale: 1.2 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.85 }}
                  className="absolute left-1/2 font-black text-yellow-300 text-xl drop-shadow-[0_0_8px_rgba(253,224,71,0.9)]"
                  style={{ bottom: '45%' }}>
                  +{p.pts.toLocaleString()}{p.combo > 1 ? ` ×${p.combo.toFixed(1)}` : ''}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Jump indicator */}
          <AnimatePresence>
            {nitroOn && (
              <motion.div key="x2hud"
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[6] pointer-events-none">
                <div className="text-orange-400 font-black text-5xl drop-shadow-[0_0_20px_rgba(249,115,22,0.8)] select-none opacity-30">⚡</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Speed indicator */}
          <div className="absolute top-24 right-6 z-20 pointer-events-none flex flex-col items-center gap-1">
            <div className="text-[8px] font-black text-white/30 uppercase tracking-widest">Speed</div>
            <div className="w-2 h-20 bg-white/10 rounded-full overflow-hidden flex flex-col-reverse">
              <motion.div className="w-full rounded-full" animate={{ height: `${speedPct}%` }} transition={{ duration: 0.3 }}
                style={{ background: speedPct > 80 ? '#f43f5e' : speedPct > 50 ? '#f97316' : '#06b6d4', boxShadow: speedPct > 80 ? '0 0 8px #f43f5e' : 'none' }} />
            </div>
            <div className="text-[8px] font-black" style={{ color: speedPct > 80 ? '#f43f5e' : speedPct > 50 ? '#f97316' : '#06b6d4' }}>{speedPct}%</div>
          </div>

          {/* Active power-up pills */}
          {activePuInfo.length > 0 && (
            <div className="absolute top-24 left-6 z-20 flex flex-col gap-1.5 pointer-events-none">
              {activePuInfo.map(pu => (
                <motion.div key={pu.id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-black"
                  style={{ backgroundColor: pu.hex + '22', borderColor: pu.hex + '55', color: pu.hex }}>
                  {pu.emoji} {pu.label}
                </motion.div>
              ))}
            </div>
          )}

          {/* Nitro gauge */}
          <div className="absolute bottom-40 md:bottom-44 lg:bottom-8 inset-x-0 z-20 flex justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className="text-[9px] font-black tracking-widest uppercase" style={{ color: nitroBgColor }}>
                {nitroCooling ? '⏳ LÄDT NACH...' : nitroOn ? '⚡ NITRO BOOST!' : 'NITRO'} {nitroPercent}%
              </div>
              <div className="w-52 h-3.5 bg-black/60 rounded-full border border-white/10 overflow-hidden relative">
                <motion.div
                  className="h-full rounded-full"
                  animate={{ width: `${nitroPercent}%` }}
                  transition={{ duration: 0.1 }}
                  style={{
                    background: nitroCooling ? 'linear-gradient(90deg,#ef4444,#f97316)' : nitroOn ? 'linear-gradient(90deg,#f97316,#fbbf24)' : nitroPercent < 25 ? 'linear-gradient(90deg,#ef4444,#f97316)' : 'linear-gradient(90deg,#06b6d4,#7c3aed)',
                    boxShadow: nitroOn ? '0 0 14px #f97316' : 'none',
                  }}
                />
              </div>
              <div className="text-[8px] text-white/25 font-bold">Space / W / 🔥</div>
            </div>
          </div>
        </>
      )}

      {/* Touch/Tablet buttons */}
      {gameState === 'playing' && (
        <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-between items-center px-6 pointer-events-auto lg:hidden">
          {/* Left lane button */}
          <button
            className="w-24 h-24 md:w-28 md:h-28 rounded-2xl border-2 border-cyan-500/50 bg-black/60 text-cyan-400 text-4xl font-black active:bg-cyan-500/30 flex items-center justify-center select-none"
            onTouchStart={(e) => { e.preventDefault(); const g = gsRef.current; if (g) g.targetLane = Math.max(0, Math.min(2, g.targetLane + 1)); }}
            onPointerDown={(e) => { e.preventDefault(); const g = gsRef.current; if (g) g.targetLane = Math.max(0, Math.min(2, g.targetLane + 1)); }}>
            ◀
          </button>

          {/* Nitro button */}
          <motion.button
            animate={{ scale: nitroOn ? 1.12 : 1, boxShadow: nitroOn ? '0 0 28px #f97316' : '0 0 0px transparent' }}
            transition={{ duration: 0.12 }}
            className="w-24 h-24 md:w-28 md:h-28 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 select-none"
            style={{ borderColor: nitroCooling ? '#ef4444' : '#f97316', background: nitroOn ? 'rgba(249,115,22,0.4)' : 'rgba(0,0,0,0.6)' }}
            onTouchStart={(e) => { e.preventDefault(); nitroRef.current = true; }}
            onTouchEnd={(e) => { e.preventDefault(); nitroRef.current = false; }}
            onPointerDown={(e) => { if (e.pointerType !== 'touch') return; e.preventDefault(); nitroRef.current = true; }}
            onPointerUp={(e) => { if (e.pointerType !== 'touch') return; nitroRef.current = false; }}>
            <span className="text-3xl">🔥</span>
            <span className="text-[9px] font-black text-orange-400">NITRO</span>
          </motion.button>

          {/* Right lane button */}
          <button
            className="w-24 h-24 md:w-28 md:h-28 rounded-2xl border-2 border-cyan-500/50 bg-black/60 text-cyan-400 text-4xl font-black active:bg-cyan-500/30 flex items-center justify-center select-none"
            onTouchStart={(e) => { e.preventDefault(); const g = gsRef.current; if (g) g.targetLane = Math.max(0, Math.min(2, g.targetLane - 1)); }}
            onPointerDown={(e) => { e.preventDefault(); const g = gsRef.current; if (g) g.targetLane = Math.max(0, Math.min(2, g.targetLane - 1)); }}>
            ▶
          </button>
        </div>
      )}

      {/* Overlays */}
      <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
        <AnimatePresence mode="wait">

          {/* ── MENU ── */}
          {gameState === 'menu' && (
            <motion.div key="menu" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="pointer-events-auto bg-black/70 backdrop-blur-xl p-8 md:p-10 rounded-3xl border border-cyan-500/30 text-center shadow-[0_0_60px_rgba(6,182,212,0.2)] w-[90%] max-w-md">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-violet-600/20 rounded-3xl blur-xl" />
                <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.5)] text-5xl">🏎️</div>
              </div>
              <h1 className="text-5xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-400">Neon City Racer</h1>
              <p className="text-white/35 mb-4 text-sm tracking-wide">Weiche aus · Sammle Münzen · Werde Legende</p>

              {/* Controls */}
              <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 mb-5 space-y-1.5">
                <div className="flex flex-wrap gap-x-5 justify-center">
                  <span className="text-xs text-cyan-400/70 font-bold">⌨️ ← → Pfeiltasten / A D</span>
                  <span className="text-xs text-violet-400/70 font-bold">📱 Swipen</span>
                </div>
                <div className="text-xs text-orange-400/80 font-bold text-center">⚡ Space / W / 🔥 Button = NITRO BOOST</div>
                <div className="text-xs text-yellow-400/60 font-bold text-center">💛 Goldene Streifen auf der Straße = Nitro aufladen</div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Rekord</p>
                  <p className="text-3xl font-black text-yellow-400">{highScore.toLocaleString()}</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Aktives Auto</p>
                  <p className="text-xl mt-1">{activeSkin.emoji} <span className="text-sm font-bold text-white/60">{activeSkin.name}</span></p>
                </div>
              </div>
              {/* Daily Challenge */}
              <div className={`rounded-2xl p-3 mb-4 border ${challengeDone ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className={`w-4 h-4 ${challengeDone ? 'text-green-400' : 'text-cyan-400'}`} />
                    <span className={`text-xs font-black ${challengeDone ? 'text-green-400' : 'text-white/60'}`}>Tages-Challenge</span>
                    {challengeDone && <span className="text-[9px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold">✓ Abgeschlossen!</span>}
                  </div>
                  <span className="text-yellow-400 font-black text-xs">+{todayChallenge.reward}🪙</span>
                </div>
                <p className="text-white/70 text-xs mt-1 font-semibold">{todayChallenge.desc}</p>
                <div className="mt-2 w-full bg-black/30 rounded-full h-1.5">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all"
                    style={{ width: `${Math.min(100, (challengeProgress / todayChallenge.target) * 100)}%` }} />
                </div>
                <p className="text-white/30 text-[9px] mt-0.5 text-right font-bold">{Math.min(challengeProgress, todayChallenge.target).toLocaleString()} / {todayChallenge.target.toLocaleString()}</p>
              </div>

              <div className="flex flex-col gap-3">
                <Button onClick={startGame} size="lg" className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 font-black text-xl py-7 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.5)] border-none">
                  <Play className="w-6 h-6 mr-2 fill-white" /> Gas geben! 🚀
                </Button>
                <div className="grid grid-cols-4 gap-2">
                  <Button onClick={() => setGameState('leaderboard')} variant="outline" className="text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10 rounded-2xl py-5 font-bold text-xs">
                    <Trophy className="w-4 h-4 mr-1" /> Top 10
                  </Button>
                  <Button onClick={() => setGameState('upgrades')} variant="outline" className="text-fuchsia-400 border-fuchsia-500/30 hover:bg-fuchsia-500/10 rounded-2xl py-5 font-bold text-xs">
                    <ShoppingCart className="w-4 h-4 mr-1" /> Upgrades
                  </Button>
                  <Button onClick={() => setGameState('skins')} variant="outline" className="text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10 rounded-2xl py-5 font-bold text-xs">
                    <Star className="w-4 h-4 mr-1" /> Skins
                  </Button>
                  <Button onClick={() => setGameState('stats')} variant="outline" className="text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10 rounded-2xl py-5 font-bold text-xs">
                    <BarChart2 className="w-4 h-4 mr-1" /> Stats
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── GAME OVER ── */}
          {gameState === 'gameover' && (
            <motion.div key="gameover" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', bounce: 0.35 }}
              className="pointer-events-auto bg-black/85 backdrop-blur-2xl p-8 rounded-3xl border border-red-500/30 text-center shadow-[0_0_80px_rgba(244,63,94,0.3)] w-[90%] max-w-sm overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent pointer-events-none" />
              <motion.div className="text-7xl mb-3" initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', bounce: 0.6, delay: 0.1 }}>💥</motion.div>
              <h2 className="text-5xl font-black text-red-500 mb-1 drop-shadow-[0_0_20px_rgba(244,63,94,0.8)]">CRASH!</h2>
              <div className="grid grid-cols-2 gap-4 my-5">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <p className="text-white/40 text-xs font-bold uppercase mb-1">Score</p>
                  <p className="text-3xl font-black">{score.toLocaleString()}</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <p className="text-white/40 text-xs font-bold uppercase mb-1">Rekord</p>
                  <p className="text-3xl font-black text-yellow-400">{highScore.toLocaleString()}</p>
                </div>
              </div>
              {tokensEarned > 0 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.6, delay: 0.3 }}
                  className="bg-green-500/10 border border-green-500/30 rounded-2xl p-3 mb-3">
                  <p className="text-green-400 font-black text-lg">+{tokensEarned.toLocaleString()} Tokens! 💰</p>
                </motion.div>
              )}
              {/* Challenge progress */}
              <div className={`rounded-2xl p-3 mb-4 border ${challengeDone ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Tages-Challenge</span>
                  {challengeDone ? <span className="text-[10px] text-green-400 font-black">✓ Geschafft!</span> : <span className="text-yellow-400 font-black text-[10px]">+{todayChallenge.reward}🪙</span>}
                </div>
                <p className="text-white/60 text-xs">{todayChallenge.desc}</p>
                <div className="mt-1.5 w-full bg-black/30 rounded-full h-1.5">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all"
                    style={{ width: `${Math.min(100, (challengeProgress / todayChallenge.target) * 100)}%` }} />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Button onClick={startGame} size="lg" className="w-full bg-gradient-to-r from-cyan-600 to-violet-600 font-black text-lg py-6 rounded-2xl border-none">
                  <RotateCcw className="w-5 h-5 mr-2" /> Nochmal
                </Button>
                <Button onClick={() => setGameState('menu')} variant="ghost" className="w-full text-white/50 hover:text-white rounded-2xl">Hauptmenü</Button>
              </div>
            </motion.div>
          )}

          {/* ── UPGRADES ── */}
          {gameState === 'upgrades' && (
            <motion.div key="upgrades" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="pointer-events-auto bg-black/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-fuchsia-500/30 shadow-[0_0_50px_rgba(217,70,239,0.15)] w-[90%] max-w-md max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-purple-500 flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6 text-fuchsia-400" /> Upgrades
                </h2>
                <div className="bg-white/10 px-3 py-1 rounded-full flex items-center gap-2 border border-white/20">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span className="font-bold text-yellow-400">{user?.tokens?.toLocaleString() || 0}</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto pr-1 space-y-4 mb-5 hide-scrollbar">
                {UPGRADES.map(upg => {
                  const lv = getUL(upg.id); const isMax = lv >= upg.maxLevel;
                  const cost = getUC(upg); const can = (user?.tokens || 0) >= cost;
                  return (
                    <div key={upg.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-black/50 p-3 rounded-xl border border-white/10 text-2xl">{upg.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-white/90">{upg.name}</h3>
                            <span className="text-xs font-black bg-white/10 px-2 py-1 rounded-md text-white/70">Lvl {lv}/{upg.maxLevel}</span>
                          </div>
                          <p className="text-xs text-white/50 mt-1">{upg.desc}</p>
                        </div>
                      </div>
                      <Button onClick={() => buyUpgrade(upg)} disabled={isMax || !can}
                        className={`w-full py-5 rounded-xl font-black flex items-center justify-center gap-2 ${isMax ? 'bg-green-500/20 text-green-400 border border-green-500/30' : can ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white border-none' : 'bg-white/5 text-white/30 cursor-not-allowed border-none'}`}>
                        {isMax ? 'Max Level! ✓' : <><Zap className="w-5 h-5" /> {cost.toLocaleString()} Tokens</>}
                      </Button>
                    </div>
                  );
                })}
              </div>
              <Button onClick={() => setGameState('menu')} className="w-full bg-white/10 hover:bg-white/20 text-white py-6 rounded-2xl font-bold border-none">Zurück</Button>
            </motion.div>
          )}

          {/* ── SKINS ── */}
          {gameState === 'skins' && (
            <motion.div key="skins" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="pointer-events-auto bg-black/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-yellow-500/30 shadow-[0_0_50px_rgba(234,179,8,0.15)] w-[90%] max-w-md max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-400" /> Auto Skins
                </h2>
                <div className="bg-white/10 px-3 py-1 rounded-full flex items-center gap-2 border border-white/20">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span className="font-bold text-yellow-400">{user?.tokens?.toLocaleString() || 0}</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto pr-1 space-y-3 mb-5 hide-scrollbar">
                {CAR_SKINS.map(skin => {
                  const owned = getOwnedSkins().includes(skin.id);
                  const active = getActiveSkin() === skin.id;
                  const can = (user?.tokens || 0) >= skin.cost;
                  const hx = '#' + skin.color.toString(16).padStart(6, '0');
                  return (
                    <div key={skin.id} className={`bg-white/5 border rounded-2xl p-4 flex items-center gap-4 transition-all ${active ? 'border-yellow-400/50' : 'border-white/10'}`}>
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
                        style={{ backgroundColor: hx + '22', boxShadow: `0 0 15px ${hx}50` }}>
                        {skin.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white/90">{skin.name}</h3>
                          {active && <span className="text-[10px] bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full font-bold">Aktiv</span>}
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: hx }}>{owned ? 'Besessen ✓' : skin.cost === 0 ? 'Gratis' : `${skin.cost.toLocaleString()} Tokens`}</p>
                      </div>
                      <Button onClick={() => buySkin(skin)} disabled={active}
                        className={`rounded-xl px-4 py-2 font-black text-sm flex-shrink-0 border-none ${active ? 'bg-yellow-500/20 text-yellow-400' : owned ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : can ? 'bg-yellow-500 hover:bg-yellow-400 text-black' : 'bg-white/5 text-white/30 cursor-not-allowed'}`}>
                        {active ? '✓' : owned ? 'Anlegen' : skin.cost === 0 ? 'Gratis' : skin.cost.toLocaleString()}
                      </Button>
                    </div>
                  );
                })}
              </div>
              <Button onClick={() => setGameState('menu')} className="w-full bg-white/10 hover:bg-white/20 text-white py-6 rounded-2xl font-bold border-none">Zurück</Button>
            </motion.div>
          )}

          {/* ── LEADERBOARD ── */}
          {gameState === 'leaderboard' && (
            <motion.div key="lb" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="pointer-events-auto bg-black/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-yellow-500/30 shadow-[0_0_50px_rgba(250,204,21,0.15)] w-[90%] max-w-md max-h-[80vh] flex flex-col">
              <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-500 flex items-center gap-2 mb-4">
                <Trophy className="w-7 h-7 text-yellow-400" /> Top 10 – Neon Racer
              </h2>
              {/* Tabs */}
              <div className="flex gap-2 mb-4">
                {[{id:'alltime',label:'Allzeit'},{id:'weekly',label:'Diese Woche'}].map(t => (
                  <button key={t.id} onClick={() => setLbTab(t.id)}
                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${lbTab === t.id ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' : 'bg-white/5 text-white/40 hover:bg-white/10 border border-white/10'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto pr-1 space-y-2 mb-5 hide-scrollbar">
                {lbLoading ? <p className="text-center text-white/50 py-4">Lade...</p>
                : leaderboard.length === 0 ? <p className="text-center text-white/50 py-4">Noch keine Einträge.</p>
                : leaderboard.map((entry, i) => (
                  <div key={entry.id || i} className={`bg-white/5 border rounded-xl p-3 flex items-center justify-between ${entry.player_username === user?.username ? 'border-cyan-500/40 bg-cyan-500/5' : 'border-white/10'}`}>
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold ${i===0?'bg-yellow-400 text-black':i===1?'bg-gray-300 text-black':i===2?'bg-orange-400 text-black':'bg-white/10 text-white/50'}`}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}</span>
                      <span className="font-bold text-white/90 truncate max-w-[130px]">{entry.player_username}</span>
                    </div>
                    <span className="font-black text-cyan-400">{entry.score.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <Button onClick={() => setGameState('menu')} className="w-full bg-white/10 hover:bg-white/20 text-white py-6 rounded-2xl font-bold border-none">Zurück</Button>
            </motion.div>
          )}

          {/* ── STATS ── */}
          {gameState === 'stats' && (
            <motion.div key="stats" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="pointer-events-auto bg-black/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] w-[90%] max-w-md max-h-[80vh] flex flex-col">
              <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500 flex items-center gap-2 mb-5">
                <BarChart2 className="w-6 h-6 text-cyan-400" /> Meine Stats
              </h2>
              <div className="flex-1 overflow-y-auto hide-scrollbar space-y-3 mb-5">
                {[
                  { label: '🏆 Höchste Punktzahl', value: (racerStats.highScore || highScore || 0).toLocaleString() },
                  { label: '🎮 Spiele gespielt', value: (racerStats.totalGames || 0).toLocaleString() },
                  { label: '🪙 Münzen gesammelt', value: (racerStats.totalCoins || 0).toLocaleString() },
                  { label: '⚡ Nitro benutzt', value: (racerStats.totalNitroUses || 0).toLocaleString() },
                  { label: '🔥 Beste Kombo', value: `×${racerStats.bestCombo || 0}` },
                  { label: '⏱️ Spielzeit gesamt', value: `${Math.floor((racerStats.totalTimeSec || 0) / 60)} Min.` },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <span className="text-white/60 text-sm font-semibold">{row.label}</span>
                    <span className="text-white font-black text-base">{row.value}</span>
                  </div>
                ))}
                {/* Daily Challenge in stats */}
                <div className={`rounded-2xl p-4 border ${challengeDone ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">Heutige Challenge</span>
                    <span className="text-yellow-400 font-black text-xs">+{todayChallenge.reward}🪙</span>
                  </div>
                  <p className="text-white/70 text-sm font-semibold mb-2">{todayChallenge.desc}</p>
                  <div className="w-full bg-black/30 rounded-full h-2">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all"
                      style={{ width: `${Math.min(100, (challengeProgress / todayChallenge.target) * 100)}%` }} />
                  </div>
                  <p className="text-white/40 text-[10px] mt-1 text-right">{Math.min(challengeProgress, todayChallenge.target).toLocaleString()} / {todayChallenge.target.toLocaleString()} {challengeDone && '✓'}</p>
                </div>
              </div>
              <Button onClick={() => setGameState('menu')} className="w-full bg-white/10 hover:bg-white/20 text-white py-6 rounded-2xl font-bold border-none">Zurück</Button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}