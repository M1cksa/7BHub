import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

export default function PageTransition({ children }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.15, ease: 'easeOut' } }}
        exit={{ opacity: 0, transition: { duration: 0.1, ease: 'easeIn' } }}
        style={{ width: '100%', willChange: 'opacity' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}