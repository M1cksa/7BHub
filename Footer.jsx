import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Footer() {
  return (
    <footer className="bg-black/40 backdrop-blur-xl border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm text-white/50">
          <Link to={createPageUrl('Imprint')} className="hover:text-white transition-colors">
            Impressum
          </Link>
          <Link to={createPageUrl('Terms')} className="hover:text-white transition-colors">
            AGB
          </Link>
          <Link to={createPageUrl('ParentsGuide')} className="hover:text-white transition-colors">
            Eltern-Leitfaden
          </Link>
          <Link to={createPageUrl('UpcomingTerms')} className="hover:text-white transition-colors">
            Zukünftige AGB
          </Link>
          <Link to={createPageUrl('Privacy')} className="hover:text-white transition-colors">
            Datenschutz
          </Link>
          <Link to={createPageUrl('Guidelines')} className="hover:text-white transition-colors">
            Community-Richtlinien
          </Link>
          <Link to={createPageUrl('Support')} className="hover:text-white transition-colors">
            Support
          </Link>
          <Link to={createPageUrl('Donate')} className="hover:text-[color:var(--theme-primary)] transition-colors font-bold text-white/70">
            💖 Spenden
          </Link>
        </div>
        <div className="flex flex-col items-center gap-1 mt-4">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-white/40">7B Hub</span>
            <span className="text-[9px] font-black bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent tracking-widest">2.0</span>
          </div>
          <div className="text-xs text-white/20">© 2026 7B Hub. Alle Rechte vorbehalten.</div>
        </div>
      </div>
    </footer>
  );
}