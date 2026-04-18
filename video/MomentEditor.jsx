import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Zap, ChevronDown, ChevronUp, Clock, Trophy, BarChart2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_CONFIG = {
  quiz: { label: 'Quiz', icon: Trophy, color: '#7c3aed', bg: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.4)', desc: 'Richtige Antwort mit Token-Belohnung' },
  poll: { label: 'Poll', icon: BarChart2, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.4)', desc: 'Community-Abstimmung' },
  info: { label: 'Info', icon: Info, color: '#06b6d4', bg: 'rgba(6,182,212,0.15)', border: 'rgba(6,182,212,0.4)', desc: 'Infotext / Hotspot' },
};

export default function MomentEditor({ videoId, creatorUsername }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    type: 'quiz', timestamp: 0, question: '', options: ['', '', '', ''],
    correct_answer: 0, tokens_reward: 5, info_text: ''
  });

  const { data: moments = [] } = useQuery({
    queryKey: ['moments', videoId],
    queryFn: () => base44.entities.VideoMoment.filter({ video_id: videoId }, '-timestamp'),
    enabled: !!videoId
  });

  const createMutation = useMutation({
    mutationFn: () => base44.entities.VideoMoment.create({
      ...form,
      video_id: videoId,
      creator_username: creatorUsername,
      options: form.type === 'info' ? [] : form.options.filter(o => o.trim())
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['moments', videoId]);
      setForm({ type: 'quiz', timestamp: 0, question: '', options: ['', '', '', ''], correct_answer: 0, tokens_reward: 5, info_text: '' });
      toast.success('✨ Interaktiver Moment erstellt!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.VideoMoment.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['moments', videoId]); toast.success('Gelöscht'); }
  });

  const currentType = TYPE_CONFIG[form.type];

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/[0.03] transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.15))', border: '1px solid rgba(124,58,237,0.3)' }}>
            <Zap className="w-4.5 h-4.5 text-violet-400" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">Interaktive Momente</p>
            <p className="text-white/30 text-xs">{moments.length} Momente aktiv</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {moments.length > 0 && (
            <div className="flex -space-x-1">
              {moments.slice(0, 3).map((m, i) => {
                const cfg = TYPE_CONFIG[m.type];
                const Icon = cfg?.icon || Zap;
                return (
                  <div key={i} className="w-5 h-5 rounded-full flex items-center justify-center ring-1 ring-black/50"
                    style={{ background: cfg?.bg || 'rgba(255,255,255,0.1)' }}>
                    <Icon className="w-2.5 h-2.5" style={{ color: cfg?.color }} />
                  </div>
                );
              })}
            </div>
          )}
          {open ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="p-4 pt-0 space-y-4 border-t border-white/[0.06]">

              {/* Existing moments */}
              {moments.length > 0 && (
                <div className="space-y-2 pt-2">
                  {moments.map((m, i) => {
                    const cfg = TYPE_CONFIG[m.type];
                    const Icon = cfg?.icon || Zap;
                    return (
                      <motion.div key={m.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 p-3 rounded-xl"
                        style={{ background: cfg?.bg || 'rgba(255,255,255,0.03)', border: `1px solid ${cfg?.border || 'rgba(255,255,255,0.06)'}` }}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: `${cfg?.color}25` }}>
                          <Icon className="w-3.5 h-3.5" style={{ color: cfg?.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white/80 text-sm font-semibold truncate">{m.question}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: cfg?.color }}>{m.type}</span>
                            <span className="text-white/30 text-[10px] flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {m.timestamp}s</span>
                            {m.type === 'quiz' && <span className="text-yellow-400/70 text-[10px] flex items-center gap-0.5"><Zap className="w-2.5 h-2.5" /> +{m.tokens_reward}</span>}
                          </div>
                        </div>
                        <button onClick={() => deleteMutation.mutate(m.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400/50 hover:text-red-400 hover:bg-red-400/10 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Add form */}
              <div className="p-4 rounded-2xl space-y-4"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs font-black text-white/30 uppercase tracking-widest">Neuer Moment</p>

                {/* Type selector */}
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(TYPE_CONFIG).map(([t, cfg]) => {
                    const Icon = cfg.icon;
                    return (
                      <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all"
                        style={{
                          background: form.type === t ? cfg.bg : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${form.type === t ? cfg.border : 'rgba(255,255,255,0.06)'}`,
                        }}>
                        <Icon className="w-4 h-4" style={{ color: form.type === t ? cfg.color : 'rgba(255,255,255,0.3)' }} />
                        <span className="text-xs font-bold" style={{ color: form.type === t ? cfg.color : 'rgba(255,255,255,0.4)' }}>{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-white/30 text-xs text-center">{currentType.desc}</p>

                {/* Timestamp + tokens */}
                <div className={`grid gap-2 ${form.type === 'quiz' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                    <Input type="number" placeholder="Sekunde" value={form.timestamp}
                      onChange={e => setForm(f => ({ ...f, timestamp: +e.target.value }))}
                      className="bg-black/20 border-white/10 text-white text-sm pl-8" />
                  </div>
                  {form.type === 'quiz' && (
                    <div className="relative">
                      <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-yellow-400/60" />
                      <Input type="number" placeholder="Token-Bonus" value={form.tokens_reward}
                        onChange={e => setForm(f => ({ ...f, tokens_reward: +e.target.value }))}
                        className="bg-black/20 border-white/10 text-white text-sm pl-8" />
                    </div>
                  )}
                </div>

                {/* Question */}
                <Input placeholder={form.type === 'info' ? 'Titel / Überschrift' : 'Deine Frage…'} value={form.question}
                  onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                  className="bg-black/20 border-white/10 text-white text-sm" />

                {/* Info text or options */}
                {form.type === 'info' ? (
                  <Input placeholder="Info-Text (optional)" value={form.info_text}
                    onChange={e => setForm(f => ({ ...f, info_text: e.target.value }))}
                    className="bg-black/20 border-white/10 text-white text-sm" />
                ) : (
                  <div className="space-y-2">
                    {form.options.map((opt, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                          style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          {String.fromCharCode(65 + i)}
                        </div>
                        <Input placeholder={`Option ${i + 1}`} value={opt}
                          onChange={e => setForm(f => ({ ...f, options: f.options.map((o, j) => j === i ? e.target.value : o) }))}
                          className="bg-black/20 border-white/10 text-white text-sm flex-1" />
                        {form.type === 'quiz' && (
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setForm(f => ({ ...f, correct_answer: i }))}
                            className="w-8 h-8 rounded-lg text-xs font-bold border transition-all shrink-0 flex items-center justify-center"
                            style={form.correct_answer === i
                              ? { background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.5)', color: '#34d399' }
                              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.25)' }
                            }>
                            ✓
                          </motion.button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <Button onClick={() => createMutation.mutate()} disabled={!form.question || createMutation.isPending}
                  className="w-full font-bold gap-2"
                  style={{ background: `linear-gradient(135deg, ${currentType.color}, rgba(6,182,212,0.8))`, border: 'none' }}>
                  <Plus className="w-4 h-4" />
                  Moment erstellen
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}