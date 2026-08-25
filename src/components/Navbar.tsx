import React, { useState, useEffect } from 'react';
import { 
  Search, Bell, RefreshCw, UserCheck, ShieldCheck, 
  ChevronDown, LogIn, LogOut, CheckCircle2, Clock, Plus, Trash2, Volume2, AlertCircle
} from 'lucide-react';
import { Logo } from './Logo';
import { User, Announcement, ReminderItem } from '../types';
import { getAnnouncements, getReminders, addReminder, toggleReminder, deleteReminder } from '../lib/storage';

interface NavbarProps {
  user: User | null;
  onOpenAuth: () => void;
  onSwitchRole: (role: 'student' | 'administrator') => void;
  onLogout: () => void;
  onSearch?: (query: string) => void;
  onSelectTab?: (tab: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAuth,
  onSwitchRole,
  onLogout,
  onSearch,
  onSelectTab
}) => {
  const [time, setTime] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifTab, setNotifTab] = useState<'announcements' | 'reminders'>('reminders');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Quick Add Reminder Form State
  const [isAddingReminder, setIsAddingReminder] = useState(false);
  const [remTitle, setRemTitle] = useState('');
  const [remCategory, setRemCategory] = useState<'Exam' | 'Placement' | 'Lecture' | 'Assignment' | 'Personal'>('Exam');
  const [remDatetime, setRemDatetime] = useState('');
  const [remHighSound, setRemHighSound] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const refreshNotifData = () => {
    setAnnouncements(getAnnouncements());
    setReminders(getReminders());
  };

  useEffect(() => {
    refreshNotifData();
    const handleStoreUpdate = () => refreshNotifData();
    window.addEventListener('studysync_store_updated', handleStoreUpdate);
    return () => window.removeEventListener('studysync_store_updated', handleStoreUpdate);
  }, []);

  const playChimeSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.9, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {
      console.error(e);
    }
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 800);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (onSearch) onSearch(val);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 lg:px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-4">
          <Logo size="md" />
          
          {/* Live Cloud Sync Badge */}
          <div 
            onClick={handleManualSync}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 cursor-pointer hover:bg-emerald-100 transition-all select-none"
            title="Click to trigger real-time sync check"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Cloud Sync Active</span>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="hidden sm:flex flex-1 max-w-md relative items-center">
          <Search className="absolute left-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search notes, placement drives, subjects or algorithms..."
            className="w-full pl-9 pr-12 py-1.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 border border-slate-200 dark:border-slate-700 transition-all"
          />
          <kbd className="absolute right-2.5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 shadow-2xs">
            ⌘K
          </kbd>
        </div>

        {/* Right: Quick Role Switcher, Clock & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Realtime Clock */}
          <div className="hidden lg:flex items-center gap-1 text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>{time}</span>
          </div>

          {/* Quick Role Switcher Toggle Pill */}
          {user && (
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => onSwitchRole('student')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${
                  user.role === 'student'
                    ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Student</span>
              </button>
              <button
                onClick={() => onSwitchRole('administrator')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${
                  user.role === 'administrator'
                    ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>Admin</span>
              </button>
            </div>
          )}

          {/* Notification Bell Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {(announcements.length > 0 || reminders.filter(r => !r.completed).length > 0) && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Header & Tabs */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs font-bold">
                    <button
                      onClick={() => setNotifTab('reminders')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        notifTab === 'reminders'
                          ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                      }`}
                    >
                      Reminders ({reminders.filter(r => !r.completed).length})
                    </button>
                    <button
                      onClick={() => setNotifTab('announcements')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        notifTab === 'announcements'
                          ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                      }`}
                    >
                      Announcements ({announcements.length})
                    </button>
                  </div>

                  {notifTab === 'reminders' && (
                    <button
                      onClick={() => setIsAddingReminder(!isAddingReminder)}
                      className="px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isAddingReminder ? 'Close' : 'Add'}</span>
                    </button>
                  )}
                </div>

                {/* Tab Content: Reminders */}
                {notifTab === 'reminders' && (
                  <div className="mt-3 space-y-2.5 max-h-80 overflow-y-auto pr-1 text-xs">
                    {/* Inline Quick Add Form */}
                    {isAddingReminder && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!remTitle) return;
                          addReminder({
                            title: remTitle,
                            category: remCategory,
                            datetime: remDatetime || new Date().toISOString().slice(0, 16),
                            isHighSoundAlert: remHighSound,
                            notes: 'Quick set from Navbar'
                          });
                          playChimeSound();
                          setRemTitle('');
                          setIsAddingReminder(false);
                          setReminders(getReminders());
                        }}
                        className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2 animate-in fade-in"
                      >
                        <span className="block font-bold text-[11px] text-indigo-900 dark:text-indigo-200">
                          ⏰ Set New High-Sound Reminder
                        </span>
                        <input
                          type="text"
                          required
                          value={remTitle}
                          onChange={(e) => setRemTitle(e.target.value)}
                          placeholder="e.g. Exam Hall Entrance Ticket Check"
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={remCategory}
                            onChange={(e) => setRemCategory(e.target.value as any)}
                            className="px-2 py-1 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                          >
                            <option value="Exam">Exam</option>
                            <option value="Placement">Placement</option>
                            <option value="Lecture">Lecture</option>
                            <option value="Assignment">Assignment</option>
                            <option value="Personal">Personal</option>
                          </select>
                          <input
                            type="datetime-local"
                            value={remDatetime}
                            onChange={(e) => setRemDatetime(e.target.value)}
                            className="px-2 py-1 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold"
                          />
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={remHighSound}
                              onChange={(e) => setRemHighSound(e.target.checked)}
                              className="rounded text-indigo-600 focus:ring-0"
                            />
                            <span>🔊 High Sound Alert</span>
                          </label>
                          <button
                            type="submit"
                            className="px-3 py-1 rounded-lg bg-indigo-600 text-white font-black text-xs shadow-xs"
                          >
                            Save Reminder
                          </button>
                        </div>
                      </form>
                    )}

                    {reminders.length === 0 ? (
                      <p className="text-slate-400 text-center py-4">No scheduled reminders set.</p>
                    ) : (
                      reminders.map((rem) => (
                        <div
                          key={rem.id}
                          className={`p-2.5 rounded-xl border transition-all ${
                            rem.completed
                              ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60'
                              : 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-900 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 min-w-0">
                              <input
                                type="checkbox"
                                checked={rem.completed}
                                onChange={() => {
                                  toggleReminder(rem.id);
                                  setReminders(getReminders());
                                }}
                                className="mt-0.5 rounded text-indigo-600 focus:ring-0 cursor-pointer"
                              />
                              <div className="min-w-0">
                                <h5 className={`font-bold text-xs truncate ${rem.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                  {rem.title}
                                </h5>
                                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                    {rem.category}
                                  </span>
                                  <span>•</span>
                                  <span>{new Date(rem.datetime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {rem.isHighSoundAlert && (
                                <button
                                  onClick={playChimeSound}
                                  title="Test Reminder Chime Sound"
                                  className="p-1 text-amber-500 hover:text-amber-600"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  deleteReminder(rem.id);
                                  setReminders(getReminders());
                                }}
                                title="Delete Reminder"
                                className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Tab Content: Announcements */}
                {notifTab === 'announcements' && (
                  <div className="mt-3 space-y-2.5 max-h-80 overflow-y-auto pr-1 text-xs">
                    {announcements.map((ann) => (
                      <div
                        key={ann.id}
                        className={`p-2.5 rounded-xl border transition-colors ${
                          ann.important
                            ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between font-medium text-slate-900 dark:text-slate-100 mb-1">
                          <span className="truncate pr-2 font-bold">{ann.title}</span>
                          <span className="text-[10px] text-slate-400 font-normal shrink-0">
                            {new Date(ann.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {ann.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile / Login Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/30"
                />
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium capitalize">
                    {user.role}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 mb-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{user.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    <div className="mt-1 flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{user.rollNumber} • CGPA {user.cgpa || 'N/A'}</span>
                    </div>
                  </div>

                  {onSelectTab && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onSelectTab('profiles');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl flex items-center gap-2 transition-colors font-bold"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Manage / Switch Profiles
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl flex items-center gap-2 transition-colors font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
