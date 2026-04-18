import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Film, FileVideo, Sparkles, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdvancedUploadZone({ onFilesSelected, maxSize = 10 * 1024 * 1024 * 1024 }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
    
    if (!validTypes.includes(file.type)) {
      toast.error('Ungültiges Format. Bitte MP4, WebM, MOV, AVI oder MKV hochladen.');
      return false;
    }
    
    if (file.size > maxSize) {
      toast.error(`Datei zu groß. Maximum: ${Math.round(maxSize / 1024 / 1024 / 1024)}GB`);
      return false;
    }
    
    return true;
  };

  const handleFiles = async (files) => {
    setIsProcessing(true);
    const validFiles = Array.from(files).filter(validateFile);
    
    if (validFiles.length > 0) {
      await onFilesSelected(validFiles);
    }
    
    setIsProcessing(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <motion.div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      animate={{
        scale: isDragging ? 1.02 : 1,
        borderColor: isDragging ? 'rgba(6, 182, 212, 0.8)' : 'rgba(255, 255, 255, 0.1)'
      }}
      className={`relative group cursor-pointer transition-all duration-300 ${
        isDragging ? 'ring-4 ring-cyan-500/50' : ''
      }`}
      onClick={() => !isProcessing && fileInputRef.current?.click()}
    >
      {/* Animated Background */}
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-75 blur-2xl transition-all duration-700" />
      
      <div className="relative glass-card p-16 rounded-3xl border-2 border-white/10 border-dashed">
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center animate-pulse">
                <Zap className="w-12 h-12 text-white" />
              </div>
              <p className="text-white text-xl font-bold">Verarbeite Videos...</p>
            </motion.div>
          ) : isDragging ? (
            <motion.div
              key="dragging"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <motion.div 
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="w-32 h-32 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-2xl shadow-cyan-500/50"
              >
                <Upload className="w-16 h-16 text-white" />
              </motion.div>
              <p className="text-white text-2xl font-black mb-2">Jetzt loslassen!</p>
              <p className="text-white/50">Video wird hochgeladen...</p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-32 h-32 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-cyan-500 via-violet-500 to-pink-500 flex items-center justify-center shadow-2xl"
              >
                <Film className="w-16 h-16 text-white" />
              </motion.div>

              <h3 className="text-3xl font-black text-white mb-3">
                Videos hochladen
              </h3>
              <p className="text-white/60 text-lg mb-6">
                Drag & Drop oder klicken zum Auswählen
              </p>

              <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="p-4 bg-white/5 rounded-2xl">
                  <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <p className="text-white/70 text-sm font-semibold">4K Support</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl">
                  <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <p className="text-white/70 text-sm font-semibold">Bis 10GB</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl">
                  <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <p className="text-white/70 text-sm font-semibold">Multi-Upload</p>
                </div>
              </div>

              <div className="mt-8 text-xs text-white/40">
                Unterstützte Formate: MP4, WebM, MOV, AVI, MKV
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}