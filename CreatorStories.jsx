import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3, Eye, MessageCircle, Send, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

function StoryModal({ creatorGroup, onClose, user, onNextCreator, onPrevCreator }) {
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const story = creatorGroup.stories[currentIndex];
  
  const [hasVoted, setHasVoted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  // Reset states when story changes
  useEffect(() => {
    setHasVoted(false);
    setShowComments(false);
    setNewComment('');
    setProgress(0);
    // Mark as viewed
    if (story) {
      base44.entities.CreatorStory.update(story.id, { 
        views_count: (story.views_count || 0) + 1 
      }).catch(() => {});
    }
  }, [story?.id]);

  // Progress logic
  useEffect(() => {
    if (isPaused || showComments || !story) return;
    const duration = 10000; // 10 seconds per story
    const interval = 50;
    const step = (interval / duration) * 100;
    
    const timer = setInterval(() => {
      setProgress(p => {
        if (p + step >= 100) {
          handleNext();
          return 0;
        }
        return p + step;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [currentIndex, isPaused, showComments, creatorGroup.stories.length, story]);

  const handleNext = () => {
    if (currentIndex < creatorGroup.stories.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      if (onNextCreator) onNextCreator();
      else onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
    } else {
      if (onPrevCreator) onPrevCreator();
    }
  };

  // Queries
  const { data: votes = [] } = useQuery({
    queryKey: ['storyVotes', story?.id],
    queryFn: () => base44.entities.CreatorStoryVote.filter({ story_id: story.id }),
    enabled: story?.type === 'poll'
  });

  const { data: userVote } = useQuery({
    queryKey: ['userStoryVote', story?.id, user?.username],
    queryFn: async () => {
      const v = await base44.entities.CreatorStoryVote.filter({ 
        story_id: story.id, 
        user_username: user.username 
      });
      return v[0] || null;
    },
    enabled: story?.type === 'poll' && !!user
  });

  useEffect(() => {
    if (userVote) setHasVoted(true);
  }, [userVote]);

  const { data: comments = [] } = useQuery({
    queryKey: ['storyComments', story?.id],
    queryFn: () => base44.entities.CreatorStoryComment.filter({ story_id: story.id }, '-created_date', 50),
    enabled: !!story?.id
  });

  const voteMutation = useMutation({
    mutationFn: async (optionIndex) => {
      if (hasVoted) return;
      await base44.entities.CreatorStoryVote.create({
        story_id: story.id,
        user_username: user.username,
        option_index: optionIndex
      });
    },
    onSuccess: () => {
      setHasVoted(true);
      queryClient.invalidateQueries({ queryKey: ['storyVotes', story.id] });
      queryClient.invalidateQueries({ queryKey: ['userStoryVote', story.id, user?.username] });
      toast.success('Stimme abgegeben!');
    }
  });

  if (!story) return null;

  const voteResults = story.poll_options?.map((option, idx) => {
    const count = votes.filter(v => v.option_index === idx).length;
    const percentage = votes.length > 0 ? Math.round((count / votes.length) * 100) : 0;
    return { option, count, percentage };
  }) || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center sm:p-4"
    >
      <div className="absolute inset-0 z-0" onClick={onClose} />
      
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="w-full h-full sm:h-[85vh] sm:max-h-[800px] max-w-md bg-[#111113] sm:rounded-3xl border-0 sm:border border-white/10 shadow-2xl relative flex flex-col overflow-hidden z-10"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Progress Bars */}
        <div className="absolute top-0 left-0 right-0 p-3 z-20 flex gap-1">
          {creatorGroup.stories.map((s, idx) => (
            <div key={s.id} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{ 
                  width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%' 
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-6 left-0 right-0 p-4 z-20 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center gap-3">
            <img 
              src={creatorGroup.creator_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${creatorGroup.creator_username}`}
              alt=""
              className="w-10 h-10 rounded-full border border-white/20"
            />
            <div className="drop-shadow-md">
              <div className="font-bold text-white leading-tight">{creatorGroup.creator_username}</div>
              <div className="text-xs text-white/80 flex items-center gap-2">
                <Eye className="w-3 h-3" />
                {story.views_count || 0} Aufrufe
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsPaused(!isPaused)} className="w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 backdrop-blur-md">
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 backdrop-blur-md">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Story Content Area */}
        <div className="flex-1 relative flex items-center justify-center bg-black">
          {/* Navigation Overlay */}
          <div className="absolute inset-y-0 left-0 w-1/3 z-10 cursor-pointer" onClick={handlePrev} />
          <div className="absolute inset-y-0 right-0 w-2/3 z-10 cursor-pointer" onClick={handleNext} />
          
          {story.image_url ? (
            <img src={story.image_url} alt="Story" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-cyan-600/20" />
          )}

          <div className="absolute inset-0 flex flex-col justify-center p-6 z-20 pointer-events-none">
            <div className="bg-black/40 backdrop-blur-xl p-6 rounded-3xl border border-white/10 pointer-events-auto shadow-2xl">
              <p className="text-white text-xl md:text-2xl font-medium text-center leading-relaxed">
                {story.content}
              </p>

              {story.type === 'poll' && (
                <div className="mt-8 space-y-3">
                  {voteResults.map((result, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!hasVoted) voteMutation.mutate(idx);
                      }}
                      disabled={hasVoted || voteMutation.isPending}
                      className={`w-full p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${hasVoted ? 'border-white/10 cursor-default' : 'border-white/20 hover:bg-white/10 active:scale-95'}`}
                      style={!hasVoted ? { backgroundColor: 'rgba(255,255,255,0.05)' } : {}}
                    >
                      {hasVoted && (
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${result.percentage}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="absolute left-0 top-0 bottom-0 bg-white/20"
                        />
                      )}
                      <div className="relative flex items-center justify-between z-10">
                        <span className="text-white font-medium">{result.option}</span>
                        {hasVoted && (
                          <div className="flex items-center gap-2 text-white">
                            <span className="font-bold">{result.percentage}%</span>
                            <BarChart3 className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                  {hasVoted && (
                    <div className="text-center text-white/50 text-xs mt-4">
                      {votes.length} {votes.length === 1 ? 'Stimme' : 'Stimmen'} insgesamt
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer / Comments */}
        <div className="bg-black/80 backdrop-blur-xl border-t border-white/10 z-30">
          <div className="p-4 flex flex-col">
            <button 
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm w-full justify-center mb-2"
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${showComments ? '-rotate-90' : 'rotate-90'}`} />
              <MessageCircle className="w-4 h-4" />
              <span>{story.comments_count || 0} Kommentare</span>
            </button>

            <AnimatePresence>
              {showComments && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 250, opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex flex-col overflow-hidden"
                >
                  <div className="flex-1 overflow-y-auto space-y-4 py-2 pr-2 hide-scrollbar">
                    {comments.length === 0 ? (
                      <p className="text-center text-white/40 text-sm py-4">Noch keine Kommentare.</p>
                    ) : (
                      comments.map((c) => (
                        <div key={c.id} className="flex gap-3 text-sm">
                          <img
                            src={c.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.user_username}`}
                            alt=""
                            className="w-8 h-8 rounded-full bg-white/10"
                          />
                          <div className="flex-1 bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5">
                            <div className="text-xs font-bold text-white/60 mb-1">{c.user_username}</div>
                            <p className="text-white/90">{c.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newComment.trim()) return;
                    
                    try {
                      await base44.entities.CreatorStoryComment.create({
                        story_id: story.id,
                        user_username: user.username,
                        user_avatar: user.avatar_url,
                        content: newComment
                      });

                      await base44.entities.CreatorStory.update(story.id, {
                        comments_count: (story.comments_count || 0) + 1
                      });

                      queryClient.invalidateQueries({ queryKey: ['storyComments', story.id] });
                      setNewComment('');
                      toast.success('Kommentar gepostet!');
                    } catch (error) {
                      toast.error('Fehler beim Posten');
                    }
                  }} className="flex gap-2 mt-4 relative z-50">
                    <Input
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onFocus={() => setIsPaused(true)}
                      onBlur={() => setIsPaused(false)}
                      placeholder="Antworten..."
                      className="bg-white/10 border-transparent text-white rounded-full focus-visible:ring-1 focus-visible:ring-white/30"
                    />
                    <Button type="submit" size="icon" className="rounded-full shrink-0" style={{ backgroundColor: 'var(--theme-primary)' }}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Desktop Navigation Buttons */}
      <div className="hidden sm:flex absolute inset-y-0 left-4 items-center z-0 pointer-events-none">
        <button 
          onClick={handlePrev}
          className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 backdrop-blur-md transition-all pointer-events-auto"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>
      <div className="hidden sm:flex absolute inset-y-0 right-4 items-center z-0 pointer-events-none">
        <button 
          onClick={handleNext}
          className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 backdrop-blur-md transition-all pointer-events-auto"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </motion.div>
  );
}

export default function CreatorStories({ user }) {
  const [selectedCreatorIndex, setSelectedCreatorIndex] = useState(null);

  const { data: following = [] } = useQuery({
    queryKey: ['userFollowing', user?.username],
    queryFn: () => base44.entities.Follow.filter({ follower_username: user.username }),
    enabled: !!user
  });

  const followedUsernames = useMemo(() => following.map(f => f.following_username), [following]);

  const { data: allStories = [] } = useQuery({
    queryKey: ['creatorStories'],
    queryFn: async () => {
      const now = new Date().toISOString();
      const stories = await base44.entities.CreatorStory.list('-created_date', 100);
      return stories.filter(s => s.expires_at > now);
    },
    enabled: !!user
  });

  const storiesByCreator = useMemo(() => {
    const grouped = {};
    allStories.forEach(s => {
      if (!grouped[s.creator_username]) {
        grouped[s.creator_username] = {
          creator_username: s.creator_username,
          creator_avatar: s.creator_avatar,
          stories: []
        };
      }
      grouped[s.creator_username].stories.push(s);
    });
    
    // Sort stories within each creator chronologically
    Object.values(grouped).forEach(g => {
      g.stories.sort((a,b) => new Date(a.created_date) - new Date(b.created_date));
    });

    return Object.values(grouped).sort((a,b) => {
       const aFollow = followedUsernames.includes(a.creator_username) ? 1 : 0;
       const bFollow = followedUsernames.includes(b.creator_username) ? 1 : 0;
       // Prioritize followed users
       if (aFollow !== bFollow) return bFollow - aFollow;
       
       // Then by most recent story
       const aLatest = Math.max(...a.stories.map(s => new Date(s.created_date).getTime() || 0));
       const bLatest = Math.max(...b.stories.map(s => new Date(s.created_date).getTime() || 0));
       return bLatest - aLatest;
    });
  }, [allStories, followedUsernames]);

  if (!user || storiesByCreator.length === 0) return null;

  const handleNextCreator = () => {
    if (selectedCreatorIndex !== null && selectedCreatorIndex < storiesByCreator.length - 1) {
      setSelectedCreatorIndex(selectedCreatorIndex + 1);
    } else {
      setSelectedCreatorIndex(null);
    }
  };

  const handlePrevCreator = () => {
    if (selectedCreatorIndex !== null && selectedCreatorIndex > 0) {
      setSelectedCreatorIndex(selectedCreatorIndex - 1);
    }
  };

  return (
    <>
      <div className="mb-2 mt-4">
        <h2 className="text-lg font-bold text-white mb-4 px-4 md:px-0 flex items-center gap-2">
          <span>Highlights & Stories</span>
          <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-xs font-medium text-cyan-300 border border-cyan-500/30">
            Neu
          </span>
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4 px-4 md:px-0 pt-1 hide-scrollbar">
          {storiesByCreator.map((group, idx) => {
            const isFollowed = followedUsernames.includes(group.creator_username);
            return (
              <motion.button
                key={group.creator_username}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedCreatorIndex(idx)}
                className="flex flex-col items-center flex-shrink-0 group outline-none"
              >
                <div className="relative mb-2">
                  {/* Instagram Style Outer Ring */}
                  <div className={`w-[76px] h-[76px] rounded-full p-[3px] transition-transform duration-300 group-hover:scale-105 ${
                    isFollowed 
                      ? 'bg-gradient-to-tr from-cyan-400 via-violet-500 to-fuchsia-500' 
                      : 'bg-white/20'
                  }`}>
                    {/* Inner Background & Image */}
                    <div className="w-full h-full rounded-full bg-[#0a0a0b] p-[3px]">
                      <img 
                        src={group.creator_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${group.creator_username}`}
                        alt={group.creator_username}
                        className="w-full h-full rounded-full object-cover bg-white/10"
                      />
                    </div>
                  </div>
                  
                  {/* Multi-story indicator */}
                  {group.stories.length > 1 && (
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#0a0a0b] flex items-center justify-center border border-white/5">
                      <div className="w-[22px] h-[22px] rounded-full bg-white/15 flex items-center justify-center text-[10px] text-white font-bold backdrop-blur-md">
                        {group.stories.length}
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-[11px] font-medium text-white/80 text-center w-[80px] truncate">
                  {group.creator_username}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedCreatorIndex !== null && storiesByCreator[selectedCreatorIndex] && (
          <StoryModal 
            creatorGroup={storiesByCreator[selectedCreatorIndex]}
            onClose={() => setSelectedCreatorIndex(null)} 
            user={user}
            onNextCreator={handleNextCreator}
            onPrevCreator={handlePrevCreator}
          />
        )}
      </AnimatePresence>
    </>
  );
}