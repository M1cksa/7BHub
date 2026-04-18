import React from 'react';
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Star } from 'lucide-react';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function UserAvatar({ user, size = "md", className }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-32 h-32"
  };

  const frameStyles = {
    gold: "ring-2 ring-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)] animate-[glow_2s_ease-in-out_infinite]",
    neon: "ring-2 ring-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-[pulse_2s_ease-in-out_infinite]",
    fire: "ring-2 ring-orange-500 animate-pulse shadow-[0_0_15px_rgba(249,115,22,0.6)]",
    glitch: "ring-2 ring-fuchsia-500 relative after:absolute after:inset-0 after:bg-fuchsia-500/20 after:animate-pulse animate-[glitch_3s_ease-in-out_infinite]",
    rainbow: "bg-gradient-to-r from-red-500 via-green-500 to-blue-500 p-[2px] animate-[spin_3s_linear_infinite]",
    diamond: "ring-2 ring-blue-300 shadow-[0_0_15px_rgba(147,197,253,0.8)] animate-[glow_2s_ease-in-out_infinite]",
    cyber: "ring-2 ring-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)] border-2 border-black animate-[pulse_2s_ease-in-out_infinite]",
    nature: "ring-2 ring-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-[sway_3s_ease-in-out_infinite]",
    cosmic: "ring-2 ring-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.7)] animate-[glow_2s_ease-in-out_infinite]",
    lightning: "ring-2 ring-yellow-300 shadow-[0_0_20px_rgba(253,224,71,0.8)] animate-pulse",
    ice: "ring-2 ring-cyan-200 shadow-[0_0_15px_rgba(165,243,252,0.6)] animate-[glow_2s_ease-in-out_infinite]",
    lava: "ring-2 ring-orange-600 shadow-[0_0_20px_rgba(234,88,12,0.8)] animate-pulse",
    toxic: "ring-2 ring-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.7)] animate-[glow_2s_ease-in-out_infinite]",
    shadow: "ring-2 ring-gray-900 shadow-[0_0_20px_rgba(0,0,0,0.9)] animate-[fade_2s_ease-in-out_infinite]",
    celestial: "ring-2 ring-pink-400 shadow-[0_0_20px_rgba(244,114,182,0.7)] animate-[glow_2s_ease-in-out_infinite]",
    galaxy: "ring-2 ring-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.8)] animate-[glow_2s_ease-in-out_infinite]",
    blood: "ring-2 ring-red-800 shadow-[0_0_20px_rgba(153,27,27,0.9)] animate-pulse",
    ocean: "ring-2 ring-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.7)] animate-[wave_3s_ease-in-out_infinite]",
    phoenix: "ring-2 ring-orange-500 shadow-[0_0_25px_rgba(249,115,22,0.8)] animate-pulse",
    dragon: "ring-2 ring-emerald-600 shadow-[0_0_20px_rgba(5,150,105,0.8)] animate-[glow_2s_ease-in-out_infinite]",
    aurora: "ring-2 ring-green-400 shadow-[0_0_25px_rgba(74,222,128,0.8)] animate-[aurora_4s_ease-in-out_infinite]",
    eternal: "ring-2 ring-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.9)] animate-pulse",
    void: "ring-2 ring-purple-950 shadow-[0_0_30px_rgba(59,7,100,0.9)] animate-[fade_3s_ease-in-out_infinite]",
    // Daily Reward Frames
    daily_aurora: "ring-2 ring-cyan-300 shadow-[0_0_20px_rgba(103,232,249,0.8)] animate-[aurora_4s_ease-in-out_infinite]",
    daily_cosmos: "ring-2 ring-purple-400 shadow-[0_0_20px_rgba(192,132,252,0.8)] animate-[glow_2s_ease-in-out_infinite]",
    daily_phoenix: "ring-2 ring-orange-500 shadow-[0_0_25px_rgba(249,115,22,0.8)] animate-pulse",
    // Battle Pass Frames
    bp_cosmic_rift: "ring-2 ring-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.8)] animate-[glow_2s_ease-in-out_infinite]",
    bp_dragon_breath: "ring-2 ring-red-500 shadow-[0_0_25px_rgba(239,68,68,0.8)] animate-pulse",
    bp_cyber_samurai: "ring-2 ring-red-500 shadow-[0_0_25px_rgba(220,38,38,0.9)] animate-[pulse_2s_ease-in-out_infinite] border-2 border-black",
    bp_god_tier: "",
    hub_2_0: "ring-2 ring-cyan-400 shadow-[0_0_20px_rgba(124,58,237,0.8)] border-2 border-fuchsia-500 animate-[glow_2s_ease-in-out_infinite]",
    // Donor Exclusive Frames
    legendary: "ring-4 ring-yellow-400 shadow-[0_0_30px_rgba(250,204,21,1)] animate-[glow_1.5s_ease-in-out_infinite]",
    divine: "ring-4 ring-white shadow-[0_0_35px_rgba(255,255,255,0.9)] animate-[glow_1.5s_ease-in-out_infinite]",
    mythic: "ring-4 ring-purple-500 shadow-[0_0_35px_rgba(168,85,247,1)] animate-[glow_1.5s_ease-in-out_infinite]",
    genesis: "ring-2 ring-amber-300 shadow-[0_0_22px_rgba(251,191,36,0.75),0_0_45px_rgba(168,85,247,0.35)] animate-[glow_2s_ease-in-out_infinite]",
    // Pro Pass Frames
    prisma: "ring-3 ring-pink-400 shadow-[0_0_25px_rgba(236,72,153,0.8),0_0_50px_rgba(99,102,241,0.4)] animate-[glow_2s_ease-in-out_infinite]",
    genesis_unbound: "ring-3 ring-purple-600 shadow-[0_0_30px_rgba(139,92,246,0.9)] animate-[glow_2s_ease-in-out_infinite]",
    divine_ascension: "ring-4 ring-orange-500 shadow-[0_0_40px_rgba(249,115,22,1)] animate-[glow_1.5s_ease-in-out_infinite]",
    eternal_nexus: "ring-4 ring-fuchsia-500 shadow-[0_0_40px_rgba(192,132,252,1)] animate-[glow_1.5s_ease-in-out_infinite]",
    absolute_throne: "ring-4 ring-yellow-300 shadow-[0_0_50px_rgba(250,204,21,1),0_0_30px_rgba(245,158,11,0.8)] animate-[glow_1s_ease-in-out_infinite]",
    // Season 2 Battle Pass Frames
    s2_apocalypse: "ring-2 ring-red-600 shadow-[0_0_20px_rgba(220,38,38,0.8),0_0_40px_rgba(249,115,22,0.4)] animate-pulse",
    s2_mutant: "ring-2 ring-lime-500 shadow-[0_0_20px_rgba(132,204,22,0.8),0_0_40px_rgba(163,230,53,0.4)] animate-[glow_2s_ease-in-out_infinite]",
    s2_doomsday: "ring-2 ring-orange-500 shadow-[0_0_25px_rgba(249,115,22,0.9),0_0_50px_rgba(239,68,68,0.5)] animate-pulse",
    void_titan: "ring-3 ring-purple-500 shadow-[0_0_30px_rgba(168,85,247,1),0_0_60px_rgba(124,58,237,0.6)] animate-[glow_1.5s_ease-in-out_infinite]",
    // Shard Shop Exclusive Frame
    bp_s2_champion: "ring-[3px] shadow-[0_0_0_1px_rgba(251,191,36,0.6),0_0_25px_rgba(251,191,36,0.7),0_0_50px_rgba(168,85,247,0.4)]",
    none: ""
  };

  const currentFrame = user?.frame_style || 'none';
  const isRainbow = currentFrame === 'rainbow';
  const isGodTier = currentFrame === 'bp_god_tier';
  const isChampion = currentFrame === 'bp_s2_champion';

  return (
    <div className={cn("relative inline-block", className)}>
      <style>{`
        @keyframes godTierGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(250,204,21,0.6), 0 0 40px rgba(245,158,11,0.4); }
          50% { box-shadow: 0 0 35px rgba(250,204,21,1), 0 0 70px rgba(245,158,11,0.6); }
        }
        @keyframes championGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(251,191,36,0.7), 0 0 35px rgba(168,85,247,0.4); }
          50% { box-shadow: 0 0 35px rgba(251,191,36,1), 0 0 60px rgba(168,85,247,0.6); }
        }
        @keyframes glow {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.3); }
        }
        @keyframes glitch {
          0%, 100% { transform: translate(0); }
          33% { transform: translate(-2px, 2px); }
          66% { transform: translate(2px, -2px); }
        }
        @keyframes sway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(3deg); }
        }
        @keyframes wave {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes aurora {
          0%, 100% { filter: hue-rotate(0deg); }
          50% { filter: hue-rotate(30deg); }
        }
        @keyframes fade {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
      <div className={cn(
        "rounded-full overflow-hidden relative",
        sizeClasses[size],
        !isRainbow && !isGodTier && !isChampion && frameStyles[currentFrame],
        isRainbow && "bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 p-[3px] animate-spin-slow",
        isGodTier && "p-[4px] animate-[godTierGlow_2s_ease-in-out_infinite]",
        isChampion && "p-[3px] animate-[championGlow_2s_ease-in-out_infinite]"
      )}>
        {isGodTier && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 via-amber-400 to-yellow-600 z-0" />
            <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0_280deg,#ffffff_360deg)] animate-[spin_2s_linear_infinite] mix-blend-overlay z-0" />
            <div className="absolute inset-[-100%] bg-[conic-gradient(from_180deg,transparent_0_280deg,#ffffff_360deg)] animate-[spin_2s_linear_infinite] mix-blend-overlay z-0" />
          </>
        )}
        {isChampion && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-purple-500 to-yellow-300 z-0" />
            <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0_260deg,rgba(251,191,36,0.9)_360deg)] animate-[spin_3s_linear_infinite] mix-blend-overlay z-0" />
          </>
        )}
        <div className={cn(
          "w-full h-full rounded-full overflow-hidden bg-black relative z-10",
          (isRainbow || isGodTier || isChampion) && "border-2 border-black" 
        )}>
           <img 
            src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'Guest'}`} 
            alt={user?.username}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      
      {/* Badges are now exclusively background animations on the creator profile */}
    </div>
  );
}