import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Play, Plus, ListMusic, Trash2, MoreHorizontal, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AnimatedBackground from '@/components/streaming/AnimatedBackground';

export default function Playlists() {
  const [user] = useState(() => { try { return JSON.parse(localStorage.getItem('app_user')); } catch(e) { return null; } });
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const queryClient = useQueryClient();

  const { data: playlists = [] } = useQuery({
    queryKey: ['playlists', user?.username],
    queryFn: () => base44.entities.Playlist.list({ user_username: user?.username }, '-created_date'),
    enabled: !!user?.username
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!newTitle) return;
      await base44.entities.Playlist.create({
        user_username: user.username,
        title: newTitle,
        description: '',
        is_public: true,
        cover_url: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500'
      });
    },
    onSuccess: () => {
      setIsCreating(false);
      setNewTitle('');
      queryClient.invalidateQueries(['playlists']);
    }
  });

  if (!user) return <div className="pt-24 text-center text-white">Bitte anmelden.</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white pt-24 px-4 pb-20">
      <AnimatedBackground />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
           <h1 className="text-3xl font-bold flex items-center gap-3">
              <ListMusic className="w-8 h-8 text-violet-500" />
              Meine Playlists
           </h1>
           <Button onClick={() => setIsCreating(true)} className="bg-white text-black hover:bg-white/90 font-bold rounded-xl gap-2">
              <Plus className="w-4 h-4" /> Neu erstellen
           </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           {playlists.map(playlist => (
              <Link key={playlist.id} to={createPageUrl('PlaylistDetail') + `?id=${playlist.id}`}>
                 <motion.div 
                    whileHover={{ y: -5 }}
                    className="group bg-[#151517] rounded-2xl overflow-hidden border border-white/5 hover:border-violet-500/50 transition-all"
                 >
                    <div className="aspect-square bg-white/5 relative">
                       <img src={playlist.cover_url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center shadow-lg">
                             <Play className="w-5 h-5 text-white ml-1" />
                          </div>
                       </div>
                    </div>
                    <div className="p-4">
                       <h3 className="font-bold text-lg truncate">{playlist.title}</h3>
                       <p className="text-white/40 text-sm">0 Videos</p>
                    </div>
                 </motion.div>
              </Link>
           ))}
        </div>

        <Dialog open={isCreating} onOpenChange={setIsCreating}>
           <DialogContent className="bg-[#1a1a1c] border-white/10 text-white">
              <DialogHeader>
                 <DialogTitle>Neue Playlist</DialogTitle>
              </DialogHeader>
              <Input 
                 placeholder="Titel der Playlist" 
                 value={newTitle}
                 onChange={(e) => setNewTitle(e.target.value)}
                 className="bg-white/5 border-white/10"
              />
              <Button onClick={() => createMutation.mutate()} className="w-full bg-violet-600 hover:bg-violet-500 font-bold">
                 Erstellen
              </Button>
           </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}