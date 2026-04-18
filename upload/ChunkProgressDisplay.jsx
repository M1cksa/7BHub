import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, XCircle, Clock } from 'lucide-react';

const ChunkStatus = {
  PENDING: 'pending',
  UPLOADING: 'uploading',
  UPLOADED: 'uploaded',
  FAILED: 'failed'
};

function ChunkCell({ index, status }) {
  const getConfig = () => {
    switch (status) {
      case ChunkStatus.UPLOADED:
        return { bg: 'bg-green-500', icon: CheckCircle2, color: 'text-white' };
      case ChunkStatus.UPLOADING:
        return { bg: 'bg-blue-500 animate-pulse', icon: Loader2, color: 'text-white' };
      case ChunkStatus.FAILED:
        return { bg: 'bg-red-500', icon: XCircle, color: 'text-white' };
      default:
        return { bg: 'bg-white/10', icon: Clock, color: 'text-white/30' };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`relative w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center group cursor-pointer transition-all hover:scale-110`}
      title={`Chunk ${index + 1}: ${status}`}
    >
      <Icon className={`w-3.5 h-3.5 ${config.color}`} />
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        #{index + 1}: {status}
      </div>
    </motion.div>
  );
}

export default function ChunkProgressDisplay({ chunks = [], totalChunks = 0 }) {
  const chunkStatuses = Array.from({ length: totalChunks }, (_, i) => {
    const chunk = chunks.find(c => c.index === i);
    return chunk?.status || ChunkStatus.PENDING;
  });

  const stats = {
    uploaded: chunkStatuses.filter(s => s === ChunkStatus.UPLOADED).length,
    uploading: chunkStatuses.filter(s => s === ChunkStatus.UPLOADING).length,
    failed: chunkStatuses.filter(s => s === ChunkStatus.FAILED).length,
    pending: chunkStatuses.filter(s => s === ChunkStatus.PENDING).length
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white text-sm">Chunk Status</h3>
        <motion.div className="flex gap-4 text-xs">
          <motion.span className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30">
            <motion.div className="w-2 h-2 rounded-full bg-green-500" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }} />
            <span className="text-green-300">{stats.uploaded}/{totalChunks}</span>
          </motion.span>
          {stats.uploading > 0 && (
            <motion.span className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30">
              <motion.div className="w-2 h-2 rounded-full bg-blue-500" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
              <span className="text-blue-300">{stats.uploading}</span>
            </motion.span>
          )}
          {stats.failed > 0 && (
            <motion.span className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30">
              <motion.div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-red-300">{stats.failed}</span>
            </motion.span>
          )}
        </motion.div>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-xl border border-white/10 p-4 max-h-64 overflow-y-auto">
        <div className="grid grid-cols-10 sm:grid-cols-12 md:grid-cols-16 lg:grid-cols-20 gap-2">
          {chunkStatuses.map((status, index) => (
            <ChunkCell key={`chunk-${index}-${status}`} index={index} status={status} />
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap items-center gap-4 text-xs text-white/40 px-2"
      >
        <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/5">
          <div className="w-3 h-3 rounded bg-green-500 shadow-lg shadow-green-500/30" />
          <span>Hochgeladen</span>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/5">
          <motion.div className="w-3 h-3 rounded bg-blue-500 animate-pulse shadow-lg shadow-blue-500/30" />
          <span>Upload läuft</span>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/5">
          <div className="w-3 h-3 rounded bg-red-500 shadow-lg shadow-red-500/30" />
          <span>Fehler</span>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/5">
          <div className="w-3 h-3 rounded bg-white/20" />
          <span>Wartend</span>
        </div>
      </motion.div>
    </motion.div>
  );
}