import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Search, TrendingUp, Crown, Shield, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ClanCard from '@/components/clan/ClanCard';
import CreateClanDialog from '@/components/clan/CreateClanDialog';
import ClanTutorial from '@/components/clan/ClanTutorial';
import PageTransition from '@/components/mobile/PageTransition';

export default function Clans() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('app_user');
    const u = stored && stored !== 'undefined' ? JSON.parse(stored) : null;
    // Zeige Tutorial nur wenn weder in AppUser noch localStorage als gesehen markiert
    if (!u?.clan_tutorial_seen && !localStorage.getItem('clan_tutorial_seen')) {
      setShowTutorial(true);
    }
  }, []);

  const handleTutorialComplete = async () => {
    localStorage.setItem('clan_tutorial_seen', 'true');
    setShowTutorial(false);
    // Persistiere in AppUser für geräteübergreifende Einmaligkeit
    try {
      const stored = localStorage.getItem('app_user');
      const u = stored && stored !== 'undefined' ? JSON.parse(stored) : null;
      if (u?.id) {
        const updated = await base44.entities.AppUser.update(u.id, { clan_tutorial_seen: true });
        localStorage.setItem('app_user', JSON.stringify(updated));
      }
    } catch {}
  };

  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('app_user');
      return u && u !== "undefined" ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  const { data: clans = [], isLoading } = useQuery({
    queryKey: ['clans'],
    queryFn: async () => {
      try {
        return await base44.entities.Clan.list('-members_count', 50);
      } catch (error) {
        console.error('Clans fetch error:', error);
        return [];
      }
    }
  });

  const { data: myMembership } = useQuery({
    queryKey: ['myMembership', user?.username],
    queryFn: async () => {
      try {
        return await base44.entities.ClanMember.filter({ username: user.username });
      } catch (error) {
        console.error('Membership fetch error:', error);
        return [];
      }
    },
    enabled: !!user
  });

  const myClan = myMembership?.[0];

  const filteredClans = clans.filter(clan =>
    clan.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    clan.tag?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    clan.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageTransition>
      <div className="min-h-screen pb-32 pt-24 px-4">
        <div className="max-w-7xl mx-auto">
          {showTutorial && <ClanTutorial onComplete={handleTutorialComplete} />}

          {/* Hero Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-[2rem] overflow-hidden mb-12 bg-black border border-white/10"
          >
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/80 to-[#0a0a0b]" />
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/40 to-violet-900/40 mix-blend-overlay" />
            </div>

            <div className="relative z-10 px-6 py-16 sm:py-20 text-center flex flex-col items-center">
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}
                className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.4)] mb-6 border-2 border-white/20"
              >
                <Shield className="w-10 h-10 text-white drop-shadow-lg" />
              </motion.div>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-violet-300 mb-4 tracking-tight drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                Clans
              </h1>
              <p className="text-white/70 text-lg sm:text-xl max-w-2xl font-medium mb-8">
                Gründe eine Legende oder trete einer bei. Kämpft gemeinsam in Raids, erfüllt Quests und schaltet epische Belohnungen frei!
              </p>
              
              {!myClan && (
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="h-14 px-8 rounded-2xl bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-lg font-black shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] transition-all hover:-translate-y-1"
                >
                  <Plus className="w-5 h-5 mr-2" /> Clan gründen
                </Button>
              )}
            </div>
          </motion.div>

          {/* My Clan Banner */}
          {myClan && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-400/30"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Crown className="w-8 h-8 text-yellow-400" />
                  <div>
                    <p className="text-white/60 text-sm">Dein Clan</p>
                    <p className="text-white font-black text-xl">{myClan.clan_name}</p>
                  </div>
                </div>
                <Button
                  onClick={() => window.location.href = `/ClanDetail?id=${myClan.clan_id}`}
                  variant="outline"
                >
                  Zum Clan
                </Button>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Clans durchsuchen..."
                className="pl-12"
              />
            </div>
            {!myClan && (
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="gap-2"
              >
                <Plus className="w-5 h-5" />
                Clan erstellen
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-black/40 rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-colors" />
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4 border border-cyan-500/20">
                <Shield className="w-6 h-6 text-cyan-400" />
              </div>
              <p className="text-white/50 text-sm font-bold uppercase tracking-wider mb-1">Aktive Clans</p>
              <p className="text-white font-black text-3xl">{clans.length}</p>
            </div>
            
            <div className="bg-black/40 rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-colors" />
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4 border border-violet-500/20">
                <Users className="w-6 h-6 text-violet-400" />
              </div>
              <p className="text-white/50 text-sm font-bold uppercase tracking-wider mb-1">Spieler</p>
              <p className="text-white font-black text-3xl">{clans.reduce((sum, c) => sum + c.members_count, 0)}</p>
            </div>
            
            <div className="bg-black/40 rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl group-hover:bg-yellow-500/20 transition-colors" />
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-4 border border-yellow-500/20">
                <Crown className="w-6 h-6 text-yellow-400" />
              </div>
              <p className="text-white/50 text-sm font-bold uppercase tracking-wider mb-1">Elite (Lvl 5+)</p>
              <p className="text-white font-black text-3xl">{clans.filter(c => c.level >= 5).length}</p>
            </div>

            <div className="bg-black/40 rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
                <Star className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-white/50 text-sm font-bold uppercase tracking-wider mb-1">Neu Rekruten</p>
              <p className="text-white font-black text-3xl">{clans.filter(c => c.is_recruiting).length}</p>
            </div>
          </div>

          {/* Clans Grid */}
          {isLoading ? (
            <div className="text-center py-20">
              <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClans.map((clan) => (
                  <ClanCard key={clan.id} clan={clan} />
                ))}
              </div>

              {filteredClans.length === 0 && !isLoading && (
                <div className="text-center py-20">
                  <p className="text-white/40">
                    {searchQuery ? 'Keine Clans gefunden' : 'Noch keine Clans erstellt. Sei der Erste!'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <CreateClanDialog
          isOpen={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          user={user}
        />
      </div>
    </PageTransition>
  );
}