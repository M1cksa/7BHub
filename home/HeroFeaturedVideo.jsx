import { Play, Eye, Radio, Flame, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

const fmt = (v) => { if (v >= 1e6) return `${(v/1e6).toFixed(1)}M`; if (v >= 1e3) return `${(v/1e3).toFixed(1)}K`; return String(v || 0); };

export default function HeroFeaturedVideo({ video }) {
  if (!video) return null;
  const isLive = video.status === 'live';

  return (
    <Link to={createPageUrl('Watch') + `?id=${video.id}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full rounded-3xl overflow-hidden group cursor-pointer"
        style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.07), 0 40px 80px -20px rgba(0,0,0,0.8)' }}
      >
        {/* Aspect Ratio Container */}
        <div className="relative aspect-video md:aspect-[21/9]">
          <img
            src={video.thumbnail_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&h=800&fit=crop'}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-1000 ease-out"
            fetchpriority="high"
          />

          {/* Cinematic Gradient Layers */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />
          {/* Subtle color tint for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/30 via-transparent to-violet-950/20 mix-blend-multiply" />

          {/* Animated glow pulse on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: 'radial-gradient(ellipse at center, color-mix(in srgb, var(--theme-primary) 15%, transparent) 0%, transparent 70%)' }} />

          {/* Center Play Button */}
          <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-all duration-400">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="relative w-20 h-20 rounded-full flex items-center justify-center"
            >
              {/* Pulsing ring */}
              <div className="absolute inset-0 rounded-full bg-white/10 animate-ping" style={{ animationDuration: '1.5s' }} />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-white/25 to-white/10 backdrop-blur-xl flex items-center justify-center ring-1 ring-white/30 shadow-2xl">
                <Play className="w-9 h-9 text-white fill-white ml-1" />
              </div>
            </motion.div>
          </div>

          {/* Top Badges */}
          <div className="absolute top-5 left-5 z-20 flex gap-2">
            {isLive ? (
              <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-600 text-white text-xs font-black shadow-xl shadow-red-600/50 ring-1 ring-white/20">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />LIVE
              </span>
            ) : (video.views || 0) > 10000 ? (
              <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-black shadow-xl shadow-orange-600/50 ring-1 ring-white/20">
                <Flame className="w-3.5 h-3.5" />TRENDING
              </span>
            ) : null}
          </div>

          {/* Duration badge */}
          {video.duration && (
            <div className="absolute top-5 right-5 z-20 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-white/90 text-xs font-bold ring-1 ring-white/10">
              <Clock className="w-3 h-3 inline mr-1 opacity-70" />{video.duration}
            </div>
          )}

          {/* Bottom Info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-20">
            {/* Creator row */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2.5 mb-4"
            >
              <img
                src={video.creator_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${video.creator_name}`}
                alt=""
                className="w-8 h-8 rounded-full ring-2 ring-white/30 shadow-lg"
              />
              <span className="text-white/80 text-sm font-semibold">{video.creator_name}</span>
              {video.category && (
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-sm text-white/60 text-xs uppercase tracking-widest font-bold ring-1 ring-white/10">
                  {video.category}
                </span>
              )}
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl md:text-5xl font-black text-white leading-[1.1] line-clamp-2 mb-4 tracking-tight"
              style={{ textShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
            >
              {video.title}
            </motion.h2>

            {/* Meta + CTA */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-3 text-white/50 text-sm">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />{fmt(video.views)} Aufrufe
                </span>
              </div>
              <div className="hidden md:flex items-center gap-2 ml-auto px-5 py-2.5 rounded-full bg-white text-black font-bold text-sm hover:bg-[color:var(--theme-primary)] hover:text-white transition-colors duration-300 shadow-xl">
                Jetzt ansehen <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}