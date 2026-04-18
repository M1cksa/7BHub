import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, MousePointer, Eye, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function AdManagerPage() {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('app_user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  });

  const [createDialog, setCreateDialog] = useState(false);
  const [form, setForm] = useState({
    title: '',
    type: 'banner',
    media_url: '',
    link_url: '',
    placement: 'sidebar',
    is_active: true,
    start_date: '',
    end_date: '',
    target_impressions: 0
  });

  const queryClient = useQueryClient();

  const { data: ads = [] } = useQuery({
    queryKey: ['advertisements'],
    queryFn: () => base44.entities.Advertisement.list('-created_date', 100),
    enabled: !!user
  });

  const { data: impressions = [] } = useQuery({
    queryKey: ['adImpressions'],
    queryFn: () => base44.entities.AdImpression.list('-created_date', 1000),
    enabled: !!user
  });

  const { data: clicks = [] } = useQuery({
    queryKey: ['adClicks'],
    queryFn: () => base44.entities.AdClick.list('-created_date', 1000),
    enabled: !!user
  });

  const createAdMutation = useMutation({
    mutationFn: (data) => base44.entities.Advertisement.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
      toast.success('Anzeige erstellt');
      setCreateDialog(false);
      setForm({
        title: '',
        type: 'banner',
        media_url: '',
        link_url: '',
        placement: 'sidebar',
        is_active: true,
        start_date: '',
        end_date: '',
        target_impressions: 0
      });
    }
  });

  const deleteAdMutation = useMutation({
    mutationFn: (id) => base44.entities.Advertisement.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
      toast.success('Anzeige gelöscht');
    }
  });

  const toggleAdMutation = useMutation({
    mutationFn: ({ id, is_active }) => 
      base44.entities.Advertisement.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
    }
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      toast.info('Uploading...');
      const result = await base44.integrations.Core.UploadFile({ file });
      setForm({ ...form, media_url: result.file_url });
      toast.success('Datei hochgeladen');
    } catch (error) {
      toast.error('Upload fehlgeschlagen');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Zugriff verweigert</h1>
          <p className="text-white/50">Nur Admins haben Zugriff</p>
        </div>
      </div>
    );
  }

  const totalImpressions = ads.reduce((sum, ad) => sum + (ad.impressions || 0), 0);
  const totalClicks = ads.reduce((sum, ad) => sum + (ad.clicks || 0), 0);
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">Werbeverwaltung</h1>
          <p className="text-white/50">Anzeigen erstellen und verwalten</p>
        </div>
        <Button onClick={() => setCreateDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Neue Anzeige
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Eye className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-3xl font-black text-white">{totalImpressions}</p>
              <p className="text-white/50 text-sm">Impressionen</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <MousePointer className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <p className="text-3xl font-black text-white">{totalClicks}</p>
              <p className="text-white/50 text-sm">Klicks</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-3xl font-black text-white">{ctr}%</p>
              <p className="text-white/50 text-sm">CTR</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ads List */}
      <div className="space-y-4">
        {ads.map(ad => (
          <motion.div
            key={ad.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{ad.title}</h3>
                  <Badge>{ad.type}</Badge>
                  <Badge variant="outline">{ad.placement}</Badge>
                  {ad.is_active && <Badge variant="default">Aktiv</Badge>}
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <p className="text-white/50 text-sm">Impressionen</p>
                    <p className="text-white text-lg font-bold">{ad.impressions || 0}</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-sm">Klicks</p>
                    <p className="text-white text-lg font-bold">{ad.clicks || 0}</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-sm">CTR</p>
                    <p className="text-white text-lg font-bold">
                      {ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : 0}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Switch
                  checked={ad.is_active}
                  onCheckedChange={(checked) => 
                    toggleAdMutation.mutate({ id: ad.id, is_active: checked })
                  }
                />
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteAdMutation.mutate(ad.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="bg-slate-900/90 backdrop-blur-3xl border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Neue Werbeanzeige erstellen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titel</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="bg-black/20 border-white/10 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Typ</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger className="bg-black/20 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banner">Banner</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Platzierung</Label>
                <Select value={form.placement} onValueChange={(v) => setForm({ ...form, placement: v })}>
                  <SelectTrigger className="bg-black/20 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pre_roll">Pre-Roll (vor Videos)</SelectItem>
                    <SelectItem value="sidebar">Seitenleiste</SelectItem>
                    <SelectItem value="home_banner">Home Banner</SelectItem>
                    <SelectItem value="between_videos">Zwischen Videos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Media hochladen</Label>
              <Input
                type="file"
                accept={form.type === 'video' ? 'video/*' : 'image/*'}
                onChange={handleFileUpload}
                className="bg-black/20 border-white/10 text-white"
              />
              {form.media_url && (
                <p className="text-green-400 text-sm mt-2">✓ Datei hochgeladen</p>
              )}
            </div>

            <div>
              <Label>Ziel-URL</Label>
              <Input
                value={form.link_url}
                onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                placeholder="https://..."
                className="bg-black/20 border-white/10 text-white"
              />
            </div>

            <div>
              <Label>Ziel-Impressionen</Label>
              <Input
                type="number"
                value={form.target_impressions}
                onChange={(e) => setForm({ ...form, target_impressions: parseInt(e.target.value) })}
                className="bg-black/20 border-white/10 text-white"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => createAdMutation.mutate(form)}
                disabled={!form.title || !form.media_url}
                className="flex-1"
              >
                Erstellen
              </Button>
              <Button variant="outline" onClick={() => setCreateDialog(false)}>
                Abbrechen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}