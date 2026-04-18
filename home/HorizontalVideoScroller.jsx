import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ModernVideoCard from '@/components/modern/ModernVideoCard';

export default function HorizontalVideoScroller({ title, videos, icon: Icon, gradient = 'from-cyan-500 to-teal-500' }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="mb-16">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white">{title}</h2>
        </div>

        {/* Scroll Buttons */}
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto hide-scrollbar pb-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {videos.map((video) => (
          <div key={video.id} className="flex-shrink-0 w-[280px] md:w-[350px] snap-start">
            <ModernVideoCard video={video} />
          </div>
        ))}
      </div>
    </div>
  );
}