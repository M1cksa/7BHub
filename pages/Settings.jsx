import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { User, Lock, Bell, Save, Upload, Camera, Zap, Settings as SettingsIcon, Play, Monitor, CheckCircle2 as Check, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Privacy settings
  const [privacyProfileVisible, setPrivacyProfileVisible] = useState(true);
  const [privacyShowEmail, setPrivacyShowEmail] = useState(false);
  const [privacyAllowMessages, setPrivacyAllowMessages] = useState(true);

  // Notification settings
  const [notifyNewFollower, setNotifyNewFollower] = useState(true);
  const [notifyNewComment, setNotifyNewComment] = useState(true);
  const [notifyNewLike, setNotifyNewLike] = useState(true);

  // Performance settings
  const [lightweightMode, setLightweightMode] = useState(() => {
    try {
      const stored = localStorage.getItem('lightweight_mode_v2');
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });

  // Customization settings
  const [autoPlayShorts, setAutoPlayShorts] = useState(() => {
    try {
      return localStorage.getItem('autoplay_shorts') !== 'false';
    } catch {
      return true;
    }
  });

  const [videoQuality, setVideoQuality] = useState(() => {
    try {
      return localStorage.getItem('video_quality') || 'auto';
    } catch {
      return 'auto';
    }
  });

  const [autoPlayVideos, setAutoPlayVideos] = useState(() => {
    try {
      return localStorage.getItem('autoplay_videos') !== 'false';
    } catch {
      return true;
    }
  });

  const [reduceMotion, setReduceMotion] = useState(() => {
    try {
      return localStorage.getItem('reduce_motion') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const stored = localStorage.getItem('app_user');
    if (!stored) {
      window.location.href = createPageUrl('SignIn');
      return;
    }

    const userData = JSON.parse(stored);
    setUser(userData);
    setUsername(userData.username || '');
    setEmail(userData.email || '');
    setBio(userData.bio || '');
    setAvatarPreview(userData.avatar_url || null);
    
    // Privacy
    setPrivacyProfileVisible(userData.privacy_profile_visible !== false);
    setPrivacyShowEmail(userData.privacy_show_email === true);
    setPrivacyAllowMessages(userData.privacy_allow_messages !== false);
    
    // Notifications
    setNotifyNewFollower(userData.notify_new_follower !== false);
    setNotifyNewComment(userData.notify_new_comment !== false);
    setNotifyNewLike(userData.notify_new_like !== false);
    
    setLoading(false);
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Bild darf maximal 5MB groß sein');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    if (!username.trim()) {
      toast.error('Benutzername ist erforderlich');
      return;
    }

    setSaving(true);
    try {
      let avatarUrl = user.avatar_url;
      
      if (avatarFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: avatarFile });
        avatarUrl = file_url;
      }

      await base44.entities.AppUser.update(user.id, {
        username,
        email: email || '',
        bio,
        avatar_url: avatarUrl
      });

      const updatedUser = { ...user, username, email, bio, avatar_url: avatarUrl };
      localStorage.setItem('app_user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('user-updated'));
      setUser(updatedUser);
      
      toast.success('Profil gespeichert!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrivacy = async () => {
    setSaving(true);
    try {
      await base44.entities.AppUser.update(user.id, {
        privacy_profile_visible: privacyProfileVisible,
        privacy_show_email: privacyShowEmail,
        privacy_allow_messages: privacyAllowMessages
      });

      const updatedUser = { 
        ...user, 
        privacy_profile_visible: privacyProfileVisible,
        privacy_show_email: privacyShowEmail,
        privacy_allow_messages: privacyAllowMessages
      };
      localStorage.setItem('app_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast.success('Datenschutz gespeichert!');
    } catch (error) {
      toast.error('Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      await base44.entities.AppUser.update(user.id, {
        notify_new_follower: notifyNewFollower,
        notify_new_comment: notifyNewComment,
        notify_new_like: notifyNewLike
      });

      const updatedUser = { 
        ...user, 
        notify_new_follower: notifyNewFollower,
        notify_new_comment: notifyNewComment,
        notify_new_like: notifyNewLike
      };
      localStorage.setItem('app_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast.success('Benachrichtigungen gespeichert!');
    } catch (error) {
      toast.error('Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Modern Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 mb-6 shadow-2xl">
            <SettingsIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 mb-3">
            Einstellungen
          </h1>
          <p className="text-white/60 text-lg">Passe dein Erlebnis individuell an</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <div className="glass-card p-2 rounded-2xl mb-8">
            <TabsList className="grid w-full grid-cols-5 bg-transparent border-0 gap-2">
              <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-teal-500 data-[state=active]:text-white rounded-xl">
                <User className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Profil</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-xl">
                <Lock className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Datenschutz</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white rounded-xl">
                <Bell className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Benachrichtigungen</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-xl">
                <Monitor className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Ansicht</span>
              </TabsTrigger>
              <TabsTrigger value="performance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-white rounded-xl relative">
                <Zap className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Performance</span>
                {lightweightMode && <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="glass-card p-8 rounded-3xl space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <img
                    src={avatarPreview || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full border-4 border-cyan-500/30"
                  />
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-cyan-500 transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-sm text-white/50">Klicke auf das Kamera-Icon um dein Profilbild zu ändern</p>
              </div>

              <div>
                <Label className="text-white/80">Benutzername *</Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-white/5 border-white/10 text-white mt-2"
                  placeholder="Benutzername"
                />
              </div>

              <div>
                <Label className="text-white/80">E-Mail (optional)</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border-white/10 text-white mt-2"
                  placeholder="name@beispiel.de"
                />
              </div>

              <div>
                <Label className="text-white/80">Bio</Label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="bg-white/5 border-white/10 text-white mt-2 min-h-[100px]"
                  placeholder="Erzähle etwas über dich..."
                />
              </div>

              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Wird gespeichert...' : 'Profil speichern'}
              </Button>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <div className="glass-card p-8 rounded-3xl space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex-1">
                    <Label className="text-white font-medium">Neue Follower</Label>
                    <p className="text-sm text-white/50 mt-1">Bei neuen Followern benachrichtigen</p>
                  </div>
                  <Switch
                    checked={notifyNewFollower}
                    onCheckedChange={setNotifyNewFollower}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex-1">
                    <Label className="text-white font-medium">Neue Kommentare</Label>
                    <p className="text-sm text-white/50 mt-1">Bei Kommentaren auf deine Inhalte benachrichtigen</p>
                  </div>
                  <Switch
                    checked={notifyNewComment}
                    onCheckedChange={setNotifyNewComment}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex-1">
                    <Label className="text-white font-medium">Neue Likes</Label>
                    <p className="text-sm text-white/50 mt-1">Bei Likes auf deine Inhalte benachrichtigen</p>
                  </div>
                  <Switch
                    checked={notifyNewLike}
                    onCheckedChange={setNotifyNewLike}
                  />
                </div>
              </div>

              <Button
                onClick={handleSaveNotifications}
                disabled={saving}
                className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Wird gespeichert...' : 'Benachrichtigungen speichern'}
              </Button>
            </div>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <div className="space-y-6">
              {/* Background Animation Card */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition-all" />
                <div className="relative glass-card p-8 rounded-3xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-white">Hintergrund-Animationen</h3>
                  </div>

                  <div className="p-5 bg-white/5 rounded-xl border border-white/10">
                    <Label className="text-white font-semibold text-base mb-3 block">Animation auswählen</Label>
                    <Select 
                      value={user?.active_background_animation || 'default'} 
                      onValueChange={async (value) => {
                        try {
                          await base44.entities.AppUser.update(user.id, {
                            active_background_animation: value
                          });
                          const updatedUser = { ...user, active_background_animation: value };
                          localStorage.setItem('app_user', JSON.stringify(updatedUser));
                          window.dispatchEvent(new Event('user-updated'));
                          setUser(updatedUser);
                          toast.success(`Hintergrund: ${value === 'default' ? 'Standard' : value}`);
                          setTimeout(() => window.location.reload(), 500);
                        } catch (error) {
                          toast.error('Fehler beim Speichern');
                        }
                      }}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">✨ Standard (Gradient Orbs)</SelectItem>
                        <SelectItem value="particles">🌌 Partikel (Netzwerk)</SelectItem>
                        <SelectItem value="waves">🌊 Wellen (Smooth)</SelectItem>
                        <SelectItem value="lights">💫 Floating Lights</SelectItem>
                        <SelectItem value="grid">🎮 Neon Grid</SelectItem>
                        {/* BP / Unlocked animations */}
                        {(user?.owned_background_animations || []).includes('apocalypse_meteors') && <SelectItem value="apocalypse_meteors">☄️ Apokalypse Meteore (BP S2)</SelectItem>}
                        {(user?.owned_background_animations || []).includes('crimson_storm') && <SelectItem value="crimson_storm">⚡ Crimson Storm (BP S2)</SelectItem>}
                        {(user?.owned_background_animations || []).includes('neon_rain') && <SelectItem value="neon_rain">💻 Neon Regen (BP S2)</SelectItem>}
                        {(user?.owned_background_animations || []).includes('void_pulse') && <SelectItem value="void_pulse">🌀 Void Pulse (BP S2)</SelectItem>}
                        {(user?.owned_background_animations || []).includes('aurora_north') && <SelectItem value="aurora_north">🌌 Aurora Borealis (BP S2)</SelectItem>}
                        {(user?.owned_background_animations || []).includes('galaxy_spiral') && <SelectItem value="galaxy_spiral">🌠 Galaxie Spirale (BP S2)</SelectItem>}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-white/40 mt-3">
                      Dynamische Hintergrundeffekte für ein immersives Erlebnis
                    </p>
                  </div>
                </div>
              </div>

              {/* Playback Settings Card */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition-all" />
                <div className="relative glass-card p-8 rounded-3xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-white">Wiedergabe</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-5 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex-1">
                        <Label className="text-white font-semibold text-base">Shorts Auto-Play</Label>
                        <p className="text-sm text-white/50 mt-1">Shorts sofort beim Scrollen abspielen</p>
                      </div>
                      <Switch
                        checked={autoPlayShorts}
                        onCheckedChange={(checked) => {
                          setAutoPlayShorts(checked);
                          localStorage.setItem('autoplay_shorts', String(checked));
                          toast.success(checked ? '✓ Shorts Auto-Play AN' : 'Shorts Auto-Play AUS');
                        }}
                        className="scale-110"
                      />
                    </div>

                    <div className="flex items-center justify-between p-5 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex-1">
                        <Label className="text-white font-semibold text-base">Videos Auto-Play</Label>
                        <p className="text-sm text-white/50 mt-1">Videos automatisch starten</p>
                      </div>
                      <Switch
                        checked={autoPlayVideos}
                        onCheckedChange={(checked) => {
                          setAutoPlayVideos(checked);
                          localStorage.setItem('autoplay_videos', String(checked));
                          toast.success(checked ? '✓ Video Auto-Play AN' : 'Video Auto-Play AUS');
                        }}
                        className="scale-110"
                      />
                    </div>

                    <div className="p-5 bg-white/5 rounded-xl border border-white/10">
                      <Label className="text-white font-semibold text-base mb-3 block">Standard-Qualität</Label>
                      <Select value={videoQuality} onValueChange={(value) => {
                        setVideoQuality(value);
                        localStorage.setItem('video_quality', value);
                        toast.success(`Qualität: ${value}`);
                      }}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">🎯 Automatisch (empfohlen)</SelectItem>
                          <SelectItem value="1080p">🔥 1080p (Full HD)</SelectItem>
                          <SelectItem value="720p">⚡ 720p (HD)</SelectItem>
                          <SelectItem value="480p">📱 480p (Mobil)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-white/40 mt-3">Niedrigere Qualität = weniger Datenverbrauch</p>
                    </div>

                    <div className="flex items-center justify-between p-5 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex-1">
                        <Label className="text-white font-semibold text-base">Bewegungen reduzieren</Label>
                        <p className="text-sm text-white/50 mt-1">Minimiert Animationen (Barrierefreiheit)</p>
                      </div>
                      <Switch
                        checked={reduceMotion}
                        onCheckedChange={(checked) => {
                          setReduceMotion(checked);
                          localStorage.setItem('reduce_motion', String(checked));
                          toast.success(checked ? 'Bewegungen reduziert' : 'Normale Animationen');
                        }}
                        className="scale-110"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Data Export - shown in Privacy tab */}
          <TabsContent value="privacy">
            <div className="glass-card p-8 rounded-3xl space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex-1">
                    <Label className="text-white font-medium">Profil sichtbar</Label>
                    <p className="text-sm text-white/50 mt-1">Andere Nutzer können dein Profil sehen</p>
                  </div>
                  <Switch
                    checked={privacyProfileVisible}
                    onCheckedChange={setPrivacyProfileVisible}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex-1">
                    <Label className="text-white font-medium">E-Mail anzeigen</Label>
                    <p className="text-sm text-white/50 mt-1">Deine E-Mail öffentlich anzeigen</p>
                  </div>
                  <Switch
                    checked={privacyShowEmail}
                    onCheckedChange={setPrivacyShowEmail}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex-1">
                    <Label className="text-white font-medium">Direktnachrichten erlauben</Label>
                    <p className="text-sm text-white/50 mt-1">Andere können dir Nachrichten senden</p>
                  </div>
                  <Switch
                    checked={privacyAllowMessages}
                    onCheckedChange={setPrivacyAllowMessages}
                  />
                </div>
              </div>

              <Button
                onClick={handleSavePrivacy}
                disabled={saving}
                className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Wird gespeichert...' : 'Datenschutz speichern'}
              </Button>

              {/* Data Export */}
              <div className="border-t border-white/10 pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <Download className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-white font-bold">Meine Daten exportieren</h3>
                </div>
                <p className="text-white/50 text-sm mb-4">Lade eine Kopie deiner Account-Daten und Videos als JSON-Datei herunter.</p>
                <Button
                  variant="outline"
                  className="w-full border-white/10"
                  onClick={async () => {
                    try {
                      const videos = await base44.entities.Video.filter({ creator_name: user.username });
                      const exportData = {
                        exportDate: new Date().toISOString(),
                        account: {
                          username: user.username,
                          email: user.email || '',
                          bio: user.bio || '',
                          role: user.role,
                          tokens: user.tokens,
                          is_donor: user.is_donor,
                          joined: user.created_date,
                          avatar_url: user.avatar_url || '',
                          active_theme: user.active_theme || 'default',
                          frame_style: user.frame_style || 'none',
                        },
                        videos: videos.map(v => ({
                          title: v.title,
                          description: v.description || '',
                          video_url: v.video_url,
                          thumbnail_url: v.thumbnail_url || '',
                          views: v.views || 0,
                          likes: v.likes_count || 0,
                          category: v.category,
                          created: v.created_date,
                        }))
                      };
                      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `7bhub-daten-${user.username}-${new Date().toISOString().slice(0,10)}.json`;
                      document.body.appendChild(a);
                      a.click();
                      URL.revokeObjectURL(url);
                      a.remove();
                      toast.success('Daten erfolgreich exportiert!');
                    } catch (e) {
                      toast.error('Fehler beim Exportieren');
                    }
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Account & Videos herunterladen
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <div className="space-y-6">
              {/* BIG Performance Mode Card */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-all animate-pulse" style={{ animationDuration: '3s' }} />
                
                <div className="relative glass-card p-10 rounded-3xl border-2 border-yellow-500/30">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-yellow-400 to-orange-500 mb-6 shadow-2xl">
                      <Zap className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 mb-3">
                      ⚡ Performance Mode
                    </h2>
                    <p className="text-white/70 text-lg max-w-2xl mx-auto">
                      Maximale Performance für ältere Geräte und mobile Browser
                    </p>
                  </div>

                  <div className="bg-black/30 rounded-2xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-white font-bold text-lg mb-1">Aktueller Status</p>
                        <p className={`text-2xl font-black ${lightweightMode ? 'text-yellow-400' : 'text-white/40'}`}>
                          {lightweightMode ? '✓ AKTIVIERT' : 'Deaktiviert'}
                        </p>
                      </div>
                      <Switch
                        checked={lightweightMode}
                        onCheckedChange={(checked) => {
                          setLightweightMode(checked);
                          localStorage.setItem('lightweight_mode_v2', String(checked));
                          window.dispatchEvent(new Event('lightweight-mode-changed'));
                          toast.success(checked ? '⚡ Performance Mode aktiviert!' : '✨ Normale Ansicht wiederhergestellt');
                          setTimeout(() => window.location.reload(), 800);
                        }}
                        className="scale-150"
                      />
                    </div>

                    {lightweightMode && (
                      <div className="p-4 bg-yellow-500/20 border border-yellow-500/40 rounded-xl">
                        <p className="text-yellow-100 font-semibold text-center">
                          ⚡ Performance Mode ist aktiv - maximale Geschwindigkeit!
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-xl">
                      <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-400" />
                        Deaktiviert
                      </h4>
                      <ul className="space-y-1 text-sm text-white/60">
                        <li>• Alle Animationen</li>
                        <li>• Blur-Effekte</li>
                        <li>• Partikel & Wellen</li>
                        <li>• Hover-Effekte</li>
                        <li>• Glitch-Effekte</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl">
                      <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        Vorteile
                      </h4>
                      <ul className="space-y-1 text-sm text-white/60">
                        <li>• 3x schnelleres Laden</li>
                        <li>• 50% weniger Akku</li>
                        <li>• Weniger Datenverbrauch</li>
                        <li>• Bessere Stabilität</li>
                        <li>• Smooth auf allen Geräten</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="glass-card p-6 rounded-2xl">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  💡 Schnellzugriff
                </h4>
                <p className="text-sm text-white/70">
                  Du kannst den Performance Mode auch direkt über das ⚡-Symbol in der Navigation ein- und ausschalten.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}