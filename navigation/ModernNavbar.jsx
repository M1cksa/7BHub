import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { usePokemonEvent } from '@/components/pokemon/PokemonEventContext';
import { 
  Search, X, Bell, User, LogOut, Settings, Upload,
  Home, Film, ShoppingBag, Shield,
  Users, ChevronDown, Menu, Gamepad2, Zap, UserPlus, Trophy, Coins, Flame, MessageCircle, Sparkles, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import MobileBottomBar from '@/components/navigation/MobileBottomBar';
import MobileDrawer from '@/components/navigation/MobileDrawer';

// Desktop "Mehr" groups
const MORE_GROUPS = [
  { label: 'Progression', items: ['BattlePass', 'ProPass', 'Leaderboard', 'Shop'] },
  { label: 'Spiele', items: ['NeonDash', 'AstroBlitz', 'NeonRacer', 'PokemonGame'] },
  { label: 'Social', items: ['Clans', 'GroupChats', 'Friends', 'WatchPartyLobby'] },
  { label: 'Sonstiges', items: ['Feedback', 'Help'] },
];

const NAVBAR_POKEMON = [
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png',
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png',
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/151.png',
];

// Primary nav items
const PRIMARY_NAV = [
  { icon: Home, label: 'Home', href: 'Home' },
  { icon: Film, label: 'Videos', href: 'MyVideos' },
  { icon: Gamepad2, label: 'Spiele', href: 'NeonDash', color: 'text-cyan-400' },
  { icon: Users, label: 'Community', href: 'CommunityHub', color: 'text-violet-400' },
];

const SECONDARY_NAV = [
  { icon: Flame, label: 'Battle Pass', href: 'BattlePass', color: 'text-fuchsia-400', desc: 'Saison-Belohnungen' },
  { icon: Star, label: 'Pro Pass', href: 'ProPass', color: 'text-yellow-400', desc: 'Exklusive Inhalte' },
  { icon: ShoppingBag, label: 'Shop', href: 'Shop', desc: 'Items & Skins' },
  { icon: Trophy, label: 'Rangliste', href: 'Leaderboard', color: 'text-yellow-400', desc: 'Beste Spieler' },
  { icon: Zap, label: 'Neon Dash', href: 'NeonDash', color: 'text-cyan-400', desc: 'Highspeed-Arcade' },
  { icon: Gamepad2, label: 'Astro Blitz', href: 'AstroBlitz', color: 'text-purple-400', desc: 'Weltraum-Shooter' },
  { icon: Zap, label: 'Neon Racer', href: 'NeonRacer', color: 'text-violet-400', desc: 'Futuristisches Rennen' },
  { icon: Gamepad2, label: 'Pokémon', href: 'PokemonGame', color: 'text-yellow-400', badge: 'EVENT', desc: 'Sammeln & kämpfen' },
  { icon: Shield, label: 'Clans', href: 'Clans', color: 'text-emerald-400', desc: 'Teams & Gruppen' },
  { icon: MessageCircle, label: 'Chats', href: 'GroupChats', desc: 'Gruppen-Chats' },
  { icon: UserPlus, label: 'Freunde', href: 'Friends', desc: 'Freunde verwalten' },
  { icon: Users, label: 'Watch Party', href: 'WatchPartyLobby', desc: 'Gemeinsam schauen' },
  { icon: Sparkles, label: 'Feedback', href: 'Feedback', color: 'text-violet-400', desc: 'Ideen einreichen' },
  { icon: Sparkles, label: 'Hilfe', href: 'Help', color: 'text-blue-400', desc: 'Support & FAQ' },
];

const GAMER_PRIMARY_NAV = [
  { icon: Home, label: 'Home', href: 'Home' },
  { icon: Zap, label: 'Neon Dash', href: 'NeonDash', color: 'text-cyan-400' },
  { icon: Gamepad2, label: 'Pokémon', href: 'PokemonGame', color: 'text-yellow-400' },
  { icon: Flame, label: 'Battle Pass', href: 'BattlePass', color: 'text-fuchsia-400' },
  { icon: Star, label: 'Pro Pass', href: 'ProPass', color: 'text-yellow-400' },
];

const GAMER_SECONDARY_NAV = [
  { icon: Gamepad2, label: 'Astro Blitz', href: 'AstroBlitz', color: 'text-purple-400', badge: 'NEU', desc: 'Arena-Shooter' },
  { icon: Zap, label: 'Neon Racer', href: 'NeonRacer', color: 'text-violet-400', desc: 'Futuristisches Rennen' },
  { icon: Trophy, label: 'Rangliste', href: 'Leaderboard', color: 'text-yellow-400', desc: 'Beste Spieler' },
  { icon: ShoppingBag, label: 'Shop', href: 'Shop', desc: 'Items & Skins' },
];

export default function ModernNavbar({ onSearchClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();
  const { isActive: pokemonActive } = usePokemonEvent();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);
  const location = useLocation();

  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('app_user');
      return u && u !== "undefined" ? JSON.parse(u) : null;
    } catch { return null; }
  });

  const isGamer = user?.role === 'gamer';
  const activePrimaryNav = isGamer ? GAMER_PRIMARY_NAV : PRIMARY_NAV;
  const activeSecondaryNav = isGamer ? GAMER_SECONDARY_NAV : SECONDARY_NAV;

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) { navigate(`/search?q=${encodeURIComponent(q)}`); setSearchQuery(''); setSearchFocused(false); }
  };

  // Smart scroll: hide on scroll down, show on scroll up
  const handleScroll = useCallback(() => {
    const y = window.scrollY;
    setScrolled(y > 10);
    if (y > lastScrollY.current && y > 80) {
      setNavVisible(false);
    } else {
      setNavVisible(true);
    }
    lastScrollY.current = y;
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    const handleUserUpdate = () => {
      try {
        const u = localStorage.getItem('app_user');
        setUser(u && u !== "undefined" ? JSON.parse(u) : null);
      } catch { setUser(null); }
    };
    window.addEventListener('user-updated', handleUserUpdate);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('user-updated', handleUserUpdate);
    };
  }, [handleScroll]);

  useEffect(() => {
    const handler = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('app_user');
    window.dispatchEvent(new Event('user-updated'));
    window.location.href = createPageUrl('SignIn');
  };

  const isActive = (href) => location.pathname.includes(href);

  return (
    <>
      {/* ── TOP NAV ── */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: navVisible ? 0 : -100 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-colors duration-300",
          scrolled ? "border-b border-white/[0.05]" : "bg-transparent"
        )}
        style={scrolled ? { background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } : {}}
      >
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-14 md:h-16 gap-4">

            {/* Pokémon sprites */}
            {pokemonActive && (
              <div className="absolute bottom-0 left-0 right-0 overflow-hidden h-0 pointer-events-none">
                {NAVBAR_POKEMON.map((src, i) => (
                  <motion.img key={i} src={src} alt="" className="absolute bottom-0 w-6 h-6"
                    style={{ imageRendering: 'pixelated' }}
                    initial={{ x: '-10vw' }} animate={{ x: '110vw' }}
                    transition={{ duration: 12 + i * 3, delay: i * 4, repeat: Infinity, ease: 'linear' }}
                  />
                ))}
              </div>
            )}

            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-2 shrink-0 group">
              <div className="relative w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #06b6d4, #7c3aed)', boxShadow: '0 0 16px rgba(6,182,212,0.3)' }}>
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" style={{ marginLeft: 1 }}>
                  <path d="M8 5.14v14l11-7-11-7z" />
                </svg>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-black text-white tracking-tight">7B Hub</span>
                <span className="text-[8px] font-black tracking-[0.2em] uppercase bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">2.0</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {activePrimaryNav.map((item) => (
                <Link key={item.href} to={createPageUrl(item.href)}>
                  <button className={cn(
                    "relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200",
                    isActive(item.href)
                      ? "text-white"
                      : item.color ? `${item.color} hover:text-white hover:bg-white/[0.06]` : "text-white/60 hover:text-white hover:bg-white/[0.06]"
                  )}>
                    {isActive(item.href) && (
                      <span className="absolute inset-0 rounded-lg bg-white/[0.08] border border-white/[0.1]" />
                    )}
                    <item.icon className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">{item.label}</span>
                  </button>
                </Link>
              ))}

              {/* Mehr Dropdown */}
              <div className="relative" ref={moreRef}>
                <button
                  onClick={() => setMoreOpen(!moreOpen)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200",
                    moreOpen ? "bg-white/[0.08] text-white" : "text-white/40 hover:text-white hover:bg-white/[0.04]"
                  )}
                >
                  Mehr
                  <ChevronDown className={cn("w-3 h-3 transition-transform", moreOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {moreOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden"
                      style={{ width: 440, background: 'rgba(10,10,16,0.96)', backdropFilter: 'blur(32px)' }}
                    >
                      <div className="grid grid-cols-2 p-2 gap-0.5">
                        {MORE_GROUPS.map((group) => {
                          const groupItems = activeSecondaryNav.filter(i => group.items.includes(i.href));
                          if (!groupItems.length) return null;
                          return (
                            <div key={group.label} className="p-2">
                              <p className="text-white/20 text-[9px] font-black uppercase tracking-widest mb-1.5 px-1">{group.label}</p>
                              {groupItems.map((item) => (
                                <Link key={item.href} to={createPageUrl(item.href)} onClick={() => setMoreOpen(false)}>
                                  <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-white/[0.06] transition-colors text-left">
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-white/[0.04]">
                                      <item.icon className={cn("w-3.5 h-3.5", item.color || "text-white/40")} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-white/80 text-sm font-medium">{item.label}</span>
                                        {item.badge && <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md bg-orange-500 text-white leading-none">{item.badge}</span>}
                                      </div>
                                      {item.desc && <p className="text-white/25 text-[10px] leading-tight">{item.desc}</p>}
                                    </div>
                                  </button>
                                </Link>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Desktop search */}
              <form onSubmit={handleSearch} className="hidden md:flex items-center">
                <div className={cn(
                  'flex items-center gap-2 h-9 rounded-xl border transition-all duration-200 overflow-hidden',
                  searchFocused
                    ? 'w-52 bg-white/[0.06] border-white/15'
                    : 'w-32 bg-white/[0.03] border-white/[0.06] hover:border-white/10'
                )}>
                  <Search className="w-3.5 h-3.5 text-white/30 shrink-0 ml-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    placeholder="Suchen…"
                    className="flex-1 bg-transparent text-white text-xs placeholder:text-white/25 outline-none pr-3 min-w-0"
                  />
                </div>
              </form>

              {/* Mobile search */}
              <button
                onClick={onSearchClick}
                className="md:hidden h-9 w-9 flex items-center justify-center rounded-xl bg-white/[0.04] text-white/50 active:scale-95 transition-all"
              >
                <Search className="w-4 h-4" />
              </button>

              {user ? (
                <>
                  {/* Tokens - desktop */}
                  <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-yellow-500/[0.08] border border-yellow-500/15 text-yellow-400 text-xs font-bold">
                    <Coins className="w-3.5 h-3.5" />
                    <span>{user.tokens ? user.tokens.toLocaleString() : 0}</span>
                  </div>

                  {/* Upload - desktop */}
                  {!isGamer && (
                    <Link to={createPageUrl('UploadSelect')} className="hidden md:block">
                      <button className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] transition-colors text-white text-xs font-semibold">
                        <Upload className="w-3.5 h-3.5" />Upload
                      </button>
                    </Link>
                  )}

                  {/* Notifications */}
                  <Link to={createPageUrl('Profile')}>
                    <button className="relative h-9 w-9 flex items-center justify-center rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-colors text-white/50 hover:text-white">
                      <Bell className="w-4 h-4" />
                      <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
                    </button>
                  </Link>

                  {/* User dropdown - desktop */}
                  <div className="hidden md:block relative group">
                    <button className="flex items-center gap-2 h-9 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-colors">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center overflow-hidden shrink-0">
                        {user.avatar_url
                          ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                          : <User className="w-3 h-3 text-white" />
                        }
                      </div>
                      <span className="text-white/70 text-xs font-semibold max-w-[80px] truncate">{user.username}</span>
                    </button>

                    <div className="absolute top-full right-0 mt-2 w-56 rounded-2xl border border-white/[0.08] shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden"
                      style={{ background: 'rgba(10,10,16,0.96)', backdropFilter: 'blur(32px)' }}>
                      {/* XP bar */}
                      {(() => {
                        const lvl = user.bp_level || 1;
                        const xp = user.bp_xp || 0;
                        const xpNeeded = 1000;
                        const pct = Math.min((xp / xpNeeded) * 100, 100);
                        return (
                          <Link to={createPageUrl('BattlePass')}>
                            <div className="px-4 py-3 border-b border-white/[0.05] hover:bg-white/[0.03] transition-colors">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-fuchsia-300 text-xs font-bold flex items-center gap-1"><Flame className="w-3 h-3" />Level {lvl}</span>
                                <span className="text-white/20 text-[10px]">{xp}/{xpNeeded}</span>
                              </div>
                              <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #d946ef, #7c3aed)' }} />
                              </div>
                            </div>
                          </Link>
                        );
                      })()}
                      <Link to={createPageUrl('Profile')}>
                        <button className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-white/[0.04] transition-colors text-white/70 text-sm">
                          <User className="w-4 h-4 text-white/40" />Profil
                        </button>
                      </Link>
                      <Link to={createPageUrl('Settings')}>
                        <button className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-white/[0.04] transition-colors text-white/70 text-sm">
                          <Settings className="w-4 h-4 text-white/40" />Einstellungen
                        </button>
                      </Link>
                      {user.role === 'admin' && (
                        <Link to={createPageUrl('Admin')}>
                          <button className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-cyan-500/[0.06] transition-colors border-t border-white/[0.05] text-cyan-400 text-sm">
                            <Shield className="w-4 h-4" />Admin
                          </button>
                        </Link>
                      )}
                      <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-red-500/[0.06] transition-colors border-t border-white/[0.05] text-red-400 text-sm">
                        <LogOut className="w-4 h-4" />Ausloggen
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to={createPageUrl('SignIn')}>
                    <Button className="h-9 px-4 text-xs font-bold rounded-xl">Anmelden</Button>
                  </Link>
                  <Link to={createPageUrl('Register')} className="hidden sm:block">
                    <Button variant="outline" className="h-9 px-4 text-xs font-bold rounded-xl border-white/15 text-white hover:bg-white/[0.06]">Registrieren</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile bottom bar */}
      {user && (
        <MobileBottomBar
          navItems={activePrimaryNav}
          isActive={isActive}
          onMenuOpen={() => setMobileMenuOpen(true)}
          menuOpen={mobileMenuOpen}
        />
      )}

      {/* Mobile drawer */}
      <MobileDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={user}
        isGamer={isGamer}
        navItems={[...activePrimaryNav, ...activeSecondaryNav]}
        isActive={isActive}
        onLogout={handleLogout}
      />
    </>
  );
}