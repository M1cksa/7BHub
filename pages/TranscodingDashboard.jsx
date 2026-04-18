import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Video, CheckCircle2, XCircle, Clock, Loader2, Play, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';

export default function TranscodingDashboard() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('app_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const { data: jobs = [], isLoading, refetch } = useQuery({
    queryKey: ['transcoding-jobs'],
    queryFn: () => base44.entities.TranscodingJob.list('-created_date', 100),
    refetchInterval: 5000 // Auto-refresh every 5s
  });

  const handleRetry = async (jobId) => {
    try {
      const res = await base44.functions.invoke('transcodeVideo', { jobId });
      if (res.data?.success) {
        toast.success('Job neu gestartet');
        refetch();
      }
    } catch (e) {
      toast.error('Fehler: ' + e.message);
    }
  };

  const statusConfig = {
    pending: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock, label: 'Wartend' },
    processing: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Loader2, label: 'Verarbeitung', spin: true },
    completed: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle2, label: 'Fertig' },
    failed: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle, label: 'Fehler' }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <Video className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Kein Zugriff</h2>
          <p className="text-white/50">Nur Admins können Transkodierungs-Jobs sehen</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">Transkodierungs-Dashboard</h1>
          <p className="text-white/50">Überwache Video-Konvertierungen in Echtzeit</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Aktualisieren
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Object.entries(statusConfig).map(([status, config]) => {
          const count = jobs.filter(j => j.status === status).length;
          return (
            <div key={status} className="glass-card p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center`}>
                  <config.icon className={`w-5 h-5 ${config.spin ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{count}</div>
                  <div className="text-xs text-white/50">{config.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Jobs List */}
      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mx-auto mb-4" />
          <p className="text-white/50">Lade Jobs...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12 glass-card rounded-2xl">
          <Video className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Keine Jobs</h3>
          <p className="text-white/50">Noch keine Transkodierungs-Jobs vorhanden</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const config = statusConfig[job.status];
            const Icon = config.icon;
            
            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 rounded-2xl"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white">{job.video_title}</h3>
                      <Badge className={`${config.color} border`}>
                        <Icon className={`w-3 h-3 mr-1.5 ${config.spin ? 'animate-spin' : ''}`} />
                        {config.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/50">
                      <span>Job ID: {job.id.substring(0, 8)}</span>
                      <span>•</span>
                      <span>{format(new Date(job.created_date), 'PPp', { locale: de })}</span>
                    </div>
                  </div>
                  
                  {job.status === 'failed' && (
                    <Button size="sm" variant="outline" onClick={() => handleRetry(job.id)}>
                      <Play className="w-4 h-4 mr-2" />
                      Wiederholen
                    </Button>
                  )}
                </div>

                {/* Progress Bar */}
                {job.status === 'processing' && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-white/70 mb-2">
                      <span>Fortschritt</span>
                      <span>{job.progress}%</span>
                    </div>
                    <Progress value={job.progress} className="h-2" />
                  </div>
                )}

                {/* Resolutions */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-white/50">Auflösungen:</span>
                  {job.target_resolutions?.map(res => (
                    <Badge key={res} variant="outline" className="text-xs">
                      {res}
                    </Badge>
                  ))}
                  <Badge variant="outline" className="text-xs capitalize">
                    {job.quality} Quality
                  </Badge>
                </div>

                {/* Error Message */}
                {job.error_message && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mt-3">
                    <p className="text-sm text-red-400">{job.error_message}</p>
                  </div>
                )}

                {/* Output URLs */}
                {job.status === 'completed' && job.output_urls && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <div className="text-xs text-white/50 mb-2">Verfügbare Auflösungen:</div>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(job.output_urls).map(res => (
                        <Badge key={res} className="bg-green-500/20 text-green-400">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {res}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}