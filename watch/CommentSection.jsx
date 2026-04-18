import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import EnhancedPollDisplay from '@/components/streaming/EnhancedPollDisplay';
import HighlightsPanel from '@/components/video/HighlightsPanel';

export default function CommentSection({ video, videoId, currentUser, videoRef, creatorName }) {
  const [commentText, setCommentText] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', videoId],
    queryFn: async () => {
      const res = await base44.entities.Comment.filter({ video_id: videoId }, '-created_date', 50);
      return Array.isArray(res) ? res : [];
    },
    enabled: !!videoId,
    refetchInterval: 10000
  });

  const commentMutation = useMutation({
    mutationFn: async (text) => {
      if (!currentUser) { alert('Bitte anmelden.'); return; }
      if (!text?.trim()) return;
      if (currentUser.role !== 'admin' && !currentUser.trial_completed) {
        const age = Date.now() - new Date(currentUser.created_date).getTime();
        if (age < 86400000) {
          const h = Math.ceil((86400000 - age) / 3600000);
          toast.error(`Testphase aktiv – erst in ${h}h möglich`);
          return;
        }
      }
      return await base44.entities.Comment.create({ 
        content: text, 
        video_id: videoId, 
        author_name: currentUser.username || 'Anonym',
        author_avatar: currentUser.avatar_url,
        author_title: currentUser.active_title,
        author_chat_color: currentUser.active_chat_color
      });
    },
    onMutate: async (text) => {
      await queryClient.cancelQueries(['comments', videoId]);
      const prev = queryClient.getQueryData(['comments', videoId]);
      queryClient.setQueryData(['comments', videoId], old => [
        { 
          id: 'tmp-' + Date.now(), 
          content: text, 
          video_id: videoId, 
          author_name: currentUser?.username || 'Anonym', 
          author_avatar: currentUser?.avatar_url,
          author_title: currentUser?.active_title,
          author_chat_color: currentUser?.active_chat_color,
          created_date: new Date().toISOString() 
        },
        ...(old || [])
      ]);
      return { prev };
    },
    onSuccess: () => setCommentText(''),
    onError: (_, __, ctx) => queryClient.setQueryData(['comments', videoId], ctx.prev),
    onSettled: () => queryClient.invalidateQueries(['comments', videoId])
  });

  const generateAiSummary = async () => {
    if (!comments.length) return;
    setGeneratingSummary(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Fasse diese Kommentare kurz und prägnant zusammen (auf Deutsch):\n\n${comments.map(c => c.content).join('\n')}`,
      });
      setAiSummary(res);
    } finally {
      setGeneratingSummary(false);
    }
  };

  return (
    <div className="space-y-6">
      {video.allow_highlights && (
        <HighlightsPanel
          videoId={videoId}
          onSeekTo={(t) => { if (videoRef) { videoRef.currentTime = t; videoRef.play(); } }}
          isCreator={currentUser?.email === video.created_by}
        />
      )}

      <EnhancedPollDisplay videoId={video.id} isCreator={currentUser?.username === creatorName} />

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">{comments.length} Kommentare</h3>
        {comments.length > 3 && (
          <Button variant="outline" size="sm" onClick={generateAiSummary} disabled={generatingSummary}
            className="text-violet-400 border-violet-500/25 hover:bg-violet-500/10 text-xs">
            {generatingSummary ? 'Analysiere...' : '✨ AI Zusammenfassung'}
          </Button>
        )}
      </div>

      {aiSummary && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="p-4 rounded-xl bg-violet-900/15 border border-violet-500/20">
          <p className="text-sm font-bold text-violet-300 mb-1">✨ AI Community Analyse</p>
          <p className="text-white/70 text-sm leading-relaxed">{aiSummary}</p>
        </motion.div>
      )}

      {/* Input */}
      <div className="flex gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.07]">
        <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-white/40" />
        </div>
        <div className="flex-1 space-y-2">
          <Textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Teile deine Gedanken..."
            className="bg-black/20 border-white/10 rounded-xl focus:border-violet-500/40 min-h-[60px] resize-none text-white placeholder:text-white/20 text-sm"
          />
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-white/25">✨ AI-Moderation aktiv</span>
            <Button
              onClick={() => commentMutation.mutate(commentText)}
              disabled={!commentText.trim() || commentMutation.isPending}
              size="sm"
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-xl px-4 h-9 text-xs"
            >
              <Send className="w-3 h-3 mr-1.5" />
              Kommentieren
            </Button>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="space-y-2">
        {comments.length === 0 && (
          <p className="text-white/25 text-center py-8 text-sm italic">Noch keine Kommentare. Sei der Erste!</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] transition-colors group">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-semibold text-xs shrink-0">
              {c.author_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`font-bold text-sm ${c.author_name === creatorName ? 'text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400' : 'text-white'}`}>
                  {c.author_name}
                </span>
                {c.author_title && c.author_title !== 'none' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-fuchsia-500/20 to-cyan-500/20 text-fuchsia-300 border border-fuchsia-500/50 shadow-[0_0_8px_rgba(217,70,239,0.3)] whitespace-nowrap">
                    {c.author_title}
                  </span>
                )}
                {c.author_name === creatorName && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20 font-bold uppercase tracking-wider">Ersteller</span>
                )}
                <span className="text-white/25 text-xs">• {format(new Date(c.created_date), 'PP', { locale: de })}</span>
              </div>
              <p className="text-white/70 text-sm leading-relaxed" style={
                c.author_chat_color === 'neon_matrix' ? { color: '#4ade80', textShadow: '0 0 8px #4ade80' } :
                c.author_chat_color === 'abyssal_void' ? { color: '#a78bfa', textShadow: '0 0 10px #7c3aed' } :
                c.author_chat_color === 'god_tier_gold' ? { color: '#fbbf24', textShadow: '0 0 10px #f59e0b', fontWeight: 'bold' } :
                {}
              }>
                {c.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}