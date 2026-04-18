import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Inbox, Users, Send, Circle, CheckCircle2 } from "lucide-react";
import SnapCamera from '@/components/snaps/SnapCamera';
import FriendList from '@/components/snaps/FriendList';
import SnapViewer from '@/components/snaps/SnapViewer';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import PageMaintenanceCheck from '@/components/PageMaintenanceCheck';

export default function SnapsPage() {
    const [user, setUser] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [activeTab, setActiveTab] = useState("camera");
    const [inbox, setInbox] = useState([]);
    const [viewingSnap, setViewingSnap] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const me = await base44.auth.me();
                setUser(me);
                fetchInbox(me.username);
                
                // Subscribe to new snaps? 
                // Currently only manually refreshing on tab change
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const fetchInbox = async (username) => {
        const snaps = await base44.entities.Snap.filter({ 
            receiver_username: username,
            // We want delivered, and maybe viewed ones if they are 24h
            // But let's fetch all relevant statuses
            status: { $in: ['delivered', 'viewed'] }
        }, '-created_date'); // Newest first
        setInbox(snaps);
    };

    const handleCapture = (data) => {
        setCapturedImage(data);
        setActiveTab("friends"); // Switch to friend selection
    };

    const handleSend = async (selectedFriends) => {
        if (!capturedImage || selectedFriends.length === 0) return;

        const toastId = toast.loading(`Sende Snap an ${selectedFriends.length} Freunde...`);
        
        try {
            // Upload image
            const uploadRes = await base44.integrations.Core.UploadFile({ file: capturedImage.image.file });
            if (!uploadRes.file_url) throw new Error("Upload fehlgeschlagen");

            const expirationType = "view_once"; // Defaulting to view_once for "Snapchat feel"
            
            // Create snap for each friend
            const promises = selectedFriends.map(friendUsername => 
                base44.entities.Snap.create({
                    sender_username: user.username,
                    sender_avatar: user.avatar_url,
                    receiver_username: friendUsername,
                    image_url: uploadRes.file_url,
                    expiration_type: expirationType,
                    filter_effect: capturedImage.filter,
                    status: 'delivered',
                    expires_at: expirationType === '24_hours' 
                        ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() 
                        : null
                })
            );

            await Promise.all(promises);
            
            toast.success("Snap gesendet!", { id: toastId });
            setCapturedImage(null);
            setActiveTab("camera"); // Back to camera
            
        } catch (error) {
            console.error(error);
            toast.error("Fehler beim Senden: " + error.message, { id: toastId });
        }
    };

    const openSnap = async (snap) => {
        setViewingSnap(snap);
        
        // Mark as viewed
        if (snap.status === 'delivered') {
            await base44.entities.Snap.update(snap.id, { status: 'viewed' });
            
            // Update local state
            setInbox(prev => prev.map(s => s.id === snap.id ? { ...s, status: 'viewed' } : s));
        }
    };

    const closeViewer = () => {
        setViewingSnap(null);
        // If it was view_once, remove from list visually (it's marked viewed in DB)
        // If we want it to disappear immediately:
        if (viewingSnap?.expiration_type === 'view_once') {
             setInbox(prev => prev.filter(s => s.id !== viewingSnap.id));
        }
        fetchInbox(user.username); // Refresh to be sure
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="text-white/50">Lädt...</div>
            </div>
        );
    }

    return (
        <PageMaintenanceCheck pageName="Snaps">
        <>
            {/* Fullscreen Snap Viewer Overlay */}
            <AnimatePresence>
                {viewingSnap && <SnapViewer snap={viewingSnap} onClose={closeViewer} />}
            </AnimatePresence>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)] flex flex-col"
            >
                {/* Modern Header */}
                <div className="glass-card rounded-t-3xl border border-white/10 p-6 mb-2">
                    <h1 className="text-3xl font-black text-white mb-2">Snaps</h1>
                    <p className="text-white/60 text-sm">Teile Momente, die verschwinden</p>
                </div>

                {/* Main Content Card */}
                <div className="flex-1 glass-card rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex flex-col">
                    
                    {/* Tab Navigation - Top */}
                    <div className="bg-black/40 backdrop-blur-md border-b border-white/10 px-2 py-3">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab('camera')}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
                                    activeTab === 'camera' 
                                        ? 'bg-[var(--theme-primary)] text-white shadow-lg shadow-[var(--theme-primary)]/20' 
                                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                            >
                                <Camera className="w-5 h-5" />
                                <span>Kamera</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('inbox')}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all relative ${
                                    activeTab === 'inbox' 
                                        ? 'bg-[var(--theme-primary)] text-white shadow-lg shadow-[var(--theme-primary)]/20' 
                                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                            >
                                <Inbox className="w-5 h-5" />
                                <span>Inbox</span>
                                {inbox.some(s => s.status === 'delivered') && (
                                    <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('friends')}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
                                    activeTab === 'friends' 
                                        ? 'bg-[var(--theme-primary)] text-white shadow-lg shadow-[var(--theme-primary)]/20' 
                                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                            >
                                <Users className="w-5 h-5" />
                                <span>Freunde</span>
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-hidden relative bg-black/20">
                        <AnimatePresence mode="wait">
                            {activeTab === 'camera' && (
                                <motion.div
                                    key="camera"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="h-full"
                                >
                                    <SnapCamera onCapture={handleCapture} />
                                </motion.div>
                            )}

                            {activeTab === 'inbox' && (
                                <motion.div
                                    key="inbox"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="h-full flex flex-col"
                                >
                                    <ScrollArea className="flex-1 p-4">
                                        {inbox.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full text-center py-16">
                                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                                    <Inbox className="w-10 h-10 text-white/30" />
                                                </div>
                                                <p className="text-white/60 font-medium">Keine Snaps vorhanden</p>
                                                <p className="text-white/40 text-sm mt-1">Deine empfangenen Snaps erscheinen hier</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {inbox.map(snap => (
                                                    <motion.div
                                                        key={snap.id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        onClick={() => openSnap(snap)}
                                                        className="group glass-card rounded-2xl p-4 cursor-pointer hover:scale-[1.02] transition-all duration-300 border border-white/10"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <Avatar className="w-12 h-12 border-2 border-white/20">
                                                                <AvatarImage src={snap.sender_avatar} />
                                                                <AvatarFallback className="bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-secondary)] text-white font-bold">
                                                                    {snap.sender_username[0]}
                                                                </AvatarFallback>
                                                            </Avatar>

                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <p className="font-bold text-white">
                                                                        {snap.sender_username}
                                                                    </p>
                                                                    {snap.status === 'delivered' ? (
                                                                        <Circle className="w-3 h-3 fill-red-500 text-red-500" />
                                                                    ) : (
                                                                        <CheckCircle2 className="w-3 h-3 text-white/30" />
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-white/50 mt-0.5">
                                                                    {formatDistanceToNow(new Date(snap.created_date), { addSuffix: true, locale: de })}
                                                                </p>
                                                            </div>

                                                            {snap.status === 'delivered' && (
                                                                <div className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg shadow-red-500/30">
                                                                    NEU
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}
                                    </ScrollArea>
                                </motion.div>
                            )}

                            {activeTab === 'friends' && (
                                <motion.div
                                    key="friends"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="h-full"
                                >
                                    {capturedImage ? (
                                        <FriendList selectionMode={true} onSelectFriend={handleSend} capturedImage={capturedImage} />
                                    ) : (
                                        <FriendList />
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </>
        </PageMaintenanceCheck>
    );
}