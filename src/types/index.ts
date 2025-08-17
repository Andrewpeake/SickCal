export type CalendarView = 'day' | 'week' | 'month' | 'year';

export interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  color: string;
  isAllDay?: boolean;
  isAllWeek?: boolean;
  location?: string;
  attendees?: string[];
  category?: string;
  repeat?: RepeatPattern;
}

export interface RepeatPattern {
  type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  interval: number; // Every X days/weeks/months/years
  endDate?: Date; // When to stop repeating
  endAfter?: number; // Or stop after X occurrences
  daysOfWeek?: number[]; // For weekly: [0,1,2,3,4,5,6] (Sunday = 0)
  dayOfMonth?: number; // For monthly: specific day of month
  weekOfMonth?: number; // For monthly: which week (1-5, -1 for last)
  dayOfWeek?: number; // For monthly: which day of week (0-6)
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  startTime?: Date;
  endTime?: Date;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category?: string;
}

export interface CalendarState {
  currentDate: Date;
  selectedDate: Date;
  view: CalendarView;
  events: Event[];
  tasks: Task[];
  showEventModal: boolean;
  showTaskModal: boolean;
  editingEvent?: Event;
  editingTask?: Task;
}

export interface NavigationProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onViewChange: (view: CalendarView) => void;
  view: CalendarView;
  settings: Settings;
}

export interface CalendarGridProps {
  currentDate: Date;
  selectedDate: Date;
  onDateSelect: (date: Date, isDoubleClick?: boolean) => void;
  events: Event[];
  tasks: Task[];
  view: CalendarView;
  settings: Settings;
  onEventEdit?: (event: Event) => void;
  onEventOpen?: (event: Event) => void;
  onEventDelete?: (eventId: string) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
  onEventCreate?: (event: Event) => void;
  onTaskCreate?: (date: Date) => void;
}

export interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: Event;
  selectedDate?: Date;
  onSave: (event: Event) => void;
  onDelete?: (eventId: string) => void;
}

export interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task;
  selectedDate?: Date;
  onSave: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

export interface Settings {
  // Appearance
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  hourHeight: number;
  gridLineOpacity: number;
  showWeekNumbers: boolean;
  showTodayHighlight: boolean;
  showLiveTimeIndicator: boolean;
  
  // Calendar Behavior
  defaultView: 'day' | 'week' | 'month' | 'year';
  defaultStartHour: number;
  defaultEndHour: number;
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
  showWeekend: boolean;
  
  // Event Settings
  defaultEventDuration: number; // in minutes
  allowEventOverlap: boolean;
  showEventCount: boolean;
  eventColorScheme: 'category' | 'random' | 'custom';
  
  // Interaction
  enableDragAndDrop: boolean;
  enableDoubleRightClickDelete: boolean;
  enableKeyboardShortcuts: boolean;
  enableZoomScroll: boolean;
  
  // Notifications
  enableNotifications: boolean;
  reminderTime: number; // minutes before event
  soundNotifications: boolean;
  
  // Data & Storage
  autoSave: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly' | 'never';
  exportFormat: 'json' | 'csv' | 'ics';
  
  // Advanced
  timeFormat: '12h' | '24h';
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  language: string;
  timezone: string;
} 