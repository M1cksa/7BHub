import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useParams, useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Play, Trash, ArrowLeft, MoreVertical, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimatedBackground from '@/components/streaming/AnimatedBackground';

export default function PlaylistDetail() {
  const [searchParams] = useSearchParams();
  const playlistId = searchParams.get('id');
  const queryClient = useQueryClient();

  const { data: playlist } = useQuery({
    queryKey: ['playlist', playlistId],
    queryFn: async () => {
       const res = await base44.entities.Playlist.list({ id: playlistId }, 1);
       return res[0];
    },
    enabled: !!playlistId
  });

  const { data: items = [] } = useQuery({
    queryKey: ['playlistItems', playlistId],
    queryFn: () => base44.entities.PlaylistItem.list({ playlist_id: playlistId }, 'order'),
    enabled: !!playlistId
  });

  // Fetch actual video data for items
  const { data: videos = [] } = useQuery({
    queryKey: ['playlistVideos', items],
    queryFn: async () => {
       if (items.length === 0) return [];
       // Helper to fetch individually since we don't have 'in' query yet
       const promises = items.map(item => base44.entities.Video.list({ id: item.video_id }, 1));
       const results = await Promise.all(promises);
       return results.map(r => r[0]).filter(Boolean);
    },
    enabled: items.length > 0
  });

  const removeMutation = useMutation({
    mutationFn: async (itemId) => {
       await base44.entities.PlaylistItem.delete(itemId);
    },
    onSuccess: () => queryClient.invalidateQueries(['playlistItems'])
  });

  if (!playlist) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white pt-24 px-4 pb-20">
      <AnimatedBackground />
      
      {/* Sticky Header with Back Button */}
      <div className="md:hidden sticky top-0 z-40 bg-[#0a0a0b]/95 backdrop-blur-2xl border-b border-white/10 px-4 py-3 flex items-center gap-3 mb-4" style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}>
        <Link to={createPageUrl('Playlists')}>
          <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-sm font-bold text-white truncate">{playlist?.title}</h1>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10">
         
         {/* Sidebar Info */}
         <div className="w-full md:w-80 flex-shrink-0">
            <Link to={createPageUrl('Playlists')} className="hidden md:inline-flex text-white/50 hover:text-white mb-6 items-center gap-2">
               <ArrowLeft className="w-4 h-4" /> Zurück
            </Link>
            
            <div className="aspect-square rounded-2xl overflow-hidden bg-white/5 mb-6 relative group shadow-2xl">
               <img src={playlist.cover_url} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="w-12 h-12 text-white fill-white" />
               </div>
            </div>

            <h1 className="text-3xl font-black mb-2">{playlist.title}</h1>
            <p className="text-white/50 mb-6">{items.length} Videos • {playlist.is_public ? 'Öffentlich' : 'Privat'}</p>

            <div className="flex gap-2">
               <Button className="flex-1 bg-white text-black hover:bg-white/90 font-bold rounded-xl h-12">
                  <Play className="w-4 h-4 mr-2 fill-current" /> Abspielen
               </Button>
               <Button variant="outline" size="icon" className="rounded-xl border-white/10 hover:bg-white/10 h-12 w-12">
                  <Share2 className="w-5 h-5" />
               </Button>
            </div>
         </div>

         {/* Video List */}
         <div className="flex-1 space-y-2">
            {videos.length === 0 ? (
               <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                  <p className="text-white/40">Diese Playlist ist leer.</p>
               </div>
            ) : (
               videos.map((video, idx) => {
                  const item = items.find(i => i.video_id === video.id);
                  return (
                     <div key={video.id} className="group flex gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors items-center border border-transparent hover:border-white/5">
                        <span className="text-white/30 font-bold w-6 text-center">{idx + 1}</span>
                        <div className="w-32 aspect-video bg-black rounded-lg overflow-hidden relative flex-shrink-0">
                           <img src={video.thumbnail_url} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <h3 className="font-bold truncate">{video.title}</h3>
                           <p className="text-sm text-white/50">{video.creator_name}</p>
                        </div>
                        <Button 
                           variant="ghost" 
                           size="icon" 
                           onClick={() => removeMutation.mutate(item.id)}
                           className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 hover:bg-red-500/10"
                        >
                           <Trash className="w-4 h-4" />
                        </Button>
                     </div>
                  );
               })
            )}
         </div>
      </div>
    </div>
  );
}