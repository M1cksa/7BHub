import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Zap, Trophy, Crown, Film, MessageCircle, ShoppingBag } from 'lucide-react';

const HIGHLIGHTS = [
  { icon: Zap,           title: 'Neon Dash',    sub: 'Tokens verdienen',  href: 'NeonDash',   color: '#06b6d4' },
  { icon: Trophy,        title: 'Battle Pass',  sub: 'Level & Rewards',   href: 'BattlePass', color: '#d946ef' },
  { icon: Crown,         title: 'Hall of Fame',  sub: 'Top Spieler',      href: 'HallOfFame', color: '#fbbf24' },
  { icon: Film,          title: 'Shorts',        sub: 'Kurze Videos',     href: 'Shorts',     color: '#ef4444' },
  { icon: MessageCircle, title: 'Chats',         sub: 'Gruppen & Clans',  href: 'GroupChats', color: '#22c55e' },
  { icon: ShoppingBag,   title: 'Shop',          sub: 'Kosmetik & mehr',  href: 'Shop',       color: '#a855f7' },
];

export default function PlatformHighlights({ lw = false }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/20 mb-2.5">Entdecken</p>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {HIGHLIGHTS.map((item, i) => (
          <Link key={item.href} to={createPageUrl(item.href)}>
            <motion.div
              initial={lw ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              whileTap={{ scale: 0.96 }}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl cursor-pointer text-center transition-colors"
              style={{
                background: `${item.color}06`,
                border: `1px solid ${item.color}0d`,
              }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${item.color}10` }}>
                <item.icon className="w-4 h-4" style={{ color: item.color }} />
              </div>
              <div>
                <p className="text-white/70 font-semibold text-[11px] leading-tight">{item.title}</p>
                <p className="text-white/20 text-[9px] leading-tight mt-0.5">{item.sub}</p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}