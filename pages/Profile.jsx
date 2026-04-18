import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Camera, Save, User, Mail, Shield, Video, Eye, Heart, Settings, 
  Loader2, Check, Trash2, Sparkles, MessageCircle, Star, AlertTriangle, 
  Plus, ChevronRight, Edit3, Package, LayoutDashboard, Palette, Zap, Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import NotificationSettings from '@/components/NotificationSettings';
import CreateStoryDialog from '@/components/CreateStoryDialog';
import UserAvatar from '@/components/UserAvatar';
import ProfileAnimation from '@/components/ProfileAnimation';
import PageTransition from '@/components/mobile/PageTransition';
import PokemonPageDecor from '@/components/pokemon/PokemonPageDecor';
import PokemonBannerPicker from '@/components/pokemon/PokemonBannerPicker';

// ─── Tab definitions ──────────────────────────────────────
const TABS = [
  { id: 'overview', label: 'Übersicht', icon: User },
  { id: 'customize', label: 'Anpassen', icon: Palette },
  { id: 'videos', label: 'Videos', icon: Video },
  { id: 'qa', label: 'Q&A', icon: MessageCircle },
];

export default function ProfilePage() {
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('app_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showStoryDialog, setShowStoryDialog] = useState(false);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [formData, setFormData] = useState({
    bio: user?.bio || '',
    frame_style: user?.frame_style || 'none',
    active_theme: user?.active_theme || 'default',
    active_animation: user?.active_animation || 'none',
    active_badge: user?.active_badge || 'none',
    active_banner: user?.active_banner || 'none',
    active_title: user?.active_title || 'none',
    active_chat_color: user?.active_chat_color || 'none',
    active_profile_effect: user?.active_profile_effect || 'none',
    active_cursor_trail: user?.active_cursor_trail || 'none',
    active_background_animation: user?.active_background_animation || 'default',
    active_profile_sound: user?.active_profile_sound || 'none',
    video_frame: user?.video_frame || 'none',
    email: user?.email || '',
    pokemon_partner_id: user?.pokemon_partner_id || null,
    pokemon_partner_sprite: user?.pokemon_partner_sprite || null,
    pokemon_partner_name: user?.pokemon_partner_name || null,
  });

  // Background sync
  useEffect(() => {
    if (user?.username) {
      base44.entities.AppUser.filter({ username: user.username }, '-created_date', 1)
        .then(users => {
          if (users?.[0] && JSON.stringify(users[0]) !== JSON.stringify(user)) {
            const u = users[0];
            setUser(u);
            setAvatarPreview(u.avatar_url);
            setFormData({
              bio: u.bio || '', frame_style: u.frame_style || 'none',
              active_theme: u.active_theme || 'default', active_animation: u.active_animation || 'none',
              active_badge: u.active_badge || 'none', active_banner: u.active_banner || 'none',
              active_title: u.active_title || 'none', active_chat_color: u.active_chat_color || 'none',
              active_profile_effect: u.active_profile_effect || 'none',
              active_cursor_trail: u.active_cursor_trail || 'none',
              active_background_animation: u.active_background_animation || 'default',
              active_profile_sound: u.active_profile_sound || 'none',
              video_frame: u.video_frame || 'none',
              email: u.email || '',
              pokemon_partner_id: u.pokemon_partner_id || null, pokemon_partner_sprite: u.pokemon_partner_sprite || null,
              pokemon_partner_name: u.pokemon_partner_name || null,
            });
            localStorage.setItem('app_user', JSON.stringify(u));
          }
        }).catch(() => {});
    }
    const onUpdate = () => {
      try { const s = localStorage.getItem('app_user'); if (s) setUser(JSON.parse(s)); } catch {}
    };
    window.addEventListener('user-updated', onUpdate);
    return () => window.removeEventListener('user-updated', onUpdate);
  }, []);

  const { data: userVideos = [], refetch: refetchVideos } = useQuery({
    queryKey: ['userVideos', user?.username],
    queryFn: () => base44.entities.Video.filter({ creator_name: user.username }, '-created_date', 100),
    enabled: !!user?.username,
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ['userInventory', user?.id],
    queryFn: () => base44.entities.InventoryItem.filter({ owner_id: user.id }, '-acquired_date', 100),
    enabled: !!user?.id,
  });

  const { data: allMemberships = [] } = useQuery({
    queryKey: ['allUserMemberships', user?.username],
    queryFn: () => base44.entities.UserMembership.filter({ user_username: user.username, status: 'active' }, '-created_date', 50),
    enabled: !!user?.username,
  });

  const { data: publicQuestions = [] } = useQuery({
    queryKey: ['publicQuestions', user?.username],
    queryFn: () => base44.entities.Question.filter({ creator_username: user?.username, is_answered: true }, '-updated_date', 20),
    enabled: !!user?.username && activeTab === 'qa',
  });

  const totalViews = userVideos.reduce((sum, v) => sum + (v.views || 0), 0);
  const totalLikes = userVideos.reduce((sum, v) => sum + (v.likes_count || 0), 0);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
    setIsSaving(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.AppUser.update(user.id, { avatar_url: file_url });
      const updated = { ...user, avatar_url: file_url };
      setUser(updated);
      localStorage.setItem('app_user', JSON.stringify(updated));
      window.dispatchEvent(new Event('user-updated'));
    } catch (err) { console.error(err); }
    setIsSaving(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await base44.entities.AppUser.update(user.id, formData);
      const updated = { ...user, ...formData };
      setUser(updated);
      localStorage.setItem('app_user', JSON.stringify(updated));
      window.dispatchEvent(new Event('user-updated'));
      const creatorInfos = await base44.entities.CreatorInfo.filter({ username: user.username }, '-created_date', 1);
      if (creatorInfos?.length > 0) {
        await base44.entities.CreatorInfo.update(creatorInfos[0].id, { bio: formData.bio, avatar_url: updated.avatar_url, frame_style: formData.frame_style });
      } else {
        await base44.entities.CreatorInfo.create({ username: user.username, bio: formData.bio || '', avatar_url: updated.avatar_url, followers_count: 0, frame_style: formData.frame_style });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) { console.error(err); }
    setIsSaving(false);
  };

  const generateAiBio = async () => {
    setIsGeneratingBio(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Schreibe eine kurze, coole Bio (auf Deutsch) für einen Nutzer namens "${user.username}". Der Nutzer mag Videos und Streaming. Nutze Emojis.`,
      });
      setFormData(prev => ({ ...prev, bio: response }));
    } catch (e) { console.error(e); }
    setIsGeneratingBio(false);
  };

  const toggleNewsletter = async () => {
    if (!user?.id) return;
    const newValue = !user.newsletter_subscribed;
    await base44.entities.AppUser.update(user.id, { newsletter_subscribed: newValue, newsletter_asked: true });
    const updatedUser = { ...user, newsletter_subscribed: newValue, newsletter_asked: true };
    localStorage.setItem('app_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    window.dispatchEvent(new Event('user-updated'));
  };

  const handleDeleteVideo = async (videoId) => {
    if (confirm('Video wirklich löschen?')) {
      await base44.entities.Video.delete(videoId);
      refetchVideos();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-white/30" />
          <p className="text-white/60 mb-6">Bitte melde dich an</p>
          <Link to={createPageUrl('SignIn')}><Button>Zum Login</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen text-white relative overflow-x-hidden">
        <ProfileAnimation animationType={user?.active_animation} badgeType={user?.active_badge} />
        <PokemonPageDecor page="profile" />

        {/* ── HERO BANNER ── */}
        <div className="relative h-56 md:h-72 overflow-hidden">
          {/* Dynamic gradient bg */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(135deg, #0f0c29 0%, #1a0533 30%, #0d1f3c 60%, #031020 100%)'
          }} />
          {/* Animated orbs */}
          <div className="absolute -top-16 -left-16 w-80 h-80 bg-violet-600/20 rounded-full blur-[80px]" />
          <div className="absolute -bottom-16 -right-8 w-64 h-64 bg-cyan-500/15 rounded-full blur-[80px]" />
          <div className="absolute top-1/3 left-1/3 w-48 h-48 bg-fuchsia-500/10 rounded-full blur-[60px]" />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: 'linear-gradient(rgba(168,85,247,1) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
          {/* Top actions */}
          <div className="absolute top-4 right-4 flex gap-2 z-20">
            <Link to={createPageUrl('Settings')}>
              <button className="p-2 rounded-xl bg-black/30 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all">
                <Settings className="w-4 h-4 text-white/70" />
              </button>
            </Link>
            <button
              onClick={() => setShowStoryDialog(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/30 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all text-xs font-bold text-white/70"
            >
              <Plus className="w-3.5 h-3.5" /> Story
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all border ${
                saved
                  ? 'bg-green-500/20 border-green-400/40 text-green-400'
                  : 'bg-violet-600/80 backdrop-blur-md border-violet-400/40 text-white hover:bg-violet-500'
              }`}
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              {saved ? 'Gespeichert!' : 'Speichern'}
            </button>
          </div>
        </div>

        {/* ── AVATAR + INFO SECTION ── */}
        <div className="relative max-w-5xl mx-auto px-4 md:px-6">
          {/* Avatar overlapping banner */}
          <div className="-mt-16 md:-mt-20 flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 mb-6">
            <div className="relative flex-shrink-0">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl ring-4 ring-black overflow-visible relative">
                <UserAvatar
                  user={{ ...user, frame_style: formData.frame_style, avatar_url: avatarPreview || user.avatar_url }}
                  size="xl"
                  className="w-full h-full"
                />
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-violet-600 hover:bg-violet-500 flex items-center justify-center shadow-lg z-20 transition-all hover:scale-110"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
              {formData.pokemon_partner_sprite && (
                <motion.img
                  src={formData.pokemon_partner_sprite}
                  alt={formData.pokemon_partner_name}
                  className="absolute -bottom-2 -left-5 w-12 h-12 object-contain drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
            </div>

            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-black text-white">@{user.username}</h1>
                {user.role === 'admin' && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-white/10 border border-white/15 text-white/70">
                    <Shield className="w-3 h-3" /> Admin
                  </span>
                )}
                {user.is_donor && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-400/30 text-amber-400">
                    <Crown className="w-3 h-3" /> Donor
                  </span>
                )}
              </div>
              {formData.active_title && formData.active_title !== 'none' && (
                <span className="inline-block text-xs px-3 py-1 rounded-full bg-gradient-to-r from-fuchsia-500/20 to-cyan-500/20 text-fuchsia-300 border border-fuchsia-500/40 mb-2 shadow-[0_0_10px_rgba(217,70,239,0.25)]">
                  {formData.active_title}
                </span>
              )}
              <p className="text-white/40 text-sm">Mitglied seit {new Date(user.created_date).getFullYear()}</p>
              {user.bio && <p className="text-white/60 text-sm mt-1 max-w-md line-clamp-2">{user.bio}</p>}
            </div>

            {/* Stats row */}
            <div className="flex gap-4 sm:gap-6 pb-1 sm:ml-auto">
              {[
                { icon: Video, value: userVideos.length, label: 'Videos' },
                { icon: Eye, value: totalViews.toLocaleString(), label: 'Aufrufe' },
                { icon: Heart, value: totalLikes.toLocaleString(), label: 'Likes' },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-xl md:text-2xl font-black text-white">{value}</p>
                  <p className="text-xs text-white/40 flex items-center gap-1 justify-center">
                    <Icon className="w-3 h-3" /> {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── TABS ── */}
          <div className="flex gap-1 p-1 rounded-2xl mb-6 w-fit" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-violet-600/80 text-white shadow-lg'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ── TAB CONTENT ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="pb-32"
            >

              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  {/* Quick links */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: 'Creator Dashboard', icon: LayoutDashboard, path: 'CreatorDashboard', color: '#7c3aed' },
                      { label: 'Shop', icon: Sparkles, path: 'Shop', color: '#f59e0b' },
                      { label: 'Battle Pass', icon: Zap, path: 'BattlePass', color: '#06b6d4' },
                      { label: 'Pro Pass', icon: Crown, path: 'ProPass', color: '#ec4899' },
                    ].map(({ label, icon: Icon, path, color }) => (
                      <Link key={path} to={createPageUrl(path)}>
                        <motion.div
                          whileHover={{ scale: 1.03, y: -2 }}
                          className="p-4 rounded-2xl flex items-center gap-3 cursor-pointer transition-all"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
                            <Icon className="w-4 h-4" style={{ color }} />
                          </div>
                          <span className="text-sm font-bold text-white/80">{label}</span>
                          <ChevronRight className="w-4 h-4 text-white/25 ml-auto" />
                        </motion.div>
                      </Link>
                    ))}
                  </div>

                  {/* Memberships */}
                  {allMemberships.length > 0 && (
                    <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-3">Mitgliedschaften</h3>
                      <div className="space-y-2">
                        {allMemberships.map(mem => (
                          <div key={mem.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: mem.creator_username === 'PLATFORM' ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <div className="flex items-center gap-3">
                              <Star className={`w-4 h-4 ${mem.creator_username === 'PLATFORM' ? 'text-amber-400' : 'text-white/30'}`} />
                              <div>
                                <p className="text-sm font-bold text-white">{mem.creator_username === 'PLATFORM' ? 'Premium' : mem.creator_username}</p>
                                <p className="text-xs text-white/40">{mem.tier_id} Tier</p>
                              </div>
                            </div>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/20 font-bold">Aktiv</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inventory preview */}
                  <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                        <Package className="w-4 h-4" /> Inventar
                      </h3>
                      <Link to={createPageUrl('Inventory')}>
                        <button className="text-xs text-violet-400 hover:text-violet-300 font-bold flex items-center gap-1">
                          Alle <ChevronRight className="w-3 h-3" />
                        </button>
                      </Link>
                    </div>
                    {inventory.length > 0 ? (
                      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                        {inventory.slice(0, 8).map(item => (
                          <div key={item.id} className="flex-shrink-0 w-14 h-14 rounded-xl bg-black/40 border border-white/10 overflow-hidden" title={item.name}>
                            <img src={item.image_url} className="w-full h-full object-contain p-1.5" />
                          </div>
                        ))}
                        {inventory.length > 8 && (
                          <Link to={createPageUrl('Inventory')} className="flex-shrink-0 w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white/40">
                            +{inventory.length - 8}
                          </Link>
                        )}
                      </div>
                    ) : (
                      <p className="text-white/30 text-sm text-center py-4">Noch keine Items — <Link to={createPageUrl('Shop')} className="text-violet-400 hover:underline">Shop besuchen</Link></p>
                    )}
                  </div>

                  {/* Email + newsletter */}
                  <div className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h3 className="text-sm font-black uppercase tracking-widest text-white/40 flex items-center gap-2"><Mail className="w-4 h-4" /> Konto</h3>
                    <div>
                      <Label className="text-white/50 text-xs">E-Mail</Label>
                      <Input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="deine@email.de"
                        className="mt-1.5 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-white/80">Newsletter</p>
                        <p className="text-xs text-white/40">Über neue Videos & Streams informiert bleiben</p>
                      </div>
                      <button
                        onClick={toggleNewsletter}
                        className={`relative w-12 h-6 rounded-full transition-all duration-300 ${user?.newsletter_subscribed ? 'bg-violet-500' : 'bg-white/15'}`}
                      >
                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300 ${user?.newsletter_subscribed ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Danger zone */}
                  <div className="rounded-2xl p-5" style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <h3 className="text-sm font-black uppercase tracking-widest text-red-400/60 flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4" /> Gefahrenzone
                    </h3>
                    <p className="text-white/40 text-xs mb-3">Account löschen ist unwiderruflich. Alle Daten werden permanent entfernt.</p>
                    <button
                      onClick={async () => {
                        if (confirm('Account wirklich löschen?') && confirm('Letzte Bestätigung: Alle Daten werden gelöscht.')) {
                          await base44.entities.AppUser.delete(user.id);
                          localStorage.removeItem('app_user');
                          window.location.href = createPageUrl('Home');
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all"
                    >
                      <Trash2 className="w-4 h-4" /> Account löschen
                    </button>
                  </div>
                </div>
              )}

              {/* CUSTOMIZE TAB */}
              {activeTab === 'customize' && (
                <div className="space-y-5">

                  {/* Bio */}
                  <Section title="Bio" icon={Edit3}>
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-white/50 text-xs">Über dich</Label>
                      <button onClick={generateAiBio} disabled={isGeneratingBio} className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 font-bold">
                        <Sparkles className="w-3 h-3" /> {isGeneratingBio ? 'Generiere...' : 'KI-Vorschlag'}
                      </button>
                    </div>
                    <Textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Erzähle etwas über dich..." rows={3}
                      className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 resize-none" />
                  </Section>

                  {/* Frame */}
                  <Section title="Profil-Rahmen" icon={Palette}>
                    <ChipSelector
                      options={(() => {
                        const base = ['none', 'gold', 'neon', 'fire', 'glitch', 'rainbow', 'diamond', 'cyber', 'nature', 'cosmic', 'lightning', 'ice', 'lava', 'toxic', 'shadow', 'celestial', 'galaxy', 'blood', 'ocean', 'phoenix', 'dragon', 'aurora', 'eternal', 'void', 'daily_aurora', 'daily_cosmos', 'daily_phoenix', 'bp_cosmic_rift', 'bp_dragon_breath', 'bp_cyber_samurai', 'bp_god_tier', 'hub_2_0', 'legendary', 'genesis', 'divine', 'mythic', 'void_titan', 's2_apocalypse', 's2_mutant', 's2_doomsday'];
                        const owned = user?.owned_frames || [];
                        const extra = owned.filter(f => !base.includes(f));
                        return [...base, ...extra].filter(s => s === 'none' || owned.includes(s) || user?.frame_style === s);
                      })()}
                      value={formData.frame_style}
                      onChange={(v) => setFormData({ ...formData, frame_style: v })}
                      formatLabel={(s) => s === 'none' ? 'Kein Rahmen' : s.replace(/_/g, ' ')}
                    />
                    <p className="text-white/30 text-xs mt-2">Rahmen im <Link to={createPageUrl('Shop')} className="text-amber-400">Shop</Link> kaufen</p>
                  </Section>

                  {/* Theme */}
                  <Section title="Theme" icon={Palette}>
                    <ChipSelector
                      options={[...new Set(['default', ...(user?.owned_themes || ['default']), user?.active_theme].filter(Boolean))]}

                      value={formData.active_theme}
                      onChange={(v) => setFormData({ ...formData, active_theme: v })}
                      formatLabel={(s) => s.replace(/_/g, ' ')}
                    />
                  </Section>

                  {/* Animation */}
                  <Section title="Profil-Animation" icon={Zap}>
                    <ChipSelector
                      options={['none', ...(user?.owned_animations || [])]}
                      value={formData.active_animation}
                      onChange={(v) => setFormData({ ...formData, active_animation: v })}
                      formatLabel={(s) => s}
                    />
                  </Section>

                  {/* Titles */}
                  {(user?.owned_titles || []).length > 0 && (
                    <Section title="Profil-Titel" icon={Crown}>
                      <ChipSelector
                        options={['none', ...(user?.owned_titles || [])]}
                        value={formData.active_title || 'none'}
                        onChange={(v) => setFormData({ ...formData, active_title: v })}
                        formatLabel={(s) => s === 'none' ? 'Kein Titel' : s}
                        accent="fuchsia"
                      />
                    </Section>
                  )}

                  {/* Chat Color */}
                  {(user?.owned_chat_colors || []).length > 0 && (
                    <Section title="Chat-Farbe" icon={MessageCircle}>
                      <ChipSelector
                        options={['none', ...(user?.owned_chat_colors || [])]}
                        value={formData.active_chat_color || 'none'}
                        onChange={(v) => setFormData({ ...formData, active_chat_color: v })}
                        formatLabel={(s) => s === 'none' ? 'Standard' : s.replace(/_/g, ' ')}
                        accent="fuchsia"
                      />
                    </Section>
                  )}

                  {/* Profile Effects */}
                  {(user?.owned_profile_effects || []).length > 0 && (
                    <Section title="Profil-Effekt" icon={Sparkles}>
                      <ChipSelector
                        options={['none', ...(user?.owned_profile_effects || [])]}
                        value={formData.active_profile_effect || 'none'}
                        onChange={(v) => setFormData({ ...formData, active_profile_effect: v })}
                        formatLabel={(s) => s === 'none' ? 'Kein Effekt' : s.replace(/_/g, ' ')}
                        accent="fuchsia"
                      />
                    </Section>
                  )}

                  {/* Badges */}
                  {(user?.owned_badges || []).length > 0 && (
                    <Section title="Abzeichen" icon={Star}>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setFormData({ ...formData, active_badge: 'none', active_banner: 'none' })}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${!formData.active_badge || formData.active_badge === 'none' ? 'bg-white text-black border-white/20' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                        >
                          Keins
                        </button>
                        {(user?.owned_badges || []).map(badgeId => {
                          const badgeImgs = { '69a2121344c124984f79c42e': '25', '69a2121344c124984f79c42f': '4', '69a2121344c124984f79c430': '1', '69a2121344c124984f79c431': '7', '69a2121344c124984f79c432': '150', '69a2121344c124984f79c433': '151', '69a2121344c124984f79c445': '175', '69a2121344c124984f79c446': '149', '69a2121344c124984f79c447': '249', '69a2121344c124984f79c448': '250' };
                          const imgNum = badgeImgs[badgeId];
                          return (
                            <button key={badgeId} onClick={() => setFormData({ ...formData, active_badge: badgeId, active_banner: badgeId })}
                              className={`w-12 h-12 rounded-xl border transition-all flex items-center justify-center ${formData.active_badge === badgeId ? 'bg-amber-500/20 border-amber-400/50 ring-2 ring-amber-400' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                            >
                              {imgNum ? <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${imgNum}.png`} alt="Badge" className="w-full h-full object-contain p-1" /> : <span>🏅</span>}
                            </button>
                          );
                        })}
                      </div>
                    </Section>
                  )}

                  {/* Cursor Trail */}
                  {(user?.owned_cursor_trails || []).length > 0 && (
                    <Section title="Cursor-Spur" icon={Sparkles}>
                      <ChipSelector
                        options={['none', ...(user?.owned_cursor_trails || [])]}
                        value={formData.active_cursor_trail || 'none'}
                        onChange={(v) => setFormData({ ...formData, active_cursor_trail: v })}
                        formatLabel={(s) => s === 'none' ? 'Keine' : s.replace(/_/g, ' ')}
                        accent="fuchsia"
                      />
                    </Section>
                  )}

                  {/* Background Animation */}
                  {(user?.owned_background_animations || []).length > 0 && (
                    <Section title="Hintergrund-Animation" icon={Sparkles}>
                      <ChipSelector
                        options={['default', ...(user?.owned_background_animations || [])]}
                        value={formData.active_background_animation || 'default'}
                        onChange={(v) => setFormData({ ...formData, active_background_animation: v })}
                        formatLabel={(s) => s === 'default' ? 'Standard' : s.replace(/_/g, ' ')}
                        accent="fuchsia"
                      />
                    </Section>
                  )}

                  {/* Profile Sound */}
                  {(user?.owned_profile_sounds || []).length > 0 && (
                    <Section title="Profil-Sound" icon={Sparkles}>
                      <ChipSelector
                        options={['none', ...(user?.owned_profile_sounds || [])]}
                        value={formData.active_profile_sound || 'none'}
                        onChange={(v) => setFormData({ ...formData, active_profile_sound: v })}
                        formatLabel={(s) => s === 'none' ? 'Kein Sound' : s.replace(/_/g, ' ')}
                        accent="fuchsia"
                      />
                    </Section>
                  )}

                  {/* Video Frame */}
                  {(user?.owned_video_frames || []).length > 0 && (
                    <Section title="Video-Rahmen" icon={Sparkles}>
                      <ChipSelector
                        options={['none', ...(user?.owned_video_frames || [])]}
                        value={formData.video_frame || 'none'}
                        onChange={(v) => setFormData({ ...formData, video_frame: v })}
                        formatLabel={(s) => s === 'none' ? 'Kein Rahmen' : s.replace(/_/g, ' ')}
                        accent="fuchsia"
                      />
                    </Section>
                  )}

                  {/* Pokémon Partner */}
                  <Section title="Pokémon-Partner" icon={Star}>
                    <PokemonBannerPicker
                      currentPokemonId={formData.pokemon_partner_id}
                      onSelect={(pokemon) => setFormData(prev => ({
                        ...prev,
                        pokemon_partner_id: pokemon?.id || null,
                        pokemon_partner_sprite: pokemon?.sprite || null,
                        pokemon_partner_name: pokemon?.name || null,
                      }))}
                    />
                  </Section>
                  </div>
                  )}

              {/* VIDEOS TAB */}
              {activeTab === 'videos' && (
                <div>
                  {userVideos.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {userVideos.map(video => (
                        <div key={video.id} className="relative aspect-video rounded-2xl overflow-hidden group cursor-pointer" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                          <img src={video.thumbnail_url || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=200&fit=crop'} alt={video.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Link to={createPageUrl('Watch') + `?id=${video.id}`}>
                              <button className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-sm text-white text-xs font-bold hover:bg-white/30 transition-all">
                                <Eye className="w-3.5 h-3.5" /> Ansehen
                              </button>
                            </Link>
                            <button onClick={() => handleDeleteVideo(video.id)} className="p-1.5 rounded-xl bg-red-500/60 backdrop-blur-sm hover:bg-red-500/80 transition-all">
                              <Trash2 className="w-3.5 h-3.5 text-white" />
                            </button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
                            <p className="text-white text-xs font-bold truncate">{video.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-white/40 text-[10px] flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{(video.views || 0).toLocaleString()}</span>
                              <span className="text-white/40 text-[10px] flex items-center gap-0.5"><Heart className="w-2.5 h-2.5" />{(video.likes_count || 0).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
                      <Video className="w-12 h-12 text-white/15 mb-3" />
                      <p className="text-white/40 font-bold mb-4">Noch keine Videos</p>
                      <Link to={createPageUrl('UploadSelect')}>
                        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-violet-600/80 hover:bg-violet-500 text-white transition-all">
                          <Plus className="w-4 h-4" /> Video hochladen
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Q&A TAB */}
              {activeTab === 'qa' && (
                <div>
                  {publicQuestions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
                      <MessageCircle className="w-12 h-12 text-white/15 mb-3" />
                      <p className="text-white/40 font-bold">Noch keine beantworteten Fragen</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {publicQuestions.map(q => (
                        <motion.div key={q.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <p className="font-bold text-white mb-3">"{q.question}"</p>
                          <div className="flex items-start gap-2 text-sm text-white/60 pl-3 border-l-2 border-violet-500">
                            <span className="text-violet-400 font-bold flex-shrink-0">A:</span>
                            <span>{q.answer}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        <CreateStoryDialog isOpen={showStoryDialog} onClose={() => setShowStoryDialog(false)} user={user} />
      </div>
    </PageTransition>
  );
}

// ─── Helper Components ─────────────────────────────────────
function Section({ title, icon: Icon, children }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <h3 className="text-xs font-black uppercase tracking-widest text-white/35 flex items-center gap-2 mb-4">
        <Icon className="w-3.5 h-3.5" /> {title}
      </h3>
      {children}
    </div>
  );
}

function ChipSelector({ options, value, onChange, formatLabel, accent = 'white' }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border capitalize transition-all ${
              active
                ? accent === 'fuchsia'
                  ? 'bg-fuchsia-500/20 border-fuchsia-400/50 text-fuchsia-300'
                  : 'bg-white text-black border-white/20'
                : 'bg-white/[0.04] border-white/[0.08] text-white/50 hover:bg-white/[0.08] hover:text-white/80'
            }`}
          >
            {formatLabel(opt)}
          </button>
        );
      })}
    </div>
  );
}