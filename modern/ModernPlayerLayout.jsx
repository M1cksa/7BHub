import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Heart, Share2, MessageSquare, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const formatViews = (views) => {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views;
};

export default function ModernPlayerLayout({ video, creator, stats, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-black">
      {/* Video Player Container */}
      <div className="relative">
        {children}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Modern Info Card */}
        <div className="relative group mb-8">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 rounded-3xl opacity-20 group-hover:opacity-40 blur transition-all duration-500" />
          
          <div className="relative glass-card p-6 md:p-8 rounded-3xl">
            {/* Title & Stats Row */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div className="flex-1">
                <h1 className="text-2xl md:text-4xl font-black text-white mb-4 leading-tight">
                  {video.title}
                </h1>
                
                {/* Stats Pills */}
                <div className="flex flex-wrap gap-3">
                  <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-cyan-400" />
                    <span className="text-white/80 font-semibold text-sm">
                      {formatViews(stats?.views || 0)} Aufrufe
                    </span>
                  </div>
                  
                  <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-400" />
                    <span className="text-white/80 font-semibold text-sm">
                      {formatViews(stats?.likes || 0)}
                    </span>
                  </div>

                  <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-violet-400" />
                    <span className="text-white/80 font-semibold text-sm">
                      {video.created_date && format(new Date(video.created_date), 'PP', { locale: de })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl font-bold text-white shadow-lg shadow-pink-500/30 flex items-center gap-2"
                >
                  <Heart className="w-5 h-5" />
                  <span className="hidden sm:inline">Like</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-white/10 backdrop-blur-xl rounded-2xl font-bold text-white border border-white/20 flex items-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="hidden sm:inline">Teilen</span>
                </motion.button>
              </div>
            </div>

            {/* Creator Info */}
            {creator && (
              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full blur opacity-75" />
                    <img
                      src={creator.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.username}`}
                      alt={creator.username}
                      className="relative w-14 h-14 rounded-full border-2 border-white/20"
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{creator.username}</h3>
                    <p className="text-white/50 text-sm">{creator.bio || 'Content Creator'}</p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-white text-black rounded-2xl font-bold shadow-lg"
                >
                  Folgen
                </motion.button>
              </div>
            )}

            {/* Description */}
            {video.description && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-white/70 leading-relaxed whitespace-pre-wrap">
                  {video.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}