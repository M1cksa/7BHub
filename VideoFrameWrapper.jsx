import React from 'react';
import { motion } from 'framer-motion';

const FRAME_STYLES = {
  none: {},
  cosmic: {
    border: '5px solid transparent',
    background: 'linear-gradient(#000, #000) padding-box, linear-gradient(45deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #667eea 100%) border-box',
    boxShadow: '0 0 50px rgba(102, 126, 234, 0.7), inset 0 0 30px rgba(102, 126, 234, 0.3)',
  },
  crystal: {
    border: '5px solid transparent',
    background: 'linear-gradient(#000, #000) padding-box, linear-gradient(135deg, #a8edea 0%, #fed6e3 100%) border-box',
    boxShadow: '0 0 50px rgba(168, 237, 234, 0.8), inset 0 0 40px rgba(254, 214, 227, 0.4)',
  },
  fire: {
    border: '6px solid transparent',
    background: 'linear-gradient(#000, #000) padding-box, linear-gradient(0deg, #ff0000 0%, #ff7300 25%, #fffb00 50%, #ff7300 75%, #ff0000 100%) border-box',
    boxShadow: '0 0 60px rgba(255, 115, 0, 1), inset 0 0 30px rgba(255, 0, 0, 0.4)',
  },
  neon: {
    border: '5px solid transparent',
    background: 'linear-gradient(#000, #000) padding-box, linear-gradient(90deg, #00f5ff 0%, #ff00ff 50%, #00f5ff 100%) border-box',
    boxShadow: '0 0 60px rgba(0, 245, 255, 0.9), 0 0 100px rgba(255, 0, 255, 0.6)',
  },
  gold: {
    border: '7px solid transparent',
    background: 'linear-gradient(#000, #000) padding-box, linear-gradient(135deg, #f4c430 0%, #ffd700 25%, #ffed4e 50%, #ffd700 75%, #f4c430 100%) border-box',
    boxShadow: '0 0 60px rgba(255, 215, 0, 1), inset 0 0 40px rgba(244, 196, 48, 0.5)',
  },
  matrix: {
    border: '5px solid transparent',
    background: 'linear-gradient(#000, #000) padding-box, linear-gradient(180deg, #00ff41 0%, #00a827 50%, #00ff41 100%) border-box',
    boxShadow: '0 0 50px rgba(0, 255, 65, 0.9), inset 0 0 30px rgba(0, 168, 39, 0.4)',
  },
  ice: {
    border: '6px solid transparent',
    background: 'linear-gradient(#000, #000) padding-box, linear-gradient(135deg, #a8e0ff 0%, #d4f1ff 25%, #e0f9ff 50%, #d4f1ff 75%, #a8e0ff 100%) border-box',
    boxShadow: '0 0 60px rgba(168, 224, 255, 1), inset 0 0 40px rgba(212, 241, 255, 0.5)',
  },
  inferno: {
    border: '7px solid transparent',
    background: 'linear-gradient(#000, #000) padding-box, linear-gradient(45deg, #b91c1c 0%, #ea580c 25%, #fbbf24 50%, #ea580c 75%, #b91c1c 100%) border-box',
    boxShadow: '0 0 80px rgba(234, 88, 12, 1.2), inset 0 0 50px rgba(185, 28, 28, 0.6)',
  },
  celestial: {
    border: '6px solid transparent',
    background: 'linear-gradient(#000, #000) padding-box, linear-gradient(135deg, #f9a8d4 0%, #c084fc 25%, #60a5fa 50%, #c084fc 75%, #f9a8d4 100%) border-box',
    boxShadow: '0 0 70px rgba(249, 168, 212, 0.9), inset 0 0 40px rgba(192, 132, 252, 0.5)',
  },
  plasma: {
    border: '5px solid transparent',
    background: 'linear-gradient(#000, #000) padding-box, linear-gradient(270deg, #fa709a 0%, #fee140 25%, #30cfd0 50%, #fee140 75%, #fa709a 100%) border-box',
    boxShadow: '0 0 70px rgba(250, 112, 154, 0.8), 0 0 100px rgba(48, 207, 208, 0.6)',
  },
  void: {
    border: '6px solid transparent',
    background: 'linear-gradient(#000, #000) padding-box, linear-gradient(180deg, #1a0033 0%, #4a0080 25%, #8000ff 50%, #4a0080 75%, #1a0033 100%) border-box',
    boxShadow: '0 0 80px rgba(128, 0, 255, 1.2), inset 0 0 50px rgba(74, 0, 128, 0.6)',
  },
  emerald: {
    border: '6px solid transparent',
    background: 'linear-gradient(#000, #000) padding-box, linear-gradient(45deg, #00c853 0%, #64dd17 25%, #00e676 50%, #64dd17 75%, #00c853 100%) border-box',
    boxShadow: '0 0 60px rgba(0, 230, 118, 1), inset 0 0 35px rgba(100, 221, 23, 0.5)',
  },
  royal: {
    border: '7px solid transparent',
    background: 'linear-gradient(#000, #000) padding-box, linear-gradient(135deg, #5e2563 0%, #b721ff 25%, #d946ef 50%, #b721ff 75%, #5e2563 100%) border-box',
    boxShadow: '0 0 70px rgba(183, 33, 255, 0.9), inset 0 0 40px rgba(217, 70, 239, 0.4)',
  },
  sunset: {
    border: '6px solid transparent',
    background: 'linear-gradient(#000, #000) padding-box, linear-gradient(90deg, #ff6b6b 0%, #ffa500 25%, #ffd700 50%, #ffa500 75%, #ff6b6b 100%) border-box',
    boxShadow: '0 0 65px rgba(255, 107, 107, 0.9), inset 0 0 35px rgba(255, 215, 0, 0.5)',
  },
  aurora: {
    border: '5px solid transparent',
    background: 'linear-gradient(#000, #000) padding-box, linear-gradient(135deg, #00ffa3 0%, #03e9f4 25%, #ff00ff 50%, #03e9f4 75%, #00ffa3 100%) border-box',
    boxShadow: '0 0 80px rgba(0, 255, 163, 0.8), 0 0 120px rgba(255, 0, 255, 0.6)',
  },
  toxic: {
    border: '6px solid transparent',
    background: 'linear-gradient(#000, #000) padding-box, linear-gradient(180deg, #76ff03 0%, #00e676 25%, #76ff03 50%, #c6ff00 75%, #76ff03 100%) border-box',
    boxShadow: '0 0 70px rgba(118, 255, 3, 1), inset 0 0 40px rgba(0, 230, 118, 0.5)',
  },
  diamond: {
    border: '8px solid transparent',
    background: 'linear-gradient(#000, #000) padding-box, linear-gradient(45deg, #e3f2fd 0%, #90caf9 25%, #e1f5fe 50%, #90caf9 75%, #e3f2fd 100%) border-box',
    boxShadow: '0 0 80px rgba(144, 202, 249, 1.2), inset 0 0 50px rgba(227, 242, 253, 0.6)',
  },
  lightning: {
    border: '6px solid transparent',
    background: 'linear-gradient(#000, #000) padding-box, linear-gradient(90deg, #ffd700 0%, #4169e1 50%, #ffd700 100%) border-box',
    boxShadow: '0 0 70px rgba(255, 215, 0, 0.9), 0 0 100px rgba(65, 105, 225, 0.7)',
  },
  lava: {
    border: '7px solid transparent',
    background: 'linear-gradient(#000, #000) padding-box, linear-gradient(45deg, #dc2626 0%, #ea580c 25%, #fbbf24 50%, #ea580c 75%, #dc2626 100%) border-box',
    boxShadow: '0 0 80px rgba(234, 88, 12, 1.2), inset 0 0 45px rgba(220, 38, 38, 0.6)',
  },
  shadow: {
    border: '6px solid transparent',
    background: 'linear-gradient(#000, #000) padding-box, linear-gradient(180deg, #1f2937 0%, #6b21a8 50%, #000000 100%) border-box',
    boxShadow: '0 0 60px rgba(107, 33, 168, 0.8), inset 0 0 40px rgba(31, 41, 55, 0.5)',
  },
  galaxy: {
    border: '7px solid transparent',
    background: 'linear-gradient(#000, #000) padding-box, linear-gradient(135deg, #312e81 0%, #7c3aed 25%, #ec4899 50%, #7c3aed 75%, #312e81 100%) border-box',
    boxShadow: '0 0 80px rgba(124, 58, 237, 1), inset 0 0 45px rgba(236, 72, 153, 0.5)',
  },
  blood: {
    border: '7px solid transparent',
    background: 'linear-gradient(#000, #000) padding-box, linear-gradient(90deg, #7f1d1d 0%, #dc2626 25%, #f97316 50%, #dc2626 75%, #7f1d1d 100%) border-box',
    boxShadow: '0 0 70px rgba(220, 38, 38, 1.1), inset 0 0 40px rgba(127, 29, 29, 0.6)',
  },
  ocean: {
    border: '6px solid transparent',
    background: 'linear-gradient(#000, #000) padding-box, linear-gradient(135deg, #0c4a6e 0%, #0891b2 25%, #06b6d4 50%, #0891b2 75%, #0c4a6e 100%) border-box',
    boxShadow: '0 0 70px rgba(8, 145, 178, 1), inset 0 0 40px rgba(6, 182, 212, 0.5)',
  },
  phoenix: {
    border: '8px solid transparent',
    background: 'linear-gradient(#000, #000) padding-box, linear-gradient(45deg, #ea580c 0%, #dc2626 25%, #fbbf24 50%, #dc2626 75%, #ea580c 100%) border-box',
    boxShadow: '0 0 90px rgba(234, 88, 12, 1.3), inset 0 0 50px rgba(220, 38, 38, 0.6)',
  },
  dragon: {
    border: '8px solid transparent',
    background: 'linear-gradient(#000, #000) padding-box, linear-gradient(90deg, #15803d 0%, #059669 25%, #14b8a6 50%, #059669 75%, #15803d 100%) border-box',
    boxShadow: '0 0 80px rgba(5, 150, 105, 1.2), inset 0 0 45px rgba(20, 184, 166, 0.5)',
  },
  eternal: {
    border: '9px solid transparent',
    background: 'linear-gradient(#000, #000) padding-box, linear-gradient(135deg, #fbbf24 0%, #ea580c 25%, #fb7185 50%, #ea580c 75%, #fbbf24 100%) border-box',
    boxShadow: '0 0 100px rgba(251, 191, 36, 1.4), inset 0 0 55px rgba(234, 88, 12, 0.7)',
  },
  // Daily Login Exclusive Frames
  daily_aurora: {
    border: '5px solid transparent',
    background: 'linear-gradient(#000, #000) padding-box, linear-gradient(135deg, #00ffa3 0%, #03e9f4 33%, #a855f7 66%, #00ffa3 100%) border-box',
    boxShadow: '0 0 60px rgba(0,255,163,0.6), 0 0 100px rgba(168,85,247,0.4)',
  },
  daily_cosmos: {
    border: '6px solid transparent',
    background: 'linear-gradient(#000, #000) padding-box, linear-gradient(180deg, #312e81 0%, #6366f1 25%, #a855f7 50%, #ec4899 75%, #312e81 100%) border-box',
    boxShadow: '0 0 70px rgba(99,102,241,0.8), 0 0 110px rgba(236,72,153,0.5)',
  },
  daily_phoenix: {
    border: '7px solid transparent',
    background: 'linear-gradient(#000, #000) padding-box, linear-gradient(45deg, #f59e0b 0%, #ef4444 25%, #fbbf24 50%, #ef4444 75%, #f59e0b 100%) border-box',
    boxShadow: '0 0 80px rgba(245,158,11,1), 0 0 120px rgba(239,68,68,0.7)',
  },
  // Donor Exclusive Video Frames
  elite: {
    border: '8px solid transparent',
    background: 'linear-gradient(#000, #000) padding-box, linear-gradient(45deg, #fde047 0%, #fbbf24 25%, #f59e0b 50%, #fbbf24 75%, #fde047 100%) border-box',
    boxShadow: '0 0 100px rgba(251, 191, 36, 1.5), inset 0 0 60px rgba(253, 224, 71, 0.8)',
  },
  vip_gold: {
    border: '10px solid transparent',
    background: 'linear-gradient(#000, #000) padding-box, linear-gradient(135deg, #fef3c7 0%, #fbbf24 25%, #f59e0b 50%, #fbbf24 75%, #fef3c7 100%) border-box',
    boxShadow: '0 0 120px rgba(251, 191, 36, 2), 0 0 200px rgba(245, 158, 11, 1), inset 0 0 70px rgba(254, 243, 199, 0.9)',
  },
};

export default function VideoFrameWrapper({ frameId = 'none', children, className = '' }) {
  const frameStyle = FRAME_STYLES[frameId] || FRAME_STYLES.none;
  
  if (frameId === 'none' || !frameStyle.border) {
    return <div className={className}>{children}</div>;
  }

  // Determine animation type based on frame
  const getAnimationType = () => {
    if (['aurora', 'plasma', 'neon', 'lightning'].includes(frameId)) {
      return 'borderGlowFast';
    }
    if (['fire', 'inferno', 'phoenix', 'lava'].includes(frameId)) {
      return 'borderFlicker';
    }
    if (['diamond', 'crystal', 'celestial', 'elite', 'vip_gold'].includes(frameId)) {
      return 'borderShimmer';
    }
    if (['void', 'shadow', 'galaxy'].includes(frameId)) {
      return 'borderPulse';
    }
    return 'borderRotate';
  };

  const animationType = getAnimationType();

  return (
    <>
      {/* Global Page Effects */}
      <div className="fixed inset-0 pointer-events-none z-[1]">
        {(frameId === 'gold' || frameId === 'elite' || frameId === 'vip_gold') && (
          <>
            {[...Array(frameId === 'vip_gold' ? 40 : 20)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-2 h-2 ${frameId === 'vip_gold' ? 'bg-amber-300' : 'bg-yellow-400'} rounded-full`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -100, 0],
                  opacity: [0, 1, 0],
                  scale: [0, frameId === 'vip_gold' ? 2 : 1.5, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </>
        )}
        
        {frameId === 'neon' && (
          <>
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-20 bg-gradient-to-b from-pink-500 to-transparent"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-20px`,
                }}
                animate={{
                  y: ['0vh', '110vh'],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                  ease: 'linear',
                }}
              />
            ))}
          </>
        )}
        
        {(frameId === 'fire' || frameId === 'inferno' || frameId === 'phoenix' || frameId === 'lava') && (
          <>
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 bg-orange-500 rounded-full blur-sm"
                style={{
                  left: `${Math.random() * 100}%`,
                  bottom: `-10px`,
                }}
                animate={{
                  y: [0, -window.innerHeight - 50],
                  opacity: [1, 0],
                  scale: [1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: 'easeOut',
                }}
              />
            ))}
          </>
        )}
        
        {(frameId === 'matrix' || frameId === 'toxic') && (
          <>
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-px bg-green-400"
                style={{
                  left: 0,
                  right: 0,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                  repeatDelay: Math.random() * 2,
                }}
              />
            ))}
          </>
        )}
        
        {(frameId === 'cosmic' || frameId === 'celestial' || frameId === 'galaxy') && (
          <>
            {[...Array(25)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  background: `hsl(${Math.random() * 360}, 100%, 60%)`,
                }}
                animate={{
                  scale: [0, 2, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                }}
              />
            ))}
          </>
        )}
        
        {(frameId === 'diamond' || frameId === 'crystal') && (
          <>
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                }}
                animate={{
                  opacity: [0, 1, 0],
                  rotate: [0, 360],
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: 3 + Math.random(),
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </>
        )}
        
        {(frameId === 'lightning' || frameId === 'aurora') && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                style={{
                  top: `${i * 12.5}%`,
                }}
                animate={{
                  opacity: [0.2, 1, 0.2],
                  scaleX: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </>
        )}
        
        {(frameId === 'emerald' || frameId === 'dragon') && (
          <>
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-4 h-4 text-green-400 opacity-70"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-20px`,
                }}
                animate={{
                  y: ['0vh', '110vh'],
                  x: [0, Math.random() * 100 - 50, 0],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 5 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: 'easeInOut',
                }}
              >
                🍃
              </motion.div>
            ))}
          </>
        )}
      </div>

      {/* Frame Border around content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`relative rounded-xl overflow-hidden ${className}`}
        style={{
          ...frameStyle,
          borderRadius: '16px',
          backgroundSize: ['aurora', 'plasma', 'lightning'].includes(frameId) ? '400% 400%' : '200% 200%',
          animation: `${animationType} ${['aurora', 'lightning'].includes(frameId) ? '3s' : '4s'} ease-in-out infinite`,
        }}
      >
        <style>{`
        @keyframes borderGlowFast {
          0%, 100% { background-position: 0% 50%; filter: brightness(1); }
          25% { background-position: 50% 0%; filter: brightness(1.2); }
          50% { background-position: 100% 50%; filter: brightness(1); }
          75% { background-position: 50% 100%; filter: brightness(1.2); }
        }
        @keyframes borderFlicker {
          0%, 100% { background-position: 0% 50%; filter: brightness(1); }
          10% { filter: brightness(1.3); }
          20% { filter: brightness(0.9); }
          30% { filter: brightness(1.2); }
          50% { background-position: 100% 50%; filter: brightness(1); }
          60% { filter: brightness(1.1); }
          80% { filter: brightness(1.3); }
        }
        @keyframes borderShimmer {
          0%, 100% { background-position: 0% 50%; filter: brightness(1.1); }
          50% { background-position: 100% 50%; filter: brightness(1.4); }
        }
        @keyframes borderPulse {
          0%, 100% { background-position: 0% 50%; transform: scale(1); }
          50% { background-position: 100% 50%; transform: scale(1.01); }
        }
        @keyframes borderRotate {
          0%, 100% { background-position: 0% 50%; }
          25% { background-position: 100% 0%; }
          50% { background-position: 100% 100%; }
          75% { background-position: 0% 100%; }
        }
        `}</style>
        {children}
      </motion.div>
    </>
  );
}