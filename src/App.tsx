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
import AuthModal from './components/AuthModal';
import { useAuth } from './contexts/AuthContext';
import { eventsAPI, tasksAPI, settingsAPI, projectsAPI } from './services/api';
import { loadSettings, saveSettings, applyAllSettings } from './utils/settingsUtils';

function App() {
  const { user, loading: authLoading } = useAuth();
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  // Clipboard state for copy/paste functionality
  const [clipboard, setClipboard] = useState<{
    type: 'event' | 'task' | null;
    data: Event | Task | null;
  }>({ type: null, data: null });

  // Load data from API when user is authenticated
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        // If no user, use localStorage as fallback
        const savedSettings = loadSettings();
        setSettings(savedSettings);
        applyAllSettings(savedSettings);
        
        const savedEvents = localStorage.getItem('sickcal-events');
        const savedTasks = localStorage.getItem('sickcal-tasks');
        
        if (savedEvents) {
          setEvents(JSON.parse(savedEvents).map((event: any) => ({
            ...event,
            startDate: new Date(event.startDate),
            endDate: new Date(event.endDate)
          })));
        }
        
        if (savedTasks) {
          setTasks(JSON.parse(savedTasks).map((task: any) => ({
            ...task,
            dueDate: new Date(task.dueDate)
          })));
        }
        return;
      }

      setDataLoading(true);
      try {
        // Load settings from API
        const apiSettings = await settingsAPI.get();
        setSettings(apiSettings);
        applyAllSettings(apiSettings);
        
        // Load events from API
        const apiEvents = await eventsAPI.getAll();
        setEvents(apiEvents);
        
        // Load tasks from API
        const apiTasks = await tasksAPI.getAll();
        setTasks(apiTasks);
        
        // Load projects from API
        const apiProjects = await projectsAPI.getAll();
        apiProjects.forEach(project => {
          projectManager.createProject(project);
        });
        
      } catch (error) {
        console.error('Error loading data from API:', error);
        // Fallback to localStorage if API fails
        const savedSettings = loadSettings();
        setSettings(savedSettings);
        applyAllSettings(savedSettings);
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, [user, projectManager]);

  // Apply settings when they change
  useEffect(() => {
    applyAllSettings(settings);
  }, [settings]);

  // Save data to localStorage as backup when not authenticated
  useEffect(() => {
    if (!user) {
      localStorage.setItem('sickcal-events', JSON.stringify(events));
    }
  }, [events, user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('sickcal-tasks', JSON.stringify(tasks));
    }
  }, [tasks, user]);

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

  const handleSaveEvent = async (event: Event) => {
    try {
      if (editingEvent) {
        // Update existing event
        if (user) {
          const updatedEvent = await eventsAPI.update(event.id, event);
          setEvents(prev => prev.map(e => e.id === event.id ? updatedEvent : e));
        } else {
          setEvents(prev => prev.map(e => e.id === event.id ? event : e));
        }
      } else {
        // Create new event
        if (user) {
          const newEvent = await eventsAPI.create(event);
          setEvents(prev => [...prev, newEvent]);
        } else {
          setEvents(prev => [...prev, event]);
        }
      }
      setShowEventModal(false);
      setEditingEvent(undefined);
    } catch (error) {
      console.error('Error saving event:', error);
      // Still update local state for immediate feedback
      if (editingEvent) {
        setEvents(prev => prev.map(e => e.id === event.id ? event : e));
      } else {
        setEvents(prev => [...prev, event]);
      }
      setShowEventModal(false);
      setEditingEvent(undefined);
    }
  };

  const handleSaveTask = async (task: Task) => {
    try {
      if (editingTask) {
        // Update existing task
        if (user) {
          const updatedTask = await tasksAPI.update(task.id, task);
          setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));
        } else {
          setTasks(prev => prev.map(t => t.id === task.id ? task : t));
        }
      } else {
        // Create new task
        if (user) {
          const newTask = await tasksAPI.create(task);
          setTasks(prev => [...prev, newTask]);
        } else {
          setTasks(prev => [...prev, task]);
        }
      }
      setShowTaskModal(false);
      setEditingTask(undefined);
    } catch (error) {
      console.error('Error saving task:', error);
      // Still update local state for immediate feedback
      if (editingTask) {
        setTasks(prev => prev.map(t => t.id === task.id ? task : t));
      } else {
        setTasks(prev => [...prev, task]);
      }
      setShowTaskModal(false);
      setEditingTask(undefined);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      if (user) {
        await eventsAPI.delete(eventId);
      }
      setEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
      // Still update local state for immediate feedback
      setEvents(prev => prev.filter(e => e.id !== eventId));
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      if (user) {
        await tasksAPI.delete(taskId);
      }
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      // Still update local state for immediate feedback
      setTasks(prev => prev.filter(t => t.id !== taskId));
    }
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
        tasks: project.tasks.map((task: ProjectTask) => 
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
  const handleSettingsSave = async (newSettings: Settings) => {
    try {
      console.log('Saving settings:', newSettings);
      setSettings(newSettings);
      
      if (user) {
        // Save to API
        const updatedSettings = await settingsAPI.update(newSettings);
        setSettings(updatedSettings);
        applyAllSettings(updatedSettings);
      } else {
        // Save to localStorage as fallback
        saveSettings(newSettings);
        applyAllSettings(newSettings);
      }
      
      console.log('Settings applied, new state:', newSettings);
      
      // Force a re-render by updating currentDate
      setCurrentDate(new Date());
    } catch (error) {
      console.error('Error saving settings:', error);
      // Still update local state for immediate feedback
      setSettings(newSettings);
      saveSettings(newSettings);
      applyAllSettings(newSettings);
    }
  };

  // Copy/paste functionality
  const handleCopyEvent = (event: Event) => {
    setClipboard({ type: 'event', data: event });
  };

  const handleCopyTask = (task: Task) => {
    setClipboard({ type: 'task', data: task });
  };

  const handlePaste = async (targetDate: Date) => {
    if (!clipboard.data || !clipboard.type) return;

    try {
      if (clipboard.type === 'event') {
        const originalEvent = clipboard.data as Event;
        const newEvent: Event = {
          ...originalEvent,
          id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: `${originalEvent.title} (Copy)`,
          startDate: new Date(targetDate),
          endDate: new Date(targetDate.getTime() + (originalEvent.endDate.getTime() - originalEvent.startDate.getTime()))
        };

        if (user) {
          const createdEvent = await eventsAPI.create(newEvent);
          setEvents(prev => [...prev, createdEvent]);
        } else {
          setEvents(prev => [...prev, newEvent]);
        }
      } else if (clipboard.type === 'task') {
        const originalTask = clipboard.data as Task;
        const newTask: Task = {
          ...originalTask,
          id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: `${originalTask.title} (Copy)`,
          dueDate: new Date(targetDate),
          completed: false // Reset completion status for copied tasks
        };

        if (user) {
          const createdTask = await tasksAPI.create(newTask);
          setTasks(prev => [...prev, createdTask]);
        } else {
          setTasks(prev => [...prev, newTask]);
        }
      }
    } catch (error) {
      console.error('Error pasting item:', error);
    }
  };

  const handleOpenSettings = () => {
    setShowSettingsModal(true);
  };

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading SickCal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${settings.theme === 'dark' ? 'bg-[#0d1117]' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${settings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-900'}`}>SickCal</h1>
            <p className={`text-sm sm:text-base ${settings.theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-600'}`}>
              Your sleek and intuitive calendar app
              {user && <span className="ml-2 text-sm">• Synced</span>}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                <span className={`text-xs sm:text-sm ${settings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-600'}`}>
                  {user.email}
                </span>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className={`px-2 sm:px-3 py-1 text-xs sm:text-sm border rounded transition-colors duration-200 ${
                    settings.theme === 'dark' 
                      ? 'bg-[#0d1117] hover:bg-[#161b22] border-[#30363d] text-[#c9d1d9]' 
                      : 'bg-white hover:bg-gray-50 border-gray-300'
                  }`}
                >
                  Account
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className={`px-3 sm:px-4 py-2 text-sm border rounded-lg transition-colors duration-200 ${
                  settings.theme === 'dark' 
                    ? 'bg-[#0d1117] hover:bg-[#161b22] border-[#30363d] text-[#c9d1d9]' 
                    : 'bg-white hover:bg-gray-50 border-gray-300'
                }`}
              >
                Sign In
              </button>
            )}
            <button
              onClick={handleOpenSettings}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-sm border rounded-lg transition-colors duration-200 ${
                settings.theme === 'dark' 
                  ? 'bg-[#0d1117] hover:bg-[#161b22] border-[#30363d] text-[#c9d1d9]' 
                  : 'bg-white hover:bg-gray-50 border-gray-300'
              }`}
              title="Settings"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <Navigation
          key={`nav-${settings.theme}`}
          currentDate={currentDate}
          onDateChange={handleDateChange}
          onViewChange={handleViewChange}
          view={view}
          settings={settings}
        />

        {/* Main Content */}
        <div className="flex flex-col xl:flex-row gap-4 xl:gap-8">
          {/* Calendar Grid */}
          <div className="flex-1 min-w-0">
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
              clipboard={clipboard}
              onCopyEvent={handleCopyEvent}
              onCopyTask={handleCopyTask}
              onPaste={handlePaste}
            />
          </div>

          {/* Sidebar */}
          <div className="w-full xl:w-80 flex-shrink-0">
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
        </div>

        {/* Overdue Tasks Section */}
        <div className="mt-8">
          <OverdueTasks
            tasks={overdueManager.getOverdueTasks(tasks.map(task => ({
              ...task,
              softDeadline: new Date(task.dueDate.getTime() - 3 * 24 * 60 * 60 * 1000),
              hardDeadline: new Date(task.dueDate.getTime() + 7 * 24 * 60 * 60 * 1000)
            })))}
            settings={settings}
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
          settings={settings}
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
          settings={settings}
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

        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </div>
    </div>
  );
}

export default App;// Force new deployment Tue Sep  9 12:51:01 MDT 2025
