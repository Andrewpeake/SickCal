import React, { useState } from 'react';
import { LayoutConfig, PanelConfig, PanelType, PanelSize, PanelPosition, Settings } from '../types';
import { X, Plus, Move, Eye, EyeOff } from 'lucide-react';

interface PanelCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  layoutConfig: LayoutConfig;
  onLayoutSave: (config: LayoutConfig) => void;
  settings: Settings;
}

const PanelCustomizer: React.FC<PanelCustomizerProps> = ({
  isOpen,
  onClose,
  layoutConfig,
  onLayoutSave,
  settings
}) => {
  const [editingLayout, setEditingLayout] = useState<LayoutConfig>(layoutConfig);

  const panelTypes: { value: PanelType; label: string }[] = [
    { value: 'calendar', label: 'Calendar' },
    { value: 'sidebar', label: 'Sidebar' },
    { value: 'quick-actions', label: 'Quick Actions' },
    { value: 'task-progress', label: 'Task Progress' },
    { value: 'upcoming-events', label: 'Upcoming Events' },
    { value: 'pending-tasks', label: 'Pending Tasks' },
    { value: 'overdue-tasks', label: 'Overdue Tasks' },
    { value: 'projects', label: 'Projects' },
  ];

  const panelSizes: { value: PanelSize; label: string }[] = [
    { value: 'small', label: 'Small (1/4)' },
    { value: 'medium', label: 'Medium (1/3)' },
    { value: 'large', label: 'Large (1/2)' },
    { value: 'xlarge', label: 'X-Large (2/3)' },
    { value: 'full', label: 'Full Width' },
    { value: 'custom', label: 'Custom' },
  ];

  const addPanel = () => {
    const newPanel: PanelConfig = {
      id: `panel-${Date.now()}`,
      type: 'quick-actions',
      title: 'New Panel',
      position: 'center',
      size: 'medium',
      visible: true,
      order: editingLayout.panels.length,
      settings: {
        showHeader: true,
        collapsible: true,
        resizable: true,
        movable: true,
      },
      content: {}
    };

    setEditingLayout(prev => ({
      ...prev,
      panels: [...prev.panels, newPanel]
    }));
  };

  const updatePanel = (panelId: string, updates: Partial<PanelConfig>) => {
    setEditingLayout(prev => ({
      ...prev,
      panels: prev.panels.map(panel =>
        panel.id === panelId ? { ...panel, ...updates } : panel
      )
    }));
  };

  const removePanel = (panelId: string) => {
    setEditingLayout(prev => ({
      ...prev,
      panels: prev.panels.filter(panel => panel.id !== panelId)
    }));
  };

  const handleSave = () => {
    onLayoutSave(editingLayout);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`modal-content max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto ${
        settings.theme === 'dark' ? 'bg-[#161b22]' : 'bg-white'
      }`}>
        <div className={`flex items-center justify-between p-6 border-b ${
          settings.theme === 'dark' ? 'border-[#30363d]' : 'border-gray-200'
        }`}>
          <h2 className={`text-xl font-semibold ${
            settings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-900'
          }`}>
            Customize Layout
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-gray-100 ${
              settings.theme === 'dark' ? 'hover:bg-[#30363d] text-[#8b949e]' : 'text-gray-500'
            }`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Layout Name */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              settings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-700'
            }`}>
              Layout Name
            </label>
            <input
              type="text"
              value={editingLayout.name}
              onChange={(e) => setEditingLayout(prev => ({ ...prev, name: e.target.value }))}
              className={`input-field ${settings.theme === 'dark' ? 'dark-theme-input' : ''}`}
            />
          </div>

          {/* Panels */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-medium ${
                settings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-900'
              }`}>
                Panels
              </h3>
              <button
                onClick={addPanel}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Add Panel</span>
              </button>
            </div>

            <div className="space-y-4">
              {editingLayout.panels.map((panel, index) => (
                <div
                  key={panel.id}
                  className={`p-4 border rounded-lg ${
                    settings.theme === 'dark' ? 'border-[#30363d] bg-[#0d1117]' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Panel Type */}
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        settings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-700'
                      }`}>
                        Type
                      </label>
                      <select
                        value={panel.type}
                        onChange={(e) => updatePanel(panel.id, { type: e.target.value as PanelType })}
                        className={`input-field ${settings.theme === 'dark' ? 'dark-theme-input' : ''}`}
                      >
                        {panelTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Panel Size */}
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        settings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-700'
                      }`}>
                        Size
                      </label>
                      <select
                        value={panel.size}
                        onChange={(e) => updatePanel(panel.id, { size: e.target.value as PanelSize })}
                        className={`input-field ${settings.theme === 'dark' ? 'dark-theme-input' : ''}`}
                      >
                        {panelSizes.map(size => (
                          <option key={size.value} value={size.value}>
                            {size.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Panel Title */}
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        settings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-700'
                      }`}>
                        Title
                      </label>
                      <input
                        type="text"
                        value={panel.title}
                        onChange={(e) => updatePanel(panel.id, { title: e.target.value })}
                        className={`input-field ${settings.theme === 'dark' ? 'dark-theme-input' : ''}`}
                      />
                    </div>
                  </div>

                  {/* Panel Controls */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={panel.visible}
                          onChange={(e) => updatePanel(panel.id, { visible: e.target.checked })}
                          className="rounded"
                        />
                        <span className={`text-sm ${
                          settings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-700'
                        }`}>
                          Visible
                        </span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={panel.settings.collapsible}
                          onChange={(e) => updatePanel(panel.id, { 
                            settings: { ...panel.settings, collapsible: e.target.checked }
                          })}
                          className="rounded"
                        />
                        <span className={`text-sm ${
                          settings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-700'
                        }`}>
                          Collapsible
                        </span>
                      </label>
                    </div>

                    <button
                      onClick={() => removePanel(panel.id)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={`flex items-center justify-end space-x-3 p-6 border-t ${
          settings.theme === 'dark' ? 'border-[#30363d]' : 'border-gray-200'
        }`}>
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-primary"
          >
            Save Layout
          </button>
        </div>
      </div>
    </div>
  );
};

export default PanelCustomizer;
