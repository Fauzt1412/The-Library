import React from 'react';
import { useSidebarContext } from '../context/SidebarContext';

const FloatingMenuButton = () => {
  const { isVisible, isCollapsed, toggleSidebar } = useSidebarContext();

  return (
    <button 
      className={`floating-menu-button ${isVisible ? 'sidebar-open' : ''} ${isCollapsed ? 'sidebar-collapsed' : ''}`}
      onClick={toggleSidebar}
      title={isVisible ? 'Close Menu' : 'Open Menu'}
      aria-label={isVisible ? 'Close Menu' : 'Open Menu'}
    >
      <div className="menu-icon">
        <span className="menu-line"></span>
        <span className="menu-line"></span>
        <span className="menu-line"></span>
      </div>
    </button>
  );
};

export default FloatingMenuButton;