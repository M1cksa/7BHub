import React from 'react';
import { motion } from 'framer-motion';

export default function WaveBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated Waves */}
      <svg className="absolute w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="none">
        <motion.path
          d="M0,400 C320,300 640,500 1440,400 L1440,800 L0,800 Z"
          fill="url(#wave1)"
          animate={{
            d: [
              "M0,400 C320,300 640,500 1440,400 L1440,800 L0,800 Z",
              "M0,450 C320,350 640,550 1440,450 L1440,800 L0,800 Z",
              "M0,400 C320,300 640,500 1440,400 L1440,800 L0,800 Z"
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.path
          d="M0,500 C360,400 720,600 1440,500 L1440,800 L0,800 Z"
          fill="url(#wave2)"
          animate={{
            d: [
              "M0,500 C360,400 720,600 1440,500 L1440,800 L0,800 Z",
              "M0,550 C360,450 720,650 1440,550 L1440,800 L0,800 Z",
              "M0,500 C360,400 720,600 1440,500 L1440,800 L0,800 Z"
            ]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <defs>
          <linearGradient id="wave1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(6, 182, 212, 0.1)" />
            <stop offset="100%" stopColor="rgba(6, 182, 212, 0)" />
          </linearGradient>
          <linearGradient id="wave2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(139, 92, 246, 0.08)" />
            <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}