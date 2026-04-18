import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Check, Zap, Sparkles, Star, Coins, Gift } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const premiumTiers = [
  {
    name: 'Premium Tier 1',
    tokenPrice: 5000,
    tier: 'tier1',
    icon: Star,
    badge: 'gold',
    animation: 'sparkles',
    videoFrame: 'gold',
    features: [
      'Zugriff auf Premium-Videos',
      'Gold Profil-Badge',
      'Sparkles Profil-Animation',
      'Gold Video-Rahmen',
      'Alle Shop-Cosmetics enthalten',
      '500 Bonus-Tokens bei Kauf'
    ],
    color: 'from-blue-500 to-cyan-500'
  },
  {
    name: 'Premium Tier 2',
    tokenPrice: 10000,
    tier: 'tier2',
    icon: Sparkles,
    badge: 'diamond',
    animation: 'fireworks',
    videoFrame: 'neon',
    features: [
      'Alle Tier 1 Features',
      '4K-Qualität verfügbar',
      'Diamond Profil-Badge',
      'Fireworks Profil-Animation',
      'Neon Video-Rahmen',
      'Alle Shop-Cosmetics enthalten',
      '1500 Bonus-Tokens bei Kauf'
    ],
    color: 'from-violet-500 to-purple-500',
    popular: true
  },
  {
    name: 'Premium Tier 3',
    tokenPrice: 20000,
    tier: 'tier3',
    icon: Star,
    badge: 'rainbow',
    animation: 'magic',
    videoFrame: 'cosmic',
    features: [
      'Alle Tier 2 Features',
      'Rainbow VIP-Badge',
      'Magic Profil-Animation',
      'Cosmic Video-Rahmen',
      'Alle Shop-Cosmetics enthalten',
      'Alle zukünftigen Cosmetics gratis',
      '5000 Bonus-Tokens bei Kauf'
    ],
    color: 'from-amber-500 to-orange-500'
  }
];



export default function Premium() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const storedUser = localStorage.getItem('app_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch(e) {}
    }
    
    const handleUserUpdate = () => {
      const updated = localStorage.getItem('app_user');
      if (updated) setUser(JSON.parse(updated));
    };
    window.addEventListener('user-updated', handleUserUpdate);
    return () => window.removeEventListener('user-updated', handleUserUpdate);
  }, []);

  // Fetch current premium status
  const { data: currentPremium } = useQuery({
    queryKey: ['userPremium', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const premium = await base44.entities.UserPremium.filter({ user_id: user.id, active: true }, 1);
      return premium && premium.length > 0 ? premium[0] : null;
    },
    enabled: !!user?.id
  });

  const handleSubscribe = async (tokenPrice, tier, tierName) => {
    if (!user) {
      window.location.href = createPageUrl('SignIn');
      return;
    }

    // Check if user already has an active premium subscription
    if (currentPremium && currentPremium.active) {
      const currentTierName = premiumTiers.find(t => t.tier === currentPremium.premium_tier)?.name || 'Premium';
      alert(`Du hast bereits ein aktives Abo: ${currentTierName}. Bitte warte bis es abläuft, bevor du ein neues kaufst.`);
      return;
    }

    if ((user.tokens || 0) < tokenPrice) {
      alert(`Du benötigst ${tokenPrice} Tokens für ${tierName}. Du hast nur ${user.tokens || 0} Tokens.`);
      return;
    }

    setLoading(true);
    try {
      const tierData = premiumTiers.find(t => t.tier === tier);
      const bonusTokens = tier === 'tier1' ? 500 : tier === 'tier2' ? 1500 : 5000;
      
      // Ziehe Token-Preis ab und füge Bonus-Tokens hinzu
      const newTokens = (user.tokens || 0) - tokenPrice + bonusTokens;
      
      // Schalte Premium-Features frei (Badges, Animationen, Video-Rahmen)
      const owned_badges = [...new Set([...(user.owned_badges || []), tierData.badge])];
      const owned_animations = [...new Set([...(user.owned_animations || []), tierData.animation])];
      const owned_video_frames = [...new Set([...(user.owned_video_frames || []), tierData.videoFrame])];
      
      // Für Tier 3: Alle Rahmen & Animationen freischalten
      if (tier === 'tier3') {
        owned_badges.push('gold', 'neon', 'fire', 'glitch', 'diamond', 'cyber', 'nature');
        owned_animations.push('confetti', 'sparkles', 'hearts', 'fireworks', 'snow', 'stars', 'magic');
        owned_video_frames.push('gold', 'neon', 'fire', 'glitch', 'rainbow', 'diamond', 'cyber', 'nature');
      }
      
      await base44.entities.AppUser.update(user.id, {
        tokens: newTokens,
        owned_badges,
        owned_animations,
        owned_video_frames,
        frame_style: tierData.badge,
        active_animation: tierData.animation
      });

      // Erstelle oder aktualisiere Premium-Subscription
      const existingPremium = await base44.entities.UserPremium.filter({ user_id: user.id }, 1);
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      if (existingPremium && existingPremium.length > 0) {
        await base44.entities.UserPremium.update(existingPremium[0].id, {
          premium_tier: tier,
          active: true,
          expires_at: expiresAt.toISOString()
        });
      } else {
        await base44.entities.UserPremium.create({
          user_id: user.id,
          premium_tier: tier,
          active: true,
          expires_at: expiresAt.toISOString()
        });
      }

      // Aktualisiere lokalen User
      const updatedUser = { ...user, tokens: newTokens, owned_badges, owned_animations, owned_video_frames, frame_style: tierData.badge, active_animation: tierData.animation };
      localStorage.setItem('app_user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('user-updated'));
      setUser(updatedUser);

      queryClient.invalidateQueries(['userPremium']);
      alert(`${tierName} erfolgreich aktiviert! +${bonusTokens} Bonus-Tokens + Exklusive Features freigeschaltet!`);
    } catch (error) {
      console.error('Premium purchase error:', error);
      alert('Fehler beim Kauf');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 mb-6"
        >
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span className="text-violet-300 text-sm font-bold">Premium Vorteile</span>
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
          Werde <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Premium</span>
        </h1>
        <p className="text-white/60 text-lg max-w-2xl mx-auto">
          Unterstütze die Plattform und erhalte exklusive Features mit deinen Tokens
        </p>
        {user && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30">
            <Coins className="w-5 h-5 text-amber-400" />
            <span className="text-amber-300 font-bold">{user.tokens || 0} Tokens verfügbar</span>
          </div>
        )}
      </div>

      {/* Premium Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        {premiumTiers.map((tier, idx) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`relative rounded-3xl p-8 border ${
              tier.popular
                ? 'border-violet-500/50 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10'
                : 'border-white/10 bg-white/5'
            }`}
          >
            {tier.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-bold">
                Beliebt
              </div>
            )}

            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tier.color} flex items-center justify-center mb-6`}>
              <tier.icon className="w-8 h-8 text-white" />
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-black text-white">{tier.tokenPrice}</span>
              <span className="text-white/40">Tokens/Monat</span>
            </div>

            <ul className="space-y-3 mb-8">
              {tier.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-white/80">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => handleSubscribe(tier.tokenPrice, tier.tier, tier.name)}
              disabled={loading || !user || (user?.tokens || 0) < tier.tokenPrice || (currentPremium?.active && currentPremium?.premium_tier === tier.tier)}
              className={`w-full h-12 rounded-xl font-bold bg-gradient-to-r ${tier.color} hover:opacity-90 transition-opacity disabled:opacity-50`}
            >
              {currentPremium?.active && currentPremium?.premium_tier === tier.tier 
                ? '✓ Aktiv' 
                : loading 
                  ? 'Lädt...' 
                  : (user?.tokens || 0) < tier.tokenPrice 
                    ? `Benötigt ${tier.tokenPrice} Tokens` 
                    : currentPremium?.active 
                      ? 'Bereits Premium' 
                      : 'Jetzt kaufen'}
            </Button>
          </motion.div>
        ))}
      </div>



      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
        {[
          { icon: Zap, title: 'Schnellerer Support', desc: 'Bevorzugte Behandlung' },
          { icon: Star, title: 'Exklusive Badges', desc: 'Zeige deinen Status' },
          { icon: Sparkles, title: 'Früher Zugang', desc: 'Neue Features zuerst' },
          { icon: Gift, title: 'Bonus-Tokens', desc: 'Jeden Monat gratis' }
        ].map((benefit, idx) => (
          <motion.div
            key={benefit.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mx-auto mb-4">
              <benefit.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-white mb-2">{benefit.title}</h3>
            <p className="text-white/60 text-sm">{benefit.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}