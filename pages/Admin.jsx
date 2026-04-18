import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  ArrowLeft, Shield, Users, Video, MessageSquare,
  Trash2, Eye, EyeOff, Search, AlertTriangle, HelpCircle,
  CheckCircle, Clock, Mail, Send, Sparkles, Edit2,
  Crown, User as UserIcon, Check, X, Calendar, Flag,
  FileText, Wrench, Lock, Unlock, MoreVertical, Bell,
  Menu, ChevronDown, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import AnimatedBackground from '@/components/streaming/AnimatedBackground';
import AdminServerStatus from '@/components/AdminServerStatus';
import AdminEventManager from '@/components/AdminEventManager';
import PokemonAdminPanel from '@/components/pokemon/PokemonAdminPanel';
import GrantTokensDialog from '@/components/admin/GrantTokensDialog';
import GrantTokensToAllDialog from '@/components/admin/GrantTokensToAllDialog';
import AdminTermsManager from '@/components/admin/AdminTermsManager';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import AdminAssistantImageUpload from '@/components/admin/AdminAssistantImageUpload';

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketResponses, setTicketResponses] = useState({});
  const [contactMessages, setContactMessages] = useState({});
  const [showPasswords, setShowPasswords] = useState({});
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [lockReason, setLockReason] = useState('');
  const [showGrantTokensDialog, setShowGrantTokensDialog] = useState(false);
  const [showGrantTokensToAllDialog, setShowGrantTokensToAllDialog] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [newUpdate, setNewUpdate] = useState({ title: '', description: '', version: '', priority: 'medium' });
  const [newBroadcast, setNewBroadcast] = useState({ title: '', message: '', emoji: '📢', color: '#06b6d4', priority: 'info' });
  const [newWarning, setNewWarning] = useState({ title: 'Du hast eine Verwarnung bekommen', message: '' });
  const [selectedWarningUsers, setSelectedWarningUsers] = useState([]);
  const [warningSearchQuery, setWarningSearchQuery] = useState('');
  const [warningSending, setWarningSending] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('app_user');
      if (stored) setUser(JSON.parse(stored));
    } catch(e) {}
    setIsLoading(false);
  }, []);

  const { data: platformLocks = [], refetch: refetchLock } = useQuery({
    queryKey: ['platformLock'],
    queryFn: () => base44.entities.PlatformLock.list('-created_date', 1),
  });
  const currentLock = platformLocks[0];
  const isLocked = currentLock?.is_locked === true;

  const { data: videos = [] } = useQuery({ queryKey: ['adminVideos'], queryFn: () => base44.entities.Video.list('-created_date', 200) });
  const { data: users = [] } = useQuery({ queryKey: ['adminUsers'], queryFn: () => base44.entities.AppUser.list('-created_date', 500), enabled: user?.role === 'admin' });
  const { data: messages = [] } = useQuery({ queryKey: ['adminMessages'], queryFn: () => base44.entities.ChatMessage.list('-created_date', 200) });
  const { data: tickets = [] } = useQuery({ queryKey: ['adminTickets'], queryFn: () => base44.entities.Ticket.list('-created_date', 100), enabled: user?.role === 'admin' });
  const { data: reports = [] } = useQuery({ queryKey: ['adminReports'], queryFn: () => base44.entities.Report.list('-created_date', 200), enabled: user?.role === 'admin' });
  const { data: updates = [] } = useQuery({ queryKey: ['adminUpdates'], queryFn: () => base44.entities.UpdateNotification.list('-created_date', 50), enabled: user?.role === 'admin' });
  const { data: broadcasts = [] } = useQuery({ queryKey: ['adminBroadcasts'], queryFn: () => base44.entities.AdminBroadcast.list('-created_date', 50), enabled: user?.role === 'admin' });
  const { data: clans = [] } = useQuery({ queryKey: ['adminClans'], queryFn: () => base44.entities.Clan.list('-created_date', 100) });

  // Mutations
  const deleteVideoMutation = useMutation({ mutationFn: (id) => base44.entities.Video.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminVideos'] }) });
  const deleteMessageMutation = useMutation({ mutationFn: (id) => base44.entities.ChatMessage.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminMessages'] }) });
  const updateTicketMutation = useMutation({ mutationFn: ({ id, data }) => base44.entities.Ticket.update(id, data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminTickets'] }) });
  const approveUserMutation = useMutation({ mutationFn: (userId) => base44.entities.AppUser.update(userId, { approved: true }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminUsers'] }) });
  const updateReportMutation = useMutation({ mutationFn: ({ id, status }) => base44.entities.Report.update(id, { status }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminReports'] }) });
  const sendContactMutation = useMutation({
    mutationFn: async ({ email, subject, body }) => base44.integrations.Core.SendEmail({ to: email, subject, body, from_name: '7B Hub Admin' })
  });
  const createUpdateMutation = useMutation({
    mutationFn: async (data) => {
      const upd = await base44.entities.UpdateNotification.create(data);
      try { await base44.functions.invoke('sendUpdateEmail', { updateId: upd.id }); } catch(e) {}
      return upd;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminUpdates'] })
  });
  const toggleUpdateMutation = useMutation({ mutationFn: ({ id, active }) => base44.entities.UpdateNotification.update(id, { active }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminUpdates'] }) });
  const createBroadcastMutation = useMutation({ mutationFn: (data) => base44.entities.AdminBroadcast.create(data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['adminBroadcasts'] }); setNewBroadcast({ title: '', message: '', emoji: '📢', color: '#06b6d4', priority: 'info' }); toast.success('Mitteilung gesendet!'); } });
  const toggleBroadcastMutation = useMutation({ mutationFn: ({ id, is_active }) => base44.entities.AdminBroadcast.update(id, { is_active }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminBroadcasts'] }) });
  const deleteBroadcastMutation = useMutation({ mutationFn: (id) => base44.entities.AdminBroadcast.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminBroadcasts'] }) });
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AppUser.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['adminUsers']); toast.success('Gespeichert'); setEditingUser(null); }
  });
  const deleteUserMutation = useMutation({
    mutationFn: (id) => base44.entities.AppUser.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['adminUsers']); toast.success('Nutzer gelöscht'); }
  });
  const activateSeason2Mutation = useMutation({
    mutationFn: async () => {
      const allUsers = await base44.entities.AppUser.list('-created_date', 2000);
      await Promise.all(allUsers.map(u => base44.entities.AppUser.update(u.id, {
        test_season_2: true,
        bp_level: 1,
        bp_xp: 0,
        bp_premium: false,
        bp_claimed_free: [],
        bp_claimed_premium: [],
        bp_claimed_bonus: [],
        bp_shard_claimed: [],
      })));
      return allUsers.length;
    },
    onSuccess: (count) => { queryClient.invalidateQueries(['adminUsers']); toast.success(`✅ Season 2 für ${count} Nutzer aktiviert & BP zurückgesetzt!`); }
  });

  const resetAllUserAgreementsMutation = useMutation({
    mutationFn: async () => {
      const allUsers = await base44.entities.AppUser.list('-created_date', 1000);
      await Promise.all(allUsers.map(u => base44.entities.AppUser.update(u.id, { agreed_to_terms: false, agreed_to_video_policy: false })));
      return allUsers.length;
    },
    onSuccess: (count) => { queryClient.invalidateQueries(['adminUsers']); toast.success(`${count} Nutzer zurückgesetzt`); }
  });

  const togglePlatformLock = async () => {
    if (isLocked) {
      await base44.entities.PlatformLock.update(currentLock.id, { is_locked: false });
      toast.success('Plattform freigeschaltet');
    } else {
      if (!window.confirm(`Plattform sperren?${lockReason ? '\nGrund: ' + lockReason : ''}`)) return;
      if (currentLock) await base44.entities.PlatformLock.update(currentLock.id, { is_locked: true, reason: lockReason || 'Nicht verfügbar.', locked_by: user?.username, locked_at: new Date().toISOString() });
      else await base44.entities.PlatformLock.create({ is_locked: true, reason: lockReason || 'Nicht verfügbar.', locked_by: user?.username, locked_at: new Date().toISOString() });
      toast.success('Plattform gesperrt');
    }
    refetchLock();
  };

  const handleEditUser = (u) => {
    setEditingUser(u);
    setEditForm({ username: u.username, email: u.email, bio: u.bio || '', role: u.role, tokens: u.tokens, approved: u.approved, newsletter_subscribed: u.newsletter_subscribed, is_donor: u.is_donor || false, trial_completed: u.trial_completed || false, banned: u.banned || false, ban_reason: u.ban_reason || '' });
  };

  if (isLoading) return <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center"><div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>;

  if (!user || user.role !== 'admin') return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-white">
      <div className="text-center">
        <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-400" />
        <h2 className="text-xl font-bold mb-2">Zugriff verweigert</h2>
        <Link to={createPageUrl('Home')}><Button>Zurück</Button></Link>
      </div>
    </div>
  );

  const pendingUsers = users.filter(u => !u.approved);
  const approvedUsers = users.filter(u => u.approved);
  const bannedUsers = users.filter(u => u.banned).length;
  const openTickets = tickets.filter(t => t.status === 'open').length;
  const pendingReports = reports.filter(r => r.status === 'pending').length;
  const liveCount = videos.filter(v => v.is_live).length;
  const totalViews = videos.reduce((s, v) => s + (v.views || 0), 0);
  const totalTokens = users.reduce((s, u) => s + (u.tokens || 0), 0);
  const avgTokens = users.length > 0 ? totalTokens / users.length : 0;
  const donorCount = users.filter(u => u.is_donor).length;
  const newsletterCount = users.filter(u => u.newsletter_subscribed && u.approved).length;

  const stats = { totalUsers: users.length, approvedUsers: approvedUsers.length, pendingUsers: pendingUsers.length, bannedUsers, totalVideos: videos.length, liveCount, totalViews, totalMessages: messages.length, openTickets, pendingReports, donorCount, newsletterCount, totalTokens, avgTokens };
  const counts = { pending: pendingUsers.length, users: approvedUsers.length, videos: videos.length, tickets: openTickets, reports: pendingReports, messages: messages.length };

  const filteredVideos = videos.filter(v => v.title?.toLowerCase().includes(searchQuery.toLowerCase()) || v.creator_name?.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredUsers = users.filter(u => u.username?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredMessages = messages.filter(m => m.content?.toLowerCase().includes(searchQuery.toLowerCase()) || m.sender_name?.toLowerCase().includes(searchQuery.toLowerCase()));

  const tabLabel = { dashboard: 'Dashboard', analytics: 'Analytics', pending: 'Ausstehend', users: 'Nutzer', videos: 'Videos', tickets: 'Support', reports: 'Meldungen', messages: 'Chat', updates: 'Updates', broadcast: 'Mitteilungen', warnings: 'Verwarnungen', newsletter: 'Newsletter', events: 'Events', serverstatus: 'Server', lock: 'Plattform-Sperre' };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <AnimatedBackground />

      {/* Header */}
      <div className="fixed top-16 md:top-20 left-0 right-0 z-40 bg-[#0a0a0b]/95 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-4 md:px-6 py-3">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10 w-9 h-9">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-600 to-violet-600 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-black text-white text-sm leading-none">Admin Panel</p>
                <p className="text-white/40 text-[11px]">{tabLabel[activeTab] || activeTab}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status pill */}
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${isLocked ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isLocked ? 'bg-red-400' : 'bg-emerald-400 animate-pulse'}`} />
              {isLocked ? 'Gesperrt' : 'Online'}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 gap-2 h-9 px-3 text-sm">
                  <Sparkles className="w-4 h-4" /> Tokens
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#1a1a1b] border-white/10 z-50">
                <DropdownMenuItem onClick={() => setShowGrantTokensDialog(true)} className="text-white hover:bg-white/10 cursor-pointer">
                  <Sparkles className="w-4 h-4 mr-2" /> Einzeln vergeben
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowGrantTokensToAllDialog(true)} className="text-white hover:bg-white/10 cursor-pointer">
                  <Users className="w-4 h-4 mr-2" /> Allen vergeben
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu */}
            <Button variant="ghost" size="icon" className="lg:hidden w-9 h-9 text-white/60" onClick={() => setShowMobileMenu(!showMobileMenu)}>
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile tab dropdown */}
        {showMobileMenu && (
          <div className="lg:hidden border-t border-white/5 px-4 py-3 bg-[#0f0f10]">
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(tabLabel).map(([id, label]) => (
                <button key={id} onClick={() => { setActiveTab(id); setShowMobileMenu(false); }}
                  className={`px-2 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === id ? 'bg-white/15 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Layout */}
      <div className="pt-28 md:pt-32 pb-16 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex gap-6">
          {/* Sidebar */}
          <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Search (shown for relevant tabs) */}
            {['users', 'videos', 'messages'].includes(activeTab) && (
              <div className="relative mb-5">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Suchen..." className="pl-11 bg-white/5 border-white/10 text-white placeholder:text-white/40 h-10 text-sm" />
              </div>
            )}

            {/* DASHBOARD */}
            {activeTab === 'dashboard' && (
              <AdminDashboard stats={stats} users={users} videos={videos} tickets={tickets} reports={reports} onNavigate={setActiveTab} />
            )}

            {/* ANALYTICS */}
            {activeTab === 'analytics' && (
              <AdminAnalytics stats={stats} videos={videos} users={users} />
            )}

            {/* PLATFORM LOCK */}
            {activeTab === 'lock' && (
              <div className="space-y-4">
                <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-red-400" /> Plattform-Sperre
                </h2>
                <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center gap-4 ${isLocked ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/10'}`}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${isLocked ? 'bg-red-600' : 'bg-emerald-700'}`}>
                    {isLocked ? <Lock className="w-7 h-7 text-white" /> : <Unlock className="w-7 h-7 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-white text-lg">{isLocked ? '🔒 Plattform gesperrt' : '🟢 Plattform online'}</p>
                    {isLocked && currentLock?.reason && <p className="text-red-300 text-sm mt-1">{currentLock.reason}</p>}
                    {isLocked && currentLock?.locked_by && <p className="text-white/40 text-xs mt-1">Gesperrt von: {currentLock.locked_by}</p>}
                    {!isLocked && (
                      <Input value={lockReason} onChange={e => setLockReason(e.target.value)}
                        placeholder="Sperrgrund eingeben..." className="mt-3 bg-white/5 border-white/10 text-white text-sm max-w-sm" />
                    )}
                  </div>
                  <Button onClick={togglePlatformLock} className={isLocked ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-700 hover:bg-red-600'}>
                    {isLocked ? <><Unlock className="w-4 h-4 mr-2" />Freischalten</> : <><Lock className="w-4 h-4 mr-2" />Sperren</>}
                  </Button>
                </div>
              </div>
            )}

            {/* PENDING USERS */}
            {activeTab === 'pending' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-400" /> Wartende Accounts ({pendingUsers.length})
                  </h2>
                </div>
                <div className="space-y-3">
                  {pendingUsers.map(u => (
                    <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <img src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} alt="" className="w-12 h-12 rounded-full" />
                      <div className="flex-1">
                        <p className="font-bold text-white">{u.username}</p>
                        <p className="text-white/50 text-sm">{u.email}</p>
                        <p className="text-white/40 text-xs">{new Date(u.created_date).toLocaleDateString('de-DE')}</p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button className="bg-emerald-600 hover:bg-emerald-500"><CheckCircle className="w-4 h-4 mr-2" />Freischalten</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-[#1a1a1b] border-white/10">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">"{u.username}" freischalten?</AlertDialogTitle>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-white/10 border-white/10 text-white">Abbrechen</AlertDialogCancel>
                            <AlertDialogAction onClick={() => approveUserMutation.mutate(u.id)} className="bg-emerald-600">Freischalten</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </motion.div>
                  ))}
                  {pendingUsers.length === 0 && <p className="text-white/40 text-center py-12">Keine wartenden Accounts ✓</p>}
                </div>
              </div>
            )}

            {/* USERS */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-400" /> Alle Nutzer ({filteredUsers.length})
                  </h2>
                  <div className="flex gap-2 text-xs text-white/40">
                    <span className="bg-white/5 px-2 py-1 rounded">{approvedUsers.length} aktiv</span>
                    <span className="bg-red-500/10 text-red-400 px-2 py-1 rounded">{bannedUsers} gesperrt</span>
                    <span className="bg-amber-500/10 text-amber-400 px-2 py-1 rounded">{donorCount} Spender</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {filteredUsers.map(u => (
                    <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition">
                      <div className="relative">
                        <img src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} alt="" className="w-10 h-10 rounded-full" />
                        {u.role === 'admin' && <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center"><Shield className="w-2.5 h-2.5 text-white" /></div>}
                        {u.banned && <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center"><X className="w-2.5 h-2.5 text-white" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-white text-sm truncate">{u.username}</p>
                          {u.is_donor && <span className="text-[10px] text-amber-400">⭐</span>}
                          {!u.approved && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1 rounded">Wartend</span>}
                        </div>
                        <p className="text-white/40 text-xs truncate">{u.email}</p>
                      </div>
                      <div className="hidden sm:flex items-center gap-3 text-xs text-white/40">
                        <span>{(u.tokens || 0).toLocaleString()} T</span>
                        <span>{new Date(u.created_date).toLocaleDateString('de-DE')}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => handleEditUser(u)} className="w-8 h-8 text-cyan-400 hover:bg-cyan-500/10"><Edit2 className="w-3.5 h-3.5" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => window.confirm('Wirklich löschen?') && deleteUserMutation.mutate(u.id)} className="w-8 h-8 text-red-400 hover:bg-red-500/10"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* VIDEOS */}
            {activeTab === 'videos' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Video className="w-5 h-5 text-violet-400" /> Videos ({filteredVideos.length})
                  </h2>
                  <div className="flex gap-2 text-xs">
                    {liveCount > 0 && <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded font-bold">{liveCount} LIVE</span>}
                    <span className="bg-white/5 text-white/40 px-2 py-1 rounded">{totalViews.toLocaleString()} Views</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {filteredVideos.map(video => (
                    <motion.div key={video.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="relative w-24 h-14 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={video.thumbnail_url || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=120&fit=crop'} alt="" className="w-full h-full object-cover" />
                        {video.is_live && <div className="absolute top-1 left-1 px-1 py-0.5 rounded bg-red-600 text-white text-[9px] font-bold">LIVE</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-sm truncate">{video.title}</p>
                        <p className="text-white/40 text-xs">{video.creator_name} · {(video.views || 0).toLocaleString()} Views</p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-400 hover:bg-red-500/20 w-8 h-8"><Trash2 className="w-4 h-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-[#1a1a1b] border-white/10">
                          <AlertDialogHeader><AlertDialogTitle className="text-white">Video löschen?</AlertDialogTitle></AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-white/10 border-white/10 text-white">Abbrechen</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteVideoMutation.mutate(video.id)} className="bg-red-600">Löschen</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* TICKETS */}
            {activeTab === 'tickets' && (
              <div className="space-y-4">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-cyan-400" /> Support-Tickets
                </h2>
                <div className="flex gap-2 mb-4">
                  {[['open', 'Offen', 'cyan'], ['in_progress', 'In Bearbeitung', 'amber'], ['closed', 'Geschlossen', 'emerald']].map(([s, l, c]) => (
                    <span key={s} className={`text-xs px-3 py-1 rounded-full bg-${c}-500/10 text-${c}-400`}>
                      {tickets.filter(t => t.status === s).length} {l}
                    </span>
                  ))}
                </div>
                <div className="space-y-3">
                  {tickets.map(ticket => (
                    <motion.div key={ticket.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="p-5 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold">{ticket.subject}</h3>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${ticket.priority === 'high' ? 'bg-red-500/20 text-red-400' : ticket.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-white/60'}`}>
                              {ticket.priority === 'high' ? 'Hoch' : ticket.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                            </span>
                          </div>
                          <p className="text-white/60 text-sm">{ticket.message}</p>
                          <p className="text-white/30 text-xs mt-1">Von: {ticket.user_username} · {new Date(ticket.created_date).toLocaleDateString('de-DE')}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${ticket.status === 'open' ? 'bg-cyan-500/20 text-cyan-400' : ticket.status === 'in_progress' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {ticket.status === 'open' ? 'Offen' : ticket.status === 'in_progress' ? 'In Bearbeitung' : 'Geschlossen'}
                        </span>
                      </div>
                      {ticket.admin_response && (
                        <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 mb-3">
                          <p className="text-xs text-cyan-400 font-bold mb-1">Admin-Antwort</p>
                          <p className="text-white/80 text-sm">{ticket.admin_response}</p>
                        </div>
                      )}
                      {ticket.status !== 'closed' && (
                        <div className="flex gap-2 mt-3">
                          <Input placeholder="Antworten..." value={ticketResponses[ticket.id] || ''}
                            onChange={(e) => setTicketResponses({...ticketResponses, [ticket.id]: e.target.value})}
                            className="bg-black/20 border-white/10 text-white text-sm h-9" />
                          <Button size="sm" onClick={() => updateTicketMutation.mutate({ id: ticket.id, data: { admin_response: ticketResponses[ticket.id] } })} disabled={!ticketResponses[ticket.id]} className="bg-cyan-600 h-9">Antworten</Button>
                          {ticket.status === 'open' && <Button size="sm" onClick={() => updateTicketMutation.mutate({ id: ticket.id, data: { status: 'in_progress' } })} className="bg-amber-600 h-9">Bearbeitung</Button>}
                          <Button size="sm" onClick={() => updateTicketMutation.mutate({ id: ticket.id, data: { status: 'closed' } })} className="bg-emerald-600 h-9">Schließen</Button>
                        </div>
                      )}
                      {ticket.status === 'closed' && (
                        <Button size="sm" variant="outline" onClick={() => updateTicketMutation.mutate({ id: ticket.id, data: { status: 'open' } })} className="border-white/10 mt-2 h-8 text-xs">Wieder öffnen</Button>
                      )}
                    </motion.div>
                  ))}
                  {tickets.length === 0 && <p className="text-white/40 text-center py-12">Keine Tickets vorhanden ✓</p>}
                </div>
              </div>
            )}

            {/* REPORTS */}
            {activeTab === 'reports' && (
              <div className="space-y-4">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" /> Meldungen ({pendingReports} ausstehend)
                </h2>
                <div className="space-y-3">
                  {reports.filter(r => r.reported_item_type).map(report => (
                    <motion.div key={report.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="p-5 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${report.status === 'pending' ? 'bg-red-500/20 text-red-400' : report.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                              {report.status === 'pending' ? 'Ausstehend' : report.status === 'resolved' ? 'Gelöst' : 'Abgelehnt'}
                            </span>
                            <span className="text-xs bg-white/5 px-2 py-0.5 rounded-full">{report.reported_item_type === 'video' ? '📹' : report.reported_item_type === 'user' ? '👤' : '💬'} {report.reported_item_type}</span>
                          </div>
                          <p className="font-bold text-white">{report.reason === 'spam' ? 'Spam' : report.reason === 'harassment' ? 'Belästigung' : report.reason === 'inappropriate' ? 'Unangemessen' : report.reason === 'violence' ? 'Gewalt' : 'Anderes'}</p>
                          <p className="text-white/50 text-sm mt-1">Von: <strong className="text-white">{report.reported_by_username}</strong>{report.reported_user && <> · Betrifft: <strong className="text-white">{report.reported_user}</strong></>}</p>
                          {report.description && <p className="text-white/70 text-sm bg-white/5 p-2 rounded mt-2">{report.description}</p>}
                        </div>
                        {report.status === 'pending' && (
                          <div className="flex gap-2 ml-3">
                            <Button size="sm" onClick={() => updateReportMutation.mutate({ id: report.id, status: 'resolved' })} className="bg-emerald-600 hover:bg-emerald-500 h-8 text-xs">Lösen</Button>
                            <Button size="sm" onClick={() => updateReportMutation.mutate({ id: report.id, status: 'dismissed' })} className="bg-white/5 hover:bg-white/10 border border-white/10 h-8 text-xs">Ablehnen</Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {reports.length === 0 && <p className="text-white/40 text-center py-12">Keine Meldungen ✓</p>}
                </div>
              </div>
            )}

            {/* MESSAGES */}
            {activeTab === 'messages' && (
              <div className="space-y-3">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-400" /> Chat-Nachrichten ({filteredMessages.length})
                </h2>
                {filteredMessages.map(msg => (
                  <motion.div key={msg.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <img src={msg.sender_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender_name}`} alt="" className="w-9 h-9 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{msg.sender_name}</p>
                      <p className="text-white/50 text-sm truncate">{msg.content}</p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-400 hover:bg-red-500/20 w-8 h-8"><Trash2 className="w-4 h-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-[#1a1a1b] border-white/10">
                        <AlertDialogHeader><AlertDialogTitle className="text-white">Nachricht löschen?</AlertDialogTitle></AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-white/10 border-white/10 text-white">Abbrechen</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMessageMutation.mutate(msg.id)} className="bg-red-600">Löschen</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </motion.div>
                ))}
                {filteredMessages.length === 0 && <p className="text-white/40 text-center py-12">Keine Nachrichten</p>}
              </div>
            )}

            {/* BROADCAST */}
            {activeTab === 'broadcast' && (
              <div className="space-y-6">
                <h2 className="text-xl font-black text-white flex items-center gap-2"><Bell className="w-5 h-5 text-cyan-400" /> Pop-up Mitteilungen an alle User</h2>
                <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6">
                  <h3 className="text-lg font-black text-white mb-4">📢 Neue Mitteilung erstellen</h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <Input value={newBroadcast.title} onChange={(e) => setNewBroadcast({...newBroadcast, title: e.target.value})} placeholder="Titel" className="bg-black/20 border-white/10 text-white" />
                    <div className="flex gap-2">
                      <Input value={newBroadcast.emoji} onChange={(e) => setNewBroadcast({...newBroadcast, emoji: e.target.value})} placeholder="Emoji" className="bg-black/20 border-white/10 text-white w-24" />
                      <input type="color" value={newBroadcast.color} onChange={(e) => setNewBroadcast({...newBroadcast, color: e.target.value})} className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-0 p-1" title="Akzentfarbe" />
                    </div>
                  </div>
                  <textarea value={newBroadcast.message} onChange={(e) => setNewBroadcast({...newBroadcast, message: e.target.value})} placeholder="Nachricht an alle User..." rows={3} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/40 mb-4" />
                  <div className="flex gap-2 mb-4">
                    {[['info','💬 Info','cyan'],['success','✅ News','emerald'],['warning','⚠️ Wichtig','amber'],['critical','🚨 Kritisch','red']].map(([p,l,c]) => (
                      <button key={p} onClick={() => setNewBroadcast({...newBroadcast, priority: p})} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${newBroadcast.priority === p ? `bg-${c}-600 text-white` : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>{l}</button>
                    ))}
                  </div>
                  <Button onClick={() => { if (newBroadcast.title && newBroadcast.message) createBroadcastMutation.mutate({ ...newBroadcast, is_active: true }); }} disabled={!newBroadcast.title || !newBroadcast.message} className="bg-gradient-to-r from-cyan-600 to-blue-600 w-full">
                    <Send className="w-4 h-4 mr-2" /> An alle User senden
                  </Button>
                </div>
                <div className="space-y-3">
                  <h3 className="font-black text-white/60 text-sm uppercase tracking-widest">Gesendete Mitteilungen</h3>
                  {broadcasts.map(b => (
                    <div key={b.id} className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${b.is_active ? 'bg-white/5 border-white/10' : 'bg-white/[0.02] border-white/5 opacity-50'}`}>
                      <span className="text-2xl">{b.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{b.title}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${b.priority === 'critical' ? 'bg-red-500/20 text-red-400' : b.priority === 'warning' ? 'bg-amber-500/20 text-amber-400' : b.priority === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-400'}`}>{b.priority}</span>
                        </div>
                        <p className="text-white/40 text-xs truncate">{b.message}</p>
                        <p className="text-white/20 text-[10px] mt-0.5">{new Date(b.created_date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => toggleBroadcastMutation.mutate({ id: b.id, is_active: !b.is_active })} className={b.is_active ? 'bg-red-700 hover:bg-red-600 h-8 text-xs' : 'bg-emerald-600 h-8 text-xs'}>
                          {b.is_active ? 'Deaktivieren' : 'Reaktivieren'}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteBroadcastMutation.mutate(b.id)} className="text-red-400 hover:bg-red-500/10 h-8 w-8 p-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {broadcasts.length === 0 && <p className="text-white/30 text-sm text-center py-6">Noch keine Mitteilungen</p>}
                </div>
              </div>
            )}

            {/* WARNINGS */}
            {activeTab === 'warnings' && (() => {
              const filteredForWarning = users.filter(u =>
                u.approved &&
                (u.username?.toLowerCase().includes(warningSearchQuery.toLowerCase()) ||
                  u.email?.toLowerCase().includes(warningSearchQuery.toLowerCase()))
              );
              const toggleUser = (id) => setSelectedWarningUsers(prev =>
                prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
              );
              const sendWarning = async () => {
                if (!newWarning.title || !newWarning.message || selectedWarningUsers.length === 0) {
                  toast.error('Titel, Nachricht und mindestens einen Nutzer auswählen');
                  return;
                }
                setWarningSending(true);
                try {
                  await base44.entities.UserPopupNotification.create({
                    title: newWarning.title,
                    message: newWarning.message,
                    target_user_ids: selectedWarningUsers,
                    seen_by: [],
                    is_active: true,
                    sent_by: user?.username,
                  });
                  toast.success(`Verwarnung an ${selectedWarningUsers.length} Nutzer gesendet!`);
                  setNewWarning({ title: 'Du hast eine Verwarnung bekommen', message: '' });
                  setSelectedWarningUsers([]);
                } catch(e) { toast.error('Fehler: ' + e.message); }
                setWarningSending(false);
              };
              return (
                <div className="space-y-6">
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" /> Verwarnungen senden
                  </h2>

                  {/* Form */}
                  <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-2xl p-6 space-y-4">
                    <h3 className="text-base font-black text-white">⚠️ Neue Verwarnung</h3>
                    <Input
                      value={newWarning.title}
                      onChange={(e) => setNewWarning({...newWarning, title: e.target.value})}
                      placeholder="Titel der Verwarnung"
                      className="bg-black/20 border-white/10 text-white"
                    />
                    <textarea
                      value={newWarning.message}
                      onChange={(e) => setNewWarning({...newWarning, message: e.target.value})}
                      placeholder="Nachricht der Verwarnung..."
                      rows={3}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40"
                    />
                  </div>

                  {/* User Selector */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-black text-white text-sm">Nutzer auswählen ({selectedWarningUsers.length} ausgewählt)</h3>
                      <button onClick={() => setSelectedWarningUsers(selectedWarningUsers.length === filteredForWarning.length ? [] : filteredForWarning.map(u => u.id))} className="text-xs text-cyan-400 hover:text-cyan-300">
                        {selectedWarningUsers.length === filteredForWarning.length ? 'Alle abwählen' : 'Alle auswählen'}
                      </button>
                    </div>
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <Input value={warningSearchQuery} onChange={(e) => setWarningSearchQuery(e.target.value)} placeholder="Nutzer suchen..." className="pl-10 bg-black/20 border-white/10 text-white h-9 text-sm" />
                    </div>
                    <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
                      {filteredForWarning.map(u => (
                        <label key={u.id} className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${selectedWarningUsers.includes(u.id) ? 'bg-red-500/15 border border-red-500/30' : 'hover:bg-white/5 border border-transparent'}`}>
                          <input
                            type="checkbox"
                            checked={selectedWarningUsers.includes(u.id)}
                            onChange={() => toggleUser(u.id)}
                            className="w-4 h-4 rounded accent-red-500"
                          />
                          <img src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} alt="" className="w-8 h-8 rounded-full" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white text-sm truncate">{u.username}</p>
                            <p className="text-white/40 text-xs truncate">{u.email}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={sendWarning}
                    disabled={warningSending || selectedWarningUsers.length === 0 || !newWarning.message}
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 h-12 font-bold"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    {warningSending ? 'Wird gesendet...' : `Verwarnung an ${selectedWarningUsers.length} Nutzer senden`}
                  </Button>
                </div>
              );
            })()}

            {/* UPDATES */}
            {activeTab === 'updates' && (
              <div className="space-y-6">
                <h2 className="text-xl font-black text-white flex items-center gap-2"><Bell className="w-5 h-5 text-violet-400" /> Updates & AGB</h2>
                <AdminTermsManager />
                <div className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 rounded-2xl p-6">
                  <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-violet-400" /> Neues Update</h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <Input value={newUpdate.title} onChange={(e) => setNewUpdate({...newUpdate, title: e.target.value})} placeholder="Titel" className="bg-black/20 border-white/10 text-white" />
                    <Input value={newUpdate.version} onChange={(e) => setNewUpdate({...newUpdate, version: e.target.value})} placeholder="Version (z.B. 2.1.0)" className="bg-black/20 border-white/10 text-white" />
                  </div>
                  <textarea value={newUpdate.description} onChange={(e) => setNewUpdate({...newUpdate, description: e.target.value})} placeholder="Beschreibung..." rows={3} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/40 mb-4" />
                  <div className="flex gap-2 mb-4">
                    {['low', 'medium', 'high'].map(p => (
                      <button key={p} onClick={() => setNewUpdate({...newUpdate, priority: p})} className={`px-3 py-1.5 rounded-lg text-sm font-bold ${newUpdate.priority === p ? (p === 'high' ? 'bg-red-600' : p === 'medium' ? 'bg-violet-600' : 'bg-blue-600') : 'bg-white/5 text-white/60'} text-white`}>
                        {p === 'low' ? 'Niedrig' : p === 'medium' ? 'Mittel' : 'Hoch'}
                      </button>
                    ))}
                  </div>
                  <Button onClick={() => { if (newUpdate.title && newUpdate.version) { createUpdateMutation.mutate({ ...newUpdate, active: true }); setNewUpdate({ title: '', description: '', version: '', priority: 'medium' }); }}} disabled={!newUpdate.title || !newUpdate.version} className="bg-gradient-to-r from-violet-600 to-fuchsia-600 w-full">
                    <Sparkles className="w-4 h-4 mr-2" /> Veröffentlichen
                  </Button>
                </div>
                <div className="space-y-3">
                  {updates.map(upd => (
                    <div key={upd.id} className={`p-4 rounded-xl border flex items-center gap-4 ${upd.active ? 'bg-white/5 border-white/10' : 'bg-white/[0.02] border-white/5 opacity-50'}`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-white">{upd.title}</h4>
                          <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded text-white/50">v{upd.version}</span>
                        </div>
                        <p className="text-white/50 text-sm">{upd.description}</p>
                      </div>
                      <Button size="sm" onClick={() => toggleUpdateMutation.mutate({ id: upd.id, active: !upd.active })} className={upd.active ? 'bg-red-700 hover:bg-red-600 h-8 text-xs' : 'bg-emerald-600 h-8 text-xs'}>
                        {upd.active ? 'Deaktivieren' : 'Aktivieren'}
                      </Button>
                    </div>
                  ))}
                </div>
                {/* Season 2 Activation */}
                <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-2xl p-5">
                  <h3 className="font-bold text-white mb-1 flex items-center gap-2"><Zap className="w-4 h-4 text-orange-400" /> Season 2: Neon Apocalypse aktivieren</h3>
                  <p className="text-white/50 text-sm mb-4">Setzt BP-Level, XP, Premium-Status und alle geclaimten Belohnungen für <strong className="text-white">alle Nutzer</strong> zurück und aktiviert Season 2. Dieser Vorgang kann nicht rückgängig gemacht werden.</p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-red-600 to-orange-500 border-0">
                        <Zap className="w-4 h-4 mr-2" /> Jetzt Season 2 für alle starten
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-[#1a1a1b] border-white/10">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">⚠️ Season 2 für ALLE aktivieren?</AlertDialogTitle>
                        <AlertDialogDescription className="text-white/60">
                          Dies setzt bei <strong className="text-white">allen {users.length} Nutzern</strong> den Battle Pass zurück (Level 1, kein Premium, keine geclaimten Rewards) und aktiviert Season 2. Nicht rückgängig machbar.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white/10 border-white/10 text-white">Abbrechen</AlertDialogCancel>
                        <AlertDialogAction onClick={() => activateSeason2Mutation.mutate()} disabled={activateSeason2Mutation.isPending} className="bg-gradient-to-r from-red-600 to-orange-500 border-0">
                          {activateSeason2Mutation.isPending ? 'Wird aktiviert...' : '🚀 Season 2 starten'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {/* AGB Reset */}
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
                  <h3 className="font-bold text-white mb-2 flex items-center gap-2"><FileText className="w-4 h-4 text-amber-400" /> AGB-Zustimmung Hard-Reset</h3>
                  <p className="text-white/50 text-sm mb-4">Alle Nutzer müssen beim nächsten Login erneut zustimmen.</p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
                        <AlertTriangle className="w-4 h-4 mr-2" /> Hard-Reset auslösen
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-[#1a1a1b] border-white/10">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">AGB-Zustimmung zurücksetzen?</AlertDialogTitle>
                        <AlertDialogDescription className="text-white/60">Alle {users.length} Nutzer müssen erneut zustimmen.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white/10 border-white/10 text-white">Abbrechen</AlertDialogCancel>
                        <AlertDialogAction onClick={() => resetAllUserAgreementsMutation.mutate()} className="bg-amber-600">Zurücksetzen</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}

            {/* NEWSLETTER */}
            {activeTab === 'newsletter' && (
              <div className="space-y-4">
                <h2 className="text-xl font-black text-white flex items-center gap-2"><Mail className="w-5 h-5 text-cyan-400" /> Newsletter</h2>
                <div className="glass-card rounded-2xl p-6 border border-white/10">
                  <p className="text-white/50 text-sm mb-5">An <strong className="text-white">{newsletterCount} Abonnenten</strong> senden</p>
                  <div className="space-y-4">
                    <Input id="newsletter-subject" placeholder="Betreff" className="bg-black/20 border-white/10 text-white" />
                    <textarea id="newsletter-message" placeholder="Nachricht..." rows={5} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40" />
                    <Button onClick={async () => {
                      const subject = document.getElementById('newsletter-subject').value;
                      const message = document.getElementById('newsletter-message').value;
                      if (!subject || !message) return toast.error('Alle Felder ausfüllen');
                      if (!confirm(`An ${newsletterCount} Nutzer senden?`)) return;
                      toast.info('Wird versendet...');
                      try {
                        const res = await base44.functions.invoke('sendNewsletter', { subject, message, adminUsername: user?.username });
                        if (res.data.success) toast.success(res.data.message);
                        else toast.error('Fehler');
                      } catch(e) { toast.error(e.message); }
                    }} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 h-12">
                      <Send className="w-4 h-4 mr-2" /> Newsletter senden
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* EVENTS */}
            {activeTab === 'events' && (
              <div className="space-y-6">
                <h2 className="text-xl font-black text-white flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-400" /> Events</h2>
                <PokemonAdminPanel />
                <AdminEventManager />
                <AdminAssistantImageUpload user={user} />
              </div>
            )}

            {/* SERVER STATUS */}
            {activeTab === 'serverstatus' && (
              <div>
                <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-emerald-400" /> Server Status</h2>
                <AdminServerStatus />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <GrantTokensDialog isOpen={showGrantTokensDialog} onClose={() => setShowGrantTokensDialog(false)} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['adminUsers'] })} />
      <GrantTokensToAllDialog isOpen={showGrantTokensToAllDialog} onClose={() => setShowGrantTokensToAllDialog(false)} totalUsers={users.length} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['adminUsers'] })} />

      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="bg-slate-900/95 backdrop-blur-3xl border-white/10 text-white max-w-xl">
          <DialogHeader><DialogTitle className="text-xl font-black">Nutzer bearbeiten</DialogTitle></DialogHeader>
          {editingUser && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-white/60 text-xs">Username</Label><Input value={editForm.username} onChange={(e) => setEditForm({...editForm, username: e.target.value})} className="bg-white/5 border-white/10 text-white mt-1" /></div>
                <div><Label className="text-white/60 text-xs">E-Mail</Label><Input value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="bg-white/5 border-white/10 text-white mt-1" /></div>
                <div><Label className="text-white/60 text-xs">Rolle</Label>
                  <select value={editForm.role} onChange={(e) => setEditForm({...editForm, role: e.target.value})} className="w-full h-12 px-3 rounded-2xl bg-white/5 border border-white/20 text-white mt-1">
                    <option value="user">User</option><option value="admin">Admin</option>
                  </select>
                </div>
                <div><Label className="text-white/60 text-xs">Tokens</Label><Input type="number" value={editForm.tokens} onChange={(e) => setEditForm({...editForm, tokens: parseInt(e.target.value)})} className="bg-white/5 border-white/10 text-white mt-1" /></div>
              </div>
              <div><Label className="text-white/60 text-xs">Bio</Label><Input value={editForm.bio} onChange={(e) => setEditForm({...editForm, bio: e.target.value})} className="bg-white/5 border-white/10 text-white mt-1" /></div>
              <div className="flex flex-wrap gap-3">
                {[
                  { key: 'approved', label: 'Genehmigt', color: 'cyan' },
                  { key: 'newsletter_subscribed', label: 'Newsletter', color: 'cyan' },
                  { key: 'is_donor', label: '⭐ Spender', color: 'amber' },
                  { key: 'trial_completed', label: '✓ Trial überspringen', color: 'green' },
                  { key: 'banned', label: '🚫 Gesperrt', color: 'red' },
                ].map(f => (
                  <label key={f.key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editForm[f.key] || false} onChange={(e) => setEditForm({...editForm, [f.key]: e.target.checked})} className={`w-4 h-4 rounded accent-${f.color}-500`} />
                    <span className={`text-sm text-${f.color === 'red' ? 'red-400' : f.color === 'amber' ? 'amber-400' : 'white/80'}`}>{f.label}</span>
                  </label>
                ))}
              </div>
              {editForm.banned && <Input value={editForm.ban_reason || ''} onChange={(e) => setEditForm({...editForm, ban_reason: e.target.value})} placeholder="Sperrgrund..." className="bg-white/5 border-white/10 text-white" />}
              <div className="flex gap-3 pt-2">
                <Button onClick={() => updateUserMutation.mutate({ id: editingUser.id, data: editForm })} disabled={updateUserMutation.isPending} className="flex-1 h-11">Speichern</Button>
                <Button variant="outline" onClick={() => setEditingUser(null)} className="bg-white/5 border-white/10">Abbrechen</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}