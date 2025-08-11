import React, { useState } from 'react';
import { 
  X, 
  Users, 
  Calendar, 
  Plus, 
  CheckCircle, 
  Clock, 
  Edit,
  Trash2
} from 'lucide-react';
import { Project, ProjectTask, TaskStatus, Priority, ProjectMilestone } from '../types/project';
import { formatDate } from '../utils/dateUtils';
import clsx from 'clsx';

interface ProjectDetailProps {
  project: Project;
  onClose: () => void;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onTaskUpdate: (taskId: string, updates: Partial<ProjectTask>) => void;
  onTaskAdd: (task: Omit<ProjectTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onMilestoneAdd: (milestone: Omit<ProjectMilestone, 'id'>) => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  onClose,
  onEdit,
  onDelete,
  onTaskUpdate,
  onTaskAdd,
  onMilestoneAdd
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'milestones' | 'team'>('overview');
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddMilestone, setShowAddMilestone] = useState(false);

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'todo':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'review':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'done':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-700';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700';
      case 'review':
        return 'bg-yellow-100 text-yellow-700';
      case 'done':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700';
      case 'high':
        return 'bg-orange-100 text-orange-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const calculateProgress = () => {
    const totalTasks = project.tasks.length;
    if (totalTasks === 0) return 0;
    
    const completedTasks = project.tasks.filter(task => task.status === 'done').length;
    return Math.round((completedTasks / totalTasks) * 100);
  };

  const getOverdueTasks = () => {
    const now = new Date();
    return project.tasks.filter(task => 
      task.dueDate && task.dueDate < now && task.status !== 'done'
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Calendar className="w-4 h-4" /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckCircle className="w-4 h-4" /> },
    { id: 'milestones', label: 'Milestones', icon: <Clock className="w-4 h-4" /> },
    { id: 'team', label: 'Team', icon: <Users className="w-4 h-4" /> }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-medium w-full max-w-6xl h-[90vh] mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
            <p className="text-gray-600 mt-1">{project.description}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onEdit(project)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => onDelete(project.id)}
              className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={clsx(
                'flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors duration-200',
                activeTab === tab.id
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Project Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{project.tasks.length}</div>
                  <div className="text-sm text-gray-600">Total Tasks</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {project.tasks.filter(t => t.status === 'done').length}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {getOverdueTasks().length}
                  </div>
                  <div className="text-sm text-gray-600">Overdue</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">
                    {project.members.length}
                  </div>
                  <div className="text-sm text-gray-600">Team Members</div>
                </div>
              </div>

              {/* Progress */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Progress</h3>
                  <span className="text-2xl font-bold text-primary-600">{calculateProgress()}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${calculateProgress()}%` }}
                  />
                </div>
              </div>

              {/* Project Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Status</span>
                      <span className={clsx(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        project.status === 'active' && 'bg-green-100 text-green-700',
                        project.status === 'planning' && 'bg-blue-100 text-blue-700',
                        project.status === 'on-hold' && 'bg-yellow-100 text-yellow-700',
                        project.status === 'completed' && 'bg-green-100 text-green-700',
                        project.status === 'cancelled' && 'bg-red-100 text-red-700'
                      )}>
                        {project.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Priority</span>
                      <span className={clsx(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        getPriorityColor(project.priority)
                      )}>
                        {project.priority}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Start Date</span>
                      <span className="text-gray-900">{formatDate(project.startDate)}</span>
                    </div>
                    {project.endDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">End Date</span>
                        <span className="text-gray-900">{formatDate(project.endDate)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget</h3>
                  <div className="space-y-3">
                    {project.budget && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Budget</span>
                        <span className="text-gray-900">${project.budget.toLocaleString()}</span>
                      </div>
                    )}
                    {project.actualCost && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Actual Cost</span>
                        <span className="text-gray-900">${project.actualCost.toLocaleString()}</span>
                      </div>
                    )}
                    {project.budget && project.actualCost && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Remaining</span>
                        <span className={clsx(
                          'font-medium',
                          project.budget - project.actualCost >= 0 ? 'text-green-600' : 'text-red-600'
                        )}>
                          ${(project.budget - project.actualCost).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags */}
              {project.tags.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
                <button
                  onClick={() => setShowAddTask(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Task</span>
                </button>
              </div>

              <div className="space-y-3">
                {project.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-soft transition-shadow duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(task.status)}
                          <h4 className="font-medium text-gray-900">{task.title}</h4>
                          <span className={clsx(
                            'px-2 py-1 rounded-full text-xs font-medium',
                            getStatusColor(task.status)
                          )}>
                            {task.status}
                          </span>
                          <span className={clsx(
                            'px-2 py-1 rounded-full text-xs font-medium',
                            getPriorityColor(task.priority)
                          )}>
                            {task.priority}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          {task.dueDate && (
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>Due: {formatDate(task.dueDate)}</span>
                            </div>
                          )}
                          {task.assignee && (
                            <div className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>Assigned</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => onTaskUpdate(task.id, { 
                          status: task.status === 'done' ? 'todo' : 'done' 
                        })}
                        className="ml-3 p-1 hover:bg-gray-100 rounded"
                      >
                        <CheckCircle className={clsx(
                          'w-5 h-5',
                          task.status === 'done' ? 'text-green-500' : 'text-gray-400'
                        )} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'milestones' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Milestones</h3>
                <button
                  onClick={() => setShowAddMilestone(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Milestone</span>
                </button>
              </div>

              <div className="space-y-3">
                {project.milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {milestone.completed ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <Clock className="w-5 h-5 text-gray-400" />
                          )}
                          <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                          <span className={clsx(
                            'px-2 py-1 rounded-full text-xs font-medium',
                            milestone.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          )}>
                            {milestone.completed ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                        {milestone.description && (
                          <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                        )}
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>Due: {formatDate(milestone.dueDate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.members.map((member) => (
                  <div
                    key={member.id}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-medium">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{member.name}</h4>
                        <p className="text-sm text-gray-600">{member.role}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail; 