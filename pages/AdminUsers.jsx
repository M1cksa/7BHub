import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Users, Search, Eye, EyeOff, Shield, Mail, Calendar, Check, X, Edit2, Trash2, Crown, User as UserIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import AnimatedBackground from '@/components/streaming/AnimatedBackground';

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showPasswords, setShowPasswords] = useState({});
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => base44.entities.AppUser.list('-created_date', 1000),
    enabled: currentUser?.role === 'admin',
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AppUser.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUsers']);
      toast.success('Benutzer erfolgreich aktualisiert');
      setEditingUser(null);
    },
    onError: (error) => {
      toast.error('Fehler beim Aktualisieren: ' + error.message);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id) => base44.entities.AppUser.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUsers']);
      toast.success('Benutzer erfolgreich gelöscht');
    },
    onError: (error) => {
      toast.error('Fehler beim Löschen: ' + error.message);
    },
  });

  const togglePassword = (userId) => {
    setShowPasswords(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      bio: user.bio || '',
      role: user.role,
      audience_group: user.audience_group || '',
      tokens: user.tokens,
      approved: user.approved,
      newsletter_subscribed: user.newsletter_subscribed,
    });
  };

  const handleSaveEdit = () => {
    updateUserMutation.mutate({ id: editingUser.id, data: editForm });
  };

  const handleDelete = (userId) => {
    if (window.confirm('Möchtest du diesen Benutzer wirklich löschen?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <div className="glass-card rounded-3xl p-12 text-center relative z-10">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-black text-white mb-2">Zugriff verweigert</h1>
          <p className="text-white/60">Du benötigst Admin-Rechte für diese Seite</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <div className="text-center relative z-10">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Lade Benutzerdaten...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />

      <div className="max-w-[1920px] mx-auto px-4 md:px-8 pt-8 pb-32 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-white">Benutzerverwaltung</h1>
              <p className="text-white/60 text-lg">{users.length} Benutzer registriert</p>
            </div>
          </div>

          {/* Search */}
          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <Search className="w-5 h-5 text-white/40" />
            <Input
              type="text"
              placeholder="Suche nach Username oder E-Mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-0 text-white placeholder:text-white/40 focus-visible:ring-0"
            />
          </div>
        </motion.div>

        {/* Users Grid */}
        <div className="grid gap-4">
          {filteredUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card rounded-2xl p-6 hover:bg-white/[0.06] transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                      alt={user.username}
                      className="w-14 h-14 rounded-full ring-2 ring-white/10"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xl font-bold text-white">{user.username}</h3>
                        {user.role === 'admin' && (
                          <Crown className="w-5 h-5 text-yellow-400" />
                        )}
                        {user.approved ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <X className="w-5 h-5 text-red-500" />
                        )}
                        {user.requested_role && user.role === 'user' && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">
                            Wünscht: {user.requested_role === 'girl' ? '👧 Mädchen' : '👦 Jungs'}
                          </span>
                        )}
                      </div>
                      <p className="text-white/60 text-sm">{user.email}</p>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-white/40 mb-1">Passwort</p>
                      <div className="flex items-center gap-2">
                        <code className="text-white/80 font-mono text-xs">
                          {showPasswords[user.id] ? user.password : '••••••••'}
                        </code>
                        <button
                          onClick={() => togglePassword(user.id)}
                          className="text-white/40 hover:text-white/80 transition-colors"
                        >
                          {showPasswords[user.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="text-white/40 mb-1">Rolle</p>
                      <div className="flex items-center gap-1">
                        {user.role === 'admin' ? (
                          <Shield className="w-4 h-4 text-yellow-400" />
                        ) : (
                          <UserIcon className="w-4 h-4 text-white/60" />
                        )}
                        <p className="text-white/80 capitalize">{user.role}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-white/40 mb-1">Zielgruppe</p>
                      <p className="text-white/80 capitalize">{user.audience_group || 'Alle/Keine'}</p>
                    </div>

                    <div>
                      <p className="text-white/40 mb-1">Tokens</p>
                      <p className="text-white/80 font-bold">{user.tokens || 0}</p>
                    </div>

                    <div>
                      <p className="text-white/40 mb-1">Status</p>
                      <p className={`font-bold ${user.approved ? 'text-green-500' : 'text-red-500'}`}>
                        {user.approved ? 'Genehmigt' : 'Ausstehend'}
                      </p>
                    </div>

                    <div>
                      <p className="text-white/40 mb-1">Newsletter</p>
                      <p className={`font-bold ${user.newsletter_subscribed ? 'text-green-500' : 'text-white/60'}`}>
                        {user.newsletter_subscribed ? 'Abonniert' : 'Nicht abonniert'}
                      </p>
                    </div>

                    <div>
                      <p className="text-white/40 mb-1">Frame</p>
                      <p className="text-white/80 capitalize">{user.frame_style || 'Keiner'}</p>
                    </div>

                    <div>
                      <p className="text-white/40 mb-1">Themes</p>
                      <p className="text-white/80">{user.owned_themes?.length || 0}</p>
                    </div>

                    <div>
                      <p className="text-white/40 mb-1">Erstellt</p>
                      <p className="text-white/80 text-xs">
                        {new Date(user.created_date).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                  </div>

                  {user.bio && (
                    <div className="mt-4 p-3 bg-white/[0.03] rounded-lg">
                      <p className="text-white/40 text-xs mb-1">Bio</p>
                      <p className="text-white/80 text-sm">{user.bio}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(user)}
                    className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(user.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="glass-card rounded-3xl p-12 text-center">
            <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/60 text-lg">Keine Benutzer gefunden</p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="bg-slate-900/90 backdrop-blur-3xl border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Benutzer bearbeiten</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4 mt-4">
              <div>
                <Label>Username</Label>
                <Input
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label>E-Mail</Label>
                <Input
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label>Bio</Label>
                <Input
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Rolle</Label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full h-9 px-3 rounded-md bg-white/5 border border-white/10 text-white"
                  >
                    <option value="user">User</option>
                    <option value="admin">👑 Admin</option>
                    <option value="gamer">🎮 Gamer</option>
                  </select>
                </div>
                <div>
                  <Label>Zielgruppe</Label>
                  <select
                    value={editForm.audience_group}
                    onChange={(e) => setEditForm({ ...editForm, audience_group: e.target.value })}
                    className="w-full h-9 px-3 rounded-md bg-white/5 border border-white/10 text-white"
                  >
                    <option value="">Alle/Keine</option>
                    <option value="girl">👧 Mädchen</option>
                    <option value="boy">👦 Jungs</option>
                    <option value="mixed">🔀 Gemischt</option>
                  </select>
                </div>
                <div>
                  <Label>Tokens</Label>
                  <Input
                    type="number"
                    value={editForm.tokens}
                    onChange={(e) => setEditForm({ ...editForm, tokens: parseInt(e.target.value) })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.approved}
                    onChange={(e) => setEditForm({ ...editForm, approved: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-white/80">Genehmigt</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.newsletter_subscribed}
                    onChange={(e) => setEditForm({ ...editForm, newsletter_subscribed: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-white/80">Newsletter</span>
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSaveEdit}
                  disabled={updateUserMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-teal-600 h-12"
                >
                  {updateUserMutation.isPending ? 'Speichern...' : 'Speichern'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingUser(null)}
                  className="bg-white/5 border-white/10"
                >
                  Abbrechen
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}