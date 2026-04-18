import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Film, X, TrendingUp, Clock, Flame, SlidersHorizontal } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { id: 'all', label: 'Alle' },
  { id: 'gaming', label: '🎮 Gaming' },
  { id: 'music', label: '🎵 Musik' },
  { id: 'education', label: '📚 Bildung' },
  { id: 'entertainment', label: '🎭 Entertainment' },
  { id: 'technology', label: '💻 Technologie' },
  { id: 'art', label: '🎨 Kunst' },
  { id: 'sports', label: '⚽ Sport' },
  { id: 'lifestyle', label: '✨ Lifestyle' },
];

const SORT_OPTIONS = [
  { id: 'relevance', label: 'Relevanz', icon: Search },
  { id: 'newest', label: 'Neueste', icon: Clock },
  { id: 'popular', label: 'Beliebteste', icon: TrendingUp },
];

function VideoCard({ video }) {
  return (
    <Link to={`/Watch?v=${video.id}`}>
      <div className="rounded-2xl overflow-hidden border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15 transition-all group cursor-pointer">
        {video.thumbnail_url ? (
          <img src={video.thumbnail_url} alt={video.title} className="w-full aspect-video object-cover group-hover:scale-[1.02] transition-transform duration-300" />
        ) : (
          <div className="w-full aspect-video bg-white/5 flex items-center justify-center">
            <Film className="w-8 h-8 text-white/20" />
          </div>
        )}
        <div className="p-3">
          <p className="text-white font-semibold text-sm leading-snug line-clamp-2 group-hover:text-cyan-300 transition-colors">{video.title}</p>
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-white/40 text-xs">{video.creator_name}</p>
            {video.views > 0 && (
              <p className="text-white/25 text-xs">{video.views.toLocaleString()} Aufrufe</p>
            )}
          </div>
          {video.category && video.category !== 'entertainment' && (
            <span className="mt-2 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-white/40">
              {video.category}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function SearchPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q') || '';
    setQuery(q);
    setInputValue(q);
  }, [window.location.search]);

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['search-all'],
    queryFn: () => base44.entities.Video.list('-created_date', 200),
  });

  const filtered = useMemo(() => {
    let list = query.trim()
      ? videos.filter(v =>
          v.title?.toLowerCase().includes(query.toLowerCase()) ||
          v.creator_name?.toLowerCase().includes(query.toLowerCase()) ||
          v.description?.toLowerCase().includes(query.toLowerCase())
        )
      : [...videos];

    if (category !== 'all') {
      list = list.filter(v => v.category === category);
    }

    if (sort === 'newest') {
      list = [...list].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    } else if (sort === 'popular') {
      list = [...list].sort((a, b) => (b.views || 0) - (a.views || 0));
    }

    return list;
  }, [videos, query, category, sort]);

  const trending = useMemo(() =>
    [...videos].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 6),
    [videos]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = inputValue.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const isSearching = query.trim() !== '';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Search bar */}
      <form onSubmit={handleSubmit} className="mb-5">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
            <input
              autoFocus
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Videos, Creator, Inhalte suchen…"
              className="w-full h-14 bg-white/[0.05] border border-white/10 rounded-2xl pl-12 pr-12 text-white text-base placeholder:text-white/30 outline-none focus:border-white/25 focus:bg-white/[0.07] transition-all"
            />
            {inputValue && (
              <button type="button" onClick={() => { setInputValue(''); setQuery(''); navigate('/search'); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "h-14 w-14 shrink-0 rounded-2xl border flex items-center justify-center transition-all",
              showFilters
                ? "bg-white/10 border-white/20 text-white"
                : "bg-white/[0.03] border-white/8 text-white/40 hover:text-white hover:border-white/15"
            )}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* Filters */}
      {showFilters && (
        <div className="mb-5 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] space-y-4">
          {/* Categories */}
          <div>
            <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">Kategorie</p>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                    category === cat.id
                      ? "bg-white/15 text-white border border-white/20"
                      : "bg-white/[0.03] text-white/50 border border-white/[0.06] hover:text-white hover:border-white/15"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">Sortierung</p>
            <div className="flex gap-1.5">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSort(opt.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                    sort === opt.id
                      ? "bg-white/15 text-white border border-white/20"
                      : "bg-white/[0.03] text-white/50 border border-white/[0.06] hover:text-white hover:border-white/15"
                  )}
                >
                  <opt.icon className="w-3 h-3" />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
        </div>
      ) : !isSearching ? (
        /* Trending (no search query) */
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-4 h-4 text-orange-400" />
            <h2 className="text-white font-bold text-base">Trending</h2>
          </div>
          {category !== 'all' && (
            <p className="text-white/30 text-xs mb-4">Kategorie: <span className="text-white/60">{CATEGORIES.find(c => c.id === category)?.label}</span></p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(category !== 'all' ? filtered : trending).map(video => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <Film className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Keine Ergebnisse für <span className="text-white/50 font-semibold">„{query}"</span></p>
          {category !== 'all' && (
            <button onClick={() => setCategory('all')} className="mt-3 text-xs text-cyan-400 hover:underline">
              Filter zurücksetzen
            </button>
          )}
        </div>
      ) : (
        <div>
          <p className="text-white/40 text-sm mb-5">
            {filtered.length} Ergebnis{filtered.length !== 1 ? 'se' : ''} für{' '}
            <span className="text-white/70 font-semibold">„{query}"</span>
            {category !== 'all' && <span className="text-white/30"> · {CATEGORIES.find(c => c.id === category)?.label}</span>}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(video => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}