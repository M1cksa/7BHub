import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, Eye, ThumbsUp, MoreVertical, Radio, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import UserAvatar from '@/components/UserAvatar';
import { base44 } from '@/api/base44Client';

function formatViews(num) {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function formatTimeAgo(date) {
  if (!date) return '';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'Gerade eben';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `vor ${minutes} Min.`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `vor ${hours} Std.`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `vor ${days} Tagen`;
  const months = Math.floor(days / 30);
  return `vor ${months} Monaten`;
}

export default function VideoCard({ video, index = 0, layout = 'grid', isLive = false }) {
  const [isHovered, setIsHovered] = useState(false);
  const [creatorData, setCreatorData] = useState(null);

  const placeholderThumbnail = `https://images.unsplash.com/photo-1542751371-adc38448a05e?w=640&h=360&fit=crop`;
  const placeholderAvatar = `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop`;
  
  // Check if video is new (within last 24 hours)
  const isNew = video?.created_date && (new Date() - new Date(video.created_date)) < 24 * 60 * 60 * 1000;

  useEffect(() => {
    if (video?.creator_name) {
      base44.entities.AppUser.filter({ username: video.creator_name }, '-created_date', 1)
        .then(users => {
          if (users && users[0]) {
            setCreatorData(users[0]);
          }
        })
        .catch(() => {});
    }
  }, [video?.creator_name]);

  // Safety check — after all hooks
  if (!video || !video.id) return null;

  if (layout === 'list') {
    return (
      <Link to={createPageUrl('Watch') + `?id=${video.id}`}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03 }}
          className="flex gap-4 group cursor-pointer glass-card rounded-2xl p-3 hover:scale-[1.02] transition-all"
        >
        {/* Thumbnail */}
        <div className="relative w-40 md:w-60 flex-shrink-0 aspect-video rounded-xl overflow-hidden ring-1 ring-white/5">
          <img
            src={video.thumbnail_url || placeholderThumbnail}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {video.duration && (
            <div className="absolute bottom-2 right-2 px-2 py-1 rounded glass-effect text-white text-xs font-medium">
              {video.duration}
            </div>
          )}
        </div>
        
        {/* Info */}
        <div className="flex-1 py-1">
          <h3 className="text-white font-bold line-clamp-2 group-hover:text-cyan-400 transition-colors">
            {video.title}
          </h3>
          <p className="text-white/50 text-sm mt-1">{video.creator_name || 'Unbekannt'}</p>
          <div className="flex items-center gap-2 text-white/40 text-sm mt-1">
            <span>{formatViews(video.views)} Aufrufe</span>
            <span>•</span>
            <span>{formatTimeAgo(video.created_date)}</span>
          </div>
        </div>
      </motion.div>
    </Link>
    );
  }

  return (
      <motion.div
        whileHover={{ y: -6 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group cursor-pointer"
      >
      {/* Enhanced Thumbnail */}
      <Link to={createPageUrl('Watch') + `?id=${video.id}`}>
      <div className="relative aspect-video rounded-2xl md:rounded-3xl overflow-hidden glass-card transition-all duration-500 shadow-xl md:shadow-2xl">
        <img
          src={video.thumbnail_url || placeholderThumbnail}
          alt={video.title}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
        />
        
        {/* Enhanced Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-70 md:group-hover:opacity-100 transition-all duration-500 hidden md:block" />
        
        {/* Live Badge, New Badge or Duration */}
        {isLive ? (
          <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-600/90 backdrop-blur-xl text-white text-xs font-bold border border-red-500/30 shadow-lg">
            <Radio className="w-3 h-3" />
            LIVE
          </div>
        ) : isNew ? (
          <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 backdrop-blur-xl text-white text-xs font-bold border border-amber-400/30 shadow-lg shadow-amber-500/30 animate-pulse">
            ✨ NEU
          </div>
        ) : null}
        {video.duration && !isLive && (
          <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-xl text-white text-xs font-bold border border-white/10 shadow-lg">
            {video.duration}
          </div>
        )}

        {/* Enhanced Play Button with Glow */}
        {isHovered && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="hidden md:flex absolute inset-0 items-center justify-center"
          >
            <motion.div 
              whileHover={{ scale: 1.15 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-full blur-2xl opacity-70 animate-pulse" />
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-[0_0_60px_rgba(6,182,212,0.6)]">
                <Play className="w-9 h-9 md:w-11 md:h-11 text-white fill-white ml-1.5" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
      </Link>

      {/* Enhanced Info Section */}
      <div className="flex gap-4 md:gap-5 mt-4 md:mt-5">
        {/* Creator Avatar with Better Styling */}
        <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <Link to={createPageUrl('CreatorProfile') + `?username=${video.creator_name}`}>
               <motion.div whileHover={{ scale: 1.1 }}>
                 <UserAvatar 
                    user={creatorData || { 
                       username: video.creator_name, 
                       avatar_url: video.creator_avatar 
                    }} 
                    size="sm" 
                    className="w-11 h-11 md:w-12 md:h-12 border-2 border-white/20 shadow-lg shadow-cyan-500/10 group-hover:border-white/40 transition-all" 
                 />
               </motion.div>
          </Link>
        </div>

        {/* Enhanced Text Info */}
        <div className="flex-1 min-w-0">
          <Link to={createPageUrl('Watch') + `?id=${video.id}`}>
            <h3 className="text-white font-bold text-base md:text-lg leading-snug line-clamp-2 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-teal-400 transition-all duration-300">
              {video.title}
            </h3>
          </Link>
          <Link to={createPageUrl('CreatorProfile') + `?username=${video.creator_name}`}>
            <p className="text-white/70 text-sm font-bold mb-2 hover:text-cyan-400 transition-colors duration-300">
              {video.creator_name || 'Unbekannt'}
            </p>
          </Link>
          <div className="flex items-center gap-3 text-white/50 text-sm font-medium">
            <span className="flex items-center gap-1.5 hover:text-white/70 transition-colors">
              <Eye className="w-3.5 h-3.5" />
              {formatViews(video.views)}
            </span>
            <span className="text-white/30">•</span>
            <span className="truncate hover:text-white/70 transition-colors">{formatTimeAgo(video.created_date)}</span>
          </div>
        </div>
        </div>
        </motion.div>
  );
}