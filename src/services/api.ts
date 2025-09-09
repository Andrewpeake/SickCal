import { Event, Task, Settings } from '../types';
import { Project } from '../types/project';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('sickcal_auth_token');
};

// Set auth token in localStorage
const setAuthToken = (token: string): void => {
  localStorage.setItem('sickcal_auth_token', token);
};

// Remove auth token from localStorage
const removeAuthToken = (): void => {
  localStorage.removeItem('sickcal_auth_token');
};

// Generic API request function
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Authentication API
export const authAPI = {
  // Get current user profile
  getProfile: () => apiRequest<any>('/auth/me'),
  
  // Update user profile
  updateProfile: (profileData: any) => 
    apiRequest<any>('/auth/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    }),
  
  // Sign out
  signOut: () => apiRequest<any>('/auth/signout', { method: 'POST' }),
};

// Events API
export const eventsAPI = {
  // Get all events
  getAll: (): Promise<Event[]> => apiRequest<Event[]>('/events'),
  
  // Get single event
  getById: (id: string): Promise<Event> => apiRequest<Event>(`/events/${id}`),
  
  // Create event
  create: (event: Omit<Event, 'id'>): Promise<Event> =>
    apiRequest<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(event),
    }),
  
  // Update event
  update: (id: string, event: Partial<Event>): Promise<Event> =>
    apiRequest<Event>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(event),
    }),
  
  // Delete event
  delete: (id: string): Promise<{ message: string; id: string }> =>
    apiRequest<{ message: string; id: string }>(`/events/${id}`, {
      method: 'DELETE',
    }),
};

// Tasks API
export const tasksAPI = {
  // Get all tasks
  getAll: (): Promise<Task[]> => apiRequest<Task[]>('/tasks'),
  
  // Get single task
  getById: (id: string): Promise<Task> => apiRequest<Task>(`/tasks/${id}`),
  
  // Create task
  create: (task: Omit<Task, 'id'>): Promise<Task> =>
    apiRequest<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    }),
  
  // Update task
  update: (id: string, task: Partial<Task>): Promise<Task> =>
    apiRequest<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    }),
  
  // Delete task
  delete: (id: string): Promise<{ message: string; id: string }> =>
    apiRequest<{ message: string; id: string }>(`/tasks/${id}`, {
      method: 'DELETE',
    }),
  
  // Toggle task completion
  toggleCompletion: (id: string, completed: boolean): Promise<Task> =>
    apiRequest<Task>(`/tasks/${id}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    }),
};

// Settings API
export const settingsAPI = {
  // Get user settings
  get: (): Promise<Settings> => apiRequest<Settings>('/settings'),
  
  // Update settings
  update: (settings: Settings): Promise<Settings> =>
    apiRequest<Settings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
  
  // Reset to defaults
  reset: (): Promise<Settings> =>
    apiRequest<Settings>('/settings/reset', {
      method: 'POST',
    }),
};

// Projects API
export const projectsAPI = {
  // Get all projects
  getAll: (): Promise<Project[]> => apiRequest<Project[]>('/projects'),
  
  // Get single project
  getById: (id: string): Promise<Project> => apiRequest<Project>(`/projects/${id}`),
  
  // Create project
  create: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> =>
    apiRequest<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    }),
  
  // Update project
  update: (id: string, project: Partial<Project>): Promise<Project> =>
    apiRequest<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    }),
  
  // Delete project
  delete: (id: string): Promise<{ message: string; id: string }> =>
    apiRequest<{ message: string; id: string }>(`/projects/${id}`, {
      method: 'DELETE',
    }),
};

// Export auth token management functions
export { getAuthToken, setAuthToken, removeAuthToken };

