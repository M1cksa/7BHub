import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock } from "lucide-react";

const FILTERS = {
    'none': '',
    'sepia': 'sepia contrast-125',
    'bw': 'grayscale contrast-125',
    'vintage': 'sepia hue-rotate-15 contrast-110 brightness-110 saturate-150',
    'cyber': 'hue-rotate-180 contrast-125 saturate-200',
    'pop': 'contrast-150 saturate-200 brightness-110',
    'dream': 'brightness-110 contrast-90 saturate-150 blur-[0.5px]',
    'noir': 'grayscale contrast-150 brightness-90',
};

export default function SnapViewer({ snap, onClose }) {
    const [timeLeft, setTimeLeft] = useState(10); // Default 10 seconds for view_once viewing duration or just countdown
    
    useEffect(() => {
        // If it's a view_once snap, we start a countdown?
        // Actually snapchat stories play for a few seconds then close.
        // Let's implement auto-close after 10 seconds.
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onClose();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [onClose]);

    if (!snap) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            >
                <div className="relative w-full h-full max-w-md mx-auto bg-black">
                    {/* Progress Bar */}
                    <div className="absolute top-4 left-4 right-4 z-20 flex gap-1 h-1">
                         <motion.div 
                            className="h-full bg-white rounded-full flex-1 origin-left"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 10, ease: "linear" }}
                        />
                    </div>

                    {/* Header info */}
                    <div className="absolute top-8 left-4 z-20 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                            {snap.sender_username[0]}
                        </div>
                        <span className="text-white font-medium drop-shadow-md">{snap.sender_username}</span>
                        <span className="text-white/60 text-xs drop-shadow-md flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {snap.expiration_type === 'view_once' ? '1x' : '24h'}
                        </span>
                    </div>

                    {/* Close Button */}
                    <button 
                        onClick={onClose}
                        className="absolute top-8 right-4 z-20 text-white drop-shadow-md p-2 hover:bg-white/10 rounded-full"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Image */}
                    <img 
                        src={snap.image_url} 
                        alt="Snap" 
                        className={`w-full h-full object-contain ${FILTERS[snap.filter_effect] || ''}`}
                    />
                </div>
            </motion.div>
        </AnimatePresence>
    );
}