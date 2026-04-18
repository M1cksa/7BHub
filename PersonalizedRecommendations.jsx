import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useEffect, useState } from 'react';
import VideoCard from '@/components/streaming/VideoCard';
import { Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PersonalizedRecommendations({ user }) {
  const [recommendations, setRecommendations] = useState([]);

  // Fetch user's watch history
  const { data: watchHistory = [] } = useQuery({
    queryKey: ['watchHistory', user?.id],
    queryFn: () => base44.entities.WatchHistory.filter({ user_id: user.id }, '-created_date', 50),
    enabled: !!user
  });

  // Fetch user preferences
  const { data: preferences = [] } = useQuery({
    queryKey: ['userPreferences', user?.id],
    queryFn: () => base44.entities.UserPreference.filter({ user_id: user.id }),
    enabled: !!user
  });

  // Fetch all videos
  const { data: allVideos = [] } = useQuery({
    queryKey: ['allVideosForRec'],
    queryFn: () => base44.entities.Video.list('-views', 100)
  });

  useEffect(() => {
    if (!user || watchHistory.length === 0) {
      // No history, show trending
      setRecommendations(allVideos.slice(0, 6));
      return;
    }

    // Analyze watch history to find preferred categories
    const categoryCount = {};
    watchHistory.forEach(w => {
      const video = allVideos.find(v => v.id === w.video_id);
      if (video) {
        categoryCount[video.category] = (categoryCount[video.category] || 0) + 1;
      }
    });

    // Get top 2 categories
    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([cat]) => cat);

    // Find unwatched videos from preferred categories
    const watchedVideoIds = new Set(watchHistory.map(w => w.video_id));
    const recommendedVideos = allVideos.filter(v => 
      !watchedVideoIds.has(v.id) && 
      topCategories.includes(v.category)
    );

    // Mix in some trending videos if not enough
    const trending = allVideos
      .filter(v => !watchedVideoIds.has(v.id))
      .sort((a, b) => (b.views || 0) - (a.views || 0));

    const final = [...recommendedVideos.slice(0, 4), ...trending.slice(0, 2)];
    setRecommendations(final.slice(0, 6));
  }, [watchHistory, allVideos, user]);

  if (!user || recommendations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30">
          <Sparkles className="w-6 h-6 text-violet-400" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">
            Für dich empfohlen
          </h2>
          <p className="text-white/50 text-sm">Basierend auf deinem Verlauf</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((video) => (
          <VideoCard key={video.id} video={video} layout="grid" />
        ))}
      </div>
    </motion.div>
  );
}