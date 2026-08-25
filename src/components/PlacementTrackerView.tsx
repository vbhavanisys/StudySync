import React, { useState } from 'react';
import { 
  Briefcase, Plus, FileText, CheckCircle2, AlertCircle, 
  Sparkles, Layers, List, Upload, ExternalLink, Trash2, Edit3, Award, TrendingUp, Building
} from 'lucide-react';
import { Application, ApplicationStatus, ResumeItem, SkillMetric, User } from '../types';
import { initialSkillMetrics } from '../data/initialData';

interface PlacementTrackerViewProps {
  applications: Application[];
  resumes: ResumeItem[];
  user: User;
  onAddApplication: (app: Omit<Application, 'id'>) => void;
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
  onDeleteApplication: (id: string) => void;
  onAddResume: (resume: Omit<ResumeItem, 'id' | 'uploadedAt'>) => void;
}

export const PlacementTrackerView: React.FC<PlacementTrackerViewProps> = ({
  applications,
  resumes,
  user,
  onAddApplication,
  onUpdateStatus,
  onDeleteApplication,
  onAddResume
}) => {
  const [activeTab, setActiveTab] = useState<'applications' | 'resumes' | 'skills'>('applications');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddResumeModalOpen, setIsAddResumeModalOpen] = useState(false);

  // Resume Form State
  const [resumeTitle, setResumeTitle] = useState('Full Stack Software Engineer Resume');
  const [resumePhotoUrl, setResumePhotoUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
  const [resumeTemplate, setResumeTemplate] = useState('Modern Tech');
  const [resumeSkillsInput, setResumeSkillsInput] = useState('React, TypeScript, Node.js, System Design');

  // Form State
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('Software Engineer');
  const [packageLpa, setPackageLpa] = useState<number>(18);
  const [location, setLocation] = useState('Bengaluru / Hybrid');
  const [status, setStatus] = useState<ApplicationStatus>('Applied');
  const [deadline, setDeadline] = useState('2026-08-30');
  const [notes, setNotes] = useState('');

  // AI Resume Scanner State
  const [isScanningResume, setIsScanningResume] = useState(false);
  const [resumeTextPrompt, setResumeTextPrompt] = useState(
    'Alex Rivera - Computer Science Engineer\nSkills: React, TypeScript, Node.js, PostgreSQL, Docker, Data Structures, Algorithms\nProjects: StudySync Platform, Cloud Microservices Engine'
  );
  const [latestAtsResult, setLatestAtsResult] = useState<{
    atsScore: number;
    matchedSkills: string[];
    missingKeywords: string[];
    recommendations: string[];
  } | null>(null);

  const statuses: ApplicationStatus[] = ['Saved', 'Applied', 'Aptitude Test', 'Interviewing', 'Offer', 'Rejected'];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    onAddApplication({
      studentId: user.id,
      company,
      role,
      packageLpa: Number(packageLpa),
      location,
      status,
      appliedDate: new Date().toISOString().split('T')[0],
      deadline,
      notes,
      roundsCompleted: 1,
      totalRounds: 4
    });

    setCompany('');
    setNotes('');
    setIsAddModalOpen(false);
  };

  const handleScanResume = async () => {
    setIsScanningResume(true);
    try {
      const res = await fetch('/api/ai/resume-scanner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: resumeTextPrompt, targetRole: 'Software Engineer' })
      });
      const data = await res.json();
      setLatestAtsResult(data);
    } catch (err) {
      console.error('Resume scan error:', err);
    } finally {
      setIsScanningResume(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Briefcase className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Career & Placement Tracker
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kanban application pipeline, AI resume ATS scanner, and skill progress.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Log Job Application</span>
        </button>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('applications')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'applications'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Applications ({applications.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('resumes')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'resumes'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Resumes & AI Scanner</span>
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'skills'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Placement Skill Metrics</span>
          </button>
        </div>

        {/* View Toggle Mode for Applications */}
        {activeTab === 'applications' && (
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'kanban' ? 'bg-white dark:bg-slate-700 shadow-2xs text-indigo-600 dark:text-indigo-300' : 'text-slate-500'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'table' ? 'bg-white dark:bg-slate-700 shadow-2xs text-indigo-600 dark:text-indigo-300' : 'text-slate-500'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        )}
      </div>

      {/* Tab 1: Applications Pipeline */}
      {activeTab === 'applications' && (
        <>
          {viewMode === 'kanban' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
              {statuses.map((st) => {
                const columnApps = applications.filter((a) => a.status === st);
                return (
                  <div key={st} className="flex flex-col rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 p-3 min-w-[200px] border border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">
                        {st}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-2xs">
                        {columnApps.length}
                      </span>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                      {columnApps.map((app) => (
                        <div
                          key={app.id}
                          className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs hover:shadow-md transition-all space-y-2 group"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <h4 className="font-black text-xs text-slate-900 dark:text-white truncate">
                                {app.company}
                              </h4>
                              <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 truncate">
                                {app.role}
                              </p>
                            </div>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 shrink-0">
                              {app.packageLpa} LPA
                            </span>
                          </div>

                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            📍 {app.location}
                          </p>

                          {app.notes && (
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg line-clamp-2">
                              {app.notes}
                            </p>
                          )}

                          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                            <select
                              value={app.status}
                              onChange={(e) => onUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                              className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-md px-1.5 py-0.5 focus:outline-none"
                            >
                              {statuses.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>

                            <button
                              onClick={() => onDeleteApplication(app.id)}
                              className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                              title="Delete application"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Company & Role</th>
                    <th className="p-3.5">Package</th>
                    <th className="p-3.5">Location</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Applied Date</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        <div>{app.company}</div>
                        <div className="text-[11px] font-normal text-indigo-600 dark:text-indigo-400">{app.role}</div>
                      </td>
                      <td className="p-3.5 text-emerald-600 dark:text-emerald-400 font-extrabold">{app.packageLpa} LPA</td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">{app.location}</td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                          {app.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500">{app.appliedDate}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => onDeleteApplication(app.id)}
                          className="p-1 text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Tab 2: Resumes & AI ATS Scanner */}
      {activeTab === 'resumes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Resumes List */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Stored Resumes & Candidate Profiles
              </h3>
              <button
                onClick={() => setIsAddResumeModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New Resume</span>
              </button>
            </div>

            {resumes.map((res) => (
              <div
                key={res.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
              >
                <div className="flex items-start gap-3">
                  {/* Candidate Portrait Picture with Upload Option */}
                  <div className="relative shrink-0 group cursor-pointer" title="Click to upload new candidate photo">
                    <img
                      src={res.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt="Candidate Resume Portrait"
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/30 shadow-xs group-hover:opacity-80 transition-opacity"
                    />
                    <label className="absolute inset-0 flex items-center justify-center bg-slate-950/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                      <Upload className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const result = event.target?.result as string;
                              if (result && onAddResume) {
                                // Add updated or new candidate version
                                onAddResume({
                                  ...res,
                                  title: `${res.title} (Updated Photo)`,
                                  photoUrl: result,
                                  uploadedAt: 'Just Now'
                                });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{res.title}</h4>
                        <p className="text-[10px] text-slate-400">Uploaded {res.uploadedAt} • {res.version}</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                        ATS {res.atsScore}/100
                      </span>
                    </div>

                    {/* Interactive 5-Star Rating Display */}
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex items-center text-amber-400 text-xs">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star}>
                            {star <= Math.floor(res.rating || 4.8) ? '★' : '☆'}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                        {res.rating || 4.8} / 5.0
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-bold text-slate-700 dark:text-slate-300">
                        {res.template || 'Modern Tech'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rating Quality Breakdown */}
                {res.ratingBreakdown && (
                  <div className="grid grid-cols-4 gap-1.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-[10px]">
                    <div>
                      <span className="text-slate-400 block">Format</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">⭐ {res.ratingBreakdown.format}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Keywords</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">⭐ {res.ratingBreakdown.keywords}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Impact</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">⭐ {res.ratingBreakdown.impact}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Technical</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">⭐ {res.ratingBreakdown.technical}</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-1">
                  {res.matchedSkills.map((sk) => (
                    <span key={sk} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                      ✓ {sk}
                    </span>
                  ))}
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-[11px] text-slate-400">AI Recommendations:</span>
                  {res.suggestedImprovements.map((imp, idx) => (
                    <p key={idx} className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1">
                      <span>•</span> {imp}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* AI Resume ATS Matcher */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Gemini AI Resume ATS Matcher
              </h3>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Paste your resume summary or project highlights below to run a real-time Gemini AI ATS keyword scan.
            </p>

            <textarea
              rows={5}
              value={resumeTextPrompt}
              onChange={(e) => setResumeTextPrompt(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />

            <button
              onClick={handleScanResume}
              disabled={isScanningResume}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
            >
              <Sparkles className={`w-4 h-4 ${isScanningResume ? 'animate-spin' : ''}`} />
              <span>{isScanningResume ? 'Scanning Resume with Gemini AI...' : 'Run Real-time ATS Scan'}</span>
            </button>

            {latestAtsResult && (
              <div className="mt-4 p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 space-y-2">
                <div className="flex items-center justify-between font-bold text-xs text-indigo-900 dark:text-indigo-200">
                  <span>ATS Match Score</span>
                  <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{latestAtsResult.atsScore}%</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500">Missing Target Keywords:</span>
                  <div className="flex flex-wrap gap-1">
                    {latestAtsResult.missingKeywords.map((kw) => (
                      <span key={kw} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Skill Metrics */}
      {activeTab === 'skills' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-6">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            Placement Skill Progress Breakdown
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {initialSkillMetrics.map((sm) => (
              <div key={sm.subject} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white">{sm.subject}</span>
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{sm.score}% / {sm.target}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${sm.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Application Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-4">
              Log Campus Job Application
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Google India, Microsoft, Atlassian"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Role Title</label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Package (LPA)</label>
                  <input
                    type="number"
                    required
                    value={packageLpa}
                    onChange={(e) => setPackageLpa(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Deadline / Date</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes / Rounds</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Round 1 details, aptitude dates or interview tips..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                >
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Upload New Resume & Candidate Profile */}
      {isAddResumeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-600" />
              Upload Resume & Candidate Photo
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!resumeTitle) return;

                const parsedSkills = resumeSkillsInput.split(',').map((s) => s.trim()).filter(Boolean);

                onAddResume({
                  title: resumeTitle,
                  version: 'v1.0 (Uploaded)',
                  photoUrl: resumePhotoUrl,
                  rating: 4.9,
                  ratingBreakdown: {
                    format: 5.0,
                    keywords: 4.8,
                    impact: 4.9,
                    technical: 4.9
                  },
                  template: resumeTemplate,
                  atsScore: 92,
                  matchedSkills: parsedSkills,
                  suggestedImprovements: ['Add quantitative impact metrics for past projects']
                });

                setIsAddResumeModalOpen(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Resume Title / Position
                </label>
                <input
                  type="text"
                  required
                  value={resumeTitle}
                  onChange={(e) => setResumeTitle(e.target.value)}
                  placeholder="e.g. Software Engineer Resume 2026"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Image Upload Input for Candidate Headshot / Portrait */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Candidate Profile Image
                </label>
                
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <img
                    src={resumePhotoUrl}
                    alt="Candidate Preview"
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-500/30 shrink-0"
                  />

                  <div className="flex-1 space-y-1">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Select Local Image File</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const result = event.target?.result as string;
                              if (result) setResumePhotoUrl(result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <p className="text-[10px] text-slate-400">Upload candidate headshot photo</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Resume Template
                  </label>
                  <select
                    value={resumeTemplate}
                    onChange={(e) => setResumeTemplate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  >
                    <option value="Modern Tech">Modern Tech</option>
                    <option value="Executive Standard">Executive Standard</option>
                    <option value="Minimalist Clean">Minimalist Clean</option>
                    <option value="Creative Academic">Creative Academic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    value={resumeSkillsInput}
                    onChange={(e) => setResumeSkillsInput(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddResumeModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
                >
                  Save & Upload Resume
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
