import React from 'react';
import { Building2, Mail, MapPin, Phone } from 'lucide-react';
import AnimatedBackground from '@/components/streaming/AnimatedBackground';

export default function Imprint() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white p-4 md:p-8 relative overflow-hidden">
      <AnimatedBackground />
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="mb-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Impressum</h1>
          <p className="text-xl text-white/50">Angaben gemäß § 5 TMG</p>
        </div>

        <div className="grid gap-6">
          <div className="bg-[#151517]/50 backdrop-blur-xl p-8 rounded-3xl border border-white/5 flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold mb-6">7B Hub Inc.</h2>
            <div className="space-y-4 text-lg text-white/70">
              <p className="flex items-center gap-3 justify-center">
                <MapPin className="w-5 h-5 text-violet-400" />
                Musterstraße 123<br />10115 Berlin, Deutschland
              </p>
              <p className="flex items-center gap-3 justify-center">7bhubofficial@gmail.com


              </p>
              <p className="flex items-center gap-3 justify-center">
                <Phone className="w-5 h-5 text-violet-400" />
                +49 (0) 30 12345678
              </p>
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/10 w-full">
              <p className="font-bold text-white mb-2">Vertreten durch:</p>
              <p className="text-white/70">Max Mustermann (CEO)</p>
            </div>
            
            <div className="mt-6 w-full">
              <p className="font-bold text-white mb-2">Registereintrag:</p>
              <p className="text-white/70">Eintragung im Handelsregister.<br />Registergericht: Amtsgericht Berlin-Charlottenburg<br />Registernummer: HRB 123456</p>
            </div>
          </div>
        </div>
      </div>
    </div>);

}