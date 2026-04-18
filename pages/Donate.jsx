import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AnimatedBackground from '@/components/streaming/AnimatedBackground';

export default function Donate() {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('app_user');
      return (u && u !== "undefined") ? JSON.parse(u) : null;
    } catch(e) { return null; }
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0014] via-[#050505] to-[#0a0a0b] flex items-center justify-center px-4 relative overflow-hidden">
        <AnimatedBackground />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl w-full relative z-10"
        >
          <div className="bg-[#1a1a1c]/90 backdrop-blur-2xl rounded-3xl p-12 border border-white/10">
            <AlertTriangle className="w-16 h-16 text-amber-400 mx-auto mb-6" />
            <h1 className="text-3xl font-black text-white text-center mb-4">Anmeldung erforderlich</h1>
            <p className="text-white/60 text-center mb-8">Bitte melde dich an, um uns zu unterstützen.</p>
            <div className="flex flex-col gap-3">
              <Link to={createPageUrl('SignIn')} className="w-full">
                <Button className="w-full h-12 bg-gradient-to-r from-cyan-600 to-teal-600">Anmelden</Button>
              </Link>
              <Link to={createPageUrl('Register')} className="w-full">
                <Button variant="outline" className="w-full h-12">Registrieren</Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 rounded-3xl p-8 md:p-12 border border-white/10 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-red-500" />
        
        <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart className="w-10 h-10 text-rose-500 fill-rose-500" />
        </div>
        
        <h1 className="text-4xl font-black text-white mb-4">
          Unterstütze 7B Hub
        </h1>
        <p className="text-lg text-white/60 mb-8 max-w-2xl mx-auto leading-relaxed">
          7B Hub ist ein Community-Projekt. Um die Plattform werbefrei zu halten und die laufenden Serverkosten zu decken, sind wir auf die Unterstützung unserer Nutzer angewiesen.
        </p>

        <div className="bg-black/20 rounded-2xl p-6 mb-8 max-w-xl mx-auto border border-white/5">
          <h3 className="font-bold text-white mb-2">Wie kann ich spenden?</h3>
          <p className="text-white/50 text-sm">
            Aktuell bearbeiten wir Spendenanfragen persönlich, um dir deinen VIP-Status und exklusive Belohnungen direkt freizuschalten. Bitte kontaktiere uns über das Support-System, wenn du spenden möchtest.
          </p>
        </div>

        <Link to={createPageUrl('Support')}>
          <Button className="h-14 px-8 text-lg font-bold bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 shadow-lg shadow-rose-500/25 transition-all hover:scale-105 active:scale-95 rounded-xl">
            Kontakt aufnehmen
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}