import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ServerStatusBanner() {
  const [dismissed, setDismissed] = React.useState(false);

  const { data: statuses = [] } = useQuery({
    queryKey: ['serverStatus'],
    queryFn: () => base44.entities.ServerStatus.list('-created_date', 1),
    refetchInterval: 60000
  });

  const currentStatus = statuses[0];

  if (!currentStatus?.show_banner || dismissed || currentStatus.status === 'online') {
    return null;
  }

  const statusColors = {
    maintenance: 'bg-amber-500/90 text-white',
    degraded: 'bg-yellow-500/90 text-black',
    offline: 'bg-red-500/90 text-white'
  };

  const color = statusColors[currentStatus.status] || statusColors.maintenance;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className={`${color} px-4 py-3 fixed top-16 left-0 right-0 z-50 shadow-lg`}
        style={{ marginTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">{currentStatus.message}</p>
            </div>
          </div>
          <Link to={createPageUrl('ServerStatus')} className="text-sm font-bold underline flex-shrink-0">
            Details
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-black/10 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}