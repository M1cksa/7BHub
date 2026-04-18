import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit3, ToggleLeft, ToggleRight, Trophy, Zap, X, Users, Clock, Target, Flame } from 'lucide-react';

const GAME_LABELS = { pokemon: '🐾 Pokémon', neondash: '⚡ Neon Dash' };
const TYPE_LABELS = { streak: '🔥 Streak', wins: '🏆 Siege', score: '⭐ Punkte', catches: '🔴 Fänge', dungeons: '⛰️ Dungeons' };
const COLORS = ['#f59e0b', '#06b6d4', '#ec4899', '#10b981', '#8b5cf6', '#f97316', '#ef4444'];

const DEFAULT_FORM = {
  title: '', description: '', game: 'pokemon', type: 'streak',
  goal: 10, reward_tokens: 500, reward_label: '', emoji: '🏆',
  color: '#f59e0b', is_active: false, ends_at: '',
};

export default function AdminContests() {
  const [user] = useState(() => { try { const u = localStorage.getItem('app_user'); return u ? JSON.parse(u) : null; } catch { return null; } });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  const qc = useQueryClient();
  const { data: contests = [], isLoading } = useQuery({
    queryKey: ['adminContests'],
    queryFn: () => base44.entities.GameContest.list('-created_date', 50),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.GameContest.create(data),
    onSuccess: () => { qc.invalidateQueries(['adminContests']); setShowForm(false); setForm(DEFAULT_FORM); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.GameContest.update(id, data),
    onSuccess: () => { qc.invalidateQueries(['adminContests']); setShowForm(false); setEditing(null); setForm(DEFAULT_FORM); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.GameContest.delete(id),
    onSuccess: () => qc.invalidateQueries(['adminContests']),
  });

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <p className="text-red-400 font-bold">🚫 Kein Zugriff — nur für Admins</p>
      </div>
    );
  }

  function openEdit(c) {
    setEditing(c);
    setForm({
      title: c.title || '', description: c.description || '',
      game: c.game || 'pokemon', type: c.type || 'streak',
      goal: c.goal || 10, reward_tokens: c.reward_tokens || 500,
      reward_label: c.reward_label || '', emoji: c.emoji || '🏆',
      color: c.color || '#f59e0b', is_active: c.is_active || false,
      ends_at: c.ends_at ? c.ends_at.slice(0, 16) : '',
    });
    setShowForm(true);
  }

  function submit() {
    const data = { ...form, goal: Number(form.goal), reward_tokens: Number(form.reward_tokens), ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null };
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  }

  function toggleActive(c) {
    updateMutation.mutate({ id: c.id, data: { is_active: !c.is_active } });
  }

  const activeCount = contests.filter(c => c.is_active).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" /> Ferien-Wettbewerbe
            </h1>
            <p className="text-white/40 text-sm mt-0.5">Erstelle & verwalte Event-Challenges für Pokémon und Neon Dash</p>
          </div>
          <Button onClick={() => { setEditing(null); setForm(DEFAULT_FORM); setShowForm(true); }}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black rounded-xl text-sm h-9">
            <Plus className="w-4 h-4 mr-1" /> Neu erstellen
          </Button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: Trophy, label: 'Gesamt', value: contests.length, color: '#f59e0b' },
            { icon: Flame, label: 'Aktiv', value: activeCount, color: '#22c55e' },
            { icon: Target, label: 'Spiele', value: [...new Set(contests.map(c => c.game))].length, color: '#06b6d4' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: `${color}08`, border: `1px solid ${color}25` }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
                <Icon className="w-4.5 h-4.5" style={{ color }} />
              </div>
              <div>
                <div className="text-xl font-black" style={{ color }}>{value}</div>
                <div className="text-[10px] text-white/30 font-bold">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Contest List */}
        {isLoading ? (
          <div className="text-center py-12 text-white/30">Lädt...</div>
        ) : contests.length === 0 ? (
          <div className="text-center py-16 bg-white/3 rounded-2xl border border-white/8">
            <div className="text-5xl mb-3">🏆</div>
            <p className="text-white/30 font-bold">Noch keine Wettbewerbe</p>
            <p className="text-white/20 text-sm mt-1">Erstelle deinen ersten Ferien-Event!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contests.map(c => {
              const color = c.color || '#f59e0b';
              const endsIn = c.ends_at ? (() => { const diff = new Date(c.ends_at) - new Date(); if (diff <= 0) return '⌛ Abgelaufen'; const d = Math.floor(diff/86400000); const h = Math.floor((diff%86400000)/3600000); return d > 0 ? `${d}T ${h}h` : `${h}h`; })() : null;
              return (
              <motion.div key={c.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border overflow-hidden transition-all"
                style={{ background: `${color}07`, borderColor: c.is_active ? `${color}50` : 'rgba(255,255,255,0.08)', boxShadow: c.is_active ? `0 0 20px ${color}15` : 'none' }}>
                {/* Active top stripe */}
                {c.is_active && (
                  <motion.div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
                    animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 2 }} />
                )}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${color}30, ${color}12)`, border: `1px solid ${color}50` }}>
                      {c.emoji || '🏆'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-black text-white text-sm">{c.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-black" style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>
                          {GAME_LABELS[c.game]}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-white/40 font-bold border border-white/10">{TYPE_LABELS[c.type]}</span>
                      </div>
                      {c.description && <p className="text-white/40 text-xs mb-2">{c.description}</p>}
                      <div className="flex flex-wrap items-center gap-2 text-[10px]">
                        <span className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-lg border border-white/8">
                          <Target className="w-3 h-3" style={{ color }} /> Ziel: <b style={{ color }}>{c.goal}</b>
                        </span>
                        {c.reward_tokens > 0 && (
                          <span className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-lg border border-yellow-500/20 text-yellow-400 font-bold">
                            🪙 +{c.reward_tokens.toLocaleString()}
                          </span>
                        )}
                        {c.reward_label && (
                          <span className="text-white/35 bg-black/20 px-2 py-1 rounded-lg border border-white/6">🎁 {c.reward_label}</span>
                        )}
                        {endsIn && (
                          <span className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-lg border border-white/8 text-white/40">
                            <Clock className="w-3 h-3" /> {endsIn}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => toggleActive(c)} title={c.is_active ? 'Deaktivieren' : 'Aktivieren'}
                        className={`transition-all p-1.5 rounded-lg ${c.is_active ? 'text-green-400 bg-green-500/15 hover:bg-red-500/15 hover:text-red-400' : 'text-white/25 bg-white/5 hover:bg-green-500/15 hover:text-green-400'}`}>
                        {c.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                      <button onClick={() => openEdit(c)} className="text-white/25 hover:text-cyan-400 transition-all p-1.5 rounded-lg hover:bg-cyan-500/10">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteMutation.mutate(c.id)} className="text-white/15 hover:text-red-400 transition-all p-1.5 rounded-lg hover:bg-red-500/10">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {c.is_active && (
                    <div className="mt-3 flex items-center gap-2 pt-3 border-t border-white/5">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-green-400 text-[10px] font-black">AKTIV — sichtbar in {GAME_LABELS[c.game]}</span>
                      <span className="ml-auto text-[10px] text-white/25">Banner wird Spielern angezeigt</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )})}
          </div>
        )}

        {/* Form Modal */}
        <AnimatePresence>
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-900 border border-white/15 rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-black text-white">{editing ? 'Wettbewerb bearbeiten' : 'Neuer Wettbewerb'}</h2>
                  <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-white/30 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Title & Emoji */}
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <div>
                      <label className="text-white/50 text-xs font-bold mb-1 block">Titel *</label>
                      <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/50"
                        placeholder="z.B. Ferien-Streak-Challenge" />
                    </div>
                    <div>
                      <label className="text-white/50 text-xs font-bold mb-1 block">Emoji</label>
                      <input value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
                        className="w-16 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-lg text-center focus:outline-none focus:border-yellow-500/50" />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-white/50 text-xs font-bold mb-1 block">Beschreibung</label>
                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/50 h-16 resize-none"
                      placeholder="Worum geht es in diesem Wettbewerb?" />
                  </div>

                  {/* Game & Type */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-white/50 text-xs font-bold mb-1 block">Spiel *</label>
                      <select value={form.game} onChange={e => setForm(f => ({ ...f, game: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/50">
                        <option value="pokemon">🐾 Pokémon</option>
                        <option value="neondash">⚡ Neon Dash</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-white/50 text-xs font-bold mb-1 block">Typ *</label>
                      <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/50">
                        <option value="streak">🔥 Streak</option>
                        <option value="wins">🏆 Siege</option>
                        <option value="score">⭐ Punkte</option>
                        <option value="catches">🔴 Fänge</option>
                        <option value="dungeons">⛰️ Dungeons</option>
                      </select>
                    </div>
                  </div>

                  {/* Goal & Tokens */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-white/50 text-xs font-bold mb-1 block">Ziel (Anzahl) *</label>
                      <input type="number" value={form.goal} onChange={e => setForm(f => ({ ...f, goal: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/50"
                        min="1" />
                    </div>
                    <div>
                      <label className="text-white/50 text-xs font-bold mb-1 block">Token-Belohnung</label>
                      <input type="number" value={form.reward_tokens} onChange={e => setForm(f => ({ ...f, reward_tokens: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/50"
                        min="0" />
                    </div>
                  </div>

                  {/* Reward Label */}
                  <div>
                    <label className="text-white/50 text-xs font-bold mb-1 block">Belohnungs-Text</label>
                    <input value={form.reward_label} onChange={e => setForm(f => ({ ...f, reward_label: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/50"
                      placeholder="z.B. Exklusiver Ferien-Rahmen" />
                  </div>

                  {/* Color */}
                  <div>
                    <label className="text-white/50 text-xs font-bold mb-1 block">Akzentfarbe</label>
                    <div className="flex gap-2 flex-wrap">
                      {COLORS.map(c => (
                        <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                          className={`w-7 h-7 rounded-lg transition-all ${form.color === c ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'}`}
                          style={{ backgroundColor: c }} />
                      ))}
                      <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                        className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent" />
                    </div>
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="text-white/50 text-xs font-bold mb-1 block">Enddatum (optional)</label>
                    <input type="datetime-local" value={form.ends_at} onChange={e => setForm(f => ({ ...f, ends_at: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/50" />
                  </div>

                  {/* Active Toggle */}
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-white/4 border border-white/8 hover:bg-white/6 transition-all">
                    <div className={`w-10 h-6 rounded-full transition-colors relative ${form.is_active ? 'bg-green-500' : 'bg-white/15'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-1'}`} />
                    </div>
                    <span className="text-white text-sm font-bold">Sofort aktivieren</span>
                    <input type="checkbox" className="hidden" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
                  </label>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}
                    className="flex-1 border-white/15 text-white rounded-xl">Abbrechen</Button>
                  <Button onClick={submit} disabled={!form.title || createMutation.isPending || updateMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black rounded-xl">
                    {editing ? 'Speichern' : 'Erstellen'}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}