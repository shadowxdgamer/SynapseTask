import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Settings2 } from 'lucide-react';
import { useSettingsStore } from '../../stores';

type TimerMode = 'focus' | 'break';

export function PomodoroTimer() {
  const { pomodoroFocusMinutes, pomodoroBreakMinutes, pomodoroAutoStart } = useSettingsStore();
  
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(pomodoroFocusMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const totalTime = mode === 'focus' ? pomodoroFocusMinutes * 60 : pomodoroBreakMinutes * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    
    if (mode === 'focus') {
      setCompletedPomodoros(prev => prev + 1);
      setMode('break');
      setTimeLeft(pomodoroBreakMinutes * 60);
      
      // Play notification sound (browser notification)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Pomodoro Complete! 🍅', {
          body: 'Time for a break!',
          icon: '/vite.svg',
        });
      }
      
      if (pomodoroAutoStart) {
        setIsRunning(true);
      }
    } else {
      setMode('focus');
      setTimeLeft(pomodoroFocusMinutes * 60);
      
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Break Complete! ☕', {
          body: 'Ready to focus again?',
          icon: '/vite.svg',
        });
      }
      
      if (pomodoroAutoStart) {
        setIsRunning(true);
      }
    }
  }, [mode, pomodoroFocusMinutes, pomodoroBreakMinutes, pomodoroAutoStart]);

  useEffect(() => {
    let interval: number | undefined;

    if (isRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, handleTimerComplete]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Update timeLeft when settings change
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(mode === 'focus' ? pomodoroFocusMinutes * 60 : pomodoroBreakMinutes * 60);
    }
  }, [pomodoroFocusMinutes, pomodoroBreakMinutes, mode, isRunning]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'focus' ? pomodoroFocusMinutes * 60 : pomodoroBreakMinutes * 60);
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(newMode === 'focus' ? pomodoroFocusMinutes * 60 : pomodoroBreakMinutes * 60);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">🍅</span>
          <span className="font-semibold">Pomodoro</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
          {isRunning && (
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          )}
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="p-4">
          {/* Mode selector */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => switchMode('focus')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                mode === 'focus'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              <Brain size={16} />
              Focus
            </button>
            <button
              onClick={() => switchMode('break')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                mode === 'break'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              <Coffee size={16} />
              Break
            </button>
          </div>

          {/* Timer display */}
          <div className="relative flex flex-col items-center mb-4">
            {/* Circular progress */}
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-slate-200 dark:text-slate-700"
                />
                {/* Progress circle */}
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
                  className={`transition-all duration-1000 ${
                    mode === 'focus' ? 'text-red-500' : 'text-green-500'
                  }`}
                />
              </svg>
              {/* Time display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-mono font-bold text-slate-800 dark:text-slate-100">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase">
                  {mode}
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={resetTimer}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Reset"
            >
              <RotateCcw size={20} />
            </button>
            <button
              onClick={toggleTimer}
              className={`p-4 rounded-full text-white transition-all ${
                isRunning
                  ? 'bg-orange-500 hover:bg-orange-600'
                  : mode === 'focus'
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {isRunning ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
            </button>
            <button
              onClick={() => {}}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Settings"
            >
              <Settings2 size={20} />
            </button>
          </div>

          {/* Completed count */}
          <div className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
            <span className="font-medium text-red-500">{completedPomodoros}</span> pomodoros completed today
          </div>
        </div>
      )}
    </div>
  );
}
