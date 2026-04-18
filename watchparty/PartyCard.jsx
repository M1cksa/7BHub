import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Users, Crown, Lock, Play } from 'lucide-react';
import { toast } from 'sonner';

export default function PartyCard({ party, index }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('app_user');
    if (stored && stored !== "undefined") {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  const joinMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not logged in');
      
      const participants = [...(party.participants || [])];
      if (!participants.includes(user.username)) {
        participants.push(user.username);
      }

      await base44.entities.WatchParty.update(party.id, { participants });
      return party.id;
    },
    onSuccess: (partyId) => {
      queryClient.invalidateQueries(['watchParties']);
      window.location.href = createPageUrl('WatchParty') + `?id=${partyId}`;
    },
    onError: () => {
      toast.error('Fehler beim Beitreten');
    },
  });

  const isFull = (party.participants?.length || 0) >= party.max_participants;
  const isParticipant = party.participants?.includes(user?.username);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{party.name}</h3>
          <p className="text-white/60 text-sm flex items-center gap-1">
            <Crown className="w-4 h-4 text-yellow-400" />
            Host: {party.host_username}
          </p>
        </div>
        {party.is_playing && (
          <div className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 flex items-center gap-2">
            <Play className="w-3 h-3 text-green-400 fill-current" />
            <span className="text-green-400 text-xs font-bold">Live</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-white/60 text-sm">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{party.participants?.length || 0}/{party.max_participants}</span>
          </div>
          {isFull && (
            <div className="flex items-center gap-1 text-red-400">
              <Lock className="w-4 h-4" />
              <span>Voll</span>
            </div>
          )}
        </div>

        <Button
          onClick={() => isParticipant ? window.location.href = createPageUrl('WatchParty') + `?id=${party.id}` : joinMutation.mutate()}
          disabled={isFull && !isParticipant}
          size="sm"
          className={isParticipant ? 'bg-green-600 hover:bg-green-500' : 'bg-gradient-to-r from-violet-600 to-cyan-600'}
        >
          {isParticipant ? 'Beitreten' : isFull ? 'Voll' : 'Beitreten'}
        </Button>
      </div>
    </motion.div>
  );
}