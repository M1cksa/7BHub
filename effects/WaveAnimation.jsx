import React from 'react';

export default function WaveAnimation() {
  return (
    <>
      <style>{`
        @keyframes wave-drift {
          0% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-25%) translateY(15px); }
          100% { transform: translateX(-50%) translateY(0); }
        }
        @keyframes wave-drift-rev {
          0% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-25%) translateY(-12px); }
          100% { transform: translateX(0) translateY(0); }
        }
        @keyframes wave-drift-slow {
          0% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-25%) translateY(20px); }
          100% { transform: translateX(-50%) translateY(0); }
        }
        @keyframes float-orb {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
          33% { transform: translate(40px, -30px) scale(1.1); opacity: 0.8; }
          66% { transform: translate(-20px, 20px) scale(0.95); opacity: 0.6; }
        }
        @keyframes float-orb2 {
          0%, 100% { transform: translate(0, 0) scale(1.1); opacity: 0.45; }
          33% { transform: translate(-50px, 30px) scale(1); opacity: 0.7; }
          66% { transform: translate(30px, -40px) scale(1.15); opacity: 0.55; }
        }
        @keyframes float-orb3 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.35; }
          50% { transform: translate(30px, -50px) scale(1.2); opacity: 0.6; }
        }
        @keyframes mid-wave {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes mid-wave-rev {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .wave-1 { animation: wave-drift 22s ease-in-out infinite; will-change: transform; transform: translateZ(0); backface-visibility: hidden; }
        .wave-2 { animation: wave-drift-rev 28s ease-in-out infinite; will-change: transform; transform: translateZ(0); backface-visibility: hidden; }
        .wave-3 { animation: wave-drift-slow 35s ease-in-out infinite; will-change: transform; transform: translateZ(0); backface-visibility: hidden; }
        .wave-4 { animation: wave-drift 18s ease-in-out infinite reverse; will-change: transform; transform: translateZ(0); backface-visibility: hidden; }
        .wave-mid-1 { animation: mid-wave 20s linear infinite; will-change: transform; transform: translateZ(0); backface-visibility: hidden; }
        .wave-mid-2 { animation: mid-wave-rev 26s linear infinite; will-change: transform; transform: translateZ(0); backface-visibility: hidden; }
        .orb-a { animation: float-orb 12s ease-in-out infinite; will-change: transform; transform: translateZ(0); backface-visibility: hidden; }
        .orb-b { animation: float-orb2 16s ease-in-out infinite; will-change: transform; transform: translateZ(0); backface-visibility: hidden; }
        .orb-c { animation: float-orb3 10s ease-in-out infinite; will-change: transform; transform: translateZ(0); backface-visibility: hidden; }
      `}</style>

      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">

        {/* === FLOATING ORBS === */}
        <div className="orb-a absolute top-[-8%] left-[5%] w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.22) 0%, transparent 65%)', filter: 'blur(50px)' }} />
        <div className="orb-b absolute top-[25%] right-[-8%] w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 65%)', filter: 'blur(60px)' }} />
        <div className="orb-c absolute bottom-[10%] left-[25%] w-[800px] h-[800px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(217,70,239,0.18) 0%, transparent 65%)', filter: 'blur(70px)' }} />

        {/* === MID-PAGE WAVES (horizontal bands across the screen) === */}
        {/* Mid wave band 1 - around 30% from top */}
        <div className="absolute left-0 right-0 overflow-hidden" style={{ top: '28%', height: '200px', opacity: 0.7 }}>
          <div className="wave-mid-1" style={{ display: 'flex', width: '200%', height: '100%' }}>
            <svg viewBox="0 0 1440 200" preserveAspectRatio="none" style={{ width: '50%', height: '100%', flexShrink: 0 }}>
              <path d="M0,100 C200,40 400,160 600,100 C800,40 1000,160 1200,100 C1300,70 1380,120 1440,100 L1440,200 L0,200 Z"
                fill="rgba(6,182,212,0.07)" />
              <path d="M0,130 C240,70 480,170 720,130 C960,90 1200,160 1440,130 L1440,200 L0,200 Z"
                fill="rgba(6,182,212,0.04)" />
            </svg>
            <svg viewBox="0 0 1440 200" preserveAspectRatio="none" style={{ width: '50%', height: '100%', flexShrink: 0 }}>
              <path d="M0,100 C200,40 400,160 600,100 C800,40 1000,160 1200,100 C1300,70 1380,120 1440,100 L1440,200 L0,200 Z"
                fill="rgba(6,182,212,0.07)" />
              <path d="M0,130 C240,70 480,170 720,130 C960,90 1200,160 1440,130 L1440,200 L0,200 Z"
                fill="rgba(6,182,212,0.04)" />
            </svg>
          </div>
        </div>

        {/* Mid wave band 2 - around 55% from top - violet */}
        <div className="absolute left-0 right-0 overflow-hidden" style={{ top: '50%', height: '220px', opacity: 0.65 }}>
          <div className="wave-mid-2" style={{ display: 'flex', width: '200%', height: '100%' }}>
            <svg viewBox="0 0 1440 220" preserveAspectRatio="none" style={{ width: '50%', height: '100%', flexShrink: 0 }}>
              <path d="M0,80 C360,160 720,20 1080,80 C1260,110 1380,50 1440,80 L1440,220 L0,220 Z"
                fill="rgba(124,58,237,0.08)" />
              <path d="M0,120 C480,60 960,160 1440,120 L1440,220 L0,220 Z"
                fill="rgba(124,58,237,0.05)" />
            </svg>
            <svg viewBox="0 0 1440 220" preserveAspectRatio="none" style={{ width: '50%', height: '100%', flexShrink: 0 }}>
              <path d="M0,80 C360,160 720,20 1080,80 C1260,110 1380,50 1440,80 L1440,220 L0,220 Z"
                fill="rgba(124,58,237,0.08)" />
              <path d="M0,120 C480,60 960,160 1440,120 L1440,220 L0,220 Z"
                fill="rgba(124,58,237,0.05)" />
            </svg>
          </div>
        </div>

        {/* === BOTTOM WAVES (stack of 4 layers) === */}

        {/* Wave 1 - Cyan - tallest */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{ height: '280px' }}>
          <div className="wave-1" style={{ display: 'flex', width: '200%', height: '100%' }}>
            {[0, 1].map(i => (
              <svg key={i} viewBox="0 0 1440 280" preserveAspectRatio="none" style={{ width: '50%', height: '100%', flexShrink: 0 }}>
                <path d="M0,120 C180,60 360,180 540,120 C720,60 900,180 1080,120 C1260,60 1380,140 1440,120 L1440,280 L0,280 Z"
                  fill="rgba(6,182,212,0.14)" />
                <path d="M0,160 C240,100 480,200 720,160 C960,120 1200,190 1440,160 L1440,280 L0,280 Z"
                  fill="rgba(6,182,212,0.09)" />
                <path d="M0,200 C360,160 720,220 1080,200 C1260,192 1380,208 1440,200 L1440,280 L0,280 Z"
                  fill="rgba(6,182,212,0.06)" />
              </svg>
            ))}
          </div>
        </div>

        {/* Wave 2 - Violet */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{ height: '230px' }}>
          <div className="wave-2" style={{ display: 'flex', width: '200%', height: '100%' }}>
            {[0, 1].map(i => (
              <svg key={i} viewBox="0 0 1440 230" preserveAspectRatio="none" style={{ width: '50%', height: '100%', flexShrink: 0 }}>
                <path d="M0,80 C360,150 720,30 1080,80 C1260,105 1380,55 1440,80 L1440,230 L0,230 Z"
                  fill="rgba(124,58,237,0.13)" />
                <path d="M0,120 C480,70 960,160 1440,120 L1440,230 L0,230 Z"
                  fill="rgba(124,58,237,0.08)" />
              </svg>
            ))}
          </div>
        </div>

        {/* Wave 3 - Fuchsia */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{ height: '180px' }}>
          <div className="wave-3" style={{ display: 'flex', width: '200%', height: '100%' }}>
            {[0, 1].map(i => (
              <svg key={i} viewBox="0 0 1440 180" preserveAspectRatio="none" style={{ width: '50%', height: '100%', flexShrink: 0 }}>
                <path d="M0,60 C360,120 720,20 1080,60 C1260,80 1380,40 1440,60 L1440,180 L0,180 Z"
                  fill="rgba(217,70,239,0.12)" />
                <path d="M0,100 C480,60 960,130 1440,100 L1440,180 L0,180 Z"
                  fill="rgba(217,70,239,0.07)" />
              </svg>
            ))}
          </div>
        </div>

        {/* Wave 4 - Teal (front, fastest) */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{ height: '120px' }}>
          <div className="wave-4" style={{ display: 'flex', width: '200%', height: '100%' }}>
            {[0, 1].map(i => (
              <svg key={i} viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ width: '50%', height: '100%', flexShrink: 0 }}>
                <path d="M0,40 C240,90 480,10 720,40 C960,70 1200,15 1440,40 L1440,120 L0,120 Z"
                  fill="rgba(20,184,166,0.14)" />
              </svg>
            ))}
          </div>
        </div>

        {/* TOP waves - subtle, decorative at very top */}
        <div className="absolute top-0 left-0 right-0 overflow-hidden" style={{ height: '160px', transform: 'rotate(180deg)' }}>
          <div className="wave-mid-2" style={{ display: 'flex', width: '200%', height: '100%' }}>
            {[0, 1].map(i => (
              <svg key={i} viewBox="0 0 1440 160" preserveAspectRatio="none" style={{ width: '50%', height: '100%', flexShrink: 0 }}>
                <path d="M0,60 C360,120 720,20 1080,60 C1260,80 1380,40 1440,60 L1440,160 L0,160 Z"
                  fill="rgba(6,182,212,0.06)" />
              </svg>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}