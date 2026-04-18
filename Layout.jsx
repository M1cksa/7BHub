import React, { useState, useEffect } from 'react';
import ModernNavbar from '@/components/navigation/ModernNavbar';

import SearchOverlay from '@/components/streaming/SearchOverlay';
import ServerStatusBanner from '@/components/ServerStatusBanner';
import EventBanner from '@/components/EventBanner';
import Footer from '@/components/Footer';
import ParticleAnimation from '@/components/effects/ParticleAnimation';
import WaveAnimation from '@/components/effects/WaveAnimation';
import FloatingLights from '@/components/effects/FloatingLights';
import ApocalypseMeteors from '@/components/effects/ApocalypseMeteors';
import CursorTrail from '@/components/effects/CursorTrail';
import NeonGrid from '@/components/effects/NeonGrid';
import ThemeBackground from '@/components/effects/ThemeBackground';
import BGAnimationRenderer from '@/components/effects/BGAnimationRenderer';
import BannedUserCheck from '@/components/BannedUserCheck';
import UpdateNotificationBanner from '@/components/UpdateNotificationBanner';
import { PokemonEventProvider } from '@/components/pokemon/PokemonEventContext';
import PokemonEventBanner from '@/components/pokemon/PokemonEventBanner';
import PokemonFloatingSprites from '@/components/pokemon/PokemonFloatingSprites';
import PokemonThemeDecorations from '@/components/pokemon/PokemonThemeDecorations';
import { usePokemonEvent } from '@/components/pokemon/PokemonEventContext';
import PokemonCinematicIntro from '@/components/pokemon/PokemonCinematicIntro';
import PokemonEasterEggs from '@/components/pokemon/PokemonEasterEggs';
import PlatformLockScreen from '@/components/PlatformLockScreen';
import CallManager from '@/components/call/CallManager';
import HubAssistantWidget from '@/components/HubAssistantWidget';
import AdminBroadcastPopup from '@/components/AdminBroadcastPopup';
import CostReductionNotice from '@/components/CostReductionNotice';
import TokenCelebration from '@/components/effects/TokenCelebration';
import LevelUpCelebration from '@/components/battlepass/LevelUpCelebration';
import UserHeartbeat from '@/components/UserHeartbeat';
import UserPopupNotification from '@/components/UserPopupNotification';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

function PokemonEventBannerWrapper() {
  const { isActive } = usePokemonEvent();
  if (!isActive) return null;
  return <PokemonEventBanner />;
}

function PokemonSpritesWrapper() {
  const { isActive } = usePokemonEvent();
  if (!isActive) return null;
  return (
    <>
      <PokemonEasterEggs />
      <PokemonCinematicIntro />
    </>
  );
}

function LayoutInner({ children }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [platformLock, setPlatformLock] = useState(null);
  const [lockChecked, setLockChecked] = useState(false);

  // Check if user is logged in — skip heavy effects for auth pages and highers security levels at proctection software for videos and content on 7B Hub
  const isLoggedIn = !!(() => { try { return localStorage.getItem('app_user'); } catch { return null; } })();

  const [activeTheme, setActiveTheme] = useState('default');
  const [backgroundAnimation, setBackgroundAnimation] = useState('default');
  const [activeCursorTrail, setActiveCursorTrail] = useState('none');
  const [perfMode, setPerfMode] = useState(() => {
    const stored = localStorage.getItem('lightweight_mode_v2');
    if (stored !== null) return stored === 'true';
    return true; // default: on
  });


  // Load active theme from user + Auto-detect system preference
  useEffect(() => {
    const loadTheme = () => {
      try {
        const stored = localStorage.getItem('app_user');
        if (stored) {
          const user = JSON.parse(stored);
          let defaultTheme = 'default';
          let defaultBgAnim = 'default';
          
          if (user.audience_group === 'girl') {
            defaultTheme = 'cherry'; // Pink/Rose theme
            defaultBgAnim = 'particles';
          } else if (user.audience_group === 'boy') {
            defaultTheme = 'ocean'; // Blue theme
            defaultBgAnim = 'grid';
          }

          setActiveTheme((user.active_theme && user.active_theme !== 'default') ? user.active_theme : defaultTheme);
          setBackgroundAnimation((user.active_background_animation && user.active_background_animation !== 'default') ? user.active_background_animation : defaultBgAnim);
          setActiveCursorTrail(user.active_cursor_trail || 'none');
        } else {
          // Auto-detect system theme preference
          if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            setActiveTheme('white');
          }
        }
      } catch (e) {
        console.error('Theme load error:', e);
      }
    };
    
    loadTheme();
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = (e) => {
      const stored = localStorage.getItem('app_user');
      if (!stored || !JSON.parse(stored)?.active_theme) {
        setActiveTheme(e.matches ? 'white' : 'default');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    window.addEventListener('user-updated', loadTheme);

    const handlePerfMode = () => {
      const stored = localStorage.getItem('lightweight_mode_v2');
      setPerfMode(stored !== null ? stored === 'true' : true);
    };
    window.addEventListener('lightweight-mode-changed', handlePerfMode);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      window.removeEventListener('user-updated', loadTheme);
      window.removeEventListener('lightweight-mode-changed', handlePerfMode);
    };
  }, []);

  // Theme configurations
  const themeStyles = {
    default: {
      bg: 'bg-black',
      accent: 'cyan',
      gradient: 'from-cyan-500/20 to-teal-500/20'
    },
    white: {
      bg: 'bg-white',
      accent: 'blue',
      gradient: 'from-blue-500/10 to-purple-500/10'
    },
    rainbow: {
      bg: 'bg-black',
      accent: 'rainbow',
      gradient: 'from-pink-500/20 via-yellow-500/20 to-green-500/20'
    },
    dark_neon: {
      bg: 'bg-black',
      accent: 'magenta',
      gradient: 'from-fuchsia-500/30 to-cyan-500/30'
    },
    midnight: {
      bg: 'bg-slate-950',
      accent: 'indigo',
      gradient: 'from-indigo-600/20 to-purple-600/20'
    },
    sunset: {
      bg: 'bg-orange-950',
      accent: 'orange',
      gradient: 'from-orange-500/20 to-pink-500/20'
    },
    ocean: {
      bg: 'bg-blue-950',
      accent: 'blue',
      gradient: 'from-blue-500/20 to-cyan-500/20'
    },
    forest: {
      bg: 'bg-emerald-950',
      accent: 'emerald',
      gradient: 'from-emerald-500/20 to-green-500/20'
    },
    neon: {
      bg: 'bg-black',
      accent: 'pink',
      gradient: 'from-pink-500/30 to-purple-500/30'
    },
    crimson: {
      bg: 'bg-red-950',
      accent: 'red',
      gradient: 'from-red-500/20 to-rose-500/20'
    },
    royal: {
      bg: 'bg-purple-950',
      accent: 'purple',
      gradient: 'from-purple-500/20 to-violet-500/20'
    },
    galaxy: {
      bg: 'bg-purple-950',
      accent: 'purple',
      gradient: 'from-purple-500/20 to-pink-500/20'
    },
    cherry: {
      bg: 'bg-pink-950',
      accent: 'pink',
      gradient: 'from-pink-600/20 to-rose-500/20'
    },
    arctic: {
      bg: 'bg-cyan-950',
      accent: 'cyan',
      gradient: 'from-cyan-500/20 to-blue-500/20'
    },
    volcanic: {
      bg: 'bg-red-950',
      accent: 'orange',
      gradient: 'from-red-600/20 to-orange-500/20'
    },
    emerald: {
      bg: 'bg-emerald-950',
      accent: 'emerald',
      gradient: 'from-emerald-600/20 to-green-500/20'
    },
    stealth: {
      bg: 'bg-black',
      accent: 'gray',
      gradient: 'from-gray-700/20 to-gray-600/20'
    },
    cyber: {
      bg: 'bg-black',
      accent: 'green',
      gradient: 'from-green-500/20 to-emerald-500/20'
    },
    gold: {
      bg: 'bg-yellow-950',
      accent: 'yellow',
      gradient: 'from-yellow-600/20 to-amber-500/20'
    },
    hub_2_0: {
      bg: 'bg-[#0f0c29]',
      accent: 'fuchsia',
      gradient: 'from-[#06b6d4]/30 via-[#7c3aed]/30 to-[#d946ef]/30'
    },
    // Donor Exclusive Themes
    obsidian: {
      bg: 'bg-black',
      accent: 'gray',
      gradient: 'from-gray-800/30 to-gray-900/30'
    },
    platinum: {
      bg: 'bg-gray-200',
      accent: 'gray',
      gradient: 'from-gray-300/20 to-gray-400/20'
    },
    ruby: {
      bg: 'bg-red-950',
      accent: 'red',
      gradient: 'from-red-600/30 to-rose-600/30'
    },
    sapphire: {
      bg: 'bg-blue-950',
      accent: 'blue',
      gradient: 'from-blue-600/30 to-cyan-600/30'
    }
  };

  const theme = themeStyles[activeTheme] || themeStyles.default;

  // Check for custom theme
  useEffect(() => {
    const stored = localStorage.getItem('app_user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        const customTheme = user?.custom_themes?.find(t => t.id === activeTheme);
        if (customTheme) {
          // Apply custom theme colors as CSS variables
          document.documentElement.style.setProperty('--theme-primary', customTheme.colors.primary);
          document.documentElement.style.setProperty('--theme-secondary', customTheme.colors.secondary);
          document.documentElement.style.setProperty('--theme-bg', customTheme.colors.bg);
        } else {
          // Apply preset theme colors
          const presetColors = {
            default: { primary: '#06b6d4', secondary: '#14b8a6', bg: '#000000' },
            white: { primary: '#3b82f6', secondary: '#8b5cf6', bg: '#ffffff' },
            rainbow: { primary: '#ec4899', secondary: '#f59e0b', bg: '#000000' },
            dark_neon: { primary: '#ff00ff', secondary: '#00ffff', bg: '#000000' },
            midnight: { primary: '#4f46e5', secondary: '#7c3aed', bg: '#020617' },
            sunset: { primary: '#f97316', secondary: '#ec4899', bg: '#431407' },
            ocean: { primary: '#0284c7', secondary: '#06b6d4', bg: '#0c4a6e' },
            forest: { primary: '#10b981', secondary: '#22c55e', bg: '#064e3b' },
            neon: { primary: '#ec4899', secondary: '#a855f7', bg: '#000000' },
            crimson: { primary: '#dc2626', secondary: '#f43f5e', bg: '#450a0a' },
            royal: { primary: '#7c3aed', secondary: '#8b5cf6', bg: '#2e1065' },
            galaxy: { primary: '#8b5cf6', secondary: '#ec4899', bg: '#2e1065' },
            cherry: { primary: '#ec4899', secondary: '#f472b6', bg: '#2b0a1a' },
            arctic: { primary: '#22d3ee', secondary: '#bae6fd', bg: '#0c4a6e' },
            volcanic: { primary: '#dc2626', secondary: '#fb923c', bg: '#1c0808' },
            emerald: { primary: '#10b981', secondary: '#34d399', bg: '#022c22' },
            stealth: { primary: '#404040', secondary: '#737373', bg: '#000000' },
            cyber: { primary: '#22c55e', secondary: '#06b6d4', bg: '#000000' },
            gold: { primary: '#eab308', secondary: '#fbbf24', bg: '#713f12' },
            hub_2_0: { primary: '#06b6d4', secondary: '#d946ef', bg: '#0f0c29' },
            // Donor Exclusive
            obsidian: { primary: '#1a1a1a', secondary: '#333333', bg: '#000000' },
            platinum: { primary: '#e5e7eb', secondary: '#9ca3af', bg: '#d1d5db' },
            ruby: { primary: '#b91c1c', secondary: '#dc2626', bg: '#450a0a' },
            sapphire: { primary: '#0369a1', secondary: '#0284c7', bg: '#0c4a6e' }
          };
          const colors = presetColors[activeTheme] || presetColors.default;
          document.documentElement.style.setProperty('--theme-primary', colors.primary);
          document.documentElement.style.setProperty('--theme-secondary', colors.secondary);
          document.documentElement.style.setProperty('--theme-bg', colors.bg);
        }
      } catch (e) {
        console.error('Theme CSS error:', e);
      }
    }
  }, [activeTheme]);

  // Check platform lock
  useEffect(() => {
    base44.entities.PlatformLock.filter({ is_active: true }, '-created_date', 1)
      .then(locks => {
        if (locks && locks.length > 0) {
          setPlatformLock(locks[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLockChecked(true));
  }, []);

  // Fetch data for search
  const { data: videos = [] } = useQuery({
    queryKey: ['searchVideos'],
    queryFn: () => base44.entities.Video.list('-created_date', 100),
    enabled: isSearchOpen // Only fetch when search is opened
  });

  const { data: creators = [] } = useQuery({
    queryKey: ['searchCreators'],
    queryFn: () => base44.entities.CreatorInfo.list('-followers_count', 50),
    enabled: isSearchOpen
  });

  // Map creators to channel format expected by SearchOverlay
  const channels = creators.map(c => ({
    id: c.id,
    name: c.username,
    avatar_url: c.avatar_url,
    subscribers: c.followers_count
  }));

  // Minimal layout for unauthenticated users — render BEFORE lockChecked check to avoid black screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen text-white" style={{ background: 'linear-gradient(135deg, #030318 0%, #0a001a 40%, #001a1a 100%)' }}>
        <style>{`
          :root {
            --theme-primary: #06b6d4;
            --theme-secondary: #14b8a6;
            --theme-bg: #000000;
            --theme-primary-light: #67e8f9;
            --theme-primary-dark: #0e7490;
            --theme-secondary-light: #5eead4;
            --theme-glass: rgba(255,255,255,0.03);
            --theme-glass-border: rgba(255,255,255,0.1);
          }
        `}</style>
        <ModernNavbar onSearchClick={() => {}} />
        <main style={{ paddingTop: '3.75rem', paddingBottom: '4rem' }}>{children}</main>
      </div>
    );
  }

  if (!lockChecked) return null;
  if (platformLock) {
    return <PlatformLockScreen lockData={platformLock} onUnlocked={() => setPlatformLock(null)} />;
  }

  return (
    <>
      <UserHeartbeat />
      <UserPopupNotification />
      <HubAssistantWidget />
      <AdminBroadcastPopup />

      <TokenCelebration />
      <LevelUpCelebration />
      <BannedUserCheck />
      <CallManager />
      <PokemonSpritesWrapper />
      <PokemonThemeDecorations />
      <div className={`min-h-screen text-white font-sans overflow-x-hidden relative`} style={{ backgroundColor: 'var(--theme-bg)' }}>
      <style>{`
        /* Mobile Optimizations */
        html, body {
          overscroll-behavior-y: none;
          -webkit-overflow-scrolling: touch;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        * {
          -webkit-tap-highlight-color: transparent;
        }

        button, a, .nav-item, [role="button"] {
          user-select: none;
          -webkit-user-select: none;
        }

        /* Hide scrollbars for better mobile experience */
        /* Target specific scrollable containers, not all elements */
        .overflow-auto::-webkit-scrollbar,
        .overflow-y-auto::-webkit-scrollbar,
        .overflow-x-auto::-webkit-scrollbar,
        .overflow-scroll::-webkit-scrollbar,
        .overflow-y-scroll::-webkit-scrollbar,
        .overflow-x-scroll::-webkit-scrollbar {
          width: 0;
          height: 0;
        }

        .overflow-auto,
        .overflow-y-auto,
        .overflow-x-auto,
        .overflow-scroll,
        .overflow-y-scroll,
        .overflow-x-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        /* Main content scrollbar hiding */
        body::-webkit-scrollbar,
        html::-webkit-scrollbar {
          width: 0;
          height: 0;
        }

        body, html {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        :root {
          --theme-primary: ${activeTheme === 'default' ? '#06b6d4' : 'var(--theme-primary)'};
          --theme-secondary: ${activeTheme === 'default' ? '#14b8a6' : 'var(--theme-secondary)'};
          --theme-bg: ${activeTheme === 'default' ? '#000000' : 'var(--theme-bg)'};
          --theme-primary-light: color-mix(in srgb, var(--theme-primary) 60%, white);
          --theme-primary-dark: color-mix(in srgb, var(--theme-primary) 80%, black);
          --theme-secondary-light: color-mix(in srgb, var(--theme-secondary) 60%, white);
          --theme-glass: rgba(255, 255, 255, 0.03);
          --theme-glass-border: rgba(255, 255, 255, 0.1);
        }

        /* Global Background */
        body {
          background-color: var(--theme-bg) !important;
        }

        /* Glass Effects 3.0 - Professional - Hardware Accelerated */
        .glass-effect {
          background: rgba(255, 255, 255, 0.04) !important;
          backdrop-filter: blur(12px) saturate(200%) brightness(1.1) !important;
          -webkit-backdrop-filter: blur(12px) saturate(200%) brightness(1.1) !important;
          border: 1px solid rgba(255, 255, 255, 0.20) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          transform: translateZ(0);
          will-change: transform;
          backface-visibility: hidden;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.05) !important;
          backdrop-filter: blur(16px) saturate(220%) brightness(1.15) !important;
          -webkit-backdrop-filter: blur(16px) saturate(220%) brightness(1.15) !important;
          border: 1px solid rgba(255, 255, 255, 0.18) !important;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 24px 64px rgba(0, 0, 0, 0.18) !important;
          transition: all 0.3s ease-out !important;
          transform: translateZ(0);
          will-change: transform;
        }

        .glass-card:hover {
          transform: translateY(-4px) translateZ(0) !important;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2) !important;
          border-color: rgba(255, 255, 255, 0.25) !important;
        }

        @media (max-width: 768px) {
          .glass-effect, .glass-card {
            backdrop-filter: blur(15px) saturate(150%) !important;
          }
          .glass-card:hover {
            transform: translateY(-2px) !important;
          }
        }

        /* Primary Colors */
        .bg-cyan-600, .bg-cyan-500, .bg-cyan-700, .bg-teal-600, .bg-teal-500, .bg-teal-700 {
          background-color: var(--theme-primary) !important;
        }

        .bg-cyan-400, .bg-teal-400 {
          background-color: var(--theme-primary-light) !important;
        }

        .text-cyan-600, .text-cyan-500, .text-cyan-400, .text-cyan-300, .text-teal-600, .text-teal-500, .text-teal-400, .text-teal-300 {
          color: var(--theme-primary) !important;
        }

        .border-cyan-600, .border-cyan-500, .border-cyan-400, .border-teal-600, .border-teal-500, .border-teal-400 {
          border-color: var(--theme-primary) !important;
        }

        /* Gradients */
        .from-cyan-600, .from-cyan-500, .from-cyan-400, .from-teal-600, .from-teal-500 {
          --tw-gradient-from: var(--theme-primary) var(--tw-gradient-from-position) !important;
          --tw-gradient-to: rgb(6 182 212 / 0) var(--tw-gradient-to-position) !important;
          --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
        }

        .to-teal-600, .to-teal-500, .to-cyan-600, .to-cyan-500 {
          --tw-gradient-to: var(--theme-secondary) var(--tw-gradient-to-position) !important;
        }

        .via-teal-500, .via-cyan-500, .via-cyan-400 {
          --tw-gradient-to: rgb(6 182 212 / 0) var(--tw-gradient-to-position) !important;
          --tw-gradient-stops: var(--tw-gradient-from), var(--theme-primary) var(--tw-gradient-via-position), var(--tw-gradient-to) !important;
        }

        /* Secondary Colors (Violet/Fuchsia/Purple) */
        .bg-violet-600, .bg-violet-500, .bg-violet-700, .bg-fuchsia-600, .bg-fuchsia-500, .bg-purple-600, .bg-purple-500 {
          background-color: var(--theme-secondary) !important;
        }

        .bg-violet-400, .bg-fuchsia-400, .bg-purple-400 {
          background-color: var(--theme-secondary-light) !important;
        }

        .text-violet-600, .text-violet-500, .text-violet-400, .text-violet-300, .text-fuchsia-600, .text-fuchsia-500, .text-fuchsia-400, .text-fuchsia-300, .text-purple-400, .text-purple-300 {
          color: var(--theme-secondary) !important;
        }

        .border-violet-600, .border-violet-500, .border-violet-400, .border-fuchsia-600, .border-fuchsia-500, .border-fuchsia-400 {
          border-color: var(--theme-secondary) !important;
        }

        .from-violet-600, .from-violet-500, .from-fuchsia-600, .from-fuchsia-500, .from-purple-600, .from-purple-500 {
          --tw-gradient-from: var(--theme-secondary) var(--tw-gradient-from-position) !important;
          --tw-gradient-to: rgb(124 58 237 / 0) var(--tw-gradient-to-position) !important;
          --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
        }

        .to-violet-600, .to-violet-500, .to-fuchsia-600, .to-fuchsia-500, .to-purple-600, .to-purple-500 {
          --tw-gradient-to: var(--theme-secondary) var(--tw-gradient-to-position) !important;
        }

        /* Shadows */
        .shadow-cyan-500, .shadow-cyan-600, .shadow-teal-500, .shadow-teal-600 {
          --tw-shadow-color: var(--theme-primary) !important;
        }

        .shadow-violet-500, .shadow-violet-600, .shadow-fuchsia-500, .shadow-fuchsia-600, .shadow-purple-500 {
          --tw-shadow-color: var(--theme-secondary) !important;
        }

        /* Rings */
        .ring-cyan-500, .ring-cyan-600, .ring-teal-500, .ring-teal-600 {
          --tw-ring-color: var(--theme-primary) !important;
        }

        .ring-violet-500, .ring-violet-600, .ring-fuchsia-500, .ring-fuchsia-600 {
          --tw-ring-color: var(--theme-secondary) !important;
        }

        /* Selection */
        ::selection {
          background-color: var(--theme-primary);
          opacity: 0.3;
        }

        /* Scrollbar */
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }

        ::-webkit-scrollbar-thumb {
          background: var(--theme-primary);
          border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: var(--theme-secondary);
        }
      ${activeTheme === 'white' ? `
      /* White Mode Overrides */
      body, .min-h-screen, [class*="bg-black"], [class*="bg-slate-900"], [class*="bg-slate-950"] {
        background-color: #ffffff !important;
        color: #000000 !important;
      }
      .text-white { color: #1a1a1a !important; }
      .text-white\\/70, .text-white\\/60, .text-white\\/50, .text-white\\/40, .text-white\\/30 {
        color: #666666 !important;
      }
      .glass-card, .glass-effect {
        background: rgba(0, 0, 0, 0.02) !important;
        border-color: rgba(0, 0, 0, 0.1) !important;
      }
      ` : ''}

      ${activeTheme === 'rainbow' ? `
      /* Rainbow Mode Animation */
      @keyframes rainbow-bg {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
      }
      body {
        animation: rainbow-bg 10s linear infinite;
      }
      ` : ''}
      `}</style>

      {/* ── BACKGROUND SYSTEM (performance-first) ── */}
      <div className="fixed inset-0 z-[-1]" style={{ backgroundColor: 'var(--theme-bg)' }}>
        {/* Animated backgrounds — only when not in perf mode */}
        {!perfMode && backgroundAnimation !== 'default' && (
          <BGAnimationRenderer type={backgroundAnimation} theme={activeTheme} />
        )}
        {!perfMode && <CursorTrail type={activeCursorTrail} />}
        {!perfMode && backgroundAnimation === 'default' && (
          <>
            <ThemeBackground theme={activeTheme} />
            <WaveAnimation />
          </>
        )}

        {/* Base overlay — always rendered, lightweight */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(160deg, ${theme.bg.replace('bg-','').replace('/80','')} 0%, rgba(0,0,0,0.92) 100%)`,
            transform: 'translateZ(0)',
          }}
        />

        {/* Subtle dot texture — single rule, no external image */}
        {!perfMode && (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)`,
              backgroundSize: '32px 32px',
            }}
          />
        )}
      </div>
      
      <ModernNavbar onSearchClick={() => setIsSearchOpen(true)} />

      {/* Pokemon banner goes here, pushed below the fixed navbar */}
      <div className="pt-14 md:pt-16">
        <PokemonEventBannerWrapper />
      </div>

      <UpdateNotificationBanner />
      <EventBanner />
      <ServerStatusBanner />
      
      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)}
        videos={videos}
        channels={channels}
      />

      <main 
        className="pb-24 px-0 max-w-[1920px] mx-auto min-h-[calc(100vh-4rem)]"
        style={{ 
          paddingTop: 'calc(3.75rem + env(safe-area-inset-top))',
          paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' 
        }}
      >
        {children}
      </main>

      <Footer />

    </div>
    </>
  );
}

export default function Layout({ children }) {
  return (
    <PokemonEventProvider>
      <LayoutInner>{children}</LayoutInner>
    </PokemonEventProvider>
  );
}