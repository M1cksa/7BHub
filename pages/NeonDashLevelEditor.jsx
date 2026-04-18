import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Download, Upload, Plus, Trash2, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

const GOAL_TYPES = [
  { id: 'survive', label: 'Überleben (Sekunden)', icon: '⏱️' },
  { id: 'coins', label: 'Münzen sammeln', icon: '🪙' },
  { id: 'score', label: 'Punkte erreichen', icon: '📈' },
];

const OBSTACLE_TYPES = ['normal', 'zigzag', 'bounce', 'rotating', 'wave', 'cross', 'laser'];

const LEVEL_EMOJIS = ['🌊', '🪙', '💨', '⭐', '⚡', '💰', '🏀', '🚀', '🌀', '👑', '🔥', '🏆', '💫', '🌌'];

export default function NeonDashLevelEditor() {
  const [levels, setLevels] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    desc: '',
    goalType: 'survive',
    goalTarget: 30,
    speed: 1.0,
    types: ['normal'],
    reward: 500,
    emoji: '🌊',
  });

  const createNewLevel = () => {
    setFormData({
      name: '',
      desc: '',
      goalType: 'survive',
      goalTarget: 30,
      speed: 1.0,
      types: ['normal'],
      reward: 500,
      emoji: '🌊',
    });
    setEditingId(null);
    setShowForm(true);
  };

  const editLevel = (level) => {
    setFormData(level);
    setEditingId(level.id);
    setShowForm(true);
  };

  const saveLevel = () => {
    if (!formData.name || !formData.desc) {
      toast.error('Name und Beschreibung erforderlich!');
      return;
    }
    if (editingId) {
      setLevels(levels.map(l => l.id === editingId ? { ...formData, id: editingId } : l));
      toast.success('Level aktualisiert!');
    } else {
      const newLevel = { ...formData, id: Date.now() };
      setLevels([...levels, newLevel]);
      toast.success('Level erstellt!');
    }
    setShowForm(false);
  };

  const deleteLevel = (id) => {
    setLevels(levels.filter(l => l.id !== id));
    toast.success('Level gelöscht');
  };

  const duplicateLevel = (level) => {
    const newLevel = { ...level, id: Date.now(), name: level.name + ' (Kopie)' };
    setLevels([...levels, newLevel]);
    toast.success('Level dupliziert!');
  };

  const exportLevels = () => {
    const json = JSON.stringify(levels, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neon-dash-levels-${Date.now()}.json`;
    a.click();
    toast.success('Levels exportiert!');
  };

  const importLevels = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result);
        if (Array.isArray(imported)) {
          setLevels(imported);
          toast.success(`${imported.length} Level importiert!`);
        } else {
          toast.error('Ungültiges Format');
        }
      } catch (err) {
        toast.error('Fehler beim Importieren');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6 text-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('NeonDash')}>
              <Button variant="ghost" className="text-white/60 hover:text-white">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500">
              Neon Dash Level Editor
            </h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportLevels} className="gap-2 bg-green-600 hover:bg-green-500">
              <Download className="w-4 h-4" /> Export
            </Button>
            <label>
              <Button as="span" className="gap-2 bg-blue-600 hover:bg-blue-500 cursor-pointer">
                <Upload className="w-4 h-4" /> Import
              </Button>
              <input type="file" accept=".json" onChange={importLevels} className="hidden" />
            </label>
            <Button onClick={createNewLevel} className="gap-2 bg-cyan-600 hover:bg-cyan-500">
              <Plus className="w-4 h-4" /> Neues Level
            </Button>
          </div>
        </div>

        {/* Level List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {levels.map((level) => (
              <motion.div
                key={level.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-3xl">{level.emoji}</div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{level.name}</h3>
                      <p className="text-white/50 text-sm">{level.desc}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button onClick={() => editLevel(level)} variant="ghost" size="icon" className="text-cyan-400 hover:bg-cyan-500/20">
                      ✏️
                    </Button>
                    <Button onClick={() => duplicateLevel(level)} variant="ghost" size="icon" className="text-purple-400 hover:bg-purple-500/20">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => deleteLevel(level.id)} variant="ghost" size="icon" className="text-red-400 hover:bg-red-500/20">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-black/30 rounded-lg p-2">
                    <p className="text-white/40 text-xs">Ziel</p>
                    <p className="text-cyan-400 font-bold">
                      {GOAL_TYPES.find(g => g.id === level.goalType)?.label}
                    </p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-2">
                    <p className="text-white/40 text-xs">Wert</p>
                    <p className="text-cyan-400 font-bold">{level.goalTarget}</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-2">
                    <p className="text-white/40 text-xs">Speed</p>
                    <p className="text-violet-400 font-bold">{level.speed.toFixed(2)}×</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-2">
                    <p className="text-white/40 text-xs">Belohnung</p>
                    <p className="text-yellow-400 font-bold">{level.reward.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mt-3 text-xs text-white/40">
                  <p>Hindernisse: {level.types.join(', ')}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {levels.length === 0 && !showForm && (
          <div className="text-center py-16">
            <p className="text-white/50 mb-4">Keine Levels erstellt</p>
            <Button onClick={createNewLevel} className="gap-2 bg-cyan-600 hover:bg-cyan-500">
              <Plus className="w-4 h-4" /> Erstes Level erstellen
            </Button>
          </div>
        )}

        {/* Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900 border border-white/10 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <h2 className="text-2xl font-black mb-6 text-cyan-400">
                  {editingId ? 'Level bearbeiten' : 'Neues Level erstellen'}
                </h2>

                <div className="space-y-5">
                  {/* Basic Info */}
                  <div>
                    <label className="text-sm font-bold text-white/70 mb-1 block">Level Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="z.B. Aufwärmen"
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/30"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-white/70 mb-1 block">Beschreibung</label>
                    <input
                      type="text"
                      value={formData.desc}
                      onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                      placeholder="z.B. Überlebe 30 Sekunden"
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/30"
                    />
                  </div>

                  {/* Emoji */}
                  <div>
                    <label className="text-sm font-bold text-white/70 mb-2 block">Emoji</label>
                    <div className="grid grid-cols-7 gap-2">
                      {LEVEL_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => setFormData({ ...formData, emoji })}
                          className={`text-2xl p-2 rounded-lg border transition-all ${
                            formData.emoji === emoji
                              ? 'bg-cyan-500/30 border-cyan-400'
                              : 'bg-black/30 border-white/10 hover:bg-white/5'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Goal Config */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-white/70 mb-1 block">Zieltyp</label>
                      <select
                        value={formData.goalType}
                        onChange={(e) => setFormData({ ...formData, goalType: e.target.value })}
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white"
                      >
                        {GOAL_TYPES.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-white/70 mb-1 block">Zielwert</label>
                      <input
                        type="number"
                        value={formData.goalTarget}
                        onChange={(e) => setFormData({ ...formData, goalTarget: parseInt(e.target.value) })}
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                  </div>

                  {/* Speed & Reward */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-white/70 mb-1 block">Geschwindigkeit ({formData.speed.toFixed(2)}×)</label>
                      <input
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.05"
                        value={formData.speed}
                        onChange={(e) => setFormData({ ...formData, speed: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-white/70 mb-1 block">Belohnung (Tokens)</label>
                      <input
                        type="number"
                        value={formData.reward}
                        onChange={(e) => setFormData({ ...formData, reward: parseInt(e.target.value) })}
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                  </div>

                  {/* Obstacle Types */}
                  <div>
                    <label className="text-sm font-bold text-white/70 mb-2 block">Hindernis-Typen</label>
                    <div className="grid grid-cols-3 gap-2">
                      {OBSTACLE_TYPES.map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            const newTypes = formData.types.includes(type)
                              ? formData.types.filter((t) => t !== type)
                              : [...formData.types, type];
                            setFormData({ ...formData, types: newTypes });
                          }}
                          className={`px-3 py-2 rounded-lg border text-sm font-bold transition-all ${
                            formData.types.includes(type)
                              ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200'
                              : 'bg-black/30 border-white/10 text-white/60 hover:bg-white/5'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-8 pt-6 border-t border-white/10">
                    <Button onClick={() => setShowForm(false)} variant="ghost" className="flex-1">
                      Abbrechen
                    </Button>
                    <Button onClick={saveLevel} className="flex-1 bg-cyan-600 hover:bg-cyan-500">
                      {editingId ? 'Aktualisieren' : 'Erstellen'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}