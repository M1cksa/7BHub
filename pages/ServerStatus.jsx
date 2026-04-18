import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Server, CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ServerStatus() {
  const { data: statuses = [] } = useQuery({
    queryKey: ['serverStatus'],
    queryFn: () => base44.entities.ServerStatus.list('-created_date', 1),
    refetchInterval: 30000
  });

  const currentStatus = statuses[0] || { status: 'online', message: 'Alle Systeme laufen normal' };

  const statusConfig = {
    online: {
      icon: CheckCircle2,
      color: 'from-emerald-500 to-green-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'Online',
      textColor: 'text-emerald-400'
    },
    maintenance: {
      icon: AlertTriangle,
      color: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'Wartung',
      textColor: 'text-amber-400'
    },
    degraded: {
      icon: AlertTriangle,
      color: 'from-yellow-500 to-amber-500',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      text: 'Eingeschränkt',
      textColor: 'text-yellow-400'
    },
    offline: {
      icon: XCircle,
      color: 'from-red-500 to-rose-500',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'Offline',
      textColor: 'text-red-400'
    }
  };

  const config = statusConfig[currentStatus.status] || statusConfig.online;
  const Icon = config.icon;

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center">
            <Server className="w-10 h-10 text-cyan-400" />
          </div>
          <h1 className="text-4xl font-black mb-2">Serverstatus</h1>
          <p className="text-white/50">Aktuelle Systemverfügbarkeit</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`glass-card p-8 rounded-3xl mb-6 ${config.border}`}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-16 h-16 rounded-2xl ${config.bg} flex items-center justify-center`}>
              <Icon className={`w-8 h-8 ${config.textColor}`} />
            </div>
            <div>
              <h2 className="text-2xl font-black mb-1">{config.text}</h2>
              <p className="text-white/60 text-sm">System Status</p>
            </div>
          </div>

          {currentStatus.message && (
            <div className="bg-white/5 rounded-2xl p-4 mt-6">
              <p className="text-white/80 leading-relaxed">{currentStatus.message}</p>
            </div>
          )}

          {currentStatus.estimated_end && (
            <div className="flex items-center gap-3 mt-6 text-white/60">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                Voraussichtlich bis: {new Date(currentStatus.estimated_end).toLocaleString('de-DE')}
              </span>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 rounded-2xl"
        >
          <h3 className="text-lg font-bold mb-4">Systemkomponenten</h3>
          <div className="space-y-3">
            {['API', 'Datenbank', 'Streaming', 'Upload'].map((component, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <span className="text-white/80">{component}</span>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 text-sm font-medium">Operational</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}