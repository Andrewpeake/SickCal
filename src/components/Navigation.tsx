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

  return (
    <div className={`shadow-soft rounded-xl p-4 mb-6 ${
      settings.theme === 'dark' 
        ? 'bg-[#161b22]' 
        : 'bg-white navigation-light'
    }`}>
      <div className="flex items-center justify-between">
        {/* Left side - Navigation controls */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePrevious}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              settings.theme === 'dark' 
                ? 'hover:bg-[#21262d]' 
                : 'hover:bg-gray-100'
            }`}
            aria-label="Previous"
          >
            <ChevronLeft className={`w-5 h-5 ${settings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-600'}`} />
          </button>
          
          <button
            onClick={handleNext}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              settings.theme === 'dark' 
                ? 'hover:bg-[#21262d]' 
                : 'hover:bg-gray-100'
            }`}
            aria-label="Next"
          >
            <ChevronRight className={`w-5 h-5 ${settings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-600'}`} />
          </button>
          
          <button
            onClick={handleToday}
            className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              settings.theme === 'dark'
                ? 'bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border-[#30363d] focus:ring-[#30363d]'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700 focus:ring-gray-500'
            }`}
          >
            Today
          </button>
          
          <h1 className={`text-xl font-semibold ${settings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-900'}`}>
            {formatDate(currentDate, view === 'month' ? 'MMMM yyyy' : view === 'year' ? 'yyyy' : 'MMM dd, yyyy')}
          </h1>
        </div>

        {/* Right side - View options and add button */}
        <div className="flex items-center space-x-3">
          {/* View selector */}
          <div className={`flex rounded-lg p-1 view-selector ${
            settings.theme === 'dark' 
              ? 'bg-[#21262d]' 
              : 'bg-gray-100'
          }`}>
            {viewOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onViewChange(option.value as any)}
                className={clsx(
                  'px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200',
                  view === option.value
                    ? settings.theme === 'dark' 
                        ? 'bg-[#0d1117] text-[#1f6feb] shadow-sm'
                        : 'bg-white text-primary-600 shadow-sm'
                    : settings.theme === 'dark'
                        ? 'text-[#8b949e] hover:text-[#c9d1d9]'
                        : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Add event button */}
          <button className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            settings.theme === 'dark'
              ? 'bg-[#1f6feb] hover:bg-[#388bfd] text-white border-[#1f6feb] focus:ring-[#1f6feb]'
              : 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500'
          }`}>
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navigation; 