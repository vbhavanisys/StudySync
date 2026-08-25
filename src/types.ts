export type UserRole = 'student' | 'administrator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  rollNumber: string;
  cgpa: number;
  targetRole: string;
  bio?: string;
  avatarUrl?: string;
  verified?: boolean;
}

export interface AcademicNote {
  id: string;
  title: string;
  subject: string;
  semester: string;
  tags: string[];
  content: string;
  summary?: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  authorName: string;
  likesCount: number;
  attachmentUrl?: string;
  isPrivate?: boolean;
}

export type ApplicationStatus = 'Saved' | 'Applied' | 'Aptitude Test' | 'Interviewing' | 'Offer' | 'Rejected';

export interface Application {
  id: string;
  studentId: string;
  company: string;
  logoUrl?: string;
  role: string;
  packageLpa: number;
  location: string;
  status: ApplicationStatus;
  appliedDate: string;
  deadline: string;
  notes?: string;
  roundsCompleted: number;
  totalRounds: number;
  interviewDate?: string;
}

export interface ResumeRatingBreakdown {
  format: number; // e.g. 4.8
  keywords: number; // e.g. 4.9
  impact: number; // e.g. 4.5
  technical: number; // e.g. 5.0
}

export interface ResumeItem {
  id: string;
  studentId: string;
  title: string;
  version: string;
  fileUrl?: string;
  photoUrl?: string; // Pic to attract / candidate headshot
  rating: number; // Overall score from 1.0 to 5.0
  ratingBreakdown?: ResumeRatingBreakdown;
  template?: 'Modern Tech' | 'Executive Clean' | 'Creative Canvas';
  uploadedAt: string;
  isPrimary: boolean;
  atsScore: number;
  matchedSkills: string[];
  suggestedImprovements: string[];
}

export type ResourceType = 'link' | 'video' | 'photo';

export interface SavedResource {
  id: string;
  type: ResourceType;
  title: string;
  url: string;
  thumbnailUrl?: string;
  category: string; // e.g., 'Computer Science', 'Aptitude', 'System Design'
  subject?: string;
  description?: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  authorName?: string;
  videoDuration?: string;
}

export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type TaskCategory = 'Exam' | 'Assignment' | 'Placement Prep' | 'Project' | 'Personal';

export interface TaskItem {
  id: string;
  studentId: string;
  title: string;
  subject: string;
  priority: TaskPriority;
  status: TaskStatus;
  category: TaskCategory;
  dueDate: string;
  durationMinutes: number;
  notes?: string;
  createdAt: string;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export type TimetableSessionType = 'Lecture' | 'Lab' | 'Self Study' | 'Interview Prep' | 'Revision';

export interface TimetableSlot {
  id: string;
  studentId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // "09:00"
  endTime: string;   // "10:30"
  title: string;
  subject: string;
  location?: string;
  sessionType: TimetableSessionType;
  colorTag: string; // Tailwind color class or hex
}

export interface CampusDrive {
  id: string;
  title: string;
  company: string;
  logoUrl?: string;
  role: string;
  packageLpa: number;
  minCgpa: number;
  eligibleBranches: string[];
  deadline: string;
  driveDate: string;
  description: string;
  registrationUrl: string;
  active: boolean;
  appliedCount?: number;
}

export interface FocusSession {
  id: string;
  studentId: string;
  subject: string;
  durationMinutes: number;
  date: string;
  sessionType: 'Pomodoro' | 'Deep Work' | 'Revision';
}

export interface Announcement {
  id: string;
  title: string;
  category: 'Placement' | 'Academic' | 'General' | 'Exam';
  message: string;
  createdAt: string;
  author: string;
  important: boolean;
}

export interface ReminderItem {
  id: string;
  title: string;
  category: 'Exam' | 'Placement' | 'Lecture' | 'Assignment' | 'Personal';
  datetime: string;
  isHighSoundAlert: boolean;
  completed: boolean;
  notes?: string;
  createdAt: string;
}

export interface SkillMetric {
  subject: string;
  score: number;
  target: number;
  category: 'Coding' | 'Aptitude' | 'Soft Skills' | 'Core';
}

export interface StudentRecord {
  id: string;
  name: string;
  rollNumber: string;
  department: string;
  cgpa: number;
  backlogs: number;
  placementStatus: 'Placed' | 'In Process' | 'Seeking';
  placedCompany?: string;
  packageLpa?: number;
  email: string;
  applicationsCount: number;
}

