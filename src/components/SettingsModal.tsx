import React, { useState, useEffect } from 'react';
import { X, Settings, Palette, Clock, Calendar, Eye, MousePointer } from 'lucide-react';
import { Settings as SettingsType } from '../types';

// export type Settings = SettingsType;

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingsType;
  onSave: (settings: SettingsType) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave
}) => {
  const [localSettings, setLocalSettings] = useState<SettingsType>(settings);
  const [activeTab, setActiveTab] = useState('appearance');

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);



  const handleSave = () => {
    console.log('SettingsModal: Saving settings:', localSettings);
    onSave(localSettings);
    onClose();
  };

  const handleApply = () => {
    console.log('SettingsModal: Applying settings:', localSettings);
    onSave(localSettings);
  };

  const handleReset = () => {
    const defaultSettings: SettingsType = {
      // Appearance
      theme: 'light' as const,
      primaryColor: '#0ea5e9',
      hourHeight: 64,
      gridLineOpacity: 0.75,
      showWeekNumbers: false,
      showTodayHighlight: true,
      showLiveTimeIndicator: true,
      
      // Calendar
      defaultView: 'week' as const,
      weekStartsOn: 1 as const,
      defaultStartHour: 6,
      defaultEndHour: 22,
      showWeekend: true,
      
      // Events
      defaultEventDuration: 60,
      allowEventOverlap: false,
      showEventCount: true,
      eventColorScheme: 'category' as const,
      
      // Quick Event Titles
      quickEventTitles: [
        { category: 'School', titles: ['Class', 'Study Session', 'Homework', 'Exam', 'Group Project', 'Office Hours'] },
        { category: 'Work', titles: ['Meeting', 'Standup', 'Client Call', 'Team Sync', 'Review', 'Planning'] },
        { category: 'Social', titles: ['Hangout', 'Dinner', 'Coffee', 'Movie Night', 'Game Night', 'Party'] },
        { category: 'Health', titles: ['Doctor Appointment', 'Dentist', 'Gym', 'Yoga', 'Therapy', 'Checkup'] },
        { category: 'General', titles: ['Appointment', 'Call', 'Reminder', 'Task', 'Event', 'Meeting'] }
      ],
      
      // Interaction
      enableDragAndDrop: true,
      enableDoubleRightClickDelete: true,
      enableKeyboardShortcuts: true,
      enableZoomScroll: true,
      
      // Notifications
      enableNotifications: false,
      reminderTime: 15,
      soundNotifications: false,
      
      // Data & Storage
      autoSave: true,
      backupFrequency: 'weekly' as const,
      exportFormat: 'json' as const,
      
      // Advanced
      timeFormat: '24h' as const,
      dateFormat: 'MM/DD/YYYY' as const,
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
    setLocalSettings(defaultSettings);
  };

  const colorOptions = [
    { name: 'Blue', value: '#0ea5e9' },
    { name: 'Green', value: '#10b981' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Gray', value: '#6b7280' }
  ];

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
    { id: 'events', label: 'Events', icon: <Clock className="w-4 h-4" /> },
    { id: 'interaction', label: 'Interaction', icon: <MousePointer className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Eye className="w-4 h-4" /> },
    { id: 'advanced', label: 'Advanced', icon: <Settings className="w-4 h-4" /> }
  ];

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden ${
        localSettings.theme === 'dark' ? 'bg-[#0d1117] text-[#c9d1d9]' : 'bg-white text-gray-900'
      }`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-semibold flex items-center gap-2 ${
            localSettings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-900'
          }`}>
            <Settings className="w-5 h-5" />
            Settings
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              localSettings.theme === 'dark' ? 'hover:bg-[#161b22]' : 'hover:bg-gray-100'
            }`}
          >
            <X className={`w-5 h-5 ${
              localSettings.theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-500'
            }`} />
          </button>
        </div>

        <div className="flex gap-6 h-[calc(90vh-180px)]">
          {/* Sidebar */}
          <div className={`w-48 rounded-lg p-4 ${
            localSettings.theme === 'dark' ? 'bg-[#161b22]' : 'bg-gray-50'
          }`}>
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white'
                      : localSettings.theme === 'dark' 
                        ? 'text-[#c9d1d9] hover:bg-[#21262d]' 
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className={`text-lg font-medium mb-4 ${
                    localSettings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-900'
                  }`}>Theme & Colors</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        localSettings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-700'
                      }`}>
                        Theme
                      </label>
                      <select
                        value={localSettings.theme}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, theme: e.target.value as 'light' | 'dark' | 'auto' }))}
                        className="input-field"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto (System)</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        localSettings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-700'
                      }`}>
                        Primary Color
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {colorOptions.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => setLocalSettings(prev => ({ ...prev, primaryColor: color.value }))}
                            className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 ${
                              localSettings.primaryColor === color.value
                                ? localSettings.theme === 'dark' ? 'border-[#c9d1d9] scale-110' : 'border-gray-900 scale-110'
                                : localSettings.theme === 'dark' ? 'border-[#30363d] hover:scale-105' : 'border-gray-300 hover:scale-105'
                            }`}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className={`text-lg font-medium mb-4 ${
                    localSettings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-900'
                  }`}>Display Options</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        localSettings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-700'
                      }`}>
                        Default Hour Height (px)
                      </label>
                      <input
                        type="range"
                        min="24"
                        max="600"
                        step="8"
                        value={localSettings.hourHeight}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, hourHeight: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                      <div className={`text-sm mt-1 ${
                        localSettings.theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-500'
                      }`}>{localSettings.hourHeight}px</div>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        localSettings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-700'
                      }`}>
                        Grid Line Opacity
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.05"
                        value={localSettings.gridLineOpacity}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, gridLineOpacity: parseFloat(e.target.value) }))}
                        className="w-full"
                      />
                      <div className={`text-sm mt-1 ${
                        localSettings.theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-500'
                      }`}>{Math.round(localSettings.gridLineOpacity * 100)}%</div>
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={localSettings.showWeekNumbers}
                          onChange={(e) => setLocalSettings(prev => ({ ...prev, showWeekNumbers: e.target.checked }))}
                          className="mr-2"
                        />
                        <span className={`text-sm ${
                          localSettings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-700'
                        }`}>Show week numbers</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={localSettings.showTodayHighlight}
                          onChange={(e) => setLocalSettings(prev => ({ ...prev, showTodayHighlight: e.target.checked }))}
                          className="mr-2"
                        />
                        <span className={`text-sm ${
                          localSettings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-700'
                        }`}>Highlight today</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={localSettings.showLiveTimeIndicator}
                          onChange={(e) => setLocalSettings(prev => ({ ...prev, showLiveTimeIndicator: e.target.checked }))}
                          className="mr-2"
                        />
                        <span className={`text-sm ${
                          localSettings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-700'
                        }`}>Show live time indicator</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'calendar' && (
              <div className="space-y-6">
                <div>
                  <h3 className={`text-lg font-medium mb-4 ${
                    localSettings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-900'
                  }`}>Default View</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        localSettings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-700'
                      }`}>
                        Default Calendar View
                      </label>
                      <select
                        value={localSettings.defaultView}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, defaultView: e.target.value as any }))}
                        className="input-field"
                      >
                        <option value="day">Day</option>
                        <option value="week">Week</option>
                        <option value="month">Month</option>
                        <option value="year">Year</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Week Starts On
                      </label>
                      <select
                        value={localSettings.weekStartsOn}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, weekStartsOn: parseInt(e.target.value) as 0 | 1 }))}
                        className="input-field"
                      >
                        <option value={0}>Sunday</option>
                        <option value={1}>Monday</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Time Range</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Start Hour
                      </label>
                      <select
                        value={localSettings.defaultStartHour}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, defaultStartHour: parseInt(e.target.value) }))}
                        className="input-field"
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default End Hour
                      </label>
                      <select
                        value={localSettings.defaultEndHour}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, defaultEndHour: parseInt(e.target.value) }))}
                        className="input-field"
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={localSettings.showWeekend}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, showWeekend: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Show weekend days</span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'events' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Event Defaults</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Event Duration (minutes)
                      </label>
                      <select
                        value={localSettings.defaultEventDuration}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, defaultEventDuration: parseInt(e.target.value) }))}
                        className="input-field"
                      >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={90}>1.5 hours</option>
                        <option value={120}>2 hours</option>
                        <option value={240}>4 hours</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event Color Scheme
                      </label>
                      <select
                        value={localSettings.eventColorScheme}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, eventColorScheme: e.target.value as any }))}
                        className="input-field"
                      >
                        <option value="category">By Category</option>
                        <option value="random">Random</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Event Display</h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={localSettings.allowEventOverlap}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, allowEventOverlap: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Allow event overlap</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={localSettings.showEventCount}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, showEventCount: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Show event count badges</span>
                    </label>
                  </div>
                </div>

                {/* Quick Event Titles Customization */}
                <div>
                  <h3 className={`text-lg font-medium mb-4 ${localSettings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-900'}`}>Quick Event Titles</h3>
                  <p className={`text-sm mb-4 ${localSettings.theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-600'}`}>
                    Customize the quick title selection options for creating events. These will appear in the event modal for easy selection.
                  </p>
                  
                  <div className="space-y-4">
                    {localSettings.quickEventTitles?.map((category, categoryIndex) => (
                      <div key={categoryIndex} className={`border rounded-lg p-4 ${localSettings.theme === 'dark' ? 'border-[#30363d] bg-[#161b22]' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <input
                            type="text"
                            value={category.category}
                            onChange={(e) => {
                              const newTitles = [...(localSettings.quickEventTitles || [])];
                              newTitles[categoryIndex] = { ...category, category: e.target.value };
                              setLocalSettings(prev => ({ ...prev, quickEventTitles: newTitles }));
                            }}
                            className={`input-field flex-1 mr-2 ${localSettings.theme === 'dark' ? 'dark-theme-input' : ''}`}
                            placeholder="Category name"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newTitles = localSettings.quickEventTitles?.filter((_, index) => index !== categoryIndex) || [];
                              setLocalSettings(prev => ({ ...prev, quickEventTitles: newTitles }));
                            }}
                            className="text-red-600 hover:text-red-700 px-2 py-1 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          <label className={`block text-sm font-medium ${localSettings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-700'}`}>Event Titles:</label>
                          <div className="space-y-2">
                            {category.titles.map((title, titleIndex) => (
                              <div key={titleIndex} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={title}
                                  onChange={(e) => {
                                    const newTitles = [...(localSettings.quickEventTitles || [])];
                                    newTitles[categoryIndex].titles[titleIndex] = e.target.value;
                                    setLocalSettings(prev => ({ ...prev, quickEventTitles: newTitles }));
                                  }}
                                  className={`input-field flex-1 ${localSettings.theme === 'dark' ? 'dark-theme-input' : ''}`}
                                  placeholder="Event title"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newTitles = [...(localSettings.quickEventTitles || [])];
                                    newTitles[categoryIndex].titles = newTitles[categoryIndex].titles.filter((_, index) => index !== titleIndex);
                                    setLocalSettings(prev => ({ ...prev, quickEventTitles: newTitles }));
                                  }}
                                  className="text-red-500 hover:text-red-600 px-2 py-1 text-sm"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const newTitles = [...(localSettings.quickEventTitles || [])];
                                newTitles[categoryIndex].titles.push('');
                                setLocalSettings(prev => ({ ...prev, quickEventTitles: newTitles }));
                              }}
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              + Add Title
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={() => {
                        const newTitles = [...(localSettings.quickEventTitles || []), { category: '', titles: [''] }];
                        setLocalSettings(prev => ({ ...prev, quickEventTitles: newTitles }));
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      + Add Category
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'interaction' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Mouse & Touch</h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={localSettings.enableDragAndDrop}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, enableDragAndDrop: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Enable drag and drop for events</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={localSettings.enableDoubleRightClickDelete}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, enableDoubleRightClickDelete: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Enable double right-click to delete events</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Keyboard & Zoom</h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={localSettings.enableKeyboardShortcuts}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, enableKeyboardShortcuts: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Enable keyboard shortcuts</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={localSettings.enableZoomScroll}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, enableZoomScroll: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Enable Command/Alt + scroll to zoom</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={localSettings.enableNotifications}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, enableNotifications: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Enable notifications</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={localSettings.soundNotifications}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, soundNotifications: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Play sound for notifications</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reminder Time (minutes before event)
                  </label>
                  <select
                    value={localSettings.reminderTime}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, reminderTime: parseInt(e.target.value) }))}
                    className="input-field"
                  >
                    <option value={0}>No reminder</option>
                    <option value={5}>5 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={1440}>1 day</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Data & Storage</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={localSettings.autoSave}
                          onChange={(e) => setLocalSettings(prev => ({ ...prev, autoSave: e.target.checked }))}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Auto-save changes</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Backup Frequency
                      </label>
                      <select
                        value={localSettings.backupFrequency}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, backupFrequency: e.target.value as any }))}
                        className="input-field"
                      >
                        <option value="never">Never</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Format & Localization</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time Format
                      </label>
                      <select
                        value={localSettings.timeFormat}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, timeFormat: e.target.value as '12h' | '24h' }))}
                        className="input-field"
                      >
                        <option value="12h">12-hour</option>
                        <option value="24h">24-hour</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date Format
                      </label>
                      <select
                        value={localSettings.dateFormat}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, dateFormat: e.target.value as any }))}
                        className="input-field"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Export Format
                      </label>
                      <select
                        value={localSettings.exportFormat}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, exportFormat: e.target.value as any }))}
                        className="input-field"
                      >
                        <option value="json">JSON</option>
                        <option value="csv">CSV</option>
                        <option value="ics">ICS (iCal)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between pt-6 border-t mt-6 ${
          localSettings.theme === 'dark' ? 'border-[#30363d]' : 'border-gray-200'
        }`}>
          <button
            onClick={handleReset}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
              localSettings.theme === 'dark' 
                ? 'text-[#c9d1d9] bg-[#21262d] hover:bg-[#30363d]' 
                : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Reset to Defaults
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                localSettings.theme === 'dark' 
                  ? 'text-[#c9d1d9] bg-[#21262d] hover:bg-[#30363d]' 
                  : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors duration-200"
            >
              Apply
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors duration-200"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
