import './App.css'
import React from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NeonBossRaid from './pages/NeonBossRaid';
import AstroBlitz from './pages/AstroBlitz';
import VoidRift from './pages/VoidRift';
import UpcomingTerms from './pages/UpcomingTerms';
import PokemonCollection from './pages/PokemonCollection';
import ParentsGuide from './pages/ParentsGuide';
import HallOfFame from './pages/HallOfFame';
import ShardShop from './pages/ShardShop';
import AdminContests from './pages/AdminContests';
import StoryMode from './pages/StoryMode';
import PokemonDex from './pages/PokemonDex';
import HelpPage from './pages/HelpPage';
import SearchPage from './pages/SearchPage';
import GamerGuard from './components/GamerGuard';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

// Pages blocked for the "gamer" role
const GAMER_BLOCKED_PAGES = new Set([
  'Live','GoLive','Watch','MyVideos','Upload','UploadSelect','UploadShort',
  'Clans','ClanDetail','Friends','Messages','GroupChats','WatchParty','WatchPartyLobby',
  'Forum','ForumThread','CommunityHub','CreatorDashboard','CreatorProfile',
  'Shorts','Snaps','MerchShop','Donate','Playlists','PlaylistDetail',
  'Feedback','Achievements',
]);

function GamerRouteGuard({ pageName, children }) {
  const user = React.useMemo(() => {
    try {
      const u = localStorage.getItem('app_user');
      return u && u !== 'undefined' ? JSON.parse(u) : null;
    } catch { return null; }
  }, []);
  if (user?.role === 'gamer' && GAMER_BLOCKED_PAGES.has(pageName)) {
    return <GamerGuard>{null}</GamerGuard>;
  }
  return children;
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Render the main app (using custom AppUser login system instead of Base44 auth)
  return (
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <GamerRouteGuard pageName={path}>
                <Page />
              </GamerRouteGuard>
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="/ForgotPassword" element={<LayoutWrapper currentPageName="ForgotPassword"><ForgotPassword /></LayoutWrapper>} />
      <Route path="/ResetPassword" element={<LayoutWrapper currentPageName="ResetPassword"><ResetPassword /></LayoutWrapper>} />
      <Route path="/NeonBossRaid" element={<NeonBossRaid />} />
      <Route path="/AstroBlitz" element={<AstroBlitz />} />
      <Route path="/VoidRift" element={<VoidRift />} />
      <Route path="/UpcomingTerms" element={<LayoutWrapper currentPageName="UpcomingTerms"><UpcomingTerms /></LayoutWrapper>} />
      <Route path="/ParentsGuide" element={<LayoutWrapper currentPageName="ParentsGuide"><ParentsGuide /></LayoutWrapper>} />
      <Route path="/HallOfFame" element={<LayoutWrapper currentPageName="HallOfFame"><HallOfFame /></LayoutWrapper>} />
      <Route path="/PokemonCollection" element={<LayoutWrapper currentPageName="PokemonCollection"><PokemonCollection /></LayoutWrapper>} />
      <Route path="/ShardShop" element={<ShardShop />} />
      <Route path="/AdminContests" element={<LayoutWrapper currentPageName="AdminContests"><AdminContests /></LayoutWrapper>} />
      <Route path="/StoryMode" element={<LayoutWrapper currentPageName="StoryMode"><StoryMode /></LayoutWrapper>} />
      <Route path="/PokemonDex" element={<LayoutWrapper currentPageName="PokemonDex"><PokemonDex /></LayoutWrapper>} />
      <Route path="/Help" element={<LayoutWrapper currentPageName="Help"><HelpPage /></LayoutWrapper>} />
      <Route path="/search" element={<LayoutWrapper currentPageName="Search"><SearchPage /></LayoutWrapper>} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <VisualEditAgent />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App