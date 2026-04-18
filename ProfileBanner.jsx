import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const BANNER_ANIMATIONS = {
  none: () => null,
  
  galaxy: () => {
    const stars = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 3 + 2,
    }));

    return (
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-950">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    );
  },

  aurora: () => (
    <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      <motion.div
        className="absolute inset-0 opacity-60"
        style={{
          background: 'linear-gradient(90deg, #00ff87, #60efff, #b967ff, #ff6b9d)',
          backgroundSize: '400% 400%',
        }}
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  ),

  cyberpunk: () => (
    <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900 to-cyan-900">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-px bg-cyan-400"
          style={{
            left: 0,
            right: 0,
            top: `${(i * 5) + 10}%`,
            opacity: 0.2,
          }}
          animate={{
            opacity: [0.1, 0.4, 0.1],
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  ),

  ocean: () => (
    <div className="absolute inset-0 bg-gradient-to-b from-blue-950 via-blue-800 to-cyan-900">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at ${30 + i * 15}% 50%, rgba(6, 182, 212, 0.3), transparent)`,
          }}
          animate={{
            y: ['-20%', '120%'],
          }}
          transition={{
            duration: 6 + i,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 1.5,
          }}
        />
      ))}
    </div>
  ),

  fire: () => (
    <div className="absolute inset-0 bg-gradient-to-t from-black via-red-950 to-orange-900">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute bottom-0 w-4 rounded-full"
          style={{
            left: `${i * 3.5}%`,
            background: 'linear-gradient(to top, #ff0000, #ff7300, #ffff00)',
            height: `${30 + Math.random() * 40}%`,
          }}
          animate={{
            height: [`${30 + Math.random() * 40}%`, `${50 + Math.random() * 30}%`, `${30 + Math.random() * 40}%`],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 0.5 + Math.random(),
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  ),

  matrix: () => {
    const columns = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: i * 3.5,
      delay: Math.random() * 2,
    }));

    return (
      <div className="absolute inset-0 bg-black">
        {columns.map((col) => (
          <motion.div
            key={col.id}
            className="absolute top-0 text-green-400 text-xs font-mono opacity-70"
            style={{ left: `${col.x}%` }}
            animate={{
              y: ['-100%', '100%'],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: col.delay,
              ease: 'linear',
            }}
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i}>{String.fromCharCode(Math.random() * 94 + 33)}</div>
            ))}
          </motion.div>
        ))}
      </div>
    );
  },

  space: () => {
    const asteroids = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      size: 20 + Math.random() * 40,
      y: Math.random() * 100,
      duration: 5 + Math.random() * 5,
    }));

    return (
      <div className="absolute inset-0 bg-gradient-to-br from-black via-indigo-950 to-black">
        {asteroids.map((asteroid) => (
          <motion.div
            key={asteroid.id}
            className="absolute rounded-full bg-gray-700 border-2 border-gray-600"
            style={{
              width: asteroid.size,
              height: asteroid.size,
              top: `${asteroid.y}%`,
            }}
            animate={{
              x: ['-10%', '110%'],
              rotate: [0, 360],
            }}
            transition={{
              duration: asteroid.duration,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>
    );
  },

  sakura: () => {
    const petals = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 5 + Math.random() * 3,
    }));

    return (
      <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-pink-100 to-purple-200">
        {petals.map((petal) => (
          <motion.div
            key={petal.id}
            className="absolute text-3xl opacity-70"
            style={{ left: `${petal.x}%` }}
            animate={{
              y: ['-10%', '110%'],
              x: [`${petal.x}%`, `${petal.x + 10}%`, `${petal.x}%`],
              rotate: [0, 360],
            }}
            transition={{
              duration: petal.duration,
              repeat: Infinity,
              delay: petal.delay,
              ease: 'easeInOut',
            }}
          >
            🌸
          </motion.div>
        ))}
      </div>
    );
  },

  neon: () => (
    <div className="absolute inset-0 bg-black">
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          style={{
            background: `linear-gradient(${i * 60}deg, transparent, ${['#ff00ff', '#00ffff', '#ffff00'][i % 3]}, transparent)`,
            opacity: 0.2,
          }}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  ),

  dragon: () => (
    <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-orange-900 to-yellow-800">
      <motion.div
        className="absolute inset-0 opacity-40 text-9xl flex items-center justify-center"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        🐉
      </motion.div>
    </div>
  ),

  crystal: () => {
    const crystals = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 20 + Math.random() * 40,
    }));

    return (
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-950 via-blue-900 to-purple-950">
        {crystals.map((crystal) => (
          <motion.div
            key={crystal.id}
            className="absolute bg-cyan-400/30 backdrop-blur-sm"
            style={{
              left: `${crystal.x}%`,
              top: `${crystal.y}%`,
              width: crystal.size,
              height: crystal.size,
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    );
  },

  volcano: () => (
    <div className="absolute inset-0 bg-gradient-to-t from-black via-red-950 to-orange-900">
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute bottom-0 w-3 h-3 rounded-full bg-yellow-500"
          style={{
            left: `${45 + Math.random() * 10}%`,
          }}
          animate={{
            y: ['0%', '-800%'],
            x: [0, (Math.random() - 0.5) * 200],
            opacity: [1, 0],
            scale: [1, 0.5],
          }}
          transition={{
            duration: 2 + Math.random(),
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  ),
};

// Map Pokémon badge ShopItem IDs → banner style
const BADGE_BANNER_MAP = {
  '69a2121344c124984f79c42e': 'lightning_pika',   // Pikachu
  '69a2121344c124984f79c42f': 'fire',             // Glumanda
  '69a2121344c124984f79c430': 'forest_badge',     // Bisasam
  '69a2121344c124984f79c431': 'ocean',            // Schiggy
  '69a2121344c124984f79c432': 'psychic_badge',    // Mewtu
  '69a2121344c124984f79c433': 'aurora',           // Mew
  '69a2121344c124984f79c445': 'sakura',           // Togepi
  '69a2121344c124984f79c446': 'dragon',           // Landscha/Dragoran
  '69a2121344c124984f79c447': 'ocean',            // Lugia
  '69a2121344c124984f79c448': 'fire',             // Ho-Oh
};

const EXTRA_BANNER_ANIMATIONS = {
  lightning_pika: () => (
    <div className="absolute inset-0 bg-gradient-to-br from-yellow-900 via-yellow-700 to-amber-900">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url(https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png)', backgroundSize: '200px', backgroundRepeat: 'repeat', backgroundPosition: 'center' }} />
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div key={i} className="absolute text-4xl" style={{ left: `${Math.random()*90}%`, top: `${Math.random()*80}%` }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}>⚡</motion.div>
      ))}
    </div>
  ),
  forest_badge: () => (
    <div className="absolute inset-0 bg-gradient-to-br from-green-950 via-emerald-900 to-green-800">
      <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'url(https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png)', backgroundSize: '180px', backgroundRepeat: 'repeat', backgroundPosition: 'center' }} />
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div key={i} className="absolute text-2xl opacity-60" style={{ left: `${Math.random()*100}%`, top: '-5%' }}
          animate={{ y: ['0%', '120%'], rotate: [0, 360] }}
          transition={{ duration: 4 + Math.random()*2, repeat: Infinity, delay: Math.random()*3 }}>🌿</motion.div>
      ))}
    </div>
  ),
  psychic_badge: () => (
    <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-violet-900 to-indigo-950">
      <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'url(https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png)', backgroundSize: '220px', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }} />
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div key={i} className="absolute rounded-full bg-purple-400/30"
          style={{ left: `${Math.random()*80+10}%`, top: `${Math.random()*80+10}%`, width: 60+Math.random()*80, height: 60+Math.random()*80 }}
          animate={{ scale: [1, 2, 1], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }} />
      ))}
    </div>
  ),
};

export default function ProfileBanner({ bannerId = 'none', className = '' }) {
  // If bannerId is a Pokémon badge ID → map to a banner style
  const resolvedBannerId = BADGE_BANNER_MAP[bannerId] || bannerId;
  const BannerComponent = EXTRA_BANNER_ANIMATIONS[resolvedBannerId] || BANNER_ANIMATIONS[resolvedBannerId] || BANNER_ANIMATIONS.none;
  
  if (resolvedBannerId === 'none') {
    return (
      <div className={`h-48 md:h-72 bg-gradient-to-r from-violet-900 via-fuchsia-900 to-cyan-900 relative overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent" />
      </div>
    );
  }

  return (
    <div className={`h-48 md:h-72 relative overflow-hidden ${className}`}>
      {BannerComponent()}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
    </div>
  );
}