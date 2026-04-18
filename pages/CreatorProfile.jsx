import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Video, Heart, MessageCircle, Star, Shield, 
  Check, Bell, DollarSign, Award, ShoppingBag, ListMusic, Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createPageUrl } from '@/utils';
import AnimatedBackground from '@/components/streaming/AnimatedBackground';
import VideoCard from '@/components/streaming/VideoCard';
import UserAvatar from '@/components/UserAvatar';
import ProfileAnimation from '@/components/ProfileAnimation';
import ProfileBanner from '@/components/ProfileBanner';

export default function CreatorProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get('username');
  
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [followAnimating, setFollowAnimating] = useState(false);
  
  // Memberships & Donation State
  const [selectedTier, setSelectedTier] = useState(null);
  const [donateAmount, setDonateAmount] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('app_user');
    if (stored) setCurrentUser(JSON.parse(stored));
  }, []);

  // Fetch Creator Info (Merge with AppUser to get frame/badge)
  const { data: creatorInfo } = useQuery({
    queryKey: ['creatorInfo', username],
    queryFn: async () => {
      // Fetch CreatorInfo
      const cRes = await base44.entities.CreatorInfo.filter({ username }, 1);
      // Fetch AppUser for frame/badge
      const uRes = await base44.entities.AppUser.filter({ username }, 1);
      
      // Calculate followers count from Follow entity for accuracy
      const followers = await base44.entities.Follow.filter({ following_username: username }, '-created_date', 1000);
      
      const info = cRes[0] || { username, bio: 'Keine Bio verfügbar', avatar_url: null };
      const userData = uRes[0] || {};
      
      return { 
          ...info, 
          ...userData,
          followers_count: followers.length 
      }; 
    },
    enabled: !!username
  });

  // Fetch Videos
  const { data: videos = [] } = useQuery({
    queryKey: ['creatorVideos', username],
    queryFn: async () => {
      if (!username) return [];
      const vids = await base44.entities.Video.filter({ creator_name: username }, '-created_date', 100);
      return Array.isArray(vids) ? vids : [];
    },
    enabled: !!username
  });

  // Fetch Membership Tiers
  const { data: tiers = [] } = useQuery({
    queryKey: ['creatorTiers', username],
    queryFn: async () => {
      if (!username) return [];
      const t = await base44.entities.MembershipTier.filter({ creator_username: username }, 'price', 20);
      return Array.isArray(t) ? t : [];
    },
    enabled: !!username
  });

  // Fetch Creator Shop Items
  const { data: shopItems = [] } = useQuery({
    queryKey: ['creatorShopItems', username],
    queryFn: async () => {
      if (!username) return [];
      const items = await base44.entities.ShopItem.filter({ seller_username: username }, '-price', 50);
      return Array.isArray(items) ? items : [];
    },
    enabled: !!username
  });

  // Fetch Creator Playlists
  const { data: playlists = [] } = useQuery({
    queryKey: ['creatorPlaylists', username],
    queryFn: async () => {
      if (!username) return [];
      const pl = await base44.entities.Playlist.filter({ user_username: username, is_public: true }, '-created_date', 20);
      return Array.isArray(pl) ? pl : [];
    },
    enabled: !!username
  });

  // Check Follow Status
  const { data: isFollowing, refetch: refetchFollow } = useQuery({
    queryKey: ['isFollowing', username, currentUser?.username],
    queryFn: async () => {
      if (!currentUser || !currentUser.username) return false;
      const res = await base44.entities.Follow.filter({ 
        follower_username: currentUser.username, 
        following_username: username 
      }, 1);
      return Array.isArray(res) && res.length > 0;
    },
    enabled: !!currentUser?.username && !!username,
    staleTime: 0
  });

  // Check Bell Status
  const { data: bellEnabled, refetch: refetchBell } = useQuery({
    queryKey: ['bellEnabled', username, currentUser?.username],
    queryFn: async () => {
      if (!currentUser?.username) return false;
      const res = await base44.entities.CreatorNotification.filter({
        user_username: currentUser.username,
        creator_username: username
      }, 1);
      return res && res.length > 0;
    },
    enabled: !!currentUser?.username && !!username
  });

  // Bell Mutation
  const bellMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser?.username) {
        window.location.href = createPageUrl('SignIn');
        throw new Error("Not logged in");
      }

      const existing = await base44.entities.CreatorNotification.filter({
        user_username: currentUser.username,
        creator_username: username
      }, 1);

      if (existing.length > 0) {
        await base44.entities.CreatorNotification.delete(existing[0].id);
        return false;
      } else {
        await base44.entities.CreatorNotification.create({
          user_username: currentUser.username,
          creator_username: username,
          notify_videos: true,
          notify_shorts: true,
          notify_stories: true,
          notify_live: true
        });
        return true;
      }
    },
    onSuccess: () => {
      refetchBell();
    }
  });

  // Mutations
  const followMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) {
         localStorage.setItem('redirect_after_login', window.location.href);
         window.location.href = createPageUrl('SignIn');
         throw new Error("Redirecting to login");
      }
      
      // Trigger animation
      setFollowAnimating(true);
      setTimeout(() => setFollowAnimating(false), 600);
      
      const existing = await base44.entities.Follow.filter({ 
          follower_username: currentUser.username, 
          following_username: username 
      }, 1);
      
      if (existing.length > 0) {
        await base44.entities.Follow.delete(existing[0].id);
        return false;
      } else {
        await base44.entities.Follow.create({
            follower_username: currentUser.username, 
            following_username: username
        });
        
        if (username !== currentUser.username) {
            await base44.entities.Notification.create({
                user_id: username,
                type: 'system',
                message: `${currentUser.username} folgt dir jetzt!`,
                link: createPageUrl('CreatorProfile') + `?username=${currentUser.username}`
            }).catch(console.error);
        }
        return true;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isFollowing'] });
      queryClient.invalidateQueries({ queryKey: ['creatorInfo'] });
      refetchFollow();
    }
  });

  const joinMutation = useMutation({
    mutationFn: async (tier) => {
      if (!currentUser?.username) {
         window.location.href = createPageUrl('SignIn');
         throw new Error("Nicht eingeloggt");
      }
      
      // Check if already member
      const existing = await base44.entities.UserMembership.filter({
         user_username: currentUser.username,
         creator_username: username,
         status: 'active'
      }, 1);
      
      if (existing.length > 0) {
         throw new Error("Du bist bereits Mitglied!");
      }
      
      // Create Membership
      return await base44.entities.UserMembership.create({
        user_username: currentUser.username,
        creator_username: username,
        tier_id: tier.id,
        status: 'active'
      });
    },
    onSuccess: () => {
      alert(`🎉 Glückwunsch! Du bist jetzt offizielles Mitglied.`);
      queryClient.invalidateQueries(['membership']);
      queryClient.invalidateQueries(['creatorInfo']);
    },
    onError: (err) => {
      console.error("Membership error:", err);
      alert(err.message || "Fehler bei der Buchung. Bitte versuche es erneut.");
    }
  });

  if (!username) return (
     <div className="min-h-screen flex items-center justify-center text-white bg-[#050505]">
       <div className="text-center">
         <User className="w-16 h-16 mx-auto mb-4 text-white/20" />
         <h2 className="text-xl font-bold">Creator nicht gefunden</h2>
         <Button asChild className="mt-4" variant="outline"><Link to={createPageUrl('Home')}>Zurück</Link></Button>
       </div>
     </div>
  );

  return (
    <div className="min-h-screen text-white pb-20 bg-[#050505]">
      <ProfileAnimation animationType={creatorInfo?.active_animation} badgeType={creatorInfo?.active_badge} />
      {/* Colorful Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/10 blur-[150px] animate-pulse delay-700" />
      </div>
      
      {/* Animated Profile Banner */}
      <ProfileBanner bannerId={creatorInfo?.active_banner || 'none'} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative -mt-24 md:-mt-32 z-10">
        <div className="flex flex-col md:flex-row items-end md:items-center gap-6 mb-10">
          {/* Avatar with Frame */}
          <div className="relative">
             {creatorInfo ? (
               <UserAvatar user={creatorInfo} size="xl" className="w-32 h-32 md:w-48 md:h-48" />
             ) : (
               <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-white/10 animate-pulse" />
             )}
          </div>

          {/* Info */}
          <div className="flex-1 mb-2 md:mb-6">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight flex items-center gap-3 flex-wrap">
              {username}
              {creatorInfo?.active_title && creatorInfo.active_title !== 'none' && (
                <span className="text-sm md:text-base px-3 py-1 rounded-full bg-gradient-to-r from-fuchsia-500/20 to-cyan-500/20 text-fuchsia-300 border border-fuchsia-500/50 shadow-[0_0_15px_rgba(217,70,239,0.3)] backdrop-blur-md whitespace-nowrap">
                  {creatorInfo.active_title}
                </span>
              )}
              <Shield className="w-6 h-6 md:w-8 md:h-8 text-cyan-400 fill-cyan-400/20" />
            </h1>
            <p className="text-white/70 mt-3 text-lg max-w-2xl leading-relaxed">{creatorInfo?.bio}</p>
            <div className="flex flex-wrap gap-4 mt-4 text-sm font-medium text-white/50">
               <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {creatorInfo?.followers_count || 0} Follower</span>
               <span className="flex items-center gap-1.5"><Video className="w-4 h-4" /> {videos.length} Videos</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-row md:flex-col lg:flex-row gap-3 mb-2 md:mb-6 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
               <Button 
                 onClick={() => followMutation.mutate()}
                 disabled={followMutation.isPending}
                 size="lg"
                 className={`w-full md:w-40 rounded-full font-semibold transition-all ${
                    isFollowing 
                    ? 'bg-white/10 hover:bg-white/20 text-white' 
                    : 'bg-white text-black hover:bg-white/90 hover:scale-105 shadow-lg shadow-white/10'
                 }`}
               >
                 <motion.span
                    animate={followAnimating ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.4 }}
                 >
                    {isFollowing ? 'Gefolgt' : 'Folgen'}
                 </motion.span>
               </Button>
               
               {/* Follow Animation */}
               <AnimatePresence>
                  {followAnimating && !isFollowing && (
                     <>
                        {[...Array(8)].map((_, i) => (
                           <motion.div
                              key={i}
                              initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                              animate={{ 
                                 scale: 1,
                                 x: Math.cos((i / 8) * Math.PI * 2) * 60,
                                 y: Math.sin((i / 8) * Math.PI * 2) * 60,
                                 opacity: 0 
                              }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                              className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full pointer-events-none"
                              style={{ transform: 'translate(-50%, -50%)' }}
                           />
                        ))}
                     </>
                  )}
               </AnimatePresence>
            </div>
            
            <Button
              onClick={() => window.startVideoCall && window.startVideoCall(username)}
              size="lg"
              variant="outline"
              className="rounded-full bg-white/5 hover:bg-white/10 text-white border-white/10 md:w-14 w-12"
              title="Anrufen"
            >
              <Video className="w-5 h-5" />
            </Button>

            {isFollowing && (
              <Button
                onClick={() => bellMutation.mutate()}
                disabled={bellMutation.isPending}
                size="lg"
                className={`rounded-full font-semibold transition-all ${
                  bellEnabled
                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <Bell className={`w-5 h-5 ${bellEnabled ? 'fill-current' : ''}`} />
              </Button>
            )}
            {tiers.length > 0 && (
              <Button size="lg" className="flex-1 md:flex-none md:w-48 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-bold border-0 shadow-lg shadow-orange-500/20 hover:scale-105 transition-all">
                <Star className="w-5 h-5 mr-2 fill-black/20" />
                Mitglied werden
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="videos" className="space-y-8">
          <TabsList className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-1 rounded-xl w-full md:w-auto flex overflow-x-auto no-scrollbar shadow-xl">
            <TabsTrigger value="videos" className="flex-1 md:flex-none">Videos</TabsTrigger>
            <TabsTrigger value="playlists" className="flex-1 md:flex-none">Playlists</TabsTrigger>
            <TabsTrigger value="shop" className="flex-1 md:flex-none">Shop</TabsTrigger>
            <TabsTrigger value="membership" className="flex-1 md:flex-none">Mitgliedschaft</TabsTrigger>
            <TabsTrigger value="about" className="flex-1 md:flex-none">Über</TabsTrigger>
          </TabsList>

          <TabsContent value="videos">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map((video, idx) => (
                  <VideoCard key={video.id} video={video} index={idx} />
                ))}
             </div>
             {videos.length === 0 && (
               <div className="text-center py-20 text-white/30">Keine Videos vorhanden.</div>
             )}
          </TabsContent>

          <TabsContent value="playlists">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {playlists.map((pl, idx) => (
                   <Link key={pl.id} to={createPageUrl('PlaylistDetail') + `?id=${pl.id}`}>
                     <div className="group bg-white/[0.03] backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 hover:border-violet-500/50 transition-all shadow-lg">
                        <div className="aspect-square bg-white/5 relative">
                           <img src={pl.cover_url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                           <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center shadow-lg">
                                 <Play className="w-5 h-5 text-white ml-1" />
                              </div>
                           </div>
                        </div>
                        <div className="p-4">
                           <h3 className="font-bold text-lg truncate">{pl.title}</h3>
                           <p className="text-white/40 text-sm">Playlist</p>
                        </div>
                     </div>
                   </Link>
                ))}
             </div>
             {playlists.length === 0 && (
               <div className="text-center py-20 text-white/30">Keine Playlists vorhanden.</div>
             )}
          </TabsContent>

          <TabsContent value="shop">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {shopItems.map((item, idx) => (
                   <div key={item.id} className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden group hover:border-violet-500/50 transition-all shadow-lg">
                      <div className="aspect-square p-6 flex items-center justify-center bg-white/5">
                         <img src={item.image_url} className="w-full h-full object-contain drop-shadow-lg group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="p-4">
                         <h3 className="font-bold text-white mb-1">{item.name}</h3>
                         <div className="flex items-center justify-between mt-2">
                             <div className="flex items-center gap-1 text-amber-400 font-bold">
                                <span>{item.price}</span>
                                <DollarSign className="w-3 h-3" />
                             </div>
                             <Link to={createPageUrl('Shop')}>
                                <Button size="sm" variant="ghost" className="h-8 text-xs hover:bg-white/10">Zum Shop</Button>
                             </Link>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
             {shopItems.length === 0 && (
               <div className="text-center py-20 text-white/30">Dieser Creator bietet noch keine Items an.</div>
             )}
          </TabsContent>

          <TabsContent value="membership">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tiers.length > 0 ? tiers.map(tier => (
                <div key={tier.id} className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-6 flex flex-col hover:border-violet-500/50 transition-colors shadow-xl">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                    <div className="text-3xl font-bold text-amber-400 mt-2">{tier.price}€ <span className="text-sm text-white/50 font-normal">/Monat</span></div>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    <li className="flex gap-2 text-white/80">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>{tier.perks}</span>
                    </li>
                    <li className="flex gap-2 text-white/80">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>Exklusive Badges</span>
                    </li>
                  </ul>
                  <Button 
                    onClick={() => joinMutation.mutate(tier)}
                    disabled={joinMutation.isPending}
                    className="w-full bg-white/10 hover:bg-white/20 text-white"
                  >
                    {joinMutation.isPending ? 'Verarbeite...' : 'Beitreten'}
                  </Button>
                </div>
              )) : (
                <div className="col-span-3 text-center py-12 bg-white/5 rounded-2xl">
                   <Award className="w-12 h-12 text-white/20 mx-auto mb-4" />
                   <p className="text-white/50">Dieser Creator bietet noch keine Mitgliedschaften an.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="about">
             <div className="bg-white/[0.03] backdrop-blur-2xl rounded-2xl p-8 border border-white/10 shadow-xl">
               <h3 className="text-xl font-bold mb-4">Über {username}</h3>
               <p className="text-white/70 leading-relaxed whitespace-pre-wrap">{creatorInfo?.bio}</p>
             </div>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}