import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ChevronRight, Zap, Star } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function UpdateNotificationBanner() {
  const [user, setUser] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    try {
      const u = localStorage.getItem('app_user');
      setUser(u && u !== "undefined" ? JSON.parse(u) : null);
    } catch(e) { setUser(null); }
  }, []);

  const { data: updates = [] } = useQuery({
    queryKey: ['activeUpdates'],
    queryFn: () => base44.entities.UpdateNotification.filter({ active: true }, '-created_date', 1),
    enabled: !!user
  });

  const { data: seenUpdates = [] } = useQuery({
    queryKey: ['seenUpdates', user?.id],
    queryFn: () => base44.entities.SeenUpdate.filter({ user_id: user.id }, '-created_date', 100),
    enabled: !!user
  });

  const markAsSeenMutation = useMutation({
    mutationFn: (updateId) => base44.entities.SeenUpdate.create({
      user_id: user.id,
      update_id: updateId,
      seen_at: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seenUpdates'] });
      setIsDismissed(true);
    }
  });

  if (!user || isDismissed) return null;

  const latestUpdate = updates[0];
  if (!latestUpdate) return null;

  const seenUpdateIds = seenUpdates.map(s => s.update_id);
  if (seenUpdateIds.includes(latestUpdate.id)) return null;

  const handleDismiss = () => markAsSeenMutation.mutate(latestUpdate.id);

  const priorityConfig = {
    low:    { gradient: 'from-blue-600 via-cyan-500 to-blue-600',    glow: 'rgba(6,182,212,0.3)',    icon: <Star className="w-5 h-5 text-white" />,     label: 'Neu', labelColor: 'bg-cyan-500/20 text-cyan-300' },
    medium: { gradient: 'from-violet-600 via-fuchsia-500 to-violet-600', glow: 'rgba(168,85,247,0.35)', icon: <Sparkles className="w-5 h-5 text-white" />, label: 'Update', labelColor: 'bg-violet-500/20 text-violet-300' },
    high:   { gradient: 'from-orange-500 via-red-500 to-orange-500', glow: 'rgba(249,115,22,0.4)',   icon: <Zap className="w-5 h-5 text-white fill-white" />, label: 'Wichtig', labelColor: 'bg-orange-500/20 text-orange-300' },
  };

  const cfg = priorityConfig[latestUpdate.priority] || priorityConfig.medium;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -120, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -120, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 22, stiffness: 280 }}
        className="fixed top-[68px] md:top-[76px] left-0 right-0 z-40 px-3 md:px-6"
      >
        <div className="max-w-2xl mx-auto">
          {/* Outer gradient border */}
          <div className={`relative bg-gradient-to-r ${cfg.gradient} p-[1.5px] rounded-2xl`}
            style={{ boxShadow: `0 8px 32px ${cfg.glow}, 0 2px 8px rgba(0,0,0,0.5)` }}>

            {/* Inner panel */}
            <div className="bg-[#08080f]/96 backdrop-blur-2xl rounded-2xl overflow-hidden">

              {/* Top accent bar */}
              <div className={`h-[3px] w-full bg-gradient-to-r ${cfg.gradient}`} />

              <div className="p-4 md:p-5">
                <div className="flex items-center gap-3 md:gap-4">

                  {/* Animated icon */}
                  <motion.div
                    animate={{ scale: [1, 1.08, 1], rotate: [0, 6, -6, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className={`w-11 h-11 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center flex-shrink-0`}
                    style={{ boxShadow: `0 0 16px ${cfg.glow}` }}
                  >
                    {cfg.icon}
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${cfg.labelColor}`}>
                        {cfg.label}
                      </span>
                      {latestUpdate.version && (
                        <span className="text-white/30 text-[11px] font-bold">v{latestUpdate.version}</span>
                      )}
                    </div>
                    <h3 className="text-base md:text-lg font-black text-white leading-tight truncate">
                      {latestUpdate.title}
                    </h3>
                    <p className="text-white/55 text-xs md:text-sm leading-snug mt-0.5 line-clamp-1 md:line-clamp-2">
                      {latestUpdate.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 ml-1">
                    <a
                      href={createPageUrl('Changelog')}
                      onClick={handleDismiss}
                      className={`hidden md:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r ${cfg.gradient} text-white text-sm font-black transition-all hover:opacity-90 active:scale-95`}
                      style={{ boxShadow: `0 4px 12px ${cfg.glow}` }}
                    >
                      Details <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={handleDismiss}
                      className="w-8 h-8 rounded-lg bg-white/8 hover:bg-white/15 active:bg-white/20 flex items-center justify-center transition-all"
                    >
                      <X className="w-4 h-4 text-white/60" />
                    </button>
                  </div>
                </div>

                {/* Mobile CTA */}
                <div className="mt-3 flex gap-2 md:hidden">
                  <button
                    onClick={handleDismiss}
                    className="flex-1 py-2.5 rounded-xl bg-white/8 hover:bg-white/15 text-white/70 text-sm font-bold border border-white/10 transition-all"
                  >
                    Schließen
                  </button>
                  <a
                    href={createPageUrl('Changelog')}
                    onClick={handleDismiss}
                    className={`flex-1 py-2.5 rounded-xl bg-gradient-to-r ${cfg.gradient} text-white text-sm font-black flex items-center justify-center gap-1 transition-all`}
                  >
                    Details <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}