import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Bell, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotificationSettings({ user }) {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState({
    notify_new_videos: true,
    notify_live_streams: true,
    notify_replies: true,
    notify_likes: true,
    notify_followers: true,
  });

  const { data: preferences = [] } = useQuery({
    queryKey: ['preferences', user?.id],
    queryFn: () => base44.entities.UserPreference.filter({ user_id: user.id }),
    enabled: !!user
  });

  useEffect(() => {
    if (preferences.length > 0) {
      const pref = preferences[0];
      setSettings({
        notify_new_videos: pref.notify_new_videos ?? true,
        notify_live_streams: pref.notify_live_streams ?? true,
        notify_replies: pref.notify_replies ?? true,
        notify_likes: pref.notify_likes ?? true,
        notify_followers: pref.notify_followers ?? true,
      });
    }
  }, [preferences]);

  const saveMutation = useMutation({
    mutationFn: async (newSettings) => {
      if (preferences.length > 0) {
        return base44.entities.UserPreference.update(preferences[0].id, newSettings);
      } else {
        return base44.entities.UserPreference.create({
          user_id: user.id,
          ...newSettings
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['preferences']);
      alert('Einstellungen gespeichert! ✅');
    }
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    saveMutation.mutate(settings);
  };

  if (!user) return null;

  const options = [
    { key: 'notify_new_videos', label: 'Neue Videos von abonnierten Erstellern', icon: '🎬' },
    { key: 'notify_live_streams', label: 'Live-Streams', icon: '🔴' },
    { key: 'notify_replies', label: 'Antworten auf Kommentare', icon: '💬' },
    { key: 'notify_likes', label: 'Likes auf meine Videos', icon: '❤️' },
    { key: 'notify_followers', label: 'Neue Follower', icon: '👥' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-2xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-cyan-500/20">
          <Bell className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Benachrichtigungseinstellungen</h3>
          <p className="text-white/50 text-sm">Steuere deine Benachrichtigungen</p>
        </div>
      </div>

      <div className="space-y-4">
        {options.map((option) => (
          <div key={option.key} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{option.icon}</span>
              <span className="text-white/90">{option.label}</span>
            </div>
            <Switch
              checked={settings[option.key]}
              onCheckedChange={() => handleToggle(option.key)}
            />
          </div>
        ))}
      </div>

      <Button
        onClick={handleSave}
        disabled={saveMutation.isPending}
        className="w-full mt-6 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 h-12"
      >
        {saveMutation.isPending ? (
          'Wird gespeichert...'
        ) : (
          <>
            <Check className="w-5 h-5 mr-2" />
            Einstellungen speichern
          </>
        )}
      </Button>
    </motion.div>
  );
}