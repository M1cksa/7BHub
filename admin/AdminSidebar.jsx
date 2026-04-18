import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  LayoutDashboard, Users, Video, MessageSquare, HelpCircle,
  AlertTriangle, Bell, Mail, Shield, Calendar, Flag,
  Megaphone, Wrench, Lock, BarChart2, Clock, ChevronRight, Trophy
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-cyan-400' },
  { id: 'analytics', label: 'Analytics', icon: BarChart2, color: 'text-emerald-400', badge: 'NEU' },
  { id: 'pending', label: 'Ausstehend', icon: Clock, color: 'text-amber-400', countKey: 'pending' },
  { id: 'users', label: 'Nutzer', icon: Users, color: 'text-blue-400', countKey: 'users' },
  { id: 'videos', label: 'Videos', icon: Video, color: 'text-violet-400', countKey: 'videos' },
  { id: 'tickets', label: 'Support', icon: HelpCircle, color: 'text-cyan-400', countKey: 'tickets' },
  { id: 'reports', label: 'Meldungen', icon: AlertTriangle, color: 'text-red-400', countKey: 'reports' },
  { id: 'messages', label: 'Chat', icon: MessageSquare, color: 'text-purple-400', countKey: 'messages' },
  { id: 'broadcast', label: 'Pop-ups', icon: Megaphone, color: 'text-cyan-400' },
  { id: 'warnings', label: 'Verwarnungen', icon: AlertTriangle, color: 'text-red-400' },
  { id: 'contests', label: 'Wettbewerbe', icon: Trophy, color: 'text-yellow-400', external: 'AdminContests' },
  { id: 'updates', label: 'Updates', icon: Bell, color: 'text-violet-400' },
  { id: 'newsletter', label: 'Newsletter', icon: Mail, color: 'text-cyan-400' },
  { id: 'events', label: 'Events', icon: Calendar, color: 'text-blue-400' },
  { id: 'serverstatus', label: 'Server', icon: Shield, color: 'text-green-400' },
  { id: 'moderation', label: 'Moderation', icon: Flag, color: 'text-orange-400', external: 'Moderation' },
  { id: 'ads', label: 'Werbung', icon: Megaphone, color: 'text-pink-400', external: 'AdManager' },
  { id: 'maintenance', label: 'Wartung', icon: Wrench, color: 'text-orange-400', external: 'AdminMaintenance' },
  { id: 'lock', label: 'Plattform-Sperre', icon: Lock, color: 'text-red-500' },
];

export default function AdminSidebar({ activeTab, onTabChange, counts = {} }) {
  return (
    <nav className="w-56 flex-shrink-0 hidden lg:flex flex-col gap-1 sticky top-48 self-start">
      {navItems.map(item => {
        const Icon = item.icon;
        const count = item.countKey ? counts[item.countKey] : null;
        const isActive = activeTab === item.id;

        if (item.external) {
          return (
            <Link key={item.id} to={createPageUrl(item.external)}>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all text-sm">
                <Icon className={`w-4 h-4 ${item.color} opacity-60`} />
                <span>{item.label}</span>
                <ChevronRight className="w-3 h-3 ml-auto opacity-40" />
              </button>
            </Link>
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
              isActive
                ? 'bg-white/10 text-white shadow-inner'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon className={`w-4 h-4 ${item.color} ${isActive ? 'opacity-100' : 'opacity-60'}`} />
            <span>{item.label}</span>
            {item.badge && (
              <span className="ml-auto text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold">{item.badge}</span>
            )}
            {count != null && count > 0 && (
              <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded font-bold ${
                item.color === 'text-red-400' || item.color === 'text-amber-400'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-white/10 text-white/60'
              }`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}