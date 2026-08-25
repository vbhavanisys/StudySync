import React from 'react';
import { 
  LayoutDashboard, BookOpen, Briefcase, Timer, ShieldCheck, 
  User, Sparkles, Bookmark, CalendarDays, UserCheck, Database
} from 'lucide-react';
import { UserRole } from '../types';

export type ActiveTab = 'dashboard' | 'notes' | 'placement' | 'resources' | 'scheduler' | 'profiles' | 'focus' | 'supabase' | 'admin' | 'settings';


interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  role: UserRole;
  notesCount?: number;
  appsCount?: number;
  resourcesCount?: number;
  tasksCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  role,
  notesCount = 0,
  appsCount = 0,
  resourcesCount = 0,
  tasksCount = 0
}) => {
  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'notes' as ActiveTab,
      label: 'Academic Notes Hub',
      icon: BookOpen,
      badge: notesCount > 0 ? notesCount : null
    },
    {
      id: 'placement' as ActiveTab,
      label: 'Placement Tracker',
      icon: Briefcase,
      badge: appsCount > 0 ? appsCount : null
    },
    {
      id: 'resources' as ActiveTab,
      label: 'Saved Media Vault',
      icon: Bookmark,
      badge: resourcesCount > 0 ? resourcesCount : 'New'
    },
    {
      id: 'scheduler' as ActiveTab,
      label: 'Scheduler & Timetable',
      icon: CalendarDays,
      badge: tasksCount > 0 ? tasksCount : 'New'
    },
    {
      id: 'profiles' as ActiveTab,
      label: 'Profile Directory',
      icon: UserCheck,
      badge: null
    },
    {
      id: 'focus' as ActiveTab,
      label: 'Focus & Pomodoro',
      icon: Timer,
      badge: null
    },
    {
      id: 'supabase' as ActiveTab,
      label: 'Supabase Data Hub',
      icon: Database,
      badge: 'Live'
    },
    ...(role === 'administrator'
      ? [
          {
            id: 'admin' as ActiveTab,
            label: 'Admin Portal',
            icon: ShieldCheck,
            badge: 'TPO'
          }
        ]
      : []),
    {
      id: 'settings' as ActiveTab,
      label: 'Profile & Settings',
      icon: User,
      badge: null
    }
  ];

  return (
    <aside className="w-full md:w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 p-3 flex md:flex-col justify-between transition-colors">
      <div className="w-full">
        <div className="hidden md:block px-3 py-2 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
          Main Navigation
        </div>
        <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-indigo-700 text-indigo-100'
                        : item.badge === 'TPO'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer Widget */}
      <div className="hidden md:block mt-6 p-3 rounded-2xl bg-gradient-to-br from-indigo-50 via-sky-50 to-indigo-100/50 dark:from-slate-800/80 dark:to-slate-800 border border-indigo-100 dark:border-slate-700">
        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-1">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Placement Season Ready</span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
          Keep your academic notes updated and sync your latest applications to maximize campus hiring chances!
        </p>
      </div>
    </aside>
  );
};
