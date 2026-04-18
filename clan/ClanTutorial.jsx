import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Target, TrendingUp, ChevronRight, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ClanTutorial({ onComplete }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Willkommen bei den Clans!",
      description: "Schließe dich mit anderen Spielern zusammen, um als Team an die Spitze zu gelangen. Gemeinsam seid ihr stärker!",
      icon: <Users className="w-16 h-16 text-cyan-400" />,
      color: "from-cyan-500 to-blue-600"
    },
    {
      title: "Erfüllt Clan Quests",
      description: "Arbeitet als Team, um wöchentliche Quests zu erfüllen. Sammelt XP und schaltet exklusive Belohnungen frei!",
      icon: <Target className="w-16 h-16 text-fuchsia-400" />,
      color: "from-fuchsia-500 to-purple-600"
    },
    {
      title: "Erweitert euren Clan",
      description: "Spendet gemeinsam Tokens, um neue Plätze im Clan freizuschalten. Jeder Token bringt euch näher an ein größeres Team!",
      icon: <TrendingUp className="w-16 h-16 text-yellow-400" />,
      color: "from-yellow-500 to-orange-600"
    }
  ];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.1, y: -20 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="relative w-full max-w-lg bg-black/40 border border-white/10 rounded-3xl p-8 overflow-hidden shadow-2xl"
        >
          {/* Animated Background Glow */}
          <div className={`absolute inset-0 bg-gradient-to-br ${steps[step].color} opacity-10`} />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className={`absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br ${steps[step].color} rounded-full blur-[80px] opacity-30`}
          />

          <div className="relative z-10 flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-32 h-32 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-8 shadow-inner relative"
            >
              <div className="absolute inset-0 rounded-full bg-white/5 animate-ping" style={{ animationDuration: '3s' }} />
              {steps[step].icon}
            </motion.div>

            <h2 className="text-3xl font-black text-white mb-4">
              {steps[step].title}
            </h2>
            <p className="text-white/60 text-lg mb-8 leading-relaxed">
              {steps[step].description}
            </p>

            <div className="flex items-center justify-between w-full">
              <div className="flex gap-2">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-white' : 'w-2 bg-white/20'}`}
                  />
                ))}
              </div>
              <Button
                onClick={() => {
                  if (step < steps.length - 1) {
                    setStep(s => s + 1);
                  } else {
                    onComplete();
                  }
                }}
                className={`bg-gradient-to-r ${steps[step].color} hover:opacity-90 text-white font-bold px-8 h-12 rounded-xl`}
              >
                {step < steps.length - 1 ? (
                  <>Weiter <ChevronRight className="w-5 h-5 ml-1" /></>
                ) : (
                  <>Verstanden! <Sparkles className="w-5 h-5 ml-1" /></>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}