import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, Upload, MessageCircle, Play, Crown, Award, Zap } from 'lucide-react';
import { toast } from 'sonner';

const BADGES = {
  first_upload: { id: 'first_upload', name: 'Erster Upload', description: 'Du hast dein erstes Video hochgeladen', icon: Upload, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
  views_100: { id: 'views_100', name: 'Rising Star', description: 'Deine Videos haben über 100 Aufrufe', icon: Play, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
  social_butterfly: { id: 'social_butterfly', name: 'Social Butterfly', description: 'Du hast 5 Kommentare geschrieben', icon: MessageCircle, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/30' },
  active_user: { id: 'active_user', name: 'Aktivist', description: 'Über 1000 Tokens gesammelt', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' }
};

export default function Leaderboard() {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('app_user');
      return u && u !== "undefined" ? JSON.parse(u) : null;
    } catch { return null; }
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['leaderboardUsers'],
    queryFn: () => base44.entities.AppUser.list('-tokens', 50),
  });

  const { data: neonLevelScores = [] } = useQuery({
    queryKey: ['neonLevelLeaderboard'],
    queryFn: async () => {
      const scores = await base44.entities.GameScore.filter({ game_type: 'neon_dash_level' }, '-score', 100);
      const uniqueScores = [];
      const seenUsers = new Set();
      for (const s of scores) {
        if (!seenUsers.has(s.player_username)) {
          seenUsers.add(s.player_username);
          uniqueScores.push(s);
          if (uniqueScores.length >= 10) break;
        }
      }
      return uniqueScores;
    }
  });

  // Check achievements for current user
  useEffect(() => {
    if (!user) return;
    
    const checkBadges = async () => {
      try {
        const myVideos = await base44.entities.Video.filter({ creator_name: user.username });
        const myComments = await base44.entities.Comment.filter({ author_name: user.username });
        
        let newBadges = [];
        const currentBadges = user.owned_badges || [];

        const totalViews = myVideos.reduce((sum, v) => sum + (v.views || 0), 0);

        if (myVideos.length > 0 && !currentBadges.includes('first_upload')) {
          newBadges.push('first_upload');
        }
        if (totalViews >= 100 && !currentBadges.includes('views_100')) {
          newBadges.push('views_100');
        }
        if (myComments.length >= 5 && !currentBadges.includes('social_butterfly')) {
          newBadges.push('social_butterfly');
        }
        if ((user.tokens || 0) >= 1000 && !currentBadges.includes('active_user')) {
          newBadges.push('active_user');
        }

        if (newBadges.length > 0) {
          const updatedBadges = [...currentBadges, ...newBadges];
          await base44.entities.AppUser.update(user.id, {
            owned_badges: updatedBadges
          });
          
          const updatedUser = { ...user, owned_badges: updatedBadges };
          localStorage.setItem('app_user', JSON.stringify(updatedUser));
          setUser(updatedUser);
          window.dispatchEvent(new Event('user-updated'));

          newBadges.forEach(bId => {
            const b = BADGES[bId];
            toast.success(`Trophäe freigeschaltet: ${b.name}! 🏆`, {
              description: b.description
            });
          });
        }
      } catch (e) {
        console.error("Error checking badges:", e);
      }
    };
    
    checkBadges();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const userRank = users.findIndex(u => u.id === user?.id) + 1;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-yellow-500/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      <div className="text-center mb-12">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(250,204,21,0.4)]"
        >
          <Trophy className="w-10 h-10 text-white" />
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-100 to-orange-300">
          Rangliste & Trophäen
        </h1>
        <p className="text-white/60 mt-2 text-lg">Wer sind die aktivsten Mitglieder der Community?</p>
      </div>

      {user && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="text-center md:text-left flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">Deine Statistiken</h2>
              <p className="text-white/50 mb-6">Sammle mehr Tokens durch Interaktionen um aufzusteigen!</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="bg-black/40 rounded-2xl p-4 border border-white/5 w-32 text-center">
                  <div className="text-3xl font-black text-cyan-400 mb-1">{userRank > 0 ? `#${userRank}` : '-'}</div>
                  <div className="text-xs text-white/50 uppercase tracking-wider font-bold">Rang</div>
                </div>
                <div className="bg-black/40 rounded-2xl p-4 border border-white/5 w-32 text-center">
                  <div className="text-3xl font-black text-yellow-400 mb-1">{user.tokens || 0}</div>
                  <div className="text-xs text-white/50 uppercase tracking-wider font-bold">Tokens</div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto bg-black/30 rounded-2xl p-6 border border-white/5">
              <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-4 text-center md:text-left">Deine Trophäen</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.values(BADGES).map(badge => {
                  const hasBadge = (user.owned_badges || []).includes(badge.id);
                  const Icon = badge.icon;
                  return (
                    <div 
                      key={badge.id}
                      className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all ${hasBadge ? badge.bg : 'bg-white/5 border-white/5 opacity-50 grayscale'}`}
                      title={badge.description}
                    >
                      <Icon className={`w-6 h-6 mb-2 ${hasBadge ? badge.color : 'text-white/40'}`} />
                      <span className={`text-[10px] font-bold ${hasBadge ? 'text-white' : 'text-white/40'}`}>{badge.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Neon Dash Level Leaderboard */}
      {neonLevelScores.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="mb-10 bg-white/[0.03] backdrop-blur-xl border border-violet-500/20 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-fuchsia-400">Neon Dash – Level Modus</h2>
              <p className="text-white/30 text-xs">Höchstes abgeschlossenes Level</p>
            </div>
          </div>
          <div className="space-y-2">
            {neonLevelScores.map((entry, i) => (
              <div key={entry.id || i} className={`flex items-center gap-3 p-3 rounded-xl border ${entry.player_username === user?.username ? 'bg-violet-500/10 border-violet-500/30' : 'bg-white/[0.02] border-white/5'}`}>
                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-black flex-shrink-0 ${i === 0 ? 'bg-yellow-400 text-black' : i === 1 ? 'bg-gray-300 text-black' : i === 2 ? 'bg-orange-400 text-black' : 'bg-white/10 text-white/50'}`}>{i + 1}</span>
                <span className="font-bold text-white/90 flex-1 truncate">{entry.player_username}</span>
                <span className="font-black text-violet-300 text-sm">Level {entry.score} 🗺️</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="space-y-3">
        <h2 className="text-xl font-bold text-white px-2">Top 50 Nutzer</h2>
        
        {users.map((u, index) => (
          <motion.div
            key={u.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-center gap-4 p-4 rounded-2xl backdrop-blur-md border transition-all ${
              u.id === user?.id 
                ? 'bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]' 
                : u.pro_pass?.purchased && u.pro_pass?.claimed_tiers?.length === 10 ? 'bg-yellow-500/5 border-yellow-500/20 shadow-[0_0_15px_rgba(251,191,36,0.1)]'
                : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
            }`}
          >
            <div className="w-10 font-black text-xl text-center shrink-0">
              {index === 0 ? <Crown className="w-7 h-7 text-yellow-400 mx-auto" /> :
               index === 1 ? <Medal className="w-7 h-7 text-gray-300 mx-auto" /> :
               index === 2 ? <Medal className="w-7 h-7 text-amber-600 mx-auto" /> :
               <span className="text-white/30">#{index + 1}</span>}
            </div>

            <img 
              src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} 
              alt={u.username}
              className="w-12 h-12 rounded-full bg-white/10 object-cover"
            />

            <div className="flex-1 min-w-0">
              <div className="font-bold text-white truncate flex items-center gap-2">
                {u.username}
                {u.id === user?.id && <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">Du</span>}
                {u.pro_pass?.purchased && u.pro_pass?.claimed_tiers?.length === 10 && <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full border border-yellow-500/30 animate-pulse flex items-center gap-1">👑 ABSOLUTE</span>}
              </div>
              <div className="text-xs text-white/50 flex gap-2">
                <span>{(u.owned_badges || []).length} Trophäen</span>
                {u.pro_pass?.purchased && <span className="text-yellow-400/70 font-black">Pro Pass Lvl {u.pro_pass?.claimed_tiers?.length || 0}/10</span>}
              </div>
            </div>

            <div className="text-right">
              <div className="font-black text-yellow-400 text-lg">{u.tokens || 0}</div>
              <div className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Tokens</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}