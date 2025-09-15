import React, { useState } from 'react';
import { Plus, Calendar, CheckSquare, Clock, TrendingUp, Edit, Trash2 } from 'lucide-react';
import { Event, Task } from '../types';
import { formatDate, formatTime } from '../utils/dateUtils';
import { clsx } from 'clsx';
import ContextMenu from './ContextMenu';
import PomodoroTimer from './PomodoroTimer';

interface SidebarProps {
  events: Event[];
  tasks: Task[];
  settings: any; // Settings type
  onAddEvent: () => void;
  onAddTask: () => void;
  onEventOpen: (event: Event) => void;
  onEventEdit: (event: Event) => void;
  onEventDelete: (eventId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  events,
  tasks,
  settings,
  onAddEvent,
  onAddTask,
  onEventOpen,
  onEventEdit,
  onEventDelete
}) => {
  const [menuState, setMenuState] = useState<{ isOpen: boolean; x: number; y: number; event?: Event }>({
    isOpen: false,
    x: 0,
    y: 0
  });

  const upcomingEvents = events
    .filter(event => new Date(event.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5);

  const pendingTasks = tasks
    .filter(task => !task.completed)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <>
      <div className={`w-full shadow-soft rounded-xl p-4 sm:p-6 h-fit ${
        settings.theme === 'dark' 
          ? 'bg-[#161b22]' 
          : 'bg-white'
      }`}>
      {/* Quick Actions */}
      <div className="mb-6 sm:mb-8">
        <h3 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 ${settings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-900'}`}>Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2 sm:space-y-0 sm:space-y-3 sm:grid-cols-1">
          <button
            onClick={onAddEvent}
            className="w-full btn-primary flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Add Event</span>
            <span className="sm:hidden">Event</span>
          </button>
          <button
            onClick={onAddTask}
            className="w-full btn-secondary flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base"
          >
            <CheckSquare className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Add Task</span>
            <span className="sm:hidden">Task</span>
          </button>
        </div>
      </div>

      {/* Pomodoro Timer */}
      <div className="mb-6 sm:mb-8">
        <PomodoroTimer settings={settings} />
      </div>

      {/* Task Summary */}
      <div className="mb-6 sm:mb-8">
        <h3 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center ${settings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-900'}`}>
          <TrendingUp className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 ${settings.theme === 'dark' ? 'text-[#1f6feb]' : 'text-primary-600'}`} />
          Task Progress
        </h3>
        <div className={`rounded-lg p-4 ${settings.theme === 'dark' ? 'bg-[#0d1117]' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm ${settings.theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-600'}`}>Completion Rate</span>
            <span className={`text-lg font-bold ${settings.theme === 'dark' ? 'text-[#1f6feb]' : 'text-primary-600'}`}>{completionRate}%</span>
          </div>
          <div className={`w-full rounded-full h-2 ${settings.theme === 'dark' ? 'bg-[#30363d]' : 'bg-gray-200'}`}>
            <div
              className={`h-2 rounded-full transition-all duration-300 ${settings.theme === 'dark' ? 'bg-[#1f6feb]' : 'bg-primary-600'}`}
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className={`flex justify-between mt-2 text-xs ${settings.theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-500'}`}>
            <span>{completedTasks} completed</span>
            <span>{totalTasks - completedTasks} pending</span>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="mb-6 sm:mb-8">
        <h3 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center ${settings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-900'}`}>
          <Calendar className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 ${settings.theme === 'dark' ? 'text-[#1f6feb]' : 'text-primary-600'}`} />
          Upcoming Events
        </h3>
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
                  onClick={() => onEventOpen(event)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setMenuState({ isOpen: true, x: e.clientX, y: e.clientY, event });
                  }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium truncate ${settings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-900'}`}>{event.title}</h4>
                    <p className={`text-sm ${settings.theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-500'}`}>
                      {formatDate(new Date(event.startDate), 'MMM dd')} at {formatTime(new Date(event.startDate))}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={`text-center py-4 ${settings.theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-500'}`}>No upcoming events</p>
        )}
      </div>

      {/* Pending Tasks */}
      <div>
        <h3 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center ${settings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-900'}`}>
          <CheckSquare className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 ${settings.theme === 'dark' ? 'text-[#1f6feb]' : 'text-primary-600'}`} />
          Pending Tasks
        </h3>
        {pendingTasks.length > 0 ? (
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <div
                key={task.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors duration-200 ${
                  settings.theme === 'dark' 
                    ? 'border-[#30363d] hover:bg-[#21262d]' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className={`w-4 h-4 border-2 rounded ${
                      settings.theme === 'dark' ? 'border-[#484f58]' : 'border-gray-300'
                    }`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium truncate ${settings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-900'}`}>{task.title}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className={`w-3 h-3 ${settings.theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-400'}`} />
                      <span className={`text-sm ${settings.theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-500'}`}>
                        Due {formatDate(new Date(task.dueDate), 'MMM dd')}
                      </span>
                      <span className={clsx(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        task.priority === 'high' && 'bg-red-100 text-red-700',
                        task.priority === 'medium' && 'bg-yellow-100 text-yellow-700',
                        task.priority === 'low' && 'bg-green-100 text-green-700'
                      )}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={`text-center py-4 ${settings.theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-500'}`}>No pending tasks</p>
        )}
      </div>
    </div>
    {/* Context Menu for Upcoming Events */}
    <ContextMenu
      isOpen={menuState.isOpen}
      x={menuState.x}
      y={menuState.y}
      onClose={() => setMenuState(prev => ({ ...prev, isOpen: false, event: undefined }))}
      items={menuState.event ? [
        {
          id: 'open',
          label: 'Open',
          icon: <Calendar className="w-4 h-4" />,
          onClick: () => onEventOpen(menuState.event as Event)
        },
        {
          id: 'edit',
          label: 'Edit',
          icon: <Edit className="w-4 h-4" />,
          onClick: () => onEventEdit(menuState.event as Event)
        },
        {
          id: 'delete',
          label: 'Delete',
          icon: <Trash2 className="w-4 h-4" />,
          onClick: () => onEventDelete((menuState.event as Event).id)
        }
      ] : []}
    />
  </>
  );
};

export default Sidebar; 