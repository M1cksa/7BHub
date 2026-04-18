import React from 'react';
import { FileText, Scale, CheckCircle } from 'lucide-react';
import AnimatedBackground from '@/components/streaming/AnimatedBackground';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';

export default function Terms() {
  const { data: termsConfigs = [], isLoading } = useQuery({
    queryKey: ['termsConfig'],
    queryFn: async () => base44.entities.TermsConfig.list('-created_date', 1),
  });
  
  const config = termsConfigs[0] || {};
  const isUpcomingActive = config.upcoming_date && new Date() >= new Date(config.upcoming_date);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white p-4 md:p-8 relative overflow-hidden">
      <AnimatedBackground />
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-900/20">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Allgemeine Geschäftsbedingungen</h1>
          <p className="text-xl text-white/50">Die Regeln für ein faires Miteinander auf 7B Hub.</p>
        </div>

        <div className="space-y-6">
          
          {/* Wichtige Hinweise Box */}
          <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-400/30 rounded-2xl p-6 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-blue-400 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Das Wichtigste in Kürze
            </h3>
            <ul className="space-y-2 text-white/80 text-sm">
              <li>• Diese AGBs gelten für alle Nutzer von 7B Video Hub</li>
              <li>• Mindestalter 16 Jahre, unter 18 mit Einwilligung der Erziehungsberechtigten</li>
              <li>• Nur eigene oder rechtmäßig lizenzierte Inhalte hochladen</li>
              <li>• Virtuelle Währung (Tokens) ohne realen Gegenwert oder Rücktauschrecht</li>
              <li>• Bei Verstößen droht außerordentliche Kündigung ohne Entschädigung</li>
              <li>• Änderungen der AGB mit 6-wöchiger Widerspruchsfrist</li>
            </ul>
          </div>

          <div className="bg-[#151517]/50 backdrop-blur-xl p-8 rounded-3xl border border-white/5">
            <div className="prose prose-invert max-w-none space-y-8">
              
              {(isUpcomingActive && config.upcoming_full_text) ? (
                <ReactMarkdown>{config.upcoming_full_text}</ReactMarkdown>
              ) : (
                <>
              <section>
                <h3 className="text-2xl font-bold text-blue-400 mb-3">§1 Geltungsbereich und Vertragsschluss</h3>
                <p className="text-white/70 leading-relaxed mb-3">
                  <strong>1.1</strong> Diese Allgemeinen Geschäftsbedingungen (nachfolgend "AGB") regeln das Vertragsverhältnis zwischen 
                  dem Betreiber der Plattform <strong>7B Video Hub</strong> (nachfolgend "Anbieter") und den Nutzern (nachfolgend "Nutzer") 
                  bei der Nutzung der unter der Domain bereitgestellten Dienste.
                </p>
                <p className="text-white/70 leading-relaxed mb-3">
                  <strong>1.2</strong> Mit der Registrierung auf der Plattform gibt der Nutzer ein Angebot auf Abschluss eines 
                  Nutzungsvertrages ab. Der Vertrag kommt durch die Freischaltung des Nutzerkontos durch den Anbieter zustande.
                </p>
                <p className="text-white/70 leading-relaxed mb-3">
                  <strong>1.3</strong> Abweichende, entgegenstehende oder ergänzende Allgemeine Geschäftsbedingungen des Nutzers werden 
                  nicht Vertragsbestandteil, es sei denn, ihrer Geltung wird ausdrücklich schriftlich zugestimmt.
                </p>
                <p className="text-white/70 leading-relaxed">
                  <strong>1.4</strong> Diese AGB gelten ausschließlich gegenüber Verbrauchern im Sinne des § 13 BGB sowie gegenüber 
                  Unternehmern im Sinne des § 14 BGB. Für gewerbliche Nutzer gelten zusätzliche Bestimmungen.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-blue-400 mb-3">§2 Leistungsbeschreibung</h3>
                <p className="text-white/70 leading-relaxed mb-4">
                  <strong>7B Video Hub</strong> bietet dir folgende Services:
                </p>
                <ul className="list-disc list-inside text-white/70 space-y-2 ml-4">
                  <li>Live-Streaming und Video-On-Demand (VOD)</li>
                  <li>Shorts, Watch Parties und Community-Features</li>
                  <li>Chat, Kommentare und Interaktionsmöglichkeiten</li>
                  <li>Virtueller Shop mit kosmetischen Items</li>
                  <li>Upload-Belohnungen (Tokens) für Content-Creator</li>
                  <li>Interaktive Quizze, Umfragen und Mini-Games (z. B. Space Runner, Pokémon)</li>
                  <li>Direkte Videoanrufe zwischen Nutzern (Peer-to-Peer via WebRTC)</li>
                  <li>KI-gestützte Funktionen wie automatisch generierte Highlights</li>
                </ul>
                <p className="text-white/70 leading-relaxed mt-4">
                  Wir streben eine hohe Verfügbarkeit an, garantieren jedoch keine 100%ige Erreichbarkeit. 
                  Wartungsarbeiten werden nach Möglichkeit angekündigt.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-blue-400 mb-3">§3 Registrierung, Vertragsabschluss und Nutzerkonto</h3>
                <p className="text-white/70 leading-relaxed mb-3">
                  <strong>3.1 Registrierungsvoraussetzungen:</strong> Die Nutzung der Plattform erfordert eine Registrierung. 
                  Zur Registrierung sind vollständige und wahrheitsgemäße Angaben erforderlich. Mit der Registrierung erklärt 
                  der Nutzer, dass die von ihm gemachten Angaben der Wahrheit entsprechen.
                </p>
                <p className="text-white/70 leading-relaxed mb-3">
                  <strong>3.2 Mindestalter:</strong> Die Nutzung ist nur Personen gestattet, die das 16. Lebensjahr vollendet haben. 
                  Minderjährige zwischen 16 und 18 Jahren benötigen die ausdrückliche Einwilligung ihrer gesetzlichen Vertreter. 
                  Der Anbieter behält sich vor, diese Einwilligung im Einzelfall nachzufordern.
                </p>
                <p className="text-white/70 leading-relaxed mb-3">
                  <strong>3.3 Vertragsschluss:</strong> Nach vollständiger Registrierung erfolgt eine Prüfung durch den Anbieter. 
                  Der Nutzungsvertrag kommt erst mit der Freischaltung des Accounts durch den Anbieter zustande. 
                  Ein Anspruch auf Freischaltung besteht nicht.
                </p>
                <p className="text-white/70 leading-relaxed mb-3">
                  <strong>3.4 Pflichten des Nutzers:</strong>
                </p>
                <ul className="list-disc list-inside text-white/70 space-y-2 ml-4 mb-3">
                  <li>Vertrauliche Behandlung der Zugangsdaten und unverzügliche Mitteilung bei Missbrauchsverdacht</li>
                  <li>Keine Weitergabe oder Mehrfachnutzung des Accounts</li>
                  <li>Aktualisierung der persönlichen Daten bei Änderungen</li>
                  <li>Keine Registrierung unter fremdem Namen oder mit falschen Angaben</li>
                </ul>
                <p className="text-white/70 leading-relaxed">
                  <strong>3.5 Accountsperrung:</strong> Der Anbieter ist berechtigt, bei Verstößen gegen diese AGB oder gesetzliche 
                  Bestimmungen den Account vorübergehend oder dauerhaft zu sperren. Ein Anspruch auf Wiederfreischaltung besteht nicht.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-blue-400 mb-3">§4 Nutzerpflichten & Community-Regeln</h3>
                <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-5 mb-4">
                  <p className="text-red-300 font-semibold mb-2">⚠️ Streng verboten:</p>
                  <ul className="list-disc list-inside text-white/80 space-y-1 ml-2 text-sm">
                    <li>Rechtswidrige, pornografische oder gewaltverherrlichende Inhalte</li>
                    <li>Beleidigung, Diskriminierung, Hate Speech oder Mobbing</li>
                    <li>Urheberrechtsverletzungen (fremde Inhalte ohne Berechtigung)</li>
                    <li>Spam, Werbung oder Manipulation (Bots, Fake-Views)</li>
                    <li>Doxing, Drohungen oder Belästigung</li>
                  </ul>
                </div>
                <p className="text-white/70 leading-relaxed">
                  Verstöße führen zur <strong>sofortigen Account-Sperrung</strong> und können rechtliche Konsequenzen haben. 
                  Wir nehmen den Schutz unserer Community sehr ernst.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-blue-400 mb-3">§5 Virtuelle Währung, Tokens & Shop</h3>
                <p className="text-white/70 leading-relaxed mb-3">
                  <strong>5.1 Rechtsnatur:</strong> Die auf der Plattform verwendeten "Tokens" sind ausschließlich virtuelle, 
                  nicht übertragbare Werteinheiten ohne realen Gegenwert. Es besteht kein Anspruch auf Umtausch in gesetzliche 
                  Zahlungsmittel oder andere Vermögenswerte. Tokens stellen keine Forderung gegenüber dem Anbieter dar.
                </p>
                <p className="text-white/70 leading-relaxed mb-3">
                  <strong>5.2 Erwerb von Tokens:</strong> Tokens können durch folgende Aktivitäten verdient werden:
                </p>
                <ul className="list-disc list-inside text-white/70 space-y-2 ml-4 mb-4">
                  <li>Video-Uploads: 1.500 Tokens pro erfolgreich veröffentlichtem Video</li>
                  <li>Short-Video-Uploads: 1.500 Tokens pro Short</li>
                  <li>Teilnahme an Plattform-Events und Aktionen nach Ermessen des Anbieters</li>
                </ul>
                <p className="text-white/70 leading-relaxed mb-4">
                  <strong>5.3 Verwendung:</strong> Tokens können ausschließlich zum Erwerb virtueller Güter im 
                  Plattform-Shop verwendet werden. Der Anbieter behält sich vor, das Angebot an virtuellen Gütern 
                  jederzeit zu ändern oder einzustellen.
                </p>
                <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-xl p-5 mb-3">
                  <p className="text-yellow-300 font-semibold mb-2">⚠️ Wichtige Hinweise zu Tokens:</p>
                  <ul className="list-disc list-inside text-white/70 space-y-1 ml-2 text-sm">
                    <li>Kein realer Gegenwert und keine Rücktauschmöglichkeit in Geld</li>
                    <li>Nicht auf andere Nutzer übertragbar oder handelbar</li>
                    <li>Kein Rechtsanspruch auf Bestand, Verfügbarkeit oder Werterhalt</li>
                    <li>Bei Vertragsbeendigung oder Account-Sperrung verfallen Tokens ersatzlos</li>
                    <li>Der Anbieter ist berechtigt, Token-Guthaben bei Missbrauch oder Manipulation zu entziehen</li>
                  </ul>
                </div>
                <p className="text-white/70 leading-relaxed">
                  <strong>5.4 Keine Gewährleistung:</strong> Der Anbieter übernimmt keine Gewährleistung für die 
                  ständige Verfügbarkeit der Token-Funktionalität oder des virtuellen Shops. Ein Anspruch auf 
                  Schadensersatz bei technischen Störungen oder Änderungen des Systems besteht nicht.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-blue-400 mb-3">§6 Haftung und Gewährleistung</h3>
                <p className="text-white/70 leading-relaxed mb-3">
                  <strong>6.1 Haftungsumfang:</strong> Der Anbieter haftet unbeschränkt für Vorsatz und grobe Fahrlässigkeit, 
                  für die Verletzung von Leben, Körper und Gesundheit sowie nach den Vorschriften des Produkthaftungsgesetzes.
                </p>
                <p className="text-white/70 leading-relaxed mb-3">
                  <strong>6.2 Haftungsbeschränkung:</strong> Bei leicht fahrlässiger Verletzung wesentlicher Vertragspflichten 
                  (Kardinalpflichten) ist die Haftung der Höhe nach begrenzt auf den bei Vertragsschluss vorhersehbaren, 
                  vertragstypischen Schaden. Wesentliche Vertragspflichten sind solche, deren Erfüllung die ordnungsgemäße 
                  Durchführung des Vertrags überhaupt erst ermöglicht und auf deren Einhaltung der Nutzer regelmäßig vertrauen darf.
                </p>
                <p className="text-white/70 leading-relaxed mb-3">
                  <strong>6.3 Haftungsausschluss:</strong> Im Übrigen ist die Haftung – gleich aus welchem Rechtsgrund – 
                  ausgeschlossen. Dies gilt insbesondere für:
                </p>
                <ul className="list-disc list-inside text-white/70 space-y-2 ml-4 mb-3">
                  <li>Datenverlust oder technische Störungen</li>
                  <li>Entgangene Gewinne oder indirekte Schäden</li>
                  <li>Inhalte Dritter, die auf der Plattform geteilt werden</li>
                  <li>Unterbrechungen durch Wartungsarbeiten oder höhere Gewalt</li>
                </ul>
                <p className="text-white/70 leading-relaxed mb-3">
                  <strong>6.4 Gewährleistung:</strong> Der Anbieter übernimmt keine Gewährleistung für die ständige Verfügbarkeit 
                  der Plattform. Wartungsarbeiten können zu temporären Unterbrechungen führen.
                </p>
                <p className="text-white/70 leading-relaxed">
                  <strong>6.5 Störungsmeldung:</strong> Der Nutzer ist verpflichtet, offensichtliche Mängel oder rechtswidrige 
                  Inhalte unverzüglich unter <a href="mailto:milo.lokadee@gmail.com" className="text-blue-400 hover:underline">milo.lokadee@gmail.com</a> zu melden.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-blue-400 mb-3">§7 Urheberrecht, Nutzungsrechte und Lizenzen</h3>
                <p className="text-white/70 leading-relaxed mb-3">
                  <strong>7.1 Einräumung von Nutzungsrechten:</strong> Durch das Hochladen von Inhalten (Videos, Bilder, Texte etc.) 
                  räumt der Nutzer dem Anbieter ein einfaches, räumlich und zeitlich unbeschränktes, unentgeltliches Nutzungsrecht 
                  ein. Dieses Nutzungsrecht umfasst insbesondere das Recht zur Vervielfältigung, Verbreitung und öffentlichen 
                  Zugänglichmachung der Inhalte auf der Plattform. Das Urheberrecht verbleibt beim Nutzer.
                </p>
                <p className="text-white/70 leading-relaxed mb-3">
                  <strong>7.2 Rechteinhaber-Garantie:</strong> Der Nutzer versichert und garantiert, dass er alleiniger 
                  Inhaber sämtlicher Rechte an den hochgeladenen Inhalten ist oder über die erforderlichen Nutzungsrechte 
                  verfügt. Dies umfasst insbesondere Urheberrechte, Leistungsschutzrechte, Persönlichkeitsrechte und 
                  Markenrechte. Der Nutzer stellt den Anbieter von sämtlichen Ansprüchen Dritter frei, die aufgrund 
                  einer Rechtsverletzung durch die hochgeladenen Inhalte geltend gemacht werden.
                </p>
                <p className="text-white/70 leading-relaxed mb-4">
                  <strong>7.3 Rechteverletzungen:</strong> Bei Verdacht einer Urheberrechtsverletzung ist der Anbieter 
                  berechtigt, die betreffenden Inhalte ohne Vorankündigung zu sperren oder zu löschen. Der Nutzer haftet 
                  für alle dem Anbieter durch Rechtsverletzungen entstehenden Schäden einschließlich angemessener 
                  Rechtsverteidigungskosten.
                </p>
                <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-5 mb-3">
                  <p className="text-red-300 font-semibold mb-2">⚠️ Haftung und Vertragsstrafen:</p>
                  <p className="text-white/70 text-sm mb-2">
                    Bei <strong>vorsätzlicher oder grob fahrlässiger Verletzung von Urheber- oder Leistungsschutzrechten</strong> 
                    verpflichtet sich der Nutzer zur Zahlung einer Vertragsstrafe in Höhe von mindestens 500,00 EUR pro Verletzungsfall. 
                    Die Geltendmachung eines weitergehenden Schadens bleibt vorbehalten.
                  </p>
                  <p className="text-white/70 text-sm">
                    Der Nutzer hat nachzuweisen, dass ein Schaden nicht entstanden oder wesentlich niedriger ist als die Vertragsstrafe.
                  </p>
                </div>
                <p className="text-white/70 leading-relaxed mb-3">
                  <strong>7.4 Meldung von Rechtsverletzungen:</strong> Rechteinhaber können vermutete Rechtsverletzungen 
                  unter Angabe präziser Informationen an <a href="mailto:milo.lokadee@gmail.com" className="text-blue-400 hover:underline">milo.lokadee@gmail.com</a> melden. 
                  Der Anbieter wird gemeldete Rechtsverletzungen unverzüglich prüfen und gegebenenfalls entfernen.
                </p>
                <p className="text-white/70 leading-relaxed">
                  <strong>7.5 Löschung durch Nutzer:</strong> Der Nutzer kann hochgeladene Inhalte jederzeit selbständig löschen. 
                  Mit der Löschung erlöschen die dem Anbieter eingeräumten Nutzungsrechte. Bereits erstellte Kopien für 
                  Backup-Zwecke können für einen angemessenen Zeitraum aufbewahrt werden.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-blue-400 mb-3">§8 Vertragslaufzeit, Kündigung und Löschung</h3>
                <p className="text-white/70 leading-relaxed mb-3">
                  <strong>8.1 Vertragslaufzeit:</strong> Der Nutzungsvertrag wird auf unbestimmte Zeit geschlossen und kann 
                  von beiden Parteien jederzeit ohne Einhaltung einer Frist ordentlich gekündigt werden.
                </p>
                <p className="text-white/70 leading-relaxed mb-3">
                  <strong>8.2 Ordentliche Kündigung durch den Nutzer:</strong> Der Nutzer kann den Vertrag jederzeit durch 
                  Kontaktaufnahme mit dem Support unter <a href="mailto:milo.lokadee@gmail.com" className="text-blue-400 hover:underline">milo.lokadee@gmail.com</a> oder 
                  über die Einstellungen in seinem Nutzerkonto kündigen.
                </p>
                <p className="text-white/70 leading-relaxed mb-3">
                  <strong>8.3 Außerordentliche Kündigung:</strong> Das Recht zur außerordentlichen Kündigung aus wichtigem Grund 
                  bleibt unberührt. Ein wichtiger Grund liegt insbesondere vor bei:
                </p>
                <ul className="list-disc list-inside text-white/70 space-y-2 ml-4 mb-3">
                  <li>Schwerwiegenden oder wiederholten Verstößen gegen diese AGB</li>
                  <li>Rechtswidrigem Verhalten oder strafbaren Handlungen</li>
                  <li>Verbreitung von Inhalten, die gegen geltendes Recht verstoßen</li>
                  <li>Manipulation oder Betrug</li>
                </ul>
                <p className="text-white/70 leading-relaxed mb-3">
                  <strong>8.4 Folgen der Kündigung:</strong> Nach Vertragsende wird der Account deaktiviert und die Daten gemäß 
                  der Datenschutzerklärung behandelt. Bereits veröffentlichte Inhalte können zu Archivierungszwecken erhalten bleiben, 
                  soweit dies rechtlich zulässig ist. Virtuelle Guthaben verfallen ersatzlos.
                </p>
                <p className="text-white/70 leading-relaxed">
                  <strong>8.5 Kein Anspruch auf Wiederherstellung:</strong> Nach Löschung oder Sperrung besteht kein Anspruch 
                  auf Wiederherstellung des Accounts oder Rückerstattung von virtuellen Gütern.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-blue-400 mb-3">§9 Änderungen der AGB</h3>
                <p className="text-white/70 leading-relaxed mb-3">
                  <strong>9.1 Änderungsvorbehalt:</strong> Der Anbieter behält sich das Recht vor, diese AGB aus sachlich 
                  gerechtfertigten Gründen (z.B. Änderungen der Rechtsprechung, gesetzliche Neuregelungen, Anpassung an 
                  technische Entwicklungen) zu ändern.
                </p>
                <p className="text-white/70 leading-relaxed mb-3">
                  <strong>9.2 Mitteilung von Änderungen:</strong> Änderungen der AGB werden dem Nutzer spätestens sechs Wochen 
                  vor dem geplanten Inkrafttreten in Textform (per E-Mail oder durch Benachrichtigung auf der Plattform) mitgeteilt. 
                  Auf den Beginn der Widerspruchsfrist und die Rechtsfolgen eines unterlassenen Widerspruchs wird in der 
                  Änderungsmitteilung besonders hingewiesen.
                </p>
                <p className="text-white/70 leading-relaxed mb-3">
                  <strong>9.3 Widerspruchsrecht:</strong> Der Nutzer kann den Änderungen innerhalb von sechs Wochen nach Zugang 
                  der Änderungsmitteilung widersprechen. Der Widerspruch bedarf der Textform und ist an 
                  <a href="mailto:milo.lokadee@gmail.com" className="text-blue-400 hover:underline ml-1">milo.lokadee@gmail.com</a> zu richten.
                </p>
                <p className="text-white/70 leading-relaxed">
                  <strong>9.4 Rechtsfolgen:</strong> Widerspricht der Nutzer nicht fristgerecht, gelten die geänderten AGB 
                  als angenommen. Bei fristgerechtem Widerspruch ist der Anbieter berechtigt, das Vertragsverhältnis zum Zeitpunkt 
                  des Inkrafttretens der Änderungen zu beenden. Der Nutzer wird in der Änderungsmitteilung auf dieses 
                  Sonderkündigungsrecht hingewiesen.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-blue-400 mb-3">§10 Drittanbieter und externe Dienste</h3>
                <p className="text-white/70 leading-relaxed mb-3">
                  <strong>10.1 Einbindung externer Dienste:</strong> Die Plattform nutzt Dienste und APIs von Drittanbietern zur Bereitstellung bestimmter Funktionen (z. B. Cloudinary/Gumlet für Video-Hosting, Google Drive, OpenAI für KI-Features, WebRTC für Videoanrufe).
                </p>
                <p className="text-white/70 leading-relaxed mb-3">
                  <strong>10.2 Nutzungsbedingungen der Drittanbieter:</strong> Für die Inanspruchnahme dieser integrierten Dienste können ergänzend die Nutzungsbedingungen der jeweiligen Drittanbieter gelten. Der Anbieter hat keinen Einfluss auf die Verfügbarkeit oder die Bedingungen dieser externen Dienste.
                </p>
                <p className="text-white/70 leading-relaxed">
                  <strong>10.3 Haftungsausschluss für Drittanbieter:</strong> Der Anbieter haftet nicht für Datenverluste, Ausfälle oder Datenschutzverletzungen, die im Verantwortungsbereich der eingesetzten Drittanbieter liegen, sofern den Anbieter kein Verschulden bei der Auswahl oder Überwachung trifft.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-blue-400 mb-3">§11 Datenschutz</h3>
                <p className="text-white/70 leading-relaxed">
                  <strong>11.1</strong> Der Anbieter verarbeitet personenbezogene Daten des Nutzers ausschließlich nach Maßgabe 
                  der geltenden Datenschutzbestimmungen, insbesondere der Datenschutz-Grundverordnung (DSGVO) und des 
                  Bundesdatenschutzgesetzes (BDSG). Details zur Datenverarbeitung sind in der 
                  <a href="/Privacy" className="text-blue-400 hover:underline ml-1">Datenschutzerklärung</a> beschrieben.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-blue-400 mb-3">§12 Streitbeilegung</h3>
                <p className="text-white/70 leading-relaxed mb-3">
                  <strong>12.1 Online-Streitbeilegung:</strong> Die Europäische Kommission stellt eine Plattform zur 
                  Online-Streitbeilegung (OS) bereit, die unter 
                  <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline ml-1">
                    https://ec.europa.eu/consumers/odr
                  </a> erreichbar ist.
                </p>
                <p className="text-white/70 leading-relaxed">
                  <strong>12.2 Verbraucherschlichtung:</strong> Der Anbieter ist nicht verpflichtet und nicht bereit, 
                  an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-blue-400 mb-3">§13 Anwendbares Recht und Gerichtsstand</h3>
                <p className="text-white/70 leading-relaxed mb-3">
                  <strong>13.1 Anwendbares Recht:</strong> Für sämtliche Rechtsbeziehungen zwischen dem Anbieter und dem Nutzer 
                  gilt ausschließlich das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. 
                  Bei Verbrauchern gilt diese Rechtswahl nur, soweit hierdurch der durch zwingende Bestimmungen des Rechts 
                  des Staates des gewöhnlichen Aufenthaltes des Verbrauchers gewährte Schutz nicht entzogen wird.
                </p>
                <p className="text-white/70 leading-relaxed">
                  <strong>13.2 Gerichtsstand:</strong> Ist der Nutzer Kaufmann, juristische Person des öffentlichen Rechts oder 
                  öffentlich-rechtliches Sondervermögen, ist ausschließlicher Gerichtsstand für alle Streitigkeiten aus diesem 
                  Vertrag der Geschäftssitz des Anbieters. Gleiches gilt, wenn der Nutzer keinen allgemeinen Gerichtsstand in 
                  Deutschland hat oder Wohnsitz oder gewöhnlicher Aufenthalt im Zeitpunkt der Klageerhebung nicht bekannt sind.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-blue-400 mb-3">§14 Salvatorische Klausel</h3>
                <p className="text-white/70 leading-relaxed">
                  <strong>14.1</strong> Sollten einzelne Bestimmungen dieser AGB unwirksam oder undurchführbar sein oder werden, 
                  bleibt die Wirksamkeit der übrigen Bestimmungen hiervon unberührt. An die Stelle der unwirksamen oder 
                  undurchführbaren Bestimmung tritt eine wirksame und durchführbare Regelung, deren Wirkungen der 
                  wirtschaftlichen Zielsetzung möglichst nahekommen, die die Vertragsparteien mit der unwirksamen bzw. 
                  undurchführbaren Bestimmung verfolgt haben. Entsprechendes gilt für den Fall einer Regelungslücke.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-blue-400 mb-3">§15 Anbieterkennzeichnung (Impressum)</h3>
                <div className="bg-white/5 rounded-xl p-5">
                  <p className="text-white/70 leading-relaxed mb-3">
                    <strong>Anbieter:</strong> 7B Video Hub<br />
                    <strong>Kontakt:</strong> <a href="mailto:milo.lokadee@gmail.com" className="text-blue-400 hover:underline">milo.lokadee@gmail.com</a>
                  </p>
                  <p className="text-white/60 text-sm">
                    Vollständige Angaben zum Anbieter gemäß § 5 TMG sind im 
                    <a href="/Imprint" className="text-blue-400 hover:underline ml-1">Impressum</a> hinterlegt.
                  </p>
                </div>
              </section>

              <div className="pt-8 border-t border-white/10 mt-8">
                <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl p-6 border border-blue-400/20">
                  <h4 className="text-lg font-bold text-white mb-3">📧 Kontakt & Rechtliche Hinweise</h4>
                  <p className="text-white/70 mb-3">
                    <strong>Support & Rechtsfragen:</strong> <a href="mailto:milo.lokadee@gmail.com" className="text-blue-400 hover:underline">milo.lokadee@gmail.com</a>
                  </p>
                  <p className="text-white/60 text-sm mb-2">
                    Bei Fragen zu diesen Allgemeinen Geschäftsbedingungen oder zur Nutzung der Plattform 
                    kontaktieren Sie uns bitte unter der angegebenen E-Mail-Adresse.
                  </p>
                  <p className="text-white/50 text-sm mt-4">Version: 2.0 • Stand: 05. März 2026 • Inkrafttreten: 05.03.2026

                  </p>
                </div>
              </div>
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>);

}