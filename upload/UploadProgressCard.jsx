import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock, Download } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function UploadProgressCard({ 
  progress = 0, 
  uploadSpeed = 0, 
  eta = 0,
  fileName = '',
  fileSize = 0,
  status = 'uploading'
}) {
  const speedMBps = uploadSpeed / 1024 / 1024;
  const etaSeconds = Math.ceil(eta);
  const fileSizeMB = fileSize / 1024 / 1024;

  const getStatusGradient = () => {
    if (status === 'processing') return 'from-purple-500 via-violet-500 to-indigo-500';
    if (status === 'complete') return 'from-green-500 via-emerald-500 to-teal-500';
    return 'from-cyan-500 via-blue-500 to-violet-500';
  };

  const getStatusLabel = () => {
    if (status === 'processing') return '⚙️ Verarbeite Video...';
    if (status === 'complete') return '✅ Fertig!';
    return '📤 Upload läuft...';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-2xl border border-white/10 p-6 md:p-8"
    >
      {/* Animated background gradient */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${getStatusGradient()} opacity-5`}
        animate={{ backgroundPosition: ['0%', '100%'] }}
        transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
      />

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1 truncate">{fileName || 'Video'}</h3>
            <p className="text-sm text-white/40">{fileSizeMB.toFixed(2)} MB</p>
          </div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl"
          >
            {status === 'processing' ? '⚙️' : status === 'complete' ? '✨' : '🚀'}
          </motion.div>
        </div>

        {/* Status Label */}
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center gap-2"
        >
          <span className={`text-sm font-semibold ${
            status === 'complete' ? 'text-green-400' : 'text-cyan-400'
          }`}>
            {getStatusLabel()}
          </span>
        </motion.div>

        {/* Progress Bar with animated background */}
        <div className="space-y-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono text-white/60">{Math.round(progress)}%</span>
            <span className="text-xs font-mono text-white/40">{fileSizeMB.toFixed(2)} MB</span>
          </div>
          
          <div className="relative h-2 rounded-full bg-white/5 overflow-hidden border border-white/10">
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
              animate={{ x: ['100%', '-100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            
            {/* Main progress bar */}
            <motion.div
              className={`h-full bg-gradient-to-r ${getStatusGradient()} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 30 }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        {uploadSpeed > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-3 gap-3"
          >
            {/* Speed */}
            <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-3 text-center hover:bg-white/10 transition-all">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-xs text-white/60">Speed</span>
              </div>
              <p className="text-sm font-bold text-white">{speedMBps.toFixed(1)} MB/s</p>
            </div>

            {/* ETA */}
            {etaSeconds > 0 && (
              <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-3 text-center hover:bg-white/10 transition-all">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs text-white/60">ETA</span>
                </div>
                <p className="text-sm font-bold text-white">{etaSeconds}s</p>
              </div>
            )}

            {/* Total Progress */}
            <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-3 text-center hover:bg-white/10 transition-all">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Download className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs text-white/60">Progress</span>
              </div>
              <p className="text-sm font-bold text-white">{Math.round(progress)}%</p>
            </div>
          </motion.div>
        )}

        {/* Warning message */}
        {status === 'processing' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl bg-purple-500/10 border border-purple-500/30 px-4 py-3 text-sm text-purple-300 flex items-start gap-2"
          >
            <span className="text-lg flex-shrink-0">⚙️</span>
            <span>Video wird verarbeitet und in mehreren Auflösungen transkodiert. Dies kann mehrere Minuten dauern.</span>
          </motion.div>
        )}

        {status === 'complete' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl bg-green-500/10 border border-green-500/30 px-4 py-3 text-sm text-green-300 flex items-start gap-2"
          >
            <span className="text-lg flex-shrink-0">✨</span>
            <span>Dein Video wurde erfolgreich hochgeladen und ist jetzt verfügbar!</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}