import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addDays, subDays, addMonths, subMonths, addYears, subYears, startOfDay, endOfDay, getMonth, getYear } from 'date-fns';

export const formatDate = (date: Date, formatStr: string = 'MMM dd, yyyy'): string => {
  return format(date, formatStr);
};

export const formatTime = (date: Date): string => {
  return format(date, 'HH:mm');
};

export const getWeekDays = (date: Date): Date[] => {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
};

export const getMonthDays = (date: Date): Date[] => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const monthStart = startOfWeek(start, { weekStartsOn: 1 });
  const monthEnd = endOfWeek(end, { weekStartsOn: 1 });
  return eachDayOfInterval({ start: monthStart, end: monthEnd });
};

export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

export const isSelected = (date: Date, selectedDate: Date): boolean => {
  return isSameDay(date, selectedDate);
};

export const isCurrentMonth = (date: Date, currentDate: Date): boolean => {
  return isSameMonth(date, currentDate);
};

export const getDayName = (date: Date): string => {
  return format(date, 'EEE');
};

export const getMonthName = (date: Date): string => {
  return format(date, 'MMMM yyyy');
};

export const navigateDate = (date: Date, direction: 'prev' | 'next', view: 'day' | 'week' | 'month' | 'year'): Date => {
  switch (view) {
    case 'day':
      return direction === 'next' ? addDays(date, 1) : subDays(date, 1);
    case 'week':
      return direction === 'next' ? addDays(date, 7) : subDays(date, 7);
    case 'month':
      return direction === 'next' ? addMonths(date, 1) : subMonths(date, 1);
    case 'year':
      return direction === 'next' ? addYears(date, 1) : subYears(date, 1);
    default:
      return date;
  }
};

export const getEventsForDate = (events: any[], date: Date): any[] => {
  const start = startOfDay(date);
  const end = endOfDay(date);
  
  return events.filter(event => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    return eventStart <= end && eventEnd >= start;
  });
};

export const getTasksForDate = (tasks: any[], date: Date): any[] => {
  return tasks.filter(task => {
    const taskDate = new Date(task.dueDate);
    return isSameDay(taskDate, date);
  });
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
}; 

export const formatDateTime = (date: Date): string => {
  return format(date, "yyyy-MM-dd'T'HH:mm");
};

export const getYearMonths = (date: Date): Date[] => {
  const months: Date[] = [];
  const currentYear = getYear(date);
  
  // Get 12 months from current year
  for (let month = 0; month < 12; month++) {
    months.push(new Date(currentYear, month, 1));
  }
  
  // Get 12 months from next year
  for (let month = 0; month < 12; month++) {
    months.push(new Date(currentYear + 1, month, 1));
  }
  
  return months;
};

export const getMonthEvents = (events: any[], month: Date): any[] => {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  
  return events.filter(event => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    return eventStart <= end && eventEnd >= start;
  });
};

export const getMonthTasks = (tasks: any[], month: Date): any[] => {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  
  return tasks.filter(task => {
    const taskDate = new Date(task.dueDate);
    return taskDate >= start && taskDate <= end;
  });
}; 