import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreVertical, Play, Pause, Volume2, VolumeX, Upload as UploadIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import MobileBrandHeader from '@/components/mobile/MobileBrandHeader';
import PageTransition from '@/components/mobile/PageTransition';
import PageMaintenanceCheck from '@/components/PageMaintenanceCheck';
import PokemonPageDecor from '@/components/pokemon/PokemonPageDecor';

function ShortVideo({ short, isActive, user }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(short.likes_count || 0);
  const videoRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery({
    queryKey: ['shortComments', short.id],
    queryFn: () => base44.entities.ShortComment.filter({ short_id: short.id }, '-created_date', 50),
    enabled: showComments
  });

  const { data: userLike } = useQuery({
    queryKey: ['shortLike', short.id, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const likes = await base44.entities.ShortLike.filter({ short_id: short.id, user_id: user.id }, 1);
      return likes[0] || null;
    },
    enabled: !!user
  });

  useEffect(() => {
    setIsLiked(!!userLike);
  }, [userLike]);

  useEffect(() => {
    if (!videoRef.current) return;
    
    const autoPlay = localStorage.getItem('autoplay_shorts') !== 'false';
    
    if (isActive && autoPlay) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else if (isActive) {
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Login erforderlich');
      
      if (isLiked) {
        await base44.entities.ShortLike.delete(userLike.id);
        await base44.entities.Short.update(short.id, { likes_count: Math.max(0, likesCount - 1) });
        setLikesCount(prev => Math.max(0, prev - 1));
        setIsLiked(false);
      } else {
        await base44.entities.ShortLike.create({ short_id: short.id, user_id: user.id });
        await base44.entities.Short.update(short.id, { likes_count: likesCount + 1 });
        setLikesCount(prev => prev + 1);
        setIsLiked(true);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['shortLike', short.id, user?.id]);
    }
  });

  const commentMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Login erforderlich');
      if (!comment.trim()) return;
      
      await base44.entities.ShortComment.create({
        short_id: short.id,
        content: comment,
        author_username: user.username,
        author_avatar: user.avatar_url
      });
      await base44.entities.Short.update(short.id, { 
        comments_count: (short.comments_count || 0) + 1 
      });
    },
    onSuccess: () => {
      setComment('');
      queryClient.invalidateQueries(['shortComments', short.id]);
      toast.success('Kommentar gepostet!');
    }
  });

  return (
    <div className="relative w-full snap-start snap-always bg-black flex items-center justify-center" style={{ height: '100dvh', maxHeight: '100dvh', minHeight: '100dvh' }}>
      <video
        ref={videoRef}
        src={short.video_url}
        loop
        playsInline
        muted={isMuted}
        className="h-full w-full object-cover"
        onClick={togglePlay}
        preload="metadata"
      />

      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20"
        >
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Play className="w-10 h-10 text-white ml-1" />
          </div>
        </button>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-end justify-between">
          <div className="flex-1 pr-4">
            <Link to={createPageUrl('CreatorProfile')} state={{ username: short.creator_username }}>
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={short.creator_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${short.creator_username}`}
                  alt=""
                  className="w-10 h-10 rounded-full border-2 border-white"
                />
                <span className="font-bold text-white">{short.creator_username}</span>
              </div>
            </Link>
            <p className="text-white text-sm mb-2 line-clamp-2">{short.description}</p>
            {short.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {short.tags.map((tag, i) => (
                  <span key={i} className="text-xs text-cyan-400">#{tag}</span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 items-center">
            <button
              onClick={() => likeMutation.mutate()}
              className="flex flex-col items-center gap-1"
            >
              <motion.div
                whileTap={{ scale: 1.3 }}
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isLiked ? 'bg-red-500' : 'bg-white/20 backdrop-blur-sm'
                }`}
              >
                <Heart className={`w-6 h-6 ${isLiked ? 'text-white fill-white' : 'text-white'}`} />
              </motion.div>
              <span className="text-white text-xs font-medium">{likesCount}</span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-xs font-medium">{short.comments_count || 0}</span>
            </button>

            <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Share2 className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={toggleMute}
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
            >
              {isMuted ? <VolumeX className="w-6 h-6 text-white" /> : <Volume2 className="w-6 h-6 text-white" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="absolute inset-x-0 bottom-0 h-2/3 bg-[#0a0a0b] rounded-t-3xl overflow-hidden z-50"
          >
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex-1">
                  <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-3" />
                  <h3 className="text-white font-bold text-lg">Kommentare ({comments.length})</h3>
                </div>
                <button
                  onClick={() => setShowComments(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <img
                      src={c.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.author_username}`}
                      alt=""
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium text-sm">{c.author_username}</span>
                        <span className="text-white/40 text-xs">
                          {new Date(c.created_date).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                      <p className="text-white/80 text-sm">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                  <Input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Kommentar schreiben..."
                    className="bg-white/5 border-white/10 text-white"
                    onKeyPress={(e) => e.key === 'Enter' && commentMutation.mutate()}
                  />
                  <Button
                    onClick={() => commentMutation.mutate()}
                    disabled={!comment.trim() || commentMutation.isPending}
                    className="bg-cyan-600 hover:bg-cyan-500"
                  >
                    Senden
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Shorts() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [user, setUser] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem('app_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  // Filter function for audience access
  const filterByAudience = (list) => {
    if (!user) return list;
    const group = user.audience_group;
    // admin sees everything
    if (user.role === 'admin') return list;
    // users without a group see only 'all' + 'mixed'
    if (!group) return list.filter(v => !v.audience || v.audience === 'all' || v.audience === 'mixed');
    // girl/boy see only their own + 'all' + 'mixed'
    return list.filter(v => v.audience === 'all' || v.audience === 'mixed' || v.audience === group);
  };

  const { data: shorts = [], isLoading } = useQuery({
    queryKey: ['shorts', user?.audience_group],
    queryFn: async () => {
      const vids = await base44.entities.Short.list('-created_date', 50);
      return filterByAudience(vids || []);
    },
    enabled: !!user
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const windowHeight = window.innerHeight;
      const newIndex = Math.round(scrollTop / windowHeight);
      setActiveIndex(newIndex);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Login erforderlich</h2>
          <Link to={createPageUrl('SignIn')}>
            <Button className="bg-cyan-600">Anmelden</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (shorts.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black px-4">
        <UploadIcon className="w-16 h-16 text-white/30 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Noch keine Shorts</h2>
        <p className="text-white/50 text-center mb-6">Sei der Erste und lade ein kurzes Video hoch!</p>
        <Link to={createPageUrl('UploadShort')}>
          <Button className="bg-cyan-600">Jetzt hochladen</Button>
        </Link>
      </div>
    );
  }

  return (
    <PageMaintenanceCheck pageName="Shorts">
    <PageTransition>
      <PokemonPageDecor page="shorts" />
      <MobileBrandHeader />
      
      {/* Upload Button - Fixed */}
      <Link to={createPageUrl('UploadShort')}>
        <button className="fixed top-20 right-4 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-600 to-teal-600 shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
          <UploadIcon className="w-6 h-6 text-white" />
        </button>
      </Link>

      <div
        ref={containerRef}
        className="fixed inset-0 overflow-y-scroll snap-y snap-mandatory w-full bg-black"
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          paddingTop: 'calc(env(safe-area-inset-top))',
          paddingBottom: 'calc(env(safe-area-inset-bottom))'
        }}
      >
        <style>{`
          .fixed.inset-0::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {shorts.map((short, index) => (
          <ShortVideo
            key={short.id}
            short={short}
            isActive={index === activeIndex}
            user={user}
          />
        ))}
      </div>
    </PageTransition>
    </PageMaintenanceCheck>
  );
}