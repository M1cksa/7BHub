import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Play, Film, Gamepad2, Users } from 'lucide-react';

const NAV_PILLS = [
  { icon: Play,     label: 'Videos',    href: 'Home',     color: '#06b6d4' },
  { icon: Film,     label: 'Shorts',    href: 'Shorts',   color: '#f43f5e' },
  { icon: Gamepad2, label: 'Games',     href: 'NeonDash', color: '#a855f7' },
  { icon: Users,    label: 'Community', href: 'Clans',    color: '#22c55e' },
];

export default function HubHeroSection({ user }) {
  const greeting = user?.audience_group === 'girl'
    ? 'Hey Girl ✨'
    : user?.audience_group === 'boy'
    ? 'Was geht! 🚀'
    : user?.username
    ? `Hey, ${user.username}`
    : 'Willkommen';

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative rounded-2xl sm:rounded-3xl overflow-hidden px-5 py-5 sm:px-7 sm:py-6"
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.4) 100%)',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div className="relative z-10">
        {/* Greeting row */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight tracking-tight">{greeting}</h1>
            <p className="text-white/30 text-[13px] mt-1 font-medium">Videos, Games & Community</p>
          </div>
        </div>

        {/* Quick nav pills */}
        <div className="grid grid-cols-4 gap-2">
          {NAV_PILLS.map((item) => (
            <Link key={item.href} to={createPageUrl(item.href)}>
              <motion.div
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl cursor-pointer transition-colors"
                style={{
                  background: `${item.color}08`,
                  border: `1px solid ${item.color}15`,
                }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${item.color}14` }}>
                  <item.icon className="w-[18px] h-[18px]" style={{ color: item.color }} />
                </div>
                <span className="text-white/70 font-semibold text-[11px] leading-none">{item.label}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
}