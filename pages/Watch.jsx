import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import PageTransition from '@/components/mobile/PageTransition';
import MobileHeader from '@/components/mobile/MobileHeader';
import ReportDialog from '@/components/ReportDialog';
import VideoCard from '@/components/streaming/VideoCard';
import PokemonPageDecor from '@/components/pokemon/PokemonPageDecor';
import VideoPlayerSection from '@/components/watch/VideoPlayerSection';
import VideoInfoSection from '@/components/watch/VideoInfoSection';
import CommentSection from '@/components/watch/CommentSection';
import MomentEditor from '@/components/video/MomentEditor';
import InteractiveMomentsList from '@/components/video/InteractiveMomentsList';

export default function Watch() {
  const [searchParams] = useSearchParams();
  const videoId = searchParams.get('id');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [videoRef, setVideoRef] = useState(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const adShown = true;

  useEffect(() => {
    const stored = localStorage.getItem('app_user');
    if (stored && stored !== 'undefined') {
      try { setCurrentUser(JSON.parse(stored)); } catch {}
    } else {
      window.location.href = createPageUrl('SignIn');
    }
    const handler = () => {
      const u = localStorage.getItem('app_user');
      if (u && u !== 'undefined') try { setCurrentUser(JSON.parse(u)); } catch {}
    };
    window.addEventListener('user-updated', handler);
    return () => window.removeEventListener('user-updated', handler);
  }, []);

  const { data: video, isLoading } = useQuery({
    queryKey: ['video', videoId],
    queryFn: async () => {
      if (!videoId) return null;
      const vids = await base44.entities.Video.filter({ id: videoId }, 1);
      return vids?.[0] || null;
    },
    enabled: !!videoId,
  });

  useEffect(() => {
    if (video && videoId && adShown) {
      base44.entities.Video.update(video.id, { views: (video.views || 0) + 1 }).catch(() => {});
      if (currentUser?.id) {
        base44.entities.WatchHistory.create({ user_id: currentUser.id, video_id: video.id, video_title: video.title, category: video.category }).catch(() => {});
        import('@/components/battlepass/xpUtils').then(({ awardXpAndTokens }) => {
          awardXpAndTokens(currentUser, 50, currentUser.is_donor ? 0 : 50, 'Video angesehen');
        });
      }
    }
  }, [videoId, video, adShown]);

  const creatorName = video?.creator_name || null;

  const { data: followers = [] } = useQuery({
    queryKey: ['followers', creatorName],
    queryFn: () => creatorName ? base44.entities.Follow.filter({ following_username: creatorName }) : [],
    enabled: !!creatorName
  });

  const { data: isFollowing } = useQuery({
    queryKey: ['isFollowing', creatorName, currentUser?.username],
    queryFn: async () => {
      if (!currentUser || !creatorName) return false;
      const res = await base44.entities.Follow.filter({ follower_username: currentUser.username, following_username: creatorName }, 1);
      return Array.isArray(res) && res.length > 0;
    },
    enabled: !!currentUser && !!creatorName
  });

  const { data: hasLiked = false } = useQuery({
    queryKey: ['hasLiked', videoId, currentUser?.id],
    queryFn: async () => {
      if (!currentUser || !videoId) return false;
      const l = await base44.entities.Like.filter({ video_id: videoId, user_id: currentUser.id }, 1);
      return l?.length > 0;
    },
    enabled: !!currentUser && !!videoId
  });

  const filterByAudience = (list) => {
    if (!currentUser) return list;
    const group = currentUser.audience_group;
    if (currentUser.role === 'admin') return list;
    if (!group) return list.filter(v => !v.audience || v.audience === 'all' || v.audience === 'mixed');
    return list.filter(v => v.audience === 'all' || v.audience === 'mixed' || v.audience === group);
  };

  const { data: recommended = [] } = useQuery({
    queryKey: ['recommended', video?.category, currentUser?.audience_group],
    queryFn: async () => {
      const videos = await base44.entities.Video.filter({ category: video.category }, '-views', 10);
      return filterByAudience(videos || []);
    },
    enabled: !!video && !!currentUser,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) return window.location.href = createPageUrl('SignIn');
      if (isFollowing) {
        const res = await base44.entities.Follow.filter({ follower_username: currentUser.username, following_username: creatorName }, 1);
        if (res[0]) await base44.entities.Follow.delete(res[0].id);
      } else {
        await base44.entities.Follow.create({ follower_username: currentUser.username, following_username: creatorName });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['isFollowing'] })
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser?.id) throw new Error('Not logged in');
      if (hasLiked) return;
      await base44.entities.Video.update(videoId, { likes_count: (video.likes_count || 0) + 1 });
      await base44.entities.Like.create({ video_id: videoId, user_id: currentUser.id });
      const { awardXpAndTokens } = await import('@/components/battlepass/xpUtils');
      await awardXpAndTokens(currentUser, 20, currentUser.is_donor ? 0 : 5);
    },
    onMutate: async () => {
      await queryClient.cancelQueries(['video', videoId]);
      const prev = queryClient.getQueryData(['video', videoId]);
      queryClient.setQueryData(['video', videoId], old => ({ ...old, likes_count: (old.likes_count || 0) + 1 }));
      queryClient.setQueryData(['hasLiked', videoId, currentUser?.id], true);
      return { prev };
    },
    onError: (_, __, ctx) => {
      queryClient.setQueryData(['video', videoId], ctx.prev);
      queryClient.setQueryData(['hasLiked', videoId, currentUser?.id], false);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['video', videoId]);
      queryClient.invalidateQueries(['hasLiked', videoId, currentUser?.id]);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Video.delete(videoId);
    },
    onSuccess: () => { toast.success('Gelöscht!'); navigate(createPageUrl('Home')); }
  });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!video) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-white/30" />
      </div>
      <h2 className="text-xl font-bold text-white">Video nicht gefunden</h2>
      <p className="text-white/40 text-sm">Das Video existiert nicht oder wurde entfernt.</p>
      <Button asChild variant="outline" className="border-white/10 text-white hover:bg-white/10">
        <a href={createPageUrl('Home')}>Zurück zur Startseite</a>
      </Button>
    </div>
  );

  const isAccessDenied = () => {
    if (!video || !currentUser) return false;
    if (currentUser.role === 'admin') return false;
    const vidAudience = video.audience;
    const userGroup = currentUser.audience_group;
    if (!vidAudience || vidAudience === 'all' || vidAudience === 'mixed') return false;
    return vidAudience !== userGroup;
  };

  if (isAccessDenied()) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border-2 border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-black text-white mb-2">Zugriff verweigert</h2>
          <p className="text-white/50 text-base max-w-md mx-auto leading-relaxed">
            Dieses Video ist exklusiv für den Bereich "{video.audience}s" bestimmt. Du hast keine Berechtigung, diese Inhalte anzusehen, um ein sicheres Umfeld für alle zu gewährleisten.
          </p>
        </div>
        <Button asChild className="mt-4 hover:scale-105 transition-transform" style={{ backgroundColor: 'var(--theme-primary)' }}>
          <Link to={createPageUrl('Home')}>Zurück zur Startseite</Link>
        </Button>
      </div>
    );
  }

  return (
    <PageTransition>
      <MobileHeader title={video?.title} onBack={() => navigate(createPageUrl('Home'))} />

      <ReportDialog
        isOpen={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        itemType="video"
        itemId={video.id}
        reportedUser={creatorName}
      />

      <PokemonPageDecor page="watch" />

      <div className="max-w-[1920px] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-4 md:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-4 md:gap-6 lg:gap-8">

          <div className="space-y-4 min-w-0">
            <VideoPlayerSection
              video={video}
              contentType="video"
              adShown={adShown}
              onVideoRef={setVideoRef}
              currentUser={currentUser}
            />

            <VideoInfoSection
              video={video}
              contentType="video"
              creatorName={creatorName}
              followers={followers.length}
              isFollowing={isFollowing}
              hasLiked={hasLiked}
              currentUser={currentUser}
              videoId={videoId}
              onLike={() => { if (!currentUser) { window.location.href = createPageUrl('SignIn'); return; } if (!hasLiked) likeMutation.mutate(); }}
              onFollow={() => followMutation.mutate()}
              onDelete={() => deleteMutation.mutate()}
              onReport={() => setReportDialogOpen(true)}
            />

            <InteractiveMomentsList videoId={videoId} currentUser={currentUser} />

            {(currentUser?.username === creatorName || currentUser?.role === 'admin') && (
              <MomentEditor videoId={videoId} creatorUsername={currentUser.username} />
            )}

            <CommentSection
              video={video}
              videoId={videoId}
              currentUser={currentUser}
              videoRef={videoRef}
              creatorName={creatorName}
            />
          </div>

          <div className="space-y-4 mt-4 lg:mt-0">
            <div className="sticky top-20">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider px-1 mb-3">Empfohlen</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                {recommended.filter(v => v.id !== video.id).slice(0, 8).map((v, i) => (
                  <motion.div key={v.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <VideoCard video={v} index={i} layout="list" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
