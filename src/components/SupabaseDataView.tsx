import React, { useState, useEffect } from 'react';
import { Database, Plus, Trash2, RefreshCw, CheckCircle2, Briefcase, BookOpen, AlertCircle, Calendar, Building2, Tag } from 'lucide-react';
import { fetchApplications, addApplication, deleteApplication, fetchNotes, addNote, deleteNote, SupabaseApplication, SupabaseNote } from '../lib/db';

export const SupabaseDataView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'applications' | 'notes'>('applications');
  
  // Data State from Supabase
  const [supabaseApps, setSupabaseApps] = useState<SupabaseApplication[]>([]);
  const [supabaseNotes, setSupabaseNotes] = useState<SupabaseNote[]>([]);
  
  // Loading & Error States
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Modals State
  const [isAddAppModalOpen, setIsAddAppModalOpen] = useState(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);

  // Form Fields - Application
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('Applied');
  const [appliedDate, setAppliedDate] = useState(new Date().toISOString().slice(0, 10));

  // Form Fields - Note
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  // Fetch data from Supabase
  const loadSupabaseData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [appsData, notesData] = await Promise.all([
        fetchApplications(),
        fetchNotes()
      ]);
      setSupabaseApps(appsData);
      setSupabaseNotes(notesData);
    } catch (err: any) {
      console.error('Error loading Supabase data:', err);
      setErrorMsg('Failed to load data from Supabase. Please check connection credentials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSupabaseData();
  }, []);

  const flashSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  // Handlers for Job Applications
  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !role) return;

    setLoading(true);
    setErrorMsg(null);
    const { data: newApp, error } = await addApplication({
      company,
      role,
      status,
      applied_date: appliedDate
    });

    if (newApp) {
      setSupabaseApps([newApp, ...supabaseApps]);
      flashSuccess(`Successfully added application for "${company}" to Supabase!`);
      setCompany('');
      setRole('');
      setStatus('Applied');
      setIsAddAppModalOpen(false);
    } else {
      setErrorMsg(`Error saving application to Supabase: ${error || 'Unknown error'}`);
    }
    setLoading(false);
  };

  const handleDeleteApplication = async (id?: string | number) => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this job application permanently from Supabase?')) return;

    setLoading(true);
    setErrorMsg(null);
    const ok = await deleteApplication(id);
    if (ok) {
      setSupabaseApps(supabaseApps.filter((a) => a.id !== id));
      flashSuccess('Application deleted from Supabase permanently.');
    } else {
      setErrorMsg('Failed to delete application from Supabase. Check RLS policies or permissions.');
    }
    setLoading(false);
  };

  // Handlers for Study Notes
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle || !noteContent) return;

    setLoading(true);
    setErrorMsg(null);
    const { data: newNote, error } = await addNote({
      title: noteTitle,
      content: noteContent
    });

    if (newNote) {
      setSupabaseNotes([newNote, ...supabaseNotes]);
      flashSuccess(`Successfully saved note "${noteTitle}" to Supabase!`);
      setNoteTitle('');
      setNoteContent('');
      setIsAddNoteModalOpen(false);
    } else {
      setErrorMsg(`Error saving note to Supabase: ${error || 'Unknown error'}`);
    }
    setLoading(false);
  };

  const handleDeleteNote = async (id?: string | number) => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this study note permanently from Supabase?')) return;

    setLoading(true);
    const ok = await deleteNote(id);
    if (ok) {
      setSupabaseNotes(supabaseNotes.filter((n) => n.id !== id));
      flashSuccess('Study Note deleted from Supabase permanently.');
    } else {
      setErrorMsg('Failed to delete note from Supabase.');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Supabase Connection Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
              ⚡ Supabase Cloud Database Connected
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950">
              <CheckCircle2 className="w-3 h-3" /> Live
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black flex items-center justify-center md:justify-start gap-2 pt-1">
            <Database className="w-8 h-8 text-emerald-300" />
            Supabase Permanent Storage
          </h2>
          <p className="text-xs text-white/80 max-w-xl">
            Connected to <code className="bg-black/20 px-1.5 py-0.5 rounded text-emerald-200 font-mono">https://xjevlfqoldbcivlvgxbt.supabase.co</code>. All entries in <strong>applications</strong> and <strong>notes</strong> persist directly into your cloud database.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={loadSupabaseData}
            disabled={loading}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-black text-xs flex items-center gap-2 transition-all border border-white/20 shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Supabase</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Primary Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('applications')}
          className={`px-5 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'applications'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Job Applications ({supabaseApps.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`px-5 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'notes'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Study Notes ({supabaseNotes.length})</span>
        </button>
      </div>

      {/* VIEW 1: JOB APPLICATIONS TABLE */}
      {activeTab === 'applications' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                Supabase "applications" Table Records
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Columns: <code>id</code>, <code>company</code>, <code>role</code>, <code>status</code>, <code>applied_date</code>
              </p>
            </div>

            <button
              onClick={() => setIsAddAppModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Job Application</span>
            </button>
          </div>

          {/* Applications Data Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                    <th className="py-3.5 px-4">ID</th>
                    <th className="py-3.5 px-4">Company</th>
                    <th className="py-3.5 px-4">Job Role</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Applied Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {supabaseApps.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">
                        {loading ? 'Fetching records from Supabase...' : 'No applications found in Supabase table "applications". Click "Add Job Application" to save one!'}
                      </td>
                    </tr>
                  ) : (
                    supabaseApps.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-400">#{app.id}</td>
                        <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-indigo-500" />
                          <span>{app.company}</span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">{app.role}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            app.status === 'Offer' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                            app.status === 'Interviewing' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' :
                            app.status === 'Applied' ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300' :
                            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium">{app.applied_date}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleDeleteApplication(app.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title="Delete permanently from Supabase"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: STUDY NOTES TABLE */}
      {activeTab === 'notes' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Supabase "notes" Table Records
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Columns: <code>id</code>, <code>title</code>, <code>content</code>
              </p>
            </div>

            <button
              onClick={() => setIsAddNoteModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Study Note</span>
            </button>
          </div>

          {/* Notes Cards / Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {supabaseNotes.length === 0 ? (
              <div className="col-span-full bg-white dark:bg-slate-900 rounded-3xl p-12 text-center text-slate-400 font-medium border border-slate-200 dark:border-slate-800">
                {loading ? 'Fetching notes from Supabase...' : 'No notes found in Supabase table "notes". Click "Add Study Note" to save one!'}
              </div>
            ) : (
              supabaseNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3 relative group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[10px] font-mono font-bold text-slate-400">ID #{note.id}</span>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                        {note.title}
                      </h4>
                    </div>

                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors shrink-0"
                      title="Delete permanently from Supabase"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                    {note.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD JOB APPLICATION */}
      {isAddAppModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              Add Application to Supabase
            </h3>

            <form onSubmit={handleCreateApplication} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Google / Microsoft"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Job Role</label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Software Development Engineer"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold"
                  >
                    <option value="Saved">Saved</option>
                    <option value="Applied">Applied</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Applied Date</label>
                  <input
                    type="date"
                    value={appliedDate}
                    onChange={(e) => setAppliedDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddAppModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20"
                >
                  Save to Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD STUDY NOTE */}
      {isAddNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Add Study Note to Supabase
            </h3>

            <form onSubmit={handleCreateNote} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Note Title</label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g. Graph Algorithms & Shortest Path"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Note Content</label>
                <textarea
                  rows={4}
                  required
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write formulas, study notes, or key interview takeaways..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddNoteModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20"
                >
                  Save to Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
