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

  // Local state for input values (to prevent immediate updates)
  const [inputValues, setInputValues] = useState({
    workDuration: pomodoroSettings.workDuration,
    shortBreak: pomodoroSettings.shortBreak,
    longBreak: pomodoroSettings.longBreak
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
      const parsed = JSON.parse(savedSettings);
      setPomodoroSettings(parsed);
      setInputValues({
        workDuration: parsed.workDuration,
        shortBreak: parsed.shortBreak,
        longBreak: parsed.longBreak
      });
    }
  }, []);

  // Sync input values when settings change
  useEffect(() => {
    setInputValues({
      workDuration: pomodoroSettings.workDuration,
      shortBreak: pomodoroSettings.shortBreak,
      longBreak: pomodoroSettings.longBreak
    });
  }, [pomodoroSettings.workDuration, pomodoroSettings.shortBreak, pomodoroSettings.longBreak]);

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

  const handleDurationChange = (type: 'workDuration' | 'shortBreak' | 'longBreak', value: number) => {
    const newSettings = { ...pomodoroSettings, [type]: value };
    setPomodoroSettings(newSettings);
    
    // Update the timer if it's not running and we're in the corresponding mode
    if (!isRunning) {
      if ((type === 'workDuration' && mode === 'work') ||
          (type === 'shortBreak' && mode === 'shortBreak') ||
          (type === 'longBreak' && mode === 'longBreak')) {
        setTimeLeft(value * 60);
      }
    }
  };

  const handleInputKeyPress = (e: React.KeyboardEvent, type: 'workDuration' | 'shortBreak' | 'longBreak') => {
    if (e.key === 'Enter') {
      const value = parseInt((e.target as HTMLInputElement).value);
      if (value && value > 0) {
        handleDurationChange(type, value);
      }
    }
  };

  const handleInputBlur = (e: React.FocusEvent, type: 'workDuration' | 'shortBreak' | 'longBreak') => {
    const value = parseInt((e.target as HTMLInputElement).value);
    if (value && value > 0) {
      handleDurationChange(type, value);
    } else {
      // Reset to original value if invalid
      setInputValues(prev => ({ ...prev, [type]: pomodoroSettings[type] }));
    }
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
    return settings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-700';
  };

  const getModeBgColor = () => {
    return settings.theme === 'dark' ? 'bg-[#0d1117] border-[#30363d]' : 'bg-gray-50 border-gray-200';
  };

  return (
    <div className={`rounded-lg ${getModeBgColor()}`}>
      {/* Compact Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center space-x-2">
          <Clock className={`w-4 h-4 ${getModeColor()}`} />
          <h3 className={`text-sm font-medium ${getModeColor()}`}>
            {mode === 'work' ? 'Focus' : 
             mode === 'shortBreak' ? 'Break' : 'Long Break'}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-xs ${settings.theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-500'}`}>
            {pomodoroCount}
          </span>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1 rounded hover:bg-gray-100 ${
              settings.theme === 'dark' ? 'hover:bg-[#30363d] text-[#8b949e]' : 'text-gray-500'
            }`}
          >
            <Settings size={14} />
          </button>
        </div>
      </div>

      {/* Compact Timer Display */}
      <div className="px-3 pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className={`text-2xl font-mono font-medium ${getModeColor()}`}>
            {formatTime(timeLeft)}
          </div>
          <div className="flex space-x-1">
            <button
              onClick={isRunning ? pauseTimer : startTimer}
              className={`p-2 rounded-lg transition-colors ${
                isRunning
                  ? settings.theme === 'dark' 
                    ? 'bg-[#30363d] hover:bg-[#484f58] text-[#c9d1d9]'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  : settings.theme === 'dark'
                    ? 'bg-[#1f6feb] hover:bg-[#1f6feb]/80 text-white'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
              }`}
            >
              {isRunning ? <Pause size={14} /> : <Play size={14} />}
            </button>
            
            <button
              onClick={resetTimer}
              className={`p-2 rounded-lg transition-colors ${
                settings.theme === 'dark'
                  ? 'bg-[#30363d] hover:bg-[#484f58] text-[#8b949e]'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
              }`}
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
        
        {/* Compact Progress Bar */}
        <div className={`w-full h-1 rounded-full ${
          settings.theme === 'dark' ? 'bg-[#30363d]' : 'bg-gray-200'
        }`}>
          <div
            className={`h-1 rounded-full transition-all duration-1000 ${
              settings.theme === 'dark' ? 'bg-[#1f6feb]' : 'bg-primary-600'
            }`}
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      {/* Compact Mode Selector */}
      <div className="flex space-x-1 px-3 pb-3">
        <button
          onClick={() => switchMode('work')}
          className={`flex-1 py-1.5 px-2 rounded text-xs font-medium transition-colors ${
            mode === 'work'
              ? settings.theme === 'dark'
                ? 'bg-[#1f6feb] text-white'
                : 'bg-primary-600 text-white'
              : settings.theme === 'dark'
                ? 'bg-[#30363d] text-[#8b949e] hover:bg-[#484f58]'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          Work
        </button>
        <button
          onClick={() => switchMode('shortBreak')}
          className={`flex-1 py-1.5 px-2 rounded text-xs font-medium transition-colors ${
            mode === 'shortBreak'
              ? settings.theme === 'dark'
                ? 'bg-[#1f6feb] text-white'
                : 'bg-primary-600 text-white'
              : settings.theme === 'dark'
                ? 'bg-[#30363d] text-[#8b949e] hover:bg-[#484f58]'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          Break
        </button>
        <button
          onClick={() => switchMode('longBreak')}
          className={`flex-1 py-1.5 px-2 rounded text-xs font-medium transition-colors ${
            mode === 'longBreak'
              ? settings.theme === 'dark'
                ? 'bg-[#1f6feb] text-white'
                : 'bg-primary-600 text-white'
              : settings.theme === 'dark'
                ? 'bg-[#30363d] text-[#8b949e] hover:bg-[#484f58]'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          Long
        </button>
      </div>

      {/* Compact Settings Panel */}
      {showSettings && (
        <div className={`px-3 pb-3 border-t ${
          settings.theme === 'dark' ? 'border-[#30363d]' : 'border-gray-200'
        }`}>
          <div className="pt-3 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className={`block text-xs font-medium mb-1 ${settings.theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-600'}`}>
                  Work
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={inputValues.workDuration}
                  onChange={(e) => setInputValues(prev => ({ ...prev, workDuration: parseInt(e.target.value) || 25 }))}
                  onKeyPress={(e) => handleInputKeyPress(e, 'workDuration')}
                  onBlur={(e) => handleInputBlur(e, 'workDuration')}
                  className={`w-full px-2 py-1 text-sm rounded border ${
                    settings.theme === 'dark' 
                      ? 'bg-[#0d1117] border-[#30363d] text-[#c9d1d9]' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-xs font-medium mb-1 ${settings.theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-600'}`}>
                  Short
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={inputValues.shortBreak}
                  onChange={(e) => setInputValues(prev => ({ ...prev, shortBreak: parseInt(e.target.value) || 5 }))}
                  onKeyPress={(e) => handleInputKeyPress(e, 'shortBreak')}
                  onBlur={(e) => handleInputBlur(e, 'shortBreak')}
                  className={`w-full px-2 py-1 text-sm rounded border ${
                    settings.theme === 'dark' 
                      ? 'bg-[#0d1117] border-[#30363d] text-[#c9d1d9]' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-xs font-medium mb-1 ${settings.theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-600'}`}>
                  Long
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={inputValues.longBreak}
                  onChange={(e) => setInputValues(prev => ({ ...prev, longBreak: parseInt(e.target.value) || 15 }))}
                  onKeyPress={(e) => handleInputKeyPress(e, 'longBreak')}
                  onBlur={(e) => handleInputBlur(e, 'longBreak')}
                  className={`w-full px-2 py-1 text-sm rounded border ${
                    settings.theme === 'dark' 
                      ? 'bg-[#0d1117] border-[#30363d] text-[#c9d1d9]' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className={`text-xs ${settings.theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-600'}`}>
                Sound
              </label>
              <input
                type="checkbox"
                checked={pomodoroSettings.soundEnabled}
                onChange={(e) => setPomodoroSettings(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                className="rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PomodoroTimer;
