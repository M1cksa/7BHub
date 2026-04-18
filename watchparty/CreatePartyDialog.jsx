import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function CreatePartyDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [partyName, setPartyName] = useState('');
  const [selectedVideo, setSelectedVideo] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(10);

  useEffect(() => {
    const stored = localStorage.getItem('app_user');
    if (stored && stored !== "undefined") {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  const { data: videos = [] } = useQuery({
    queryKey: ['videos'],
    queryFn: () => base44.entities.Video.list('-created_date', 50),
  });

  const createPartyMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not logged in');
      
      const party = await base44.entities.WatchParty.create({
        name: partyName,
        video_id: selectedVideo,
        host_username: user.username,
        participants: [user.username],
        max_participants: maxParticipants,
        current_time: 0,
        is_playing: false,
      });

      return party;
    },
    onSuccess: (party) => {
      queryClient.invalidateQueries(['watchParties']);
      toast.success('Watch Party erstellt!');
      setOpen(false);
      window.location.href = createPageUrl('WatchParty') + `?id=${party.id}`;
    },
    onError: () => {
      toast.error('Fehler beim Erstellen der Party');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!partyName || !selectedVideo) {
      toast.error('Bitte alle Felder ausfüllen');
      return;
    }
    createPartyMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-violet-600 to-cyan-600 gap-2">
          <Plus className="w-5 h-5" />
          Watch Party erstellen
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#0a0a0b] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-violet-400" />
            Watch Party erstellen
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-bold mb-2">Party Name</label>
            <Input
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              placeholder="z.B. Filmabend mit Freunden"
              className="bg-white/5"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Video auswählen</label>
            <Select value={selectedVideo} onValueChange={setSelectedVideo}>
              <SelectTrigger className="bg-white/5">
                <SelectValue placeholder="Video wählen..." />
              </SelectTrigger>
              <SelectContent>
                {videos.map((video) => (
                  <SelectItem key={video.id} value={video.id}>
                    {video.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Max. Teilnehmer</label>
            <Select value={maxParticipants.toString()} onValueChange={(v) => setMaxParticipants(parseInt(v))}>
              <SelectTrigger className="bg-white/5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 Teilnehmer</SelectItem>
                <SelectItem value="10">10 Teilnehmer</SelectItem>
                <SelectItem value="20">20 Teilnehmer</SelectItem>
                <SelectItem value="50">50 Teilnehmer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={createPartyMutation.isPending}
            className="w-full bg-gradient-to-r from-violet-600 to-cyan-600"
          >
            {createPartyMutation.isPending ? 'Erstelle...' : 'Party erstellen'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}