import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, X, Send, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { base44 } from '@/api/base44Client';

const FILTERS = [
    { id: 'none', name: 'Normal', class: '' },
    { id: 'sepia', name: 'Sepia', class: 'sepia contrast-125' },
    { id: 'bw', name: 'B&W', class: 'grayscale contrast-125' },
    { id: 'vintage', name: 'Vintage', class: 'sepia hue-rotate-15 contrast-110 brightness-110 saturate-150' },
    { id: 'cyber', name: 'Cyber', class: 'hue-rotate-180 contrast-125 saturate-200' },
    { id: 'pop', name: 'Pop Art', class: 'contrast-150 saturate-200 brightness-110' },
    { id: 'dream', name: 'Dreamy', class: 'brightness-110 contrast-90 saturate-150 blur-[0.5px]' },
    { id: 'noir', name: 'Noir', class: 'grayscale contrast-150 brightness-90' },
];

export default function SnapCamera({ onCapture }) {
    const [stream, setStream] = useState(null);
    const [image, setImage] = useState(null);
    const [activeFilter, setActiveFilter] = useState('none');
    const [isFrontCamera, setIsFrontCamera] = useState(true);
    const videoRef = useRef(null);
    const fileInputRef = useRef(null);

    const startCamera = async () => {
        try {
            const constraints = {
                video: { facingMode: isFrontCamera ? "user" : "environment" }
            };
            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            toast.error("Kamera konnte nicht gestartet werden");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const capturePhoto = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            
            // Mirror if front camera
            if (isFrontCamera) {
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
            }
            
            ctx.drawImage(videoRef.current, 0, 0);
            
            canvas.toBlob((blob) => {
                const file = new File([blob], `snap_${Date.now()}.jpg`, { type: "image/jpeg" });
                const url = URL.createObjectURL(file);
                setImage({ file, url });
                stopCamera();
            }, 'image/jpeg', 0.8);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setImage({ file, url });
        }
    };

    const confirmSnap = () => {
        onCapture({ image, filter: activeFilter });
    };

    const reset = () => {
        setImage(null);
        setActiveFilter('none');
        startCamera();
    };

    // Initialize camera on mount
    React.useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    // Restart camera when switching facing mode
    React.useEffect(() => {
        if (!image) {
            stopCamera();
            startCamera();
        }
    }, [isFrontCamera]);

    return (
        <div className="relative h-full flex flex-col bg-black overflow-hidden">
            {/* Camera View / Image Preview */}
            <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                {!image ? (
                    <>
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            muted 
                            className={`w-full h-full object-cover ${isFrontCamera ? 'scale-x-[-1]' : ''}`}
                        />
                        {/* Camera Overlay Info */}
                        <div className="absolute top-6 left-0 right-0 flex justify-center pointer-events-none">
                            <div className="glass-card px-4 py-2 rounded-full border border-white/20">
                                <p className="text-white/90 text-sm font-medium">📸 Halte gedrückt für Video</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <img 
                            src={image.url} 
                            alt="Snap Preview" 
                            className={`w-full h-full object-contain ${FILTERS.find(f => f.id === activeFilter)?.class}`} 
                        />
                        
                        {/* Filter Selector (Overlay) */}
                        <div className="absolute bottom-24 left-0 right-0 overflow-x-auto pb-2 px-4 scrollbar-hide">
                            <div className="flex gap-3 justify-center">
                                {FILTERS.map(filter => (
                                    <button
                                        key={filter.id}
                                        onClick={() => setActiveFilter(filter.id)}
                                        className={`flex-shrink-0 flex flex-col items-center gap-2 transition-all ${
                                            activeFilter === filter.id ? 'scale-110' : 'opacity-70 hover:opacity-100'
                                        }`}
                                    >
                                        <div className={`w-14 h-14 rounded-2xl overflow-hidden border-2 ${
                                            activeFilter === filter.id 
                                                ? 'border-[var(--theme-primary)] shadow-lg shadow-[var(--theme-primary)]/30' 
                                                : 'border-white/30'
                                        }`}>
                                            <img 
                                                src={image.url} 
                                                className={`w-full h-full object-cover ${filter.class}`} 
                                                alt={filter.name} 
                                            />
                                        </div>
                                        <span className={`text-[10px] font-bold ${
                                            activeFilter === filter.id ? 'text-[var(--theme-primary)]' : 'text-white/60'
                                        }`}>
                                            {filter.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Controls */}
            <div className="bg-black/90 backdrop-blur-2xl p-6 border-t border-white/10">
                {!image ? (
                    <div className="flex items-center justify-between max-w-sm mx-auto">
                        <button 
                            onClick={() => fileInputRef.current?.click()} 
                            className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all active:scale-95"
                        >
                            <Wand2 className="w-6 h-6 text-white" />
                        </button>
                        <input 
                            type="file" 
                            accept="image/*" 
                            ref={fileInputRef} 
                            className="hidden" 
                            onChange={handleFileUpload} 
                        />
                        
                        <button 
                            onClick={capturePhoto}
                            className="w-20 h-20 rounded-full border-4 border-white bg-white/10 hover:bg-white/20 transition-all active:scale-95 shadow-2xl shadow-white/20"
                        />

                        <button 
                            onClick={() => setIsFrontCamera(!isFrontCamera)} 
                            className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all active:scale-95"
                        >
                            <Camera className="w-6 h-6 text-white" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between gap-4 max-w-sm mx-auto">
                        <button 
                            onClick={reset} 
                            className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all active:scale-95"
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>
                        <button 
                            onClick={confirmSnap} 
                            className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] hover:opacity-90 flex items-center justify-center gap-2 font-black text-lg text-white transition-all active:scale-95 shadow-2xl shadow-[var(--theme-primary)]/30"
                        >
                            <Send className="w-5 h-5" />
                            Weiter
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}