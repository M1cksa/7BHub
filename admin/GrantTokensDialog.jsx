import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function GrantTokensDialog({ isOpen, onClose, onSuccess }) {
  const [username, setUsername] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [targetUser, setTargetUser] = useState(null);

  const handleSearchUser = async () => {
    if (!username.trim()) {
      setError('Benutzername erforderlich.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const users = await base44.entities.AppUser.list('-created_date', 100);
      const found = users.find(u => u.username.toLowerCase() === username.toLowerCase());
      
      if (!found) {
        setError('Nutzer nicht gefunden.');
        setTargetUser(null);
      } else {
        setTargetUser(found);
        setError('');
      }
    } catch (err) {
      setError('Fehler beim Suchen: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGrant = async () => {
    if (!targetUser) {
      setError('Nutzer nicht gefunden.');
      return;
    }
    if (!amount || parseInt(amount) <= 0) {
      setError('Gültige Token-Anzahl erforderlich.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await base44.functions.invoke('grantTokensToUser', {
        targetUserId: targetUser.id,
        amount: parseInt(amount),
        reason: reason || 'Admin-Vergabe'
      });

      setSuccess(true);
      toast.success(`${amount} Tokens an ${targetUser.username} vergeben!`);
      
      setTimeout(() => {
        handleClose();
        onSuccess?.();
      }, 1500);
    } catch (err) {
      setError('Fehler: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUsername('');
    setAmount('');
    setReason('');
    setError('');
    setSuccess(false);
    setTargetUser(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-900/95 backdrop-blur-2xl border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Tokens vergeben</DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <p className="text-center text-white/80">Tokens erfolgreich vergeben!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Username Input & Search */}
            <div>
              <label className="block text-sm font-bold text-white/80 mb-2">Benutzername</label>
              <div className="flex gap-2">
                <Input
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setTargetUser(null);
                  }}
                  placeholder="Z.B. Micksa"
                  className="bg-black/40 border-white/20 text-white flex-1"
                  disabled={loading}
                />
                <Button
                  onClick={handleSearchUser}
                  disabled={loading || !username.trim()}
                  variant="secondary"
                  className="px-4"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Suchen'}
                </Button>
              </div>
            </div>

            {/* Found User Info */}
            {targetUser && (
              <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-400/30">
                <p className="text-sm text-cyan-300">✓ Nutzer gefunden: <strong>{targetUser.username}</strong></p>
                <p className="text-xs text-white/50 mt-1">Aktuelle Tokens: {targetUser.tokens || 0}</p>
              </div>
            )}

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-bold text-white/80 mb-2">Anzahl Tokens</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Z.B. 500"
                className="bg-black/40 border-white/20 text-white"
                disabled={loading}
              />
            </div>

            {/* Reason Input */}
            <div>
              <label className="block text-sm font-bold text-white/80 mb-2">Grund (optional)</label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Z.B. Entschädigung für Ausfallzeit"
                className="bg-black/40 border-white/20 text-white"
                disabled={loading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-400/30 flex gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="flex-1"
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleGrant}
                disabled={loading || !targetUser || !amount}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Wird verarbeitet...
                  </>
                ) : (
                  'Tokens vergeben'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}