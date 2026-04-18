import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, CheckCircle, Play, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function CloudinaryVideoUpload() {
  const [user, setUser] = useState(null);
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'entertainment',
    video_frame: 'none',
    is_secured: false
  });
  const [isUploading, setIsUploading] = useState(false);
  const [cloudinaryConfig, setCloudinaryConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const stored = localStorage.getItem('app_user');
        if (stored) {
          const parsedUser = JSON.parse(stored);
          setUser(parsedUser);
          
          // Check trial phase
          if (parsedUser.role !== 'admin' && !parsedUser.trial_completed) {
            const accountAge = Date.now() - new Date(parsedUser.created_date).getTime();
            if (accountAge < (24 * 60 * 60 * 1000)) {
              const hoursLeft = Math.ceil((24 * 60 * 60 * 1000 - accountAge) / (60 * 60 * 1000));
              toast.error(`Testphase aktiv - Upload erst in ${hoursLeft}h möglich`);
              window.location.href = '/';
            }
          }
        }
      } catch (e) {
        console.error('User load error:', e);
      }
    };
    loadUser();

    // Load Cloudinary Config
    const loadConfig = async () => {
      try {
        const response = await base44.functions.invoke('getCloudinaryConfig');
        if (response.data?.cloudName && response.data?.uploadPreset) {
          setCloudinaryConfig(response.data);
        } else {
          toast.error('Cloudinary nicht konfiguriert');
        }
      } catch (error) {
        console.error('Config load error:', error);
        toast.error('Cloudinary-Konfiguration konnte nicht geladen werden');
      } finally {
        setConfigLoading(false);
      }
    };
    loadConfig();

    // Load Cloudinary Widget Script
    const script = document.createElement('script');
    script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const openUploadWidget = () => {
    if (!window.cloudinary) {
      toast.error('Cloudinary Widget wird geladen...');
      return;
    }

    if (!cloudinaryConfig) {
      toast.error('Cloudinary nicht konfiguriert');
      return;
    }

    console.log('🔧 Cloudinary Config:', {
      cloudName: cloudinaryConfig.cloudName.trim(),
      uploadPreset: cloudinaryConfig.uploadPreset.trim()
    });

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: cloudinaryConfig.cloudName.trim(),
        uploadPreset: cloudinaryConfig.uploadPreset.trim(),
        sources: ['local', 'url'],
        resourceType: 'video',
        multiple: false,
        maxFileSize: 500000000, // 500MB
        clientAllowedFormats: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
        showPoweredBy: false,
        cropping: false,
        styles: {
          palette: {
            window: '#000000',
            windowBorder: '#06b6d4',
            tabIcon: '#06b6d4',
            menuIcons: '#ffffff',
            textDark: '#ffffff',
            textLight: '#ffffff',
            link: '#06b6d4',
            action: '#06b6d4',
            inactiveTabIcon: '#555555',
            error: '#ef4444',
            inProgress: '#06b6d4',
            complete: '#10b981',
            sourceBg: '#0a0a0a'
          }
        }
      },
      async (error, result) => {
        if (error) {
          console.error('Upload error:', error);
          toast.error('Upload fehlgeschlagen: ' + error.message);
          setIsUploading(false);
          return;
        }

        if (result.event === 'upload-added') {
          setIsUploading(true);
          toast.info('Video wird hochgeladen...');
        }

        if (result.event === 'success') {
          console.log('Upload successful:', result.info);
          const videoUrl = result.info.secure_url;
          
          setUploadedVideo({
            url: videoUrl,
            thumbnail: result.info.thumbnail_url,
            duration: result.info.duration,
            format: result.info.format,
            width: result.info.width,
            height: result.info.height
          });

          toast.success('Video erfolgreich hochgeladen!');
          setIsUploading(false);
        }
      }
    );

    widget.open();
  };

  const saveToDatabase = async () => {
    if (!uploadedVideo) {
      toast.error('Kein Video hochgeladen');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Bitte gib einen Titel ein');
      return;
    }

    try {
      const videoData = {
        title: formData.title,
        description: formData.description,
        video_url: uploadedVideo.url,
        thumbnail_url: uploadedVideo.thumbnail || '',
        creator_name: user?.username || 'Anonymous',
        creator_avatar: user?.avatar_url || '',
        duration: Math.floor(uploadedVideo.duration || 0),
        category: formData.category,
        video_frame: formData.video_frame,
        is_secured: formData.is_secured,
        status: 'ready'
      };

      await base44.entities.Video.create(videoData);
      
      // Award upload tokens
      if (user?.id) {
        const currentUserData = await base44.entities.AppUser.get(user.id);
        const currentTokens = currentUserData?.tokens || user.tokens || 0;
        const newTokens = currentTokens + 1500;
        await base44.entities.AppUser.update(user.id, { 
          tokens: newTokens 
        });
        const updatedUser = { ...user, ...currentUserData, tokens: newTokens };
        localStorage.setItem('app_user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('user-updated'));
        window.dispatchEvent(new CustomEvent('token-reward', { detail: { amount: 1500, source: 'Video Upload', rarity: 'rare' } }));
        toast.success('🎉 +1.500 Tokens für deinen Upload!', { duration: 4000 });
      }
      
      toast.success('Video erfolgreich gespeichert!');
      
      // Reset
      setUploadedVideo(null);
      setFormData({ title: '', description: '', category: 'entertainment' });
      
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Fehler beim Speichern: ' + error.message);
    }
  };

  if (configLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="glass-card rounded-3xl p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto" />
            <p className="text-white/60">Lade Cloudinary-Konfiguration...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!cloudinaryConfig) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="glass-card rounded-3xl p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto">
              <Upload className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Cloudinary nicht konfiguriert</h3>
            <p className="text-white/60 max-w-md">
              Bitte konfiguriere CLOUDINARY_CLOUD_NAME und CLOUDINARY_UPLOAD_PRESET in den Einstellungen.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-8 space-y-6"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent mb-2">
            Video Upload mit Cloudinary
          </h1>
          <p className="text-white/60">
            Lade dein Video hoch und speichere es in der Datenbank
          </p>
        </div>

        {!uploadedVideo ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center">
              <Upload className="w-16 h-16 text-cyan-400" />
            </div>
            <Button
              onClick={openUploadWidget}
              disabled={isUploading}
              className="px-8 py-6 text-lg"
            >
              {isUploading ? 'Wird hochgeladen...' : 'Video hochladen'}
            </Button>
            <p className="text-sm text-white/40">
              Unterstützte Formate: MP4, MOV, AVI, MKV, WebM
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Success Message */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <div>
                <p className="font-semibold text-green-400">Upload erfolgreich!</p>
                <p className="text-sm text-white/60">
                  Dauer: {Math.floor(uploadedVideo.duration || 0)}s | 
                  Auflösung: {uploadedVideo.width}x{uploadedVideo.height}
                </p>
              </div>
            </div>

            {/* Video Preview */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/50 border border-white/10">
              <video
                src={uploadedVideo.url}
                controls
                className="w-full h-full"
                poster={uploadedVideo.thumbnail}
              >
                Dein Browser unterstützt kein Video-Tag.
              </video>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <Label>Titel *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Gib deinem Video einen Titel..."
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Beschreibung</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Beschreibe dein Video..."
                  className="mt-2 h-24"
                />
              </div>

              <div>
                <Label>Kategorie</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gaming">Gaming</SelectItem>
                    <SelectItem value="music">Musik</SelectItem>
                    <SelectItem value="education">Bildung</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="sports">Sport</SelectItem>
                    <SelectItem value="technology">Technologie</SelectItem>
                    <SelectItem value="lifestyle">Lifestyle</SelectItem>
                    <SelectItem value="news">News</SelectItem>
                    <SelectItem value="comedy">Comedy</SelectItem>
                    <SelectItem value="science">Wissenschaft</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Video Frame</Label>
                <Select
                  value={formData.video_frame}
                  onValueChange={(value) => setFormData({ ...formData, video_frame: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Kein Rahmen</SelectItem>
                    {(user?.owned_video_frames || []).map(frameId => (
                      <SelectItem key={frameId} value={frameId}>
                        {frameId.charAt(0).toUpperCase() + frameId.slice(1)} Frame
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                <input
                  type="checkbox"
                  id="is_secured"
                  checked={formData.is_secured}
                  onChange={(e) => setFormData({ ...formData, is_secured: e.target.checked })}
                  className="w-4 h-4 rounded accent-cyan-600"
                />
                <Label htmlFor="is_secured" className="cursor-pointer flex-1">
                  🔒 Gesichertes Video (nur für Nutzer nach Testphase)
                </Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={saveToDatabase}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  In Datenbank speichern
                </Button>
                <Button
                  onClick={() => setUploadedVideo(null)}
                  variant="outline"
                >
                  Neues Video
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Info Box */}
        <div className="mt-6 space-y-3">
          <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
            <p className="text-sm text-green-300/80 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>
                <strong>Cloudinary konfiguriert:</strong> {cloudinaryConfig.cloudName}
              </span>
            </p>
          </div>
          <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
            <p className="text-sm text-cyan-300/80">
              <strong>ℹ️ Hinweis:</strong> Cloudinary ist ein Drittanbieter-Service für Video-Hosting. 
              Deine Videos werden auf Cloudinary-Servern gespeichert und optimiert ausgeliefert.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
            <p className="text-sm text-yellow-300/80">
              <strong>⚠️ Wichtig:</strong> Dein Upload Preset <code className="px-1.5 py-0.5 bg-black/30 rounded text-xs">{cloudinaryConfig.uploadPreset}</code> muss 
              in Cloudinary als <strong>"Unsigned"</strong> konfiguriert sein. 
              Gehe zu: Settings → Upload → Upload Presets → Signing Mode: "Unsigned"
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}