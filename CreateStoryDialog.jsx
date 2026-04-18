import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Image as ImageIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function CreateStoryDialog({ isOpen, onClose, user }) {
  const [type, setType] = useState('post');
  const [duration, setDuration] = useState('24h');
  const [content, setContent] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!content.trim() && !imageFile) {
      toast.error('Inhalt oder Bild erforderlich');
      return;
    }

    if (type === 'poll' && pollOptions.filter(o => o.trim()).length < 2) {
      toast.error('Mindestens 2 Optionen erforderlich');
      return;
    }

    // Check trial phase
    if (user.role !== 'admin' && !user.trial_completed) {
      const accountAge = Date.now() - new Date(user.created_date).getTime();
      if (accountAge < (24 * 60 * 60 * 1000)) {
        const hoursLeft = Math.ceil((24 * 60 * 60 * 1000 - accountAge) / (60 * 60 * 1000));
        toast.error(`Testphase aktiv - Stories erst in ${hoursLeft}h möglich`);
        return;
      }
    }

    setCreating(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: imageFile });
        imageUrl = file_url;
      }

      const expiresAt = new Date();
      if (duration === '7d') {
        expiresAt.setDate(expiresAt.getDate() + 7);
      } else {
        expiresAt.setHours(expiresAt.getHours() + 24);
      }

      await base44.entities.CreatorStory.create({
        creator_username: user.username,
        creator_avatar: user.avatar_url,
        type: imageFile && !content.trim() ? 'image' : type,
        content,
        image_url: imageUrl,
        poll_options: type === 'poll' ? pollOptions.filter(o => o.trim()) : [],
        expires_at: expiresAt.toISOString(),
        views_count: 0,
        comments_count: 0
      });

      toast.success('Story erstellt!');
      setContent('');
      setPollOptions(['', '']);
      setType('post');
      setDuration('24h');
      setImageFile(null);
      setImagePreview(null);
      onClose();
    } catch (e) {
      toast.error('Fehler beim Erstellen');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a1c] border-white/10 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">Neue Story erstellen</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={() => setType('post')}
              variant={type === 'post' ? 'default' : 'outline'}
              className="flex-1"
            >
              💬 Post
            </Button>
            <Button
              onClick={() => setType('poll')}
              variant={type === 'poll' ? 'default' : 'outline'}
              className="flex-1"
            >
              📊 Umfrage
            </Button>
          </div>

          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={type === 'post' ? 'Was möchtest du teilen?' : 'Stelle eine Frage...'}
            className="bg-white/5 border-white/10 text-white min-h-[120px]"
          />

          {type === 'post' && (
            <div>
              <label className="text-sm text-white/60 mb-2 block">Bild (optional)</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setImageFile(file);
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed border-white/10 rounded-xl p-3 hover:border-cyan-500/30 transition-colors">
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-1 right-1 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center hover:bg-black/90"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-3">
                      <ImageIcon className="w-6 h-6 text-white/30" />
                      <span className="text-white/40 text-xs">Bild auswählen</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {type === 'poll' && (
            <div className="space-y-2">
              <label className="text-sm text-white/60 font-medium">Optionen</label>
              {pollOptions.map((option, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...pollOptions];
                      newOptions[idx] = e.target.value;
                      setPollOptions(newOptions);
                    }}
                    placeholder={`Option ${idx + 1}`}
                    className="bg-white/5 border-white/10 text-white"
                  />
                  {pollOptions.length > 2 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              {pollOptions.length < 4 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPollOptions([...pollOptions, ''])}
                  className="w-full border-white/10"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Option hinzufügen
                </Button>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm text-white/60 font-medium">Sichtbarkeit</label>
            <div className="flex gap-2">
              <Button
                onClick={() => setDuration('24h')}
                variant={duration === '24h' ? 'default' : 'outline'}
                className="flex-1 text-xs h-9 bg-white/5 border-white/10"
              >
                24 Stunden
              </Button>
              <Button
                onClick={() => setDuration('7d')}
                variant={duration === '7d' ? 'default' : 'outline'}
                className="flex-1 text-xs h-9 bg-white/5 border-white/10"
              >
                7 Tage
              </Button>
            </div>
          </div>

          <div className="text-xs text-white/40 text-center mt-2">
            Story ist {duration === '24h' ? '24 Stunden' : '7 Tage'} sichtbar
          </div>

          <Button
            onClick={handleCreate}
            disabled={creating}
            className="w-full bg-gradient-to-r from-cyan-600 to-teal-600"
          >
            {creating ? 'Wird erstellt...' : 'Story veröffentlichen'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}