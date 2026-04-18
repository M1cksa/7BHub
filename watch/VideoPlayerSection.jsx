import { useState, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';
import VideoFrameWrapper from '@/components/VideoFrameWrapper';
import GoogleDrivePlayer from '@/components/video/GoogleDrivePlayer';

export default function VideoPlayerSection({ video, adShown, onVideoRef }) {
  const [, setVideoEl] = useState(null);

  const handleRef = useCallback((el) => {
    setVideoEl(el);
    onVideoRef?.(el);
  }, [onVideoRef]);

  return (
    <VideoFrameWrapper frameId={video.video_frame || 'none'}>
      <div className="relative aspect-video bg-black rounded-xl md:rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/5">
        <div className="absolute -inset-10 bg-gradient-to-br from-violet-600/15 via-fuchsia-600/8 to-cyan-600/8 blur-[120px] -z-10 opacity-50" />

        {video?.video_url && adShown ? (
          video.video_source === 'google_drive' ? (
            <GoogleDrivePlayer
              fileId={video.drive_file_id || video.video_url}
              poster={video.thumbnail_url}
              onVideoRef={handleRef}
            />
          ) : (
            <video
              ref={handleRef}
              src={video.video_url}
              poster={video.thumbnail_url}
              controls
              playsInline
              preload="auto"
              controlsList="nodownload"
              className="w-full h-full object-contain"
              autoPlay
            />
          )
        ) : !adShown ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-white/50 text-sm">Wird geladen...</p>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-[#111]">
            <AlertTriangle className="w-10 h-10 text-red-400 mb-3" />
            <h3 className="text-white font-bold mb-1">Video nicht verfügbar</h3>
            <p className="text-white/40 text-sm">Keine Videodatei vorhanden.</p>
          </div>
        )}
      </div>
    </VideoFrameWrapper>
  );
}
