import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, Edit, Trash2, Eye, ThumbsUp, Clock, BarChart3, Video, Loader2, Zap } from 'lucide-react';
import VideoBoostDialog from '@/components/shop/VideoBoostDialog';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const categories = [
  { value: 'gaming', label: 'Gaming' },
  { value: 'music', label: 'Musik' },
  { value: 'education', label: 'Bildung' },
  { value: 'entertainment', label: 'Unterhaltung' },
  { value: 'tech', label: 'Technologie' },
  { value: 'art', label: 'Kunst' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'sports', label: 'Sport' },
];

export default function MyVideos() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [boostingVideo, setBoostingVideo] = useState(null);

  // Upload Form
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'entertainment',
    videoFile: null,
    thumbnailFile: null
  });

  // Edit Form
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    thumbnailFile: null
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('app_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch(e) {
        console.error('Failed to parse user:', e);
      }
    }
  }, []);

  // Fetch user's videos
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['myVideos', user?.username],
    queryFn: async () => {
      if (!user) return [];
      const result = await base44.entities.Video.filter(
        { creator_name: user.username },
        '-created_date',
        100
      );
      return result || [];
    },
    enabled: !!user
  });

  // Upload Video
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!uploadForm.videoFile || !user) return;

      // Upload video file
      const videoUpload = await base44.integrations.Core.UploadFile({
        file: uploadForm.videoFile
      });

      // Upload thumbnail if provided
      let thumbnailUrl = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=640&h=360&fit=crop';
      if (uploadForm.thumbnailFile) {
        const thumbUpload = await base44.integrations.Core.UploadFile({
          file: uploadForm.thumbnailFile
        });
        thumbnailUrl = thumbUpload.file_url;
      }

      // Create video entry
      return await base44.entities.Video.create({
        title: uploadForm.title,
        description: uploadForm.description,
        category: uploadForm.category,
        video_url: videoUpload.file_url,
        thumbnail_url: thumbnailUrl,
        creator_name: user.username,
        creator_avatar: user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
        status: 'vod',
        views: 0,
        likes_count: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myVideos']);
      queryClient.invalidateQueries(['videos']);
      setIsUploadOpen(false);
      setUploadForm({
        title: '',
        description: '',
        category: 'entertainment',
        videoFile: null,
        thumbnailFile: null
      });
    }
  });

  // Update Video
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingVideo) return;

      const updateData = {
        title: editForm.title,
        description: editForm.description,
        category: editForm.category
      };

      // Upload new thumbnail if provided
      if (editForm.thumbnailFile) {
        const thumbUpload = await base44.integrations.Core.UploadFile({
          file: editForm.thumbnailFile
        });
        updateData.thumbnail_url = thumbUpload.file_url;
      }

      return await base44.entities.Video.update(editingVideo.id, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myVideos']);
      queryClient.invalidateQueries(['videos']);
      setIsEditOpen(false);
      setEditingVideo(null);
    }
  });

  // Delete Video
  const deleteMutation = useMutation({
    mutationFn: async (videoId) => {
      return await base44.entities.Video.delete(videoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myVideos']);
      queryClient.invalidateQueries(['videos']);
    }
  });

  const handleEdit = (video) => {
    setEditingVideo(video);
    setEditForm({
      title: video.title,
      description: video.description || '',
      category: video.category,
      thumbnailFile: null
    });
    setIsEditOpen(true);
  };

  const handleDelete = (videoId) => {
    if (window.confirm('Video wirklich löschen?')) {
      deleteMutation.mutate(videoId);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-white/60 mb-4">Bitte melde dich an</p>
          <Link to={createPageUrl('SignIn')}>
            <Button>Anmelden</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Meine Videos</h1>
          <p className="text-white/50">Verwalte deine hochgeladenen Videos</p>
        </div>
        
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 gap-2">
              <Upload className="w-4 h-4" />
              Video hochladen
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1a1a1c] border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Neues Video hochladen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm text-white/70 mb-2 block">Video-Datei</label>
                <Input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setUploadForm({ ...uploadForm, videoFile: e.target.files[0] })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              
              <div>
                <label className="text-sm text-white/70 mb-2 block">Titel</label>
                <Input
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="Mein tolles Video"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-white/70 mb-2 block">Beschreibung</label>
                <Textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="Beschreibe dein Video..."
                  rows={3}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-white/70 mb-2 block">Kategorie</label>
                <Select value={uploadForm.category} onValueChange={(val) => setUploadForm({ ...uploadForm, category: val })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1c] border-white/10 text-white">
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-white/70 mb-2 block">Thumbnail (Optional)</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setUploadForm({ ...uploadForm, thumbnailFile: e.target.files[0] })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <Button
                onClick={() => uploadMutation.mutate()}
                disabled={!uploadForm.videoFile || !uploadForm.title || uploadMutation.isPending}
                className="w-full bg-violet-600 hover:bg-violet-500"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Wird hochgeladen...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Hochladen
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-[#1a1a1c] border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Video bearbeiten</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-white/70 mb-2 block">Titel</label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-white/70 mb-2 block">Beschreibung</label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-white/70 mb-2 block">Kategorie</label>
              <Select value={editForm.category} onValueChange={(val) => setEditForm({ ...editForm, category: val })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1c] border-white/10 text-white">
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-white/70 mb-2 block">Neues Thumbnail (Optional)</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setEditForm({ ...editForm, thumbnailFile: e.target.files[0] })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <Button
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
              className="w-full bg-violet-600 hover:bg-violet-500"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Wird gespeichert...
                </>
              ) : (
                'Speichern'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Videos List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20">
          <Video className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 mb-6">Noch keine Videos hochgeladen</p>
          <Button onClick={() => setIsUploadOpen(true)} className="bg-violet-600 hover:bg-violet-500">
            Erstes Video hochladen
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, idx) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-violet-500/30 transition-all"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-black">
                <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                {video.status === 'live' && (
                  <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-red-600 text-white text-xs font-bold">
                    LIVE
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-bold text-white mb-2 line-clamp-2">{video.title}</h3>
                <p className="text-white/50 text-sm mb-4 line-clamp-2">{video.description}</p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="flex items-center gap-1 text-white/40 text-xs">
                    <Eye className="w-3 h-3" />
                    {video.views || 0}
                  </div>
                  <div className="flex items-center gap-1 text-white/40 text-xs">
                    <ThumbsUp className="w-3 h-3" />
                    {video.likes_count || 0}
                  </div>
                  <div className="flex items-center gap-1 text-white/40 text-xs">
                    <Clock className="w-3 h-3" />
                    {format(new Date(video.created_date), 'dd.MM.yy', { locale: de })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link to={createPageUrl('Watch') + `?id=${video.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full border-white/10 text-white hover:bg-white/10">
                      <Eye className="w-3 h-3 mr-1" />
                      Ansehen
                    </Button>
                  </Link>
                  <Button
                    onClick={() => setBoostingVideo(video)}
                    variant="outline"
                    size="sm"
                    className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                    title="Video boosten"
                  >
                    <Zap className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={() => handleEdit(video)}
                    variant="outline"
                    size="sm"
                    className="border-white/10 text-white hover:bg-white/10"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(video.id)}
                    variant="outline"
                    size="sm"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      <VideoBoostDialog
        video={boostingVideo}
        user={user}
        setUser={setUser}
        open={!!boostingVideo}
        onClose={() => setBoostingVideo(null)}
      />
    </div>
  );
}