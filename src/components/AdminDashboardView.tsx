import React, { useState } from 'react';
import { 
  ShieldCheck, Download, Plus, Search, Filter, 
  Users, Award, TrendingUp, DollarSign, Megaphone, CheckCircle, AlertTriangle
} from 'lucide-react';
import { StudentRecord, CampusDrive, Announcement } from '../types';

interface AdminDashboardViewProps {
  students: StudentRecord[];
  campusDrives: CampusDrive[];
  onAddCampusDrive: (drive: Omit<CampusDrive, 'id' | 'appliedCount'>) => void;
  onAddAnnouncement: (ann: Omit<Announcement, 'id' | 'createdAt'>) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  students,
  campusDrives,
  onAddCampusDrive,
  onAddAnnouncement
}) => {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);

  // New Campus Drive Form
  const [driveCompany, setDriveCompany] = useState('');
  const [driveRole, setDriveRole] = useState('Software Development Engineer');
  const [drivePackage, setDrivePackage] = useState<number>(24);
  const [driveCgpa, setDriveCgpa] = useState<number>(8.0);
  const [driveDeadline, setDriveDeadline] = useState('2026-08-25');
  const [driveDate, setDriveDate] = useState('2026-08-30');
  const [driveDesc, setDriveDesc] = useState('');

  // Announcement Form
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annCategory, setAnnCategory] = useState<'Placement' | 'Academic' | 'General' | 'Exam'>('Placement');

  // Stats calculation
  const totalStudents = students.length;
  const placedStudents = students.filter((s) => s.placementStatus === 'Placed').length;
  const placementRate = Math.round((placedStudents / totalStudents) * 100);
  const highestPackage = Math.max(...students.map((s) => s.packageLpa || 0), 36);

  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                          s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
                          s.email.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === 'All' || s.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const handleCreateDriveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveCompany) return;

    onAddCampusDrive({
      title: `${driveCompany} On-Campus Recruitment Drive`,
      company: driveCompany,
      role: driveRole,
      packageLpa: Number(drivePackage),
      minCgpa: Number(driveCgpa),
      eligibleBranches: ['CSE', 'IT', 'ECE'],
      deadline: driveDeadline,
      driveDate,
      description: driveDesc || `Recruitment drive for ${driveCompany}. Apply before deadline.`,
      registrationUrl: 'https://studysync.edu/apply',
      active: true
    });

    setDriveCompany('');
    setIsDriveModalOpen(false);
  };

  const handleCreateAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annMessage) return;

    onAddAnnouncement({
      title: annTitle,
      category: annCategory,
      message: annMessage,
      author: 'TPO Placement Office',
      important: true
    });

    setAnnTitle('');
    setAnnMessage('');
    setIsAnnModalOpen(false);
  };

  const handleExportCsv = () => {
    window.open('/api/students/export-csv', '_blank');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Admin Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-amber-500" />
            Admin & TPO Placement Portal
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Student directory management, campus drive publishing, and CSV report export.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsDriveModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Post Campus Drive</span>
          </button>
          <button
            onClick={() => setIsAnnModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Megaphone className="w-4 h-4" />
            <span>Broadcast Alert</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Analytics High Level Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Candidates</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalStudents} Students</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Final year batch 2026</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Placement Success</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{placementRate}% Placed</div>
          <p className="text-[11px] text-slate-500 mt-0.5">{placedStudents} out of {totalStudents} offers locked</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Highest Package</span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{highestPackage} LPA</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Atlassian & Google India</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Active Drives</span>
          <div className="text-2xl font-black text-amber-500 mt-1">{campusDrives.length} Open</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Google, Goldman, Adobe</p>
        </div>
      </div>

      {/* Student Directory Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Student Master Directory
          </h3>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or roll number..."
              className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
            />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800"
            >
              <option value="All">All Depts</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase">
              <tr>
                <th className="p-3.5">Candidate</th>
                <th className="p-3.5">Roll No & Dept</th>
                <th className="p-3.5">CGPA</th>
                <th className="p-3.5">Backlogs</th>
                <th className="p-3.5">Placement Status</th>
                <th className="p-3.5">Placed Company / Package</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredStudents.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                    <div>{st.name}</div>
                    <div className="text-[11px] font-normal text-slate-400">{st.email}</div>
                  </td>
                  <td className="p-3.5 text-slate-700 dark:text-slate-300">
                    <div>{st.rollNumber}</div>
                    <div className="text-[10px] text-slate-400">{st.department}</div>
                  </td>
                  <td className="p-3.5 font-bold">{st.cgpa}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${st.backlogs === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {st.backlogs}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                      st.placementStatus === 'Placed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {st.placementStatus}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-indigo-600 dark:text-indigo-400">
                    {st.placedCompany ? `${st.placedCompany} (${st.packageLpa} LPA)` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Post Campus Drive Modal */}
      {isDriveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-4">
              Post Official Campus Recruitment Drive
            </h3>

            <form onSubmit={handleCreateDriveSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={driveCompany}
                  onChange={(e) => setDriveCompany(e.target.value)}
                  placeholder="e.g. Google India, Goldman Sachs"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Role</label>
                  <input
                    type="text"
                    value={driveRole}
                    onChange={(e) => setDriveRole(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Package (LPA)</label>
                  <input
                    type="number"
                    value={drivePackage}
                    onChange={(e) => setDrivePackage(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description / Requirements</label>
                <textarea
                  rows={3}
                  value={driveDesc}
                  onChange={(e) => setDriveDesc(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDriveModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                >
                  Publish Drive Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Broadcast Announcement Modal */}
      {isAnnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-4">
              Broadcast Campus Announcement
            </h3>

            <form onSubmit={handleCreateAnnouncementSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notice Title</label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. 📢 Mandatory Resume Verification"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Message Body</label>
                <textarea
                  rows={4}
                  required
                  value={annMessage}
                  onChange={(e) => setAnnMessage(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAnnModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs"
                >
                  Send Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
