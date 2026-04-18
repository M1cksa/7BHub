import React from 'react';
import FriendList from '@/components/snaps/FriendList';
import PageTransition from '@/components/mobile/PageTransition';
import AnimatedBackground from '@/components/streaming/AnimatedBackground';

export default function Friends() {
  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden bg-[#050505] pb-24">
        <AnimatedBackground />
        
        <div className="max-w-4xl mx-auto px-4 pt-8 md:pt-12 relative z-10">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Freunde</h1>
          </div>
          
          <div className="bg-white/[0.02] backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden h-[70vh] min-h-[500px] flex flex-col">
            <FriendList />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}