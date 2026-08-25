import React from 'react';
import { 
  GraduationCap, Briefcase, BookOpen, Timer, ArrowUpRight, 
  Sparkles, CheckCircle, Calendar, Plus, ExternalLink, Award, TrendingUp, AlertCircle
} from 'lucide-react';
import { User, AcademicNote, Application, CampusDrive, Announcement } from '../types';
import { ActiveTab } from './Sidebar';

interface DashboardViewProps {
  user: User;
  notes: AcademicNote[];
  applications: Application[];
  campusDrives: CampusDrive[];
  announcements: Announcement[];
  onNavigate: (tab: ActiveTab) => void;
  onOpenAddNote: () => void;
  onOpenAddApplication: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  notes,
  applications,
  campusDrives,
  announcements,
  onNavigate,
  onOpenAddNote,
  onOpenAddApplication
}) => {
  const activeApps = applications.filter((a) => a.status === 'Interviewing' || a.status === 'Aptitude Test' || a.status === 'Applied');
  const offersCount = applications.filter((a) => a.status === 'Offer').length;

  // Placement Readiness Index calculation (mock formula: CGPA weight + offers + skills + apps)
  const cgpaScore = (user.cgpa / 10) * 40;
  const appScore = Math.min(30, applications.length * 6);
  const readinessIndex = Math.round(cgpaScore + appScore + (offersCount > 0 ? 25 : 15));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-sky-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/20 text-sky-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Campus Hiring Season 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-sm text-indigo-100/90 leading-relaxed">
              You have <span className="font-bold text-amber-300">{activeApps.length} active applications</span> and <span className="font-bold text-sky-300">{campusDrives.length} upcoming campus drives</span> open today. Keep syncing your notes & practice.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenAddNote}
              className="px-4 py-2.5 text-xs font-bold rounded-xl bg-white text-indigo-900 hover:bg-slate-100 shadow-md transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>New Note</span>
            </button>
            <button
              onClick={onOpenAddApplication}
              className="px-4 py-2.5 text-xs font-bold rounded-xl bg-sky-500 hover:bg-sky-400 text-white shadow-md transition-all flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              <span>Log Job App</span>
            </button>
            <button
              onClick={() => onNavigate('focus')}
              className="px-4 py-2.5 text-xs font-bold rounded-xl bg-indigo-950/80 hover:bg-indigo-950 border border-indigo-400/30 text-white transition-all flex items-center gap-2"
            >
              <Timer className="w-4 h-4 text-indigo-300" />
              <span>Focus Timer</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Academic Standing
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{user.cgpa || 8.92}</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">CGPA</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            0 Backlogs • {user.department}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Job Applications
            </span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{applications.length}</span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              ({offersCount} Offers)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {activeApps.length} in interview/test phase
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Notes & Synced Material
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{notes.length}</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Modules</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            AI summaries & printable exports ready
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Focus Study Time
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Timer className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">12.5</span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Hours / Wk</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            +18% focus compared to last week
          </p>
        </div>
      </div>

      {/* Grid Section: Placement Readiness Meter + Active Campus Drives */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Placement Readiness Index Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Placement Readiness Score
              </h3>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-full">
                High Target
              </span>
            </div>

            {/* Circular Gauge Representation */}
            <div className="my-6 flex flex-col items-center">
              <div className="relative flex items-center justify-center w-36 h-36">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100 dark:text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-indigo-600 dark:text-indigo-400 transition-all duration-1000 ease-out"
                    strokeDasharray={`${readinessIndex}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">{readinessIndex}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">out of 100</span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Aptitude & DSA Readiness</span>
                <span className="font-bold text-slate-900 dark:text-white">90%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '90%' }} />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-600 dark:text-slate-400">Resume ATS Score</span>
                <span className="font-bold text-slate-900 dark:text-white">92%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }} />
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('placement')}
            className="mt-6 w-full py-2.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>View Full Career Analytics</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Live Campus Placement Drives Carousel */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  Active On-Campus Placement Drives
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Official recruitment drives posted by TPO Placement Cell
                </p>
              </div>
              <button
                onClick={() => onNavigate('placement')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View All ({campusDrives.length})
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {campusDrives.map((drive) => (
                <div
                  key={drive.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 hover:border-indigo-500/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                        {drive.company}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 shrink-0">
                        {drive.packageLpa} LPA
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                      {drive.role}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                      {drive.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Drive: {drive.driveDate}
                    </span>
                    <a
                      href={drive.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors"
                    >
                      <span>Apply</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/50 flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              <strong>Important Notice:</strong> Ensure CGPA threshold eligibility criteria is met before registering for Google & Goldman Sachs drives.
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Notes & Upcoming Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Academic Notes */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Recent Academic Notes
            </h3>
            <button
              onClick={() => onNavigate('notes')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Open Notes Hub
            </button>
          </div>

          <div className="space-y-3">
            {notes.slice(0, 3).map((note) => (
              <div
                key={note.id}
                onClick={() => onNavigate('notes')}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 hover:border-indigo-500/50 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {note.title}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0">
                    {note.subject}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-snug">
                  {note.summary || note.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Application Status Pipeline Preview */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Tracked Applications
            </h3>
            <button
              onClick={() => onNavigate('placement')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Open Tracker
            </button>
          </div>

          <div className="space-y-3">
            {applications.slice(0, 3).map((app) => (
              <div
                key={app.id}
                onClick={() => onNavigate('placement')}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 hover:border-indigo-500/50 transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                    {app.company}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {app.role} • {app.packageLpa} LPA
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold shrink-0 ${
                    app.status === 'Offer'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : app.status === 'Interviewing'
                      ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
