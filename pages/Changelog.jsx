import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Sparkles, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimatedBackground from '@/components/streaming/AnimatedBackground';

export default function Changelog() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const u = localStorage.getItem('app_user');
      setUser(u && u !== "undefined" ? JSON.parse(u) : null);
    } catch(e) { setUser(null); }
  }, []);

  const { data: updates = [] } = useQuery({
    queryKey: ['allUpdates'],
    queryFn: () => base44.entities.UpdateNotification.list('-created_date', 100)
  });

  const { data: seenUpdates = [] } = useQuery({
    queryKey: ['seenUpdates', user?.id],
    queryFn: () => base44.entities.SeenUpdate.filter({ user_id: user.id }, '-created_date', 500),
    enabled: !!user
  });

  const seenUpdateIds = seenUpdates.map(s => s.update_id);

  const priorityConfig = {
    low: { color: 'from-blue-500 to-cyan-500', label: 'Info', bg: 'bg-blue-500/10', text: 'text-blue-400' },
    medium: { color: 'from-violet-500 to-fuchsia-500', label: 'Update', bg: 'bg-violet-500/10', text: 'text-violet-400' },
    high: { color: 'from-orange-500 to-red-500', label: 'Wichtig', bg: 'bg-red-500/10', text: 'text-red-400' }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white pb-24">
      <AnimatedBackground />
      
      {/* Header */}
      <div className="sticky top-16 md:top-20 z-30 bg-[#0a0a0b]/95 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-black">Changelog</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 pt-8 relative z-10">
        <p className="text-white/60 mb-8 text-center">
          Alle Updates und Verbesserungen auf einen Blick
        </p>

        <div className="space-y-4">
          {updates.map((update, index) => {
            const config = priorityConfig[update.priority] || priorityConfig.medium;
            const isSeen = user && seenUpdateIds.includes(update.id);

            return (
              <motion.div
                key={update.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className={`bg-gradient-to-r ${config.color} p-[1.5px] rounded-2xl`}>
                  <div className="bg-[#0a0a0b]/95 backdrop-blur-xl rounded-2xl p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-lg ${config.bg} ${config.text} text-xs font-bold uppercase tracking-wider`}>
                          {config.label}
                        </span>
                        <span className="flex items-center gap-1.5 text-white/40 text-sm">
                          <Tag className="w-4 h-4" />
                          v{update.version}
                        </span>
                      </div>
                      {!isSeen && user && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      )}
                    </div>

                    {/* Title & Description */}
                    <h2 className="text-xl font-bold text-white mb-2">
                      {update.title}
                    </h2>
                    <p className="text-white/70 leading-relaxed mb-4">
                      {update.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center gap-2 text-white/40 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(update.created_date).toLocaleDateString('de-DE', { 
                        day: '2-digit', 
                        month: 'long', 
                        year: 'numeric' 
                      })}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {updates.length === 0 && (
            <div className="text-center py-20 text-white/30">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Noch keine Updates vorhanden</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}