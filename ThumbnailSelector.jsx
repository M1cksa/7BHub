import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ThumbnailSelector({ videoUrl, onSelect, selectedThumbnail }) {
  const [thumbnails, setThumbnails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customThumbnail, setCustomThumbnail] = useState(null);

  useEffect(() => {
    if (videoUrl) {
      generateThumbnails();
    }
  }, [videoUrl]);

  const generateThumbnails = async () => {
    setLoading(true);
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      video.src = videoUrl;

      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve;
        video.onerror = reject;
        setTimeout(() => reject(new Error('Timeout')), 10000);
      });

      const duration = video.duration;
      const timestamps = [
        0.1,
        duration * 0.25,
        duration * 0.5,
        duration * 0.75,
        duration * 0.9
      ];

      const thumbs = [];
      for (const time of timestamps) {
        const blob = await captureThumbnailAtTime(video, time);
        if (blob) {
          thumbs.push({
            blob,
            url: URL.createObjectURL(blob),
            time: Math.floor(time),
          });
        }
      }

      setThumbnails(thumbs);
      if (thumbs.length > 0 && !selectedThumbnail) {
        onSelect(thumbs[2]?.blob || thumbs[0].blob); // Select middle or first
      }
    } catch (error) {
      console.error('Thumbnail generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const captureThumbnailAtTime = (video, time) => {
    return new Promise((resolve) => {
      video.currentTime = time;
      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = Math.min(video.videoWidth, 1280);
          canvas.height = Math.min(video.videoHeight, 720);
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.85);
        } catch (error) {
          resolve(null);
        }
      };
    });
  };

  const handleCustomUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const blob = new Blob([reader.result], { type: file.type });
        setCustomThumbnail({
          blob,
          url: URL.createObjectURL(blob),
        });
        onSelect(blob);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        <span className="ml-3 text-white/60">Generiere Vorschaubilder...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white/70">Thumbnail auswählen</h3>
      <div className="grid grid-cols-3 gap-3">
        {thumbnails.map((thumb, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(thumb.blob)}
            className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
              selectedThumbnail === thumb.blob
                ? 'border-cyan-500 shadow-lg shadow-cyan-500/30'
                : 'border-white/10 hover:border-white/30'
            }`}
          >
            <img src={thumb.url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
            {selectedThumbnail === thumb.blob && (
              <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
            )}
            <div className="absolute bottom-1 right-1 px-2 py-0.5 bg-black/60 rounded text-xs text-white">
              {thumb.time}s
            </div>
          </motion.button>
        ))}

        {/* Custom Upload */}
        <motion.label
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`relative aspect-video rounded-lg overflow-hidden border-2 border-dashed cursor-pointer transition-all ${
            customThumbnail
              ? 'border-cyan-500 shadow-lg shadow-cyan-500/30'
              : 'border-white/20 hover:border-white/40'
          }`}
        >
          <input type="file" accept="image/*" onChange={handleCustomUpload} className="hidden" />
          {customThumbnail ? (
            <>
              <img src={customThumbnail.url} alt="Custom" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-white/5">
              <Upload className="w-6 h-6 text-white/40 mb-1" />
              <span className="text-xs text-white/40">Eigenes</span>
            </div>
          )}
        </motion.label>
      </div>
    </div>
  );
}