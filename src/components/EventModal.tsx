import React, { useState, useEffect } from 'react';
import { EventModalProps, Event } from '../types';
import { X, Calendar, Clock } from 'lucide-react';
import { generateId } from '../utils/dateUtils';
import clsx from 'clsx';

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  event,
  selectedDate,
  onSave,
  onDelete
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
    attendees: []
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

  const subjectOptions = [
    { value: 'meeting', label: 'Meeting' },
    { value: 'appointment', label: 'Appointment' },
    { value: 'deadline', label: 'Deadline' },
    { value: 'reminder', label: 'Reminder' },
    { value: 'social', label: 'Social Event' },
    { value: 'work', label: 'Work' },
    { value: 'personal', label: 'Personal' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    if (event) {
      const eventStartDate = new Date(event.startDate);
      const eventEndDate = new Date(event.endDate);
      
      setFormData({
        ...event,
        isAllWeek: event.isAllWeek || false,
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
        attendees: []
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
      attendees: formData.attendees
    };

    onSave(eventData);
    onClose();
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
          <h2 className="text-xl font-semibold text-gray-900">
            {event ? 'Edit Event' : 'New Event'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="input-field"
                  placeholder="Enter event title"
                  required
                />
              </div>

              {/* Subject/Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject/Category
                </label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="input-field"
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
                <label className="block text-sm font-medium text-gray-700">
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
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    All Day
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const startDate = new Date(formData.startDate || new Date());
                      const endDate = new Date(startDate);
                      endDate.setDate(endDate.getDate() + 6); // End of week (7 days)
                      endDate.setHours(23, 59, 59, 999);
                      
                      setFormData(prev => ({ 
                        ...prev, 
                        isAllDay: true,
                        isAllWeek: true,
                        startDate,
                        endDate
                      }));
                    }}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors duration-200 ${
                      formData.isAllWeek
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    All Week
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field resize-none"
                  rows={4}
                  placeholder="Enter event description"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="input-field"
                  placeholder="Enter location"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Date and Time Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Date & Time
                </h3>
                
                {/* Start Date/Time */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="input-field flex-1"
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
                        className="input-field w-32"
                        required
                      />
                    )}
                  </div>
                </div>

                {/* End Date/Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="input-field flex-1"
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
                        className="input-field w-32"
                        required
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attendees
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="email"
                    value={attendeeInput}
                    onChange={(e) => setAttendeeInput(e.target.value)}
                    className="input-field flex-1"
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
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                        <span className="text-sm text-gray-700">{attendee}</span>
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
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
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