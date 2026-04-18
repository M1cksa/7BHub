import React from 'react';

// CSS-only – no framer-motion, no JS animation loops
export default function NeonGrid() {
  return (
    <>
      <style>{`
        @keyframes ng-scroll {
          from { background-position: 0 0, 0 0; }
          to   { background-position: 80px 80px, 80px 80px; }
        }
        @keyframes ng-scan {
          0%   { transform: translateY(-30%); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(120%); opacity: 0; }
        }
        .ng-grid { animation: ng-scroll 25s linear infinite; }
        .ng-scan { animation: ng-scan 10s linear infinite; }
      `}</style>
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-20">
        {/* Scrolling grid */}
        <div
          className="ng-grid absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(6,182,212,0.25) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6,182,212,0.25) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />

        {/* Scan line */}
        <div
          className="ng-scan absolute inset-x-0 h-48"
          style={{
            background: 'linear-gradient(to bottom, transparent, rgba(6,182,212,0.18), transparent)',
            filter: 'blur(16px)',
          }}
        />

        {/* Static corner glows – no animation needed */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-cyan-500/20 to-transparent blur-3xl" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-violet-500/20 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-fuchsia-500/20 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-tl from-teal-500/20 to-transparent blur-3xl" />
      </div>
    </>
  );
}