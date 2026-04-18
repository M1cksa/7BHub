import { useCallback, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { functionsBaseUrl } from '@/api/supabaseClient';

/**
 * Spielt ein Google-Drive-Video nativ als <video>-Element ab und proxied den
 * Stream über die Edge-Function `streamGoogleDriveVideo` (Range-Support).
 * Dadurch funktionieren Zeitleiste, Events (timeupdate, seeking) und die
 * Interactive-Moments-Features identisch zum alten Base44-Player.
 */
export default function GoogleDrivePlayer({ fileId, poster, onVideoRef }) {
  const handleRef = useCallback(
    (el) => { onVideoRef?.(el); },
    [onVideoRef],
  );

  const driveId = useMemo(() => {
    if (!fileId) return null;
    if (typeof fileId === 'string' && (fileId.includes('http') || fileId.includes('drive.google.com'))) {
      const match = fileId.match(/[-\w]{25,}/);
      return match ? match[0] : null;
    }
    return fileId;
  }, [fileId]);

  if (!driveId) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
          <p className="text-white/60 text-sm">Lade Video...</p>
        </div>
      </div>
    );
  }

  const streamSrc = `${functionsBaseUrl}/streamGoogleDriveVideo?fileId=${encodeURIComponent(driveId)}`;

  return (
    <video
      ref={handleRef}
      src={streamSrc}
      poster={poster}
      controls
      playsInline
      preload="metadata"
      controlsList="nodownload"
      className="w-full h-full object-contain"
      autoPlay
    />
  );
}
