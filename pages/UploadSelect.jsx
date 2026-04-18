import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload as UploadIcon, Film, MonitorPlay, Cloud } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function UploadSelect() {
  return (
    <div className="max-w-6xl mx-auto py-6 md:py-12 px-4 lg:px-8">
      <div className="text-center mb-8 md:mb-10">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-teal-200 drop-shadow-lg">Upload Studio</h1>
        <p className="text-white/50 text-base md:text-lg mt-2">Veröffentliche deine besten Momente</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Video hochladen</h2>
          <p className="text-white/50 text-base">Alle Videos werden sicher über Google Drive gespeichert.</p>
        </div>

        <Link to={createPageUrl('GoogleDriveUpload')} className="block mb-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative rounded-3xl border-2 border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 hover:border-green-500/50 p-8 transition-all cursor-pointer group backdrop-blur-sm shadow-xl hover:shadow-2xl hover:shadow-green-500/20"
          >
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <Cloud className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-2xl font-bold text-white mb-2">Video hochladen</h3>
                <p className="text-white/70 text-sm">Lade dein Video direkt in deine sichere Cloud hoch. Keine Größenlimits, kein Transcoding – einfach hochladen und loslegen.</p>
                <div className="flex gap-2 mt-3">
                  <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">Unbegrenzte Größe</span>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full">Sichere Cloud</span>
                </div>
              </div>
            </div>
          </motion.div>
        </Link>

        <div className="flex justify-center flex-wrap gap-4 text-xs md:text-sm text-white/40 font-medium mt-8">
          <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5">
            <MonitorPlay className="w-4 h-4 text-cyan-400" /> 8K/4K
          </span>
          <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5">
            <Film className="w-4 h-4 text-fuchsia-400" /> Bis 60 FPS
          </span>
          <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5">
            <UploadIcon className="w-4 h-4 text-green-400" /> Direkt-Upload
          </span>
        </div>
      </motion.div>
    </div>
  );
}
