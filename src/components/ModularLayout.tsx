import React from 'react';
import { ModularLayoutProps, PanelConfig } from '../types';
import PanelWrapper from './PanelWrapper';
import CalendarGrid from './CalendarGrid';
import Sidebar from './Sidebar';
import OverdueTasks from './OverdueTasks';
import ProjectManager from './ProjectManager';
import QuickActionsPanel from './panels/QuickActionsPanel';
import TaskProgressPanel from './panels/TaskProgressPanel';
import UpcomingEventsPanel from './panels/UpcomingEventsPanel';
import PendingTasksPanel from './panels/PendingTasksPanel';

const ModularLayout: React.FC<ModularLayoutProps> = ({
  layoutConfig,
  events,
  tasks,
  settings,
  onLayoutChange,
  onPanelUpdate
}) => {
  const renderPanelContent = (panel: PanelConfig) => {
    try {
      switch (panel.type) {
        case 'calendar':
          return (
            <div className="h-96 overflow-hidden">
              <CalendarGrid
                currentDate={new Date()}
                selectedDate={new Date()}
                onDateSelect={() => {}}
                events={events || []}
                tasks={tasks || []}
                view="week"
                settings={settings}
                onEventEdit={() => {}}
                onEventOpen={() => {}}
                onEventDelete={() => {}}
                onTaskEdit={() => {}}
                onTaskDelete={() => {}}
                onEventCreate={() => {}}
                onTaskCreate={() => {}}
                clipboard={{ type: null, data: null }}
                onCopyEvent={() => {}}
                onCopyTask={() => {}}
                onPaste={() => {}}
              />
            </div>
          );
      
        case 'sidebar':
          return (
            <Sidebar
              events={events || []}
              tasks={tasks || []}
              settings={settings}
              onAddEvent={() => {}}
              onAddTask={() => {}}
              onEventOpen={() => {}}
              onEventEdit={() => {}}
              onEventDelete={() => {}}
            />
          );
        
        case 'overdue-tasks':
          return (
            <OverdueTasks
              tasks={[]}
              settings={settings}
              onTaskClick={() => {}}
              onTaskComplete={() => {}}
            />
          );
        
        case 'projects':
          return (
            <ProjectManager
              projects={[]}
              settings={settings}
              onProjectClick={() => {}}
              onProjectCreate={() => {}}
              onProjectUpdate={() => {}}
            />
          );
        
        case 'quick-actions':
          return <QuickActionsPanel settings={settings} />;
        
        case 'task-progress':
          return <TaskProgressPanel tasks={tasks || []} settings={settings} maxItems={panel.content?.maxItems} />;
        
        case 'upcoming-events':
          return <UpcomingEventsPanel events={events || []} settings={settings} maxItems={panel.content?.maxItems} />;
        
        case 'pending-tasks':
          return <PendingTasksPanel tasks={tasks || []} settings={settings} maxItems={panel.content?.maxItems} />;
        
        default:
          return (
            <div className={`text-center py-8 ${settings.theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-500'}`}>
              Panel content for {panel.type}
            </div>
          );
      }
    } catch (error) {
      console.error('Error rendering panel:', error);
      return (
        <div className={`text-center py-8 text-red-500 ${settings.theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
          Error loading panel: {panel.type}
        </div>
      );
    }
  };

  const visiblePanels = layoutConfig.panels.filter(panel => panel.visible);

  if (visiblePanels.length === 0) {
    return (
      <div className={`text-center py-12 ${settings.theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-500'}`}>
        <p className="text-lg mb-4">No panels visible</p>
        <p className="text-sm">Click "Customize" to add panels to your layout</p>
      </div>
    );
  }

  return (
    <div 
      className="grid gap-4"
      style={{
        gridTemplateColumns: layoutConfig.gridTemplate.columns,
        gridTemplateRows: layoutConfig.gridTemplate.rows,
        gap: layoutConfig.gridTemplate.gap,
      }}
    >
      {visiblePanels.map((panel) => (
        <PanelWrapper
          key={panel.id}
          config={panel}
          settings={settings}
          onConfigUpdate={(updates) => onPanelUpdate(panel.id, updates)}
        >
          {renderPanelContent(panel)}
        </PanelWrapper>
      ))}
    </div>
  );
};

export default ModularLayout;
