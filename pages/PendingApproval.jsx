import { motion } from 'framer-motion';
import { Clock, Shield, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PendingApproval() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0014] via-[#050505] to-[#0a0a0b] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-[200px] animate-pulse pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-[200px] animate-pulse pointer-events-none" style={{ animationDelay: '1.5s' }} />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-2xl w-full relative z-10"
      >
        <div className="bg-gradient-to-b from-[#1a1a1c]/95 to-[#0a0a0b]/95 backdrop-blur-2xl rounded-[32px] p-8 md:p-12 border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)]">
          
          {/* Animated Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.2, duration: 0.8 }}
            className="relative w-28 h-28 mx-auto mb-8"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-600 rounded-full blur-3xl opacity-60 animate-pulse" />
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-amber-500/40 border-4 border-amber-400/30">
              <Clock className="w-14 h-14 text-white drop-shadow-2xl animate-pulse" />
            </div>
          </motion.div>

          {/* Title & Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-white mb-4">
              Account wird geprüft
            </h1>
            <p className="text-white/70 text-lg leading-relaxed max-w-xl mx-auto mb-6">
              Deine Registrierung war erfolgreich! Ein Administrator wird deinen Account in Kürze prüfen und freischalten.
            </p>
          </motion.div>

          {/* Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-3 gap-4 mb-8"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4 mx-auto">
                <Shield className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-white font-bold text-center mb-2">Sicherheit</h3>
              <p className="text-white/50 text-sm text-center">Schutz vor Spam und Missbrauch</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 mx-auto">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-white font-bold text-center mb-2">24-48h</h3>
              <p className="text-white/50 text-sm text-center">Übliche Bearbeitungszeit</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-4 mx-auto">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-white font-bold text-center mb-2">Automatisch</h3>
              <p className="text-white/50 text-sm text-center">Benachrichtigung bei Freischaltung</p>
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-6 mb-8"
          >
            <h3 className="text-amber-300 font-bold mb-4 flex items-center gap-2">
              <ArrowRight className="w-5 h-5" />
              Was passiert als Nächstes?
            </h3>
            <ul className="space-y-3 text-white/70">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                <span>Ein Admin prüft deine Registrierung auf Echtheit</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                <span>Nach Freischaltung kannst du dich sofort anmelden</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                <span>Du erhältst vollen Zugriff auf alle Features der Plattform</span>
              </li>
            </ul>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link to={createPageUrl('SignIn')} className="flex-1">
              <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white h-14 text-lg font-bold shadow-2xl shadow-amber-500/30 rounded-2xl border border-amber-400/20 active:scale-95 md:hover:scale-105 transition-all">
                Zur Anmeldung
              </Button>
            </Link>
            <Link to={createPageUrl('Home')} className="flex-1">
              <Button variant="outline" className="w-full border-white/20 bg-white/5 backdrop-blur-xl text-white hover:bg-white/10 hover:border-white/30 h-14 text-lg font-bold rounded-2xl active:scale-95 md:hover:scale-105 transition-all">
                Zur Startseite
              </Button>
            </Link>
          </motion.div>

          {/* Support Info */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center text-white/40 text-sm mt-8"
          >
            Fragen? Kontaktiere uns unter{' '}
            <Link to={createPageUrl('Support')} className="text-amber-400 hover:text-amber-300 underline">
              Support
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}