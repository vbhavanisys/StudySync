import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { NotesHubView } from './components/NotesHubView';
import { PlacementTrackerView } from './components/PlacementTrackerView';
import { ResourceVaultView } from './components/ResourceVaultView';
import { SchedulerTimetableView } from './components/SchedulerTimetableView';
import { ProfilesManagerView } from './components/ProfilesManagerView';
import { FocusPomodoroView } from './components/FocusPomodoroView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { ProfileSettingsView } from './components/ProfileSettingsView';
import { SupabaseDataView } from './components/SupabaseDataView';
import { AuthModal } from './components/AuthModal';
import { fetchApplications, fetchNotes } from './lib/db';

import { User, AcademicNote, Application, CampusDrive, Announcement, StudentRecord, ResumeItem, SavedResource, TaskItem, TimetableSlot } from './types';
import { 
  getCurrentUser, setCurrentUser, subscribeToStore, 
  getNotes, addNote, updateNote, deleteNote, likeNote,
  getApplications, addApplication, updateApplicationStatus, deleteApplication,
  getCampusDrives, addCampusDrive,
  getAnnouncements, addAnnouncement,
  getStudentsRecord,
  getResumes, addResume,
  getResources, addResource, updateResource, deleteResource,
  getTasks, addTask, updateTask, deleteTask,
  getTimetable, addTimetableSlot, deleteTimetableSlot,
  getAllProfiles, addProfile, removeProfile
} from './lib/storage';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Store States
  const [notes, setNotes] = useState<AcademicNote[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [campusDrives, setCampusDrives] = useState<CampusDrive[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [studentsRecord, setStudentsRecord] = useState<StudentRecord[]>([]);
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [resources, setResources] = useState<SavedResource[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [profiles, setProfiles] = useState<User[]>([]);

  // Sync state with storage engine
  const refreshFromStore = () => {
    setUser(getCurrentUser());
    setNotes(getNotes());
    setApplications(getApplications());
    setCampusDrives(getCampusDrives());
    setAnnouncements(getAnnouncements());
    setStudentsRecord(getStudentsRecord());
    setResumes(getResumes());
    setResources(getResources());
    setTasks(getTasks());
    setTimetable(getTimetable());
    setProfiles(getAllProfiles());
  };

  useEffect(() => {
    refreshFromStore();

    // Async fetch from Supabase to load cloud applications & notes
    async function initSupabaseData() {
      try {
        const [supabaseApps, supabaseNotes] = await Promise.all([
          fetchApplications(),
          fetchNotes()
        ]);

        if (supabaseApps.length > 0) {
          const mappedApps: Application[] = supabaseApps.map((sa) => ({
            id: String(sa.id),
            studentId: user?.id || 'std-1',
            company: sa.company,
            role: sa.role,
            packageLpa: 14,
            location: 'Bangalore, India',
            status: (sa.status as any) || 'Applied',
            appliedDate: sa.applied_date || new Date().toISOString().slice(0, 10),
            deadline: '2026-08-30',
            roundsCompleted: 1,
            totalRounds: 3
          }));
          setApplications((prev) => {
            const existingIds = new Set(prev.map(p => p.id));
            const newOns = mappedApps.filter(m => !existingIds.has(m.id));
            return [...newOns, ...prev];
          });
        }

        if (supabaseNotes.length > 0) {
          const mappedNotes: AcademicNote[] = supabaseNotes.map((sn) => ({
            id: String(sn.id),
            title: sn.title,
            subject: 'Computer Science & AI',
            semester: 'Semester 6',
            tags: ['Supabase', 'Cloud Storage'],
            content: sn.content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            authorId: 'auth-supa',
            authorName: 'Cloud Sync User',
            likesCount: 5,
            isPrivate: false
          }));
          setNotes((prev) => {
            const existingIds = new Set(prev.map(p => p.id));
            const newOns = mappedNotes.filter(m => !existingIds.has(m.id));
            return [...newOns, ...prev];
          });
        }
      } catch (err) {
        console.error('Supabase auto-sync failed:', err);
      }
    }

    initSupabaseData();

    const unsubscribe = subscribeToStore(() => {
      refreshFromStore();
    });
    return () => unsubscribe();
  }, []);


  const handleSwitchRole = (newRole: 'student' | 'administrator') => {
    if (!user) return;
    const updatedUser = { ...user, role: newRole };
    setUser(updatedUser);
    setCurrentUser(updatedUser);
  };

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    setCurrentUser(newUser);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthModalOpen(true);
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors ${isDarkMode ? 'dark' : ''}`}>
      {/* Top Navbar */}
      <Navbar
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSwitchRole={handleSwitchRole}
        onLogout={handleLogout}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      {/* Main Body Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          role={user?.role || 'student'}
          notesCount={notes.length}
          appsCount={applications.length}
          resourcesCount={resources.length}
          tasksCount={tasks.length}
        />

        {/* Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {activeTab === 'dashboard' && user && (
            <DashboardView
              user={user}
              notes={notes}
              applications={applications}
              campusDrives={campusDrives}
              announcements={announcements}
              onNavigate={setActiveTab}
              onOpenAddNote={() => setActiveTab('notes')}
              onOpenAddApplication={() => setActiveTab('placement')}
            />
          )}

          {activeTab === 'notes' && user && (
            <NotesHubView
              notes={notes}
              user={user}
              onAddNote={(n) => addNote(n)}
              onLikeNote={(id) => likeNote(id)}
              onDeleteNote={(id) => deleteNote(id)}
            />
          )}

          {activeTab === 'placement' && user && (
            <PlacementTrackerView
              applications={applications}
              resumes={resumes}
              user={user}
              onAddApplication={(app) => addApplication(app)}
              onUpdateStatus={(id, st) => updateApplicationStatus(id, st)}
              onDeleteApplication={(id) => deleteApplication(id)}
              onAddResume={(res) => addResume(res)}
            />
          )}

          {activeTab === 'resources' && (
            <ResourceVaultView
              resources={resources}
              onAddResource={(r) => addResource(r)}
              onUpdateResource={(id, up) => updateResource(id, up)}
              onDeleteResource={(id) => deleteResource(id)}
            />
          )}

          {activeTab === 'scheduler' && (
            <SchedulerTimetableView
              tasks={tasks}
              timetable={timetable}
              onAddTask={(t) => addTask(t)}
              onUpdateTask={(id, up) => updateTask(id, up)}
              onDeleteTask={(id) => deleteTask(id)}
              onAddTimetableSlot={(s) => addTimetableSlot(s)}
              onDeleteTimetableSlot={(id) => deleteTimetableSlot(id)}
            />
          )}

          {activeTab === 'profiles' && user && (
            <ProfilesManagerView
              profiles={profiles}
              currentUser={user}
              onSelectProfile={(u) => {
                setUser(u);
                setCurrentUser(u);
              }}
              onAddProfile={(u) => addProfile(u)}
              onRemoveProfile={(id) => removeProfile(id)}
            />
          )}

          {activeTab === 'focus' && (
            <FocusPomodoroView />
          )}

          {activeTab === 'supabase' && (
            <SupabaseDataView />
          )}

          {activeTab === 'admin' && user?.role === 'administrator' && (
            <AdminDashboardView
              students={studentsRecord}
              campusDrives={campusDrives}
              onAddCampusDrive={(d) => addCampusDrive(d)}
              onAddAnnouncement={(a) => addAnnouncement(a)}
            />
          )}

          {activeTab === 'settings' && user && (
            <ProfileSettingsView
              user={user}
              onUpdateUser={(u) => {
                setUser(u);
                setCurrentUser(u);
              }}
              isDarkMode={isDarkMode}
              onToggleDarkMode={handleToggleDarkMode}
            />
          )}
        </main>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}
