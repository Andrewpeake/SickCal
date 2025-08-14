import React from 'react';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { OverdueTask } from '../types/overdue';
import { formatDate } from '../utils/dateUtils';
import clsx from 'clsx';

interface OverdueTasksProps {
  tasks: OverdueTask[];
  settings: any; // Settings type
  onTaskClick?: (task: OverdueTask) => void;
  onTaskComplete?: (taskId: string) => void;
}

const OverdueTasks: React.FC<OverdueTasksProps> = ({
  tasks,
  settings,
  onTaskClick,
  onTaskComplete
}) => {
  const overdueTasks = tasks.filter(task => !task.completed && task.overdueStatus !== 'on-time');
  
  if (overdueTasks.length === 0) {
    return (
      <div className={`border rounded-lg p-4 text-center ${
        settings.theme === 'dark' 
          ? 'bg-green-900/20 border-green-800' 
          : 'bg-green-50 border-green-200'
      }`}>
        <CheckCircle className={`w-8 h-8 mx-auto mb-2 ${
          settings.theme === 'dark' ? 'text-green-400' : 'text-green-500'
        }`} />
        <h3 className={`font-medium ${
          settings.theme === 'dark' ? 'text-green-200' : 'text-green-800'
        }`}>All caught up!</h3>
        <p className={`text-sm ${
          settings.theme === 'dark' ? 'text-green-300' : 'text-green-600'
        }`}>No overdue tasks at the moment.</p>
      </div>
    );
  }

  const getStatusIcon = (status: OverdueTask['overdueStatus']) => {
    switch (status) {
      case 'soft-overdue':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'hard-overdue':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getStatusColor = (status: OverdueTask['overdueStatus']) => {
    const isDark = settings.theme === 'dark';
    switch (status) {
      case 'soft-overdue':
        return isDark 
          ? 'border-yellow-800 bg-yellow-900/20 hover:bg-yellow-900/30'
          : 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100';
      case 'hard-overdue':
        return isDark 
          ? 'border-red-800 bg-red-900/20 hover:bg-red-900/30'
          : 'border-red-200 bg-red-50 hover:bg-red-100';
      default:
        return isDark 
          ? 'border-green-800 bg-green-900/20 hover:bg-green-900/30'
          : 'border-green-200 bg-green-50 hover:bg-green-100';
    }
  };

  const getStatusText = (status: OverdueTask['overdueStatus'], days: number) => {
    switch (status) {
      case 'soft-overdue':
        return `${days} day${days !== 1 ? 's' : ''} past soft deadline`;
      case 'hard-overdue':
        return `${days} day${days !== 1 ? 's' : ''} past hard deadline`;
      default:
        return 'On time';
    }
  };

  const getPriorityColor = (priority: OverdueTask['priority']) => {
    const isDark = settings.theme === 'dark';
    switch (priority) {
      case 'high':
        return isDark 
          ? 'bg-red-900/30 text-red-300'
          : 'bg-red-100 text-red-700';
      case 'medium':
        return isDark 
          ? 'bg-yellow-900/30 text-yellow-300'
          : 'bg-yellow-100 text-yellow-700';
      case 'low':
        return isDark 
          ? 'bg-green-900/30 text-green-300'
          : 'bg-green-100 text-green-700';
      default:
        return isDark 
          ? 'bg-gray-800 text-gray-300'
          : 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold flex items-center ${
          settings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-900'
        }`}>
          <AlertTriangle className={`w-5 h-5 mr-2 ${
            settings.theme === 'dark' ? 'text-red-400' : 'text-red-500'
          }`} />
          Overdue Tasks
        </h3>
        <span className={`px-2 py-1 rounded-full text-sm font-medium ${
          settings.theme === 'dark' 
            ? 'bg-red-900/30 text-red-300' 
            : 'bg-red-100 text-red-700'
        }`}>
          {overdueTasks.length}
        </span>
      </div>

      <div className="space-y-2">
        {overdueTasks.map((task) => (
          <div
            key={task.id}
            className={clsx(
              'border rounded-lg p-4 cursor-pointer transition-all duration-200 transform hover:scale-[1.02]',
              getStatusColor(task.overdueStatus)
            )}
            onClick={() => onTaskClick?.(task)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  {getStatusIcon(task.overdueStatus)}
                  <h4 className={`font-medium truncate ${
                    settings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-900'
                  }`}>{task.title}</h4>
                  <span className={clsx(
                    'px-2 py-0.5 rounded-full text-xs font-medium',
                    getPriorityColor(task.priority)
                  )}>
                    {task.priority}
                  </span>
                </div>
                
                {task.description && (
                  <p className={`text-sm mb-2 line-clamp-2 ${
                    settings.theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-600'
                  }`}>{task.description}</p>
                )}
                
                <div className={`flex items-center space-x-4 text-xs ${
                  settings.theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-500'
                }`}>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Due: {formatDate(task.dueDate, 'MMM dd, yyyy')}</span>
                  </div>
                  
                  {task.category && (
                    <span className={`px-2 py-0.5 rounded ${
                      settings.theme === 'dark' ? 'bg-[#21262d]' : 'bg-gray-100'
                    }`}>
                      {task.category}
                    </span>
                  )}
                </div>
                
                <div className="mt-2">
                  <span className={clsx(
                    'text-xs font-medium',
                    settings.theme === 'dark'
                      ? (task.overdueStatus === 'soft-overdue' ? 'text-yellow-300' : 'text-red-300')
                      : (task.overdueStatus === 'soft-overdue' ? 'text-yellow-700' : 'text-red-700')
                  )}>
                    {getStatusText(task.overdueStatus, task.overdueDays)}
                  </span>
                </div>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTaskComplete?.(task.id);
                }}
                className={`ml-3 p-1 rounded transition-colors duration-200 ${
                  settings.theme === 'dark' ? 'hover:bg-[#21262d]' : 'hover:bg-white'
                }`}
                title="Mark as completed"
              >
                <CheckCircle className="w-5 h-5 text-green-600 hover:text-green-700" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OverdueTasks; 