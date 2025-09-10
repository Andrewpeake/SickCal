import React from 'react';
import { Plus, CheckSquare } from 'lucide-react';
import { Settings } from '../../types';

interface QuickActionsPanelProps {
  settings: Settings;
  onAddEvent?: () => void;
  onAddTask?: () => void;
}

const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  settings,
  onAddEvent = () => {},
  onAddTask = () => {}
}) => {
  return (
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
  );
};

export default QuickActionsPanel;
