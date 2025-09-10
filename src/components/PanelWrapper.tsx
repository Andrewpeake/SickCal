import React, { useState } from 'react';
import { PanelConfig, Settings } from '../types';
import { ChevronDown, ChevronUp, Move, Settings as SettingsIcon } from 'lucide-react';

interface PanelWrapperProps {
  config: PanelConfig;
  settings: Settings;
  children: React.ReactNode;
  onConfigUpdate: (updates: Partial<PanelConfig>) => void;
}

const PanelWrapper: React.FC<PanelWrapperProps> = ({
  config,
  settings,
  children,
  onConfigUpdate
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const getSizeClasses = () => {
    switch (config.size) {
      case 'small': return 'w-full lg:w-1/4';
      case 'medium': return 'w-full lg:w-1/3';
      case 'large': return 'w-full lg:w-1/2';
      case 'xlarge': return 'w-full lg:w-2/3';
      case 'full': return 'w-full';
      case 'custom': return 'w-full';
      default: return 'w-full lg:w-1/3';
    }
  };

  const getCustomStyles = () => {
    if (config.size === 'custom' && config.customSize) {
      return {
        width: config.customSize.width,
        height: config.customSize.height,
      };
    }
    return {};
  };

  // Prevent errors if config is undefined
  if (!config) {
    return (
      <div className={`p-4 ${settings.theme === 'dark' ? 'bg-[#161b22]' : 'bg-white'} rounded-xl`}>
        <div className="text-red-500">Panel configuration error</div>
      </div>
    );
  }

  return (
    <div
      className={`${getSizeClasses()} ${
        settings.theme === 'dark' ? 'bg-[#161b22]' : 'bg-white'
      } rounded-xl shadow-soft transition-all duration-200 ${
        isDragging ? 'opacity-50' : ''
      }`}
      style={{ 
        order: config.order,
        ...getCustomStyles()
      }}
    >
      {config.settings.showHeader && (
        <div className={`flex items-center justify-between p-4 border-b ${
          settings.theme === 'dark' ? 'border-[#30363d]' : 'border-gray-200'
        }`}>
          <h3 className={`font-semibold ${
            settings.theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-900'
          }`}>
            {config.title}
          </h3>
          <div className="flex items-center space-x-2">
            {config.settings.collapsible && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`p-1 rounded hover:bg-gray-100 ${
                  settings.theme === 'dark' ? 'hover:bg-[#30363d] text-[#8b949e]' : 'text-gray-500'
                }`}
              >
                {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </button>
            )}
            {config.settings.movable && (
              <button
                className={`p-1 rounded hover:bg-gray-100 cursor-move ${
                  settings.theme === 'dark' ? 'hover:bg-[#30363d] text-[#8b949e]' : 'text-gray-500'
                }`}
                onMouseDown={() => setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}
              >
                <Move size={16} />
              </button>
            )}
          </div>
        </div>
      )}
      
      {!isCollapsed && (
        <div className="p-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default PanelWrapper;
