import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Check, Lock, Zap, Sparkles, Gift } from 'lucide-react';
import { awardXpAndTokens } from '@/components/battlepass/xpUtils';

const getTodayKey = () => new Date().toISOString().split('T')[0];
const getWeekKey = () => {
  const d = new Date();
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
};

// ── Claim state persisted in AppUser.neon_dash_stats.quest_claims ──
const getClaimStoreKey = (userId, type, periodKey) => `qc_${userId}_${type}_${periodKey}`;

const DAILY_DEFS = [
  { id: 'login',      title: '🟢 Einloggen',           desc: 'Öffne den Hub',          xp: 500,  tokens: 50,  max: 1,   type: 'login' },
  { id: 'watch3',     title: '▶️ Zuschauer',             desc: '3 Videos ansehen',       xp: 750,  tokens: 100, max: 3,   type: 'watch' },
  { id: 'like1',      title: '❤️ Supporter',             desc: '1 Video liken',          xp: 500,  tokens: 75,  max: 1,   type: 'like' },
  { id: 'neondash1',  title: '🎮 Neon Dash',             desc: '1 Runde Neon Dash',      xp: 1000, tokens: 150, max: 1,   type: 'neondash' },
];

const WEEKLY_DEFS = [
  { id: 'watch20',    title: '🎬 Marathon',              desc: '20 Videos schauen',      xp: 3000, tokens: 300, max: 20,  type: 'watch' },
  { id: 'like10',     title: '💎 Fan-Wochen',            desc: '10 Videos liken',        xp: 2000, tokens: 200, max: 10,  type: 'like' },
  { id: 'neondash5',  title: '⚡ Neon Veteran',          desc: '5x Neon Dash spielen',   xp: 4000, tokens: 500, max: 5,   type: 'neondash' },
  { id: 'comment5',   title: '💬 Community',             desc: '5 Kommentare schreiben', xp: 2500, tokens: 250, max: 5,   type: 'comment' },
];

export default function BPQuestsTab({ user, setUser }) {
  const [dailyClaims, setDailyClaims] = useState({});
  const [weeklyClaims, setWeeklyClaims] = useState({});
  const [claiming, setClaiming] = useState(null);
  const queryClient = useQueryClient();

  // Load claim state: DB (source of truth) + localStorage (fallback/cache)
  useEffect(() => {
    if (!user) return;
    const todayKey = getTodayKey();
    const weekKey = getWeekKey();
    // Merge DB claims (stored in neon_dash_stats) with localStorage
    const dbStats = user.neon_dash_stats || {};
    const dbDaily = dbStats[`quest_daily_${todayKey}`] || {};
    const dbWeekly = dbStats[`quest_weekly_${weekKey}`] || {};
    const lsDaily = JSON.parse(localStorage.getItem(`bp_daily_claims_${user.id}_${todayKey}`) || '{}');
    const lsWeekly = JSON.parse(localStorage.getItem(`bp_weekly_claims_${user.id}_${weekKey}`) || '{}');
    setDailyClaims({ ...lsDaily, ...dbDaily });
    setWeeklyClaims({ ...lsWeekly, ...dbWeekly });
  }, [user?.id]);

  // Fetch today's activity stats
  const { data: stats } = useQuery({
    queryKey: ['bpQuestStats', user?.id],
    queryFn: async () => {
      if (!user) return {};
      const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
      const startOfWeek = new Date(); startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());startOfWeek.setHours(0,0,0,0);

      const [historyDay, historyWeek, likesDay, likesWeek, commentsWeek, ndScoresDay, ndScoresWeek] = await Promise.all([
        base44.entities.WatchHistory.filter({ user_id: user.id }, '-created_date', 50),
        base44.entities.WatchHistory.filter({ user_id: user.id }, '-created_date', 200),
        base44.entities.Like.filter({ user_id: user.id }, '-created_date', 50),
        base44.entities.Like.filter({ user_id: user.id }, '-created_date', 200),
        base44.entities.Comment.filter({ author_name: user.username }, '-created_date', 50),
        base44.entities.GameScore.filter({ player_id: user.id, game_type: 'neon_dash' }, '-created_date', 20),
        base44.entities.GameScore.filter({ player_id: user.id, game_type: 'neon_dash' }, '-created_date', 100),
      ]);

      return {
        watchedDay: historyDay.filter(h => new Date(h.created_date) >= startOfDay).length,
        watchedWeek: historyWeek.filter(h => new Date(h.created_date) >= startOfWeek).length,
        likedDay: likesDay.filter(l => new Date(l.created_date) >= startOfDay).length,
        likedWeek: likesWeek.filter(l => new Date(l.created_date) >= startOfWeek).length,
        commentsWeek: commentsWeek.filter(c => new Date(c.created_date) >= startOfWeek).length,
        ndPlayedDay: ndScoresDay.filter(s => new Date(s.created_date) >= startOfDay).length,
        ndPlayedWeek: ndScoresWeek.filter(s => new Date(s.created_date) >= startOfWeek).length,
      };
    },
    enabled: !!user,
    refetchInterval: 20000,
  });

  const getProgress = (def, isWeekly) => {
    if (!stats) return 0;
    if (def.type === 'login') return 1;
    if (def.type === 'watch') return isWeekly ? (stats.watchedWeek || 0) : (stats.watchedDay || 0);
    if (def.type === 'like') return isWeekly ? (stats.likedWeek || 0) : (stats.likedDay || 0);
    if (def.type === 'neondash') return isWeekly ? (stats.ndPlayedWeek || 0) : (stats.ndPlayedDay || 0);
    if (def.type === 'comment') return stats.commentsWeek || 0;
    return 0;
  };

  const handleClaim = async (def, isWeekly) => {
    if (claiming) return;
    const claims = isWeekly ? weeklyClaims : dailyClaims;
    if (claims[def.id]) return;
    const progress = getProgress(def, isWeekly);
    if (progress < def.max) { toast.error('Quest noch nicht abgeschlossen!'); return; }

    setClaiming(def.id);
    try {
      const freshStr = localStorage.getItem('app_user');
      const freshUser = freshStr ? JSON.parse(freshStr) : user;

      // 1. Award XP & Tokens
      const updated = await awardXpAndTokens(freshUser, def.xp, def.tokens, `Quest: ${def.title}`);
      if (!updated) throw new Error('awardXpAndTokens returned null');

      // 2. Persist claim state to DB — fetch fresh stats first to avoid overwriting concurrent changes
      const todayKey = getTodayKey();
      const weekKey = getWeekKey();
      const periodKey = isWeekly ? weekKey : todayKey;
      const periodField = isWeekly ? `quest_weekly_${periodKey}` : `quest_daily_${periodKey}`;
      // Use freshest neon_dash_stats from the just-updated user object
      const freshStats = updated.neon_dash_stats || {};
      // Double-check: if already claimed (race condition), bail out
      if (freshStats[periodField]?.[def.id]) {
        toast.error('Quest bereits abgeholt (anderes Gerät?)');
        setClaiming(null);
        return;
      }
      const newPeriodClaims = { ...(freshStats[periodField] || {}), [def.id]: true };
      const finalUpdated = await base44.entities.AppUser.update(updated.id, {
        neon_dash_stats: { ...freshStats, [periodField]: newPeriodClaims }
      });

      // 3. Update localStorage cache
      const lsKey = isWeekly
        ? `bp_weekly_claims_${user.id}_${weekKey}`
        : `bp_daily_claims_${user.id}_${todayKey}`;
      const newClaims = { ...claims, [def.id]: true };
      localStorage.setItem(lsKey, JSON.stringify(newClaims));
      if (isWeekly) setWeeklyClaims(newClaims);
      else setDailyClaims(newClaims);

      // 4. Sync user state
      localStorage.setItem('app_user', JSON.stringify(finalUpdated));
      setUser(finalUpdated);
      window.dispatchEvent(new Event('user-updated'));
      queryClient.invalidateQueries({ queryKey: ['bpQuestStats', user?.id] });

      toast.success(`✅ ${def.title} abgeschlossen! +${def.xp.toLocaleString()} XP · +${def.tokens} 🪙`);
    } catch(e) {
      console.error('Quest claim error:', e);
      toast.error('Fehler beim Abholen — bitte erneut versuchen');
    }
    setClaiming(null);
  };

  const renderQuest = (def, isWeekly) => {
    const claims = isWeekly ? weeklyClaims : dailyClaims;
    const claimed = !!claims[def.id];
    const progress = getProgress(def, isWeekly);
    const done = progress >= def.max;
    const canClaim = done && !claimed;
    const pct = Math.min((progress / def.max) * 100, 100);

    return (
      <motion.div key={def.id}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl relative overflow-hidden"
        style={{
          background: claimed ? 'rgba(34,197,94,0.04)' : canClaim ? 'rgba(6,182,212,0.07)' : 'rgba(0,0,0,0.3)',
          border: `1px solid ${claimed ? 'rgba(34,197,94,0.2)' : canClaim ? 'rgba(6,182,212,0.4)' : 'rgba(255,255,255,0.05)'}`,
        }}>
        {canClaim && (
          <motion.div className="absolute inset-0 rounded-xl border border-cyan-400/30"
            animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ repeat: Infinity, duration: 1.8 }} />
        )}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center border flex-shrink-0 ${
              claimed ? 'bg-green-500/20 border-green-500' : canClaim ? 'bg-cyan-500/20 border-cyan-400' : 'bg-white/5 border-white/15'
            }`}>
              {claimed ? <Check className="w-3.5 h-3.5 text-green-400" /> : canClaim ? <Gift className="w-3.5 h-3.5 text-cyan-400" /> : <Lock className="w-3 h-3 text-white/30" />}
            </div>
            <div>
              <div className={`text-sm font-bold ${claimed ? 'text-white/40 line-through' : 'text-white/90'}`}>{def.title}</div>
              <div className="text-[10px] text-white/35">{def.desc}</div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-3">
            <span className="text-xs font-black text-purple-400">+{def.xp} XP</span>
            <span className="text-[10px] font-bold text-yellow-400">+{def.tokens} 🪙</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden mb-2">
          <motion.div className="h-full rounded-full"
            style={{ background: claimed ? 'rgba(34,197,94,0.5)' : 'linear-gradient(90deg, #7c3aed, #06b6d4)' }}
            initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/30 font-bold">{Math.min(progress, def.max)} / {def.max}</span>
          {canClaim && (
            <button onClick={() => handleClaim(def, isWeekly)} disabled={claiming === def.id}
              className="px-3 py-1 rounded-lg text-[11px] font-black text-black transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #06b6d4, #a855f7)', opacity: claiming === def.id ? 0.6 : 1 }}>
              {claiming === def.id ? '...' : 'Abholen!'}
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  // Count claimable quests
  const claimableDaily = DAILY_DEFS.filter(d => !dailyClaims[d.id] && getProgress(d, false) >= d.max).length;
  const claimableWeekly = WEEKLY_DEFS.filter(d => !weeklyClaims[d.id] && getProgress(d, true) >= d.max).length;
  const totalClaimable = claimableDaily + claimableWeekly;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-7 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black mb-1" style={{ background: 'linear-gradient(90deg,#67e8f9,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ⚡ Tägliche &amp; Wöchentliche Quests
          </h2>
          <p className="text-white/35 text-sm">Sammle XP &amp; Tokens — setzt sich täglich bzw. wöchentlich zurück.</p>
        </div>
        {totalClaimable > 0 && (
          <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-black border"
            style={{ background: 'rgba(6,182,212,0.15)', borderColor: 'rgba(6,182,212,0.5)', color: '#67e8f9' }}>
            {totalClaimable} bereit!
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 className="font-black text-cyan-400 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4" /> Tägliche Missionen
            <span className="text-[10px] font-bold text-white/25 ml-auto">{getTodayKey()}</span>
          </h3>
          <div className="space-y-3">
            {DAILY_DEFS.map(def => renderQuest(def, false))}
          </div>
        </div>

        {/* Weekly */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 className="font-black text-purple-400 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Wöchentliche Herausforderungen
            <span className="text-[10px] font-bold text-white/25 ml-auto">{getWeekKey()}</span>
          </h3>
          <div className="space-y-3">
            {WEEKLY_DEFS.map(def => renderQuest(def, true))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}