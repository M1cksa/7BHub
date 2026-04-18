import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Lock, Check, Zap, Star, Award, Target, Crown, Sparkles, TrendingUp } from 'lucide-react';
import AnimatedBackground from '@/components/streaming/AnimatedBackground';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Achievements() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const stored = localStorage.getItem('app_user');
        if (stored) {
          const local = JSON.parse(stored);
          const fresh = await base44.entities.AppUser.filter({ id: local.id }, 1);
          if (fresh && fresh.length > 0) setUser(fresh[0]);
        }
      } catch (e) {
        console.error('Failed to load user', e);
      }
    };
    loadUser();
  }, []);

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => base44.entities.Achievement.list()
  });

  const { data: userAchievements = [] } = useQuery({
    queryKey: ['userAchievements', user?.id],
    queryFn: () => base44.entities.UserAchievement.filter({ user_id: user.id }),
    enabled: !!user
  });

  const { data: watchHistory = [] } = useQuery({
    queryKey: ['watchHistory', user?.id],
    queryFn: () => base44.entities.WatchHistory.filter({ user_id: user.id }),
    enabled: !!user
  });

  const { data: userVideos = [] } = useQuery({
    queryKey: ['userVideos', user?.username],
    queryFn: () => base44.entities.Video.filter({ creator_name: user.username }),
    enabled: !!user
  });

  const { data: likes = [] } = useQuery({
    queryKey: ['userLikes', user?.id],
    queryFn: () => base44.entities.Like.filter({ user_id: user.id }),
    enabled: !!user
  });

  const { data: follows = [] } = useQuery({
    queryKey: ['followers', user?.username],
    queryFn: () => base44.entities.Follow.filter({ following_username: user.username }),
    enabled: !!user
  });

  const getProgress = (achievement) => {
    if (!user) return 0;
    
    let current = 0;
    switch(achievement.requirement_type) {
      case 'videos_watched': current = watchHistory.length; break;
      case 'videos_uploaded': current = userVideos.length; break;
      case 'likes_given': current = likes.length; break;
      case 'followers': current = follows.length; break;
      case 'tokens_earned': current = user.tokens || 0; break;
    }
    
    return Math.min((current / achievement.requirement_count) * 100, 100);
  };

  const isUnlocked = (achievement) => {
    return userAchievements.some(ua => ua.achievement_id === achievement.id);
  };

  const unlockedCount = achievements.filter(isUnlocked).length;
  const totalPoints = userAchievements.reduce((sum, ua) => {
    const ach = achievements.find(a => a.achievement_id === ua.achievement_id);
    return sum + (ach?.reward_tokens || 0);
  }, 0);
  
  const completionRate = achievements.length > 0 ? Math.round((unlockedCount / achievements.length) * 100) : 0;
  
  const getRarityColor = (count) => {
    if (count <= 5) return 'from-purple-500 via-fuchsia-500 to-pink-500';
    if (count <= 10) return 'from-blue-500 via-cyan-500 to-teal-500';
    if (count <= 20) return 'from-green-500 via-emerald-500 to-lime-500';
    return 'from-amber-500 via-orange-500 to-yellow-500';
  };

  const [filter, setFilter] = useState('all');
  
  const filteredAchievements = achievements.filter(a => {
    if (filter === 'unlocked') return isUnlocked(a);
    if (filter === 'locked') return !isUnlocked(a);
    return true;
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Ambient Glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-[150px] animate-pulse pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-[150px] animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-32 pb-24 relative z-10">
        
        {/* Hero Header */}
        <div className="text-center mb-20">
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="relative w-28 h-28 mx-auto mb-8"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-3xl blur-2xl opacity-60 animate-pulse" />
            <div className="relative w-full h-full bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-amber-500/40 border border-amber-400/20">
              <Trophy className="w-14 h-14 text-white drop-shadow-lg" />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-7xl font-black mb-6 tracking-tight"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-red-400 drop-shadow-2xl">
              Erfolge & Trophäen
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white/50 text-xl md:text-2xl font-medium max-w-2xl mx-auto mb-12"
          >
            Meistere Herausforderungen, sammle legendäre Auszeichnungen und steige zum Champion auf 🏆
          </motion.p>
          
          {/* Stats Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {[
              { icon: Trophy, label: 'Freigeschaltet', value: unlockedCount, color: 'from-amber-500 to-orange-500', glow: 'shadow-amber-500/30' },
              { icon: Target, label: 'Gesamt', value: achievements.length, color: 'from-blue-500 to-cyan-500', glow: 'shadow-blue-500/30' },
              { icon: TrendingUp, label: 'Fortschritt', value: `${completionRate}%`, color: 'from-green-500 to-emerald-500', glow: 'shadow-green-500/30' },
              { icon: Zap, label: 'Coins verdient', value: totalPoints, color: 'from-purple-500 to-fuchsia-500', glow: 'shadow-purple-500/30' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className={`relative group bg-white/[0.03] backdrop-blur-2xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all ${stat.glow} hover:shadow-xl shadow-lg`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`} />
                <div className="relative">
                  <stat.icon className={`w-8 h-8 mx-auto mb-3 text-transparent bg-clip-text bg-gradient-to-br ${stat.color}`} />
                  <div className={`text-4xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-br ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-white/40 uppercase font-bold tracking-wider">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Filter Tabs */}
        <Tabs defaultValue="all" className="mb-12">
          <TabsList className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 h-14 grid w-full max-w-md mx-auto grid-cols-3 p-1 rounded-2xl shadow-xl">
            <TabsTrigger 
              value="all" 
              onClick={() => setFilter('all')}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-orange-600 rounded-xl font-bold data-[state=active]:shadow-lg"
            >
              <Star className="w-4 h-4 mr-2" />
              Alle
            </TabsTrigger>
            <TabsTrigger 
              value="unlocked"
              onClick={() => setFilter('unlocked')}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 rounded-xl font-bold data-[state=active]:shadow-lg"
            >
              <Check className="w-4 h-4 mr-2" />
              Erreicht
            </TabsTrigger>
            <TabsTrigger 
              value="locked"
              onClick={() => setFilter('locked')}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-gray-600 rounded-xl font-bold data-[state=active]:shadow-lg"
            >
              <Lock className="w-4 h-4 mr-2" />
              Offen
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Achievements Grid */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={filter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredAchievements.map((achievement, i) => {
              const unlocked = isUnlocked(achievement);
              const progress = getProgress(achievement);
              const rarityGradient = getRarityColor(achievement.requirement_count);

              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group relative"
                >
                  {/* Glow Effect */}
                  {unlocked && (
                    <div className={`absolute -inset-1 bg-gradient-to-br ${rarityGradient} rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity`} />
                  )}
                  
                  {/* Card */}
                  <div className={`relative bg-[#0a0a0b]/90 backdrop-blur-xl rounded-3xl border overflow-hidden transition-all ${
                    unlocked 
                      ? `border-amber-500/30 shadow-2xl shadow-amber-500/20` 
                      : 'border-white/5 hover:border-white/10'
                  }`}>
                    
                    {/* Top Gradient Bar */}
                    {unlocked && (
                      <div className={`h-2 bg-gradient-to-r ${rarityGradient}`} />
                    )}
                    
                    <div className="p-8">
                      {/* Icon & Badge */}
                      <div className="flex items-start justify-between mb-6">
                        <motion.div 
                          className="relative"
                          whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                          transition={{ duration: 0.5 }}
                        >
                          <div className={`text-6xl ${unlocked ? 'grayscale-0 drop-shadow-2xl' : 'grayscale opacity-20'} transition-all`}>
                            {achievement.icon || '🏆'}
                          </div>
                          {unlocked && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -bottom-2 -right-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full p-2 shadow-lg shadow-green-500/50 border-2 border-[#0a0a0b]"
                            >
                              <Check className="w-4 h-4 text-white" />
                            </motion.div>
                          )}
                        </motion.div>
                        
                        {!unlocked && (
                          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-2">
                            <Lock className="w-5 h-5 text-white/30" />
                          </div>
                        )}
                      </div>

                      {/* Title & Description */}
                      <h3 className={`text-2xl font-black mb-3 ${unlocked ? 'text-white' : 'text-white/50'}`}>
                        {achievement.name}
                      </h3>
                      <p className={`text-sm mb-6 leading-relaxed ${unlocked ? 'text-white/60' : 'text-white/30'}`}>
                        {achievement.description}
                      </p>

                      {/* Progress Bar */}
                      {!unlocked && (
                        <div className="space-y-3 mb-6">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-white/40 font-bold uppercase tracking-wider">Fortschritt</span>
                            <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                              {Math.round(progress)}%
                            </span>
                          </div>
                          <div className="h-3 bg-white/5 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-full shadow-lg shadow-blue-500/50"
                            />
                          </div>
                        </div>
                      )}

                      {/* Reward */}
                      {achievement.reward_tokens > 0 && (
                        <div className={`pt-6 border-t ${unlocked ? 'border-white/10' : 'border-white/5'}`}>
                          <div className={`flex items-center gap-3 ${unlocked ? 'text-amber-400' : 'text-white/30'}`}>
                            <div className={`p-2 rounded-xl ${unlocked ? 'bg-amber-500/20' : 'bg-white/5'}`}>
                              <Zap className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="text-xs text-white/40 uppercase font-bold tracking-wider mb-0.5">Belohnung</div>
                              <div className="text-lg font-black">+{achievement.reward_tokens} Coins</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {filteredAchievements.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
              <Trophy className="w-12 h-12 text-white/20" />
            </div>
            <h3 className="text-2xl font-bold text-white/40 mb-2">Keine Erfolge gefunden</h3>
            <p className="text-white/30">Versuche einen anderen Filter</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}