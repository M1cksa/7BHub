import React from 'react';
import { motion } from 'framer-motion';
import { Coins, Lock, Check, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ShopCard({ 
  item, 
  isOwned, 
  isEquipped, 
  onBuy, 
  onEquip, 
  userTokens = 0,
  type = 'default',
  children 
}) {
  const canAfford = userTokens >= item.price;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group relative"
    >
      {/* Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-75 blur-lg transition-all duration-500" />
      
      <div className={`relative glass-card rounded-3xl overflow-hidden border ${
        isEquipped 
          ? 'border-cyan-500 shadow-2xl shadow-cyan-500/30' 
          : 'border-white/10'
      }`}>
        {/* Equipped Badge */}
        {isEquipped && (
          <div className="absolute top-4 right-4 z-10 px-3 py-1.5 bg-cyan-500 rounded-full text-white text-xs font-bold flex items-center gap-1 shadow-lg">
            <Zap className="w-3 h-3" />
            Aktiv
          </div>
        )}

        {/* Preview Area */}
        <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
          {children}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title & Icon */}
          <div className="flex items-start gap-3 mb-3">
            <span className="text-4xl">{item.icon}</span>
            <div className="flex-1">
              <h3 className="text-xl font-black text-white mb-1">{item.name}</h3>
              <p className="text-white/50 text-sm line-clamp-2">{item.description}</p>
            </div>
          </div>

          {/* Price & Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              {isOwned ? (
                <span className="text-green-400 font-bold text-sm flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  Besitzt
                </span>
              ) : item.price === 0 ? (
                <span className="text-cyan-400 font-bold">GRATIS</span>
              ) : (
                <>
                  <span className="text-2xl font-black text-white">{item.price}</span>
                  <Coins className="w-5 h-5 text-amber-400" />
                </>
              )}
            </div>

            {isOwned ? (
              <Button
                onClick={onEquip}
                disabled={isEquipped}
                size="sm"
                className={`rounded-xl font-bold ${
                  isEquipped 
                    ? 'bg-white/5 text-white/30 cursor-not-allowed' 
                    : 'bg-white text-black hover:bg-white/90'
                }`}
              >
                {isEquipped ? 'Aktiv' : 'Ausrüsten'}
              </Button>
            ) : (
              <Button
                onClick={onBuy}
                disabled={!canAfford && item.price > 0}
                size="sm"
                className={`rounded-xl font-bold ${
                  !canAfford && item.price > 0
                    ? 'bg-white/5 text-white/30 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white'
                }`}
              >
                {!canAfford && item.price > 0 ? (
                  <Lock className="w-4 h-4" />
                ) : item.price === 0 ? (
                  'Aktivieren'
                ) : (
                  'Kaufen'
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}