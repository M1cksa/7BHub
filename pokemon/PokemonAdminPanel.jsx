import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Zap, Power, PowerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PokemonAdminPanel() {
  const [eventRecord, setEventRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const events = await base44.entities.PokemonEvent.list('-created_date', 1);
        setEventRecord(events[0] || null);
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  const toggle = async () => {
    setToggling(true);
    try {
      const user = JSON.parse(localStorage.getItem('app_user') || '{}');
      const newState = !(eventRecord?.is_active);

      if (eventRecord) {
        const updated = await base44.entities.PokemonEvent.update(eventRecord.id, {
          is_active: newState,
          activated_by: user.username || 'admin',
          activated_at: new Date().toISOString(),
        });
        setEventRecord(updated);
      } else {
        const created = await base44.entities.PokemonEvent.create({
          is_active: true,
          activated_by: user.username || 'admin',
          activated_at: new Date().toISOString(),
          message: '🎉 Pokémon feiert 30 Jahre! Danke für 3 Jahrzehnte Abenteuer! 🎉',
        });
        setEventRecord(created);
      }

      toast.success(newState ? '🎉 Pokémon Event aktiviert!' : '⏹ Pokémon Event deaktiviert');
      setTimeout(() => window.location.reload(), 800);
    } catch (e) {
      toast.error('Fehler beim Umschalten des Events');
    }
    setToggling(false);
  };

  const isActive = eventRecord?.is_active || false;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl overflow-hidden border-2"
      style={{
        borderColor: isActive ? '#FFD700' : '#333',
        background: isActive
          ? 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,107,0,0.15), rgba(255,23,68,0.1))'
          : 'rgba(255,255,255,0.03)',
      }}
    >
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: isActive ? 'linear-gradient(135deg, #FFD700, #FF6B00)' : 'rgba(255,255,255,0.05)' }}
          >
            <img
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"
              alt="Pikachu"
              className="w-8 h-8"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
          <div>
            <h3 className="font-black text-white text-lg">Pokémon 30 Jahre Event</h3>
            <p className="text-white/50 text-sm">Globales Event für alle Nutzer</p>
          </div>
          <div className="ml-auto">
            <span
              className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider"
              style={{
                background: isActive ? '#FFD700' : 'rgba(255,255,255,0.1)',
                color: isActive ? '#000' : '#666',
              }}
            >
              {isActive ? '⚡ AKTIV' : '● INAKTIV'}
            </span>
          </div>
        </div>

        {isActive && eventRecord?.activated_by && (
          <p className="text-white/40 text-xs mb-4">
            Aktiviert von <span className="text-yellow-400 font-bold">{eventRecord.activated_by}</span>
            {eventRecord.activated_at && ` am ${new Date(eventRecord.activated_at).toLocaleString('de-DE')}`}
          </p>
        )}

        <div className="text-white/60 text-sm mb-4 space-y-1">
          <p>✅ Pokémon-Banner auf allen Seiten</p>
          <p>✅ Fliegende Pokémon-Sprites im Hintergrund</p>
          <p>✅ Pokémon-Partikeleffekte auf Home, Watch, Shop, Profile, Shorts</p>
          <p>✅ 30-Jahre Jubiläums-Design-Overlays</p>
        </div>

        <Button
          onClick={toggle}
          disabled={toggling || loading}
          className="w-full"
          style={{
            background: isActive
              ? 'linear-gradient(135deg, #dc2626, #991b1b)'
              : 'linear-gradient(135deg, #FFD700, #FF6B00)',
            color: isActive ? 'white' : 'black',
            border: 'none',
            fontWeight: 900,
          }}
        >
          {toggling ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : isActive ? (
            <><PowerOff className="w-4 h-4 mr-2" /> Event deaktivieren</>
          ) : (
            <><Power className="w-4 h-4 mr-2" /> Event aktivieren 🎉</>
          )}
        </Button>
      </div>
    </motion.div>
  );
}