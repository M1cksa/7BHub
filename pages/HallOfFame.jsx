import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Crown, Coins, Zap, Trophy, Star, Shield, Gamepad2, Flame, Medal, Users, ChevronRight } from 'lucide-react';
import PageTransition from '@/components/mobile/PageTransition';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const CATEGORIES = [
  { id: 'propass', label: 'Pro Pass Legenden', icon: Crown, color: 'from-yellow-500 to-amber-500', desc: 'Alle 10 Pro Pass Tiers abgeschlossen' },
  { id: 'tokens', label: 'Reichste Nutzer', icon: Coins, color: 'from-yellow-400 to-orange-500', desc: 'Meiste Tokens aktuell' },
  { id: 'neondash', label: 'Neon Dash Pros', icon: Zap, color: 'from-cyan-400 to-violet-500', desc: 'Meiste gespielte Neon Dash Runden' },
  { id: 'battlepass', label: 'Battle Pass Max', icon: Star, color: 'from-violet-500 to-fuchsia-500', desc: 'Höchster Battle Pass Level' },
  { id: 'donors', label: 'Unterstützer', icon: Flame, color: 'from-orange-400 to-red-500', desc: 'Großzügige Spender der Plattform' },
  { id: 'streaks', label: 'Streak-Könige', icon: Gamepad2, color: 'from-emerald-400 to-teal-500', desc: 'Längster täglicher Login-Streak' },
];

function AvatarCard({ user, rank, color, badge, sub }) {
  const rankColors = ['text-yellow-400', 'text-gray-300', 'text-amber-600'];
  const rankBg = ['bg-yellow-400/20 border-yellow-400/50', 'bg-gray-300/10 border-gray-300/30', 'bg-amber-600/10 border-amber-600/30'];
  const isTop3 = rank <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.04 }}
      className={`relative flex flex-col items-center p-4 rounded-2xl border text-center transition-all hover:scale-[1.03] cursor-default ${isTop3 ? rankBg[rank - 1] : 'bg-white/5 border-white/10'}`}
    >
      {isTop3 && (
        <div className={`absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 border-black ${rank === 1 ? 'bg-yellow-400 text-black' : rank === 2 ? 'bg-gray-300 text-black' : 'bg-amber-600 text-white'}`}>
          {rank}
        </div>
      )}
      {!isTop3 && (
        <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white/40 font-bold">
          {rank}
        </div>
      )}
      <div className={`relative mb-2 ${isTop3 ? 'w-16 h-16' : 'w-12 h-12'}`}>
        <img
          src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
          alt={user.username}
          className={`w-full h-full rounded-xl object-cover border-2 ${isTop3 ? 'border-yellow-400/60 shadow-[0_0_12px_rgba(251,191,36,0.3)]' : 'border-white/10'}`}
        />
        {badge && <span className="absolute -bottom-1.5 -right-1.5 text-lg leading-none">{badge}</span>}
      </div>
      <p className={`font-black truncate w-full ${isTop3 ? 'text-sm text-white' : 'text-xs text-white/70'}`}>{user.username}</p>
      {sub && <p className={`text-[10px] mt-0.5 font-bold ${isTop3 ? 'text-yellow-400' : 'text-white/40'}`}>{sub}</p>}
    </motion.div>
  );
}

function Section({ id, label, icon: Icon, color, desc, children, count }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-12"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-black text-white">{label}</h2>
          <p className="text-xs text-white/40">{desc}</p>
        </div>
        {count != null && (
          <span className="text-xs bg-white/5 border border-white/10 px-3 py-1 rounded-full text-white/40 font-bold">{count} Einträge</span>
        )}
      </div>
      {children}
    </motion.section>
  );
}

export default function HallOfFame() {
  const [activeCategory, setActiveCategory] = useState('all');

  const { data: allUsers = [], isLoading } = useQuery({
    queryKey: ['hofUsers'],
    queryFn: () => base44.entities.AppUser.list('-tokens', 500),
    staleTime: 3 * 60 * 1000,
  });

  const approvedUsers = allUsers.filter(u => u.approved);

  // Compute lists
  const proPassLegends = approvedUsers.filter(u => u.pro_pass?.claimed_tiers?.length === 10).slice(0, 24);
  const richest = [...approvedUsers].sort((a, b) => (b.tokens || 0) - (a.tokens || 0)).slice(0, 24);
  const neonDashPros = [...approvedUsers]
    .filter(u => u.neon_dash_stats?.total_games > 0)
    .sort((a, b) => (b.neon_dash_stats?.total_games || 0) - (a.neon_dash_stats?.total_games || 0))
    .slice(0, 24);
  const bpMaxUsers = [...approvedUsers]
    .filter(u => (u.bp_level || 1) > 1)
    .sort((a, b) => (b.bp_level || 1) - (a.bp_level || 1))
    .slice(0, 24);
  const donors = approvedUsers.filter(u => u.is_donor).slice(0, 24);
  const streakKings = [...approvedUsers]
    .filter(u => (u.daily_login_streak || 0) > 0)
    .sort((a, b) => (b.daily_login_streak || 0) - (a.daily_login_streak || 0))
    .slice(0, 24);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalHonored = new Set([
    ...proPassLegends.map(u => u.id),
    ...donors.map(u => u.id),
    ...neonDashPros.slice(0, 5).map(u => u.id),
    ...bpMaxUsers.slice(0, 5).map(u => u.id),
  ]).size;

  return (
    <PageTransition>
      <div className="min-h-screen pb-24">
        {/* Hero */}
        <div className="relative overflow-hidden py-16 px-4 text-center mb-8"
          style={{ background: 'linear-gradient(180deg, rgba(251,191,36,0.08) 0%, transparent 100%)' }}>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-yellow-500/10 blur-[120px] rounded-full" />
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="w-20 h-20 mx-auto mb-5 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.4)]"
              style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(168,85,247,0.2))', border: '1px solid rgba(251,191,36,0.4)' }}>
              <Trophy className="w-10 h-10 text-yellow-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text mb-3"
              style={{ backgroundImage: 'linear-gradient(135deg, #fbbf24, #f97316, #c084fc)' }}>
              Hall of Fame
            </h1>
            <p className="text-white/50 text-base max-w-md mx-auto mb-4">
              Die Besten, Treuesten und Verdientesten der 7B Hub Community.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
              style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}>
              <Users className="w-4 h-4" /> {totalHonored} ausgezeichnete Mitglieder
            </div>
          </motion.div>
        </div>

        {/* Category Filter */}
        <div className="max-w-5xl mx-auto px-4 mb-8">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            <button onClick={() => setActiveCategory('all')}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeCategory === 'all' ? 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-300' : 'bg-white/5 border border-white/10 text-white/50 hover:text-white'}`}>
              Alle
            </button>
            {CATEGORIES.map(c => {
              const Icon = c.icon;
              return (
                <button key={c.id} onClick={() => setActiveCategory(c.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeCategory === c.id ? 'bg-white/15 border border-white/30 text-white' : 'bg-white/5 border border-white/10 text-white/50 hover:text-white'}`}>
                  <Icon className="w-3.5 h-3.5" />{c.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 space-y-4">

          {/* Pro Pass Legends */}
          {(activeCategory === 'all' || activeCategory === 'propass') && proPassLegends.length > 0 && (
            <Section id="propass" label="👑 Absolute Legenden" icon={Crown} color="from-yellow-500 to-amber-500" desc="Alle 10 Pro Pass Tiers abgeschlossen" count={proPassLegends.length}>
              <div className="rounded-2xl p-5 mb-2" style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.08), rgba(168,85,247,0.05))', border: '1px solid rgba(251,191,36,0.2)' }}>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {proPassLegends.map((u, i) => (
                    <AvatarCard key={u.id} user={u} rank={i + 1} badge="👑" sub="ABSOLUTE" />
                  ))}
                </div>
              </div>
            </Section>
          )}

          {/* Richest */}
          {(activeCategory === 'all' || activeCategory === 'tokens') && richest.length > 0 && (
            <Section id="tokens" label="💰 Token-Millionäre" icon={Coins} color="from-yellow-400 to-orange-500" desc="Meiste Tokens aktuell" count={richest.length}>
              <div className="glass-card rounded-2xl p-5 border border-yellow-500/10">
                <div className="space-y-2">
                  {richest.slice(0, 10).map((u, i) => (
                    <div key={u.id} className={`flex items-center gap-3 p-3 rounded-xl transition ${i < 3 ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-white/[0.03] border border-white/5'}`}>
                      <span className={`text-sm font-black w-6 text-center ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-white/30'}`}>#{i + 1}</span>
                      <img src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} alt="" className="w-9 h-9 rounded-xl object-cover border border-white/10" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{u.username}</p>
                        {u.active_title && <p className="text-[10px] text-cyan-400">{u.active_title}</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-black text-yellow-400">{(u.tokens || 0).toLocaleString()}</p>
                        <p className="text-[10px] text-white/30">Tokens</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Section>
          )}

          {/* Neon Dash */}
          {(activeCategory === 'all' || activeCategory === 'neondash') && neonDashPros.length > 0 && (
            <Section id="neondash" label="⚡ Neon Dash Pros" icon={Zap} color="from-cyan-400 to-violet-500" desc="Meiste gespielte Runden" count={neonDashPros.length}>
              <div className="glass-card rounded-2xl p-5 border border-cyan-500/10">
                <div className="space-y-2">
                  {neonDashPros.slice(0, 10).map((u, i) => (
                    <div key={u.id} className={`flex items-center gap-3 p-3 rounded-xl ${i < 3 ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-white/[0.03] border border-white/5'}`}>
                      <span className={`text-sm font-black w-6 text-center ${i === 0 ? 'text-cyan-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-violet-400' : 'text-white/30'}`}>#{i + 1}</span>
                      <img src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} alt="" className="w-9 h-9 rounded-xl object-cover border border-white/10" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{u.username}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-cyan-400">{(u.neon_dash_stats?.total_games || 0).toLocaleString()}</p>
                        <p className="text-[10px] text-white/30">Runden</p>
                      </div>
                      {u.neon_dash_stats?.high_score > 0 && (
                        <div className="text-right hidden sm:block">
                          <p className="font-black text-violet-400">{(u.neon_dash_stats?.high_score || 0).toLocaleString()}</p>
                          <p className="text-[10px] text-white/30">Highscore</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Section>
          )}

          {/* Battle Pass */}
          {(activeCategory === 'all' || activeCategory === 'battlepass') && bpMaxUsers.length > 0 && (
            <Section id="battlepass" label="🌟 Battle Pass Champions" icon={Star} color="from-violet-500 to-fuchsia-500" desc="Höchstes Battle Pass Level" count={bpMaxUsers.length}>
              <div className="glass-card rounded-2xl p-5 border border-violet-500/10">
                <div className="space-y-2">
                  {bpMaxUsers.slice(0, 10).map((u, i) => (
                    <div key={u.id} className={`flex items-center gap-3 p-3 rounded-xl ${i < 3 ? 'bg-violet-500/10 border border-violet-500/20' : 'bg-white/[0.03] border border-white/5'}`}>
                      <span className={`text-sm font-black w-6 text-center ${i === 0 ? 'text-violet-400' : 'text-white/30'}`}>#{i + 1}</span>
                      <img src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} alt="" className="w-9 h-9 rounded-xl object-cover border border-white/10" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{u.username}</p>
                        {u.bp_premium && <span className="text-[10px] text-yellow-400 font-bold">⭐ Premium</span>}
                      </div>
                      <div className="text-right">
                        <p className="font-black text-violet-400">Level {u.bp_level || 1}</p>
                        <p className="text-[10px] text-white/30">{(u.bp_xp || 0).toLocaleString()} XP</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Section>
          )}

          {/* Donors */}
          {(activeCategory === 'all' || activeCategory === 'donors') && donors.length > 0 && (
            <Section id="donors" label="🔥 Plattform-Unterstützer" icon={Flame} color="from-orange-400 to-red-500" desc="Spender, die 7B Hub am Leben halten" count={donors.length}>
              <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, rgba(251,146,60,0.08), rgba(239,68,68,0.05))', border: '1px solid rgba(251,146,60,0.2)' }}>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {donors.map((u, i) => (
                    <AvatarCard key={u.id} user={u} rank={i + 1} badge="🔥" sub="Spender" />
                  ))}
                </div>
              </div>
            </Section>
          )}

          {/* Streak Kings */}
          {(activeCategory === 'all' || activeCategory === 'streaks') && streakKings.length > 0 && (
            <Section id="streaks" label="🎮 Streak-Könige" icon={Gamepad2} color="from-emerald-400 to-teal-500" desc="Längster täglicher Login-Streak" count={streakKings.length}>
              <div className="glass-card rounded-2xl p-5 border border-emerald-500/10">
                <div className="space-y-2">
                  {streakKings.slice(0, 10).map((u, i) => (
                    <div key={u.id} className={`flex items-center gap-3 p-3 rounded-xl ${i < 3 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/[0.03] border border-white/5'}`}>
                      <span className={`text-sm font-black w-6 text-center ${i === 0 ? 'text-emerald-400' : 'text-white/30'}`}>#{i + 1}</span>
                      <img src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} alt="" className="w-9 h-9 rounded-xl object-cover border border-white/10" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{u.username}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-emerald-400">{u.daily_login_streak} Tage</p>
                        <p className="text-[10px] text-white/30">Streak</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Section>
          )}

          {/* Empty state */}
          {activeCategory !== 'all' && (
            proPassLegends.length === 0 && richest.length === 0 && neonDashPros.length === 0 &&
            bpMaxUsers.length === 0 && donors.length === 0 && streakKings.length === 0
          ) && (
            <div className="text-center py-20 text-white/30">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Noch keine Einträge in dieser Kategorie</p>
            </div>
          )}

        </div>
      </div>
    </PageTransition>
  );
}