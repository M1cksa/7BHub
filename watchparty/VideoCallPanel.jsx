import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Users } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function VideoCallPanel({ partyId, username, participants }) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);
  const localVideoRef = useRef(null);
  const peerConnections = useRef({});
  const signalCheckInterval = useRef(null);
  
  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // Create peer connection for a participant
  const createPeerConnection = (participantUsername, stream) => {
    if (peerConnections.current[participantUsername]) {
      return peerConnections.current[participantUsername];
    }

    const pc = new RTCPeerConnection(iceServers);
    peerConnections.current[participantUsername] = pc;

    // Add local tracks if stream is provided
    if (stream) {
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });
    }

    // Handle incoming tracks
    pc.ontrack = (event) => {
      console.log('Received remote track from', participantUsername);
      if (event.streams[0]) {
        setRemoteStreams(prev => ({
          ...prev,
          [participantUsername]: event.streams[0]
        }));
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = async (event) => {
      if (event.candidate) {
        try {
          await base44.entities.WebRTCSignal.create({
            video_id: partyId,
            signal_type: 'ice-candidate',
            signal_data: JSON.stringify(event.candidate),
            sender: username,
            viewer_id: participantUsername
          });
        } catch (e) {
          console.error('Failed to send ICE candidate:', e);
        }
      }
    };

    // Connection state monitoring
    pc.onconnectionstatechange = () => {
      console.log(`Connection state with ${participantUsername}:`, pc.connectionState);
    };

    return pc;
  };

  // Start local media
  const startLocalMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      console.log('Got local stream:', stream.getTracks());
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setIsCallActive(true);
      toast.success('Kamera aktiviert');

      // Start signaling with other participants
      await startSignaling(stream);
    } catch (error) {
      console.error('Media access error:', error);
      toast.error('Kamera-Zugriff verweigert');
    }
  };

  // Start WebRTC signaling
  const startSignaling = async (stream) => {
    if (!stream) {
      console.error('No stream available for signaling');
      return;
    }

    // Create offers for all other participants
    for (const participant of participants) {
      if (participant !== username) {
        try {
          const pc = createPeerConnection(participant, stream);
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
          });
          await pc.setLocalDescription(offer);

          await base44.entities.WebRTCSignal.create({
            video_id: partyId,
            signal_type: 'offer',
            signal_data: JSON.stringify(offer),
            sender: username,
            viewer_id: participant
          });
          
          console.log('Sent offer to', participant);
        } catch (e) {
          console.error('Failed to create offer for', participant, e);
        }
      }
    }

    // Start checking for incoming signals
    signalCheckInterval.current = setInterval(checkForSignals, 2000);
  };

  // Check for incoming WebRTC signals
  const checkForSignals = async () => {
    try {
      const signals = await base44.entities.WebRTCSignal.filter({
        video_id: partyId,
        viewer_id: username,
        processed: false
      });

      for (const signal of signals) {
        await handleSignal(signal);
        // Mark as processed
        await base44.entities.WebRTCSignal.update(signal.id, { processed: true });
      }
    } catch (e) {
      console.error('Failed to check signals:', e);
    }
  };

  // Handle incoming signal
  const handleSignal = async (signal) => {
    try {
      const data = JSON.parse(signal.signal_data);
      
      if (signal.signal_type === 'offer') {
        const pc = createPeerConnection(signal.sender, localStream);
        await pc.setRemoteDescription(new RTCSessionDescription(data));
        
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        await base44.entities.WebRTCSignal.create({
          video_id: partyId,
          signal_type: 'answer',
          signal_data: JSON.stringify(answer),
          sender: username,
          viewer_id: signal.sender
        });
        
        console.log('Sent answer to', signal.sender);
      } else if (signal.signal_type === 'answer') {
        const pc = peerConnections.current[signal.sender];
        if (pc && pc.signalingState !== 'stable') {
          await pc.setRemoteDescription(new RTCSessionDescription(data));
          console.log('Received answer from', signal.sender);
        }
      } else if (signal.signal_type === 'ice-candidate') {
        const pc = peerConnections.current[signal.sender];
        if (pc && pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(data));
          console.log('Added ICE candidate from', signal.sender);
        }
      }
    } catch (e) {
      console.error('Failed to handle signal:', e);
    }
  };

  // Stop local media
  const stopLocalMedia = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
      setIsCallActive(false);
      
      // Stop signal checking
      if (signalCheckInterval.current) {
        clearInterval(signalCheckInterval.current);
        signalCheckInterval.current = null;
      }
      
      // Close all peer connections
      Object.values(peerConnections.current).forEach(pc => pc.close());
      peerConnections.current = {};
      setRemoteStreams({});
      
      toast.success('Anruf beendet');
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  // Update peer connections when participants change
  useEffect(() => {
    if (isCallActive && localStream) {
      const currentParticipants = participants.filter(p => p !== username);
      const connectedParticipants = Object.keys(peerConnections.current);
      
      // Remove connections for participants who left
      connectedParticipants.forEach(p => {
        if (!currentParticipants.includes(p)) {
          peerConnections.current[p]?.close();
          delete peerConnections.current[p];
          setRemoteStreams(prev => {
            const { [p]: _, ...rest } = prev;
            return rest;
          });
        }
      });
    }
  }, [participants, isCallActive, localStream, username]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLocalMedia();
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Control Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-violet-400" />
          <span className="text-white font-bold">Videoanruf</span>
        </div>
        
        {!isCallActive ? (
          <Button
            onClick={startLocalMedia}
            className="bg-gradient-to-r from-green-600 to-emerald-600 gap-2"
          >
            <Video className="w-4 h-4" />
            Kamera starten
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              onClick={toggleVideo}
              size="icon"
              variant={isVideoEnabled ? "default" : "destructive"}
              className="rounded-full"
            >
              {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </Button>
            <Button
              onClick={toggleAudio}
              size="icon"
              variant={isAudioEnabled ? "default" : "destructive"}
              className="rounded-full"
            >
              {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </Button>
            <Button
              onClick={stopLocalMedia}
              size="icon"
              variant="destructive"
              className="rounded-full"
            >
              <PhoneOff className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Video Grid */}
      <AnimatePresence>
        {isCallActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-2 gap-3"
          >
            {/* Local Video */}
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden border-2 border-violet-500/30">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm">
                <span className="text-white text-xs font-bold">{username} (Du)</span>
              </div>
              {!isVideoEnabled && (
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                  <div className="text-center">
                    <VideoOff className="w-12 h-12 text-white/50 mx-auto mb-2" />
                    <p className="text-white/50 text-sm">Kamera aus</p>
                  </div>
                </div>
              )}
            </div>

            {/* Remote Videos */}
            {Object.entries(remoteStreams).map(([userId, stream]) => (
              <div key={userId} className="relative aspect-video bg-black rounded-xl overflow-hidden border-2 border-cyan-500/30">
                <video
                  autoPlay
                  playsInline
                  ref={el => {
                    if (el) el.srcObject = stream;
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm">
                  <span className="text-white text-xs font-bold">{userId}</span>
                </div>
              </div>
            ))}

            {/* Placeholder for other participants */}
            {participants
              .filter(p => p !== username && !remoteStreams[p])
              .slice(0, 3)
              .map((participant, idx) => (
                <div
                  key={participant}
                  className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden border-2 border-white/10 flex items-center justify-center"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center mx-auto mb-2">
                      <span className="text-white text-2xl font-bold">
                        {participant[0].toUpperCase()}
                      </span>
                    </div>
                    <p className="text-white/70 text-sm font-bold">{participant}</p>
                    <p className="text-white/40 text-xs">Wartet...</p>
                  </div>
                  <div className="absolute bottom-2 left-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm">
                    <span className="text-white text-xs font-bold">{participant}</span>
                  </div>
                </div>
              ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info */}
      {!isCallActive && (
        <div className="text-center py-4 text-white/40 text-sm">
          Starte deinen Videoanruf, um mit anderen Teilnehmern zu interagieren
        </div>
      )}
    </div>
  );
}