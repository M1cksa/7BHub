import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import VideoCard from '@/components/streaming/VideoCard';
import { Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PersonalizedFeed({ user }) {
  const { data: watchHistory = [] } = useQuery({
    queryKey: ['watchHistory', user?.id],
    queryFn: () => base44.entities.WatchHistory.filter({ user_id: user.id }, '-created_date', 50),
    enabled: !!user
  });

  const { data: allVideos = [] } = useQuery({
    queryKey: ['allVideosForRec'],
    queryFn: () => base44.entities.Video.list('-created_date', 100),
    enabled: !!user
  });

  const recommendations = useMemo(() => {
    if (!watchHistory.length || !allVideos.length) return [];

    // Analyze watched categories and creators
    const categoryCount = {};
    const creatorCount = {};
    const watchedIds = new Set();

    watchHistory.forEach(item => {
      watchedIds.add(item.video_id);
      if (item.category) {
        categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
      }
    });

    // Get favorite categories (top 3)
    const favoriteCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);

    const V2_CUTOFF = new Date('2026-03-03T00:00:00Z');

    // Score videos based on preferences
    const scoredVideos = allVideos
      .filter(v => !watchedIds.has(v.id) && new Date(v.created_date) >= V2_CUTOFF) // Don't recommend already watched, only 2.0 videos
      .map(video => {
        let score = 0;
        
        // Category match (high weight)
        if (favoriteCategories.includes(video.category)) {
          score += 10;
        }
        
        // Popularity factor
        score += Math.log10((video.views || 1) + 1) * 2;
        
        // Recency bonus
        const daysOld = (Date.now() - new Date(video.created_date)) / (1000 * 60 * 60 * 24);
        if (daysOld < 7) score += 3;
        if (daysOld < 3) score += 2;
        
        return { video, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(item => item.video);

    return scoredVideos;
  }, [watchHistory, allVideos]);

  if (!user || !recommendations.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-12"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white">Für dich empfohlen</h2>
          <p className="text-white/50 text-sm">Basierend auf deinen Interessen</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {recommendations.map((video, index) => (
          <VideoCard key={video.id} video={video} index={index} />
        ))}
      </div>
    </motion.div>
  );
}