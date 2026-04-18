import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Trophy, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ProPassChampions() {
  const [champions, setChampions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChampions = async () => {
      try {
        const users = await base44.entities.AppUser.filter(
          { 'pro_pass.purchased': true },
          '-pro_pass.dims_traversed',
          12
        );
        
        if (users) {
          const completed = users.filter(u => 
            u.pro_pass?.claimed_tiers?.length === 10 && 
            u.pro_pass?.purchased
          );
          
          setChampions(completed);
        }
      } catch (e) {
        console.error('Failed to fetch champions:', e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChampions();
  }, []);

  if (loading || champions.length === 0) return null;

  return (
    <section className="py-12 px-4 bg-gradient-to-br from-yellow-500/8 via-transparent to-purple-500/8 rounded-3xl border border-yellow-500/15 mb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mb-2"
          >
            <Crown className="w-5 h-5 text-yellow-400" />
            <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-purple-400">
              Pro Pass Champions
            </h2>
            <Crown className="w-5 h-5 text-yellow-400" />
          </motion.div>
          <p className="text-white/40 text-sm font-bold">Die Elite der Plattform – Absolute Pro Pass abgeschlossen</p>
        </div>

        {/* Champions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {champions.map((user, idx) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group relative"
            >
              {/* Glow background */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
              
              {/* Card */}
              <Link to={createPageUrl('CreatorProfile') + `?username=${user.username}`}>
                <div className="relative bg-white/[0.04] backdrop-blur border border-yellow-500/20 rounded-2xl p-4 hover:border-yellow-500/40 transition-all duration-300 h-full cursor-pointer">
                  {/* Crown indicator */}
                  <div className="absolute -top-3 -right-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-2 shadow-lg shadow-yellow-500/50">
                    <Crown className="w-4 h-4 text-black" />
                  </div>

                  {/* Avatar */}
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <img
                        src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                        alt={user.username}
                        className="w-16 h-16 rounded-full ring-2 ring-yellow-400/50 object-cover"
                      />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400/20 to-transparent" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="text-center">
                    <h3 className="font-black text-white/90 truncate mb-1">
                      {user.username}
                    </h3>
                    
                    {user.active_title && (
                      <p className="text-xs text-yellow-400/80 font-bold mb-2 line-clamp-1">
                        {user.active_title}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-center gap-1.5 bg-black/30 rounded-lg px-2 py-1 mb-3 border border-yellow-500/15">
                      <Trophy className="w-3 h-3 text-yellow-400" />
                      <span className="text-[11px] font-black text-yellow-400">
                        {user.pro_pass?.dims_traversed?.toLocaleString() || '1000'} Dims
                      </span>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-purple-400">
                      <span>✨ THE ABSOLUTE ✨</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8"
        >
          <p className="text-white/40 text-sm mb-4">
            Willst du auch ein Champion werden?
          </p>
          <Link to={createPageUrl('NeonDash')}>
            <button className="px-8 py-3 rounded-xl font-black text-sm bg-gradient-to-r from-yellow-500 to-purple-600 text-black hover:shadow-lg hover:shadow-yellow-500/50 transition-all duration-300 border-none cursor-pointer">
              Pro Pass starten →
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}