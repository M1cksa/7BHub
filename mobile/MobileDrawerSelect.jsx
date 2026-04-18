import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Check } from 'lucide-react';

export default function MobileDrawerSelect({ 
  value, 
  onValueChange, 
  options = [], 
  placeholder = 'Auswählen...',
  label,
  triggerClassName,
  disabled
}) {
  const [open, setOpen] = useState(false);
  const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Desktop: use regular Select
  if (!isMobile) {
    return (
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className={triggerClassName}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  // Mobile: use Drawer
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          disabled={disabled}
          className={`flex items-center justify-between w-full ${triggerClassName || 'h-10 px-3 py-2 rounded-md border border-white/20 bg-black/40 text-white'}`}
        >
          <span className={selectedOption ? 'text-white' : 'text-white/40'}>
            {selectedOption?.label || placeholder}
          </span>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white/50">
            <path d="M4 6L7.5 9.5L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </DrawerTrigger>
      <DrawerContent className="bg-[var(--theme-bg)] border-white/10">
        <DrawerHeader>
          <DrawerTitle className="text-white">{label || placeholder}</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-8 pt-2 max-h-[60vh] overflow-y-auto" style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}>
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onValueChange(option.value);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-4 rounded-xl mb-2 transition-all ${
                value === option.value
                  ? 'bg-white/10 border-2 border-white/20'
                  : 'bg-white/5 border border-white/10 active:bg-white/10'
              }`}
            >
              <span className="text-white font-medium">{option.label}</span>
              {value === option.value && <Check className="w-5 h-5 text-white" />}
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}