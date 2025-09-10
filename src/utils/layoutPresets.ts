import { LayoutConfig, PanelConfig } from '../types';

export const defaultLayouts: LayoutConfig[] = [
  {
    id: 'default',
    name: 'Default Layout',
    isDefault: true,
    gridTemplate: {
      columns: '1fr 320px',
      rows: 'auto',
      gap: '1rem',
    },
    panels: [
      {
        id: 'calendar-main',
        type: 'calendar',
        title: 'Calendar',
        position: 'center',
        size: 'full',
        visible: true,
        order: 1,
        settings: {
          showHeader: false,
          collapsible: false,
          resizable: false,
          movable: false,
        },
        content: {}
      },
      {
        id: 'sidebar-main',
        type: 'sidebar',
        title: 'Sidebar',
        position: 'center-right',
        size: 'custom',
        customSize: { width: '320px', height: 'auto' },
        visible: true,
        order: 2,
        settings: {
          showHeader: false,
          collapsible: false,
          resizable: true,
          movable: false,
        },
        content: {}
      }
    ]
  },
  
  {
    id: 'dashboard',
    name: 'Dashboard Layout',
    isDefault: false,
    gridTemplate: {
      columns: 'repeat(auto-fit, minmax(300px, 1fr))',
      rows: 'auto',
      gap: '1rem',
    },
    panels: [
      {
        id: 'quick-actions',
        type: 'quick-actions',
        title: 'Quick Actions',
        position: 'top-left',
        size: 'small',
        visible: true,
        order: 1,
        settings: {
          showHeader: true,
          collapsible: true,
          resizable: true,
          movable: true,
        },
        content: {}
      },
      {
        id: 'task-progress',
        type: 'task-progress',
        title: 'Task Progress',
        position: 'top-center',
        size: 'small',
        visible: true,
        order: 2,
        settings: {
          showHeader: true,
          collapsible: true,
          resizable: true,
          movable: true,
        },
        content: { maxItems: 5 }
      },
      {
        id: 'upcoming-events',
        type: 'upcoming-events',
        title: 'Upcoming Events',
        position: 'top-right',
        size: 'small',
        visible: true,
        order: 3,
        settings: {
          showHeader: true,
          collapsible: true,
          resizable: true,
          movable: true,
        },
        content: { maxItems: 3 }
      },
      {
        id: 'calendar-compact',
        type: 'calendar',
        title: 'Calendar',
        position: 'center',
        size: 'large',
        visible: true,
        order: 4,
        settings: {
          showHeader: true,
          collapsible: false,
          resizable: true,
          movable: true,
        },
        content: {}
      }
    ]
  },

  {
    id: 'minimal',
    name: 'Minimal Layout',
    isDefault: false,
    gridTemplate: {
      columns: '1fr',
      rows: 'auto',
      gap: '1rem',
    },
    panels: [
      {
        id: 'calendar-only',
        type: 'calendar',
        title: 'Calendar',
        position: 'center',
        size: 'full',
        visible: true,
        order: 1,
        settings: {
          showHeader: false,
          collapsible: false,
          resizable: false,
          movable: false,
        },
        content: {}
      }
    ]
  },

  {
    id: 'task-focused',
    name: 'Task-Focused Layout',
    isDefault: false,
    gridTemplate: {
      columns: '1fr 1fr',
      rows: 'auto auto',
      gap: '1rem',
    },
    panels: [
      {
        id: 'calendar-tasks',
        type: 'calendar',
        title: 'Calendar',
        position: 'top-left',
        size: 'full',
        visible: true,
        order: 1,
        settings: {
          showHeader: true,
          collapsible: false,
          resizable: true,
          movable: true,
        },
        content: {}
      },
      {
        id: 'pending-tasks',
        type: 'pending-tasks',
        title: 'Pending Tasks',
        position: 'top-right',
        size: 'full',
        visible: true,
        order: 2,
        settings: {
          showHeader: true,
          collapsible: true,
          resizable: true,
          movable: true,
        },
        content: { maxItems: 10 }
      },
      {
        id: 'overdue-tasks',
        type: 'overdue-tasks',
        title: 'Overdue Tasks',
        position: 'bottom-left',
        size: 'full',
        visible: true,
        order: 3,
        settings: {
          showHeader: true,
          collapsible: true,
          resizable: true,
          movable: true,
        },
        content: {}
      },
      {
        id: 'task-progress-bottom',
        type: 'task-progress',
        title: 'Task Progress',
        position: 'bottom-right',
        size: 'full',
        visible: true,
        order: 4,
        settings: {
          showHeader: true,
          collapsible: true,
          resizable: true,
          movable: true,
        },
        content: {}
      }
    ]
  }
];

export const getDefaultLayout = (): LayoutConfig => {
  return defaultLayouts.find(layout => layout.isDefault) || defaultLayouts[0];
};

export const getLayoutById = (id: string): LayoutConfig | undefined => {
  return defaultLayouts.find(layout => layout.id === id);
};

export const createCustomLayout = (name: string): LayoutConfig => {
  return {
    id: `custom-${Date.now()}`,
    name,
    isDefault: false,
    gridTemplate: {
      columns: '1fr',
      rows: 'auto',
      gap: '1rem',
    },
    panels: []
  };
};
