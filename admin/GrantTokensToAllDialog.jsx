import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Users, Sparkles } from 'lucide-react';

export default function GrantTokensToAllDialog({ isOpen, onClose, totalUsers, onSuccess }) {
  const [tokenAmount, setTokenAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGrant = async () => {
    if (!tokenAmount || parseInt(tokenAmount) <= 0) {
      toast.error('Bitte gib einen gültigen Token-Betrag ein');
      return;
    }

    setIsLoading(true);
    try {
      const response = await base44.functions.invoke('grantTokensToAllUsers', {
        tokenAmount: parseInt(tokenAmount)
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setTokenAmount('');
        onClose();
        onSuccess?.();
      } else {
        toast.error(response.data.error || 'Fehler beim Vergeben von Tokens');
      }
    } catch (error) {
      toast.error('Fehler: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900/90 backdrop-blur-3xl border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black flex items-center gap-2">
            <Users className="w-6 h-6" />
            Tokens an alle Nutzer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-500/20">
            <p className="text-sm text-white/70">
              <span className="font-bold text-white">{totalUsers}</span> Nutzer erhalten je die angegebene Anzahl Tokens
            </p>
          </div>

          <div>
            <Label htmlFor="token-amount">Token-Betrag pro Nutzer</Label>
            <Input
              id="token-amount"
              type="number"
              min="1"
              value={tokenAmount}
              onChange={(e) => setTokenAmount(e.target.value)}
              placeholder="z.B. 100"
              className="bg-white/5 border-white/10 text-white mt-2"
            />
          </div>

          {tokenAmount && (
            <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
              <p className="text-sm text-cyan-400">
                📊 Gesamt: {(parseInt(tokenAmount) * totalUsers).toLocaleString()} Tokens ({totalUsers} × {tokenAmount})
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  disabled={!tokenAmount || parseInt(tokenAmount) <= 0 || isLoading}
                  className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 h-11 gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Vergeben
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[#1a1a1b] border-white/10">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Tokens vergeben?</AlertDialogTitle>
                  <AlertDialogDescription className="text-white/60">
                    Alle {totalUsers} Nutzer erhalten jeweils {tokenAmount} Tokens. 
                    <br /><strong>Gesamt: {(parseInt(tokenAmount) * totalUsers).toLocaleString()} Tokens</strong>
                    <br /><br />Diese Aktion kann nicht rückgängig gemacht werden.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-white/10 border-white/10 text-white hover:bg-white/20">
                    Abbrechen
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleGrant}
                    disabled={isLoading}
                    className="bg-amber-600 hover:bg-amber-500"
                  >
                    {isLoading ? 'Wird verarbeitet...' : 'Bestätigen'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              variant="outline"
              onClick={onClose}
              className="bg-white/5 border-white/10"
            >
              Abbrechen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}