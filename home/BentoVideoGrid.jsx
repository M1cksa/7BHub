import React from 'react';
import { motion } from 'framer-motion';
import { Play, Eye, Flame, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const fmt = (v) => { if (v >= 1e6) return `${(v/1e6).toFixed(1)}M`; if (v >= 1e3) return `${(v/1e3).toFixed(1)}K`; return v; };

function VideoTile({ video, className, big }) {
  const lw = localStorage.getItem('lightweight_mode') === 'true';
  const isLive = video.status === 'live';

  return (
    <Link to={createPageUrl('Watch') + `?id=${video.id}`} className={className}>
      <motion.div
        whileHover={lw ? {} : { scale: 1.015 }}
        className="relative group h-full rounded-2xl overflow-hidden bg-white/[0.03] ring-1 ring-white/[0.06]"
      >
        <img src={video.thumbnail_url || ''} alt={video.title} className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-700" />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        
        {/* Play */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className={`${big ? 'w-20 h-20' : 'w-14 h-14'} rounded-full bg-white/15 backdrop-blur-xl flex items-center justify-center ring-1 ring-white/20`}>
            <Play className={`${big ? 'w-9 h-9' : 'w-6 h-6'} text-white fill-white ml-0.5`} />
          </div>
        </div>

        {/* Badges */}
        {isLive && (
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-red-500 rounded-lg flex items-center gap-1.5 shadow-lg shadow-red-500/40">
            <Radio className="w-3 h-3 text-white animate-pulse" />
            <span className="text-white font-bold text-[11px]">LIVE</span>
          </div>
        )}
        {(video.views || 0) > 10000 && !isLive && (
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-orange-500/90 backdrop-blur-sm rounded-lg flex items-center gap-1">
            <Flame className="w-3 h-3 text-white" />
            <span className="text-white font-bold text-[11px]">HOT</span>
          </div>
        )}

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className={`text-white font-bold ${big ? 'text-2xl md:text-3xl' : 'text-sm'} leading-snug line-clamp-2 mb-1.5`}>
            {video.title}
          </h3>
          <div className="flex items-center gap-3 text-white/50 text-xs">
            {video.creator_name && <span className="font-medium">{video.creator_name}</span>}
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{fmt(video.views || 0)}</span>
            {video.category && <span className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] uppercase">{video.category}</span>}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function BentoVideoGrid({ videos }) {
  if (!videos || videos.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] md:auto-rows-[240px] gap-2 md:gap-3">
      {/* Featured - large */}
      {videos[0] && <VideoTile video={videos[0]} className="col-span-2 row-span-2" big />}
      {/* Side */}
      {videos[1] && <VideoTile video={videos[1]} className="col-span-1 row-span-1" />}
      {videos[2] && <VideoTile video={videos[2]} className="col-span-1 row-span-1" />}
      {videos[3] && <VideoTile video={videos[3]} className="col-span-1 row-span-1" />}
      {videos[4] && <VideoTile video={videos[4]} className="col-span-1 row-span-1" />}
      {/* Bottom row */}
      {videos.slice(5, 8).map(v => (
        <VideoTile key={v.id} video={v} className="col-span-1 row-span-1" />
      ))}
      {videos[8] && <VideoTile video={videos[8]} className="col-span-1 row-span-1" />}
    </div>
  );
}