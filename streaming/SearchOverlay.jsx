import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, Clock, Radio, Play } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function SearchOverlay({ isOpen, onClose, videos, channels }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ videos: [], channels: [] });
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim()) {
      const searchQuery = query.toLowerCase();
      const filteredVideos = (videos || []).filter(v =>
        v.title?.toLowerCase().includes(searchQuery) ||
        v.creator_name?.toLowerCase().includes(searchQuery) ||
        v.category?.toLowerCase().includes(searchQuery)
      ).slice(0, 5);
      
      const filteredChannels = (channels || []).filter(c =>
        c.name?.toLowerCase().includes(searchQuery)
      ).slice(0, 3);
      
      setResults({ videos: filteredVideos, channels: filteredChannels });
    } else {
      setResults({ videos: [], channels: [] });
    }
  }, [query, videos, channels]);

  const handleClose = () => {
    setQuery('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100]"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#050505]/95 backdrop-blur-3xl"
            onClick={handleClose}
          />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative max-w-3xl mx-auto pt-24 px-6"
          >
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/40" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Videos, Kanäle oder Kategorien suchen..."
                className="w-full h-16 pl-16 pr-14 bg-white/5 border-white/10 rounded-2xl text-white text-lg placeholder:text-white/40 focus:border-violet-500/50 focus:ring-violet-500/20"
              />
              <button
                onClick={handleClose}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results */}
            <AnimatePresence mode="wait">
              {(results.videos.length > 0 || results.channels.length > 0) ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-6 space-y-6"
                >
                  {/* Channels */}
                  {results.channels.length > 0 && (
                    <div>
                      <h4 className="text-white/50 text-sm font-medium mb-3">Kanäle</h4>
                      <div className="space-y-2">
                        {results.channels.map((channel, index) => (
                          <motion.div
                            key={channel.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 cursor-pointer transition-all group"
                          >
                            <div className="relative">
                              <img
                                src={channel.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop'}
                                alt={channel.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                              {channel.is_live && (
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-500 border-2 border-[#0a0a0b] flex items-center justify-center">
                                  <Radio className="w-2.5 h-2.5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-white font-medium group-hover:text-violet-300 transition-colors">
                                {channel.name}
                              </h4>
                              <p className="text-white/50 text-sm">{channel.subscribers?.toLocaleString() || 0} Follower</p>
                            </div>
                            {channel.is_live && (
                              <div className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs font-medium">
                                LIVE
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Videos */}
                  {results.videos.length > 0 && (
                    <div>
                      <h4 className="text-white/50 text-sm font-medium mb-3">Videos</h4>
                      <div className="space-y-2">
                        {results.videos.map((video, index) => (
                          <motion.div
                            key={video.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 cursor-pointer transition-all group"
                          >
                            <div className="relative w-28 aspect-video rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={video.thumbnail_url || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&h=120&fit=crop'}
                                alt={video.title}
                                className="w-full h-full object-cover"
                              />
                              {video.is_live ? (
                                <div className="absolute top-1 left-1 flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold">
                                  <Radio className="w-2 h-2" />
                                  LIVE
                                </div>
                              ) : (
                                <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 text-white text-[10px]">
                                  {video.duration}
                                </div>
                              )}
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                                <Play className="w-6 h-6 text-white fill-white" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-medium line-clamp-1 group-hover:text-violet-300 transition-colors">
                                {video.title}
                              </h4>
                              <p className="text-white/50 text-sm">{video.creator_name}</p>
                              <p className="text-white/40 text-xs mt-0.5">
                                {video.views?.toLocaleString() || 0} Aufrufe
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : query.trim() ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-16 text-center text-white/50"
                >
                  Keine Ergebnisse für "{query}"
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-10"
                >
                  <div className="flex items-center gap-2 text-white/40 mb-4">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">Beliebte Suchen</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Gaming', 'Musik', 'Tutorials', 'Vlogs', 'Tech', 'Comedy'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setQuery(tag)}
                        className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-violet-500/20 hover:border-violet-500/30 hover:text-white transition-all"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}