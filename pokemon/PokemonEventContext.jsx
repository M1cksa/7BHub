import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const PokemonEventContext = createContext({ isActive: false, eventData: null });

export function PokemonEventProvider({ children }) {
  const [isActive, setIsActive] = useState(false);
  const [eventData, setEventData] = useState(null);

  useEffect(() => {
    const check = async () => {
      try {
        const events = await base44.entities.PokemonEvent.filter({ is_active: true }, 1);
        if (events && events.length > 0) {
          setIsActive(true);
          setEventData(events[0]);
        } else {
          setIsActive(false);
          setEventData(null);
        }
      } catch (e) {}
    };

    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <PokemonEventContext.Provider value={{ isActive, eventData }}>
      {children}
    </PokemonEventContext.Provider>
  );
}

export function usePokemonEvent() {
  return useContext(PokemonEventContext);
}