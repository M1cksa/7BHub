import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Gift, Phone, Gamepad2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';
import { base44 } from '@/api/base44Client';

const DEFAULT_QUESTS = [
  { id: 'profile', title: 'Profil einrichten', icon: Sparkles, completed: false, link: 'Profile' },
  { id: 'call', title: 'Videoanruf starten', icon: Phone, completed: false, link: 'Friends' },
  { id: 'game', title: 'Neon Dash spielen', icon: Gamepad2, completed: false, link: 'NeonDash' }
];

export default function WelcomeQuest({ user }) {
  const [quests, setQuests] = useState(DEFAULT_QUESTS);
  const [isClaimed, setIsClaimed] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (!user) return;
    setIsClaimed(user.v2_quest_claimed || false);
    setIsDismissed(user.v2_quest_dismissed || false);

    let progress = user.v2_quest_progress || [];
    
    // Auto check profile setup
    if (!progress.includes('profile') && (user.bio || user.avatar_url)) {
      progress = [...progress, 'profile'];
      updateQuestProgressDB(progress);
    }

    setQuests(DEFAULT_QUESTS.map(dq => ({
      ...dq,
      completed: progress.includes(dq.id)
    })));
  }, [user]);

  const updateQuestProgressDB = async (newProgress) => {
    if (!user) return;
    try {
      await base44.entities.AppUser.update(user.id, { v2_quest_progress: newProgress });
      const updatedUser = { ...user, v2_quest_progress: newProgress };
      localStorage.setItem('app_user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('user-updated'));
    } catch(e) {}
  };

  const updateQuestState = async (id, completed) => {
    if (!user) return;
    const currentProgress = user.v2_quest_progress || [];
    let newProgress = [...currentProgress];
    
    if (completed && !newProgress.includes(id)) {
      newProgress.push(id);
    } else if (!completed) {
      newProgress = newProgress.filter(p => p !== id);
    }

    setQuests(prev => prev.map(q => q.id === id ? { ...q, completed } : q));
    await updateQuestProgressDB(newProgress);
  };

  const handleQuestClick = (id) => {
    updateQuestState(id, true);
  };

  const handleClaim = async () => {
    if (!user) return;
    try {
      await base44.entities.AppUser.update(user.id, { 
        tokens: (user.tokens || 0) + 500,
        v2_quest_claimed: true
      });
      setIsClaimed(true);
      
      const updatedUser = { ...user, tokens: (user.tokens || 0) + 500, v2_quest_claimed: true };
      localStorage.setItem('app_user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('user-updated'));
      
      window.dispatchEvent(new CustomEvent('token-reward', { detail: { amount: 500, source: '2.0 Quest', rarity: 'epic' } }));
    } catch(e) {}
  };

  const handleDismiss = async () => {
    if (!user) return;
    setIsDismissed(true);
    try {
      await base44.entities.AppUser.update(user.id, { v2_quest_dismissed: true });
      const updatedUser = { ...user, v2_quest_dismissed: true };
      localStorage.setItem('app_user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('user-updated'));
    } catch(e) {}
  };

  const progress = quests.filter(q => q.completed).length;
  const total = quests.length;
  const allCompleted = progress === total;

  if (isDismissed || isClaimed || !user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-6 relative overflow-hidden mb-8"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center relative z-10">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-cyan-400" />
              7B Hub 2.0 Quest
            </h3>
            <span className="text-sm font-bold text-cyan-400">{progress}/{total}</span>
          </div>
          
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-6">
            <motion.div 
              className="h-full bg-gradient-to-r from-cyan-500 to-violet-500"
              initial={{ width: 0 }}
              animate={{ width: `${(progress / total) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {quests.map(quest => {
              const Icon = quest.icon;
              return (
                <Link key={quest.id} to={createPageUrl(quest.link)} onClick={() => handleQuestClick(quest.id)}>
                  <div className={`p-4 rounded-2xl border transition-all flex items-center gap-3 ${quest.completed ? 'bg-white/5 border-cyan-500/30' : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.04]'}`}>
                    {quest.completed ? <CheckCircle2 className="w-6 h-6 text-cyan-400 shrink-0" /> : <Icon className="w-6 h-6 text-white/30 shrink-0" />}
                    <div>
                      <div className={`text-sm font-medium ${quest.completed ? 'text-cyan-300' : 'text-white/80'}`}>{quest.title}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="w-full md:w-auto flex flex-col gap-3 shrink-0">
          <Button 
            onClick={handleClaim}
            disabled={!allCompleted}
            className={`h-14 px-8 rounded-2xl font-bold shadow-xl transition-all ${allCompleted ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:scale-105 shadow-yellow-500/25' : 'bg-white/5 text-white/40 cursor-not-allowed border border-white/10'}`}
          >
            {allCompleted ? '500 Tokens einlösen!' : 'Schließe Quests ab'}
          </Button>
          <button 
            onClick={handleDismiss}
            className="text-xs text-white/40 hover:text-white/80 transition-colors text-center"
          >
            Ausblenden
          </button>
        </div>
      </div>
    </motion.div>
  );
}