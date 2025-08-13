import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CalendarGridProps, Event as CalendarEvent } from '../types';
import { 
  getMonthDays, 
  getWeekDays, 
  isToday, 
  isSelected, 
  isCurrentMonth, 
  getDayName, 
  getEventsForDate, 
  getTasksForDate,
  getYearMonths,
  getMonthEvents,
  getMonthTasks,
  formatDate,
  formatTime
} from '../utils/dateUtils';
import { Circle, CheckCircle, Clock, Plus, Edit, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import ContextMenu, { ContextMenuItem } from './ContextMenu';

// Live Time Indicator Component
const LiveTimeIndicator: React.FC<{ timeSlots: Date[] }> = ({ timeSlots }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Find the closest time slot to current time
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  
  // Find the time slot that matches the current hour
  const currentTimeSlot = timeSlots.find(time => time.getHours() === currentHour);
  
  if (!currentTimeSlot) return null;

  // Calculate position based on current time within the hour
  const timeSlotIndex = timeSlots.findIndex(time => time.getHours() === currentHour);
  const topPosition = timeSlotIndex * 96; // 96px per hour (h-24)
  
  // Adjust position within the hour based on minutes
  const minuteOffset = (currentMinute / 60) * 96; // 96px per hour
  const finalTopPosition = topPosition + minuteOffset;

  return (
    <div 
      className="absolute left-0 right-0 z-20 pointer-events-none"
      style={{ top: `${finalTopPosition}px` }}
    >
      {/* Red line */}
      <div className="h-0.5 bg-red-500 w-full"></div>
      {/* Red dot */}
      <div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full"></div>
      {/* Time label */}
      <div className="absolute -left-16 top-0 bg-red-500 text-white text-xs px-2 py-1 rounded">
        {formatTime(currentTime)}
      </div>
    </div>
  );
};

const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  selectedDate,
  onDateSelect,
  events,
  tasks,
  view,
  settings,
  onEventEdit,
  onEventOpen,
  onEventDelete,
  onTaskEdit,
  onTaskDelete,
  onEventCreate,
  onTaskCreate,
  onSettingsChange
}) => {
  // const [localCurrentDate, setLocalCurrentDate] = useState(currentDate); // Unused - using currentDate directly
  const calendarRef = useRef<HTMLDivElement>(null);
  const timeGridRef = useRef<HTMLDivElement>(null);
  
  // Calendar expand state
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFull24Hours, setIsFull24Hours] = useState(false);
  
  // Use settings for various features
  const hourHeight = settings.hourHeight;
  const showLiveTimeIndicator = settings.showLiveTimeIndicator;
  const enableDragAndDrop = settings.enableDragAndDrop;
  const enableDoubleRightClickDelete = settings.enableDoubleRightClickDelete;
  const enableZoomScroll = settings.enableZoomScroll;
  
  // Debug: Log settings when they change
  useEffect(() => {
    console.log('CalendarGrid settings updated:', {
      hourHeight,
      showLiveTimeIndicator,
      enableDragAndDrop,
      enableDoubleRightClickDelete,
      enableZoomScroll,
      fullSettings: settings
    });
  }, [hourHeight, showLiveTimeIndicator, enableDragAndDrop, enableDoubleRightClickDelete, enableZoomScroll, settings]);
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    type: 'empty' | 'event' | 'task';
    data?: any;
  }>({
    isOpen: false,
    x: 0,
    y: 0,
    type: 'empty'
  });



  // Event dragging state
  const [eventDrag, setEventDrag] = useState<{
    isActive: boolean;
    event: CalendarEvent | null;
    originalStartDate: Date | null;
    originalEndDate: Date | null;
    offsetX: number;
    offsetY: number;
    dragStartDate: Date | null;
    dragStartHour: number | null;
  }>({
    isActive: false,
    event: null,
    originalStartDate: null,
    originalEndDate: null,
    offsetX: 0,
    offsetY: 0,
    dragStartDate: null,
    dragStartHour: null
  });

  // Double right-click state for quick delete
  const [doubleRightClick, setDoubleRightClick] = useState<{
    eventId: string | null;
    timestamp: number;
  }>({
    eventId: null,
    timestamp: 0
  });

  // Listen for settings changes and apply them
  useEffect(() => {
    const handleSettingsChange = (event: CustomEvent) => {
      const newSettings = event.detail;
      // Settings change will trigger re-render through props
      console.log('Settings changed:', newSettings);
    };

    window.addEventListener('sickcal-settings-changed', handleSettingsChange as EventListener);
    
    return () => {
      window.removeEventListener('sickcal-settings-changed', handleSettingsChange as EventListener);
    };
  }, []);

  // Scroll to 6 AM on mount (or 00:00 for full 24-hour view)
  useEffect(() => {
    if (view === 'week' && timeGridRef.current) {
      const scrollToHour = isFull24Hours ? 0 : 6; // 00:00 for full view, 6 AM for normal
      const scrollPosition = scrollToHour * hourHeight;
      
      timeGridRef.current.scrollTop = scrollPosition;
    }
  }, [view, isFull24Hours, hourHeight]);



  // Context menu handlers
  const handleContextMenu = (e: React.MouseEvent, type: 'empty' | 'event' | 'task', data?: any) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      type,
      data
    });
  };

  const closeContextMenu = () => {
    setContextMenu(prev => ({ ...prev, isOpen: false }));
  };

  // Handle double right-click for quick delete
  const handleDoubleRightClick = (e: React.MouseEvent, event: CalendarEvent) => {
    if (!enableDoubleRightClickDelete) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const now = Date.now();
    const timeDiff = now - doubleRightClick.timestamp;
    const isSameEvent = doubleRightClick.eventId === event.id;
    
    if (isSameEvent && timeDiff < 500) { // 500ms threshold for double right-click
      // Double right-click detected - delete the event
      if (onEventDelete) {
        onEventDelete(event.id);
      }
      // Reset the double right-click state
      setDoubleRightClick({ eventId: null, timestamp: 0 });
    } else {
      // First right-click - set the state
      setDoubleRightClick({ eventId: event.id, timestamp: now });
    }
  };





  const getContextMenuItems = (): ContextMenuItem[] => {
    // Handle regular context menu
    switch (contextMenu.type) {
      case 'empty':
        return [
          {
            id: 'create-event',
            label: 'Create Event',
            icon: <Plus className="w-4 h-4" />,
            onClick: () => {
              if (!onEventCreate) return;
              const payload = contextMenu.data;
              // Support both Date (timed slot) and { date, allDay } payloads
              if (payload instanceof Date) {
                const start = new Date(payload);
                const end = new Date(payload);
                end.setHours(end.getHours() + 1);
                const evt = {
                  id: `event-${Date.now()}`,
                  title: 'New Event',
                  description: '',
                  startDate: start,
                  endDate: end,
                  color: '#0ea5e9',
                  isAllDay: false
                } as CalendarEvent;
                onEventCreate(evt);
              } else if (payload && payload.date) {
                const baseDate = new Date(payload.date);
                const start = new Date(baseDate);
                start.setHours(0, 0, 0, 0);
                const end = new Date(baseDate);
                end.setHours(23, 59, 59, 999);
                const evt = {
                  id: `event-${Date.now()}`,
                  title: 'New Daily Event',
                  description: '',
                  startDate: start,
                  endDate: end,
                  color: '#0ea5e9',
                  isAllDay: true
                } as CalendarEvent;
                onEventCreate(evt);
              }
            }
          },
          {
            id: 'create-task',
            label: 'Create Task',
            icon: <CheckCircle className="w-4 h-4" />,
            onClick: () => {
              if (onTaskCreate && contextMenu.data) {
                const payload = contextMenu.data;
                const dateArg = payload && payload.date ? new Date(payload.date) : payload;
                if (dateArg instanceof Date) {
                  onTaskCreate(dateArg);
                }
              }
            }
          }
        ];
      
      case 'event':
        return [
          {
            id: 'edit-event',
            label: 'Edit Event',
            icon: <Edit className="w-4 h-4" />,
            onClick: () => {
              if (onEventOpen && contextMenu.data) {
                onEventOpen(contextMenu.data);
              }
            }
          },
          {
            id: 'delete-event',
            label: 'Delete Event',
            icon: <Trash2 className="w-4 h-4" />,
            onClick: () => {
              if (onEventDelete && contextMenu.data) {
                onEventDelete(contextMenu.data.id);
              }
            }
          }
        ];
      
      case 'task':
        return [
          {
            id: 'edit-task',
            label: 'Edit Task',
            icon: <Edit className="w-4 h-4" />,
            onClick: () => {
              if (onTaskEdit && contextMenu.data) {
                onTaskEdit(contextMenu.data);
              }
            }
          },
          {
            id: 'delete-task',
            label: 'Delete Task',
            icon: <Trash2 className="w-4 h-4" />,
            onClick: () => {
              if (onTaskDelete && contextMenu.data) {
                onTaskDelete(contextMenu.data.id);
              }
            }
          }
        ];
      
      default:
        return [];
    }
  };







  // Event dragging handlers
  const handleEventMouseDown = useCallback((e: React.MouseEvent, event: CalendarEvent) => {
    if (!enableDragAndDrop) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = timeGridRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setEventDrag({
      isActive: true,
      event,
      originalStartDate: new Date(event.startDate),
      originalEndDate: new Date(event.endDate),
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      dragStartDate: new Date(event.startDate),
      dragStartHour: new Date(event.startDate).getHours()
    });
  }, []);

  const handleEventMouseMove = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!eventDrag.isActive || !timeGridRef.current || !eventDrag.event) return;

    const rect = timeGridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top + timeGridRef.current.scrollTop;

    // Calculate new day and hour
    const dayWidth = (rect.width - 80) / 7;
    const hourHeight = settings.hourHeight;
    
    // Calculate day index - need to account for 80px time column
    let dayIndex = Math.floor((x - 80) / dayWidth);
    let hourIndex = Math.floor(y / hourHeight);
    
    // Clamp indices
    dayIndex = Math.max(0, Math.min(6, dayIndex));
    hourIndex = Math.max(0, Math.min(23, hourIndex));

    const weekDays = getWeekDays(currentDate);
    const newStartDay = weekDays[dayIndex];
    
    // Calculate duration in hours
    const originalStart = new Date(eventDrag.originalStartDate!);
    const originalEnd = new Date(eventDrag.originalEndDate!);
    const durationMs = originalEnd.getTime() - originalStart.getTime();
    const durationHours = Math.ceil(durationMs / (60 * 60 * 1000));
    
    // Create new start and end times
    const newStartTime = new Date(newStartDay);
    newStartTime.setHours(hourIndex, 0, 0, 0);
    
    const newEndTime = new Date(newStartTime);
    newEndTime.setHours(hourIndex + durationHours, 0, 0, 0);
    
    // Update the event drag state with new position for visual feedback
    setEventDrag(prev => ({
      ...prev,
      dragStartDate: newStartDay,
      dragStartHour: hourIndex
    }));
  }, [eventDrag.isActive, eventDrag.event, eventDrag.originalStartDate, eventDrag.originalEndDate, currentDate, enableDragAndDrop, settings.hourHeight]);

  const handleEventMouseUp = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!eventDrag.isActive || !eventDrag.event) return;

    const rect = timeGridRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top + (timeGridRef.current?.scrollTop || 0);

    // Calculate final position
    const dayWidth = (rect.width - 80) / 7;
    const hourHeight = settings.hourHeight;
    
    // Calculate day index - need to account for 80px time column
    let dayIndex = Math.floor((x - 80) / dayWidth);
    let hourIndex = Math.floor(y / hourHeight);
    
    dayIndex = Math.max(0, Math.min(6, dayIndex));
    hourIndex = Math.max(0, Math.min(23, hourIndex));

    const weekDays = getWeekDays(currentDate);
    const newStartDay = weekDays[dayIndex];
    
    // Calculate duration
    const originalStart = new Date(eventDrag.originalStartDate!);
    const originalEnd = new Date(eventDrag.originalEndDate!);
    const durationMs = originalEnd.getTime() - originalStart.getTime();
    const durationHours = Math.ceil(durationMs / (60 * 60 * 1000));
    
    // Create new times
    const newStartTime = new Date(newStartDay);
    newStartTime.setHours(hourIndex, 0, 0, 0);
    
    const newEndTime = new Date(newStartTime);
    newEndTime.setHours(hourIndex + durationHours, 0, 0, 0);
    
    // Update the event via the callback
    if (onEventEdit) {
      const updatedEvent = {
        ...eventDrag.event,
        startDate: newStartTime,
        endDate: newEndTime
      };
      onEventEdit(updatedEvent);
    }
    
    // Reset event drag state
    setEventDrag({
      isActive: false,
      event: null,
      originalStartDate: null,
      originalEndDate: null,
      offsetX: 0,
      offsetY: 0,
      dragStartDate: null,
      dragStartHour: null
    });
  }, [eventDrag.isActive, eventDrag.event, eventDrag.originalStartDate, eventDrag.originalEndDate, currentDate, onEventEdit, settings.hourHeight]);

  // Handle mouse wheel events for calendar scrolling and global mouse events
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!calendarRef.current || !timeGridRef.current) return;

      const rect = calendarRef.current.getBoundingClientRect();
      const isInCalendar = e.clientX >= rect.left && e.clientX <= rect.right && 
                          e.clientY >= rect.top && e.clientY <= rect.bottom;

      if (isInCalendar) {
        // Check for Command (Mac) or Alt (PC) + scroll for zoom functionality
        const isZoomKeyPressed = e.metaKey || e.altKey; // metaKey is Command on Mac, altKey is Alt on PC
        
        if (isZoomKeyPressed && enableZoomScroll) {
          e.preventDefault();
          
          // Calculate new hour height based on scroll direction
          const currentHourHeight = settings.hourHeight;
          const zoomFactor = 0.1; // 10% change per scroll
          const delta = e.deltaY > 0 ? -1 : 1; // Negative delta = scroll down = zoom out
          
          let newHourHeight = currentHourHeight + (delta * currentHourHeight * zoomFactor);
          
          // Clamp between minimum and maximum values
          const minHeight = 24; // Minimum 24px per hour
          const maxHeight = 600; // Maximum 600px per hour
          newHourHeight = Math.max(minHeight, Math.min(maxHeight, newHourHeight));
          
          // Round to nearest integer
          newHourHeight = Math.round(newHourHeight);
          
          // Only update if the height actually changed
          if (newHourHeight !== currentHourHeight) {
            // Create new settings object with updated hour height
            const newSettings = {
              ...settings,
              hourHeight: newHourHeight
            };
            
            // Apply the new settings immediately
            if (onSettingsChange) {
              onSettingsChange(newSettings);
            }
          }
          
          return;
        }
        
        // In full 24-hour mode, allow page scrolling
        if (isFull24Hours) {
          return;
        }
        
        const scrollContainer = timeGridRef.current;
        const currentScrollTop = scrollContainer.scrollTop;
        const maxScrollTop = scrollContainer.scrollHeight - scrollContainer.clientHeight;
        
        // Check if we're at the bottom (23:59) and trying to scroll down
        if (currentScrollTop >= maxScrollTop && e.deltaY > 0) {
          // Allow page to scroll when at bottom of calendar
          return;
        }
        
        // Check if we're at the top (00:00) and trying to scroll up
        if (currentScrollTop <= 0 && e.deltaY < 0) {
          // Allow page to scroll when at top of calendar
          return;
        }
        
        // Prevent page scroll when in calendar (normal and expanded modes)
        e.preventDefault();
        
        // Scroll the calendar
        scrollContainer.scrollTop += e.deltaY;
      }
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleEventMouseMove(e);
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      handleEventMouseUp(e);
    };

    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [handleEventMouseMove, handleEventMouseUp, isFull24Hours, enableZoomScroll]);

  const renderDayCell = (date: Date) => {
    const dayEvents = getEventsForDate(events, date);
    const dayTasks = getTasksForDate(tasks, date);
    const isCurrentMonthDay = isCurrentMonth(date, currentDate);
    const isTodayDay = isToday(date);
    const isSelectedDay = isSelected(date, selectedDate);

    return (
      <div
        key={date.toISOString()}
        onClick={() => onDateSelect(date)}
        onDoubleClick={() => {
          // Double click to open day view
          if (onDateSelect) {
            onDateSelect(date, true);
          }
        }}
        onContextMenu={(e) => handleContextMenu(e, 'empty', date)}
        className={clsx(
          'calendar-day relative',
          isTodayDay && 'today',
          isSelectedDay && 'selected',
          !isCurrentMonthDay && 'other-month'
        )}
      >
        {/* Day number */}
        <div className="flex items-center justify-between mb-2">
          <span className={clsx(
            'text-sm font-medium',
            isTodayDay && 'text-primary-600 font-bold',
            isSelectedDay && 'text-primary-700'
          )}>
            {date.getDate()}
          </span>
          
          {/* Event indicator */}
          {dayEvents.length > 0 && (
            <div className="flex space-x-1">
              {dayEvents.slice(0, 3).map((event, index) => (
                <div
                  key={index}
                  className="event-dot"
                  style={{ backgroundColor: event.color }}
                />
              ))}
              {dayEvents.length > 3 && (
                <span className="text-xs text-gray-500">+{dayEvents.length - 3}</span>
              )}
            </div>
          )}
        </div>

        {/* Events preview */}
        <div className="space-y-1">
          {dayEvents.slice(0, 2).map((event) => (
            <div
              key={event.id}
              className="text-xs p-1 rounded truncate cursor-pointer"
              style={{ 
                backgroundColor: `${event.color}20`,
                color: event.color,
                borderLeft: `3px solid ${event.color}`
              }}
              onContextMenu={(e) => {
                e.stopPropagation();
                handleContextMenu(e, 'event', event);
              }}
            >
              {event.title}
            </div>
          ))}
        </div>

        {/* Tasks preview */}
        <div className="mt-2 space-y-1">
          {dayTasks.slice(0, 2).map((task) => (
            <div
              key={task.id}
              className={clsx(
                'flex items-center space-x-1 text-xs cursor-pointer',
                task.completed ? 'text-gray-400' : 'text-gray-700'
              )}
              onContextMenu={(e) => {
                e.stopPropagation();
                handleContextMenu(e, 'task', task);
              }}
            >
              {task.completed ? (
                <CheckCircle className="w-3 h-3 text-green-500" />
              ) : (
                <Circle className="w-3 h-3 text-gray-400" />
              )}
              <span className={clsx(
                'truncate',
                task.completed && 'line-through'
              )}>
                {task.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate);
    const timeSlots: Date[] = [];
    
    // Generate time slots from 00:00 to 23:00 (hour-level only)
    for (let hour = 0; hour < 24; hour++) {
      const time = new Date();
      time.setHours(hour, 0, 0, 0);
      timeSlots.push(time);
    }
    
    return (
      <div ref={calendarRef} className="bg-white shadow-soft rounded-xl overflow-hidden">
        {/* Week header - fixed */}
        <div className="sticky-header bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex flex-1">
              <div className="w-20 bg-gray-50 p-3"></div>
              {weekDays.map((date) => (
                <div
                  key={date.toISOString()}
                  className={clsx(
                    'flex-1 bg-gray-50 p-3 text-center',
                    isToday(date) && 'bg-primary-50'
                  )}
                >
                  <div className="text-sm font-medium text-gray-600">
                    {getDayName(date)}
                  </div>
                  <div className={clsx(
                    'text-lg font-bold',
                    isToday(date) ? 'text-primary-600' : 'text-gray-900'
                  )}>
                    {date.getDate()}
                  </div>
                </div>
              ))}
            </div>
            {/* Expand/Collapse button */}
            <div className="px-3">
              <button
                onClick={() => {
                  // Single click: toggle normal expand
                  if (isExpanded || isFull24Hours) {
                    // Collapse both modes back to default
                    setIsExpanded(false);
                    setIsFull24Hours(false);
                  } else {
                    // Single click expand
                    setIsExpanded(true);
                    setIsFull24Hours(false);
                  }
                }}
                onDoubleClick={() => {
                  // Double click: show full 24 hours
                  if (!isExpanded && !isFull24Hours) {
                    setIsExpanded(true);
                    setIsFull24Hours(true);
                  }
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors duration-150"
                title={isExpanded || isFull24Hours ? "Collapse calendar" : "Single click: Expand | Double click: Full 24 hours"}
              >
                {isExpanded || isFull24Hours ? (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    Collapse
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Expand
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Time grid - scrollable */}
        <div 
          ref={timeGridRef}
          className={`calendar-week-grid relative overflow-y-auto calendar-scroll transition-all duration-300 ${
            isFull24Hours ? 'max-h-[2304px]' : isExpanded ? 'max-h-[1056px]' : 'max-h-[600px]'
          }`}
        >
          {/* Live time indicator */}
          {showLiveTimeIndicator && <LiveTimeIndicator timeSlots={timeSlots} />}





          {/* Event drag preview */}
          {eventDrag.isActive && eventDrag.event && eventDrag.dragStartDate && eventDrag.dragStartHour !== null && (
            <div
              className="absolute z-25 pointer-events-none bg-blue-600 bg-opacity-30 border-2 border-blue-600 rounded"
              style={{
                left: `${80 + weekDays.findIndex(day => day.toDateString() === eventDrag.dragStartDate!.toDateString()) * ((timeGridRef.current?.getBoundingClientRect().width || 800) - 80) / 7}px`,
                top: `${eventDrag.dragStartHour! * 96}px`,
                width: `${((timeGridRef.current?.getBoundingClientRect().width || 800) - 80) / 7}px`,
                height: `${Math.ceil((new Date(eventDrag.originalEndDate!).getTime() - new Date(eventDrag.originalStartDate!).getTime()) / (60 * 60 * 1000)) * 96}px`
              }}
            >
              <div className="absolute top-1 left-1 text-xs text-blue-800 font-medium bg-white bg-opacity-80 px-1 rounded">
                {eventDrag.event.title}
              </div>
            </div>
          )}

          {/* Time column - sticky */}
          <div className="w-20 bg-gray-50 sticky-time-column border-r border-gray-300">
            {timeSlots.map((time, index) => (
              <div
                key={index}
                className="flex items-center justify-end pr-2 bg-gray-50"
                style={{ height: `${hourHeight}px` }}
              >
                <span className="text-xs text-gray-500 font-medium">
                  {formatTime(time)}
                </span>
              </div>
            ))}
          </div>
          
          {/* Day columns */}
          {weekDays.map((date) => (
            <div key={date.toISOString()} className="bg-white relative border-l border-gray-300">
              {timeSlots.map((time, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer hover:bg-gray-50 transition-colors duration-150 border-b border-gray-300 overflow-visible"
                  style={{ height: `${hourHeight}px` }}
                  title="Click to create event, Double-click to create task"

                  onClick={(e) => {
                    // Create event at clicked time - only hour increments
                    const clickedTime = new Date(date);
                    clickedTime.setHours(time.getHours(), 0, 0, 0);
                    
                    // Trigger event creation
                    if (onDateSelect) {
                      onDateSelect(clickedTime);
                    }
                  }}
                  onDoubleClick={(e) => {
                    // Create task at clicked time - only hour increments
                    const clickedTime = new Date(date);
                    clickedTime.setHours(time.getHours(), 0, 0, 0);
                    
                    // Trigger task creation
                    if (onTaskCreate) {
                      onTaskCreate(clickedTime);
                    }
                  }}
                  onContextMenu={(e) => {
                    const clickedTime = new Date(date);
                    clickedTime.setHours(time.getHours(), 0, 0, 0);
                    handleContextMenu(e, 'empty', clickedTime);
                  }}
                >

                  
                  {/* Events for this time slot */}
                  {(() => {
                    // Get all events that are active in this time slot (start here OR continue from previous time)
                    const eventsInSlot = events.filter((event) => {
                      const eventStart = new Date(event.startDate);
                      const eventEnd = new Date(event.endDate);
                      const currentTime = new Date(date);
                      currentTime.setHours(time.getHours(), 0, 0, 0);
                      
                      // Event starts in this exact time slot
                      const startsHere = eventStart.toDateString() === date.toDateString() && 
                                       eventStart.getHours() === time.getHours();
                      
                      // Event continues from previous time (same day or previous day)
                      const continuesFromPrevious = eventStart.getTime() < currentTime.getTime() && 
                                                  eventEnd.getTime() > currentTime.getTime();
                      
                      return startsHere || continuesFromPrevious;
                    });

                    if (eventsInSlot.length === 0) return null;

                    // Calculate the height for each event based on number of events
                    const slotHeight = hourHeight; // Dynamic hour height
                    const padding = 4; // 4px top padding
                    const availableHeight = slotHeight - (padding * 2);
                    const eventHeight = Math.max(20, availableHeight / eventsInSlot.length);

                    // Show event count indicator if multiple events
                    const showEventCount = eventsInSlot.length > 1;

                    return eventsInSlot.map((event, index) => {
                      const eventStart = new Date(event.startDate);
                      const eventEnd = new Date(event.endDate);
                      const currentTime = new Date(date);
                      currentTime.setHours(time.getHours(), 0, 0, 0);
                      
                      // Determine if this is the start of the event or a continuation
                      const isStartOfEvent = eventStart.toDateString() === date.toDateString() && 
                                           eventStart.getHours() === time.getHours();
                      
                      // Determine if this is the first time slot of the day for this event
                      const isFirstSlotOfDay = time.getHours() === 0;
                      
                      // Calculate position for this event - no gap for seamless appearance
                      const top = padding + (index * eventHeight);
                      
                      // Calculate height based on whether this is start or continuation
                      let actualHeight = eventHeight;
                      
                      if (isStartOfEvent) {
                        // For start of event, ensure the height doesn't exceed the current slot height
                        actualHeight = Math.min(eventHeight, slotHeight - padding);
                      } else {
                        // For continuation, calculate remaining time from current slot to end of hour
                        const endOfHour = new Date(date);
                        endOfHour.setHours(time.getHours() + 1, 0, 0, 0);
                        const effectiveEndTime = eventEnd < endOfHour ? eventEnd : endOfHour;
                        const remainingMinutes = Math.ceil((effectiveEndTime.getTime() - currentTime.getTime()) / (60 * 1000));
                        actualHeight = Math.max(eventHeight, Math.min((remainingMinutes / 60) * hourHeight, slotHeight - padding));
                      }

                      return (
                        <div
                          key={event.id}
                          className={`absolute left-1 right-1 text-xs p-1 overflow-hidden cursor-move transition-all duration-200 group ${
                            eventDrag.isActive && eventDrag.event?.id === event.id ? 'opacity-50' : ''
                          }`}
                          style={{ 
                            top: `${top}px`,
                            height: `${actualHeight}px`,
                            backgroundColor: isStartOfEvent ? `${event.color}20` : `${event.color}15`,
                            color: event.color,
                            borderLeft: isStartOfEvent ? `3px solid ${event.color}` : 'none',
                            zIndex: eventDrag.isActive && eventDrag.event?.id === event.id ? 30 : 5,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            overflow: 'visible',
                            // Remove rounded corners for seamless appearance
                            borderRadius: '0px',
                            // Add hover effects that reveal hour boundaries
                            borderTop: isStartOfEvent ? '2px solid transparent' : 'none',
                            borderBottom: '2px solid transparent',
                            borderRight: '2px solid transparent'
                          }}
                          onMouseEnter={(e) => {
                            // On hover, show hour boundaries
                            e.currentTarget.style.borderTop = '2px solid rgba(0,0,0,0.1)';
                            e.currentTarget.style.borderBottom = '2px solid rgba(0,0,0,0.1)';
                            e.currentTarget.style.borderRight = '2px solid rgba(0,0,0,0.1)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                          }}
                          onMouseLeave={(e) => {
                            // On leave, hide hour boundaries
                            e.currentTarget.style.borderTop = isStartOfEvent ? '2px solid transparent' : 'none';
                            e.currentTarget.style.borderBottom = '2px solid transparent';
                            e.currentTarget.style.borderRight = '2px solid transparent';
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                          }}
                          onMouseDown={(e) => handleEventMouseDown(e, event)}
                          onContextMenu={(e) => {
                            e.stopPropagation();
                            handleDoubleRightClick(e, event);
                            handleContextMenu(e, 'event', event);
                          }}
                        >
                          {isStartOfEvent ? (
                            // For start of event, show full details
                            <>
                              <div className="font-medium truncate">{event.title}</div>
                              <div className="text-xs opacity-75 truncate">
                                {formatTime(eventStart)} - {formatTime(eventEnd)}
                              </div>
                            </>
                          ) : isFirstSlotOfDay ? (
                            // For first slot of day (but not start of event), show title only
                            <div className="font-medium truncate opacity-75">{event.title}</div>
                          ) : (
                            // For continuation slots, show no content
                            <div></div>
                          )}
                          {/* Event count indicator for multiple events */}
                          {showEventCount && index === 0 && isStartOfEvent && (
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                              {eventsInSlot.length}
                            </div>
                          )}
                          {/* Hover tooltip for compressed events */}
                          {showEventCount && (
                            <div className="absolute bottom-full left-0 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                              {event.title} ({formatTime(eventStart)} - {formatTime(eventEnd)})
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDate(events, selectedDate);
    const dayTasks = getTasksForDate(tasks, selectedDate);
    const dailyEvents = dayEvents.filter(evt => evt.isAllDay);
    const timedEvents = dayEvents.filter(evt => !evt.isAllDay);

    // Layout config: an odd number so we have a clear middle column
    const totalCols = 13;
    const centerCol = Math.ceil(totalCols / 2);
    const rowCapacity = totalCols; // one item per column

    // Distribute daily events into 4 rows, filling each row center-out before moving to the next
    const rows: CalendarEvent[][] = [[], [], [], []];
    dailyEvents.forEach((evt, idx) => {
      const rowIdx = Math.min(3, Math.floor(idx / rowCapacity));
      rows[rowIdx].push(evt as CalendarEvent);
    });

    // Helper: compute center-out grid column for an index within a row
    const getCenterOutColumn = (i: number) => {
      if (i === 0) return centerCol;
      const k = Math.ceil(i / 2);
      // odd indices go to the right, even indices go to the left
      const offset = i % 2 === 1 ? k : -k;
      return centerCol + offset;
    };

    return (
      <div className="bg-white shadow-soft rounded-xl p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {formatDate(selectedDate, 'EEEE, MMMM dd, yyyy')}
          </h2>
          <p className="text-gray-600">
            {dayEvents.length} events, {dayTasks.length} tasks
          </p>
        </div>

        {/* Daily Events Board (All-day) */}
        <div
          className="mb-8 border border-gray-200 rounded-lg p-3 bg-gray-50"
          onContextMenu={(e) => handleContextMenu(e, 'empty', { date: selectedDate, allDay: true })}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-primary-600" />
            Daily Events
          </h3>
          <div className="space-y-2">
            {rows.map((row, rowIdx) => (
              <div
                key={rowIdx}
                className="grid min-h-[40px] gap-2"
                style={{ gridTemplateColumns: `repeat(${totalCols}, minmax(0, 1fr))` }}
              >
                {row.length === 0 ? (
                  <div className="col-span-full text-center text-xs text-gray-400">Right-click here to add a daily event</div>
                ) : (
                  row.map((evt, i) => (
                    <div
                      key={evt.id}
                      className="px-3 py-1 rounded-full text-xs font-medium cursor-pointer select-none justify-self-center"
                      style={{
                        gridColumn: `${getCenterOutColumn(i)} / span 1`,
                        backgroundColor: `${evt.color}20`,
                        color: evt.color,
                        border: `1px solid ${evt.color}`
                      }}
                      onClick={() => onEventEdit && onEventEdit(evt)}
                      onContextMenu={(e) => {
                        e.stopPropagation();
                        handleContextMenu(e, 'event', evt);
                      }}
                    >
                      {evt.title}
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Events */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-primary-600" />
            Events
          </h3>
          {timedEvents.length > 0 ? (
            <div className="space-y-3">
              {timedEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-4 rounded-lg border-l-4"
                  style={{ 
                    backgroundColor: `${event.color}10`,
                    borderLeftColor: event.color
                  }}
                  onClick={() => onEventEdit && onEventEdit(event)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleContextMenu(e, 'event', event);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <span className="text-sm text-gray-500">
                      {formatTime(new Date(event.startDate))} - {formatTime(new Date(event.endDate))}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No events scheduled</p>
          )}
        </div>

        {/* Tasks */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-primary-600" />
            Tasks
          </h3>
          {dayTasks.length > 0 ? (
            <div className="space-y-3">
              {dayTasks.map((task) => (
                <div
                  key={task.id}
                  className={clsx(
                    'p-4 rounded-lg border border-gray-200',
                    task.completed && 'bg-gray-50'
                  )}
                >
                  <div className="flex items-center space-x-3">
                    {task.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                    <div className="flex-1">
                      <h4 className={clsx(
                        'font-medium',
                        task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                      )}>
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      )}
                    </div>
                    <span className={clsx(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      task.priority === 'high' && 'bg-red-100 text-red-700',
                      task.priority === 'medium' && 'bg-yellow-100 text-yellow-700',
                      task.priority === 'low' && 'bg-green-100 text-green-700'
                    )}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No tasks due</p>
          )}
        </div>
      </div>
    );
  };

  const renderYearView = () => {
    const yearMonths = getYearMonths(currentDate);
    
    return (
      <div className="bg-white shadow-soft rounded-xl overflow-hidden">
        {/* Year grid - 4 rows of 3 months each */}
        <div className="grid grid-rows-4 gap-px bg-gray-200">
          {/* Row 1: Jan, Feb, Mar */}
          <div className="grid grid-cols-3 gap-px bg-gray-200">
            {yearMonths.slice(0, 3).map((month, index) => {
              const monthEvents = getMonthEvents(events, month);
              const monthTasks = getMonthTasks(tasks, month);
              const isCurrentMonthDay = isCurrentMonth(new Date(), month);
              
              return (
                <div
                  key={index}
                  onClick={() => onDateSelect(month)}
                  className={clsx(
                    'bg-white p-3 min-h-[140px] cursor-pointer hover:bg-gray-50 transition-colors duration-200',
                    isCurrentMonthDay && 'bg-primary-50 border-2 border-primary-600'
                  )}
                >
                  {/* Month name */}
                  <div className="text-xs font-medium text-gray-600 mb-2">
                    {formatDate(month, 'MMM')}
                  </div>
                  
                  {/* Mini calendar grid */}
                  <div className="grid grid-cols-7 gap-px text-xs">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, dayIndex) => (
                      <div key={dayIndex} className="text-center text-gray-400 p-1">
                        {day}
                      </div>
                    ))}
                    
                    {getMonthDays(month).map((date, dateIndex) => (
                      <div
                        key={dateIndex}
                        className={clsx(
                          'text-center p-1',
                          isToday(date) && 'bg-primary-600 text-white rounded',
                          !isCurrentMonth(date, month) && 'text-gray-300'
                        )}
                      >
                        {date.getDate()}
                      </div>
                    ))}
                  </div>
                  
                  {/* Event indicators */}
                  {monthEvents.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {monthEvents.slice(0, 3).map((event, eventIndex) => (
                        <div
                          key={eventIndex}
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: event.color }}
                        />
                      ))}
                      {monthEvents.length > 3 && (
                        <span className="text-xs text-gray-500">+{monthEvents.length - 3}</span>
                      )}
                    </div>
                  )}
                  
                  {/* Task indicators */}
                  {monthTasks.length > 0 && (
                    <div className="mt-1 text-xs text-gray-600">
                      {monthTasks.filter(task => !task.completed).length} tasks
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Row 2: Apr, May, Jun */}
          <div className="grid grid-cols-3 gap-px bg-gray-200">
            {yearMonths.slice(3, 6).map((month, index) => {
              const monthEvents = getMonthEvents(events, month);
              const monthTasks = getMonthTasks(tasks, month);
              const isCurrentMonthDay = isCurrentMonth(new Date(), month);
              
              return (
                <div
                  key={index + 3}
                  onClick={() => onDateSelect(month)}
                  className={clsx(
                    'bg-white p-3 min-h-[140px] cursor-pointer hover:bg-gray-50 transition-colors duration-200',
                    isCurrentMonthDay && 'bg-primary-50 border-2 border-primary-600'
                  )}
                >
                  {/* Month name */}
                  <div className="text-xs font-medium text-gray-600 mb-2">
                    {formatDate(month, 'MMM')}
                  </div>
                  
                  {/* Mini calendar grid */}
                  <div className="grid grid-cols-7 gap-px text-xs">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, dayIndex) => (
                      <div key={dayIndex} className="text-center text-gray-400 p-1">
                        {day}
                      </div>
                    ))}
                    
                    {getMonthDays(month).map((date, dateIndex) => (
                      <div
                        key={dateIndex}
                        className={clsx(
                          'text-center p-1',
                          isToday(date) && 'bg-primary-600 text-white rounded',
                          !isCurrentMonth(date, month) && 'text-gray-300'
                        )}
                      >
                        {date.getDate()}
                      </div>
                    ))}
                  </div>
                  
                  {/* Event indicators */}
                  {monthEvents.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {monthEvents.slice(0, 3).map((event, eventIndex) => (
                        <div
                          key={eventIndex}
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: event.color }}
                        />
                      ))}
                      {monthEvents.length > 3 && (
                        <span className="text-xs text-gray-500">+{monthEvents.length - 3}</span>
                      )}
                    </div>
                  )}
                  
                  {/* Task indicators */}
                  {monthTasks.length > 0 && (
                    <div className="mt-1 text-xs text-gray-600">
                      {monthTasks.filter(task => !task.completed).length} tasks
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Row 3: Jul, Aug, Sep */}
          <div className="grid grid-cols-3 gap-px bg-gray-200">
            {yearMonths.slice(6, 9).map((month, index) => {
              const monthEvents = getMonthEvents(events, month);
              const monthTasks = getMonthTasks(tasks, month);
              const isCurrentMonthDay = isCurrentMonth(new Date(), month);
              
              return (
                <div
                  key={index + 6}
                  onClick={() => onDateSelect(month)}
                  className={clsx(
                    'bg-white p-3 min-h-[140px] cursor-pointer hover:bg-gray-50 transition-colors duration-200',
                    isCurrentMonthDay && 'bg-primary-50 border-2 border-primary-600'
                  )}
                >
                  {/* Month name */}
                  <div className="text-xs font-medium text-gray-600 mb-2">
                    {formatDate(month, 'MMM')}
                  </div>
                  
                  {/* Mini calendar grid */}
                  <div className="grid grid-cols-7 gap-px text-xs">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, dayIndex) => (
                      <div key={dayIndex} className="text-center text-gray-400 p-1">
                        {day}
                      </div>
                    ))}
                    
                    {getMonthDays(month).map((date, dateIndex) => (
                      <div
                        key={dateIndex}
                        className={clsx(
                          'text-center p-1',
                          isToday(date) && 'bg-primary-600 text-white rounded',
                          !isCurrentMonth(date, month) && 'text-gray-300'
                        )}
                      >
                        {date.getDate()}
                      </div>
                    ))}
                  </div>
                  
                  {/* Event indicators */}
                  {monthEvents.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {monthEvents.slice(0, 3).map((event, eventIndex) => (
                        <div
                          key={eventIndex}
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: event.color }}
                        />
                      ))}
                      {monthEvents.length > 3 && (
                        <span className="text-xs text-gray-500">+{monthEvents.length - 3}</span>
                      )}
                    </div>
                  )}
                  
                  {/* Task indicators */}
                  {monthTasks.length > 0 && (
                    <div className="mt-1 text-xs text-gray-600">
                      {monthTasks.filter(task => !task.completed).length} tasks
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Row 4: Oct, Nov, Dec */}
          <div className="grid grid-cols-3 gap-px bg-gray-200">
            {yearMonths.slice(9, 12).map((month, index) => {
              const monthEvents = getMonthEvents(events, month);
              const monthTasks = getMonthTasks(tasks, month);
              const isCurrentMonthDay = isCurrentMonth(new Date(), month);
              
              return (
                <div
                  key={index + 9}
                  onClick={() => onDateSelect(month)}
                  className={clsx(
                    'bg-white p-3 min-h-[140px] cursor-pointer hover:bg-gray-50 transition-colors duration-200',
                    isCurrentMonthDay && 'bg-primary-50 border-2 border-primary-600'
                  )}
                >
                  {/* Month name */}
                  <div className="text-xs font-medium text-gray-600 mb-2">
                    {formatDate(month, 'MMM')}
                  </div>
                  
                  {/* Mini calendar grid */}
                  <div className="grid grid-cols-7 gap-px text-xs">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, dayIndex) => (
                      <div key={dayIndex} className="text-center text-gray-400 p-1">
                        {day}
                      </div>
                    ))}
                    
                    {getMonthDays(month).map((date, dateIndex) => (
                      <div
                        key={dateIndex}
                        className={clsx(
                          'text-center p-1',
                          isToday(date) && 'bg-primary-600 text-white rounded',
                          !isCurrentMonth(date, month) && 'text-gray-300'
                        )}
                      >
                        {date.getDate()}
                      </div>
                    ))}
                  </div>
                  
                  {/* Event indicators */}
                  {monthEvents.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {monthEvents.slice(0, 3).map((event, eventIndex) => (
                        <div
                          key={eventIndex}
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: event.color }}
                        />
                      ))}
                      {monthEvents.length > 3 && (
                        <span className="text-xs text-gray-500">+{monthEvents.length - 3}</span>
                      )}
                    </div>
                  )}
                  
                  {/* Task indicators */}
                  {monthTasks.length > 0 && (
                    <div className="mt-1 text-xs text-gray-600">
                      {monthTasks.filter(task => !task.completed).length} tasks
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthDays = getMonthDays(currentDate);
    
    return (
      <div className="bg-white shadow-soft rounded-xl overflow-hidden">
        {/* Month header */}
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="bg-gray-50 p-3 text-center">
              <span className="text-sm font-medium text-gray-600">{day}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="calendar-grid">
          {monthDays.map((date) => renderDayCell(date))}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (view) {
      case 'day':
        return renderDayView();
      case 'week':
        return renderWeekView();
      case 'month':
        return renderMonthView();
      case 'year':
        return renderYearView();
      default:
        return renderMonthView();
    }
  };

  return (
    <>
      {renderContent()}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        x={contextMenu.x}
        y={contextMenu.y}
        items={getContextMenuItems()}
        onClose={closeContextMenu}
      />
    </>
  );
};

export default CalendarGrid; 