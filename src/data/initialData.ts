import { AcademicNote, Application, CampusDrive, Announcement, SkillMetric, StudentRecord, ResumeItem, User } from '../types';

export const initialUser: User = {
  id: 'usr-student-1',
  name: 'Alex Rivera',
  email: 'alex.rivera@studysync.edu',
  role: 'student',
  department: 'Computer Science & Engineering',
  rollNumber: 'CS2023-8842',
  cgpa: 8.92,
  targetRole: 'Full Stack Software Engineer',
  bio: 'Final year CSE undergraduate passionate about distributed systems, React & cloud architecture.',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  verified: true
};

export const initialAdminUser: User = {
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
};

export const initialNotes: AcademicNote[] = [
  {
    id: 'note-101',
    title: 'Operating Systems - Concurrency & Deadlocks Complete Cheatsheet',
    subject: 'Operating Systems',
    semester: 'Semester 5',
    tags: ['Sem Exams', 'Interview Core', 'OS'],
    content: `# Operating Systems: Concurrency & Deadlocks

## 1. What is a Deadlock?
A deadlock occurs when a set of processes are blocked because each process is holding a resource and waiting for another resource held by some other process.

### 4 Necessary Conditions for Deadlock (Coffman Conditions):
1. **Mutual Exclusion**: At least one resource must be held in a non-shareable mode.
2. **Hold and Wait**: A process must be holding at least one resource and waiting to acquire additional resources.
3. **No Preemption**: Resources cannot be preempted; a resource can be released only voluntarily by the process holding it.
4. **Circular Wait**: A closed chain of processes exists, such that each process holds one or more resources needed by the next process.

## 2. Banker's Algorithm (Deadlock Avoidance)
Used to allocate resources to each process in a manner that avoids deadlocks by checking the safety state before allocation.

### Formulas:
- \`Need[i][j] = Max[i][j] - Allocation[i][j]\`
- Safety algorithm iterates over processes where \`Need[i] <= Available\`.

\`\`\`cpp
// Pseudocode for Banker's Safety Check
bool isSafeState(int n, int m, vector<vector<int>>& alloc, vector<vector<int>>& max, vector<int>& avail) {
    vector<int> work = avail;
    vector<bool> finish(n, false);
    int count = 0;
    while (count < n) {
        bool found = false;
        for (int p = 0; p < n; p++) {
            if (!finish[p]) {
                bool canExec = true;
                for (int j = 0; j < m; j++) {
                    if (max[p][j] - alloc[p][j] > work[j]) {
                        canExec = false; break;
                    }
                }
                if (canExec) {
                    for (int k = 0; k < m; k++) work[k] += alloc[p][k];
                    finish[p] = true;
                    found = true;
                    count++;
                }
            }
        }
        if (!found) return false; // System not in safe state
    }
    return true;
}
\`\`\``,
    summary: 'Comprehensive review of the 4 Coffman deadlock conditions (Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait) and Banker\'s Safety Avoidance Algorithm with CPP code reference.',
    createdAt: '2026-07-28T10:30:00Z',
    updatedAt: '2026-07-28T10:30:00Z',
    authorId: 'usr-student-1',
    authorName: 'Alex Rivera',
    likesCount: 24,
    isPrivate: false
  },
  {
    id: 'note-102',
    title: 'Data Structures & Algorithms - Dynamic Programming Master Patterns',
    subject: 'Data Structures & Algorithms',
    semester: 'Semester 4',
    tags: ['Placement', 'LeetCode', 'Algorithms'],
    content: `# Dynamic Programming Master Patterns

## 1. 0/1 Knapsack Pattern
- **Problem Statement**: Given weights and values of N items, put these items in a knapsack of capacity W to get maximum total value.
- **State Transition**: \`dp[i][w] = max(val[i-1] + dp[i-1][w - wt[i-1]], dp[i-1][w])\`

## 2. Unbounded Knapsack / Coin Change
- Repetitive choices allowed.
- State Transition: \`dp[w] = min(dp[w], 1 + dp[w - coin])\`

## 3. Longest Common Subsequence (LCS)
- Strings S1 of len N, S2 of len M.
- If S1[i] == S2[j]: \`dp[i][j] = 1 + dp[i-1][j-1]\`
- Else: \`dp[i][j] = max(dp[i-1][j], dp[i][j-1])\`

## Top Interview Questions Checklist:
1. Longest Increasing Subsequence (LIS) - O(N log N) using Binary Search
2. Edit Distance
3. Word Break Problem
4. Target Sum Subset`,
    summary: 'Core DP top-patterns covering 0/1 Knapsack, Coin Change, LCS, and LIS with time complexity analysis and state transition formulas for tech placement interviews.',
    createdAt: '2026-07-25T14:15:00Z',
    updatedAt: '2026-07-25T14:15:00Z',
    authorId: 'usr-student-1',
    authorName: 'Alex Rivera',
    likesCount: 42,
    isPrivate: false
  },
  {
    id: 'note-103',
    title: 'Database Management - SQL Query Optimization & Indexing B-Trees',
    subject: 'Database Systems',
    semester: 'Semester 5',
    tags: ['DBMS', 'SQL', 'Sem Exams'],
    content: `# DBMS Indexing & Query Tuning

## B-Tree vs B+ Tree Indexing
- **B-Tree**: Data pointers exist in both internal nodes and leaf nodes.
- **B+ Tree**: Data pointers exist ONLY in leaf nodes. Leaves are doubly linked for fast sequential range scans.

## EXPLAIN ANALYZE Tips:
- Prefer \`EXISTS\` over \`IN\` for subqueries with large datasets.
- Avoid wildcard prefixes like \`LIKE '%abc'\` as they bypass B-Tree index scans (full table scan forced).
- Create composite indexes ordering high selectivity columns first.`,
    summary: 'Explanation of B+ Tree structural advantages for range queries and query optimization rules with EXPLAIN ANALYZE.',
    createdAt: '2026-07-20T09:00:00Z',
    updatedAt: '2026-07-20T09:00:00Z',
    authorId: 'usr-student-1',
    authorName: 'Alex Rivera',
    likesCount: 19,
    isPrivate: false
  }
];

export const initialApplications: Application[] = [
  {
    id: 'app-001',
    studentId: 'usr-student-1',
    company: 'Google Cloud Platform',
    role: 'Software Engineer - New Grad 2026',
    packageLpa: 32,
    location: 'Bengaluru / Hybrid',
    status: 'Interviewing',
    appliedDate: '2026-07-01',
    deadline: '2026-08-15',
    notes: 'Cleared Online Assessment with 100% test cases. Technical Round 2 scheduled.',
    roundsCompleted: 2,
    totalRounds: 4,
    interviewDate: '2026-08-05T14:00:00Z'
  },
  {
    id: 'app-002',
    studentId: 'usr-student-1',
    company: 'Microsoft',
    role: 'Software Development Engineer I',
    packageLpa: 28,
    location: 'Hyderabad, India',
    status: 'Aptitude Test',
    appliedDate: '2026-07-10',
    deadline: '2026-08-10',
    notes: 'Aptitude & Coding Round link active till Aug 10.',
    roundsCompleted: 1,
    totalRounds: 4
  },
  {
    id: 'app-003',
    studentId: 'usr-student-1',
    company: 'Atlassian',
    role: 'Associate Frontend Developer',
    packageLpa: 36,
    location: 'Remote',
    status: 'Offer',
    appliedDate: '2026-06-15',
    deadline: '2026-07-30',
    notes: 'Received official offer letter! 36 LPA Base + Stocks. Offer acceptance pending.',
    roundsCompleted: 4,
    totalRounds: 4
  },
  {
    id: 'app-004',
    studentId: 'usr-student-1',
    company: 'Amazon Web Services',
    role: 'SDE-1 - Distributed Systems',
    packageLpa: 30,
    location: 'Bengaluru',
    status: 'Applied',
    appliedDate: '2026-07-22',
    deadline: '2026-08-20',
    notes: 'Application submitted via On-Campus Placement Drive.',
    roundsCompleted: 0,
    totalRounds: 4
  },
  {
    id: 'app-005',
    studentId: 'usr-student-1',
    company: 'Stripe',
    role: 'Backend Infrastructure Engineer',
    packageLpa: 38,
    location: 'Bengaluru / Remote',
    status: 'Saved',
    appliedDate: '2026-07-30',
    deadline: '2026-08-25',
    notes: 'Preparing resume tailored for financial system scalability.',
    roundsCompleted: 0,
    totalRounds: 4
  }
];

export const initialCampusDrives: CampusDrive[] = [
  {
    id: 'drive-501',
    title: 'Google On-Campus Recruitment Drive 2026',
    company: 'Google',
    role: 'Software Engineer & University Graduate',
    packageLpa: 32,
    minCgpa: 8.0,
    eligibleBranches: ['CSE', 'IT', 'ECE'],
    deadline: '2026-08-12',
    driveDate: '2026-08-18',
    description: 'Annual flagship campus hiring for Google India. Roles include SWE, Site Reliability, and Systems Engineering.',
    registrationUrl: 'https://careers.google.com/students',
    active: true,
    appliedCount: 142
  },
  {
    id: 'drive-502',
    title: 'Goldman Sachs Engineering Campus Drive',
    company: 'Goldman Sachs',
    role: 'Analyst - Technology Division',
    packageLpa: 26,
    minCgpa: 7.5,
    eligibleBranches: ['CSE', 'IT', 'ECE', 'EEE', 'MECH'],
    deadline: '2026-08-15',
    driveDate: '2026-08-22',
    description: 'Looking for sharp problem solvers with expertise in Java, C++, Python, and quantitative logic.',
    registrationUrl: 'https://goldmansachs.com/careers',
    active: true,
    appliedCount: 98
  },
  {
    id: 'drive-503',
    title: 'Adobe SWE & Research Internship / FTE 2026',
    company: 'Adobe Systems',
    role: 'Member of Technical Staff-1',
    packageLpa: 29.5,
    minCgpa: 8.2,
    eligibleBranches: ['CSE', 'IT'],
    deadline: '2026-08-20',
    driveDate: '2026-08-28',
    description: 'Focus on Digital Media, Creative Cloud algorithms, and Machine Learning application development.',
    registrationUrl: 'https://adobe.com/careers',
    active: true,
    appliedCount: 84
  }
];

export const initialAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    title: '📢 Mandatory Resume Verification & ATS Review Session',
    category: 'Placement',
    message: 'All final year students participating in the upcoming Google & Goldman Sachs campus drives must upload their updated resume in StudySync for automated ATS verification by Friday 5 PM.',
    createdAt: '2026-08-01T09:00:00Z',
    author: 'TPO Placement Cell',
    important: true
  },
  {
    id: 'ann-2',
    title: '📝 Mid-Semester Examination Schedule Published',
    category: 'Exam',
    message: 'The mid-semester theory & practical timetable for Semester 7 has been uploaded to the Academic Notes Hub.',
    createdAt: '2026-07-29T14:30:00Z',
    author: 'Academic Dean Office',
    important: false
  },
  {
    id: 'ann-3',
    title: '💡 Mock Technical Interviews with Alumni Network',
    category: 'Placement',
    message: 'Book your 45-minute 1-on-1 mock coding interview slot with Google & Microsoft alumni via the Focus & Career tab.',
    createdAt: '2026-07-27T11:00:00Z',
    author: 'Student Placement Committee',
    important: false
  }
];

export const initialSkillMetrics: SkillMetric[] = [
  { subject: 'Data Structures', score: 92, target: 95, category: 'Coding' },
  { subject: 'Algorithms & DP', score: 85, target: 90, category: 'Coding' },
  { subject: 'System Design', score: 78, target: 85, category: 'Coding' },
  { subject: 'Aptitude & Quant', score: 88, target: 90, category: 'Aptitude' },
  { subject: 'Operating Systems', score: 90, target: 92, category: 'Core' },
  { subject: 'Database & SQL', score: 94, target: 95, category: 'Core' },
  { subject: 'Communication', score: 84, target: 90, category: 'Soft Skills' }
];

export const initialStudentsRecord: StudentRecord[] = [
  {
    id: 'st-01',
    name: 'Alex Rivera',
    rollNumber: 'CS2023-8842',
    department: 'CSE',
    cgpa: 8.92,
    backlogs: 0,
    placementStatus: 'Placed',
    placedCompany: 'Atlassian',
    packageLpa: 36,
    email: 'alex.rivera@studysync.edu',
    applicationsCount: 5
  },
  {
    id: 'st-02',
    name: 'Priya Sharma',
    rollNumber: 'CS2023-8810',
    department: 'CSE',
    cgpa: 9.45,
    backlogs: 0,
    placementStatus: 'Placed',
    placedCompany: 'Google India',
    packageLpa: 32,
    email: 'priya.s@studysync.edu',
    applicationsCount: 4
  },
  {
    id: 'st-03',
    name: 'Rohan Verma',
    rollNumber: 'IT2023-4120',
    department: 'IT',
    cgpa: 8.15,
    backlogs: 0,
    placementStatus: 'In Process',
    placedCompany: undefined,
    packageLpa: undefined,
    email: 'rohan.v@studysync.edu',
    applicationsCount: 7
  },
  {
    id: 'st-04',
    name: 'Ananya Deshmukh',
    rollNumber: 'ECE2023-902',
    department: 'ECE',
    cgpa: 8.70,
    backlogs: 0,
    placementStatus: 'In Process',
    placedCompany: undefined,
    packageLpa: undefined,
    email: 'ananya.d@studysync.edu',
    applicationsCount: 6
  },
  {
    id: 'st-05',
    name: 'Kevin Patel',
    rollNumber: 'CS2023-8899',
    department: 'CSE',
    cgpa: 7.80,
    backlogs: 1,
    placementStatus: 'Seeking',
    placedCompany: undefined,
    packageLpa: undefined,
    email: 'kevin.p@studysync.edu',
    applicationsCount: 8
  },
  {
    id: 'st-06',
    name: 'Meera Nair',
    rollNumber: 'EEE2023-331',
    department: 'EEE',
    cgpa: 8.40,
    backlogs: 0,
    placementStatus: 'In Process',
    placedCompany: undefined,
    packageLpa: undefined,
    email: 'meera.n@studysync.edu',
    applicationsCount: 3
  }
];

export const initialResumes: ResumeItem[] = [
  {
    id: 'res-1',
    studentId: 'usr-student-1',
    title: 'Alex_Rivera_SDE_Resume_V3.pdf',
    version: '3.2 (Latest)',
    uploadedAt: '2026-07-28',
    isPrimary: true,
    atsScore: 92,
    matchedSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'System Design', 'Git'],
    suggestedImprovements: [
      'Quantify the performance impact in your Google Cloud internship project (e.g. reduced latency by X%).',
      'Add 2 additional keywords from AWS Job Description: Terraform, K8s.'
    ]
  }
];
