import React, { useState } from 'react';
import { 
  FolderOpen, 
  Users, 
  Calendar, 
  Plus, 
  MoreVertical,
  CheckCircle,
  Clock,
  AlertTriangle,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { Project, ProjectStatus } from '../types/project';
import { formatDate } from '../utils/dateUtils';
import clsx from 'clsx';

interface ProjectManagerProps {
  projects: Project[];
  settings: any; // Settings type
  onProjectClick?: (project: Project) => void;
  onProjectCreate?: () => void;
  onProjectUpdate?: (projectId: string, updates: Partial<Project>) => void;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({
  projects,
  settings,
  onProjectClick,
  onProjectCreate,
  onProjectUpdate
}) => {
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus | 'all'>('all');

  const getStatusIcon = (status: ProjectStatus) => {
    switch (status) {
      case 'planning':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'active':
        return <Play className="w-4 h-4 text-green-500" />;
      case 'on-hold':
        return <Pause className="w-4 h-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <Square className="w-4 h-4 text-red-500" />;
      default:
        return <FolderOpen className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'active':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'on-hold':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  const calculateProgress = (project: Project) => {
    const totalTasks = project.tasks.length;
    if (totalTasks === 0) return 0;
    
    const completedTasks = project.tasks.filter(task => task.status === 'done').length;
    return Math.round((completedTasks / totalTasks) * 100);
  };

  const getOverdueTasks = (project: Project) => {
    const now = new Date();
    return project.tasks.filter(task => 
      task.dueDate && task.dueDate < now && task.status !== 'done'
    ).length;
  };

  const filteredProjects = selectedStatus === 'all' 
    ? projects 
    : projects.filter(project => project.status === selectedStatus);

  const statusCounts = {
    all: projects.length,
    planning: projects.filter(p => p.status === 'planning').length,
    active: projects.filter(p => p.status === 'active').length,
    'on-hold': projects.filter(p => p.status === 'on-hold').length,
    completed: projects.filter(p => p.status === 'completed').length,
    cancelled: projects.filter(p => p.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold flex items-center ${settings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-900'}`}>
          <FolderOpen className={`w-6 h-6 mr-2 ${settings.theme === 'dark' ? 'text-[#1f6feb]' : 'text-primary-600'}`} />
          Projects
        </h2>
        <button
          onClick={onProjectCreate}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {(['all', 'planning', 'active', 'on-hold', 'completed', 'cancelled'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors duration-200',
              selectedStatus === status
                ? settings.theme === 'dark'
                  ? 'bg-[#1f6feb] bg-opacity-20 text-[#1f6feb] border-2 border-[#1f6feb]'
                  : 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                : settings.theme === 'dark'
                  ? 'bg-[#21262d] text-[#8b949e] hover:bg-[#30363d]'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              settings.theme === 'dark' ? 'bg-[#0d1117] text-[#c9d1d9]' : 'bg-white'
            }`}>
              {statusCounts[status]}
            </span>
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => {
          const progress = calculateProgress(project);
          const overdueTasks = getOverdueTasks(project);
          
          return (
            <div
              key={project.id}
              className={`rounded-xl shadow-soft border hover:shadow-medium transition-all duration-200 cursor-pointer ${
                settings.theme === 'dark' 
                  ? 'bg-[#161b22] border-[#30363d]' 
                  : 'bg-white border-gray-200'
              }`}
              onClick={() => onProjectClick?.(project)}
            >
              {/* Project Header */}
              <div className={`p-6 border-b ${
                settings.theme === 'dark' ? 'border-[#30363d]' : 'border-gray-100'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-lg font-semibold truncate ${
                      settings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-900'
                    }`}>
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className={`text-sm mt-1 line-clamp-2 ${
                        settings.theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-600'
                      }`}>
                        {project.description}
                      </p>
                    )}
                  </div>
                  <button className={`ml-2 p-1 rounded ${
                    settings.theme === 'dark' ? 'hover:bg-[#21262d]' : 'hover:bg-gray-100'
                  }`}>
                    <MoreVertical className={`w-4 h-4 ${
                      settings.theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-400'
                    }`} />
                  </button>
                </div>

                {/* Status and Priority */}
                <div className="flex items-center space-x-2 mb-3">
                  <span className={clsx(
                    'px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1',
                    getStatusColor(project.status)
                  )}>
                    {getStatusIcon(project.status)}
                    <span>{project.status}</span>
                  </span>
                  <span className={clsx(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    getPriorityColor(project.priority)
                  )}>
                    {project.priority}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className={`flex items-center justify-between text-sm mb-1 ${
                    settings.theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-600'
                  }`}>
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className={`w-full rounded-full h-2 ${
                    settings.theme === 'dark' ? 'bg-[#30363d]' : 'bg-gray-200'
                  }`}>
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        settings.theme === 'dark' ? 'bg-[#1f6feb]' : 'bg-primary-600'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Project Stats */}
                <div className={`flex items-center justify-between text-sm ${
                  settings.theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-500'
                }`}>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{project.members.length}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>{project.tasks.filter(t => t.status === 'done').length}/{project.tasks.length}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(project.startDate, 'MMM dd')}</span>
                  </div>
                </div>
              </div>

              {/* Project Footer */}
              <div className={`p-4 rounded-b-xl ${
                settings.theme === 'dark' ? 'bg-[#0d1117]' : 'bg-gray-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {project.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 text-xs rounded border ${
                          settings.theme === 'dark' 
                            ? 'bg-[#161b22] text-[#8b949e] border-[#30363d]' 
                            : 'bg-white text-gray-600'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                    {project.tags.length > 2 && (
                      <span className={`text-xs ${
                        settings.theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-500'
                      }`}>
                        +{project.tags.length - 2} more
                      </span>
                    )}
                  </div>
                  
                  {overdueTasks > 0 && (
                    <div className="flex items-center space-x-1 text-red-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm font-medium">{overdueTasks} overdue</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className={`w-16 h-16 mx-auto mb-4 ${
            settings.theme === 'dark' ? 'text-[#484f58]' : 'text-gray-300'
          }`} />
          <h3 className={`text-lg font-medium mb-2 ${
            settings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-900'
          }`}>
            {selectedStatus === 'all' ? 'No projects yet' : `No ${selectedStatus} projects`}
          </h3>
          <p className={`mb-4 ${settings.theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-600'}`}>
            {selectedStatus === 'all' 
              ? 'Get started by creating your first project.'
              : `No projects are currently ${selectedStatus}.`
            }
          </p>
          {selectedStatus === 'all' && (
            <button
              onClick={onProjectCreate}
              className="btn-primary"
            >
              Create Project
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectManager; 