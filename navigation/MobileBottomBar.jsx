import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MobileBottomBar({ navItems, isActive, onMenuOpen, menuOpen }) {
  // Show only first 4 items + menu
  const visibleItems = navItems.slice(0, 4);

  return (
    <div
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Fade gradient above bar */}
      <div className="absolute -top-6 left-0 right-0 h-6 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }} />

      <div
        className="mx-3 mb-2 rounded-2xl flex items-center justify-around px-2 py-1.5"
        style={{
          background: 'rgba(12,12,18,0.85)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        {visibleItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} to={createPageUrl(item.href)} className="flex-1">
              <button className="w-full flex flex-col items-center gap-0.5 py-2 active:scale-90 transition-transform duration-150">
                <div className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-2xl transition-all duration-200",
                  active && "bg-white/[0.1]"
                )}>
                  <item.icon className={cn(
                    "w-[20px] h-[20px] transition-all duration-200",
                    active ? "text-white" : "text-white/30"
                  )} strokeWidth={active ? 2.2 : 1.8} />
                </div>
                <span className={cn(
                  "text-[10px] font-semibold leading-none transition-all duration-200",
                  active ? "text-white" : "text-white/25"
                )}>
                  {item.label}
                </span>
              </button>
            </Link>
          );
        })}

        {/* Menu button */}
        <button
          onClick={onMenuOpen}
          className="flex-1 flex flex-col items-center gap-0.5 py-2 active:scale-90 transition-transform duration-150"
        >
          <div className={cn(
            "w-10 h-10 flex items-center justify-center rounded-2xl transition-all duration-200",
            menuOpen && "bg-white/[0.1]"
          )}>
            <Menu className={cn("w-[20px] h-[20px] transition-colors", menuOpen ? "text-white" : "text-white/30")} strokeWidth={1.8} />
          </div>
          <span className={cn("text-[10px] font-semibold leading-none", menuOpen ? "text-white" : "text-white/25")}>Mehr</span>
        </button>
      </div>
    </div>
  );
}