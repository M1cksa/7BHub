import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Play, Sparkles, FileText, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import ModernVideoCard from '@/components/modern/ModernVideoCard';
import CategoryPill from '@/components/modern/CategoryPill';
import FloatingActionBar from '@/components/home/FloatingActionBar';
import PullToRefresh from '@/components/mobile/PullToRefresh';
import PageTransition from '@/components/mobile/PageTransition';
import DonorCelebrationAnimation from '@/components/DonorCelebrationAnimation';
import HubHeroSection from '@/components/home/HubHeroSection';
import PlatformHighlights from '@/components/home/PlatformHighlights';
import GamerHomePage from '@/components/home/GamerHomePage';
import { Suspense, lazy } from 'react';

const PersonalizedFeed = lazy(() => import('@/components/PersonalizedFeed'));
const CreatorStories = lazy(() => import('@/components/CreatorStories'));
const AdDisplay = lazy(() => import('@/components/AdDisplay'));
const PokemonHomeBanner = lazy(() => import('@/components/pokemon/PokemonHomeBanner'));
const PokemonPageDecor = lazy(() => import('@/components/pokemon/PokemonPageDecor'));
import { usePokemonEvent } from '@/components/pokemon/PokemonEventContext';

export default function Home() {
  const { isActive: pokemonActive } = usePokemonEvent();
  const [viewMode, setViewMode] = useState('all');
  const [versionTab, setVersionTab] = useState('v2');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [termsLoading, setTermsLoading] = useState(false);
  const [showDonorCelebration, setShowDonorCelebration] = useState(false);
  const [showWelcomeReward, setShowWelcomeReward] = useState(false);

  const lw = useMemo(() => {try {const s = localStorage.getItem('lightweight_mode_v2'); return s !== null ? s === 'true' : true;} catch {return true;}}, []);

  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('app_user');
      return u && u !== 'undefined' ? JSON.parse(u) : null;
    } catch {return null;}
  });

  const [secondaryReady, setSecondaryReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setSecondaryReady(true), 2000); return () => clearTimeout(t); }, []);

  const { data: videos = [], isLoading: videosLoading, refetch: refetchVideos } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const vids = await base44.entities.Video.list('-created_date', 25);
      return Array.isArray(vids) ? vids : [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1
  });

  const { data: activeBoosts = [] } = useQuery({
    queryKey: ['activeBoosts'],
    queryFn: async () => {
      const all = await base44.entities.VideoBoost.list('-created_date', 20);
      return all.filter((b) => new Date(b.expires_at) > new Date());
    },
    enabled: !!user && secondaryReady,
    staleTime: 5 * 60 * 1000,
    refetchInterval: false
  });

  const { data: termsConfigs = [] } = useQuery({
    queryKey: ['termsConfig'],
    queryFn: async () => base44.entities.TermsConfig.list('-created_date', 1),
    enabled: !!user
  });
  const termsConfig = termsConfigs[0] || { current_version: '1.0' };

  const handleRefresh = () => refetchVideos();

  const videoList = useMemo(() => Array.isArray(videos) ? videos.filter((v) => v?.video_url && v?.id) : [], [videos]);

  const liveNow = [];

  const filterByAudience = useCallback((list) => {
    if (!user) return list;
    const group = user.audience_group;
    if (user.role === 'admin') return list;
    if (!group) return list.filter((v) => !v.audience || v.audience === 'all' || v.audience === 'mixed');
    return list.filter((v) => v.audience === 'all' || v.audience === 'mixed' || v.audience === group);
  }, [user?.role, user?.audience_group]);

  const V2_CUTOFF = new Date('2026-03-03T00:00:00Z');
  const v2Videos = useMemo(() => videoList.filter((v) => new Date(v.created_date) >= V2_CUTOFF), [videoList]);
  const v1Videos = useMemo(() => videoList.filter((v) => new Date(v.created_date) < V2_CUTOFF), [videoList]);

  const trendingVideos = useMemo(() => [...v2Videos].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 12), [v2Videos]);
  const newVideos = useMemo(() => [...v2Videos].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 12), [v2Videos]);

  const isInTrialPhase = () => {
    if (!user || user.role === 'admin' || user.trial_completed) return false;
    return Date.now() - new Date(user.created_date).getTime() < 86400000;
  };

  const boostedVideoIds = useMemo(() => new Set(activeBoosts.map((b) => b.video_id)), [activeBoosts]);

  const displayedVideos = useMemo(() => {
    if (versionTab === 'v1') {
      let filtered = filterByAudience(v1Videos);
      if (selectedCategory !== 'all') filtered = filtered.filter((v) => v.category === selectedCategory);
      return filtered.slice(0, 24);
    }
    let filtered = v2Videos;
    if (viewMode === 'trending') filtered = trendingVideos;
    else if (viewMode === 'new') filtered = newVideos;
    filtered = filterByAudience(filtered);
    if (selectedCategory !== 'all') filtered = filtered.filter((v) => v.category === selectedCategory);
    if (isInTrialPhase()) filtered = filtered.filter((v) => !v.is_secured);
    filtered = [...filtered].sort((a, b) => {
      const aBoost = boostedVideoIds.has(a.id) ? 1 : 0;
      const bBoost = boostedVideoIds.has(b.id) ? 1 : 0;
      return bBoost - aBoost;
    });
    return filtered.slice(0, 24);
  }, [versionTab, viewMode, selectedCategory, trendingVideos, liveNow, newVideos, v2Videos, v1Videos, user, boostedVideoIds]);

  const featuredVideo = useMemo(() => {
    const safeLive = filterByAudience(liveNow);
    if (safeLive[0]) return safeLive[0];
    const safeAll = filterByAudience(videoList);
    return [...safeAll].sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
  }, [liveNow, videoList, filterByAudience]);

  const handleUserUpdate = (updated) => setUser(updated);
  useEffect(() => {
    if (user) {
      const userVersion = user.agreed_terms_version || (user.agreed_to_terms ? '1.0' : null);
      if (userVersion !== termsConfig.current_version && userVersion !== termsConfig.upcoming_version) {
        setShowTermsDialog(true);
      } else if (termsConfig.upcoming_version && userVersion !== termsConfig.upcoming_version) {
        if (!sessionStorage.getItem('dismissed_upcoming_terms_' + termsConfig.upcoming_version)) {
          setShowTermsDialog(true);
        }
      } else {
        setShowTermsDialog(false);
      }
    }
  }, [user, termsConfig]);

  useEffect(() => {
    if (user && user.id) {
      base44.entities.AppUser.get(user.id).
      then((dbUser) => {
        if (dbUser) {
          localStorage.setItem('app_user', JSON.stringify(dbUser));
          setUser(dbUser);
        }
      }).
      catch(() => {});
    }
    const handleGlobalUserUpdate = () => {
      try {
        const u = localStorage.getItem('app_user');
        if (u && u !== 'undefined') setUser(JSON.parse(u));
      } catch (e) {}
    };
    window.addEventListener('user-updated', handleGlobalUserUpdate);
    return () => window.removeEventListener('user-updated', handleGlobalUserUpdate);
  }, []);

  useEffect(() => {
    if (user && !user.welcome_reward_claimed) {
      setShowWelcomeReward(true);
    }
  }, [user?.id]);

  const handleClaimWelcomeReward = async () => {
    try {
      await base44.entities.AppUser.update(user.id, {
        tokens: (user.tokens || 0) + 1000,
        welcome_reward_claimed: true
      });
      const updated = { ...user, tokens: (user.tokens || 0) + 1000, welcome_reward_claimed: true };
      localStorage.setItem('app_user', JSON.stringify(updated));
      setUser(updated);
      localStorage.setItem('7bhub_2_0_welcome_reward', 'true');
      setShowWelcomeReward(false);
      window.dispatchEvent(new CustomEvent('token-reward', { detail: { amount: 1000, source: 'Willkommensgeschenk', rarity: 'legendary' } }));
    } catch (e) {
      console.error('Welcome Reward Error:', e);
      toast.error('Fehler beim Einsammeln der Belohnung.');
    }
  };

  useEffect(() => {
    if (!user?.is_donor) return;
    if (!localStorage.getItem('donor_celebration_shown')) {
      setShowDonorCelebration(true);
      localStorage.setItem('donor_celebration_shown', 'true');
    }
  }, [user?.is_donor]);

  const handleAgreeToTerms = async () => {
    setTermsLoading(true);
    const versionToAgree = user?.agreed_terms_version === termsConfig.current_version && termsConfig.upcoming_version ?
    termsConfig.upcoming_version :
    termsConfig.current_version;
    try {
      await base44.entities.AppUser.update(user.id, {
        agreed_to_terms: true,
        agreed_to_video_policy: true,
        agreed_terms_version: versionToAgree,
        terms_agreed_at: new Date().toISOString()
      });
      const updated = { ...user, agreed_to_terms: true, agreed_to_video_policy: true, agreed_terms_version: versionToAgree };
      localStorage.setItem('app_user', JSON.stringify(updated));
      setUser(updated);
      setShowTermsDialog(false);
      toast.success('Danke für deine Zustimmung!');
    } catch (error) {
      console.error('Terms Update Error:', error);
      toast.error('Fehler beim Speichern. Bitte versuche es erneut.');
    }
    setTermsLoading(false);
  };

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
        <div className="fixed inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-950 via-black to-violet-950" />
          <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-[200px]" />
          <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-violet-500/15 rounded-full blur-[200px]" />
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full relative z-10">
          <div className="rounded-3xl p-10 bg-white/[0.05] ring-1 ring-white/15 backdrop-blur-2xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(6,182,212,0.4)]">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2">Willkommen auf 7B Hub</h1>
            <p className="text-white/60 text-base mb-8">Videos, Spiele, Community – alles an einem Ort.</p>
            <div className="flex flex-col gap-3">
              <Link to={createPageUrl('SignIn')}>
                <Button className="w-full h-14 text-base font-bold rounded-2xl bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 shadow-xl shadow-cyan-500/25">
                  Jetzt Anmelden
                </Button>
              </Link>
              <Link to={createPageUrl('Register')}>
                <Button variant="outline" className="w-full h-14 text-base font-bold rounded-2xl border-white/20 text-white hover:bg-white/10 hover:border-white/35">
                  Kostenlosen Account erstellen
                </Button>
              </Link>
            </div>
            <p className="text-white/30 text-xs mt-5">Kostenlos · Keine Kreditkarte nötig</p>
          </div>
        </motion.div>
      </div>);

  }

  if (videosLoading && videos.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>);
  }

  // Gamer role: show dedicated games-only home
  if (user?.role === 'gamer') {
    return <GamerHomePage user={user} />;
  }

  return (
    <PageTransition>
      <DonorCelebrationAnimation show={showDonorCelebration} onComplete={() => setShowDonorCelebration(false)} />

      <div className="min-h-screen relative">

        {/* Heavy blur orbs removed for performance */}

        {/* Welcome Reward Dialog */}
        <Dialog open={showWelcomeReward} onOpenChange={setShowWelcomeReward}>
          <DialogContent className="bg-black/90 backdrop-blur-3xl border-cyan-500/50 text-center max-w-md p-8 sm:p-12 overflow-hidden shadow-[0_0_100px_rgba(6,182,212,0.3)]">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-violet-500/20 pointer-events-none" />
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.6 }} className="relative z-10">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(250,204,21,0.6)]">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-violet-400">7B Hub 2.0</h2>
              <p className="text-white/80 text-lg mb-6">Willkommen in der neuen Ära! Als kleines Dankeschön erhältst du:</p>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                <p className="text-5xl font-black text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]">1.000</p>
                <p className="text-yellow-200/70 font-bold uppercase tracking-widest mt-1">Tokens</p>
              </div>
              <Button onClick={handleClaimWelcomeReward} className="w-full h-14 text-lg font-black bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 rounded-2xl shadow-xl hover:shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95">
                Einsammeln & Loslegen
              </Button>
            </motion.div>
          </DialogContent>
        </Dialog>

        {/* Terms Dialog */}
        <Dialog open={showTermsDialog} onOpenChange={(open) => {
          const userVersion = user?.agreed_terms_version || (user?.agreed_to_terms ? '1.0' : null);
          const isMandatory = userVersion !== termsConfig.current_version;
          if (!open && isMandatory) {
            window.location.href = createPageUrl('SignIn');
          } else if (!open) {
            sessionStorage.setItem('dismissed_upcoming_terms_' + termsConfig.upcoming_version, 'true');
            setShowTermsDialog(false);
          }
        }}>
          <DialogContent className="bg-slate-900/95 backdrop-blur-3xl border-white/10 text-white max-w-xl p-0 overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 p-6 sm:p-8 border-b border-white/10 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/20 rounded-full blur-[40px]" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black mb-1">
                    {user?.agreed_terms_version === termsConfig.current_version && termsConfig.upcoming_version ?
                    'Bevorstehende AGB-Änderung' :
                    'Aktualisierte Nutzungsbedingungen'}
                  </DialogTitle>
                  <p className="text-cyan-300 text-sm font-bold tracking-wide">
                    VERSION {termsConfig.upcoming_version && user?.agreed_terms_version === termsConfig.current_version ? termsConfig.upcoming_version : termsConfig.current_version}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 sm:p-8 space-y-6">
              {termsConfig.upcoming_version && user?.agreed_terms_version === termsConfig.current_version ?
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3 text-amber-200 text-sm">
                  <CalendarDays className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400" />
                  <p>
                    Am <strong>{termsConfig.upcoming_date ? new Date(termsConfig.upcoming_date).toLocaleDateString('de-DE') : 'einem zukünftigen Datum'}</strong> treten unsere neuen AGB in Kraft. 
                    Du kannst den Änderungen schon jetzt zustimmen, um später nicht unterbrochen zu werden.
                  </p>
                </div> :

              <p className="text-white/70 text-sm leading-relaxed">
                  Um die Plattform weiterhin nutzen zu können, bitten wir dich, unsere aktualisierten Bedingungen zu akzeptieren. Du findest die vollständigen Details unter <a href="https://7bhub.com/Terms" target="_blank" className="text-cyan-400 hover:underline">7bhub.com/Terms</a>.
                </p>
              }
              {termsConfig.summary_of_changes &&
              <div className="bg-black/40 rounded-2xl border border-white/5 p-5">
                  <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    Was ist neu? (Zusammenfassung)
                  </h4>
                  <div className="text-white/60 text-sm space-y-2 whitespace-pre-wrap leading-relaxed pl-1 border-l-2 border-cyan-500/30">
                    {termsConfig.summary_of_changes}
                  </div>
                </div>
              }
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                {user?.agreed_terms_version === termsConfig.current_version && termsConfig.upcoming_version ?
                <Button variant="outline" onClick={() => {
                  sessionStorage.setItem('dismissed_upcoming_terms_' + termsConfig.upcoming_version, 'true');
                  setShowTermsDialog(false);
                }} className="sm:flex-1 h-12 border-white/10 hover:bg-white/5">
                    Später erinnern
                  </Button> :

                <Button variant="outline" onClick={() => {
                  localStorage.removeItem('app_user');
                  base44.auth.logout(createPageUrl('SignIn'));
                }} className="sm:flex-1 h-12 border-white/10 hover:bg-white/5 text-white/50 hover:text-white">
                    Abmelden
                  </Button>
                }
                <Button
                  onClick={handleAgreeToTerms}
                  disabled={termsLoading}
                  className="sm:flex-[2] h-12 font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-xl shadow-cyan-500/20">
                  
                  {termsLoading ? 'Wird gespeichert...' : 'Ich stimme den AGB zu'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <PullToRefresh onRefresh={handleRefresh}>
          <div className="relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 pt-4 pb-8">

              {/* ── 1. HERO ── */}
              <div className="mb-6">
                <HubHeroSection user={user} />
              </div>

              {/* ── 2. PLATFORM NAV GRID ── */}
              <div className="mb-7">
                <PlatformHighlights lw={lw} />
              </div>



              {/* ── 5. POKEMON (conditional) ── */}
              <Suspense fallback={<div />}>
                {pokemonActive && <div className="mb-6"><PokemonHomeBanner user={user} /></div>}
                <PokemonPageDecor page="home" />
              </Suspense>



              {/* ── 7. STORIES ── */}
              <div className="mb-6">
                <Suspense fallback={<div className="h-20 rounded-full bg-white/5 animate-pulse" />}>
                  <CreatorStories user={user} />
                </Suspense>
              </div>

              {/* ── 8. AD ── */}
              <div className="mb-5">
                <Suspense fallback={<div className="h-16 rounded-2xl bg-white/5 animate-pulse" />}>
                  <AdDisplay placement="home_banner" />
                </Suspense>
              </div>

              {/* ── 13. VIDEO SECTION CONTROLS ── */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <FloatingActionBar activeView={viewMode} onViewChange={setViewMode} />
                <div className="flex gap-1.5 p-1 bg-white/5 rounded-xl border border-white/8 shrink-0">
                  {[
                  { id: 'v2', label: '✨ 2.0' },
                  { id: 'v1', label: '🕹️ Archiv' }].
                  map((tab) =>
                  <button key={tab.id} onClick={() => setVersionTab(tab.id)}
                  className={`relative px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${versionTab === tab.id ? 'text-white' : 'text-white/35 hover:text-white/60'}`}>
                      {versionTab === tab.id &&
                    <motion.div layoutId="versionTabIndicator" className="absolute inset-0 rounded-lg"
                    style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.18), rgba(168,85,247,0.12))', border: '1px solid rgba(6,182,212,0.3)' }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />
                    }
                      <span className="relative z-10">{tab.label}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Category pills */}
              <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1 mb-5">
                <CategoryPill category="all" active={selectedCategory === 'all'} onClick={() => setSelectedCategory('all')} />
                {['gaming', 'music', 'education', 'entertainment', 'technology', 'art', 'lifestyle', 'sports'].map((cat) =>
                <CategoryPill key={cat} category={cat} active={selectedCategory === cat} onClick={() => setSelectedCategory(cat)} />
                )}
              </div>

              {/* ── 15. VIDEO GRID ── */}
              {displayedVideos.length > 0 ?
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {displayedVideos.map((video, i) =>
                <div key={video.id} className="relative">
                      {boostedVideoIds.has(video.id) &&
                  <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-1.5 py-0.5 bg-yellow-500 rounded-full text-black text-[9px] font-black shadow-lg">
                          ⚡ BOOST
                        </div>
                  }
                      <ModernVideoCard video={video} index={i} />
                    </div>
                )}
                </div> :
              <div className="flex flex-col items-center justify-center py-16 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <Play className="w-8 h-8 text-white/10 mb-2" />
                  <p className="text-white/20 text-sm">Keine Inhalte verfügbar</p>
                </div>
              }

              {/* ── 16. PERSONALIZED FEED ── */}
              <div className="mt-10">
                <Suspense fallback={<div className="h-56 rounded-2xl bg-white/5 animate-pulse" />}>
                  <PersonalizedFeed user={user} />
                </Suspense>
              </div>

            </div>
          </div>
        </PullToRefresh>
      </div>
    </PageTransition>);

}