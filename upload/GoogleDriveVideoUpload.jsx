import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Upload as UploadIcon, Loader2, CheckCircle2, X, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function GoogleDriveVideoUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'entertainment',
    video_frame: 'none',
    audience: 'all'
  });

  const [user, setUser] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          toast.error('Du musst angemeldet sein um Videos hochzuladen');
          setTimeout(() => {
            base44.auth.redirectToLogin(createPageUrl('GoogleDriveUpload'));
          }, 1500);
          return;
        }
        
        const stored = localStorage.getItem('app_user');
        if (stored) {
          try {setUser(JSON.parse(stored));} catch (e) {}
        }
      } catch (e) {
        console.error('Auth check error:', e);
      } finally {
        setIsAuthChecking(false);
      }
    };
    
    checkAuth();
  }, []);

  const dropZoneRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    };
  }, [previewUrl, thumbnailPreview]);

  const handleThumbnailSelect = (selectedFile) => {
    if (!selectedFile || !selectedFile.type.startsWith('image/')) {
      toast.error('Bitte wähle eine gültige Bilddatei aus');
      return;
    }
    setThumbnail(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setThumbnailPreview(url);
  };

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile || !selectedFile.type.startsWith('video/')) {
      toast.error('Bitte wähle eine gültige Videodatei aus');
      return;
    }

    // Google Drive can handle large files - removed artificial limit
    // The backend function will handle the upload directly to Google Drive

    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    setForm((prev) => ({ ...prev, title: selectedFile.name.split('.')[0] }));
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) dropZoneRef.current.classList.add('border-green-500', 'bg-white/10');
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) dropZoneRef.current.classList.remove('border-green-500', 'bg-white/10');
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) dropZoneRef.current.classList.remove('border-green-500', 'bg-white/10');
    handleFileSelect(e.dataTransfer.files[0]);
  };

  const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB

  const handleUpload = async () => {
    if (!file || !form.title) return;

    setUploading(true);
    setProgress(2);
    setStatusMessage('Starte Upload-Session...');

    try {
      // 1. Init resumable session on Google Drive
      const initRes = await base44.functions.invoke('initGDriveUpload', {
        title: form.title,
        description: form.description,
        mimeType: file.type,
        fileSize: file.size,
      });
      if (initRes.data?.error) throw new Error(initRes.data.error);
      const { locationUrl } = initRes.data;

      // 2. Upload file in chunks directly to Google Drive
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      let fileId = null;

      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        setStatusMessage(`Chunk ${i + 1}/${totalChunks} wird hochgeladen...`);
        setProgress(Math.round(5 + ((i / totalChunks) * 75)));

        const chunkRes = await fetch(locationUrl, {
          method: 'PUT',
          headers: {
            'Content-Range': `bytes ${start}-${end - 1}/${file.size}`,
          },
          body: chunk,
        });

        if (chunkRes.status === 308) {
          // Incomplete, continue to next chunk
          continue;
        } else if (chunkRes.status === 200 || chunkRes.status === 201) {
          // Complete
          const uploadData = await chunkRes.json();
          fileId = uploadData.id;
          break;
        } else {
          const errText = await chunkRes.text();
          throw new Error(`Chunk ${i + 1} fehlgeschlagen (${chunkRes.status}): ${errText}`);
        }
      }

      if (!fileId) throw new Error('Upload abgeschlossen, aber keine Datei-ID erhalten');

      setProgress(85);
      setStatusMessage('Berechtigungen werden gesetzt...');

      // 3. Finalize: make public + get links
      const finalRes = await base44.functions.invoke('finalizeGDriveUpload', { fileId });
      if (finalRes.data?.error) throw new Error(finalRes.data.error);

      setProgress(92);
      setStatusMessage('Speichere Video-Daten...');

      const driveData = finalRes.data;

      // 3. Upload custom thumbnail if provided
      let thumbnailUrl = driveData.thumbnailLink || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=640&h=360&fit=crop';
      if (thumbnail) {
        try {
          const thumbUploadResult = await base44.integrations.Core.UploadFile({ file: thumbnail });
          if (thumbUploadResult?.file_url) {
            thumbnailUrl = thumbUploadResult.file_url;
          }
        } catch (thumbErr) {
          console.error('Thumbnail upload failed, using default:', thumbErr);
        }
      }

      // 4. Create Entity
      await base44.entities.Video.create({
       title: form.title,
       description: form.description,
       video_url: driveData.webContentLink,
       video_source: 'google_drive',
       thumbnail_url: thumbnailUrl,
       category: form.category,
       video_frame: form.video_frame,
       audience: form.audience || 'all',
       creator_name: user?.username || 'Unknown',
       creator_avatar: user?.avatar_url || null,
       status: 'ready'
      });

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
      }

      setProgress(100);
      setStatusMessage('Erfolgreich!');
      toast.success('🎉 Video hochgeladen! +100 Tokens verdient', { duration: 4000 });

      setTimeout(() => {
        navigate(createPageUrl('Home'));
      }, 1500);

    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Ein Fehler ist aufgetreten');
      setUploading(false);
      setProgress(0);
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
       <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-white mb-2">Google Drive Upload</h1>
        <p className="text-white/50">Sicherer Upload direkt in Drive<br />
        Große Uploads können extrem lange dauern.</p>
        <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 text-sm mt-2 inline-block">
          Google Drive Nutzungsbedingungen (AGB)
        </a>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          {!file ? <div
            ref={dropZoneRef}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className="border-2 border-dashed border-white/20 rounded-3xl h-64 flex flex-col items-center justify-center text-center p-6 transition-all hover:bg-white/5 cursor-pointer relative bg-black/20">

              <input
              type="file"
              accept="video/*"
              onChange={(e) => handleFileSelect(e.target.files[0])}
              className="absolute inset-0 opacity-0 cursor-pointer z-10" />

              <div className="w-16 h-16 rounded-full bg-green-600/20 flex items-center justify-center mb-4">
                <UploadIcon className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-white font-medium mb-1">Video hierher ziehen</p>
              <p className="text-white/40 text-sm">oder klicken zum Auswählen</p>
              <p className="text-white/20 text-xs mt-4">Unbegrenzte Dateigröße</p>
            </div> :

          <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10 aspect-video group">
              <video src={previewUrl} className="w-full h-full object-contain" controls />
              <button
              onClick={() => {setFile(null);setPreviewUrl(null);}}
              className="absolute top-2 right-2 p-2 bg-black/60 rounded-full text-white/70 hover:text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100">

                <X className="w-5 h-5" />
              </button>
            </div>
          }
        </div>

        <div className="space-y-6 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-100/80">
              <p className="font-semibold text-amber-100 mb-1">Wichtig: Upload-Dauer & Fenster</p>
              Der Upload zu Google Drive kann bei großen Dateien <strong>sehr lange</strong> dauern. Um die Zeit zu verkürzen, kannst du dein Video vorher komprimieren oder die Auflösung verringern. <strong className="text-amber-400">Bitte schließe oder wechsle dieses Fenster nicht, bis der Upload vollständig abgeschlossen ist!</strong>
            </div>
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-100/80">
              <p className="font-semibold text-blue-100 mb-1">Hinweis zur Verarbeitung</p>
              Nach dem Upload muss das Video von Google Drive verarbeitet werden. 
              Dies kann je nach Dateigröße einige Minuten bis Stunden dauern. 
              Bis dahin wird im Player "Verarbeitung läuft" angezeigt.
            </div>
          </div>

          <div>
            <Label className="text-white mb-2 block">Thumbnail (optional)</Label>
            <div className="relative">
              {!thumbnailPreview ? (
                <label className="block border-2 border-dashed border-white/20 rounded-xl p-4 text-center cursor-pointer hover:bg-white/5 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleThumbnailSelect(e.target.files[0])}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center">
                    <ImageIcon className="w-6 h-6 text-white/40 mb-2" />
                    <p className="text-sm text-white/60">Bild hochladen</p>
                  </div>
                </label>
              ) : (
                <div className="relative rounded-lg overflow-hidden">
                  <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-32 object-cover" />
                  <button
                    onClick={() => { setThumbnail(null); setThumbnailPreview(null); }}
                    className="absolute top-1 right-1 p-1 bg-black/60 rounded text-white/70 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <Label className="text-white mb-2 block">Titel</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Video Titel"
              className="bg-black/20 border-white/10 text-white" />

          </div>

          <div>
            <Label className="text-white mb-2 block">Beschreibung</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Worum geht es?"
              className="bg-black/20 border-white/10 text-white min-h-[100px]" />

          </div>

          <div>
            <Label className="text-white mb-2 block">Kategorie</Label>
            <Select
              value={form.category}
              onValueChange={(value) => setForm({ ...form, category: value })}>

              <SelectTrigger className="bg-black/20 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['gaming', 'music', 'education', 'entertainment', 'tech', 'lifestyle'].map((cat) =>
                <SelectItem key={cat} value={cat} className="capitalize">
                    {cat}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
            <Label className="text-white mb-1 block flex items-center gap-2">
              Sichtbar für
              <span className="text-[10px] uppercase font-bold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
                Wichtig
              </span>
            </Label>
            <p className="text-xs text-cyan-100/60 mb-3">Bitte wähle sorgfältig aus, für wen dieses Video bestimmt ist.</p>
            <Select
              value={form.audience}
              onValueChange={(value) => setForm({ ...form, audience: value })}>

              <SelectTrigger className="bg-black/40 border-cyan-500/30 text-white ring-offset-black focus:ring-cyan-500/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">🌍 Alle</SelectItem>
                {user?.audience_group !== 'boy' && <SelectItem value="girl">👧 Mädchen</SelectItem>}
                <SelectItem value="boy">👦 Jungs</SelectItem>
                <SelectItem value="mixed">🔀 Gemischt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-white mb-2 block">Video Rahmen</Label>
            <Select
              value={form.video_frame}
              onValueChange={(value) => setForm({ ...form, video_frame: value })}>

              <SelectTrigger className="bg-black/20 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['none', 'gold', 'neon', 'fire', 'glitch', 'rainbow', 'diamond', 'cyber', 'nature'].map((frame) =>
                <SelectItem key={frame} value={frame} className="capitalize">
                    {frame}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {uploading &&
          <div className="space-y-2">
              <div className="flex justify-between text-xs text-white/60">
                <span>{statusMessage}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                className="h-full bg-green-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }} />

              </div>
            </div>
          }

          <div className="pt-4 flex gap-3">
             <Link to={createPageUrl('UploadSelect')} className="flex-1">
               <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/10">Zurück</Button>
             </Link>
             <motion.div 
               className="flex-[2]" 
               animate={!uploading && file && form.title ? { scale: [1, 1.05, 1], boxShadow: ['0 0 0 0 rgba(34, 197, 94, 0.7)', '0 0 0 20px rgba(34, 197, 94, 0)', '0 0 0 0 rgba(34, 197, 94, 0.7)'] } : {}} 
               transition={{ duration: 2, repeat: Infinity }}>
               <Button
                onClick={handleUpload}
                disabled={!file || !form.title || uploading}
                className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-400 hover:via-emerald-400 hover:to-green-500 text-white font-black text-lg h-14 shadow-2xl shadow-green-500/50 border-2 border-green-300/50 hover:border-green-200 hover:shadow-green-400/60 disabled:opacity-50">

                 {uploading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <UploadIcon className="w-5 h-5 mr-2" />}
                 HOCHLADEN
               </Button>
             </motion.div>
          </div>
        </div>
      </div>
    </div>);

}