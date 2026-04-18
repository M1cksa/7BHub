import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, MessageSquare, Share2, MoreVertical, Flag, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function ForumThread() {
  const [searchParams] = useSearchParams();
  const threadId = searchParams.get('id');
  const [replyContent, setReplyContent] = useState('');
  const queryClient = useQueryClient();
  const user = JSON.parse(localStorage.getItem('app_user') || 'null');

  // Fetch Thread
  const { data: thread } = useQuery({
    queryKey: ['forumThread', threadId],
    queryFn: async () => {
      const res = await base44.entities.ForumThread.list({ id: threadId }, 1);
      return res[0];
    },
    enabled: !!threadId
  });

  // Fetch Posts with robust fallback
  const { data: posts = [] } = useQuery({
    queryKey: ['forumPosts', threadId],
    queryFn: async () => {
      if (!threadId) return [];
      console.log("Fetching posts for thread:", threadId);
      
      // 1. Try direct filter
      let fetched = await base44.entities.ForumPost.list({ thread_id: threadId }, 'created_date');
      
      // 2. Fallback: Loose check if empty
      if (fetched.length === 0) {
         console.log("Direct fetch empty, trying loose match...");
         const allRecent = await base44.entities.ForumPost.list('created_date', 100);
         fetched = allRecent.filter(p => p.thread_id === threadId);
      }
      
      return fetched;
    },
    enabled: !!threadId
  });

  // Reply Mutation
  const replyMutation = useMutation({
    mutationFn: async () => {
      if (!user) return alert("Bitte einloggen.");
      
      // Create Post
      await base44.entities.ForumPost.create({
        thread_id: threadId,
        content: replyContent,
        author_username: user.username,
        author_avatar: user.avatar_url,
        likes: 0
      });

      // Update Thread Count
      await base44.entities.ForumThread.update(threadId, {
        replies_count: (thread.replies_count || 0) + 1
      });
    },
    onSuccess: () => {
      setReplyContent('');
      queryClient.invalidateQueries(['forumPosts', threadId]);
      queryClient.invalidateQueries(['forumThread', threadId]);
    }
  });

  if (!thread) return <div className="pt-32 text-center text-white">Lade Diskussion...</div>;

  return (
    <div className="min-h-screen text-white pt-24 pb-20">
      {/* Sticky Header with Back Button */}
      <div className="md:hidden sticky top-0 z-40 bg-[#0a0a0b]/95 backdrop-blur-2xl border-b border-white/10 px-4 py-3 flex items-center gap-3 mb-4" style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}>
        <Link to={createPageUrl('Forum')}>
          <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-sm font-bold text-white truncate">{thread?.title}</h1>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        
        <Link to={createPageUrl('Forum')} className="hidden md:inline-flex">
           <Button variant="ghost" className="mb-6 text-white/50 hover:text-white pl-0 hover:bg-transparent">
             <ArrowLeft className="w-4 h-4 mr-2" />
             Zurück zum Forum
           </Button>
        </Link>

        {/* Main Thread Post */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-[#1a1a1c]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 mb-8 shadow-2xl relative overflow-hidden"
        >
          {/* Decorative Gradient */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 blur-[80px] rounded-full pointer-events-none" />

          <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-tight relative z-10">
            {thread.title}
          </h1>

          <div className="flex items-start gap-4 mb-6 relative z-10">
            <div className="flex-shrink-0">
               <div className="w-12 h-12 rounded-full bg-white/10 overflow-hidden ring-2 ring-violet-500/30">
                 <img src={thread.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${thread.author_username}`} className="w-full h-full object-cover" />
               </div>
            </div>
            <div>
               <p className="font-bold text-white">{thread.author_username}</p>
               <p className="text-white/40 text-sm">
                 Gestartet am {format(new Date(thread.created_date), 'PPP', { locale: de })}
               </p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none text-white/80 leading-relaxed mb-8 relative z-10 whitespace-pre-wrap">
            {thread.content}
          </div>

          <div className="flex items-center gap-4 border-t border-white/10 pt-4 relative z-10">
            <Button variant="ghost" size="sm" className="text-white/50 hover:text-white hover:bg-white/5">
               <MessageSquare className="w-4 h-4 mr-2" />
               {thread.replies_count} Antworten
            </Button>
            <Button variant="ghost" size="sm" className="text-white/50 hover:text-white hover:bg-white/5">
               <Share2 className="w-4 h-4 mr-2" />
               Teilen
            </Button>
            <div className="ml-auto">
              <Button variant="ghost" size="icon" className="text-white/30 hover:text-white">
                 <Flag className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Replies */}
        <div className="space-y-6 mb-12">
           <h3 className="text-lg font-bold text-white/50 px-2">Antworten</h3>
           
           {posts.length === 0 && (
             <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-3xl">
               <p className="text-white/30">Noch keine Antworten. Schreibe die erste!</p>
             </div>
           )}

           {posts.map((post, i) => (
             <motion.div 
               key={post.id}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: i * 0.05 }}
               className="bg-white/5 border border-white/5 rounded-2xl p-6 flex gap-4"
             >
                <div className="flex-shrink-0 text-center">
                   <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden mb-2 mx-auto">
                     <img src={post.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author_username}`} className="w-full h-full object-cover" />
                   </div>
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-bold text-white/90 mr-2">{post.author_username}</span>
                        <span className="text-white/30 text-xs">{format(new Date(post.created_date), 'PP p', { locale: de })}</span>
                      </div>
                   </div>
                   <p className="text-white/80 text-sm whitespace-pre-wrap leading-relaxed">{post.content}</p>
                </div>
             </motion.div>
           ))}
        </div>

        {/* Reply Box */}
        <div className="sticky bottom-6 z-20">
          <div className="bg-[#1a1a1c] border border-white/10 rounded-3xl p-4 shadow-2xl shadow-black/50">
             {!user ? (
               <div className="text-center py-2">
                 <p className="text-white/50 text-sm mb-2">Melde dich an, um zu antworten.</p>
                 <Link to={createPageUrl('SignIn')}>
                   <Button size="sm" className="bg-violet-600">Login</Button>
                 </Link>
               </div>
             ) : (
               <div className="flex gap-4">
                  <div className="hidden sm:block w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-white/10">
                     <img src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-2">
                     <Textarea 
                       value={replyContent}
                       onChange={e => setReplyContent(e.target.value)}
                       placeholder="Schreibe eine Antwort..." 
                       className="bg-black/30 border-white/10 min-h-[60px] max-h-[150px] resize-y rounded-xl focus:border-violet-500/50"
                     />
                     <div className="flex justify-end">
                       <Button 
                         onClick={() => replyMutation.mutate()}
                         disabled={!replyContent.trim() || replyMutation.isPending}
                         className="bg-white text-black hover:bg-white/90 rounded-full px-6 font-bold"
                       >
                         {replyMutation.isPending ? 'Sende...' : 'Antworten'}
                       </Button>
                     </div>
                  </div>
               </div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
}