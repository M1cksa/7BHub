import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  MessageSquare, Plus, Search, MessageCircle, Clock, 
  Gamepad2, Cpu, Film, HelpCircle, Hash, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

// Icon mapping
const iconMap = {
  Gamepad2: Gamepad2,
  Cpu: Cpu,
  Film: Film,
  HelpCircle: HelpCircle
};

export default function Forum() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newThread, setNewThread] = useState({ title: '', content: '', category_id: '' });
  const queryClient = useQueryClient();
  const user = JSON.parse(localStorage.getItem('app_user') || 'null');

  // Fetch Categories
  const { data: categories = [] } = useQuery({
    queryKey: ['forumCategories'],
    queryFn: () => base44.entities.ForumCategory.list('order', 20),
  });

  // Fetch Threads
  const { data: threads = [] } = useQuery({
    queryKey: ['forumThreads', selectedCategory],
    queryFn: async () => {
      const filter = selectedCategory !== 'all' ? { category_id: selectedCategory } : {};
      return base44.entities.ForumThread.list(filter, '-created_date', 50);
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user) return alert("Bitte einloggen.");
      await base44.entities.ForumThread.create({
        ...newThread,
        author_username: user.username,
        author_avatar: user.avatar_url,
        views: 0,
        replies_count: 0
      });
    },
    onSuccess: () => {
      setIsCreateOpen(false);
      setNewThread({ title: '', content: '', category_id: '' });
      queryClient.invalidateQueries(['forumThreads']);
    }
  });

  const getCategoryColor = (catId) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.color : 'bg-gray-500';
  };

  const getCategoryName = (catId) => {
     const cat = categories.find(c => c.id === catId);
     return cat ? cat.name : 'Allgemein';
  };

  return (
    <div className="min-h-screen text-white pt-24 pb-20 bg-[#050505] relative overflow-hidden">
      {/* Ambient background */}
      
      {/* Ambient Glows */}
      <div className="fixed top-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[150px] animate-pulse pointer-events-none" />
      <div className="fixed bottom-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[150px] animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        {/* Hero Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div className="space-y-4">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-5 py-2.5 shadow-2xl"
            >
              <MessageSquare className="w-5 h-5 text-violet-400" />
              <span className="text-sm font-bold text-white/70">Diskutiere & Vernetze dich</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 drop-shadow-2xl">
                Community Forum
              </span>
            </h1>
            <p className="text-white/50 text-xl md:text-2xl font-medium max-w-2xl">
              Tausche dich aus, stelle Fragen und werde Teil der Conversation 💬
            </p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-2xl px-8 h-14 font-bold shadow-2xl shadow-violet-500/30 border border-violet-400/20 active:scale-95 md:hover:scale-105 transition-all">
                <Plus className="w-5 h-5 mr-2" />
                Neuer Beitrag
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1a1a1c] border-white/10 text-white sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Neuen Beitrag erstellen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Input 
                  placeholder="Titel deiner Diskussion" 
                  className="bg-black/40 border-white/10 h-12 text-lg font-medium"
                  value={newThread.title}
                  onChange={e => setNewThread({...newThread, title: e.target.value})}
                />
                <Select 
                  value={newThread.category_id} 
                  onValueChange={val => setNewThread({...newThread, category_id: val})}
                >
                  <SelectTrigger className="bg-black/40 border-white/10">
                    <SelectValue placeholder="Kategorie wählen" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1c] border-white/10 text-white">
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea 
                  placeholder="Worum geht es?" 
                  className="bg-black/40 border-white/10 min-h-[150px] resize-none"
                  value={newThread.content}
                  onChange={e => setNewThread({...newThread, content: e.target.value})}
                />
                <Button 
                  onClick={() => createMutation.mutate()} 
                  disabled={!newThread.title || !newThread.category_id || createMutation.isPending}
                  className="w-full bg-violet-600 hover:bg-violet-500"
                >
                  {createMutation.isPending ? 'Veröffentliche...' : 'Veröffentlichen'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <motion.div 
             onClick={() => setSelectedCategory('all')}
             whileHover={{ y: -8, scale: 1.02 }}
             whileTap={{ scale: 0.98 }}
             className={`group relative p-8 rounded-3xl cursor-pointer transition-all backdrop-blur-xl ${
               selectedCategory === 'all' 
                 ? 'bg-white/10 border-2 border-white/30 shadow-2xl shadow-violet-500/20' 
                 : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
             }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-gray-600/20 to-slate-800/20 rounded-3xl blur-xl transition-opacity ${selectedCategory === 'all' ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
            
            <div className="relative">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700 to-gray-900 flex items-center justify-center mb-5 shadow-xl transition-transform ${selectedCategory === 'all' ? 'scale-110' : 'group-hover:scale-110'}`}>
                 <Hash className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-black text-xl mb-2 text-white">Alle Themen</h3>
              <p className="text-white/50 text-sm leading-relaxed">Zeige alle Diskussionen</p>
            </div>
          </motion.div>

          {categories.map(cat => {
            const Icon = iconMap[cat.icon] || MessageSquare;
            return (
              <motion.div 
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`group relative p-8 rounded-3xl cursor-pointer transition-all backdrop-blur-xl ${
                  selectedCategory === cat.id 
                    ? 'bg-white/10 border-2 border-white/30 shadow-2xl' 
                    : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                {selectedCategory === cat.id && (
                  <div className="absolute -inset-1 bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 rounded-3xl blur-xl" />
                )}
                
                <div className="relative">
                  <div className={`w-16 h-16 rounded-2xl ${cat.color} flex items-center justify-center mb-5 shadow-xl transition-transform ${selectedCategory === cat.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                     <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-black text-xl mb-2 text-white">{cat.name}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{cat.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Threads List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl md:text-4xl font-black flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-xl shadow-violet-500/30">
                 <MessageCircle className="w-6 h-6 text-white" />
               </div>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                 {selectedCategory === 'all' ? 'Neueste Diskussionen' : `${getCategoryName(selectedCategory)}`}
               </span>
            </h2>
          </div>

          <div className="grid gap-4">
            {threads.length === 0 ? (
               <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
                 <p className="text-white/30 text-lg">Noch keine Beiträge in dieser Kategorie.</p>
                 <Button variant="link" onClick={() => setIsCreateOpen(true)} className="text-violet-400">
                   Sei der Erste!
                 </Button>
               </div>
            ) : (
               threads.map((thread, i) => (
                 <Link to={createPageUrl('ForumThread') + `?id=${thread.id}`} key={thread.id}>
                   <motion.div 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.05 }}
                     whileHover={{ y: -4, scale: 1.01 }}
                     className="group relative p-6 md:p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/20 transition-all flex items-center gap-6"
                   >
                     {/* Author Avatar with Frame (Placeholder logic for now) */}
                     <div className="hidden sm:block">
                        <div className="w-12 h-12 rounded-full bg-black/50 overflow-hidden ring-2 ring-white/10">
                          <img src={thread.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${thread.author_username}`} className="w-full h-full object-cover" />
                        </div>
                     </div>

                     <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-3 mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white/90 uppercase tracking-wider ${getCategoryColor(thread.category_id)}`}>
                            {getCategoryName(thread.category_id)}
                          </span>
                          <span className="text-white/40 text-xs">
                             von <span className="text-white/60 font-medium">{thread.author_username}</span> • {format(new Date(thread.created_date), 'd. MMM', { locale: de })}
                          </span>
                       </div>
                       <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors truncate">
                         {thread.title}
                       </h3>
                       <p className="text-white/50 text-sm truncate mt-1">
                         {thread.content}
                       </p>
                     </div>

                     <div className="flex items-center gap-6 text-white/40 text-sm">
                        <div className="flex items-center gap-1.5">
                           <Clock className="w-4 h-4" />
                           <span className="hidden sm:inline">Aktuell</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                           <MessageSquare className="w-4 h-4" />
                           <span>{thread.replies_count}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
                     </div>
                   </motion.div>
                 </Link>
               ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}