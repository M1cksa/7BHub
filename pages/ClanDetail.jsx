import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Users, Crown, Shield, MessageSquare, ArrowLeft, UserPlus, Star, Target, Coins, TrendingUp, Send, LogOut, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import PageTransition from '@/components/mobile/PageTransition';
import { toast } from 'sonner';
import ClanTrainingGame from '@/components/clan/ClanTrainingGame';

export default function ClanDetail() {
  const params = new URLSearchParams(window.location.search);
  const clanId = params.get('id');

  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('app_user');
      return u && u !== "undefined" ? JSON.parse(u) : null;
    } catch { return null; }
  });

  const [donateAmount, setDonateAmount] = useState('');

  const queryClient = useQueryClient();

  const { data: clan, isLoading } = useQuery({
    queryKey: ['clan', clanId],
    queryFn: async () => {
      const clans = await base44.entities.Clan.filter({ id: clanId });
      return clans?.[0] || null;
    },
    enabled: !!clanId
  });

  const { data: members = [] } = useQuery({
    queryKey: ['clanMembers', clanId],
    queryFn: () => base44.entities.ClanMember.filter({ clan_id: clanId }),
    enabled: !!clanId,
    refetchInterval: 15000
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['clanMessages', clanId],
    queryFn: () => base44.entities.ClanMessage.filter({ clan_id: clanId }, 'created_date', 100),
    enabled: !!clanId,
    refetchInterval: 3000
  });

  const isMember = members.some(m => m.username === user?.username);
  const myRole = members.find(m => m.username === user?.username)?.role;
  
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const joinMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.ClanMember.create({
        clan_id: clanId,
        clan_name: clan.name,
        username: user.username,
        avatar_url: user.avatar_url || '',
        role: 'member',
        joined_date: new Date().toISOString()
      });
      await base44.entities.Clan.update(clanId, { members_count: (clan.members_count || 1) + 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clanMembers', clanId] });
      queryClient.invalidateQueries({ queryKey: ['clan', clanId] });
      toast.success('Clan beigetreten!');
    }
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      const myMembership = members.find(m => m.username === user.username);
      if (myMembership) {
        if (myMembership.role === 'owner' && members.length > 1) {
          throw new Error('Du bist der Besitzer. Bitte übertrage den Clan zuerst oder lösche ihn, wenn du der Letzte bist.');
        }
        await base44.entities.ClanMember.delete(myMembership.id);
        await base44.entities.Clan.update(clanId, { members_count: Math.max(0, (clan.members_count || 1) - 1) });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clanMembers', clanId] });
      queryClient.invalidateQueries({ queryKey: ['clan', clanId] });
      toast.success('Du hast den Clan verlassen');
    },
    onError: (err) => toast.error(err.message)
  });

  const kickMutation = useMutation({
    mutationFn: async (memberId) => {
      await base44.entities.ClanMember.delete(memberId);
      await base44.entities.Clan.update(clanId, { members_count: Math.max(0, (clan.members_count || 1) - 1) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clanMembers', clanId] });
      queryClient.invalidateQueries({ queryKey: ['clan', clanId] });
      toast.success('Mitglied entfernt');
    }
  });

  const sendMsgMutation = useMutation({
    mutationFn: async (e) => {
      e?.preventDefault();
      if (!chatInput.trim()) return;
      await base44.entities.ClanMessage.create({
        clan_id: clanId,
        content: chatInput.trim(),
        sender_username: user.username,
        sender_avatar: user.avatar_url || ''
      });
    },
    onSuccess: () => {
      setChatInput('');
      queryClient.invalidateQueries({ queryKey: ['clanMessages', clanId] });
    }
  });

  const donateMutation = useMutation({
    mutationFn: async (amount) => {
      if (!user || user.tokens < amount) throw new Error('Nicht genug Tokens');
      
      const newTokens = user.tokens - amount;
      let newDonated = (clan.donated_tokens || 0) + amount;
      let newMaxMembers = clan.max_members || 5;
      
      while (newDonated >= 1000000) {
        newDonated -= 1000000;
        newMaxMembers += 1;
      }

      await base44.entities.AppUser.update(user.id, { tokens: newTokens });
      await base44.entities.Clan.update(clanId, { 
        donated_tokens: newDonated,
        max_members: newMaxMembers
      });
      
      const updatedUser = { ...user, tokens: newTokens };
      localStorage.setItem('app_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.dispatchEvent(new Event('user-updated'));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clan', clanId] });
      setDonateAmount('');
      toast.success('Spende erfolgreich!');
    },
    onError: (error) => {
      toast.error(error.message || 'Fehler beim Spenden');
    }
  });

  const handleDonate = () => {
    const amount = parseInt(donateAmount);
    if (isNaN(amount) || amount <= 0) return toast.error('Ungültiger Betrag');
    donateMutation.mutate(amount);
  };

  const roleIcons = { owner: Crown, admin: Shield, member: Users };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!clan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-white/50 text-lg">Clan nicht gefunden</p>
        <Link to={createPageUrl('Clans')}><Button variant="outline">Zurück</Button></Link>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen pb-32 pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          <Link to={createPageUrl('Clans')} className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4" /> Zurück zu Clans
          </Link>

          {/* Super Banner */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="relative rounded-[2.5rem] mb-10 overflow-hidden border border-white/10 shadow-2xl"
          >
            {/* Background Image / Gradient */}
            <div className="absolute inset-0 z-0">
              {clan.banner_url ? (
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${clan.banner_url})` }} />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-black to-fuchsia-950" />
              )}
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-transparent to-transparent" />
            </div>

            <div className="relative z-10 p-8 sm:p-12 flex flex-col sm:flex-row items-center sm:items-end gap-8">
              {/* Logo */}
              <motion.div 
                initial={{ scale: 0.8, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring' }}
                className="relative group"
              >
                <div className="absolute -inset-2 bg-gradient-to-br from-cyan-400 to-violet-500 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
                {clan.logo_url ? (
                  <img src={clan.logo_url} alt={clan.name} className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl object-cover border-4 border-white/20 relative z-10 shadow-2xl" />
                ) : (
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center border-4 border-white/20 relative z-10 shadow-2xl">
                    <Shield className="w-16 h-16 text-white drop-shadow-md" />
                  </div>
                )}
              </motion.div>

              {/* Info */}
              <div className="text-center sm:text-left flex-1">
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 mb-2">
                  <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-lg">{clan.name}</h1>
                  {clan.tag && <span className="text-cyan-300 font-black text-xl tracking-widest bg-black/40 px-3 py-1 rounded-xl border border-white/10 mb-1">[{clan.tag}]</span>}
                </div>
                <p className="text-white/70 text-lg max-w-2xl mb-6">{clan.description || 'Ein geheimer Clan ohne Beschreibung'}</p>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                  <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                    <Users className="w-5 h-5 text-cyan-400" />
                    <span className="font-bold text-white">{clan.members_count || 0} / {clan.max_members || 5}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="font-bold text-white">Lvl {clan.level || 1}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <span className="font-bold text-white">{(clan.xp || 0).toLocaleString()} XP</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex-shrink-0 flex gap-3">
                {isMember && (
                  <Button 
                    variant="outline"
                    onClick={() => leaveMutation.mutate()} 
                    disabled={leaveMutation.isPending}
                    className="h-14 px-6 rounded-2xl border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold"
                  >
                    <LogOut className="w-5 h-5 mr-2" /> Verlassen
                  </Button>
                )}
                {!isMember && user && clan.is_recruiting !== false && (clan.members_count || 0) < (clan.max_members || 5) && (
                  <Button 
                    onClick={() => joinMutation.mutate()} 
                    disabled={joinMutation.isPending} 
                    className="h-14 px-8 rounded-2xl bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-lg font-black shadow-[0_0_30px_rgba(6,182,212,0.4)]"
                  >
                    <UserPlus className="w-6 h-6 mr-2" /> Beitreten
                  </Button>
                )}
                {!isMember && user && (clan.members_count || 0) >= (clan.max_members || 5) && (
                  <div className="text-red-400 text-base font-black bg-red-500/10 px-6 py-4 rounded-2xl border border-red-500/30">
                    Clan ist voll
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="space-y-8">
               {/* Clan Game */}
               <ClanTrainingGame clan={clan} user={user} isMember={isMember} />

               {/* Clan Quests */}
               <div className="glass-card rounded-2xl p-6 border border-white/10">
                 <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                   <Target className="w-5 h-5 text-cyan-400" /> Clan Quests
                 </h2>
                 <div className="space-y-4">
                    {[
                      { id: 1, title: 'Tokens sammeln', desc: 'Sammelt 100.000 Tokens', target: 100000, current: (clan.xp || 0) * 50 + 15000, reward: '10.000 XP' },
                      { id: 2, title: 'Boss Raid Siege', desc: 'Gewinnt 50 Boss Raids', target: 50, current: clan.level * 3, reward: 'Epic Clan Logo' },
                      { id: 3, title: 'Aktivität', desc: 'Spielt 200 Runden Neon Dash', target: 200, current: (clan.xp || 0) * 2 + 15, reward: '5.000 Tokens' }
                    ].map(quest => {
                      const pct = Math.min(100, (quest.current / quest.target) * 100);
                      return (
                        <div key={quest.id} className="bg-white/5 p-4 rounded-xl border border-white/10">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-bold text-white/90">{quest.title}</h3>
                              <p className="text-xs text-white/50">{quest.desc}</p>
                            </div>
                            <span className="text-[10px] font-black bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-md">{quest.reward}</span>
                          </div>
                          <div className="h-2 bg-black/50 rounded-full overflow-hidden mt-3 mb-1">
                            <div className="h-full bg-gradient-to-r from-cyan-500 to-violet-500" style={{ width: `${pct}%` }} />
                          </div>
                          <div className="text-[10px] text-right text-white/40">{Math.floor(Math.min(quest.current, quest.target)).toLocaleString()} / {quest.target.toLocaleString()}</div>
                        </div>
                      )
                    })}
                 </div>
               </div>

               {/* Donations */}
               {isMember && (
                 <div className="glass-card rounded-2xl p-6 border border-white/10">
                   <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                     <TrendingUp className="w-5 h-5 text-yellow-400" /> Clan-Plätze freischalten
                   </h2>
                   <p className="text-sm text-white/60 mb-4">
                     Spendet gemeinsam 1.000.000 Tokens, um einen weiteren Platz im Clan freizuschalten. Jeder Token zählt!
                   </p>
                   
                   <div className="bg-black/30 p-4 rounded-xl border border-white/5 mb-4">
                     <div className="flex justify-between text-xs mb-2">
                       <span className="text-white/50">Fortschritt für nächsten Platz (Limit: {clan.max_members || 5})</span>
                       <span className="text-yellow-400 font-bold">{(clan.donated_tokens || 0).toLocaleString()} / 1.000.000</span>
                     </div>
                     <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-yellow-500 transition-all" style={{ width: `${Math.min(100, ((clan.donated_tokens || 0) / 1000000) * 100)}%` }} />
                     </div>
                   </div>

                   <div className="flex gap-3">
                     <div className="relative flex-1">
                       <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500/50" />
                       <Input 
                         type="number" 
                         placeholder="Betrag..." 
                         value={donateAmount}
                         onChange={(e) => setDonateAmount(e.target.value)}
                         className="pl-9 bg-black/20"
                       />
                     </div>
                     <Button 
                       onClick={handleDonate} 
                       disabled={donateMutation.isPending || !donateAmount}
                       className="bg-yellow-500 hover:bg-yellow-400 text-black font-black"
                     >
                       Spenden
                     </Button>
                   </div>
                   <div className="text-xs text-white/40 mt-2 text-center">Deine Tokens: {user?.tokens?.toLocaleString() || 0}</div>
                 </div>
               )}
            </div>

            <div className="space-y-8">
              {/* Members */}
          <div className="glass-card rounded-2xl p-6 mb-8 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" /> Mitglieder ({members.length})
              </h2>
              <div className="bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full text-xs font-bold text-green-400 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {members.filter(m => m.last_seen && (new Date() - new Date(m.last_seen) < 3 * 60 * 1000)).length} Online
              </div>
            </div>
            <div className="space-y-3">
              {members.map(member => {
                const RoleIcon = roleIcons[member.role] || Users;
                const isOnline = member.last_seen && (new Date() - new Date(member.last_seen) < 3 * 60 * 1000);
                return (
                  <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition group">
                    <div className="relative">
                      {member.avatar_url ? (
                        <img src={member.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/50 font-bold">
                          {member.username?.[0]?.toUpperCase()}
                        </div>
                      )}
                      {isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0f172a] rounded-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold flex items-center gap-2">
                        {member.username} 
                        {member.username === user?.username && <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/60">Du</span>}
                        {isOnline && <span className="text-[10px] text-green-400">Online</span>}
                      </p>
                      <p className="text-white/40 text-xs capitalize">{member.role}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <RoleIcon className={`w-4 h-4 ${member.role === 'owner' ? 'text-yellow-400' : member.role === 'admin' ? 'text-cyan-400' : 'text-white/30'}`} />
                      {(myRole === 'owner' || myRole === 'admin') && member.username !== user.username && member.role !== 'owner' && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => kickMutation.mutate(member.id)}
                          className="w-8 h-8 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Messages */}
          {isMember && (
            <div className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col h-[600px]">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-cyan-400" /> Clan Chat
              </h2>
              
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar mb-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-white/30">
                    <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                    <p>Noch keine Nachrichten</p>
                    <p className="text-sm">Sei der Erste, der etwas schreibt!</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.sender_username === user?.username;
                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={msg.id} 
                        className={`flex gap-3 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex items-center justify-center text-white/50 text-xs font-bold shrink-0 mt-auto">
                          {msg.sender_avatar ? (
                            <img src={msg.sender_avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            msg.sender_username?.[0]?.toUpperCase()
                          )}
                        </div>
                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <span className="text-white/40 text-[10px] mb-1 px-1">
                            {msg.sender_username} • {new Date(msg.created_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                          <div className={`px-4 py-2 rounded-2xl text-sm ${isMe ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-white/10 text-white/90 rounded-bl-none'}`}>
                            {msg.content}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={sendMsgMutation.mutate} className="flex gap-2 flex-shrink-0">
                <Input 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Nachricht schreiben..."
                  className="bg-black/30 border-white/10 h-12 rounded-xl"
                  maxLength={500}
                />
                <Button 
                  type="submit" 
                  disabled={!chatInput.trim() || sendMsgMutation.isPending}
                  className="h-12 w-12 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </div>
          )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}