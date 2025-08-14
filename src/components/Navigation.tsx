import React from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { NavigationProps } from '../types';
import { formatDate, navigateDate } from '../utils/dateUtils';
import clsx from 'clsx';

const Navigation: React.FC<NavigationProps> = ({
  currentDate,
  onDateChange,
  onViewChange,
  view,
  settings
}) => {
  const viewOptions: { value: string; label: string }[] = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' }
  ];

  const handlePrevious = () => {
    const newDate = navigateDate(currentDate, 'prev', view as any);
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = navigateDate(currentDate, 'next', view as any);
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  console.log('Navigation render - theme:', settings.theme, 'isDark:', settings.theme === 'dark');
  
  return (
    <div 
      className="shadow-soft rounded-xl p-4 mb-6"
      style={{
        backgroundColor: 'var(--nav-bg)',
        color: 'var(--nav-text)',
        borderColor: 'var(--nav-border)'
      }}
    >
      <div className="flex items-center justify-between">
        {/* Left side - Navigation controls */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePrevious}
            className="p-2 rounded-lg transition-colors duration-200 hover:bg-opacity-20"
            style={{
              color: 'var(--nav-text)',
              backgroundColor: 'transparent'
            }}
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" style={{ color: 'var(--nav-text)' }} />
          </button>
          
          <button
            onClick={handleNext}
            className="p-2 rounded-lg transition-colors duration-200 hover:bg-opacity-20"
            style={{
              color: 'var(--nav-text)',
              backgroundColor: 'transparent'
            }}
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" style={{ color: 'var(--nav-text)' }} />
          </button>
          
          <button
            onClick={handleToday}
            className="text-sm px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              backgroundColor: 'var(--nav-border)',
              color: 'var(--nav-text)',
              border: '1px solid var(--nav-border)'
            }}
          >
            Today
          </button>
          
          <h1 className="text-xl font-semibold" style={{ color: 'var(--nav-text)' }}>
            {formatDate(currentDate, view === 'month' ? 'MMMM yyyy' : view === 'year' ? 'yyyy' : 'MMM dd, yyyy')}
          </h1>
        </div>

        {/* Right side - View options and add button */}
        <div className="flex items-center space-x-3">
          {/* View selector */}
          <div className="flex rounded-lg p-1" style={{ backgroundColor: 'var(--nav-border)' }}>
            {viewOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onViewChange(option.value as any)}
                className="px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
                style={{
                  backgroundColor: view === option.value ? 'var(--nav-bg)' : 'transparent',
                  color: view === option.value ? '#1f6feb' : 'var(--nav-text)',
                  boxShadow: view === option.value ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'
                }}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Add event button */}
          <button className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              backgroundColor: '#1f6feb',
              color: 'white',
              border: '1px solid #1f6feb'
            }}>
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navigation; 