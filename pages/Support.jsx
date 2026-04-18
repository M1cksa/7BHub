import React, { useState, useEffect } from 'react';
import { HelpCircle, Mail, MessageCircle, Search, ChevronRight, Zap, Check, Send, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import AnimatedBackground from '@/components/streaming/AnimatedBackground';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function Support() {
  const [search, setSearch] = useState('');
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [ticketData, setTicketData] = useState({ subject: '', message: '', priority: 'medium' });
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const u = localStorage.getItem('app_user');
      if (u) setUser(JSON.parse(u));
    } catch(e) {}
  }, []);

  const { data: myTickets = [] } = useQuery({
    queryKey: ['myTickets', user?.username],
    queryFn: () => base44.entities.Ticket.filter({ user_username: user.username }, '-created_date', 20),
    enabled: !!user
  });

  const ticketMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Bitte einloggen");
      await base44.entities.Ticket.create({
        user_username: user.username,
        subject: ticketData.subject,
        message: ticketData.message,
        priority: ticketData.priority,
        status: 'open'
      });
    },
    onSuccess: () => {
      setSuccess(true);
      setTicketData({ subject: '', message: '', priority: 'medium' });
      toast.success('Ticket erfolgreich erstellt!');
      setTimeout(() => {
          setSuccess(false);
          setIsTicketOpen(false);
      }, 2000);
    },
    onError: (e) => {
      toast.error('Fehler beim Erstellen des Tickets');
    }
  });

  const faqs = [
    { category: "Erste Schritte & Account", q: "Wie registriere ich mich?", a: "Klicke oben rechts auf 'Account erstellen', fülle das Formular aus und bestätige deine E-Mail. Nach einer kurzen Prüfung durch unser Team wird dein Account freigeschaltet." },
    { category: "Erste Schritte & Account", q: "Wie ändere ich mein Passwort?", a: "Gehe zu deinen Profil-Einstellungen, wähle 'Sicherheit' und klicke auf 'Passwort ändern'. Du benötigst dein altes Passwort, um ein neues festzulegen." },
    { category: "Erste Schritte & Account", q: "Was bedeuten die Gruppen (Girl/Boy/Mixed)?", a: "Die Gruppen dienen dazu, dir personalisierte und altersgerechte Inhalte anzuzeigen. Sie helfen uns, die Plattform für alle sicher und übersichtlich zu halten." },
    
    { category: "Videos & Streams", q: "Wie kann ich Videos hochladen?", a: "Klicke auf den 'Hochladen' Button in der Navigation (oder das Plus-Icon), wähle dein Video aus und füge Titel, Beschreibung und Kategorie hinzu. Beachte das maximale Dateilimit." },
    { category: "Videos & Streams", q: "Wie starte ich einen Livestream?", a: "Gehe in dein Creator-Dashboard und klicke auf 'Go Live'. Dort erhältst du deinen Stream-Key für OBS oder kannst direkt unkompliziert über den Browser streamen." },
    { category: "Videos & Streams", q: "Warum lädt mein Video nicht?", a: "Bitte überprüfe deine Internetverbindung. Falls das Problem bestehen bleibt, lösche deinen Browser-Cache oder versuche es mit einem anderen Browser." },
    { category: "Videos & Streams", q: "Wie funktionieren Watch Partys?", a: "Mit einer Watch Party kannst du Videos synchron mit Freunden schauen. Klicke bei einem Video auf das 'Watch Party'-Icon und teile den Einladungslink mit deinen Freunden." },

    { category: "Tokens & Shop", q: "Wie verdiene ich Tokens?", a: "Du verdienst Tokens durch tägliche Logins (Daily Rewards), das Schauen von Videos, Likes, gute Kommentare und das Beantworten von Quizfragen in interaktiven Videos." },
    { category: "Tokens & Shop", q: "Was kann ich im Shop kaufen?", a: "Im Shop kannst du exklusive Profil-Rahmen, animierte Hintergründe, Badges, Chat-Effekte, Themes und seltene Sammlerstücke für deine Tokens erwerben." },
    { category: "Tokens & Shop", q: "Sind Tokens echtes Geld?", a: "Nein, Tokens sind unsere virtuelle Plattform-Währung als Belohnung für Aktivität und können nicht in echtes Geld umgetauscht werden." },

    { category: "Community & Sicherheit", q: "Wie melde ich ein Video oder einen Nutzer?", a: "Klicke bei dem entsprechenden Video oder Profil auf die drei Punkte (...) oder die Flagge und wähle 'Melden'. Unser Moderationsteam wird sich den Fall umgehend ansehen." },
    { category: "Community & Sicherheit", q: "Was passiert bei Regelverstößen?", a: "Bei Verstößen gegen unsere Community-Richtlinien können Verwarnungen ausgesprochen oder Accounts temporär sowie permanent (Bann) gesperrt werden." },
    { category: "Community & Sicherheit", q: "Wie kann ich Nutzer blockieren?", a: "Gehe auf das Profil des Nutzers, klicke auf das Menü-Icon und wähle 'Nutzer blockieren'. Du wirst keine Nachrichten oder Kommentare mehr von dieser Person sehen." },

    { category: "Creator & Storys", q: "Wie poste ich eine Creator Story?", a: "Gehe auf die Startseite und klicke im Story-Bereich auf das Plus-Symbol. Du kannst Bilder, Texte und Umfragen für deine Follower posten. Storys verschwinden automatisch nach 24 Stunden." },
    { category: "Creator & Storys", q: "Wie bekomme ich mehr Reichweite?", a: "Lade regelmäßig hochwertige Videos hoch, interagiere mit deinen Zuschauern in den Kommentaren, veranstalte Watch Partys und nutze passende, angesagte Kategorien." },
  ];

  const filteredFaqs = faqs.filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()));

  const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = [];
    acc[faq.category].push(faq);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white p-4 md:p-8 relative overflow-hidden pt-24">
      <AnimatedBackground />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="mb-12 text-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-gradient-to-br from-cyan-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-cyan-900/30"
          >
            <HelpCircle className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">
              Hilfe & Support
            </span>
          </h1>
          <p className="text-xl text-white/50">Wir sind für dich da</p>
          
          <div className="max-w-md mx-auto mt-8 relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-white/40" />
            <Input 
              placeholder="Suche nach Themen..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/5 border-white/10 rounded-full pl-12 h-12 text-lg focus:bg-white/10 transition-all"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
             <div className="bg-[#151517]/50 backdrop-blur-xl p-8 rounded-3xl border border-white/5">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <HelpCircle className="w-6 h-6 text-cyan-400" />
                  Häufig gestellte Fragen
                </h2>
                <Accordion type="single" collapsible className="space-y-4">
                  {Object.entries(groupedFaqs).map(([category, items]) => (
                    <div key={category} className="space-y-2 bg-black/20 p-2 rounded-2xl border border-white/5">
                      <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest px-4 pt-3 pb-1">{category}</h3>
                      {items.map((faq, i) => (
                        <AccordionItem key={faq.q} value={`item-${category}-${i}`} className="border-b border-white/5 px-4 rounded-xl hover:bg-white/5 transition-colors border-none">
                          <AccordionTrigger className="text-white hover:no-underline hover:text-[color:var(--theme-primary)] py-4 font-medium text-left">
                            {faq.q}
                          </AccordionTrigger>
                          <AccordionContent className="text-white/60 pb-4 leading-relaxed">
                            {faq.a}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </div>
                  ))}
                  {filteredFaqs.length === 0 && <p className="text-white/40 text-center py-8">Keine Ergebnisse gefunden.</p>}
                </Accordion>
             </div>

             {user && myTickets.length > 0 && (
               <div className="bg-[#151517]/50 backdrop-blur-xl p-8 rounded-3xl border border-white/5">
                 <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                   <Clock className="w-6 h-6 text-cyan-400" />
                   Meine Tickets
                 </h2>
                 <div className="space-y-3">
                   {myTickets.map((ticket) => (
                     <div key={ticket.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                       <div className="flex items-start justify-between mb-2">
                         <h3 className="font-bold text-white">{ticket.subject}</h3>
                         <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                           ticket.status === 'open' ? 'bg-cyan-500/20 text-cyan-400' :
                           ticket.status === 'in_progress' ? 'bg-amber-500/20 text-amber-400' :
                           'bg-green-500/20 text-green-400'
                         }`}>
                           {ticket.status === 'open' ? 'Offen' : ticket.status === 'in_progress' ? 'In Bearbeitung' : 'Geschlossen'}
                         </span>
                       </div>
                       <p className="text-sm text-white/60 mb-2">{ticket.message}</p>
                       {ticket.admin_response && (
                         <div className="mt-3 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                           <p className="text-xs font-bold text-cyan-400 mb-1">Admin Antwort:</p>
                           <p className="text-sm text-white/80">{ticket.admin_response}</p>
                         </div>
                       )}
                       <span className="text-xs text-white/40 block mt-2">
                         {new Date(ticket.created_date).toLocaleDateString('de-DE')}
                       </span>
                     </div>
                   ))}
                 </div>
               </div>
             )}
          </div>

          <div className="space-y-6">
             <div className="bg-gradient-to-br from-cyan-600/20 to-teal-600/20 backdrop-blur-xl p-6 rounded-3xl border border-cyan-500/20">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                   <Send className="w-5 h-5 text-cyan-400" /> Kontakt
                </h3>
                <p className="text-white/60 text-sm mb-4">Brauchst du persönliche Hilfe? Erstelle ein Support-Ticket!</p>
                <Button 
                   onClick={() => setIsTicketOpen(true)}
                   className="w-full bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold h-12"
                >
                   <Send className="w-4 h-4 mr-2" />
                   Ticket erstellen
                </Button>
             </div>

             <div className="bg-[#151517]/50 backdrop-blur-xl p-6 rounded-3xl border border-white/5">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                   <MessageCircle className="w-5 h-5 text-cyan-400" /> Community
                </h3>
                <p className="text-white/60 text-sm mb-4">Tausche dich mit anderen Usern aus.</p>
                <Link to={createPageUrl('CommunityHub')}>
                    <Button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl">
                      Community Hub
                    </Button>
                </Link>
             </div>

             <div className="bg-[#151517]/50 backdrop-blur-xl p-6 rounded-3xl border border-white/5">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                   <Zap className="w-5 h-5 text-amber-400" /> Schnelllinks
                </h3>
                <div className="space-y-2 mt-4">
                  <Link to={createPageUrl('Guidelines')}>
                    <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                      Community Richtlinien
                    </button>
                  </Link>
                  <Link to={createPageUrl('Privacy')}>
                    <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                      Datenschutz
                    </button>
                  </Link>
                  <Link to={createPageUrl('Terms')}>
                    <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                      Nutzungsbedingungen
                    </button>
                  </Link>
                </div>
             </div>
          </div>
        </div>
      </div>

      <Dialog open={isTicketOpen} onOpenChange={setIsTicketOpen}>
        <DialogContent className="bg-[#1a1a1c] border-white/10 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ticket erstellen</DialogTitle>
            <DialogDescription>
               Beschreibe dein Problem so genau wie möglich.
            </DialogDescription>
          </DialogHeader>
          
          {!user ? (
              <div className="py-4 text-center">
                  <p className="mb-4 text-white/60">Bitte melde dich an, um den Support zu kontaktieren.</p>
                  <Link to={createPageUrl('SignIn')}><Button>Login</Button></Link>
              </div>
          ) : success ? (
              <div className="py-8 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                      <Check className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold">Ticket gesendet!</h3>
                  <p className="text-white/60">Wir melden uns bald bei dir.</p>
              </div>
          ) : (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="subject">Betreff</Label>
                  <Input 
                    id="subject" 
                    value={ticketData.subject} 
                    onChange={(e) => setTicketData({...ticketData, subject: e.target.value})}
                    className="bg-black/20 border-white/10" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priorität</Label>
                  <Select 
                     value={ticketData.priority} 
                     onValueChange={(val) => setTicketData({...ticketData, priority: val})}
                  >
                    <SelectTrigger className="bg-black/20 border-white/10">
                       <SelectValue placeholder="Wähle Priorität" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1c] border-white/10 text-white">
                       <SelectItem value="low">Niedrig</SelectItem>
                       <SelectItem value="medium">Mittel</SelectItem>
                       <SelectItem value="high">Hoch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">Nachricht</Label>
                  <Textarea 
                    id="message" 
                    value={ticketData.message}
                    onChange={(e) => setTicketData({...ticketData, message: e.target.value})}
                    className="bg-black/20 border-white/10 min-h-[100px]" 
                  />
                </div>
              </div>
          )}

          {!success && user && (
            <DialogFooter>
               <Button variant="outline" onClick={() => setIsTicketOpen(false)} className="border-white/10">Abbrechen</Button>
               <Button 
                 onClick={() => ticketMutation.mutate()} 
                 disabled={!ticketData.subject || !ticketData.message || ticketMutation.isPending}
                 className="bg-cyan-600 hover:bg-cyan-500"
               >
                 {ticketMutation.isPending ? 'Sende...' : 'Absenden'}
               </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}