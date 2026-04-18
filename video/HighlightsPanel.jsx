import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Play, Clock, Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function HighlightsPanel({ videoId, onSeekTo, isCreator }) {
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);

  const { data: highlights = [] } = useQuery({
    queryKey: ['videoHighlights', videoId],
    queryFn: () => base44.entities.VideoHighlight.filter({ video_id: videoId }),
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      setGenerating(true);
      const response = await base44.functions.invoke('generateVideoHighlights', { video_id: videoId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videoHighlights', videoId] });
      toast.success('Highlights erfolgreich generiert!');
      setGenerating(false);
    },
    onError: (error) => {
      toast.error('Fehler beim Generieren der Highlights');
      setGenerating(false);
    }
  });

  const trackViewMutation = useMutation({
    mutationFn: async (highlightId) => {
      const highlight = highlights.find(h => h.id === highlightId);
      if (highlight) {
        await base44.entities.VideoHighlight.update(highlightId, {
          views: (highlight.views || 0) + 1
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videoHighlights', videoId] });
    }
  });

  const handlePlayHighlight = (highlight) => {
    if (onSeekTo) {
      onSeekTo(highlight.start_time);
      trackViewMutation.mutate(highlight.id);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          AI-Highlights
        </h3>
        {isCreator && highlights.length === 0 && (
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={generating}
            size="sm"
            className="bg-gradient-to-r from-violet-600 to-cyan-600"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generiere...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Highlights generieren
              </>
            )}
          </Button>
        )}
      </div>

      {highlights.length === 0 && !generating ? (
        <div className="text-center py-8 text-white/40">
          <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">Noch keine Highlights verfügbar</p>
          {isCreator && (
            <p className="text-xs mt-2">Generiere AI-Highlights für dein Video!</p>
          )}
        </div>
      ) : generating ? (
        <div className="text-center py-8">
          <Loader2 className="w-12 h-12 mx-auto mb-3 text-cyan-400 animate-spin" />
          <p className="text-white/60 text-sm">AI analysiert dein Video...</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {highlights.map((highlight, index) => (
              <motion.div
                key={highlight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handlePlayHighlight(highlight)}
                className="group p-4 rounded-xl bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-cyan-500/30 hover:bg-white/[0.05] transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <img
                      src={highlight.thumbnail_url}
                      alt=""
                      className="w-24 h-16 rounded-lg object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-8 h-8 text-white fill-white" />
                    </div>
                    <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-xs text-white font-bold">
                      {formatTime(highlight.end_time - highlight.start_time)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-bold text-sm mb-1 line-clamp-1 group-hover:text-cyan-400 transition-colors">
                      {highlight.title}
                    </h4>
                    <p className="text-white/60 text-xs mb-2 line-clamp-2">
                      {highlight.description}
                    </p>
                    <div className="flex items-center gap-3 text-white/40 text-xs">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(highlight.start_time)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Play className="w-3 h-3" />
                        {highlight.views || 0} Aufrufe
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}