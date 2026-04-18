import React from 'react';
import { motion } from 'framer-motion';
import { Play, TrendingUp, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function HeroCarousel({ videos }) {
  const featured = videos.slice(0, 3);

  return (
    <div className="relative h-[70vh] md:h-[80vh] mb-12 overflow-hidden rounded-3xl">
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
      
      {/* Main Featured Video */}
      {featured[0] && (
        <div className="absolute inset-0">
          <img 
            src={featured[0].thumbnail_url} 
            className="w-full h-full object-cover"
            alt={featured[0].title}
          />
          
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="px-4 py-2 bg-red-500 rounded-full font-bold text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  #1 Trending
                </span>
                <span className="px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full font-bold text-sm">
                  {featured[0].category}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
                {featured[0].title}
              </h1>
              
              <p className="text-white/80 text-lg mb-6 line-clamp-2">
                {featured[0].description}
              </p>
              
              <Link to={createPageUrl('Watch') + `?id=${featured[0].id}`}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-black rounded-2xl font-bold text-lg flex items-center gap-3 shadow-2xl"
                >
                  <Play className="w-6 h-6 fill-black" />
                  Jetzt ansehen
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}