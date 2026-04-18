import React from 'react';
import { Book, Check, XCircle, HeartHandshake, MessageSquare } from 'lucide-react';
import AnimatedBackground from '@/components/streaming/AnimatedBackground';

export default function Guidelines() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white p-4 md:p-8 relative overflow-hidden">
      <AnimatedBackground />
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-amber-900/20">
            <Book className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Community Richtlinien</h1>
          <p className="text-xl text-white/50">Unser Kodex für eine positive Community.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="bg-[#151517]/50 backdrop-blur-xl p-8 rounded-3xl border border-green-500/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />
            <h2 className="text-2xl font-bold text-green-400 mb-6 flex items-center gap-2">
              <Check className="w-6 h-6" /> Do's
            </h2>
            <ul className="space-y-4 text-white/80">
              <li className="flex gap-3">
                <HeartHandshake className="w-5 h-5 text-green-500 flex-shrink-0" />
                Sei respektvoll und freundlich zu anderen.
              </li>
              <li className="flex gap-3">
                <MessageSquare className="w-5 h-5 text-green-500 flex-shrink-0" />
                Gib konstruktives Feedback statt Hate.
              </li>
              <li className="flex gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                Teile kreative und originelle Inhalte.
              </li>
            </ul>
          </div>

          <div className="bg-[#151517]/50 backdrop-blur-xl p-8 rounded-3xl border border-red-500/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
            <h2 className="text-2xl font-bold text-red-400 mb-6 flex items-center gap-2">
              <XCircle className="w-6 h-6" /> Don'ts
            </h2>
            <ul className="space-y-4 text-white/80">
              <li className="flex gap-3">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                Keine Belästigung, Mobbing oder Diskriminierung.
              </li>
              <li className="flex gap-3">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                Kein Spam oder irreführende Werbung.
              </li>
              <li className="flex gap-3">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                Keine illegalen oder urheberrechtlich geschützten Inhalte ohne Rechte.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}