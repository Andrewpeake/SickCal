import React, { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import clsx from 'clsx';
import { Event } from '../types';
import { generateId } from '../utils/dateUtils';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Event) => void;
  event?: Event | null;
  selectedDate?: Date;
  onDelete?: (eventId: string) => void;
  settings: any;
}

// Default quick event titles (fallback if not in settings)
const defaultQuickEventTitles = [
  { category: 'School', titles: ['Class', 'Study Session', 'Homework', 'Exam', 'Group Project', 'Office Hours'] },
  { category: 'Work', titles: ['Meeting', 'Standup', 'Client Call', 'Team Sync', 'Review', 'Planning'] },
  { category: 'Social', titles: ['Hangout', 'Dinner', 'Coffee', 'Movie Night', 'Game Night', 'Party'] },
  { category: 'Health', titles: ['Doctor Appointment', 'Dentist', 'Gym', 'Yoga', 'Therapy', 'Checkup'] },
  { category: 'General', titles: ['Appointment', 'Call', 'Reminder', 'Task', 'Event', 'Meeting'] }
];

const subjectOptions = [
  { value: 'work', label: 'Work' },
  { value: 'personal', label: 'Personal' },
  { value: 'health', label: 'Health' },
  { value: 'education', label: 'Education' },
  { value: 'social', label: 'Social' },
  { value: 'other', label: 'Other' }
];

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  event,
  selectedDate,
  onSave,
  onDelete,
  settings
}) => {
  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    description: '',
    startDate: selectedDate || new Date(),
    endDate: selectedDate || new Date(),
    color: '#0ea5e9',
    isAllDay: false,
    isAllWeek: false,
    location: '',
    attendees: [],
    repeat: { type: 'none', interval: 1 }
  });

  const [attendeeInput, setAttendeeInput] = useState('');

  const colorOptions = [
    { name: 'Blue', value: '#0ea5e9' },
    { name: 'Green', value: '#10b981' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Gray', value: '#6b7280' }
  ];

  useEffect(() => {
    if (event) {
      const eventStartDate = new Date(event.startDate);
      const eventEndDate = new Date(event.endDate);
      
      setFormData({
        ...event,
        isAllWeek: event.isAllWeek || false,
        repeat: event.repeat || { type: 'none', interval: 1 },
        startDate: isNaN(eventStartDate.getTime()) ? new Date() : eventStartDate,
        endDate: isNaN(eventEndDate.getTime()) ? new Date() : eventEndDate
      });
    } else if (selectedDate) {
      const startDate = new Date(selectedDate);
      const endDate = new Date(selectedDate);
      
      // Validate selectedDate and provide fallback
      if (isNaN(startDate.getTime())) {
        startDate.setTime(new Date().getTime());
        endDate.setTime(new Date().getTime());
      }
      
      endDate.setHours(endDate.getHours() + 1);
      
      setFormData({
        title: '',
        description: '',
        startDate,
        endDate,
        color: '#0ea5e9',
        isAllDay: false,
        location: '',
        attendees: []
      });
    } else {
      // Fallback when no selectedDate is provided
      const now = new Date();
      const endTime = new Date(now);
      endTime.setHours(endTime.getHours() + 1);
      
      setFormData({
        title: '',
        description: '',
        startDate: now,
        endDate: endTime,
        color: '#0ea5e9',
        isAllDay: false,
        location: '',
        attendees: [],
        repeat: { type: 'none', interval: 1 }
      });
    }
  }, [event, selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.startDate || !formData.endDate) {
      return;
    }

    const eventData: Event = {
      id: event?.id || generateId(),
      title: formData.title!,
      description: formData.description,
      startDate: formData.startDate!,
      endDate: formData.endDate!,
      color: formData.color!,
      isAllDay: formData.isAllDay,
      isAllWeek: formData.isAllWeek,
      location: formData.location,
      attendees: formData.attendees,
      repeat: formData.repeat
    };

    // Generate recurring events if repeat is enabled
    if (formData.repeat && formData.repeat.type !== 'none') {
      const recurringEvents = generateRecurringEvents(eventData);
      recurringEvents.forEach(event => onSave(event));
    } else {
      onSave(eventData);
    }

    onClose();
  };

  const generateRecurringEvents = (baseEvent: Event): Event[] => {
    if (!baseEvent.repeat || baseEvent.repeat.type === 'none') {
      return [baseEvent];
    }

    const events: Event[] = [baseEvent];
    const { repeat } = baseEvent;
    let currentDate = new Date(baseEvent.startDate);
    let currentEndDate = new Date(baseEvent.endDate);
    let occurrenceCount = 1;

    // Calculate duration of the event
    const eventDuration = currentEndDate.getTime() - currentDate.getTime();

    while (occurrenceCount < (repeat.endAfter || 999)) {
      // Check if we've reached the end date
      if (repeat.endDate && currentDate >= repeat.endDate) {
        break;
      }

      // Calculate next occurrence date
      let nextDate: Date;
      switch (repeat.type) {
        case 'daily':
          nextDate = new Date(currentDate);
          nextDate.setDate(currentDate.getDate() + repeat.interval);
          break;
        
        case 'weekly':
          nextDate = new Date(currentDate);
          nextDate.setDate(currentDate.getDate() + (7 * repeat.interval));
          break;
        
        case 'monthly':
          nextDate = new Date(currentDate);
          nextDate.setMonth(currentDate.getMonth() + repeat.interval);
          if (repeat.dayOfMonth) {
            nextDate.setDate(repeat.dayOfMonth);
          }
          break;
        
        case 'yearly':
          nextDate = new Date(currentDate);
          nextDate.setFullYear(currentDate.getFullYear() + repeat.interval);
          break;
        
        default:
          return events;
      }

      // Create next occurrence
      const nextEvent: Event = {
        ...baseEvent,
        id: generateId(),
        startDate: new Date(nextDate),
        endDate: new Date(nextDate.getTime() + eventDuration)
      };

      events.push(nextEvent);
      currentDate = nextDate;
      currentEndDate = nextEvent.endDate;
      occurrenceCount++;
    }

    return events;
  };

  const handleAddAttendee = () => {
    if (attendeeInput.trim() && !formData.attendees?.includes(attendeeInput.trim())) {
      setFormData(prev => ({
        ...prev,
        attendees: [...(prev.attendees || []), attendeeInput.trim()]
      }));
      setAttendeeInput('');
    }
  };

  const handleRemoveAttendee = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees?.filter((_, i) => i !== index)
    }));
  };

  const formatDateTime = (date: Date) => {
    // Check if the date is valid
    if (!date || isNaN(date.getTime())) {
      return '';
    }
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const newDate = new Date(value);
    // Only update if the date is valid
    if (!isNaN(newDate.getTime())) {
      setFormData(prev => ({ ...prev, [field]: newDate }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-4xl w-full mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-semibold ${settings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-900'}`}>
            {event ? 'Edit Event' : 'New Event'}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              settings.theme === 'dark' 
                ? 'hover:bg-[#21262d] text-[#8b949e]' 
                : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${settings.theme === 'dark' ? 'dark-theme-text' : 'text-gray-700'}`}>
                  Event Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className={`input-field ${settings.theme === 'dark' ? 'dark-theme-input' : ''}`}
                  placeholder="Enter event title"
                  required
                />
                
                {/* Quick Title Selection */}
                <div className="mt-3">
                  <label className={`block text-xs font-medium mb-2 ${settings.theme === 'dark' ? 'dark-theme-text-secondary' : 'text-gray-600'}`}>
                    Quick Title Selection
                  </label>
                  
                  {/* Main Categories */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {settings.quickEventTitles && settings.quickEventTitles.length > 0 ? (
                      settings.quickEventTitles.map((category: any) => (
                        <button
                          key={category.category}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, title: category.category }))}
                          className={`px-3 py-1 text-xs rounded border transition-colors duration-200 ${
                            formData.title === category.category
                              ? 'bg-primary-600 text-white border-primary-600'
                              : settings.theme === 'dark'
                                ? 'dark-theme-button'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {category.category}
                        </button>
                      ))
                    ) : (
                      defaultQuickEventTitles.map((category) => (
                        <button
                          key={category.category}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, title: category.category }))}
                          className={`px-3 py-1 text-xs rounded border transition-colors duration-200 ${
                            formData.title === category.category
                              ? 'bg-primary-600 text-white border-primary-600'
                              : settings.theme === 'dark'
                                ? 'dark-theme-button'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {category.category}
                        </button>
                      ))
                    )}
                  </div>
                  
                  {/* Specific Titles - Show when a category is selected */}
                  {formData.title && (settings.quickEventTitles || defaultQuickEventTitles).find((cat: any) => cat.category === formData.title) && (
                    <div className="mt-2 p-2 rounded-lg border border-gray-200 bg-gray-50">
                      <div className={`text-xs font-medium mb-2 ${settings.theme === 'dark' ? 'dark-theme-text-secondary' : 'text-gray-600'}`}>
                        {formData.title} Events:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(settings.quickEventTitles || defaultQuickEventTitles).find((cat: any) => cat.category === formData.title)?.titles.map((title: string) => (
                          <button
                            key={title}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, title }))}
                            className={`px-2 py-1 text-xs rounded border transition-colors duration-200 ${
                              formData.title === title
                                ? 'bg-primary-600 text-white border-primary-600'
                                : settings.theme === 'dark'
                                  ? 'dark-theme-button'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {title}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Subject/Category */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${settings.theme === 'dark' ? 'dark-theme-text' : 'text-gray-700'}`}>
                  Subject/Category
                </label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className={`input-field ${settings.theme === 'dark' ? 'dark-theme-input' : ''}`}
                >
                  <option value="">Select a category</option>
                  {subjectOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Event Type Options */}
              <div className="space-y-3">
                <label className={`block text-sm font-medium ${settings.theme === 'dark' ? 'dark-theme-text' : 'text-gray-700'}`}>
                  Event Type
                </label>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      isAllDay: false,
                      isAllWeek: false 
                    }))}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors duration-200 ${
                      !formData.isAllDay && !formData.isAllWeek
                        ? 'bg-primary-600 text-white border-primary-600'
                        : settings.theme === 'dark'
                          ? 'dark-theme-button'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Timed Event
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      isAllDay: true,
                      isAllWeek: false 
                    }))}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors duration-200 ${
                      formData.isAllDay && !formData.isAllWeek
                        ? 'bg-primary-600 text-white border-primary-600'
                        : settings.theme === 'dark'
                          ? 'dark-theme-button'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    All Day
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      isAllDay: false,
                      isAllWeek: true 
                    }))}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors duration-200 ${
                      formData.isAllWeek
                        ? 'bg-primary-600 text-white border-primary-600'
                        : settings.theme === 'dark'
                          ? 'dark-theme-button'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    All Week
                  </button>
                </div>
              </div>

              {/* Repeat Options */}
              <div className="space-y-3">
                <label className={`block text-sm font-medium ${settings.theme === 'dark' ? 'dark-theme-text' : 'text-gray-700'}`}>
                  Repeat
                </label>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      repeat: { type: 'none', interval: 1 }
                    }))}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors duration-200 ${
                      formData.repeat?.type === 'none'
                        ? 'bg-primary-600 text-white border-primary-600'
                        : settings.theme === 'dark'
                          ? 'dark-theme-button'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Never
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      repeat: { type: 'daily', interval: 1 }
                    }))}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors duration-200 ${
                      formData.repeat?.type === 'daily'
                        ? 'bg-primary-600 text-white border-primary-600'
                        : settings.theme === 'dark'
                          ? 'dark-theme-button'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Daily
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      repeat: { type: 'weekly', interval: 1 }
                    }))}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors duration-200 ${
                      formData.repeat?.type === 'weekly'
                        ? 'bg-primary-600 text-white border-primary-600'
                        : settings.theme === 'dark'
                          ? 'dark-theme-button'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Weekly
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      repeat: { type: 'monthly', interval: 1 }
                    }))}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors duration-200 ${
                      formData.repeat?.type === 'monthly'
                        ? 'bg-primary-600 text-white border-primary-600'
                        : settings.theme === 'dark'
                          ? 'dark-theme-button'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      repeat: { type: 'yearly', interval: 1 }
                    }))}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors duration-200 ${
                      formData.repeat?.type === 'yearly'
                        ? 'bg-primary-600 text-white border-primary-600'
                        : settings.theme === 'dark'
                          ? 'dark-theme-button'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Yearly
                  </button>
                </div>
              </div>

              {/* Repeat Configuration */}
              {formData.repeat && formData.repeat.type !== 'none' && (
                <div className={`p-3 rounded-lg space-y-3 ${settings.theme === 'dark' ? 'dark-theme-bg-secondary' : 'bg-gray-50'}`}>
                  {/* Interval */}
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${settings.theme === 'dark' ? 'dark-theme-text-secondary' : 'text-gray-600'}`}>
                      Every
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={formData.repeat.interval}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          repeat: prev.repeat ? { ...prev.repeat, interval: parseInt(e.target.value) || 1 } : prev.repeat
                        }))}
                        className={`input-field w-16 text-center ${settings.theme === 'dark' ? 'dark-theme-input' : ''}`}
                      />
                      <span className={`text-sm ${settings.theme === 'dark' ? 'dark-theme-text-secondary' : 'text-gray-600'}`}>
                        {formData.repeat.type === 'daily' && 'day(s)'}
                        {formData.repeat.type === 'weekly' && 'week(s)'}
                        {formData.repeat.type === 'monthly' && 'month(s)'}
                        {formData.repeat.type === 'yearly' && 'year(s)'}
                      </span>
                    </div>
                  </div>

                  {/* Weekly: Days of Week */}
                  {formData.repeat.type === 'weekly' && (
                    <div>
                      <label className={`block text-xs font-medium mb-2 ${settings.theme === 'dark' ? 'dark-theme-text-secondary' : 'text-gray-600'}`}>
                        Repeat on
                      </label>
                      <div className="flex space-x-1">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              const currentDays = formData.repeat?.daysOfWeek || [];
                              const newDays = currentDays.includes(index)
                                ? currentDays.filter(d => d !== index)
                                : [...currentDays, index];
                              setFormData(prev => ({
                                ...prev,
                                repeat: prev.repeat ? { ...prev.repeat, daysOfWeek: newDays } : prev.repeat
                              }));
                            }}
                            className={`px-2 py-1 text-xs rounded border transition-colors duration-200 ${
                              formData.repeat?.daysOfWeek?.includes(index)
                                ? 'bg-primary-600 text-white border-primary-600'
                                : settings.theme === 'dark'
                                  ? 'dark-theme-button'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Monthly: Day of Month */}
                  {formData.repeat.type === 'monthly' && (
                    <div>
                      <label className={`block text-xs font-medium mb-2 ${settings.theme === 'dark' ? 'dark-theme-text-secondary' : 'text-gray-600'}`}>
                        Day of month
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={formData.repeat.dayOfMonth || formData.startDate?.getDate() || 1}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          repeat: prev.repeat ? { ...prev.repeat, dayOfMonth: parseInt(e.target.value) || 1 } : prev.repeat
                        }))}
                        className={`input-field w-20 ${settings.theme === 'dark' ? 'dark-theme-input' : ''}`}
                      />
                    </div>
                  )}

                  {/* End Conditions */}
                  <div>
                    <label className={`block text-xs font-medium mb-2 ${settings.theme === 'dark' ? 'dark-theme-text-secondary' : 'text-gray-600'}`}>
                      End after
                    </label>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          repeat: prev.repeat ? { ...prev.repeat, endAfter: 10, endDate: undefined } : prev.repeat
                        }))}
                        className={`px-3 py-1 text-xs rounded border transition-colors duration-200 ${
                          formData.repeat?.endAfter && !formData.repeat?.endDate
                            ? 'bg-primary-600 text-white border-primary-600'
                            : settings.theme === 'dark'
                              ? 'dark-theme-button'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Occurrences
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          repeat: prev.repeat ? { ...prev.repeat, endDate: new Date(), endAfter: undefined } : prev.repeat
                        }))}
                        className={`px-3 py-1 text-xs rounded border transition-colors duration-200 ${
                          formData.repeat?.endDate && !formData.repeat?.endAfter
                            ? 'bg-primary-600 text-white border-primary-600'
                            : settings.theme === 'dark'
                              ? 'dark-theme-button'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Until date
                      </button>
                    </div>

                    {/* Occurrences Input */}
                    {formData.repeat?.endAfter && (
                      <div className="mt-2">
                        <input
                          type="number"
                          min="1"
                          max="999"
                          value={formData.repeat.endAfter}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            repeat: prev.repeat ? { ...prev.repeat, endAfter: parseInt(e.target.value) || 1 } : prev.repeat
                          }))}
                          className={`input-field w-20 ${settings.theme === 'dark' ? 'dark-theme-input' : ''}`}
                          placeholder="10"
                        />
                        <span className={`text-xs ml-2 ${settings.theme === 'dark' ? 'dark-theme-text-secondary' : 'text-gray-500'}`}>occurrences</span>
                      </div>
                    )}

                    {/* End Date Input */}
                    {formData.repeat?.endDate && (
                      <div className="mt-2">
                        <input
                          type="date"
                          value={formData.repeat.endDate ? formatDateTime(formData.repeat.endDate).split('T')[0] : ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            repeat: prev.repeat ? { ...prev.repeat, endDate: new Date(e.target.value) } : prev.repeat
                          }))}
                          className={`input-field w-40 ${settings.theme === 'dark' ? 'dark-theme-input' : ''}`}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Description and Location */}
            <div className="space-y-6">
              {/* Description */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${settings.theme === 'dark' ? 'dark-theme-text' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className={`input-field resize-none ${settings.theme === 'dark' ? 'dark-theme-input' : ''}`}
                  rows={4}
                  placeholder="Enter event description"
                />
              </div>

              {/* Location */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${settings.theme === 'dark' ? 'dark-theme-text' : 'text-gray-700'}`}>
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className={`input-field ${settings.theme === 'dark' ? 'dark-theme-input' : ''}`}
                  placeholder="Enter location"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Date and Time Section */}
              <div className={`p-4 rounded-lg ${settings.theme === 'dark' ? 'dark-theme-bg-secondary' : 'bg-gray-50'}`}>
                <h3 className={`text-sm font-medium mb-4 flex items-center ${settings.theme === 'dark' ? 'dark-theme-text' : 'text-gray-700'}`}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Date & Time
                </h3>
                
                {/* Quick Date Selection */}
                <div className="mb-4">
                  <label className={`block text-xs font-medium mb-2 ${settings.theme === 'dark' ? 'dark-theme-text-secondary' : 'text-gray-600'}`}>
                    Quick Date
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        const endTime = new Date(now);
                        endTime.setHours(endTime.getHours() + 1);
                        setFormData(prev => ({ ...prev, startDate: now, endDate: endTime }));
                      }}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      Now
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const today = new Date();
                        today.setHours(9, 0, 0, 0);
                        const endTime = new Date(today);
                        endTime.setHours(10, 0, 0, 0);
                        setFormData(prev => ({ ...prev, startDate: today, endDate: endTime }));
                      }}
                      className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      Today 9AM
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        tomorrow.setHours(9, 0, 0, 0);
                        const endTime = new Date(tomorrow);
                        endTime.setHours(10, 0, 0, 0);
                        setFormData(prev => ({ ...prev, startDate: tomorrow, endDate: endTime }));
                      }}
                      className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                    >
                      Tomorrow 9AM
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const nextWeek = new Date();
                        nextWeek.setDate(nextWeek.getDate() + 7);
                        nextWeek.setHours(9, 0, 0, 0);
                        const endTime = new Date(nextWeek);
                        endTime.setHours(10, 0, 0, 0);
                        setFormData(prev => ({ ...prev, startDate: nextWeek, endDate: endTime }));
                      }}
                      className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                    >
                      Next Week
                    </button>
                  </div>
                </div>

                {/* Start Date/Time */}
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${settings.theme === 'dark' ? 'dark-theme-text' : 'text-gray-700'}`}>
                    Start Date & Time *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      value={formData.startDate ? formatDateTime(formData.startDate).split('T')[0] : ''}
                      onChange={(e) => {
                        const currentTime = formData.startDate ? formatDateTime(formData.startDate).split('T')[1] : '00:00';
                        handleDateChange('startDate', `${e.target.value}T${currentTime}`);
                      }}
                      className={`input-field flex-1 ${settings.theme === 'dark' ? 'dark-theme-input' : ''}`}
                      required
                    />
                    {!formData.isAllDay && (
                      <input
                        type="time"
                        value={formData.startDate ? formatDateTime(formData.startDate).split('T')[1] : '00:00'}
                        onChange={(e) => {
                          const currentDate = formData.startDate ? formatDateTime(formData.startDate).split('T')[0] : '';
                          handleDateChange('startDate', `${currentDate}T${e.target.value}`);
                        }}
                        className={`input-field w-32 ${settings.theme === 'dark' ? 'dark-theme-input' : ''}`}
                        required
                      />
                    )}
                  </div>
                </div>

                {/* End Date/Time */}
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${settings.theme === 'dark' ? 'dark-theme-text' : 'text-gray-700'}`}>
                    End Date & Time *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      value={formData.endDate ? formatDateTime(formData.endDate).split('T')[0] : ''}
                      onChange={(e) => {
                        const currentTime = formData.endDate ? formatDateTime(formData.endDate).split('T')[1] : '00:00';
                        handleDateChange('endDate', `${e.target.value}T${currentTime}`);
                      }}
                      className={`input-field flex-1 ${settings.theme === 'dark' ? 'dark-theme-input' : ''}`}
                      required
                    />
                    {!formData.isAllDay && (
                      <input
                        type="time"
                        value={formData.endDate ? formatDateTime(formData.endDate).split('T')[1] : '00:00'}
                        onChange={(e) => {
                          const currentDate = formData.endDate ? formatDateTime(formData.endDate).split('T')[0] : '';
                          handleDateChange('endDate', `${currentDate}T${e.target.value}`);
                        }}
                        className={`input-field w-32 ${settings.theme === 'dark' ? 'dark-theme-input' : ''}`}
                        required
                      />
                    )}
                  </div>
                </div>

                {/* Quick Duration */}
                {!formData.isAllDay && (
                  <div>
                    <label className={`block text-xs font-medium mb-2 ${settings.theme === 'dark' ? 'dark-theme-text-secondary' : 'text-gray-600'}`}>
                      Quick Duration
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const endTime = new Date(formData.startDate || new Date());
                          endTime.setHours(endTime.getHours() + 1);
                          setFormData(prev => ({ ...prev, endDate: endTime }));
                        }}
                        className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        1 Hour
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const endTime = new Date(formData.startDate || new Date());
                          endTime.setHours(endTime.getHours() + 2);
                          setFormData(prev => ({ ...prev, endDate: endTime }));
                        }}
                        className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        2 Hours
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const endTime = new Date(formData.startDate || new Date());
                          endTime.setHours(endTime.getHours() + 4);
                          setFormData(prev => ({ ...prev, endDate: endTime }));
                        }}
                        className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        4 Hours
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const endTime = new Date(formData.startDate || new Date());
                          endTime.setHours(endTime.getHours() + 8);
                          setFormData(prev => ({ ...prev, endDate: endTime }));
                        }}
                        className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Full Day
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Color */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${settings.theme === 'dark' ? 'dark-theme-text' : 'text-gray-700'}`}>
                  Color
                </label>
                <div className="flex space-x-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                      className={clsx(
                        'w-8 h-8 rounded-full border-2 transition-all duration-200',
                        formData.color === color.value ? 'border-gray-400 scale-110' : 'border-gray-200 hover:border-gray-300'
                      )}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Attendees */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${settings.theme === 'dark' ? 'dark-theme-text' : 'text-gray-700'}`}>
                  Attendees
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="email"
                    value={attendeeInput}
                    onChange={(e) => setAttendeeInput(e.target.value)}
                    className={`input-field flex-1 ${settings.theme === 'dark' ? 'dark-theme-input' : ''}`}
                    placeholder="Enter email address"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAttendee())}
                  />
                  <button
                    type="button"
                    onClick={handleAddAttendee}
                    className="btn-secondary"
                  >
                    Add
                  </button>
                </div>
                {formData.attendees && formData.attendees.length > 0 && (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {formData.attendees.map((attendee, index) => (
                      <div key={index} className={`flex items-center justify-between px-3 py-2 rounded-lg ${settings.theme === 'dark' ? 'dark-theme-bg-secondary' : 'bg-gray-50'}`}>
                        <span className={`text-sm ${settings.theme === 'dark' ? 'dark-theme-text' : 'text-gray-700'}`}>{attendee}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttendee(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`flex items-center justify-between pt-4 border-t ${settings.theme === 'dark' ? 'dark-theme-border' : 'border-gray-200'}`}>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="btn-primary"
              >
                {event ? 'Update Event' : 'Create Event'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
            {event && onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(event.id);
                  onClose();
                }}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Delete Event
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal; 