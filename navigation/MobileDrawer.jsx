import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { X, User, Coins, Flame, Upload, Settings, Shield, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

// Group nav items for the drawer
const DRAWER_GROUPS = [
  { label: 'Haupt', keys: ['Home', 'MyVideos', 'CommunityHub'] },
  { label: 'Spiele', keys: ['NeonDash', 'AstroBlitz', 'NeonRacer', 'PokemonGame'] },
  { label: 'Fortschritt', keys: ['BattlePass', 'ProPass', 'Leaderboard', 'Shop'] },
  { label: 'Social', keys: ['Clans', 'GroupChats', 'Friends', 'WatchPartyLobby'] },
  { label: 'Mehr', keys: ['Feedback', 'Help'] },
];

export default function MobileDrawer({ open, onClose, user, isGamer, navItems, isActive, onLogout }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] lg:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[70] lg:hidden rounded-t-[28px] flex flex-col"
            style={{
              maxHeight: '82vh',
              background: 'linear-gradient(180deg, #131318 0%, #0c0c10 100%)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderBottom: 'none',
            }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-8 h-1 rounded-full bg-white/10" />
            </div>

            <div className="overflow-y-auto flex-1 px-5" style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}>
              {/* User card */}
              {user && (
                <div className="mb-5 mt-2">
                  <Link to={createPageUrl('Profile')} onClick={onClose}>
                    <div className="flex items-center gap-3 p-4 rounded-2xl active:scale-[0.98] transition-transform"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center overflow-hidden shrink-0">
                        {user.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm truncate">{user.username}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-yellow-400 text-[11px] font-bold">
                            <Coins className="w-3 h-3" />{user.tokens?.toLocaleString() || 0}
                          </span>
                          <span className="flex items-center gap-1 text-fuchsia-400 text-[11px] font-bold">
                            <Flame className="w-3 h-3" />Lvl {user.bp_level || 1}
                          </span>
                        </div>
                      </div>
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.04] text-white/30 shrink-0">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Link>
                </div>
              )}

              {/* Quick actions */}
              {user && (
                <div className="flex gap-2 mb-6">
                  {!isGamer && (
                    <Link to={createPageUrl('UploadSelect')} onClick={onClose} className="flex-1">
                      <button className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-white active:scale-95 transition-transform"
                        style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.15)' }}>
                        <Upload className="w-4 h-4 text-cyan-400" />Upload
                      </button>
                    </Link>
                  )}
                  <Link to={createPageUrl('Settings')} onClick={onClose} className="flex-1">
                    <button className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-white/60 active:scale-95 transition-transform bg-white/[0.03] border border-white/[0.06]">
                      <Settings className="w-4 h-4" />Einstellungen
                    </button>
                  </Link>
                </div>
              )}

              {/* Navigation groups */}
              <div className="space-y-5">
                {DRAWER_GROUPS.map((group) => {
                  const items = navItems.filter(i => group.keys.includes(i.href));
                  if (!items.length) return null;
                  return (
                    <div key={group.label}>
                      <p className="text-white/15 text-[10px] font-bold uppercase tracking-[0.15em] mb-2">{group.label}</p>
                      <div className="space-y-0.5">
                        {items.map((item) => (
                          <Link key={item.href} to={createPageUrl(item.href)} onClick={onClose}>
                            <button className={cn(
                              "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all active:scale-[0.98]",
                              isActive(item.href)
                                ? "bg-white/[0.06]"
                                : "hover:bg-white/[0.03]"
                            )}>
                              <div className={cn(
                                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                                isActive(item.href) ? "bg-white/[0.08]" : "bg-white/[0.03]"
                              )}>
                                <item.icon className={cn("w-4 h-4", item.color || (isActive(item.href) ? "text-white" : "text-white/35"))} />
                              </div>
                              <div className="flex-1 text-left min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={cn("text-sm font-medium", isActive(item.href) ? "text-white" : "text-white/60")}>{item.label}</span>
                                  {item.badge && (
                                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md bg-orange-500/80 text-white leading-none">{item.badge}</span>
                                  )}
                                </div>
                                {item.desc && <p className="text-white/20 text-[11px] leading-tight mt-0.5">{item.desc}</p>}
                              </div>
                            </button>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Account section */}
              {user && (
                <div className="mt-6 pt-5 border-t border-white/[0.04]">
                  {user.role === 'admin' && (
                    <Link to={createPageUrl('Admin')} onClick={onClose}>
                      <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-cyan-400 hover:bg-cyan-500/[0.06] active:scale-[0.98] transition-all mb-1">
                        <div className="w-9 h-9 rounded-xl bg-cyan-500/[0.08] flex items-center justify-center shrink-0">
                          <Shield className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">Admin Panel</span>
                      </button>
                    </Link>
                  )}
                  <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400/70 hover:bg-red-500/[0.06] active:scale-[0.98] transition-all">
                    <div className="w-9 h-9 rounded-xl bg-red-500/[0.06] flex items-center justify-center shrink-0">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Ausloggen</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}