import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Clock, Zap, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const RENTABLE_FRAMES = [
  { id: 'gold', name: 'Gold Frame', icon: '👑', buyPrice: 1500, gradient: 'from-yellow-400 to-amber-600' },
  { id: 'fire', name: 'Fire Frame', icon: '🔥', buyPrice: 2500, gradient: 'from-orange-500 to-red-600' },
  { id: 'rainbow', name: 'Rainbow Frame', icon: '🌈', buyPrice: 4000, gradient: 'from-red-500 via-yellow-500 to-blue-500' },
  { id: 'cosmic', name: 'Cosmic Frame', icon: '🌌', buyPrice: 7000, gradient: 'from-purple-600 via-blue-600 to-cyan-500' },
  { id: 'lightning', name: 'Lightning Frame', icon: '⚡', buyPrice: 8000, gradient: 'from-yellow-300 via-blue-400 to-indigo-600' },
  { id: 'lava', name: 'Lava Frame', icon: '🌋', buyPrice: 10500, gradient: 'from-red-600 via-orange-500 to-yellow-400' },
  { id: 'galaxy', name: 'Galaxy Frame', icon: '🌠', buyPrice: 17500, gradient: 'from-indigo-900 via-purple-800 to-pink-700' },
  { id: 'ocean', name: 'Ocean Frame', icon: '🌊', buyPrice: 22500, gradient: 'from-blue-900 via-cyan-700 to-teal-600' },
  { id: 'phoenix', name: 'Phoenix Frame', icon: '🦅', buyPrice: 25000, gradient: 'from-orange-600 via-red-500 to-yellow-400' },
  { id: 'aurora', name: 'Aurora Frame', icon: '✨', buyPrice: 37500, gradient: 'from-green-400 via-blue-500 to-purple-600' },
];

const RENTABLE_ANIMATIONS = [
  { id: 'sparkles', name: 'Glitzer-Effekt', icon: '✨', buyPrice: 3000 },
  { id: 'hearts', name: 'Herz-Animation', icon: '❤️', buyPrice: 3750 },
  { id: 'fireworks', name: 'Feuerwerk', icon: '🎆', buyPrice: 5000 },
  { id: 'money', name: 'Geldregen', icon: '💰', buyPrice: 9000 },
  { id: 'bubbles', name: 'Blasen-Schwarm', icon: '🫧', buyPrice: 6500 },
  { id: 'roses', name: 'Rosen-Regen', icon: '🌹', buyPrice: 11000 },
  { id: 'galaxies', name: 'Galaxien-Wirbel', icon: '🌌', buyPrice: 15000 },
  { id: 'portals', name: 'Portal-Effekt', icon: '🌀', buyPrice: 19000 },
];

const getRentPrice = (buyPrice, hours) => {
  const ratio = hours === 24 ? 0.25 : 0.60;
  return Math.max(100, Math.round((buyPrice * ratio) / 50) * 50);
};

const getRemainingTime = (expiresAt) => {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt) - new Date();
  if (diff <= 0) return null;
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours >= 24) return `${Math.floor(hours / 24)}T ${hours % 24}h`;
  return `${hours}h ${mins}m`;
};

export default function TempEffectsShop({ user, setUser }) {
  const [activeSection, setActiveSection] = useState('frames');

  const tempFrameActive = user?.temp_frame_expires && new Date(user.temp_frame_expires) > new Date();
  const tempAnimActive = user?.temp_animation_expires && new Date(user.temp_animation_expires) > new Date();

  const rentMutation = useMutation({
    mutationFn: async ({ type, itemId, hours }) => {
      const items = type === 'frame' ? RENTABLE_FRAMES : RENTABLE_ANIMATIONS;
      const item = items.find(i => i.id === itemId);
      const rentPrice = getRentPrice(item.buyPrice, hours);

      const freshUser = (await base44.entities.AppUser.filter({ id: user.id }, 1))[0];
      if ((freshUser.tokens || 0) < rentPrice) throw new Error(`Nicht genug Tokens! Du brauchst ${rentPrice.toLocaleString()} 🪙`);

      const expiresAt = new Date(Date.now() + hours * 3600000).toISOString();
      const updateData = { tokens: (freshUser.tokens || 0) - rentPrice };

      if (type === 'frame') {
        updateData.temp_frame_id = itemId;
        updateData.temp_frame_expires = expiresAt;
        updateData.frame_style = itemId;
      } else {
        updateData.temp_animation_id = itemId;
        updateData.temp_animation_expires = expiresAt;
        updateData.active_animation = itemId;
      }

      await base44.entities.AppUser.update(freshUser.id, updateData);
      const updatedUser = { ...freshUser, ...updateData };
      localStorage.setItem('app_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.dispatchEvent(new Event('user-updated'));
      return { type, hours, rentPrice, itemName: item.name };
    },
    onSuccess: ({ type, hours, rentPrice, itemName }) => {
      toast.success(`"${itemName}" für ${hours === 24 ? '24 Stunden' : '7 Tage'} gemietet!`, {
        description: `${rentPrice.toLocaleString()} Tokens ausgegeben`
      });
    },
    onError: (e) => toast.error(e.message)
  });

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-cyan-500/20">
        <p className="text-sm text-white/70">
          <span className="text-cyan-300 font-bold">Mieten statt Kaufen</span> — Aktiviere Premium-Effekte für eine begrenzte Zeit. Perfekt um neue Styles auszuprobieren, ohne sie dauerhaft zu kaufen.
        </p>
      </div>

      {/* Active Rentals */}
      {(tempFrameActive || tempAnimActive) && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Check className="w-4 h-4 text-green-400" />
            <span className="text-green-300 font-bold text-sm">Aktive Mieteffekte</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {tempFrameActive && (
              <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/10">
                <span className="text-sm font-medium text-white">🖼️ Rahmen aktiv</span>
                <span className="text-xs text-green-400 font-mono">{getRemainingTime(user.temp_frame_expires)} verbleibend</span>
              </div>
            )}
            {tempAnimActive && (
              <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/10">
                <span className="text-sm font-medium text-white">✨ Animation aktiv</span>
                <span className="text-xs text-green-400 font-mono">{getRemainingTime(user.temp_animation_expires)} verbleibend</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section Toggle */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10 w-fit">
        {[{ id: 'frames', label: '🖼️ Rahmen' }, { id: 'animations', label: '✨ Animationen' }].map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeSection === s.id ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white/70'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Frames */}
      {activeSection === 'frames' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {RENTABLE_FRAMES.map((frame, i) => {
            const isActiveTemp = user?.temp_frame_id === frame.id && tempFrameActive;
            const canAfford24 = (user?.tokens || 0) >= getRentPrice(frame.buyPrice, 24);
            return (
              <motion.div
                key={frame.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`relative rounded-2xl overflow-hidden border transition-all ${
                  isActiveTemp ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                }`}
              >
                <div className={`bg-gradient-to-br ${frame.gradient} h-24 flex items-center justify-center relative`}>
                  <span className="text-4xl">{frame.icon}</span>
                  {isActiveTemp && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-green-500 rounded-full text-xs font-bold text-white">
                      <Check className="w-3 h-3" /> Aktiv
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="font-bold text-white text-sm mb-1">{frame.name}</p>
                  <p className="text-white/30 text-xs mb-3">Kaufpreis: {frame.buyPrice.toLocaleString()} 🪙</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => rentMutation.mutate({ type: 'frame', itemId: frame.id, hours: 24 })}
                      disabled={rentMutation.isPending || !canAfford24}
                      className={`flex-1 h-9 text-xs rounded-xl border flex items-center justify-center gap-1 font-medium transition-all ${
                        canAfford24
                          ? 'border-white/15 bg-white/5 hover:bg-white/10 text-white'
                          : 'border-white/5 bg-white/[0.02] text-white/25 cursor-not-allowed'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      24h · {getRentPrice(frame.buyPrice, 24).toLocaleString()}🪙
                    </button>
                    <button
                      onClick={() => rentMutation.mutate({ type: 'frame', itemId: frame.id, hours: 168 })}
                      disabled={rentMutation.isPending || (user?.tokens || 0) < getRentPrice(frame.buyPrice, 168)}
                      className={`flex-1 h-9 text-xs rounded-xl border flex items-center justify-center gap-1 font-medium transition-all ${
                        (user?.tokens || 0) >= getRentPrice(frame.buyPrice, 168)
                          ? 'border-cyan-500/25 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300'
                          : 'border-white/5 bg-white/[0.02] text-white/25 cursor-not-allowed'
                      }`}
                    >
                      <Zap className="w-3 h-3" />
                      7T · {getRentPrice(frame.buyPrice, 168).toLocaleString()}🪙
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Animations */}
      {activeSection === 'animations' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {RENTABLE_ANIMATIONS.map((anim, i) => {
            const isActiveTemp = user?.temp_animation_id === anim.id && tempAnimActive;
            const canAfford24 = (user?.tokens || 0) >= getRentPrice(anim.buyPrice, 24);
            return (
              <motion.div
                key={anim.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`relative rounded-2xl overflow-hidden border transition-all ${
                  isActiveTemp ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                }`}
              >
                <div className="bg-gradient-to-br from-violet-900/30 to-fuchsia-900/30 h-24 flex items-center justify-center relative">
                  <span className="text-5xl">{anim.icon}</span>
                  {isActiveTemp && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-green-500 rounded-full text-xs font-bold text-white">
                      <Check className="w-3 h-3" /> Aktiv
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="font-bold text-white text-sm mb-1">{anim.name}</p>
                  <p className="text-white/30 text-xs mb-3">Kaufpreis: {anim.buyPrice.toLocaleString()} 🪙</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => rentMutation.mutate({ type: 'animation', itemId: anim.id, hours: 24 })}
                      disabled={rentMutation.isPending || !canAfford24}
                      className={`flex-1 h-9 text-xs rounded-xl border flex items-center justify-center gap-1 font-medium transition-all ${
                        canAfford24
                          ? 'border-white/15 bg-white/5 hover:bg-white/10 text-white'
                          : 'border-white/5 bg-white/[0.02] text-white/25 cursor-not-allowed'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      24h · {getRentPrice(anim.buyPrice, 24).toLocaleString()}🪙
                    </button>
                    <button
                      onClick={() => rentMutation.mutate({ type: 'animation', itemId: anim.id, hours: 168 })}
                      disabled={rentMutation.isPending || (user?.tokens || 0) < getRentPrice(anim.buyPrice, 168)}
                      className={`flex-1 h-9 text-xs rounded-xl border flex items-center justify-center gap-1 font-medium transition-all ${
                        (user?.tokens || 0) >= getRentPrice(anim.buyPrice, 168)
                          ? 'border-cyan-500/25 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300'
                          : 'border-white/5 bg-white/[0.02] text-white/25 cursor-not-allowed'
                      }`}
                    >
                      <Zap className="w-3 h-3" />
                      7T · {getRentPrice(anim.buyPrice, 168).toLocaleString()}🪙
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}