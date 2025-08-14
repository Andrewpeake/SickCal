import { Settings } from '../types';

export const defaultSettings: Settings = {
  // Appearance
  theme: 'light',
  primaryColor: '#0ea5e9',
  hourHeight: 64,
  gridLineOpacity: 0.75,
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
const APPLIED_SETTINGS_STORAGE_KEY = 'sickcal_applied_settings';

export const loadSettings = (): Settings => {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    console.log('Loading settings from localStorage:', { stored, key: SETTINGS_STORAGE_KEY });
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all properties exist
      const mergedSettings = { ...defaultSettings, ...parsed };
      console.log('Loaded and merged settings:', mergedSettings);
      return mergedSettings;
    }
  } catch (error) {
    console.warn('Failed to load settings from localStorage:', error);
  }
  console.log('Using default settings');
  return defaultSettings;
};

export const saveSettings = (settings: Settings): void => {
  try {
    console.log('Saving settings to localStorage:', { settings, key: SETTINGS_STORAGE_KEY });
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    console.log('Settings saved successfully');
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
  const body = document.body;
  
  // Set CSS custom properties for theme colors
  if (theme === 'dark') {
    root.classList.add('dark');
    body.classList.add('dark');
    root.style.setProperty('--nav-bg', '#161b22');
    root.style.setProperty('--nav-text', '#c9d1d9');
    root.style.setProperty('--nav-border', '#30363d');
    console.log('Applied dark theme to document and body with CSS variables');
  } else if (theme === 'light') {
    root.classList.remove('dark');
    body.classList.remove('dark');
    root.style.setProperty('--nav-bg', '#ffffff');
    root.style.setProperty('--nav-text', '#374151');
    root.style.setProperty('--nav-border', '#d1d5db');
    console.log('Applied light theme to document and body with CSS variables');
  } else if (theme === 'auto') {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      root.classList.add('dark');
      body.classList.add('dark');
      root.style.setProperty('--nav-bg', '#161b22');
      root.style.setProperty('--nav-text', '#c9d1d9');
      root.style.setProperty('--nav-border', '#30363d');
      console.log('Applied auto dark theme to document and body with CSS variables');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      root.style.setProperty('--nav-bg', '#ffffff');
      root.style.setProperty('--nav-text', '#374151');
      root.style.setProperty('--nav-border', '#d1d5db');
      console.log('Applied auto light theme to document and body with CSS variables');
    }
  }
};

export const applyPrimaryColor = (color: string): void => {
  const root = document.documentElement;
  root.style.setProperty('--primary-color', color);
  root.style.setProperty('--primary-600', color);
  root.style.setProperty('--primary-700', adjustColor(color, -20));
};

// Apply all settings at once
export const applyAllSettings = (settings: Settings): void => {
  console.log('applyAllSettings called with:', settings);
  
  // Apply theme
  applyTheme(settings.theme);
  console.log('Theme applied:', settings.theme);
  
  // Apply primary color
  applyPrimaryColor(settings.primaryColor);
  console.log('Primary color applied:', settings.primaryColor);
  
  // Apply CSS custom properties for other appearance settings
  const root = document.documentElement;
  root.style.setProperty('--hour-height', `${settings.hourHeight}px`);
  console.log('CSS custom property set: --hour-height =', `${settings.hourHeight}px`);
  
  // Apply settings to body as well for broader compatibility
  document.body.style.setProperty('--hour-height', `${settings.hourHeight}px`);
  
  // Store settings in localStorage for components to access
  localStorage.setItem(APPLIED_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  console.log('Settings stored in localStorage');
  
  // Dispatch custom event to notify components of settings change
  window.dispatchEvent(new CustomEvent('sickcal-settings-changed', { 
    detail: settings 
  }));
  console.log('Custom event dispatched');
  
  console.log('All settings applied successfully');
};

// Get applied settings from localStorage
export const getAppliedSettings = (): Settings | null => {
  try {
    const stored = localStorage.getItem(APPLIED_SETTINGS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('Failed to get applied settings:', error);
    return null;
  }
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
