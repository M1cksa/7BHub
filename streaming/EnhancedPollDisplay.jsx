import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BarChart3, CheckCircle2, Plus, X, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function EnhancedPollDisplay({ videoId, isCreator = false }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [creatingPoll, setCreatingPoll] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  useEffect(() => {
    const stored = localStorage.getItem('app_user');
    if (stored && stored !== "undefined") {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  const { data: activePoll } = useQuery({
    queryKey: ['activePoll', videoId],
    queryFn: async () => {
      const polls = await base44.entities.Poll.filter({ video_id: videoId, is_active: true }, '-created_date', 1);
      return polls[0] || null;
    },
    refetchInterval: 3000,
  });

  const { data: votes = [] } = useQuery({
    queryKey: ['pollVotes', activePoll?.id],
    queryFn: () => base44.entities.PollVote.filter({ poll_id: activePoll?.id }),
    enabled: !!activePoll,
    refetchInterval: 2000,
  });

  const userVote = user ? votes.find((v) => v.user_username === user.username) : null;
  const hasVoted = !!userVote;
  const totalVotes = votes.length;

  const results = activePoll?.options.map((opt, idx) => {
    const count = votes.filter((v) => v.option_index === idx).length;
    const percentage = totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100);
    return { option: opt, count, percentage, idx };
  }) || [];

  const winningOption = results.reduce((max, curr) => (curr.count > max.count ? curr : max), results[0] || {});

  const createPollMutation = useMutation({
    mutationFn: (data) => base44.entities.Poll.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activePoll', videoId] });
      setCreatingPoll(false);
      setQuestion('');
      setOptions(['', '']);
      toast.success('Umfrage erstellt!');
    },
  });

  const voteMutation = useMutation({
    mutationFn: async (optionIndex) => {
      if (!user) throw new Error('Nicht angemeldet');
      await base44.entities.PollVote.create({
        poll_id: activePoll.id,
        user_username: user.username,
        option_index: optionIndex,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pollVotes', activePoll?.id] });
      toast.success('Stimme abgegeben!');
    },
  });

  const endPollMutation = useMutation({
    mutationFn: () => base44.entities.Poll.update(activePoll.id, { is_active: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activePoll', videoId] });
      toast.success('Umfrage beendet!');
    },
  });

  const handleCreatePoll = () => {
    const validOptions = options.filter((o) => o.trim());
    if (!question.trim() || validOptions.length < 2) {
      toast.error('Frage und mindestens 2 Optionen erforderlich');
      return;
    }

    createPollMutation.mutate({
      video_id: videoId,
      question: question.trim(),
      options: validOptions,
      creator_username: user.username,
    });
  };

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  return (
    <div className="space-y-4">
      {/* Create Poll UI */}
      {isCreator && !activePoll && (
        <AnimatePresence>
          {creatingPoll ? (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/30"
            >
              <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-violet-400" />
                Umfrage erstellen
              </h4>

              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Stelle eine Frage..."
                className="mb-3 bg-white/5 border-white/10 text-white"
              />

              <div className="space-y-2 mb-3">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      value={opt}
                      onChange={(e) => updateOption(idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      className="flex-1 bg-white/5 border-white/10 text-white"
                    />
                    {options.length > 2 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(idx)}
                        className="h-10 w-10 text-red-400 hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {options.length < 6 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="w-full mb-3 border-white/10 text-white/70"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Option hinzufügen
                </Button>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleCreatePoll}
                  disabled={createPollMutation.isPending}
                  className="flex-1 bg-violet-600 hover:bg-violet-500"
                >
                  Erstellen
                </Button>
                <Button variant="ghost" onClick={() => setCreatingPoll(false)} className="text-white/70">
                  Abbrechen
                </Button>
              </div>
            </motion.div>
          ) : (
            <Button
              onClick={() => setCreatingPoll(true)}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              Neue Umfrage starten
            </Button>
          )}
        </AnimatePresence>
      )}

      {/* Active Poll Display */}
      {activePoll && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/30 shadow-lg"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-violet-400" />
              {activePoll.question}
            </h3>
            {isCreator && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => endPollMutation.mutate()}
                className="h-7 text-xs text-red-400 hover:bg-red-500/10"
              >
                Beenden
              </Button>
            )}
          </div>

          <div className="space-y-3 mb-4">
            {results.map((res) => {
              const isWinning = hasVoted && res.idx === winningOption.idx && res.count > 0;
              const isUserChoice = userVote?.option_index === res.idx;

              return (
                <button
                  key={res.idx}
                  disabled={hasVoted}
                  onClick={() => voteMutation.mutate(res.idx)}
                  className={`relative w-full text-left group transition-all ${
                    hasVoted ? 'cursor-default' : 'cursor-pointer hover:scale-[1.02]'
                  }`}
                >
                  {/* Background Progress */}
                  <div className="absolute inset-0 bg-white/5 rounded-xl overflow-hidden border border-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${res.percentage}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className={`h-full ${
                        isUserChoice
                          ? 'bg-gradient-to-r from-violet-500/40 to-purple-500/40'
                          : 'bg-white/10'
                      }`}
                    />
                  </div>

                  {/* Content */}
                  <div className="relative p-4 flex justify-between items-center z-10">
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-medium transition-colors ${
                          isUserChoice ? 'text-violet-300' : 'text-white/90'
                        }`}
                      >
                        {res.option}
                      </span>
                      {isUserChoice && <CheckCircle2 className="w-4 h-4 text-violet-400" />}
                      {isWinning && totalVotes > 1 && <Trophy className="w-4 h-4 text-yellow-400" />}
                    </div>
                    {hasVoted && (
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-white/60">{res.count}</span>
                        <span className="text-lg font-black text-white/80">{res.percentage}%</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-white/50">
            <span>{totalVotes} {totalVotes === 1 ? 'Stimme' : 'Stimmen'}</span>
            {hasVoted && <span className="text-green-400">✓ Du hast abgestimmt</span>}
          </div>
        </motion.div>
      )}
    </div>
  );
}