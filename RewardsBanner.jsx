import { Zap, Upload, Radio } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RewardsBanner({ type = 'upload' }) {
  const rewards = {
    upload: {
      icon: Upload,
      title: 'Verdiene Credits beim Upload',
      description: '+1.000 Credits für jedes Video, das du hochlädst',
      color: 'from-cyan-500 to-blue-500',
      borderColor: 'border-cyan-500/30'
    },
    live: {
      icon: Radio,
      title: 'Verdiene Credits beim Live-Stream',
      description: '+5 Credits pro Minute Live-Stream für deine Community',
      color: 'from-red-500 to-pink-500',
      borderColor: 'border-red-500/30'
    }
  };

  const reward = rewards[type];
  const Icon = reward.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl border ${reward.borderColor} bg-gradient-to-r ${reward.color} bg-opacity-5 backdrop-blur-sm p-6 md:p-8 mb-8`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      
      <div className="relative flex items-start gap-4 md:gap-6">
        <div className={`p-3 md:p-4 rounded-xl bg-gradient-to-br ${reward.color} text-white shrink-0`}>
          <Icon className="w-6 h-6 md:w-7 md:h-7" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg md:text-xl font-bold text-white mb-1">{reward.title}</h3>
          <p className="text-white/70 text-sm md:text-base">{reward.description}</p>
          
          <div className="mt-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-xs md:text-sm font-semibold text-yellow-400">Du wirst direkt belohnt!</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}