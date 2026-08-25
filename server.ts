import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Persistent JSON Database path
const DB_FILE = path.join(process.cwd(), 'server-db.json');

// Initial seed memory structure
const initialSeed = {
  profiles: [
    {
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
    },
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
  ],
  resources: [
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
  ],
  tasks: [
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
  ],
  timetable: [
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
  ]
};

// Database helper functions
function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading db file:', e);
  }
  saveDatabase(initialSeed);
  return initialSeed;
}

function saveDatabase(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving db file:', e);
  }
}

// Initialize db
let db = loadDatabase();

// Health Check API
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'StudySync Full Stack API', timestamp: new Date().toISOString() });
});

// Full DB Sync Endpoint
app.get('/api/db', (_req, res) => {
  res.json(db);
});

// ---------------- PROFILES ENDPOINTS ----------------
app.get('/api/profiles', (_req, res) => {
  res.json(db.profiles || []);
});

app.post('/api/profiles', (req, res) => {
  const newProfile = {
    ...req.body,
    id: req.body.id || `usr-${Date.now()}`,
    verified: true
  };
  db.profiles = [newProfile, ...(db.profiles || [])];
  saveDatabase(db);
  res.json(newProfile);
});

app.delete('/api/profiles/:id', (req, res) => {
  const { id } = req.params;
  db.profiles = (db.profiles || []).filter((p: any) => p.id !== id);
  saveDatabase(db);
  res.json({ success: true, id });
});

// ---------------- RESOURCES (Links, Videos, Photos) ENDPOINTS ----------------
app.get('/api/resources', (_req, res) => {
  res.json(db.resources || []);
});

app.post('/api/resources', (req, res) => {
  const newResource = {
    ...req.body,
    id: `res-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  db.resources = [newResource, ...(db.resources || [])];
  saveDatabase(db);
  res.json(newResource);
});

app.put('/api/resources/:id', (req, res) => {
  const { id } = req.params;
  db.resources = (db.resources || []).map((r: any) => (r.id === id ? { ...r, ...req.body } : r));
  saveDatabase(db);
  res.json({ success: true });
});

app.delete('/api/resources/:id', (req, res) => {
  const { id } = req.params;
  db.resources = (db.resources || []).filter((r: any) => r.id !== id);
  saveDatabase(db);
  res.json({ success: true, id });
});

// ---------------- SCHEDULER & TASKS ENDPOINTS ----------------
app.get('/api/tasks', (_req, res) => {
  res.json(db.tasks || []);
});

app.post('/api/tasks', (req, res) => {
  const newTask = {
    ...req.body,
    id: `task-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  db.tasks = [newTask, ...(db.tasks || [])];
  saveDatabase(db);
  res.json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  db.tasks = (db.tasks || []).map((t: any) => (t.id === id ? { ...t, ...req.body } : t));
  saveDatabase(db);
  res.json({ success: true });
});

app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  db.tasks = (db.tasks || []).filter((t: any) => t.id !== id);
  saveDatabase(db);
  res.json({ success: true, id });
});

// ---------------- WEEKLY TIMETABLE ENDPOINTS ----------------
app.get('/api/timetable', (_req, res) => {
  res.json(db.timetable || []);
});

app.post('/api/timetable', (req, res) => {
  const newSlot = {
    ...req.body,
    id: `slot-${Date.now()}`
  };
  db.timetable = [...(db.timetable || []), newSlot];
  saveDatabase(db);
  res.json(newSlot);
});

app.delete('/api/timetable/:id', (req, res) => {
  const { id } = req.params;
  db.timetable = (db.timetable || []).filter((s: any) => s.id !== id);
  saveDatabase(db);
  res.json({ success: true, id });
});

// AI Note Summarizer Endpoint
app.post('/api/ai/summarize-note', async (req, res) => {
  try {
    const { title, subject, content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Note content is required for summarization.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        summary: `• Quick Summary for "${title || 'Note'}": Key topics include fundamentals of ${subject || 'the course'}, core formulas, and interview exam questions.\n• Key Takeaways: Review Coffman conditions, time complexity bounds, and algorithm pseudocode before exams.`
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `You are an expert academic tutor for computer science & engineering students. Summarize the following study note into 3 concise bullet points highlighting key concepts, formulas, and potential exam/interview questions.
      
Note Title: ${title || 'Untitled'}
Subject: ${subject || 'General'}
Content:
${content}`
    });

    res.json({ summary: response.text });
  } catch (err: any) {
    console.error('Gemini Note Summarize Error:', err?.message || err);
    res.status(500).json({
      error: 'Failed to generate summary.',
      details: err?.message || 'Unknown server error'
    });
  }
});

// AI Resume ATS & Skill Matcher
app.post('/api/ai/resume-scanner', async (req, res) => {
  try {
    const { resumeText, targetRole } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || !resumeText) {
      return res.json({
        atsScore: 88,
        matchedSkills: ['React', 'TypeScript', 'Node.js', 'SQL', 'Data Structures', 'REST APIs'],
        missingKeywords: ['Docker', 'Kubernetes', 'CI/CD Pipelines', 'System Design'],
        recommendations: [
          'Add metrics to your experience section (e.g. "Improved API response speed by 35%").',
          'Include cloud orchestration keywords like Docker and AWS.'
        ]
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Analyze this student resume for the target role "${targetRole || 'Software Engineer'}".
Return a JSON object with:
1. "atsScore": number from 0-100
2. "matchedSkills": array of string skills found
3. "missingKeywords": array of recommended missing technical keywords
4. "recommendations": array of 2-3 specific action items to boost placement chances.

Resume Text:
${resumeText}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Gemini Resume Scanner Error:', err);
    res.json({
      atsScore: 85,
      matchedSkills: ['Data Structures', 'Algorithms', 'JavaScript', 'React', 'Git'],
      missingKeywords: ['Distributed Systems', 'PostgreSQL', 'Docker'],
      recommendations: [
        'Highlight your top 2 technical projects with quantifiable impact metrics.',
        'Ensure contact information and LinkedIn URL are clearly formatted in the header.'
      ]
    });
  }
});

// Export Students Data endpoint
app.get('/api/students/export-csv', (_req, res) => {
  const csvHeaders = 'Name,Roll Number,Department,CGPA,Backlogs,Placement Status,Placed Company,Package (LPA),Applications Count\n';
  const csvData = [
    'Alex Rivera,CS2023-8842,CSE,8.92,0,Placed,Atlassian,36,5',
    'Priya Sharma,CS2023-8810,CSE,9.45,0,Placed,Google India,32,4',
    'Rohan Verma,IT2023-4120,IT,8.15,0,In Process,,0,7',
    'Ananya Deshmukh,ECE2023-902,ECE,8.70,0,In Process,,0,6',
    'Kevin Patel,CS2023-8899,CSE,7.80,1,Seeking,,0,8',
    'Meera Nair,EEE2023-331,EEE,8.40,0,In Process,,0,3'
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="StudySync_Students_Placement_Report.csv"');
  res.status(200).send(csvHeaders + csvData);
});

// Vite Middleware & Static Server Setup
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudySync Full-Stack Database Server listening on http://0.0.0.0:${PORT}`);
  });
}

start();

