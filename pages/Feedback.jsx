import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Send, ThumbsUp, CheckCircle2, Clock, XCircle, Sparkles, Zap, Bug, Rocket, MessageSquare, Trophy, ArrowUp, Plus, X, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import PageMaintenanceCheck from '@/components/PageMaintenanceCheck';
import { awardXpAndTokens, XP_SOURCES } from '@/components/battlepass/xpUtils';

const categoryConfig = {
  feature:     { label: 'Feature',       emoji: '💡', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/30', glow: 'rgba(139,92,246,0.3)' },
  bug:         { label: 'Bug',           emoji: '🐛', color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30',    glow: 'rgba(239,68,68,0.3)' },
  improvement: { label: 'Verbesserung', emoji: '⚡', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', glow: 'rgba(245,158,11,0.3)' },
  other:       { label: 'Sonstiges',    emoji: '📝', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30', glow: 'rgba(100,116,139,0.3)' },
};

const statusConfig = {
  pending:   { label: 'Ausstehend', icon: Clock,        color: 'text-white/40', bg: 'bg-white/5' },
  reviewed:  { label: 'Geprüft',   icon: CheckCircle2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  planned:   { label: 'Geplant',   icon: CheckCircle2, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  completed: { label: 'Umgesetzt', icon: CheckCircle2, color: 'text-green-400',bg: 'bg-green-500/10' },
  rejected:  { label: 'Abgelehnt',icon: XCircle,      color: 'text-red-400',  bg: 'bg-red-500/10' },
};

const FILTERS = [
  { key: 'all',         label: 'Alle',           emoji: '🌐' },
  { key: 'feature',     label: 'Features',       emoji: '💡' },
  { key: 'bug',         label: 'Bugs',           emoji: '🐛' },
  { key: 'improvement', label: 'Verbesserungen', emoji: '⚡' },
  { key: 'other',       label: 'Sonstiges',      emoji: '📝' },
];

function FeedbackForm({ user, onSuccess }) {
  const [formData, setFormData] = useState({ title: '', description: '', category: 'feature' });
  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      if (!user) throw new Error('Not logged in');
      return await base44.entities.Feedback.create({ ...data, user_username: user.username });
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
      setFormData({ title: '', description: '', category: 'feature' });
      setSubmitted(true);
      setTimeout(() => { setSubmitted(false); onSuccess?.(); }, 3000);
      if (user) {
        const src = XP_SOURCES.feedback;
        await awardXpAndTokens(user, src.xp, src.tokens, src.label);
      }
    },
    onError: () => toast.error('Fehler beim Einreichen'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) { toast.error('Bitte melde dich an'); window.location.href = createPageUrl('SignIn'); return; }
    if (!formData.title || !formData.description) { toast.error('Bitte fülle alle Felder aus'); return; }
    submitMutation.mutate(formData);
  };

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 rounded-3xl text-center"
        style={{ background: 'linear-gradient(135deg, rgba(52,211,153,0.1), rgba(6,182,212,0.1))', border: '1px solid rgba(52,211,153,0.3)' }}>
        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #34d399, #06b6d4)', boxShadow: '0 0 30px rgba(52,211,153,0.4)' }}>
          <CheckCircle2 className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-black text-white mb-1">Danke! 🎉</h3>
        <p className="text-white/50 text-sm">Wird vom Team geprüft.</p>
      </motion.div>
    );
  }

  return (
    <div className="p-5 rounded-3xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(6,182,212,0.3))', border: '1px solid rgba(139,92,246,0.4)' }}>
          <Send className="w-4 h-4 text-violet-300" />
        </div>
        <div>
          <h2 className="text-base font-black text-white">Feedback einreichen</h2>
          <p className="text-white/30 text-xs">Deine Stimme zählt</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category */}
        <div>
          <label className="block text-white/40 text-[10px] font-black mb-2 uppercase tracking-wider">Typ</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(categoryConfig).map(([key, cfg]) => (
              <button type="button" key={key}
                onClick={() => setFormData({ ...formData, category: key })}
                className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-left text-sm font-bold
                  ${formData.category === key ? `${cfg.bg} ${cfg.border} ${cfg.color}` : 'bg-white/[0.03] border-white/[0.06] text-white/40 hover:bg-white/5'}`}>
                <span>{cfg.emoji}</span>{cfg.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-white/40 text-[10px] font-black mb-2 uppercase tracking-wider">Titel</label>
          <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Kurze, präzise Überschrift..." className="bg-black/30 border-white/10" />
        </div>

        <div>
          <label className="block text-white/40 text-[10px] font-black mb-2 uppercase tracking-wider">Details</label>
          <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Je mehr Details, desto besser..." className="bg-black/30 border-white/10 min-h-[100px] resize-none" />
        </div>

        <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold"
          style={{ background: 'rgba(217,70,239,0.08)', border: '1px solid rgba(217,70,239,0.2)', color: '#e879f9' }}>
          <Sparkles className="w-3 h-3" /> +300 XP &amp; +50 Tokens für jeden Vorschlag
        </div>

        <button type="submit" disabled={submitMutation.isPending}
          className="w-full h-12 rounded-2xl font-black text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}>
          {submitMutation.isPending
            ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Wird gesendet...</span>
            : <span className="flex items-center justify-center gap-2"><Sparkles className="w-4 h-4" />Jetzt einreichen</span>}
        </button>
      </form>
    </div>
  );
}

export default function Feedback() {
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showMobileForm, setShowMobileForm] = useState(false);
  const [upvoted, setUpvoted] = useState(() => {
    try { return JSON.parse(localStorage.getItem('upvoted_feedbacks') || '[]'); } catch { return []; }
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    const stored = localStorage.getItem('app_user');
    if (stored && stored !== 'undefined') try { setUser(JSON.parse(stored)); } catch {}
  }, []);

  const { data: feedbacks = [] } = useQuery({
    queryKey: ['feedbacks'],
    queryFn: () => base44.entities.Feedback.list('-upvotes', 100),
  });

  const filteredFeedbacks = feedbacks.filter(f => filter === 'all' || f.category === filter);
  const topFeedback = [...feedbacks].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0)).slice(0, 3);

  const upvoteMutation = useMutation({
    mutationFn: async (feedbackId) => {
      const fb = feedbacks.find(f => f.id === feedbackId);
      return await base44.entities.Feedback.update(feedbackId, { upvotes: (fb.upvotes || 0) + 1 });
    },
    onSuccess: (_, feedbackId) => {
      const next = [...upvoted, feedbackId];
      setUpvoted(next);
      localStorage.setItem('upvoted_feedbacks', JSON.stringify(next));
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
    },
  });

  return (
    <PageMaintenanceCheck pageName="Feedback">
      <div className="min-h-screen">

        {/* ── HERO ── */}
        <div className="relative overflow-hidden py-12 px-4">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(6,182,212,0.10) 50%, rgba(236,72,153,0.10) 100%)' }} />
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.6), rgba(6,182,212,0.6), transparent)' }} />
          <div className="absolute -top-20 left-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -top-20 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-3xl mx-auto text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 text-xs font-black uppercase tracking-widest"
                style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.4)', color: '#c4b5fd' }}>
                <Rocket className="w-3.5 h-3.5" /> Du baust die Plattform mit
              </div>
              <h1 className="text-4xl md:text-6xl font-black mb-3 leading-none">
                <span className="text-white">Deine </span>
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #a78bfa, #06b6d4, #ec4899)' }}>Ideen</span>
              </h1>
              <p className="text-white/45 text-base md:text-lg max-w-xl mx-auto mb-7">
                Jeder Vorschlag wird gelesen. Die besten Features entstehen aus der Community.
              </p>
              {/* Stats */}
              <div className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
                {[
                  { label: 'Eingereicht', value: feedbacks.length, color: '#a78bfa' },
                  { label: 'Umgesetzt',   value: feedbacks.filter(f => f.status === 'completed').length, color: '#34d399' },
                  { label: 'Geplant',     value: feedbacks.filter(f => f.status === 'planned').length, color: '#22d3ee' },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 pb-28 space-y-6">

          {/* ── TOP VOTED ── */}
          {topFeedback.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <h2 className="text-sm font-black text-white uppercase tracking-wider">Top Vorschläge</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {topFeedback.map((fb, i) => {
                  const cat = categoryConfig[fb.category] || categoryConfig.other;
                  return (
                    <div key={fb.id} className="relative p-4 rounded-2xl overflow-hidden"
                      style={{ background: `linear-gradient(135deg, ${cat.glow.replace('0.3', '0.07')}, rgba(0,0,0,0))`, border: `1px solid ${cat.glow.replace('0.3', '0.22')}` }}>
                      {i === 0 && <span className="absolute top-3 right-3 text-base">👑</span>}
                      <div className="flex items-center gap-1.5 mb-2">
                        <span>{cat.emoji}</span>
                        <span className={`text-xs font-black ${cat.color}`}>{cat.label}</span>
                      </div>
                      <p className="text-white font-bold text-sm line-clamp-2 mb-2">{fb.title}</p>
                      <div className="flex items-center gap-1.5">
                        <ThumbsUp className="w-3 h-3 text-violet-400" />
                        <span className="text-violet-300 font-black text-xs">{fb.upvotes || 0} Votes</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── MAIN CONTENT ── */}
          <div className="grid lg:grid-cols-[380px_1fr] gap-6">

            {/* FORM — desktop sidebar */}
            <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="hidden lg:block">
              <div className="sticky top-28">
                <FeedbackForm user={user} />
              </div>
            </motion.div>

            {/* LIST */}
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} className="space-y-3">

              {/* Filter tabs */}
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                {FILTERS.map(f => (
                  <button key={f.key} onClick={() => setFilter(f.key)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0
                      ${filter === f.key ? 'bg-white/10 text-white border border-white/20' : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:text-white/70'}`}>
                    <span>{f.emoji}</span>{f.label}
                    {f.key !== 'all' && (
                      <span className="ml-0.5 text-[9px] opacity-50">{feedbacks.filter(fb => fb.category === f.key).length}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Items */}
              <AnimatePresence>
                {filteredFeedbacks.map((feedback, index) => {
                  const cat = categoryConfig[feedback.category] || categoryConfig.other;
                  const stat = statusConfig[feedback.status] || statusConfig.pending;
                  const StatusIcon = stat.icon;
                  const hasUpvoted = upvoted.includes(feedback.id);

                  return (
                    <motion.div key={feedback.id}
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      transition={{ delay: index * 0.03 }}
                      className="group p-4 rounded-2xl transition-all duration-200"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = cat.glow}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}>
                      <div className="flex gap-3">
                        {/* Upvote */}
                        <div className="flex flex-col items-center gap-1 flex-shrink-0">
                          <button onClick={() => !hasUpvoted && upvoteMutation.mutate(feedback.id)}
                            disabled={hasUpvoted || upvoteMutation.isPending}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all
                              ${hasUpvoted ? 'bg-violet-500/20 border border-violet-500/40' : 'bg-white/[0.04] border border-white/[0.08] hover:bg-violet-500/15 hover:border-violet-500/30'}`}>
                            <ArrowUp className={`w-4 h-4 ${hasUpvoted ? 'text-violet-400' : 'text-white/30 group-hover:text-violet-400'} transition-colors`} />
                          </button>
                          <span className={`text-xs font-black ${hasUpvoted ? 'text-violet-400' : 'text-white/40'}`}>{feedback.upvotes || 0}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black ${cat.bg} ${cat.border} border ${cat.color}`}>
                              {cat.emoji} {cat.label}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${stat.bg} ${stat.color}`}>
                              <StatusIcon className="w-2.5 h-2.5" />{stat.label}
                            </span>
                          </div>
                          <h3 className="text-white font-bold text-sm mb-1 leading-tight">{feedback.title}</h3>
                          <p className="text-white/40 text-xs line-clamp-2 mb-2">{feedback.description}</p>
                          <div className="flex items-center gap-2">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${feedback.user_username}`} alt=""
                              className="w-4 h-4 rounded-full bg-white/10 flex-shrink-0" />
                            <span className="text-white/25 text-xs font-bold truncate">{feedback.user_username}</span>
                            <span className="text-white/15 text-xs flex-shrink-0">·</span>
                            <span className="text-white/20 text-xs flex-shrink-0">{new Date(feedback.created_date).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {filteredFeedbacks.length === 0 && (
                <div className="text-center py-16 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Lightbulb className="w-10 h-10 mx-auto mb-3 text-white/10" />
                  <p className="text-white/25 font-bold text-sm">Noch kein Feedback in dieser Kategorie</p>
                  <p className="text-white/15 text-xs mt-1">Sei der Erste!</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* ── MOBILE FAB + SHEET ── */}
        <div className="lg:hidden">
          {/* FAB */}
          <AnimatePresence>
            {!showMobileForm && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                onClick={() => setShowMobileForm(true)}
                className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', boxShadow: '0 0 30px rgba(124,58,237,0.5)' }}>
                <Plus className="w-6 h-6 text-white" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Bottom sheet */}
          <AnimatePresence>
            {showMobileForm && (
              <>
                {/* Backdrop */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                  onClick={() => setShowMobileForm(false)} />
                {/* Sheet */}
                <motion.div
                  initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                  className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
                  style={{ background: '#0a0815', border: '1px solid rgba(255,255,255,0.1)', borderBottom: 'none', maxHeight: '90vh', overflowY: 'auto' }}>
                  {/* Handle */}
                  <div className="flex items-center justify-between px-5 pt-4 pb-2">
                    <div className="w-10 h-1 rounded-full bg-white/20 mx-auto absolute left-1/2 -translate-x-1/2 top-3" />
                    <div />
                    <button onClick={() => setShowMobileForm(false)} className="ml-auto p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                      <X className="w-4 h-4 text-white/60" />
                    </button>
                  </div>
                  <div className="px-4 pb-8">
                    <FeedbackForm user={user} onSuccess={() => setShowMobileForm(false)} />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

      </div>
    </PageMaintenanceCheck>
  );
}