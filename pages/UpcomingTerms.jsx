import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { FileText, CalendarDays, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import AnimatedBackground from '@/components/streaming/AnimatedBackground';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

export default function UpcomingTerms() {
  const { data: termsConfigs = [], isLoading } = useQuery({
    queryKey: ['termsConfig'],
    queryFn: async () => base44.entities.TermsConfig.list('-created_date', 1),
  });
  
  const config = termsConfigs[0] || {};
  const hasUpcoming = !!config.upcoming_version && !!config.upcoming_date;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white p-4 md:p-8 relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="max-w-3xl mx-auto relative z-10 pt-8">
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-amber-900/20">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Zukünftige Bedingungen</h1>
          <p className="text-xl text-white/50">Informationen über bevorstehende Änderungen unserer AGB</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !hasUpcoming ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 text-center">
            <ShieldAlert className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Keine Änderungen geplant</h3>
            <p className="text-white/60 mb-6">Aktuell sind keine neuen Versionen unserer Allgemeinen Geschäftsbedingungen geplant.</p>
            <Link to={createPageUrl('Terms')}>
              <Button variant="outline" className="border-white/20 hover:bg-white/10">
                Aktuelle AGB ansehen
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/30 rounded-3xl p-8 backdrop-blur-xl shadow-2xl shadow-amber-900/10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-amber-500/20 pb-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-bold text-sm mb-3">
                    <CalendarDays className="w-4 h-4" />
                    Inkrafttreten am {config.upcoming_date ? new Date(config.upcoming_date).toLocaleDateString('de-DE') : 'TBA'}
                  </div>
                  <h2 className="text-3xl font-black text-white">Version {config.upcoming_version}</h2>
                </div>
                <div className="flex items-center gap-4 text-white/40 font-mono text-sm bg-black/20 p-4 rounded-xl border border-white/5">
                  <div className="text-center">
                    <p className="mb-1 uppercase text-[10px] tracking-widest">Aktuell</p>
                    <p className="text-white font-bold">v{config.current_version}</p>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                  <div className="text-center">
                    <p className="mb-1 uppercase text-[10px] tracking-widest text-amber-400/50">Neu</p>
                    <p className="text-amber-400 font-bold">v{config.upcoming_version}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  Zusammenfassung der Änderungen
                </h3>
                
                <div className="bg-black/40 rounded-2xl p-6 border border-white/5">
                  {config.summary_of_changes ? (
                    <div className="text-white/80 leading-relaxed whitespace-pre-wrap">
                      {config.summary_of_changes}
                    </div>
                  ) : (
                    <p className="text-white/40 italic">Keine Zusammenfassung verfügbar.</p>
                  )}
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 text-blue-200 text-sm leading-relaxed">
                  <p>
                    <strong>Hinweis:</strong> Diese Änderungen treten erst zum oben genannten Datum in Kraft. 
                    Bis dahin gilt weiterhin unsere <Link to={createPageUrl('Terms')} className="text-blue-400 hover:underline font-bold">aktuelle Version {config.current_version}</Link>.
                    Sobald die neuen Bedingungen aktiv sind, wirst du beim Login aufgefordert, diesen zuzustimmen.
                  </p>
                </div>
              </div>
            </div>

            {config.upcoming_full_text && (
              <div className="mt-12 bg-[#151517]/50 backdrop-blur-xl p-8 rounded-3xl border border-white/5">
                <h3 className="text-2xl font-black mb-8 text-white">Vollständiger Text der neuen AGB (Version {config.upcoming_version})</h3>
                <div className="prose prose-invert max-w-none space-y-8 text-white/80">
                  <ReactMarkdown>{config.upcoming_full_text}</ReactMarkdown>
                </div>
              </div>
            )}
            
            <div className="text-center mt-8">
              <Link to={createPageUrl('Home')}>
                <Button variant="ghost" className="text-white/50 hover:text-white hover:bg-white/10">
                  Zurück zur Startseite
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}