import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, X, Search, Users, Video, Send, Link2, Copy, Clock, Wifi } from "lucide-react";
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

const ONLINE_THRESHOLD_MS = 3 * 60 * 1000; // 3 minutes = online

function isOnline(lastSeen) {
  if (!lastSeen) return false;
  return Date.now() - new Date(lastSeen).getTime() < ONLINE_THRESHOLD_MS;
}

function OnlineDot({ online }) {
  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full border-2 border-black flex-shrink-0 ${online ? 'bg-green-400' : 'bg-white/20'}`}
      title={online ? 'Online' : 'Offline'}
    />
  );
}

export default function FriendList({ onSelectFriend, selectionMode = false, capturedImage = null }) {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [activeTab, setActiveTab] = useState('friends'); // friends | invite
  const [inviteLink, setInviteLink] = useState('');
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [friendUserData, setFriendUserData] = useState({}); // username → AppUser data (online etc.)

  // Ping last_seen every 60s
  useEffect(() => {
    const ping = async () => {
      try {
        const u = await base44.auth.me();
        if (u?.id) {
          await base44.entities.AppUser.update(u.id, { last_seen: new Date().toISOString() });
        }
      } catch (_) {}
    };
    ping();
    const iv = setInterval(ping, 60_000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
      fetchFriends(user.username);
      fetchRequests(user.username);
      // Check if arrived via invite link
      checkInviteCode(user);
    };
    loadUser();
  }, []);

  const checkInviteCode = async (user) => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('invite');
    if (!code || !user) return;
    try {
      const invites = await base44.entities.FriendInvite.filter({ code, used: false });
      if (!invites.length) { toast.error('Einladungslink ungültig oder abgelaufen.'); return; }
      const invite = invites[0];
      if (invite.creator_username === user.username) { toast.info('Das ist dein eigener Einladungslink.'); return; }
      // Already friends?
      const existing = await base44.entities.Friend.filter({ requester_username: invite.creator_username, recipient_username: user.username });
      const existing2 = await base44.entities.Friend.filter({ requester_username: user.username, recipient_username: invite.creator_username });
      if (existing.length || existing2.length) { toast.info('Ihr seid bereits befreundet oder die Anfrage existiert.'); return; }
      // Send friend request
      await base44.entities.Friend.create({
        requester_username: invite.creator_username,
        recipient_username: user.username,
        status: 'accepted',
        requester_avatar: invite.creator_avatar,
        recipient_avatar: user.avatar_url,
      });
      await base44.entities.FriendInvite.update(invite.id, { used: true, used_by: user.username });
      toast.success(`Du bist jetzt mit ${invite.creator_username} befreundet! 🎉`);
      // Remove code from URL
      const url = new URL(window.location.href);
      url.searchParams.delete('invite');
      window.history.replaceState({}, '', url.toString());
      fetchFriends(user.username);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFriends = async (username) => {
    const [sent, received] = await Promise.all([
      base44.entities.Friend.filter({ requester_username: username, status: 'accepted' }),
      base44.entities.Friend.filter({ recipient_username: username, status: 'accepted' }),
    ]);
    const friendList = [
      ...sent.map(f => ({ username: f.recipient_username, avatar: f.recipient_avatar, id: f.id })),
      ...received.map(f => ({ username: f.requester_username, avatar: f.requester_avatar, id: f.id })),
    ];
    const unique = Array.from(new Map(friendList.map(i => [i.username, i])).values());
    setFriends(unique);
    // Load online status for each friend
    if (unique.length) {
      try {
        const allUsers = await base44.entities.AppUser.filter({});
        const map = {};
        for (const u of allUsers) { if (u.username) map[u.username] = u; }
        setFriendUserData(map);
      } catch (_) {}
    }
  };

  const fetchRequests = async (username) => {
    const received = await base44.entities.Friend.filter({ recipient_username: username, status: 'pending' });
    setRequests(received);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchResults([{ username: searchQuery.trim() }]);
  };

  const sendRequest = async (targetUsername) => {
    if (targetUsername === currentUser.username) { toast.error('Du kannst dich nicht selbst hinzufügen'); return; }
    try {
      await base44.entities.Friend.create({
        requester_username: currentUser.username,
        recipient_username: targetUsername,
        status: 'pending',
        requester_avatar: currentUser.avatar_url,
      });
      toast.success(`Anfrage an ${targetUsername} gesendet!`);
      setSearchQuery(''); setSearchResults([]);
    } catch (err) { toast.error('Fehler beim Senden der Anfrage'); }
  };

  const acceptRequest = async (request) => {
    await base44.entities.Friend.update(request.id, { status: 'accepted' });
    toast.success('Freundschaftsanfrage angenommen!');
    fetchRequests(currentUser.username); fetchFriends(currentUser.username);
  };

  const declineRequest = async (request) => {
    await base44.entities.Friend.update(request.id, { status: 'rejected' });
    toast.success('Anfrage abgelehnt');
    fetchRequests(currentUser.username);
  };

  const createInviteLink = async () => {
    setCreatingInvite(true);
    try {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      await base44.entities.FriendInvite.create({
        code,
        creator_username: currentUser.username,
        creator_avatar: currentUser.avatar_url,
        used: false,
        expires_at: expires,
      });
      const link = `${window.location.origin}/Friends?invite=${code}`;
      setInviteLink(link);
    } catch (e) { toast.error('Fehler beim Erstellen des Links'); }
    setCreatingInvite(false);
  };

  const copyInviteLink = () => {
    navigator.clipboard?.writeText(inviteLink);
    toast.success('Link kopiert!');
  };

  const toggleSelection = (username) => {
    setSelectedFriends(prev => prev.includes(username) ? prev.filter(u => u !== username) : [...prev, username]);
  };

  const onlineFriends = friends.filter(f => isOnline(friendUserData[f.username]?.last_seen));
  const offlineFriends = friends.filter(f => !isOnline(friendUserData[f.username]?.last_seen));

  return (
    <div className="h-full flex flex-col bg-transparent overflow-hidden">
      {selectionMode && capturedImage && (
        <div className="p-4 border-b border-white/10 bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-[var(--theme-primary)]">
              <img src={capturedImage.image.url} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Snap bereit zum Senden</p>
              <p className="text-white/60 text-xs">Wähle Freunde aus</p>
            </div>
          </div>
        </div>
      )}

      {!selectionMode && (
        <div className="p-4 border-b border-white/10">
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'friends' ? 'bg-[var(--theme-primary)] text-white' : 'bg-white/5 text-white/50 hover:text-white'}`}
            >
              <Users className="w-4 h-4 inline mr-1.5" />Freunde
            </button>
            <button
              onClick={() => setActiveTab('invite')}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'invite' ? 'bg-[var(--theme-primary)] text-white' : 'bg-white/5 text-white/50 hover:text-white'}`}
            >
              <Link2 className="w-4 h-4 inline mr-1.5" />Einladen
            </button>
          </div>

          {activeTab === 'friends' && (
            <>
              <div className="flex gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nutzername suchen..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[var(--theme-primary)]"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} className="bg-[var(--theme-primary)] hover:opacity-80 text-white px-4">
                  <UserPlus className="w-4 h-4" />
                </Button>
              </div>
              {searchResults.length > 0 && (
                <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/10">
                  {searchResults.map(res => (
                    <div key={res.username} className="flex justify-between items-center">
                      <span className="text-white font-medium">{res.username}</span>
                      <Button size="sm" onClick={() => sendRequest(res.username)} className="bg-[var(--theme-primary)] text-white border-none">
                        Anfrage senden
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'invite' && (
            <div className="space-y-3">
              <p className="text-white/60 text-sm">Erstelle einen Einladungslink und teile ihn mit Freunden. Wer den Link öffnet, wird automatisch als Freund hinzugefügt.</p>
              {!inviteLink ? (
                <Button onClick={createInviteLink} disabled={creatingInvite} className="w-full bg-[var(--theme-primary)] text-white">
                  <Link2 className="w-4 h-4 mr-2" />
                  {creatingInvite ? 'Erstelle Link...' : 'Einladungslink erstellen'}
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={inviteLink}
                      readOnly
                      className="bg-white/5 border-white/10 text-white/80 text-xs"
                    />
                    <Button onClick={copyInviteLink} className="bg-[var(--theme-primary)] text-white px-3">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-white/30 text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> Gültig für 7 Tage</p>
                  <Button variant="ghost" onClick={() => setInviteLink('')} className="text-white/40 text-xs w-full">
                    Neuen Link erstellen
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <ScrollArea className="flex-1 p-4">
        {/* Pending Requests */}
        {!selectionMode && requests.length > 0 && (
          <div className="mb-5">
            <h4 className="text-xs font-bold text-[var(--theme-primary)] uppercase tracking-wider mb-2 flex items-center gap-2">
              Freundschaftsanfragen
              <span className="px-2 py-0.5 bg-[var(--theme-primary)]/20 rounded-full text-[10px]">{requests.length}</span>
            </h4>
            <div className="space-y-2">
              {requests.map(req => (
                <div key={req.id} className="glass-card rounded-xl p-3 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9 border-2 border-white/20">
                      <AvatarImage src={req.requester_avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-secondary)] text-white font-bold">
                        {req.requester_username[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-bold text-white">{req.requester_username}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="h-8 bg-green-500 hover:bg-green-600 text-white" onClick={() => acceptRequest(req)}>
                      <UserCheck className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => declineRequest(req)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Online Friends */}
        {!selectionMode && onlineFriends.length > 0 && (
          <div className="mb-5">
            <h4 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Wifi className="w-3 h-3" /> Online
              <span className="px-2 py-0.5 bg-green-500/20 rounded-full text-[10px]">{onlineFriends.length}</span>
            </h4>
            <div className="space-y-2">
              {onlineFriends.map(friend => (
                <FriendRow key={friend.id} friend={friend} online={true} selectionMode={selectionMode} selected={selectedFriends.includes(friend.username)} onToggle={() => toggleSelection(friend.username)} />
              ))}
            </div>
          </div>
        )}

        {/* All / Offline Friends */}
        <div>
          <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 flex items-center gap-2">
            {selectionMode ? 'Freunde auswählen' : onlineFriends.length > 0 ? 'Offline' : 'Meine Freunde'}
            <span className="px-2 py-0.5 bg-white/10 rounded-full text-[10px]">{selectionMode ? friends.length : offlineFriends.length || friends.length}</span>
          </h4>
          {friends.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/50 text-sm">Noch keine Freunde</p>
              <p className="text-white/30 text-xs mt-1">Suche Nutzer oder teile deinen Einladungslink</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(selectionMode ? friends : offlineFriends).map(friend => (
                <FriendRow key={friend.id} friend={friend} online={false} selectionMode={selectionMode} selected={selectedFriends.includes(friend.username)} onToggle={() => toggleSelection(friend.username)} />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {selectionMode && (
        <div className="p-4 border-t border-white/10 bg-black/60 backdrop-blur-md">
          <Button
            onClick={() => onSelectFriend(selectedFriends)}
            className="w-full h-14 bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] hover:opacity-90 text-white font-black text-lg border-none shadow-2xl shadow-[var(--theme-primary)]/30"
            disabled={selectedFriends.length === 0}
          >
            <Send className="w-5 h-5 mr-2" />
            An {selectedFriends.length} Freund{selectedFriends.length !== 1 ? 'e' : ''} senden
          </Button>
        </div>
      )}
    </div>
  );
}

function FriendRow({ friend, online, selectionMode, selected, onToggle }) {
  return (
    <div
      className={`glass-card rounded-xl p-3 transition-all border ${
        selectionMode
          ? (selected ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/10' : 'border-white/10 hover:border-white/20 hover:bg-white/5')
          : 'border-white/10 hover:border-white/20 hover:bg-white/5'
      } ${selectionMode ? 'cursor-pointer' : ''}`}
      onClick={() => selectionMode && onToggle()}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="w-10 h-10 border-2 border-white/20">
              <AvatarImage src={friend.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-secondary)] text-white font-bold">
                {friend.username[0]}
              </AvatarFallback>
            </Avatar>
            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-black ${online ? 'bg-green-400' : 'bg-white/20'}`} />
          </div>
          <div>
            <span className="text-sm font-bold text-white">{friend.username}</span>
            <p className={`text-[10px] ${online ? 'text-green-400' : 'text-white/30'}`}>{online ? '● Online' : '○ Offline'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!selectionMode && (
            <Button size="icon" variant="ghost" className="h-8 w-8 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
              onClick={(e) => { e.stopPropagation(); window.startVideoCall && window.startVideoCall(friend.username); }}>
              <Video className="w-4 h-4" />
            </Button>
          )}
          {selectionMode && (
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selected ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)] scale-110' : 'border-white/30'}`}>
              {selected && <UserCheck className="w-4 h-4 text-white" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}