import { useEffect, useRef } from 'react';
import DimensionSuperpowerToast from './DimensionSuperpowerToast';

export default function DimensionSuperpowerToastWrapper({ superpower, onDone }) {
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const timer = setTimeout(() => onDoneRef.current(), 2800);
    return () => clearTimeout(timer);
  }, []); // nur einmal beim Mount

  return (
    <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center">
      <DimensionSuperpowerToast superpower={superpower} />
    </div>
  );
}