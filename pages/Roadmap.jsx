import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { 
  Sparkles, Video, DollarSign, Users, Wand2, 
  Calendar, CheckCircle2, Clock, Zap, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { toast } from 'sonner';
import PageMaintenanceCheck from '@/components/PageMaintenanceCheck';

export default function Roadmap() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('app_user');
    if (stored && stored !== "undefined") {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  const features = [
    {
      id: 'interactive_livestream',
      icon: Users,
      title: "Interaktive Livestream-Events",
      description: "Echtzeit-Umfragen, Q&A-Sessions und virtuelle Geschenke für ein noch engagierteres Publikum während Live-Streams.",
      status: "planned",
      color: "from-cyan-500 to-blue-500",
      bgGlow: "bg-cyan-500/20"
    },
    {
      id: 'ai_highlights',
      icon: Sparkles,
      title: "AI-gestützte Video-Highlights",
      description: "Automatische Generierung von Highlight-Clips aus längeren Videos durch KI, um die Teilbarkeit zu erhöhen.",
      status: "in-progress",
      color: "from-violet-500 to-purple-500",
      bgGlow: "bg-violet-500/20"
    },
    {
      id: 'creator_monetization',
      icon: DollarSign,
      title: "Erweiterte Creator-Monetarisierung",
      description: "Abonnements mit exklusivem Inhalt, Premium-Chats oder Merchandise-Integration direkt im Video-Player.",
      status: "planned",
      color: "from-emerald-500 to-teal-500",
      bgGlow: "bg-emerald-500/20"
    },
    {
      id: 'watch_party',
      icon: Video,
      title: "Watch Party-Funktion",
      description: "Ermöglichen Sie Nutzern, Videos gemeinsam in privaten Räumen anzusehen und dabei zu chatten oder per Videoanruf zu interagieren.",
      status: "planned",
      color: "from-pink-500 to-rose-500",
      bgGlow: "bg-pink-500/20"
    },
    {
      id: 'video_frames',
      icon: Wand2,
      title: "Dynamische Video-Rahmen und Effekte",
      description: "Mehr anpassbare Rahmen und visuelle Effekte, die Content-Ersteller für ihre Videos nutzen können, um ihre Markenidentität zu stärken.",
      status: "in-progress",
      color: "from-orange-500 to-amber-500",
      bgGlow: "bg-orange-500/20"
    }
  ];

  const { data: allVotes = [] } = useQuery({
    queryKey: ['featureVotes'],
    queryFn: () => base44.entities.FeatureVote.list('-created_date', 1000),
  });

  const { data: myVotes = [] } = useQuery({
    queryKey: ['myFeatureVotes', user?.username],
    queryFn: () => base44.entities.FeatureVote.filter({ user_username: user?.username }),
    enabled: !!user,
  });

  const voteMutation = useMutation({
    mutationFn: async ({ featureId, voteType }) => {
      if (!user) throw new Error('Not logged in');
      
      const existingVote = myVotes.find(v => v.feature_id === featureId);
      
      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          await base44.entities.FeatureVote.delete(existingVote.id);
          return { action: 'removed' };
        } else {
          await base44.entities.FeatureVote.update(existingVote.id, { vote_type: voteType });
          return { action: 'updated' };
        }
      } else {
        await base44.entities.FeatureVote.create({
          feature_id: featureId,
          user_username: user.username,
          vote_type: voteType,
        });
        return { action: 'created' };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featureVotes'] });
      queryClient.invalidateQueries({ queryKey: ['myFeatureVotes'] });
    },
  });

  const handleVote = (featureId, voteType) => {
    if (!user) {
      toast.error('Bitte melde dich an, um abzustimmen');
      return;
    }
    voteMutation.mutate({ featureId, voteType });
  };

  const getVoteCounts = (featureId) => {
    const votes = allVotes.filter(v => v.feature_id === featureId);
    const likes = votes.filter(v => v.vote_type === 'like').length;
    const dislikes = votes.filter(v => v.vote_type === 'dislike').length;
    return { likes, dislikes };
  };

  const getUserVote = (featureId) => {
    return myVotes.find(v => v.feature_id === featureId)?.vote_type;
  };

  const statusConfig = {
    'planned': {
      label: 'Geplant',
      icon: Calendar,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30'
    },
    'in-progress': {
      label: 'In Entwicklung',
      icon: Clock,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30'
    },
    'completed': {
      label: 'Fertig',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30'
    }
  };

  return (
    <PageMaintenanceCheck pageName="Roadmap">
    <div className="min-h-screen px-4 py-12 relative">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-cyan-500/20 mb-6">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-bold text-cyan-400">Zukunft von 7B Hub</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-white mb-6">
          Was kommt als Nächstes?
        </h1>
        
        <p className="text-xl text-white/60 max-w-3xl mx-auto">
          Entdecke die aufregenden Features, die wir für dich planen. 
          Deine Feedback hilft uns, die perfekte Plattform zu schaffen.
        </p>
      </motion.div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {features.map((feature, index) => {
          const StatusIcon = statusConfig[feature.status].icon;
          const FeatureIcon = feature.icon;
          
          const voteCounts = getVoteCounts(feature.id);
          const userVote = getUserVote(feature.id);

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative h-full p-6 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-[1.02] overflow-hidden">
                {/* Glow Effect */}
                <div className={`absolute top-0 right-0 w-32 h-32 ${feature.bgGlow} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Status Badge */}
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${statusConfig[feature.status].bgColor} border ${statusConfig[feature.status].borderColor} mb-4`}>
                  <StatusIcon className={`w-3 h-3 ${statusConfig[feature.status].color}`} />
                  <span className={`text-xs font-bold ${statusConfig[feature.status].color}`}>
                    {statusConfig[feature.status].label}
                  </span>
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <FeatureIcon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-black text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-violet-400 transition-all">
                  {feature.title}
                </h3>
                
                <p className="text-white/60 leading-relaxed mb-4">
                  {feature.description}
                </p>

                {/* Voting */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <button
                    onClick={() => handleVote(feature.id, 'like')}
                    disabled={voteMutation.isPending}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                      userVote === 'like'
                        ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                        : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${userVote === 'like' ? 'fill-current' : ''}`} />
                    <span className="font-bold text-sm">{voteCounts.likes}</span>
                  </button>
                  
                  <button
                    onClick={() => handleVote(feature.id, 'dislike')}
                    disabled={voteMutation.isPending}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                      userVote === 'dislike'
                        ? 'bg-red-500/20 border border-red-500/30 text-red-400'
                        : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <ThumbsDown className={`w-4 h-4 ${userVote === 'dislike' ? 'fill-current' : ''}`} />
                    <span className="font-bold text-sm">{voteCounts.dislikes}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="max-w-4xl mx-auto text-center"
      >
        <div className="p-10 rounded-3xl bg-gradient-to-br from-cyan-500/10 via-violet-500/10 to-pink-500/10 border border-white/10 backdrop-blur-xl">
          <Sparkles className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-3xl font-black text-white mb-4">
            Hast du Ideen?
          </h2>
          <p className="text-white/60 mb-6 max-w-2xl mx-auto">
            Wir hören auf unsere Community! Wenn du Vorschläge für neue Features hast, 
            lass es uns wissen. Gemeinsam machen wir 7B Hub noch besser.
          </p>
          <div 
            onClick={() => window.location.href = createPageUrl('Feedback')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-600 to-violet-600 text-white font-bold shadow-lg shadow-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-500/50 transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-5 h-5" />
            Feedback geben
          </div>
        </div>
      </motion.div>
    </div>
    </PageMaintenanceCheck>
  );
}