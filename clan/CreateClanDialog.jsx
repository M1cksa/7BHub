import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function CreateClanDialog({ isOpen, onClose, user }) {
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleCreate = async () => {
    if (!name.trim()) { toast.error('Name erforderlich'); return; }
    setLoading(true);
    try {
      const clan = await base44.entities.Clan.create({
        name: name.trim(),
        tag: tag.trim().toUpperCase(),
        description: description.trim(),
        logo_url: logoUrl.trim() || undefined,
        banner_url: bannerUrl.trim() || undefined,
        owner_username: user.username,
        members_count: 1,
        level: 1,
        xp: 0,
        is_recruiting: true
      });
      await base44.entities.ClanMember.create({
        clan_id: clan.id,
        clan_name: name.trim(),
        username: user.username,
        avatar_url: user.avatar_url || '',
        role: 'owner',
        joined_date: new Date().toISOString()
      });
      queryClient.invalidateQueries({ queryKey: ['clans'] });
      toast.success('Clan erstellt!');
      onClose();
      setName(''); setTag(''); setDescription('');
    } catch (err) {
      toast.error('Fehler: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Clan erstellen</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <label className="text-sm text-white/60 mb-1 block">Name *</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Clan Name" className="bg-black/30 border-white/10" />
          </div>
          <div>
            <label className="text-sm text-white/60 mb-1 block">Tag (z.B. PRO)</label>
            <Input value={tag} onChange={e => setTag(e.target.value.slice(0, 5))} placeholder="TAG" className="bg-black/30 border-white/10 uppercase" />
          </div>
          <div>
            <label className="text-sm text-white/60 mb-1 block">Beschreibung</label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Beschreibe deinen Clan..." className="bg-black/30 border-white/10 min-h-[80px]" />
          </div>
          <div>
            <label className="text-sm text-white/60 mb-1 block">Logo URL (Optional)</label>
            <Input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://..." className="bg-black/30 border-white/10" />
          </div>
          <div>
            <label className="text-sm text-white/60 mb-1 block">Banner URL (Optional)</label>
            <Input value={bannerUrl} onChange={e => setBannerUrl(e.target.value)} placeholder="https://..." className="bg-black/30 border-white/10" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Abbrechen</Button>
            <Button onClick={handleCreate} disabled={loading || !name.trim()} className="flex-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Erstellen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}