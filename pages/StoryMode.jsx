import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Book, ChevronLeft, Star, Zap, Lock, Map, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { STORY_CHAPTERS } from '@/components/pokemon/story/StoryConfig';
import MissionCard from '@/components/pokemon/story/MissionCard';
import confetti from 'canvas-confetti';

export default function StoryMode() {
  const [user, setUser] = useState(null);
  const [activeChapterId, setActiveChapterId] = useState('chapter_1');
  const [loading, setLoading] = useState(true);

  // Load User & Story Progress
  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await base44.auth.me(); // Ensure fresh data
        setUser(u);
      } catch (e) {
        // Fallback to local
        const stored = localStorage.getItem('app_user');
        if (stored) setUser(JSON.parse(stored));
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"/></div>;

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Bitte melde dich an</h2>
        <Link to={createPageUrl('SignIn')} className="px-6 py-3 bg-cyan-600 rounded-xl font-bold">Zum Login</Link>
      </div>
    );
  }

  const storyProgress = user.pokemon_story_progress || {};
  const completedMissions = storyProgress.completed_missions || [];
  const activeMission = storyProgress.active_mission || null; // { id: 'mission_1_1', progress: 2, startTime: ... }

  // Determine active chapter based on completion
  // Simplified logic: If all missions of Ch1 completed -> unlock Ch2
  // For now, we manually select chapters via UI

  const handleAcceptMission = async (mission) => {
    if (activeMission) {
      toast.error('Du hast bereits eine aktive Mission! Schließe diese zuerst ab oder brich sie ab.');
      return;
    }

    try {
      const updates = {
        pokemon_story_progress: {
          ...storyProgress,
          active_mission: {
            id: mission.id,
            progress: 0,
            started_at: new Date().toISOString(),
            type: mission.type,
            target: mission.targetAmount
          }
        }
      };

      await base44.entities.AppUser.update(user.id, updates);
      setUser({ ...user, ...updates });
      toast.success(`Mission "${mission.title}" angenommen!`);
    } catch (e) {
      console.error(e);
      toast.error('Fehler beim Annehmen der Mission.');
    }
  };

  const handleClaimMission = async (mission) => {
    if (!activeMission || activeMission.id !== mission.id) return;

    try {
      // Reward logic
      let newTokens = (user.tokens || 0) + (mission.rewards.tokens || 0);
      
      // Update Pokémon XP (Mock implementation - would target active pokemon)
      const sp = { ...storyProgress };
      const activeMonId = sp.active_pokemon_id; // Assume this exists in data
      let xpUpdates = { ...sp.pokemon_xp };
      
      if (activeMonId && mission.rewards.xp) {
         xpUpdates[activeMonId] = (xpUpdates[activeMonId] || 0) + mission.rewards.xp;
      }

      const updates = {
        tokens: newTokens,
        pokemon_story_progress: {
          ...sp,
          pokemon_xp: xpUpdates,
          active_mission: null, // Clear active
          completed_missions: [...(sp.completed_missions || []), mission.id]
        }
      };

      await base44.entities.AppUser.update(user.id, updates);
      setUser({ ...user, ...updates });
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#ec4899', '#fbbf24']
      });

      toast.success(`Mission abgeschlossen! +${mission.rewards.tokens} Tokens`);
      
      if (mission.rewards.evolution) {
         toast('✨ Dein Pokémon fühlt sich seltsam... (Entwicklung verfügbar!)', {
            icon: '🧬',
            style: { background: '#a855f7', color: 'white' }
         });
      }

    } catch (e) {
      console.error(e);
      toast.error('Fehler beim Abschließen.');
    }
  };

  // Check mission status
  const getMissionStatus = (mission) => {
    if (completedMissions.includes(mission.id)) return 'completed';
    if (activeMission?.id === mission.id) {
        // Mock progress check
        // In a real app, we would check WatchHistory counts vs start time
        // For demo/prototype: we assume "Active" means "In Progress"
        // Let's simulate "Ready to Claim" for demo purposes if clicked again or purely manual for now
        // OR: checking if targetAmount <= current progress. 
        // Since we can't easily auto-track 'likes' without backend hooks, we'll let user simulate progress or assume it's done for demo.
        // Better: Let's assume progress is 100% for the prototype to show flow.
        
        // HACK: For prototype, let's treat active missions as claimable immediately to show the "Level Up" feature
        return 'ready_to_claim'; 
    }
    return 'available';
  };

  const activeChapter = STORY_CHAPTERS.find(c => c.id === activeChapterId) || STORY_CHAPTERS[0];

  return (
    <div className="min-h-screen pb-20 bg-black text-white font-sans selection:bg-cyan-500/30">
      
      {/* Hero Header */}
      <div className="relative h-[40vh] min-h-[400px] overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: activeChapter.bgImage }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 max-w-7xl mx-auto">
          <Link to={createPageUrl('Home')} className="absolute top-6 left-6 md:left-12 flex items-center gap-2 text-white/50 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" /> Zurück
          </Link>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-black uppercase tracking-widest backdrop-blur-md">
                Story Modus
              </span>
              {activeMission && (
                <span className="px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-400/30 text-yellow-300 text-xs font-black uppercase tracking-widest backdrop-blur-md flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Mission läuft
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
              {activeChapter.title}
            </h1>
            <p className="text-lg text-white/70 max-w-2xl leading-relaxed">
              {activeChapter.description}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content - Mission List */}
          <div className="lg:col-span-8 space-y-6">
             {/* Chapter Tabs */}
             <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
              {STORY_CHAPTERS.map(chapter => (
                <button
                  key={chapter.id}
                  onClick={() => setActiveChapterId(chapter.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition-all whitespace-nowrap
                    ${activeChapterId === chapter.id 
                      ? 'bg-white/10 border-white/20 text-white shadow-lg backdrop-blur-xl' 
                      : 'bg-black/40 border-white/5 text-white/40 hover:bg-white/5'}`}
                >
                  <Book className="w-4 h-4" />
                  <span className="font-bold">{chapter.title.split(':')[0]}</span>
                </button>
              ))}
            </div>

            <div className="bg-black/40 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Map className="w-5 h-5 text-cyan-400" />
                  Aktuelle Missionen
                </h3>
                <span className="text-sm text-white/40">
                  {completedMissions.length} abgeschlossen
                </span>
              </div>

              <div className="space-y-4">
                {activeChapter.missions.map((mission, idx) => {
                  const status = getMissionStatus(mission);
                  // Mock progress calculation
                  const progress = activeMission?.id === mission.id ? (activeMission.progress || 0) : 0;
                  
                  return (
                    <motion.div 
                      key={mission.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <MissionCard 
                        mission={mission}
                        status={status}
                        onAccept={handleAcceptMission}
                        onClaim={handleClaimMission}
                        progress={activeMission?.id === mission.id ? 100 : 0} // FORCE 100% for demo
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar - Active Pokemon Stats */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-3xl p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  Dein Partner
                </h3>
                <Link to={createPageUrl('PokemonCollection')} className="text-xs text-cyan-400 hover:underline">
                  Wechseln
                </Link>
              </div>

              {/* Placeholder for Active Pokemon Visual */}
              <div className="aspect-square rounded-2xl bg-black/50 border border-white/5 mb-6 relative overflow-hidden flex items-center justify-center group">
                 <div className="absolute inset-0 bg-[url('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/25.gif')] bg-center bg-no-repeat bg-contain opacity-80 group-hover:scale-110 transition-transform duration-500" />
                 <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                 <div className="absolute bottom-4 left-4">
                    <div className="text-2xl font-black text-white">Pikachu</div>
                    <div className="text-xs text-white/50">Level 5 · Elektro</div>
                 </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/60">Erfahrung (XP)</span>
                    <span className="text-white">450 / 1000</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 w-[45%]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                    <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Angriff</div>
                    <div className="text-lg font-bold">55</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                    <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Tempo</div>
                    <div className="text-lg font-bold">90</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-sm font-bold mb-2 text-white/80">Freischaltbar</h4>
                  <div className="flex gap-2">
                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center" title="Donnerblitz">
                      <Zap className="w-5 h-5 text-yellow-500/50" />
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center" title="Eisenschweif">
                      <Lock className="w-4 h-4 text-white/20" />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}