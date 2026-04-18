import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Heart, MessageCircle, Send, BarChart3, Loader2, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import PullToRefresh from '@/components/mobile/PullToRefresh';
import PageTransition from '@/components/mobile/PageTransition';
import PageMaintenanceCheck from '@/components/PageMaintenanceCheck';
import PageHeader from '@/components/ui/PageHeader';
import PageShell from '@/components/ui/PageShell';

export default function CommunityHub() {
  const [user, setUser] = useState(null);
  const [newPost, setNewPost] = useState({ content: '', image_url: '' });
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [newPoll, setNewPoll] = useState({ question: '', options: ['', ''] });
  const [pollOpen, setPollOpen] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const stored = localStorage.getItem('app_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const { data: posts = [], refetch: refetchPosts } = useQuery({
    queryKey: ['communityPosts'],
    queryFn: () => base44.entities.CommunityPost.list('-created_date', 50),
    refetchInterval: 5000
  });

  const { data: polls = [], refetch: refetchPolls } = useQuery({
    queryKey: ['polls'],
    queryFn: () => base44.entities.Poll.list('-created_date', 30)
  });

  const handleRefresh = async () => {
    await Promise.all([refetchPosts(), refetchPolls()]);
  };

  const { data: comments = [] } = useQuery({
    queryKey: ['postComments', selectedPost?.id],
    queryFn: () => base44.entities.PostComment.filter({ post_id: selectedPost.id }, '-created_date'),
    enabled: !!selectedPost
  });

  const createPostMutation = useMutation({
    mutationFn: (data) => base44.entities.CommunityPost.create({
      ...data,
      author_username: user.username,
      author_avatar: user.avatar_url
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['communityPosts']);
      setCreateOpen(false);
      setNewPost({ content: '', image_url: '' });
    }
  });

  const createPollMutation = useMutation({
    mutationFn: (data) => base44.entities.Poll.create({
      ...data,
      creator_username: user.username,
      video_id: 'community'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['polls']);
      setPollOpen(false);
      setNewPoll({ question: '', options: ['', ''] });
    }
  });

  const likePostMutation = useMutation({
    mutationFn: async (post) => {
      await base44.entities.PostLike.create({ post_id: post.id, user_id: user.id });
      await base44.entities.CommunityPost.update(post.id, { 
        likes_count: (post.likes_count || 0) + 1 
      });
    },
    onSuccess: () => queryClient.invalidateQueries(['communityPosts'])
  });

  const commentMutation = useMutation({
    mutationFn: async (post) => {
      await base44.entities.PostComment.create({
        post_id: post.id,
        author_username: user.username,
        author_avatar: user.avatar_url,
        content: commentText
      });
      await base44.entities.CommunityPost.update(post.id, {
        comments_count: (post.comments_count || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['communityPosts']);
      queryClient.invalidateQueries(['postComments']);
      setCommentText('');
    }
  });

  const voteMutation = useMutation({
    mutationFn: ({ pollId, optionIndex }) => 
      base44.entities.PollVote.create({
        poll_id: pollId,
        user_username: user.username,
        option_index: optionIndex
      }),
    onSuccess: () => queryClient.invalidateQueries(['polls'])
  });

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mb-6 border border-violet-500/20">
          <Users className="w-12 h-12 text-violet-400" />
        </div>
        <h2 className="text-3xl font-black text-white mb-3">Community Hub</h2>
        <p className="text-white/50 mb-8 max-w-md">
          Melde dich an, um mit der Community zu interagieren
        </p>
        <Link to={createPageUrl('SignIn')}>
          <Button className="bg-gradient-to-r from-cyan-600 to-teal-600 rounded-full px-8 h-12 font-bold">
            Anmelden
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <PageMaintenanceCheck pageName="CommunityHub">
    <PageTransition>
    <PullToRefresh onRefresh={handleRefresh}>
    <PageShell maxWidth="5xl">
      <PageHeader icon={Users} title="Community Hub" subtitle="Teile, diskutiere und vernetze dich" accent="violet" />

      <Tabs defaultValue="posts" className="space-y-6">
        <TabsList className="bg-white/5 border border-white/[0.08] p-1 rounded-xl w-full grid grid-cols-2 h-11">
          <TabsTrigger value="posts" className="data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-lg text-sm font-medium text-white/50">
            <MessageCircle className="w-4 h-4 mr-1.5" />Posts
          </TabsTrigger>
          <TabsTrigger value="polls" className="data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-lg text-sm font-medium text-white/50">
            <BarChart3 className="w-4 h-4 mr-1.5" />Umfragen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="w-full h-11 text-sm rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium" variant="outline">
                <Plus className="w-4 h-4 mr-1.5" /> Neuer Post
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1a1a1c] border-white/10 text-white rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">Neuer Community Post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Textarea 
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  placeholder="Was gibt's Neues?"
                  className="bg-black/30 border-white/10 min-h-[160px] rounded-2xl text-base"
                />
                <Input 
                  value={newPost.image_url}
                  onChange={(e) => setNewPost({...newPost, image_url: e.target.value})}
                  placeholder="Bild URL (optional)"
                  className="bg-black/30 border-white/10 h-12 rounded-xl"
                />
                <Button 
                  onClick={() => createPostMutation.mutate(newPost)}
                  disabled={!newPost.content || createPostMutation.isPending}
                  className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 h-14 text-lg font-bold rounded-2xl"
                >
                  {createPostMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Posten'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="space-y-3">
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white/[0.03] rounded-2xl border border-white/[0.08] p-4 md:p-5 hover:border-white/15 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={post.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author_username}`}
                    className="w-9 h-9 rounded-full shrink-0"
                    alt=""
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-white text-sm">{post.author_username}</span>
                      <span className="text-xs text-white/30">
                        {formatDistanceToNow(new Date(post.created_date), { addSuffix: true, locale: de })}
                      </span>
                    </div>
                    <p className="text-white/70 leading-relaxed text-sm">{post.content}</p>
                  </div>
                </div>

                {post.image_url && (
                  <div className="mb-5 rounded-2xl overflow-hidden">
                    <img src={post.image_url} className="w-full" alt="Post" />
                  </div>
                )}

                <div className="flex items-center gap-4 pt-3 border-t border-white/[0.06]">
                  <button onClick={() => likePostMutation.mutate(post)} className="flex items-center gap-1.5 text-white/40 hover:text-pink-400 transition-colors text-xs">
                    <Heart className="w-4 h-4" />
                    {post.likes_count || 0}
                  </button>
                  <button onClick={() => setSelectedPost(selectedPost?.id === post.id ? null : post)} className="flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors text-xs">
                    <MessageCircle className="w-4 h-4" />
                    {post.comments_count || 0}
                  </button>
                </div>

                <AnimatePresence>
                  {selectedPost?.id === post.id && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-5 pt-5 border-t border-white/10 space-y-4"
                    >
                      {comments.map((comment) => (
                        <div key={comment.id} className="flex items-start gap-3">
                          <img 
                            src={comment.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author_username}`}
                            className="w-10 h-10 rounded-full"
                            alt=""
                          />
                          <div className="flex-1 bg-white/5 rounded-2xl p-4 backdrop-blur-sm">
                            <p className="text-xs font-bold text-white mb-1">{comment.author_username}</p>
                            <p className="text-sm text-white/80">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-3">
                        <Input 
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Kommentieren..."
                          className="bg-black/30 border-white/10 h-12 rounded-xl"
                        />
                        <Button 
                          onClick={() => commentMutation.mutate(post)}
                          disabled={!commentText}
                          size="icon"
                          className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 w-12 h-12 rounded-xl shadow-lg"
                        >
                          <Send className="w-5 h-5" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="polls" className="space-y-4">
          <Dialog open={pollOpen} onOpenChange={setPollOpen}>
            <DialogTrigger asChild>
              <Button className="w-full h-11 text-sm rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium" variant="outline">
                <BarChart3 className="w-4 h-4 mr-1.5" /> Neue Umfrage
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1a1a1c] border-white/10 text-white rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">Umfrage erstellen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input 
                  value={newPoll.question}
                  onChange={(e) => setNewPoll({...newPoll, question: e.target.value})}
                  placeholder="Deine Frage?"
                  className="bg-black/30 border-white/10 h-12 rounded-xl text-base"
                />
                {newPoll.options.map((opt, i) => (
                  <Input 
                    key={i}
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...newPoll.options];
                      newOpts[i] = e.target.value;
                      setNewPoll({...newPoll, options: newOpts});
                    }}
                    placeholder={`Option ${i + 1}`}
                    className="bg-black/30 border-white/10 h-12 rounded-xl"
                  />
                ))}
                <Button 
                  onClick={() => createPollMutation.mutate(newPoll)}
                  disabled={!newPoll.question || newPoll.options.some(o => !o) || createPollMutation.isPending}
                  className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 h-14 text-lg font-bold rounded-2xl"
                >
                  Erstellen
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="space-y-3">
            {polls.filter(p => p.video_id === 'community').map((poll, i) => (
              <div key={poll.id} className="bg-white/[0.03] rounded-2xl border border-white/[0.08] p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center shrink-0">
                    <BarChart3 className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{poll.question}</h3>
                    <span className="text-xs text-white/30">Von {poll.creator_username}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {poll.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => voteMutation.mutate({ pollId: poll.id, optionIndex: idx })}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-violet-500/30 transition-colors text-left text-sm text-white/70 hover:text-white flex items-center justify-between group"
                    >
                      {option}
                      <TrendingUp className="w-3.5 h-3.5 text-white/20 group-hover:text-violet-400 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </PageShell>
    </PullToRefresh>
    </PageTransition>
    </PageMaintenanceCheck>
  );
}