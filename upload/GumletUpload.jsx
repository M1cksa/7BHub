import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Zap, Check, Loader2 } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function GumletUpload() {
  const [step, setStep] = useState('select'); // select, details, uploading, done
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'entertainment',
    thumbnail_url: ''
  });

  React.useEffect(() => {
    const stored = localStorage.getItem('app_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        console.error('User parse error', e);
      }
    }
  }, []);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('video/')) {
      toast.error('Bitte wähle eine Videodatei aus');
      return;
    }

    setFile(selectedFile);
    setFormData((prev) => ({ ...prev, title: selectedFile.name.replace(/\.[^/.]+$/, '') }));
    setStep('details');
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    setUploading(true);
    setStep('uploading');
    setProgress(10);

    try {
      // Step 1: Create upload URL via backend
      setProgress(20);

      const uploadResponse = await base44.functions.invoke('uploadToGumlet', {
        title: formData.title,
        description: formData.description,
        category: formData.category
      });

      if (!uploadResponse.data.success) {
        throw new Error(uploadResponse.data.error || 'Gumlet upload initialization failed');
      }

      const { upload_url, asset_id, playback_url, thumbnail_url } = uploadResponse.data;

      setProgress(40);

      // Step 2: Upload file directly to Gumlet S3
      const uploadToS3 = await fetch(upload_url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });

      if (!uploadToS3.ok) {
        throw new Error('File upload to Gumlet failed');
      }

      setProgress(70);

      // Step 3: Create Video entity
      const videoData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        video_url: playback_url,
        thumbnail_url: formData.thumbnail_url || thumbnail_url,
        creator_name: user.username,
        creator_avatar: user.avatar_url,
        views: 0,
        likes_count: 0,
        status: 'processing',
        video_source: 'other'
      };

      await base44.entities.Video.create(videoData);

      setProgress(100);

      // Reward tokens
      if (!user.is_donor) {
        const currentUserData = await base44.entities.AppUser.get(user.id);
        const currentTokens = currentUserData?.tokens || user.tokens || 0;
        const newTokens = currentTokens + 1500;
        await base44.entities.AppUser.update(user.id, { tokens: newTokens });
        const updated = { ...user, ...currentUserData, tokens: newTokens };
        localStorage.setItem('app_user', JSON.stringify(updated));
        window.dispatchEvent(new Event('user-updated'));
        window.dispatchEvent(new CustomEvent('token-reward', { detail: { amount: 1500, source: 'Video Upload', rarity: 'rare' } }));
      }

      toast.success('Video erfolgreich hochgeladen! 🎉');
      setStep('done');

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Upload fehlgeschlagen');
      setStep('details');
    } finally {
      setUploading(false);
    }
  };

  if (step === 'done') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">

          <Check className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="text-3xl font-black text-white mb-3">Upload erfolgreich!</h2>
        <p className="text-white/60 mb-2">Dein Video wurde zu Gumlet hochgeladen und wird verarbeitet.</p>
        <p className="text-white/40 text-sm mb-8">Die Verarbeitung kann einige Minuten dauern.</p>
        <div className="flex gap-4 justify-center">
          <Button asChild className="bg-gradient-to-r from-cyan-600 to-teal-600">
            <a href={createPageUrl('Home')}>Zur Startseite</a>
          </Button>
          <Button onClick={() => {setStep('select');setFile(null);}} variant="outline">
            Weiteres Video hochladen
          </Button>
        </div>
      </div>);

  }

  if (step === 'uploading') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-600 to-teal-600 flex items-center justify-center animate-pulse">
          <Zap className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Upload zu Gumlet...</h2>
        <div className="w-full bg-white/10 rounded-full h-3 mb-4 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-600 to-teal-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }} />

        </div>
        <p className="text-white/50 text-sm">{progress}% abgeschlossen</p>
      </div>);

  }

  if (step === 'details') {
    return (
      <div className="max-w-3xl mx-auto py-6 px-4">
        <h2 className="text-3xl font-black text-white mb-6">Video-Details</h2>
        
        <div className="space-y-5 bg-white/[0.03] p-6 rounded-2xl border border-white/10">
          <div>
            <label className="block text-white font-bold mb-2">Titel *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Gib deinem Video einen Titel..." />

          </div>

          <div>
            <label className="block text-white font-bold mb-2">Beschreibung</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Beschreibe dein Video..."
              className="min-h-[120px]" />

          </div>

          <div>
            <label className="block text-white font-bold mb-2">Kategorie *</label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gaming">Gaming</SelectItem>
                <SelectItem value="music">Musik</SelectItem>
                <SelectItem value="education">Bildung</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="sports">Sport</SelectItem>
                <SelectItem value="technology">Technologie</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-white font-bold mb-2">Thumbnail URL (optional)</label>
            <Input
              value={formData.thumbnail_url}
              onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
              placeholder="https://..." />

          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={() => setStep('select')} variant="outline" className="flex-1">
              Zurück
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!formData.title || uploading}
              className="flex-1 bg-gradient-to-r from-cyan-600 to-teal-600">

              {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
              Hochladen
            </Button>
          </div>
        </div>
      </div>);

  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-600 to-teal-600 flex items-center justify-center">
          <Zap className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-black text-white mb-2">Gumlet Upload (In Entwicklung)</h1>
        <p className="text-white/60">Professionelles Video-Hosting mit optimierter Auslieferung</p>
      </div>

      <div className="relative">
        <input
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
          id="gumlet-upload" />

        <label
          htmlFor="gumlet-upload"
          className="block p-12 border-2 border-dashed border-white/20 rounded-2xl hover:border-cyan-500/50 hover:bg-white/[0.02] transition-all cursor-pointer text-center">

          <Upload className="w-12 h-12 mx-auto mb-4 text-white/50" />
          <p className="text-white font-bold mb-2">Videodatei auswählen</p>
          <p className="text-white/40 text-sm">Klicke hier oder ziehe eine Datei hinein</p>
        </label>
      </div>

      <div className="mt-6 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
        <p className="text-cyan-300 text-sm">Der Upload funktioniert möglicherweise noch nicht, da diese Funktion in Entwicklung ist

        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-white/40">
        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
          <span className="font-bold text-white/70">Max. Größe (Free):</span> 250 MB
        </div>
        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
          <span className="font-bold text-white/70">Max. Größe (Premium):</span> 5 GB
        </div>
      </div>
    </div>);

}