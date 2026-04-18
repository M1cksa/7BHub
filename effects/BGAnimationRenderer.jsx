/**
 * BGAnimationRenderer
 * Central component that renders the correct background animation
 * based on the user's active_background_animation setting.
 * Used in layout.jsx to avoid duplicating animation logic.
 */
import React, { lazy, Suspense } from 'react';
import ParticleAnimation from './ParticleAnimation';
import WaveAnimation from './WaveAnimation';
import FloatingLights from './FloatingLights';
import NeonGrid from './NeonGrid';
import ApocalypseMeteors from './ApocalypseMeteors';

// S2 backgrounds (lazy loaded)
const CrimsonStormBG = lazy(() => import('./bg/CrimsonStormBG'));
const VoidPulseBG    = lazy(() => import('./bg/VoidPulseBG'));
const NeonRainBG     = lazy(() => import('./bg/NeonRainBG'));
const AuroraNorthBG  = lazy(() => import('./bg/AuroraNorthBG'));
const GalaxySpiralBG = lazy(() => import('./bg/GalaxySpiralBG'));

const S2_BG = {
  crimson_storm:    CrimsonStormBG,
  void_pulse:       VoidPulseBG,
  neon_rain:        NeonRainBG,
  aurora_north:     AuroraNorthBG,
  galaxy_spiral:    GalaxySpiralBG,
};

export default function BGAnimationRenderer({ type, theme }) {
  // S2 exclusive animations
  if (S2_BG[type]) {
    const Comp = S2_BG[type];
    return <Suspense fallback={null}><Comp /></Suspense>;
  }

  // Standard animations
  if (type === 'particles') return <ParticleAnimation />;
  if (type === 'waves')     return <WaveAnimation />;
  if (type === 'lights')    return <FloatingLights />;
  if (type === 'grid')      return <NeonGrid />;
  if (type === 'cosmic')    return <ParticleAnimation />;
  if (type === 'apocalypse_meteors') return <ApocalypseMeteors />;

  // default: waves + theme bg
  return (
    <>
      <WaveAnimation />
    </>
  );
}

// List of all background animations for profile/settings pages
export const ALL_BG_ANIMATIONS = [
  // Standard
  { id: 'default',            label: 'Standard Wellen',    emoji: '🌊', s2Only: false },
  { id: 'particles',          label: 'Partikel',            emoji: '✨', s2Only: false },
  { id: 'waves',              label: 'Wellen',              emoji: '🌊', s2Only: false },
  { id: 'lights',             label: 'Lichter',             emoji: '💡', s2Only: false },
  { id: 'grid',               label: 'Neon Grid',           emoji: '🔷', s2Only: false },
  { id: 'apocalypse_meteors', label: 'Meteorregen',         emoji: '☄️', s2Only: false },
  // S2 Exclusive
  { id: 'crimson_storm',  label: 'Crimson Storm',   emoji: '⚡', s2Only: true, rarity: 'legendary' },
  { id: 'void_pulse',     label: 'Void Pulse',      emoji: '🌀', s2Only: true, rarity: 'legendary' },
  { id: 'neon_rain',      label: 'Neon Regen',      emoji: '💻', s2Only: true, rarity: 'epic' },
  { id: 'aurora_north',   label: 'Aurora Borealis', emoji: '🌌', s2Only: true, rarity: 'unique' },
  { id: 'galaxy_spiral',  label: 'Galaxie Spirale', emoji: '🌠', s2Only: true, rarity: 'unique' },
];