import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Task, Settings } from '../../types';

interface TaskProgressPanelProps {
  tasks: Task[];
  settings: Settings;
  maxItems?: number;
}

const TaskProgressPanel: React.FC<TaskProgressPanelProps> = ({
  tasks,
  settings,
  maxItems = 5
}) => {
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <TrendingUp className={`w-5 h-5 ${settings.theme === 'dark' ? 'text-[#1f6feb]' : 'text-primary-600'}`} />
        <h4 className={`font-semibold ${settings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-900'}`}>
          Task Progress
        </h4>
      </div>
      
      <div className={`rounded-lg p-4 ${settings.theme === 'dark' ? 'bg-[#0d1117]' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm ${settings.theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-600'}`}>
            Completion Rate
          </span>
          <span className={`text-lg font-bold ${settings.theme === 'dark' ? 'text-[#1f6feb]' : 'text-primary-600'}`}>
            {completionRate}%
          </span>
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
  );
};

export default TaskProgressPanel;
