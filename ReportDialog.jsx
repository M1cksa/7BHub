import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Flag, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam oder Werbung', icon: '📢' },
  { value: 'harassment', label: 'Belästigung oder Mobbing', icon: '😡' },
  { value: 'inappropriate', label: 'Unangemessener Inhalt', icon: '🔞' },
  { value: 'copyright', label: 'Urheberrechtsverletzung', icon: '©️' },
  { value: 'misinformation', label: 'Falschinformationen', icon: '❌' },
  { value: 'violence', label: 'Gewalt oder Hass', icon: '⚠️' },
  { value: 'other', label: 'Anderes Problem', icon: '💬' },
];

export default function ReportDialog({ 
  isOpen, 
  onClose, 
  itemType, 
  itemId, 
  reportedUser 
}) {
  const [selectedReason, setSelectedReason] = useState(null);
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submitReportMutation = useMutation({
    mutationFn: async (data) => {
      const user = JSON.parse(localStorage.getItem('app_user') || '{}');
      return base44.entities.Report.create({
        reported_by_username: user.username,
        reported_item_type: itemType,
        reported_item_id: itemId,
        reported_user: reportedUser,
        reason: data.reason,
        description: data.description,
        status: 'pending'
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    }
  });

  const handleSubmit = () => {
    if (!selectedReason) return;
    submitReportMutation.mutate({
      reason: selectedReason,
      description: description
    });
  };

  const handleClose = () => {
    setSelectedReason(null);
    setDescription('');
    setSubmitted(false);
    onClose();
  };

  if (submitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="bg-[#1a1a1c] border-white/10 text-white max-w-md">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/30">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Meldung eingegangen</h3>
            <p className="text-white/60">Vielen Dank! Wir prüfen den Inhalt zeitnah.</p>
          </motion.div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#1a1a1c] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/30">
              <Flag className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-white">Inhalt melden</DialogTitle>
              <DialogDescription className="text-white/60">
                Hilf uns, die Community sicher zu halten
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <label className="text-sm font-bold text-white/70 mb-4 block">
              Warum meldest du diesen Inhalt?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason.value}
                  onClick={() => setSelectedReason(reason.value)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedReason === reason.value
                      ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/20'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{reason.icon}</span>
                    <span className="font-semibold text-sm">{reason.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedReason && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <label className="text-sm font-bold text-white/70 mb-2 block">
                Zusätzliche Details (optional)
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Beschreibe das Problem genauer..."
                className="bg-black/20 border-white/10 text-white min-h-[100px] resize-none"
              />
            </motion.div>
          )}

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-200/80">
              <strong className="block mb-1">Missbrauch von Meldungen</strong>
              Falsche oder böswillige Meldungen können zur Sperrung deines Accounts führen.
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-white/10 text-white hover:bg-white/10"
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedReason || submitReportMutation.isPending}
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-lg shadow-red-500/30"
          >
            {submitReportMutation.isPending ? 'Wird gesendet...' : 'Meldung absenden'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}