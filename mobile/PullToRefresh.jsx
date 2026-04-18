import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

export default function PullToRefresh({ onRefresh, children }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const y = useMotionValue(0);
  const touchStartY = useRef(0);
  const scrollElement = useRef(null);

  const rotation = useTransform(y, [0, 80], [0, 180]);
  const opacity = useTransform(y, [0, 80], [0, 1]);
  const childY = useTransform(y, v => Math.min(v * 0.5, 30));
  
  // Feature detection: check if device supports touch
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  const handleTouchStart = (e) => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (scrollTop === 0 && !isRefreshing) {
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - touchStartY.current;
      
      if (deltaY > 0 && deltaY < 120) {
        y.set(deltaY);
      }
    }
  };

  const handleTouchEnd = async () => {
    const currentY = y.get();
    
    if (currentY > 80 && !isRefreshing) {
      setIsRefreshing(true);
      await animate(y, 60, { duration: 0.2 });
      
      try {
        await onRefresh?.();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        await animate(y, 0, { duration: 0.3 });
        setIsRefreshing(false);
      }
    } else {
      await animate(y, 0, { duration: 0.2 });
    }
  };

  // Enable for touch devices instead of relying on userAgent
  if (!isTouchDevice) {
    return <>{children}</>;
  }

  return (
    <div
      ref={scrollElement}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ 
        overscrollBehavior: 'none',
        touchAction: 'pan-y'
      }}
    >
      <motion.div
        style={{
          y,
          position: 'absolute',
          top: 0,
          left: '50%',
          x: '-50%',
          zIndex: 50,
          opacity,
          pointerEvents: 'none'
        }}
        className="flex items-center justify-center"
      >
        <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-lg">
          <motion.div style={{ rotate: rotation }}>
            <RefreshCw className={`w-5 h-5 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
          </motion.div>
        </div>
      </motion.div>
      
      <motion.div style={{ y: childY }}>
        {children}
      </motion.div>
    </div>
  );
}