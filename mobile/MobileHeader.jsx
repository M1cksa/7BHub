import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function MobileHeader({ title, onBack, rightAction }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div 
      className="md:hidden sticky top-0 z-40 bg-[var(--theme-bg)]/95 backdrop-blur-2xl border-b border-white/10 px-4 py-3 flex items-center justify-between"
      style={{ 
        paddingTop: 'calc(0.75rem + env(safe-area-inset-top))',
        paddingBottom: '0.75rem'
      }}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleBack}
          className="text-white/70 hover:text-white hover:bg-white/10 flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-base font-bold text-white truncate">{title}</h1>
      </div>
      {rightAction && (
        <div className="flex-shrink-0 ml-2">
          {rightAction}
        </div>
      )}
    </div>
  );
}