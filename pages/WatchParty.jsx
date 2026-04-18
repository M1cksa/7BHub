import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Play, Pause, Volume2, Send, Copy, Check, User, Crown, LogOut, MessageCircle, Video } from 'lucide-react';
import { toast } from 'sonner';
import VideoCallPanel from '@/components/watchparty/VideoCallPanel';
import VideoFrameWrapper from '@/components/VideoFrameWrapper';

export default function WatchParty() {
  const [searchParams] = useSearchParams();
  const partyId = searchParams.get('id');
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('app_user');
    if (stored && stored !== "undefined") {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {}
    } else {
      window.location.href = createPageUrl('SignIn');
    }
  }, []);

  // Fetch party details
  const { data: party } = useQuery({
    queryKey: ['watchParty', partyId],
    queryFn: () => base44.entities.WatchParty.filter({ id: partyId }).then(p => p[0]),
    enabled: !!partyId,
    refetchInterval: 2000,
  });

  // Fetch video details
  const { data: video } = useQuery({
    queryKey: ['video', party?.video_id],
    queryFn: () => base44.entities.Video.filter({ id: party.video_id }).then(v => v[0]),
    enabled: !!party?.video_id,
  });

  // Fetch messages
  const { data: messages = [] } = useQuery({
    queryKey: ['partyMessages', partyId],
    queryFn: () => base44.entities.WatchPartyMessage.filter({ party_id: partyId }, '-created_date', 100),
    enabled: !!partyId,
    refetchInterval: 1500,
  });

  // Update video sync
  useEffect(() => {
    if (!party || !videoRef.current || isSyncing) return;

    const video = videoRef.current;
    const timeDiff = Math.abs(video.currentTime - (party.current_time || 0));

    if (timeDiff > 2 && party.is_playing) {
      setIsSyncing(true);
      video.currentTime = party.current_time;
      video.play().catch(() => {});
      setTimeout(() => setIsSyncing(false), 1000);
    }

    if (party.is_playing && video.paused) {
      video.play().catch(() => {});
    } else if (!party.is_playing && !video.paused) {
      video.pause();
    }
  }, [party?.current_time, party?.is_playing, isSyncing]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (text) => {
      return base44.entities.WatchPartyMessage.create({
        party_id: partyId,
        sender_username: user.username,
        sender_avatar: user.avatar_url,
        content: text,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['partyMessages', partyId]);
      setMessage('');
    },
  });

  // Control mutations (host only)
  const controlMutation = useMutation({
    mutationFn: async ({ action, value }) => {
      const updates = {};
      if (action === 'play') updates.is_playing = true;
      if (action === 'pause') updates.is_playing = false;
      if (action === 'seek') updates.current_time = value;
      return base44.entities.WatchParty.update(partyId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['watchParty', partyId]);
    },
  });

  // Leave party
  const leaveMutation = useMutation({
    mutationFn: async () => {
      const participants = party.participants.filter(p => p !== user.username);
      await base44.entities.WatchParty.update(partyId, { participants });
    },
    onSuccess: () => {
      navigate(createPageUrl('Home'));
      toast.success('Watch Party verlassen');
    },
  });

  // End party (host only)
  const endPartyMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.WatchParty.update(partyId, { status: 'ended' });
    },
    onSuccess: () => {
      navigate(createPageUrl('Home'));
      toast.success('Watch Party beendet');
    },
  });

  const handleVideoControl = (action, value) => {
    if (user?.username !== party?.host_username) {
      toast.error('Nur der Host kann das Video steuern');
      return;
    }
    controlMutation.mutate({ action, value });
  };

  const handleShare = () => {
    const url = `${window.location.origin}${createPageUrl('WatchParty')}?id=${partyId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link kopiert!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!party || !video) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Watch Party wird geladen...</p>
        </div>
      </div>
    );
  }

  const isHost = user?.username === party.host_username;

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white mb-1">{party.name}</h1>
            <p className="text-white/60 text-sm flex items-center gap-2">
              <Users className="w-4 h-4" />
              {party.participants?.length || 0} Teilnehmer
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleShare}
              variant="outline"
              className="gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              Link teilen
            </Button>
            {isHost ? (
              <Button
                onClick={() => {
                  if (confirm('Möchtest du diese Watch Party wirklich für alle beenden?')) {
                    endPartyMutation.mutate();
                  }
                }}
                variant="destructive"
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Party beenden
              </Button>
            ) : (
              <Button
                onClick={() => leaveMutation.mutate()}
                variant="destructive"
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Verlassen
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          {/* Video Player */}
          <div className="space-y-4">
            <VideoFrameWrapper frameId={video?.video_frame || 'none'}>
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden">
              {isSyncing && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-white text-sm">Synchronisiere...</p>
                  </div>
                </div>
              )}
              <video
                ref={videoRef}
                src={video.video_url}
                className="w-full h-full"
                onPlay={() => isHost && handleVideoControl('play')}
                onPause={() => isHost && handleVideoControl('pause')}
                onSeeked={(e) => isHost && handleVideoControl('seek', e.target.currentTime)}
                controls={isHost}
              />
              {!isHost && (
                <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span className="text-white/80 text-sm">
                    {party.host_username} steuert die Wiedergabe
                  </span>
                </div>
              )}
            </div>
            </VideoFrameWrapper>

            {/* Video Info */}
            <div className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10">
              <h2 className="text-xl font-bold text-white mb-2">{video.title}</h2>
              <p className="text-white/60 text-sm">{video.description}</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Video Call Panel */}
            <VideoCallPanel 
              partyId={partyId}
              username={user?.username}
              participants={party.participants || []}
            />

            {/* Participants */}
            <div className="p-4 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                Teilnehmer ({party.participants?.length || 0})
              </h3>
              <div className="space-y-2">
                {party.participants?.map((username, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center">
                      <span className="text-white font-bold">{username[0].toUpperCase()}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">{username}</p>
                      {username === party.host_username && (
                        <span className="text-yellow-400 text-xs flex items-center gap-1">
                          <Crown className="w-3 h-3" /> Host
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Chat */}
            <div className="p-4 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-violet-400" />
                Chat
              </h3>
              
              <div className="space-y-3 mb-4 h-[400px] overflow-y-auto hide-scrollbar">
                <AnimatePresence>
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">
                          {msg.sender_username[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-bold text-sm">{msg.sender_username}</p>
                        <p className="text-white/70 text-sm">{msg.content}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {messages.length === 0 && (
                  <p className="text-white/30 text-center text-sm py-8">
                    Noch keine Nachrichten
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessageMutation.mutate(message)}
                  placeholder="Nachricht schreiben..."
                  className="flex-1 bg-black/20"
                />
                <Button
                  onClick={() => sendMessageMutation.mutate(message)}
                  disabled={!message.trim()}
                  className="bg-gradient-to-r from-violet-600 to-cyan-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}