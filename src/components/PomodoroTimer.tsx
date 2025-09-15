import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Clock } from 'lucide-react';
import { Settings as AppSettings } from '../types';

interface PomodoroSettings {
  workDuration: number; // in minutes
  shortBreak: number; // in minutes
  longBreak: number; // in minutes
  longBreakInterval: number; // number of pomodoros before long break
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
}

interface PomodoroTimerProps {
  settings: AppSettings;
  onSettingsChange?: (settings: PomodoroSettings) => void;
}

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  settings,
  onSettingsChange
}) => {
  const [pomodoroSettings, setPomodoroSettings] = useState<PomodoroSettings>({
    workDuration: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    soundEnabled: true
  });

  const [timeLeft, setTimeLeft] = useState(pomodoroSettings.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<TimerMode>('work');
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('sickcal-pomodoro-settings');
    if (savedSettings) {
      setPomodoroSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('sickcal-pomodoro-settings', JSON.stringify(pomodoroSettings));
    if (onSettingsChange) {
      onSettingsChange(pomodoroSettings);
    }
  }, [pomodoroSettings, onSettingsChange]);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBS13yO/eizEIHWq+8+OWT');
    return () => {
      if (audioRef.current) {
        audioRef.current = null;
      }
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    if (pomodoroSettings.soundEnabled && audioRef.current) {
      audioRef.current.play().catch(console.error);
    }

    if (mode === 'work') {
      setPomodoroCount(prev => prev + 1);
      const shouldTakeLongBreak = pomodoroCount + 1 >= pomodoroSettings.longBreakInterval;
      setMode(shouldTakeLongBreak ? 'longBreak' : 'shortBreak');
      setTimeLeft((shouldTakeLongBreak ? pomodoroSettings.longBreak : pomodoroSettings.shortBreak) * 60);
      
      if (pomodoroSettings.autoStartBreaks) {
        setIsRunning(true);
      }
    } else {
      setMode('work');
      setTimeLeft(pomodoroSettings.workDuration * 60);
      
      if (pomodoroSettings.autoStartPomodoros) {
        setIsRunning(true);
      }
    }
  };

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'work' ? pomodoroSettings.workDuration * 60 : 
                mode === 'shortBreak' ? pomodoroSettings.shortBreak * 60 : 
                pomodoroSettings.longBreak * 60);
  };

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(newMode === 'work' ? pomodoroSettings.workDuration * 60 : 
                newMode === 'shortBreak' ? pomodoroSettings.shortBreak * 60 : 
                pomodoroSettings.longBreak * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    const totalTime = mode === 'work' ? pomodoroSettings.workDuration * 60 :
                     mode === 'shortBreak' ? pomodoroSettings.shortBreak * 60 :
                     pomodoroSettings.longBreak * 60;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const getModeColor = () => {
    switch (mode) {
      case 'work': return 'text-red-600';
      case 'shortBreak': return 'text-green-600';
      case 'longBreak': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getModeBgColor = () => {
    switch (mode) {
      case 'work': return 'bg-red-50 border-red-200';
      case 'shortBreak': return 'bg-green-50 border-green-200';
      case 'longBreak': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getModeBgColor()} ${
      settings.theme === 'dark' ? 'bg-opacity-20' : ''
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Clock className={`w-5 h-5 ${getModeColor()}`} />
          <h3 className={`font-semibold ${getModeColor()}`}>
            {mode === 'work' ? 'Focus Time' : 
             mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
          </h3>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-1 rounded hover:bg-gray-100 ${
            settings.theme === 'dark' ? 'hover:bg-[#30363d] text-[#8b949e]' : 'text-gray-500'
          }`}
        >
          <Settings size={16} />
        </button>
      </div>

      {/* Timer Display */}
      <div className="text-center mb-6">
        <div className={`text-4xl font-mono font-bold mb-2 ${getModeColor()}`}>
          {formatTime(timeLeft)}
        </div>
        
        {/* Progress Bar */}
        <div className={`w-full h-2 rounded-full ${
          settings.theme === 'dark' ? 'bg-[#30363d]' : 'bg-gray-200'
        }`}>
          <div
            className={`h-2 rounded-full transition-all duration-1000 ${
              mode === 'work' ? 'bg-red-500' :
              mode === 'shortBreak' ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-3 mb-4">
        <button
          onClick={isRunning ? pauseTimer : startTimer}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            isRunning
              ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isRunning ? <Pause size={16} /> : <Play size={16} />}
          <span>{isRunning ? 'Pause' : 'Start'}</span>
        </button>
        
        <button
          onClick={resetTimer}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium bg-gray-500 hover:bg-gray-600 text-white transition-colors"
        >
          <RotateCcw size={16} />
          <span>Reset</span>
        </button>
      </div>

      {/* Mode Selector */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => switchMode('work')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            mode === 'work'
              ? 'bg-red-500 text-white'
              : settings.theme === 'dark'
                ? 'bg-[#30363d] text-[#c9d1d9] hover:bg-[#484f58]'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Work
        </button>
        <button
          onClick={() => switchMode('shortBreak')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            mode === 'shortBreak'
              ? 'bg-green-500 text-white'
              : settings.theme === 'dark'
                ? 'bg-[#30363d] text-[#c9d1d9] hover:bg-[#484f58]'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Break
        </button>
        <button
          onClick={() => switchMode('longBreak')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            mode === 'longBreak'
              ? 'bg-blue-500 text-white'
              : settings.theme === 'dark'
                ? 'bg-[#30363d] text-[#c9d1d9] hover:bg-[#484f58]'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Long
        </button>
      </div>

      {/* Pomodoro Count */}
      <div className="text-center">
        <div className={`text-sm ${settings.theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-600'}`}>
          Completed: {pomodoroCount} pomodoros
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className={`mt-4 p-4 rounded-lg border ${
          settings.theme === 'dark' ? 'bg-[#0d1117] border-[#30363d]' : 'bg-gray-50 border-gray-200'
        }`}>
          <h4 className={`font-medium mb-3 ${settings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-900'}`}>
            Timer Settings
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className={`block text-sm font-medium mb-1 ${settings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-700'}`}>
                Work Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={pomodoroSettings.workDuration}
                onChange={(e) => setPomodoroSettings(prev => ({ ...prev, workDuration: parseInt(e.target.value) || 25 }))}
                className={`input-field ${settings.theme === 'dark' ? 'dark-theme-input' : ''}`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1 ${settings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-700'}`}>
                Short Break (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={pomodoroSettings.shortBreak}
                onChange={(e) => setPomodoroSettings(prev => ({ ...prev, shortBreak: parseInt(e.target.value) || 5 }))}
                className={`input-field ${settings.theme === 'dark' ? 'dark-theme-input' : ''}`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1 ${settings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-700'}`}>
                Long Break (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={pomodoroSettings.longBreak}
                onChange={(e) => setPomodoroSettings(prev => ({ ...prev, longBreak: parseInt(e.target.value) || 15 }))}
                className={`input-field ${settings.theme === 'dark' ? 'dark-theme-input' : ''}`}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="soundEnabled"
                checked={pomodoroSettings.soundEnabled}
                onChange={(e) => setPomodoroSettings(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="soundEnabled" className={`text-sm ${settings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-700'}`}>
                Enable sound notifications
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PomodoroTimer;
