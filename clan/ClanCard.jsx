import React from 'react';
import { motion } from 'framer-motion';
import { Users, Star, ArrowRight, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ClanCard({ clan }) {
  const xpPct = ((clan.xp || 0) % 1000) / 1000 * 100;

  return (
    <Link to={createPageUrl(`ClanDetail?id=${clan.id}`)}>
      <motion.div 
        whileHover={{ y: -6, scale: 1.02 }} 
        whileTap={{ scale: 0.98 }}
        className="relative overflow-hidden rounded-3xl p-6 cursor-pointer transition-all duration-300 group"
        style={{ 
          background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Glow effect on hover */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-3xl opacity-0 group-hover:opacity-30 blur-md transition-opacity duration-500 -z-10" />

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-5">
            {clan.logo_url ? (
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] group-hover:border-cyan-400/50 transition-colors">
                <img src={clan.logo_url} alt={clan.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center border-2 border-white/10 shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all">
                <Users className="w-8 h-8 text-white drop-shadow-md" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-black text-white truncate drop-shadow-sm">{clan.name}</h3>
                {clan.tag && (
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-cyan-300 text-[10px] font-black uppercase tracking-wider border border-white/5">
                    {clan.tag}
                  </span>
                )}
              </div>
              <p className="text-white/50 text-sm truncate">{clan.description || 'Ein geheimer Clan ohne Beschreibung'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 bg-black/40 p-3 rounded-xl border border-white/5">
              <div className="flex items-center justify-between text-xs text-white/40 mb-1">
                <span className="flex items-center gap-1.5"><Star className="w-3 h-3 text-yellow-400" /> Level {clan.level || 1}</span>
                <span>{Math.floor(xpPct)}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500" style={{ width: `${xpPct}%` }} />
              </div>
            </div>
            <div className="bg-black/40 px-4 py-3 rounded-xl border border-white/5 flex flex-col items-center justify-center">
              <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-1">Mitglieder</span>
              <span className="text-white font-black text-sm">{clan.members_count || 0}<span className="text-white/30">/{clan.max_members || 5}</span></span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/5">
            <div className="flex gap-2">
              {clan.is_recruiting !== false && (clan.members_count || 0) < (clan.max_members || 5) ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Offen
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-400/10 px-2.5 py-1 rounded-full border border-red-400/20">
                  Voll
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-white/30 group-hover:text-cyan-400 transition-colors">
              Details ansehen <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}