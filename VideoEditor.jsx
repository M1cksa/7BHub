import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scissors, Wand2, Type, Sparkles, Download, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function VideoEditor({ videoUrl, onSave, onCancel }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);
  const [activeTab, setActiveTab] = useState('trim');
  const [filter, setFilter] = useState('none');
  const [subtitles, setSubtitles] = useState([]);
  const [newSubtitle, setNewSubtitle] = useState({ time: 0, text: '' });
  const [generating, setGenerating] = useState(false);

  const filters = [
    { id: 'none', label: 'Original', style: '' },
    { id: 'grayscale', label: 'Schwarz/Weiß', style: 'grayscale(100%)' },
    { id: 'sepia', label: 'Sepia', style: 'sepia(100%)' },
    { id: 'brightness', label: 'Hell', style: 'brightness(1.3)' },
    { id: 'contrast', label: 'Kontrast', style: 'contrast(1.5)' },
    { id: 'saturate', label: 'Sättigung', style: 'saturate(1.8)' },
    { id: 'vintage', label: 'Vintage', style: 'sepia(50%) contrast(1.2) brightness(0.9)' },
    { id: 'cool', label: 'Cool', style: 'hue-rotate(180deg)' }
  ];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setTrimEnd(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const generateAutoSubtitles = async () => {
    setGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Erstelle Untertitel-Timestamps für ein ${Math.round(duration)}s Video. 
        Generiere 5-8 Untertitel-Einträge, die über die Video-Länge verteilt sind.
        
        Format als JSON:
        {
          "subtitles": [
            {"time": 0, "text": "Intro Text"},
            {"time": 3, "text": "Nächster Text"}
          ]
        }`,
        response_json_schema: {
          type: "object",
          properties: {
            subtitles: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  time: { type: "number" },
                  text: { type: "string" }
                }
              }
            }
          }
        }
      });

      setSubtitles(response.subtitles || []);
      toast.success('Untertitel generiert!');
    } catch (error) {
      console.error('Subtitle generation error:', error);
      toast.error('Fehler bei der Untertitel-Generierung');
    } finally {
      setGenerating(false);
    }
  };

  const addSubtitle = () => {
    if (!newSubtitle.text.trim()) return;
    setSubtitles([...subtitles, { ...newSubtitle, time: currentTime }].sort((a, b) => a.time - b.time));
    setNewSubtitle({ time: 0, text: '' });
    toast.success('Untertitel hinzugefügt');
  };

  const removeSubtitle = (index) => {
    setSubtitles(subtitles.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave({
      videoUrl,
      trimStart,
      trimEnd,
      filter,
      subtitles
    });
  };

  const currentSubtitle = subtitles.find(
    (sub) => currentTime >= sub.time && currentTime < sub.time + 3
  );

  return (
    <div className="space-y-4">
      <div className="relative rounded-2xl overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full aspect-video object-contain"
          style={{ filter: filters.find(f => f.id === filter)?.style }}
        />
        
        {currentSubtitle && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center px-4">
            <div className="bg-black/80 px-4 py-2 rounded-lg">
              <p className="text-white text-sm md:text-base font-medium text-center">
                {currentSubtitle.text}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity"
        >
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            {isPlaying ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white ml-1" />}
          </div>
        </button>
      </div>

      <div className="space-y-2">
        <Slider
          value={[currentTime]}
          max={duration}
          step={0.1}
          onValueChange={handleSeek}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-white/50">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('trim')}
          className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
            activeTab === 'trim' ? 'bg-cyan-600 text-white' : 'bg-white/5 text-white/50'
          }`}
        >
          <Scissors className="w-4 h-4 inline mr-2" />
          Schneiden
        </button>
        <button
          onClick={() => setActiveTab('effects')}
          className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
            activeTab === 'effects' ? 'bg-cyan-600 text-white' : 'bg-white/5 text-white/50'
          }`}
        >
          <Wand2 className="w-4 h-4 inline mr-2" />
          Effekte
        </button>
        <button
          onClick={() => setActiveTab('subtitles')}
          className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
            activeTab === 'subtitles' ? 'bg-cyan-600 text-white' : 'bg-white/5 text-white/50'
          }`}
        >
          <Type className="w-4 h-4 inline mr-2" />
          Untertitel
        </button>
      </div>

      <div className="bg-white/5 rounded-2xl p-4">
        {activeTab === 'trim' && (
          <div className="space-y-4">
            <div>
              <label className="text-white text-sm font-medium mb-2 block">Start: {formatTime(trimStart)}</label>
              <Slider
                value={[trimStart]}
                max={duration}
                step={0.1}
                onValueChange={(v) => setTrimStart(Math.min(v[0], trimEnd - 0.5))}
              />
            </div>
            <div>
              <label className="text-white text-sm font-medium mb-2 block">Ende: {formatTime(trimEnd)}</label>
              <Slider
                value={[trimEnd]}
                max={duration}
                step={0.1}
                onValueChange={(v) => setTrimEnd(Math.max(v[0], trimStart + 0.5))}
              />
            </div>
            <p className="text-xs text-white/40">
              Länge: {formatTime(trimEnd - trimStart)}
            </p>
          </div>
        )}

        {activeTab === 'effects' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`p-3 rounded-xl text-sm font-medium transition-all ${
                  filter === f.id
                    ? 'bg-cyan-600 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'subtitles' && (
          <div className="space-y-4">
            <Button
              onClick={generateAutoSubtitles}
              disabled={generating}
              className="w-full bg-violet-600 hover:bg-violet-500"
            >
              {generating ? 'Generiere...' : <><Sparkles className="w-4 h-4 mr-2" />KI Untertitel</>}
            </Button>

            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newSubtitle.text}
                  onChange={(e) => setNewSubtitle({ ...newSubtitle, text: e.target.value })}
                  placeholder="Untertitel Text..."
                  className="bg-white/5 border-white/10 text-white flex-1"
                />
                <Button onClick={addSubtitle} size="sm">+</Button>
              </div>
              <p className="text-xs text-white/40">Bei {formatTime(currentTime)} hinzufügen</p>
            </div>

            {subtitles.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {subtitles.map((sub, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 bg-white/5 p-2 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/50">{formatTime(sub.time)}</p>
                      <p className="text-sm text-white truncate">{sub.text}</p>
                    </div>
                    <button
                      onClick={() => removeSubtitle(i)}
                      className="text-red-400 hover:text-red-300 text-xs px-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1 border-white/10">
          Abbrechen
        </Button>
        <Button onClick={handleSave} className="flex-1 bg-gradient-to-r from-cyan-600 to-teal-500">
          <Download className="w-4 h-4 mr-2" />
          Übernehmen
        </Button>
      </div>
    </div>
  );
}