import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfileAnimation({ animationType = 'none', badgeType = 'none' }) {
  const KNOWN_ANIMATIONS = [
    'confetti','sparkles','hearts','fireworks','snow','stars','magic','money',
    'bubbles','butterflies','lightning','sakura','leaves','roses','emojis',
    'thunder','galaxies','dragons','meteors','portals','aurora_dance','cosmic_dust',
    'phoenix_rise','golden_rain','crown_parade','diamond_shower','hub_2_0',
    'glitch_anim','matrix_rain','cosmic','void','rift_sparkle','neon_aura',
    'prisma_burst','genesis_shimmer','cosmic_stars','echo_pulse','ascension_wings',
    'reality_warp','reality_bend_ultra','nexus_rifts','absolute_coronation'
  ];

  const BADGE_ANIM_MAP = {
    // Pokemon Badges -> now continuous background animations
    '69a2121344c124984f79c42e': 'lightning',
    '69a2121344c124984f79c42f': 'fireworks',
    '69a2121344c124984f79c430': 'leaves',
    '69a2121344c124984f79c431': 'bubbles',
    '69a2121344c124984f79c432': 'cosmic_dust',
    '69a2121344c124984f79c433': 'magic',
    '69a2121344c124984f79c445': 'snow',
    '69a2121344c124984f79c446': 'dragons',
    '69a2121344c124984f79c447': 'portals',
    '69a2121344c124984f79c448': 'aurora_dance',

    // Shop Pokemon
    '69a2121344c124984f79c43d': 'lightning',
    '69a2121344c124984f79c43e': 'sakura',
    '69a2121344c124984f79c43f': 'phoenix_rise',
    '69a2121344c124984f79c440': 'portals',
    '69a2121344c124984f79c441': 'cosmic_dust',

    // Battle Pass Badges -> now continuous background animations
    'bp_s1_pixel_heart': 'hearts',
    'bp_s1_glitch': 'glitch_anim',
    'bp_s1_hacker': 'matrix_rain',
    'bp_s1_veteran': 'golden_rain',
    'bp_s1_cyborg': 'thunder',
    'bp_s1_hologram': 'diamond_shower',

    // Pro Pass Badges
    'neon_voyager': 'cosmic_dust',
    'celestial_one': 'stars',
    'reality_bender': 'void',
    'absolute_crowned': 'crown_parade',
  };

  const resolvedAnim = KNOWN_ANIMATIONS.includes(animationType) 
    ? animationType 
    : (animationType && animationType !== 'none' ? 'sparkles' : null);
    
  const resolvedBadge = BADGE_ANIM_MAP[badgeType] || null;

  // We show the badge animation if it exists, otherwise the profile animation
  const activeEffects = [resolvedAnim, resolvedBadge].filter(Boolean);

  if (activeEffects.length === 0) return null;

  const animations = {
    confetti: (
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: -20,
              rotate: 0,
              scale: 1
            }}
            animate={{ 
              y: window.innerHeight + 100,
              rotate: Math.random() * 720,
              scale: [1, 1.2, 0.8]
            }}
            transition={{ 
              duration: 2 + Math.random() * 2,
              ease: "easeIn"
            }}
            className={`absolute w-2 h-2 ${['bg-pink-500', 'bg-cyan-500', 'bg-yellow-500', 'bg-purple-500', 'bg-green-500'][i % 5]}`}
            style={{ left: Math.random() * 100 + '%' }}
          />
        ))}
      </div>
    ),

    sparkles: (
      <div className="fixed inset-0 pointer-events-none z-50">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0,
              scale: 0
            }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0]
            }}
            transition={{ 
              duration: 1.5,
              delay: Math.random() * 1,
              repeat: 2
            }}
            className="absolute text-2xl"
          >
            ✨
          </motion.div>
        ))}
      </div>
    ),

    hearts: (
      <div className="fixed inset-0 pointer-events-none z-50">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: window.innerWidth / 2,
              y: window.innerHeight,
              opacity: 1,
              scale: 0
            }}
            animate={{ 
              x: window.innerWidth / 2 + (Math.random() - 0.5) * 400,
              y: -100,
              opacity: [0, 1, 1, 0],
              scale: [0, 1, 1, 0.5]
            }}
            transition={{ 
              duration: 3,
              delay: i * 0.15
            }}
            className="absolute text-4xl"
          >
            ❤️
          </motion.div>
        ))}
      </div>
    ),

    fireworks: (
      <div className="fixed inset-0 pointer-events-none z-50">
        {[...Array(5)].map((_, i) => (
          <div key={i}>
            {[...Array(12)].map((_, j) => {
              const angle = (j / 12) * Math.PI * 2;
              return (
                <motion.div
                  key={`${i}-${j}`}
                  initial={{ 
                    x: window.innerWidth / 2,
                    y: window.innerHeight / 2,
                    opacity: 1
                  }}
                  animate={{ 
                    x: window.innerWidth / 2 + Math.cos(angle) * 200,
                    y: window.innerHeight / 2 + Math.sin(angle) * 200,
                    opacity: 0
                  }}
                  transition={{ 
                    duration: 1.5,
                    delay: i * 0.4
                  }}
                  className="absolute w-3 h-3 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full"
                />
              );
            })}
          </div>
        ))}
      </div>
    ),

    snow: (
      <div className="fixed inset-0 pointer-events-none z-50">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: -20,
              opacity: 1
            }}
            animate={{ 
              y: window.innerHeight + 20,
              x: Math.random() * window.innerWidth
            }}
            transition={{ 
              duration: 3 + Math.random() * 2,
              ease: "linear"
            }}
            className="absolute text-xl"
          >
            ❄️
          </motion.div>
        ))}
      </div>
    ),

    stars: (
      <div className="fixed inset-0 pointer-events-none z-50">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: window.innerWidth / 2,
              y: window.innerHeight / 2,
              opacity: 0,
              scale: 0
            }}
            animate={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0]
            }}
            transition={{ 
              duration: 2,
              delay: Math.random() * 0.5
            }}
            className="absolute text-3xl"
          >
            ⭐
          </motion.div>
        ))}
      </div>
    ),

    magic: (
      <div className="fixed inset-0 pointer-events-none z-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2 }}
          className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-cyan-500/20"
        />
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 20,
              rotate: 0
            }}
            animate={{ 
              y: -50,
              rotate: 360,
              x: Math.random() * window.innerWidth
            }}
            transition={{ 
              duration: 3,
              delay: Math.random()
            }}
            className="absolute text-2xl"
          >
            🪄
          </motion.div>
        ))}
      </div>
    ),

    money: (
      <div className="fixed inset-0 pointer-events-none z-50">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: -20,
              rotate: 0
            }}
            animate={{ 
              y: window.innerHeight + 20,
              rotate: Math.random() * 720
            }}
            transition={{ 
              duration: 2.5 + Math.random(),
              ease: "easeIn"
            }}
            className="absolute text-3xl"
          >
            💰
          </motion.div>
        ))}
      </div>
    ),

    bubbles: (
      <div className="fixed inset-0 pointer-events-none z-50">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 20,
              scale: 0.5 + Math.random() * 0.5
            }}
            animate={{ 
              y: -100,
              x: Math.random() * window.innerWidth
            }}
            transition={{ 
              duration: 4 + Math.random() * 2,
              ease: "easeOut"
            }}
            className="absolute text-2xl opacity-70"
          >
            🫧
          </motion.div>
        ))}
      </div>
    ),

    butterflies: (
      <div className="fixed inset-0 pointer-events-none z-50">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: -50,
              y: Math.random() * window.innerHeight
            }}
            animate={{ 
              x: window.innerWidth + 50,
              y: [
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight
              ]
            }}
            transition={{ 
              duration: 5 + Math.random() * 3,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
            className="absolute text-3xl"
          >
            🦋
          </motion.div>
        ))}
      </div>
    ),

    lightning: (
      <div className="fixed inset-0 pointer-events-none z-50">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: -20,
              opacity: 0
            }}
            animate={{ 
              y: window.innerHeight,
              opacity: [0, 1, 1, 0]
            }}
            transition={{ 
              duration: 0.3,
              delay: i * 0.4,
              ease: "linear"
            }}
            className="absolute text-5xl"
          >
            ⚡
          </motion.div>
        ))}
      </div>
    ),

    sakura: (
      <div className="fixed inset-0 pointer-events-none z-50">
        {[...Array(35)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: -20,
              rotate: 0
            }}
            animate={{ 
              y: window.innerHeight + 20,
              x: Math.random() * window.innerWidth,
              rotate: Math.random() * 360
            }}
            transition={{ 
              duration: 4 + Math.random() * 2,
              ease: "easeInOut"
            }}
            className="absolute text-xl"
          >
            🌸
          </motion.div>
        ))}
      </div>
    ),

    leaves: (
      <div className="fixed inset-0 pointer-events-none z-50">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: -20,
              rotate: 0
            }}
            animate={{ 
              y: window.innerHeight + 20,
              x: Math.random() * window.innerWidth,
              rotate: Math.random() * 720
            }}
            transition={{ 
              duration: 3.5 + Math.random() * 2,
              ease: "easeIn"
            }}
            className="absolute text-2xl"
          >
            🍂
          </motion.div>
        ))}
      </div>
    ),

    roses: (
      <div className="fixed inset-0 pointer-events-none z-50">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: -20,
              rotate: 0,
              opacity: 1
            }}
            animate={{ 
              y: window.innerHeight + 20,
              rotate: Math.random() * 360,
              opacity: [1, 1, 0.5]
            }}
            transition={{ 
              duration: 3 + Math.random() * 1.5,
              ease: "easeIn"
            }}
            className="absolute text-3xl"
          >
            🌹
          </motion.div>
        ))}
      </div>
    ),

    emojis: (
      <div className="fixed inset-0 pointer-events-none z-50">
        {[...Array(40)].map((_, i) => {
          const emojis = ['😎', '🤩', '🔥', '💯', '✨', '🎉', '💪', '🚀'];
          return (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: 0,
                rotate: 0
              }}
              animate={{ 
                scale: [0, 1.5, 1],
                rotate: Math.random() * 720,
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight
              }}
              transition={{ 
                duration: 2,
                delay: Math.random() * 1.5
              }}
              className="absolute text-3xl"
            >
              {emojis[i % emojis.length]}
            </motion.div>
          );
        })}
      </div>
    ),

    thunder: (
      <div className="fixed inset-0 pointer-events-none z-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0, 0.3, 0] }}
          transition={{ duration: 2, times: [0, 0.1, 0.2, 0.5, 0.6] }}
          className="absolute inset-0 bg-white"
        />
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: -50,
              opacity: 0
            }}
            animate={{ 
              y: window.innerHeight / 2,
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 0.5,
              delay: i * 0.4,
              ease: "easeIn"
            }}
            className="absolute text-6xl"
          >
            ⛈️
          </motion.div>
        ))}
      </div>
    ),

    galaxies: (
      <div className="fixed inset-0 pointer-events-none z-50">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: window.innerWidth / 2,
              y: window.innerHeight / 2,
              scale: 0,
              rotate: 0,
              opacity: 0
            }}
            animate={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: [0, 1.5, 1],
              rotate: 360,
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 3,
              delay: i * 0.3,
              ease: "easeOut"
            }}
            className="absolute text-5xl"
          >
            🌌
          </motion.div>
        ))}
      </div>
    ),

    dragons: (
      <div className="fixed inset-0 pointer-events-none z-50">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: -100,
              y: Math.random() * window.innerHeight,
              scale: 1
            }}
            animate={{ 
              x: window.innerWidth + 100,
              y: [
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight
              ],
              scale: [1, 1.3, 1]
            }}
            transition={{ 
              duration: 4,
              delay: i * 0.5,
              ease: "easeInOut"
            }}
            className="absolute text-6xl"
          >
            🐉
          </motion.div>
        ))}
      </div>
    ),

    meteors: (
      <div className="fixed inset-0 pointer-events-none z-50">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: -50,
              rotate: 45,
              opacity: 1
            }}
            animate={{ 
              x: Math.random() * window.innerWidth - 200,
              y: window.innerHeight + 50,
              opacity: [1, 1, 0]
            }}
            transition={{ 
              duration: 1.5,
              delay: i * 0.3,
              ease: "easeIn"
            }}
            className="absolute text-4xl"
          >
            ☄️
          </motion.div>
        ))}
      </div>
    ),

    portals: (
      <div className="fixed inset-0 pointer-events-none z-50">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: 0,
              rotate: 0,
              opacity: 0
            }}
            animate={{ 
              scale: [0, 2, 0],
              rotate: [0, 180, 360],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 2.5,
              delay: i * 0.4,
              ease: "easeInOut"
            }}
            className="absolute text-7xl"
          >
            🌀
          </motion.div>
        ))}
      </div>
    ),

    aurora_dance: (
      <div className="fixed inset-0 pointer-events-none z-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 0.4, 0.6, 0.4, 0],
          }}
          transition={{ duration: 3, ease: "easeInOut" }}
          className="absolute inset-0 bg-gradient-to-br from-green-400/30 via-cyan-400/30 to-purple-500/30"
        />
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 20,
              opacity: 0
            }}
            animate={{ 
              y: -50,
              opacity: [0, 1, 1, 0],
              x: Math.random() * window.innerWidth
            }}
            transition={{ 
              duration: 3,
              delay: Math.random() * 1.5
            }}
            className="absolute text-3xl"
          >
            🌠
          </motion.div>
        ))}
      </div>
    ),

    cosmic_dust: (
      <div className="fixed inset-0 pointer-events-none z-50">
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0,
              scale: 0
            }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0, Math.random() * 2, 0],
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight
            }}
            transition={{ 
              duration: 2 + Math.random(),
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
            className="absolute w-1 h-1 bg-cyan-300 rounded-full"
          />
        ))}
      </div>
    ),

    phoenix_rise: (
      <div className="fixed inset-0 pointer-events-none z-50">
        <motion.div
          initial={{ 
            x: window.innerWidth / 2,
            y: window.innerHeight,
            scale: 0,
            rotate: 0
          }}
          animate={{ 
            y: window.innerHeight / 2,
            scale: [0, 2, 1.5],
            rotate: [0, 20, -20, 0]
          }}
          transition={{ 
            duration: 2.5,
            ease: "easeOut"
          }}
          className="absolute text-9xl"
        >
          🔥
        </motion.div>
        {[...Array(30)].map((_, i) => {
          const angle = (i / 30) * Math.PI * 2;
          return (
            <motion.div
              key={i}
              initial={{ 
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
                opacity: 1
              }}
              animate={{ 
                x: window.innerWidth / 2 + Math.cos(angle) * 300,
                y: window.innerHeight / 2 + Math.sin(angle) * 300,
                opacity: 0,
                scale: [1, 0]
              }}
              transition={{ 
                duration: 1.5,
                delay: 0.5
              }}
              className="absolute w-3 h-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-full"
            />
          );
        })}
      </div>
    ),

    // Donor Exclusive Animations
    golden_rain: (
      <div className="fixed inset-0 pointer-events-none z-50">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: -50,
              rotate: 0,
              opacity: 1
            }}
            animate={{ 
              y: window.innerHeight + 50,
              rotate: Math.random() * 360,
              opacity: [1, 1, 0.5]
            }}
            transition={{ 
              duration: 3 + Math.random(),
              ease: "easeIn",
              delay: Math.random() * 2
            }}
            className="absolute text-4xl"
          >
            💰
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.2, 0] }}
          transition={{ duration: 3 }}
          className="absolute inset-0 bg-gradient-to-b from-amber-500/20 to-transparent"
        />
      </div>
    ),

    crown_parade: (
      <div className="fixed inset-0 pointer-events-none z-50">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: -100,
              y: (window.innerHeight / 15) * i,
              scale: 0,
              rotate: -45
            }}
            animate={{ 
              x: window.innerWidth + 100,
              scale: [0, 1.5, 1],
              rotate: [0, 360]
            }}
            transition={{ 
              duration: 4,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
            className="absolute text-5xl"
          >
            👑
          </motion.div>
        ))}
      </div>
    ),

    diamond_shower: (
      <div className="fixed inset-0 pointer-events-none z-50">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: -50,
              scale: 0,
              rotate: 0
            }}
            animate={{ 
              y: window.innerHeight + 50,
              scale: [0, 1, 0.8],
              rotate: Math.random() * 720,
              opacity: [1, 1, 0]
            }}
            transition={{ 
              duration: 2.5 + Math.random(),
              ease: "easeIn",
              delay: Math.random() * 2
            }}
            className="absolute text-3xl"
          >
            💎
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 3 }}
          className="absolute inset-0 bg-gradient-to-b from-cyan-400/20 via-blue-500/10 to-transparent"
        />
      </div>
    ),

    hub_2_0: (
      <div className="fixed inset-0 pointer-events-none z-50">
        {[...Array(60)].map((_, i) => {
          const colors = ['#06b6d4', '#7c3aed', '#d946ef', '#ffffff'];
          const angle = Math.random() * Math.PI * 2;
          const velocity = 200 + Math.random() * 300;
          return (
            <motion.div
              key={i}
              initial={{ 
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
                opacity: 1,
                scale: 1
              }}
              animate={{ 
                x: window.innerWidth / 2 + Math.cos(angle) * velocity,
                y: window.innerHeight / 2 + Math.sin(angle) * velocity,
                opacity: 0,
                scale: 0
              }}
              transition={{ 
                duration: 2,
                ease: "easeOut"
              }}
              className="absolute w-3 h-3 rounded-full"
              style={{ backgroundColor: colors[i % colors.length] }}
            />
          );
        })}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 2, 3] }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 drop-shadow-[0_0_20px_rgba(217,70,239,0.8)]"
        >
          2.0
        </motion.div>
      </div>
    ),

    glitch_anim: (
      <div className="fixed inset-0 pointer-events-none z-50">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0,
              scale: 1,
              skewX: 0
            }}
            animate={{ 
              opacity: [0, 1, 0, 1, 0],
              x: [null, Math.random() * window.innerWidth, null],
              skewX: [0, 20, -20, 0]
            }}
            transition={{ 
              duration: 0.5 + Math.random(),
              delay: Math.random() * 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="absolute text-5xl font-black text-fuchsia-500 mix-blend-screen"
            style={{ textShadow: '2px 0 cyan, -2px 0 red' }}
          >
            ERR_
          </motion.div>
        ))}
      </div>
    ),

    cosmic: (
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {[...Array(60)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, Math.random() * 1.5 + 0.5, 0], x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight }}
            transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 3, repeat: Infinity, repeatDelay: Math.random() * 2 }}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: ['#a855f7','#06b6d4','#ec4899','#fbbf24','#ffffff'][i % 5] }}
          />
        ))}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.15, 0.25, 0.15, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-cyan-900/20"
        />
      </div>
    ),

    void: (
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, scale: 0, rotate: 0, opacity: 0 }}
            animate={{ scale: [0, 3, 0], rotate: [0, 360], opacity: [0, 0.6, 0] }}
            transition={{ duration: 3 + Math.random() * 2, delay: i * 0.6, repeat: Infinity, repeatDelay: 1 }}
            className="absolute text-6xl"
          >
            🌀
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.2, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-transparent to-black/30"
        />
      </div>
    ),

    matrix_rain: (
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: (window.innerWidth / 30) * i,
              y: -100,
              opacity: 0.8
            }}
            animate={{ 
              y: window.innerHeight + 100,
            }}
            transition={{ 
              duration: 2 + Math.random() * 3,
              delay: Math.random() * 2,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute text-green-500 font-mono text-xl"
            style={{ textShadow: '0 0 5px #22c55e' }}
          >
            {Array.from({length: 10}).map((_, j) => (
              <div key={j} className={j === 9 ? 'text-white' : ''}>
                {String.fromCharCode(0x30A0 + Math.random() * 96)}
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    ),

    // Pro Pass Animations
    rift_sparkle: (
      <div className="fixed inset-0 pointer-events-none z-50">
        {[...Array(35)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight }}
            transition={{ duration: 2, delay: Math.random() * 3, repeat: Infinity }}
            className="absolute text-2xl"
          >
            ✨
          </motion.div>
        ))}
      </div>
    ),

    neon_aura: (
      <div className="fixed inset-0 pointer-events-none z-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 to-transparent"
        />
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: Math.random() * window.innerWidth, y: window.innerHeight + 20, opacity: 0 }}
            animate={{ y: -50, opacity: [0, 1, 0] }}
            transition={{ duration: 3, delay: Math.random() * 1.5, repeat: Infinity }}
            className="absolute text-3xl"
          >
            🌆
          </motion.div>
        ))}
      </div>
    ),

    prisma_burst: (
      <div className="fixed inset-0 pointer-events-none z-50">
        {[...Array(40)].map((_, i) => {
          const angle = (i / 40) * Math.PI * 2;
          return (
            <motion.div
              key={i}
              initial={{ x: window.innerWidth / 2, y: window.innerHeight / 2, scale: 0 }}
              animate={{ x: window.innerWidth / 2 + Math.cos(angle) * 250, y: window.innerHeight / 2 + Math.sin(angle) * 250, scale: [0, 1, 0], opacity: [1, 1, 0] }}
              transition={{ duration: 1.8, delay: Math.random() * 1.5, repeat: Infinity }}
              className="absolute w-2 h-2 rounded-full"
              style={{ backgroundColor: ['#06b6d4', '#ec4899', '#fbbf24', '#a855f7'][i % 4] }}
            />
          );
        })}
      </div>
    ),

    genesis_shimmer: (
      <div className="fixed inset-0 pointer-events-none z-50">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0], scale: [0, Math.random() * 1.5, 0] }}
            transition={{ duration: 2.5, delay: Math.random() * 2, repeat: Infinity }}
            className="absolute w-1 h-1 rounded-full"
            style={{ backgroundColor: '#a855f7' }}
          />
        ))}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.2, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-transparent"
        />
      </div>
    ),

    cosmic_stars: (
      <div className="fixed inset-0 pointer-events-none z-50">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, opacity: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
            transition={{ duration: 2, delay: Math.random() * 3, repeat: Infinity }}
            className="absolute text-2xl"
          >
            ⭐
          </motion.div>
        ))}
      </div>
    ),

    echo_pulse: (
      <div className="fixed inset-0 pointer-events-none z-50">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: window.innerWidth / 2, y: window.innerHeight / 2, scale: 0 }}
            animate={{ scale: [0, 3, 0], opacity: [1, 0.5, 0] }}
            transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
            className="absolute border-2 border-green-400 rounded-full"
            style={{ width: '80px', height: '80px', marginLeft: '-40px', marginTop: '-40px' }}
          />
        ))}
      </div>
    ),

    ascension_wings: (
      <div className="fixed inset-0 pointer-events-none z-50">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: Math.random() * window.innerWidth, y: window.innerHeight + 20, opacity: 0 }}
            animate={{ y: -100, opacity: [0, 1, 0], x: Math.random() * window.innerWidth }}
            transition={{ duration: 3.5, delay: Math.random() * 1.5, repeat: Infinity }}
            className="absolute text-4xl"
          >
            😇
          </motion.div>
        ))}
      </div>
    ),

    reality_warp: (
      <div className="fixed inset-0 pointer-events-none z-50">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, scale: 0, rotate: 0 }}
            animate={{ scale: [0, 2, 0], rotate: 360, opacity: [1, 0.5, 0] }}
            transition={{ duration: 2.5, delay: i * 0.25, repeat: Infinity }}
            className="absolute text-5xl"
          >
            🌀
          </motion.div>
        ))}
      </div>
    ),

    reality_bend_ultra: (
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {[...Array(80)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, opacity: 0, scale: 0, hueRotate: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, Math.random() * 2, 0], x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight }}
            transition={{ duration: 3, delay: Math.random() * 3, repeat: Infinity }}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: ['#f43f5e', '#a855f7', '#06b6d4', '#fbbf24'][i % 4] }}
          />
        ))}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-purple-500/10 to-cyan-500/10"
        />
      </div>
    ),

    nexus_rifts: (
      <div className="fixed inset-0 pointer-events-none z-50">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, scale: 0 }}
            animate={{ scale: [0, 1.5, 0], rotate: [0, 180, 360], opacity: [0, 1, 0] }}
            transition={{ duration: 2.8, delay: i * 0.5, repeat: Infinity }}
            className="absolute text-6xl"
          >
            🌀
          </motion.div>
        ))}
      </div>
    ),

    absolute_coronation: (
      <div className="fixed inset-0 pointer-events-none z-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.4, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-br from-yellow-500/30 via-orange-500/20 to-transparent"
        />
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: Math.random() * window.innerWidth, y: window.innerHeight + 20, scale: 0 }}
            animate={{ y: -100, scale: [0, 1.5, 0], opacity: [1, 1, 0] }}
            transition={{ duration: 3.5, delay: Math.random() * 2, repeat: Infinity }}
            className="absolute text-4xl"
          >
            ✨
          </motion.div>
        ))}
      </div>
    ),
  };

  return (
    <>
      {activeEffects.map(effect => (
        <React.Fragment key={effect}>
          {animations[effect]}
        </React.Fragment>
      ))}
    </>
  );
}