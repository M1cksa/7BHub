import { motion } from 'framer-motion';

const categoryData = {
  gaming: { 
    label: 'Gaming', 
    color: 'from-purple-500 to-indigo-600'
  },
  music: { 
    label: 'Musik', 
    color: 'from-pink-500 to-rose-600'
  },
  education: { 
    label: 'Bildung', 
    color: 'from-emerald-500 to-teal-600'
  },
  entertainment: { 
    label: 'Unterhaltung', 
    color: 'from-amber-500 to-orange-600'
  },
  sports: { 
    label: 'Sport', 
    color: 'from-green-500 to-lime-600'
  },
  tech: { 
    label: 'Technologie', 
    color: 'from-cyan-500 to-blue-600'
  },
  lifestyle: { 
    label: 'Lifestyle', 
    color: 'from-fuchsia-500 to-purple-600'
  },
  art: { 
    label: 'Kunst', 
    color: 'from-violet-500 to-indigo-600'
  },
};

export default function CategoryCard({ category, index = 0, onClick, isActive }) {
  const data = categoryData[category] || { label: category, color: 'from-gray-500 to-slate-600' };

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        relative px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all overflow-hidden group
        ${isActive 
          ? 'text-white shadow-[0_0_20px_rgba(255,255,255,0.3)] border border-white/20' 
          : 'bg-white/5 border border-white/5 text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20'}
      `}
    >
      {/* Active/Liquid Background */}
      {isActive && (
        <div className={`absolute inset-0 bg-gradient-to-r ${data.color} opacity-80`} />
      )}
      
      {/* Glass reflection for non-active */}
      {!isActive && (
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      )}

      <span className="relative z-10 flex items-center gap-2">
        {data.label}
      </span>
      
      {/* Shine effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </motion.button>
  );
}