import React from 'react';

// Pure CSS animations – zero JS runtime cost
const lights = [
  { color: 'rgba(6,182,212,0.22)',   size: 360, left: '10%',  delay: '0s',  dur: '14s' },
  { color: 'rgba(124,58,237,0.18)',  size: 420, left: '65%',  delay: '3s',  dur: '18s' },
  { color: 'rgba(217,70,239,0.15)',  size: 300, left: '40%',  delay: '6s',  dur: '16s' },
];

export default function FloatingLights() {
  return (
    <>
      <style>{`
        @keyframes fl-rise {
          0%   { transform: translateY(110vh) scale(0.8); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 0.8; }
          100% { transform: translateY(-20vh) scale(1.1); opacity: 0; }
        }
        @keyframes fl-pulse {
          0%,100% { transform: scale(1);   opacity: 0.12; }
          50%      { transform: scale(1.15); opacity: 0.22; }
        }
        .fl-orb { position: absolute; border-radius: 50%; filter: blur(60px); animation: fl-rise linear infinite; }
        .fl-ambient { position: absolute; top:50%; left:50%; transform: translate(-50%,-50%);
          width:700px; height:700px; border-radius:50%;
          background: radial-gradient(circle, rgba(6,182,212,0.12) 0%, rgba(124,58,237,0.10) 50%, transparent 70%);
          filter: blur(80px); animation: fl-pulse 8s ease-in-out infinite; }
      `}</style>
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {lights.map((l, i) => (
          <div
            key={i}
            className="fl-orb"
            style={{
              width: l.size, height: l.size,
              left: l.left, bottom: 0,
              background: `radial-gradient(circle, ${l.color} 0%, transparent 70%)`,
              animationDuration: l.dur,
              animationDelay: l.delay,
            }}
          />
        ))}
        <div className="fl-ambient" />
      </div>
    </>
  );
}