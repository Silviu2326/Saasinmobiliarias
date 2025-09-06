import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { navigationCategories } from '../../data/navigation';
import { NavCategory } from '../../types/navigation';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['main'])
  );

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const getIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<any>;
    return IconComponent ? <IconComponent size={20} /> : <Icons.Circle size={20} />;
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-80 lg:relative lg:z-auto
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Icons.Building2 className="w-5 h-5 text-white" />
              </div>
              <h1 className="font-bold text-xl text-gray-900">RealEstate CRM</h1>
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100 transition-colors"
            >
              <Icons.X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="space-y-1">
              {navigationCategories.map((category: NavCategory) => (
                <div key={category.id} className="px-3">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {getIcon(category.icon)}
                      <span>{category.label}</span>
                    </div>
                    <Icons.ChevronDown 
                      size={16} 
                      className={`transition-transform ${
                        expandedCategories.has(category.id) ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  
                  {expandedCategories.has(category.id) && (
                    <div className="mt-1 space-y-1">
                      {category.items.map((item) => (
                        <NavLink
                          key={item.id}
                          to={item.path || '#'}
                          className={({ isActive }) => `
                            flex items-center justify-between px-6 py-2 text-sm rounded-lg transition-colors
                            ${isActive 
                              ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }
                          `}
                        >
                          <span className="flex items-center space-x-2">
                            <span>{item.label}</span>
                            {item.starred && (
                              <Icons.Star size={14} className="text-yellow-500 fill-current" />
                            )}
                          </span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3 px-3 py-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <Icons.User size={16} className="text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Usuario Admin</p>
                <p className="text-xs text-gray-500">admin@empresa.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};