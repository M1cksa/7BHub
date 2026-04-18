import { useState } from 'react';
import { supabase } from '@/api/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { UserPlus, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [selectedGroup, setSelectedGroup] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [agreeToVideoPolicy, setAgreeToVideoPolicy] = useState(false);
  const [showWhyGroupsDialog, setShowWhyGroupsDialog] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!agreeToTerms || !agreeToVideoPolicy) {
      setError('Bitte stimme allen Bedingungen zu');
      setLoading(false);
      return;
    }

    if (!selectedGroup) {
      setError('Bitte wähle aus, zu welcher Gruppe du gehörst');
      setLoading(false);
      return;
    }

    const cleanUsername = formData.username.trim();
    const cleanEmail = formData.email.trim();
    const loginEmail = cleanEmail || `${cleanUsername.toLowerCase()}@placeholder.7bhub.local`;

    try {
      console.log('[register] step 1: username check');
      const { data: takenEmail } = await supabase.rpc('get_email_for_username', {
        p_username: cleanUsername,
      });
      if (takenEmail) {
        setError('Benutzername bereits vergeben');
        return;
      }

      console.log('[register] step 2: signUp');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: loginEmail,
        password: formData.password,
        options: { data: { username: cleanUsername } },
      });
      console.log('[register] signUp result:', authData?.user?.id, authError);

      if (authError) {
        setError(authError.message?.toLowerCase().includes('registered')
          ? 'Benutzername bereits vergeben'
          : (authError.message || 'Registrierung fehlgeschlagen'));
        return;
      }

      const newUserId = authData?.user?.id;
      if (!newUserId) {
        setError('Registrierung fehlgeschlagen (keine User-ID)');
        return;
      }

      // 3. Profil updaten (Trigger hat die Zeile bereits angelegt).
      //    Kurzer Retry, falls der Trigger noch nicht committed ist.
      console.log('[register] step 3: update profile');
      const patch = {
        username: cleanUsername,
        email: loginEmail,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanUsername}`,
        bio: 'Neu hier!',
        role: 'user',
        requested_role: selectedGroup,
        approved: true,
        agreed_to_terms: true,
        agreed_to_video_policy: true,
        terms_agreed_at: new Date().toISOString(),
        test_season_2: true,
        newsletter_subscribed: false,
        newsletter_asked: false,
      };

      let updateOk = false;
      for (let attempt = 0; attempt < 3 && !updateOk; attempt++) {
        const { error: updateErr, data: updated } = await supabase
          .from('app_users')
          .update(patch)
          .eq('id', newUserId)
          .select()
          .maybeSingle();
        if (!updateErr && updated) {
          updateOk = true;
          break;
        }
        console.warn('[register] update attempt', attempt, updateErr?.message);
        await new Promise((r) => setTimeout(r, 400));
      }

      if (!updateOk) {
        // Letzter Fallback: direkt insert (durch neue RLS-Policy erlaubt)
        const { error: insertErr } = await supabase.from('app_users').insert({
          id: newUserId,
          ...patch,
        });
        if (insertErr) console.warn('[register] insert fallback warn:', insertErr.message);
      }

      console.log('[register] done → Tutorial');
      window.location.href = createPageUrl('Tutorial');

    } catch (err) {
      console.error('[register] error:', err);
      setError('Registrierung fehlgeschlagen: ' + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={showWhyGroupsDialog} onOpenChange={setShowWhyGroupsDialog}>
        <DialogContent className="bg-slate-900/95 backdrop-blur-2xl border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Warum fragen wir nach einer Gruppe?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-white/80 text-sm leading-relaxed">
            <p>
              Die Auswahl einer Gruppe (Girl/Boy) hilft uns, dir <strong>altersgerechte und personalisierte Inhalte</strong> zu zeigen. Das ist nicht diskriminierend, sondern:
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong>Sicherheit:</strong> Wir können Community-Standards altersgerecht umsetzen</li>
              <li><strong>Personalisierung:</strong> Du siehst Inhalte, die zu deinen Interessen passen</li>
              <li><strong>Moderation:</strong> Wir können besseren Jugendschutz bieten</li>
              <li><strong>Deine Wahl:</strong> Du kannst deine Gruppe später in den Einstellungen ändern</li>
            </ul>
            <p className="text-white/60 text-xs italic">
              Alle Gruppen haben Zugang zu allen Features. Das ist rein zur Inhalts-Kuratierung.
            </p>
          </div>
        </DialogContent>
      </Dialog>

    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a0014] via-[#050505] to-[#0a0a0b] -z-20" />
      <div className="fixed top-0 left-1/3 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[200px] animate-pulse pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/3 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[200px] animate-pulse pointer-events-none -z-10" style={{ animationDelay: '1.5s' }} />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-white/[0.03] backdrop-blur-2xl p-8 md:p-10 rounded-3xl md:rounded-[32px] border border-white/10 shadow-[0_0_80px_rgba(6,182,212,0.15)]">

        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="relative w-20 h-20 mx-auto mb-6"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-teal-600 rounded-full blur-2xl opacity-60 animate-pulse" />
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-cyan-600 to-teal-600 flex items-center justify-center shadow-2xl shadow-cyan-500/30 border-4 border-cyan-400/20">
              <UserPlus className="w-10 h-10 text-white drop-shadow-2xl" />
            </div>
          </motion.div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-white mb-2">Account erstellen</h1>
          <p className="text-white/50 text-sm">Werde Teil der Community</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-white/80 mb-3">Benutzername</label>
            <Input type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="bg-black/40 border-white/20 text-white h-14 rounded-2xl text-lg placeholder:text-white/30 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
            placeholder="Gewünschter Name"
            required
            minLength={3} />
          </div>

          <div>
            <label className="block text-sm font-bold text-white/80 mb-3">E-Mail (optional)</label>
            <Input type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="bg-black/40 border-white/20 text-white h-14 rounded-2xl text-lg placeholder:text-white/30 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
            placeholder="deine@email.de (optional)" />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-white/80 mb-3">Passwort</label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="bg-black/40 border-white/20 text-white h-14 rounded-2xl text-lg placeholder:text-white/30 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              placeholder="Mindestens 4 Zeichen"
              required
              minLength={4} />
          </div>

          {/* Group selection */}
          <div className="pt-2">
            <div className="flex items-center justify-between gap-2 mb-3">
              <label className="block text-sm font-bold text-white/80">Deine Gruppe</label>
              <button
                type="button"
                onClick={() => setShowWhyGroupsDialog(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-full transition-colors text-xs font-bold"
              >
                <Info className="w-3.5 h-3.5" />
                Warum?
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[{v:'girl',emoji:'👧',label:'Mädchen'},{v:'boy',emoji:'👦',label:'Jungs'}].map(({v,emoji,label}) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setSelectedGroup(v)}
                  className={`py-4 px-4 rounded-2xl text-base font-black transition-all border-2 flex items-center justify-center gap-3 ${selectedGroup === v ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] scale-[1.02]' : 'bg-black/40 border-white/10 text-white/50 hover:bg-white/5 hover:text-white hover:border-white/20'}`}
                >
                  <span className="text-2xl drop-shadow-md">{emoji}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
            <p className="text-white/30 text-xs mt-3 leading-relaxed">Diese Angabe wird von einem Admin geprüft und legt fest, welche Inhalte für dich sichtbar sind.</p>
          </div>

          <div className="space-y-3 pt-4">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => setAgreeToTerms(!agreeToTerms)}>
              <Checkbox 
                id="terms" 
                checked={agreeToTerms}
                onCheckedChange={setAgreeToTerms}
                className="mt-0.5 w-5 h-5 rounded-md border-2"
                onClick={(e) => e.stopPropagation()}
              />
              <label htmlFor="terms" className="text-sm font-medium text-white/70 leading-relaxed cursor-pointer flex-1" onClick={(e) => e.stopPropagation()}>
                Ich akzeptiere die{' '}
                <Link to={createPageUrl('Terms')} className="text-cyan-400 hover:text-cyan-300 font-bold underline decoration-cyan-500/50 underline-offset-2">
                  Allgemeinen Geschäftsbedingungen
                </Link>
              </label>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => setAgreeToVideoPolicy(!agreeToVideoPolicy)}>
              <Checkbox 
                id="video-policy" 
                checked={agreeToVideoPolicy}
                onCheckedChange={setAgreeToVideoPolicy}
                className="mt-0.5 w-5 h-5 rounded-md border-2"
                onClick={(e) => e.stopPropagation()}
              />
              <label htmlFor="video-policy" className="text-sm font-medium text-white/70 leading-relaxed cursor-pointer flex-1" onClick={(e) => e.stopPropagation()}>
                Ich verpflichte mich, <span className="text-white">keine Videos ohne Zustimmung</span> der Rechteinhaber zu verbreiten oder zu speichern.
              </label>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-2xl bg-red-500/10 border-2 border-red-500/30 text-red-400 text-sm text-center font-medium backdrop-blur-xl"
            >
              {error}
            </motion.div>
          )}

          <Button 
            type="submit" 
            disabled={loading || !agreeToTerms || !agreeToVideoPolicy || !formData.username || !formData.password || !selectedGroup}
            className="w-full mt-4 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white h-16 text-lg font-black shadow-2xl shadow-cyan-500/40 rounded-2xl border border-cyan-400/20 active:scale-95 md:hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Account wird erstellt...
              </div>
            ) : (
              'Kostenlos Registrieren'
            )}
          </Button>
        </form>

        <div className="mt-8 text-center border-t border-white/10 pt-8">
          <p className="text-white/40 text-sm mb-3">Bereits ein Teil der Community?</p>
          <Link to={createPageUrl('SignIn')}>
            <span className="inline-flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 font-black text-xl transition-all hover:scale-105 active:scale-95">
              Jetzt Anmelden <span className="text-teal-400">→</span>
            </span>
          </Link>
        </div>
      </motion.div>
    </div>
    </>);

}