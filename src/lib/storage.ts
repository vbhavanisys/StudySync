import { AcademicNote, Application, CampusDrive, Announcement, StudentRecord, ResumeItem, User, SavedResource, TaskItem, TimetableSlot, ReminderItem } from '../types';
import { initialUser, initialNotes, initialApplications, initialCampusDrives, initialAnnouncements, initialStudentsRecord, initialResumes } from '../data/initialData';

const STORAGE_KEYS = {
  USER: 'studysync_user_v1',
  PROFILES: 'studysync_profiles_v1',
  NOTES: 'studysync_notes_v1',
  APPLICATIONS: 'studysync_apps_v1',
  DRIVES: 'studysync_drives_v1',
  ANNOUNCEMENTS: 'studysync_announcements_v1',
  STUDENTS: 'studysync_students_v1',
  RESUMES: 'studysync_resumes_v1',
  RESOURCES: 'studysync_resources_v1',
  TASKS: 'studysync_tasks_v1',
  TIMETABLE: 'studysync_timetable_v1',
  FOCUS_LOGS: 'studysync_focus_v1',
  REMINDERS: 'studysync_reminders_v1'
};

type Listener = () => void;
const listeners: Set<Listener> = new Set();

export const subscribeToStore = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('studysync_store_updated'));
  }
};

if (typeof window !== 'undefined') {
  window.addEventListener('storage', () => {
    notifyListeners();
  });
  window.addEventListener('studysync_store_updated', () => {
    // triggers subscriber re-renders
  });

  // Attempt initial background sync with Express Backend Database API
  fetch('/api/db')
    .then((res) => res.json())
    .then((data) => {
      if (data.profiles && data.profiles.length > 0) setStored(STORAGE_KEYS.PROFILES, data.profiles);
      if (data.resources && data.resources.length > 0) setStored(STORAGE_KEYS.RESOURCES, data.resources);
      if (data.tasks && data.tasks.length > 0) setStored(STORAGE_KEYS.TASKS, data.tasks);
      if (data.timetable && data.timetable.length > 0) setStored(STORAGE_KEYS.TIMETABLE, data.timetable);
    })
    .catch(() => {
      // Offline / Local fallback active
    });
}

function getStored<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyListeners();
  } catch (err) {
    console.error('Storage set error:', err);
  }
}

// ---------------- USER PROFILES MANAGEMENT ----------------
export const getCurrentUser = (): User => {
  return getStored<User>(STORAGE_KEYS.USER, initialUser);
};

export const setCurrentUser = (user: User) => {
  setStored(STORAGE_KEYS.USER, user);
};

export const getAllProfiles = (): User[] => {
  return getStored<User[]>(STORAGE_KEYS.PROFILES, [
    initialUser,
    {
      id: 'usr-admin-1',
      name: 'Dr. Sarah Jenkins',
      email: 'admin.jenkins@studysync.edu',
      role: 'administrator',
      department: 'Training & Placement Office',
      rollNumber: 'TPO-DIR-01',
      cgpa: 0,
      targetRole: 'Placement Director',
      bio: 'Head of Corporate Relations & Academic Affairs.',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      verified: true
    },
    {
      id: 'usr-student-2',
      name: 'Priya Sharma',
      email: 'priya.s@studysync.edu',
      role: 'student',
      department: 'Computer Science & Engineering',
      rollNumber: 'CS2023-8810',
      cgpa: 9.45,
      targetRole: 'AI & Data Scientist',
      bio: 'Machine Learning researcher and competitive programmer.',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      verified: true
    }
  ]);
};

export const addProfile = (user: Omit<User, 'id'>): User => {
  const profiles = getAllProfiles();
  const newProf: User = {
    ...user,
    id: `usr-${Date.now()}`,
    verified: true
  };
  const updated = [newProf, ...profiles];
  setStored(STORAGE_KEYS.PROFILES, updated);

  // Sync with backend API
  fetch('/api/profiles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newProf)
  }).catch(() => {});

  return newProf;
};

export const removeProfile = (id: string) => {
  const profiles = getAllProfiles().filter((p) => p.id !== id);
  setStored(STORAGE_KEYS.PROFILES, profiles);

  // Sync deletion with backend API
  fetch(`/api/profiles/${id}`, { method: 'DELETE' }).catch(() => {});
};

// ---------------- SAVED MEDIA & RESOURCES (Links, Videos, Photos) ----------------
export const getResources = (): SavedResource[] => {
  return getStored<SavedResource[]>(STORAGE_KEYS.RESOURCES, [
    {
      id: 'res-101',
      type: 'link',
      title: 'System Design Primer & Distributed Systems Playbook',
      url: 'https://github.com/donnemartin/system-design-primer',
      thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&auto=format&fit=crop&q=80',
      category: 'System Design',
      subject: 'Computer Science',
      description: 'Comprehensive roadmap for designing large-scale distributed architectures, caching strategies, and database sharding.',
      tags: ['System Design', 'Scalability', 'Interview Prep'],
      isPinned: true,
      createdAt: new Date().toISOString(),
      authorName: 'Alex Rivera'
    },
    {
      id: 'res-102',
      type: 'video',
      title: 'Operating Systems - Concurrency, Mutex & Semaphores Lecture',
      url: 'https://www.youtube.com/watch?v=gT8U7J182sU',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop&q=80',
      category: 'Core Computer Science',
      subject: 'Operating Systems',
      description: 'Deep dive into race conditions, critical section problem, Peterson\'s solution, and Semaphore implementation.',
      tags: ['OS', 'Concurrency', 'Sem Exams'],
      isPinned: true,
      createdAt: new Date().toISOString(),
      authorName: 'Dr. Marcus Vance',
      videoDuration: '45:20'
    },
    {
      id: 'res-103',
      type: 'photo',
      title: 'B+ Tree Indexing & Database Query Execution Flowchart',
      url: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&auto=format&fit=crop&q=80',
      category: 'Database Systems',
      subject: 'DBMS',
      description: 'Handwritten diagram showing leaf node pointers in B+ Trees vs B-Trees with range search time complexities.',
      tags: ['Diagram', 'SQL', 'Handwritten Notes'],
      isPinned: false,
      createdAt: new Date().toISOString(),
      authorName: 'Priya Sharma'
    }
  ]);
};

export const addResource = (res: Omit<SavedResource, 'id' | 'createdAt'>): SavedResource => {
  const items = getResources();
  const newRes: SavedResource = {
    ...res,
    id: `res-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  setStored(STORAGE_KEYS.RESOURCES, [newRes, ...items]);

  fetch('/api/resources', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newRes)
  }).catch(() => {});

  return newRes;
};

export const updateResource = (id: string, updates: Partial<SavedResource>) => {
  const items = getResources().map((r) => (r.id === id ? { ...r, ...updates } : r));
  setStored(STORAGE_KEYS.RESOURCES, items);

  fetch(`/api/resources/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  }).catch(() => {});
};

export const deleteResource = (id: string) => {
  const items = getResources().filter((r) => r.id !== id);
  setStored(STORAGE_KEYS.RESOURCES, items);

  fetch(`/api/resources/${id}`, { method: 'DELETE' }).catch(() => {});
};

// ---------------- TASK SCHEDULER & WEEKLY TIMETABLE ----------------
export const getTasks = (): TaskItem[] => {
  return getStored<TaskItem[]>(STORAGE_KEYS.TASKS, [
    {
      id: 'task-1',
      studentId: 'usr-student-1',
      title: 'Complete LeetCode Top 75 Dynamic Programming Questions',
      subject: 'Data Structures & Algorithms',
      priority: 'High',
      status: 'In Progress',
      category: 'Placement Prep',
      dueDate: '2026-08-10',
      durationMinutes: 120,
      notes: 'Focus on 0/1 Knapsack variations and Longest Common Subsequence.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'task-2',
      studentId: 'usr-student-1',
      title: 'Submit OS Mid-Sem Practical Assignment Lab Report',
      subject: 'Operating Systems',
      priority: 'High',
      status: 'Pending',
      category: 'Assignment',
      dueDate: '2026-08-08',
      durationMinutes: 60,
      notes: 'Include banker\'s safety check C++ code output screenshot.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'task-3',
      studentId: 'usr-student-1',
      title: 'Review System Design Microservices Caching with Redis',
      subject: 'System Design',
      priority: 'Medium',
      status: 'Completed',
      category: 'Project',
      dueDate: '2026-08-02',
      durationMinutes: 45,
      notes: 'Read Redis eviction policies (LRU vs LFU).',
      createdAt: new Date().toISOString()
    }
  ]);
};

export const addTask = (t: Omit<TaskItem, 'id' | 'createdAt'>): TaskItem => {
  const tasks = getTasks();
  const newTask: TaskItem = {
    ...t,
    id: `task-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  setStored(STORAGE_KEYS.TASKS, [newTask, ...tasks]);

  fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newTask)
  }).catch(() => {});

  return newTask;
};

export const updateTask = (id: string, updates: Partial<TaskItem>) => {
  const tasks = getTasks().map((t) => (t.id === id ? { ...t, ...updates } : t));
  setStored(STORAGE_KEYS.TASKS, tasks);

  fetch(`/api/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  }).catch(() => {});
};

export const deleteTask = (id: string) => {
  const tasks = getTasks().filter((t) => t.id !== id);
  setStored(STORAGE_KEYS.TASKS, tasks);

  fetch(`/api/tasks/${id}`, { method: 'DELETE' }).catch(() => {});
};

export const getTimetable = (): TimetableSlot[] => {
  return getStored<TimetableSlot[]>(STORAGE_KEYS.TIMETABLE, [
    {
      id: 'slot-1',
      studentId: 'usr-student-1',
      dayOfWeek: 'Monday',
      startTime: '09:00',
      endTime: '10:30',
      title: 'Operating Systems Lecture',
      subject: 'OS Core',
      location: 'LH-302 Main Block',
      sessionType: 'Lecture',
      colorTag: 'bg-indigo-500'
    },
    {
      id: 'slot-2',
      studentId: 'usr-student-1',
      dayOfWeek: 'Monday',
      startTime: '11:00',
      endTime: '12:30',
      title: 'Data Structures Lab Practice',
      subject: 'Algorithms',
      location: 'Lab 4 - CS Block',
      sessionType: 'Lab',
      colorTag: 'bg-emerald-500'
    },
    {
      id: 'slot-3',
      studentId: 'usr-student-1',
      dayOfWeek: 'Tuesday',
      startTime: '10:00',
      endTime: '11:30',
      title: 'DBMS SQL Indexing & Optimization',
      subject: 'DBMS',
      location: 'LH-101',
      sessionType: 'Lecture',
      colorTag: 'bg-sky-500'
    },
    {
      id: 'slot-4',
      studentId: 'usr-student-1',
      dayOfWeek: 'Wednesday',
      startTime: '14:00',
      endTime: '16:00',
      title: 'Google Placement Drive Mock Interview',
      subject: 'Career Prep',
      location: 'TPO Seminar Hall',
      sessionType: 'Interview Prep',
      colorTag: 'bg-amber-500'
    },
    {
      id: 'slot-5',
      studentId: 'usr-student-1',
      dayOfWeek: 'Thursday',
      startTime: '15:00',
      endTime: '17:00',
      title: 'Deep Focus Self-Study & Revision',
      subject: 'System Design',
      location: 'Central Library Floor 2',
      sessionType: 'Self Study',
      colorTag: 'bg-purple-500'
    }
  ]);
};

export const addTimetableSlot = (slot: Omit<TimetableSlot, 'id'>): TimetableSlot => {
  const slots = getTimetable();
  const newSlot: TimetableSlot = {
    ...slot,
    id: `slot-${Date.now()}`
  };
  setStored(STORAGE_KEYS.TIMETABLE, [...slots, newSlot]);

  fetch('/api/timetable', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newSlot)
  }).catch(() => {});

  return newSlot;
};

export const deleteTimetableSlot = (id: string) => {
  const slots = getTimetable().filter((s) => s.id !== id);
  setStored(STORAGE_KEYS.TIMETABLE, slots);

  fetch(`/api/timetable/${id}`, { method: 'DELETE' }).catch(() => {});
};

// ---------------- ACADEMIC NOTES ----------------
export const getNotes = (): AcademicNote[] => {
  return getStored<AcademicNote[]>(STORAGE_KEYS.NOTES, initialNotes);
};

export const addNote = (note: Omit<AcademicNote, 'id' | 'createdAt' | 'updatedAt' | 'likesCount'>): AcademicNote => {
  const notes = getNotes();
  const newNote: AcademicNote = {
    ...note,
    id: `note-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    likesCount: 0
  };
  setStored(STORAGE_KEYS.NOTES, [newNote, ...notes]);
  return newNote;
};

export const updateNote = (id: string, updates: Partial<AcademicNote>) => {
  const notes = getNotes();
  const updated = notes.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n));
  setStored(STORAGE_KEYS.NOTES, updated);
};

export const deleteNote = (id: string) => {
  const notes = getNotes();
  setStored(STORAGE_KEYS.NOTES, notes.filter((n) => n.id !== id));
};

export const likeNote = (id: string) => {
  const notes = getNotes();
  const updated = notes.map((n) => (n.id === id ? { ...n, likesCount: n.likesCount + 1 } : n));
  setStored(STORAGE_KEYS.NOTES, updated);
};

// ---------------- PLACEMENT APPLICATIONS ----------------
export const getApplications = (): Application[] => {
  return getStored<Application[]>(STORAGE_KEYS.APPLICATIONS, initialApplications);
};

export const addApplication = (app: Omit<Application, 'id'>): Application => {
  const apps = getApplications();
  const newApp: Application = {
    ...app,
    id: `app-${Date.now()}`
  };
  setStored(STORAGE_KEYS.APPLICATIONS, [newApp, ...apps]);
  return newApp;
};

export const updateApplicationStatus = (id: string, status: Application['status']) => {
  const apps = getApplications();
  const updated = apps.map((a) => (a.id === id ? { ...a, status } : a));
  setStored(STORAGE_KEYS.APPLICATIONS, updated);
};

export const updateApplication = (id: string, updates: Partial<Application>) => {
  const apps = getApplications();
  const updated = apps.map((a) => (a.id === id ? { ...a, ...updates } : a));
  setStored(STORAGE_KEYS.APPLICATIONS, updated);
};

export const deleteApplication = (id: string) => {
  const apps = getApplications();
  setStored(STORAGE_KEYS.APPLICATIONS, apps.filter((a) => a.id !== id));
};

// ---------------- CAMPUS PLACEMENT DRIVES ----------------
export const getCampusDrives = (): CampusDrive[] => {
  return getStored<CampusDrive[]>(STORAGE_KEYS.DRIVES, initialCampusDrives);
};

export const addCampusDrive = (drive: Omit<CampusDrive, 'id' | 'appliedCount'>): CampusDrive => {
  const drives = getCampusDrives();
  const newDrive: CampusDrive = {
    ...drive,
    id: `drive-${Date.now()}`,
    appliedCount: 0
  };
  setStored(STORAGE_KEYS.DRIVES, [newDrive, ...drives]);
  return newDrive;
};

// ---------------- ANNOUNCEMENTS ----------------
export const getAnnouncements = (): Announcement[] => {
  return getStored<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, initialAnnouncements);
};

export const addAnnouncement = (ann: Omit<Announcement, 'id' | 'createdAt'>): Announcement => {
  const list = getAnnouncements();
  const newAnn: Announcement = {
    ...ann,
    id: `ann-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  setStored(STORAGE_KEYS.ANNOUNCEMENTS, [newAnn, ...list]);
  return newAnn;
};

// ---------------- ADMIN STUDENT DIRECTORY ----------------
export const getStudentsRecord = (): StudentRecord[] => {
  return getStored<StudentRecord[]>(STORAGE_KEYS.STUDENTS, initialStudentsRecord);
};

export const addStudentRecord = (st: Omit<StudentRecord, 'id'>): StudentRecord => {
  const records = getStudentsRecord();
  const newSt: StudentRecord = {
    ...st,
    id: `st-${Date.now()}`
  };
  setStored(STORAGE_KEYS.STUDENTS, [newSt, ...records]);
  return newSt;
};

export const updateStudentRecord = (id: string, updates: Partial<StudentRecord>) => {
  const records = getStudentsRecord();
  const updated = records.map((s) => (s.id === id ? { ...s, ...updates } : s));
  setStored(STORAGE_KEYS.STUDENTS, updated);
};

// ---------------- RESUMES WITH ATTRACT PICTURE & 5-STAR RATING ----------------
export const getResumes = (): ResumeItem[] => {
  return getStored<ResumeItem[]>(STORAGE_KEYS.RESUMES, [
    {
      id: 'res-1',
      studentId: 'usr-student-1',
      title: 'Alex_Rivera_SDE_Resume_V3.pdf',
      version: '3.2 (Latest)',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      rating: 4.9,
      ratingBreakdown: {
        format: 4.8,
        keywords: 5.0,
        impact: 4.7,
        technical: 5.0
      },
      template: 'Modern Tech',
      uploadedAt: '2026-07-28',
      isPrimary: true,
      atsScore: 92,
      matchedSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'System Design', 'Git'],
      suggestedImprovements: [
        'Quantify performance metrics in Google Cloud internship project (e.g. reduced latency by 35%).',
        'Add 2 additional keywords from AWS Job Description: Terraform, K8s.'
      ]
    },
    {
      id: 'res-2',
      studentId: 'usr-student-1',
      title: 'Alex_Rivera_Backend_Cloud_Resume.pdf',
      version: '2.1',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      rating: 4.6,
      ratingBreakdown: {
        format: 4.5,
        keywords: 4.7,
        impact: 4.6,
        technical: 4.8
      },
      template: 'Executive Clean',
      uploadedAt: '2026-07-20',
      isPrimary: false,
      atsScore: 86,
      matchedSkills: ['Node.js', 'Express', 'SQL', 'Redis', 'Linux'],
      suggestedImprovements: ['Include frontend React project credentials to show full-stack breadth.']
    }
  ]);
};

export const addResume = (res: Omit<ResumeItem, 'id' | 'uploadedAt'>): ResumeItem => {
  const list = getResumes();
  const newRes: ResumeItem = {
    ...res,
    id: `res-${Date.now()}`,
    uploadedAt: new Date().toISOString().split('T')[0],
    rating: res.rating || 4.8
  };
  setStored(STORAGE_KEYS.RESUMES, [newRes, ...list]);
  return newRes;
};

export const updateResumeRating = (id: string, newRating: number, breakdown?: ResumeItem['ratingBreakdown']) => {
  const list = getResumes();
  const updated = list.map((r) => (r.id === id ? { ...r, rating: newRating, ratingBreakdown: breakdown || r.ratingBreakdown } : r));
  setStored(STORAGE_KEYS.RESUMES, updated);
};

export const updateResumePhoto = (id: string, photoUrl: string) => {
  const list = getResumes();
  const updated = list.map((r) => (r.id === id ? { ...r, photoUrl } : r));
  setStored(STORAGE_KEYS.RESUMES, updated);
};

// ---------------- FOCUS TIME LOGS ----------------
export interface FocusLog {
  id: string;
  subject: string;
  minutes: number;
  date: string;
}

export const getFocusLogs = (): FocusLog[] => {
  return getStored<FocusLog[]>(STORAGE_KEYS.FOCUS_LOGS, [
    { id: 'f1', subject: 'Operating Systems', minutes: 50, date: '2026-08-01' },
    { id: 'f2', subject: 'Data Structures', minutes: 75, date: '2026-08-01' },
    { id: 'f3', subject: 'Aptitude Practice', minutes: 45, date: '2026-08-02' }
  ]);
};

export const addFocusLog = (log: Omit<FocusLog, 'id' | 'date'>) => {
  const logs = getFocusLogs();
  const newLog: FocusLog = {
    ...log,
    id: `f-${Date.now()}`,
    date: new Date().toISOString().split('T')[0]
  };
  setStored(STORAGE_KEYS.FOCUS_LOGS, [newLog, ...logs]);
};

// ---------------- REMINDERS & NOTIFICATIONS ----------------
export const getReminders = (): ReminderItem[] => {
  return getStored<ReminderItem[]>(STORAGE_KEYS.REMINDERS, [
    {
      id: 'rem-1',
      title: 'Operating Systems Semester Exam Registration',
      category: 'Exam',
      datetime: '2026-08-05T10:00',
      isHighSoundAlert: true,
      completed: false,
      notes: 'Ensure hall ticket copy is attached',
      createdAt: new Date().toISOString()
    },
    {
      id: 'rem-2',
      title: 'Google Placement Interview Round 1',
      category: 'Placement',
      datetime: '2026-08-08T14:30',
      isHighSoundAlert: true,
      completed: false,
      notes: 'Prepare system design graphs and trees',
      createdAt: new Date().toISOString()
    },
    {
      id: 'rem-3',
      title: 'Data Structures Lab Assignment Submission',
      category: 'Assignment',
      datetime: '2026-08-03T18:00',
      isHighSoundAlert: false,
      completed: true,
      notes: 'Submitted via GitHub Classroom',
      createdAt: new Date().toISOString()
    }
  ]);
};

export const addReminder = (rem: Omit<ReminderItem, 'id' | 'completed' | 'createdAt'>) => {
  const list = getReminders();
  const newRem: ReminderItem = {
    ...rem,
    id: `rem-${Date.now()}`,
    completed: false,
    createdAt: new Date().toISOString()
  };
  setStored(STORAGE_KEYS.REMINDERS, [newRem, ...list]);
};

export const toggleReminder = (id: string) => {
  const list = getReminders();
  const updated = list.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r));
  setStored(STORAGE_KEYS.REMINDERS, updated);
};

export const deleteReminder = (id: string) => {
  const list = getReminders();
  const updated = list.filter((r) => r.id !== id);
  setStored(STORAGE_KEYS.REMINDERS, updated);
};

// Reset to factory seed data
export const resetToSeedData = () => {
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.PROFILES);
  localStorage.removeItem(STORAGE_KEYS.NOTES);
  localStorage.removeItem(STORAGE_KEYS.APPLICATIONS);
  localStorage.removeItem(STORAGE_KEYS.DRIVES);
  localStorage.removeItem(STORAGE_KEYS.ANNOUNCEMENTS);
  localStorage.removeItem(STORAGE_KEYS.STUDENTS);
  localStorage.removeItem(STORAGE_KEYS.RESUMES);
  localStorage.removeItem(STORAGE_KEYS.RESOURCES);
  localStorage.removeItem(STORAGE_KEYS.TASKS);
  localStorage.removeItem(STORAGE_KEYS.TIMETABLE);
  localStorage.removeItem(STORAGE_KEYS.FOCUS_LOGS);
  localStorage.removeItem(STORAGE_KEYS.REMINDERS);
  notifyListeners();
};

