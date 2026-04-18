import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Server, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminServerStatus() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    status: 'online',
    message: '',
    show_banner: false,
    estimated_end: '',
    xp_boost_active: false,
    token_boost_active: false
  });

  const { data: statuses = [] } = useQuery({
    queryKey: ['serverStatus'],
    queryFn: () => base44.entities.ServerStatus.list('-created_date', 1)
  });

  React.useEffect(() => {
    if (statuses.length > 0) {
      const status = statuses[0];
      setForm({
        status: status.status || 'online',
        message: status.message || '',
        show_banner: status.show_banner || false,
        estimated_end: status.estimated_end ? new Date(status.estimated_end).toISOString().slice(0, 16) : '',
        xp_boost_active: status.xp_boost_active || false,
        token_boost_active: status.token_boost_active || false
      });
    }
  }, [statuses]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      if (statuses.length > 0) {
        return base44.entities.ServerStatus.update(statuses[0].id, data);
      } else {
        return base44.entities.ServerStatus.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serverStatus'] });
      toast.success('Serverstatus aktualisiert');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...form };
    if (data.estimated_end) {
      data.estimated_end = new Date(data.estimated_end).toISOString();
    } else {
      delete data.estimated_end;
    }
    updateMutation.mutate(data);
  };

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
          <Server className="w-5 h-5 text-cyan-400" />
        </div>
        <h2 className="text-xl font-black">Serverstatus verwalten</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="text-white/80">Status</Label>
          <Select value={form.status} onValueChange={(val) => setForm({ ...form, status: val })}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="online">🟢 Online</SelectItem>
              <SelectItem value="maintenance">🟡 Wartung</SelectItem>
              <SelectItem value="degraded">🟠 Eingeschränkt</SelectItem>
              <SelectItem value="offline">🔴 Offline</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-white/80">Nachricht</Label>
          <Textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Status-Nachricht für User..."
            className="bg-white/5 border-white/10 text-white mt-2"
            rows={3}
          />
        </div>

        <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl">
          <Label className="text-white/80">Banner anzeigen</Label>
          <Switch
            checked={form.show_banner}
            onCheckedChange={(checked) => setForm({ ...form, show_banner: checked })}
          />
        </div>

        <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-fuchsia-500/20">
          <Label className="text-white/80 text-fuchsia-400 font-bold">XP Boost (x2) aktivieren</Label>
          <Switch
            checked={form.xp_boost_active}
            onCheckedChange={(checked) => setForm({ ...form, xp_boost_active: checked })}
          />
        </div>

        <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-yellow-500/20">
          <Label className="text-white/80 text-yellow-400 font-bold">Token Boost (x2) aktivieren</Label>
          <Switch
            checked={form.token_boost_active}
            onCheckedChange={(checked) => setForm({ ...form, token_boost_active: checked })}
          />
        </div>

        <div>
          <Label className="text-white/80">Geschätzte Endzeit (optional)</Label>
          <Input
            type="datetime-local"
            value={form.estimated_end}
            onChange={(e) => setForm({ ...form, estimated_end: e.target.value })}
            className="bg-white/5 border-white/10 text-white mt-2"
          />
        </div>

        <Button type="submit" className="w-full bg-gradient-to-r from-cyan-600 to-teal-600">
          <Save className="w-4 h-4 mr-2" />
          Speichern
        </Button>
      </form>
    </div>
  );
}