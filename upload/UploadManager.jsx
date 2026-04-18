import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle2, XCircle, Loader2, Pause, Play, X, Clock, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const statusConfig = {
  uploading: { icon: Loader2, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Upload läuft', spin: true },
  processing: { icon: RefreshCw, color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'Verarbeite', spin: true },
  completed: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Fertig', spin: false },
  failed: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Fehler', spin: false },
  cancelled: { icon: X, color: 'text-gray-500', bg: 'bg-gray-500/10', label: 'Abgebrochen', spin: false }
};

function UploadHistoryCard({ upload, onRetry, onDelete }) {
  const config = statusConfig[upload.status] || statusConfig.uploading;
  const Icon = config.icon;
  const isActive = upload.status === 'uploading' || upload.status === 'processing';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      className={`relative overflow-hidden rounded-2xl transition-all ${
        isActive 
          ? 'glass-card border-2 border-cyan-500/50 shadow-xl shadow-cyan-500/20' 
          : 'glass-card hover:border-cyan-500/30'
      } p-4`}
    >
      {/* Animated background for active uploads */}
      {isActive && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0"
          animate={{ backgroundPosition: ['0%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      )}

      <div className="relative z-10 flex items-start gap-4">
        <motion.div
          animate={config.spin ? { rotate: 360 } : {}}
          transition={config.spin ? { duration: 2, repeat: Infinity, ease: 'linear' } : {}}
          className={`w-14 h-14 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0 border border-white/10`}
        >
          <Icon className={`w-7 h-7 ${config.color}`} />
        </motion.div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white truncate text-base">{upload.title || upload.filename}</h3>
              <p className="text-xs text-white/40 mt-1">{(upload.file_size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <motion.span
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap ${config.bg} ${config.color} border border-current/20`}
            >
              {config.label}
            </motion.span>
          </div>

          {upload.status === 'uploading' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2 mb-4"
            >
              <div className="flex justify-between text-xs text-white/50">
                <span>Chunks: {upload.chunks_uploaded}/{upload.total_chunks}</span>
                <span className="font-mono font-bold text-white/70">{Math.round(upload.progress)}%</span>
              </div>
              <div className="relative h-2 rounded-full bg-white/5 overflow-hidden border border-white/10">
                <motion.div
                  className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                  animate={{ x: ['100%', '-100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${upload.progress}%` }}
                  transition={{ type: 'spring', stiffness: 20 }}
                />
              </div>
            </motion.div>
          )}

          {upload.status === 'processing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/30"
            >
              <p className="text-xs text-purple-300 flex items-center gap-2">
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }} className="inline-block">
                  ⚙️
                </motion.span>
                Wird transkodiert...
              </p>
            </motion.div>
          )}

          {upload.error_message && (
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs text-red-300 bg-red-500/10 px-3 py-2 rounded-lg mb-3 border border-red-500/20"
            >
              ❌ {upload.error_message}
            </motion.p>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <p className="text-xs text-white/30">
              {upload.completed_at 
                ? format(new Date(upload.completed_at), 'dd.MM HH:mm', { locale: de })
                : format(new Date(upload.created_date), 'dd.MM HH:mm', { locale: de })}
            </p>
            
            <motion.div className="flex gap-2">
              {upload.status === 'failed' && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRetry(upload)}
                    className="h-8 px-2 text-xs text-blue-400 hover:bg-blue-500/10 rounded-lg"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1" />
                    Retry
                  </Button>
                </motion.div>
              )}
              {(upload.status === 'completed' || upload.status === 'failed' || upload.status === 'cancelled') && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(upload.id)}
                    className="h-8 px-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function UploadManager({ currentUploadId }) {
  const [filter, setFilter] = useState('all'); // all, active, completed, failed
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('app_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
  }, []);

  const { data: uploads = [], refetch } = useQuery({
    queryKey: ['uploadHistory', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await base44.entities.UploadHistory.filter({ user_id: user.id }, '-created_date', 50);
    },
    enabled: !!user,
    refetchInterval: 3000 // Refresh every 3s for active uploads
  });

  const handleDelete = async (uploadId) => {
    try {
      await base44.entities.UploadHistory.delete(uploadId);
      toast.success('Upload gelöscht');
      refetch();
    } catch (e) {
      toast.error('Fehler beim Löschen');
    }
  };

  const handleRetry = (upload) => {
    toast.info('Retry-Funktion wird bald verfügbar sein');
  };

  const filteredUploads = uploads.filter(u => {
    if (filter === 'all') return true;
    if (filter === 'active') return u.status === 'uploading' || u.status === 'processing';
    if (filter === 'completed') return u.status === 'completed';
    if (filter === 'failed') return u.status === 'failed' || u.status === 'cancelled';
    return true;
  });

  const stats = {
    active: uploads.filter(u => u.status === 'uploading' || u.status === 'processing').length,
    completed: uploads.filter(u => u.status === 'completed').length,
    failed: uploads.filter(u => u.status === 'failed' || u.status === 'cancelled').length
  };

  if (!user) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Upload Manager</h2>
        <Button size="sm" variant="ghost" onClick={refetch} className="h-8">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setFilter('active')}
          className={`p-3 rounded-xl transition-all ${filter === 'active' ? 'glass-card' : 'bg-white/5 hover:bg-white/10'}`}
        >
          <p className="text-2xl font-bold text-blue-400">{stats.active}</p>
          <p className="text-xs text-white/40">Aktiv</p>
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`p-3 rounded-xl transition-all ${filter === 'completed' ? 'glass-card' : 'bg-white/5 hover:bg-white/10'}`}
        >
          <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
          <p className="text-xs text-white/40">Fertig</p>
        </button>
        <button
          onClick={() => setFilter('failed')}
          className={`p-3 rounded-xl transition-all ${filter === 'failed' ? 'glass-card' : 'bg-white/5 hover:bg-white/10'}`}
        >
          <p className="text-2xl font-bold text-red-400">{stats.failed}</p>
          <p className="text-xs text-white/40">Fehler</p>
        </button>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar">
        {['all', 'active', 'completed', 'failed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              filter === f 
                ? 'bg-white/10 text-white' 
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            {f === 'all' ? 'Alle' : f === 'active' ? 'Aktiv' : f === 'completed' ? 'Abgeschlossen' : 'Fehlgeschlagen'}
          </button>
        ))}
      </div>

      {/* Upload List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto hide-scrollbar">
        <AnimatePresence mode="popLayout">
          {filteredUploads.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 glass-card rounded-2xl"
            >
              <Upload className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/40">Keine Uploads</p>
            </motion.div>
          ) : (
            filteredUploads.map(upload => (
              <UploadHistoryCard
                key={upload.id}
                upload={upload}
                onRetry={handleRetry}
                onDelete={handleDelete}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}