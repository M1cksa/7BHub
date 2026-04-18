import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function HubAssistantCharacter({ isOpen = false, isAnimating = false }) {
  const [customImage, setCustomImage] = useState(() => localStorage.getItem('assistantImageUrl') || '');

  useEffect(() => {
    // Fetch from DB on mount to ensure all devices get the latest image
    base44.entities.ServerStatus.list('-created_date', 1).then(records => {
      const url = records?.[0]?.assistant_image_url || '';
      if (url) {
        localStorage.setItem('assistantImageUrl', url);
        setCustomImage(url);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const handleImageUpdate = (e) => {
      const url = e.detail?.url || localStorage.getItem('assistantImageUrl') || '';
      setCustomImage(url);
    };
    window.addEventListener('assistant-image-updated', handleImageUpdate);
    return () => window.removeEventListener('assistant-image-updated', handleImageUpdate);
  }, []);

  return (
    <motion.div
      className="relative w-20 h-20"
      animate={isAnimating ? {
        y: [0, -8, 0],
        transition: { duration: 2, repeat: Infinity }
      } : {}}
    >
      {/* Custom Image oder Standard SVG Character */}
      {customImage ? (
        <motion.img
          src={customImage}
          alt="Assistant"
          className="w-full h-full object-cover rounded-full drop-shadow-2xl"
          animate={isAnimating ? {
            y: [0, -8, 0],
            transition: { duration: 2, repeat: Infinity }
          } : {}}
        />
      ) : (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
        {/* Gradienten für 3D-Effekt mit Mehrfarbigkeit */}
        <defs>
          {/* Hauptkugel - Blau zu Gelb Gradient */}
          <radialGradient id="characterGradient" cx="40%" cy="40%">
            <stop offset="0%" style={{ stopColor: '#fef3c7', stopOpacity: 1 }} />
            <stop offset="25%" style={{ stopColor: '#fcd34d', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#60b6ff', stopOpacity: 1 }} />
            <stop offset="75%" style={{ stopColor: '#1e88e5', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#0d47a1', stopOpacity: 1 }} />
          </radialGradient>
          
          {/* Heller Glanz für süßeren Look */}
          <radialGradient id="eyeGloss" cx="25%" cy="25%">
            <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#f5f5f5', stopOpacity: 0.6 }} />
            <stop offset="100%" style={{ stopColor: '#e0e0e0', stopOpacity: 0 }} />
          </radialGradient>

          {/* Oberer Glanzeffekt - wie auf dem Bild */}
          <radialGradient id="topGloss" cx="35%" cy="30%">
            <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.9 }} />
            <stop offset="50%" style={{ stopColor: '#ffffff', stopOpacity: 0.4 }} />
            <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0 }} />
          </radialGradient>
        </defs>

        {/* Hauptkugel */}
        <circle cx="50" cy="50" r="45" fill="url(#characterGradient)" />

        {/* Oberer Glanzeffekt - großer weißer Bereich wie im Bild */}
        <ellipse cx="35" cy="28" rx="20" ry="22" fill="url(#topGloss)" />

        {/* Linkes Auge - Weiß mit elegantem Glanz */}
        <motion.g
          animate={isOpen ? { scaleX: 1 } : { scaleX: 0.15 }}
          transition={{ duration: 0.3 }}
          style={{ transformOrigin: '32px 42px' }}
        >
          <ellipse cx="32" cy="42" rx="16" ry="13" fill="white" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.3))" />
          <ellipse cx="32" cy="40" rx="13" ry="8" fill="rgba(100, 160, 220, 0.2)" opacity="0.6" />
          <ellipse cx="30" cy="38" rx="5" ry="3" fill="white" opacity="0.8" />
        </motion.g>

        {/* Rechtes Auge - Weiß mit elegantem Glanz */}
        <motion.g
          animate={isOpen ? { scaleX: 1 } : { scaleX: 0.15 }}
          transition={{ duration: 0.3 }}
          style={{ transformOrigin: '68px 42px' }}
        >
          <ellipse cx="68" cy="42" rx="16" ry="13" fill="white" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.3))" />
          <ellipse cx="68" cy="40" rx="13" ry="8" fill="rgba(100, 160, 220, 0.2)" opacity="0.6" />
          <ellipse cx="70" cy="38" rx="5" ry="3" fill="white" opacity="0.8" />
        </motion.g>
      </svg>
      )}

      {/* Pulsing Glow wenn aktiv */}
      {isOpen && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(30,136,229,0.6) 0%, rgba(163,224,255,0.3) 40%, transparent 70%)',
          }}
          animate={{
            opacity: [0.6, 0.3, 0.6],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
          }}
        />
      )}
    </motion.div>
  );
}