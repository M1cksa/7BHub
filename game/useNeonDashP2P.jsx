import { useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export function useNeonDashP2P() {
  const pcRef = useRef(null);
  const dcRef = useRef(null);
  const sigSubRef = useRef(null);
  const pendingIceRef = useRef([]);
  const connectedRef = useRef(false);

  const cleanup = useCallback(() => {
    if (sigSubRef.current) { sigSubRef.current(); sigSubRef.current = null; }
    if (dcRef.current) { try { dcRef.current.close(); } catch {} dcRef.current = null; }
    if (pcRef.current) { try { pcRef.current.close(); } catch {} pcRef.current = null; }
    connectedRef.current = false;
    pendingIceRef.current = [];
  }, []);

  const send = useCallback((data) => {
    const dc = dcRef.current;
    if (dc?.readyState === 'open') {
      try { dc.send(JSON.stringify(data)); return true; } catch {}
    }
    return false;
  }, []);

  const init = useCallback(async ({ matchId, isP1, onMessage, onConnected, onFallback }) => {
    cleanup();

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pcRef.current = pc;

    const setupDC = (dc) => {
      dcRef.current = dc;
      dc.onopen = () => {
        connectedRef.current = true;
        console.log('[P2P] DataChannel open!');
        onConnected?.();
      };
      dc.onmessage = (e) => {
        try { onMessage?.(JSON.parse(e.data)); } catch {}
      };
      dc.onclose = () => { connectedRef.current = false; };
    };

    if (isP1) {
      setupDC(pc.createDataChannel('nd', { ordered: false, maxRetransmits: 0 }));
    } else {
      pc.ondatachannel = (e) => setupDC(e.channel);
    }

    pc.onicecandidate = (e) => {
      if (!e.candidate) return;
      base44.entities.WebRTCSignal.create({
        video_id: matchId,
        signal_type: 'ice-candidate',
        signal_data: JSON.stringify(e.candidate),
        sender: isP1 ? 'broadcaster' : 'viewer',
        viewer_id: matchId + (isP1 ? '_1' : '_2'),
        processed: false,
      }).catch(() => {});
    };

    const flushPendingIce = async () => {
      const pending = pendingIceRef.current.splice(0);
      for (const c of pending) {
        await pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
      }
    };

    // Subscribe to signaling from the OTHER peer
    sigSubRef.current = base44.entities.WebRTCSignal.subscribe(async (event) => {
      const sig = event.data;
      if (!sig || sig.video_id !== matchId || sig.processed) return;
      const fromP1 = sig.sender === 'broadcaster';
      if (isP1 === fromP1) return; // ignore own signals

      try {
        const data = JSON.parse(sig.signal_data);
        if (sig.signal_type === 'offer' && !isP1) {
          await pc.setRemoteDescription(new RTCSessionDescription(data));
          await flushPendingIce();
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          base44.entities.WebRTCSignal.create({
            video_id: matchId, signal_type: 'answer',
            signal_data: JSON.stringify(answer),
            sender: 'viewer', viewer_id: matchId + '_2', processed: false,
          }).catch(() => {});
        } else if (sig.signal_type === 'answer' && isP1) {
          if (pc.signalingState === 'have-local-offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(data));
            await flushPendingIce();
          }
        } else if (sig.signal_type === 'ice-candidate') {
          if (pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(data)).catch(() => {});
          } else {
            pendingIceRef.current.push(data);
          }
        }
      } catch {}
    });

    // P1 creates the offer
    if (isP1) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      base44.entities.WebRTCSignal.create({
        video_id: matchId, signal_type: 'offer',
        signal_data: JSON.stringify(offer),
        sender: 'broadcaster', viewer_id: matchId + '_1', processed: false,
      }).catch(() => {});
    }

    // Fallback if not connected in 8s
    setTimeout(() => {
      if (!connectedRef.current) {
        console.log('[P2P] Timeout — falling back to DB polling');
        onFallback?.();
      }
    }, 8000);
  }, [cleanup]);

  return { init, send, cleanup, connectedRef };
}