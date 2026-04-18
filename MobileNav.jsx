import { Link, useLocation } from 'react-router-dom';
import { Home, User, Radio, Zap, ShoppingBag, Users, MessageSquare, Sparkles, Upload, Menu, X, Gamepad2 } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const MAIN_NAV = [
  { icon: Home, label: 'Home', path: 'Home' },
  { icon: Radio, label: 'Live', path: 'Live' },
  { icon: Zap, label: 'Snaps', path: 'Snaps' },
  { icon: User, label: 'Profil', path: 'Profile' },
];

const MORE_NAV = [
  { icon: Gamepad2, label: 'Astro Blitz', path: 'AstroBlitz', badge: true },
  { icon: Users, label: 'Watch Party', path: 'WatchPartyLobby' },
  { icon: MessageSquare, label: 'Community', path: 'CommunityHub' },
  { icon: ShoppingBag, label: 'Shop', path: 'Shop' },
  { icon: Zap, label: 'Clans', path: 'Clans' },
  { icon: Sparkles, label: 'Roadmap', path: 'Roadmap' },
  { icon: Upload, label: 'Upload', path: 'UploadSelect' },
];

export default function MobileNav() {
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);
  const pathname = location.pathname;

  const isActive = (path) => pathname.toLowerCase().includes(path.toLowerCase());

  return (
    <>
      {/* More Sheet */}
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setShowMore(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="md:hidden fixed bottom-28 left-4 right-4 z-50 bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-3 grid grid-cols-2 gap-2">
                {MORE_NAV.map((link) => (
                  <Link key={link.path} to={createPageUrl(link.path)} onClick={() => setShowMore(false)}>
                    <div className={cn(
                      "relative flex items-center gap-2.5 px-3 py-3 rounded-xl transition-colors",
                      isActive(link.path) ? "bg-white/10 text-white" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                    )}>
                      <link.icon className="w-4 h-4 shrink-0" />
                      <span className="text-sm font-medium">{link.label}</span>
                      {link.badge && (
                        <span className="ml-auto text-[8px] font-black px-1.5 py-0.5 rounded bg-orange-500 text-white leading-none animate-pulse">UPDATE</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Bar */}
      <div className="md:hidden fixed bottom-4 left-3 right-3 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="bg-black/70 backdrop-blur-2xl border border-white/15 rounded-2xl flex items-center h-16 px-1">
          {MAIN_NAV.map((link) => {
            const active = isActive(link.path);
            return (
              <Link key={link.path} to={createPageUrl(link.path)} className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2">
                <div className={cn(
                  "p-1.5 rounded-xl transition-all duration-200",
                  active ? "bg-white/10" : ""
                )}>
                  <link.icon className={cn("w-5 h-5 transition-colors", active ? "text-white" : "text-white/40")} />
                </div>
                <span className={cn("text-[10px] font-medium transition-colors", active ? "text-white/80" : "text-white/30")}>
                  {link.label}
                </span>
              </Link>
            );
          })}

          {/* More */}
          <button onClick={() => setShowMore(!showMore)} className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2">
            <div className={cn("p-1.5 rounded-xl transition-all duration-200", showMore ? "bg-white/10" : "")}>
              {showMore ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white/40" />}
            </div>
            <span className={cn("text-[10px] font-medium", showMore ? "text-white/80" : "text-white/30")}>Mehr</span>
          </button>
        </div>
      </div>
    </>
  );
}