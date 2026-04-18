import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminAssistantImageUpload({ user }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState('');
  const [statusId, setStatusId] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    base44.entities.ServerStatus.list('-created_date', 1).then(records => {
      if (records?.[0]) {
        setStatusId(records[0].id);
        const url = records[0].assistant_image_url || '';
        setPreview(url);
        if (url) localStorage.setItem('assistantImageUrl', url);
      }
    }).catch(() => {});
  }, []);

  if (user?.role !== 'admin') {
    return <div className="text-white/30 text-sm">Admin access required</div>;
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Bitte wähle ein Bild aus');
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      // Save to DB
      if (statusId) {
        await base44.entities.ServerStatus.update(statusId, { assistant_image_url: file_url });
      }
      localStorage.setItem('assistantImageUrl', file_url);
      setPreview(file_url);
      toast.success('Assistent-Bild aktualisiert!');
      window.dispatchEvent(new CustomEvent('assistant-image-updated', { detail: { url: file_url } }));
    } catch (err) {
      toast.error('Upload fehlgeschlagen');
      console.error(err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClear = async () => {
    if (statusId) {
      await base44.entities.ServerStatus.update(statusId, { assistant_image_url: '' }).catch(() => {});
    }
    localStorage.removeItem('assistantImageUrl');
    setPreview('');
    toast.success('Assistent-Bild zurückgesetzt');
    window.dispatchEvent(new CustomEvent('assistant-image-updated', { detail: { url: '' } }));
  };

  return (
    <div className="rounded-2xl border border-white/10 p-6 bg-white/[0.02]">
      <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
        <span>🤖</span> Assistent-Avatar
      </h3>

      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mb-4 flex justify-center"
          >
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-white/20">
              <img src={preview} alt="Assistant" className="w-full h-full object-cover" />
              <button
                onClick={handleClear}
                className="absolute top-1 right-1 p-1 bg-red-500/80 hover:bg-red-600 rounded-full transition"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex gap-2">
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex-1 gap-2"
          variant="secondary"
        >
          <Upload className="w-4 h-4" />
          {uploading ? 'Lädt...' : 'Bild hochladen'}
        </Button>
        {preview && (
          <Button onClick={handleClear} variant="outline" className="px-3">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      <p className="text-xs text-white/40 mt-2">PNG, JPG oder WebP. ~200x200px empfohlen.</p>
    </div>
  );
}