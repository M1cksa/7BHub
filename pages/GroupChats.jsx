import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Users, Plus, Send, Globe, Lock, Crown, Loader2, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import AnimatedBackground from '@/components/streaming/AnimatedBackground';

export default function GroupChats() {
  const [user, setUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [message, setMessage] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', is_public: true, target_audience: 'all' });
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const stored = localStorage.getItem('app_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const { data: dbUser } = useQuery({
    queryKey: ['currentUser', user?.id],
    queryFn: () => base44.entities.AppUser.get(user.id),
    enabled: !!user?.id,
  });
  
  const currentUser = dbUser || user;

  const { data: groups = [] } = useQuery({
    queryKey: ['groupChats'],
    queryFn: () => base44.entities.GroupChat.list('-created_date', 50)
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['groupMessages', selectedGroup?.id],
    queryFn: () => base44.entities.GroupChatMessage.filter({ group_id: selectedGroup.id }, '-created_date', 100),
    enabled: !!selectedGroup,
    refetchInterval: 2000
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data) => {
      const group = await base44.entities.GroupChat.create({
        ...data,
        owner_username: currentUser.username,
        avatar_url: `https://api.dicebear.com/7.x/shapes/svg?seed=${data.name}`
      });
      await base44.entities.GroupChatMember.create({
        group_id: group.id,
        username: currentUser.username,
        role: 'admin'
      });
      return group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['groupChats']);
      setCreateOpen(false);
      setNewGroup({ name: '', description: '', is_public: true, target_audience: 'all' });
    }
  });

  const joinGroupMutation = useMutation({
    mutationFn: async (groupId) => {
      await base44.entities.GroupChatMember.create({
        group_id: groupId,
        username: currentUser.username,
        role: 'member'
      });
      const group = groups.find(g => g.id === groupId);
      await base44.entities.GroupChat.update(groupId, {
        member_count: (group.member_count || 0) + 1
      });
    },
    onSuccess: () => queryClient.invalidateQueries(['groupChats'])
  });

  const sendMessageMutation = useMutation({
    mutationFn: (msg) => base44.entities.GroupChatMessage.create({
      group_id: selectedGroup.id,
      sender_username: currentUser.username,
      sender_avatar: currentUser.avatar_url,
      content: msg
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['groupMessages']);
      setMessage('');
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-white">
        <p>Bitte einloggen</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[999] bg-[#0a0a0b] text-white overflow-y-auto overflow-x-hidden selection:bg-violet-500/30">
      <div className="absolute top-6 left-6 z-50">
        <Link to={createPageUrl('Home')}>
          <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10 rounded-full">
            <ChevronLeft className="w-5 h-5 mr-1" /> Zurück
          </Button>
        </Link>
      </div>
      <div className="fixed inset-0 pointer-events-none">
        <AnimatedBackground />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 pt-28 pb-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black mb-2">Gruppen-Chats</h1>
            <p className="text-white/40">Community & Themen-Räume</p>
          </div>
          
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-violet-600 hover:bg-violet-500">
                <Plus className="w-5 h-5 mr-2" /> Neue Gruppe
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1a1a1c] border-white/10 text-white">
              <DialogHeader>
                <DialogTitle>Gruppe erstellen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Gruppenname</Label>
                  <Input 
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                    className="bg-black/20 border-white/10"
                    placeholder="z.B. Gaming Squad"
                  />
                </div>
                <div>
                  <Label>Beschreibung</Label>
                  <Textarea 
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                    className="bg-black/20 border-white/10"
                    placeholder="Worum geht's?"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Öffentlich</Label>
                  <Switch 
                    checked={newGroup.is_public}
                    onCheckedChange={(c) => setNewGroup({...newGroup, is_public: c})}
                  />
                </div>
                <div>
                  <Label>Zielgruppe</Label>
                  <select
                    value={newGroup.target_audience}
                    onChange={(e) => setNewGroup({...newGroup, target_audience: e.target.value})}
                    className="w-full mt-1 bg-black/20 border border-white/10 rounded-md p-2 text-sm text-white"
                  >
                    <option value="all">Alle</option>
                    {(currentUser?.role === 'admin' || currentUser?.audience_group === 'boy') && (
                      <option value="boy">Nur Boys</option>
                    )}
                    {(currentUser?.role === 'admin' || currentUser?.audience_group === 'girl') && (
                      <option value="girl">Nur Girls</option>
                    )}
                    {currentUser?.role === 'admin' && (
                      <option value="mixed">Mixed</option>
                    )}
                  </select>
                </div>
                <Button 
                  onClick={() => createGroupMutation.mutate(newGroup)}
                  disabled={!newGroup.name || createGroupMutation.isPending}
                  className="w-full bg-violet-600 hover:bg-violet-500"
                >
                  {createGroupMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Erstellen'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Groups List */}
          <div className="lg:col-span-1 bg-[#151517] rounded-2xl border border-white/5 p-4 h-[600px] overflow-y-auto">
            <h3 className="font-bold mb-4 text-white/60 uppercase text-xs">Verfügbare Gruppen</h3>
            <div className="space-y-2">
              {groups.filter(group => {
                if (currentUser?.role === 'admin') return true;
                const audience = group.target_audience || 'all';
                if (audience === 'all') return true;
                return audience === currentUser?.audience_group;
              }).map((group) => (
                <motion.button
                  key={group.id}
                  onClick={() => setSelectedGroup(group)}
                  whileHover={{ scale: 1.02 }}
                  className={`w-full p-3 rounded-xl text-left transition-all ${
                    selectedGroup?.id === group.id 
                      ? 'bg-violet-600' 
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src={group.avatar_url} className="w-10 h-10 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold truncate">{group.name}</h4>
                        {group.is_public ? <Globe className="w-3 h-3 text-green-400" /> : <Lock className="w-3 h-3 text-amber-400" />}
                      </div>
                      <p className="text-xs text-white/40">{group.member_count || 0} Mitglieder</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-[#151517] rounded-2xl border border-white/5 flex flex-col h-[600px]">
            {selectedGroup && (
              currentUser?.role === 'admin' ||
              !selectedGroup.target_audience ||
              selectedGroup.target_audience === 'all' ||
              selectedGroup.target_audience === currentUser?.audience_group
            ) ? (
              <>
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={selectedGroup.avatar_url} className="w-10 h-10 rounded-full" />
                    <div>
                      <h3 className="font-bold">{selectedGroup.name}</h3>
                      <p className="text-xs text-white/40">{selectedGroup.description}</p>
                    </div>
                  </div>
                  {selectedGroup.owner_username === currentUser.username && (
                    <Crown className="w-5 h-5 text-amber-400" />
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3"
                    >
                      <img src={msg.sender_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender_username}`} className="w-8 h-8 rounded-full" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm">{msg.sender_username}</span>
                          <span className="text-xs text-white/30">{new Date(msg.created_date).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-white/80 text-sm">{msg.content}</p>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-white/5">
                  <div className="flex gap-2">
                    <Input 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && message && sendMessageMutation.mutate(message)}
                      placeholder="Nachricht schreiben..."
                      className="bg-black/20 border-white/10"
                    />
                    <Button 
                      onClick={() => message && sendMessageMutation.mutate(message)}
                      disabled={!message || sendMessageMutation.isPending}
                      size="icon"
                      className="bg-violet-600 hover:bg-violet-500"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-white/30">
                <div className="text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>Wähle eine Gruppe aus</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}