import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle, Shield, Ban, Eye, Trash2, Flag } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function ModerationPage() {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('app_user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  });

  const [selectedReport, setSelectedReport] = useState(null);
  const [warningDialog, setWarningDialog] = useState(false);
  const [warningReason, setWarningReason] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);

  const queryClient = useQueryClient();

  const { data: reports = [] } = useQuery({
    queryKey: ['reports'],
    queryFn: () => base44.entities.Report.filter({ status: 'pending' }),
    enabled: !!user
  });

  const { data: warnings = [] } = useQuery({
    queryKey: ['warnings'],
    queryFn: () => base44.entities.Warning.list('-created_date', 100),
    enabled: !!user
  });

  const approveReportMutation = useMutation({
    mutationFn: (reportId) => base44.entities.Report.update(reportId, { status: 'resolved' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Meldung genehmigt');
      setSelectedReport(null);
    }
  });

  const rejectReportMutation = useMutation({
    mutationFn: (reportId) => base44.entities.Report.update(reportId, { status: 'rejected' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Meldung abgelehnt');
      setSelectedReport(null);
    }
  });

  const warnUserMutation = useMutation({
    mutationFn: async ({ reportId, userId, username, reason, severity }) => {
      await base44.entities.Warning.create({
        user_id: userId,
        username,
        reason,
        severity,
        issued_by: user?.username,
        related_content_type: selectedReport?.content_type,
        related_content_id: selectedReport?.content_id
      });
      await base44.entities.Report.update(reportId, { status: 'resolved' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', 'warnings'] });
      toast.success('Verwarnung ausgesprochen');
      setWarningDialog(false);
      setWarningReason('');
      setSelectedReport(null);
    }
  });

  const deleteContentMutation = useMutation({
    mutationFn: async (report) => {
      // Check if user already has warnings
      const userWarnings = warnings.filter(w => w.user_id === report.reported_user_id);
      
      if (userWarnings.length === 0) {
        throw new Error('Benutzer muss erst verwarnt werden bevor Inhalte gelöscht werden können');
      }

      // Delete based on content type
      if (report.content_type === 'video') {
        await base44.entities.Video.delete(report.content_id);
      } else if (report.content_type === 'comment') {
        await base44.entities.Comment.delete(report.content_id);
      }

      await base44.entities.Report.update(report.id, { status: 'resolved' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Inhalt gelöscht');
      setDeleteDialog(false);
      setSelectedReport(null);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const banUserMutation = useMutation({
    mutationFn: async (userId) => {
      await base44.entities.AppUser.update(userId, { approved: false });
    },
    onSuccess: () => {
      toast.success('Benutzer gesperrt');
      setSelectedReport(null);
    }
  });

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Zugriff verweigert</h1>
          <p className="text-white/50">Nur Admins haben Zugriff auf die Moderation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white mb-2">Moderation</h1>
        <p className="text-white/50">Gemeldete Inhalte überprüfen und verwalten</p>
      </div>

      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList className="glass-card">
          <TabsTrigger value="reports" className="gap-2">
            <Flag className="w-4 h-4" />
            Meldungen ({reports.length})
          </TabsTrigger>
          <TabsTrigger value="warnings" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Verwarnungen ({warnings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          {reports.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-white/50">Keine offenen Meldungen</p>
            </div>
          ) : (
            reports.map(report => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="destructive">{report.content_type}</Badge>
                      <span className="text-white/50 text-sm">
                        von {report.reporter_username}
                      </span>
                    </div>
                    <p className="text-white text-lg mb-2">{report.reason}</p>
                    {report.description && (
                      <p className="text-white/60 text-sm">{report.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => approveReportMutation.mutate(report.id)}
                    className="gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Genehmigen
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedReport(report);
                      setWarningDialog(true);
                    }}
                    className="gap-2"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Verwarnen
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setSelectedReport(report);
                      setDeleteDialog(true);
                    }}
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Löschen
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => rejectReportMutation.mutate(report.id)}
                    className="gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Ablehnen
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => banUserMutation.mutate(report.reported_user_id)}
                    className="gap-2"
                  >
                    <Ban className="w-4 h-4" />
                    User sperren
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </TabsContent>

        <TabsContent value="warnings" className="space-y-4">
          {warnings.map(warning => {
            const userWarningCount = warnings.filter(w => w.user_id === warning.user_id).length;
            
            return (
              <motion.div
                key={warning.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-white font-bold">{warning.username}</span>
                      <Badge variant={
                        warning.severity === 'high' ? 'destructive' :
                        warning.severity === 'medium' ? 'default' : 'secondary'
                      }>
                        {warning.severity}
                      </Badge>
                      <Badge variant="outline">{userWarningCount}x verwarnt</Badge>
                    </div>
                    <p className="text-white/70 mb-1">{warning.reason}</p>
                    <p className="text-white/40 text-sm">
                      von {warning.issued_by} • {new Date(warning.created_date).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </TabsContent>
      </Tabs>

      {/* Warning Dialog */}
      <Dialog open={warningDialog} onOpenChange={setWarningDialog}>
        <DialogContent className="bg-slate-900/90 backdrop-blur-3xl border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Benutzer verwarnen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/70 mb-2 block">Grund</label>
              <Textarea
                value={warningReason}
                onChange={(e) => setWarningReason(e.target.value)}
                placeholder="Grund für die Verwarnung..."
                className="bg-black/20 border-white/10 text-white"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => warnUserMutation.mutate({
                  reportId: selectedReport?.id,
                  userId: selectedReport?.reported_user_id,
                  username: selectedReport?.reported_username,
                  reason: warningReason,
                  severity: 'medium'
                })}
                disabled={!warningReason}
                className="flex-1"
              >
                Verwarnung aussprechen
              </Button>
              <Button variant="outline" onClick={() => setWarningDialog(false)}>
                Abbrechen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="bg-slate-900/90 backdrop-blur-3xl border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Inhalt löschen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-white/70">
              Möchtest du diesen Inhalt wirklich löschen? Dies kann nur erfolgen, wenn der Benutzer bereits verwarnt wurde.
            </p>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={() => deleteContentMutation.mutate(selectedReport)}
                className="flex-1"
              >
                Löschen
              </Button>
              <Button variant="outline" onClick={() => setDeleteDialog(false)}>
                Abbrechen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}