import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import VideoCard from './streaming/VideoCard';
import { Sparkles } from 'lucide-react';

export default function VideoRecommendations({ currentUser, currentVideo }) {
  const { data: watchHistory = [] } = useQuery({
    queryKey: ['watchHistory', currentUser?.id],
    queryFn: () => base44.entities.WatchHistory.filter({ user_id: currentUser.id }),
    enabled: !!currentUser
  });

  const { data: allVideos = [] } = useQuery({
    queryKey: ['allVideos'],
    queryFn: () => base44.entities.Video.list('-created_date', 100)
  });

  // Simple recommendation algorithm based on watch history
  const getRecommendations = () => {
    if (!currentUser || watchHistory.length === 0) {
      return allVideos.slice(0, 12);
    }

    const watchedCategories = watchHistory.map(h => h.category).filter(Boolean);
    const categoryCounts = {};
    watchedCategories.forEach(cat => {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const topCategory = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a])[0];

    const recommended = allVideos.filter(v => {
      if (currentVideo && v.id === currentVideo.id) return false;
      if (v.category === topCategory) return true;
      return false;
    });

    const others = allVideos.filter(v => {
      if (currentVideo && v.id === currentVideo.id) return false;
      return !recommended.find(r => r.id === v.id);
    });

    return [...recommended, ...others].slice(0, 12);
  };

  const recommendations = getRecommendations();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-white/60">
        <Sparkles className="w-4 h-4" />
        <h3 className="font-bold uppercase text-xs tracking-wider">Für dich empfohlen</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {recommendations.map((video, i) => (
          <VideoCard key={video.id} video={video} index={i} layout="grid" />
        ))}
      </div>
    </div>
  );
}