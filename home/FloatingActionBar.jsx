import { Flame, Clock, Radio, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

const views = [
  { id: 'all', label: 'Alle', icon: LayoutGrid },
  { id: 'trending', label: 'Trending', icon: Flame },
  { id: 'new', label: 'Neu', icon: Clock },
  { id: 'live', label: 'Live', icon: Radio },
];

export default function FloatingActionBar({ activeView, onViewChange }) {
  return (
    <div className="flex items-center gap-0.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.05]">
      {views.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onViewChange(id)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-200",
            activeView === id
              ? 'bg-white/[0.08] text-white'
              : 'text-white/30 hover:text-white/50'
          )}
        >
          <Icon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}