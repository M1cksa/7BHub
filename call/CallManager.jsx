import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Phone, Video, PhoneOff, Mic, MicOff, VideoOff, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function CallManager() {
  const [currentUser, setCurrentUser] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [isCaller, setIsCaller] = useState(false);
  
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);

  const localStreamRef = useRef(null);
  const pcRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const unsubscribeCall = useRef(null);
  const unsubscribeSignals = useRef(null);

  const activeCallRef = useRef(activeCall);
  const incomingCallRef = useRef(incomingCall);
  const isCallerRef = useRef(isCaller);

  useEffect(() => {
    activeCallRef.current = activeCall;
  }, [activeCall]);

  useEffect(() => {
    incomingCallRef.current = incomingCall;
  }, [incomingCall]);

  useEffect(() => {
    isCallerRef.current = isCaller;
  }, [isCaller]);

  useEffect(() => {
    const u = localStorage.getItem('app_user');
    if (u && u !== 'undefined') {
      try { setCurrentUser(JSON.parse(u)); } catch {}
    }
    const handler = () => {
      const stored = localStorage.getItem('app_user');
      if (stored && stored !== 'undefined') {
        try { setCurrentUser(JSON.parse(stored)); } catch {}
      }
    };
    window.addEventListener('user-updated', handler);
    return () => window.removeEventListener('user-updated', handler);
  }, []);

  useEffect(() => {
    window.startVideoCall = async (targetUsername) => {
      if (!currentUser) return toast.error("Bitte melde dich an");
      if (targetUsername === currentUser.username) return toast.error("Du kannst dich nicht selbst anrufen");
      if (activeCallRef.current) return toast.error("Du bist bereits in einem Anruf");

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        localStreamRef.current = stream;
        
        setIsCaller(true); // set state synchronously
        isCallerRef.current = true;
        
        const call = await base44.entities.VideoCall.create({
          caller_username: currentUser.username,
          caller_avatar: currentUser.avatar_url || '',
          receiver_username: targetUsername,
          status: 'ringing'
        });
        
        setActiveCall(call);
      } catch (err) {
        console.error(err);
        toast.error("Kamera/Mikrofon konnte nicht aktiviert werden");
      }
    };
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    
    unsubscribeCall.current = base44.entities.VideoCall.subscribe((event) => {
      const call = event.data;
      if (!call) return;

      const currentActive = activeCallRef.current;
      const currentIncoming = incomingCallRef.current;
      const currentIsCaller = isCallerRef.current;

      if (event.type === 'create' && call.receiver_username === currentUser.username && call.status === 'ringing') {
        if (!currentActive && !currentIncoming) {
          setIncomingCall(call);
        } else {
          base44.entities.VideoCall.update(call.id, { status: 'rejected' }).catch(() => {});
        }
      }

      if (event.type === 'update') {
        if (currentActive && call.id === currentActive.id) {
          if (call.status === 'rejected') {
            toast.error("Anruf wurde abgelehnt");
            endCallLocally();
          } else if (call.status === 'ended') {
            toast.info("Anruf beendet");
            endCallLocally();
          } else if (call.status === 'accepted' && currentIsCaller && currentActive.status === 'ringing') {
            setActiveCall(call);
            if (localStreamRef.current) {
              initWebRTC(call, localStreamRef.current, true);
            }
          } else if (call.status === 'accepted' && !currentIsCaller && currentActive.status === 'ringing') {
            setActiveCall(call);
          }
        }
        if (currentIncoming && call.id === currentIncoming.id && (call.status === 'ended' || call.status === 'rejected' || call.status === 'accepted')) {
             if(call.status !== 'accepted' || currentActive?.id !== call.id) {
                setIncomingCall(null);
             }
        }
      }
    });

    return () => {
      if (unsubscribeCall.current) unsubscribeCall.current();
    };
  }, [currentUser]);

  const initWebRTC = (call, stream, caller) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    pcRef.current = pc;

    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        base44.entities.VideoCallSignal.create({
          call_id: call.id,
          sender_username: currentUser.username,
          receiver_username: caller ? call.receiver_username : call.caller_username,
          type: 'candidate',
          data: JSON.stringify(event.candidate)
        });
      }
    };

    let candidateQueue = [];

    let isSubscribed = true;
    const processedSignals = new Set();

    const handleSignal = (sig) => {
      if (processedSignals.has(sig.id)) return;
      processedSignals.add(sig.id);

      if (sig.call_id === call.id && sig.receiver_username === currentUser.username) {
        if (sig.type === 'offer' && !caller) {
          pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(sig.data)))
            .then(() => pc.createAnswer())
            .then(answer => pc.setLocalDescription(answer))
            .then(() => {
              base44.entities.VideoCallSignal.create({
                call_id: call.id,
                sender_username: currentUser.username,
                receiver_username: call.caller_username,
                type: 'answer',
                data: JSON.stringify(pc.localDescription)
              });
              candidateQueue.forEach(c => pc.addIceCandidate(c).catch(console.error));
              candidateQueue = [];
            }).catch(console.error);
        } else if (sig.type === 'answer' && caller) {
          pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(sig.data))).then(() => {
            candidateQueue.forEach(c => pc.addIceCandidate(c).catch(console.error));
            candidateQueue = [];
          }).catch(console.error);
        } else if (sig.type === 'candidate') {
          const candidate = new RTCIceCandidate(JSON.parse(sig.data));
          if (pc.remoteDescription) {
            pc.addIceCandidate(candidate).catch(console.error);
          } else {
            candidateQueue.push(candidate);
          }
        }
      }
    };

    unsubscribeSignals.current = base44.entities.VideoCallSignal.subscribe((event) => {
      if (!isSubscribed || event.type !== 'create') return;
      handleSignal(event.data);
    });

    // Fetch missed signals (in case caller sent offer before we subscribed)
    base44.entities.VideoCallSignal.filter({ call_id: call.id, receiver_username: currentUser.username }, 'created_date', 50)
      .then(signals => {
        if (!isSubscribed) return;
        signals.forEach(sig => handleSignal(sig));
      }).catch(console.error);

    if (caller) {
      pc.createOffer().then(offer => pc.setLocalDescription(offer)).then(() => {
        if (!isSubscribed) return;
        base44.entities.VideoCallSignal.create({
          call_id: call.id,
          sender_username: currentUser.username,
          receiver_username: call.receiver_username,
          type: 'offer',
          data: JSON.stringify(pc.localDescription)
        });
      });
    }
    
    // Patch original unsubscribe logic to set isSubscribed = false
    const originalUnsub = unsubscribeSignals.current;
    unsubscribeSignals.current = () => {
      isSubscribed = false;
      if (originalUnsub) originalUnsub();
    };
  };

  const acceptCall = async () => {
    if (!incomingCall) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      localStreamRef.current = stream;
      
      initWebRTC(incomingCall, stream, false);

      await base44.entities.VideoCall.update(incomingCall.id, { status: 'accepted' });
      setIsCaller(false);
      setActiveCall({ ...incomingCall, status: 'accepted' });
      setIncomingCall(null);
    } catch (err) {
      console.error(err);
      toast.error("Kamera/Mikrofon konnte nicht aktiviert werden");
      declineCall();
    }
  };

  const declineCall = async () => {
    if (incomingCall) {
      await base44.entities.VideoCall.update(incomingCall.id, { status: 'rejected' });
      setIncomingCall(null);
    }
  };

  const endCallLocally = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
      setLocalStream(null);
    }
    localStreamRef.current = null;
    setRemoteStream(null);
    setActiveCall(null);
    setIncomingCall(null);
    setIsCaller(false);
    if (unsubscribeSignals.current) {
      unsubscribeSignals.current();
      unsubscribeSignals.current = null;
    }
  };

  const endCall = async () => {
    if (activeCall) {
      await base44.entities.VideoCall.update(activeCall.id, { status: 'ended' }).catch(() => {});
    }
    endCallLocally();
  };

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(t => t.enabled = !t.enabled);
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(t => t.enabled = !t.enabled);
      setIsVideoMuted(!isVideoMuted);
    }
  };

  useEffect(() => {
    if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;
    if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = remoteStream;
  }, [activeCall, localStream, remoteStream]);

  if (!currentUser) return null;

  return (
    <>
      <AnimatePresence>
        {incomingCall && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-24 left-1/2 z-[9999] bg-slate-900 border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-6 min-w-[300px]"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10">
                {incomingCall.caller_avatar ? (
                  <img src={incomingCall.caller_avatar} alt="caller" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-cyan-600 font-bold text-white">
                    {incomingCall.caller_username[0]}
                  </div>
                )}
              </div>
              <div>
                <p className="font-bold text-white">{incomingCall.caller_username}</p>
                <p className="text-sm text-cyan-400 animate-pulse">Anruf...</p>
              </div>
            </div>
            <div className="flex gap-2 ml-auto">
              <Button onClick={declineCall} size="icon" className="rounded-full bg-red-500 hover:bg-red-600 text-white">
                <PhoneOff className="w-5 h-5" />
              </Button>
              <Button onClick={acceptCall} size="icon" className="rounded-full bg-green-500 hover:bg-green-600 text-white">
                <Phone className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeCall && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[500px] bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 z-[9999] flex flex-col"
          >
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-white font-bold text-sm">
                  {activeCall.status === 'ringing' ? 'Wählt...' : 'Anruf mit ' + (isCaller ? activeCall.receiver_username : activeCall.caller_username)}
                </span>
              </div>
            </div>

            <div className="relative flex-1 bg-zinc-900">
              {activeCall.status === 'accepted' ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-4">
                    <User className="w-12 h-12 text-white/50" />
                  </div>
                  <p className="text-white/50 animate-pulse">Warten auf Verbindung...</p>
                </div>
              )}

              <div className="absolute bottom-4 right-4 w-28 h-40 bg-black rounded-xl overflow-hidden border-2 border-white/20 shadow-lg">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="p-4 bg-black border-t border-white/10 flex justify-center gap-4">
              <Button 
                onClick={toggleAudio} 
                variant="outline" 
                size="icon" 
                className={`rounded-full w-12 h-12 ${isAudioMuted ? 'bg-red-500/20 text-red-500 border-red-500/50' : 'bg-white/10 text-white border-white/20'}`}
              >
                {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
              <Button 
                onClick={endCall} 
                size="icon" 
                className="rounded-full w-14 h-14 bg-red-500 hover:bg-red-600 text-white"
              >
                <PhoneOff className="w-6 h-6" />
              </Button>
              <Button 
                onClick={toggleVideo} 
                variant="outline" 
                size="icon" 
                className={`rounded-full w-12 h-12 ${isVideoMuted ? 'bg-red-500/20 text-red-500 border-red-500/50' : 'bg-white/10 text-white border-white/20'}`}
              >
                {isVideoMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}