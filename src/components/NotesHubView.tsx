import React, { useState } from 'react';
import { 
  BookOpen, Plus, Search, Sparkles, Download, Heart, 
  Tag, Filter, X, Eye, FileText, Check, Copy, Share2
} from 'lucide-react';
import { AcademicNote, User } from '../types';

interface NotesHubViewProps {
  notes: AcademicNote[];
  user: User;
  onAddNote: (note: Omit<AcademicNote, 'id' | 'createdAt' | 'updatedAt' | 'likesCount'>) => void;
  onLikeNote: (id: string) => void;
  onDeleteNote?: (id: string) => void;
}

export const NotesHubView: React.FC<NotesHubViewProps> = ({
  notes,
  user,
  onAddNote,
  onLikeNote,
  onDeleteNote
}) => {
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeNoteModal, setActiveNoteModal] = useState<AcademicNote | null>(null);
  const [isSummarizingId, setIsSummarizingId] = useState<string | null>(null);

  // Form State for new note
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Operating Systems');
  const [semester, setSemester] = useState('Semester 5');
  const [tagsInput, setTagsInput] = useState('Exam Prep, Core');
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const subjects = ['All', 'Operating Systems', 'Data Structures & Algorithms', 'Database Systems', 'Computer Networks', 'System Design'];
  const allTags = ['All', 'Exam Prep', 'Interview Core', 'LeetCode', 'Algorithms', 'SQL', 'OS'];

  const filteredNotes = notes.filter((note) => {
    const matchesSearch = note.title.toLowerCase().includes(search.toLowerCase()) || 
                          note.content.toLowerCase().includes(search.toLowerCase()) ||
                          note.subject.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || note.subject === selectedSubject;
    const matchesTag = selectedTag === 'All' || note.tags.includes(selectedTag);
    return matchesSearch && matchesSubject && matchesTag;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    onAddNote({
      title,
      subject,
      semester,
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      content,
      authorId: user.id,
      authorName: user.name,
      isPrivate
    });

    setTitle('');
    setContent('');
    setIsModalOpen(false);
  };

  const handleAiSummarize = async (note: AcademicNote) => {
    setIsSummarizingId(note.id);
    try {
      const res = await fetch('/api/ai/summarize-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: note.title,
          subject: note.subject,
          content: note.content
        })
      });
      const data = await res.json();
      if (data.summary) {
        note.summary = data.summary;
        setActiveNoteModal({ ...note, summary: data.summary });
      }
    } catch (err) {
      console.error('AI summarize failed:', err);
    } finally {
      setIsSummarizingId(null);
    }
  };

  const handleExportPdf = (note: AcademicNote) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${note.title} - StudySync Export</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 40px; color: #1e293b; line-height: 1.6; }
            h1 { color: #312e81; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
            .meta { font-size: 13px; color: #64748b; margin-bottom: 20px; }
            .tag { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-right: 5px; }
            .summary { background: #f8fafc; border-left: 4px solid #6366f1; padding: 15px; margin: 20px 0; border-radius: 4px; }
            pre { background: #0f172a; color: #f8fafc; padding: 15px; border-radius: 8px; overflow-x: auto; }
            .footer { margin-top: 50px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          </style>
        </head>
        <body>
          <h1>${note.title}</h1>
          <div class="meta">
            Subject: <strong>${note.subject}</strong> | ${note.semester} | Author: ${note.authorName}
            <br/><br/>
            ${note.tags.map((t) => `<span class="tag">${t}</span>`).join('')}
          </div>
          ${
            note.summary
              ? `<div class="summary"><strong>AI Smart Summary:</strong><p>${note.summary.replace(/\n/g, '<br/>')}</p></div>`
              : ''
          }
          <div>
            ${note.content.replace(/\n/g, '<br/>')}
          </div>
          <div class="footer">
            Exported from StudySync Productivity Hub on ${new Date().toLocaleDateString()}
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Academic Notes Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Synchronized notes, AI study cheat-sheets, and downloadable PDF study material.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Academic Note</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes by title, topic keywords or concepts..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-slate-400 shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Subject:
            </span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              {subjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1 flex items-center gap-1">
            <Tag className="w-3 h-3" /> Tags:
          </span>
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTag(t)}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all shrink-0 ${
                selectedTag === t
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
                  {note.subject}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  {note.semester}
                </span>
              </div>

              <h3 
                onClick={() => setActiveNoteModal(note)}
                className="font-extrabold text-slate-900 dark:text-white text-base hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer line-clamp-2 mb-2"
              >
                {note.title}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
                {note.summary || note.content}
              </p>

              {/* Tags list */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => onLikeNote(note.id)}
                className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-rose-500 transition-colors"
              >
                <Heart className={`w-3.5 h-3.5 ${note.likesCount > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
                <span>{note.likesCount}</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleAiSummarize(note)}
                  disabled={isSummarizingId === note.id}
                  className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200/60 text-[10px] font-bold flex items-center gap-1 transition-all"
                  title="Generate Gemini AI Smart Summary"
                >
                  <Sparkles className={`w-3 h-3 ${isSummarizingId === note.id ? 'animate-spin' : ''}`} />
                  <span>AI Summary</span>
                </button>

                <button
                  onClick={() => handleExportPdf(note)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Export to Printable PDF"
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveNoteModal(note)}
                  className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                  title="View Full Note"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Add Academic Note to Cloud Hub
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Note Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Operating Systems - Process Synchronization & Semaphores"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject / Course
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="Operating Systems">Operating Systems</option>
                    <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                    <option value="Database Systems">Database Systems</option>
                    <option value="Computer Networks">Computer Networks</option>
                    <option value="System Design">System Design</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Semester
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                    <option value="Semester 3">Semester 3</option>
                    <option value="Semester 4">Semester 4</option>
                    <option value="Semester 5">Semester 5</option>
                    <option value="Semester 6">Semester 6</option>
                    <option value="Semester 7">Semester 7</option>
                    <option value="Semester 8">Semester 8</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. Exam Prep, Interview Core, Cheatsheet"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Note Content (Supports Markdown & Code blocks)
                </label>
                <textarea
                  rows={6}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter main notes content, key formulas, pseudocode, or definitions..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
                >
                  Save & Sync Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Note Detail Reader Modal */}
      {activeNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <button
              onClick={() => setActiveNoteModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {activeNoteModal.subject} • {activeNoteModal.semester}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2">
                {activeNoteModal.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                By {activeNoteModal.authorName} • Updated {new Date(activeNoteModal.updatedAt).toLocaleDateString()}
              </p>
            </div>

            {/* AI Summary Banner if generated */}
            {activeNoteModal.summary && (
              <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-indigo-50 dark:from-amber-950/30 dark:to-indigo-950/30 border border-amber-200/80 dark:border-amber-900/50">
                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-800 dark:text-amber-300 mb-1">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Gemini AI Smart Summary & Key Points</span>
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                  {activeNoteModal.summary}
                </div>
              </div>
            )}

            {/* Content Reader */}
            <div className="flex-1 overflow-y-auto pr-2 py-2 text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line font-sans border-t border-b border-slate-100 dark:border-slate-800 my-2">
              {activeNoteModal.content}
            </div>

            {/* Modal Actions */}
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => handleAiSummarize(activeNoteModal)}
                disabled={isSummarizingId === activeNoteModal.id}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Smart Summary</span>
              </button>

              <button
                onClick={() => handleExportPdf(activeNoteModal)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
