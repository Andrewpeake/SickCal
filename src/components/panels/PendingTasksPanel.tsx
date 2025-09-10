import React from 'react';
import { CheckSquare, Clock } from 'lucide-react';
import { Task, Settings } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { clsx } from 'clsx';

interface PendingTasksPanelProps {
  tasks: Task[];
  settings: Settings;
  maxItems?: number;
  onTaskClick?: (task: Task) => void;
}

const PendingTasksPanel: React.FC<PendingTasksPanelProps> = ({
  tasks,
  settings,
  maxItems = 5,
  onTaskClick = () => {}
}) => {
  const pendingTasks = tasks
    .filter(task => !task.completed)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, maxItems);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <CheckSquare className={`w-5 h-5 ${settings.theme === 'dark' ? 'text-[#1f6feb]' : 'text-primary-600'}`} />
        <h4 className={`font-semibold ${settings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-900'}`}>
          Pending Tasks
        </h4>
      </div>
      
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
              onClick={() => onTaskClick(task)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className={`w-4 h-4 border-2 rounded ${
                    settings.theme === 'dark' ? 'border-[#484f58]' : 'border-gray-300'
                  }`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className={`font-medium truncate ${settings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-900'}`}>
                    {task.title}
                  </h5>
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
        <p className={`text-center py-4 ${settings.theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-500'}`}>
          No pending tasks
        </p>
      )}
    </div>
  );
};

export default PendingTasksPanel;
