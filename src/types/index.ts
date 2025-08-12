export type CalendarView = 'day' | 'week' | 'month' | 'year';

export interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  color: string;
  isAllDay?: boolean;
  location?: string;
  attendees?: string[];
  category?: string;
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
}

export interface CalendarGridProps {
  currentDate: Date;
  selectedDate: Date;
  onDateSelect: (date: Date, isDoubleClick?: boolean) => void;
  events: Event[];
  tasks: Task[];
  view: CalendarView;
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