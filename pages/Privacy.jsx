import React from 'react';
import { Shield, Lock, Eye, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimatedBackground from '@/components/streaming/AnimatedBackground';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white p-4 md:p-8 relative overflow-hidden">
      <AnimatedBackground />
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-900/20">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Datenschutzerklärung</h1>
          <p className="text-xl text-white/50">Deine Daten gehören dir. Wir schützen sie.</p>
        </div>

        <div className="space-y-8 bg-[#151517]/50 backdrop-blur-xl p-8 rounded-3xl border border-white/5">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Eye className="w-6 h-6 text-green-400" />
              1. Verantwortliche Stelle
            </h2>
            <p className="text-white/70 leading-relaxed">
              Verantwortlich für die Datenverarbeitung auf dieser Plattform ist der Betreiber von 7B Hub. 
              Kontakt: milo.lokadee@gmail.com. Wir nehmen den Schutz deiner persönlichen Daten sehr ernst und behandeln 
              deine personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Eye className="w-6 h-6 text-green-400" />
              2. Erfassung und Speicherung personenbezogener Daten
            </h2>
            <p className="text-white/70 leading-relaxed mb-3">
              Wir erheben nur die Daten, die für die Nutzung von 7B Hub absolut notwendig sind oder die du freiwillig bereitstellst:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-2 ml-4">
              <li><strong>Registrierungsdaten:</strong> Benutzername, Passwort (verschlüsselt gespeichert)</li>
              <li><strong>Profilinformationen:</strong> Avatar, Bio, Social-Media-Links (freiwillig)</li>
              <li><strong>Nutzungsdaten:</strong> Hochgeladene Videos, Kommentare, Chat-Nachrichten, Likes</li>
              <li><strong>Technische Daten:</strong> IP-Adresse, Browser-Typ, Geräteinformationen (zur Sicherheit und Fehleranalyse)</li>
              <li><strong>Virtuelle Währung:</strong> Token-Guthaben und Transaktionshistorie</li>
            </ul>
            <p className="text-white/70 leading-relaxed mt-3">
              Diese Daten werden gespeichert, um dir die Nutzung der Plattform zu ermöglichen und dein Nutzererlebnis zu verbessern.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Shield className="w-6 h-6 text-green-400" />
              3. Zweck der Datenverarbeitung
            </h2>
            <p className="text-white/70 leading-relaxed">
              Deine Daten werden ausschließlich für folgende Zwecke verarbeitet: Bereitstellung und Verwaltung deines Accounts, 
              Ermöglichung der Kommunikation mit anderen Nutzern, Veröffentlichung und Verwaltung deiner Inhalte, 
              Verhinderung von Missbrauch und Betrug, Verbesserung unserer Dienste, Erfüllung gesetzlicher Verpflichtungen. 
              Eine Weitergabe an Dritte erfolgt nur, wenn dies gesetzlich vorgeschrieben ist oder du ausdrücklich zugestimmt hast.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Shield className="w-6 h-6 text-green-400" />
              4. Datensicherheit
            </h2>
            <p className="text-white/70 leading-relaxed">
              Wir setzen technische und organisatorische Sicherheitsmaßnahmen ein, um deine Daten vor Manipulation, Verlust, 
              Zerstörung oder dem Zugriff unberechtigter Personen zu schützen. Alle Übertragungen sind SSL/TLS-verschlüsselt. 
              Passwörter werden ausschließlich als kryptografischer Hash gespeichert und sind für uns nicht im Klartext einsehbar. 
              Deine privaten Nachrichten und persönlichen Daten sind für andere Nutzer nicht einsehbar. Unsere Sicherheitsmaßnahmen 
              werden regelmäßig überprüft und dem Stand der Technik angepasst.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <FileText className="w-6 h-6 text-green-400" />
              5. Cookies und Tracking
            </h2>
            <p className="text-white/70 leading-relaxed">
              Wir nutzen essenzielle Cookies, um deinen Login-Status zu speichern und die Funktionalität der Plattform zu gewährleisten. 
              Diese Cookies sind technisch notwendig und können nicht deaktiviert werden, ohne die Nutzung der Plattform zu beeinträchtigen. 
              Wir verwenden keine Third-Party-Tracker oder Werbenetzwerke ohne deine explizite Zustimmung. 
              Analysetools werden nur anonymisiert und in aggregierter Form eingesetzt, um die Plattform zu verbessern.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <FileText className="w-6 h-6 text-green-400" />
              6. Deine Rechte
            </h2>
            <p className="text-white/70 leading-relaxed mb-3">
              Du hast jederzeit das Recht auf:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-2 ml-4">
              <li><strong>Auskunft:</strong> Welche Daten wir über dich gespeichert haben</li>
              <li><strong>Berichtigung:</strong> Korrektur falscher oder unvollständiger Daten</li>
              <li><strong>Löschung:</strong> Löschung deiner Daten („Recht auf Vergessenwerden")</li>
              <li><strong>Einschränkung:</strong> Einschränkung der Verarbeitung deiner Daten</li>
              <li><strong>Datenübertragbarkeit:</strong> Erhalt deiner Daten in einem strukturierten Format</li>
              <li><strong>Widerspruch:</strong> Widerspruch gegen die Verarbeitung deiner Daten</li>
            </ul>
            <p className="text-white/70 leading-relaxed mt-3">
              Zur Ausübung deiner Rechte wende dich bitte an: milo.lokadee@gmail.com
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <FileText className="w-6 h-6 text-green-400" />
              7. Speicherdauer
            </h2>
            <p className="text-white/70 leading-relaxed">
              Deine Daten werden solange gespeichert, wie dein Account aktiv ist. Bei Account-Löschung werden personenbezogene Daten 
              innerhalb von 30 Tagen gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten bestehen. 
              Öffentliche Beiträge (Videos, Kommentare) können zur Wahrung der Integrität der Community anonymisiert archiviert werden.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <FileText className="w-6 h-6 text-green-400" />
              8. Weitergabe von Daten
            </h2>
            <p className="text-white/70 leading-relaxed">
              Eine Weitergabe deiner Daten an Dritte erfolgt nur in folgenden Fällen: Bei gesetzlicher Verpflichtung 
              (z.B. auf behördliche Anfrage), zur Abwehr von Rechtsverletzungen, mit deiner ausdrücklichen Einwilligung. 
              Wir verkaufen deine Daten niemals an Dritte.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <FileText className="w-6 h-6 text-green-400" />
              9. Änderungen der Datenschutzerklärung
            </h2>
            <p className="text-white/70 leading-relaxed">
              Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie an geänderte Rechtslagen oder Änderungen 
              unserer Dienste anzupassen. Die aktuelle Version ist stets auf dieser Seite abrufbar.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <FileText className="w-6 h-6 text-green-400" />
              10. Beschwerderecht
            </h2>
            <p className="text-white/70 leading-relaxed">
              Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung deiner personenbezogenen Daten 
              durch uns zu beschweren.
            </p>
          </section>

          <div className="pt-8 border-t border-white/10">
            <p className="text-white/40 text-sm mb-4">
              <strong>Kontakt Datenschutz:</strong> milo.lokadee@gmail.com<br />
              Stand: Januar 2026
            </p>
            <a href="mailto:milo.lokadee@gmail.com">
              <Button className="bg-green-600 hover:bg-green-500 text-white rounded-xl">
                Datenschutzanfrage senden
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}