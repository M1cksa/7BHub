import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload as UploadIcon, Loader2, CheckCircle2, X, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function UploadShort() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    tags: '',
    audience: 'all'
  });

  useEffect(() => {
    const stored = localStorage.getItem('app_user');
    if (stored) {
      try {
        const parsedUser = JSON.parse(stored);
        setUser(parsedUser);
        
        // Check trial phase
        if (parsedUser.role !== 'admin' && !parsedUser.trial_completed) {
          const accountAge = Date.now() - new Date(parsedUser.created_date).getTime();
          if (accountAge < (24 * 60 * 60 * 1000)) {
            const hoursLeft = Math.ceil((24 * 60 * 60 * 1000 - accountAge) / (60 * 60 * 1000));
            toast.error(`Testphase aktiv - Upload erst in ${hoursLeft}h möglich`);
            window.location.href = createPageUrl('Shorts');
          }
        }
      } catch (e) {}
    }
  }, []);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile || !selectedFile.type.startsWith('video/')) {
      toast.error('Bitte wähle eine Videodatei aus');
      return;
    }

    const sizeMB = selectedFile.size / (1024 * 1024);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const maxSize = isMobile ? 2000 : 3000; // 2GB mobile, 3GB desktop für Shorts
    
    if (sizeMB > maxSize) {
      toast.error(`Short zu groß! Max ${maxSize / 1000}GB (${(sizeMB / 1000).toFixed(2)}GB)`);
      return;
    }
    
    if (sizeMB > 500) {
      toast.info('Großes Short - Upload kann länger dauern', { duration: 3000 });
    }

    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
  };

  const handleUpload = async () => {
    if (!user) {
      window.location.href = createPageUrl('SignIn');
      return;
    }

    if (!file) {
      toast.error('Keine Datei ausgewählt');
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      // Get duration
      setProgress(15);
      const videoElement = document.createElement('video');
      const videoURL = URL.createObjectURL(file);
      videoElement.src = videoURL;

      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Video-Metadaten-Fehler')), 10000);
        videoElement.onloadedmetadata = () => {
          clearTimeout(timeout);
          resolve();
        };
        videoElement.onerror = () => {
          clearTimeout(timeout);
          reject(new Error('Video konnte nicht geladen werden'));
        };
      });

      const durationSeconds = Math.floor(videoElement.duration);
      URL.revokeObjectURL(videoURL);

      setProgress(20);

      // 1. Resumable Drive-Session starten
      const initRes = await base44.functions.invoke('initGDriveUpload', {
        title: form.title || file.name,
        description: form.description,
        mimeType: file.type,
        fileSize: file.size,
      });
      if (initRes.data?.error) throw new Error(initRes.data.error);
      const { locationUrl } = initRes.data;

      // 2. Chunked Upload direkt zu Drive
      const CHUNK_SIZE = 5 * 1024 * 1024;
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      let fileId = null;
      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);
        setProgress(Math.round(25 + (i / totalChunks) * 60));
        const chunkRes = await fetch(locationUrl, {
          method: 'PUT',
          headers: { 'Content-Range': `bytes ${start}-${end - 1}/${file.size}` },
          body: chunk,
        });
        if (chunkRes.status === 308) continue;
        if (chunkRes.status === 200 || chunkRes.status === 201) {
          const data = await chunkRes.json();
          fileId = data.id;
          break;
        }
        const errText = await chunkRes.text();
        throw new Error(`Chunk ${i + 1} fehlgeschlagen (${chunkRes.status}): ${errText}`);
      }
      if (!fileId) throw new Error('Upload abgeschlossen, aber keine Datei-ID erhalten');

      setProgress(88);

      // 3. Finalize: public + Metadaten
      const finalRes = await base44.functions.invoke('finalizeGDriveUpload', { fileId });
      if (finalRes.data?.error) throw new Error(finalRes.data.error);
      const driveData = finalRes.data;

      setProgress(92);

      // 4. Short-Entity anlegen
      await base44.entities.Short.create({
        title: form.title || 'Untitled',
        description: form.description,
        video_url: driveData.webContentLink,
        video_source: 'google_drive',
        drive_file_id: fileId,
        thumbnail_url: driveData.thumbnailLink || null,
        creator_username: user?.username || 'Unknown',
        creator_avatar: user?.avatar_url || null,
        creator_name: user?.username || null,
        duration: durationSeconds,
        audience: form.audience || 'all',
        tags: form.tags || null,
      });

      // Award upload tokens
      if (user?.id) {
        const currentTokens = user.tokens || 0;
        await base44.entities.AppUser.update(user.id, { 
          tokens: currentTokens + 1500 
        });
        const updatedUser = { ...user, tokens: currentTokens + 1500 };
        localStorage.setItem('app_user', JSON.stringify(updatedUser));
        toast.success('🎉 +1.500 Tokens für deinen Upload!', { duration: 4000 });
      }

      setProgress(100);
      toast.success('Short hochgeladen!');

      setTimeout(() => {
        window.location.href = createPageUrl('Shorts');
      }, 800);
    } catch (error) {
      console.error('Upload Error:', error);
      toast.error(error.message || 'Upload fehlgeschlagen');
      setUploading(false);
      setProgress(0);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Login erforderlich</h2>
          <Link to={createPageUrl('SignIn')}>
            <Button className="bg-cyan-600">Anmelden</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black">Short hochladen</h1>
          <Link to={createPageUrl('Shorts')}>
            <Button variant="ghost" className="text-white/50">
              <X className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="relative border-2 border-dashed border-white/20 rounded-3xl p-16 text-center hover:border-cyan-500/50 transition-all cursor-pointer group">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-20 h-20 mx-auto rounded-full bg-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Film className="w-10 h-10 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Video auswählen</h3>
                <p className="text-white/50">Direkter Google Drive Upload • 4K • MP4, MOV, WEBM</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="aspect-[9/16] max-h-[70vh] mx-auto bg-black rounded-2xl overflow-hidden">
                <video src={previewUrl} controls className="w-full h-full object-contain" />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Titel</label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Gib deinem Short einen Titel..."
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Beschreibung</label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Was passiert in diesem Video?"
                    className="bg-white/5 border-white/10 text-white"
                    rows={3}
                  />
                </div>

                <div>
                   <label className="text-sm font-medium mb-2 block">Hashtags (durch Komma trennen)</label>
                   <Input
                     value={form.tags}
                     onChange={(e) => setForm({ ...form, tags: e.target.value })}
                     placeholder="funny, gaming, trend"
                     className="bg-white/5 border-white/10 text-white"
                   />
                 </div>

                 <div>
                   <label className="text-sm font-medium mb-2 block">Zielgruppe</label>
                   <Select value={form.audience} onValueChange={(value) => setForm({ ...form, audience: value })}>
                     <SelectTrigger className="bg-white/5 border-white/10 text-white">
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent className="bg-[#1a1a1b] border-white/10 text-white">
                       <SelectItem value="all" className="text-white hover:bg-white/10 cursor-pointer">👥 Alle</SelectItem>
                       <SelectItem value="girl" className="text-white hover:bg-white/10 cursor-pointer">👧 Girl</SelectItem>
                       <SelectItem value="boy" className="text-white hover:bg-white/10 cursor-pointer">👦 Boy</SelectItem>
                       <SelectItem value="mixed" className="text-white hover:bg-white/10 cursor-pointer">🤝 Mixed</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
                </div>

              {uploading && (
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Upload läuft...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-500 to-teal-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl(null);
                  }}
                  className="flex-1 border-white/10"
                  disabled={uploading}
                >
                  Neu auswählen
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={uploading || !form.title}
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-teal-500"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Wird hochgeladen...
                    </>
                  ) : (
                    <>
                      <UploadIcon className="w-4 h-4 mr-2" />
                      Veröffentlichen
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}