import { Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function MobileBrandHeader({ onSearchClick }) {
  return (
    <div 
      className="md:hidden sticky top-0 z-40 bg-[var(--theme-bg)]/95 backdrop-blur-2xl border-b border-white/10 px-4 py-3 flex items-center justify-between"
      style={{ 
        paddingTop: 'calc(0.75rem + env(safe-area-inset-top))',
        paddingBottom: '0.75rem'
      }}
    >
      <Link to={createPageUrl('Home')} className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-lg">
          <span className="text-white font-black text-sm">7B</span>
        </div>
        <span className="text-white font-black text-lg">Hub</span>
      </Link>
      
      <div className="flex items-center gap-2">
        {onSearchClick && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onSearchClick}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <Search className="w-5 h-5" />
          </Button>
        )}
        <Link to={createPageUrl('Profile')}>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <Bell className="w-5 h-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}