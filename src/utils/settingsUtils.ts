import { Settings } from '../types';

export const defaultSettings: Settings = {
  // Appearance
  theme: 'light',
  primaryColor: '#0ea5e9',
  hourHeight: 96,
  showWeekNumbers: false,
  showTodayHighlight: true,
  showLiveTimeIndicator: true,
  
  // Calendar Behavior
  defaultView: 'week',
  defaultStartHour: 6,
  defaultEndHour: 22,
  weekStartsOn: 1, // Monday
  showWeekend: true,
  
  // Event Settings
  defaultEventDuration: 60, // 1 hour
  allowEventOverlap: false,
  showEventCount: true,
  eventColorScheme: 'category',
  
  // Interaction
  enableDragAndDrop: true,
  enableDoubleRightClickDelete: true,
  enableKeyboardShortcuts: true,
  enableZoomScroll: true,
  
  // Notifications
  enableNotifications: false,
  reminderTime: 15, // 15 minutes
  soundNotifications: false,
  
  // Data & Storage
  autoSave: true,
  backupFrequency: 'weekly',
  exportFormat: 'json',
  
  // Advanced
  timeFormat: '24h',
  dateFormat: 'MM/DD/YYYY',
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
};

const SETTINGS_STORAGE_KEY = 'sickcal_settings';

export const loadSettings = (): Settings => {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all properties exist
      return { ...defaultSettings, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load settings from localStorage:', error);
  }
  return defaultSettings;
};

export const saveSettings = (settings: Settings): void => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save settings to localStorage:', error);
  }
};

export const resetSettings = (): Settings => {
  try {
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to reset settings in localStorage:', error);
  }
  return defaultSettings;
};

// Utility functions for applying settings
export const applyTheme = (theme: string): void => {
  const root = document.documentElement;
  
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.remove('dark');
  } else if (theme === 'auto') {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
};

export const applyPrimaryColor = (color: string): void => {
  const root = document.documentElement;
  root.style.setProperty('--primary-color', color);
  root.style.setProperty('--primary-600', color);
  root.style.setProperty('--primary-700', adjustColor(color, -20));
};

// Helper function to adjust color brightness
const adjustColor = (color: string, amount: number): string => {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// Export settings to different formats
export const exportSettings = (settings: Settings, format: string): string => {
  switch (format) {
    case 'json':
      return JSON.stringify(settings, null, 2);
    case 'csv':
      return convertToCSV(settings);
    case 'ics':
      return convertToICS(settings);
    default:
      return JSON.stringify(settings, null, 2);
  }
};

const convertToCSV = (settings: Settings): string => {
  const rows = Object.entries(settings).map(([key, value]) => `${key},${value}`);
  return `Setting,Value\n${rows.join('\n')}`;
};

const convertToICS = (settings: Settings): string => {
  // This is a placeholder - ICS format is for calendar events, not settings
  // But we can create a settings summary
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SickCal//Settings Export//EN
BEGIN:VEVENT
SUMMARY:SickCal Settings Export
DESCRIPTION:${JSON.stringify(settings).replace(/"/g, '\\"')}
DTSTART:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
END:VEVENT
END:VCALENDAR`;
};

// Import settings from different formats
export const importSettings = (data: string, format: string): Settings => {
  try {
    switch (format) {
      case 'json':
        return JSON.parse(data);
      case 'csv':
        return parseCSV(data);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  } catch (error) {
    console.error('Failed to import settings:', error);
    throw new Error('Invalid settings file format');
  }
};

const parseCSV = (csv: string): Settings => {
  const lines = csv.split('\n');
  const settings: any = {};
  
  for (let i = 1; i < lines.length; i++) {
    const [key, value] = lines[i].split(',');
    if (key && value !== undefined) {
      // Try to parse the value appropriately
      let parsedValue: any = value;
      if (value === 'true') parsedValue = true;
      else if (value === 'false') parsedValue = false;
      else if (!isNaN(Number(value))) parsedValue = Number(value);
      
      settings[key] = parsedValue;
    }
  }
  
  return { ...defaultSettings, ...settings };
};
