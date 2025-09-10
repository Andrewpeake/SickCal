import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

interface IntuitiveDatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
  label?: string;
  required?: boolean;
}

const IntuitiveDatePicker: React.FC<IntuitiveDatePickerProps> = ({
  value,
  onChange,
  placeholder = "Select date and time",
  className = "",
  theme = 'light',
  label,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value);
  const [selectedTime, setSelectedTime] = useState<string>('17:00'); // Default to 5 PM
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Generate date options for the next 30 days
  const generateDateOptions = () => {
    const options: Array<{ value: Date; label: string; display: string; isToday: boolean }> = [];
    const today = new Date();
    
    // Add today
    options.push({
      value: today,
      label: 'Today',
      display: 'Today',
      isToday: true
    });

    // Add tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    options.push({
      value: tomorrow,
      label: 'Tomorrow',
      display: 'Tomorrow',
      isToday: false
    });

    // Add next 7 days
    for (let i = 2; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      options.push({
        value: date,
        label: date.toLocaleDateString('en-US', { weekday: 'long' }),
        display: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        isToday: false
      });
    }

    // Add next week
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    options.push({
      value: nextWeek,
      label: 'Next Week',
      display: nextWeek.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      isToday: false
    });

    // Add next 2 weeks
    for (let i = 8; i <= 21; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      options.push({
        value: date,
        label: date.toLocaleDateString('en-US', { weekday: 'long' }),
        display: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        isToday: false
      });
    }

    return options;
  };

  // Generate time options
  const generateTimeOptions = () => {
    const times: Array<{ value: string; label: string; display: string }> = [];
    
    // Common business hours and key times
    const commonTimes = [
      '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', 
      '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', 
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', 
      '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
    ];

    commonTimes.forEach(time => {
      const [hours, minutes] = time.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      
      times.push({
        value: time,
        label: date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        display: date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        })
      });
    });

    return times;
  };

  const dateOptions = generateDateOptions();
  const timeOptions = generateTimeOptions();

  useEffect(() => {
    if (value) {
      setSelectedDate(value);
      setSelectedTime(value.toTimeString().slice(0, 5));
    }
  }, [value]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && 
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setButtonRect(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setButtonRect(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    updateDateTime(date, selectedTime);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (selectedDate) {
      updateDateTime(selectedDate, time);
    }
  };

  const updateDateTime = (date: Date, time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const newDateTime = new Date(date);
    newDateTime.setHours(hours, minutes, 0, 0);
    onChange(newDateTime);
  };

  const formatDisplayValue = () => {
    if (!selectedDate) return placeholder;
    
    const timeStr = selectedTime ? ` at ${new Date(`2000-01-01T${selectedTime}`).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })}` : '';
    
    const dateStr = selectedDate.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
    
    return `${dateStr}${timeStr}`;
  };

  const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div className={`relative ${className}`} style={{ zIndex: isOpen ? 10000 : 'auto' }}>
      {label && (
        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-[#c9d1d9]' : 'text-gray-700'}`}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          if (buttonRef.current) {
            setButtonRect(buttonRef.current.getBoundingClientRect());
          }
          setIsOpen(!isOpen);
        }}
        className={clsx(
          'w-full flex items-center justify-between px-3 py-2 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500',
          isDark
            ? 'bg-[#0d1117] border-[#30363d] text-[#c9d1d9] hover:bg-[#161b22]'
            : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50',
          !selectedDate && 'text-gray-500'
        )}
      >
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4" />
          <span>{formatDisplayValue()}</span>
        </div>
        <ChevronDown className={clsx('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && buttonRect && createPortal(
        <div
          ref={dropdownRef}
          className={clsx(
            'fixed border rounded-xl shadow-2xl max-h-80 overflow-hidden backdrop-blur-sm',
            isDark
              ? 'bg-[#0d1117] border-[#30363d]'
              : 'bg-white border-gray-300'
          )}
          style={{
            position: 'fixed',
            top: buttonRect.bottom + 4,
            left: buttonRect.left,
            width: buttonRect.width,
            zIndex: 10001
          }}
          onWheel={(e) => {
            e.stopPropagation();
          }}
          onTouchMove={(e) => {
            e.stopPropagation();
          }}
          onScroll={(e) => {
            e.stopPropagation();
          }}
        >
          <div 
            className="p-4 max-h-80 overflow-y-auto"
            style={{
              overflowY: 'auto',
              overflowX: 'hidden',
              maxHeight: '320px',
              scrollbarWidth: 'thin',
              scrollbarColor: isDark ? '#4B5563 #1F2937' : '#D1D5DB #F3F4F6',
              WebkitOverflowScrolling: 'touch',
              scrollBehavior: 'smooth'
            }}
            onWheel={(e) => {
              e.stopPropagation();
            }}
            onTouchMove={(e) => {
              e.stopPropagation();
            }}
            onScroll={(e) => {
              e.stopPropagation();
            }}
          >
            {/* Quick Options */}
            <div className="mb-4">
              <h4 className={`text-sm font-semibold mb-3 ${isDark ? 'text-[#c9d1d9]' : 'text-gray-700'}`}>
                Quick Select
              </h4>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    setSelectedDate(now);
                    setSelectedTime(now.toTimeString().slice(0, 5));
                    updateDateTime(now, now.toTimeString().slice(0, 5));
                  }}
                  className="px-3 py-2 text-sm font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  Now
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    setSelectedDate(today);
                    setSelectedTime('17:00');
                    updateDateTime(today, '17:00');
                  }}
                  className="px-3 py-2 text-sm font-medium bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300"
                >
                  Today 5PM
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    setSelectedDate(tomorrow);
                    setSelectedTime('17:00');
                    updateDateTime(tomorrow, '17:00');
                  }}
                  className="px-3 py-2 text-sm font-medium bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-300"
                >
                  Tomorrow 5PM
                </button>
              </div>
            </div>

            {/* Date Selection */}
            <div className="mb-4">
              <h4 className={`text-sm font-semibold mb-3 ${isDark ? 'text-[#c9d1d9]' : 'text-gray-700'}`}>
                Date ({dateOptions.length} options)
              </h4>
              <div 
                className="dropdown-scroll border border-gray-200 dark:border-gray-700 rounded-lg"
                style={{
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  maxHeight: '120px',
                  scrollbarWidth: 'thin',
                  scrollbarColor: isDark ? '#4B5563 #1F2937' : '#D1D5DB #F3F4F6',
                  WebkitOverflowScrolling: 'touch'
                }}
                onWheel={(e) => {
                  e.stopPropagation();
                }}
                onTouchMove={(e) => {
                  e.stopPropagation();
                }}
                onScroll={(e) => {
                  e.stopPropagation();
                }}
              >
                {dateOptions.map((option, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      handleDateSelect(option.value);
                      // Keep dropdown open for time selection
                    }}
                    className={clsx(
                      'w-full text-left px-4 py-3 text-sm rounded-none first:rounded-t-lg last:rounded-b-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500',
                      selectedDate && selectedDate.toDateString() === option.value.toDateString()
                        ? isDark
                          ? 'bg-blue-600 bg-opacity-20 text-blue-400 ring-1 ring-blue-500'
                          : 'bg-blue-100 text-blue-700 ring-1 ring-blue-500'
                        : isDark
                          ? 'hover:bg-[#161b22] text-[#c9d1d9]'
                          : 'hover:bg-gray-50 text-gray-900',
                      option.isToday && 'font-semibold'
                    )}
                  >
                    {option.display}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            <div className="mb-4">
              <h4 className={`text-sm font-semibold mb-3 ${isDark ? 'text-[#c9d1d9]' : 'text-gray-700'}`}>
                Time ({timeOptions.length} options) - Scroll to see all
              </h4>
              <div 
                className="time-scroll-container border border-gray-200 dark:border-gray-700 rounded-lg"
                onWheel={(e) => {
                  e.stopPropagation();
                }}
                onTouchMove={(e) => {
                  e.stopPropagation();
                }}
                onScroll={(e) => {
                  e.stopPropagation();
                }}
              >
                {timeOptions.map((option, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      handleTimeSelect(option.value);
                      // Keep dropdown open for further adjustments
                    }}
                    className={clsx(
                      'w-full text-left px-4 py-3 text-sm rounded-none first:rounded-t-lg last:rounded-b-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500',
                      selectedTime === option.value
                        ? isDark
                          ? 'bg-blue-600 bg-opacity-20 text-blue-400 ring-1 ring-blue-500'
                          : 'bg-blue-100 text-blue-700 ring-1 ring-blue-500'
                        : isDark
                          ? 'hover:bg-[#161b22] text-[#c9d1d9]'
                          : 'hover:bg-gray-50 text-gray-900'
                    )}
                  >
                    {option.display}
                  </button>
                ))}
                {/* Scroll indicator */}
                <div className={`text-xs text-center py-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  ↓ Scroll for more options ↓
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-[#30363d] bg-inherit">
              <button
                type="button"
                onClick={() => {
                  onChange(undefined);
                  setSelectedDate(undefined);
                  setSelectedTime('17:00');
                  setIsOpen(false);
                  setButtonRect(null);
                }}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Clear
              </button>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setButtonRect(null);
                  }}
                  className="px-4 py-2 text-sm font-medium bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setButtonRect(null);
                  }}
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default IntuitiveDatePicker;
