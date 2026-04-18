import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Map, CheckCircle2, Play, Flame, Gift, Lock, Heart, Trophy, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function DailyQuests({ user, onUserUpdate }) {
  const [quests, setQuests] = useState([]);

  // Fetch real progress from database
  const { data: stats } = useQuery({
    queryKey: ['dailyStats', user?.id],
    queryFn: async () => {
      if (!user) return { watched: 0, liked: 0 };
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const [history, likes] = await Promise.all([
        base44.entities.WatchHistory.filter({ user_id: user.id }, '-created_date', 50),
        base44.entities.Like.filter({ user_id: user.id }, '-created_date', 50)
      ]);

      return {
        watched: history.filter(h => new Date(h.created_date) >= startOfDay).length,
        liked: likes.filter(l => new Date(l.created_date) >= startOfDay).length
      };
    },
    enabled: !!user,
    refetchInterval: 15000,
  });
  
  useEffect(() => {
    if (!user) return;
    const today = new Date().toDateString();
    const stored = localStorage.getItem(`daily_quests_${user.id}`);
    let data = stored ? JSON.parse(stored) : null;
    
    if (!data || data.date !== today || !data.claimed) {
      data = {
        date: today,
        claimed: { login: false, watch: false, like: false, watch_more: false }
      };
      localStorage.setItem(`daily_quests_${user.id}`, JSON.stringify(data));
    }

    const watchedCount = stats?.watched || 0;
    const likedCount = stats?.liked || 0;

    setQuests([
      { 
        id: 'login', title: 'Start', desc: 'Hub besuchen', progress: 1, max: 1, reward: 50, 
        claimed: data.claimed?.login || false, icon: Sparkles, 
        bgClass: 'bg-gradient-to-br from-blue-400 to-cyan-400',
        lineClass: 'bg-gradient-to-r from-blue-400 to-cyan-400'
      },
      { 
        id: 'watch', title: 'Zuschauer', desc: '3 Videos ansehen', progress: watchedCount, max: 3, reward: 150, 
        claimed: data.claimed?.watch || false, icon: Play, 
        bgClass: 'bg-gradient-to-br from-cyan-400 to-emerald-400',
        lineClass: 'bg-gradient-to-r from-cyan-400 to-emerald-400'
      },
      { 
        id: 'like', title: 'Supporter', desc: '1 Video liken', progress: likedCount, max: 1, reward: 250, 
        claimed: data.claimed?.like || false, icon: Heart, 
        bgClass: 'bg-gradient-to-br from-emerald-400 to-yellow-400',
        lineClass: 'bg-gradient-to-r from-emerald-400 to-yellow-400'
      },
      { 
        id: 'watch_more', title: 'Binge', desc: '10 Videos ansehen', progress: watchedCount, max: 10, reward: 500, 
        claimed: data.claimed?.watch_more || false, icon: Flame, 
        bgClass: 'bg-gradient-to-br from-yellow-400 to-orange-500',
        lineClass: 'bg-gradient-to-r from-yellow-400 to-orange-500'
      }
    ]);
  }, [user, stats]);

  const claimReward = async (q) => {
    if (q.progress < q.max || q.claimed) return;
    
    const today = new Date().toDateString();
    const stored = JSON.parse(localStorage.getItem(`daily_quests_${user.id}`) || '{}');
    const newClaimed = { ...(stored.claimed || {}), [q.id]: true };
    localStorage.setItem(`daily_quests_${user.id}`, JSON.stringify({ date: today, claimed: newClaimed }));
    
    setQuests(quests.map(quest => quest.id === q.id ? { ...quest, claimed: true } : quest));
    
    const update = { tokens: (user.tokens || 0) + q.reward };
    await base44.entities.AppUser.update(user.id, update).catch(() => {});
    onUserUpdate?.({ ...user, ...update });
    
    window.dispatchEvent(new CustomEvent('token-reward', { detail: { amount: q.reward, source: 'Quest Map', rarity: 'legendary' } }));
    toast.success(`${q.title} abgeschlossen! +${q.reward} Tokens`);
  };

  if (!user || quests.length === 0) return null;

  const allDone = quests.every(q => q.claimed);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl p-5 md:p-6 relative overflow-hidden border border-indigo-500/20 shadow-2xl"
      style={{ background: 'linear-gradient(135deg, #0f172a, #1e1b4b)' }}
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 border border-white/10">
            <Map className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-fuchsia-300">Tägliche Reise</h3>
            <p className="text-white/60 text-xs font-bold uppercase tracking-wider">Schließe Missionen ab &amp; folge dem Pfad</p>
          </div>
        </div>
        {allDone && (
          <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40 text-yellow-400 text-sm font-black flex items-center gap-2 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
            <Trophy className="w-4 h-4" /> Reise beendet
          </div>
        )}
      </div>

      <div className="relative z-10 overflow-x-auto pb-4 hide-scrollbar">
        <div className="flex items-center min-w-max px-2 relative pt-2 pb-4">
          {/* Path Background Line */}
          <div className="absolute top-[4.75rem] left-20 right-20 h-2 bg-white/5 rounded-full" />
          
          {quests.map((q, idx) => {
            const previousClaimed = idx === 0 || quests[idx - 1].claimed;
            const isLocked = !previousClaimed;
            const isDone = q.progress >= q.max;
            const canClaim = !isLocked && isDone && !q.claimed;
            const progressPercent = Math.min(q.progress, q.max) / q.max;
            const Icon = q.icon;

            return (
              <div key={q.id} className="relative flex flex-col items-center w-40 flex-shrink-0 group">
                
                {/* Space for reward bubble to keep nodes aligned */}
                <div className="h-8 mb-3 flex items-end justify-center">
                  <div className={`px-3 py-1 rounded-full border ${isLocked ? 'bg-black/40 border-white/5 text-white/30' : 'bg-black/60 border-white/10 text-yellow-400'} text-[10px] font-black flex items-center gap-1 shadow-lg transform transition-transform ${canClaim ? 'scale-110 shadow-[0_0_15px_rgba(250,204,21,0.3)]' : 'group-hover:-translate-y-1'}`}>
                    <Gift className="w-3 h-3" /> {q.reward} Tokens
                  </div>
                </div>

                {/* Connecting Progress Line */}
                {idx > 0 && (
                  <div className="absolute top-[4.75rem] right-[50%] w-full h-2 origin-left -z-10">
                    <motion.div 
                      className={`h-full rounded-full ${quests[idx-1].lineClass}`}
                      initial={{ width: 0 }}
                      animate={{ width: previousClaimed ? '100%' : '0%' }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      style={{ boxShadow: previousClaimed ? '0 0 10px currentColor' : 'none' }}
                    />
                  </div>
                )}

                {/* Node */}
                <div className="relative z-10">
                  <motion.button
                    whileHover={canClaim ? { scale: 1.1 } : {}}
                    whileTap={canClaim ? { scale: 0.95 } : {}}
                    onClick={() => { if (canClaim) claimReward(q); }}
                    disabled={isLocked || q.claimed || !isDone}
                    className={`w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                      q.claimed 
                        ? 'bg-gradient-to-br from-emerald-400 to-teal-500 border-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.5)]'
                        : isLocked 
                          ? 'bg-slate-800/80 border-slate-700/50 text-slate-500'
                          : canClaim
                            ? `${q.bgClass} border-white shadow-[0_0_30px_rgba(255,255,255,0.4)] animate-pulse`
                            : 'bg-indigo-900/80 border-indigo-500/50 text-indigo-300'
                    }`}
                  >
                    {q.claimed ? (
                      <CheckCircle2 className="w-8 h-8 text-white drop-shadow-md" />
                    ) : isLocked ? (
                      <Lock className="w-6 h-6" />
                    ) : (
                      <Icon className={`w-7 h-7 ${canClaim ? 'text-white drop-shadow-lg' : ''}`} />
                    )}

                    {/* Progress ring SVG for active but not completed node */}
                    {!isLocked && !q.claimed && (
                      <svg className="absolute inset-[-4px] w-[72px] h-[72px] -rotate-90 pointer-events-none">
                        <circle 
                          cx="36" cy="36" r="34" 
                          stroke="rgba(255,255,255,0.15)" strokeWidth="4" fill="none" 
                        />
                        <motion.circle 
                          cx="36" cy="36" r="34" 
                          stroke="currentColor" strokeWidth="4" fill="none"
                          strokeDasharray="213.6"
                          strokeDashoffset={213.6 - (213.6 * progressPercent)}
                          className={canClaim ? 'text-white' : 'text-indigo-400'}
                          transition={{ duration: 0.5 }}
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </motion.button>
                </div>

                {/* Title & Desc */}
                <div className="mt-4 text-center px-2">
                  <h4 className={`text-sm font-black leading-tight ${isLocked ? 'text-white/30' : q.claimed ? 'text-emerald-400' : 'text-white'}`}>
                    {q.title}
                  </h4>
                  <p className={`text-[10px] mt-1 line-clamp-2 ${isLocked ? 'text-white/20' : 'text-white/50'}`}>
                    {q.desc}
                  </p>
                  
                  {/* Status Indicator */}
                  {!isLocked && !q.claimed && (
                    <div className="mt-2 text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-md inline-block text-white/80">
                      {Math.min(q.progress, q.max)} / {q.max}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}