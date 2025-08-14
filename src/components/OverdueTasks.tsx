import React from 'react';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { OverdueTask } from '../types/overdue';
import { formatDate } from '../utils/dateUtils';
import clsx from 'clsx';

interface OverdueTasksProps {
  tasks: OverdueTask[];
  onTaskClick?: (task: OverdueTask) => void;
  onTaskComplete?: (taskId: string) => void;
}

const OverdueTasks: React.FC<OverdueTasksProps> = ({
  tasks,
  onTaskClick,
  onTaskComplete
}) => {
  const overdueTasks = tasks.filter(task => !task.completed && task.overdueStatus !== 'on-time');
  
  if (overdueTasks.length === 0) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
        <CheckCircle className="w-8 h-8 text-green-500 dark:text-green-400 mx-auto mb-2" />
        <h3 className="text-green-800 dark:text-green-200 font-medium">All caught up!</h3>
        <p className="text-green-600 dark:text-green-300 text-sm">No overdue tasks at the moment.</p>
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
    switch (status) {
      case 'soft-overdue':
        return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30';
      case 'hard-overdue':
        return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30';
      default:
        return 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30';
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
    switch (priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#c9d1d9] flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400 mr-2" />
          Overdue Tasks
        </h3>
        <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded-full text-sm font-medium">
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
                  <h4 className="font-medium text-gray-900 truncate">{task.title}</h4>
                  <span className={clsx(
                    'px-2 py-0.5 rounded-full text-xs font-medium',
                    getPriorityColor(task.priority)
                  )}>
                    {task.priority}
                  </span>
                </div>
                
                {task.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                )}
                
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Due: {formatDate(task.dueDate, 'MMM dd, yyyy')}</span>
                  </div>
                  
                  {task.category && (
                    <span className="bg-gray-100 px-2 py-0.5 rounded">
                      {task.category}
                    </span>
                  )}
                </div>
                
                <div className="mt-2">
                  <span className={clsx(
                    'text-xs font-medium',
                    task.overdueStatus === 'soft-overdue' ? 'text-yellow-700' : 'text-red-700'
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
                className="ml-3 p-1 hover:bg-white rounded transition-colors duration-200"
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