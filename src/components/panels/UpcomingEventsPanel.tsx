import React from 'react';
import { Calendar } from 'lucide-react';
import { Event, Settings } from '../../types';
import { formatDate, formatTime } from '../../utils/dateUtils';

interface UpcomingEventsPanelProps {
  events: Event[];
  settings: Settings;
  maxItems?: number;
  onEventClick?: (event: Event) => void;
}

const UpcomingEventsPanel: React.FC<UpcomingEventsPanelProps> = ({
  events,
  settings,
  maxItems = 5,
  onEventClick = () => {}
}) => {
  const upcomingEvents = events
    .filter(event => new Date(event.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, maxItems);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Calendar className={`w-5 h-5 ${settings.theme === 'dark' ? 'text-[#1f6feb]' : 'text-primary-600'}`} />
        <h4 className={`font-semibold ${settings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-900'}`}>
          Upcoming Events
        </h4>
      </div>
      
      {upcomingEvents.length > 0 ? (
        <div className="space-y-3">
          {upcomingEvents.map((event) => (
            <div
              key={event.id}
              className={`p-3 rounded-lg border-l-4 cursor-pointer transition-colors duration-200 ${
                settings.theme === 'dark' ? 'hover:bg-[#21262d]' : 'hover:bg-gray-50'
              }`}
              style={{ 
                backgroundColor: `${event.color}10`,
                borderLeftColor: event.color
              }}
              onClick={() => onEventClick(event)}
            >
              <h5 className={`font-medium truncate ${settings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-900'}`}>
                {event.title}
              </h5>
              <p className={`text-sm ${settings.theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-500'}`}>
                {formatDate(new Date(event.startDate), 'MMM dd')} at {formatTime(new Date(event.startDate))}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className={`text-center py-4 ${settings.theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-500'}`}>
          No upcoming events
        </p>
      )}
    </div>
  );
};

export default UpcomingEventsPanel;
