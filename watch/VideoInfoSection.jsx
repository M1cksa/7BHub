import { ThumbsUp, Share2, Flag, Trash2, Star, Copy, Check, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

function FollowerCount({ followers }) {
  return <span className="text-white/40 text-xs">{followers} Abonnenten</span>;
}

export default function VideoInfoSection({
  video, contentType, creatorName, followers, isFollowing, hasLiked,
  currentUser, onLike, onFollow, onDelete, onReport, videoId
}) {
  const [copied, setCopied] = useState(false);

  const getVideoUrl = () => `${window.location.origin}${createPageUrl('Watch')}?id=${videoId}`;

  const handleShare = () => {
    navigator.clipboard.writeText(getVideoUrl());
    setCopied(true);
    toast.success('Link kopiert!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`🎬 ${video.title} – Schau dir das an!\n${getVideoUrl()}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareToSnapchat = () => {
    const url = encodeURIComponent(getVideoUrl());
    window.open(`https://www.snapchat.com/scan?attachmentUrl=${url}`, '_blank');
  };

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-4 md:p-6 space-y-4">
      {video?.is_premium && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-400/20 w-fit">
          <Star className="w-4 h-4 text-amber-400" />
          <span className="text-amber-300 text-sm font-bold">Premium Content</span>
        </div>
      )}

      <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-tight">{video.title}</h1>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Creator */}
        <div className="flex items-center gap-3">
          <Link to={createPageUrl('CreatorProfile') + `?username=${creatorName}`}>
            <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 p-[2px] cursor-pointer hover:scale-105 transition-transform shadow-lg shadow-violet-500/20">
              <div className="w-full h-full rounded-full overflow-hidden bg-black">
                {video.creator_avatar ? (
                  <img src={video.creator_avatar} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold flex items-center justify-center h-full">{creatorName?.[0]?.toUpperCase()}</span>
                )}
              </div>
            </div>
          </Link>
          <div>
            <Link to={createPageUrl('CreatorProfile') + `?username=${creatorName}`}>
              <h3 className="text-white font-bold hover:text-violet-300 transition-colors">{creatorName}</h3>
            </Link>
            <FollowerCount followers={followers} />
          </div>
          <button
            onClick={onFollow}
            className={`ml-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              isFollowing ? 'bg-white/5 border-white/10 text-white/50' : 'bg-white/10 border-white/15 text-white hover:bg-white/20'
            }`}
          >
            {isFollowing ? '✓ Abonniert' : '+ Abonnieren'}
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              hasLiked ? 'bg-violet-500/15 border-violet-500/25 text-violet-300' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
            }`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-current' : ''}`} />
            {video.likes_count || 0}
          </button>

          <Dialog>
            <DialogTrigger asChild>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border bg-white/5 border-white/10 text-white/60 hover:bg-white/10 transition-colors">
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Teilen</span>
              </button>
            </DialogTrigger>
            <DialogContent className="bg-[#111] border-white/10 text-white max-w-md">
              <DialogHeader><DialogTitle>Video teilen</DialogTitle></DialogHeader>
              <div className="space-y-3">
                {/* Social Share Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={shareToWhatsApp}
                    className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.03] active:scale-95"
                    style={{ background: 'rgba(37,211,102,0.15)', border: '1px solid rgba(37,211,102,0.35)', color: '#25d366' }}
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.116 1.532 5.847L.06 23.413l5.756-1.46A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.65-.502-5.176-1.382l-.371-.22-3.42.867.893-3.328-.241-.385A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                    WhatsApp
                  </button>
                  <button
                    onClick={shareToSnapchat}
                    className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.03] active:scale-95"
                    style={{ background: 'rgba(255,252,0,0.12)', border: '1px solid rgba(255,252,0,0.35)', color: '#fffc00' }}
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12.166 2c.93 0 4.056.26 5.52 3.593.41.953.313 2.587.235 3.885l-.007.117c-.01.15.085.22.195.268.124.052.493.15.907.15.368 0 .763-.082 1.1-.246.144-.068.268-.102.373-.102.21 0 .371.11.439.192.1.12.11.26.04.395-.115.215-.49.49-.994.67-.09.032-.234.071-.404.113-.27.065-.642.156-.78.357-.072.105-.088.25-.05.44.028.133.84 3.3-1.61 4.72-.063.037-.11.086-.106.142.004.04.034.08.087.118.535.38 1.464.7 2.788.948.247.046.395.198.3.4-.295.63-1.795 1.12-4.014 1.337-.047.006-.09.043-.113.1-.024.059-.018.124.017.177.148.228.497.658.487 1.26-.008.5-.23.847-.42 1.04-.195.197-.39.28-.584.28-.137 0-.27-.038-.383-.076l-.006-.002c-.325-.111-.718-.244-1.26-.244-.49 0-.848.113-1.19.22-.44.136-.869.268-1.593.268-.778 0-1.197-.148-1.622-.292-.337-.113-.689-.23-1.163-.23-.543 0-.936.133-1.26.244l-.006.002c-.113.038-.246.075-.383.075-.194 0-.39-.083-.584-.28-.19-.193-.412-.54-.42-1.04-.01-.602.34-1.032.487-1.26.035-.053.04-.118.017-.177-.023-.057-.066-.094-.113-.1-2.22-.217-3.72-.707-4.014-1.337-.094-.202.054-.354.3-.4 1.324-.248 2.253-.568 2.788-.948.053-.038.083-.078.087-.118.004-.056-.043-.105-.106-.142-2.45-1.42-1.638-4.587-1.61-4.72.038-.19.022-.335-.05-.44-.138-.201-.51-.292-.78-.357-.17-.042-.314-.081-.404-.113-.504-.18-.879-.455-.994-.67-.07-.136-.06-.276.04-.395.068-.082.23-.192.44-.192.104 0 .228.034.373.102.337.164.73.246 1.1.246.414 0 .783-.098.907-.15.11-.048.205-.118.195-.268l-.007-.117c-.078-1.298-.175-2.932.235-3.885C8.11 2.26 11.236 2 12.166 2z"/></svg>
                    Snapchat
                  </button>
                </div>
                {/* Copy Link */}
                <div className="flex items-center gap-2 p-3 rounded-xl bg-black/30 border border-white/10">
                  <input readOnly value={getVideoUrl()} className="flex-1 bg-transparent text-sm text-white/60 outline-none" />
                  <Button onClick={handleShare} size="sm" variant="outline">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <button onClick={onReport} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/15 transition-colors">
            <Flag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Melden</span>
          </button>

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => { if (confirm('Löschen?')) onDelete(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border bg-red-600/20 border-red-600/30 text-red-400 hover:bg-red-600/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Stats & Description */}
      <div className="border-t border-white/[0.06] pt-4">
        <div className="flex flex-wrap gap-4 text-white/40 text-xs font-medium mb-3">
          <span>{(video.views || 0).toLocaleString()} Aufrufe</span>
          <span>{format(new Date(video.created_date), 'd. MMM yyyy', { locale: de })}</span>
        </div>
        <p className="text-sm text-white/60 leading-relaxed line-clamp-3 md:line-clamp-none">
          {video.description || 'Keine Beschreibung.'}
        </p>
      </div>

      {/* Copyright */}
      <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
        <p className="text-xs text-white/50 leading-relaxed">
          {contentType === 'livestream' ? 'Dieser Stream' : 'Dieses Video'} ist urheberrechtlich geschützt. Das Herunterladen ohne Zustimmung ist untersagt.
        </p>
      </div>
    </div>
  );
}