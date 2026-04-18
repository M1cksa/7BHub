import React from 'react';
import { motion } from 'framer-motion';
import { Play, Eye, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const fmt = (v) => { if (v >= 1e6) return `${(v/1e6).toFixed(1)}M`; if (v >= 1e3) return `${(v/1e3).toFixed(1)}K`; return v; };

const DEFAULT_THUMBNAILS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80',
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&q=80',
  'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&q=80',
  'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800&q=80'
];

const getDefaultThumbnail = (id) => {
  let hash = 0;
  const str = id || String(Math.random());
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return DEFAULT_THUMBNAILS[Math.abs(hash) % DEFAULT_THUMBNAILS.length];
};

export default function ModernVideoCard({ video, index = 0 }) {
  const lw = localStorage.getItem('lightweight_mode') === 'true';
  const isLive = video.status === 'live';
  const hot = (video.views || 0) > 10000;

  return (
    <Link to={createPageUrl('Watch') + `?id=${video.id}`}>
      <motion.div
        initial={lw ? false : { opacity: 0, y: 16 }}
        animate={lw ? false : { opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.25), ease: [0.22, 1, 0.36, 1] }}
        className="group relative rounded-2xl overflow-hidden cursor-pointer"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          transition: 'transform 0.3s ease, border-color 0.3s ease',
        }}
      >
        {/* Thumbnail */}
        <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
          {!video.thumbnail_url && (
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900" />
          )}
          <img
            src={video.thumbnail_url || getDefaultThumbnail(video.id)}
            alt={video.title}
            loading="lazy"
            className="w-full h-full transition-transform duration-500 group-hover:scale-105 relative z-0 object-cover"
          />
          {/* Gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-0" />

          {/* Play hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          </div>

          {/* Status badges */}
          {isLive && (
            <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/90 text-white text-[10px] font-bold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />LIVE
            </div>
          )}
          {hot && !isLive && (
            <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/80 text-white text-[10px] font-bold">
              <Flame className="w-2.5 h-2.5" />HOT
            </div>
          )}

          {/* Views */}
          <div className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-white/70 text-[11px] font-medium">
            <Eye className="w-3 h-3 opacity-60" />{fmt(video.views || 0)}
          </div>
        </div>

        {/* Info */}
        <div className="p-3.5">
          <div className="flex gap-2.5">
            <img
              src={video.creator_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${video.creator_name}`}
              className="w-8 h-8 rounded-full ring-1 ring-white/[0.08] shrink-0 mt-0.5"
              alt=""
              loading="lazy"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-[13px] leading-snug line-clamp-2 mb-1">
                {video.title}
              </h3>
              <div className="flex items-center gap-1.5 text-white/30 text-[11px]">
                <span className="font-medium truncate">{video.creator_name}</span>
                {video.category && (
                  <>
                    <span className="w-0.5 h-0.5 rounded-full bg-white/20 shrink-0" />
                    <span className="shrink-0 text-white/25">{video.category}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}