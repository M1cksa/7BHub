import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function PreRollAd({ onComplete }) {
  const [ad, setAd] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('app_user');
    if (stored) {
      try {
        const parsedUser = JSON.parse(stored);
        setUser(parsedUser);
        
        // Skip ads for donors
        if (parsedUser?.is_donor) {
          onComplete();
          return;
        }
      } catch (e) {}
    }
  }, [onComplete]);

  useEffect(() => {
    if (!user?.is_donor) {
      loadAd();
    }
  }, [user]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanSkip(true);
    }
  }, [countdown]);

  const loadAd = async () => {
    try {
      const ads = await base44.entities.Advertisement.filter({
        placement: 'pre_roll',
        is_active: true,
        type: 'video'
      });

      const now = new Date();
      const activeAds = ads.filter(a => {
        const startOk = !a.start_date || new Date(a.start_date) <= now;
        const endOk = !a.end_date || new Date(a.end_date) >= now;
        const impressionsOk = !a.target_impressions || a.impressions < a.target_impressions;
        return startOk && endOk && impressionsOk;
      });

      if (activeAds.length > 0) {
        const randomAd = activeAds[Math.floor(Math.random() * activeAds.length)];
        setAd(randomAd);
        trackImpression(randomAd.id);
      } else {
        onComplete();
      }
    } catch (e) {
      console.error('Pre-roll ad error:', e);
      onComplete();
    }
  };

  const trackImpression = async (adId) => {
    try {
      await base44.entities.AdImpression.create({
        ad_id: adId,
        user_id: user?.id || 'anonymous',
        page: 'video_pre_roll'
      });

      const adData = await base44.entities.Advertisement.list();
      const currentAd = adData.find(a => a.id === adId);
      if (currentAd) {
        await base44.entities.Advertisement.update(adId, {
          impressions: (currentAd.impressions || 0) + 1
        });
      }
    } catch (e) {
      console.error('Impression tracking error:', e);
    }
  };

  const handleSkip = () => {
    if (canSkip) {
      onComplete();
    }
  };

  const handleAdClick = async () => {
    if (!ad) return;

    try {
      await base44.entities.AdClick.create({
        ad_id: ad.id,
        user_id: user?.id || 'anonymous',
        page: 'video_pre_roll'
      });

      const adData = await base44.entities.Advertisement.list();
      const currentAd = adData.find(a => a.id === ad.id);
      if (currentAd) {
        await base44.entities.Advertisement.update(ad.id, {
          clicks: (currentAd.clicks || 0) + 1
        });
      }

      if (ad.link_url) {
        window.open(ad.link_url, '_blank');
      }
    } catch (e) {
      console.error('Click tracking error:', e);
    }
  };

  if (!ad) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <video
          src={ad.media_url}
          autoPlay
          muted
          className="max-w-full max-h-full"
          onEnded={onComplete}
          onClick={handleAdClick}
        />

        <div className="absolute top-8 right-8 flex items-center gap-4">
          <div className="text-white text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
            Werbung
          </div>
          {canSkip ? (
            <Button
              onClick={handleSkip}
              size="sm"
              className="bg-white/90 text-black hover:bg-white"
            >
              Überspringen
            </Button>
          ) : (
            <div className="text-white text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
              {countdown}s
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}