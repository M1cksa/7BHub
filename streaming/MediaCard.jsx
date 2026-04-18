import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Plus, ThumbsUp, ChevronDown, Star } from 'lucide-react';

export default function MediaCard({ media, index = 0 }) {
  const [isHovered, setIsHovered] = useState(false);

  const placeholderImage = `https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop`;

  return (
    <motion.div
      className="relative group cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Base Card */}
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden">
        <img
          src={media.poster_url || placeholderImage}
          alt={media.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Glow Effect on Hover */}
        <motion.div
          className="absolute -inset-[2px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.5), rgba(6, 182, 212, 0.5))',
            filter: 'blur(15px)',
            zIndex: -1,
          }}
        />
        
        {/* Border Glow */}
        <div className="absolute inset-0 rounded-xl border border-white/0 group-hover:border-white/20 transition-all duration-300" />

        {/* Quick Actions */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-white font-semibold text-sm mb-2 line-clamp-1">
            {media.title}
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Play Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center"
              >
                <Play className="w-4 h-4 text-black fill-black ml-0.5" />
              </motion.button>
              
              {/* Add to List */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </motion.button>
              
              {/* Like */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <ThumbsUp className="w-4 h-4" />
              </motion.button>
            </div>
            
            {/* More Info */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>

        {/* Rating Badge */}
        {media.rating && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-medium text-white">{media.rating}</span>
          </div>
        )}

        {/* Type Badge */}
        <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-violet-500/80 backdrop-blur-sm">
          <span className="text-[10px] font-semibold text-white uppercase tracking-wider">
            {media.type === 'movie' ? 'Film' : media.type === 'series' ? 'Serie' : 'Doku'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}