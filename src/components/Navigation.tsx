import React, { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { NavigationProps } from '../types';
import { formatDate, navigateDate } from '../utils/dateUtils';

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

  const navRef = useRef<HTMLDivElement>(null);
  
  console.log('Navigation render - theme:', settings.theme, 'isDark:', settings.theme === 'dark');
  
  // Force styles after mount and on theme change
  useEffect(() => {
    if (navRef.current) {
      const element = navRef.current;
      const isDark = settings.theme === 'dark';
      
      // Apply styles directly to the element
      element.style.backgroundColor = isDark ? '#161b22' : '#ffffff';
      element.style.color = isDark ? '#c9d1d9' : '#374151';
      element.style.borderColor = isDark ? '#30363d' : '#d1d5db';
      element.style.borderRadius = '12px';
      element.style.padding = '16px';
      element.style.marginBottom = '24px';
      element.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
      element.style.overflow = 'hidden';
      
      console.log(`FORCED ${isDark ? 'DARK' : 'LIGHT'} STYLES ON NAVIGATION ELEMENT`);
      
      // Also apply styles to all child elements
      const allElements = element.querySelectorAll('*');
      allElements.forEach((el) => {
        if (el instanceof HTMLElement) {
          // Reset any inherited styles that might be causing issues
          el.style.backgroundColor = 'transparent';
          el.style.color = 'inherit';
        }
      });
    }
  }, [settings.theme]);
  
  return (
    <div 
      ref={navRef}
      style={{
        backgroundColor: settings.theme === 'dark' ? '#161b22' : '#ffffff',
        color: settings.theme === 'dark' ? '#c9d1d9' : '#374151',
        borderColor: settings.theme === 'dark' ? '#30363d' : '#d1d5db',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Left side - Navigation controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={handlePrevious}
            style={{
              padding: '8px',
              borderRadius: '8px',
              transition: 'all 0.2s',
              color: settings.theme === 'dark' ? '#c9d1d9' : '#374151',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
            aria-label="Previous"
          >
            <ChevronLeft style={{ width: '20px', height: '20px', color: settings.theme === 'dark' ? '#c9d1d9' : '#374151' }} />
          </button>
          
          <button
            onClick={handleNext}
            style={{
              padding: '8px',
              borderRadius: '8px',
              transition: 'all 0.2s',
              color: settings.theme === 'dark' ? '#c9d1d9' : '#374151',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
            aria-label="Next"
          >
            <ChevronRight style={{ width: '20px', height: '20px', color: settings.theme === 'dark' ? '#c9d1d9' : '#374151' }} />
          </button>
          
          <button
            onClick={handleToday}
            style={{
              fontSize: '14px',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: '500',
              transition: 'all 0.2s',
              backgroundColor: settings.theme === 'dark' ? '#30363d' : '#d1d5db',
              color: settings.theme === 'dark' ? '#c9d1d9' : '#374151',
              border: `1px solid ${settings.theme === 'dark' ? '#30363d' : '#d1d5db'}`,
              cursor: 'pointer'
            }}
          >
            Today
          </button>
          
          <h1 style={{ 
            fontSize: '20px', 
            fontWeight: '600',
            color: settings.theme === 'dark' ? '#c9d1d9' : '#374151',
            margin: 0
          }}>
            {formatDate(currentDate, view === 'month' ? 'MMMM yyyy' : view === 'year' ? 'yyyy' : 'MMM dd, yyyy')}
          </h1>
        </div>

        {/* Right side - View options and add button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* View selector */}
          <div style={{ 
            display: 'flex', 
            borderRadius: '8px', 
            padding: '4px',
            backgroundColor: settings.theme === 'dark' ? '#30363d' : '#d1d5db'
          }}>
            {viewOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onViewChange(option.value as any)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  backgroundColor: view === option.value ? (settings.theme === 'dark' ? '#161b22' : '#ffffff') : 'transparent',
                  color: view === option.value ? '#1f6feb' : (settings.theme === 'dark' ? '#c9d1d9' : '#374151'),
                  boxShadow: view === option.value ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Add event button */}
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            fontWeight: '500',
            transition: 'all 0.2s',
            backgroundColor: '#1f6feb',
            color: 'white',
            border: '1px solid #1f6feb',
            cursor: 'pointer'
          }}>
            <Plus style={{ width: '16px', height: '16px' }} />
            <span>Add Event</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navigation; 