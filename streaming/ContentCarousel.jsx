import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MediaCard from './MediaCard';

export default function ContentCarousel({ title, media, icon: Icon }) {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!media?.length) return null;

  return (
    <section className="relative py-8 group/section">
      {/* Section Header */}
      <div className="px-8 md:px-16 lg:px-24 mb-6">
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          {Icon && (
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20 backdrop-blur-sm border border-white/10">
              <Icon className="w-5 h-5 text-violet-400" />
            </div>
          )}
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent ml-4" />
        </motion.div>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Left Arrow */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: showLeftArrow ? 1 : 0 }}
          className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/80 hover:border-white/20 transition-all opacity-0 group-hover/section:opacity-100"
          onClick={() => scroll('left')}
          style={{ pointerEvents: showLeftArrow ? 'auto' : 'none' }}
        >
          <ChevronLeft className="w-6 h-6" />
        </motion.button>

        {/* Right Arrow */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: showRightArrow ? 1 : 0 }}
          className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/80 hover:border-white/20 transition-all opacity-0 group-hover/section:opacity-100"
          onClick={() => scroll('right')}
          style={{ pointerEvents: showRightArrow ? 'auto' : 'none' }}
        >
          <ChevronRight className="w-6 h-6" />
        </motion.button>

        {/* Scrollable Content */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-8 md:px-16 lg:px-24 pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {media.map((item, index) => (
            <div key={item.id} className="flex-none w-[160px] md:w-[180px] lg:w-[200px]">
              <MediaCard media={item} index={index} />
            </div>
          ))}
        </div>

        {/* Gradient Fades */}
        <div className="absolute left-0 top-0 bottom-4 w-8 md:w-16 lg:w-24 bg-gradient-to-r from-[#0a0a0b] to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-4 w-8 md:w-16 lg:w-24 bg-gradient-to-l from-[#0a0a0b] to-transparent pointer-events-none" />
      </div>
    </section>
  );
}