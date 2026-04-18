import { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';

export default function MobileDrawerMenu({ 
  trigger, 
  items = [], 
  title = 'Optionen',
  align = 'end'
}) {
  const [open, setOpen] = useState(false);
  const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Desktop: use regular DropdownMenu
  if (!isMobile) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {trigger}
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align}>
          {items.map((item, index) => (
            <DropdownMenuItem 
              key={index} 
              onClick={item.onClick}
              disabled={item.disabled}
              className={item.className}
            >
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Mobile: use Drawer
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {trigger}
      </DrawerTrigger>
      <DrawerContent className="bg-[var(--theme-bg)] border-white/10">
        <DrawerHeader>
          <DrawerTitle className="text-white">{title}</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pt-2 overflow-y-auto" style={{ maxHeight: '60vh', paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}>
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick?.();
                setOpen(false);
              }}
              disabled={item.disabled}
              className={`w-full flex items-center px-4 py-4 rounded-xl mb-2 transition-all ${
                item.disabled 
                  ? 'bg-white/5 text-white/30 cursor-not-allowed'
                  : item.className || 'bg-white/5 border border-white/10 active:bg-white/10 text-white'
              }`}
            >
              {item.icon && <span className="mr-3">{item.icon}</span>}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}