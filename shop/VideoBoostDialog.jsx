import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Zap, TrendingUp, Clock } from 'lucide-react';

const BOOST_PACKAGES = [
  { id: 'standard', name: 'Standard Boost', hours: 24, price: 500, icon: '⚡', colorClass: 'from-blue-600 to-cyan-600', description: '24 Stunden im Feed hervorgehoben' },
  { id: 'pro', name: 'Pro Boost', hours: 72, price: 1200, icon: '🔥', colorClass: 'from-orange-600 to-red-600', description: '72 Stunden maximale Sichtbarkeit' },
  { id: 'ultra', name: 'Ultra Boost', hours: 168, price: 3000, icon: '👑', colorClass: 'from-yellow-500 to-amber-600', description: '7 Tage auf Platz 1 im Feed' },
];

const getRemainingTime = (expiresAt) => {
  const diff = new Date(expiresAt) - new Date();
  if (diff <= 0) return null;
  const hours = Math.floor(diff / 3600000);
  if (hours >= 24) return `${Math.floor(hours / 24)} Tage ${hours % 24}h`;
  return `${hours}h verbleibend`;
};

export default function VideoBoostDialog({ video, user, setUser, open, onClose }) {
  const queryClient = useQueryClient();

  const { data: existingBoost } = useQuery({
    queryKey: ['videoBoost', video?.id],
    queryFn: async () => {
      const boosts = await base44.entities.VideoBoost.filter({ video_id: video.id });
      return boosts.find(b => new Date(b.expires_at) > new Date()) || null;
    },
    enabled: !!video?.id && open
  });

  const boostMutation = useMutation({
    mutationFn: async (pkg) => {
      const freshUser = (await base44.entities.AppUser.filter({ id: user.id }, 1))[0];
      if ((freshUser.tokens || 0) < pkg.price) throw new Error(`Nicht genug Tokens! Du brauchst ${pkg.price.toLocaleString()} 🪙`);

      const expiresAt = new Date(Date.now() + pkg.hours * 3600000).toISOString();

      await base44.entities.VideoBoost.create({
        video_id: video.id,
        creator_username: user.username,
        video_title: video.title,
        thumbnail_url: video.thumbnail_url,
        boost_type: 'featured',
        expires_at: expiresAt,
        tokens_spent: pkg.price
      });

      const newTokens = (freshUser.tokens || 0) - pkg.price;
      await base44.entities.AppUser.update(freshUser.id, { tokens: newTokens });
      const updatedUser = { ...freshUser, tokens: newTokens };
      localStorage.setItem('app_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.dispatchEvent(new Event('user-updated'));
      return pkg;
    },
    onSuccess: (pkg) => {
      queryClient.invalidateQueries({ queryKey: ['videoBoost', video?.id] });
      toast.success(`Video wird jetzt für ${pkg.hours >= 168 ? '7 Tage' : pkg.hours + ' Stunden'} geboosted! 🚀`, {
        description: `${pkg.price.toLocaleString()} Tokens ausgegeben`
      });
      onClose();
    },
    onError: (e) => toast.error(e.message)
  });

  if (!video) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-black/95 backdrop-blur-2xl border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Zap className="w-5 h-5 text-yellow-400" />
            Video boosten
          </DialogTitle>
        </DialogHeader>

        {/* Video Preview */}
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
          {video.thumbnail_url && (
            <img src={video.thumbnail_url} alt={video.title} className="w-16 h-10 object-cover rounded-lg shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-white truncate">{video.title}</p>
            <p className="text-white/40 text-xs">{(video.views || 0).toLocaleString()} Views</p>
          </div>
        </div>

        {/* Current Boost Status */}
        {existingBoost && (
          <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
            <TrendingUp className="w-4 h-4 text-green-400 shrink-0" />
            <span className="text-green-300 text-sm font-medium">Boost aktiv — {getRemainingTime(existingBoost.expires_at)}</span>
          </div>
        )}

        {/* Boost Packages */}
        <div className="space-y-3">
          {BOOST_PACKAGES.map(pkg => {
            const canAfford = (user?.tokens || 0) >= pkg.price;
            return (
              <button
                key={pkg.id}
                onClick={() => boostMutation.mutate(pkg)}
                disabled={boostMutation.isPending || !canAfford}
                className={`w-full p-4 rounded-xl border transition-all text-left group relative overflow-hidden ${
                  canAfford
                    ? 'border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06] active:scale-[0.98]'
                    : 'border-white/5 bg-white/[0.02] opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${pkg.colorClass} flex items-center justify-center text-lg shrink-0`}>
                      {pkg.icon}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{pkg.name}</p>
                      <p className="text-white/40 text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {pkg.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-white text-base">{pkg.price.toLocaleString()}</p>
                    <p className="text-white/40 text-xs">🪙 Tokens</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-center text-white/30 text-xs">
          Dein Guthaben: {(user?.tokens || 0).toLocaleString()} 🪙
        </p>
      </DialogContent>
    </Dialog>
  );
}