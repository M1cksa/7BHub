import React, { useState, useEffect } from 'react';
import { X, Heart, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DonationBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('app_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }

    const dismissed = localStorage.getItem('donation_banner_dismissed');
    if (dismissed) {
      setIsDismissed(true);
      setIsVisible(false);
    }
  }, []);

  // Hide banner for donors
  if (user?.is_donor) return null;

  const handleDismiss = () => {
    localStorage.setItem('donation_banner_dismissed', 'true');
    setIsVisible(false);
    setIsDismissed(true);
  };

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-16 left-0 right-0 z-40 px-4 py-3"
          style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top))' }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="relative bg-gradient-to-r from-red-600 via-pink-600 to-red-600 rounded-2xl shadow-2xl shadow-red-500/30 border border-red-400/30 overflow-hidden">
              {/* Animated background */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse" />
              </div>

              <div className="relative px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center animate-pulse flex-shrink-0">
                    <Heart className="w-6 h-6 text-white fill-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-black text-lg md:text-xl mb-1">
                      🚨 Dringende Unterstützung benötigt!
                    </h3>
                    <p className="text-white/90 text-sm md:text-base">
                      7B Hub benötigt dringend Spenden (mind. 50€), um weiterhin zu existieren. 
                      <span className="hidden md:inline"> Kontaktiere uns direkt: </span>
                      <a 
                        href="mailto:7bhubofficial@gmail.com" 
                        className="inline-flex items-center gap-1 text-white font-bold underline hover:text-white/80 transition-colors ml-1"
                      >
                        <Mail className="w-4 h-4" />
                        7bhubofficial@gmail.com
                      </a>
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDismiss}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 flex-shrink-0"
                  aria-label="Banner schließen"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}