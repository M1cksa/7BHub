import { useState } from 'react';
import { ChevronDown, Mail, MessageCircle, BookOpen, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const FAQ_ITEMS = [
  {
    question: 'Wie kann ich mein Passwort zurücksetzen?',
    answer: 'Gehe zur Anmeldeseite und klicke auf „Passwort vergessen". Du erhältst eine E-Mail mit einem Reset-Link.',
  },
  {
    question: 'Wie lade ich ein Video hoch?',
    answer: 'Klicke in der Navigationsleiste auf „Upload" und wähle deine Videodatei aus. Unterstützte Formate: MP4, MOV, AVI.',
  },
  {
    question: 'Was sind Tokens und wie bekomme ich sie?',
    answer: 'Tokens sind die Währung auf 7B Hub. Du erhältst sie durch tägliche Logins, das Abschließen von Quests und die Teilnahme an Events.',
  },
  {
    question: 'Was ist der Battle Pass?',
    answer: 'Der Battle Pass ist ein saisonales Belohnungssystem. Durch Aktivitäten auf der Plattform sammelst du XP und schaltest exklusive Belohnungen frei.',
  },
  {
    question: 'Wie trete ich einem Clan bei?',
    answer: 'Gehe zur Clans-Seite, durchsuche bestehende Clans und klicke auf „Beitreten". Alternativ kannst du selbst einen Clan gründen.',
  },
  {
    question: 'Wie melde ich unangemessene Inhalte?',
    answer: 'Klicke auf das Drei-Punkte-Menü bei einem Video oder Kommentar und wähle „Melden". Unser Moderationsteam prüft den Inhalt zeitnah.',
  },
  {
    question: 'Kann ich meinen Account löschen?',
    answer: 'Ja, kontaktiere uns über das Kontaktformular unten. Wir bearbeiten Löschanfragen innerhalb von 7 Werktagen.',
  },
  {
    question: 'Was ist der Unterschied zwischen Free und Premium?',
    answer: 'Free-Nutzer haben Zugang zu allen Basis-Features. Premium-Nutzer erhalten exklusive Frames, Badges, Animationen und frühen Zugang zu neuen Features.',
  },
];

function FaqItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn('rounded-2xl border transition-all duration-200', open ? 'border-white/15 bg-white/[0.06]' : 'border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.05]')}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-white/90 font-semibold text-sm">{item.question}</span>
        <ChevronDown className={cn('w-4 h-4 text-white/40 shrink-0 transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="px-5 pb-4 text-white/60 text-sm leading-relaxed border-t border-white/[0.06] pt-3">
          {item.answer}
        </div>
      )}
    </div>
  );
}

export default function HelpPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-2"
          style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(124,58,237,0.2))', border: '1px solid rgba(59,130,246,0.3)' }}>
          <Sparkles className="w-6 h-6 text-blue-400" />
        </div>
        <h1 className="text-3xl font-black text-white">Hilfe & FAQ</h1>
        <p className="text-white/50 text-sm max-w-md mx-auto">Hier findest du Antworten auf häufig gestellte Fragen und kannst uns direkt kontaktieren.</p>
      </div>

      {/* FAQ */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-blue-400" />
          <h2 className="text-white font-bold text-lg">Häufige Fragen</h2>
        </div>
        <div className="space-y-2">
          {FAQ_ITEMS.map((item, i) => <FaqItem key={i} item={item} />)}
        </div>
      </section>

      {/* Contact */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-4 h-4 text-blue-400" />
          <h2 className="text-white font-bold text-lg">Kontakt</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <a href="mailto:support@7bhub.de" className="flex items-center gap-4 p-5 rounded-2xl border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/15 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm group-hover:text-blue-300 transition-colors">E-Mail Support</p>
              <p className="text-white/40 text-xs mt-0.5">support@7bhub.de</p>
            </div>
          </a>
          <a href="/Feedback" className="flex items-center gap-4 p-5 rounded-2xl border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/15 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm group-hover:text-violet-300 transition-colors">Feedback geben</p>
              <p className="text-white/40 text-xs mt-0.5">Ideen & Verbesserungen</p>
            </div>
          </a>
        </div>
      </section>
    </div>
  );
}