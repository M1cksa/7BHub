import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function AdminEventManager() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    color: 'blue',
    active: true
  });

  const { data: events = [] } = useQuery({
    queryKey: ['eventAnnouncements'],
    queryFn: () => base44.entities.EventAnnouncement.list('-created_date', 50)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.EventAnnouncement.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['eventAnnouncements']);
      setForm({ title: '', description: '', start_date: '', end_date: '', color: 'blue', active: true });
      toast.success('Event erstellt');
    }
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }) => base44.entities.EventAnnouncement.update(id, { active }),
    onSuccess: () => {
      queryClient.invalidateQueries(['eventAnnouncements']);
      toast.success('Event aktualisiert');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.EventAnnouncement.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['eventAnnouncements']);
      toast.success('Event gelöscht');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.start_date || !form.end_date) {
      toast.error('Bitte fülle alle Pflichtfelder aus');
      return;
    }
    const data = {
      ...form,
      start_date: new Date(form.start_date).toISOString(),
      end_date: new Date(form.end_date).toISOString()
    };
    createMutation.mutate(data);
  };

  const colorOptions = [
    { value: 'blue', label: '🔵 Blau' },
    { value: 'purple', label: '🟣 Lila' },
    { value: 'green', label: '🟢 Grün' },
    { value: 'orange', label: '🟠 Orange' },
    { value: 'pink', label: '🩷 Pink' }
  ];

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-black">Event-Ankündigung erstellen</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-white/80">Titel *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="z.B. Live-Stream heute Abend"
              className="bg-white/5 border-white/10 text-white mt-2"
            />
          </div>

          <div>
            <Label className="text-white/80">Beschreibung</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Weitere Details zum Event..."
              className="bg-white/5 border-white/10 text-white mt-2"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white/80">Start *</Label>
              <Input
                type="datetime-local"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-2"
              />
            </div>
            <div>
              <Label className="text-white/80">Ende *</Label>
              <Input
                type="datetime-local"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-2"
              />
            </div>
          </div>

          <div>
            <Label className="text-white/80">Farbe</Label>
            <Select value={form.color} onValueChange={(val) => setForm({ ...form, color: val })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {colorOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-cyan-600">
            <Calendar className="w-4 h-4 mr-2" />
            Event erstellen
          </Button>
        </form>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-bold">Geplante Events</h3>
        {events.map((event) => {
          const now = new Date();
          const isActive = new Date(event.start_date) <= now && new Date(event.end_date) >= now;
          
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-4 rounded-xl"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-white">{event.title}</h4>
                    {isActive && (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-bold rounded-full">
                        Live
                      </span>
                    )}
                    {!event.active && (
                      <span className="px-2 py-0.5 bg-white/10 text-white/40 text-xs font-bold rounded-full">
                        Inaktiv
                      </span>
                    )}
                  </div>
                  {event.description && (
                    <p className="text-white/60 text-sm mb-2">{event.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-white/40">
                    <span>{new Date(event.start_date).toLocaleString('de-DE')}</span>
                    <span>→</span>
                    <span>{new Date(event.end_date).toLocaleString('de-DE')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleMutation.mutate({ id: event.id, active: !event.active })}
                    className="text-white/60 hover:text-white"
                  >
                    {event.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(event.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
        {events.length === 0 && (
          <p className="text-white/50 text-center py-8">Keine Events vorhanden</p>
        )}
      </div>
    </div>
  );
}