import React, { useState, useEffect } from 'react';
import { TaskModalProps, Task } from '../types';
import { X, Flag } from 'lucide-react';
import { generateId } from '../utils/dateUtils';
import clsx from 'clsx';

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  task,
  selectedDate,
  onSave,
  onDelete,
  settings
}) => {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    dueDate: selectedDate || new Date(),
    softDeadline: undefined,
    startTime: undefined,
    endTime: undefined,
    completed: false,
    priority: 'medium',
    category: ''
  });

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-700' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-700' }
  ];

  const categoryOptions = [
    'Work', 'Personal', 'Health', 'Finance', 'Shopping', 'Travel', 'Other'
  ];

  useEffect(() => {
    if (task) {
      setFormData({
        ...task,
        dueDate: new Date(task.dueDate)
      });
    } else if (selectedDate) {
      // If selectedDate has a specific time (from week view), set it as due date
      setFormData({
        title: '',
        description: '',
        dueDate: new Date(selectedDate),
        softDeadline: undefined,
        startTime: undefined,
        endTime: undefined,
        completed: false,
        priority: 'medium',
        category: ''
      });
    }
  }, [task, selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.dueDate) {
      return;
    }

    const taskData: Task = {
      id: task?.id || generateId(),
      title: formData.title!,
      description: formData.description,
      dueDate: formData.dueDate!,
      softDeadline: formData.softDeadline,
      startTime: formData.startTime,
      endTime: formData.endTime,
      completed: formData.completed || false,
      priority: formData.priority!,
      category: formData.category
    };

    onSave(taskData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h2 className={`text-lg sm:text-xl font-semibold ${settings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-900'}`}>
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              settings.theme === 'dark' 
                ? 'hover:bg-[#21262d] text-[#8b949e]' 
                : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Title */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${settings.theme === 'dark' ? 'dark-theme-text' : 'text-gray-700'}`}>
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={`input-field ${settings.theme === 'dark' ? 'dark-theme-input' : ''}`}
              placeholder="Enter task title"
              required
            />
          </div>


          {/* Due Date */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${settings.theme === 'dark' ? 'dark-theme-text' : 'text-gray-700'}`}>
              Due Date *
            </label>
            
            {/* Quick Due Date Selection */}
            <div className="mb-2">
              <div className="flex flex-wrap gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    setFormData(prev => ({ ...prev, dueDate: now }));
                  }}
                  className="px-2 sm:px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Now
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    today.setHours(17, 0, 0, 0); // 5 PM
                    setFormData(prev => ({ ...prev, dueDate: today }));
                  }}
                  className="px-2 sm:px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                >
                  Today 5PM
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    tomorrow.setHours(17, 0, 0, 0); // 5 PM
                    setFormData(prev => ({ ...prev, dueDate: tomorrow }));
                  }}
                  className="px-2 sm:px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                >
                  Tomorrow 5PM
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const nextWeek = new Date();
                    nextWeek.setDate(nextWeek.getDate() + 7);
                    nextWeek.setHours(17, 0, 0, 0); // 5 PM
                    setFormData(prev => ({ ...prev, dueDate: nextWeek }));
                  }}
                  className="px-2 sm:px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Next Week
                </button>
              </div>
            </div>
            
            <input
              type="datetime-local"
              value={formData.dueDate ? new Date(formData.dueDate.getTime() - formData.dueDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: new Date(e.target.value) }))}
              className={`input-field ${settings.theme === 'dark' ? 'dark-theme-input' : ''}`}
              required
            />
          </div>


          {/* Soft Deadline */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${settings.theme === 'dark' ? 'dark-theme-text' : 'text-gray-700'}`}>
              Soft Deadline (Optional)
            </label>
            <input
              type="datetime-local"
              value={formData.softDeadline ? new Date(formData.softDeadline.getTime() - formData.softDeadline.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
              onChange={(e) => setFormData(prev => ({ ...prev, softDeadline: new Date(e.target.value) }))}
              className={`input-field ${settings.theme === 'dark' ? 'dark-theme-input' : ''}`}
              placeholder="Optional warning deadline"
            />
            <p className={`text-xs mt-0.5 ${settings.theme === 'dark' ? 'dark-theme-text-secondary' : 'text-gray-500'}`}>
              Get an early warning before the hard deadline
            </p>
          </div>

          {/* Optional Start Time */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${settings.theme === 'dark' ? 'dark-theme-text' : 'text-gray-700'}`}>
              Start Time (Optional)
            </label>
            <input
              type="datetime-local"
              value={formData.startTime ? new Date(formData.startTime.getTime() - formData.startTime.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
              onChange={(e) => setFormData(prev => ({ ...prev, startTime: new Date(e.target.value) }))}
              className={`input-field ${settings.theme === 'dark' ? 'dark-theme-input' : ''}`}
              placeholder="Optional start time"
            />
            <p className={`text-xs mt-0.5 ${settings.theme === 'dark' ? 'dark-theme-text-secondary' : 'text-gray-500'}`}>
              Only if you want to schedule a specific start time
            </p>
          </div>


          {/* Priority */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${settings.theme === 'dark' ? 'dark-theme-text' : 'text-gray-700'}`}>
              Priority
            </label>
            <div className="flex flex-wrap gap-2">
              {priorityOptions.map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, priority: priority.value as any }))}
                  className={clsx(
                    'px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200',
                    formData.priority === priority.value
                      ? priority.color
                      : settings.theme === 'dark'
                        ? 'bg-[#0d1117] text-[#c9d1d9] border border-[#30363d] hover:bg-[#161b22]'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  <Flag className="w-4 h-4 inline mr-1" />
                  {priority.label}
                </button>
              ))}
            </div>
          </div>


          {/* Completed Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="completed"
              checked={formData.completed}
              onChange={(e) => setFormData(prev => ({ ...prev, completed: e.target.checked }))}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="completed" className={`ml-2 text-sm ${settings.theme === 'dark' ? 'dark-theme-text' : 'text-gray-700'}`}>
              Mark as completed
            </label>
          </div>

          {/* Action Buttons */}
          <div className={`flex flex-col sm:flex-row items-center justify-between pt-3 border-t gap-2 ${settings.theme === 'dark' ? 'dark-theme-border' : 'border-gray-200'}`}>
            <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <button
                type="submit"
                className="btn-primary"
              >
                {task ? 'Update Task' : 'Create Task'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
            {task && onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(task.id);
                  onClose();
                }}
                className="text-red-600 hover:text-red-700 font-medium text-sm sm:text-base w-full sm:w-auto text-center sm:text-left"
              >
                Delete Task
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal; 