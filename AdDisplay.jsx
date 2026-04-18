import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdDisplay({ placement }) {
  const [ad, setAd] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('app_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    // Don't load ads for donors
    if (!user?.is_donor) {
      loadAd();
    }
  }, [placement, user]);

  const loadAd = async () => {
    try {
      const ads = await base44.entities.Advertisement.filter({
        placement,
        is_active: true
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
      }
    } catch (e) {
      console.error('Ad load error:', e);
    }
  };

  const trackImpression = async (adId) => {
    try {
      await base44.entities.AdImpression.create({
        ad_id: adId,
        user_id: user?.id || 'anonymous',
        page: window.location.pathname
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

  const handleClick = async () => {
    if (!ad) return;

    try {
      await base44.entities.AdClick.create({
        ad_id: ad.id,
        user_id: user?.id || 'anonymous',
        page: window.location.pathname
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

  // Hide ads for donors
  if (user?.is_donor) return null;
  
  if (!ad) return null;

  if (ad.type === 'banner') {
    const sizeClasses = {
      sidebar: 'max-h-[200px]',
      home_banner: 'max-h-[150px]',
      between_videos: 'max-h-[120px]'
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl overflow-hidden cursor-pointer group"
        onClick={handleClick}
      >
        <img 
          src={ad.media_url} 
          alt={ad.title}
          className={`w-full object-cover group-hover:scale-105 transition-transform duration-300 ${sizeClasses[placement] || 'max-h-[150px]'}`}
        />
        <div className="p-2 text-xs text-white/40 text-center">
          Werbung
        </div>
      </motion.div>
    );
  }

  return null;
}