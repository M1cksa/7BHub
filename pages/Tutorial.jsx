import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import {
  Play, Upload, ShoppingBag, MessageCircle, Users,
  Sparkles, TrendingUp, Award, ChevronRight, ChevronLeft,
  Check, Video, Heart, Shield, Zap, Star, Flame, Crown,
  ArrowRight, Lock, Globe, Sword
} from 'lucide-react';

// ─── STEPS ───────────────────────────────────────────────────────────────────
const STEPS = [
  {
    id: 'welcome',
    title: '7B Hub',
    subtitle: 'Willkommen in deiner Community',
    emoji: '👋',
    bg: 'from-violet-600 via-fuchsia-600 to-pink-600',
    orb1: 'bg-violet-500/30',
    orb2: 'bg-fuchsia-500/20',
    type: 'welcome',
    cta: 'Tour starten'
  },
  {
    id: 'rules',
    title: 'Community Regeln',
    subtitle: 'Damit wir alle sicher sind',
    emoji: '🛡️',
    bg: 'from-blue-600 via-indigo-600 to-violet-600',
    orb1: 'bg-blue-500/30',
    orb2: 'bg-indigo-500/20',
    type: 'quiz',
    question: 'Was ist auf 7B Hub NICHT erlaubt?',
    options: [
      { text: 'Eigene Videos hochladen', correct: false, icon: Upload },
      { text: 'Beleidigungen & Hate Speech', correct: true, icon: Shield },
      { text: 'Live streamen', correct: false, icon: Play },
      { text: 'Kommentare schreiben', correct: false, icon: MessageCircle },
    ],
    correctHint: 'Richtig! Respekt ist unser Fundament. 💪',
    wrongHint: 'Das ist auf 7B Hub erlaubt! Überlege nochmal…',
    cta: 'Weiter'
  },
  {
    id: 'discover',
    title: 'Content entdecken',
    subtitle: 'Finde Videos & Streams die du liebst',
    emoji: '🎬',
    bg: 'from-cyan-600 via-teal-600 to-emerald-600',
    orb1: 'bg-cyan-500/30',
    orb2: 'bg-teal-500/20',
    type: 'reveal',
    features: [
      { icon: TrendingUp, label: 'Trending', desc: 'Sieh was gerade angesagt ist', color: 'from-orange-500 to-red-500' },
      { icon: Play, label: 'Live', desc: 'Schau Live-Streams in Echtzeit', color: 'from-red-500 to-pink-500' },
      { icon: Star, label: 'Für dich', desc: 'Personalisierte Empfehlungen', color: 'from-violet-500 to-purple-500' },
      { icon: Users, label: 'Creator', desc: 'Folge deinen Lieblings-Creatorn', color: 'from-cyan-500 to-blue-500' },
    ],
    cta: 'Cool!'
  },
  {
    id: 'tokens',
    title: 'Tokens & Coins',
    subtitle: 'Deine Währung auf der Plattform',
    emoji: '🪙',
    bg: 'from-amber-500 via-orange-500 to-red-500',
    orb1: 'bg-amber-500/30',
    orb2: 'bg-orange-500/20',
    type: 'quiz',
    question: 'Wie kannst du Tokens verdienen?',
    options: [
      { text: 'Täglich einloggen', correct: true, icon: Flame },
      { text: 'Gar nicht – man muss kaufen', correct: false, icon: Lock },
      { text: 'Nur durch Spenden', correct: false, icon: Heart },
      { text: 'Token gibt es nicht', correct: false, icon: Sword },
    ],
    correctHint: 'Super! Täglich einloggen = tägliche Belohnungen! 🔥',
    wrongHint: 'Falsch! Du kannst Tokens kostenlos durch Aktivität verdienen!',
    cta: 'Weiter'
  },
  {
    id: 'support',
    title: 'Plattform unterstützen',
    subtitle: 'Hilf uns, 7B Hub werbefrei zu halten',
    emoji: '💖',
    bg: 'from-rose-500 via-pink-500 to-red-500',
    orb1: 'bg-rose-500/30',
    orb2: 'bg-pink-500/20',
    type: 'reveal',
    features: [
      { icon: Heart, label: 'Spenden', desc: 'Unterstütze die Serverkosten', color: 'from-red-500 to-rose-500' },
      { icon: Crown, label: 'VIP Status', desc: 'Exklusive Profil-Rahmen & Effekte', color: 'from-amber-400 to-yellow-500' },
      { icon: Star, label: 'Keine Werbung', desc: 'Genieße ein komplett werbefreies Erlebnis', color: 'from-cyan-500 to-blue-500' },
      { icon: Zap, label: 'Mehr Features', desc: 'Ermögliche neue Funktionen für alle', color: 'from-violet-500 to-purple-500' },
    ],
    cta: 'Verstanden!'
  },
  {
    id: 'creator',
    title: 'Werde Creator',
    subtitle: 'Teile deine Welt mit der Community',
    emoji: '🚀',
    bg: 'from-pink-600 via-rose-600 to-red-600',
    orb1: 'bg-pink-500/30',
    orb2: 'bg-rose-500/20',
    type: 'reveal',
    features: [
      { icon: Upload, label: 'Videos hochladen', desc: 'Einfach & schnell mit Google Drive', color: 'from-green-500 to-emerald-500' },
      { icon: Globe, label: 'Live gehen', desc: 'Starte deinen eigenen Stream', color: 'from-red-500 to-pink-500' },
      { icon: Crown, label: 'Monetarisierung', desc: 'Mitgliedschaften & Shop', color: 'from-amber-500 to-yellow-500' },
      { icon: Award, label: 'Achievements', desc: 'Schalte Abzeichen frei', color: 'from-violet-500 to-fuchsia-500' },
    ],
    cta: 'Verstanden!'
  },
  {
    id: 'ready',
    title: 'Du bist bereit!',
    subtitle: 'Viel Spaß auf 7B Hub 🎉',
    emoji: '⚡',
    bg: 'from-emerald-500 via-teal-500 to-cyan-500',
    orb1: 'bg-emerald-500/30',
    orb2: 'bg-teal-500/20',
    type: 'finish',
    cta: "Los geht's!"
  }
];

// ─── PARTICLE COMPONENT ───────────────────────────────────────────────────────
function Particles({ color }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-1 h-1 rounded-full ${color || 'bg-white/30'}`}
          style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        />
      ))}
    </div>
  );
}

// ─── QUIZ STEP ────────────────────────────────────────────────────────────────
function QuizStep({ step, onCorrect }) {
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (step.options[idx].correct) {
      setTimeout(() => onCorrect(), 1200);
    }
  };

  const isCorrect = answered && step.options[selected]?.correct;

  return (
    <div className="space-y-4">
      <p className="text-white font-bold text-lg text-center mb-6">{step.question}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {step.options.map((opt, i) => {
          const Icon = opt.icon;
          let bg = 'bg-white/5 border-white/10 hover:bg-white/10';
          if (answered && i === selected) {
            bg = opt.correct
              ? 'bg-green-500/20 border-green-500/60'
              : 'bg-red-500/20 border-red-500/60';
          } else if (answered && opt.correct) {
            bg = 'bg-green-500/10 border-green-500/30';
          }
          return (
            <motion.button
              key={i}
              whileHover={!answered ? { scale: 1.03 } : {}}
              whileTap={!answered ? { scale: 0.97 } : {}}
              onClick={() => handleSelect(i)}
              className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${bg}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-white/90 font-medium text-sm">{opt.text}</span>
              {answered && i === selected && (
                <span className="ml-auto text-lg">{opt.correct ? '✅' : '❌'}</span>
              )}
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl text-center font-bold ${isCorrect ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}
          >
            {isCorrect ? step.correctHint : step.wrongHint}
            {!isCorrect && (
              <button
                onClick={() => { setSelected(null); setAnswered(false); }}
                className="block mx-auto mt-2 text-sm underline text-white/60"
              >
                Nochmal versuchen
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── REVEAL STEP ─────────────────────────────────────────────────────────────
function RevealStep({ step, onReady }) {
  const [revealed, setRevealed] = useState([]);

  const reveal = (i) => {
    if (!revealed.includes(i)) {
      const next = [...revealed, i];
      setRevealed(next);
      if (next.length === step.features.length) {
        setTimeout(() => onReady(), 500);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {step.features.map((f, i) => {
        const Icon = f.icon;
        const done = revealed.includes(i);
        return (
          <motion.button
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.12 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => reveal(i)}
            className={`relative p-5 rounded-2xl border text-left transition-all overflow-hidden ${done ? 'border-white/30 bg-white/10' : 'border-white/10 bg-white/5'}`}
          >
            {done && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-20`}
              />
            )}
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-3 shadow-lg`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-white font-bold text-sm mb-1">{f.label}</p>
            <AnimatePresence>
              {done ? (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-white/60 text-xs">
                  {f.desc}
                </motion.p>
              ) : (
                <p className="text-white/30 text-xs">Tippe um mehr zu erfahren</p>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: revealed.length < step.features.length ? 1 : 0 }}
        className="col-span-2 text-center text-white/40 text-xs mt-2"
      >
        {step.features.length - revealed.length} verbleibend – tippe alle Karten an!
      </motion.p>
    </div>
  );
}

// ─── FINISH STEP ─────────────────────────────────────────────────────────────
function FinishStep() {
  return (
    <div className="text-center py-2 sm:py-4">
      <motion.div
        animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
        className="text-6xl md:text-7xl mb-6"
      >
        🎉
      </motion.div>
      <div className="space-y-3 max-w-sm mx-auto">
        {['Videos entdecken', 'Creator werden', 'Community erleben'].map((t, i) => (
          <motion.div
            key={t}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2 }}
            className="flex items-center gap-3 bg-white/10 rounded-2xl p-3 sm:p-4 text-left"
          >
            <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
            <span className="text-white font-medium text-sm sm:text-base">{t}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function Tutorial() {
  const [stepIdx, setStepIdx] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [revealDone, setRevealDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [direction, setDirection] = useState(1);

  const step = STEPS[stepIdx];
  const isLast = stepIdx === STEPS.length - 1;

  // Determine if "next" is unlocked
  const canProceed =
    step.type === 'welcome' ||
    step.type === 'finish' ||
    (step.type === 'quiz' && quizDone) ||
    (step.type === 'reveal' && revealDone);

  const goNext = async () => {
    if (!canProceed) return;
    if (isLast) {
      setSaving(true);
      try {
        const raw = localStorage.getItem('app_user');
        if (raw) {
          const u = JSON.parse(raw);
          await base44.entities.AppUser.update(u.id, { has_seen_tutorial: true });
          u.has_seen_tutorial = true;
          localStorage.setItem('app_user', JSON.stringify(u));
          window.dispatchEvent(new Event('user-updated'));
        }
      } catch (e) {}
      window.location.href = createPageUrl('Home');
      return;
    }
    setDirection(1);
    setStepIdx(i => i + 1);
    setQuizDone(false);
    setRevealDone(false);
  };

  const goPrev = () => {
    if (stepIdx === 0) return;
    setDirection(-1);
    setStepIdx(i => i - 1);
    setQuizDone(false);
    setRevealDone(false);
  };

  const variants = {
    initial: (d) => ({ opacity: 0, x: d > 0 ? 80 : -80, scale: 0.97 }),
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: (d) => ({ opacity: 0, x: d > 0 ? -80 : 80, scale: 0.97 }),
  };

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center px-4 py-6 sm:py-10 relative overflow-hidden">
      {/* BG Gradient */}
      <motion.div
        key={step.id + '-bg'}
        className={`fixed inset-0 bg-gradient-to-br ${step.bg} opacity-20 -z-10`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 0.8 }}
      />
      <div className="fixed inset-0 bg-black/70 -z-10" />

      {/* Orbs */}
      <motion.div key={step.id + '-o1'} className={`fixed top-1/4 left-1/4 w-[400px] h-[400px] ${step.orb1} rounded-full blur-[150px] animate-pulse pointer-events-none -z-10`} />
      <motion.div key={step.id + '-o2'} className={`fixed bottom-1/4 right-1/4 w-[400px] h-[400px] ${step.orb2} rounded-full blur-[150px] animate-pulse pointer-events-none -z-10`} style={{ animationDelay: '1.5s' }} />
      <Particles />

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-white/10 z-50">
        <motion.div
          className={`h-full bg-gradient-to-r ${step.bg}`}
          animate={{ width: `${((stepIdx + 1) / STEPS.length) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Step Dots */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 flex gap-2 z-50">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={`rounded-full transition-all duration-300 ${i === stepIdx ? 'w-8 h-2.5 bg-white' : i < stepIdx ? 'w-2.5 h-2.5 bg-green-400' : 'w-2.5 h-2.5 bg-white/20'}`}
          />
        ))}
      </div>

      {/* Card */}
      <div className="w-full max-w-xl relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step.id}
            custom={direction}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="bg-white/[0.06] backdrop-blur-2xl rounded-[32px] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            {/* Header Gradient Strip */}
            <div className={`h-2 w-full bg-gradient-to-r ${step.bg}`} />

            <div className="p-5 sm:p-7 md:p-10">
              {/* Emoji + Title */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="text-5xl md:text-6xl text-center mb-3 md:mb-4"
              >
                {step.emoji}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-center mb-6 md:mb-8"
              >
                <h2 className="text-2xl md:text-4xl font-black tracking-tight mb-1 md:mb-2"
                  style={{ background: `linear-gradient(to right, #fff, rgba(255,255,255,0.7))`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {step.title}
                </h2>
                <p className="text-white/50 text-sm md:text-base">{step.subtitle}</p>
              </motion.div>

              {/* Body */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                {step.type === 'welcome' && (
                  <div className="space-y-3 mb-6">
                    {[
                      { icon: Play, text: 'Videos & Live-Streams entdecken', color: 'text-cyan-400' },
                      { icon: Users, text: 'Community & Creator treffen', color: 'text-violet-400' },
                      { icon: Zap, text: 'Tokens sammeln & Sachen kaufen', color: 'text-amber-400' },
                      { icon: Upload, text: 'Eigene Inhalte hochladen', color: 'text-pink-400' },
                    ].map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4"
                        >
                          <Icon className={`w-5 h-5 ${item.color} flex-shrink-0`} />
                          <span className="text-white/80 font-medium text-sm">{item.text}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {step.type === 'quiz' && (
                  <QuizStep
                    step={step}
                    onCorrect={() => setQuizDone(true)}
                  />
                )}

                {step.type === 'reveal' && (
                  <RevealStep
                    step={step}
                    onReady={() => setRevealDone(true)}
                  />
                )}

                {step.type === 'finish' && <FinishStep />}
              </motion.div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 gap-4">
                <Button
                  onClick={goPrev}
                  variant="ghost"
                  className={`rounded-2xl text-white hover:bg-white/10 transition-all ${stepIdx === 0 ? 'opacity-0 pointer-events-none' : ''}`}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Zurück
                </Button>

                <span className="text-white/30 text-xs font-medium">{stepIdx + 1} / {STEPS.length}</span>

                <motion.div whileTap={canProceed ? { scale: 0.95 } : {}}>
                  <Button
                    onClick={goNext}
                    disabled={!canProceed || saving}
                    className={`rounded-2xl font-bold px-6 bg-gradient-to-r ${step.bg} text-white shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all`}
                  >
                    {saving ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Speichern...
                      </div>
                    ) : (
                      <>
                        {step.cta}
                        {!isLast && <ChevronRight className="w-4 h-4 ml-1" />}
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>

              {/* Lock hint */}
              {!canProceed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-white/30 text-xs mt-3 flex items-center justify-center gap-1"
                >
                  <Lock className="w-3 h-3" />
                  {step.type === 'quiz' ? 'Beantworte die Frage, um weiterzukommen' : 'Tippe alle Karten an, um weiterzukommen'}
                </motion.p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}