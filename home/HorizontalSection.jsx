import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ModernVideoCard from '@/components/modern/ModernVideoCard';

export default function HorizontalSection({ title, emoji, videos = [], viewAllPath }) {
  if (!videos.length) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          {emoji && <span>{emoji}</span>}
          {title}
        </h2>
        {viewAllPath && (
          <Link to={createPageUrl(viewAllPath)} className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors">
            Alle <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
        {videos.map((video) => (
          <div key={video.id} className="w-[280px] md:w-[300px] shrink-0">
            <ModernVideoCard video={video} />
          </div>
        ))}
      </div>
    </div>
  );
}