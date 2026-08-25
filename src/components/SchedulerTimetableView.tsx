import React, { useState, useEffect } from 'react';
import { 
  Calendar, CalendarDays, CheckCircle2, Clock, Plus, 
  Trash2, AlertCircle, Filter, Sparkles, BookOpen, User, Flag,
  Bell, Volume2, Play, Check, X
} from 'lucide-react';
import { TaskItem, TimetableSlot, TaskPriority, TaskCategory, DayOfWeek, TimetableSessionType } from '../types';

interface SchedulerTimetableViewProps {
  tasks: TaskItem[];
  timetable: TimetableSlot[];
  onAddTask: (task: Omit<TaskItem, 'id' | 'createdAt'>) => void;
  onUpdateTask: (id: string, updates: Partial<TaskItem>) => void;
  onDeleteTask: (id: string) => void;
  onAddTimetableSlot: (slot: Omit<TimetableSlot, 'id'>) => void;
  onDeleteTimetableSlot: (id: string) => void;
}

export interface AlarmItem {
  id: string;
  time: string; // HH:MM
  label: string;
  tone: 'loud_bell' | 'siren' | 'beep' | 'gong';
  active: boolean;
}

export const SchedulerTimetableView: React.FC<SchedulerTimetableViewProps> = ({
  tasks,
  timetable,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onAddTimetableSlot,
  onDeleteTimetableSlot
}) => {
  const [activeTab, setActiveTab] = useState<'scheduler' | 'timetable' | 'alarm'>('timetable');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isAddSlotModalOpen, setIsAddSlotModalOpen] = useState(false);

  // Alarm Clock State
  const [alarms, setAlarms] = useState<AlarmItem[]>([
    { id: 'alm-1', time: '07:00', label: 'Morning Placement Prep & Revision', tone: 'loud_bell', active: true },
    { id: 'alm-2', time: '09:00', label: 'Lecture Time Reminder', tone: 'beep', active: true },
    { id: 'alm-3', time: '17:30', label: 'Evening Mock Coding Assessment', tone: 'siren', active: false }
  ]);
  const [newAlarmTime, setNewAlarmTime] = useState('08:00');
  const [newAlarmLabel, setNewAlarmLabel] = useState('Study Session Alarm');
  const [newAlarmTone, setNewAlarmTone] = useState<'loud_bell' | 'siren' | 'beep' | 'gong'>('loud_bell');
  const [ringingAlarm, setRingingAlarm] = useState<AlarmItem | null>(null);

  // Web Audio High Volume Alarm Sound Generator
  const playHighVolumeAlarmSound = (tone: string = 'loud_bell') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.95, now); // Max 95% High Volume
      masterGain.connect(ctx.destination);

      if (tone === 'siren') {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(1400, now + 0.4);
        osc.frequency.linearRampToValueAtTime(600, now + 0.8);
        osc.frequency.linearRampToValueAtTime(1400, now + 1.2);
        osc.connect(masterGain);
        osc.start(now);
        osc.stop(now + 1.25);
      } else if (tone === 'beep') {
        for (let i = 0; i < 4; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(1000, now + i * 0.25);
          gain.gain.setValueAtTime(0.8, now + i * 0.25);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.25 + 0.15);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now + i * 0.25);
          osc.stop(now + i * 0.25 + 0.16);
        }
      } else if (tone === 'gong') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(220, now);
        osc2.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.9, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(masterGain);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 2.0);
        osc2.stop(now + 2.0);
      } else {
        // 'loud_bell' default
        const freqs = [880, 1320, 1760];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.15);
          gain.gain.setValueAtTime(0.9, now + idx * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.5);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now + idx * 0.15);
          osc.stop(now + idx * 0.15 + 0.55);
        });
      }
    } catch (e) {
      console.error('Alarm audio playback error:', e);
    }
  };

  // Alarm Time Monitor Interval
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      // Find if any active alarm matches current time
      const triggered = alarms.find((a) => a.active && a.time === currentHHMM);
      if (triggered && (!ringingAlarm || ringingAlarm.id !== triggered.id)) {
        setRingingAlarm(triggered);
        playHighVolumeAlarmSound(triggered.tone);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [alarms, ringingAlarm]);

  // Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubject, setTaskSubject] = useState('Data Structures & Algorithms');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('High');
  const [taskCategory, setTaskCategory] = useState<TaskCategory>('Placement Prep');
  const [taskDueDate, setTaskDueDate] = useState('2026-08-10');
  const [taskDuration, setTaskDuration] = useState<number>(60);
  const [taskNotes, setTaskNotes] = useState('');

  // Timetable Slot Form State
  const [slotDay, setSlotDay] = useState<DayOfWeek>('Monday');
  const [slotStartTime, setSlotStartTime] = useState('09:00');
  const [slotEndTime, setSlotEndTime] = useState('10:30');
  const [slotTitle, setSlotTitle] = useState('');
  const [slotSubject, setSlotSubject] = useState('Operating Systems');
  const [slotLocation, setSlotLocation] = useState('Lecture Hall 302');
  const [slotSessionType, setSlotSessionType] = useState<TimetableSessionType>('Lecture');
  const [slotColor, setSlotColor] = useState('bg-indigo-500');

  const daysOfWeek: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;

    onAddTask({
      studentId: 'usr-student-1',
      title: taskTitle,
      subject: taskSubject,
      priority: taskPriority,
      status: 'Pending',
      category: taskCategory,
      dueDate: taskDueDate,
      durationMinutes: Number(taskDuration),
      notes: taskNotes
    });

    setTaskTitle('');
    setTaskNotes('');
    setIsAddTaskModalOpen(false);
  };

  const handleSlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotTitle) return;

    onAddTimetableSlot({
      studentId: 'usr-student-1',
      dayOfWeek: slotDay,
      startTime: slotStartTime,
      endTime: slotEndTime,
      title: slotTitle,
      subject: slotSubject,
      location: slotLocation,
      sessionType: slotSessionType,
      colorTag: slotColor
    });

    setSlotTitle('');
    setIsAddSlotModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <CalendarDays className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Task Scheduler & Weekly Timetable
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage student tasks, upcoming assignment deadlines, and weekly lecture & revision timetables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'scheduler' ? (
            <button
              onClick={() => setIsAddTaskModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Scheduled Task</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAddSlotModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Timetable Slot</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('timetable')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'timetable'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Weekly Timetable Grid</span>
        </button>

        <button
          onClick={() => setActiveTab('scheduler')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'scheduler'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Task Scheduler & Deadlines ({tasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('alarm')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'alarm'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          <Bell className="w-4 h-4 text-amber-500" />
          <span>Alarm Clock & Sound Bell ({alarms.filter(a => a.active).length} Active)</span>
        </button>
      </div>

      {/* Tab 1: Interactive Weekly Timetable Grid */}
      {activeTab === 'timetable' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h4 className="font-bold text-xs text-indigo-950 dark:text-indigo-200">
                  Weekly Class & Study Workload Summary
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Total {timetable.length} scheduled sessions spanning lectures, practical labs, and mock placement interviews.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Lecture
              </span>
              <span className="flex items-center gap-1 font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Lab
              </span>
              <span className="flex items-center gap-1 font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Placement Prep
              </span>
            </div>
          </div>

          {/* Timetable Grid View */}
          <div className="overflow-x-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="min-w-[900px]">
              {/* Day Headers */}
              <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-center text-xs font-black text-slate-700 dark:text-slate-300">
                <div className="p-3 border-r border-slate-200 dark:border-slate-800">Time</div>
                {daysOfWeek.map((day) => (
                  <div key={day} className="p-3 border-r border-slate-200 dark:border-slate-800 last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>

              {/* Time Rows */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {daysOfWeek.map((day) => {
                  const daySlots = timetable.filter((s) => s.dayOfWeek === day);
                  return (
                    <div key={day} className="grid grid-cols-8 min-h-[90px]">
                      {/* Day Name Box */}
                      <div className="p-3 font-bold text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800 flex items-center justify-center">
                        {day}
                      </div>

                      {/* Day Timetable Content */}
                      <div className="col-span-7 p-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 border-r border-slate-200 dark:border-slate-800 last:border-r-0 bg-slate-50/20">
                        {daySlots.length > 0 ? (
                          daySlots.map((slot) => (
                            <div
                              key={slot.id}
                              className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-1.5 relative group"
                            >
                              <div className="flex items-center justify-between">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black text-white ${slot.colorTag}`}>
                                  {slot.startTime} - {slot.endTime}
                                </span>
                                <button
                                  onClick={() => onDeleteTimetableSlot(slot.id)}
                                  className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                                  title="Delete timetable slot"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight">
                                {slot.title}
                              </h4>
                              <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                                📚 {slot.subject}
                              </p>
                              {slot.location && (
                                <p className="text-[10px] text-slate-400">
                                  📍 {slot.location}
                                </p>
                              )}
                            </div>
                          ))
                        ) : (
                          <div
                            onClick={() => {
                              setSlotDay(day);
                              setIsAddSlotModalOpen(true);
                            }}
                            className="p-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-[11px] text-slate-400 hover:border-indigo-400 hover:text-indigo-600 cursor-pointer transition-colors"
                          >
                            + Click to add schedule slot
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Task Scheduler List */}
      {activeTab === 'scheduler' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pending Tasks */}
            <div className="p-4 rounded-3xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-500" />
                  To Do / Pending
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white dark:bg-slate-800 text-slate-700">
                  {tasks.filter((t) => t.status === 'Pending').length}
                </span>
              </div>

              {tasks.filter((t) => t.status === 'Pending').map((t) => (
                <div key={t.id} className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 shadow-2xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300">
                        {t.priority} Priority
                      </span>
                      <h4 className="font-extrabold text-xs text-slate-900 dark:text-white mt-1.5">{t.title}</h4>
                      <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">{t.subject}</p>
                    </div>
                  </div>

                  {t.notes && <p className="text-[11px] text-slate-500 line-clamp-2">{t.notes}</p>}

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400">Due: {t.dueDate}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onUpdateTask(t.id, { status: 'In Progress' })}
                        className="px-2 py-1 rounded-lg text-[10px] font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                      >
                        Start
                      </button>
                      <button
                        onClick={() => onDeleteTask(t.id)}
                        className="p-1 text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* In Progress Tasks */}
            <div className="p-4 rounded-3xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  In Progress
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white dark:bg-slate-800 text-slate-700">
                  {tasks.filter((t) => t.status === 'In Progress').length}
                </span>
              </div>

              {tasks.filter((t) => t.status === 'In Progress').map((t) => (
                <div key={t.id} className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 shadow-2xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        {t.category}
                      </span>
                      <h4 className="font-extrabold text-xs text-slate-900 dark:text-white mt-1.5">{t.title}</h4>
                      <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">{t.subject}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400">⏱ {t.durationMinutes} mins</span>
                    <button
                      onClick={() => onUpdateTask(t.id, { status: 'Completed' })}
                      className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    >
                      Mark Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Completed Tasks */}
            <div className="p-4 rounded-3xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Completed
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white dark:bg-slate-800 text-slate-700">
                  {tasks.filter((t) => t.status === 'Completed').length}
                </span>
              </div>

              {tasks.filter((t) => t.status === 'Completed').map((t) => (
                <div key={t.id} className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 opacity-80">
                  <h4 className="font-bold text-xs line-through text-slate-500 dark:text-slate-400">{t.title}</h4>
                  <p className="text-[10px] text-emerald-600 font-bold">✓ Done</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Alarm Clock & Sound Bell Controller */}
      {activeTab === 'alarm' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Clock Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-xs">
                🔊 High Loudness Sound Alarms
              </span>
              <h2 className="text-3xl font-black flex items-center justify-center md:justify-start gap-2 pt-1">
                <Bell className="w-8 h-8 animate-bounce" />
                Study & Exam Alarm Clock
              </h2>
              <p className="text-xs text-white/80">
                Set custom loud alarms for lecture times, morning revision, or placement interview reminders.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => playHighVolumeAlarmSound(newAlarmTone)}
                className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-black text-xs flex items-center gap-2 transition-all border border-white/30"
              >
                <Volume2 className="w-4 h-4 animate-pulse" />
                <span>Test Loud Sound 🔊</span>
              </button>
            </div>
          </div>

          {/* Add Alarm & Sound Settings Form */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600" />
              Create New Loud Alarm
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alarm Time (24h)
                </label>
                <input
                  type="time"
                  value={newAlarmTime}
                  onChange={(e) => setNewAlarmTime(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-black text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alarm Title / Label
                </label>
                <input
                  type="text"
                  value={newAlarmLabel}
                  onChange={(e) => setNewAlarmLabel(e.target.value)}
                  placeholder="e.g. Operating Systems Revision"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sound Tone Ringtone
                </label>
                <select
                  value={newAlarmTone}
                  onChange={(e) => setNewAlarmTone(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                >
                  <option value="loud_bell">🔔 High Bell Chime (Punchy)</option>
                  <option value="siren">🚨 Emergency Siren Sweep</option>
                  <option value="beep">⏱️ Digital Rapid Beeps</option>
                  <option value="gong">🧘 Deep Resonant Gong</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    if (!newAlarmTime) return;
                    setAlarms([
                      ...alarms,
                      {
                        id: `alm-${Date.now()}`,
                        time: newAlarmTime,
                        label: newAlarmLabel || 'Study Alarm',
                        tone: newAlarmTone,
                        active: true
                      }
                    ]);
                    setNewAlarmLabel('Revision Reminder');
                  }}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Bell className="w-4 h-4" />
                  <span>Set Alarm</span>
                </button>
              </div>
            </div>
          </div>

          {/* Active Alarms Grid */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
              <span>Configured Alarm Timers ({alarms.length})</span>
              <span className="text-xs text-indigo-600 font-bold">Auto Monitor Active</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {alarms.map((alm) => (
                <div
                  key={alm.id}
                  className={`p-5 rounded-3xl border transition-all ${
                    alm.active
                      ? 'bg-white dark:bg-slate-900 border-indigo-500/50 shadow-md ring-2 ring-indigo-500/10'
                      : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        {alm.time}
                      </span>
                      <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 mt-0.5">
                        {alm.label}
                      </h4>
                    </div>

                    <button
                      onClick={() => {
                        setAlarms(alarms.map(a => a.id === alm.id ? { ...a, active: !a.active } : a));
                      }}
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-colors ${
                        alm.active
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {alm.active ? 'Active 🔊' : 'Disabled'}
                    </button>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => playHighVolumeAlarmSound(alm.tone)}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Test Ring</span>
                    </button>

                    <button
                      onClick={() => setAlarms(alarms.filter(a => a.id !== alm.id))}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Delete Alarm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Ringing Alarm Modal Popup */}
      {ringingAlarm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in zoom-in-95">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-amber-500 p-8 text-center space-y-6">
            <div className="inline-flex p-4 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 animate-bounce">
              <Bell className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-amber-500 text-white font-black text-xs uppercase tracking-wider animate-pulse">
                ⏰ ALARM RINGING NOW 🔊
              </span>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white pt-2">
                {ringingAlarm.time}
              </h2>
              <h3 className="font-bold text-base text-slate-700 dark:text-slate-200">
                {ringingAlarm.label}
              </h3>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  playHighVolumeAlarmSound(ringingAlarm.tone);
                }}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-2"
              >
                <Volume2 className="w-4 h-4" />
                <span>Play High Volume Alarm Ring 🔊</span>
              </button>

              <button
                onClick={() => {
                  setRingingAlarm(null);
                }}
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>DISMISS ALARM</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Task */}
      {isAddTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">
              Schedule New Student Task
            </h3>

            <form onSubmit={handleTaskSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Complete Dynamic Programming Top 75 LeetCode"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={taskSubject}
                    onChange={(e) => setTaskSubject(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  >
                    <option value="High">High 🔴</option>
                    <option value="Medium">Medium 🟡</option>
                    <option value="Low">Low 🟢</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value as TaskCategory)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  >
                    <option value="Placement Prep">Placement Prep</option>
                    <option value="Exam">Exam</option>
                    <option value="Assignment">Assignment</option>
                    <option value="Project">Project</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes / Instructions</label>
                <textarea
                  rows={2}
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                  placeholder="Key focus items or deadline guidelines..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddTaskModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Timetable Slot */}
      {isAddSlotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">
              Add Weekly Timetable Slot
            </h3>

            <form onSubmit={handleSlotSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Day of Week</label>
                <select
                  value={slotDay}
                  onChange={(e) => setSlotDay(e.target.value as DayOfWeek)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                >
                  {daysOfWeek.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={slotStartTime}
                    onChange={(e) => setSlotStartTime(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={slotEndTime}
                    onChange={(e) => setSlotEndTime(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Session / Class Title</label>
                <input
                  type="text"
                  required
                  value={slotTitle}
                  onChange={(e) => setSlotTitle(e.target.value)}
                  placeholder="e.g. Operating Systems Lecture"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={slotSubject}
                    onChange={(e) => setSlotSubject(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Location / Classroom</label>
                  <input
                    type="text"
                    value={slotLocation}
                    onChange={(e) => setSlotLocation(e.target.value)}
                    placeholder="LH-302 Main Block"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddSlotModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
                >
                  Save Timetable Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
