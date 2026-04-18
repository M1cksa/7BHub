import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, Lock, Users, Send, Bot, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';

const guideContent = `
Hier ist der umfassende Leitfaden für Eltern:

1. Was ist 7B Hub?
7B Hub ist eine moderne Unterhaltungsplattform für Videos, Live-Streams und Mini-Spiele. Wir bieten eine kreative und interaktive Community.

2. Jugendschutz und Altersempfehlung
Die Plattform richtet sich an Nutzer ab 16 Jahren. Nutzer unter 18 Jahren benötigen das Einverständnis der Erziehungsberechtigten. Wir nutzen modernste Filter und ein aktives Moderationsteam, um unangemessene Inhalte fernzuhalten.

3. Privatsphäre und Datenschutz
Wir nehmen Datenschutz ernst. Profile können privat gestellt werden. Eltern empfehlen wir, gemeinsam mit ihren Kindern die Privatsphäre-Einstellungen (z.B. "Wer darf mir Nachrichten senden?") im Profil durchzugehen.

4. Bildschirmzeit und digitale Balance
Es gibt integrierte Hinweise und Features, die helfen können, die Nutzung bewusst zu gestalten. Sprechen Sie mit Ihrem Kind über gesunde Bildschirmzeiten.

5. Meldefunktionen
Jedes Video, jeder Kommentar und jeder Nutzer kann direkt gemeldet werden. Unser Moderationsteam prüft Meldungen 24/7.

6. Tokens und In-App-Währung
Tokens sind eine rein virtuelle Währung ohne echten Geldwert. Sie können erspielt oder durch Aktivitäten gesammelt werden.
`;

function AiAssistant() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hallo! Ich bin der KI-Assistent für Eltern. Haben Sie Fragen zum Jugendschutz, zur Bildschirmzeit oder zur Sicherheit auf 7B Hub?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const prompt = `Du bist ein freundlicher, professioneller KI-Assistent für Eltern auf der Plattform "7B Hub". 
Beantworte die Frage der Eltern basierend auf diesem Leitfaden:
${guideContent}

Frage: ${userMsg}

Antworte kurz, prägnant und beruhigend auf Deutsch.`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Entschuldigung, es gab einen Fehler bei der Beantwortung. Bitte versuchen Sie es später noch einmal.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col h-[500px] overflow-hidden shadow-2xl">
      <div className="bg-gradient-to-r from-blue-600/20 to-violet-600/20 p-4 border-b border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
          <Bot className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="font-bold text-white">Eltern-KI-Assistent</h3>
          <p className="text-xs text-white/50">Stellen Sie Ihre Fragen zum Leitfaden</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white/10 text-white/90 rounded-tl-sm'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 text-white/50 rounded-2xl rounded-tl-sm p-3 text-sm flex gap-1 items-center">
              <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-black/40 border-t border-white/10">
        <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <Input 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ihre Frage..."
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-11"
          />
          <Button type="submit" disabled={isLoading || !input.trim()} className="h-11 w-11 p-0 shrink-0 bg-blue-600 hover:bg-blue-500 text-white border-none">
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function ParentsGuide() {
  const sections = [
    {
      icon: <Users className="w-6 h-6 text-cyan-400" />,
      title: "Was ist 7B Hub?",
      content: "7B Hub ist eine moderne, interaktive Plattform für Videos, Streams und Mini-Games. Wir bieten eine kreative Community, in der Nutzer eigene Inhalte teilen und mit anderen interagieren können."
    },
    {
      icon: <Shield className="w-6 h-6 text-emerald-400" />,
      title: "Jugendschutz & Altersempfehlung",
      content: "Die Plattform richtet sich an Jugendliche ab 16 Jahren. Für Nutzer unter 18 Jahren ist das Einverständnis der Eltern erforderlich. Ein engagiertes Moderationsteam und automatisierte Filter sorgen für ein sicheres Umfeld."
    },
    {
      icon: <Lock className="w-6 h-6 text-violet-400" />,
      title: "Privatsphäre-Einstellungen",
      content: "Nutzer haben volle Kontrolle über ihre Daten. Profile können auf 'privat' gestellt werden. Wir empfehlen, gemeinsam mit Ihrem Kind die Einstellungen für Sichtbarkeit und Nachrichten durchzugehen."
    },
    {
      icon: <Clock className="w-6 h-6 text-amber-400" />,
      title: "Digitale Balance",
      content: "Wir unterstützen ein gesundes Maß an Bildschirmzeit. Bestimmte Features, wie tägliche Belohnungen, sind begrenzt, um übermäßige Nutzung zu vermeiden. Sprechen Sie mit Ihrem Kind über gesunde Pausen."
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-rose-400" />,
      title: "Inhalte melden",
      content: "Sollten unangemessene Inhalte auftauchen, können diese mit einem Klick gemeldet werden. Unser Support-Team prüft diese Meldungen umgehend und ergreift entsprechende Maßnahmen."
    }
  ];

  return (
    <div className="min-h-screen bg-[#05050a] text-white py-12 px-4 relative overflow-hidden pt-24">
      {/* Background effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 mb-6 shadow-xl shadow-blue-500/20">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            Leitfaden für Eltern
          </h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            Sicherheit, Transparenz und ein verantwortungsvoller Umgang mit digitalen Medien stehen bei uns an erster Stelle.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            {sections.map((sec, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    {sec.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{sec.title}</h3>
                    <p className="text-white/60 leading-relaxed text-sm md:text-base">
                      {sec.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-6 rounded-3xl mt-8">
              <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Unsere 3 goldenen Regeln für Familien
              </h3>
              <ul className="space-y-3 text-sm text-emerald-100/70">
                <li className="flex gap-2"><strong className="text-emerald-300">1. Offen kommunizieren:</strong> Sprechen Sie mit Ihrem Kind über seine Erlebnisse auf der Plattform.</li>
                <li className="flex gap-2"><strong className="text-emerald-300">2. Privatsphäre wahren:</strong> Teilen Sie niemals persönliche Daten wie Adresse oder echte Namen.</li>
                <li className="flex gap-2"><strong className="text-emerald-300">3. Gemeinsam entdecken:</strong> Schauen Sie sich die Plattform zusammen an und richten Sie das Profil gemeinsam ein.</li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <AiAssistant />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}