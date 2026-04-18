import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Trophy, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ProPassChampionsOptimized() {
  const [champions, setChampions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLightweight, setIsLightweight] = useState(
    typeof window !== 'undefined' ? localStorage.getItem('lightweight_mode') === 'true' : false
  );

  useEffect(() => {
    const fetchChampions = async () => {
      try {
        // Optimized: Fetch only necessary fields with pagination
        const allUsers = await base44.entities.AppUser.list('-updated_date', 50);
        
        if (Array.isArray(allUsers)) {
          const completed = allUsers
            .filter(u => 
              u && 
              u.pro_pass?.claimed_tiers?.length === 10 && 
              u.pro_pass?.purchased &&
              u.username &&
              u.avatar_url
            )
            .slice(0, 12);
          
          setChampions(completed);
        }
      } catch (e) {
        console.error('Failed to fetch champions:', e);
        setChampions([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChampions();
    
    // Recheck lightweight mode
    const handleStorageChange = () => {
      setIsLightweight(localStorage.getItem('lightweight_mode') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Memoize champion list rendering for performance
  const championElements = useMemo(() => (
    champions.map((user, idx) => (
      <motion.div
        key={user.id}
        initial={isLightweight ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={isLightweight ? undefined : { delay: idx * 0.05 }}
        className="group relative"
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <Link to={`${createPageUrl('CreatorProfile')}?username=${user.username}`}>
          <div className="relative bg-white/[0.04] backdrop-blur border border-yellow-500/20 rounded-2xl p-4 hover:border-yellow-500/40 transition-all duration-200 h-full cursor-pointer">
            {/* Crown indicator */}
            <div className="absolute -top-3 -right-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-2 shadow-lg shadow-yellow-500/50">
              <Crown className="w-4 h-4 text-black" />
            </div>

            {/* Avatar with loading strategy */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  loading="lazy"
                  className="w-16 h-16 rounded-full ring-2 ring-yellow-400/50 object-cover"
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400/20 to-transparent" />
              </div>
            </div>

            {/* Username */}
            <h3 className="font-black text-white/90 truncate mb-1 text-center text-sm">
              {user.username}
            </h3>

            {/* Status */}
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-purple-400">
              <span>✨ ABSOLUTE ✨</span>
            </div>
          </div>
        </Link>
      </motion.div>
    ))
  ), [champions, isLightweight]);

  if (loading || champions.length === 0) return null;

  return (
    <section className="py-8 md:py-12 px-4 bg-gradient-to-br from-yellow-500/8 via-transparent to-purple-500/8 rounded-3xl border border-yellow-500/15 mb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={isLightweight ? false : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 mb-6 md:mb-8"
        >
          <Crown className="w-4 md:w-5 h-4 md:h-5 text-yellow-400" />
          <h2 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-purple-400">
            Pro Pass Champions
          </h2>
          <Crown className="w-4 md:w-5 h-4 md:h-5 text-yellow-400" />
        </motion.div>

        {/* Champions Grid - Optimized for Tablets */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {championElements}
        </div>

        {/* CTA - Simplified for Performance */}
        <motion.div
          initial={isLightweight ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={isLightweight ? undefined : { delay: 0.3 }}
          className="text-center mt-6 md:mt-8"
        >
          <p className="text-white/40 text-sm mb-3 md:mb-4">
            Willst du auch ein Champion werden?
          </p>
          <Link to={createPageUrl('NeonDash')}>
            <button className="px-6 md:px-8 py-2 md:py-3 rounded-xl font-black text-sm bg-gradient-to-r from-yellow-500 to-purple-600 text-black hover:shadow-lg hover:shadow-yellow-500/50 transition-all duration-200 border-none cursor-pointer active:scale-95">
              Pro Pass starten →
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}