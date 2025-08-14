import React, { useState, useEffect } from 'react';
import { CalendarView, Event, Task, Settings } from './types';
import { OverdueManager } from './types/overdue';
import { ProjectManager as ProjectManagerClass, Project, ProjectTask, ProjectMilestone } from './types/project';
import Navigation from './components/Navigation';
import CalendarGrid from './components/CalendarGrid';
import EventModal from './components/EventModal';
import TaskModal from './components/TaskModal';
import Sidebar from './components/Sidebar';
import OverdueTasks from './components/OverdueTasks';
import ProjectManager from './components/ProjectManager';
import ProjectModal from './components/ProjectModal';
import ProjectDetail from './components/ProjectDetail';
import SettingsModal from './components/SettingsModal';
import { loadSettings, saveSettings, applyAllSettings } from './utils/settingsUtils';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('week');
  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>();
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  
  // Initialize managers
  const [overdueManager] = useState(() => new OverdueManager());
  const [projectManager] = useState(() => new ProjectManagerClass());
  
  // Project state
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showProjectDetail, setShowProjectDetail] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [selectedProject, setSelectedProject] = useState<Project | undefined>();

  // Settings state
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Load and apply settings from localStorage on mount
  useEffect(() => {
    const savedSettings = loadSettings();
    setSettings(savedSettings);
    // Apply settings immediately on mount
    applyAllSettings(savedSettings);
  }, []);

  // Apply settings when they change
  useEffect(() => {
    console.log('Settings changed in App component:', settings);
    applyAllSettings(settings);
  }, [settings]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedEvents = localStorage.getItem('sickcal-events');
    const savedTasks = localStorage.getItem('sickcal-tasks');
    
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents).map((event: any) => ({
        ...event,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate)
      })));
    } else {
      // Add sample events
      const sampleEvents: Event[] = [
        {
          id: '1',
          title: 'Team Meeting',
          description: 'Weekly team sync',
          startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          endDate: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // Tomorrow + 1 hour
          color: '#0ea5e9',
          isAllDay: false
        },
        {
          id: '2',
          title: 'Project Review',
          description: 'Review Q4 goals',
          startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
          endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // + 2 hours
          color: '#10b981',
          isAllDay: false
        }
      ];
      setEvents(sampleEvents);
    }
    
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks).map((task: any) => ({
        ...task,
        dueDate: new Date(task.dueDate)
      })));
    } else {
      // Add sample tasks including overdue ones
      const now = new Date();
      const sampleTasks: Task[] = [
        {
          id: '1',
          title: 'Complete project proposal',
          description: 'Finish the Q4 project proposal document',
          dueDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (overdue)
          completed: false,
          priority: 'high'
        },
        {
          id: '2',
          title: 'Review code changes',
          description: 'Review pull requests for the main branch',
          dueDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago (overdue)
          completed: false,
          priority: 'medium'
        },
        {
          id: '3',
          title: 'Update documentation',
          description: 'Update API documentation',
          dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          completed: false,
          priority: 'low'
        },
        {
          id: '4',
          title: 'Prepare presentation',
          description: 'Prepare slides for the client meeting',
          dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
          completed: false,
          priority: 'high'
        }
      ];
      setTasks(sampleTasks);
    }

    // Add sample projects
    const now = new Date();
    const sampleProjects = [
      {
        id: '1',
        name: 'Website Redesign',
        description: 'Complete redesign of the company website with modern UI/UX',
        status: 'active' as const,
        priority: 'high' as const,
        startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        members: [
          { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Lead Designer' },
          { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Frontend Developer' }
        ],
        tasks: [
          {
            id: '1',
            title: 'Design mockups',
            description: 'Create initial design mockups',
            status: 'done' as const,
            priority: 'high' as const,
            dependencies: [],
            tags: ['design', 'ui'],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: '2',
            title: 'Frontend development',
            description: 'Implement the frontend components',
            status: 'in-progress' as const,
            priority: 'medium' as const,
            dependencies: ['1'],
            tags: ['development', 'react'],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        milestones: [
          {
            id: '1',
            title: 'Design Phase Complete',
            description: 'All design mockups approved',
            dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
            completed: true,
            tasks: ['1']
          }
        ],
        tags: ['website', 'redesign', 'ui/ux'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Mobile App Development',
        description: 'Develop a new mobile app for iOS and Android',
        status: 'planning' as const,
        priority: 'medium' as const,
        startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        members: [
          { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'Mobile Developer' }
        ],
        tasks: [
          {
            id: '3',
            title: 'Requirements gathering',
            description: 'Gather and document app requirements',
            status: 'todo' as const,
            priority: 'high' as const,
            dependencies: [],
            tags: ['planning', 'requirements'],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        milestones: [],
        tags: ['mobile', 'app', 'development'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Add projects to the project manager
    sampleProjects.forEach(project => {
      projectManager.createProject(project);
    });
  }, [projectManager]);

  // Save data to localStorage whenever events or tasks change
  useEffect(() => {
    localStorage.setItem('sickcal-events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('sickcal-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
    setSelectedDate(date);
  };

  const handleViewChange = (newView: CalendarView) => {
    setView(newView);
  };

  const handleDateSelect = (date: Date, isDoubleClick: boolean = false) => {
    setSelectedDate(date);
    
    if (isDoubleClick) {
      // Double click: Open day view
      setView('day');
    } else {
      // Single click: Select the date in current view
      if (view === 'week') {
        // If clicking on a time slot in week view, open event modal with pre-filled times
        setEditingEvent(undefined);
        setShowEventModal(true);
      }
    }
  };

  const handleAddEvent = () => {
    setEditingEvent(undefined);
    setShowEventModal(true);
  };

  const handleAddTask = () => {
    setEditingTask(undefined);
    setShowTaskModal(true);
  };

  const handleSaveEvent = (event: Event) => {
    if (editingEvent) {
      setEvents(prev => prev.map(e => e.id === event.id ? event : e));
    } else {
      setEvents(prev => [...prev, event]);
    }
    setShowEventModal(false);
    setEditingEvent(undefined);
  };

  const handleSaveTask = (task: Task) => {
    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    } else {
      setTasks(prev => [...prev, task]);
    }
    setShowTaskModal(false);
    setEditingTask(undefined);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  // Context menu handlers
  const handleEventEdit = (event: Event) => {
    // Update the event in the state (for drag-and-drop)
    setEvents(prev => prev.map(e => e.id === event.id ? event : e));
  };

  const handleEventOpen = (event: Event) => {
    setEditingEvent(event);
    setShowEventModal(true);
  };

  const handleEventDelete = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
  };

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleTaskDelete = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleEventCreate = (event: Event) => {
    setEvents(prev => [...prev, event]);
  };

  const handleTaskCreate = (date: Date) => {
    setSelectedDate(date);
    setShowTaskModal(true);
  };

  // Project handlers
  const handleProjectCreate = () => {
    setEditingProject(undefined);
    setShowProjectModal(true);
  };

  const handleProjectEdit = (project: Project) => {
    setEditingProject(project);
    setShowProjectModal(true);
  };

  const handleProjectSave = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingProject) {
      projectManager.updateProject(editingProject.id, projectData);
    } else {
      projectManager.createProject(projectData);
    }
    setShowProjectModal(false);
    setEditingProject(undefined);
  };

  const handleProjectDelete = (projectId: string) => {
    projectManager.deleteProject(projectId);
    setShowProjectDetail(false);
    setSelectedProject(undefined);
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setShowProjectDetail(true);
  };

  const handleProjectTaskUpdate = (projectId: string, taskId: string, updates: Partial<ProjectTask>) => {
    const project = projectManager.getProject(projectId);
    if (project) {
      const updatedProject = projectManager.updateProject(projectId, {
        tasks: project.tasks.map(task => 
          task.id === taskId ? { ...task, ...updates } : task
        )
      });
      if (updatedProject) {
        setSelectedProject(updatedProject);
      }
    }
  };

  const handleProjectTaskAdd = (projectId: string, taskData: Omit<ProjectTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask = projectManager.addTask(projectId, taskData);
    if (newTask) {
      const updatedProject = projectManager.getProject(projectId);
      if (updatedProject) {
        setSelectedProject(updatedProject);
      }
    }
  };

  const handleProjectMilestoneAdd = (projectId: string, milestoneData: Omit<ProjectMilestone, 'id'>) => {
    const newMilestone = projectManager.addMilestone(projectId, milestoneData);
    if (newMilestone) {
      const updatedProject = projectManager.getProject(projectId);
      if (updatedProject) {
        setSelectedProject(updatedProject);
      }
    }
  };

  // Settings handlers
  const handleSettingsSave = (newSettings: Settings) => {
    console.log('Saving settings:', newSettings);
    setSettings(newSettings);
    saveSettings(newSettings);
    applyAllSettings(newSettings); // Actually apply the settings
    console.log('Settings applied, new state:', newSettings);
    
    // Force a re-render by updating currentDate
    setCurrentDate(new Date());
  };

  const handleOpenSettings = () => {
    setShowSettingsModal(true);
  };



  return (
    <div className={`min-h-screen ${settings.theme === 'dark' ? 'bg-[#0d1117]' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${settings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-900'}`}>SickCal</h1>
            <p className={settings.theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-600'}>Your sleek and intuitive calendar app</p>
          </div>
          <button
            onClick={handleOpenSettings}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors duration-200 ${
              settings.theme === 'dark' 
                ? 'bg-[#0d1117] hover:bg-[#161b22] border-[#30363d] text-[#c9d1d9]' 
                : 'bg-white hover:bg-gray-50 border-gray-300'
            }`}
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
        </div>

        {/* Navigation */}
        <Navigation
          currentDate={currentDate}
          onDateChange={handleDateChange}
          onViewChange={handleViewChange}
          view={view}
          settings={settings}
        />

        {/* Main Content */}
        <div className="flex gap-8">
          {/* Calendar Grid */}
          <div className="flex-1">
            <CalendarGrid
              key={`calendar-${settings.hourHeight}-${settings.theme}-${settings.primaryColor}`}
              currentDate={currentDate}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              events={events}
              tasks={tasks}
              view={view}
              settings={settings}
              onEventEdit={handleEventEdit}
              onEventOpen={handleEventOpen}
              onEventDelete={handleEventDelete}
              onTaskEdit={handleTaskEdit}
              onTaskDelete={handleTaskDelete}
              onEventCreate={handleEventCreate}
              onTaskCreate={handleTaskCreate}
            />
          </div>

          {/* Sidebar */}
          <Sidebar
            events={events}
            tasks={tasks}
            settings={settings}
            onAddEvent={handleAddEvent}
            onAddTask={handleAddTask}
            onEventOpen={(event) => {
              // Navigate to the event's date/time and open the modal
              const date = new Date(event.startDate);
              setSelectedDate(date);
              setView('day');
              setEditingEvent(event);
              setShowEventModal(true);
            }}
            onEventEdit={(event) => {
              setSelectedDate(new Date(event.startDate));
              setEditingEvent(event);
              setShowEventModal(true);
            }}
            onEventDelete={handleDeleteEvent}
          />
        </div>

        {/* Overdue Tasks Section */}
        <div className="mt-8">
          <OverdueTasks
            tasks={overdueManager.getOverdueTasks(tasks.map(task => ({
              ...task,
              softDeadline: new Date(task.dueDate.getTime() - 3 * 24 * 60 * 60 * 1000),
              hardDeadline: new Date(task.dueDate.getTime() + 7 * 24 * 60 * 60 * 1000)
            })))}
            onTaskClick={(task) => {
              // Find the original task and edit it
              const originalTask = tasks.find(t => t.id === task.id);
              if (originalTask) {
                setEditingTask(originalTask);
                setShowTaskModal(true);
              }
            }}
            onTaskComplete={(taskId) => {
              setTasks(prev => prev.map(task => 
                task.id === taskId ? { ...task, completed: true } : task
              ));
            }}
          />
        </div>

        {/* Projects Section */}
        <div className="mt-8">
          <ProjectManager
            projects={projectManager.getAllProjects()}
            settings={settings}
            onProjectClick={handleProjectClick}
            onProjectCreate={handleProjectCreate}
            onProjectUpdate={(projectId, updates) => {
              projectManager.updateProject(projectId, updates);
              // Force re-render
              setCurrentDate(new Date(currentDate));
            }}
          />
        </div>

        {/* Modals */}
        <EventModal
          isOpen={showEventModal}
          onClose={() => {
            setShowEventModal(false);
            setEditingEvent(undefined);
          }}
          event={editingEvent}
          selectedDate={selectedDate}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
        />

        <TaskModal
          isOpen={showTaskModal}
          onClose={() => {
            setShowTaskModal(false);
            setEditingTask(undefined);
          }}
          task={editingTask}
          selectedDate={selectedDate}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
        />

        {/* Project Modals */}
        <ProjectModal
          isOpen={showProjectModal}
          onClose={() => {
            setShowProjectModal(false);
            setEditingProject(undefined);
          }}
          project={editingProject}
          onSave={handleProjectSave}
          onDelete={handleProjectDelete}
        />

        {selectedProject && showProjectDetail && (
          <ProjectDetail
            project={selectedProject}
            onClose={() => {
              setShowProjectDetail(false);
              setSelectedProject(undefined);
            }}
            onEdit={handleProjectEdit}
            onDelete={handleProjectDelete}
            onTaskUpdate={(taskId, updates) => handleProjectTaskUpdate(selectedProject.id, taskId, updates)}
            onTaskAdd={(taskData) => handleProjectTaskAdd(selectedProject.id, taskData)}
            onMilestoneAdd={(milestoneData) => handleProjectMilestoneAdd(selectedProject.id, milestoneData)}
          />
        )}

        {/* Settings Modal */}
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          settings={settings}
          onSave={handleSettingsSave}
        />
      </div>
    </div>
  );
}

export default App; 