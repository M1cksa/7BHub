import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, 
  SkipBack, SkipForward, PictureInPicture, Subtitles, Gauge,
  Bookmark, ChevronRight, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

export default function AdvancedVideoPlayer({ 
  videoUrl, 
  thumbnailUrl, 
  title,
  chapters = [],
  subtitles = [],
  onTimeUpdate,
  className 
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState('auto');
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [selectedSubtitle, setSelectedSubtitle] = useState(null);
  const [buffering, setBuffering] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    const handleLoadedMetadata = () => {
      console.log('Video metadata loaded:', { duration: video.duration, videoWidth: video.videoWidth, videoHeight: video.videoHeight });
      setDuration(video.duration);
    };
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime);
    };
    const handleWaiting = () => setBuffering(true);
    const handleCanPlay = () => setBuffering(false);
    const handleEnterPiP = () => setIsPiP(true);
    const handleLeavePiP = () => setIsPiP(false);
    const handleError = () => {
      console.error('Video error:', video.error?.code, video.error?.message);
      setBuffering(false);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('enterpictureinpicture', handleEnterPiP);
    video.addEventListener('leavepictureinpicture', handleLeavePiP);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('enterpictureinpicture', handleEnterPiP);
      video.removeEventListener('leavepictureinpicture', handleLeavePiP);
      video.removeEventListener('error', handleError);
    };
  }, [videoUrl, onTimeUpdate]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  const handleSeek = (value) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !muted;
      videoRef.current.muted = newMuted;
      setMuted(newMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const skip = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
    }
  };

  const togglePiP = async () => {
    if (!document.pictureInPictureElement) {
      try {
        await videoRef.current?.requestPictureInPicture();
      } catch (err) {
        console.error('PiP error:', err);
      }
    } else {
      await document.exitPictureInPicture();
    }
  };

  const jumpToChapter = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return h > 0 
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getCurrentChapter = () => {
    return chapters.find((ch, i) => {
      const nextChapter = chapters[i + 1];
      return currentTime >= ch.time && (!nextChapter || currentTime < nextChapter.time);
    });
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  };

  const currentChapter = getCurrentChapter();

  return (
    <div 
      ref={containerRef}
      className={cn("relative bg-black rounded-2xl overflow-hidden group", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={thumbnailUrl}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        crossOrigin="anonymous"
      >
        {subtitles.map((sub, idx) => (
          <track
            key={idx}
            kind="subtitles"
            src={sub.url}
            srcLang={sub.lang}
            label={sub.label}
            default={idx === 0}
          />
        ))}
      </video>

      {/* Buffering Indicator */}
      <AnimatePresence>
        {buffering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-30"
          >
            <Loader2 className="w-16 h-16 text-cyan-400 animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chapter Indicator */}
      <AnimatePresence>
        {currentChapter && showControls && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-6 left-6 right-6 z-20"
          >
            <div className="glass-effect rounded-2xl px-4 py-3 flex items-center gap-3">
              <Bookmark className="w-5 h-5 text-cyan-400" />
              <span className="text-white font-bold">{currentChapter.title}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-20 flex flex-col justify-end p-4 md:p-6"
          >
            {/* Progress Bar with Chapters */}
            <div className="mb-4 relative">
              <div className="relative group/progress">
                <Slider
                  value={[currentTime]}
                  max={duration}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="cursor-pointer"
                />
                {/* Chapter Markers */}
                {chapters.map((chapter, idx) => (
                  <div
                    key={idx}
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-cyan-400 rounded-full cursor-pointer hover:scale-150 transition-transform"
                    style={{ left: `${(chapter.time / duration) * 100}%` }}
                    onClick={() => jumpToChapter(chapter.time)}
                  />
                ))}
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-white/70 text-sm font-mono">{formatTime(currentTime)}</span>
                <span className="text-white/70 text-sm font-mono">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between gap-4">
              {/* Left Controls */}
              <div className="flex items-center gap-2 md:gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePlay}
                  className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl"
                >
                  {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => skip(-10)}
                  className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/10"
                >
                  <SkipBack className="w-5 h-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => skip(10)}
                  className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/10"
                >
                  <SkipForward className="w-5 h-5" />
                </Button>

                <div className="hidden md:flex items-center gap-2 ml-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                    className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/10"
                  >
                    {muted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </Button>
                  <div className="w-24">
                    <Slider
                      value={[muted ? 0 : volume]}
                      max={1}
                      step={0.01}
                      onValueChange={handleVolumeChange}
                    />
                  </div>
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-2">
                {/* Playback Speed */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettings(!showSettings)}
                    className="h-10 px-3 rounded-full bg-white/5 hover:bg-white/10 gap-2"
                  >
                    <Gauge className="w-4 h-4" />
                    <span className="hidden md:inline text-sm">{playbackRate}x</span>
                  </Button>

                  <AnimatePresence>
                    {showSettings && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full mb-2 right-0 glass-effect rounded-2xl p-3 min-w-[200px]"
                      >
                        <div className="text-white/90 font-bold mb-2 text-sm">Wiedergabe</div>
                        {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                          <button
                            key={rate}
                            onClick={() => {
                              setPlaybackRate(rate);
                              setShowSettings(false);
                            }}
                            className={cn(
                              "w-full text-left px-3 py-2 rounded-lg transition-colors text-sm",
                              playbackRate === rate 
                                ? "bg-cyan-500/20 text-cyan-400" 
                                : "text-white/70 hover:bg-white/10"
                            )}
                          >
                            {rate}x {rate === 1 && '(Normal)'}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Subtitles */}
                {subtitles.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSubtitles(!showSubtitles)}
                    className={cn(
                      "h-10 w-10 rounded-full",
                      showSubtitles ? "bg-cyan-500/20 text-cyan-400" : "bg-white/5 hover:bg-white/10"
                    )}
                  >
                    <Subtitles className="w-5 h-5" />
                  </Button>
                )}

                {/* PiP */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePiP}
                  className="hidden md:flex h-10 w-10 rounded-full bg-white/5 hover:bg-white/10"
                >
                  <PictureInPicture className="w-5 h-5" />
                </Button>

                {/* Fullscreen */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/10"
                >
                  {fullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chapters List */}
      {chapters.length > 0 && (
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-black/95 backdrop-blur-xl z-30 overflow-y-auto p-4 hidden lg:block"
            >
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-cyan-400" />
                Kapitel
              </h3>
              <div className="space-y-2">
                {chapters.map((chapter, idx) => (
                  <button
                    key={idx}
                    onClick={() => jumpToChapter(chapter.time)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl transition-all group",
                      currentChapter?.time === chapter.time
                        ? "bg-cyan-500/20 border-2 border-cyan-400/50"
                        : "bg-white/5 hover:bg-white/10 border-2 border-transparent"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white/90 font-bold text-sm">{chapter.title}</span>
                      <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-cyan-400 transition-colors" />
                    </div>
                    <span className="text-white/50 text-xs font-mono">{formatTime(chapter.time)}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}