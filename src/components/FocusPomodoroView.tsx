import React, { useState, useEffect, useRef } from 'react';
import { 
  Timer, Play, Pause, RotateCcw, Volume2, VolumeX, 
  Sparkles, CheckCircle2, BarChart2, BookOpen, Clock, Music
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { getFocusLogs, addFocusLog, FocusLog } from '../lib/storage';

export const FocusPomodoroView: React.FC = () => {
  const [timerMode, setTimerMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [subject, setSubject] = useState<string>('Operating Systems');
  const [focusLogs, setFocusLogs] = useState<FocusLog[]>([]);
  const [volumeLevel, setVolumeLevel] = useState<'low' | 'medium' | 'loud'>('loud');
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'waves' | 'synth'>('none');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Web Audio Synth Ref for Ambient Sound Generators
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  useEffect(() => {
    setFocusLogs(getFocusLogs());
  }, []);

  // Play High Volume Alarm Bell Chime
  const playLoudAlarmChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const gainVal = volumeLevel === 'loud' ? 0.9 : volumeLevel === 'medium' ? 0.5 : 0.2;
      
      const now = ctx.currentTime;
      
      // Dual high chime tones for max punchy loudness
      const frequencies = [587.33, 880, 1174.66, 1760]; // D5, A5, D6, A6
      frequencies.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.12);

        gain.gain.setValueAtTime(0.01, now + index * 0.12);
        gain.gain.exponentialRampToValueAtTime(gainVal, now + index * 0.12 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.12 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.12);
        osc.stop(now + index * 0.12 + 0.65);
      });
    } catch (e) {
      console.error('Audio chime error:', e);
    }
  };

  // Timer Tick Interval
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      // Play LOUD audio alert on timer completion
      playLoudAlarmChime();

      // Log session
      const duration = timerMode === 'work' ? 25 : timerMode === 'shortBreak' ? 5 : 15;
      addFocusLog({ subject, minutes: duration });
      setFocusLogs(getFocusLogs());
      // Reset mode
      if (timerMode === 'work') {
        setTimerMode('shortBreak');
        setTimeLeft(5 * 60);
      } else {
        setTimerMode('work');
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, timerMode, subject, volumeLevel]);

  const handleModeChange = (mode: 'work' | 'shortBreak' | 'longBreak') => {
    setTimerMode(mode);
    setIsRunning(false);
    if (mode === 'work') setTimeLeft(25 * 60);
    if (mode === 'shortBreak') setTimeLeft(5 * 60);
    if (mode === 'longBreak') setTimeLeft(15 * 60);
  };

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    if (timerMode === 'work') setTimeLeft(25 * 60);
    if (timerMode === 'shortBreak') setTimeLeft(5 * 60);
    if (timerMode === 'longBreak') setTimeLeft(15 * 60);
  };

  // Synthesize Ambient White Noise/Rain via Web Audio API
  const toggleAmbientAudio = (sound: 'none' | 'rain' | 'waves' | 'synth') => {
    if (ambientSound === sound && isPlayingAudio) {
      // Stop
      if (audioCtxRef.current) audioCtxRef.current.close();
      audioCtxRef.current = null;
      setIsPlayingAudio(false);
      setAmbientSound('none');
      return;
    }

    if (audioCtxRef.current) audioCtxRef.current.close();
    if (sound === 'none') {
      setIsPlayingAudio(false);
      setAmbientSound('none');
      return;
    }

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;

      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = sound === 'rain' ? 'lowpass' : sound === 'waves' ? 'bandpass' : 'notch';
      filter.frequency.setValueAtTime(sound === 'rain' ? 800 : 400, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volumeLevel === 'loud' ? 0.4 : volumeLevel === 'medium' ? 0.2 : 0.08, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
      noiseNodeRef.current = whiteNoise;

      setAmbientSound(sound);
      setIsPlayingAudio(true);
    } catch (e) {
      console.error('Audio Synth error:', e);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Chart Data Processing
  const chartData = [
    { name: 'Operating Systems', minutes: 125 },
    { name: 'Data Structures', minutes: 180 },
    { name: 'System Design', minutes: 90 },
    { name: 'Aptitude Practice', minutes: 105 },
    { name: 'Database SQL', minutes: 75 }
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
          <Timer className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          Focus & Pomodoro Timer
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Deep work focus timer, ambient study sound generator, and revision time analytics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Pomodoro Clock Card */}
        <div className="lg:col-span-2 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md flex flex-col items-center justify-between text-center">
          {/* Mode Selector Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl mb-8">
            <button
              onClick={() => handleModeChange('work')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                timerMode === 'work' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Focus Session (25m)
            </button>
            <button
              onClick={() => handleModeChange('shortBreak')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                timerMode === 'shortBreak' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Short Break (5m)
            </button>
            <button
              onClick={() => handleModeChange('longBreak')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                timerMode === 'longBreak' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Long Break (15m)
            </button>
          </div>

          {/* Subject Focus Selector */}
          <div className="mb-6 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold text-slate-500">Subject:</span>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="px-3 py-1 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="Operating Systems">Operating Systems</option>
              <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
              <option value="Database Systems">Database Systems</option>
              <option value="System Design">System Design</option>
              <option value="Aptitude Practice">Aptitude Practice</option>
            </select>
          </div>

          {/* Display Timer Digit */}
          <div className="my-6">
            <span className="text-6xl sm:text-8xl font-black tracking-tighter font-mono text-slate-900 dark:text-white">
              {formattedTime}
            </span>
          </div>

          {/* Timer Action Buttons */}
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={toggleTimer}
              className={`px-8 py-3.5 rounded-2xl font-black text-sm shadow-lg transition-all flex items-center gap-2 ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25'
              }`}
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
              <span>{isRunning ? 'Pause Timer' : 'Start Focus Session'}</span>
            </button>

            <button
              onClick={resetTimer}
              className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Ambient Focus Generator & Audio Controls */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-indigo-500" />
                Sound & Alert Sound Effects
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-md font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                🔊 High Sound Active
              </span>
            </div>

            {/* Volume Boost Control Bar */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                Audio Alarm & Sound Volume Level:
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                <button
                  onClick={() => setVolumeLevel('low')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    volumeLevel === 'low' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Low (30%)
                </button>
                <button
                  onClick={() => setVolumeLevel('medium')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    volumeLevel === 'medium' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Medium (60%)
                </button>
                <button
                  onClick={() => setVolumeLevel('loud')}
                  className={`py-1.5 text-xs font-black rounded-lg transition-all ${
                    volumeLevel === 'loud' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500'
                  }`}
                >
                  🔊 HIGH (100%)
                </button>
              </div>
            </div>

            {/* Test High Sound Alert Button */}
            <button
              onClick={playLoudAlarmChime}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <Volume2 className="w-4 h-4 animate-bounce" />
              <span>Test High Sound Alarm Chime 🔊</span>
            </button>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Ambient Focus Audio Background Generators:
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => toggleAmbientAudio('rain')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ${
                    ambientSound === 'rain'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>🌧️ Rain Waves</span>
                  {ambientSound === 'rain' && <Volume2 className="w-4 h-4 text-indigo-600 animate-pulse" />}
                </button>

                <button
                  onClick={() => toggleAmbientAudio('waves')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ${
                    ambientSound === 'waves'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>🌊 Deep Ocean</span>
                  {ambientSound === 'waves' && <Volume2 className="w-4 h-4 text-indigo-600 animate-pulse" />}
                </button>
              </div>
            </div>
          </div>

          {/* Today's Focus Session Summary */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              Recent Completed Focus Sessions
            </h3>

            <div className="space-y-2">
              {focusLogs.slice(0, 3).map((log) => (
                <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{log.subject}</span>
                  <span className="px-2 py-0.5 rounded-md font-extrabold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                    {log.minutes} mins
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Recharts Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-indigo-600" />
          Study Hours Distribution by Subject
        </h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="minutes" fill="#4f46e5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
