import { motion } from 'framer-motion';
import { BarChart2, ExternalLink, TrendingUp, Eye, Users, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminAnalytics({ stats, videos, users }) {
  // Category distribution
  const categoryCount = (videos || []).reduce((acc, v) => {
    acc[v.category || 'other'] = (acc[v.category || 'other'] || 0) + 1;
    return acc;
  }, {});
  const topCategories = Object.entries(categoryCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  // Registration over time (last 7 months)
  const now = new Date();
  const monthlyRegistrations = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const count = (users || []).filter(u => {
      const reg = new Date(u.created_date);
      return reg.getMonth() === d.getMonth() && reg.getFullYear() === d.getFullYear();
    }).length;
    return { month: d.toLocaleString('de', { month: 'short' }), count };
  });
  const maxReg = Math.max(...monthlyRegistrations.map(m => m.count), 1);

  // Audience groups
  const audienceCount = (users || []).reduce((acc, u) => {
    const g = u.audience_group || 'unbekannt';
    acc[g] = (acc[g] || 0) + 1;
    return acc;
  }, {});

  // Top videos by views
  const topVideos = [...(videos || [])].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-emerald-400" /> Analytics & Einblicke
        </h2>
        <Button
          onClick={() => window.open('https://analytics.google.com', '_blank')}
          variant="outline"
          className="gap-2 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
        >
          <ExternalLink className="w-4 h-4" />
          Google Analytics öffnen
        </Button>
      </div>

      {/* Google Analytics Embed Notice */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <BarChart2 className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-black text-white mb-1">Google Analytics Dashboard</h3>
            <p className="text-white/60 text-sm mb-4">
              Für vollständige Nutzeranalytik, Seitenaufrufe, Verweildauer und Gerätestatistiken, öffne dein Google Analytics Dashboard direkt.
              Stelle sicher, dass du den Tracking-Code (gtag.js) in deiner App eingebunden hast.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => window.open('https://analytics.google.com', '_blank')}
                className="bg-emerald-600 hover:bg-emerald-500 gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Google Analytics öffnen
              </Button>
              <Button
                onClick={() => window.open('https://search.google.com/search-console', '_blank')}
                variant="outline"
                className="gap-2 border-white/10"
              >
                <ExternalLink className="w-4 h-4" />
                Search Console
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Internal Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Monthly Registrations */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-5 border border-white/10 md:col-span-2">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" /> Registrierungen (letzte 6 Monate)
          </h3>
          <div className="flex items-end gap-2 h-32">
            {monthlyRegistrations.map(m => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-white/40">{m.count}</span>
                <div className="w-full bg-white/5 rounded-t-lg overflow-hidden" style={{ height: '80px' }}>
                  <div
                    className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-lg transition-all"
                    style={{ height: `${(m.count / maxReg) * 100}%`, marginTop: 'auto' }}
                  />
                </div>
                <span className="text-[11px] text-white/40">{m.month}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Audience Groups */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass-card rounded-2xl p-5 border border-white/10">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-violet-400" /> Zielgruppen
          </h3>
          <div className="space-y-3">
            {Object.entries(audienceCount).map(([group, count]) => {
              const total = Object.values(audienceCount).reduce((a, b) => a + b, 0);
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const colorMap = { girl: 'from-pink-500 to-rose-400', boy: 'from-blue-500 to-cyan-400', mixed: 'from-violet-500 to-purple-400', unbekannt: 'from-gray-500 to-gray-400' };
              return (
                <div key={group}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/60 capitalize">{group}</span>
                    <span className="text-white font-bold">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full">
                    <div className={`h-full bg-gradient-to-r ${colorMap[group] || 'from-gray-500 to-gray-400'} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Video Categories */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-5 border border-white/10">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Video className="w-4 h-4 text-violet-400" /> Top Video-Kategorien
          </h3>
          <div className="space-y-2">
            {topCategories.map(([cat, count], i) => {
              const maxCat = topCategories[0]?.[1] || 1;
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-xs text-white/30 w-4">#{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-white/70 capitalize">{cat}</span>
                      <span className="text-white/50">{count}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full">
                      <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-400 rounded-full" style={{ width: `${(count / maxCat) * 100}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Top Videos by Views */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="glass-card rounded-2xl p-5 border border-white/10 md:col-span-2">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-400" /> Top 5 Videos (Views)
          </h3>
          <div className="space-y-3">
            {topVideos.map((v, i) => {
              const maxViews = topVideos[0]?.views || 1;
              return (
                <div key={v.id} className="flex items-center gap-3">
                  <span className={`text-sm font-black w-5 ${i === 0 ? 'text-yellow-400' : 'text-white/30'}`}>#{i + 1}</span>
                  {v.thumbnail_url && <img src={v.thumbnail_url} alt="" className="w-12 h-8 rounded-lg object-cover flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{v.title}</p>
                    <div className="h-1.5 bg-white/5 rounded-full mt-1">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: `${((v.views || 0) / maxViews) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-xs text-white/40 flex-shrink-0">{(v.views || 0).toLocaleString()}</span>
                </div>
              );
            })}
            {topVideos.length === 0 && <p className="text-white/30 text-sm">Keine Videos vorhanden</p>}
          </div>
        </motion.div>
      </div>
    </div>
  );
}