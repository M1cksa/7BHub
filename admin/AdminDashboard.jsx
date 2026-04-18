import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Users, Video, Eye, HelpCircle, AlertTriangle, Radio,
  TrendingUp, Clock, Crown, Star, Coins, Shield,
  CheckCircle, XCircle, MessageSquare, BarChart2, ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

function StatCard({ icon: Icon, label, value, sub, color = 'cyan', delay = 0, onClick }) {
  const colors = {
    cyan: 'from-cyan-600/20 to-cyan-500/5 border-cyan-500/20 text-cyan-400',
    violet: 'from-violet-600/20 to-violet-500/5 border-violet-500/20 text-violet-400',
    emerald: 'from-emerald-600/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
    amber: 'from-amber-600/20 to-amber-500/5 border-amber-500/20 text-amber-400',
    red: 'from-red-600/20 to-red-500/5 border-red-500/20 text-red-400',
    blue: 'from-blue-600/20 to-blue-500/5 border-blue-500/20 text-blue-400',
    pink: 'from-pink-600/20 to-pink-500/5 border-pink-500/20 text-pink-400',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      onClick={onClick}
      className={`relative p-5 rounded-2xl bg-gradient-to-br border backdrop-blur-xl ${colors[color]} ${onClick ? 'cursor-pointer hover:scale-[1.02] transition-transform' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-current/10 flex items-center justify-center bg-white/5`}>
          <Icon className={`w-5 h-5 ${colors[color].split(' ').at(-1)}`} />
        </div>
        {onClick && <ArrowUpRight className="w-4 h-4 opacity-40" />}
      </div>
      <p className="text-3xl font-black text-white mb-0.5">{value}</p>
      <p className="text-sm text-white/50">{label}</p>
      {sub && <p className={`text-xs mt-1 font-semibold ${colors[color].split(' ').at(-1)}`}>{sub}</p>}
    </motion.div>
  );
}

export default function AdminDashboard({ stats, users, videos, tickets, reports, onNavigate }) {
  const {
    totalUsers, approvedUsers, pendingUsers, bannedUsers,
    totalVideos, liveCount, totalViews, totalMessages,
    openTickets, pendingReports, donorCount, newsletterCount,
    totalTokens, avgTokens
  } = stats;

  // Top 5 creators by views
  const topCreators = [...(videos || [])]
    .reduce((acc, v) => {
      const existing = acc.find(c => c.name === v.creator_name);
      if (existing) existing.views += (v.views || 0);
      else acc.push({ name: v.creator_name, views: v.views || 0, avatar: v.creator_avatar });
      return acc;
    }, [])
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  const recentUsers = [...(users || [])].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 5);
  const recentVideos = [...(videos || [])].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* KPI Grid */}
      <div>
        <h2 className="text-lg font-bold text-white/70 mb-4 flex items-center gap-2">
          <BarChart2 className="w-5 h-5" /> Übersicht
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Nutzer gesamt" value={totalUsers} sub={`${approvedUsers} aktiv`} color="cyan" delay={0} onClick={() => onNavigate('users')} />
          <StatCard icon={Clock} label="Wartend" value={pendingUsers} sub="auf Freischaltung" color={pendingUsers > 0 ? 'amber' : 'emerald'} delay={0.05} onClick={pendingUsers > 0 ? () => onNavigate('pending') : undefined} />
          <StatCard icon={Video} label="Videos" value={totalVideos} sub={liveCount > 0 ? `${liveCount} live` : 'keine live'} color="violet" delay={0.1} onClick={() => onNavigate('videos')} />
          <StatCard icon={Eye} label="Views gesamt" value={totalViews.toLocaleString()} color="blue" delay={0.15} />
          <StatCard icon={HelpCircle} label="Support-Tickets" value={openTickets} sub="offen" color={openTickets > 0 ? 'red' : 'emerald'} delay={0.2} onClick={() => onNavigate('tickets')} />
          <StatCard icon={AlertTriangle} label="Meldungen" value={pendingReports} sub="ausstehend" color={pendingReports > 0 ? 'red' : 'emerald'} delay={0.25} onClick={() => onNavigate('reports')} />
          <StatCard icon={Star} label="Spender" value={donorCount} sub="unterstützen uns" color="amber" delay={0.3} />
          <StatCard icon={MessageSquare} label="Chat Nachrichten" value={totalMessages} color="pink" delay={0.35} onClick={() => onNavigate('messages')} />
        </div>
      </div>

      {/* Token & User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-5 border border-white/10 col-span-1">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Coins className="w-4 h-4 text-yellow-400" /> Token-Übersicht
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/50 text-sm">Tokens gesamt</span>
              <span className="font-black text-yellow-400">{totalTokens.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/50 text-sm">Ø pro Nutzer</span>
              <span className="font-bold text-white">{Math.round(avgTokens).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/50 text-sm">Newsletter-Abo</span>
              <span className="font-bold text-cyan-400">{newsletterCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/50 text-sm">Gesperrt</span>
              <span className={`font-bold ${bannedUsers > 0 ? 'text-red-400' : 'text-white/30'}`}>{bannedUsers}</span>
            </div>
          </div>
        </motion.div>

        {/* Top Creators */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
          className="glass-card rounded-2xl p-5 border border-white/10">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Crown className="w-4 h-4 text-violet-400" /> Top Creator (Views)
          </h3>
          <div className="space-y-2">
            {topCreators.map((c, i) => (
              <div key={c.name} className="flex items-center gap-3">
                <span className={`text-xs font-black w-5 ${i === 0 ? 'text-yellow-400' : 'text-white/30'}`}>#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{c.name}</p>
                  <div className="h-1 bg-white/5 rounded-full mt-1">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full"
                      style={{ width: `${Math.min(100, (c.views / (topCreators[0]?.views || 1)) * 100)}%` }} />
                  </div>
                </div>
                <span className="text-xs text-white/40">{c.views.toLocaleString()}</span>
              </div>
            ))}
            {topCreators.length === 0 && <p className="text-white/30 text-sm">Keine Daten</p>}
          </div>
        </motion.div>

        {/* User Status Donut */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl p-5 border border-white/10">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" /> Nutzer-Status
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Aktiv & genehmigt', count: approvedUsers, color: 'bg-emerald-500', total: totalUsers },
              { label: 'Wartend', count: pendingUsers, color: 'bg-amber-500', total: totalUsers },
              { label: 'Gesperrt', count: bannedUsers, color: 'bg-red-500', total: totalUsers },
              { label: 'Spender', count: donorCount, color: 'bg-yellow-400', total: totalUsers },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/50">{item.label}</span>
                  <span className="text-white font-bold">{item.count}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full">
                  <div className={`h-full ${item.color} rounded-full`}
                    style={{ width: `${item.total > 0 ? (item.count / item.total) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
          className="glass-card rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" /> Neueste Nutzer
            </h3>
            <button onClick={() => onNavigate('users')} className="text-xs text-cyan-400 hover:text-cyan-300">Alle →</button>
          </div>
          <div className="space-y-2">
            {recentUsers.map(u => (
              <div key={u.id} className="flex items-center gap-3">
                <img src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`}
                  alt="" className="w-8 h-8 rounded-full" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{u.username}</p>
                  <p className="text-xs text-white/30">{new Date(u.created_date).toLocaleDateString('de-DE')}</p>
                </div>
                {u.approved ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-amber-400" />}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="glass-card rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Video className="w-4 h-4 text-violet-400" /> Neueste Videos
            </h3>
            <button onClick={() => onNavigate('videos')} className="text-xs text-violet-400 hover:text-violet-300">Alle →</button>
          </div>
          <div className="space-y-2">
            {recentVideos.map(v => (
              <div key={v.id} className="flex items-center gap-3">
                <div className="w-12 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                  {v.thumbnail_url && <img src={v.thumbnail_url} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{v.title}</p>
                  <p className="text-xs text-white/30">{v.creator_name} · {(v.views || 0).toLocaleString()} Views</p>
                </div>
                {v.is_live && <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded font-bold">LIVE</span>}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
        className="glass-card rounded-2xl p-5 border border-white/10">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" /> Schnellzugriff
        </h3>
        <div className="flex flex-wrap gap-3">
          {[
            { label: `${pendingUsers} freischalten`, color: 'amber', tab: 'pending' },
            { label: `${openTickets} Tickets`, color: 'cyan', tab: 'tickets' },
            { label: `${pendingReports} Meldungen`, color: 'red', tab: 'reports' },
            { label: 'Newsletter', color: 'blue', tab: 'newsletter' },
            { label: 'Update erstellen', color: 'violet', tab: 'updates' },
            { label: 'Analytics', color: 'emerald', tab: 'analytics' },
          ].map(a => (
            <button key={a.tab} onClick={() => onNavigate(a.tab)}
              className={`px-4 py-2 rounded-xl text-sm font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all`}>
              {a.label}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}