import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Send, Search, CheckCheck, User, ChevronRight, MessageSquare, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

export default function Messages() {
  const [user, setUser] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();
  const scrollRef = useRef(null);

  const loadUser = async () => {
    try {
       const stored = localStorage.getItem('app_user');
       if (!stored || stored === "undefined") return;
       const localUser = JSON.parse(stored);
       
       const dbUsers = await base44.entities.AppUser.list({ username: localUser.username }, 1);
       if (dbUsers.length > 0) {
           setUser(dbUsers[0]);
       } else {
           setUser(localUser);
       }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const { data: searchResults = [] } = useQuery({
    queryKey: ['userSearch', searchTerm],
    queryFn: async () => {
       const users = await base44.entities.AppUser.list('-created_date', 100); 
       const lowerTerm = searchTerm.toLowerCase();
       return users.filter(u => u.username && u.username.toLowerCase().includes(lowerTerm)).slice(0, 10);
    },
    enabled: searchTerm.length > 0
  });

  const { data: allMessages = [] } = useQuery({
    queryKey: ['messages', user?.username],
    queryFn: async () => {
      if (!user?.username) return [];
      const currentUsername = user.username;
      
      try {
          const recentMessages = await base44.entities.DirectMessage.list('-created_date', 1000);
          
          const filtered = recentMessages.filter(m => {
             const r = (m.receiver_username || '').toLowerCase();
             const s = (m.sender_username || '').toLowerCase();
             const c = currentUsername.toLowerCase();
             return r === c || s === c;
          });
          
          return filtered.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
      } catch (err) {
          console.error("Message fetch failed:", err);
          return [];
      }
    },
    enabled: !!user?.username,
    refetchInterval: 2000
  });

  const conversations = Array.from(new Set(allMessages.map(m => 
    m.sender_username === user.username ? m.receiver_username : m.sender_username
  )));

  const chatMessages = selectedChat 
    ? allMessages.filter(m => 
        (m.sender_username === user.username && m.receiver_username === selectedChat) ||
        (m.sender_username === selectedChat && m.receiver_username === user.username)
      )
    : [];

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!newMessage.trim() || !selectedChat) return;
      await base44.entities.DirectMessage.create({
        sender_username: user.username,
        receiver_username: selectedChat,
        content: newMessage,
        is_read: false
      });
    },
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries(['messages']);
    }
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  if (!user) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center mb-6 border border-cyan-500/20">
        <MessageSquare className="w-12 h-12 text-cyan-400" />
      </div>
      <h2 className="text-3xl font-black text-white mb-3">Nachrichten</h2>
      <p className="text-white/50 mb-8">
        Melde dich an, um Nachrichten zu senden
      </p>
      <Link to={createPageUrl('SignIn')}>
        <Button className="bg-gradient-to-r from-cyan-600 to-teal-600 rounded-full px-8 h-12 font-bold">
          Anmelden
        </Button>
      </Link>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-100px)] -mt-6 -mx-4 md:-mx-8">
       {/* Sidebar */}
       <div className={`w-full md:w-96 border-r border-white/10 flex flex-col bg-white/[0.02] backdrop-blur-2xl z-20 absolute md:relative h-full transition-transform duration-300 ${selectedChat ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
          <div className="p-6 border-b border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-lg">
             <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-600 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">Nachrichten</h2>
                    <span className="text-xs text-white/40 font-medium">{conversations.length} Konversationen</span>
                  </div>
                </div>
             </div>
             
             <div className="relative group">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-white/40 group-focus-within:text-cyan-400 transition-colors" />
                <Input 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   placeholder="Suchen..." 
                   className="pl-12 h-12 bg-white/[0.05] backdrop-blur-xl border-white/10 rounded-2xl text-white placeholder:text-white/30 focus:border-cyan-500/50 shadow-lg" 
                />
             </div>
          </div>

          <div className="flex-1 overflow-y-auto">
             {searchTerm.length > 1 ? (
                <div className="p-3 space-y-2">
                   <div className="px-4 py-2 text-xs font-bold text-white/30 uppercase tracking-wider">Ergebnisse</div>
                   {searchResults.map(u => (
                      <motion.div 
                         key={u.id}
                         initial={{ opacity: 0, x: -20 }}
                         animate={{ opacity: 1, x: 0 }}
                         onClick={() => { setSelectedChat(u.username); setSearchTerm(''); }}
                         className="p-4 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-all active:scale-95 border border-transparent hover:border-white/10"
                      >
                         <Avatar className="w-12 h-12 border border-white/10">
                            <AvatarImage src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} />
                            <AvatarFallback>{u.username[0]}</AvatarFallback>
                         </Avatar>
                         <div className="font-bold text-white">{u.username}</div>
                      </motion.div>
                   ))}
                </div>
             ) : (
                <div className="p-3 space-y-2">
                   {conversations.length === 0 && (
                      <div className="p-12 text-center text-white/40">
                        <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p className="font-medium">Keine Chats vorhanden</p>
                        <p className="text-xs mt-2">Suche nach Nutzern um zu chatten</p>
                      </div>
                   )}
                   {conversations.map(partner => {
                     const lastMsg = [...allMessages].reverse().find(m => 
                       m.sender_username === partner || m.receiver_username === partner
                     );
                     
                     return (
                       <motion.div 
                          key={partner}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          onClick={() => setSelectedChat(partner)}
                          className={`p-4 rounded-2xl flex items-center gap-3 cursor-pointer transition-all border ${
                             selectedChat === partner 
                                ? 'bg-gradient-to-r from-cyan-600/20 to-teal-600/20 backdrop-blur-xl border-cyan-500/40 shadow-lg shadow-cyan-500/20' 
                                : 'hover:bg-white/[0.05] backdrop-blur-xl hover:shadow-lg border-transparent hover:border-white/10 active:scale-95'
                          }`}
                       >
                          <Avatar className="w-14 h-14 border-2 border-white/10 shadow-lg">
                             <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${partner}`} />
                             <AvatarFallback>{partner[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-white mb-1">{partner}</div>
                            {lastMsg && (
                              <p className="text-xs text-white/50 truncate">{lastMsg.content}</p>
                            )}
                          </div>
                          <ChevronRight className="w-5 h-5 text-white/30" />
                       </motion.div>
                     );
                   })}
                </div>
             )}
          </div>
       </div>

       {/* Chat Area */}
       <div className={`flex-1 flex flex-col bg-[#0a0a0b] absolute md:relative w-full h-full transition-transform duration-300 ${selectedChat ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
          {selectedChat ? (
             <>
                <div className="h-20 border-b border-white/10 flex items-center px-6 bg-white/[0.03] backdrop-blur-2xl shadow-lg">
                   <Button variant="ghost" size="icon" className="md:hidden mr-2 -ml-2 text-white hover:bg-white/10" onClick={() => setSelectedChat(null)}>
                     <ChevronRight className="w-6 h-6 rotate-180" />
                   </Button>
                   <Avatar className="w-12 h-12 border-2 border-white/10 mr-4 shadow-lg">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedChat}`} />
                   </Avatar>
                   <h3 className="font-black text-xl text-white">{selectedChat}</h3>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4" ref={scrollRef}>
                   {chatMessages.map(msg => {
                      const isMe = msg.sender_username === user.username;
                      return (
                         <motion.div 
                            key={msg.id} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                         >
                            <div className={`max-w-[75%] rounded-3xl p-5 shadow-lg ${
                               isMe 
                                 ? 'bg-gradient-to-br from-cyan-600 to-teal-600 text-white rounded-tr-md' 
                                 : 'bg-white/[0.05] backdrop-blur-xl text-white rounded-tl-md border border-white/10'
                            }`}>
                               <p className="leading-relaxed">{msg.content}</p>
                               <div className="text-xs mt-2 opacity-60 flex items-center justify-end gap-1.5">
                                  {new Date(msg.created_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  {isMe && <CheckCheck className="w-3.5 h-3.5" />}
                                </div>
                            </div>
                         </motion.div>
                      );
                   })}
                </div>

                <div className="p-6 border-t border-white/10 bg-white/[0.02] backdrop-blur-2xl shadow-lg">
                   <form 
                      onSubmit={(e) => { e.preventDefault(); sendMessageMutation.mutate(); }}
                      className="flex gap-3"
                   >
                      <Input 
                         value={newMessage}
                         onChange={(e) => setNewMessage(e.target.value)}
                         placeholder="Nachricht schreiben..."
                         className="bg-white/5 border-white/10 rounded-2xl h-14 text-base placeholder:text-white/30 focus:border-cyan-500/50"
                      />
                      <Button 
                         type="submit" 
                         size="icon" 
                         disabled={!newMessage.trim()}
                         className="w-14 h-14 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 shadow-lg shadow-cyan-500/30"
                      >
                         <Send className="w-6 h-6" />
                      </Button>
                   </form>
                </div>
             </>
          ) : (
             <div className="flex-1 flex items-center justify-center text-white/30 flex-col gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-teal-500/10 flex items-center justify-center border border-cyan-500/20">
                    <MessageSquare className="w-12 h-12 text-cyan-400/50" />
                  </div>
                  <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-cyan-600 to-teal-600 blur-2xl opacity-20 -z-10" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-black text-white/60 mb-2">Wähle einen Chat</h3>
                  <p className="text-sm text-white/40">Oder suche nach Nutzern um zu schreiben</p>
                </div>
             </div>
          )}
       </div>
    </div>
  );
}