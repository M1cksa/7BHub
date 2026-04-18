import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Flame, ChevronRight, Lock, Star, Gift } from 'lucide-react';
import { getActiveSeason, getActiveBonuses } from './BattlePassConfig';

export default function BattlePassWidget({ user }) {
  const activeSeason = getActiveSeason(user || {});
  const activeBonuses = getActiveBonuses(activeSeason.id);

  const isSeason2 = activeSeason.id === 'season_2';

  const currentLevel = user?.bp_level || 1;
  const currentXp = user?.bp_xp || 0;
  const isPremium = user?.bp_premium || false;
  const isMaxLevel = currentLevel >= activeSeason.maxLevel;
  
  const xpNeeded = activeSeason.xpPerLevel;
  const progress = Math.min((currentXp / xpNeeded) * 100, 100);

  const nextReward = useMemo(() => {
    return activeSeason.rewards.find(r => r.level === currentLevel);
  }, [currentLevel, activeSeason]);

  if (!user) return null;

  // ── ProPass Widget (shown when BP is maxed) ──
  if (isMaxLevel) {
    const proPass = user.pro_pass || {};
    const hasPro = proPass.purchased;
    const proLevel = proPass.level || 1;
    const proXp = proPass.xp || 0;
    const proMaxLevel = 50;
    const proXpPerLevel = 2000;
    const proProgress = Math.min((proXp / proXpPerLevel) * 100, 100);

    return (
      <Link to={createPageUrl('ProPass')}
        className="relative overflow-hidden rounded-xl md:rounded-2xl border flex items-center justify-between gap-3 px-4 py-3 md:px-6 md:py-4 transition-all hover:scale-[1.01] active:scale-[0.99]"
        style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.12) 0%, rgba(168,85,247,0.18) 60%, rgba(79,70,229,0.12) 100%)', border: '1px solid rgba(251,191,36,0.35)', boxShadow: '0 0 30px rgba(251,191,36,0.12), 0 0 60px rgba(168,85,247,0.08)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 10% 50%, rgba(251,191,36,0.08) 0%, transparent 60%)' }} />
        <div className="flex items-center gap-3 relative z-10">
          <div className="relative w-10 h-10 md:w-14 md:h-14 flex-shrink-0">
            {hasPro ? (
              <>
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="46" fill="transparent" stroke="rgba(251,191,36,0.2)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="46" fill="transparent" stroke="#fbbf24" strokeWidth="8"
                    strokeDasharray="289" strokeDashoffset={289 - (289 * proProgress) / 100} strokeLinecap="round" className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm md:text-lg font-black text-yellow-300">{proLevel}</span>
                </div>
              </>
            ) : (
              <div className="w-full h-full rounded-full flex items-center justify-center text-xl md:text-2xl"
                style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)' }}>⭐</div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-black text-yellow-300 uppercase tracking-wider">Absoluter Pro Pass</span>
              {hasPro && <span className="text-[9px] bg-yellow-400/20 text-yellow-400 px-1.5 py-0.5 rounded-full font-black border border-yellow-400/30">AKTIV</span>}
            </div>
            <p className="text-[11px] text-white/50">
              {hasPro
                ? `Lvl ${proLevel} · Noch ${proXpPerLevel - proXp} XP bis Level ${proLevel + 1}`
                : 'Battle Pass abgeschlossen 🎉 · Jetzt Pro Pass entdecken'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 relative z-10 flex-shrink-0">
          {!hasPro && <span className="hidden md:block text-[10px] font-black px-2 py-1 rounded-full text-yellow-400"
            style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.25)' }}>NEU</span>}
          <ChevronRight className="w-4 h-4 text-yellow-300/60" />
        </div>
      </Link>
    );
  }

  // Check if next level has a bonus reward
  const nextBonusLevel = Object.keys(activeBonuses).map(Number).find(lvl => lvl > currentLevel);
  const levelsUntilBonus = nextBonusLevel ? nextBonusLevel - currentLevel : null;

  return (
    <div className={`relative overflow-hidden rounded-xl md:rounded-2xl border bg-black/60 backdrop-blur-md p-3 md:p-5 flex flex-col md:flex-row gap-3 md:gap-6 items-center justify-between transition-all duration-300 group ${
      isSeason2 
        ? 'border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:border-green-400/60 hover:shadow-[0_0_40px_rgba(34,197,94,0.2)]' 
        : 'border-fuchsia-500/30 shadow-[0_0_30px_rgba(217,70,239,0.15)]'
    }`}>
      {isSeason2 ? (
        <>
          {/* Animated Toxic Fog / Aurora */}
          <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none" 
            style={{ 
              background: 'linear-gradient(120deg, #000 30%, #4a044e 50%, #000 70%)',
              backgroundSize: '200% 200%',
              animation: 'toxic-flow 8s ease infinite'
            }} 
          />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-500/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-green-500/20 transition-colors" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-purple-500/20 transition-colors" />
          
          <style>{`
            @keyframes toxic-flow {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
          `}</style>
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600/10 via-purple-600/5 to-transparent pointer-events-none" />
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-fuchsia-500/20 blur-[50px] rounded-full pointer-events-none" />
        </>
      )}
      
      {/* Mobile Layout */}
      <div className="flex md:hidden relative z-10 w-full items-center justify-between">
        <Link to={createPageUrl('BattlePass')} className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`relative flex items-center justify-center w-11 h-11 shrink-0 rounded-full border-2 bg-black ${isSeason2 ? 'border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'border-fuchsia-500/30 shadow-[0_0_10px_rgba(217,70,239,0.3)]'}`}>
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" fill="transparent" stroke={isSeason2 ? "rgba(168,85,247,0.2)" : "rgba(217,70,239,0.2)"} strokeWidth="8" />
              <circle cx="50" cy="50" r="46" fill="transparent" stroke={isSeason2 ? "#22c55e" : "#d946ef"} strokeWidth="8" strokeDasharray="289" strokeDashoffset={289 - (289 * progress) / 100} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
            </svg>
            <span className={`text-sm font-black ${isSeason2 ? 'text-green-400 drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'text-white'}`}>{currentLevel}</span>
          </div>
          <div className="flex flex-col truncate pr-2">
            <div className={`text-xs font-bold flex items-center gap-1 ${isSeason2 ? 'text-purple-300' : 'text-fuchsia-300'}`}>
              <Flame className={`w-3 h-3 ${isSeason2 ? 'text-green-400' : 'text-orange-400'}`} />
              Noch {xpNeeded - currentXp} XP
            </div>
            {nextReward && (
              <div className="text-[10px] text-white/60 truncate">
                Belohnung: <span className="text-white/80">{isPremium ? nextReward.premium.label : nextReward.free.label}</span>
              </div>
            )}
          </div>
        </Link>
        <Link to={createPageUrl('BattlePass')} className="shrink-0 ml-2">
          <Button size="sm" className={`h-8 px-3 text-xs border whitespace-nowrap ${
            isSeason2 
              ? 'bg-gradient-to-r from-purple-700 to-green-700 hover:from-purple-600 hover:to-green-600 border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]' 
              : 'bg-gradient-to-r from-fuchsia-600 to-purple-600 border-fuchsia-400/30'
          }`}>
            Öffnen
          </Button>
        </Link>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex relative z-10 flex-row items-center gap-6 flex-1 justify-between w-full">
        <div className="flex items-center gap-6">
          <div className={`relative flex items-center justify-center w-20 h-20 rounded-full border-4 bg-black ${
            isSeason2 ? 'border-purple-500/40 shadow-[0_0_25px_rgba(168,85,247,0.5)]' : 'border-fuchsia-500/30 shadow-[0_0_20px_rgba(217,70,239,0.4)]'
          }`}>
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" fill="transparent" stroke={isSeason2 ? "rgba(168,85,247,0.2)" : "rgba(217,70,239,0.2)"} strokeWidth="8" />
              <circle cx="50" cy="50" r="46" fill="transparent" stroke={isSeason2 ? "url(#toxicGradient)" : "#d946ef"} strokeWidth="8" strokeDasharray="289" strokeDashoffset={289 - (289 * progress) / 100} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
              {isSeason2 && (
                <defs>
                  <linearGradient id="toxicGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#22c55e" />
                  </linearGradient>
                </defs>
              )}
            </svg>
            <div className="flex flex-col items-center relative z-10">
              <span className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isSeason2 ? 'text-purple-400' : 'text-fuchsia-400'}`}>Lvl</span>
              <span className={`text-2xl font-black leading-none ${isSeason2 ? 'text-transparent bg-clip-text bg-gradient-to-b from-green-300 to-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'text-white'}`}>{currentLevel}</span>
            </div>
          </div>

          <div className="text-left flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold border ${
                isSeason2 
                  ? 'bg-purple-900/40 text-purple-200 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                  : 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30 shadow-[0_0_10px_rgba(217,70,239,0.2)]'
              }`}>
                <Flame className={`w-3.5 h-3.5 animate-pulse ${isSeason2 ? 'text-green-400' : 'text-orange-400'}`} />
                {activeSeason.name}
              </div>
              <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md bg-orange-500 text-white leading-none tracking-wide animate-pulse">UPDATE</span>
              {levelsUntilBonus && levelsUntilBonus <= 3 && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black" style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}>
                  <Gift className="w-3 h-3" /> Bonus in {levelsUntilBonus} Level{levelsUntilBonus > 1 ? 'n' : ''}!
                </div>
              )}
            </div>
            <div className="mt-1 flex flex-col gap-1">
              <p className="text-white/80 text-sm font-bold flex items-center justify-start gap-2">
                Level {currentLevel + 1} in Sichtweite!
              </p>
              <p className={`text-xs font-medium ${isSeason2 ? 'text-purple-300' : 'text-fuchsia-300'}`}>
                Nur noch <span className={`font-black text-sm px-1 ${isSeason2 ? 'text-green-400 drop-shadow-[0_0_5px_rgba(34,197,94,0.4)]' : 'text-fuchsia-200'}`}>{xpNeeded - currentXp} XP</span> fehlen!
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {nextReward && (
            <div className={`flex items-center gap-4 rounded-xl p-3 border ${
              isSeason2 ? 'bg-black/40 border-purple-500/30 shadow-[inset_0_0_15px_rgba(168,85,247,0.1)]' : 'bg-white/5 border-white/10'
            }`}>
              <div className="text-right hidden lg:block">
                <p className={`text-xs font-semibold mb-1 ${isSeason2 ? 'text-purple-300/70' : 'text-white/40'}`}>Nächste Belohnung</p>
                <p className="text-sm font-bold text-white">{isPremium ? nextReward.premium.label : nextReward.free.label}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl border relative shrink-0 ${
                isSeason2 ? 'bg-gradient-to-br from-purple-900/50 to-green-900/30 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-gradient-to-br from-fuchsia-500/20 to-purple-600/20 border-fuchsia-500/30'
              }`}>
                {!isPremium && nextReward.premium && (
                  <Lock className="w-3 h-3 text-white/50 absolute top-1 right-1" />
                )}
                {isPremium ? nextReward.premium.icon : nextReward.free.icon}
              </div>
            </div>
          )}

          <Link to={createPageUrl('BattlePass')} className="group shrink-0">
            <Button className={`h-12 px-6 font-black text-sm uppercase tracking-wide border border-white/20 transition-all duration-300 scale-100 group-hover:scale-105 whitespace-nowrap text-white ${
              isSeason2 
                ? 'bg-gradient-to-r from-purple-700 via-green-600 to-green-500 hover:from-purple-600 hover:to-green-400 shadow-[0_0_25px_rgba(34,197,94,0.4)] group-hover:shadow-[0_0_40px_rgba(168,85,247,0.6)]' 
                : 'bg-gradient-to-r from-cyan-600 via-fuchsia-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 shadow-[0_0_25px_rgba(217,70,239,0.4)] group-hover:shadow-[0_0_40px_rgba(6,182,212,0.6)]'
            }`}>
              Belohnungen <ChevronRight className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}