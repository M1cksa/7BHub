import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function NeonDashWhatsAppPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const u = (() => { try { const s = localStorage.getItem('app_user'); return s && s !== 'undefined' ? JSON.parse(s) : null; } catch { return null; } })();
    if (u && !u.whatsapp_channel_seen) {
      // slight delay so game loads first
      const t = setTimeout(() => setShow(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = async (join = false) => {
    setShow(false);
    if (join) window.open('https://whatsapp.com/channel/0029Vb8M1M8EVccKVWnkFp0k', '_blank');
    const u = (() => { try { const s = localStorage.getItem('app_user'); return s && s !== 'undefined' ? JSON.parse(s) : null; } catch { return null; } })();
    if (u?.id) {
      try {
        const updated = await base44.entities.AppUser.update(u.id, { whatsapp_channel_seen: true });
        localStorage.setItem('app_user', JSON.stringify(updated));
      } catch {}
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(14px)' }}
        >
          <motion.div
            initial={{ scale: 0.82, y: 32, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.82, y: 32, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.4, duration: 0.5 }}
            className="relative max-w-sm w-full rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #060d06 0%, #040e0b 100%)',
              border: '1px solid rgba(37,211,102,0.28)',
              boxShadow: '0 0 70px rgba(37,211,102,0.18), 0 0 140px rgba(37,211,102,0.07), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            {/* top accent line */}
            <div className="h-[3px] w-full" style={{ background: 'linear-gradient(90deg, transparent, #25d366, #128c7e, #25d366, transparent)' }} />

            <div className="p-7 flex flex-col items-center text-center gap-5">
              {/* pulsing icon */}
              <motion.div
                animate={{ scale: [1, 1.07, 1], boxShadow: ['0 0 24px rgba(37,211,102,0.3)', '0 0 44px rgba(37,211,102,0.55)', '0 0 24px rgba(37,211,102,0.3)'] }}
                transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
                className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center text-4xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(37,211,102,0.18), rgba(18,140,126,0.12))',
                  border: '1px solid rgba(37,211,102,0.35)',
                }}
              >
                💬
              </motion.div>

              {/* copy */}
              <div className="space-y-1.5">
                <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.2em]">Hey, warte mal!</p>
                <h2 className="text-white text-[1.35rem] font-black leading-tight">
                  Hast du schon unseren{' '}
                  <span style={{ color: '#25d366', textShadow: '0 0 14px rgba(37,211,102,0.5)' }}>WhatsApp&#8209;Kanal</span>{' '}
                  gesehen?
                </h2>
                <p className="text-white/45 text-sm leading-relaxed pt-1">
                  Updates, Infos &amp; exklusive News – direkt auf dein Handy. Kostenlos &amp; jederzeit kündbar.
                </p>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col gap-3 w-full">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => dismiss(true)}
                  className="w-full py-3.5 rounded-2xl font-black text-[0.95rem] text-white transition-all hover:brightness-110"
                  style={{
                    background: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)',
                    boxShadow: '0 4px 22px rgba(37,211,102,0.4)',
                  }}
                >
                  📲 Zum Kanal beitreten
                </motion.button>
                <button
                  onClick={() => dismiss(false)}
                  className="w-full py-2.5 rounded-2xl font-semibold text-sm text-white/35 hover:text-white/55 transition-colors"
                >
                  Nicht jetzt
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}