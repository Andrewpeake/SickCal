export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface ProjectTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assignee?: string; // member ID
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  dependencies: string[]; // task IDs
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  completed: boolean;
  completedAt?: Date;
  tasks: string[]; // task IDs
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: Priority;
  startDate: Date;
  endDate?: Date;
  members: ProjectMember[];
  tasks: ProjectTask[];
  milestones: ProjectMilestone[];
  tags: string[];
  budget?: number;
  actualCost?: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface ProjectSettings {
  defaultTaskStatus: TaskStatus;
  defaultPriority: Priority;
  enableTimeTracking: boolean;
  enableBudgetTracking: boolean;
  autoAssignTasks: boolean;
  notificationSettings: {
    taskAssigned: boolean;
    taskCompleted: boolean;
    milestoneReached: boolean;
    projectStatusChanged: boolean;
  };
}

export class ProjectManager {
  private projects: Project[] = [];
  private settings: ProjectSettings;

  constructor(settings: Partial<ProjectSettings> = {}) {
    this.settings = {
      defaultTaskStatus: 'todo',
      defaultPriority: 'medium',
      enableTimeTracking: true,
      enableBudgetTracking: true,
      autoAssignTasks: false,
      notificationSettings: {
        taskAssigned: true,
        taskCompleted: true,
        milestoneReached: true,
        projectStatusChanged: true,
      },
      ...settings
    };
  }

  // Project CRUD operations
  createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
    const project: Project = {
      ...projectData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.projects.push(project);
    return project;
  }

  getProject(id: string): Project | undefined {
    return this.projects.find(p => p.id === id);
  }

  getAllProjects(): Project[] {
    return [...this.projects];
  }

  updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>): Project | null {
    const projectIndex = this.projects.findIndex(p => p.id === id);
    if (projectIndex === -1) return null;

    const updatedProject = {
      ...this.projects[projectIndex],
      ...updates,
      updatedAt: new Date()
    };

    this.projects[projectIndex] = updatedProject;
    return updatedProject;
  }

  deleteProject(id: string): boolean {
    const projectIndex = this.projects.findIndex(p => p.id === id);
    if (projectIndex === -1) return false;

    this.projects.splice(projectIndex, 1);
    return true;
  }

  // Task operations
  addTask(projectId: string, taskData: Omit<ProjectTask, 'id' | 'createdAt' | 'updatedAt'>): ProjectTask | null {
    const project = this.getProject(projectId);
    if (!project) return null;

    const task: ProjectTask = {
      ...taskData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    project.tasks.push(task);
    project.updatedAt = new Date();
    return task;
  }

  updateTask(projectId: string, taskId: string, updates: Partial<Omit<ProjectTask, 'id' | 'createdAt'>>): ProjectTask | null {
    const project = this.getProject(projectId);
    if (!project) return null;

    const taskIndex = project.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return null;

    const updatedTask = {
      ...project.tasks[taskIndex],
      ...updates,
      updatedAt: new Date()
    };

    if (updates.status === 'done' && !updatedTask.completedAt) {
      updatedTask.completedAt = new Date();
    }

    project.tasks[taskIndex] = updatedTask;
    project.updatedAt = new Date();
    return updatedTask;
  }

  deleteTask(projectId: string, taskId: string): boolean {
    const project = this.getProject(projectId);
    if (!project) return false;

    const taskIndex = project.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return false;

    project.tasks.splice(taskIndex, 1);
    project.updatedAt = new Date();
    return true;
  }

  // Milestone operations
  addMilestone(projectId: string, milestoneData: Omit<ProjectMilestone, 'id'>): ProjectMilestone | null {
    const project = this.getProject(projectId);
    if (!project) return null;

    const milestone: ProjectMilestone = {
      ...milestoneData,
      id: this.generateId()
    };

    project.milestones.push(milestone);
    project.updatedAt = new Date();
    return milestone;
  }

  updateMilestone(projectId: string, milestoneId: string, updates: Partial<Omit<ProjectMilestone, 'id'>>): ProjectMilestone | null {
    const project = this.getProject(projectId);
    if (!project) return null;

    const milestoneIndex = project.milestones.findIndex(m => m.id === milestoneId);
    if (milestoneIndex === -1) return null;

    const updatedMilestone = {
      ...project.milestones[milestoneIndex],
      ...updates
    };

    if (updates.completed && !updatedMilestone.completedAt) {
      updatedMilestone.completedAt = new Date();
    }

    project.milestones[milestoneIndex] = updatedMilestone;
    project.updatedAt = new Date();
    return updatedMilestone;
  }

  // Analytics and reporting
  getProjectProgress(projectId: string): {
    totalTasks: number;
    completedTasks: number;
    progressPercentage: number;
    overdueTasks: number;
    upcomingDeadlines: number;
  } {
    const project = this.getProject(projectId);
    if (!project) {
      return {
        totalTasks: 0,
        completedTasks: 0,
        progressPercentage: 0,
        overdueTasks: 0,
        upcomingDeadlines: 0
      };
    }

    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(t => t.status === 'done').length;
    const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    const now = new Date();
    const overdueTasks = project.tasks.filter(t => 
      t.dueDate && t.dueDate < now && t.status !== 'done'
    ).length;
    
    const upcomingDeadlines = project.tasks.filter(t => 
      t.dueDate && t.dueDate > now && t.dueDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) && t.status !== 'done'
    ).length;

    return {
      totalTasks,
      completedTasks,
      progressPercentage,
      overdueTasks,
      upcomingDeadlines
    };
  }

  getProjectTimeline(projectId: string): {
    tasks: ProjectTask[];
    milestones: ProjectMilestone[];
  } {
    const project = this.getProject(projectId);
    if (!project) return { tasks: [], milestones: [] };

    const sortedTasks = [...project.tasks].sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.getTime() - b.dueDate.getTime();
    });

    const sortedMilestones = [...project.milestones].sort((a, b) => 
      a.dueDate.getTime() - b.dueDate.getTime()
    );

    return {
      tasks: sortedTasks,
      milestones: sortedMilestones
    };
  }

  // Member operations
  addMember(projectId: string, member: ProjectMember): boolean {
    const project = this.getProject(projectId);
    if (!project) return false;

    if (project.members.find(m => m.id === member.id)) return false;

    project.members.push(member);
    project.updatedAt = new Date();
    return true;
  }

  removeMember(projectId: string, memberId: string): boolean {
    const project = this.getProject(projectId);
    if (!project) return false;

    const memberIndex = project.members.findIndex(m => m.id === memberId);
    if (memberIndex === -1) return false;

    project.members.splice(memberIndex, 1);
    project.updatedAt = new Date();
    return true;
  }

  // Settings
  updateSettings(newSettings: Partial<ProjectSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  getSettings(): ProjectSettings {
    return { ...this.settings };
  }

  // Utility methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Search and filtering
  searchProjects(query: string): Project[] {
    const lowerQuery = query.toLowerCase();
    return this.projects.filter(project =>
      project.name.toLowerCase().includes(lowerQuery) ||
      project.description?.toLowerCase().includes(lowerQuery) ||
      project.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  getProjectsByStatus(status: ProjectStatus): Project[] {
    return this.projects.filter(project => project.status === status);
  }

  getProjectsByMember(memberId: string): Project[] {
    return this.projects.filter(project =>
      project.members.some(member => member.id === memberId)
    );
  }
} 