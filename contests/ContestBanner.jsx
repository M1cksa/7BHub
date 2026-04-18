import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, Trophy, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

function getTimeLeft(endsAt) {
  if (!endsAt) return null;
  const diff = new Date(endsAt) - new Date();
  if (diff <= 0) return 'Abgelaufen';
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  if (d > 0) return `${d}T ${h}h`;
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
}

export default function ContestBanner({ game, userProgress = 0 }) {
  const [contests, setContests] = useState([]);
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dismissedContests') || '[]'); } catch { return []; }
  });
  const [claimed, setClaimed] = useState(() => {
    try { return JSON.parse(localStorage.getItem('claimedContests') || '[]'); } catch { return []; }
  });
  const [claiming, setClaiming] = useState(false);
  const [justClaimed, setJustClaimed] = useState(false);

  useEffect(() => {
    base44.entities.GameContest.filter({ game, is_active: true }, '-created_date', 5)
      .then(setContests)
      .catch(() => {});
  }, [game]);

  const visible = contests.filter(c => !dismissed.includes(c.id));
  if (visible.length === 0) return null;

  const contest = visible[0];
  const pct = Math.min(100, (userProgress / (contest.goal || 1)) * 100);
  const timeLeft = getTimeLeft(contest.ends_at);
  const color = contest.color || '#f59e0b';
  const isGoalReached = userProgress >= (contest.goal || 1);
  const isClaimed = claimed.includes(contest.id);

  function dismiss() {
    const next = [...dismissed, contest.id];
    setDismissed(next);
    localStorage.setItem('dismissedContests', JSON.stringify(next));
  }

  async function claimReward() {
    if (claiming || isClaimed || !isGoalReached) return;
    setClaiming(true);
    try {
      const userStr = localStorage.getItem('app_user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user) { toast.error('Nicht eingeloggt'); setClaiming(false); return; }

      const rewardTokens = contest.reward_tokens || 0;
      if (rewardTokens > 0) {
        const updated = await base44.entities.AppUser.update(user.id, {
          tokens: (user.tokens || 0) + rewardTokens
        });
        await base44.entities.TokenTransaction.create({
          user_id: user.id, username: user.username,
          amount: rewardTokens,
          source: `🏆 Wettbewerb: ${contest.title}`,
          category: 'earned',
        }).catch(() => {});
        localStorage.setItem('app_user', JSON.stringify(updated));
        window.dispatchEvent(new Event('user-updated'));
        window.dispatchEvent(new CustomEvent('token-reward', { detail: { amount: rewardTokens, source: contest.title, rarity: 'legendary' } }));
      }

      const next = [...claimed, contest.id];
      setClaimed(next);
      localStorage.setItem('claimedContests', JSON.stringify(next));
      setJustClaimed(true);
      confetti({ particleCount: 180, spread: 80, origin: { y: 0.6 }, colors: [color, '#ffffff', '#fbbf24'] });
      toast.success(`🏆 ${contest.title} abgeschlossen! +${rewardTokens.toLocaleString()} Tokens!`);
    } catch (e) {
      toast.error('Fehler beim Einlösen');
    }
    setClaiming(false);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8 }}
        className="relative rounded-3xl p-4 border mb-5 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${color}18, rgba(0,0,0,0.5))`,
          borderColor: isClaimed ? 'rgba(34,197,94,0.4)' : `${color}45`,
          boxShadow: isClaimed ? '0 8px 32px -8px rgba(34,197,94,0.25)' : `0 8px 32px -8px ${color}35`,
        }}
      >
        {/* Animated background glow */}
        <motion.div
          animate={{ opacity: [0.25, 0.55, 0.25], scale: [1, 1.15, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute -top-12 -right-12 w-56 h-56 rounded-full blur-[70px] pointer-events-none"
          style={{ background: isClaimed ? 'rgba(34,197,94,0.3)' : `${color}35` }}
        />

        {/* Shimmer line at top */}
        <motion.div className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
          animate={{ opacity: [0.3, 0.9, 0.3] }} transition={{ repeat: Infinity, duration: 2.5 }} />

        <div className="flex items-start gap-3 relative z-10">
          {/* Icon */}
          <motion.div
            animate={isGoalReached && !isClaimed ? { rotate: [0, -8, 8, -8, 0], scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${color}35, ${color}12)`,
              border: `1px solid ${color}55`,
              boxShadow: `inset 0 0 20px ${color}25, 0 0 20px ${color}25`,
            }}>
            {isClaimed ? '✅' : contest.emoji || '🏆'}
          </motion.div>

          <div className="flex-1 min-w-0">
            {/* Title row */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-white font-black text-sm md:text-base">{contest.title}</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full font-black flex items-center gap-1"
                style={{ background: `${color}22`, color, border: `1px solid ${color}45` }}>
                <Flame className="w-2.5 h-2.5" /> EVENT
              </span>
              {timeLeft && !isClaimed && (
                <span className="text-[9px] text-white/50 font-bold bg-black/35 px-2 py-0.5 rounded-full border border-white/10">
                  ⏱ {timeLeft}
                </span>
              )}
              {isClaimed && (
                <span className="text-[9px] text-green-400 font-black bg-green-500/15 px-2 py-0.5 rounded-full border border-green-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Abgeholt
                </span>
              )}
            </div>

            {contest.description && (
              <p className="text-white/55 text-[11px] mb-2.5 leading-relaxed">{contest.description}</p>
            )}

            {/* Progress Bar */}
            <div className="flex items-center gap-3 mb-2.5">
              <div className="flex-1 h-3 rounded-full overflow-hidden relative"
                style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                  transition={{ duration: 1.2, type: 'spring' }}
                  className="absolute top-0 left-0 bottom-0 rounded-full"
                  style={{ background: isClaimed ? '#22c55e' : `linear-gradient(90deg, ${color}cc, ${color})` }}>
                  {pct > 15 && (
                    <motion.div className="absolute inset-0 bg-white/25 rounded-full"
                      animate={{ x: ['-100%', '100%'] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }} />
                  )}
                </motion.div>
              </div>
              <span className="text-xs font-black whitespace-nowrap" style={{ color: isClaimed ? '#4ade80' : color }}>
                {Math.min(userProgress, contest.goal)} / {contest.goal}
              </span>
            </div>

            {/* Reward row */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              {contest.reward_tokens > 0 && (
                <div className="flex items-center gap-1.5 text-xs font-black text-yellow-400 bg-yellow-500/12 px-3 py-1.5 rounded-xl border border-yellow-500/25">
                  🪙 +{contest.reward_tokens.toLocaleString()} Tokens
                  {contest.reward_label && <span className="text-white/40 font-normal">· {contest.reward_label}</span>}
                </div>
              )}

              {/* CLAIM BUTTON */}
              {isGoalReached && !isClaimed && (
                <motion.button
                  onClick={claimReward}
                  disabled={claiming}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  animate={{ boxShadow: [`0 0 15px ${color}50`, `0 0 35px ${color}90`, `0 0 15px ${color}50`] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="px-4 py-2 rounded-xl font-black text-xs text-black flex items-center gap-1.5"
                  style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
                  <Trophy className="w-3.5 h-3.5" />
                  {claiming ? 'Wird eingelöst...' : '🎉 Belohnung einlösen!'}
                </motion.button>
              )}
            </div>
          </div>

          <button onClick={dismiss}
            className="text-white/25 hover:text-white/70 p-1.5 rounded-lg hover:bg-white/8 flex-shrink-0 transition-all mt-1 z-20">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Reached - glow pulse */}
        {isGoalReached && !isClaimed && (
          <motion.div className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{ border: `1.5px solid ${color}` }}
            animate={{ opacity: [0.2, 0.7, 0.2] }} transition={{ repeat: Infinity, duration: 1.5 }} />
        )}
      </motion.div>
    </AnimatePresence>
  );
}