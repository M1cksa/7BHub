import React from 'react';
import { motion } from 'framer-motion';

export default function FloatingOrbs() {
  const orbs = [
    { color: 'from-cyan-500 to-blue-600', size: 'w-96 h-96', pos: 'top-20 -left-48', delay: 0 },
    { color: 'from-violet-500 to-purple-600', size: 'w-[500px] h-[500px]', pos: 'top-40 -right-64', delay: 2 },
    { color: 'from-pink-500 to-rose-600', size: 'w-80 h-80', pos: 'bottom-40 left-20', delay: 1 },
    { color: 'from-orange-500 to-red-600', size: 'w-[400px] h-[400px]', pos: 'bottom-20 right-32', delay: 3 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className={`absolute ${orb.pos} ${orb.size} bg-gradient-to-br ${orb.color} rounded-full blur-3xl opacity-20`}
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            delay: orb.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}