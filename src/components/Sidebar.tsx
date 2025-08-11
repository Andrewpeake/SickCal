import React, { useState } from 'react';
import { Plus, Calendar, CheckSquare, Clock, TrendingUp, Edit, Trash2 } from 'lucide-react';
import { Event, Task } from '../types';
import { formatDate, formatTime } from '../utils/dateUtils';
import { clsx } from 'clsx';
import ContextMenu from './ContextMenu';

interface SidebarProps {
  events: Event[];
  tasks: Task[];
  onAddEvent: () => void;
  onAddTask: () => void;
  onEventOpen: (event: Event) => void;
  onEventEdit: (event: Event) => void;
  onEventDelete: (eventId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  events,
  tasks,
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
      <div className="w-80 bg-white shadow-soft rounded-xl p-6 h-fit">
      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <button
            onClick={onAddEvent}
            className="w-full btn-primary flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
          <button
            onClick={onAddTask}
            className="w-full btn-secondary flex items-center justify-center space-x-2"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Task Summary */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
          Task Progress
        </h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Completion Rate</span>
            <span className="text-lg font-bold text-primary-600">{completionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{completedTasks} completed</span>
            <span>{totalTasks - completedTasks} pending</span>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-primary-600" />
          Upcoming Events
        </h3>
        {upcomingEvents.length > 0 ? (
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                  className="p-3 rounded-lg border-l-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
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
                    <h4 className="font-medium text-gray-900 truncate">{event.title}</h4>
                    <p className="text-sm text-gray-500">
                      {formatDate(new Date(event.startDate), 'MMM dd')} at {formatTime(new Date(event.startDate))}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No upcoming events</p>
        )}
      </div>

      {/* Pending Tasks */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CheckSquare className="w-5 h-5 mr-2 text-primary-600" />
          Pending Tasks
        </h3>
        {pendingTasks.length > 0 ? (
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <div
                key={task.id}
                className="p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{task.title}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-sm text-gray-500">
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
          <p className="text-gray-500 text-center py-4">No pending tasks</p>
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