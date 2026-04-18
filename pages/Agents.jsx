import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { MessageCircle, Shield, Sparkles, Video, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageMaintenanceCheck from '@/components/PageMaintenanceCheck';

export default function Agents() {
  useEffect(() => {
    base44.auth.isAuthenticated().then((authed) => {
      if (!authed) base44.auth.redirectToLogin();
    });
  }, []);

  const agents = [
    {
      id: 'content_moderator',
      name: 'Moderations-Agent',
      icon: Shield,
      color: 'from-red-500 to-orange-500',
      description: 'Hilft bei der Moderation von Inhalten, überwacht Kommentare und erstellt Reports',
      features: [
        'Analysiert Kommentare und Posts',
        'Identifiziert unangemessene Inhalte',
        'Erstellt automatische Reports',
        'Schlägt Moderations-Aktionen vor'
      ]
    },
    {
      id: 'recommendation_assistant',
      name: 'Empfehlungs-Assistent',
      icon: Sparkles,
      color: 'from-cyan-500 to-violet-500',
      description: 'Gibt personalisierte Video-Empfehlungen basierend auf deinem Sehverhalten',
      features: [
        'Personalisierte Video-Empfehlungen',
        'Neue Inhalte von Favoriten',
        'Live-Stream Benachrichtigungen',
        'Playlist-Erstellung'
      ]
    },
    {
      id: 'creator_support',
      name: 'Creator-Support',
      icon: Video,
      color: 'from-violet-500 to-fuchsia-500',
      description: 'Unterstützt Creator bei Videos, Community-Management und Monetarisierung',
      features: [
        'Video-Performance Analyse',
        'Community Q&A Verwaltung',
        'Content-Optimierungs-Tipps',
        'Monetarisierungs-Support'
      ]
    }
  ];

  return (
    <PageMaintenanceCheck pageName="Agents">
    <div className="min-h-screen px-4 py-12 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 mb-6 shadow-2xl">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 mb-3">
            AI Agenten
          </h1>
          <p className="text-white/60 text-lg">Intelligente Assistenten für dein Streaming-Erlebnis</p>
        </div>

        <Tabs defaultValue="content_moderator" className="w-full">
          <div className="glass-card p-2 rounded-2xl mb-8">
            <TabsList className="grid w-full grid-cols-3 bg-transparent border-0 gap-2">
              <TabsTrigger 
                value="content_moderator" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-500 data-[state=active]:text-white rounded-xl"
              >
                <Shield className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Moderation</span>
              </TabsTrigger>
              <TabsTrigger 
                value="recommendation_assistant" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-violet-500 data-[state=active]:text-white rounded-xl"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Empfehlungen</span>
              </TabsTrigger>
              <TabsTrigger 
                value="creator_support" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white rounded-xl"
              >
                <Video className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Creator</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {agents.map((agent) => {
            const Icon = agent.icon;
            return (
              <TabsContent key={agent.id} value={agent.id}>
                <div className="relative group">
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${agent.color} rounded-3xl blur opacity-30 group-hover:opacity-50 transition-all`} />
                  
                  <div className="relative glass-card p-8 rounded-3xl">
                    <div className="flex items-start gap-6 mb-8">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${agent.color} flex items-center justify-center shadow-xl`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-3xl font-black text-white mb-2">{agent.name}</h2>
                        <p className="text-white/70 text-lg">{agent.description}</p>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="grid md:grid-cols-2 gap-3 mb-8">
                      {agent.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-400" />
                          <span className="text-white/80">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* WhatsApp Button */}
                    <div className="p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                            <MessageCircle className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-white font-bold text-lg">WhatsApp Assistent</h3>
                            <p className="text-white/60 text-sm">Chatte mit dem Agent über WhatsApp</p>
                          </div>
                        </div>
                        <a 
                          href={base44.agents.getWhatsAppConnectURL(agent.id)} 
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button className="bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Mit WhatsApp verbinden
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </Button>
                        </a>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                      <p className="text-sm text-blue-200/80">
                        💡 <strong>Tipp:</strong> Nach der Verbindung kannst du jederzeit mit dem Agent über WhatsApp chatten. 
                        Die Verbindung ist verschlüsselt und sicher.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </motion.div>
    </div>
    </PageMaintenanceCheck>
  );
}