import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, X, Loader2, Film, Download, Play, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function VideoGenerator() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('app_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const generateVideo = async () => {
    if (!prompt.trim()) {
      toast.error('Bitte gib einen Prompt ein');
      return;
    }

    if (!user) {
      toast.error('Bitte melde dich an');
      return;
    }

    try {
      setGenerating(true);
      setProgress(10);

      // Step 1: Generate video script
      setProgress(20);
      const scriptResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `Erstelle ein detailliertes Video-Skript (auf Deutsch) für folgendes Thema: "${prompt}". 
        
Das Skript sollte 4-6 Szenen enthalten. Für jede Szene:
- Szenennummer
- Visuelle Beschreibung (für Bildgenerierung)
- Sprechtext / Voiceover

Format als JSON:
{
  "titel": "...",
  "szenen": [
    {
      "nummer": 1,
      "visual": "detaillierte Bildbeschreibung",
      "text": "Sprechtext"
    }
  ]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            titel: { type: "string" },
            szenen: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  nummer: { type: "number" },
                  visual: { type: "string" },
                  text: { type: "string" }
                }
              }
            }
          }
        }
      });

      const script = scriptResponse;
      setProgress(40);

      // Step 2: Generate images for each scene
      const scenes = [];
      const totalScenes = script.szenen.length;
      
      for (let i = 0; i < script.szenen.length; i++) {
        const scene = script.szenen[i];
        setProgress(40 + (i / totalScenes) * 40);
        
        try {
          const imageResult = await base44.integrations.Core.GenerateImage({
            prompt: `${scene.visual}, cinematic, high quality, professional, 4K`
          });
          
          scenes.push({
            ...scene,
            imageUrl: imageResult.url
          });
        } catch (error) {
          console.error('Image generation error for scene', i, error);
          scenes.push({
            ...scene,
            imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1920'
          });
        }
      }

      setProgress(90);

      // Step 3: Create video entry
      const videoTitle = script.titel || prompt.slice(0, 100);
      const videoDescription = script.szenen.map((s, i) => `${i + 1}. ${s.text}`).join('\n\n');
      
      const thumbnailUrl = scenes[0]?.imageUrl || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1920';

      setGeneratedVideo({
        title: videoTitle,
        description: videoDescription,
        scenes,
        thumbnail: thumbnailUrl
      });

      setProgress(100);
      toast.success('Video erfolgreich generiert!');
      
    } catch (error) {
      console.error('Video generation error:', error);
      toast.error('Fehler bei der Video-Generierung');
    } finally {
      setGenerating(false);
    }
  };

  const saveVideo = async () => {
    if (!generatedVideo || !user) return;

    try {
      // Step 1: Create video from scenes using backend function
      toast.info('Erstelle Video aus Szenen...');
      
      const videoResponse = await base44.functions.invoke('createVideoFromScenes', {
        scenes: generatedVideo.scenes,
        title: generatedVideo.title,
        description: generatedVideo.description
      });

      if (!videoResponse.data.success) {
        throw new Error(videoResponse.data.message || 'Video creation failed');
      }

      // Step 2: Save video to database
      await base44.entities.Video.create({
        title: generatedVideo.title,
        description: generatedVideo.description,
        video_url: videoResponse.data.video_url,
        thumbnail_url: videoResponse.data.thumbnail_url,
        category: 'entertainment',
        creator_name: user.username,
        creator_avatar: user.avatar_url,
        views: 0,
        likes_count: 0,
        status: 'vod',
        duration: `${Math.floor(videoResponse.data.duration / 60)}:${(videoResponse.data.duration % 60).toString().padStart(2, '0')}`
      });

      toast.success('Video erfolgreich erstellt und gespeichert!');
      setIsOpen(false);
      setGeneratedVideo(null);
      setPrompt('');
      
      // Refresh the page to show the new video
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.message || 'Fehler beim Speichern');
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-2xl shadow-violet-500/50 flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Film className="w-6 h-6 text-white" />
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              onClick={() => !generating && setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-2xl max-h-[85vh] bg-[#0a0a0b] rounded-3xl border border-white/10 shadow-2xl z-50 overflow-hidden mx-4"
            >
              <div className="flex flex-col h-full max-h-[85vh]">
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                      <Film className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-white">KI Video Generator</h2>
                      <p className="text-white/50 text-sm">Erstelle Videos aus Text</p>
                    </div>
                  </div>
                  <button
                    onClick={() => !generating && setIsOpen(false)}
                    className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-white/50" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                  {!generatedVideo ? (
                    <div className="space-y-6">
                      <div>
                        <label className="text-white font-medium mb-3 block">
                          Beschreibe dein Video
                        </label>
                        <Textarea
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder="z.B. Ein episches Abenteuer durch den Weltraum mit futuristischen Raumschiffen..."
                          className="bg-white/5 border-white/10 text-white min-h-[150px] resize-none"
                          disabled={generating}
                        />
                      </div>

                      {generating && (
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm text-white/70">
                            <span className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                              Generiere Video...
                            </span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-600"
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-white/40 text-center">
                            Das kann 30-60 Sekunden dauern...
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">{generatedVideo.title}</h3>
                        <p className="text-white/60 text-sm whitespace-pre-line">{generatedVideo.description}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                        {generatedVideo.scenes.map((scene, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="relative rounded-xl overflow-hidden border border-white/10 group"
                          >
                            <img
                              src={scene.imageUrl}
                              alt={`Szene ${scene.nummer}`}
                              className="w-full aspect-video object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="absolute bottom-0 left-0 right-0 p-4">
                                <p className="text-white text-xs font-medium mb-1">Szene {scene.nummer}</p>
                                <p className="text-white/70 text-xs line-clamp-2">{scene.text}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 md:p-6 border-t border-white/10">
                  {!generatedVideo ? (
                    <Button
                      onClick={generateVideo}
                      disabled={generating || !prompt.trim()}
                      className="w-full h-12 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generiere...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Video generieren
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="flex gap-3">
                      <Button
                        onClick={() => {
                          setGeneratedVideo(null);
                          setPrompt('');
                          setProgress(0);
                        }}
                        variant="outline"
                        className="flex-1 border-white/10"
                      >
                        Neues Video
                      </Button>
                      <Button
                        onClick={saveVideo}
                        className="flex-1 bg-gradient-to-r from-cyan-600 to-teal-500"
                      >
                        <Film className="w-4 h-4 mr-2" />
                        Video erstellen & speichern
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}