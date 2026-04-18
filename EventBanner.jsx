import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Calendar, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EventBanner() {
  const [dismissed, setDismissed] = React.useState([]);

  const { data: events = [] } = useQuery({
    queryKey: ['eventAnnouncements'],
    queryFn: () => base44.entities.EventAnnouncement.list('-created_date', 10),
    refetchInterval: 60000
  });

  const now = new Date();
  const activeEvents = events.filter(e => 
    e.active && 
    new Date(e.start_date) <= now && 
    new Date(e.end_date) >= now &&
    !dismissed.includes(e.id)
  );

  if (activeEvents.length === 0) return null;

  const colorStyles = {
    blue: 'bg-gradient-to-r from-blue-600 to-cyan-600',
    purple: 'bg-gradient-to-r from-purple-600 to-pink-600',
    green: 'bg-gradient-to-r from-green-600 to-emerald-600',
    orange: 'bg-gradient-to-r from-orange-600 to-amber-600',
    pink: 'bg-gradient-to-r from-pink-600 to-rose-600'
  };

  return (
    <AnimatePresence>
      {activeEvents.map((event) => (
        <motion.div
          key={event.id}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className={`${colorStyles[event.color]} text-white px-4 py-3 shadow-lg relative z-50`}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Calendar className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">{event.title}</p>
                {event.description && (
                  <p className="text-white/90 text-xs mt-0.5 line-clamp-1">{event.description}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => setDismissed([...dismissed, event.id])}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}